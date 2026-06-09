import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Stripe Checkout is not configured yet. Add STRIPE_SECRET_KEY and checkout session creation.",
    },
    { status: 501 }
  );
}
