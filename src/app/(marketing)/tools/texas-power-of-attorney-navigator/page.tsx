import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { TexasPowerOfAttorneyNavigator } from "@/components/tools/TexasPowerOfAttorneyNavigator";
import { absoluteUrl, siteConfig } from "@/lib/site";

const canonicalPath = "/tools/texas-power-of-attorney-navigator";

const faqs = [
  {
    question: "Is a Texas medical power of attorney the same as a living will?",
    answer:
      "No. A medical power of attorney names an agent for healthcare decisions under the conditions in Texas law. A directive to physicians, often called a living will, records treatment instructions for a terminal or irreversible condition.",
  },
  {
    question: "Does a durable power of attorney cover medical decisions?",
    answer:
      "The Texas statutory durable power of attorney addresses property and financial powers. Healthcare decision-making is governed separately, including by the Texas Advance Directives Act.",
  },
  {
    question: "Does a declaration of guardian guarantee the court's choice?",
    answer:
      "No. A declaration records a preference, but the proposed guardian still must be eligible and the court applies Texas law to the appointment.",
  },
] as const;

export const metadata: Metadata = {
  title: "Texas Power of Attorney & Advance Directive Navigator",
  description:
    "Map the different jobs of a Texas durable power of attorney, medical power of attorney, living will, HIPAA authorization, and guardian declaration.",
  alternates: { canonical: canonicalPath },
  openGraph: {
    title: "Texas Power of Attorney & Advance Directive Navigator",
    description:
      "A free, private decision map for five different Texas incapacity-planning documents.",
    url: canonicalPath,
    type: "website",
  },
};

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-[#4A6A4D] underline decoration-[#5B7A5E]/35 underline-offset-2 hover:text-[#2D2A26]"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

export default function TexasPowerOfAttorneyNavigatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Texas Power of Attorney and Advance Directive Navigator",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        url: absoluteUrl(canonicalPath),
        description:
          "A free educational tool that maps five distinct Texas incapacity-planning documents.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@type": "Organization", name: siteConfig.name },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
          {
            "@type": "ListItem",
            position: 3,
            name: "Texas POA navigator",
            item: absoluteUrl(canonicalPath),
          },
        ],
      },
    ],
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="border-b border-[#E8E0D6] bg-[#F0EBE4]/60 px-6 py-8 md:py-10">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="text-sm text-[#7F7467]">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span>{" "}
            <Link href="/tools">Tools</Link> <span aria-hidden="true">/</span>{" "}
            <span>Texas POA navigator</span>
          </nav>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#5B7A5E]">
            Free Texas decision tool
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-[#2D2A26] md:text-5xl">
            Which power of attorney or advance directive does what?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5B4F3E] md:text-lg">
            Texas uses separate documents for financial authority, medical
            decision-making, treatment instructions, health-information access,
            and future guardian preferences. Build a document map without
            entering names, medical details, or financial information.
          </p>
          <p className="mt-4 max-w-2xl rounded-2xl border border-[#D8CDBF] bg-white/80 p-4 text-sm leading-relaxed text-[#5B4F3E]">
            <strong className="text-[#2D2A26]">Educational disclaimer:</strong>{" "}
            This navigator provides general educational information, not legal
            advice. It cannot determine whether a form is valid or suitable for
            you. WillBuddy is not a law firm. Source-checked by the WillBuddy
            Editorial Team on July 13, 2026; not attorney-reviewed.
          </p>
        </div>
      </section>

      <section className="px-6 py-8 md:py-10">
        <div className="mx-auto max-w-3xl">
          <TexasPowerOfAttorneyNavigator />
        </div>
      </section>

      <section className="border-y border-[#E8E0D6] bg-white px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
            The five documents are not interchangeable
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <DocumentCard title="Statutory durable power of attorney">
              Texas Estates Code Chapter 752 supplies a statutory form for
              delegated property powers. The principal chooses the powers and
              may address when they become effective. “Durable” concerns the
              effect of later disability or incapacity; it is not a healthcare
              form. Read{" "}
              <SourceLink href="https://statutes.capitol.texas.gov/Docs/ES/htm/ES.752.htm">
                Texas Estates Code Chapter 752
              </SourceLink>
              .
            </DocumentCard>
            <DocumentCard title="Medical power of attorney">
              This document appoints an adult agent to make healthcare
              decisions when the statutory conditions are met. Texas Health and
              Safety Code Chapter 166 describes disclosure, execution, agent
              authority, and limitations. Review{" "}
              <SourceLink href="https://statutes.capitol.texas.gov/Docs/HS/htm/HS.166.htm">
                Texas Health and Safety Code Chapter 166
              </SourceLink>
              .
            </DocumentCard>
            <DocumentCard title="Directive to physicians">
              Sometimes called a living will, this directive addresses the use,
              withholding, or withdrawal of life-sustaining treatment in the
              circumstances covered by Texas law. It states treatment wishes;
              it does not replace the separate job of naming a medical agent.
            </DocumentCard>
            <DocumentCard title="HIPAA authorization">
              A disclosure authorization can let named people receive protected
              health information. That access can help an agent communicate,
              but record access alone does not grant authority to consent to or
              refuse treatment. Scope, recipients, expiration, and revocation
              language deserve careful review.
            </DocumentCard>
            <DocumentCard title="Declaration of guardian">
              A competent adult can identify whom the person prefers to serve,
              or disqualify named people, if a court later considers
              guardianship. The declaration informs that process; it does not
              bypass eligibility rules or court findings. See{" "}
              <SourceLink href="https://statutes.capitol.texas.gov/Docs/ES/htm/ES.1104.htm">
                Texas Estates Code Chapter 1104
              </SourceLink>
              .
            </DocumentCard>
          </div>

          <div className="mt-8 rounded-2xl border border-[#D8CDBF] bg-[#FAF8F5] p-6">
            <h3 className="font-semibold text-[#2D2A26]">Start with current forms</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5B4F3E]">
              Texas Health and Human Services publishes advance-directive forms
              and explanations. Confirm that you are using current materials,
              follow the form&apos;s signing instructions, and ask a licensed
              Texas attorney about conflicts or special circumstances. Open the{" "}
              <SourceLink href="https://www.hhs.texas.gov/regulations/forms/advance-directives/medical-power-attorney-designation-health-care-agent-mpoa">
                Texas Health and Human Services medical power of attorney page
              </SourceLink>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-[#E8E0D6] bg-white p-5">
                <summary className="cursor-pointer font-semibold text-[#2D2A26]">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function DocumentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-[#E8E0D6] bg-[#FAF8F5] p-6">
      <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">{children}</p>
    </article>
  );
}
