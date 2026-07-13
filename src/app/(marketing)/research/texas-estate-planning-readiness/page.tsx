import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { TexasReadinessSurvey } from "@/components/research/TexasReadinessSurvey";
import { absoluteUrl, siteConfig } from "@/lib/site";

const publishedOn = "2026-07-13";

export const metadata: Metadata = {
  title: "Texas Estate Planning Readiness Report",
  description: "A transparent, evolving study of estate-planning readiness, with sourced national benchmarks and a privacy-minimizing Texas data-collection methodology.",
  alternates: { canonical: "/research/texas-estate-planning-readiness" },
  openGraph: {
    title: "Texas Estate Planning Readiness Report",
    description: "National benchmarks, an open methodology, and a privacy-minimizing Texas readiness survey.",
    url: "/research/texas-estate-planning-readiness",
    type: "article",
    publishedTime: publishedOn,
    modifiedTime: publishedOn,
  },
};

const benchmarks = [
  { value: "32%", label: "of U.S. adults reported having a will", source: "Pew Research Center, 2025", href: "https://www.pewresearch.org/social-trends/2025/11/06/experiences-with-estate-planning-and-discussing-end-of-life-preferences/" },
  { value: "31%", label: "reported having a living will or advance directive", source: "Pew Research Center, 2025", href: "https://www.pewresearch.org/social-trends/2025/11/06/experiences-with-estate-planning-and-discussing-end-of-life-preferences/" },
  { value: "56%", label: "reported having none of five core planning documents", source: "Trust & Will, 2026", href: "https://trustandwill.com/learn/estate-planning-report-2026" },
  { value: "42%", label: "said they would not know what to do if a family member died today", source: "Trust & Will, 2026", href: "https://trustandwill.com/learn/estate-planning-report-2026" },
] as const;

