import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, ClipboardCheck, GitBranch, Scale, Stethoscope } from "lucide-react";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Texas Estate Planning Tools",
  description: "Free, source-linked tools for Texas intestacy, estate-planning costs, powers of attorney, plan readiness, and will-versus-trust decisions.",
  alternates: { canonical: "/tools" },
};

const tools = [
  { title: "Texas intestacy visualizer", description: "See how spouse, descendant, and property-type branches can change the statutory starting point when someone dies without a will.", href: "/tools/texas-intestacy-calculator", icon: GitBranch },
  { title: "Estate-planning cost calculator", description: "Compare editable preparation and administration cost assumptions without a fake one-number promise.", href: "/tools/texas-estate-planning-cost-calculator", icon: Calculator },
  { title: "Texas document navigator", description: "Map financial authority, healthcare decisions, treatment wishes, privacy access, and guardian preferences to distinct documents.", href: "/tools/texas-power-of-attorney-navigator", icon: Stethoscope },
  { title: "Estate-planning readiness checklist", description: "Get a private, personalized gap list and next-step order before deciding whether to create an account.", href: "/tools/estate-planning-readiness", icon: ClipboardCheck },
  { title: "Texas will vs. trust decision tool", description: "Work through probate, incapacity, privacy, property, and maintenance tradeoffs inside our definitive comparison guide.", href: "/blog/wills-vs-trusts-texas", icon: Scale },
] as const;

export default function ToolsPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
  ] };
  return (
    <main className="flex-1 px-6 py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="text-sm text-[#7F7467]"><Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Tools</span></nav>
        <header className="mt-9 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5B7A5E]">Free Texas planning tools</p>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-[#2D2A26] md:text-6xl">Turn estate-planning questions into decisions.</h1>
          <p className="mt-6 text-lg leading-relaxed text-[#5B4F3E]">Each tool gives you a useful result before any signup. Results are educational starting points, not legal advice or a substitute for a Texas attorney reviewing your facts.</p>
        </header>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-[#E8E0D6] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <Icon className="h-6 w-6 text-[#5B7A5E]" aria-hidden="true" />
              <h2 className="mt-5 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">{tool.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">{tool.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4A6A4D]">Use the tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
            </Link>;
          })}
        </div>
      </div>
    </main>
  );
}
