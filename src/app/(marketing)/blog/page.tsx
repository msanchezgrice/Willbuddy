import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { formatPostDate, getReadingTimeMinutes } from "@/lib/blog/types";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog — Estate Planning, Explained for Texas Families",
  description:
    "Plain-English guides on wills, guardianship, powers of attorney, and the conversations that make estate planning work — written for Texas families.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description:
      "Plain-English guides on wills, guardianship, powers of attorney, and the conversations that make estate planning work.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <main className="flex-1 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <header className="mb-12 text-center">
          <p className="mb-4 text-sm uppercase tracking-widest text-[#9B8E7E]">
            The WillBuddy Blog
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-[#2D2A26] md:text-4xl">
            Estate planning, explained for Texas families
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[#5B4F3E]">
            Plain-English guides on wills, guardianship, powers of attorney, and
            the hard conversations that make a plan actually happen.
          </p>
        </header>

        <Link
          href="/texas-estate-planning"
          className="mb-10 flex items-center justify-between gap-5 rounded-2xl bg-[#F0EBE4] p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B7A5E]">
              Start here
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
              Texas estate-planning guide
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5B4F3E]">
              Connect wills, executors, guardians, trusts, powers of attorney,
              and healthcare directives in one source-backed checklist.
            </p>
          </div>
          <span className="shrink-0 text-xl text-[#5B7A5E]" aria-hidden="true">
            →
          </span>
        </Link>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/tools"
            className="rounded-2xl border border-[#E8E0D6] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B7A5E]">
              Interactive resources
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26]">
              Free Texas estate-planning tools →
            </h2>
          </Link>
          <Link
            href="/research"
            className="rounded-2xl border border-[#E8E0D6] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B7A5E]">
              Data and methods
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26]">
              Estate-planning research →
            </h2>
          </Link>
        </div>

        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-10 block rounded-2xl border border-[#E8E0D6] bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-medium text-[#9B8E7E]">
              <span className="rounded-full bg-[#5B7A5E]/10 px-3 py-1 text-[#5B7A5E]">
                {featured.category}
              </span>
              <span>{formatPostDate(featured.date)}</span>
              <span>{getReadingTimeMinutes(featured.content)} min read</span>
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold leading-snug text-[#2D2A26] group-hover:text-[#4A6A4D]">
              {featured.title}
            </h2>
            <p className="mt-3 text-[#5B4F3E] leading-relaxed">
              {featured.description}
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#5B7A5E]">
              Read article →
            </span>
          </Link>
        )}

        <div className="space-y-5">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-[#E8E0D6] bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 flex flex-wrap items-center gap-3 text-xs font-medium text-[#9B8E7E]">
                <span className="rounded-full bg-[#5B7A5E]/10 px-3 py-1 text-[#5B7A5E]">
                  {post.category}
                </span>
                <span>{formatPostDate(post.date)}</span>
                <span>{getReadingTimeMinutes(post.content)} min read</span>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold leading-snug text-[#2D2A26] group-hover:text-[#4A6A4D]">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5B4F3E]">
                {post.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-[#5B7A5E] px-8 py-10 text-center text-white">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
            Ready to make your own plan?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/90">
            Talk through your estate plan by voice and get Texas-compliant draft
            documents ready for attorney review.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-[#2D2A26] transition-all hover:-translate-y-0.5"
          >
            Start your estate plan
          </Link>
        </div>
      </div>
    </main>
  );
}
