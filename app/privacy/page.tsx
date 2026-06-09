import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-8 text-zinc-950">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="font-black underline">
          ← Back to Rupan
        </Link>

        <h1 className="mt-6 text-3xl font-black">Privacy Policy</h1>

        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-700">
          <p>
            Rupan collects basic account information such as your email address and authentication provider.
          </p>
          <p>
            Content you publish, including text and photos, may be visible to other users.
          </p>
          <p>
            Authentication is handled through Supabase. We do not sell your personal information.
          </p>
          <p>
            You may contact us to request account or content removal.
          </p>
        </div>
      </section>
    </main>
  );
}
