import { ArrowLeft, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
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
              <ShieldCheck size={24} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
              Lupin
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Privacy Policy
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
                  Truth, safety, and records
                </h2>
              </div>

              <p className="font-bold text-red-800">
                Lupin requires users to provide truthful, good-faith,
                evidence-based content. If a user posts false accusations,
                fabricated evidence, harassment, threats, doxxing, or unlawful
                content, Lupin may preserve related records and use them to
                protect users, investigate abuse, respond to lawful requests, or
                take legal action.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                1. Information we collect
              </h2>
              <p>
                We may collect account information such as email address, login
                provider, nickname, profile details, posts, uploaded images,
                reactions, direct messages, visitor count events, technical logs,
                IP-related security information, device/browser information, and
                contact messages you submit.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                2. Content you submit
              </h2>
              <p>
                Posts, images, messages, and profile details may contain personal
                or sensitive information. You are responsible for deciding what
                to share. Do not submit information about another person unless
                you have the right to do so.
              </p>

              <p className="mt-3">
                If you make accusations or describe another person,
                organization, employer, school, institution, or public entity,
                you are responsible for the accuracy and legality of your
                content.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                3. How we use information
              </h2>
              <p>
                We use information to operate Lupin, authenticate users, display
                posts, deliver direct messages, process contact requests, prevent
                abuse, improve safety, moderate content, investigate violations,
                maintain security, and provide basic platform analytics.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                4. Public content
              </h2>
              <p>
                Posts, nicknames, images, reactions, and other public activity
                may be visible to other users or the public depending on how
                Lupin is configured. Do not post information that you want to
                keep private.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                5. Direct messages
              </h2>
              <p>
                Direct messages are intended to be private between users.
                However, they may be stored so Lupin can deliver messages,
                prevent abuse, investigate reports, and support moderation when
                necessary.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                6. Abuse prevention and legal protection
              </h2>
              <p>
                If Lupin receives a complaint, report, legal request, safety
                concern, or evidence of platform abuse, we may review, preserve,
                or disclose relevant information when reasonably necessary to
                protect users, comply with law, enforce our Terms, defend legal
                claims, or pursue legal remedies.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                7. False information and harmful conduct
              </h2>
              <p>
                Lupin may preserve and use account records, posts, uploaded
                files, messages, timestamps, and technical logs if we believe a
                user has posted false accusations, fabricated evidence,
                defamatory content, harassment, threats, doxxing,
                impersonation, fraud, or other unlawful content.
              </p>

              <p className="mt-3">
                This information may be used for moderation, account suspension,
                cooperation with lawful requests, or legal action.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                8. Third-party services
              </h2>
              <p>
                Lupin may use third-party services such as authentication,
                database hosting, email delivery, payment processing, cloud
                hosting, analytics, and security tools. These services may
                process data according to their own policies.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                9. Sensitive information
              </h2>
              <p>
                Lupin may involve difficult personal stories. You should avoid
                posting private documents, medical records, legal records,
                addresses, phone numbers, financial information, immigration
                records, identity documents, or sensitive information about
                yourself or others unless you fully understand the risk.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                10. Data security
              </h2>
              <p>
                We use reasonable technical measures to protect information, but
                no online service can guarantee perfect security. Use strong
                passwords and protect your own login access.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                11. Data retention
              </h2>
              <p>
                We may retain information as long as needed to operate Lupin,
                comply with legal obligations, resolve disputes, prevent abuse,
                investigate harmful conduct, enforce our Terms, and maintain
                platform integrity.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                12. Your choices
              </h2>
              <p>
                You may choose what to include in your profile and posts. You may
                stop using Lupin at any time. For account or data requests,
                contact us through the Contact page.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-950">
                13. Changes
              </h2>
              <p>
                We may update this Privacy Policy as Lupin develops. Continued
                use of Lupin means you accept the updated policy.
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
