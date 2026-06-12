"use client";

import {
  ArrowLeft,
  HeartHandshake,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useMemo, useState } from "react";
import DonatePaymentForm from "./DonatePaymentForm";

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

const PRESET_AMOUNTS = [10, 25, 50, 100];

type PaymentIntentResponse = {
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
};

function normalizeAmount(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * 100) / 100;
}

export default function DonatePage() {
  const [amountInput, setAmountInput] = useState("25");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [donationComplete, setDonationComplete] = useState(false);

  const amount = useMemo(
    () => normalizeAmount(amountInput),
    [amountInput]
  );

  const validAmount = amount >= 1 && amount <= 10000;

  const initializePayment = async () => {
    setPaymentError("");
    setDonationComplete(false);

    if (!validAmount) {
      setClientSecret("");
      setPaymentError(
        "Please enter a donation amount between $1 and $10,000."
      );
      return;
    }

    if (
      email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setClientSecret("");
      setPaymentError("Please enter a valid email address.");
      return;
    }

    try {
      setLoadingPayment(true);
      setClientSecret("");
      setPaymentIntentId("");

      const response = await fetch(
        "/api/donate/create-payment-intent",
        {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            name: name.trim(),
            email: email.trim(),
          }),
        }
      );

      const json = (await response.json()) as PaymentIntentResponse;

      if (!response.ok || !json.clientSecret) {
        setPaymentError(
          json.error || "Unable to initialize secure card payment."
        );
        return;
      }

      setClientSecret(json.clientSecret);
      setPaymentIntentId(json.paymentIntentId || "");
    } catch (error) {
      console.error("Lupin donation initialization error:", error);
      setPaymentError("Unable to initialize secure card payment.");
    } finally {
      setLoadingPayment(false);
    }
  };

  useEffect(() => {
    if (!stripePublishableKey) {
      setPaymentError(
        "Stripe is not configured. Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY."
      );
      return;
    }

    initializePayment();
    // Initial payment form only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePresetAmount = (value: number) => {
    setAmountInput(String(value));
    setClientSecret("");
    setPaymentIntentId("");
    setPaymentError("");
    setDonationComplete(false);
  };

  const handleAmountChange = (value: string) => {
    const cleaned = value
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1");

    setAmountInput(cleaned);
    setClientSecret("");
    setPaymentIntentId("");
    setPaymentError("");
    setDonationComplete(false);
  };

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#18181b",
      colorBackground: "#ffffff",
      colorText: "#18181b",
      colorDanger: "#dc2626",
      fontFamily:
        "Arial, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      borderRadius: "14px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        border: "1px solid rgba(0, 0, 0, 0.12)",
        boxShadow: "none",
        padding: "13px 14px",
      },
      ".Input:focus": {
        border: "1px solid #18181b",
        boxShadow: "0 0 0 1px #18181b",
      },
      ".Label": {
        fontWeight: "700",
        marginBottom: "8px",
      },
      ".Tab": {
        border: "1px solid rgba(0, 0, 0, 0.10)",
        boxShadow: "none",
      },
      ".Tab--selected": {
        border: "1px solid #18181b",
        boxShadow: "0 0 0 1px #18181b",
      },
    },
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm transition hover:bg-zinc-50"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-black">Lupin</p>
            <p className="text-xs font-semibold text-zinc-500">
              A righteous outlaw protecting your dignity
            </p>
          </div>
        </div>

        <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-7 text-white sm:px-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <HeartHandshake size={24} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
              Lupin
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Make a donation
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
              Would you help someone facing a difficult situation? Your support
              may protect someone&apos;s dignity and change the world, even a
              little.
            </p>
          </header>

          <div className="space-y-6 p-5 sm:p-7">
            <section>
              <label
                htmlFor="donation-amount"
                className="mb-3 block text-sm font-black"
              >
                Donation amount
              </label>

              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={loadingPayment || donationComplete}
                    onClick={() => changePresetAmount(preset)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                      amount === preset
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center rounded-2xl border border-black/10 bg-zinc-50 px-4 transition focus-within:border-zinc-950 focus-within:bg-white">
                <span className="font-black text-zinc-500">$</span>

                <input
                  id="donation-amount"
                  type="text"
                  inputMode="decimal"
                  value={amountInput}
                  disabled={loadingPayment || donationComplete}
                  onChange={(event) =>
                    handleAmountChange(event.target.value)
                  }
                  className="w-full bg-transparent px-3 py-4 text-base font-black outline-none disabled:cursor-not-allowed"
                  aria-describedby="amount-help"
                />
              </div>

              <p
                id="amount-help"
                className="mt-2 text-xs font-semibold text-zinc-400"
              >
                Enter an amount from $1 to $10,000.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-black">
                  Name
                  <span className="ml-1 font-medium text-zinc-400">
                    Optional
                  </span>
                </span>

                <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
                  <UserRound size={18} className="shrink-0 text-zinc-400" />

                  <input
                    type="text"
                    value={name}
                    disabled={loadingPayment || donationComplete}
                    onChange={(event) => {
                      setName(event.target.value);
                      setClientSecret("");
                      setPaymentIntentId("");
                      setPaymentError("");
                    }}
                    placeholder="Your name"
                    maxLength={100}
                    autoComplete="name"
                    className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">
                  Receipt email
                  <span className="ml-1 font-medium text-zinc-400">
                    Optional
                  </span>
                </span>

                <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
                  <Mail size={18} className="shrink-0 text-zinc-400" />

                  <input
                    type="email"
                    value={email}
                    disabled={loadingPayment || donationComplete}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setClientSecret("");
                      setPaymentIntentId("");
                      setPaymentError("");
                    }}
                    placeholder="you@example.com"
                    maxLength={200}
                    autoComplete="email"
                    className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed"
                  />
                </div>
              </label>
            </section>

            {!clientSecret && !donationComplete && (
              <button
                type="button"
                onClick={initializePayment}
                disabled={!validAmount || loadingPayment}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
              >
                {loadingPayment ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Loading secure card form...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Continue to card information
                  </>
                )}
              </button>
            )}

            {paymentError && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                {paymentError}
              </div>
            )}

            {loadingPayment && !clientSecret && (
              <div className="rounded-[1.5rem] border border-black/10 bg-zinc-50 p-8 text-center">
                <Loader2
                  size={24}
                  className="mx-auto animate-spin text-zinc-500"
                />
                <p className="mt-3 text-sm font-bold text-zinc-500">
                  Preparing secure payment...
                </p>
              </div>
            )}

            {stripePromise && clientSecret && !donationComplete && (
              <Elements
                key={paymentIntentId || clientSecret}
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance,
                  loader: "auto",
                }}
              >
                <DonatePaymentForm
                  amount={amount}
                  donorName={name}
                  donorEmail={email}
                  onSuccess={() => setDonationComplete(true)}
                />
              </Elements>
            )}

            {donationComplete && (
              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 text-center">
                <HeartHandshake
                  size={30}
                  className="mx-auto text-emerald-700"
                />

                <h2 className="mt-3 text-xl font-black text-emerald-800">
                  Thank you for supporting Lupin.
                </h2>

                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  Your donation helps support people facing difficult
                  situations.
                </p>

                <Link
                  href="/"
                  className="mt-5 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white"
                >
                  Return home
                </Link>
              </div>
            )}
          </div>
        </article>

        <p className="text-center text-xs leading-5 text-zinc-400">
          Payments are securely processed by Stripe. Lupin does not store your
          full card number or CVC.
        </p>
      </section>
    </main>
  );
}
