import type { Metadata } from "next";
import Link from "next/link";
import { Libre_Baskerville } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Clock, FileText, Shield } from "lucide-react";
import { getSupportEmail } from "@/lib/resend";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WillBuddy - Voice-First Estate Planning",
  description:
    "Talk through your estate plan like you're talking to a friend. AI-guided voice sessions for wills, guardianship, and powers of attorney in Texas.",
};

function Footer() {
  const supportEmail = getSupportEmail();

  return (
    <footer className="px-6 py-12 border-t border-[#E8E0D6]">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26] mb-4">
          WillBuddy
        </p>
        <p className="text-xs text-[#9B8E7E] leading-relaxed max-w-lg mx-auto mb-6">
          WillBuddy is not a law firm and does not provide legal advice. The
          documents generated are drafts intended for review by a licensed
          attorney. Use of this service does not create an attorney-client
          relationship. WillBuddy is designed for Texas residents and generates
          documents based on Texas estate law.
        </p>
        <nav
          aria-label="Footer"
          className="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-[#5B4F3E]"
        >
          <Link className="hover:text-[#2D2A26]" href="/contact">
            Contact
          </Link>
          <a className="hover:text-[#2D2A26]" href={`mailto:${supportEmail}`}>
            {supportEmail}
          </a>
        </nav>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#9B8E7E]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Texas estate law
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            ~45 min session
          </span>
        </div>
        <p className="text-xs text-[#9B8E7E] mt-8">
          &copy; {new Date().getFullYear()} WillBuddy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${libreBaskerville.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#2D2A26]">
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
