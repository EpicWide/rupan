import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://newlupin.com";
const PERSON_NAME = "Marsalis Smith";
const PAGE_URL = `${SITE_URL}/people/marsalis-smith`;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Marsalis Smith at Shirley Ryan AbilityLab | Public Posts | Lupin",
  description:
    "Public Lupin posts mentioning Marsalis Smith, including direct links to each original post, publication dates, authors, and surrounding context.",
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Marsalis Smith at Shirley Ryan AbilityLab | Public Posts | Lupin",
    description:
      "Public Lupin posts mentioning Marsalis Smith, with direct links to each original post.",
    url: PAGE_URL,
    siteName: "Lupin",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Marsalis Smith at Shirley Ryan AbilityLab | Public Posts | Lupin",
    description:
      "Public Lupin posts mentioning Marsalis Smith, with direct links to each original post.",
  },
};

type PostRow = {
  id: string;
  author_id: string;
  author_nickname: string;
  title: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
};

type PostsResult = {
  posts: PostRow[];
  error: string | null;
};

function createSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function cleanText(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeExcerpt(
  value: string | null | undefined,
  maxLength = 320
): string {
  const text = cleanText(value);

  if (!text) {
    return "Open the original post to read the complete content.";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

async function loadMatchingPosts(): Promise<PostsResult> {
  const supabase = createSupabaseServer();

  if (!supabase) {
    return {
      posts: [],
      error:
        "Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase server or anonymous key.",
    };
  }

  const columns =
    "id, author_id, author_nickname, title, body, image_url, created_at";
  const pattern = `%${PERSON_NAME}%`;

  const [titleResult, bodyResult] = await Promise.all([
    supabase
      .from("rupan_posts")
      .select(columns)
      .ilike("title", pattern)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("rupan_posts")
      .select(columns)
      .ilike("body", pattern)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (titleResult.error || bodyResult.error) {
    console.error("Marsalis Smith post lookup failed:", {
      titleError: titleResult.error,
      bodyError: bodyResult.error,
    });

    return {
      posts: [],
      error:
        titleResult.error?.message ||
        bodyResult.error?.message ||
        "The related posts could not be loaded.",
    };
  }

  const unique = new Map<string, PostRow>();

  for (const post of [
    ...((titleResult.data ?? []) as PostRow[]),
    ...((bodyResult.data ?? []) as PostRow[]),
  ]) {
    unique.set(post.id, post);
  }

  const posts = [...unique.values()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    posts,
    error: null,
  };
}

export default async function MarsalisSmithPage() {
  const { posts, error } = await loadMatchingPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Marsalis Smith at Shirley Ryan AbilityLab | Public Posts | Lupin",
    description:
      "A public index of Lupin posts that mention Marsalis Smith.",
    url: PAGE_URL,
    isPartOf: {
      "@type": "WebSite",
      name: "Lupin",
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: cleanText(post.title) || `Post mentioning ${PERSON_NAME}`,
        url: `${SITE_URL}/posts/${encodeURIComponent(post.id)}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-8 text-zinc-950 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto w-full max-w-4xl">
        <header className="overflow-hidden rounded-[1.8rem] border border-black/10 bg-gradient-to-br from-black via-zinc-900 to-zinc-700 px-6 py-7 text-white shadow-sm sm:px-9 sm:py-9">
          <Link
            href="/"
            className="inline-flex rounded-full bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-white/80 ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Lupin
          </Link>

          <p className="mt-5 text-[11px] font-black uppercase tracking-[0.3em] text-white/50">
            Public accountability record
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            Marsalis Smith at Shirley Ryan AbilityLab
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
            This public-facing index organizes Lupin posts that mention Marsalis
            Smith. Each item below links directly to the original post so
            readers and search engines can review its title, date, author, text,
            and surrounding context.
          </p>
        </header>

        <section className="mt-6 rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black tracking-tight">
            Marsalis Smith — Public Record Summary
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-600">
            This page is an index of public material mentioning Marsalis Smith,
            Shirley Ryan AbilityLab, SRALab, workplace-retaliation concerns,
            disability-related concerns, and public accountability. It is
            intended to organize related posts in one searchable location.
          </p>
        </section>

        <section className="mt-5 rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-base font-black">
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

        <section
          className="mt-6"
          aria-labelledby="marsalis-smith-related-posts"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">
                Original Lupin posts
              </p>

              <h2
                id="marsalis-smith-related-posts"
                className="mt-2 text-2xl font-black tracking-tight"
              >
                Posts mentioning Marsalis Smith
              </h2>

              <p className="mt-1 text-sm font-semibold text-zinc-500">
                {posts.length.toLocaleString("en-US")} public{" "}
                {posts.length === 1 ? "post" : "posts"} found
              </p>
            </div>

            <Link
              href="/"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm transition hover:bg-zinc-50"
            >
              View all Lupin posts
            </Link>
          </div>

          {error ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-white p-6 shadow-sm">
              <p className="font-black text-red-700">
                Related posts could not be loaded.
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white/75 p-8 text-center shadow-sm">
              <p className="font-black">No matching posts were found.</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Confirm that the exact text “Marsalis Smith” appears in the
                title or body of at least one public post and that anonymous
                visitors have SELECT access to the rupan_posts table.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post, index) => {
                const postTitle =
                  cleanText(post.title) || "Post mentioning Marsalis Smith";
                const postHref = `/posts/${encodeURIComponent(post.id)}`;

                return (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-[1.4rem] border border-black/10 bg-white shadow-sm"
                  >
                    {index === 0 ? (
                      <div className="border-b border-black/5 bg-zinc-950 px-5 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white/80">
                        Latest matching post
                      </div>
                    ) : null}

                    <div className="px-5 py-5 sm:px-6">
                      <p className="text-xs font-bold text-zinc-400">
                        {cleanText(post.author_nickname) || "Lupin user"} ·{" "}
                        <time dateTime={post.created_at}>
                          {formatDate(post.created_at)}
                        </time>
                      </p>

                      <h3 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl">
                        <Link
                          href={postHref}
                          className="transition hover:text-zinc-600"
                        >
                          {postTitle}
                        </Link>
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-6 text-zinc-700">
                        {makeExcerpt(post.body || post.title)}
                      </p>

                      <Link
                        href={postHref}
                        className="mt-4 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
                      >
                        Read original post
                      </Link>
                    </div>

                    {post.image_url ? (
                      <div className="border-t border-black/5 bg-zinc-100 px-3 py-3 sm:px-5">
                        <img
                          src={post.image_url}
                          alt={postTitle}
                          loading="lazy"
                          className="mx-auto h-auto max-h-[360px] w-full rounded-2xl bg-white object-contain"
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="mt-6 rounded-[1.5rem] bg-zinc-950 p-5 text-white shadow-sm sm:p-7">
          <h2 className="font-black">Truthful, Evidence-Based Standard</h2>

          <p className="mt-3 text-sm leading-7 text-white/75">
            Posts may contain personal accounts, opinions, allegations,
            disputed claims, or references to legal proceedings. Publication
            on Lupin does not by itself establish that a claim is true. Readers
            should review original sources, responses, and official findings
            where available.
          </p>
        </aside>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
          >
            Back to Lupin
          </Link>

          <Link
            href="/?search=Marsalis%20Smith"
            className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black shadow-sm transition hover:bg-zinc-50"
          >
            Search related posts
          </Link>
        </div>
      </div>
    </main>
  );
}
