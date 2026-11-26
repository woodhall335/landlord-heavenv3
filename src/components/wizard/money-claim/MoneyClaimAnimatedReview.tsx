'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  RiCalendarCheckLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiFileList3Line,
  RiInformationLine,
  RiMoneyPoundCircleLine,
  RiShieldCheckLine,
} from 'react-icons/ri';

export const MONEY_CLAIM_REVIEW_DURATION_MS = 20000;

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const reviewPhases = [
  {
    label: 'Opening claim review workspace',
    detail: 'Setting up the review using the landlord, tenant, property and claim answers.',
    shortLabel: 'Workspace',
  },
  {
    label: 'Checking the England money-claim route',
    detail: 'Confirming the County Court money claim path and the PAP-Debt review points.',
    shortLabel: 'Route',
  },
  {
    label: 'Reviewing claim figures',
    detail: 'Separating rent arrears, damages, interest and other sums into the claim summary.',
    shortLabel: 'Figures',
  },
  {
    label: 'Checking PAP-Debt timing',
    detail: 'Reviewing Letter Before Claim status and the 30-day response period before issuing.',
    shortLabel: 'PAP-Debt',
  },
  {
    label: 'Building evidence prompts',
    detail: 'Preparing reminders for tenancy terms, rent records, payment evidence and correspondence.',
    shortLabel: 'Evidence',
  },
  {
    label: 'Preparing final review',
    detail: 'Putting together the claim score, good points, warnings and before-you-issue checks.',
    shortLabel: 'Results',
  },
];

export function getMoneyClaimReviewProgress(
  elapsedMs: number,
  durationMs = MONEY_CLAIM_REVIEW_DURATION_MS
) {
  if (durationMs <= 0) return 100;
  if (elapsedMs >= durationMs) return 100;
  return Math.min(99, Math.max(0, Math.floor((elapsedMs / durationMs) * 100)));
}

export function getMoneyClaimReviewPhaseIndex(
  elapsedMs: number,
  durationMs = MONEY_CLAIM_REVIEW_DURATION_MS
) {
  if (durationMs <= 0) return reviewPhases.length - 1;
  return Math.min(
    reviewPhases.length - 1,
    Math.max(0, Math.floor((elapsedMs / durationMs) * reviewPhases.length))
  );
}

export function getMoneyClaimVisibleSections(progress: number) {
  return {
    route: progress >= 0,
    figures: progress >= 20,
    protocol: progress >= 40,
    evidence: progress >= 60,
    final: progress >= 80,
    actions: progress >= 100,
  };
}

function formatCurrencyAmount(value: number | null | undefined): string {
  return gbpFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

function normaliseIssueText(value: unknown) {
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (value && typeof value === 'object') {
    const issue = value as { message?: unknown; title?: unknown };
    return String(issue.message || issue.title || '').trim().toLowerCase();
  }
  return '';
}

function issueMessage(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const issue = value as { message?: unknown; title?: unknown };
    return String(issue.message || issue.title || '');
  }
  return '';
}


export interface MoneyClaimAnimatedReviewProps {
  caseId: string;
  analysis: any;
  jurisdiction: string;
  caseStrengthBand: string;
  readinessSummary: string | null;
  redFlags: string[];
  complianceIssues: string[];
  evidence: any;
  hasBlockingIssues: boolean;
  onFixIssues: () => void;
  onEdit: () => void;
  onProceed: () => void;
  isPaid?: boolean;
  isRegenerating?: boolean;
  isLoadingPaymentStatus?: boolean;
}

