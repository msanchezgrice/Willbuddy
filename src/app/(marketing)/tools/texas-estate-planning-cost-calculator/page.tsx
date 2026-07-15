import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { TexasEstateCostCalculator } from "@/components/tools/TexasEstateCostCalculator";
import { DEFAULT_COST_ASSUMPTIONS } from "@/lib/tools/texas-estate-costs";
import { absoluteUrl, siteConfig } from "@/lib/site";

const canonicalPath = "/tools/texas-estate-planning-cost-calculator";
const reviewedOn = "2026-07-13";
const faqs = [
  {
    question: "How much does a will cost in Texas?",
    answer:
      "There is no single Texas price. Cost depends on provider, scope, family and asset complexity, tax issues, and whether coordinated powers of attorney, directives, or trust planning are included. This calculator uses editable assumptions instead of a statewide average.",
  },
  {
    question: "Does a living trust avoid all probate costs in Texas?",
    answer:
      "Not automatically. A trust controls only property connected to it under applicable law, and costs can still arise from unfunded assets, disputes, debts, taxes, administration, or other procedures.",
  },
  {
    question: "Is Texas probate always a percentage of the estate?",
    answer:
      "No. The percentage input is a visitor-controlled modeling shortcut, not a Texas fee formula. Court costs, attorney fees, representative compensation, appraisal, bonds, tax work, property issues, and disputes can follow different rules.",
  },
] as const;

export const metadata: Metadata = {
  title: "Texas Estate Planning Cost Calculator",
  description:
    "Compare editable cost ranges for a Texas will plan, living-trust preparation and funding, and a probate-path illustration without false savings claims.",
  alternates: { canonical: canonicalPath },
  openGraph: {
    title: "Texas Estate Planning Cost Calculator",
    description:
      "Model transparent, editable ranges for wills, living trusts, funding work, and probate-related paths in Texas.",
    url: canonicalPath,
    type: "website",
  },
};

export default function TexasEstatePlanningCostCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Texas Estate Planning Cost Calculator",
        url: absoluteUrl(canonicalPath),
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        publisher: { "@type": "Organization", name: siteConfig.name },
        dateModified: reviewedOn,
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
          { "@type": "ListItem", position: 3, name: "Texas estate-planning cost calculator", item: absoluteUrl(canonicalPath) },
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
      <section className="border-b border-[#E8E0D6] bg-[#F0EBE4]/55 px-4 py-4 sm:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-7 hidden text-sm text-[#7F7467] md:block">
            <Link href="/tools" className="inline-flex items-center gap-1.5 hover:text-[#2D2A26]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Estate-planning tools
            </Link>
          </nav>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B7A5E] md:text-xs">
            Will · trust · probate paths
          </p>
          <h1 className="mt-1 max-w-4xl font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight text-[#2D2A26] md:mt-4 md:text-6xl">
            Compare Texas estate-planning cost ranges without fake precision.
          </h1>
          <p className="mt-2 text-sm font-semibold text-[#304733] md:mt-4 md:text-base">
            Free · No signup · Get a first comparison in about two minutes
          </p>
          <p className="mt-6 hidden max-w-3xl text-lg leading-relaxed text-[#5B4F3E] md:block">
            Edit every assumption and see preparation and potential later
            administration on separate rows. The calculator will not declare a
            winner, manufacture a “savings” number, or call an illustration a quote.
          </p>
          <p className="mt-5 hidden max-w-3xl rounded-xl border border-[#D8CDBF] bg-white/80 px-4 py-3 text-sm leading-relaxed text-[#5B4F3E] md:block">
            <strong className="text-[#2D2A26]">Planning aid:</strong> Source-checked
            by the WillBuddy Editorial Team on July 13, 2026. Not attorney-reviewed.
            WillBuddy is not a law firm, accounting firm, financial adviser, or fee-quote service.
          </p>
        </div>
      </section>

      <section id="calculator" className="px-3 py-3 sm:px-6 md:py-16" aria-label="Texas estate-planning cost calculator">
        <div className="mx-auto max-w-6xl">
          <TexasEstateCostCalculator />
        </div>
      </section>

      <article className="px-6 pb-20">
        <div className="mx-auto max-w-4xl space-y-14">
          <section aria-labelledby="method-heading">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#5B7A5E]">Transparent methodology</p>
            <h2 id="method-heading" className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              What the calculator actually does
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E8E0D6] bg-white p-5">
                <h3 className="font-bold text-[#2D2A26]">Adds ranges you control</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5B4F3E]">
                  Low assumptions add to a low result; high assumptions add to a
                  high result. The trust row combines preparation and funding.
                  The will-plus-probate row combines different time periods only
                  for context—not as a prediction that probate will occur.
                </p>
              </div>
              <div className="rounded-2xl border border-[#E8E0D6] bg-white p-5">
                <h3 className="font-bold text-[#2D2A26]">Uses no universal Texas percentage</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5B4F3E]">
                  The probate illustration adds your fixed range to your chosen
                  percentage of estate value. Texas does not impose one universal
                  probate percentage. Set it to zero if the shortcut is not useful.
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[#5B4F3E]">
              Prefilled amounts are editable illustrations, not observed Texas
              averages, WillBuddy prices, legal-fee estimates, or promises. Ask
              providers for written scope and pricing. A will alone is not the
              same scope as a coordinated plan, and signing a trust is not the
              same task as funding it.
            </p>
          </section>

          <section className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]" aria-labelledby="source-heading">
            <div>
              <h2 id="source-heading" className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
                Legal context behind the model
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[#5B4F3E]">
                Texas court costs and filing fees are only one slice of estate
                administration. Representative compensation has statutory rules
                and exclusions. Trust planning also requires attention to property
                transfer: a signed trust document does not move every asset into it.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#5B4F3E]">
                For structure rather than price, compare a{" "}
                <Link href="/blog/wills-vs-trusts-texas" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                  Texas will and living trust
                </Link>{" "}
                and review the{" "}
                <Link href="/texas-estate-planning" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                  Texas estate-planning library
                </Link>.
              </p>
            </div>
            <aside className="rounded-2xl border border-[#D8CDBF] bg-[#F0EBE4]/55 p-5">
              <h3 className="font-bold text-[#2D2A26]">Methodology sources</h3>
              <ul className="mt-4 space-y-5">
                {DEFAULT_COST_ASSUMPTIONS.sourceNotes.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm font-semibold leading-relaxed text-[#4A6A4D] underline decoration-[#5B7A5E]/35 underline-offset-2 hover:text-[#2D2A26]">
                      {source.label}
                      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="mt-1 text-xs leading-relaxed text-[#6A5D4E]">{source.note}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <section aria-labelledby="cost-faq-heading">
            <h2 id="cost-faq-heading" className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">Texas estate-planning cost questions</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-xl border border-[#E8E0D6] bg-white px-5 py-4">
                  <summary className="cursor-pointer font-semibold text-[#2D2A26]">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
