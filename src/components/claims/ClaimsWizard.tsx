'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Car,
  CheckCircle2,
  ChevronRight,
  HardHat,
  HandCoins,
  Home,
  Lock,
  PackageOpen,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';
import { CLAIM_CONFIGS_BY_SLUG, CLAIM_PACK_DISPLAY_PRICE, CLAIM_TYPE_CONFIGS } from '@/lib/claims/config';
import type { ClaimQuestionConfig, ClaimTypeConfig, ClaimWizardAnswers, ClaimWizardAnswerValue } from '@/lib/claims/types';
import {
  calculateEvidenceStrength,
  buildGenericEvidenceIndexRows,
  getVisibleEvidenceItems,
} from '@/lib/claims/evidence';
import { getFlowModeLabel } from '@/lib/claims/validation';

const steps = ['Claim type', 'About the claim', 'Details', 'Evidence', 'Check', 'Results'];

const iconMap = {
  Car,
  HardHat,
  HandCoins,
  Home,
  PackageOpen,
  ReceiptText,
  ShieldCheck,
  UserRoundCheck,
};

const accentClasses: Record<string, string> = {
  purple: 'bg-violet-100 text-violet-700 ring-violet-200',
  lavender: 'bg-purple-100 text-purple-700 ring-purple-200',
  green: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-100 text-amber-700 ring-amber-200',
  orange: 'bg-orange-100 text-orange-700 ring-orange-200',
  teal: 'bg-teal-100 text-teal-700 ring-teal-200',
  rose: 'bg-rose-100 text-rose-700 ring-rose-200',
};

const GENERIC_EVIDENCE_DESCRIPTION_FIELD = 'generic_claim.evidence_descriptions';

function useTypewriterText(text: string, speedMs = 16): string {
  const [typingState, setTypingState] = useState({ text, visibleChars: 0 });

  useEffect(() => {
    if (!text) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypingState({ text, visibleChars: index });
      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [speedMs, text]);

  return typingState.text === text ? text.slice(0, typingState.visibleChars) : '';
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const displayText = useTypewriterText(text);

  return (
    <span className={className} aria-label={text}>
      {displayText}
      {displayText.length < text.length && <span className="ml-0.5 animate-pulse text-violet-600">|</span>}
    </span>
  );
}

function getInitialAnswers(config: ClaimTypeConfig): ClaimWizardAnswers {
  return {
    claim_category: config.id,
    claim_flow_mode: config.flowMode,
    'generic_claim.category': config.id,
    [GENERIC_EVIDENCE_DESCRIPTION_FIELD]: {},
  };
}

function isAnswered(value: ClaimWizardAnswerValue | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') return value.trim().length > 0;
  return false;
}

function getStepQuestions(config: ClaimTypeConfig, stepIndex: number): ClaimQuestionConfig[] {
  return config.stepFlow[stepIndex]?.questions ?? [];
}

function getMissingRequiredFields(config: ClaimTypeConfig, answers: ClaimWizardAnswers): string[] {
  return config.requiredDocumentFields.filter((field) => !isAnswered(answers[field]));
}

function formatFieldLabel(field: string): string {
  return field
    .split('.')
    .at(-1)!
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getEvidenceDescriptions(answers: ClaimWizardAnswers): Record<string, string> {
  const value = answers[GENERIC_EVIDENCE_DESCRIPTION_FIELD];
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return {};
  }

  return value;
}

function getStringArrayAnswer(value: ClaimWizardAnswerValue | undefined): string[] {
  return Array.isArray(value) && value.every((item): item is string => typeof item === 'string')
    ? value
    : [];
}

function ClaimTypeCard({
  config,
  selected,
  onSelect,
}: {
  config: ClaimTypeConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = iconMap[config.icon as keyof typeof iconMap] ?? ShieldCheck;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'group flex min-h-[188px] items-center gap-5 rounded-2xl border bg-white p-5 text-left shadow-[0_18px_50px_rgba(88,28,135,0.07)] transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_22px_60px_rgba(88,28,135,0.12)]',
        selected ? 'border-violet-500 ring-2 ring-violet-200' : 'border-violet-100'
      )}
    >
      <span className={clsx('flex size-16 shrink-0 items-center justify-center rounded-full ring-1', accentClasses[config.accent])}>
        <Icon className="size-8" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="text-base font-semibold text-slate-950">{config.label}</span>
          <ChevronRight className="mt-1 size-5 shrink-0 text-violet-500 transition group-hover:translate-x-1" />
        </span>
        <span className="mt-3 block text-sm leading-6 text-slate-600">{config.cardDescription}</span>
        {config.commercialPriority === 'highest' && (
          <span className="mt-4 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            Most common
          </span>
        )}
        <span className="mt-3 block text-sm font-bold text-slate-950">{CLAIM_PACK_DISPLAY_PRICE}</span>
      </span>
    </button>
  );
}

