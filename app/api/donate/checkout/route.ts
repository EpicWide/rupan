import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://newlupin.com"
  ).replace(/\/$/, "");
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();

    console.log("Stripe environment check:", {
      exists: Boolean(stripeSecretKey),
      length: stripeSecretKey?.length ?? 0,
      prefix: stripeSecretKey?.slice(0, 8) ?? "missing",
      revision: process.env.K_REVISION ?? "unknown",
    });

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error: "Missing STRIPE_SECRET_KEY on the server.",
          revision: process.env.K_REVISION ?? "unknown",
        },
        { status: 500 }
      );
    }

    if (
      !stripeSecretKey.startsWith("sk_test_") &&
      !stripeSecretKey.startsWith("sk_live_")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid STRIPE_SECRET_KEY format. It must start with sk_test_ or sk_live_.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const body = await req.json();

    const amount = Math.round(Number(body.amount));
    const donorName = String(body.name ?? "").trim();
    const donorEmail = String(body.email ?? "").trim();

    if (!Number.isFinite(amount) || amount < 1) {
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
                "Support people facing difficult situations and help protect their dignity.",
            },
          },
        },
      ],
      metadata: {
        donor_name: donorName || "Anonymous",
        donor_email: donorEmail,
        source: "lupin_donate_page",
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a Checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create donation checkout.";

    console.error("Lupin donation checkout error:", { message });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
