import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = "https://newlupin.com";

type PostRow = {
  id: string;
  author_id: string;
  author_nickname: string;
  title: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function createSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!supabaseKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function cleanText(value: string | null | undefined) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function makeDescription(post: PostRow) {
  const text = cleanText(post.body || post.title);

  if (!text) {
    return "A public Lupin post about dignity, unfair treatment, and support.";
  }

  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
}

async function getPost(id: string) {
  if (!id || id.length > 80) return null;

  try {
    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from("rupan_posts")
      .select("id, author_id, author_nickname, title, body, image_url, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return data as PostRow;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: "Post not found | Lupin",
      description: "This Lupin post could not be found.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${post.title} | Lupin`;
  const description = makeDescription(post);
  const url = `${SITE_URL}/posts/${post.id}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Lupin",
      type: "article",
      publishedTime: post.created_at,
      authors: [post.author_nickname || "Lupin"],
      images: post.image_url
        ? [
            {
              url: post.image_url,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: post.image_url ? "summary_large_image" : "summary",
      title,
      description,
      images: post.image_url ? [post.image_url] : undefined,
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
}

export default async function PublicPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const url = `${SITE_URL}/posts/${post.id}`;
  const description = makeDescription(post);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: {
      "@type": "Person",
      name: post.author_nickname || "Lupin user",
    },
    publisher: {
      "@type": "Organization",
      name: "Lupin",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: post.image_url ? [post.image_url] : undefined,
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
        <header className="border-b border-black/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-7 text-white sm:px-8">
          <Link
            href="/"
            className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/70 ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Lupin
          </Link>

          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-white/60">
            <span>{post.author_nickname || "Lupin user"}</span>
            <span>•</span>
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </time>
          </div>
        </header>

        {post.image_url && (
          <div className="border-b border-black/10 bg-zinc-100 p-3 sm:p-5">
            <div className="overflow-hidden rounded-2xl bg-white">
              <Image
                src={post.image_url}
                alt={post.title}
                width={1200}
                height={800}
                className="h-auto max-h-[520px] w-full object-contain"
                priority
              />
            </div>
          </div>
        )}

        <section className="px-6 py-7 sm:px-8">
          {post.body ? (
            <p className="whitespace-pre-wrap text-[16px] leading-7 text-zinc-700">
              {post.body}
            </p>
          ) : (
            <p className="text-[16px] leading-7 text-zinc-500">
              No additional body text was provided.
            </p>
          )}

          <div className="mt-8 rounded-3xl border border-black/10 bg-zinc-50 p-5">
            <p className="text-sm font-black text-zinc-950">
              What would you do?
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              This post is shared on Lupin so people can read, reflect, and
              support dignity in difficult situations.
            </p>

            <Link
              href="/"
              className="mt-4 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800"
            >
              Back to Lupin
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
