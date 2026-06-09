"use client";

import {
  Bell,
  Eye,
  ImagePlus,
  Loader2,
  LogIn,
  LogOut,
  Plus,
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

type Post = {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  authorName: string;
};

type UserState = {
  id: string;
  email: string | null;
  name: string;
};

export default function RupanHomePage() {
  const [user, setUser] = useState<UserState | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  const [composerOpen, setComposerOpen] = useState(false);

  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);

  const canPost = useMemo(() => {
    return (
      postTitle.trim().length > 0 &&
      (postText.trim().length > 0 || Boolean(imagePreview))
    );
  }, [postTitle, postText, imagePreview]);

  const loadSession = useCallback(async () => {
    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        setUser(null);
        return;
      }

      setUser({
        id: sessionUser.id,
        email: sessionUser.email ?? null,
        name:
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.name ||
          sessionUser.email?.split("@")[0] ||
          "Rupan User",
      });
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();

    const { data } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user;

        if (!sessionUser) {
          setUser(null);
          setAuthLoading(false);
          return;
        }

        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? null,
          name:
            sessionUser.user_metadata?.full_name ||
            sessionUser.user_metadata?.name ||
            sessionUser.email?.split("@")[0] ||
            "Rupan User",
        });

        setAuthLoading(false);
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadSession]);

  useEffect(() => {
    const countVisitor = async () => {
      try {
        const alreadyCounted =
          typeof window !== "undefined"
            ? sessionStorage.getItem("rupan_visitor_counted")
            : null;

        const res = await fetch("/api/rupan/visitors", {
          method: alreadyCounted ? "GET" : "POST",
          cache: "no-store",
        });

        if (!res.ok) {
          setVisitorCount(null);
          return;
        }

        const json = await res.json();

        if (typeof json.total === "number") {
          setVisitorCount(json.total);
        }

        if (!alreadyCounted && typeof window !== "undefined") {
          sessionStorage.setItem("rupan_visitor_counted", "true");
        }
      } catch {
        setVisitorCount(null);
      }
    };

    countVisitor();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setComposerOpen(false);
      }
    };

    if (composerOpen) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [composerOpen]);

  const resetComposer = () => {
    setPostTitle("");
    setPostText("");
    setMessage("");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const openComposer = () => {
    setMessage("");
    setComposerOpen(true);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setMessage("");
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage("");

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      event.target.value = "";
      return;
    }

    const maxSizeMb = 8;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setMessage(`Image is too large. Please upload under ${maxSizeMb}MB.`);
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please login or sign up before publishing.");
      return;
    }

    if (!postTitle.trim()) {
      setMessage("Please add a title.");
      return;
    }

    if (!postText.trim() && !imagePreview) {
      setMessage("Please add content or upload a photo.");
      return;
    }

    try {
      setPosting(true);

      const newPost: Post = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now()),
        title: postTitle.trim(),
        text: postText.trim(),
        imageUrl: imagePreview || undefined,
        createdAt: new Date().toLocaleString(),
        authorName: user.name,
      };

      setPosts((prev) => [newPost, ...prev]);
      resetComposer();
      setComposerOpen(false);
    } catch {
      setMessage("Failed to publish post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await supabaseBrowser.auth.signOut();
      setUser(null);
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
        onLogout={handleLogout}
      />

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex items-center justify-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-black text-zinc-700 shadow-sm backdrop-blur">
            <Eye size={15} />
            <span>Visitors</span>
            <span className="text-zinc-950">
              {visitorCount === null ? "—" : visitorCount.toLocaleString()}
            </span>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-black via-zinc-900 to-zinc-700 px-5 py-5 text-white sm:px-7 sm:py-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
              Rupan
            </p>

            <p className="max-w-3xl text-sm leading-7 text-white/80 sm:text-[15px]">
              The law may not compensate what you lost. Your boss may be an
              asshole. HR may be a deeply unfair group. This is a space to
              protect your life when the people hurting you may be the last ones
              you expected.
            </p>

            <div className="mt-4">
              {user ? (
                <div className="inline-flex max-w-full items-center rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/85 ring-1 ring-white/15">
                  Logged in as&nbsp;
                  <span className="truncate font-black text-white">
                    {user.name}
                  </span>
                </div>
              ) : (
                <div className="inline-flex max-w-full items-center rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/85 ring-1 ring-white/15">
                  Login or sign up to publish.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl">
              Published posts
            </h2>
            <p className="mt-1 text-sm font-medium text-zinc-500">
              The newest published posts appear first.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/70 p-10 text-center">
              <p className="text-base font-black text-zinc-600">
                No published posts yet.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Tap the + button to publish the first Rupan post.
              </p>
            </div>
          ) : (
            posts.map((post, index) => (
              <article
                key={post.id}
                className={`overflow-hidden rounded-[2rem] border bg-white shadow-sm ${
                  index === 0
                    ? "border-zinc-950/15 ring-1 ring-zinc-950/5"
                    : "border-black/10"
                }`}
              >
                {index === 0 && (
                  <div className="border-b border-black/5 bg-zinc-950 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-white/80">
                    Latest published
                  </div>
                )}

                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-black text-white">
                    {post.authorName.slice(0, 1).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {post.authorName}
                    </p>
                    <p className="text-xs text-zinc-500">{post.createdAt}</p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <h3 className="text-xl font-black tracking-tight text-zinc-950">
                    {post.title}
                  </h3>

                  {post.text && (
                    <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-zinc-700">
                      {post.text}
                    </p>
                  )}
                </div>

                {post.imageUrl && (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={1400}
                    height={900}
                    className="w-full object-cover"
                  />
                )}
              </article>
            ))
          )}
        </section>
      </section>

      <FloatingComposeButton onClick={openComposer} />

      {composerOpen && (
        <ComposerModal
          user={user}
          posting={posting}
          postTitle={postTitle}
          postText={postText}
          imagePreview={imagePreview}
          message={message}
          canPost={canPost}
          onClose={closeComposer}
          onSubmit={handleSubmit}
          onTitleChange={setPostTitle}
          onTextChange={setPostText}
          onImageChange={handleImageChange}
          onRemoveImage={removeImage}
          onMessageClear={() => setMessage("")}
        />
      )}

      <Footer />
    </main>
  );
}

function Header({
  user,
  authLoading,
  logoutLoading,
  onLogout,
}: {
  user: UserState | null;
  authLoading: boolean;
  logoutLoading: boolean;
  onLogout: () => Promise<void>;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f4ef]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-black text-white shadow-sm">
            R
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-lg font-black tracking-tight">Rupan</p>
            <p className="hidden text-xs font-semibold text-zinc-500 sm:block">
              Simple social page
            </p>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-900 shadow-sm transition hover:bg-zinc-50"
          >
            <Bell size={18} />
          </button>

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
                Login
              </Link>
            </>
          ) : (
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
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </button>
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
          {!user && (
            <div className="rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
              Please login or sign up before publishing.
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-black">Title</span>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => {
                onTitleChange(e.target.value);
                onMessageClear();
              }}
              placeholder="Write a strong title"
              maxLength={120}
              className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black">Story</span>
            <textarea
              value={postText}
              onChange={(e) => {
                onTextChange(e.target.value);
                onMessageClear();
              }}
              placeholder="What happened?"
              maxLength={3000}
              className="min-h-40 w-full resize-none rounded-3xl border border-black/10 bg-zinc-50 px-4 py-4 text-sm leading-7 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
            />
          </label>

          <div className="flex items-center justify-between px-1 text-xs font-bold text-zinc-400">
            <span>{postText.length}/3000</span>
            <span>{postTitle.length}/120 title</span>
          </div>

          {imagePreview && (
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-zinc-100">
              <Image
                src={imagePreview}
                alt="Uploaded preview"
                width={1200}
                height={800}
                className="max-h-[420px] w-full object-cover"
              />

              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white backdrop-blur transition hover:bg-black"
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
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black shadow-sm transition hover:bg-zinc-50">
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
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black shadow-sm transition hover:bg-zinc-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canPost || posting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
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
            R
          </div>
          <p className="font-black">Rupan</p>
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
          © {new Date().getFullYear()} Rupan. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
