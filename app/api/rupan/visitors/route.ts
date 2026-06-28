import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

type VisitorRequestBody = {
  visitorKey?: unknown;
  path?: unknown;
  referrer?: unknown;
  language?: unknown;
  timezone?: unknown;
  screenWidth?: unknown;
  screenHeight?: unknown;
};

function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  if (!cleaned) return null;

  return cleaned.slice(0, maxLength);
}

function cleanNumber(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return null;

  return Math.max(0, Math.round(numberValue));
}

function getIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    ""
  );
}

function getCountry(request: Request) {
  return (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-appengine-country") ||
    null
  );
}

function getRegion(request: Request) {
  return (
    request.headers.get("x-vercel-ip-country-region") ||
    request.headers.get("x-appengine-region") ||
    null
  );
}

function getCity(request: Request) {
  return (
    request.headers.get("x-vercel-ip-city") ||
    request.headers.get("x-appengine-city") ||
    null
  );
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
        { ok: false, total: null, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, total: Number(data?.total_count ?? 0) },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
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

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createSupabaseAdmin();

    let body: VisitorRequestBody = {};

    try {
      body = (await request.json()) as VisitorRequestBody;
    } catch {
      body = {};
    }

    const userAgent = request.headers.get("user-agent") || "";
    const ip = getIp(request);

    const { data, error: rpcError } = await supabaseAdmin.rpc(
      "increment_rupan_visitors"
    );

    if (rpcError) {
      return NextResponse.json(
        { ok: false, total: null, error: rpcError.message },
        { status: 500 }
      );
    }

    const { error: logError } = await supabaseAdmin
      .from("rupan_visitor_logs")
      .insert({
        visitor_key: cleanText(body.visitorKey, 160),
        path: cleanText(body.path, 500),
        referrer: cleanText(body.referrer, 1000),
        language: cleanText(body.language, 80),
        timezone: cleanText(body.timezone, 100),
        screen_width: cleanNumber(body.screenWidth),
        screen_height: cleanNumber(body.screenHeight),
        user_agent: userAgent.slice(0, 1000) || null,
        ip_hash: ip ? hashValue(ip) : null,
        user_agent_hash: userAgent ? hashValue(userAgent) : null,
        country: getCountry(request),
        region: getRegion(request),
        city: getCity(request),
      });

    if (logError) {
      console.error("Lupin visitor log failed:", logError.message);
    }

    return NextResponse.json(
      {
        ok: true,
        total: Number(data ?? 0),
        logged: !logError,
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
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
