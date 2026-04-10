import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Use the service-role client for webhook processing (no user auth context)
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  let event: Stripe.Event;

  try {
    // Read raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe/webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const willbuddySessionId = session.metadata?.willbuddy_session_id;
    if (!willbuddySessionId) {
      console.error(
        "[stripe/webhook] No willbuddy_session_id in metadata for",
        session.id
      );
      return NextResponse.json({ received: true });
    }

    const supabase = createServiceClient();

    const { error: insertError } = await supabase.from("payments").insert({
      session_id: willbuddySessionId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      amount_cents: session.amount_total ?? 4900,
      currency: session.currency ?? "usd",
      status: "completed",
      completed_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("[stripe/webhook] Failed to insert payment:", insertError);
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    console.log(
      `[stripe/webhook] Payment recorded for session ${willbuddySessionId}`
    );
  }

  return NextResponse.json({ received: true });
}
