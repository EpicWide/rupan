import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    const smtpUser = process.env.GMAIL_SMTP_USER;
    const smtpPassword = process.env.GMAIL_SMTP_APP_PASSWORD;
    const toEmail = process.env.CONTACT_TO_EMAIL || smtpUser;
    const fromName = process.env.GMAIL_SMTP_FROM_NAME || "Rupan";

    if (!smtpUser || !smtpPassword || !toEmail) {
      return NextResponse.json(
        {
          error:
            "Contact email is not configured. Missing Gmail SMTP environment variables.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${smtpUser}>`,
      to: toEmail,
      replyTo: email,
      subject: `New Rupan contact message${name ? ` from ${name}` : ""}`,
      text: `
New Rupan contact message

Name: ${name || "Not provided"}
Email: ${email}

Message:
${message}
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Rupan contact message</h2>
          <p><strong>Name:</strong> ${escapeHtml(name || "Not provided")}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <hr />
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Rupan contact email error:", {
      message: error?.message,
      code: error?.code,
      command: error?.command,
      response: error?.response,
    });

    return NextResponse.json(
      {
        error: error?.message || "Failed to send contact message.",
        code: error?.code || null,
      },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
