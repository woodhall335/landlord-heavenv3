'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lock,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Reveal, StaggerReveal } from '@/components/marketing/PremiumMotion';
import { ToolUpsellCard } from '@/components/tools/ToolUpsellCard';
import {
  SECTION8_NOTICE_GROUND_OPTIONS,
  SECTION8_NOTICE_PROBLEM_OPTIONS,
  SECTION8_SERVICE_METHOD_OPTIONS,
  calculateSection8NoticeDateResult,
  formatSection8ToolDate,
  formatSection8ToolDateShort,
  getDefaultSection8GroundsForProblem,
  type Section8NoticeProblem,
  type Section8NoticeStatus,
} from '@/lib/tools/section8-notice-date-calculator';
import { getEnglandGroundDefinition, type EnglandGroundCode } from '@/lib/england-possession/ground-catalog';
import type { ServiceMethod } from '@/lib/documents/notice-date-calculator';

function todayDateOnly(): string {
  return new Date().toISOString().split('T')[0];
}

const inputClassName =
  'mt-2 w-full rounded-2xl border border-[#d8ccf8] bg-white px-4 py-3 text-sm font-semibold text-[#24173c] shadow-sm outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#ede7ff]';

const labelClassName = 'text-sm font-semibold text-[#2f2148]';

const noticeStatuses: Array<{
  id: Section8NoticeStatus;
  label: string;
  description: string;
}> = [
  {
    id: 'not_served',
    label: 'Not served yet',
    description: 'Use this when you are planning the notice date.',
  },
  {
    id: 'served_waiting',
    label: 'Served and waiting',
    description: 'Use this when the tenant is still inside the notice period.',
  },
  {
    id: 'expired_tenant_still_there',
    label: 'Expired, tenant still there',
    description: 'Use this when you need to move toward court papers.',
  },
];

