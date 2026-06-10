import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  if (!serviceRoleKey.startsWith("eyJ")) {
    throw new Error("Invalid SUPABASE_SERVICE_ROLE_KEY format.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const supabaseAdmin = createSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("rupan_visitor_stats")
      .select("total_count")
      .eq("id", "global")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          total: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        total: Number(data?.total_count ?? 0),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        total: null,
        error: error?.message || "Failed to load visitor count.",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const supabaseAdmin = createSupabaseAdmin();

    const { data, error } = await supabaseAdmin.rpc(
      "increment_rupan_visitors"
    );

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          total: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        total: Number(data ?? 0),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        total: null,
        error: error?.message || "Failed to update visitor count.",
      },
      { status: 500 }
    );
  }
}
