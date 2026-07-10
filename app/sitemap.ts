import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SITE_URL = "https://newlupin.com";

type PostSitemapRow = {
  id: string;
  created_at: string;
};

function createSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/donate`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const supabase = createSupabaseServer();

    if (!supabase) return staticRoutes;

    const { data, error } = await supabase
      .from("rupan_posts")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error || !data) return staticRoutes;

    const postRoutes: MetadataRoute.Sitemap = (data as PostSitemapRow[]).map(
      (post) => ({
        url: `${SITE_URL}/posts/${post.id}`,
        lastModified: new Date(post.created_at),
        changeFrequency: "weekly",
        priority: 0.75,
      })
    );

    return [...staticRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
