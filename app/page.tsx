"use client";

import {
  Bell,
  Eye,
  HeartHandshake,
  ImagePlus,
  Loader2,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  Scale,
  Search,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type ReactionType = "cheer_up" | "support_you" | "lawsuit_support";

type Post = {
  id: string;
  author_id: string;
  author_nickname: string;
  title: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
  reactionCounts: Record<ReactionType, number>;
  myReaction: ReactionType | null;
};

type UserState = {
  id: string;
  email: string | null;
  name: string;
};

const BRAND_NAME = "Lupin";
const BRAND_TAGLINE = "a righteous outlaw protecting your dignity";

export default function LupinHomePage() {
  const [user, setUser] = useState<UserState | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [unreadDmCount, setUnreadDmCount] = useState(0);

  const [composerOpen, setComposerOpen] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [dmTarget, setDmTarget] = useState<Post | null>(null);
  const [dmText, setDmText] = useState("");
  const [dmSending, setDmSending] = useState(false);

  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const canPost = useMemo(() => {
    return (
      postTitle.trim().length > 0 &&
      (postText.trim().length > 0 || Boolean(imageFile))
    );
  }, [postTitle, postText, imageFile]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return posts;

    return posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(q) ||
        (post.body || "").toLowerCase().includes(q) ||
        post.author_nickname.toLowerCase().includes(q)
      );
    });
  }, [posts, searchQuery]);

  const getNickname = async (userId: string, fallback: string) => {
    const { data } = await supabaseBrowser
      .from("rupan_profiles")
      .select("nickname")
      .eq("user_id", userId)
      .maybeSingle();

    return data?.nickname || fallback;
  };

  const loadUnreadDmCount = useCallback(async (userId: string) => {
    const { count } = await supabaseBrowser
      .from("rupan_messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .is("read_at", null);

    setUnreadDmCount(count ?? 0);
  }, []);

  const loadPosts = useCallback(async (currentUserId?: string) => {
    setLoadingPosts(true);

    const { data: postRows, error } = await supabaseBrowser
      .from("rupan_posts")
      .select(
        "id, author_id, author_nickname, title, body, image_url, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(80);

    if (error || !postRows) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    const ids = postRows.map((p) => p.id);

    const { data: reactions } = await supabaseBrowser
      .from("rupan_post_reactions")
      .select("post_id, user_id, reaction_type")
      .in(
        "post_id",
        ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]
      );

    const enriched: Post[] = postRows.map((post) => {
      const rows = reactions?.filter((r) => r.post_id === post.id) ?? [];

      const reactionCounts: Record<ReactionType, number> = {
        cheer_up: 0,
        support_you: 0,
        lawsuit_support: 0,
      };

      let myReaction: ReactionType | null = null;

      rows.forEach((r) => {
        const type = r.reaction_type as ReactionType;

        if (type in reactionCounts) {
          reactionCounts[type] += 1;
        }

        if (currentUserId && r.user_id === currentUserId) {
          myReaction = type;
        }
      });

      return {
        ...post,
        reactionCounts,
        myReaction,
      };
    });

    setPosts(enriched);
    setLoadingPosts(false);
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        setUser(null);
        await loadPosts();
        return;
      }

      const fallback =
        sessionUser.user_metadata?.nickname ||
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        sessionUser.email?.split("@")[0] ||
        "Lupin User";

      const nickname = await getNickname(sessionUser.id, fallback);

      setUser({
        id: sessionUser.id,
        email: sessionUser.email ?? null,
        name: nickname,
      });

      await loadUnreadDmCount(sessionUser.id);
      await loadPosts(sessionUser.id);
    } catch {
      setUser(null);
      await loadPosts();
    } finally {
      setAuthLoading(false);
    }
  }, [loadPosts, loadUnreadDmCount]);

  useEffect(() => {
    loadSession();

    const { data } = supabaseBrowser.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user;

        if (!sessionUser) {
          setUser(null);
          setUnreadDmCount(0);
          setAuthLoading(false);
          await loadPosts();
          return;
        }

        const fallback =
          sessionUser.user_metadata?.nickname ||
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.name ||
          sessionUser.email?.split("@")[0] ||
          "Lupin User";

        const nickname = await getNickname(sessionUser.id, fallback);

        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? null,
          name: nickname,
        });

        await loadUnreadDmCount(sessionUser.id);
        await loadPosts(sessionUser.id);
        setAuthLoading(false);
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadSession, loadPosts, loadUnreadDmCount]);

  useEffect(() => {
    let alive = true;

    const countVisitor = async () => {
      try {
        const res = await fetch("/api/rupan/visitors", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();

        if (!alive) return;

        if (!res.ok) {
          console.error("Visitor count failed:", json);
          setVisitorCount(null);
          return;
        }

        if (typeof json.total === "number") {
          setVisitorCount(json.total);
        } else {
          setVisitorCount(null);
        }
      } catch (error) {
        console.error("Visitor count request failed:", error);
        if (alive) setVisitorCount(null);
      }
    };

    countVisitor();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!composerOpen && !dmOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setComposerOpen(false);
        setDmOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [composerOpen, dmOpen]);

  const resetComposer = () => {
    setPostTitle("");
    setPostText("");
    setMessage("");
    setImageFile(null);

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage("");

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setMessage("The image is too large. Please upload a file under 6MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File, userId: string) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabaseBrowser.storage
      .from("rupan-post-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabaseBrowser.storage
      .from("rupan-post-images")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please log in or sign up before publishing.");
      return;
    }

    if (!canPost) {
      setMessage("Please add a title and either content or a photo.");
      return;
    }

    try {
      setPosting(true);

      let imageUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, user.id);
      }

      const { error } = await supabaseBrowser.from("rupan_posts").insert({
        author_id: user.id,
        author_nickname: user.name,
        title: postTitle.trim(),
        body: postText.trim() || null,
        image_url: imageUrl,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      resetComposer();
      setComposerOpen(false);
      await loadPosts(user.id);
    } catch {
      setMessage("Failed to publish the post.");
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (post: Post, reactionType: ReactionType) => {
    if (!user) {
      alert("Please log in or sign up first.");
      return;
    }

    if (post.author_id === user.id) {
      alert("You cannot react to your own post.");
      return;
    }

    const { error } = await supabaseBrowser.from("rupan_post_reactions").upsert(
      {
        post_id: post.id,
        user_id: user.id,
        reaction_type: reactionType,
      },
      {
        onConflict: "post_id,user_id",
      }
    );

    if (error) {
      alert(error.message);
      return;
    }

    await loadPosts(user.id);
  };

  const openDm = (post: Post) => {
    if (!user) {
      alert("Please log in or sign up first.");
      return;
    }

    if (post.author_id === user.id) {
      alert("You cannot message yourself.");
      return;
    }

    setDmTarget(post);
    setDmText("");
    setDmOpen(true);
  };

  const sendDm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !dmTarget || !dmText.trim()) return;

    try {
      setDmSending(true);

      const { error } = await supabaseBrowser.from("rupan_messages").insert({
        sender_id: user.id,
        recipient_id: dmTarget.author_id,
        sender_nickname: user.name,
        recipient_nickname: dmTarget.author_nickname,
        body: dmText.trim(),
      });

      if (error) {
        alert(error.message);
        return;
      }

      setDmOpen(false);
      setDmText("");
      setDmTarget(null);
    } finally {
      setDmSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await supabaseBrowser.auth.signOut();
      setUser(null);
      setUnreadDmCount(0);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-zinc-950">
      <Header
        user={user}
        authLoading={authLoading}
        logoutLoading={logoutLoading}
        unreadDmCount={unreadDmCount}
        onLogout={handleLogout}
      />

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-black text-zinc-700 shadow-sm">
            <Eye size={15} />
            <span>Visitors</span>
            <span className="text-zinc-950">
              {visitorCount === null ? "—" : visitorCount.toLocaleString()}
            </span>
          </div>

          {user && (
            <Link
              href="/profile"
              className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-zinc-700 shadow-sm transition hover:bg-zinc-50 sm:hidden"
            >
              Profile
            </Link>
          )}
        </div>

        <section className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-black via-zinc-900 to-zinc-700 px-5 py-4 text-white sm:px-6 sm:py-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
              {BRAND_NAME}
            </p>

            <p className="max-w-3xl text-sm leading-7 text-white/85">
              The law may not compensate what you lost. Your boss may be an
              asshole. HR may be a deeply unfair group. This is a space to
              protect your life when the people hurting you may be the last ones
              you expected.
            </p>

            <div className="mt-3">
              {user ? (
                <div className="inline-flex max-w-full items-center rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/85 ring-1 ring-white/15">
                  Logged in as&nbsp;
                  <span className="truncate font-black text-white">
                    {user.name}
                  </span>
                </div>
              ) : (
                <div className="inline-flex max-w-full items-center rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/85 ring-1 ring-white/15">
                  Log in or sign up to publish.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="sticky top-[4.75rem] z-20 rounded-[1.5rem] border border-black/10 bg-[#f7f4ef]/85 p-2 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3 rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-zinc-950">
            <Search size={18} className="shrink-0 text-zinc-400" />

            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories, authors, or keywords"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-zinc-400"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </section>

        <section className="space-y-4">
          {loadingPosts ? (
            <div className="rounded-[2rem] border border-black/10 bg-white p-10 text-center shadow-sm">
              <Loader2 className="mx-auto animate-spin text-zinc-400" />
              <p className="mt-3 text-sm font-bold text-zinc-500">
                Loading posts...
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/70 p-10 text-center">
              <p className="text-base font-black text-zinc-600">
                No posts found.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Try another keyword or tap the + button to publish.
              </p>
            </div>
          ) : (
            filteredPosts.map((post, index) => (
              <article
                key={post.id}
                className={`overflow-hidden rounded-[2rem] border bg-white shadow-sm transition ${
                  index === 0
                    ? "border-zinc-950/15 ring-1 ring-zinc-950/5"
                    : "border-black/10 hover:border-black/15"
                }`}
              >
                {index === 0 && (
                  <div className="border-b border-black/5 bg-zinc-950 px-5 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-white/80">
                    Latest published
                  </div>
                )}

                <div className="px-5 py-5 sm:px-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-black text-white shadow-sm">
                      {post.author_nickname.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {post.author_nickname}
                      </p>
                      <p className="text-xs font-medium text-zinc-400">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight text-zinc-950">
                    {post.title}
                  </h3>

                  {post.body && (
                    <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-zinc-700">
                      {post.body}
                    </p>
                  )}
                </div>

                {post.image_url && (
                  <div className="border-y border-black/5 bg-zinc-100 px-3 py-3 sm:px-5 sm:py-4">
                    <div className="flex justify-center overflow-hidden rounded-2xl bg-white">
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        width={1000}
                        height={700}
                        className="h-auto max-h-[320px] w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t border-black/10 bg-zinc-50/70 px-4 py-4">
                  <div className="grid gap-2 sm:grid-cols-4">
                    <ReactionButton
                      label="Stay strong"
                      count={post.reactionCounts.cheer_up}
                      active={post.myReaction === "cheer_up"}
                      onClick={() => handleReaction(post, "cheer_up")}
                    />

                    <ReactionButton
                      label="I support you"
                      count={post.reactionCounts.support_you}
                      active={post.myReaction === "support_you"}
                      onClick={() => handleReaction(post, "support_you")}
                    />

                    <ReactionButton
                      label="Support lawsuit"
                      count={post.reactionCounts.lawsuit_support}
                      active={post.myReaction === "lawsuit_support"}
                      onClick={() => handleReaction(post, "lawsuit_support")}
                    />

                    <button
                      type="button"
                      onClick={() => openDm(post)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-black shadow-sm transition hover:bg-zinc-50"
                    >
                      <MessageCircle size={17} />
                      Message
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </section>

      <FloatingComposeButton onClick={() => setComposerOpen(true)} />

      {composerOpen && (
        <ComposerModal
          user={user}
          posting={posting}
          postTitle={postTitle}
          postText={postText}
          imagePreview={imagePreview}
          message={message}
          canPost={canPost}
          onClose={() => setComposerOpen(false)}
          onSubmit={handleSubmit}
          onTitleChange={setPostTitle}
          onTextChange={setPostText}
          onImageChange={handleImageChange}
          onRemoveImage={() => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
            setImageFile(null);
          }}
          onMessageClear={() => setMessage("")}
        />
      )}

      {dmOpen && dmTarget && (
        <DmModal
          targetName={dmTarget.author_nickname}
          text={dmText}
          sending={dmSending}
          onTextChange={setDmText}
          onClose={() => setDmOpen(false)}
          onSubmit={sendDm}
        />
      )}

      <Footer />
    </main>
  );
}

function ReactionButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const lawsuit = label.toLowerCase().includes("lawsuit");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black shadow-sm transition ${
        active
          ? "bg-zinc-950 text-white"
          : "border border-black/10 bg-white text-zinc-950 hover:bg-zinc-50"
      }`}
    >
      {lawsuit ? <Scale size={17} /> : <HeartHandshake size={17} />}
      <span className="text-center leading-tight">{label}</span>
      <span className={active ? "text-white/80" : "text-zinc-400"}>
        {count}
      </span>
    </button>
  );
}

function Header({
  user,
  authLoading,
  logoutLoading,
  unreadDmCount,
  onLogout,
}: {
  user: UserState | null;
  authLoading: boolean;
  logoutLoading: boolean;
  unreadDmCount: number;
  onLogout: () => Promise<void>;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f4ef]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-black text-white shadow-sm">
            L
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-lg font-black tracking-tight">
              Lupin
            </p>
            <p className="hidden text-xs font-semibold text-zinc-500 sm:block">
              Lupin — a righteous outlaw protecting your dignity.
            </p>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-900 shadow-sm sm:flex"
          >
            <Bell size={18} />
          </button>

          {user && (
            <Link
              href="/dm"
              aria-label="Direct messages"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-900 shadow-sm transition hover:bg-zinc-50"
            >
              <MessageCircle size={18} />
              {unreadDmCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-black text-white">
                  {unreadDmCount > 9 ? "9+" : unreadDmCount}
                </span>
              )}
            </Link>
          )}

          {authLoading ? (
            <div className="flex h-10 w-24 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : !user ? (
            <>
              <Link
                href="/signup"
                className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm transition hover:bg-zinc-50 sm:flex"
              >
                <UserPlus size={16} />
                Sign up
              </Link>

              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800"
              >
                <LogIn size={16} />
                Log in
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="hidden items-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm transition hover:bg-zinc-50 sm:flex"
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={onLogout}
                disabled={logoutLoading}
                className="flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {logoutLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}
                <span className="hidden sm:inline">Log out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function ComposerModal({
  user,
  posting,
  postTitle,
  postText,
  imagePreview,
  message,
  canPost,
  onClose,
  onSubmit,
  onTitleChange,
  onTextChange,
  onImageChange,
  onRemoveImage,
  onMessageClear,
}: {
  user: UserState | null;
  posting: boolean;
  postTitle: string;
  postText: string;
  imagePreview: string | null;
  message: string;
  canPost: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onTitleChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onMessageClear: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="w-full rounded-t-[2rem] border border-black/10 bg-white shadow-2xl sm:max-w-2xl sm:rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-lg font-black tracking-tight">
              Publish a post
            </h3>
            <p className="mt-1 text-xs font-medium text-zinc-500">
              Add a title, your story, and an optional photo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-700 shadow-sm"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 px-5 py-5 sm:px-6 sm:py-6"
        >
          {!user && (
            <div className="rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
              Please log in or sign up before publishing.
            </div>
          )}

          <input
            type="text"
            value={postTitle}
            onChange={(e) => {
              onTitleChange(e.target.value);
              onMessageClear();
            }}
            placeholder="Title"
            maxLength={120}
            className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:bg-white"
          />

          <textarea
            value={postText}
            onChange={(e) => {
              onTextChange(e.target.value);
              onMessageClear();
            }}
            placeholder="What happened?"
            maxLength={3000}
            className="min-h-40 w-full resize-none rounded-3xl border border-black/10 bg-zinc-50 px-4 py-4 text-sm leading-7 outline-none focus:border-zinc-900 focus:bg-white"
          />

          {imagePreview && (
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-zinc-100 p-3">
              <Image
                src={imagePreview}
                alt="Uploaded preview"
                width={1000}
                height={700}
                className="max-h-[280px] w-full object-contain"
              />

              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white"
              >
                <X size={14} />
                Remove
              </button>
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black shadow-sm">
              <ImagePlus size={18} />
              Upload photo
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black shadow-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canPost || posting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {posting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
                Publish
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function DmModal({
  targetName,
  text,
  sending,
  onTextChange,
  onClose,
  onSubmit,
}: {
  targetName: string;
  text: string;
  sending: boolean;
  onTextChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <form
        onSubmit={onSubmit}
        className="w-full rounded-t-[2rem] border border-black/10 bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-[2rem] sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black">Send message</h3>
            <p className="mt-1 text-sm text-zinc-500">To {targetName}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white"
          >
            <X size={18} />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Write a private message..."
          maxLength={1000}
          className="min-h-36 w-full resize-none rounded-3xl border border-black/10 bg-zinc-50 px-4 py-4 text-sm leading-7 outline-none focus:border-zinc-900 focus:bg-white"
        />

        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white disabled:bg-zinc-300"
        >
          {sending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Send size={17} />
          )}
          Send
        </button>
      </form>
    </div>
  );
}

function FloatingComposeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Create post"
      className="fixed bottom-5 right-5 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-950 text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition hover:scale-[1.03] hover:bg-zinc-800 active:scale-[0.98]"
    >
      <Plus size={28} />
    </button>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-black/10 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-sm font-black text-white">
            L
          </div>

          <div>
            <p className="font-black">Lupin</p>
            <p className="text-xs font-semibold text-zinc-500">
              Lupin — a righteous outlaw protecting your dignity.
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-zinc-600">
          <Link href="/about" className="hover:text-zinc-950">
            About
          </Link>
          <Link href="/terms" className="hover:text-zinc-950">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-zinc-950">
            Privacy
          </Link>
          <Link href="/donate" className="hover:text-zinc-950">
            Donate
          </Link>
          <Link href="/contact" className="hover:text-zinc-950">
            Contact
          </Link>
        </nav>

        <p className="text-xs text-zinc-400">
          © {new Date().getFullYear()} Lupin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
