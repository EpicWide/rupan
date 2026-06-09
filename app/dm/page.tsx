"use client";

import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

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
  const [replyTo, setReplyTo] = useState<MessageRow | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [messages]);

  const getNickname = async (userId: string, fallback: string) => {
    const { data } = await supabaseBrowser
      .from("rupan_profiles")
      .select("nickname")
      .eq("user_id", userId)
      .maybeSingle();

    return data?.nickname || fallback;
  };

  const loadMessages = async () => {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const sessionUser = sessionData.session?.user;

    if (!sessionUser) {
      router.replace("/login");
      return;
    }

    const fallback =
      sessionUser.user_metadata?.full_name ||
      sessionUser.user_metadata?.name ||
      sessionUser.email?.split("@")[0] ||
      "Rupan User";

    const nickname = await getNickname(sessionUser.id, fallback);

    setUser({
      id: sessionUser.id,
      name: nickname,
    });

    const { data } = await supabaseBrowser
      .from("rupan_messages")
      .select("id, sender_id, recipient_id, sender_nickname, recipient_nickname, body, read_at, created_at")
      .or(`sender_id.eq.${sessionUser.id},recipient_id.eq.${sessionUser.id}`)
      .order("created_at", { ascending: false })
      .limit(100);

    setMessages(data ?? []);

    await supabaseBrowser
      .from("rupan_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", sessionUser.id)
      .is("read_at", null);

    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !replyTo || !replyText.trim()) return;

    const recipientId =
      replyTo.sender_id === user.id ? replyTo.recipient_id : replyTo.sender_id;

    const recipientNickname =
      replyTo.sender_id === user.id ? replyTo.recipient_nickname : replyTo.sender_nickname;

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
        alert(error.message);
        return;
      }

      setReplyText("");
      setReplyTo(null);
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-4">
        <div className="rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-zinc-500" size={24} />
          <p className="mt-4 text-sm font-bold text-zinc-500">Loading DMs...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

          <div className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-white">
            DM
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-3xl font-black tracking-tight">Direct messages</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Private messages between Rupan users.
          </p>
        </div>

        {sortedMessages.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/70 p-10 text-center">
            <p className="font-black text-zinc-600">No DMs yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMessages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              const counterpart = isMine ? msg.recipient_nickname : msg.sender_nickname;

              return (
                <article
                  key={msg.id}
                  className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black">
                        {isMine ? `To ${counterpart}` : `From ${counterpart}`}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReplyTo(msg)}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black shadow-sm"
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
            <h2 className="text-lg font-black">Reply</h2>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              maxLength={1000}
              className="mt-4 min-h-36 w-full resize-none rounded-3xl border border-black/10 bg-zinc-50 px-4 py-4 text-sm leading-7 outline-none focus:border-zinc-900 focus:bg-white"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="flex-1 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!replyText.trim() || sending}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white disabled:bg-zinc-300"
              >
                {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
