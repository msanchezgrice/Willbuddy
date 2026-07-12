import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ExternalLink } from "lucide-react";
import { absoluteUrl, siteConfig } from "@/lib/site";

const publishedOn = "2026-07-12";

const guides = [
  {
    eyebrow: "Intestacy",
    title: "What happens without a Texas will",
    description:
      "Follow the spouse, descendants, community-property, and separate-property branches without relying on family myths.",
    href: "/blog/dying-without-a-will-in-texas",
  },
  {
    eyebrow: "Executor",
    title: "Choose who will administer the estate",
    description:
      "Compare eligibility, reliability, conflict tolerance, independent administration, and backup candidates.",
    href: "/blog/naming-an-executor",
  },
  {
    eyebrow: "Minor children",
    title: "Choose primary and alternate guardians",
    description:
      "Use a child-centered process and understand the court's qualification and best-interest review.",
    href: "/blog/choosing-a-guardian",
  },
  {
    eyebrow: "Plan structure",
    title: "Compare a Texas will and trust",
    description:
      "Separate probate instructions and guardian nominations from property actually held under a trust.",
    href: "/blog/wills-vs-trusts-texas",
  },
  {
    eyebrow: "Financial incapacity",
    title: "Build a durable power of attorney",
    description:
      "Choose an agent, timing, scope, safeguards, and successor for lifetime property and financial authority.",
    href: "/blog/durable-power-of-attorney",
  },
  {
    eyebrow: "Healthcare",
    title: "Pair a medical power of attorney and living will",
    description:
      "Name a healthcare decision-maker and record treatment preferences using current Texas HHS materials.",
    href: "/blog/medical-power-of-attorney-living-will",
  },
] as const;

const faqs = [
  {
    question: "Can I make a Texas will online?",
    answer:
      "A service can help organize or produce a document, but the final will still must satisfy Texas execution law. A typed will generally requires the statutory signature and witness process; a holographic will follows a different rule.",
    sourceUrl:
      "https://tcss.legis.texas.gov/resources/ES/htm/ES.251.htm",
    sourceLabel: "Texas Estates Code Chapter 251",
  },
  {
    question: "Does a Texas will have to be notarized?",
    answer:
      "Notarization and will validity are not the same question. Texas law separately addresses execution and self-proving wills, so follow the current statute and legal guidance for the exact document being signed.",
    sourceUrl:
      "https://tcss.legis.texas.gov/resources/ES/htm/ES.251.htm",
    sourceLabel: "Texas Estates Code Chapter 251",
  },
  {
    question: "Should parents choose a guardian or executor first?",
    answer:
      "Treat them as separate decisions. A guardian cares for a child under the court's appointment, while an executor administers the probate estate after court appointment and qualification.",
    sourceUrl:
      "https://tcss.legis.texas.gov/resources/ES/htm/ES.1104.htm",
    sourceLabel: "Texas Estates Code Chapter 1104",
  },
  {
    question: "Do I need both financial and medical powers of attorney?",
    answer:
      "They cover different authority. The Texas statutory durable power of attorney concerns property and finances; a medical power of attorney is governed separately by the Advance Directives Act.",
    sourceUrl:
      "https://tcss.legis.texas.gov/resources/ES/htm/ES.752.htm",
    sourceLabel: "Texas Estates Code Chapter 752",
  },
] as const;

export const metadata: Metadata = {
  title: "Texas Estate Planning Guide",
  description:
    "Build a Texas estate-planning checklist covering wills, intestacy, executors, guardians, trusts, durable powers of attorney, and healthcare directives.",
  alternates: { canonical: "/texas-estate-planning" },
  openGraph: {
    title: "Texas Estate Planning Guide",
    description:
      "A source-backed planning hub for Texas wills, guardians, executors, powers of attorney, trusts, and healthcare directives.",
    url: "/texas-estate-planning",
    type: "article",
    publishedTime: publishedOn,
    modifiedTime: publishedOn,
    authors: ["WillBuddy Editorial Team"],
  },
};

function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[#4A6A4D] underline decoration-[#5B7A5E]/40 underline-offset-2 hover:text-[#2D2A26]"
    >
      {children}
    </a>
  );
}

