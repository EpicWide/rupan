"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Props = {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
};

export default function EmbeddedDonationForm({
  amount,
  onSuccess,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [elementReady, setElementReady] = useState(false);
  const [elementComplete, setElementComplete] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState("");

  const emailValid = useMemo(() => {
    if (!email.trim()) return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const canSubmit =
    Boolean(stripe) &&
    Boolean(elements) &&
    elementReady &&
    elementComplete &&
    emailValid &&
    !submitting &&
    !completed;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !canSubmit) return;

    setSubmitting(true);
    setNotice("");

    try {
      const validation = await elements.submit();

      if (validation.error) {
        setNotice(
          validation.error.message ||
            "Please check your card information."
        );
        return;
      }

      const result = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url: `${window.location.origin}/donate`,

          payment_method_data: {
            billing_details: {
              name: name.trim() || undefined,
              email: email.trim() || undefined,
            },
          },
        },

        // Normal card payments remain on this page.
        redirect: "if_required",
      });

      if (result.error) {
        setNotice(
          result.error.message ||
            "Your card payment could not be completed."
        );
        return;
      }

      const paymentIntent = result.paymentIntent;

      if (!paymentIntent) {
        setNotice("Stripe did not return a payment result.");
        return;
      }

      if (
        paymentIntent.status === "succeeded" ||
        paymentIntent.status === "processing"
      ) {
        setCompleted(true);

        setNotice(
          paymentIntent.status === "succeeded"
            ? "Thank you. Your donation was completed."
            : "Your donation is processing."
        );

        onSuccess(paymentIntent.id);
        return;
      }

      setNotice(
        `Payment status: ${paymentIntent.status}. The donation was not completed.`
      );
    } catch (error) {
      console.error("Lupin embedded payment error:", error);
      setNotice("Unable to complete the payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-black">
            Name
            <span className="ml-1 font-medium text-zinc-400">
              Optional
            </span>
          </span>

          <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 focus-within:border-zinc-950 focus-within:bg-white">
            <UserRound size={18} className="shrink-0 text-zinc-400" />

            <input
              type="text"
              value={name}
              disabled={submitting || completed}
              onChange={(event) => {
                setName(event.target.value);
                setNotice("");
              }}
              placeholder="Your name"
              maxLength={100}
              autoComplete="name"
              className="w-full bg-transparent text-sm outline-none"
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

          <div
            className={`flex items-center gap-2 rounded-2xl border bg-zinc-50 px-4 py-3 focus-within:bg-white ${
              emailValid
                ? "border-black/10 focus-within:border-zinc-950"
                : "border-red-300"
            }`}
          >
            <Mail size={18} className="shrink-0 text-zinc-400" />

            <input
              type="email"
              value={email}
              disabled={submitting || completed}
              onChange={(event) => {
                setEmail(event.target.value);
                setNotice("");
              }}
              placeholder="you@example.com"
              maxLength={200}
              autoComplete="email"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {!emailValid && (
            <p className="mt-2 text-xs font-bold text-red-600">
              Please enter a valid email address.
            </p>
          )}
        </label>
      </div>

      <section className="rounded-[1.5rem] border border-black/10 bg-zinc-50 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <CreditCard size={19} />
          </div>

          <div>
            <h2 className="text-sm font-black">
              Secure card information
            </h2>

            <p className="mt-0.5 text-xs text-zinc-500">
              Enter your card directly on this page.
            </p>
          </div>
        </div>

        <div className="relative min-h-[185px] rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          {!elementReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2
                  size={22}
                  className="mx-auto animate-spin text-zinc-400"
                />

                <p className="mt-3 text-xs font-bold text-zinc-400">
                  Loading secure card form...
                </p>
              </div>
            </div>
          )}

          <div className={elementReady ? "block" : "invisible"}>
            <PaymentElement
              options={{
                layout: {
                  type: "accordion",
                  defaultCollapsed: false,
                  radios: false,
                  spacedAccordionItems: true,
                },
              }}
              onReady={() => setElementReady(true)}
              onChange={(event) => {
                setElementComplete(event.complete);
                setNotice("");
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-zinc-500">
          <LockKeyhole size={15} className="mt-0.5 shrink-0" />

          <p>
            Card details are encrypted and submitted directly to Stripe.
            Lupin does not receive or store your complete card number or CVC.
          </p>
        </div>
      </section>

      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${
            completed
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {completed && (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          )}

          <span>{notice}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing securely...
          </>
        ) : completed ? (
          <>
            <CheckCircle2 size={18} />
            Donation completed
          </>
        ) : (
          <>
            <LockKeyhole size={18} />
            Donate ${amount.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
}
