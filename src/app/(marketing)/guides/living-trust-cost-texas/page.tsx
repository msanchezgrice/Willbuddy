import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { absoluteUrl, siteConfig } from "@/lib/site";

const canonicalPath = "/guides/living-trust-cost-texas";
const reviewedOn = "2026-07-13";

const faqs = [
  {
    question: "Is there a standard price for a living trust in Texas?",
    answer:
      "No statewide schedule sets a standard consumer price. A quote may reflect the plan's complexity, attorney scope, deed and funding work, tax advice, related documents, and future support. Compare written scope, not just the headline amount.",
  },
  {
    question: "Is funding included in a trust quote?",
    answer:
      "Sometimes, but never assume it is. Ask which deeds, account forms, assignments, beneficiary reviews, recording fees, and follow-up checks are included, excluded, or handled by someone else.",
  },
  {
    question: "Is a living trust always cheaper than probate?",
    answer:
      "No. The comparison depends on the assets, ownership, beneficiaries, disputes, administration procedures, trustee work, professional help, and whether the trust was properly maintained. Compare likely lifetime and administration work for the same facts.",
  },
] as const;

export const metadata: Metadata = {
  title: "Living Trust Cost in Texas: A Complete Quote Checklist",
  description:
    "Understand the parts of a Texas living trust quote: legal design, related documents, deeds, funding, taxes, maintenance, and future administration.",
  alternates: { canonical: canonicalPath },
  openGraph: {
    title: "What Does a Living Trust Cost in Texas?",
    description:
      "A transparent Texas trust-cost framework and quote comparison checklist.",
    url: canonicalPath,
    type: "article",
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

export default function LivingTrustCostTexasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Living Trust Cost in Texas: A Complete Quote Checklist",
        description:
          "A framework for comparing the design, funding, maintenance, and administration costs of a Texas living trust.",
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
            name: "Living trust cost in Texas",
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
            <span>Living trust cost in Texas</span>
          </nav>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#5B7A5E]">
            Texas trust cost guide
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-[#2D2A26] md:text-6xl">
            The real cost of a living trust is the complete system.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#5B4F3E]">
            A headline price can leave out deeds, account work, related
            documents, tax advice, maintenance, and eventual administration.
            Use this framework to compare Texas trust proposals on the same
            scope.
          </p>
          <div className="mt-7 rounded-2xl border border-[#D8CDBF] bg-white/80 p-5 text-sm leading-relaxed text-[#5B4F3E]">
            <strong className="text-[#2D2A26]">Methodology:</strong> This page
            does not publish an invented statewide “average.” Texas has no
            official consumer fee schedule for living-trust packages, and
            quotes vary with facts and scope. The framework separates the work
            so you can request comparable written proposals. Source-checked
            July 13, 2026; not attorney-reviewed. WillBuddy is not a law firm
            and does not provide legal advice.
          </div>
        </div>
      </header>

      <article className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl space-y-14">
          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              A better formula than one flat number
            </h2>
            <div className="mt-6 rounded-2xl border border-[#D8CDBF] bg-[#F0EBE4]/70 p-6 text-center font-[family-name:var(--font-heading)] text-xl font-bold leading-relaxed text-[#2D2A26]">
              Design + companion documents + funding + outside costs +
              maintenance + administration
            </div>
            <div className="mt-5 space-y-4 leading-relaxed text-[#5B4F3E]">
              <p>
                Two proposals can both say “living trust” and cover very
                different work. One may supply a document and signing meeting.
                Another may include a pour-over will, powers of attorney,
                healthcare directives, one or more deeds, account-by-account
                funding instructions, beneficiary review, follow-up, and a
                future amendment meeting.
              </p>
              <p>
                Ask for a written fee agreement or engagement letter that
                identifies the client, work, assumptions, billing method,
                excluded work, outside expenses, and what ends the engagement.
                Texas Disciplinary Rule of Professional Conduct 1.04 addresses
                fees and communication of the basis or rate in applicable
                circumstances. Read the current{" "}
                <SourceLink href="https://www.txcourts.gov/media/1459244/texas-disciplinary-rules-of-professional-conduct-pdf.pdf">
                  Texas Disciplinary Rules of Professional Conduct
                </SourceLink>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Six cost buckets to put on every quote
            </h2>
            <div className="mt-7 space-y-5">
              <CostBucket number="01" title="Legal design and counseling">
                Does the lawyer analyze family structure, community and
                separate property, beneficiaries, incapacity, trustee powers,
                distribution timing, creditor concerns, business interests,
                out-of-state property, and tax issues? Is the price flat,
                hourly, phased, or a hybrid? How many meetings and revisions
                are included?
              </CostBucket>
              <CostBucket number="02" title="Companion documents">
                Ask whether the package includes a pour-over will, statutory
                durable power of attorney, medical power of attorney, directive
                to physicians, HIPAA authorization, guardian declarations, and
                child-guardian nominations where relevant. A trust does not do
                every one of those jobs.
              </CostBucket>
              <CostBucket number="03" title="Real-estate transfers">
                Identify each Texas and out-of-state parcel. Ask who prepares
                and reviews each deed, checks title and legal descriptions,
                considers mortgages and title policies, records the deed, and
                pays recording or local charges. Fees and procedures can vary
                by county and property.
              </CostBucket>
              <CostBucket number="04" title="Other funding work">
                List bank and brokerage accounts, tangible property, business
                interests, notes, mineral interests, insurance, and retirement
                accounts. For each asset, ask whether the lawyer changes title,
                supplies an assignment, reviews a beneficiary designation, or
                only gives instructions for you to complete.
              </CostBucket>
              <CostBucket number="05" title="Tax and specialist work">
                Clarify whether property-tax, income-tax, gift, estate-tax,
                retirement, Medicaid, special-needs, business, or financial
                advice is included. A lawyer may recommend a CPA, financial
                adviser, appraiser, title professional, or specialist whose fees
                are separate.
              </CostBucket>
              <CostBucket number="06" title="Maintenance and administration">
                Price the work after signing: funding verification, later
                deeds, restatements, amendments, trustee changes, beneficiary
                changes, and periodic reviews. Also ask what a successor trustee
                may need after incapacity or death, including legal, tax,
                accounting, valuation, sale, and distribution work.
              </CostBucket>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Why funding changes the price—and the outcome
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-[#5B4F3E]">
              <p>
                Texas Property Code Chapter 112 supplies rules for creating and
                administering trusts. A signed trust agreement, however, does
                not magically retitle a home, brokerage account, or business
                interest. Funding may involve a deed, institution-specific
                ownership forms, assignments, consents, or beneficiary analysis.
                Review{" "}
                <SourceLink href="https://statutes.capitol.texas.gov/Docs/PR/htm/PR.112.htm">
                  Texas Property Code Chapter 112
                </SourceLink>{" "}
                and get advice for the specific property.
              </p>
              <p>
                A low document-only price may be appropriate for someone who
                knowingly takes responsibility for funding. It is not
                comparable to a proposal that includes lawyer-prepared deeds,
                coordination with institutions, and a completed-funding review.
                Ask for a written asset schedule showing who performs each
                action, its deadline, and the evidence that confirms completion.
              </p>
              <p>
                Real property deserves particular care. The deed must identify
                the correct property and parties, and transfers can interact
                with homestead rights, liens, insurance, title coverage, taxes,
                marital property, and lender requirements. Include preparation,
                legal review, signatures, notarization, recording, and later
                corrections in the quote comparison.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Compare trust cost with the right alternative
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-[#5B4F3E]">
              <p>
                “Trust versus probate” is not a useful price comparison until
                both sides use the same estate facts. Some property passes
                outside probate through beneficiary designations, survivorship
                arrangements, or other mechanisms whether or not a trust exists.
                Some trust property can still require legal, tax, accounting,
                sale, valuation, notice, and distribution work.
              </p>
              <p>
                Texas estates may qualify for independent administration,
                muniment of title, small-estate procedures, or other routes
                depending on the facts. None should be assumed. Start with the{" "}
                <SourceLink href="https://www.sll.texas.gov/faqs/?category=Wills+%26+Estates">
                  Texas State Law Library probate overview
                </SourceLink>{" "}
                and ask counsel to compare the likely procedure, time, privacy,
                family burden, and professional help for your estate.
              </p>
              <p>
                Include lifetime effort in the trust side of the ledger:
                creating the plan, transferring property, maintaining ownership
                and beneficiary coordination, and training successor trustees.
                Include court and non-court administration work on the other
                side. The goal is not to prove one structure wins; it is to
                choose the structure whose benefits justify its complete cost.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              A copy-ready quote checklist
            </h2>
            <ol className="mt-6 space-y-3 text-[#5B4F3E]">
              {[
                "What exact trust type and planning documents are included?",
                "How many counseling meetings, drafts, revisions, and signing sessions are included?",
                "Which deed and funding tasks will the firm complete, and which remain mine?",
                "Are recording, notary, delivery, title, appraisal, tax, and specialist costs included?",
                "Will the firm review beneficiary designations and community-property issues?",
                "What assumptions could change the quoted price or trigger hourly work?",
                "What happens if I buy property or open accounts after signing?",
                "Is a post-signing funding audit included, and how is completion documented?",
                "What amendment, restatement, or periodic-review support is available?",
                "What work and likely professional fees may arise for the successor trustee?",
              ].map((question, index) => (
                <li key={question} className="flex gap-4 rounded-xl bg-[#F0EBE4]/60 p-4 leading-relaxed">
                  <span className="font-bold text-[#5B7A5E]">{index + 1}.</span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Warning signs in a price pitch
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Warning>One price is presented without describing the included trust, related documents, or family assumptions.</Warning>
              <Warning>Probate costs or savings are guaranteed before anyone reviews the property and likely Texas procedure.</Warning>
              <Warning>The seller treats document delivery as completion but never assigns responsibility for funding.</Warning>
              <Warning>A revocable living trust is sold as automatic creditor, tax, Medicaid, or lawsuit protection.</Warning>
              <Warning>The plan uses another state&apos;s generic language without explaining Texas law, execution, or property issues.</Warning>
              <Warning>You cannot tell whether the person answering legal questions is a lawyer representing you.</Warning>
            </div>
            <p className="mt-5 leading-relaxed text-[#5B4F3E]">
              Learn the underlying structure in our{" "}
              <Link href="/guides/living-trust-texas" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                living trust in Texas guide
              </Link>{" "}
              before comparing proposals.
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
              Walk into the quote meeting organized
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/85">
              Bring a family outline, asset and ownership inventory, existing
              documents, beneficiary designations, real-estate list, trustee
              candidates, and the checklist above. Better inputs make it easier
              to compare scope and spot exclusions.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
              WillBuddy does not create trusts. It helps organize your planning
              decisions so you can prepare an attorney conversation and request
              a proposal based on your actual situation.
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

function CostBucket({
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
      <p className="mt-3 leading-relaxed text-[#5B4F3E]">{children}</p>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#D7B8AC] bg-[#FBF4F0] p-5 text-sm leading-relaxed text-[#5B4F3E]">
      {children}
    </div>
  );
}
