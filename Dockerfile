FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi


FROM node:20-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# These are public client-side values.
# They must exist during Docker build because Next.js embeds NEXT_PUBLIC_* values into the client bundle.
# Replace the two placeholder values below with your real public keys before committing.
ARG NEXT_PUBLIC_SUPABASE_URL=https://adpksztfayylowsdjkuu.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGtzenRmYXl5bG93c2Rqa3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTk3MjUsImV4cCI6MjA5NjU3NTcyNX0.BJNfK65hPfgFXq6fDMwPcrCDF-EnIfLRz-tq8m37gyE
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SvM5URtSdMg1qht6uYdY28hYDW4GP1LjUyjYDjmMm7zr0DsIHRiznIrQp99KLJwOfWXatV61K38rmOQVM2R9gnw008IEGYDnd
ARG NEXT_PUBLIC_APP_URL=https://newlupin.com

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN test -n "$NEXT_PUBLIC_SUPABASE_URL" ||     (echo "ERROR: NEXT_PUBLIC_SUPABASE_URL is missing" && exit 1)

RUN test -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ||     (echo "ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing" && exit 1)

RUN test -n "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ||     (echo "ERROR: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing" && exit 1)

RUN test -n "$NEXT_PUBLIC_APP_URL" ||     (echo "ERROR: NEXT_PUBLIC_APP_URL is missing" && exit 1)

RUN case "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" in       pk_live_*|pk_test_*) echo "Stripe publishable key is present." ;;       *) echo "ERROR: Stripe publishable key must start with pk_live_ or pk_test_"; exit 1 ;;     esac

RUN echo "Public build variables are present."

RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs     && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Required for /lupin-featured-video.mp4 and other public assets.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