export default function TexasEstatePlanningPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${absoluteUrl("/texas-estate-planning")}#article`,
        headline: "Texas Estate Planning Guide",
        description:
          "A source-backed planning hub for Texas wills, guardians, executors, powers of attorney, trusts, and healthcare directives.",
        datePublished: publishedOn,
        dateModified: publishedOn,
        author: { "@type": "Organization", name: "WillBuddy Editorial Team" },
        publisher: { "@type": "Organization", name: siteConfig.name },
        mainEntityOfPage: absoluteUrl("/texas-estate-planning"),
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
            name: "Texas estate planning",
            item: absoluteUrl("/texas-estate-planning"),
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

      <section className="border-b border-[#E8E0D6] bg-[#F0EBE4]/55 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-7 text-sm text-[#7F7467]">
            <Link href="/" className="hover:text-[#2D2A26]">
              Home
            </Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span>Texas estate planning</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5B7A5E]">
            Texas planning library
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-[#2D2A26] md:text-6xl">
            Build the decisions before you build the documents.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#5B4F3E]">
            A useful Texas estate plan coordinates what happens at death, who
            acts during incapacity, who cares for minor children, and how the
            people you choose find the information they need.
          </p>
          <div className="mt-8 max-w-2xl rounded-2xl border border-[#D8CDBF] bg-white/80 p-5 text-sm leading-relaxed text-[#5B4F3E]">
            <strong className="text-[#2D2A26]">Editorial note:</strong> Written
            and source-checked by the WillBuddy Editorial Team on July 12,
            2026. This guide was not attorney-reviewed. WillBuddy is not a law firm
            and does not provide legal advice.
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">
              The legal foundation
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Seven connected decisions
            </h2>
            <p className="mt-5 leading-relaxed text-[#5B4F3E]">
              Texas does not place every planning issue in one document. Will
              execution is governed by the Estates Code, intestacy has its own
              distribution chapter, trusts are governed by the Property Code,
              and healthcare directives sit in the Health and Safety Code.
              Start with the jobs below, then have a licensed Texas attorney
              fit the documents to your facts.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <DecisionCard number="01" title="Make a valid will-signing plan">
              A non-holographic Texas will generally must be signed as the
              statute directs and attested by two or more credible witnesses
              age 14 or older who sign in the testator&apos;s presence. A will
              wholly in the testator&apos;s handwriting follows a different
              statutory rule. Read{" "}
              <SourceLink href="https://tcss.legis.texas.gov/resources/ES/htm/ES.251.htm">
                Texas Estates Code Chapter 251
              </SourceLink>
              .
            </DecisionCard>
            <DecisionCard number="02" title="Compare your wishes with intestacy">
              Texas&apos;s default shares depend on a spouse, descendants, and
              whether property is community or separate property. Follow the
              actual branches in{" "}
              <SourceLink href="https://tcss.legis.texas.gov/resources/ES/htm/ES.201.htm">
                Texas Estates Code Chapter 201
              </SourceLink>{" "}
              and the{" "}
              <SourceLink href="https://www.sll.texas.gov/faqs/intestate-succession/">
                Texas State Law Library overview
              </SourceLink>
              .
            </DecisionCard>
            <DecisionCard number="03" title="Choose an executor and alternate">
              The executor named in the will has first priority in Texas&apos;s
              appointment order, subject to qualification and court
              appointment. Review candidate eligibility in{" "}
              <SourceLink href="https://tcss.legis.texas.gov/resources/ES/htm/ES.304.htm">
                Texas Estates Code Chapter 304
              </SourceLink>
              .
            </DecisionCard>
            <DecisionCard number="04" title="Choose guardians for minor children">
              A surviving parent may designate an eligible guardian by will or
              qualifying declaration, while the court retains the statutory
              disqualification and best-interest review. See{" "}
              <SourceLink href="https://tcss.legis.texas.gov/resources/ES/htm/ES.1104.htm">
                Texas Estates Code Section 1104.053
              </SourceLink>
              .
            </DecisionCard>
            <DecisionCard number="05" title="Choose a lifetime financial agent">
              A durable power of attorney grants financial and property
              authority under its terms and the Texas durability requirements;
              it is not a medical authorization. See{" "}
              <SourceLink href="https://tcss.legis.texas.gov/resources/ES/htm/ES.751.htm">
                Texas Estates Code Chapter 751
              </SourceLink>{" "}
              and the{" "}
              <SourceLink href="https://tcss.legis.texas.gov/resources/ES/htm/ES.752.htm">
                statutory form in Chapter 752
              </SourceLink>
              .
            </DecisionCard>
            <DecisionCard number="06" title="Record healthcare authority and wishes">
              Texas&apos;s medical power of attorney names an agent, while the
              directive to physicians records choices for defined terminal or
              irreversible conditions. Use current{" "}
              <SourceLink href="https://www.hhs.texas.gov/regulations/forms/advance-directives/medical-power-attorney-designation-health-care-agent-mpoa">
                Texas HHS
              </SourceLink>{" "}
              forms and{" "}
              <SourceLink href="https://tcss.legis.texas.gov/resources/HS/htm/HS.166.htm">
                Health and Safety Code Chapter 166
              </SourceLink>
              .
            </DecisionCard>
            <DecisionCard number="07" title="Decide whether a trust has a job">
              A Texas trust requires intent and trust property under the
              statutory creation rules. Signing a document does not answer how
              every asset will be transferred or titled. Review{" "}
              <SourceLink href="https://tcss.legis.texas.gov/resources/PR/htm/PR.112.htm">
                Texas Property Code Chapter 112
              </SourceLink>{" "}
              with counsel.
            </DecisionCard>
          </div>
        </div>
      </section>

      <section className="bg-[#F0EBE4]/55 px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">
              Online wills in Texas
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              The screen is not the signing ceremony.
            </h2>
            <p className="mt-5 leading-relaxed text-[#5B4F3E]">
              An online workflow can help organize decisions or produce a
              document, but it does not replace Texas execution requirements.
              Typed and holographic wills follow different rules under{" "}
              <SourceLink href="https://tcss.legis.texas.gov/resources/ES/htm/ES.251.htm">
                Chapter 251
              </SourceLink>
              . Follow the current instructions for the exact will, witnesses,
              signatures, and any self-proving affidavit.
            </p>
            <p className="mt-4 leading-relaxed text-[#5B4F3E]">
              The Texas Judicial Branch publishes Supreme Court-approved will
              forms for several common family structures on its{" "}
              <SourceLink href="https://txcourts.gov/forms/">
                official forms page
              </SourceLink>
              . The{" "}
              <SourceLink href="https://www.sll.texas.gov/faqs/simple-will-forms/">
                Texas State Law Library
              </SourceLink>{" "}
              points to those forms and recommends lawyer review regardless of
              the situation.
            </p>
          </div>
          <div className="rounded-2xl border border-[#D8CDBF] bg-white p-6">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Bring this packet to counsel
            </h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#5B4F3E]">
              {[
                "Family tree, including prior relationships and deceased descendants",
                "Asset, debt, title, and beneficiary-designation inventory",
                "Executor, guardian, financial-agent, and healthcare-agent candidates",
                "Distribution wishes and concerns about vulnerable beneficiaries",
                "Existing wills, trusts, powers, directives, deeds, and marital agreements",
                "Questions about business interests, out-of-state property, taxes, or benefits",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#5B7A5E]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">
                Go deeper
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
                Six Texas decision guides
              </h2>
            </div>
            <BookOpen className="hidden h-8 w-8 text-[#9B8E7E] md:block" />
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-2xl border border-[#E8E0D6] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5B7A5E]">
                  {guide.eyebrow}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26] group-hover:text-[#4A6A4D]">
                  {guide.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">
                  {guide.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5B7A5E]">
                  Read the guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E8E0D6] bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
            Frequently asked questions
          </h2>
          <div className="mt-7 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-2xl border border-[#E8E0D6] bg-[#FAF8F5] px-5 py-4"
              >
                <summary className="cursor-pointer font-semibold text-[#2D2A26]">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">
                  {faq.answer}
                </p>
                <a
                  href={faq.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#5B7A5E] underline underline-offset-2"
                >
                  {faq.sourceLabel}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#5B7A5E] px-7 py-10 text-center text-white md:px-12">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl">
            Turn the checklist into an attorney conversation.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/90">
            WillBuddy helps organize your decisions and produce Texas planning
            drafts. It does not replace legal advice, attorney review, or proper
            execution of your final documents.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-[#2D2A26] transition hover:-translate-y-0.5"
          >
            Organize my decisions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function DecisionCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-[#E8E0D6] bg-white p-6">
      <span className="text-xs font-bold tracking-[0.15em] text-[#9B8E7E]">
        {number}
      </span>
      <h3 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">{children}</p>
    </article>
  );
}
