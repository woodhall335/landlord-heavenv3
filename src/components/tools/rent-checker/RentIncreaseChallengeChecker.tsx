'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ShieldCheck, TriangleAlert } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ToolFunnelTracker } from '@/components/tools/ToolFunnelTracker';
import { trackEvent } from '@/lib/analytics';
import type { RentCheckerInput, RentCheckerResult } from '@/lib/section13';
import { RentCheckerLanding } from './RentCheckerLanding';
import { RentCheckerForm } from './RentCheckerForm';
import { RentCheckerResultPage } from './RentCheckerResultPage';

type StepId = 'user_type' | 'property' | 'condition' | 'review';

const STEP_SEQUENCE: StepId[] = ['user_type', 'property', 'condition', 'review'];

function defaultInput(): RentCheckerInput {
  return {
    sessionId: null,
    userType: 'landlord',
    postcode: '',
    bedrooms: 2,
    propertyType: 'house',
    furnishedStatus: 'unfurnished',
    currentRent: 0,
    rentFrequency: 'monthly',
    proposedRent: null,
    tenancyStartDate: '',
    lastRentIncreaseDate: null,
    desiredIncreaseStartDate: null,
    propertyCondition: 'average',
    billsIncluded: false,
    comparableEvidenceAvailable: 'not_sure',
    tenantAlreadyObjected: false,
  };
}

function makeSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `rent-checker-${Date.now()}`;
}

function buildResultViewedPayload(result: RentCheckerResult) {
  return {
    userType: result.userType,
    postcodeOutcode: result.postcodeOutcode,
    bedrooms: result.bedrooms,
    currentRent: result.currentRent,
    proposedRent: result.proposedRent ?? undefined,
    marketMedian: result.marketMedian ?? undefined,
    evidenceStrength: result.evidenceStrength,
    challengeRisk: result.challengeRisk,
    recommendedProduct: result.recommendedProduct,
    resultState: result.resultState,
  };
}

export function RentIncreaseChallengeChecker() {
  const [input, setInput] = useState<RentCheckerInput>(() => ({
    ...defaultInput(),
    sessionId: makeSessionId(),
  }));
  const [step, setStep] = useState<StepId>('user_type');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RentCheckerResult | null>(null);
  const [started, setStarted] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedStart = useRef(false);

  useEffect(() => {
    if (!result) return;
    trackEvent('result_viewed', buildResultViewedPayload(result));
  }, [result]);

  const helperSummary = useMemo(
    () =>
      input.userType === 'landlord'
        ? 'Check whether the increase looks supportable before you serve Form 4A.'
        : 'Check whether the current or proposed rent may be above market before the deadline.',
    [input.userType]
  );

  const startTool = () => {
    setStarted(true);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackEvent('tool_started', {
        toolName: 'rent_increase_challenge_checker',
        userType: input.userType,
        jurisdiction: 'england',
      });
    }
  };

  const setField = <K extends keyof RentCheckerInput>(field: K, value: RentCheckerInput[K]) => {
    setInput((current) => ({ ...current, [field]: value }));
  };

  const validateStep = (stepId: StepId) => {
    const nextErrors: Record<string, string> = {};

    if (stepId === 'user_type') {
      if (!input.userType) nextErrors.userType = 'Choose whether you are a landlord or a tenant.';
      return nextErrors;
    }

    if (stepId === 'property') {
      if (!input.postcode.trim()) nextErrors.postcode = 'Enter the postcode.';
      if (input.bedrooms < 0) nextErrors.bedrooms = 'Enter a valid bedroom count.';
      if (!input.currentRent || input.currentRent <= 0) nextErrors.currentRent = 'Enter the current rent.';
      if (!input.tenancyStartDate) nextErrors.tenancyStartDate = 'Enter the tenancy start date.';
      if (input.userType === 'landlord' && (!input.proposedRent || input.proposedRent <= 0)) {
        nextErrors.proposedRent = 'Enter the proposed rent to assess the increase.';
      }
      return nextErrors;
    }

    return nextErrors;
  };

  const goToNext = () => {
    const nextErrors = validateStep(step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const currentIndex = STEP_SEQUENCE.indexOf(step);
    if (currentIndex < STEP_SEQUENCE.length - 1) {
      const nextStep = STEP_SEQUENCE[currentIndex + 1];
      setStep(nextStep);
      trackEvent('step_completed', {
        toolName: 'rent_increase_challenge_checker',
        step: step,
        nextStep,
        userType: input.userType,
      });
    }
  };

  const goToBack = () => {
    const currentIndex = STEP_SEQUENCE.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEP_SEQUENCE[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    const nextErrors = validateStep('property');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStep('property');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/tools/rent-increase-challenge-checker/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors({ submit: data.error || 'Failed to analyse the rent position.' });
        return;
      }

      setResult(data.result);
    } catch (error) {
      console.error(error);
      setErrors({ submit: 'Failed to analyse the rent position.' });
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setResult(null);
    setStep('user_type');
    setErrors({});
    setInput({
      ...defaultInput(),
      sessionId: makeSessionId(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf8ff_0%,#f5f3ff_18%,#f8fafc_62%,#ffffff_100%)] pb-20">
      <ToolFunnelTracker
        toolName="Rent Increase & Challenge Checker"
        toolType="checker"
        jurisdiction="england"
      />

      <Container className="space-y-10 py-10 sm:space-y-12 sm:py-12">
        <RentCheckerLanding onStart={startTool} />

        <div ref={formRef} className="space-y-6">
          <div className="flex items-start justify-between gap-6 rounded-[2rem] border border-violet-100 bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Rent checker flow</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Check the market range, risk, and next Section 13 route</h2>
              <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">{helperSummary}</p>
            </div>
            {!started ? (
              <Button onClick={startTool} className="hidden bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300 lg:inline-flex">
                Start checker
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          {result ? (
            <RentCheckerResultPage result={result} onRestart={restart} />
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <RentCheckerForm
                step={step}
                input={input}
                errors={errors}
                loading={loading}
                onChange={setField}
                onNext={goToNext}
                onBack={goToBack}
                onSubmit={handleSubmit}
              />

              <div className="space-y-5">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-semibold text-slate-950">What the result will answer</h3>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                    <li>What does this mean for the rent?</li>
                    <li>Is the market evidence strong enough?</li>
                    <li>How likely is a tenant challenge?</li>
                    <li>What should I do next?</li>
                  </ul>
                </div>

                <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <TriangleAlert className="h-5 w-5 text-amber-700" />
                    <h3 className="text-lg font-semibold text-slate-950">Truthful urgency</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">
                    Do not serve Form 4A until the dates, evidence, and service method line up with the route you choose.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default RentIncreaseChallengeChecker;
