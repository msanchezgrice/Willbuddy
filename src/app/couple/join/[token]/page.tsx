import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { JoinInviteClient } from "./join-client";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CoupleJoinPage({ params }: Props) {
  const { token } = await params;
  const { userId } = await auth();
  const supabase = createServiceClient();

  const { data: couple } = await supabase
    .from("couple_sessions")
    .select("*")
    .eq("invite_token", token)
    .single();

  if (!couple) {
    return <InviteError title="Invite not found" message="This invite link isn't valid. Ask your partner to send you a fresh one." />;
  }

  if (couple.invite_expires_at && new Date(couple.invite_expires_at) < new Date()) {
    return <InviteError title="Invite expired" message="This invite link has expired. Ask your partner to send a new one." />;
  }

  // Look up the primary session to show partner's name if available
  const { data: primarySession } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("id", couple.primary_session_id)
    .single();

  const { data: primaryProfile } = primarySession
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", primarySession.user_id)
        .single()
    : { data: null };

  const primaryName = primaryProfile?.full_name ?? "Your partner";

  if (!userId) {
    // Redirect to sign-in then back here
    const returnTo = `/couple/join/${token}`;
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#E8E0D6] bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5B7A5E]">
            You&apos;re invited
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
            {primaryName} wants to plan your estate together
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#5A5550]">
            You&apos;ll do your own 25-minute voice session, then we&apos;ll show you
            where you and {primaryName} agree and where you need to talk. No pressure,
            no lawyer clock ticking.
          </p>
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`}
            className="mt-6 inline-block w-full rounded-xl bg-[#5B7A5E] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4a6a4e]"
          >
            Sign in to start
          </Link>
          <Link
            href={`/sign-up?redirect_url=${encodeURIComponent(returnTo)}`}
            className="mt-3 inline-block w-full rounded-xl border border-[#E8E0D6] bg-white px-6 py-3 text-center text-sm font-semibold text-[#2D2A26] transition-colors hover:bg-[#F0EBE4]"
          >
            Create an account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <JoinInviteClient token={token} primaryName={primaryName} alreadyJoined={!!couple.partner_session_id} />
  );
}

function InviteError({ title, message }: { title: string; message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E0D6] bg-white p-8 text-center shadow-sm">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
          {title}
        </h1>
        <p className="mt-3 text-sm text-[#5A5550]">{message}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-[#5B7A5E] px-6 py-3 text-sm font-semibold text-white"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
