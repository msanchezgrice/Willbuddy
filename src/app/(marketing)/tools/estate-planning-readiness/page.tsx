import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { EstateReadinessChecklist } from "@/components/tools/EstateReadinessChecklist";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Estate Planning Readiness Checklist | Texas",
  description:
    "Get a personalized estate-planning readiness score and your next three actions. Free, private, and no email required.",
  alternates: { canonical: "/tools/estate-planning-readiness" },
  openGraph: {
    title: "Free Estate Planning Readiness Checklist",
    description:
      "Personalize a Texas estate-planning checklist, see your score, and get your next three actions without an email gate.",
    url: "/tools/estate-planning-readiness",
    type: "website",
  },
};

const faqs = [
  {
    question: "What is an estate-planning readiness score?",
    answer:
      "It is a planning checklist, not a legal grade. The score reflects how many applicable foundation tasks you marked current and findable.",
  },
  {
    question: "Do I need a guardian nomination if I do not have minor children?",
    answer:
      "No. This checklist adds guardian nominations only for a household with minor children.",
  },
  {
    question: "Does a high score mean my Texas documents are valid?",
    answer:
      "No. The tool cannot inspect documents or confirm legal validity. Texas execution and form requirements still apply, and individual circumstances may require an attorney.",
  },
] as const;

export default function EstatePlanningReadinessPage() {
  const url = absoluteUrl("/tools/estate-planning-readiness");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Estate Planning Readiness Checklist",
        url,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "A free personalized Texas estate-planning readiness checklist and score.",
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
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: absoluteUrl("/tools"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Estate planning readiness",
            item: url,
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

      <section className="border-b border-[#E8E0D6] bg-[#F0EBE4]/55 px-6 py-8 md:py-10">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-[#7F7467]">
            <Link href="/" className="hover:text-[#2D2A26]">Home</Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <Link href="/tools" className="hover:text-[#2D2A26]">Tools</Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span>Readiness checklist</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5B7A5E]">
            Free personalized tool
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-[#2D2A26] md:text-5xl">
            How ready is your estate plan?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5B4F3E] md:text-lg">
            Get a situation-aware checklist, a simple readiness score, and your
            next three actions. No account or email is required to see the
            result.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#4A6A4D]">
            <span className="rounded-full bg-white px-3 py-1.5">About 3 minutes</span>
            <span className="rounded-full bg-white px-3 py-1.5">No email gate</span>
            <span className="rounded-full bg-white px-3 py-1.5">Privacy-safe analytics</span>
          </div>
        </div>
      </section>

      <section className="px-6 py-8 md:py-10">
        <div className="mx-auto max-w-3xl">
          <EstateReadinessChecklist />
        </div>
      </section>

      <section className="border-t border-[#E8E0D6] bg-white px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
            What this checklist covers
          </h2>
          <div className="mt-5 grid gap-5 text-sm leading-relaxed text-[#5B4F3E] md:grid-cols-3">
            <p>
              <strong className="block text-[#2D2A26]">After-death decisions</strong>
              A will, executor, guardian nominations when applicable,
              beneficiaries, and a useful asset inventory.
            </p>
            <p>
              <strong className="block text-[#2D2A26]">Incapacity decisions</strong>
              Financial authority, a medical decision-maker, and recorded
              healthcare wishes cover different jobs.
            </p>
            <p>
              <strong className="block text-[#2D2A26]">Plan maintenance</strong>
              A plan must stay coordinated, findable, and current after family,
              property, health, or relationship changes.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-[#D8CDBF] bg-[#F0EBE4]/55 p-6 text-sm leading-relaxed text-[#5B4F3E]">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Texas source starting points
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="https://tcss.legis.texas.gov/resources/ES/htm/ES.251.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#4A6A4D] underline underline-offset-2"
                >
                  Texas Estates Code Chapter 251: wills
                  <ExternalLink className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://tcss.legis.texas.gov/resources/ES/htm/ES.752.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#4A6A4D] underline underline-offset-2"
                >
                  Texas Estates Code Chapter 752: statutory durable power of attorney
                  <ExternalLink className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://statutes.capitol.texas.gov/Docs/HS/htm/HS.166.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#4A6A4D] underline underline-offset-2"
                >
                  Texas Health and Safety Code Chapter 166: advance directives
                  <ExternalLink className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
            <p className="mt-5 border-t border-[#D8CDBF] pt-4 text-xs">
              Last source-checked July 13, 2026. Educational only. WillBuddy is
              not a law firm and this checklist is not legal advice.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
            Frequently asked questions
          </h2>
          <div className="mt-5 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-[#E8E0D6] bg-white px-5 py-4">
                <summary className="cursor-pointer font-semibold text-[#2D2A26]">{faq.question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
