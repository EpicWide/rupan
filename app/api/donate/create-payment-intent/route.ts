import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new Error("Invalid STRIPE_SECRET_KEY format.");
  }

  return new Stripe(secretKey);
}

function normalizeAmount(value: unknown) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 100);
}

function normalizeText(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const body = await request.json();

    const amountInCents = normalizeAmount(body.amount);
    const donorName = normalizeText(body.name, 100);
    const donorEmail = normalizeText(body.email, 200);

    if (!amountInCents || amountInCents < 100) {
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

    if (
      donorEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",

      // 카드 입력만 표시합니다.
      payment_method_types: ["card"],

      description: "Lupin Donation",

      receipt_email: donorEmail || undefined,

      metadata: {
        donor_name: donorName || "Anonymous",
        donor_email: donorEmail,
        source: "lupin_embedded_donation",
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
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to initialize the donation payment.";

    console.error("Lupin create PaymentIntent error:", message);

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
