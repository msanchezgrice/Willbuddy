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

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ planning_for?: string }>;
}) {
  const { userId } = await auth();
  if (userId) {
    redirect("/session");
  }

  const { planning_for } = await searchParams;

  return <OnboardingFlow initialPlanningFor={planning_for} />;
}
