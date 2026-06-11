export const siteConfig = {
  name: "WillBuddy",
  title: "WillBuddy - Voice-First Estate Planning",
  description:
    "Talk through wills, guardianship, healthcare wishes, and powers of attorney by voice, then bring organized Texas draft documents to an attorney.",
  url: getSiteUrl(),
};

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://willbuddy.vercel.app"
  ).replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
