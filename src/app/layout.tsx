import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { siteConfig } from "@/lib/site";
import { Providers } from "./providers";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/brand/willbuddy-wordmark.svg`,
  description: siteConfig.description,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@mywillbuddy.com",
    url: `${siteConfig.url}/contact`,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  publisher: { "@type": "Organization", name: siteConfig.name },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "estate planning",
    "Texas will",
    "online will",
    "guardianship",
    "power of attorney",
    "medical power of attorney",
    "HIPAA authorization",
    "estate plan for parents",
    "voice estate planning",
    "WillBuddy",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "WillBuddy voice-first estate planning for Texas families",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${libreBaskerville.variable} h-full antialiased`}>
        <head>
          <script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key="S+xmJrUNKoNEccYeMdhjvw"
            async
          />
        </head>
        <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#2D2A26]">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
            }}
          />
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2542612909548568');
window.dispatchEvent(new Event('willbuddy:meta-pixel-ready'));`}
          </Script>
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-T00BH5C80B"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-T00BH5C80B', {'send_page_view': false});
gtag('config', 'AW-18323307402', {'send_page_view': false});
window.dispatchEvent(new Event('willbuddy:google-tag-ready'));`}
          </Script>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
