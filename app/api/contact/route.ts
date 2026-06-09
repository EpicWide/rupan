import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.body || "").trim();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required." },
        { status: 400 }
      );
    }

    console.log("Rupan contact message:", {
      name,
      email,
      message,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send contact message." },
      { status: 500 }
    );
  }
}