export default function TexasReadinessReportPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Report",
        name: "Texas Estate Planning Readiness Report",
        datePublished: publishedOn,
        dateModified: publishedOn,
        author: { "@type": "Organization", name: "WillBuddy Editorial Team" },
        publisher: { "@type": "Organization", name: siteConfig.name },
        url: absoluteUrl("/research/texas-estate-planning-readiness"),
        description: "An evolving report that separates sourced national benchmarks from Texas responses still being collected.",
      },
      {
        "@type": "DataCatalog",
        name: "WillBuddy Texas Estate Planning Readiness Research",
        description: "A planned aggregate dataset of account-unlinked multiple-choice readiness responses from Texas adults. Publication begins only after the stated minimum sample threshold.",
        url: absoluteUrl("/research/texas-estate-planning-readiness"),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Research", item: absoluteUrl("/research") },
          { "@type": "ListItem", position: 3, name: "Texas readiness report", item: absoluteUrl("/research/texas-estate-planning-readiness") },
        ],
      },
    ],
  };

  return (
    <main className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="order-1 border-b border-[#E8E0D6] bg-[#F0EBE4]/55 px-4 py-3 md:px-6 md:py-14">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-7 hidden text-sm text-[#7F7467] md:block">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/research">Research</Link> <span aria-hidden="true">/</span> <span>Readiness report</span>
          </nav>
          <div className="inline-flex rounded-full bg-[#DDE8DE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A6A4D] md:px-4 md:py-2 md:text-xs">Data collection in progress</div>
          <h1 className="mt-1 max-w-3xl font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight text-[#2D2A26] md:mt-5 md:text-5xl">Texas Estate Planning Readiness Report</h1>
          <p className="mt-4 hidden max-w-3xl text-lg leading-relaxed text-[#5B4F3E] md:block">A living research project designed to measure whether Texans have made, updated, and communicated the decisions their families may need.</p>
          <Link
            href="#readiness-survey"
            className="mt-5 hidden min-h-11 items-center rounded-full bg-[#5B7A5E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4A6A4D] md:inline-flex"
          >
            Help by answering five questions
          </Link>
          <div className="mt-5 hidden rounded-2xl border border-[#D8CDBF] bg-white/80 p-4 text-sm leading-relaxed text-[#5B4F3E] md:block"><strong className="text-[#2D2A26]">Status and editorial note:</strong> No original Texas findings are published yet. The figures below are clearly labeled national baselines. This page was source-checked July 13, 2026 and was not attorney-reviewed. WillBuddy is not a law firm and does not provide legal advice.</div>
        </div>
      </section>

      <section className="order-3 px-6 py-12 md:order-2 md:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">National context, not Texas estimates</p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">The documented readiness gap</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-[#5B4F3E]">These studies use different questions, field dates, and samples, so their percentages should not be merged or treated as a Texas estimate.</p>
          <div className="mt-9 grid gap-5 sm:grid-cols-2">
            {benchmarks.map((item) => (
              <article key={`${item.value}-${item.label}`} className="rounded-2xl border border-[#E8E0D6] bg-white p-6">
                <p className="font-[family-name:var(--font-heading)] text-4xl font-bold text-[#5B7A5E]">{item.value}</p>
                <p className="mt-2 leading-relaxed text-[#2D2A26]">{item.label}</p>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#4A6A4D] underline underline-offset-2">{item.source}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
              </article>
            ))}
          </div>
          <div className="mt-7 grid gap-4 rounded-2xl bg-[#F7F4F0] p-6 text-sm leading-relaxed text-[#5B4F3E] md:grid-cols-2">
            <p><strong className="text-[#2D2A26]">Pew sample size:</strong> 8,750 U.S. adults surveyed September 2–8, 2025.</p>
            <p><strong className="text-[#2D2A26]">Trust & Will sample size:</strong> 5,000 U.S. adults surveyed January 28–February 5, 2026.</p>
          </div>
        </div>
      </section>

      <section id="contribute" className="order-2 scroll-mt-6 bg-[#F0EBE4]/45 px-3 py-3 md:order-3 md:px-6 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="max-w-2xl">
            <p className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7A5E] md:block">Help us understand readiness in Texas</p>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26] md:mt-3 md:text-3xl">Answer five questions to help build the report</h2>
            <p className="mt-4 hidden leading-relaxed text-[#5B4F3E] md:block">
              This short account-unlinked survey helps us understand which planning
              decisions Texans have completed and where people get stuck. It
              contributes to research; it is not the personalized readiness
              quiz.
            </p>
            <Link
              href="/tools/estate-planning-readiness"
              className="mt-4 hidden text-sm font-semibold text-[#4A6A4D] underline underline-offset-2 md:inline-flex"
            >
              Looking for your personal score? Use the readiness quiz →
            </Link>
          </div>

          <div className="mt-3 md:mt-8">
            <TexasReadinessSurvey />
          </div>

          <aside className="mt-8 rounded-2xl border border-[#D8CDBF] bg-white/65 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">How we will use the answers</p>
            <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">Open methodology and privacy limits</h3>
            <ul className="mt-5 grid gap-4 text-sm leading-relaxed text-[#5B4F3E] md:grid-cols-2">
              <li><strong className="text-[#2D2A26]">Eligibility:</strong> self-identified Texas adults who voluntarily reach this page.</li>
              <li><strong className="text-[#2D2A26]">Questions:</strong> five multiple-choice readiness questions; no names, emails, asset values, or document text.</li>
              <li><strong className="text-[#2D2A26]">Publication threshold:</strong> a minimum of 200 complete responses before any Texas aggregate is reported.</li>
              <li><strong className="text-[#2D2A26]">Small-group rule:</strong> no subgroup result with fewer than 25 responses.</li>
              <li className="md:col-span-2"><strong className="text-[#2D2A26]">Limitations:</strong> this is a voluntary convenience sample, not a representative poll. Results will not be weighted or generalized to all Texans.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
