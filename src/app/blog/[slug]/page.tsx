import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllSlugs, getPostBySlug, getAllPosts } from "@/lib/blog";
import { formatPostDate, getReadingTimeMinutes } from "@/lib/blog/types";
import { PostBody } from "@/components/blog/PostBody";
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  return (
    <main className="flex-1 px-6 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-2xl">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#9B8E7E] hover:text-[#2D2A26]"
        >
          <ArrowLeft className="h-4 w-4" />
          All articles
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-medium text-[#9B8E7E]">
          <span className="rounded-full bg-[#5B7A5E]/10 px-3 py-1 text-[#5B7A5E]">
            {post.category}
          </span>
          <span>{formatPostDate(post.date)}</span>
          <span>{getReadingTimeMinutes(post.content)} min read</span>
        </div>

        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-[#2D2A26] md:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[#5B4F3E]">
          {post.description}
        </p>

        <hr className="my-8 border-t border-[#E8E0D6]" />

        <PostBody content={post.content} />

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
