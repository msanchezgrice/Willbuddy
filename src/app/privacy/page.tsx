import type { Metadata } from "next";
import Link from "next/link";
import { getSupportEmail } from "@/lib/resend";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "WillBuddy privacy policy for voice-first estate planning preparation.",
};

const updated = "June 11, 2026";

export default function PrivacyPage() {
  const supportEmail = getSupportEmail();

  return (
    <main className="flex-1 px-6 py-16 md:py-24">
      <article className="mx-auto max-w-3xl">
        <p className="mb-4 text-sm uppercase tracking-widest text-[#9B8E7E]">
          Privacy
        </p>
        <h1 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26] md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mb-10 text-sm text-[#9B8E7E]">Last updated {updated}</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#5B4F3E] md:text-base">
          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              What WillBuddy Does
            </h2>
            <p>
              WillBuddy helps users prepare estate-planning information through
              guided voice sessions and draft document generation. WillBuddy is
              not a law firm and does not provide legal advice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Information We Process
            </h2>
            <p>
              The app may process account identifiers, session progress,
              transcript entries, estate-planning decisions, generated draft
              document data, share links, payment status, support requests, and
              analytics events needed to run and improve the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Service Providers
            </h2>
            <p>
              WillBuddy uses Clerk for authentication, Supabase for application
              data, Google Gemini for voice and AI conversation features, Stripe
              for checkout, Resend for email, Vercel for hosting, and PostHog
              for product analytics. These providers process information only
              as needed to provide their services to WillBuddy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Analytics
            </h2>
            <p>
              Product analytics are configured to avoid collecting support
              message bodies, transcripts, estate-planning answers, invite
              tokens, share tokens, and raw dynamic route identifiers.
              Analytics may include sanitized page paths, CTA clicks, contact
              topics, and signup/session-start events.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Your Choices
            </h2>
            <p>
              You can contact support to request help with account access,
              privacy questions, or data deletion. Some data may need to be
              retained for security, billing, legal, or operational reasons.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Contact
            </h2>
            <p>
              Questions can be sent through the{" "}
              <Link
                className="font-semibold text-[#2D2A26] underline decoration-[#CDBFAE] underline-offset-4"
                href="/contact"
              >
                contact form
              </Link>{" "}
              or by email at{" "}
              <a
                className="font-semibold text-[#2D2A26] underline decoration-[#CDBFAE] underline-offset-4"
                href={`mailto:${supportEmail}`}
              >
                {supportEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