export function Section8NoticeDateCalculator() {
  const [problem, setProblem] = useState<Section8NoticeProblem>('serious_arrears');
  const [groundCodes, setGroundCodes] = useState<EnglandGroundCode[]>(getDefaultSection8GroundsForProblem('serious_arrears'));
  const [actionDate, setActionDate] = useState(todayDateOnly);
  const [serviceMethod, setServiceMethod] = useState<ServiceMethod>('first_class_post');
  const [noticeStatus, setNoticeStatus] = useState<Section8NoticeStatus>('not_served');
  const [tenancyStartDate, setTenancyStartDate] = useState('');
  const [showAllGrounds, setShowAllGrounds] = useState(false);

  const result = useMemo(
    () =>
      calculateSection8NoticeDateResult({
        problem,
        groundCodes,
        actionDate,
        serviceMethod,
        noticeStatus,
        tenancyStartDate: tenancyStartDate || undefined,
      }),
    [actionDate, groundCodes, noticeStatus, problem, serviceMethod, tenancyStartDate]
  );

  const selectedProblem = SECTION8_NOTICE_PROBLEM_OPTIONS.find((option) => option.id === problem);
  const selectedServiceMethod = SECTION8_SERVICE_METHOD_OPTIONS.find((option) => option.id === serviceMethod);
  const visibleGroundCodes = useMemo(() => {
    if (showAllGrounds) {
      return SECTION8_NOTICE_GROUND_OPTIONS;
    }

    return Array.from(new Set([...(selectedProblem?.defaultGrounds || []), ...groundCodes]));
  }, [groundCodes, selectedProblem?.defaultGrounds, showAllGrounds]);
  const hasBlockingIssues = result.blockingIssues.length > 0;

  const toggleGround = (groundCode: EnglandGroundCode) => {
    setGroundCodes((current) => {
      if (current.includes(groundCode)) {
        return current.length === 1 ? current : current.filter((code) => code !== groundCode);
      }

      return [...current, groundCode];
    });
  };

  const selectProblem = (nextProblem: Section8NoticeProblem) => {
    setProblem(nextProblem);
    setGroundCodes(getDefaultSection8GroundsForProblem(nextProblem));
  };

  return (
    <section id="calculator" className="premium-surface premium-surface-lavender py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="public-eyebrow">Free Section 8 tool</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#1c1431] md:text-4xl">
            Calculate the date before you serve
          </h2>
          <p className="mt-4 text-base leading-8 text-[#5d5672] md:text-lg">
            Choose the landlord problem, check the grounds, add the date and service method, and see the earliest
            date the file can usually move toward court papers.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Reveal className="rounded-[2rem] border border-[#eadcff] bg-white/95 p-5 shadow-[0_24px_70px_rgba(45,23,87,0.08)] md:p-7">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f2e8ff] text-[#6d28d9]">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-[#1c1431]">Your notice details</h3>
                <p className="mt-2 text-sm leading-6 text-[#5d5672]">
                  This is a timing tool, not a validity certificate. The ground, wording, service, and evidence still
                  need to line up.
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-6">
              <div>
                <p className={labelClassName}>What is the main problem?</p>
                <StaggerReveal className="mt-3 grid gap-3" childClassName="premium-stagger-child">
                  {SECTION8_NOTICE_PROBLEM_OPTIONS.map((option) => {
                    const isSelected = option.id === problem;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectProblem(option.id)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? 'border-[#b997ff] bg-[#f6f0ff] shadow-[0_14px_30px_rgba(109,40,217,0.10)]'
                            : 'border-[#eadcff] bg-white hover:border-[#cbb7ff] hover:bg-[#fbf8ff]'
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span>
                            <span className="block text-sm font-semibold text-[#24173c]">{option.label}</span>
                            <span className="mt-1 block text-sm leading-6 text-[#6a6178]">{option.description}</span>
                          </span>
                          {isSelected ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#6d28d9]" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </StaggerReveal>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className={labelClassName}>Grounds to check</p>
                  <span className="rounded-full bg-[#f2e8ff] px-3 py-1 text-xs font-semibold text-[#6d28d9]">
                    {selectedProblem?.label}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {visibleGroundCodes.map((groundCode) => {
                    const ground = getEnglandGroundDefinition(groundCode);
                    if (!ground) return null;
                    const isSelected = groundCodes.includes(groundCode);

                    return (
                      <button
                        key={groundCode}
                        type="button"
                        onClick={() => toggleGround(groundCode)}
                        className={`rounded-2xl border px-3 py-3 text-left transition ${
                          isSelected
                            ? 'border-[#9f7aea] bg-[#f7f1ff] text-[#24173c]'
                            : 'border-[#ece5ff] bg-white text-[#5d5672] hover:border-[#cdbbff]'
                        }`}
                      >
                        <span className="flex items-start gap-2">
                          <span
                            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              isSelected ? 'border-[#7c3aed] bg-[#7c3aed] text-white' : 'border-[#d8ccf8] bg-white'
                            }`}
                          >
                            {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold">
                              Ground {ground.code}: {ground.title}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-[#6a6178]">
                              {ground.noticePeriodLabel}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllGrounds((current) => !current)}
                  className="mt-3 rounded-full border border-[#d8ccf8] bg-white px-4 py-2 text-xs font-semibold text-[#5b36b3] transition hover:border-[#b997ff] hover:bg-[#fbf8ff]"
                >
                  {showAllGrounds ? 'Hide advanced grounds' : 'Show all grounds'}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClassName}>
                  Date posted, delivered, or planned
                  <input
                    type="date"
                    value={actionDate}
                    onChange={(event) => setActionDate(event.target.value)}
                    className={inputClassName}
                  />
                </label>

                <label className={labelClassName}>
                  Service method
                  <select
                    value={serviceMethod}
                    onChange={(event) => setServiceMethod(event.target.value as ServiceMethod)}
                    className={inputClassName}
                  >
                    {SECTION8_SERVICE_METHOD_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedServiceMethod ? (
                    <span className="mt-2 block text-xs leading-5 text-[#6a6178]">{selectedServiceMethod.helper}</span>
                  ) : null}
                </label>
              </div>

              <label className={labelClassName}>
                Tenancy start date
                <input
                  type="date"
                  value={tenancyStartDate}
                  onChange={(event) => setTenancyStartDate(event.target.value)}
                  className={inputClassName}
                />
                <span className="mt-2 block text-xs leading-5 text-[#6a6178]">
                  Useful for sale, landlord occupation, and other timing-sensitive grounds.
                </span>
              </label>

              <div>
                <p className={labelClassName}>Where are you now?</p>
                <div className="mt-3 grid gap-3">
                  {noticeStatuses.map((status) => {
                    const isSelected = status.id === noticeStatus;

                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setNoticeStatus(status.id)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? 'border-[#c06a0a] bg-[#fff8e9] text-[#312211]'
                            : 'border-[#eadcff] bg-white text-[#5d5672] hover:border-[#e8c878]'
                        }`}
                      >
                        <span className="text-sm font-semibold">{status.label}</span>
                        <span className="mt-1 block text-sm leading-6">{status.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal className="overflow-hidden rounded-[2rem] border border-[#d7ccff] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,242,255,0.96))] shadow-[0_24px_70px_rgba(45,23,87,0.10)]">
              <div className="border-b border-[#eadcff] bg-[#fbf8ff] p-5 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">
                      Timing result
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#1c1431]">
                      Earliest court-paper date
                    </h3>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7c3aed] shadow-[0_16px_32px_rgba(124,58,237,0.14)]">
                    <CalendarDays className="h-6 w-6" />
                  </span>
                </div>
              </div>

              <div className="p-5 md:p-7">
                <StaggerReveal className="grid gap-4 sm:grid-cols-3" childClassName="premium-stagger-child">
                  <ResultMetric
                    label="Notice period"
                    value={result.noticePeriodLabel}
                    helper={`${result.noticePeriodDays} day${result.noticePeriodDays === 1 ? '' : 's'} used`}
                  />
                  <ResultMetric
                    label="Deemed served"
                    value={formatSection8ToolDateShort(result.deemedServiceDate)}
                    helper={formatSection8ToolDate(result.deemedServiceDate)}
                  />
                  <ResultMetric
                    label="Court papers from"
                    value={formatSection8ToolDateShort(result.earliestCourtDate)}
                    helper={formatSection8ToolDate(result.earliestCourtDate)}
                  />
                </StaggerReveal>

                <div className="mt-6 rounded-2xl border border-[#eadcff] bg-white/80 p-4">
                  <div className="flex items-start gap-3">
                    <Scale className="mt-1 h-5 w-5 shrink-0 text-[#6d28d9]" />
                    <p className="text-sm leading-7 text-[#4d4561]">{result.explanation}</p>
                  </div>
                </div>

                {hasBlockingIssues ? (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-700" />
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-800">
                            SECTION_8_BLOCKED
                          </p>
                          <h4 className="mt-1 text-base font-semibold text-red-950">
                            Ground availability blocker
                          </h4>
                        </div>
                        {result.blockingIssues.map((issue) => (
                          <div key={`${issue.code}-${issue.groundCode}`} className="text-sm leading-7 text-red-900">
                            <p>{issue.message}</p>
                            <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-red-700">Tenancy start</dt>
                                <dd>{formatSection8ToolDate(issue.tenancyStartDate)}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-red-700">Earliest ground expiry</dt>
                                <dd>{formatSection8ToolDate(issue.earliestGroundExpiryDate)}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-red-700">Current notice expiry</dt>
                                <dd>{formatSection8ToolDate(issue.currentNoticeExpiryDate)}</dd>
                              </div>
                            </dl>
                            <p className="mt-3 font-semibold">{issue.action}</p>
                            <p className="mt-2">
                              The date calculation is shown for transparency, but Ground {issue.groundCode} is not available on this expiry date.
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6">
                  <p className="text-sm font-semibold text-[#2f2148]">Grounds included in this calculation</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.selectedGrounds.map((ground) => (
                      <span
                        key={ground.code}
                        className="rounded-full border border-[#d9ccff] bg-white px-3 py-1.5 text-xs font-semibold text-[#5b36b3]"
                      >
                        Ground {ground.code}: {ground.title}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2">
                    {result.groundAvailability.map((availability) => (
                      <div
                        key={availability.groundCode}
                        className={`rounded-2xl border px-3 py-2 text-sm ${
                          availability.status === 'not_currently_available'
                            ? 'border-red-200 bg-red-50 text-red-900'
                            : availability.status === 'needs_review'
                              ? 'border-amber-200 bg-amber-50 text-amber-900'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        }`}
                      >
                        <span className="font-semibold">
                          Ground {availability.groundCode} status: {availability.statusLabel}
                        </span>
                        <span className="mt-1 block leading-6">{availability.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal className="rounded-[2rem] border border-[#f4d7a8] bg-[#fffaf0] p-5 shadow-[0_20px_50px_rgba(192,106,10,0.10)] md:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#b45309]" />
                <div>
                  <h3 className="text-xl font-semibold text-[#312211]">Before you rely on this date</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5f4930]">
                    {result.warnings.map((warning) => (
                      <li key={warning} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c06a0a]" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal className="rounded-[2rem] border border-[#d5f2e7] bg-white p-5 shadow-[0_20px_55px_rgba(17,147,106,0.09)] md:p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#11936a]" />
                <div>
                  <h3 className="text-xl font-semibold text-[#152b26]">Evidence to line up</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4d665f]">
                    The strongest notice file keeps the date, grounds, service record, and evidence moving together.
                  </p>
                </div>
              </div>
              <StaggerReveal className="mt-4 grid gap-2" childClassName="premium-stagger-child">
                {result.evidenceChecklist.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-2xl bg-[#f2fbf7] px-3 py-2 text-sm text-[#23483f]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#11936a]" />
                    <span>{item}</span>
                  </div>
                ))}
              </StaggerReveal>
            </Reveal>

            {hasBlockingIssues ? (
              <Reveal
                as="section"
                data-testid="tool-upsell-blocked"
                className="rounded-[1.75rem] border border-red-200 bg-gradient-to-br from-red-50 via-white to-white p-6 shadow-[0_22px_60px_rgba(185,28,28,0.10)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-900">
                      England Form 3A route
                    </span>
                    <h3 className="mt-3 text-2xl font-semibold text-gray-900">Fix blocking issues to continue</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                      This timing result cannot be used to prepare a safe notice until the blocking issue above is fixed.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-500"
                  >
                    <Lock className="h-4 w-4" />
                    Fix blocking issues to continue
                  </button>
                </div>
              </Reveal>
            ) : (
              <ToolUpsellCard
                toolName="Section 8 Notice Date Calculator"
                toolType="calculator"
                productName={result.nextStep.productName}
                ctaLabel={result.nextStep.label}
                ctaHref={result.nextStep.href}
                jurisdiction="england"
                jurisdictionLabel="England Form 3A route"
                description={result.nextStep.description}
                freeIncludes={[
                  'Notice period and deemed service date',
                  'Earliest court-paper date',
                  'Ground-led risk notes and evidence checklist',
                ]}
                paidIncludes={result.nextStep.paidIncludes}
              />
            )}

            <Reveal className="rounded-[1.5rem] border border-[#eadcff] bg-white/85 p-4">
              <p className="text-sm font-semibold text-[#2f2148]">Useful next links</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.secondaryActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="hero-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    {action.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadcff] bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b3fd1]">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[#1c1431]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#6a6178]">{helper}</p>
    </div>
  );
}
