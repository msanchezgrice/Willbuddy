import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
        </body>
      </html>
    </ClerkProvider>
  );
}
