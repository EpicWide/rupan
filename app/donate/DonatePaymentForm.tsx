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
} from "lucide-react";
import { FormEvent, useState } from "react";

type DonatePaymentFormProps = {
  amount: number;
  donorName: string;
  donorEmail: string;
  onSuccess: () => void;
};

export default function DonatePaymentForm({
  amount,
  donorName,
  donorEmail,
  onSuccess,
}: DonatePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [complete, setComplete] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || submitting || complete) {
      return;
    }

    setSubmitting(true);
    setNotice("");

    try {
      const submitResult = await elements.submit();

      if (submitResult.error) {
        setNotice(
          submitResult.error.message ||
            "Please check your payment information."
        );
        return;
      }

      const returnUrl = `${window.location.origin}/donate/success`;

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          receipt_email: donorEmail.trim() || undefined,
          payment_method_data: {
            billing_details: {
              name: donorName.trim() || undefined,
              email: donorEmail.trim() || undefined,
            },
          },
        },
        redirect: "if_required",
      });

      if (result.error) {
        setNotice(
          result.error.message ||
            "The payment could not be completed."
        );
        return;
      }

      const status = result.paymentIntent?.status;

      if (status === "succeeded") {
        setComplete(true);
        setNotice("Thank you. Your donation was completed successfully.");
        onSuccess();
        return;
      }

      if (status === "processing") {
        setComplete(true);
        setNotice(
          "Your payment is processing. Stripe will confirm it shortly."
        );
        onSuccess();
        return;
      }

      setNotice(
        "The payment was not completed. Please check your card information."
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
      <section className="rounded-[1.5rem] border border-black/10 bg-zinc-50 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard size={18} />
          <h2 className="text-sm font-black">Secure card information</h2>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <PaymentElement
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
              fields: {
                billingDetails: {
                  name: "never",
                  email: "never",
                },
              },
              terms: {
                card: "never",
              },
            }}
          />
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-zinc-500">
          <LockKeyhole size={15} className="mt-0.5 shrink-0" />
          <p>
            Card information is encrypted and processed securely by Stripe.
            Lupin does not receive or store your complete card number or CVC.
          </p>
        </div>
      </section>

      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${
            complete
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {complete && <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
          <span>{notice}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting || complete}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing securely...
          </>
        ) : complete ? (
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
        By submitting this payment, you authorize a one-time donation of{" "}
        <strong>${amount.toFixed(2)}</strong>.
      </p>
    </form>
  );
}
