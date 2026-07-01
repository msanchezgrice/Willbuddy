import { NextRequest, NextResponse } from "next/server";
import {
  getFromAddress,
  getInboundForwardTo,
  getResend,
} from "@/lib/resend";

export const runtime = "nodejs";

/** Inbound addresses we forward to the team inbox. */
const INBOUND_LOCAL_PARTS = new Set([
  "support",
  "hello",
  "contact",
  "help",
]);

function extractEmailAddress(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const bracket = trimmed.match(/<([^>]+)>/);
  return (bracket?.[1] ?? trimmed).trim();
}

function shouldForwardInbound(toAddresses: string[]): boolean {
  return toAddresses.some((raw) => {
    const address = extractEmailAddress(raw);
    const match = address.match(/^([^@]+)@mywillbuddy\.com$/);
    if (!match) return false;
    return INBOUND_LOCAL_PARTS.has(match[1]);
  });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[resend/webhook] RESEND_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const resend = getResend();

  let event: { type: string; data: { email_id: string; to?: string[] } };
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret,
    }) as typeof event;
  } catch (error) {
    console.error("[resend/webhook] verification failed", error);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true, skipped: event.type });
  }

  const toAddresses = event.data.to ?? [];
  if (!shouldForwardInbound(toAddresses)) {
    return NextResponse.json({ ok: true, skipped: "not_target_inbox", to: toAddresses });
  }

  const forwardTo = getInboundForwardTo();
  const { data, error } = await resend.emails.receiving.forward({
    emailId: event.data.email_id,
    to: forwardTo,
    from: getFromAddress(),
  });

  if (error) {
    console.error("[resend/webhook] forward failed", error);
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    forwarded: forwardTo,
    id: data?.id ?? null,
  });
}
