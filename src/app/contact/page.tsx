import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { getSupportEmail } from "@/lib/resend";

export const metadata: Metadata = {
  title: "Contact WillBuddy Support",
  description:
    "Contact WillBuddy support for questions about your estate planning session, billing, privacy, or attorney review handoff.",
};

export default function ContactPage() {
  const supportEmail = getSupportEmail();

  return (
    <main className="flex-1 px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <section>
          <p className="mb-4 text-sm uppercase tracking-widest text-[#9B8E7E]">
            Support
          </p>
          <h1 className="mb-5 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-[#2D2A26] md:text-4xl">
            Tell us what you need help with.
          </h1>
          <p className="mb-6 leading-relaxed text-[#5B4F3E]">
            Use this form for account, billing, privacy, or document handoff
            questions. Do not include sensitive estate-planning answers in the
            message body.
          </p>
          <p className="rounded-2xl border border-[#E8E0D6] bg-[#F0EBE4]/50 p-4 text-sm leading-relaxed text-[#5B4F3E]">
            Prefer email? Write to{" "}
            <a
              className="font-semibold text-[#2D2A26] underline decoration-[#CDBFAE] underline-offset-4"
              href={`mailto:${supportEmail}`}
            >
              {supportEmail}
            </a>
            . WillBuddy is not a law firm and cannot provide legal advice.
          </p>
          <Link
            className="mt-8 inline-block text-sm font-semibold text-[#5B7A5E] hover:text-[#2D2A26]"
            href="/"
          >
            Back to homepage
          </Link>
        </section>
        <ContactForm />
      </div>
    </main>
  );
}
