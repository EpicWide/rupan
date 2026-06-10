import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured yet. Missing STRIPE_SECRET_KEY on the server.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const body = await req.json();

    const amount = Math.round(Number(body.amount || 0));
    const donorName = String(body.name || "").trim();
    const donorEmail = String(body.email || "").trim();

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Donation amount must be at least $1." },
        { status: 400 }
      );
    }

    if (amount > 10000) {
      return NextResponse.json(
        { error: "Donation amount is too large." },
        { status: 400 }
      );
    }

    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      payment_method_types: ["card"],
      customer_email: donorEmail || undefined,
      success_url: `${appUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/donate?canceled=1`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount * 100,
            product_data: {
              name: "Rupan Donation",
              description:
                "Support people facing difficult situations and help change the world, even a little.",
            },
          },
        },
      ],
      metadata: {
        donor_name: donorName,
        donor_email: donorEmail,
        source: "rupan_donate_page",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe donation checkout error:", error);

    return NextResponse.json(
      { error: "Failed to create donation checkout." },
      { status: 500 }
    );
  }
}
