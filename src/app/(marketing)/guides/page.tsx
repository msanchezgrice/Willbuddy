import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CircleDollarSign, ListChecks } from "lucide-react";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Texas Estate Planning Guides",
  description:
    "Source-linked Texas estate-planning guides covering living trusts, costs, probate tradeoffs, and practical next steps.",
  alternates: { canonical: "/guides" },
};

const guides = [
  {
    title: "How a living trust works in Texas",
    description:
      "Understand creation, funding, probate, incapacity planning, maintenance, and when a trust conversation may be worthwhile.",
    href: "/guides/living-trust-texas",
    icon: BookOpen,
  },
  {
    title: "Fund a Texas living trust step by step",
    description:
      "Work through deeds, accounts, beneficiary designations, business interests, proof, and maintenance with a structured Texas checklist.",
    href: "/guides/living-trust-funding-checklist-texas",
    icon: ListChecks,
  },
  {
    title: "What a living trust may cost in Texas",
    description:
      "Separate preparation, funding, maintenance, and later administration costs without relying on a misleading one-price promise.",
    href: "/guides/living-trust-cost-texas",
    icon: CircleDollarSign,
  },
] as const;

export default function GuidesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
    ],
  };

  return (
    <main className="flex-1 px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="text-sm text-[#7F7467]">
          <Link href="/">Home</Link> <span aria-hidden="true">/</span>{" "}
          <span>Guides</span>
        </nav>

        <header className="mt-9 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5B7A5E]">
            Texas estate-planning guides
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-[#2D2A26] md:text-6xl">
            Learn the tradeoffs before choosing a path.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#5B4F3E]">
            These educational guides connect practical decisions to primary
            Texas legal sources. They are starting points for a conversation,
            not legal advice or a substitute for a licensed attorney.
          </p>
        </header>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-2xl border border-[#E8E0D6] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Icon className="h-6 w-6 text-[#5B7A5E]" aria-hidden="true" />
                <h2 className="mt-5 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
                  {guide.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">
                  {guide.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4A6A4D]">
                  Read the guide
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
