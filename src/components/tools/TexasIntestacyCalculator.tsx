"use client";

import { useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";
import { useToolAnalytics } from "@/lib/analytics/use-tool-analytics";
import { QuizNavigation, QuizProgress } from "@/components/tools/QuizProgress";
import { useQuizStepFocus } from "@/components/tools/useQuizStepFocus";
import {
  calculateTexasIntestacy,
  type InheritanceShare,
  type TexasIntestacyInputs,
} from "@/lib/tools/texas-intestacy";

type BooleanChoice = "yes" | "no" | "";

function toBoolean(value: BooleanChoice) {
  return value === "yes";
}

function Choice({
  name,
  value,
  selected,
  onChange,
  children,
}: {
  name: string;
  value: "yes" | "no";
  selected: boolean;
  onChange: (value: "yes" | "no") => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-[#5B7A5E] focus-within:ring-offset-2 ${
        selected
          ? "border-[#5B7A5E] bg-[#EAF0E9] text-[#304733]"
          : "border-[#D8CDBF] bg-white text-[#5B4F3E] hover:border-[#8AA08B]"
      }`}
    >
      <input
        className="sr-only"
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
      />
      {children}
    </label>
  );
}

function PropertyMap({
  title,
  subtitle,
  shares,
}: {
  title: string;
  subtitle: string;
  shares: InheritanceShare[];
}) {
  const colors = ["bg-[#5B7A5E]", "bg-[#B07A53]", "bg-[#7F7467]"];

  return (
    <section className="rounded-2xl border border-[#D8CDBF] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26]">
            {title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#7F7467]">
            {subtitle}
          </p>
        </div>
        <span className="rounded-full bg-[#F0EBE4] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-[#6A5D4E]">
          decedent&apos;s interest
        </span>
      </div>

      <div
        className="mt-5 flex h-4 overflow-hidden rounded-full bg-[#F0EBE4]"
        aria-hidden="true"
      >
        {shares.map((share, index) => (
          <span
            key={`${share.heir}-${share.interest}`}
            className={colors[index % colors.length]}
            style={{ width: `${share.share * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {shares.map((share, index) => (
          <li
            key={`${share.heir}-${share.interest}`}
            className="grid grid-cols-[auto_1fr_auto] items-start gap-3 text-sm"
          >
            <span
              className={`mt-1 h-3 w-3 rounded-full ${colors[index % colors.length]}`}
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-[#2D2A26]">{share.heir}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#7F7467]">
                {share.interest}
                {share.detail ? ` · ${share.detail}` : ""}
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-[#304733]">
              {Math.round(share.share * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TexasIntestacyCalculator() {
  const { recordStart, recordComplete } = useToolAnalytics(
    "texas_intestacy_calculator"
  );
  const [spouse, setSpouse] = useState<BooleanChoice>("");
  const [descendants, setDescendants] = useState<BooleanChoice>("");
  const [allShared, setAllShared] = useState<BooleanChoice>("");
  const [collateral, setCollateral] = useState<BooleanChoice>("");
  const [submitted, setSubmitted] = useState<TexasIntestacyInputs | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const questionLegendRef = useQuizStepFocus(currentStep, !submitted);

  const needsShared = spouse === "yes" && descendants === "yes";
  const needsCollateral = descendants === "no";
  const complete =
    spouse !== "" &&
    descendants !== "" &&
    (!needsShared || allShared !== "") &&
    (!needsCollateral || collateral !== "");
  const result = submitted ? calculateTexasIntestacy(submitted) : null;
  const steps = [
    "spouse",
    "descendants",
    ...(needsShared ? ["shared"] : needsCollateral ? ["collateral"] : []),
  ] as const;
  const currentQuestion = steps[currentStep];
  const currentValue =
    currentQuestion === "spouse"
      ? spouse
      : currentQuestion === "descendants"
        ? descendants
        : currentQuestion === "shared"
          ? allShared
          : collateral;

  function showMap() {
    if (!complete || submitted) return;
    setSubmitted({
      hasSpouse: toBoolean(spouse),
      hasDescendants: toBoolean(descendants),
      allDescendantsAlsoSpouseDescendants: needsShared
        ? toBoolean(allShared)
        : null,
      hasParentsOrSiblings: needsCollateral ? toBoolean(collateral) : false,
    });
    captureAnalyticsEvent("texas_intestacy_map_completed", {
      tool: "texas_intestacy_calculator",
    });
    recordComplete({
      family_path: needsShared
        ? "spouse_descendants"
        : needsCollateral
          ? "collateral"
          : "direct",
    });
  }

  function reset() {
    setSpouse("");
    setDescendants("");
    setAllShared("");
    setCollateral("");
    setSubmitted(null);
    setCurrentStep(0);
  }

  function continueQuiz() {
    if (currentValue === "") return;
    recordStart();
    if (currentStep === steps.length - 1) {
      showMap();
      return;
    }
    setCurrentStep((step) => step + 1);
  }

  return (
    <div
      data-quiz-shell
      className="scroll-mt-2 overflow-hidden rounded-2xl border border-[#D8CDBF] bg-[#FCFBF8] shadow-[0_24px_80px_rgba(68,54,41,0.10)] sm:rounded-[1.75rem]"
    >
      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <section className="border-b border-[#D8CDBF] bg-[#F0EBE4]/70 p-4 sm:p-7 lg:border-b-0 lg:border-r">
          <div className="hidden sm:block">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#5B7A5E]">
              Family-tree inputs
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
              Who survives the person?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6A5D4E]">
              Answer for a person who died without a valid will. The map changes
              only when you select “Show the inheritance map.”
            </p>
          </div>

          <div className="sm:mt-7">
            <QuizProgress current={currentStep + 1} total={steps.length} label="Step" />
            <fieldset className="mt-4 min-h-0 sm:mt-7 sm:min-h-[170px]">
              <legend
                ref={questionLegendRef}
                tabIndex={-1}
                className="font-[family-name:var(--font-heading)] text-lg font-bold leading-snug text-[#2D2A26] outline-none sm:text-xl"
              >
                {currentQuestion === "spouse"
                  ? "Is there a surviving spouse?"
                  : currentQuestion === "descendants"
                    ? "Are there children, grandchildren, or other descendants?"
                    : currentQuestion === "shared"
                      ? "Is every descendant also a descendant of the surviving spouse?"
                      : "Is there at least one parent, sibling, or descendant of a sibling?"}
              </legend>
              {currentQuestion === "shared" && (
                <p className="mt-2 text-xs leading-relaxed text-[#7F7467]">
                  Select no if either spouse has a child from another relationship.
                </p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5">
                <Choice
                  name={currentQuestion}
                  value="yes"
                  selected={currentValue === "yes"}
                  onChange={(value) => {
                    if (currentQuestion === "spouse") {
                      setSpouse(value);
                      setAllShared("");
                    } else if (currentQuestion === "descendants") {
                      setDescendants(value);
                      setAllShared("");
                      setCollateral("");
                    } else if (currentQuestion === "shared") {
                      setAllShared(value);
                    } else {
                      setCollateral(value);
                    }
                    setSubmitted(null);
                  }}
                >
                  {currentQuestion === "shared" ? "Yes, all shared" : "Yes"}
                </Choice>
                <Choice
                  name={currentQuestion}
                  value="no"
                  selected={currentValue === "no"}
                  onChange={(value) => {
                    if (currentQuestion === "spouse") {
                      setSpouse(value);
                      setAllShared("");
                    } else if (currentQuestion === "descendants") {
                      setDescendants(value);
                      setAllShared("");
                      setCollateral("");
                    } else if (currentQuestion === "shared") {
                      setAllShared(value);
                    } else {
                      setCollateral(value);
                    }
                    setSubmitted(null);
                  }}
                >
                  {currentQuestion === "collateral" ? "No / unsure" : "No"}
                </Choice>
              </div>
            </fieldset>
            <QuizNavigation
              canContinue={currentValue !== ""}
              isFirst={currentStep === 0}
              onBack={() => setCurrentStep((step) => Math.max(0, step - 1))}
              onContinue={continueQuiz}
              continueLabel={
                currentStep === steps.length - 1
                  ? "Show the inheritance map"
                  : "Continue"
              }
            />
          </div>
        </section>

        <section
          className={`p-5 sm:p-7 ${!result ? "hidden lg:block" : ""}`}
          aria-live="polite"
        >
          {!result ? (
            <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-dashed border-[#CFC2B2] bg-white/65 p-8 text-center">
              <div className="max-w-sm">
                <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
                  The property map starts blank.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#7F7467]">
                  That is intentional: Texas uses different branches for
                  community property, separate personal property, and separate
                  real property. Answer the family questions to reveal them.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#5B7A5E]">
                    Simplified statutory map
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
                    Three property branches
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#5B4F3E] hover:bg-[#F0EBE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7A5E]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Start over
                </button>
              </div>

              <p className="mt-4 rounded-xl border-l-4 border-[#5B7A5E] bg-[#EAF0E9] px-4 py-3 text-sm leading-relaxed text-[#304733]">
                {result.explanation}
              </p>

              <div className="mt-5 grid gap-4">
                <PropertyMap
                  title="Community property"
                  subtitle="Only the decedent's community interest is being distributed."
                  shares={result.communityProperty}
                />
                <PropertyMap
                  title="Separate personal property"
                  subtitle="Examples may include separately owned cash or personal items."
                  shares={result.separatePersonalProperty}
                />
                <PropertyMap
                  title="Separate real property"
                  subtitle="Land and homes can involve life-estate and remainder interests."
                  shares={result.separateRealProperty}
                />
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[#6A5D4E]">
                <strong>Community-property context:</strong> {result.communityNote}
              </p>

              <div className="mt-5 rounded-xl border border-[#D6B99F] bg-[#FFF8EF] p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#95643F]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-[#5A3E29]">Important limits</p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-[#735239]">
                      {result.caveats.map((caveat) => (
                        <li key={caveat}>{caveat}</li>
                      ))}
                    </ul>
                    <p className="mt-3 font-mono text-[11px] text-[#735239]">
                      Branches used: {result.sections.join(" · ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
