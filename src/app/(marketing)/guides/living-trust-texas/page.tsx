import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { absoluteUrl, siteConfig } from "@/lib/site";

const canonicalPath = "/guides/living-trust-texas";
const reviewedOn = "2026-07-13";

const sources = {
  trusts: "https://statutes.capitol.texas.gov/Docs/PR/htm/PR.112.htm",
  intestacy: "https://statutes.capitol.texas.gov/Docs/ES/htm/ES.201.htm",
  wills: "https://statutes.capitol.texas.gov/Docs/ES/htm/ES.251.htm",
  probate: "https://www.sll.texas.gov/faqs/?category=Wills+%26+Estates",
};

export const metadata: Metadata = {
  title: "Living Trust in Texas: What It Does and When to Consider One",
  description:
    "A source-backed Texas guide to revocable living trusts, funding, probate, successor trustees, pour-over wills, limitations, and attorney questions.",
  alternates: { canonical: canonicalPath },
  openGraph: {
    title: "Living Trust in Texas: A Practical Decision Guide",
    description:
      "Understand what a Texas living trust does, what it does not do, and why funding matters.",
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

export default function LivingTrustTexasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Living Trust in Texas: What It Does and When to Consider One",
        description:
          "A practical guide to revocable living trusts, funding, probate, successor trustees, and related Texas documents.",
        datePublished: reviewedOn,
        dateModified: reviewedOn,
        author: { "@type": "Organization", name: "WillBuddy Editorial Team" },
        publisher: { "@type": "Organization", name: siteConfig.name },
        mainEntityOfPage: absoluteUrl(canonicalPath),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
          {
            "@type": "ListItem",
            position: 3,
            name: "Living trust in Texas",
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
            <span>Living trust in Texas</span>
          </nav>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#5B7A5E]">
            Texas trust guide
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-[#2D2A26] md:text-6xl">
            A living trust is a plan plus a funding process—not just a document.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#5B4F3E]">
            A revocable living trust can coordinate ownership, management during
            incapacity, and transfers after death. Its usefulness depends on
            your assets, family, goals, trustee choices, and whether property is
            actually connected to the trust.
          </p>
          <div className="mt-7 rounded-2xl border border-[#D8CDBF] bg-white/80 p-5 text-sm leading-relaxed text-[#5B4F3E]">
            <strong className="text-[#2D2A26]">Editorial note:</strong>{" "}
            Source-checked by the WillBuddy Editorial Team on July 13, 2026.
            This guide was not attorney-reviewed. WillBuddy is not a law firm
            and does not provide legal advice.
          </div>
        </div>
      </header>

      <article className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl space-y-14">
          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              What a Texas living trust is
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-[#5B4F3E]">
              <p>
                A trust separates roles. The settlor creates the trust and
                contributes property. The trustee holds and administers trust
                property under the trust terms. Beneficiaries receive the
                benefits the document defines. With a typical revocable living
                trust, one person may initially fill all three roles, then a
                successor trustee steps in after incapacity or death.
              </p>
              <p>
                Texas Property Code Chapter 112 governs creation, requirements,
                revocation, and other trust rules. For example, Section 112.004
                addresses written evidence for certain trusts, while Section
                112.051 addresses revocation, modification, or amendment. Read
                the current{" "}
                <SourceLink href={sources.trusts}>
                  Texas Property Code Chapter 112
                </SourceLink>{" "}
                rather than relying on a generic form built for another state.
              </p>
              <p>
                “Living” means the trust is created during life. “Revocable”
                generally describes the settlor&apos;s retained ability to
                change or revoke it under the trust terms and applicable law.
                Those labels do not by themselves answer tax, creditor,
                Medicaid, homestead, or asset-protection questions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              The decisive step: funding the trust
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-[#5B4F3E]">
              <p>
                Signing a trust agreement does not automatically move every
                asset into it. Funding is the work of changing ownership or
                coordinating beneficiary arrangements so property follows the
                intended path. A house may require a deed. A non-retirement
                account may require the institution&apos;s ownership forms.
                Business interests may require review of an operating,
                shareholder, or partnership agreement.
              </p>
              <p>
                Retirement accounts and some other assets often call for
                beneficiary-designation analysis rather than simply naming the
                trust as owner. Mortgages, title coverage, homestead rights,
                community-property characterization, and tax rules can make a
                seemingly simple transfer consequential. A Texas lawyer and
                relevant tax or financial professionals should review the
                funding plan for your actual assets.
              </p>
              <p>
                Create a funding inventory with four columns: asset, present
                owner, intended transfer method, and proof the change was
                completed. Revisit it after a purchase, sale, refinance, new
                account, business change, marriage, divorce, birth, or death.
                An unfunded or partly funded trust may not deliver the result
                its owner expects.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Living trust vs. will in Texas
            </h2>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-[#E8E0D6]">
              <table className="min-w-full divide-y divide-[#E8E0D6] text-left text-sm">
                <thead className="bg-[#F0EBE4] text-[#2D2A26]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Job</th>
                    <th className="px-5 py-4 font-semibold">Will</th>
                    <th className="px-5 py-4 font-semibold">Living trust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D6] text-[#5B4F3E]">
                  <tr>
                    <td className="px-5 py-4 font-medium">Takes effect</td>
                    <td className="px-5 py-4">At death, after valid execution</td>
                    <td className="px-5 py-4">During life under its terms</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-medium">Minor-child guardian</td>
                    <td className="px-5 py-4">Can nominate a guardian</td>
                    <td className="px-5 py-4">Does not replace the will&apos;s nomination job</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-medium">Probate path</td>
                    <td className="px-5 py-4">Probate may be needed for will-controlled property</td>
                    <td className="px-5 py-4">Properly funded trust property can pass under trust administration</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-medium">Lifetime management</td>
                    <td className="px-5 py-4">Does not manage assets during incapacity</td>
                    <td className="px-5 py-4">Successor trustee provisions can address trust assets</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-5 leading-relaxed text-[#5B4F3E]">
              This is not usually an either-or choice. A trust-based plan commonly
              still uses a pour-over will for property left outside the trust
              and for jobs a will performs. The will must satisfy Texas execution
              law in{" "}
              <SourceLink href={sources.wills}>Texas Estates Code Chapter 251</SourceLink>.
              Compare the larger decision in our{" "}
              <Link href="/blog/wills-vs-trusts-texas" className="font-semibold text-[#4A6A4D] underline underline-offset-2">
                Texas will vs. trust guide
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              What “avoiding probate” really means
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-[#5B4F3E]">
              <p>
                Probate is a court-supervised process for proving a will,
                appointing a personal representative, addressing claims, and
                administering probate property. A living trust can reduce the
                property passing through that process only when the relevant
                property is held by the trust or otherwise coordinated to pass
                under the plan.
              </p>
              <p>
                Some assets already pass outside a will because of beneficiary
                designations, survivorship arrangements, or other nonprobate
                mechanisms. A trust can still help coordinate those assets, but
                it should not be credited with avoiding a process an asset
                already avoided. Likewise, trust administration can involve
                notices, accountings, tax work, title changes, professional
                fees, disputes, and substantial trustee responsibility.
              </p>
              <p>
                Texas also offers estate-administration procedures that may be
                simpler than people assume in appropriate cases. Review the{" "}
                <SourceLink href={sources.probate}>Texas State Law Library probate overview</SourceLink>{" "}
                and compare the likely work for your estate instead of choosing
                a trust from a slogan.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              When a trust conversation may be especially useful
            </h2>
            <ul className="mt-5 space-y-3 text-[#5B4F3E]">
              {[
                "You own real estate in more than one state and want to discuss avoiding multiple probate proceedings.",
                "You want a successor trustee to manage funded assets during incapacity under detailed instructions.",
                "A beneficiary may need staged distributions, management support, or protection tailored by counsel.",
                "Privacy, administrative continuity, or a complex family or business structure matters enough to justify ongoing upkeep.",
                "You are willing to complete and maintain the funding process rather than treating the signed document as finished.",
              ].map((item) => (
                <li key={item} className="rounded-xl bg-[#F0EBE4]/60 px-5 py-4 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 leading-relaxed text-[#5B4F3E]">
              A trust is not automatically necessary because you own a home,
              are married, have children, or want to avoid Texas intestacy.
              Without a valid plan, Texas Estates Code Chapter 201 supplies
              default shares, but a properly executed will may address many
              families&apos; core transfer and guardian-nomination goals. Review{" "}
              <SourceLink href={sources.intestacy}>Texas Estates Code Chapter 201</SourceLink>{" "}
              and map the gap between those defaults and your wishes.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Limits that deserve plain language
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Limit title="Not automatic asset protection">
                A revocable trust usually should not be marketed as a shield
                from the settlor&apos;s creditors. Ask counsel about the exact
                trust type, retained control, and applicable exceptions.
              </Limit>
              <Limit title="Not an automatic tax strategy">
                Moving property to a revocable trust does not, by the label
                alone, eliminate estate, income, gift, or property-tax issues.
              </Limit>
              <Limit title="Not a substitute for every document">
                A trust does not replace medical directives, financial powers
                of attorney for assets outside it, or a will&apos;s guardian
                nomination.
              </Limit>
              <Limit title="Not maintenance-free">
                New assets, trustee changes, beneficiary changes, law changes,
                and life events can require funding updates and legal review.
              </Limit>
            </div>
          </section>

          <section className="rounded-3xl bg-[#365239] p-7 text-white md:p-10">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
              Prepare a better attorney conversation
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/85">
              Bring an asset inventory, current ownership and beneficiary
              information, family priorities, incapacity concerns, trustee
              candidates, and questions about funding. Ask what the engagement
              includes after signing and how future assets should be handled.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
              WillBuddy does not create trusts. It can help you organize estate
              planning decisions and prepare an attorney conversation about
              whether a trust belongs in your Texas plan.
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

function Limit({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E8E0D6] bg-white p-5">
      <h3 className="font-semibold text-[#2D2A26]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#5B4F3E]">{children}</p>
    </div>
  );
}
