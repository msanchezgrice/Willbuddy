import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmailOnce, getUserDisplayName } from "@/lib/emails/send";
import {
  renderWaitingEmail,
  renderBothDoneEmail,
  renderIdleEmail,
} from "@/lib/emails/templates";
import { compareDecisions } from "@/lib/couple/compare";
import type { Decision } from "@/types";
import { getAppUrl } from "@/lib/resend";

/**
 * GET /api/cron/emails
 * Scheduled via vercel.ts cron config. Protected by Authorization: Bearer $CRON_SECRET.
 *
 * Scans couple_sessions + sessions for states that trigger drip emails:
 *   - partner_waiting: primary done, partner not yet joined
 *   - both_done: both sessions completed
 *   - idle_7d: any in-progress session with no activity in 7 days
 */
export async function GET(request: NextRequest) {
  // Auth guard: Vercel cron sends "Authorization: Bearer $CRON_SECRET" when
  // CRON_SECRET is set as an env var.
  const expected = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const results = {
    partner_waiting: 0,
    both_done: 0,
    idle_7d: 0,
    errors: [] as string[],
  };

  // ---- partner_waiting + both_done ----
  const { data: couples } = await supabase
    .from("couple_sessions")
    .select("*")
    .in("status", ["awaiting_partner", "comparing"]);

  for (const couple of couples ?? []) {
    try {
      const [primaryRes, partnerRes] = await Promise.all([
        supabase
          .from("sessions")
          .select("*")
          .eq("id", couple.primary_session_id)
          .single(),
        couple.partner_session_id
          ? supabase
              .from("sessions")
              .select("*")
              .eq("id", couple.partner_session_id)
              .single()
          : Promise.resolve({ data: null }),
      ]);
      const primary = primaryRes.data;
      const partner = partnerRes.data;

      // both_done → email both partners with comparison summary (once per couple)
      if (
        primary?.status === "completed" &&
        partner?.status === "completed"
      ) {
        const [primaryDecs, partnerDecs] = await Promise.all([
          supabase
            .from("decisions")
            .select("*")
            .eq("session_id", primary.id),
          supabase
            .from("decisions")
            .select("*")
            .eq("session_id", partner.id),
        ]);
        const comparison = compareDecisions(
          (primaryDecs.data ?? []) as Decision[],
          (partnerDecs.data ?? []) as Decision[]
        );
        const compareUrl = `${getAppUrl()}/couple/compare/${couple.id}`;

        for (const session of [primary, partner]) {
          const otherUserId =
            session.user_id === primary.user_id
              ? partner.user_id
              : primary.user_id;
          const partnerName = await getUserDisplayName(otherUserId);
          const { subject, html, text } = renderBothDoneEmail({
            partnerName,
            compareUrl,
            appUrl: getAppUrl(),
            agreementsCount: comparison.agreements.length,
            disagreementsCount: comparison.disagreements.length,
          });
          const r = await sendEmailOnce({
            userId: session.user_id,
            kind: "both_done",
            contextId: couple.id,
            subject,
            html,
            text,
          });
          if (r.ok) results.both_done++;
          else if (r.reason && r.reason !== "already_sent" && r.reason !== "opted_out") {
            results.errors.push(`both_done:${r.reason}`);
          }
        }
        continue;
      }

      // partner_waiting → primary done, no partner session yet
      if (primary?.status === "completed" && !partner) {
        const compareUrl = `${getAppUrl()}/couple/compare/${couple.id}`;
        const youName = await getUserDisplayName(primary.user_id);
        const { subject, html, text } = renderWaitingEmail({
          youName,
          compareUrl,
          appUrl: getAppUrl(),
        });
        const r = await sendEmailOnce({
          userId: primary.user_id,
          kind: "partner_waiting",
          contextId: couple.id,
          subject,
          html,
          text,
        });
        if (r.ok) results.partner_waiting++;
        else if (r.reason && r.reason !== "already_sent" && r.reason !== "opted_out") {
          results.errors.push(`partner_waiting:${r.reason}`);
        }
      }
    } catch (e) {
      results.errors.push(`couple ${couple.id}: ${(e as Error).message}`);
    }
  }

  // ---- idle_7d ----
  // Sessions in progress with no decisions updated in last 7 days
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const { data: idleSessions } = await supabase
    .from("sessions")
    .select("id, user_id, started_at")
    .eq("status", "in_progress")
    .lt("started_at", sevenDaysAgo);

  for (const session of idleSessions ?? []) {
    try {
      // Check most recent decision activity
      const { data: latestDec } = await supabase
        .from("decisions")
        .select("updated_at")
        .eq("session_id", session.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      const lastActivity = new Date(
        latestDec?.updated_at ?? session.started_at
      );
      const daysIdle = Math.floor(
        (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysIdle < 7) continue;

      const resumeUrl = `${getAppUrl()}/session`;
      const { subject, html, text } = renderIdleEmail({
        appUrl: getAppUrl(),
        resumeUrl,
        daysIdle,
      });
      // Use a weekly bucket as contextId so we can re-nudge weekly but not daily
      const weekBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
      const r = await sendEmailOnce({
        userId: session.user_id,
        kind: "idle",
        contextId: `${session.id}:${weekBucket}`,
        subject,
        html,
        text,
      });
      if (r.ok) results.idle_7d++;
      else if (r.reason && r.reason !== "already_sent" && r.reason !== "opted_out") {
        results.errors.push(`idle:${r.reason}`);
      }
    } catch (e) {
      results.errors.push(`idle ${session.id}: ${(e as Error).message}`);
    }
  }

  return NextResponse.json(results);
}
