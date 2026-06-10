import { ArrowLeft, AlertTriangle, Scale, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
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
              <Scale size={24} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
              Lupin
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Terms of Service
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/75">
              Lupin — a righteous outlaw protecting your dignity.
            </p>
          </div>

          <div className="space-y-7 p-6 text-sm leading-7 text-zinc-700 sm:p-8">
            <section className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-red-700">
                <AlertTriangle size={20} />
                <h2 className="text-lg font-black">
                  Truth and accountability rule
                </h2>
              </div>

              <p className="font-bold text-red-800">
                Lupin is a platform for truthful, good-faith, evidence-based
                sharing. Users must not post false accusations, fabricated facts,
                misleading claims, manipulated evidence, or content intended to
                unfairly damage another person or organization.
              </p>

              <p className="mt-3 text-red-800">
                If a user knowingly posts false, defamatory, fraudulent,
                harassing, or privacy-violating content, the user is solely
                responsible for that content. Lupin may remove the content,
                suspend the account, preserve relevant records, cooperate with
                lawful requests, and take legal action when appropriate.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                1. Purpose
              </h2>
              <p>
                Lupin is a social space for people who want to share difficult
                experiences, protect their dignity, and receive support from
                others. Lupin is not a law firm, medical provider, therapist, or
                emergency service.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                2. Truthful use required
              </h2>
              <p>
                You agree that any story, statement, image, document, message, or
                accusation you submit to Lupin must be truthful to the best of
                your knowledge. You must clearly distinguish facts, personal
                opinions, suspicions, and unverified information.
              </p>

              <p className="mt-3">
                You must not use Lupin to knowingly spread false information,
                create fake evidence, misrepresent events, impersonate others, or
                make claims that you know are untrue.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                3. Evidence and responsibility
              </h2>
              <p>
                If you describe another person, employer, organization, school,
                institution, or public entity, you are responsible for the
                accuracy of your statements. When possible, keep your post
                factual, specific, and based on records, dates, messages,
                documents, witnesses, or direct experience.
              </p>

              <p className="mt-3">
                Lupin does not verify every post before publication. Publication
                on Lupin does not mean Lupin confirms, endorses, or guarantees
                the accuracy of any user content.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                4. No false accusations or defamation
              </h2>
              <p>
                You may not post defamatory statements, false accusations,
                knowingly misleading claims, or content designed to harass,
                threaten, shame, extort, or unfairly damage another person’s
                reputation, employment, safety, or livelihood.
              </p>

              <p className="mt-3">
                Users who violate this rule may be removed from Lupin and may
                face legal consequences from affected individuals, organizations,
                or Lupin.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                5. Privacy of others
              </h2>
              <p>
                Do not upload or expose another person’s private information,
                private photos, home address, phone number, email address,
                medical records, legal documents, financial records, immigration
                records, identity documents, or other sensitive information
                without lawful permission.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                6. No legal advice
              </h2>
              <p>
                Content on Lupin is for general support and discussion only. It
                is not legal advice. If you need legal advice, consult a
                qualified attorney in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                7. No emergency service
              </h2>
              <p>
                Lupin is not designed for emergencies. If you are in immediate
                danger or need urgent help, contact local emergency services or a
                trusted professional.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                8. Content moderation
              </h2>
              <p>
                Lupin may remove, restrict, hide, preserve, or review content
                that may violate these Terms, create legal risk, threaten user
                safety, invade privacy, or harm the integrity of the platform.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                9. Account suspension and legal action
              </h2>
              <p>
                If you use Lupin to post false statements, fabricated evidence,
                defamatory content, harassment, threats, doxxing, impersonation,
                spam, fraud, or other unlawful content, Lupin may suspend or
                terminate your account.
              </p>

              <p className="mt-3">
                Lupin reserves the right to preserve relevant records, report
                unlawful activity, cooperate with lawful requests, and pursue
                legal action when necessary to protect users, the platform, and
                the public.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                10. Donations and payments
              </h2>
              <p>
                Any payment or donation feature may be processed by a
                third-party provider. Payment availability may change. Fees,
                refunds, and processing are subject to the terms of the payment
                provider.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                11. Changes
              </h2>
              <p>
                We may update these Terms as Lupin develops. Continued use of
                Lupin means you accept the updated Terms.
              </p>
            </section>

            <section className="rounded-[1.5rem] border border-black/10 bg-zinc-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-zinc-900">
                <ShieldCheck size={20} />
                <h2 className="text-lg font-black">User declaration</h2>
              </div>

              <p>
                By using Lupin, you confirm that you understand this rule:
                <strong>
                  {" "}
                  tell the truth, do not fabricate evidence, do not falsely
                  accuse others, and take responsibility for your own content.
                </strong>
              </p>
            </section>

            <div className="rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-500">
              Last updated: June 2026
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
