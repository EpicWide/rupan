"use client";

import {
  Chrome,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");

  const canSignup = useMemo(() => {
    return (
      email.trim().length > 4 &&
      password.length >= 6 &&
      agreeTerms &&
      agreePrivacy &&
      !emailLoading &&
      !googleLoading
    );
  }, [email, password, agreeTerms, agreePrivacy, emailLoading, googleLoading]);

  const checkAgreement = () => {
    if (!agreeTerms || !agreePrivacy) {
      setMessage("You must agree to the Terms and Privacy Policy before signing up.");
      return false;
    }

    return true;
  };

  const handleEmailSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!checkAgreement()) return;

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setEmailLoading(true);

      const origin = window.location.origin;

      const { error } = await supabaseBrowser.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?terms=agreed`,
          data: {
            agreed_terms: true,
            agreed_privacy: true,
            agreed_terms_at: new Date().toISOString(),
            app_name: "Rupan",
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Account created. Please check your email if confirmation is required.");

      setTimeout(() => {
        router.replace("/profile");
        router.refresh();
      }, 800);
    } catch {
      setMessage("Signup failed. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setMessage("");

    if (!checkAgreement()) return;

    try {
      setGoogleLoading(true);

      const origin = window.location.origin;

      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?terms=agreed`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setMessage(error.message);
      }
    } catch {
      setMessage("Google signup failed. Please try again.");
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
              Create your account
            </p>
          </div>
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-7 text-white">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <ShieldCheck size={22} />
            </div>

            <h1 className="text-3xl font-black tracking-tight">Sign up</h1>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Join Rupan with Google or email. Agreement to the Terms and Privacy Policy is required.
            </p>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <button
              type="button"
              onClick={handleGoogleSignup}
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

            <form onSubmit={handleEmailSignup} className="space-y-4">
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
                    placeholder="At least 6 characters"
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

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/10 bg-zinc-50 p-4">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      setMessage("");
                    }}
                    className="mt-1 h-4 w-4 accent-zinc-950"
                  />

                  <span className="text-sm leading-6 text-zinc-600">
                    I agree to Rupan&apos;s{" "}
                    <Link href="/terms" className="font-black text-zinc-950 underline">
                      Terms of Service
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/10 bg-zinc-50 p-4">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => {
                      setAgreePrivacy(e.target.checked);
                      setMessage("");
                    }}
                    className="mt-1 h-4 w-4 accent-zinc-950"
                  />

                  <span className="text-sm leading-6 text-zinc-600">
                    I agree to Rupan&apos;s{" "}
                    <Link href="/privacy" className="font-black text-zinc-950 underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {message && (
                <div className="rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSignup}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {emailLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <UserPlus size={18} />
                )}
                Create account
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="font-black text-zinc-950 underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
