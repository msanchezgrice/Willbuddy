import { NextRequest, NextResponse } from "next/server";
import { getFromAddress, getResend, getSupportEmail } from "@/lib/resend";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPICS = new Set(["Support", "Billing", "Privacy", "Attorney review"]);

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = readString(body, "name", 120);
  const email = readString(body, "email", 254).toLowerCase();
  const topic = readString(body, "topic", 80) || "Support";
  const message = readString(body, "message", 4000);

  if (!name || !EMAIL_PATTERN.test(email) || !message) {
    return NextResponse.json(
      { error: "Name, valid email, and message are required." },
      { status: 400 }
    );
  }

  if (!TOPICS.has(topic)) {
    return NextResponse.json({ error: "Invalid support topic." }, { status: 400 });
  }

  try {
    const resend = getResend();
    const supportEmail = getSupportEmail();
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: supportEmail,
      replyTo: email,
      subject: `[WillBuddy ${topic}] ${name}`,
      html: renderSupportHtml({ name, email, topic, message }),
      text: renderSupportText({ name, email, topic, message }),
      tags: [
        { name: "app", value: "willbuddy" },
        { name: "kind", value: "support" },
      ],
    });

    if (error) {
      console.error("[contact] resend error", error);
      return NextResponse.json(
        { error: "Support email could not be sent." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (error) {
    console.error("[contact] send failed", error);
    return NextResponse.json(
      { error: "Support email is not configured yet." },
      { status: 503 }
    );
  }
}

function readString(source: unknown, key: string, maxLength: number): string {
  if (!source || typeof source !== "object" || !(key in source)) {
    return "";
  }
  const value = (source as Record<string, unknown>)[key];
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, maxLength);
}

function renderSupportText({
  name,
  email,
  topic,
  message,
}: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  return `New WillBuddy support request

Topic: ${topic}
Name: ${name}
Email: ${email}

Message:
${message}`;
}

function renderSupportHtml({
  name,
  email,
  topic,
  message,
}: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #2D2A26;">
    <h1 style="font-size: 20px;">New WillBuddy support request</h1>
    <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
