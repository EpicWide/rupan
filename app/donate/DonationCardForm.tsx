"use client";

import {
  CardElement,
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
import {
  FormEvent,
  useMemo,
  useState,
} from "react";

type DonationCardFormProps = {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
};

type PaymentIntentResponse = {
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
};

const CARD_OPTIONS = {
  hidePostalCode: false,

  style: {
    base: {
      color: "#18181b",
      fontFamily:
        "Arial, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",

      "::placeholder": {
        color: "#a1a1aa",
      },
    },

    invalid: {
      color: "#dc2626",
      iconColor: "#dc2626",
    },
  },
};

export default function DonationCardForm({
  amount,
  onSuccess,
}: DonationCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [completed, setCompleted] = useState(false);

  const emailValid = useMemo(() => {
    if (!email.trim()) return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const canSubmit =
    Boolean(stripe) &&
    Boolean(elements) &&
    amount >= 1 &&
    amount <= 10000 &&
    cardComplete &&
    emailValid &&
    !submitting &&
    !completed;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !canSubmit) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setNotice("The secure card form is unavailable. Please refresh the page.");
      return;
    }

    setSubmitting(true);
    setNotice("");
    setCardError("");

    try {
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

      const result = (await response.json()) as PaymentIntentResponse;

      if (!response.ok || !result.clientSecret) {
        setNotice(
          result.error || "Unable to initialize secure payment."
        );
        return;
      }

      const confirmation = await stripe.confirmCardPayment(
        result.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: name.trim() || undefined,
              email: email.trim() || undefined,
            },
          },

          receipt_email: email.trim() || undefined,
        }
      );

      if (confirmation.error) {
        setNotice(
          confirmation.error.message ||
            "Your payment could not be completed."
        );
        return;
      }

      const paymentIntent = confirmation.paymentIntent;

      if (!paymentIntent) {
        setNotice("Stripe did not return a payment result.");
        return;
      }

      if (paymentIntent.status === "succeeded") {
        setCompleted(true);
        setNotice("Thank you. Your donation was completed.");
        onSuccess(paymentIntent.id);
        return;
      }

      if (paymentIntent.status === "processing") {
        setCompleted(true);
        setNotice(
          "Your payment is processing. Stripe will confirm it shortly."
        );
        onSuccess(paymentIntent.id);
        return;
      }

      setNotice(
        `Payment status: ${paymentIntent.status}. The donation was not completed.`
      );
    } catch (error) {
      console.error("Lupin donation confirmation error:", error);
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

          <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
            <UserRound
              size={18}
              className="shrink-0 text-zinc-400"
            />

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

          <div
            className={`flex items-center gap-2 rounded-2xl border bg-zinc-50 px-4 py-3 transition focus-within:bg-white ${
              emailValid
                ? "border-black/10 focus-within:border-zinc-950"
                : "border-red-300"
            }`}
          >
            <Mail
              size={18}
              className="shrink-0 text-zinc-400"
            />

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
              className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed"
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
        <div className="mb-4 flex items-center gap-2">
          <CreditCard size={19} />

          <div>
            <h2 className="text-sm font-black">
              Card information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Card number, expiration date, CVC and ZIP
            </p>
          </div>
        </div>

        <div
          className={`rounded-2xl border bg-white px-4 py-4 shadow-sm transition ${
            cardError
              ? "border-red-300"
              : "border-black/10 focus-within:border-zinc-950"
          }`}
        >
          <CardElement
            options={CARD_OPTIONS}
            onChange={(event) => {
              setCardComplete(event.complete);
              setCardError(event.error?.message || "");
              setNotice("");
            }}
          />
        </div>

        {cardError && (
          <p className="mt-3 text-sm font-bold text-red-600">
            {cardError}
          </p>
        )}

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-zinc-500">
          <LockKeyhole
            size={15}
            className="mt-0.5 shrink-0"
          />

          <p>
            Card information is encrypted and sent directly to Stripe.
            Lupin does not receive or store your complete card number or
            CVC.
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
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
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

      <p className="text-center text-xs leading-5 text-zinc-400">
        This is a one-time donation. By selecting Donate, you authorize
        a charge of <strong>${amount.toFixed(2)}</strong>.
      </p>
    </form>
  );
}
