import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

/**
 * Returns true if the given WillBuddy session has a completed payment.
 * This is the single source of truth for gating document access.
 */
export async function isSessionPaid(
  supabase: SupabaseClient,
  sessionId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("payments")
    .select("id")
    .eq("session_id", sessionId)
    .eq("status", "completed")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[payments] isSessionPaid query failed:", error.message);
    return false;
  }
  return Boolean(data);
}

/**
 * Verify a Stripe Checkout Session on return from Stripe and record the payment
 * immediately (idempotent), so the summary page unlocks without waiting for the
 * async webhook. The webhook remains the primary/idempotent path.
 *
 * Returns true if the checkout is paid and belongs to this session.
 */
export async function verifyAndRecordCheckout(
  supabase: SupabaseClient,
  sessionId: string,
  checkoutSessionId: string
): Promise<boolean> {
  try {
    const checkout = await getStripe().checkout.sessions.retrieve(
      checkoutSessionId
    );

    const belongsToSession =
      checkout.metadata?.willbuddy_session_id === sessionId;
    const isPaid = checkout.payment_status === "paid";

    if (!belongsToSession || !isPaid) return false;

    // Idempotent upsert keyed on the unique stripe_checkout_session_id.
    const { error } = await supabase.from("payments").upsert(
      {
        session_id: sessionId,
        stripe_checkout_session_id: checkout.id,
        stripe_payment_intent_id:
          typeof checkout.payment_intent === "string"
            ? checkout.payment_intent
            : (checkout.payment_intent?.id ?? null),
        amount_cents: checkout.amount_total ?? 4900,
        currency: checkout.currency ?? "usd",
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "stripe_checkout_session_id" }
    );

    if (error) {
      console.error("[payments] verifyAndRecordCheckout upsert failed:", error.message);
    }
    return true;
  } catch (err) {
    console.error("[payments] verifyAndRecordCheckout error:", err);
    return false;
  }
}
