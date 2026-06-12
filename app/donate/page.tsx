"use client";

import {
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useMemo, useState } from "react";
import DonationCardForm from "./DonationCardForm";

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "";

const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : null;

const PRESET_AMOUNTS = [10, 25, 50, 100];

function normalizeAmount(value: string): number {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return 0;

  return Math.round(amount * 100) / 100;
}

export default function DonatePage() {
  const [amountInput, setAmountInput] = useState("25");
  const [completedPaymentId, setCompletedPaymentId] =
    useState("");

  const amount = useMemo(
    () => normalizeAmount(amountInput),
    [amountInput]
  );

  const amountValid = amount >= 1 && amount <= 10000;
  const completed = Boolean(completedPaymentId);

  const handleAmountChange = (value: string) => {
    const cleaned = value
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1")
      .slice(0, 9);

    setAmountInput(cleaned);
    setCompletedPaymentId("");
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
              Would you help someone facing a difficult situation?
              Your support may protect someone&apos;s dignity and change
              the world, even a little.
            </p>
          </header>

          <div className="space-y-6 p-5 sm:p-7">
            {!completed && (
              <>
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
                        onClick={() => {
                          setAmountInput(String(preset));
                          setCompletedPaymentId("");
                        }}
                        className={`rounded-2xl border px-2 py-3 text-sm font-black transition ${
                          amount === preset
                            ? "border-zinc-950 bg-zinc-950 text-white"
                            : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>

                  <div
                    className={`mt-3 flex items-center rounded-2xl border bg-zinc-50 px-4 transition focus-within:bg-white ${
                      amountValid
                        ? "border-black/10 focus-within:border-zinc-950"
                        : "border-red-300"
                    }`}
                  >
                    <span className="font-black text-zinc-500">$</span>

                    <input
                      id="donation-amount"
                      type="text"
                      inputMode="decimal"
                      value={amountInput}
                      onChange={(event) =>
                        handleAmountChange(event.target.value)
                      }
                      className="w-full bg-transparent px-3 py-4 text-base font-black outline-none"
                    />
                  </div>

                  {!amountValid && (
                    <p className="mt-2 text-xs font-bold text-red-600">
                      Enter an amount from $1 to $10,000.
                    </p>
                  )}
                </section>

                {!publishableKey && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
                  </div>
                )}

                {stripePromise && amountValid && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      locale: "en",
                    }}
                  >
                    <DonationCardForm
                      amount={amount}
                      onSuccess={(paymentIntentId) =>
                        setCompletedPaymentId(paymentIntentId)
                      }
                    />
                  </Elements>
                )}

                <section className="flex gap-3 rounded-[1.5rem] border border-black/10 bg-zinc-50 p-4">
                  <ShieldCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-zinc-500"
                  />

                  <p className="text-xs leading-6 text-zinc-500">
                    Card information stays inside this Lupin page and is
                    securely processed by Stripe. Lupin does not store
                    complete card numbers or CVC codes.
                  </p>
                </section>
              </>
            )}

            {completed && (
              <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-7 text-center">
                <CheckCircle2
                  size={38}
                  className="mx-auto text-emerald-700"
                />

                <h2 className="mt-4 text-2xl font-black text-emerald-900">
                  Thank you.
                </h2>

                <p className="mt-2 text-sm leading-7 text-emerald-700">
                  Your donation to Lupin was completed successfully.
                </p>

                <Link
                  href="/"
                  className="mt-6 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white"
                >
                  Return home
                </Link>
              </section>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
