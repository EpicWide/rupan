import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function DonateSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-8 text-zinc-950">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 size={30} />
        </div>

        <h1 className="text-3xl font-black tracking-tight">Thank you.</h1>

        <p className="mt-4 text-sm leading-7 text-zinc-600">
          Your donation was completed through Stripe Checkout. Your support may
          help someone facing a difficult situation.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to Rupan
        </Link>
      </section>
    </main>
  );
}
