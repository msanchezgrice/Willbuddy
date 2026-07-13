import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllSlugs, getPostBySlug, getAllPosts } from "@/lib/blog";
import { formatPostDate, getReadingTimeMinutes } from "@/lib/blog/types";
import { PostBody } from "@/components/blog/PostBody";
import { WillTrustDecisionEngine } from "@/components/tools/WillTrustDecisionEngine";
import { absoluteUrl, siteConfig } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post not found" };
  }

  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.dateModified ?? post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);
  const hasDecisionTool = post.slug === "wills-vs-trusts-texas";

  const articleJsonLd = {
    "@type": "Article",
    "@id": `${absoluteUrl(`/blog/${post.slug}`)}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.dateModified ?? post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  const breadcrumbJsonLd = {
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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: absoluteUrl(`/blog/${post.slug}`),
      },
    ],
  };

  const faqJsonLd = post.faqs?.length
    ? {
        "@type": "FAQPage",
        mainEntity: post.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [articleJsonLd, breadcrumbJsonLd, ...(faqJsonLd ? [faqJsonLd] : [])],
  };

  return (
    <main
      className={`flex-1 px-6 py-12 md:py-16 ${
        hasDecisionTool ? "max-md:px-3 max-md:py-3" : ""
      }`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article className="mx-auto max-w-2xl">
        <nav
          aria-label="Breadcrumb"
          className={`mb-8 flex flex-wrap items-center gap-2 text-sm font-medium text-[#9B8E7E] ${
            hasDecisionTool ? "max-md:hidden" : ""
          }`}
        >
          <Link href="/texas-estate-planning" className="inline-flex items-center gap-1.5 hover:text-[#2D2A26]">
            <ArrowLeft className="h-4 w-4" />
            Texas estate planning
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="hover:text-[#2D2A26]">
            All articles
          </Link>
        </nav>

        <div
          className={`mb-4 flex flex-wrap items-center gap-3 text-xs font-medium text-[#9B8E7E] ${
            hasDecisionTool ? "max-md:hidden" : ""
          }`}
        >
          <span className="rounded-full bg-[#5B7A5E]/10 px-3 py-1 text-[#5B7A5E]">
            {post.category}
          </span>
          <span>{formatPostDate(post.date)}</span>
          {post.dateModified && post.dateModified !== post.date && (
            <span>Updated {formatPostDate(post.dateModified)}</span>
          )}
          <span>{getReadingTimeMinutes(post.content)} min read</span>
        </div>

        {hasDecisionTool && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B7A5E] md:hidden">
            Free Texas decision tool
          </p>
        )}
        <h1
          className={`font-[family-name:var(--font-heading)] font-bold leading-tight text-[#2D2A26] md:text-4xl ${
            hasDecisionTool ? "text-2xl" : "text-3xl"
          }`}
        >
          {post.title}
        </h1>
        <p
          className={`mt-4 text-lg leading-relaxed text-[#5B4F3E] ${
            hasDecisionTool ? "max-md:hidden" : ""
          }`}
        >
          {post.description}
        </p>

        {post.editorialNote && (
          <p
            className={`mt-5 rounded-xl border border-[#E8E0D6] bg-white px-4 py-3 text-sm leading-relaxed text-[#5B4F3E] ${
              hasDecisionTool ? "max-md:hidden" : ""
            }`}
          >
            <strong className="text-[#2D2A26]">Editorial note:</strong>{" "}
            {post.editorialNote}
          </p>
        )}

        <hr
          className={`my-8 border-t border-[#E8E0D6] ${
            hasDecisionTool ? "max-md:hidden" : ""
          }`}
        />

        {post.slug === "wills-vs-trusts-texas" && (
          <WillTrustDecisionEngine />
        )}

        <PostBody content={post.content} />

        {post.faqs && post.faqs.length > 0 && (
          <section className="mt-14" aria-labelledby="article-faq-heading">
            <h2
              id="article-faq-heading"
              className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]"
            >
              Frequently asked questions
            </h2>
            <div className="mt-5 space-y-4">
              {post.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-xl border border-[#E8E0D6] bg-white px-5 py-4"
                >
                  <summary className="cursor-pointer font-semibold text-[#2D2A26]">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">
                    {faq.answer}
                  </p>
                  {faq.sourceUrl && (
                    <a
                      href={faq.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-[#5B7A5E] underline underline-offset-2"
                    >
                      Source: {faq.sourceLabel ?? "Official Texas source"}
                    </a>
                  )}
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 rounded-2xl bg-[#5B7A5E] px-7 py-9 text-center text-white">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold">
            Talk through your own plan
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/90">
            WillBuddy walks you through wills, guardianship, and powers of
            attorney by voice — then generates Texas draft documents for
            attorney review.
          </p>
          <Link
            href="/onboarding"
            className="mt-5 inline-block rounded-full bg-white px-7 py-3 font-semibold text-[#2D2A26] transition-all hover:-translate-y-0.5"
          >
            Start your estate plan
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-2xl">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
            Keep reading
          </h2>
          <div className="mt-5 space-y-4">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group block rounded-xl border border-[#E8E0D6] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-xs font-medium text-[#5B7A5E]">
                  {p.category}
                </span>
                <h3 className="mt-1 font-[family-name:var(--font-heading)] font-bold text-[#2D2A26] group-hover:text-[#4A6A4D]">
                  {p.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
