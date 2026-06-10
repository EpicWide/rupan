import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://rupan-502944581274.europe-west1.run.app"
  ).replace(/\/$/, "");
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY on Cloud Run." },
        { status: 500 }
      );
    }

    if (!stripeSecretKey.startsWith("sk_")) {
      return NextResponse.json(
        { error: "Invalid STRIPE_SECRET_KEY format. It must start with sk_test_ or sk_live_." },
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
              name: "Lupin Donation",
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

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe donation checkout error:", {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      statusCode: error?.statusCode,
      requestId: error?.requestId,
    });

    return NextResponse.json(
      {
        error: error?.message || "Failed to create donation checkout.",
        type: error?.type || null,
        code: error?.code || null,
        statusCode: error?.statusCode || null,
      },
      { status: 500 }
    );
  }
}
