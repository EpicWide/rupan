import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://newlupin.com";
const PAGE_URL = `${SITE_URL}/people/marsalis-smith`;

export const dynamic = "force-static";
export const revalidate = 86400;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title:
    "Marsalis Smith at Shirley Ryan AbilityLab — Public Accountability Record",
  description:
    "A Lupin public accountability record concerning Marsalis Smith, Shirley Ryan AbilityLab, SRALab, workplace retaliation concerns, disability-related concerns, and public dignity.",
  alternates: {
    canonical: PAGE_URL,
  },
  keywords: [
    "Marsalis Smith",
    "Marshalis Smith",
    "Marsalis Smith Shirley Ryan AbilityLab",
    "Marsalis Smith SRALab",
    "Shirley Ryan AbilityLab",
    "SRALab",
    "public accountability record",
    "workplace retaliation concerns",
    "disability-related concerns",
    "public dignity",
    "Lupin",
    "newlupin",
  ],
  openGraph: {
    title:
      "Marsalis Smith at Shirley Ryan AbilityLab — Public Accountability Record",
    description:
      "A Lupin public accountability record concerning Marsalis Smith, Shirley Ryan AbilityLab, SRALab, workplace retaliation concerns, disability-related concerns, and public dignity.",
    url: PAGE_URL,
    siteName: "Lupin",
    type: "article",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title:
      "Marsalis Smith at Shirley Ryan AbilityLab — Public Accountability Record",
    description:
      "A Lupin public accountability record concerning Marsalis Smith, Shirley Ryan AbilityLab, SRALab, workplace retaliation concerns, disability-related concerns, and public dignity.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function MarsalisSmithPublicRecordPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name:
      "Marsalis Smith at Shirley Ryan AbilityLab — Public Accountability Record",
    description:
      "A public accountability record concerning Marsalis Smith, Shirley Ryan AbilityLab, SRALab, workplace retaliation concerns, disability-related concerns, and public dignity.",
    url: PAGE_URL,
    mainEntity: {
      "@type": "Person",
      name: "Marsalis Smith",
      affiliation: {
        "@type": "Organization",
        name: "Shirley Ryan AbilityLab",
        alternateName: "SRALab",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Lupin",
      url: SITE_URL,
    },
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
        <header className="border-b border-black/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-8 text-white sm:px-8">
          <Link
            href="/"
            className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/70 ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Lupin
          </Link>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-white/45">
            Public Accountability Record
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Marsalis Smith at Shirley Ryan AbilityLab
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
            This page is a public-facing index page for materials concerning
            Marsalis Smith, Shirley Ryan AbilityLab, SRALab, workplace
            retaliation concerns, disability-related concerns, and public
            dignity.
          </p>
        </header>

        <section className="space-y-6 px-6 py-7 sm:px-8">
          <section className="rounded-3xl border border-black/10 bg-zinc-50 p-5">
            <h2 className="text-xl font-black tracking-tight">
              Marsalis Smith — Public Record Summary
            </h2>

            <p className="mt-3 text-[15px] leading-7 text-zinc-700">
              This public record concerns Marsalis Smith, Shirley Ryan
              AbilityLab, SRALab, workplace retaliation concerns,
              disability-related concerns, and public accountability. The
              purpose of this page is to organize public-facing discussion and
              records in one searchable location.
            </p>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-5">
            <h2 className="text-lg font-black tracking-tight">
              Search Terms Connected to This Record
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Marsalis Smith",
                "Marshalis Smith",
                "Shirley Ryan AbilityLab",
                "SRALab",
                "workplace retaliation",
                "disability-related concerns",
                "public accountability",
                "Lupin",
              ].map((term) => (
                <span
                  key={term}
                  className="rounded-full border border-black/10 bg-zinc-50 px-3 py-2 text-xs font-black text-zinc-700"
                >
                  {term}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-zinc-950 p-5 text-white">
            <h2 className="text-lg font-black tracking-tight">
              Truthful, Evidence-Based Standard
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/75">
              Lupin is designed for truthful, good-faith, evidence-based public
              records. Avoid false statements, personal threats, private
              information, and unsupported accusations. Use dates, documents,
              direct experiences, and careful language.
            </p>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800"
            >
              Back to Lupin
            </Link>

            <Link
              href="/?q=Marsalis%20Smith"
              className="inline-flex justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:bg-zinc-50"
            >
              Search related posts
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
