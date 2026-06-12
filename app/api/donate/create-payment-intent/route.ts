import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type DonationRequest = {
  amount?: unknown;
  name?: unknown;
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
    throw new Error("Invalid STRIPE_SECRET_KEY format.");
  }

  return new Stripe(secretKey);
}

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DonationRequest;

    const amount = Number(body.amount);
    const donorName = cleanText(body.name, 100);
    const donorEmail = cleanText(body.email, 200);

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

    if (donorEmail && !validEmail(donorEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method_types: ["card"],
      description: "Lupin Donation",
      receipt_email: donorEmail || undefined,

      metadata: {
        donor_name: donorName || "Anonymous",
        donor_email: donorEmail || "",
        source: "lupin_embedded_card",
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

    console.error("Lupin donation PaymentIntent error:", message);

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
