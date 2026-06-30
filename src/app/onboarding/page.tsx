import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Answer a few quick questions and create your free WillBuddy account to start your Texas estate plan by voice.",
  robots: { index: false, follow: true },
};

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/session");
  }

  return <OnboardingFlow />;
}
