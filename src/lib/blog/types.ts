export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date string, e.g. "2026-06-30" */
  date: string;
  category: string;
  /** Short author label shown on the post. */
  author: string;
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
