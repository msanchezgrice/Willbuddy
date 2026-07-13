import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Estate Planning Research",
  description: "Transparent estate-planning data, reports, sources, and research methods from WillBuddy.",
  alternates: { canonical: "/research" },
};

export default function ResearchPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Research", item: absoluteUrl("/research") },
  ] };
  return (
    <main className="flex-1 px-6 py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="text-sm text-[#7F7467]"><Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Research</span></nav>
        <p className="mt-9 text-sm font-semibold uppercase tracking-[0.18em] text-[#5B7A5E]">WillBuddy Research</p>
        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-[#2D2A26] md:text-6xl">Useful evidence, without pretending the data says more than it does.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#5B4F3E]">We publish source links, sample sizes, collection status, limitations, and the threshold a dataset must meet before we call it a finding.</p>
        <Link href="/research/texas-estate-planning-readiness" className="mt-12 block rounded-3xl border border-[#E8E0D6] bg-[#F7F4F0] p-7 transition hover:-translate-y-0.5 hover:shadow-md md:p-9">
          <BarChart3 className="h-7 w-7 text-[#5B7A5E]" aria-hidden="true" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#5B7A5E]">Collecting responses</p>
          <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">Texas Estate Planning Readiness Report</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#5B4F3E]">Read the sourced national baseline, inspect the Texas methodology, and contribute a privacy-minimizing anonymous response.</p>
          <span className="mt-5 inline-flex items-center gap-2 font-semibold text-[#4A6A4D]">Open the report <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </Link>
      </div>
    </main>
  );
}
