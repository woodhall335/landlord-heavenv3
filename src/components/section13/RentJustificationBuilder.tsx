'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  calculateSection13RentJustification,
  SECTION13_SELECTABLE_JUSTIFICATION_FACTORS,
  type Section13RentJustificationResult,
} from '@/lib/section13/rent-justification';
import type { Section13ConditionScenario, Section13EvidenceStrengthBand } from '@/lib/section13/types';

interface RentJustificationBuilderProps {
  currentRent: number | null | undefined;
  proposedRent: number | null | undefined;
  marketLow: number | null | undefined;
  marketHigh: number | null | undefined;
  comparableCount: number;
  evidenceStrength: Section13EvidenceStrengthBand | 'Strong' | 'Moderate' | 'Weak' | null | undefined;
  conditionScenario: Section13ConditionScenario;
  initialSelectedFactors?: string[];
  onChange?: (result: Section13RentJustificationResult) => void;
  tone?: 'public' | 'wizard';
}

function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return 'Unavailable';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function RentJustificationBuilder({
  currentRent,
  proposedRent,
  marketLow,
  marketHigh,
  comparableCount,
  evidenceStrength,
  conditionScenario,
  initialSelectedFactors,
  onChange,
  tone = 'public',
}: RentJustificationBuilderProps) {
  const [selectedFactors, setSelectedFactors] = useState<string[]>(initialSelectedFactors || []);
  const result = useMemo(
    () =>
      calculateSection13RentJustification({
        selectedFactors,
        currentRent,
        proposedRent,
        marketLow,
        marketHigh,
        comparableCount,
        evidenceStrength,
        conditionScenario,
      }),
    [
      comparableCount,
      conditionScenario,
      currentRent,
      evidenceStrength,
      marketHigh,
      marketLow,
      proposedRent,
      selectedFactors,
    ]
  );

  useEffect(() => {
    onChange?.(result);
  }, [onChange, result]);

  const panelClass =
    tone === 'wizard'
      ? 'rounded-2xl border border-violet-200 bg-white p-4'
      : 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm';

  function toggleFactor(factorId: string) {
    setSelectedFactors((prev) =>
      prev.includes(factorId) ? prev.filter((item) => item !== factorId) : [...prev, factorId]
    );
  }

  return (
    <div className={panelClass}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">Justify this rent</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Tick the factors that genuinely apply. The score explains the uplift, but it stays capped by the market evidence.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
          {result.score}/100 {result.band}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTION13_SELECTABLE_JUSTIFICATION_FACTORS.map((factor) => (
          <label
            key={factor.id}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <input
              type="checkbox"
              checked={selectedFactors.includes(factor.id)}
              onChange={() => toggleFactor(factor.id)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-300"
            />
            <span>
              <span className="block font-semibold text-slate-950">{factor.label}</span>
              <span className="text-xs text-slate-500">{factor.weight > 0 ? '+' : ''}{factor.weight} score</span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Market headroom</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatMoney(result.marketHeadroom)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Proposed uplift</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatMoney(result.proposedIncrease)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Explained uplift</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {formatMoney(result.evidenceCappedJustifiedIncrease)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Unexplained</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatMoney(result.unexplainedIncrease)}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm leading-6 text-slate-700">{result.summary}</p>
        {result.appliedFactors.length ? (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Applied checks: {result.appliedFactors.map((factor) => factor.label).join(', ')}.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default RentJustificationBuilder;
