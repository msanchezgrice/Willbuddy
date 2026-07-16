import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { TexasIntestacyCalculator } from "@/components/tools/TexasIntestacyCalculator";
import { TEXAS_INTESTACY_SOURCES } from "@/lib/tools/texas-intestacy";
import { absoluteUrl, siteConfig } from "@/lib/site";

const canonicalPath = "/tools/texas-intestacy-calculator";
const reviewedOn = "2026-07-13";

const faqs = [
  {
    question: "Does a surviving spouse automatically inherit everything in Texas?",
    answer:
      "Not always. When someone dies without a valid will, the answer can change with descendants, whether every descendant is also the surviving spouse's descendant, and whether property is community property, separate personal property, or separate real property.",
  },
  {
    question: "Why does the calculator separate three property categories?",
    answer:
      "Texas Estates Code Sections 201.002 and 201.003 apply different rules to a community estate and to separate personal and real property. A single blended percentage can therefore be misleading.",
  },
  {
    question: "Does this determine legal heirship?",
    answer:
      "No. It is an educational visualization of selected Chapter 201 branches. Courts and licensed Texas attorneys use a fuller record that can include property title, marriages, parentage, adoption, prior deaths, beneficiary designations, debts, and other rights.",
  },
] as const;

export const metadata: Metadata = {
  title: "Texas Intestacy Calculator: Who Inherits Without a Will?",
  description:
    "Visualize selected Texas intestacy branches for spouses, descendants, community property, separate personal property, and separate real property.",
  alternates: { canonical: canonicalPath },
  openGraph: {
    title: "Texas Intestacy Calculator",
    description:
      "A source-backed visualizer for selected Texas inheritance branches when someone dies without a valid will.",
    url: canonicalPath,
    type: "website",
  },
};

export default function TexasIntestacyCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Texas Intestacy Calculator",
        url: absoluteUrl(canonicalPath),
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        description:
          "An educational visualizer for selected Texas intestacy branches under Estates Code Chapter 201.",
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
          { "@type": "ListItem", position: 3, name: "Texas intestacy calculator", item: absoluteUrl(canonicalPath) },
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

      <section className="border-b border-[#E8E0D6] bg-[#F0EBE4]/55 px-4 py-3 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-7 hidden text-sm text-[#7F7467] md:block">
            <Link href="/tools" className="inline-flex items-center gap-1.5 hover:text-[#2D2A26]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Estate-planning tools
            </Link>
          </nav>
          <p className="hidden font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#7F7467] md:block">
            Texas Estates Code Chapter 201
          </p>
          <h1 className="mt-1 max-w-4xl font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight text-[#2D2A26] md:mt-4 md:text-6xl">
            Who could inherit your home and savings in Texas if you die without a will?
          </h1>
          <p className="mt-2 text-sm font-semibold text-[#304733] md:mt-4 md:text-base">
            Free · No signup · See the simplified map in about two minutes
          </p>
          <p className="mt-6 hidden max-w-3xl text-lg leading-relaxed text-[#5B4F3E] md:block">
            Trace a simplified family tree across the three property categories
            that people often blur together. The result shows why “the spouse
            gets everything” is not a safe universal rule.
          </p>
          <p className="mt-5 hidden max-w-3xl rounded-xl border border-[#D8CDBF] bg-white/80 px-4 py-3 text-sm leading-relaxed text-[#5B4F3E] md:block">
            <strong className="text-[#2D2A26]">Educational tool:</strong> Source-checked
            by the WillBuddy Editorial Team on July 13, 2026. Not attorney-reviewed.
            WillBuddy is not a law firm and does not provide legal advice or determine heirship.
          </p>
        </div>
      </section>

      <section id="calculator" className="px-3 py-3 sm:px-6 md:py-16" aria-label="Texas intestacy calculator">
        <div className="mx-auto max-w-6xl">
          <TexasIntestacyCalculator />
          <p className="mt-2 text-center text-xs text-[#6F655A] md:hidden">
            Educational only · Not legal advice
          </p>
        </div>
      </section>

      <article className="px-6 pb-20">
        <div className="mx-auto max-w-4xl space-y-14">
          <section aria-labelledby="read-map-heading">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#5B7A5E]">How to read the map</p>
            <h2 id="read-map-heading" className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Start with ownership, then apply the family branch
            </h2>
            <div className="mt-6 grid gap-6 text-sm leading-relaxed text-[#5B4F3E] md:grid-cols-3">
              <div className="border-t-2 border-[#5B7A5E] pt-4">
                <h3 className="font-bold text-[#2D2A26]">Community property</h3>
                <p className="mt-2">
                  The visualizer shows the decedent&apos;s community interest as the
                  100% being distributed. A surviving spouse normally already owns
                  their own community interest; the note below the result preserves
                  that distinction.
                </p>
              </div>
              <div className="border-t-2 border-[#B07A53] pt-4">
                <h3 className="font-bold text-[#2D2A26]">Separate personal property</h3>
                <p className="mt-2">
                  With a spouse and descendants, Section 201.002 gives the spouse
                  one-third of separate personal property and descendants the other
                  two-thirds. Without descendants, the spouse&apos;s branch changes.
                </p>
              </div>
              <div className="border-t-2 border-[#7F7467] pt-4">
                <h3 className="font-bold text-[#2D2A26]">Separate real property</h3>
                <p className="mt-2">
                  A spouse&apos;s one-third interest alongside descendants is a life
                  estate, while descendants hold the remainder. That is legally and
                  practically different from dividing a house into three outright shares.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-[1.25fr_0.75fr]" aria-labelledby="limits-heading">
            <div>
              <h2 id="limits-heading" className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
                Facts this short calculator cannot resolve
              </h2>
              <p className="mt-5 leading-relaxed text-[#5B4F3E]">
                A real heirship analysis begins before percentages. It identifies
                what the decedent owned, how title was held, whether a beneficiary
                designation or survivorship agreement controls, and whether a valid
                will or trust applies. It then builds a documented family tree.
                Homestead rights, exempt property, family allowance, debts, adoption,
                parentage, half-blood kin, and relatives who died earlier can all matter.
              </p>
              <p className="mt-4 leading-relaxed text-[#5B4F3E]">
                Use this result to spot questions for a licensed Texas probate
                attorney—not to transfer, sell, or distribute an asset. For the
                broader planning picture, read the{" "}
                <Link href="/blog/dying-without-a-will-in-texas" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                  Texas guide to dying without a will
                </Link>{" "}
                or return to the{" "}
                <Link href="/texas-estate-planning" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                  Texas estate-planning library
                </Link>.
              </p>
            </div>
            <aside className="rounded-2xl border border-[#D8CDBF] bg-[#F0EBE4]/55 p-5">
              <h3 className="font-bold text-[#2D2A26]">Primary legal sources</h3>
              <ul className="mt-4 space-y-3">
                {TEXAS_INTESTACY_SOURCES.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm font-medium leading-relaxed text-[#4A6A4D] underline decoration-[#5B7A5E]/35 underline-offset-2 hover:text-[#2D2A26]">
                      {source.label}
                      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">Texas intestacy questions</h2>
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
