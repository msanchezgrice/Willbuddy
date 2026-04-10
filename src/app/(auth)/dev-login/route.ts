import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * DEV ONLY: Auto-sign-in via Supabase admin.
 * Visit /dev-login?email=your@email.com to skip magic link.
 * Remove this file before deploying to production.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email param required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Generate a magic link without sending email
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data?.properties?.hashed_token) {
    return NextResponse.json({ error: error?.message ?? "Failed to generate link" }, { status: 500 });
  }

  // Exchange the token for a session
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: data.properties.hashed_token,
  });

  if (verifyError) {
    return NextResponse.json({ error: verifyError.message }, { status: 500 });
  }

  // Redirect to session page
  return NextResponse.redirect(new URL("/session", request.url));
}
