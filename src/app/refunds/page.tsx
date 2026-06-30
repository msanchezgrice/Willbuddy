import type { Metadata } from "next";
import Link from "next/link";
import { getSupportEmail } from "@/lib/resend";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "WillBuddy refund policy for one-time document package purchases.",
};

const updated = "June 27, 2026";

export default function RefundsPage() {
  const supportEmail = getSupportEmail();

  return (
    <main className="flex-1 px-6 py-16 md:py-24">
      <article className="mx-auto max-w-3xl">
        <p className="mb-4 text-sm uppercase tracking-widest text-[#9B8E7E]">
          Refunds
        </p>
        <h1 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26] md:text-4xl">
          Refund Policy
        </h1>
        <p className="mb-10 text-sm text-[#9B8E7E]">Last updated {updated}</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#5B4F3E] md:text-base">
          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              One-Time Document Package
            </h2>
            <p>
              WillBuddy charges a one-time fee for access to the document
              generation package. Payments are processed by Stripe, and the
              checkout page shows the current price before payment is
              completed.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Refund Requests
            </h2>
            <p>
              If you cannot access the paid document package, were charged in
              error, or are not satisfied with the service, contact support
              within 14 days of purchase. Refund requests are reviewed manually
              and, when approved, are returned to the original payment method
              through Stripe.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Generated Drafts
            </h2>
            <p>
              WillBuddy creates draft documents for attorney review and is not a
              law firm. Refund review may consider whether a document package
              has already been generated, downloaded, shared, or otherwise used.
              This policy does not limit any rights you may have under
              applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              How To Ask
            </h2>
            <p>
              Send refund questions through the{" "}
              <Link
                className="font-semibold text-[#2D2A26] underline decoration-[#CDBFAE] underline-offset-4"
                href="/contact"
              >
                contact form
              </Link>{" "}
              or email{" "}
              <a
                className="font-semibold text-[#2D2A26] underline decoration-[#CDBFAE] underline-offset-4"
                href={`mailto:${supportEmail}`}
              >
                {supportEmail}
              </a>
              . Approved refunds may take 5 to 10 business days to appear,
              depending on the card issuer or bank.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