export function MoneyClaimAnimatedReview({
  analysis,
  jurisdiction,
  caseStrengthBand,
  readinessSummary,
  redFlags,
  complianceIssues,
  evidence,
  hasBlockingIssues,
  onFixIssues,
  onEdit,
  onProceed,
  isPaid,
  isRegenerating,
  isLoadingPaymentStatus,
}: MoneyClaimAnimatedReviewProps) {
  // Analysis has already completed before this component is rendered.
  const progress = 100;
  const phaseIndex = reviewPhases.length - 1;
  const visible = getMoneyClaimVisibleSections(progress);
  const complete = visible.actions;
  const activePhase = reviewPhases[phaseIndex];
  const secondsRemaining = 0;

  const caseHealth = analysis?.case_health;
  const caseSummary = analysis?.case_summary;
  const totalArrears = caseSummary?.total_arrears ?? 0;
  const damages = caseSummary?.damages ?? 0;
  const otherCharges = caseSummary?.other_charges ?? 0;
  const claimInterest = caseSummary?.charge_interest === true;
  const interestRate = claimInterest ? caseSummary?.interest_rate ?? 8 : 0;
  const totalPrincipal = totalArrears + damages + otherCharges;
  const estimatedInterest = claimInterest
    ? Number((totalPrincipal * (interestRate / 100) * 0.25).toFixed(2))
    : 0;
  const totalClaim = totalPrincipal + estimatedInterest;
  const preActionStatus = caseSummary?.pre_action_status ?? 'missing';
  const preActionComplete = preActionStatus === 'complete';
  const preActionPartial = preActionStatus === 'partial';
  const hasGeneratedRentSchedule = totalArrears > 0 || evidence?.rent_schedule_uploaded === true;

  const blockers = useMemo(() => caseHealth?.blockers ?? [], [caseHealth?.blockers]);
  const risks = useMemo(() => caseHealth?.risks ?? [], [caseHealth?.risks]);
  const positives = useMemo(() => caseHealth?.positives ?? [], [caseHealth?.positives]);
  const warnings = useMemo(() => {
    const rawWarnings = caseHealth?.warnings ?? [];
    const shownIssueTexts = new Set([
      ...redFlags.map(normaliseIssueText),
      ...complianceIssues.map(normaliseIssueText),
      ...risks.map(normaliseIssueText),
    ]);
    return rawWarnings.filter((warning: unknown) => {
      const text = normaliseIssueText(warning);
      if (!text || shownIssueTexts.has(text)) return false;
      shownIssueTexts.add(text);
      return true;
    });
  }, [caseHealth?.warnings, complianceIssues, redFlags, risks]);

  const jurisdictionLabel =
    jurisdiction === 'scotland'
      ? 'Scotland Simple Procedure'
      : jurisdiction === 'wales'
      ? 'Wales money claim'
      : 'England money claim';

  const liveChecks = [
    'Claim answers loaded',
    `${jurisdictionLabel} route checked`,
    'Claim figures separated',
    'PAP-Debt timing reviewed',
    'Evidence prompts prepared',
    'Final review ready',
  ];
  const visibleChecks = liveChecks.slice(0, Math.max(1, phaseIndex + 1));

  const actionDisabled =
    !complete || hasBlockingIssues || isRegenerating === true || isLoadingPaymentStatus === true;


  return (
    <section
      className="relative min-h-screen w-full overflow-x-hidden bg-[#f8f6fc] px-4 py-6 text-charcoal sm:px-6 lg:px-10 lg:py-10"
      aria-label="Money claim review"
    >
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-primary/15 bg-white/90 p-4 shadow-[0_18px_60px_rgba(76,29,149,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-lg font-bold text-white shadow-[0_14px_30px_rgba(124,58,237,0.22)]">
              {!complete && <span className="absolute inset-0 animate-money-review-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" />}
              <span className="relative">£</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Landlord Heaven</p>
              <h1 className="truncate text-xl font-bold tracking-tight text-charcoal md:text-2xl">
                Review your money claim
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary"
              role="status"
              aria-live="polite"
            >
              <span className="relative flex h-2 w-2">
                {!complete && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {complete ? 'Review complete' : `Reviewing - ${secondsRemaining}s left`}
            </span>
            <span className="text-xs text-slate-500">Answers ✓ / Review / Preview</span>
          </div>
        </div>

        {hasBlockingIssues && <div role="alert" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><h2 className="font-semibold">Some details need your attention</h2><p className="mt-2 text-sm">Resolve the flagged issues before continuing to document preview.</p><Button onClick={onFixIssues} variant="outline" className="mt-3">Review required fixes</Button></div>}
        <div className="grid flex-1 gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="order-2 flex min-w-0 flex-col gap-4 lg:order-1">
            <Card className="overflow-hidden border-primary/15 bg-white/95 p-5 shadow-[0_22px_70px_rgba(76,29,149,0.10)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {complete ? 'Final review ready' : activePhase.label}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {complete
                      ? readinessSummary ||
                        'Your money claim review is ready. Check the figures and protocol reminders before continuing to preview.'
                      : activePhase.detail}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {visibleChecks.map((check) => (
                  <span
                    key={check}
                    className="animate-money-review-pop rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >
                    {check}
                  </span>
                ))}
              </div>
            </Card>

            <details className="rounded-2xl border border-primary/15 bg-white p-5">
              <summary className="cursor-pointer text-sm font-semibold">
                Checks covered in this review
              </summary>
              <div className="mb-4 mt-4 flex items-center gap-2">
                <RiShieldCheckLine className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-charcoal">Review sequence</h2>
              </div>
              <div className="space-y-3">
                {reviewPhases.map((phase, index) => {
                  const done = complete || index < phaseIndex;
                  const active = !complete && index === phaseIndex;
                  return (
                    <div
                      key={phase.label}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-300 ${
                        active
                          ? 'scale-[1.01] border-primary/30 bg-primary/10 shadow-[0_16px_36px_rgba(124,58,237,0.12)]'
                          : done
                          ? 'border-emerald-200 bg-emerald-50/80'
                          : 'border-slate-200 bg-white/80'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? 'bg-emerald-500 text-white'
                            : active
                            ? 'bg-primary text-white'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {done ? 'OK' : String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-charcoal">{phase.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{phase.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>

            {visible.final && (
              <Card className="animate-money-review-rise border-primary/15 bg-white/90 p-5 shadow-[0_18px_55px_rgba(76,29,149,0.08)]">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-charcoal">
                  <RiInformationLine className="h-5 w-5 text-primary" />
                  Before you issue
                </h2>
                <div className="space-y-2 text-sm leading-6 text-slate-700">
                  {[...redFlags, ...complianceIssues].slice(0, 5).map((item, index) => (
                    <p key={`${item}-${index}`} className="rounded-lg bg-primary/5 px-3 py-2">
                      {item}
                    </p>
                  ))}
                  {redFlags.length === 0 && complianceIssues.length === 0 && (
                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">
                      No extra checks were flagged from your answers.
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="order-1 flex min-w-0 flex-col gap-4 pb-6 lg:order-2 lg:pb-0">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Card className="col-span-2 border-primary/15 bg-white/95 p-4 sm:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Route</p>
                <p className="mt-2 text-lg font-bold text-charcoal">{jurisdictionLabel}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">County Court money claim and PAP-Debt checks.</p>
              </Card>
              <Card className={`${visible.final ? 'animate-money-review-rise' : 'opacity-45'} border-primary/15 bg-white/95 p-4 shadow-[0_18px_55px_rgba(76,29,149,0.08)]`}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Claim strength</p>
                <p className="mt-2 text-3xl font-bold text-primary">{visible.final ? analysis?.case_strength_score ?? '--' : '--'}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{visible.final ? caseStrengthBand : 'reviewing'}</p>
              </Card>
              <Card className={`${visible.protocol ? 'animate-money-review-rise' : 'opacity-45'} border-amber-200 bg-amber-50/90 p-4 shadow-[0_18px_55px_rgba(146,64,14,0.08)]`}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">PAP-Debt</p>
                <p className="mt-2 text-lg font-bold text-charcoal">30-day response check</p>
                <p className="mt-1 text-xs leading-5 text-amber-800">Do not issue until the response period has run.</p>
              </Card>
            </div>

            <Card className={`${visible.figures ? 'animate-money-review-rise' : 'opacity-45'} border-primary/15 bg-white/95 p-5 shadow-[0_22px_70px_rgba(76,29,149,0.10)]`}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-charcoal">
                <RiMoneyPoundCircleLine className="h-5 w-5 text-primary" />
                Claim summary
              </h2>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <ResultTile
                  label="Rent arrears"
                  value={visible.figures ? formatCurrencyAmount(totalArrears) : 'Reviewing'}
                  muted={!visible.figures}
                />
                <ResultTile
                  label="Damages"
                  value={visible.figures ? formatCurrencyAmount(damages) : 'Reviewing'}
                  muted={!visible.figures}
                />
                <ResultTile
                  label={claimInterest ? `Interest (${interestRate}%)` : 'Interest'}
                  value={
                    visible.figures
                      ? claimInterest
                        ? formatCurrencyAmount(estimatedInterest)
                        : 'Not claimed'
                      : 'Reviewing'
                  }
                  muted={!visible.figures || !claimInterest}
                />
                <ResultTile
                  label="Total claim"
                  value={visible.figures ? formatCurrencyAmount(totalClaim) : 'Reviewing'}
                  featured
                  caption="Excluding court fees"
                  muted={!visible.figures}
                />
              </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className={`${visible.protocol ? 'animate-money-review-rise' : 'opacity-45'} border-primary/15 bg-white/95 p-5 shadow-[0_18px_55px_rgba(76,29,149,0.08)]`}>
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-charcoal">
                  <RiCalendarCheckLine className="h-5 w-5 text-primary" />
                  Pre-Action Protocol status
                </h2>
                <StatusRow
                  complete={preActionComplete || preActionPartial}
                  title="Letter Before Claim"
                  body={
                    !visible.protocol
                      ? 'Reviewing Letter Before Claim status.'
                      : preActionComplete
                      ? 'You have confirmed sending a pre-action demand letter.'
                      : preActionPartial
                      ? 'This is recorded or will be generated in your pack.'
                      : 'Your pack includes the PAP Debt documents, but they must be served before issuing.'
                  }
                />
                <StatusRow
                  complete={preActionComplete}
                  warning={!preActionComplete}
                  title="30-day PAP response period"
                  body={
                    !visible.protocol
                      ? 'Checking whether a response period reminder is needed.'
                      : preActionComplete
                      ? 'Response deadline has passed or been confirmed.'
                      : 'Wait 30 days after Letter Before Claim service before issuing.'
                  }
                />
              </Card>

              <Card className={`${visible.evidence ? 'animate-money-review-rise' : 'opacity-45'} border-primary/15 bg-white/95 p-5 shadow-[0_18px_55px_rgba(76,29,149,0.08)]`}>
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-charcoal">
                  <RiFileList3Line className="h-5 w-5 text-primary" />
                  Evidence checklist
                </h2>
                <StatusRow
                  complete={evidence?.tenancy_agreement_uploaded === true}
                  neutral={evidence?.tenancy_agreement_uploaded !== true}
                  title="Tenancy agreement"
                  body={
                    !visible.evidence
                      ? 'Preparing tenancy evidence prompt.'
                      : evidence?.tenancy_agreement_uploaded
                      ? 'Recorded as available.'
                      : 'Have it ready if the tenant disputes the rent terms.'
                  }
                />
                <StatusRow
                  complete={hasGeneratedRentSchedule}
                  neutral={!hasGeneratedRentSchedule}
                  title="Rent schedule"
                  body={
                    !visible.evidence
                      ? 'Preparing arrears schedule prompt.'
                      : hasGeneratedRentSchedule
                      ? 'Your pack will build this from your answers.'
                      : 'Have a clear rent account ready before issuing.'
                  }
                />
                <StatusRow
                  complete={evidence?.bank_statements_uploaded === true}
                  neutral={evidence?.bank_statements_uploaded !== true}
                  title="Bank statements"
                  body="Optional, but useful if payments are disputed."
                />
                <StatusRow
                  complete={evidence?.correspondence_uploaded === true}
                  neutral={evidence?.correspondence_uploaded !== true}
                  title="Correspondence"
                  body="Optional messages or emails showing payment requests."
                />
              </Card>
            </div>

            {visible.final && (
              <div className="grid gap-4 xl:grid-cols-2">
                {positives.length > 0 && (
                  <Card className="animate-money-review-rise border-emerald-200 bg-emerald-50/90 p-5 shadow-[0_18px_55px_rgba(6,95,70,0.08)]">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-emerald-900">
                      <RiCheckboxCircleLine className="h-5 w-5" />
                      What is looking good
                    </h2>
                    <div className="space-y-2 text-sm leading-6 text-emerald-800">
                      {positives.slice(0, 4).map((positive: string, index: number) => (
                        <p key={`${positive}-${index}`}>Good - {positive}</p>
                      ))}
                    </div>
                  </Card>
                )}

                {(blockers.length > 0 || risks.length > 0 || warnings.length > 0) && (
                  <Card className="animate-money-review-rise border-amber-200 bg-amber-50/90 p-5 shadow-[0_18px_55px_rgba(146,64,14,0.08)]">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-950">
                      <RiErrorWarningLine className="h-5 w-5" />
                      Review notes
                    </h2>
                    <div className="space-y-2 text-sm leading-6 text-amber-900">
                      {[...blockers, ...risks, ...warnings].slice(0, 4).map((item, index) => (
                        <p key={`${issueMessage(item)}-${index}`}>{issueMessage(item)}</p>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className={`mt-5 rounded-2xl border border-primary/15 bg-white px-4 py-4 ${
            complete ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-60'
          } transition-all duration-300`}
        >
          <div className="mx-auto flex max-w-[1480px] flex-col gap-3 sm:flex-row">
            <Button onClick={onEdit} variant="outline" className="flex-1" disabled={!complete}>
              Go back &amp; edit answers
            </Button>
            {hasBlockingIssues && (
              <Button
                onClick={onFixIssues}
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                disabled={!complete}
                aria-label="Fix blocking issues"
              >
                Fix issues to continue
              </Button>
            )}
            <Button
              onClick={onProceed}
              className="flex-1"
              disabled={actionDisabled}
              aria-disabled={actionDisabled}
            >
              {!complete
                ? 'Review running...'
                : isLoadingPaymentStatus
                ? 'Loading...'
                : isRegenerating
                ? 'Regenerating...'
                : isPaid
                ? 'Regenerate pack'
                : 'Continue to document preview'}
            </Button>
          </div>
          <p className="mx-auto mt-2 max-w-[1480px] text-center text-xs text-slate-500">
            {complete
              ? isPaid
                ? 'Your updated answers will be used to regenerate your documents.'
                : 'Your pack includes PAP-Debt documents, claim forms and filing guidance.'
              : 'Final actions unlock when the review reaches 100%.'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes moneyReviewShine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }

        @keyframes moneyReviewPop {
          0% { opacity: 0; transform: translateY(6px) scale(.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes moneyReviewRise {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-money-review-shine {
          animation: moneyReviewShine 1.35s linear infinite;
        }

        .animate-money-review-pop {
          animation: moneyReviewPop 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-money-review-rise {
          animation: moneyReviewRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-money-review-shine,
          .animate-money-review-pop,
          .animate-money-review-rise {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

function ResultTile({
  label,
  value,
  caption,
  featured,
  muted,
}: {
  label: string;
  value: string;
  caption?: string;
  featured?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        featured
          ? 'border-primary bg-primary/10'
          : 'border-slate-200 bg-slate-50/80'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${featured ? 'text-primary' : muted ? 'text-slate-400' : 'text-charcoal'}`}>
        {value}
      </p>
      {caption && <p className="mt-1 text-xs text-slate-500">{caption}</p>}
    </div>
  );
}

function StatusRow({
  complete,
  warning,
  neutral,
  title,
  body,
}: {
  complete?: boolean;
  warning?: boolean;
  neutral?: boolean;
  title: string;
  body: string;
}) {
  const icon = complete ? (
    <RiCheckboxCircleLine className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
  ) : warning ? (
    <RiErrorWarningLine className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
  ) : neutral ? (
    <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-slate-300" />
  ) : (
    <RiCloseLine className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
  );

  return (
    <div className="mb-3 flex items-start gap-3 last:mb-0">
      {icon}
      <div>
        <p className="text-sm font-semibold text-charcoal">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
      </div>
    </div>
  );
}
