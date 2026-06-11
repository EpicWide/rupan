import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      service: process.env.K_SERVICE ?? null,
      revision: process.env.K_REVISION ?? null,
      configuration: process.env.K_CONFIGURATION ?? null,

      stripeSecretKeyExists: Boolean(
        process.env.STRIPE_SECRET_KEY?.trim()
      ),

      appUrl: process.env.APP_URL ?? null,
      publicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,

      nodeEnv: process.env.NODE_ENV ?? null,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
