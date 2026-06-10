"use client";

import {
  ArrowLeft,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");

  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);

  const canSend = email.trim().length > 4 && body.trim().length >= 10 && !sending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setNotice("");
    setSuccess(false);

    if (!canSend) {
      setNotice("Please enter your email and a message of at least 10 characters.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch("/api/contact", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          body: body.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setNotice(json?.error || "Failed to send your message.");
        setSuccess(false);
        return;
      }

      setSuccess(true);
      setNotice("Your message has been sent.");
      setName("");
      setEmail("");
      setBody("");
    } catch {
      setNotice("Failed to send your message.");
      setSuccess(false);
    } finally {
      setSending(false);
    }
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

          <Link
            href="/signup"
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800"
          >
            Sign up
          </Link>
        </div>

        <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-8 text-white">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Mail size={24} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
              Lupin
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Contact Lupin
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/75">
              Send questions, reports, safety concerns, or platform feedback.
            </p>
          </div>

          <div className="border-b border-black/10 bg-zinc-50 p-5">
            <div className="flex gap-3 rounded-[1.5rem] border border-black/10 bg-white p-4">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-zinc-500"
              />
              <p className="text-sm leading-6 text-zinc-600">
                Please send truthful, good-faith information only. Do not submit
                fabricated claims, threats, harassment, private information about
                others, or unlawful content. Lupin may preserve records and take
                action when necessary.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <label className="block">
              <span className="mb-2 block text-sm font-black">Name</span>
              <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
                <UserRound size={18} className="text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNotice("");
                    setSuccess(false);
                  }}
                  placeholder="Your name"
                  maxLength={80}
                  className="w-full bg-transparent text-sm outline-none"
                  autoComplete="name"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black">
                Email <span className="text-red-500">*</span>
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
                <Mail size={18} className="text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setNotice("");
                    setSuccess(false);
                  }}
                  placeholder="you@example.com"
                  maxLength={120}
                  className="w-full bg-transparent text-sm outline-none"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black">
                Message <span className="text-red-500">*</span>
              </span>
              <textarea
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setNotice("");
                  setSuccess(false);
                }}
                placeholder="Write your message..."
                minLength={10}
                maxLength={3000}
                className="min-h-44 w-full resize-none rounded-3xl border border-black/10 bg-zinc-50 px-4 py-4 text-sm leading-7 outline-none transition focus:border-zinc-950 focus:bg-white"
                required
              />
              <p className="mt-2 text-xs font-semibold text-zinc-400">
                {body.length}/3000
              </p>
            </label>

            {notice && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                  success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-black/10 bg-zinc-50 text-zinc-700"
                }`}
              >
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSend}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              Send message
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
