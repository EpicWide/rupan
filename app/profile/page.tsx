"use client";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type ProfileForm = {
  nickname: string;
  region: string;
  job: string;
  disability_status: string;
  age_range: string;
};

const disabilityOptions = [
  { value: "", label: "Prefer not to say" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

const ageRangeOptions = [
  { value: "", label: "Prefer not to say" },
  { value: "under_18", label: "Under 18" },
  { value: "18_24", label: "18–24" },
  { value: "25_34", label: "25–34" },
  { value: "35_44", label: "35–44" },
  { value: "45_54", label: "45–54" },
  { value: "55_64", label: "55–64" },
  { value: "65_plus", label: "65+" },
];

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    nickname: "",
    region: "",
    job: "",
    disability_status: "",
    age_range: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const canSave = useMemo(() => {
    return form.nickname.trim().length >= 2 && !saving;
  }, [form.nickname, saving]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const { data: sessionData } = await supabaseBrowser.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
          router.replace("/login");
          return;
        }

        setUserId(user.id);
        setEmail(user.email ?? null);

        const { data, error } = await supabaseBrowser
          .from("rupan_profiles")
          .select("nickname, region, job, disability_status, age_range")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          setMessage(error.message);
          return;
        }

        if (data) {
          setForm({
            nickname: data.nickname ?? "",
            region: data.region ?? "",
            job: data.job ?? "",
            disability_status: data.disability_status ?? "",
            age_range: data.age_range ?? "",
          });
        } else {
          const defaultName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "";

          setForm((prev) => ({
            ...prev,
            nickname: defaultName,
          }));
        }
      } catch {
        setMessage("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const updateField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Please log in first.");
      return;
    }

    if (!form.nickname.trim()) {
      setMessage("Nickname is required.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabaseBrowser.from("rupan_profiles").upsert(
        {
          user_id: userId,
          nickname: form.nickname.trim(),
          region: form.region.trim() || null,
          job: form.job.trim() || null,
          disability_status: form.disability_status || null,
          age_range: form.age_range || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) {
        setMessage(error.message);
        return;
      }

      await supabaseBrowser.auth.updateUser({
        data: {
          nickname: form.nickname.trim(),
        },
      });

      setMessage("Profile saved.");
    } catch {
      setMessage("Failed to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-4">
        <div className="rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl font-black text-white">
            R
          </div>
          <Loader2 className="mx-auto animate-spin text-zinc-500" size={24} />
          <p className="mt-4 text-sm font-bold text-zinc-500">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-zinc-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black shadow-sm transition hover:bg-zinc-50"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

          <div className="flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-white shadow-sm">
            <UserRound size={16} />
            Profile
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 px-6 py-7 text-white">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Sparkles size={24} />
            </div>

            <h1 className="text-3xl font-black tracking-tight">
              Your profile
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/75">
              Create a simple identity for Rupan. Only your nickname is required.
            </p>

            {email && (
              <p className="mt-4 inline-flex max-w-full rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/80 ring-1 ring-white/15">
                <span className="truncate">{email}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5 p-5 sm:p-6">
            <label className="block">
              <span className="mb-2 block text-sm font-black">
                Nickname <span className="text-red-500">*</span>
              </span>

              <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
                <UserRound size={18} className="text-zinc-400" />
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => updateField("nickname", e.target.value)}
                  placeholder="Your nickname"
                  maxLength={40}
                  required
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <p className="mt-2 text-xs font-medium text-zinc-400">
                This is the only required field.
              </p>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black">Region</span>

              <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
                <MapPin size={18} className="text-zinc-400" />
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => updateField("region", e.target.value)}
                  placeholder="Chicago, Seoul, London..."
                  maxLength={80}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black">Job</span>

              <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-zinc-950 focus-within:bg-white">
                <Briefcase size={18} className="text-zinc-400" />
                <input
                  type="text"
                  value={form.job}
                  onChange={(e) => updateField("job", e.target.value)}
                  placeholder="Researcher, therapist, engineer..."
                  maxLength={80}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-black">
                  Disability status
                </span>

                <select
                  value={form.disability_status}
                  onChange={(e) =>
                    updateField("disability_status", e.target.value)
                  }
                  className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
                >
                  {disabilityOptions.map((option) => (
                    <option key={option.value || "empty"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">
                  Approximate age range
                </span>

                <select
                  value={form.age_range}
                  onChange={(e) => updateField("age_range", e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
                >
                  {ageRangeOptions.map((option) => (
                    <option key={option.value || "empty"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${
                  message === "Profile saved."
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-black/10 bg-zinc-50 text-zinc-700"
                }`}
              >
                {message === "Profile saved." && <CheckCircle2 size={17} />}
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSave}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save profile
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
