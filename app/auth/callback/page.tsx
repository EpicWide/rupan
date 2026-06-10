"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const finishAuth = async () => {
      const agreed = searchParams.get("terms") === "agreed";

      const { data } = await supabaseBrowser.auth.getSession();

      if (data.session?.user && agreed) {
        await supabaseBrowser.auth.updateUser({
          data: {
            agreed_terms: true,
            agreed_privacy: true,
            agreed_terms_at: new Date().toISOString(),
            app_name: "Rupan",
          },
        });
      }

      router.replace("/profile");
      router.refresh();
    };

    finishAuth();
  }, [router, searchParams]);

  return <CallbackLoading />;
}

function CallbackLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-4">
      <div className="rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl font-black text-white">
          R
        </div>

        <Loader2 className="mx-auto animate-spin text-zinc-500" size={24} />

        <h1 className="mt-4 text-xl font-black">Signing you in...</h1>
        <p className="mt-2 text-sm text-zinc-500">Please wait a moment.</p>
      </div>
    </main>
  );
}
