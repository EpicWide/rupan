import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://newlupin.com";
const PERSON_NAME = "James Patton";
const PERSON_SLUG = "james-patton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `${PERSON_NAME} — Public Posts | Lupin`,
  description:
    `Public Lupin posts mentioning ${PERSON_NAME}. Read the original posts, dates, and context. Allegations and disputed accounts are not established facts unless supported by an official finding.`,
  alternates: {
    canonical: `${SITE_URL}/${PERSON_SLUG}`,
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
    title: `${PERSON_NAME} — Public Posts | Lupin`,
    description:
      `Public Lupin posts mentioning ${PERSON_NAME}, presented with links to the original posts and relevant context.`,
    url: `${SITE_URL}/${PERSON_SLUG}`,
    siteName: "Lupin",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${PERSON_NAME} — Public Posts | Lupin`,
    description:
      `Public Lupin posts mentioning ${PERSON_NAME}, with links to the original posts.`,
  },
};

type PostRow = {
  id: string;
  author_nickname: string | null;
  title: string | null;
  body: string | null;
  image_url: string | null;
  created_at: string | null;
};

type LoadResult = {
  posts: PostRow[];
  error: string | null;
};

function getSupabaseServerClient() {
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

function makeExcerpt(value: string | null | undefined, maxLength = 260): string {
  const text = cleanText(value);

  if (!text) {
    return "Open the original Lupin post to read the full content.";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Date unavailable";
  }

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

async function loadPosts(): Promise<LoadResult> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      posts: [],
      error:
        "Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase server or anonymous key.",
    };
  }

  const columns =
    "id, author_nickname, title, body, image_url, created_at";
  const searchPattern = `%${PERSON_NAME}%`;

  const [titleResult, bodyResult] = await Promise.all([
    supabase
      .from("rupan_posts")
      .select(columns)
      .ilike("title", searchPattern)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("rupan_posts")
      .select(columns)
      .ilike("body", searchPattern)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const errors = [titleResult.error, bodyResult.error].filter(Boolean);

  if (errors.length > 0) {
    console.error(`[${PERSON_SLUG}] Supabase post query failed`, errors);

    return {
      posts: [],
      error:
        "The public posts could not be loaded. Check the rupan_posts table, column names, and Supabase RLS policy.",
    };
  }

  const uniquePosts = new Map<string, PostRow>();

  for (const post of [
    ...((titleResult.data ?? []) as PostRow[]),
    ...((bodyResult.data ?? []) as PostRow[]),
  ]) {
    uniquePosts.set(post.id, post);
  }

  const posts = Array.from(uniquePosts.values()).sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  return {
    posts,
    error: null,
  };
}

export default async function PersonPage() {
  const { posts, error } = await loadPosts();
  const canonicalUrl = `${SITE_URL}/${PERSON_SLUG}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${PERSON_NAME} — Public Posts | Lupin`,
    description:
      `A collection of public Lupin posts that mention ${PERSON_NAME}.`,
    url: canonicalUrl,
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
        name: post.title || `Post mentioning ${PERSON_NAME}`,
        url: `${SITE_URL}/posts/${encodeURIComponent(post.id)}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="min-h-screen bg-[#f6f3ed] px-4 py-8 text-zinc-950 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-zinc-500"
          >
            <Link href="/" className="transition hover:text-zinc-950">
              Lupin
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-950">{PERSON_NAME}</span>
          </nav>

          <header className="rounded-[2rem] bg-zinc-950 px-6 py-8 text-white shadow-sm sm:px-10 sm:py-11">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/55">
              Public posts
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              {PERSON_NAME}
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
              This page collects public Lupin posts that mention {PERSON_NAME}.
              Posts may contain firsthand accounts, allegations, disputed
              claims, opinions, or references to legal proceedings. Publication
              on Lupin does not by itself establish that a claim is true.
            </p>
          </header>

          <section aria-labelledby="posts-heading" className="mt-7">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="posts-heading" className="text-2xl font-black tracking-tight">
                  Posts mentioning {PERSON_NAME}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {posts.length.toLocaleString("en-US")} public{" "}
                  {posts.length === 1 ? "post" : "posts"} found
                </p>
              </div>

              <Link
                href="/"
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm transition hover:bg-zinc-50"
              >
                View all posts
              </Link>
            </div>

            {error ? (
              <div className="rounded-[1.5rem] border border-amber-300 bg-amber-50 p-6 text-sm leading-6 text-amber-950 shadow-sm">
                <p className="font-black">Posts are temporarily unavailable.</p>
                <p className="mt-2">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white p-8 text-center shadow-sm">
                <p className="font-black">No matching public posts were found.</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Confirm that the full name “{PERSON_NAME}” appears in the
                  title or body and that anonymous visitors can read the row
                  through Supabase RLS.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const postTitle =
                    cleanText(post.title) || `Post mentioning ${PERSON_NAME}`;
                  const postHref = `/posts/${encodeURIComponent(post.id)}`;

                  return (
                    <article
                      key={post.id}
                      className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-sm"
                    >
                      <div className="p-5 sm:p-7">
                        <p className="text-xs font-bold text-zinc-400">
                          {cleanText(post.author_nickname) || "Lupin user"} ·{" "}
                          <time dateTime={post.created_at ?? undefined}>
                            {formatDate(post.created_at)}
                          </time>
                        </p>

                        <h3 className="mt-3 text-2xl font-black leading-tight tracking-tight">
                          <Link
                            href={postHref}
                            className="transition hover:text-zinc-600"
                          >
                            {postTitle}
                          </Link>
                        </h3>

                        <p className="mt-3 text-[15px] leading-7 text-zinc-700">
                          {makeExcerpt(post.body || post.title)}
                        </p>

                        <Link
                          href={postHref}
                          className="mt-5 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
                        >
                          Read the original post
                        </Link>
                      </div>

                      {post.image_url ? (
                        <div className="border-t border-black/5 bg-zinc-100 p-3 sm:p-5">
                          {/* A normal img tag avoids requiring next.config remote image domains. */}
                          <img
                            src={post.image_url}
                            alt={`Image attached to “${postTitle}”`}
                            loading="lazy"
                            className="mx-auto h-auto max-h-[460px] w-full rounded-2xl bg-white object-contain"
                          />
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="mt-8 rounded-[1.5rem] border border-black/10 bg-white p-5 text-sm leading-6 text-zinc-600 shadow-sm sm:p-7">
            <h2 className="font-black text-zinc-950">
              Accuracy, fairness, and context
            </h2>
            <p className="mt-2">
              Readers should review the original material, sources, responses,
              and procedural outcomes. Allegations and disputed accounts should
              not be described as established facts unless an authoritative
              finding supports that conclusion.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
