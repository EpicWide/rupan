import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type DonationRequest = {
  amount?: unknown;
  email?: unknown;
};

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  if (
    !secretKey.startsWith("sk_live_") &&
    !secretKey.startsWith("sk_test_")
  ) {
    throw new Error("Invalid STRIPE_SECRET_KEY.");
  }

  return new Stripe(secretKey);
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DonationRequest;

    const amount = Number(body.amount);
    const email = String(body.email ?? "").trim().slice(0, 200);

    if (!Number.isFinite(amount)) {
      return NextResponse.json(
        { error: "Invalid donation amount." },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(amount * 100);

    if (amountInCents < 100) {
      return NextResponse.json(
        { error: "Donation amount must be at least $1." },
        { status: 400 }
      );
    }

    if (amountInCents > 1_000_000) {
      return NextResponse.json(
        { error: "Donation amount cannot exceed $10,000." },
        { status: 400 }
      );
    }

    if (email && !validEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",

      // Card only. No Checkout Session.
      payment_method_types: ["card"],

      description: "Lupin Donation",
      receipt_email: email || undefined,

      metadata: {
        source: "lupin_embedded_payment_element",
        donation_amount: amount.toFixed(2),
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe did not return a client secret.");
    }

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to initialize secure payment.";

    console.error("Lupin PaymentIntent error:", message);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Unable to initialize secure payment."
            : message,
      },
      { status: 500 }
    );
  }
}
