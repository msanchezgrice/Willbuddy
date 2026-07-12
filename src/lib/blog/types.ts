export interface BlogFaq {
  question: string;
  answer: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date string, e.g. "2026-06-30" */
  date: string;
  category: string;
  /** Short author label shown on the post. */
  author: string;
  /** ISO date for the most recent source review. */
  dateModified?: string;
  /** Truthful note describing the editorial review applied to the article. */
  editorialNote?: string;
  /** Questions answered visibly on the page and reflected in FAQ schema. */
  faqs?: BlogFaq[];
  /** Markdown body. */
  content: string;
}

export function getReadingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
