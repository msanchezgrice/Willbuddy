import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { absoluteUrl, siteConfig } from "@/lib/site";

const canonicalPath = "/guides/living-trust-funding-checklist-texas";
const reviewedOn = "2026-07-21";

const sources = {
  trusts: "https://statutes.capitol.texas.gov/Docs/PR/htm/PR.112.htm",
  wills: "https://statutes.capitol.texas.gov/Docs/ES/htm/ES.251.htm",
  intestacy: "https://statutes.capitol.texas.gov/Docs/ES/htm/ES.201.htm",
  probate: "https://www.sll.texas.gov/faqs/?category=Wills+%26+Estates",
};

const faqs = [
  {
    question: "Does signing a Texas living trust fund it?",
    answer:
      "No. Signing creates the trust document, but assets follow title and beneficiary designations, not the binder on the shelf. Each asset generally needs its own step—a deed, an account change, an assignment, or a beneficiary review—before it is connected to the trust.",
  },
  {
    question: "Should retirement accounts be retitled into a living trust?",
    answer:
      "Usually the analysis runs through beneficiary designations rather than retitling, and the wrong move can carry tax consequences. Review each account with a Texas attorney and a tax professional before changing ownership or beneficiaries.",
  },
  {
    question: "What happens to assets left out of the trust?",
    answer:
      "Property left outside the trust follows its own path: a valid pour-over or traditional will, a beneficiary designation, a survivorship arrangement, or Texas intestacy if none applies. A pour-over will still must satisfy Texas will-execution law.",
  },
  {
    question: "How often should a Texas trust funding review happen?",
    answer:
      "Review funding after buying or selling property, opening or closing accounts, refinancing, changing jobs or retirement accounts, starting or selling a business, and after marriage, divorce, birth, or death in the family.",
  },
] as const;

