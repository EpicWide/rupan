"use client";

import {
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EmbeddedDonationForm from "./EmbeddedDonationForm";

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "";

const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : null;

const PRESET_AMOUNTS = [10, 25, 50, 100];

type IntentResponse = {
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
};

function normalizeAmount(value: string): number {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return 0;

  return Math.round(amount * 100) / 100;
}

export default function DonatePage() {
  const [amountInput, setAmountInput] = useState("25");

  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");

  const [loadingIntent, setLoadingIntent] = useState(true);
  const [intentError, setIntentError] = useState("");
  const [completedPaymentId, setCompletedPaymentId] = useState("");

  const amount = useMemo(
    () => normalizeAmount(amountInput),
    [amountInput]
  );

  const amountValid = amount >= 1 && amount <= 10000;
  const completed = Boolean(completedPaymentId);

  useEffect(() => {
    if (!publishableKey || !amountValid || completed) {
      setLoadingIntent(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setLoadingIntent(true);
      setIntentError("");
      setClientSecret("");
      setPaymentIntentId("");

      try {
        const response = await fetch(
          "/api/donate/create-payment-intent",
          {
            method: "POST",
            cache: "no-store",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount,
            }),
          }
        );

        const result = (await response.json()) as IntentResponse;

        if (!response.ok || !result.clientSecret) {
          throw new Error(
            result.error || "Unable to load secure card form."
          );
        }

        setClientSecret(result.clientSecret);
        setPaymentIntentId(result.paymentIntentId || "");
      } catch (error) {
        if (controller.signal.aborted) return;

        setIntentError(
          error instanceof Error
            ? error.message
            : "Unable to load secure card form."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingIntent(false);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [amount, amountValid, completed]);

  const handleAmountChange = (value: string) => {
    const cleaned = value
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1")
      .slice(0, 9);

    setAmountInput(cleaned);
    setCompletedPaymentId("");
  };

  const appearance = {
    theme: "stripe" as const,

    variables: {
      colorPrimary: "#18181b",
      colorBackground: "#ffffff",
      colorText: "#18181b",
      colorDanger: "#dc2626",
      borderRadius: "14px",
      spacingUnit: "4px",
    },

    rules: {
      ".Input": {
        border: "1px solid rgba(0,0,0,0.12)",
        boxShadow: "none",
        padding: "13px 14px",
      },

      ".Input:focus": {
        border: "1px solid #18181b",
        boxShadow: "0 0 0 1px #18181b",
      },

      ".Label": {
        fontWeight: "700",
      },
    },
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm"
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <header className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-7 text-white sm:px-8">
            <HeartHandshake size={28} />

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
              Lupin
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Make a donation
            </h1>

            <p className="mt-3 text-sm leading-7 text-white/75">
              Help someone facing a difficult situation and protect their
              dignity.
            </p>
          </header>

          <div className="space-y-6 p-5 sm:p-7">
            {!completed && (
              <>
                <section>
                  <p className="mb-3 text-sm font-black">
                    Donation amount
                  </p>

                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setAmountInput(String(preset));
                          setCompletedPaymentId("");
                        }}
                        className={`rounded-2xl border px-2 py-3 text-sm font-black ${
                          amount === preset
                            ? "border-zinc-950 bg-zinc-950 text-white"
                            : "border-black/10 bg-white text-zinc-700"
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center rounded-2xl border border-black/10 bg-zinc-50 px-4">
                    <span className="font-black text-zinc-500">$</span>

                    <input
                      type="text"
                      inputMode="decimal"
                      value={amountInput}
                      onChange={(event) =>
                        handleAmountChange(event.target.value)
                      }
                      className="w-full bg-transparent px-3 py-4 font-black outline-none"
                    />
                  </div>
                </section>

                {!publishableKey && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                    Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
                  </div>
                )}

                {intentError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                    {intentError}
                  </div>
                )}

                {loadingIntent && (
                  <div className="rounded-2xl bg-zinc-50 p-8 text-center">
                    <Loader2
                      className="mx-auto animate-spin text-zinc-500"
                    />

                    <p className="mt-3 text-sm font-bold text-zinc-500">
                      Preparing card form...
                    </p>
                  </div>
                )}

                {stripePromise &&
                  clientSecret &&
                  !loadingIntent && (
                    <Elements
                      key={paymentIntentId}
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance,
                        loader: "auto",
                      }}
                    >
                      <EmbeddedDonationForm
                        amount={amount}
                        onSuccess={setCompletedPaymentId}
                      />
                    </Elements>
                  )}

                <div className="flex gap-3 rounded-2xl bg-zinc-50 p-4">
                  <ShieldCheck size={20} className="shrink-0" />

                  <p className="text-xs leading-6 text-zinc-500">
                    The card form stays inside this Lupin page. Card
                    information is processed securely by Stripe.
                  </p>
                </div>
              </>
            )}

            {completed && (
              <div className="rounded-3xl bg-emerald-50 p-8 text-center">
                <CheckCircle2
                  size={38}
                  className="mx-auto text-emerald-700"
                />

                <h2 className="mt-4 text-2xl font-black">
                  Thank you.
                </h2>

                <p className="mt-2 text-sm text-emerald-700">
                  Your donation was completed successfully.
                </p>
              </div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
