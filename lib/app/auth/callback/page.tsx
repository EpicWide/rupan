"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finishAuth = async () => {
      await supabaseBrowser.auth.getSession();
      router.replace("/");
      router.refresh();
    };

    finishAuth();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-4">
      <div className="rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl font-black text-white">
          R
        </div>
        <h1 className="text-xl font-black">Signing you in...</h1>
        <p className="mt-2 text-sm text-zinc-500">Please wait a moment.</p>
      </div>
    </main>
  );
}