export const metadata: Metadata = {
  title: "Texas Living Trust Funding Checklist: Connect Every Asset",
  description:
    "A source-backed Texas checklist for funding a living trust: real estate deeds, accounts, beneficiary designations, business interests, proof, and maintenance.",
  alternates: { canonical: canonicalPath },
  openGraph: {
    title: "Texas Living Trust Funding Checklist",
    description:
      "The signed trust is step one. Use this structured Texas checklist to connect real estate, accounts, and beneficiary designations to the plan.",
    type: "article",
    url: canonicalPath,
    publishedTime: reviewedOn,
    modifiedTime: reviewedOn,
    authors: ["WillBuddy Editorial Team"],
  },
};

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-[#4A6A4D] underline decoration-[#5B7A5E]/35 underline-offset-2"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

export default function LivingTrustFundingChecklistTexasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Texas Living Trust Funding Checklist: Connect Every Asset",
        description:
          "A structured, source-backed checklist for funding a Texas living trust across real estate, accounts, beneficiary designations, and business interests.",
        datePublished: reviewedOn,
        dateModified: reviewedOn,
        author: { "@type": "Organization", name: "WillBuddy Editorial Team" },
        publisher: { "@type": "Organization", name: siteConfig.name },
        mainEntityOfPage: absoluteUrl(canonicalPath),
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
          { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
          {
            "@type": "ListItem",
            position: 3,
            name: "Texas living trust funding checklist",
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

      <header className="border-b border-[#E8E0D6] bg-[#F0EBE4]/60 px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-[#7F7467]">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span>{" "}
            <Link href="/guides">Guides</Link> <span aria-hidden="true">/</span>{" "}
            <span>Texas living trust funding checklist</span>
          </nav>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#5B7A5E]">
            Texas trust funding checklist
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-[#2D2A26] md:text-6xl">
            Funding a Texas living trust means changing who or what owns each asset.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#5B4F3E]">
            Direct answer: a signed trust agreement does not move property into
            the trust by itself. Funding is the separate, asset-by-asset work of
            retitling property, completing institution paperwork, or
            coordinating beneficiary designations so each asset follows the
            plan. This checklist organizes that work for Texas assets.
          </p>
          <div className="mt-7 rounded-2xl border border-[#D8CDBF] bg-white/80 p-5 text-sm leading-relaxed text-[#5B4F3E]">
            <strong className="text-[#2D2A26]">Editorial note:</strong>{" "}
            Source-checked by the WillBuddy Editorial Team on July 21, 2026,
            against the Texas statutes and official resources linked below.
            This checklist was not attorney-reviewed, applies only to Texas
            planning, and may not fit your facts. WillBuddy is not a law firm
            and does not provide legal advice.
          </div>
        </div>
      </header>

      <article className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl space-y-14">
          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Why funding is a separate project
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-[#5B4F3E]">
              <p>
                Texas Property Code Chapter 112 supplies the rules for creating,
                revoking, and administering trusts. It does not retitle your
                house or rewrite an account registration for you. Property moves
                according to its title and its beneficiary arrangements, so a
                trust only governs what is actually connected to it. Review the
                current{" "}
                <SourceLink href={sources.trusts}>
                  Texas Property Code Chapter 112
                </SourceLink>{" "}
                with counsel before relying on any checklist, including this
                one.
              </p>
              <p>
                Learn the structure first in our{" "}
                <Link href="/guides/living-trust-texas" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                  living trust in Texas guide
                </Link>
                , then use the checklist below as a working inventory. Every
                item should end with evidence: a recorded deed, a confirmation
                letter, an updated statement, or a signed designation form.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              The structured funding checklist
            </h2>
            <div className="mt-7 space-y-5">
              <ChecklistGroup number="01" title="Texas real estate">
                <ChecklistItem>
                  List every parcel with its county, legal description, current
                  vesting, and any mortgage or lien.
                </ChecklistItem>
                <ChecklistItem>
                  Ask counsel who prepares and reviews each deed, and how
                  homestead rights, title insurance, and lender requirements
                  affect the transfer.
                </ChecklistItem>
                <ChecklistItem>
                  Confirm each deed is signed, notarized, and recorded in the
                  correct county, and keep the recorded copy as proof.
                </ChecklistItem>
                <ChecklistItem>
                  Repeat the analysis separately for any out-of-state property;
                  this checklist covers Texas planning only.
                </ChecklistItem>
              </ChecklistGroup>

              <ChecklistGroup number="02" title="Bank and brokerage accounts">
                <ChecklistItem>
                  Inventory checking, savings, money-market, CD, and brokerage
                  accounts with the exact current registration of each.
                </ChecklistItem>
                <ChecklistItem>
                  Request each institution&apos;s own trust-ownership or
                  retitling forms; procedures vary by institution.
                </ChecklistItem>
                <ChecklistItem>
                  Decide deliberately which accounts stay individual with a
                  payable-on-death designation instead, and record why.
                </ChecklistItem>
                <ChecklistItem>
                  Save the institution&apos;s written confirmation for every
                  completed change.
                </ChecklistItem>
              </ChecklistGroup>

              <ChecklistGroup number="03" title="Retirement accounts and life insurance">
                <ChecklistItem>
                  List every IRA, 401(k), pension, annuity, and life insurance
                  policy with its current primary and contingent beneficiaries.
                </ChecklistItem>
                <ChecklistItem>
                  Do not retitle a retirement account into a trust as a default
                  move; ownership changes can trigger tax consequences.
                </ChecklistItem>
                <ChecklistItem>
                  Have a Texas attorney and tax professional review whether the
                  trust should be named as a beneficiary at all, and in what
                  order.
                </ChecklistItem>
                <ChecklistItem>
                  File new designation forms directly with each plan or insurer
                  and keep the acceptance confirmation.
                </ChecklistItem>
              </ChecklistGroup>

              <ChecklistGroup number="04" title="Business interests">
                <ChecklistItem>
                  Gather operating agreements, shareholder agreements,
                  partnership agreements, and buy-sell provisions before any
                  transfer.
                </ChecklistItem>
                <ChecklistItem>
                  Check for transfer restrictions, consent requirements, and
                  rights of first refusal that a trust transfer could trigger.
                </ChecklistItem>
                <ChecklistItem>
                  Use written assignments prepared or reviewed by counsel, and
                  update company records to reflect the new ownership.
                </ChecklistItem>
              </ChecklistGroup>

              <ChecklistGroup number="05" title="Other property">
                <ChecklistItem>
                  Consider vehicles, boats, mineral interests, promissory
                  notes, intellectual property, and valuable tangible items,
                  each of which may follow its own titling system.
                </ChecklistItem>
                <ChecklistItem>
                  Use a general assignment for untitled personal property where
                  counsel recommends one.
                </ChecklistItem>
                <ChecklistItem>
                  Note every asset intentionally left out of the trust and the
                  path it will follow instead.
                </ChecklistItem>
              </ChecklistGroup>

              <ChecklistGroup number="06" title="Proof and maintenance">
                <ChecklistItem>
                  Keep one funding inventory with four columns: asset, previous
                  owner or designation, action taken, and evidence of
                  completion.
                </ChecklistItem>
                <ChecklistItem>
                  Store the evidence with the trust document so a successor
                  trustee can find it.
                </ChecklistItem>
                <ChecklistItem>
                  Re-run the checklist after every purchase, sale, refinance,
                  account change, business change, marriage, divorce, birth, or
                  death.
                </ChecklistItem>
              </ChecklistGroup>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              What funding does not settle
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-[#5B4F3E]">
              <p>
                Even a carefully funded trust does not remove every question.
                Creditor, tax, Medicaid, homestead, and community-property
                issues depend on the specific assets and the trust terms, not
                on the funding checklist. Trust administration can still
                involve notices, accountings, valuations, tax work, and
                professional fees. No checklist can promise a particular
                outcome for a particular estate.
              </p>
              <p>
                Property left outside the trust follows its own path. A
                pour-over will can direct remaining probate property into the
                trust, but the will itself must satisfy the execution rules in{" "}
                <SourceLink href={sources.wills}>
                  Texas Estates Code Chapter 251
                </SourceLink>
                . If an asset has no valid will, designation, or survivorship
                arrangement behind it, the default shares in{" "}
                <SourceLink href={sources.intestacy}>
                  Texas Estates Code Chapter 201
                </SourceLink>{" "}
                control. Compare the likely administration routes for what
                remains with the{" "}
                <SourceLink href={sources.probate}>
                  Texas State Law Library probate overview
                </SourceLink>
                .
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-[#D8CDBF] bg-[#F0EBE4]/60 p-7 md:p-10">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Price the funding work before you sign
            </h2>
            <p className="mt-4 leading-relaxed text-[#5B4F3E]">
              Funding is where trust proposals diverge most. One quote may
              include deeds and account coordination; another may leave every
              step to you. Compare scope line by line with our{" "}
              <Link href="/guides/living-trust-cost-texas" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                Texas living trust cost guide
              </Link>{" "}
              and model an educational scenario with the{" "}
              <Link href="/tools/texas-estate-planning-cost-calculator" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                Texas estate-planning cost calculator
              </Link>
              . The calculator is an editable illustration, not a quote or fee
              prediction.
            </p>
            <p className="mt-4 leading-relaxed text-[#5B4F3E]">
              Zoom out to the full plan—wills, guardians, executors, and powers
              of attorney—on the{" "}
              <Link href="/texas-estate-planning" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                Texas estate-planning hub
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Frequently asked questions
            </h2>
            <div className="mt-6 space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl border border-[#E8E0D6] bg-white p-5">
                  <summary className="cursor-pointer font-semibold text-[#2D2A26]">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-[#365239] p-7 text-white md:p-10">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
              Bring a finished inventory to your attorney
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/85">
              A complete asset list—with current titles, accounts, beneficiary
              designations, and deeds—makes the funding conversation faster and
              the written proposal easier to compare.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
              WillBuddy does not create trusts. It helps organize your planning
              decisions and asset information so you can prepare an attorney
              conversation about funding a Texas plan.
            </p>
            <Link
              href="/onboarding"
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#2D2A26]"
            >
              Organize my decisions
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </article>
    </main>
  );
}

function ChecklistGroup({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E0D6] bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5B7A5E]">{number}</p>
      <h3 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#5B4F3E]">{children}</ul>
    </div>
  );
}

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#5B7A5E]" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
