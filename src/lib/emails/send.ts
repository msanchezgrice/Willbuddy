import { clerkClient } from "@clerk/nextjs/server";
import { getResend, getFromAddress, getReplyToAddress } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";

export interface SendEmailOptions {
  userId: string;
  kind: string;
  contextId?: string | null;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  reason?: string;
  id?: string;
}

/**
 * Idempotent email send. Skips if the user has opted out or if an email
 * of this (kind, contextId) has already been sent to this user.
 */
export async function sendEmailOnce(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const supabase = createServiceClient();

  // Check opt-out
  const { data: profile } = await supabase
    .from("profiles")
    .select("email_opt_out")
    .eq("id", options.userId)
    .single();

  if (profile?.email_opt_out) {
    return { ok: false, reason: "opted_out" };
  }

  // Check if already sent (unique index enforces this but we short-circuit)
  const { data: existing } = await supabase
    .from("sent_emails")
    .select("id")
    .eq("user_id", options.userId)
    .eq("kind", options.kind)
    .eq("context_id", options.contextId ?? "")
    .maybeSingle();

  if (existing) {
    return { ok: false, reason: "already_sent" };
  }

  // Resolve the user's email from Clerk
  const email = await getUserEmail(options.userId);
  if (!email) {
    return { ok: false, reason: "no_email" };
  }

  // Actually send
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      replyTo: options.replyTo ?? getReplyToAddress(),
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("[email] resend error", error);
      return { ok: false, reason: error.message };
    }

    // Log the send (best-effort; unique index protects against races)
    await supabase.from("sent_emails").insert({
      user_id: options.userId,
      kind: options.kind,
      context_id: options.contextId ?? "",
    });

    return { ok: true, id: data?.id };
  } catch (e) {
    console.error("[email] send threw", e);
    return { ok: false, reason: (e as Error).message };
  }
}

/**
 * Fetch a user's primary email address from Clerk.
 * Returns null if no verified email or Clerk errors.
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primaryId = user.primaryEmailAddressId;
    const primary = user.emailAddresses.find((e) => e.id === primaryId);
    return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  } catch (e) {
    console.error("[email] getUserEmail failed", userId, e);
    return null;
  }
}

/**
 * Fetch a user's display name from Clerk.
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.firstName) return user.firstName;
    if (user.fullName) return user.fullName;
    return "Your partner";
  } catch {
    return "Your partner";
  }
}
