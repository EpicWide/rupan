"use client";

import {
  Chrome,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");

  const canLogin = useMemo(() => {
    return email.trim().length > 4 && password.length >= 6 && !emailLoading && !googleLoading;
  }, [email, password, emailLoading, googleLoading]);

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    try {
      setEmailLoading(true);

      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setMessage("Login failed. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");

    try {
      setGoogleLoading(true);

      const origin = window.location.origin;

      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
      }
    } catch {
      setMessage("Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-md flex-col gap-5">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-black text-white shadow-sm">
            R
          </div>

          <div>
            <p className="text-xl font-black tracking-tight">Rupan</p>
            <p className="text-xs font-semibold text-zinc-500">
              Welcome back
            </p>
          </div>
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-7 text-white">
            <h1 className="text-3xl font-black tracking-tight">Login</h1>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Login to Rupan with Google or email.
            </p>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Chrome size={18} />
              )}
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
                or
              </span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black">Email</span>
                <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
                  <Mail size={18} className="text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setMessage("");
                    }}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm outline-none"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">Password</span>
                <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setMessage("");
                    }}
                    placeholder="Your password"
                    minLength={6}
                    className="w-full bg-transparent text-sm outline-none"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-zinc-400 transition hover:text-zinc-950"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {message && (
                <div className="rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={!canLogin}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {emailLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                Login
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500">
              New to Rupan?{" "}
              <Link href="/signup" className="font-black text-zinc-950 underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
