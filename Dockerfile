FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi


FROM node:20-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prevent deployment of a build with empty public variables.
RUN test -n "$NEXT_PUBLIC_SUPABASE_URL" || \
    (echo "ERROR: NEXT_PUBLIC_SUPABASE_URL is missing" && exit 1)

RUN test -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" || \
    (echo "ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing" && exit 1)

RUN test -n "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" || \
    (echo "ERROR: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing" && exit 1)

RUN test -n "$NEXT_PUBLIC_APP_URL" || \
    (echo "ERROR: NEXT_PUBLIC_APP_URL is missing" && exit 1)

# Validate that the Stripe browser key is a publishable key.
RUN case "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" in \
      pk_live_*|pk_test_*) echo "Stripe publishable key is present." ;; \
      *) echo "ERROR: Stripe publishable key must start with pk_live_ or pk_test_"; exit 1 ;; \
    esac

RUN echo "Public build variables are present."

RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
