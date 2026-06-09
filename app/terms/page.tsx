import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-8 text-zinc-950">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="font-black underline">
          ← Back to Rupan
        </Link>

        <h1 className="mt-6 text-3xl font-black">Terms of Service</h1>

        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-700">
          <p>
            By creating an account or using Rupan, you agree to use the service responsibly and lawfully.
          </p>
          <p>
            You may not post threats, harassment, illegal content, private personal information, or content that violates another person&apos;s rights.
          </p>
          <p>
            You are responsible for the content you publish. Rupan may remove content or suspend accounts that violate these terms.
          </p>
          <p>
            Rupan is provided as-is without warranties.
          </p>
        </div>
      </section>
    </main>
  );
}
