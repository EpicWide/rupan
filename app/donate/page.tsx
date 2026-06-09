"use client";

import {
  ArrowLeft,
  CreditCard,
  HeartHandshake,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function DonatePage() {
  const [amount, setAmount] = useState("25");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDonate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 1) {
      setMessage("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.url) {
        setMessage(json.error || "Donation checkout is not ready yet.");
        return;
      }

      window.location.href = json.url;
    } catch {
      setMessage("Donation checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm transition hover:bg-zinc-50"
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-8 text-white">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <HeartHandshake size={24} />
            </div>

            <h1 className="text-3xl font-black tracking-tight">Donate</h1>

            <p className="mt-4 text-base leading-7 text-white/80">
              Would you help someone facing a difficult situation? Your support
              may change the world, even if only a little.
            </p>
          </div>

          <form onSubmit={handleDonate} className="space-y-5 p-5 sm:p-6">
            <label className="block">
              <span className="mb-2 block text-sm font-black">Donation amount</span>
              <div className="flex items-center rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 focus-within:border-zinc-950 focus-within:bg-white">
                <span className="mr-2 text-sm font-black text-zinc-500">$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold outline-none"
                  required
                />
              </div>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-black">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-zinc-950 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional receipt email"
                  className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-zinc-950 focus:bg-white"
                />
              </label>
            </div>

            <div className="rounded-[1.5rem] border border-black/10 bg-zinc-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black">
                <CreditCard size={18} />
                Secure card payment
              </div>

              <div className="rounded-2xl border border-dashed border-black/15 bg-white p-5 text-sm font-bold text-zinc-500">
                Card information will be entered securely through Stripe Checkout.
                Rupan never stores your card number.
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-zinc-400">
                <ShieldCheck size={15} />
                Secure payment provider required for production.
              </div>
            </div>

            {message && (
              <div className="rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <HeartHandshake size={18} />}
              Continue to secure donation
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
