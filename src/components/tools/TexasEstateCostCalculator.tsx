"use client";

import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";
import {
  calculateEstatePlanningRanges,
  DEFAULT_COST_ASSUMPTIONS,
  type EstateCostInputs,
  type MoneyRange,
} from "@/lib/tools/texas-estate-costs";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function NumberField({
  label,
  value,
  onChange,
  prefix = "$",
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold leading-tight text-[#4F463B]">{label}</span>
      <span className="mt-1.5 flex items-center rounded-lg border border-[#D8CDBF] bg-white focus-within:border-[#5B7A5E] focus-within:ring-2 focus-within:ring-[#5B7A5E]/20">
        {prefix && <span className="pl-3 text-sm text-[#7F7467]">{prefix}</span>}
        <input
          type="number"
          min="0"
          step={suffix === "%" ? "0.1" : "100"}
          value={Number.isFinite(value) ? value : ""}
          onChange={(event) => onChange(event.target.valueAsNumber || 0)}
          className="min-w-0 flex-1 bg-transparent px-2 py-2.5 font-mono text-sm text-[#2D2A26] outline-none"
          aria-label={label}
        />
        {suffix && <span className="pr-3 text-sm text-[#7F7467]">{suffix}</span>}
      </span>
    </label>
  );
}

function RangeFields({
  label,
  value,
  onChange,
  percent = false,
}: {
  label: string;
  value: MoneyRange;
  onChange: (range: MoneyRange) => void;
  percent?: boolean;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-[#2D2A26]">{label}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <NumberField
          label="Low"
          value={value.low}
          prefix={percent ? "" : "$"}
          suffix={percent ? "%" : undefined}
          onChange={(low) => onChange({ ...value, low })}
        />
        <NumberField
          label="High"
          value={value.high}
          prefix={percent ? "" : "$"}
          suffix={percent ? "%" : undefined}
          onChange={(high) => onChange({ ...value, high })}
        />
      </div>
    </fieldset>
  );
}

function ResultRow({
  label,
  timing,
  range,
  tone = "green",
}: {
  label: string;
  timing: string;
  range: MoneyRange;
  tone?: "green" | "clay" | "brown";
}) {
  const toneClass = {
    green: "border-l-[#5B7A5E]",
    clay: "border-l-[#B07A53]",
    brown: "border-l-[#7F7467]",
  }[tone];

  return (
    <div className={`border-l-4 ${toneClass} bg-white px-4 py-4 sm:px-5`}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-[#2D2A26]">{label}</p>
          <p className="mt-0.5 text-xs text-[#7F7467]">{timing}</p>
        </div>
        <p className="whitespace-nowrap font-mono text-lg font-bold text-[#304733]">
          {currency.format(range.low)}–{currency.format(range.high)}
        </p>
      </div>
    </div>
  );
}

export function TexasEstateCostCalculator() {
  const [inputs, setInputs] = useState<EstateCostInputs>({
    estateValue: DEFAULT_COST_ASSUMPTIONS.estateValue,
    willPreparation: { ...DEFAULT_COST_ASSUMPTIONS.willPreparation },
    trustPreparation: { ...DEFAULT_COST_ASSUMPTIONS.trustPreparation },
    trustFunding: { ...DEFAULT_COST_ASSUMPTIONS.trustFunding },
    probateFixed: { ...DEFAULT_COST_ASSUMPTIONS.probateFixed },
    probateEstatePercent: { ...DEFAULT_COST_ASSUMPTIONS.probateEstatePercent },
  });
  const [calculationCount, setCalculationCount] = useState(0);
  const result = useMemo(() => calculateEstatePlanningRanges(inputs), [inputs]);

  function setRange<Key extends keyof EstateCostInputs>(
    key: Key,
    value: EstateCostInputs[Key]
  ) {
    setInputs((current) => ({ ...current, [key]: value }));
  }

  function recordComparison() {
    setCalculationCount((count) => count + 1);
    captureAnalyticsEvent("texas_estate_cost_comparison_updated", {
      tool: "texas_estate_cost_calculator",
    });
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#D8CDBF] bg-white shadow-[0_24px_80px_rgba(68,54,41,0.10)]">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <section className="border-b border-[#D8CDBF] bg-[#F0EBE4]/65 p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#304733] text-white">
              <Calculator className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B7A5E]">
                Editable illustration
              </p>
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
                Your assumptions
              </h2>
            </div>
          </div>

          <div className="mt-6">
            <NumberField
              label="Estate value used only for the percentage illustration"
              value={inputs.estateValue}
              onChange={(estateValue) => setRange("estateValue", estateValue)}
            />
          </div>

          <div className="mt-6 space-y-6">
            <RangeFields label="Will-plan preparation" value={inputs.willPreparation} onChange={(range) => setRange("willPreparation", range)} />
            <RangeFields label="Living-trust preparation" value={inputs.trustPreparation} onChange={(range) => setRange("trustPreparation", range)} />
            <RangeFields label="Trust-funding work" value={inputs.trustFunding} onChange={(range) => setRange("trustFunding", range)} />
            <RangeFields label="Probate fixed costs and professional fees" value={inputs.probateFixed} onChange={(range) => setRange("probateFixed", range)} />
            <RangeFields label="Additional estate-value percentage assumption" value={inputs.probateEstatePercent} onChange={(range) => setRange("probateEstatePercent", range)} percent />
          </div>

          <button
            type="button"
            onClick={recordComparison}
            className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#304733] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#243727] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7A5E] focus-visible:ring-offset-2"
          >
            Update comparison
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-[#7F7467]">
            Amounts stay in this browser. Analytics record only that the tool
            was used—not your amounts.
          </p>
        </section>

        <section className="bg-[#FCFBF8] p-5 sm:p-7" aria-live="polite">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#5B7A5E]">
            Range ledger
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
            Compare timing—not “savings”
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6A5D4E]">
            Preparation costs happen now. Probate-related costs, if any, happen
            later and depend on ownership, procedure, complexity, and conflict.
            These rows do not predict which plan is cheaper.
          </p>

          <div className="mt-7 overflow-hidden rounded-2xl border border-[#D8CDBF] divide-y divide-[#E8E0D6]">
            <ResultRow label="Will-plan preparation" timing="Upfront planning" range={result.willPreparation} />
            <ResultRow label="Trust preparation + funding work" timing="Upfront planning and asset-transfer work" range={result.trustPreparationAndFunding} tone="clay" />
            <ResultRow label="Probate-path illustration" timing="Potential later administration; no planning fee included" range={result.probateIllustration} tone="brown" />
            <ResultRow label="Will preparation + probate illustration" timing="Two different time periods shown together for context" range={result.willPlusProbateIllustration} />
          </div>

          {calculationCount > 0 && (
            <p className="mt-3 text-xs font-medium text-[#5B7A5E]">
              Comparison updated from your current assumptions.
            </p>
          )}

          <div className="mt-6 rounded-xl border border-[#C9D5C8] bg-[#EAF0E9] p-4">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#4A6A4D]" aria-hidden="true" />
              <div className="space-y-2 text-xs leading-relaxed text-[#304733]">
                <p>{result.probateCaveat}</p>
                <p>{result.trustCaveat}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#E8E0D6] pt-5">
            <p className="text-sm font-bold text-[#2D2A26]">What is not modeled</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-[#6A5D4E]">
              {result.notes.slice(1).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
