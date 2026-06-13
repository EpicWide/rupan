import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_REACTIONS = new Set([
"cheer_up",
"support_you",
"lawsuit_support",
]);

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
return crypto.createHash("sha256").update(value).digest("hex");
}

function getIp(request: Request) {
const forwardedFor = request.headers.get("x-forwarded-for");
if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "";

return (
request.headers.get("x-real-ip") ||
request.headers.get("cf-connecting-ip") ||
""
);
}

export async function POST(request: Request) {
try {
const body = await request.json();

```
const postId = String(body.postId || "").trim();
const reactionType = String(body.reactionType || "").trim();
const visitorKey = String(body.visitorKey || "").trim();

if (!postId) {
  return NextResponse.json(
    { ok: false, error: "Missing postId." },
    { status: 400 }
  );
}

if (!VALID_REACTIONS.has(reactionType)) {
  return NextResponse.json(
    { ok: false, error: "Invalid reaction type." },
    { status: 400 }
  );
}

if (!visitorKey || visitorKey.length < 20 || visitorKey.length > 120) {
  return NextResponse.json(
    { ok: false, error: "Invalid visitor key." },
    { status: 400 }
  );
}

const supabaseAdmin = createSupabaseAdmin();

const ip = getIp(request);
const userAgent = request.headers.get("user-agent") || "";

const { error } = await supabaseAdmin
  .from("rupan_post_reactions")
  .insert({
    post_id: postId,
    user_id: null,
    visitor_key: visitorKey,
    reaction_type: reactionType,
    ip_hash: ip ? hashValue(ip) : null,
    user_agent_hash: userAgent ? hashValue(userAgent) : null,
  });

if (error) {
  if (error.code === "23505") {
    return NextResponse.json({
      ok: true,
      counted: false,
      alreadyCounted: true,
    });
  }

  return NextResponse.json(
    { ok: false, error: error.message },
    { status: 500 }
  );
}

return NextResponse.json({
  ok: true,
  counted: true,
  alreadyCounted: false,
});
```

} catch (error: any) {
return NextResponse.json(
{
ok: false,
error: error?.message || "Failed to count reaction.",
},
{ status: 500 }
);
}
}
