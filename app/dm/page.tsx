"use client";

import {
  ArrowLeft,
  Inbox,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type UserState = {
  id: string;
  name: string;
};

type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_nickname: string;
  recipient_nickname: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export default function DmPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserState | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [replyTo, setReplyTo] = useState<MessageRow | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [messages]);

  const unreadCount = useMemo(() => {
    if (!user) return 0;

    return messages.filter(
      (msg) => msg.recipient_id === user.id && !msg.read_at
    ).length;
  }, [messages, user]);

  const getNickname = async (userId: string, fallback: string) => {
    const { data } = await supabaseBrowser
      .from("rupan_profiles")
      .select("nickname")
      .eq("user_id", userId)
      .maybeSingle();

    return data?.nickname || fallback;
  };

  const loadMessages = async (markRead = true) => {
    setNotice("");

    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const sessionUser = sessionData.session?.user;

      if (!sessionUser) {
        router.replace("/login");
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
        name: nickname,
      });

      const { data, error } = await supabaseBrowser
        .from("rupan_messages")
        .select(
          "id, sender_id, recipient_id, sender_nickname, recipient_nickname, body, read_at, created_at"
        )
        .or(`sender_id.eq.${sessionUser.id},recipient_id.eq.${sessionUser.id}`)
        .order("created_at", { ascending: false })
        .limit(120);

      if (error) {
        setNotice(error.message);
        setMessages([]);
        return;
      }

      setMessages(data ?? []);

      if (markRead) {
        await supabaseBrowser
          .from("rupan_messages")
          .update({ read_at: new Date().toISOString() })
          .eq("recipient_id", sessionUser.id)
          .is("read_at", null);
      }
    } catch {
      setNotice("Failed to load direct messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMessages(true);
  }, []);

  useEffect(() => {
    if (!replyTo) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setReplyTo(null);
        setReplyText("");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [replyTo]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages(false);
  };

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");

    if (!user || !replyTo || !replyText.trim()) return;

    const recipientId =
      replyTo.sender_id === user.id ? replyTo.recipient_id : replyTo.sender_id;

    const recipientNickname =
      replyTo.sender_id === user.id
        ? replyTo.recipient_nickname
        : replyTo.sender_nickname;

    try {
      setSending(true);

      const { error } = await supabaseBrowser.from("rupan_messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        sender_nickname: user.name,
        recipient_nickname: recipientNickname,
        body: replyText.trim(),
      });

      if (error) {
        setNotice(error.message);
        return;
      }

      setReplyText("");
      setReplyTo(null);
      await loadMessages(false);
    } catch {
      setNotice("Failed to send your reply.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-4">
        <div className="rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl font-black text-white">
            L
          </div>
          <Loader2 className="mx-auto animate-spin text-zinc-500" size={24} />
          <p className="mt-4 text-sm font-bold text-zinc-500">
            Loading messages...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm transition hover:bg-zinc-50"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:bg-zinc-400"
          >
            {refreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-7 text-white">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <MessageCircle size={24} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
              Lupin
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Direct messages
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/75">
              Private conversations between Lupin users.
            </p>

            <div className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/85 ring-1 ring-white/15">
              {unreadCount > 0
                ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                : "No unread messages"}
            </div>
          </div>

          <div className="border-t border-black/10 bg-zinc-50 p-5">
            <div className="flex gap-3 rounded-[1.5rem] border border-black/10 bg-white p-4">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-zinc-500"
              />
              <p className="text-sm leading-6 text-zinc-600">
                Use direct messages responsibly. Do not send threats,
                harassment, false accusations, private information about others,
                or unlawful content. Lupin may preserve records and take action
                when necessary.
              </p>
            </div>
          </div>
        </div>

        {notice && (
          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold text-zinc-700 shadow-sm">
            {notice}
          </div>
        )}

        {sortedMessages.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/70 p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
              <Inbox size={24} />
            </div>
            <p className="font-black text-zinc-700">No messages yet.</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              When another user sends you a private message, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMessages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              const counterpart = isMine
                ? msg.recipient_nickname
                : msg.sender_nickname;

              return (
                <article
                  key={msg.id}
                  className={`rounded-[2rem] border bg-white p-5 shadow-sm ${
                    isMine
                      ? "border-black/10"
                      : "border-zinc-950/15 ring-1 ring-zinc-950/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {isMine ? `To ${counterpart}` : `From ${counterpart}`}
                      </p>

                      <p className="mt-1 text-xs font-medium text-zinc-400">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(msg);
                        setReplyText("");
                        setNotice("");
                      }}
                      className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black shadow-sm transition hover:bg-zinc-50"
                    >
                      Reply
                    </button>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
                    {msg.body}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {replyTo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
          <form
            onSubmit={sendReply}
            className="w-full rounded-t-[2rem] border border-black/10 bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-[2rem] sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Reply</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Write a private response.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setReplyText("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-700 shadow-sm"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              maxLength={1000}
              className="min-h-36 w-full resize-none rounded-3xl border border-black/10 bg-zinc-50 px-4 py-4 text-sm leading-7 outline-none focus:border-zinc-900 focus:bg-white"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setReplyText("");
                }}
                className="flex-1 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black shadow-sm transition hover:bg-zinc-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!replyText.trim() || sending}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {sending ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