function QuestionInput({
  question,
  config,
  answers,
  value,
  onChange,
  onDescriptionChange,
}: {
  question: ClaimQuestionConfig;
  config: ClaimTypeConfig;
  answers: ClaimWizardAnswers;
  value: ClaimWizardAnswerValue | undefined;
  onChange: (value: ClaimWizardAnswerValue) => void;
  onDescriptionChange?: (itemId: string, description: string) => void;
}) {
  const inputClass =
    'w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100';

  if (question.answerType === 'textarea' || question.answerType === 'address') {
    const textValue = typeof value === 'string' ? value : '';
    return (
      <div className="space-y-3">
        <textarea
          className={clsx(inputClass, 'min-h-[156px] resize-y leading-7')}
          value={textValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type the answer here..."
        />
        {question.answerType === 'textarea' ? (
          <AskHeavenInlineEnhancer
            questionId={question.fieldPath}
            questionText={question.questionText}
            answer={textValue}
            onApply={onChange}
            context={{
              case_type: 'money_claim',
              jurisdiction: 'england',
              product: 'money_claim',
              claim_category: config.id,
              claim_flow_mode: config.flowMode,
              question_id: question.id,
            }}
            apiMode="generic"
            helperText="Ask Heaven can make this clearer and more court-ready"
          />
        ) : null}
      </div>
    );
  }

  if (question.answerType === 'yes_no') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['Yes', true],
          ['No', false],
        ].map(([label, option]) => (
          <button
            key={label as string}
            type="button"
            onClick={() => onChange(option as boolean)}
            className={clsx(
              'rounded-2xl border px-5 py-4 text-left font-semibold transition',
              value === option
                ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-200'
                : 'border-violet-100 bg-white text-slate-800 hover:border-violet-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  if (question.answerType === 'single_choice') {
    const options = question.options ?? [];
    return (
      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              'rounded-2xl border px-5 py-4 text-left transition',
              value === option.value
                ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-200'
                : 'border-violet-100 bg-white text-slate-800 hover:border-violet-300'
            )}
          >
            <span className="block font-semibold">{option.label}</span>
            {option.helperText && <span className="mt-1 block text-sm opacity-80">{option.helperText}</span>}
          </button>
        ))}
      </div>
    );
  }

  if (question.answerType === 'evidence_checklist' && config.flowMode === 'generic_small_claim') {
    const selected = getStringArrayAnswer(value);
    const descriptions = getEvidenceDescriptions(answers);
    const visibleStates = getVisibleEvidenceItems(config.evidenceCategories, answers);

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm leading-6 text-violet-950">
          No files are uploaded here. Use this checklist to plan your evidence index, then attach your actual evidence when you file the claim.
        </div>
        {visibleStates.map(({ item, triggeredByKeyword }) => {
          const checked = selected.includes(item.id);
          return (
            <div
              key={item.id}
              className={clsx(
                'rounded-2xl border bg-white p-4 transition',
                checked ? 'border-violet-500 shadow-[0_14px_34px_rgba(124,58,237,0.12)]' : 'border-violet-100'
              )}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(checked ? selected.filter((id) => id !== item.id) : [...selected, item.id])}
                  className="mt-1 size-5 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-950">{item.label}</span>
                    {item.requiredForDocument && (
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                        Required
                      </span>
                    )}
                    {item.recommended && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Recommended
                      </span>
                    )}
                    {triggeredByKeyword && (
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                        Suggested based on your story
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{item.description ?? item.helperText}</span>
                </span>
              </label>
              {item.aiHint && triggeredByKeyword && (
                <div className="mt-4 rounded-2xl bg-violet-50 p-3 text-sm leading-6 text-violet-900">
                  {item.aiHint}
                </div>
              )}
              {item.tips && item.tips.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm leading-6 text-slate-600">
                  {item.tips.map((tip) => (
                    <li key={tip}>- {tip}</li>
                  ))}
                </ul>
              )}
              {checked && (
                <div className="mt-4">
                  <label className="text-sm font-semibold text-slate-900" htmlFor={`evidence-description-${item.id}`}>
                    What does this evidence show?
                  </label>
                  <textarea
                    id={`evidence-description-${item.id}`}
                    className={clsx(inputClass, 'mt-2 min-h-[112px] resize-y leading-6')}
                    value={descriptions[item.id] ?? ''}
                    onChange={(event) => onDescriptionChange?.(item.id, event.target.value)}
                    placeholder="Example: Shows the invoice was due on 14 May and the defendant accepted the work."
                  />
                  <div className="mt-3">
                    <AskHeavenInlineEnhancer
                      questionId={`${question.fieldPath}.${item.id}`}
                      questionText={`What does the ${item.label} evidence show?`}
                      answer={descriptions[item.id] ?? ''}
                      onApply={(newText) => onDescriptionChange?.(item.id, newText)}
                      context={{
                        case_type: 'money_claim',
                        jurisdiction: 'england',
                        product: 'money_claim',
                        claim_category: config.id,
                        claim_flow_mode: config.flowMode,
                        evidence_item: item.id,
                      }}
                      apiMode="generic"
                      compact
                      helperText="Improve the evidence description"
                    />
                  </div>
                  {(item.requiredForDocument || item.recommended) && (
                    <p className="mt-2 text-xs font-medium text-slate-500">Required for selected recommended or required evidence.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (question.answerType === 'evidence_checklist' || question.answerType === 'multi_choice') {
    const selected = getStringArrayAnswer(value);
    const source = question.answerType === 'evidence_checklist'
      ? config.evidenceCategories
      : (question.options ?? []).map((option) => ({ id: option.value, label: option.label, helperText: option.helperText ?? '' }));

    return (
      <div className="grid gap-3">
        {source.map((item) => {
          const checked = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(checked ? selected.filter((id) => id !== item.id) : [...selected, item.id])}
              className={clsx(
                'flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition',
                checked ? 'border-violet-500 bg-violet-50' : 'border-violet-100 bg-white hover:border-violet-300'
              )}
            >
              <span className={clsx('mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border', checked ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300')}>
                {checked && <CheckCircle2 className="size-4" />}
              </span>
              <span>
                <span className="block font-semibold text-slate-950">{item.label}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{item.helperText}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.answerType === 'line_items') {
    const textValue = typeof value === 'string' ? value : '';
    return (
      <div className="space-y-3">
        <textarea
          className={clsx(inputClass, 'min-h-[140px] resize-y leading-7')}
          value={textValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Example: Invoice 1042 - 450.00; chaser fee - 25.00"
        />
        <AskHeavenInlineEnhancer
          questionId={question.fieldPath}
          questionText={question.questionText}
          answer={textValue}
          onApply={onChange}
          context={{
            case_type: 'money_claim',
            jurisdiction: 'england',
            product: 'money_claim',
            claim_category: config.id,
            claim_flow_mode: config.flowMode,
            question_id: question.id,
          }}
          apiMode="generic"
          helperText="Ask Heaven can tidy this into a clearer schedule"
        />
      </div>
    );
  }

  return (
    <input
      className={inputClass}
      type={question.answerType === 'date' ? 'date' : question.answerType === 'currency' ? 'number' : 'text'}
      min={question.answerType === 'currency' ? 0 : undefined}
      step={question.answerType === 'currency' ? '0.01' : undefined}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.answerType === 'currency' ? '0.00' : 'Type the answer here...'}
    />
  );
}

export function ClaimsWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConfig = useMemo(() => {
    const requested = searchParams.get('claim');
    return requested ? CLAIM_CONFIGS_BY_SLUG[requested] ?? CLAIM_TYPE_CONFIGS[0] : CLAIM_TYPE_CONFIGS[0];
  }, [searchParams]);

  const [config, setConfig] = useState(initialConfig);
  const [stepIndex, setStepIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<ClaimWizardAnswers>(() => getInitialAnswers(initialConfig));
  const [checkoutCaseId, setCheckoutCaseId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const stepQuestions = getStepQuestions(config, stepIndex);
  const activeQuestion = stepQuestions[questionIndex];
  const missingFields = getMissingRequiredFields(config, answers);
  const selectedEvidenceIds = getStringArrayAnswer(answers['generic_claim.evidence_items']);
  const visibleEvidenceStates = useMemo(
    () => getVisibleEvidenceItems(config.evidenceCategories, answers),
    [answers, config.evidenceCategories]
  );
  const visibleEvidenceItems = visibleEvidenceStates.map((state) => state.item);
  const evidenceDescriptions = getEvidenceDescriptions(answers);
  const evidenceIndexRows = buildGenericEvidenceIndexRows({
    visibleItems: visibleEvidenceItems,
    selectedIds: selectedEvidenceIds,
    descriptions: evidenceDescriptions,
  });
  const evidenceStrength = calculateEvidenceStrength({
    visibleItems: visibleEvidenceItems,
    selectedIds: selectedEvidenceIds,
    descriptions: evidenceDescriptions,
  });
  const missingRequiredEvidence = visibleEvidenceItems.filter(
    (item) => item.requiredForDocument && !selectedEvidenceIds.includes(item.id)
  );
  const isGenericEvidenceQuestion =
    activeQuestion?.answerType === 'evidence_checklist' && config.flowMode === 'generic_small_claim';
  const selectedNeedsDescription = visibleEvidenceItems.filter(
    (item) =>
      selectedEvidenceIds.includes(item.id) &&
      (item.requiredForDocument || item.recommended)
  );
  const selectedEvidenceDescriptionsReady = selectedNeedsDescription.every(
    (item) => evidenceDescriptions[item.id]?.trim().length > 0
  );
  const isClaimTypeStep = stepIndex === 0;
  const isCheckStep = stepIndex === 4;
  const isResultsStep = stepIndex === 5;
  const currentStepProgress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const activeTypingText = activeQuestion?.typingText ?? config.stepFlow[stepIndex]?.aiIntro ?? '';

  function selectConfig(nextConfig: ClaimTypeConfig) {
    setConfig(nextConfig);
    setAnswers(getInitialAnswers(nextConfig));
    setCheckoutCaseId(null);
    setCheckoutError(null);
    setStepIndex(1);
    setQuestionIndex(0);
  }

  function updateAnswer(fieldPath: string, value: ClaimWizardAnswerValue) {
    setAnswers((current) => ({ ...current, [fieldPath]: value }));
  }

  function updateEvidenceDescription(itemId: string, description: string) {
    setAnswers((current) => ({
      ...current,
      [GENERIC_EVIDENCE_DESCRIPTION_FIELD]: {
        ...getEvidenceDescriptions(current),
        [itemId]: description,
      },
    }));
  }

  async function handleClaimsCheckout() {
    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      const caseResponse = await fetch('/api/claims/case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: checkoutCaseId ?? undefined,
          claim_category: config.id,
          answers,
        }),
      });

      if (caseResponse.status === 401) {
        const redirect = `/claims?claim=${config.slug}`;
        router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }

      const caseData = await caseResponse.json().catch(() => ({}));
      if (!caseResponse.ok || !caseData.case_id) {
        throw new Error(caseData.error || 'Unable to prepare this claim for checkout.');
      }

      setCheckoutCaseId(caseData.case_id);

      const checkoutResponse = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: 'money_claim',
          case_id: caseData.case_id,
          success_url: `${window.location.origin}/dashboard/cases/${caseData.case_id}?payment=success`,
          cancel_url: `${window.location.origin}/claims?claim=${config.slug}&payment=cancelled`,
          landing_path: window.location.pathname,
        }),
      });

      if (checkoutResponse.status === 401) {
        const redirect = `/claims?claim=${config.slug}`;
        router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }

      const checkoutData = await checkoutResponse.json().catch(() => ({}));
      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || 'Unable to start checkout.');
      }

      if (checkoutData.status === 'already_paid' && checkoutData.redirect_url) {
        router.push(checkoutData.redirect_url);
        return;
      }

      if (!checkoutData.session_url) {
        throw new Error('Stripe did not return a checkout link.');
      }

      window.location.assign(checkoutData.session_url);
    } catch (error: any) {
      setCheckoutError(error.message || 'Unable to start checkout.');
      setIsCheckingOut(false);
    }
  }

  function goNext() {
    if (questionIndex < stepQuestions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      setQuestionIndex(0);
    }
  }

  function goBack() {
    if (questionIndex > 0) {
      setQuestionIndex((current) => current - 1);
      return;
    }

    if (stepIndex > 0) {
      const previousStepIndex = stepIndex - 1;
      const previousQuestions = getStepQuestions(config, previousStepIndex);
      setStepIndex(previousStepIndex);
      setQuestionIndex(Math.max(previousQuestions.length - 1, 0));
    }
  }

  const canAdvance =
    (!activeQuestion?.required || isAnswered(answers[activeQuestion.fieldPath]) || isClaimTypeStep || isResultsStep) &&
    (!isGenericEvidenceQuestion || selectedEvidenceDescriptionsReady);
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#F4ECFF_0,#FBF8FF_38%,#FFFFFF_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-violet-100 bg-white/95 shadow-[0_30px_90px_rgba(76,29,149,0.12)]">
        <div className="border-b border-violet-100 px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <span className="flex size-10 items-center justify-center rounded-full bg-violet-600 text-white">
                <Sparkles className="size-5" />
              </span>
              Ask Heaven Claims
            </div>
            <div className="flex items-center gap-3 rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-900">
              <Lock className="size-4" />
              Secure and private
            </div>
          </div>

          <div className="mt-7 overflow-x-auto pb-2">
            <div className="grid min-w-[760px] grid-cols-6 gap-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <span className={clsx(
                      'flex size-10 items-center justify-center rounded-full border text-sm font-bold',
                      index <= stepIndex ? 'border-violet-600 bg-violet-600 text-white' : 'border-violet-200 bg-white text-slate-700'
                    )}>
                      {index + 1}
                    </span>
                    <span className={clsx('text-center text-sm font-medium', index <= stepIndex ? 'text-violet-700' : 'text-slate-500')}>
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && <span className="h-px flex-1 bg-violet-200" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-1 bg-violet-50">
          <div className="h-full bg-violet-600 transition-all" style={{ width: `${currentStepProgress}%` }} />
        </div>

        <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          {isClaimTypeStep ? (
            <>
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">Money Claim Wizard</p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  What type of money claim do you need?
                </h1>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Choose the claim category and the wizard will ask one focused question at a time. Every claim pack uses the unified Money Claim Pack price of {CLAIM_PACK_DISPLAY_PRICE}.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {CLAIM_TYPE_CONFIGS.map((item) => (
                  <ClaimTypeCard
                    key={item.id}
                    config={item}
                    selected={item.id === config.id}
                    onSelect={() => selectConfig(item)}
                  />
                ))}
              </div>

              <div className="mt-8 grid gap-4 rounded-2xl bg-violet-50 p-5 text-sm text-slate-700 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex flex-wrap items-center gap-5">
                  <span className="font-semibold text-slate-950">All claim packs include:</span>
                  <span>Correct claim structure</span>
                  <span>Guidance notes</span>
                  <span>Evidence checklist</span>
                  <span>Step-by-step filing support</span>
                  <span>14-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-3 font-medium text-violet-900">
                  <ShieldCheck className="size-5" />
                  Saved as you go
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_18px_60px_rgba(76,29,149,0.08)] sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">{steps[stepIndex]}</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{config.label}</h2>
                  </div>
                  <span className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800">
                    {getFlowModeLabel(config.flowMode)}
                  </span>
                </div>

                <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-violet-900">Ask Heaven is checking what we need next...</p>
                      <p className="mt-2 text-base leading-7 text-slate-700">
                        <TypewriterText text={activeTypingText} />
                      </p>
                    </div>
                  </div>
                </div>

                {isCheckStep ? (
                  <div className="mt-8 space-y-5">
                    <div className="rounded-2xl border border-violet-100 bg-white p-5">
                      <h3 className="text-xl font-bold text-slate-950">Document readiness check</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        This step checks required fields, suitability blockers, pre-action status, court-fee readiness, and evidence quality before checkout.
                      </p>
                      <div className="mt-5 grid gap-3">
                        {missingFields.length === 0 ? (
                          <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                            Required document fields collected for this first-pass claim file.
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                            <p className="font-semibold">Fields still missing:</p>
                            <p className="mt-2 leading-6">{missingFields.map(formatFieldLabel).join(', ')}</p>
                          </div>
                        )}
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-sm font-semibold text-slate-950">Suitability blockers to review</p>
                          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                            {config.suitabilityBlockers.map((blocker) => (
                              <li key={blocker}>- {blocker}</li>
                            ))}
                          </ul>
                        </div>
                        {config.flowMode === 'generic_small_claim' && (
                          <div className="rounded-2xl border border-slate-200 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-950">Evidence strength</p>
                              <span
                                className={clsx(
                                  'rounded-full px-3 py-1 text-xs font-bold',
                                  evidenceStrength === 'Strong' && 'bg-emerald-50 text-emerald-700',
                                  evidenceStrength === 'Moderate' && 'bg-amber-50 text-amber-700',
                                  evidenceStrength === 'Weak' && 'bg-rose-50 text-rose-700'
                                )}
                              >
                                {evidenceStrength}
                              </span>
                            </div>
                            {missingRequiredEvidence.length > 0 && (
                              <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm leading-6 text-rose-800">
                                Missing required evidence: {missingRequiredEvidence.map((item) => item.label).join(', ')}
                              </div>
                            )}
                            {evidenceIndexRows.length > 0 ? (
                              <div className="mt-4 space-y-3">
                                {evidenceIndexRows.map((row) => (
                                  <div key={row.id} className="rounded-2xl bg-slate-50 p-3 text-sm">
                                    <p className="font-semibold text-slate-900">{row.label}</p>
                                    <p className="mt-1 leading-6 text-slate-600">{row.description || 'No description entered yet.'}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-3 text-sm leading-6 text-slate-600">
                                No evidence items have been selected yet.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {activeQuestion && (
                      <div>
                        <h3 className="text-2xl font-bold text-slate-950" aria-label={activeQuestion.questionText}>
                          <TypewriterText text={activeQuestion.questionText} />
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{activeQuestion.helperText}</p>
                        <div className="mt-5">
                          <QuestionInput
                            question={activeQuestion}
                            config={config}
                            answers={answers}
                            value={answers[activeQuestion.fieldPath]}
                            onChange={(value) => updateAnswer(activeQuestion.fieldPath, value)}
                            onDescriptionChange={updateEvidenceDescription}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : isResultsStep ? (
                  <div className="mt-8 rounded-2xl border border-violet-100 bg-white p-5">
                    <h3 className="text-2xl font-bold text-slate-950">Your claim pack route</h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">
                      The claims service will save these answers, take payment, and generate the document pack for this claim type from the facts collected here. You do not need to restart in another wizard.
                    </p>
                    <div className="mt-6 grid gap-3">
                      {config.packOutputs.map((output) => (
                        <div key={output} className="flex items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-950">
                          <CheckCircle2 className="size-5 text-violet-600" />
                          {output}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-violet-950">
                      <p className="font-semibold">Unified Money Claim Pack fee: {CLAIM_PACK_DISPLAY_PRICE}</p>
                      <p className="mt-1">Court fees are separate and payable directly to HMCTS.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClaimsCheckout}
                      disabled={isCheckingOut}
                      className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-wait disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
                    >
                      {isCheckingOut ? 'Preparing checkout...' : 'Continue to checkout'}
                      <ArrowRight className="size-5" />
                    </button>
                    {checkoutError && (
                      <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-800">
                        {checkoutError}
                      </div>
                    )}
                  </div>
                ) : activeQuestion ? (
                  <div className="mt-8">
                    <h3 className="text-3xl font-bold tracking-tight text-slate-950" aria-label={activeQuestion.questionText}>
                      <TypewriterText text={activeQuestion.questionText} />
                    </h3>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{activeQuestion.helperText}</p>
                    <div className="mt-6">
                      <QuestionInput
                        question={activeQuestion}
                        config={config}
                        answers={answers}
                        value={answers[activeQuestion.fieldPath]}
                        onChange={(value) => updateAnswer(activeQuestion.fieldPath, value)}
                        onDescriptionChange={updateEvidenceDescription}
                      />
                    </div>
                  </div>
                ) : null}

                {!isResultsStep && (
                  <div className="mt-8 flex flex-col-reverse gap-3 border-t border-violet-100 pt-6 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={goBack}
                      className="rounded-2xl border border-violet-200 bg-white px-5 py-3 font-semibold text-violet-900 transition hover:bg-violet-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!canAdvance}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                    >
                      Continue
                      <ArrowRight className="size-5" />
                    </button>
                  </div>
                )}
              </section>

              <aside className="space-y-4">
                <div className="rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-[0_18px_50px_rgba(76,29,149,0.07)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Current claim</p>
                  <h3 className="mt-3 text-xl font-bold text-slate-950">{config.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{config.cardDescription}</p>
                  <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm text-violet-950">
                    <p className="font-semibold">Flat price</p>
                    <p className="mt-1">{CLAIM_PACK_DISPLAY_PRICE}</p>
                  </div>
                </div>

                {config.flowMode === 'generic_small_claim' && (
                <div className="rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-[0_18px_50px_rgba(76,29,149,0.07)]">
                  <p className="text-sm font-bold text-slate-950">Evidence focus</p>
                  <div className="mt-4 space-y-3">
                    {visibleEvidenceItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="rounded-2xl bg-slate-50 p-3 text-sm">
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="mt-1 leading-5 text-slate-600">{item.helperText}</p>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
