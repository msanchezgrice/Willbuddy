import type { BlogPost } from "./types";
import { freeTexasEstatePlanningTools } from "./posts/free-texas-estate-planning-tools";
import { partnerConversation } from "./posts/talk-to-partner-about-estate-planning";
import { bigDecisions } from "./posts/big-decisions-new-parents";
import { choosingGuardian } from "./posts/choosing-a-guardian";
import { dyingWithoutWill } from "./posts/dying-without-a-will-in-texas";
import { willsVsTrusts } from "./posts/wills-vs-trusts-texas";
import { namingExecutor } from "./posts/naming-an-executor";
import { medicalPoa } from "./posts/medical-power-of-attorney-living-will";
import { durablePoa } from "./posts/durable-power-of-attorney";
import { agingParents } from "./posts/talk-to-aging-parents";
import { lifeChanges } from "./posts/updating-your-estate-plan";

export const blogPosts: BlogPost[] = [
  freeTexasEstatePlanningTools,
  partnerConversation,
  bigDecisions,
  choosingGuardian,
  dyingWithoutWill,
  willsVsTrusts,
  namingExecutor,
  medicalPoa,
  durablePoa,
  agingParents,
  lifeChanges,
];

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}
