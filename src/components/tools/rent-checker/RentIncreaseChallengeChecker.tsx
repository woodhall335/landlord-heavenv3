'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ShieldCheck, TriangleAlert } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ToolFunnelTracker } from '@/components/tools/ToolFunnelTracker';
import { trackEvent } from '@/lib/analytics';
import type { GrowthCtaPosition } from '@/lib/analytics/growth-events';
import type { RentCheckerInput, RentCheckerResult } from '@/lib/section13';
import { RentCheckerLanding } from './RentCheckerLanding';
import { RentCheckerForm } from './RentCheckerForm';
import {
  RentCheckerInsufficientEvidencePage,
  RentCheckerResultPage,
  type RentCheckerTrackingContext,
  type RentCheckerInsufficientEvidenceState,
} from './RentCheckerResultPage';

type StepId = 'property' | 'condition' | 'review';
type RentCheckerMode = 'standalone' | 'embedded';

const STEP_SEQUENCE: StepId[] = ['property', 'condition', 'review'];
const STANDALONE_SOURCE_PAGE = '/tools/rent-increase-challenge-checker';

export interface RentIncreaseChallengeCheckerProps {
  sourcePage?: string;
  mode?: RentCheckerMode;
  ctaPosition?: GrowthCtaPosition;
  introTitle?: string;
  introCopy?: string;
}

function defaultInput(): RentCheckerInput {
  return {
    sessionId: null,
    userType: 'landlord',
    postcode: '',
    bedrooms: 2,
    propertyType: 'house',
    propertySubtype: null,
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

function buildResultViewedPayload(
  result: RentCheckerResult,
  trackingContext: Required<RentCheckerTrackingContext>
) {
  return {
    sourcePage: trackingContext.sourcePage,
    pagePath: trackingContext.pagePath,
    ctaPosition: trackingContext.ctaPosition,
    intent: 'rent_increase',
    toolName: 'rent_increase_challenge_checker',
    userType: 'landlord',
    postcodeOutcode: result.postcodeOutcode,
    bedrooms: result.bedrooms,
    currentRent: result.currentRent,
    proposedRent: result.proposedRent ?? undefined,
    marketMedian: result.marketMedian ?? undefined,
    evidenceStrength: result.evidenceStrength,
    challengeRisk: result.challengeRisk,
    recommendedProduct: result.recommendedProduct,
    resultState: result.resultState,
    mode: trackingContext.mode,
  };
}

export function RentIncreaseChallengeChecker({
  sourcePage = STANDALONE_SOURCE_PAGE,
  mode = 'standalone',
  ctaPosition = mode === 'embedded' ? 'top' : 'bottom',
  introTitle,
  introCopy,
}: RentIncreaseChallengeCheckerProps = {}) {
  const isEmbedded = mode === 'embedded';
  const trackingContext: Required<RentCheckerTrackingContext> = useMemo(
    () => ({
      sourcePage,
      pagePath: sourcePage,
      ctaPosition,
      mode,
    }),
    [ctaPosition, mode, sourcePage]
  );
  const [input, setInput] = useState<RentCheckerInput>(() => ({
    ...defaultInput(),
    sessionId: makeSessionId(),
  }));
  const [step, setStep] = useState<StepId>('property');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RentCheckerResult | null>(null);
  const [insufficientEvidence, setInsufficientEvidence] =
    useState<RentCheckerInsufficientEvidenceState | null>(null);
  const [started, setStarted] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedStart = useRef(false);
  const completedResultSession = useRef<string | null>(null);

  useEffect(() => {
    if (!result) return;
    const payload = buildResultViewedPayload(result, trackingContext);

    trackEvent('result_viewed', payload);

    if (completedResultSession.current !== result.sessionId) {
      completedResultSession.current = result.sessionId;
      trackEvent('tool_completed', payload);
    }
  }, [result, trackingContext]);

  const helperSummary =
    'Check whether the proposed increase looks supportable before you serve Form 4A.';
  const resolvedIntroTitle =
    introTitle || 'Check how likely your rent increase is to be challenged';
  const resolvedIntroCopy =
    introCopy ||
    'Enter the key rent, property, and evidence details. The result uses the existing rent checker logic to recommend the Standard or Defence Section 13 route.';

  const markStarted = () => {
    setStarted(true);
    if (hasTrackedStart.current) return;
    hasTrackedStart.current = true;
    trackEvent('tool_started', {
      sourcePage: trackingContext.sourcePage,
      pagePath: trackingContext.pagePath,
      ctaPosition: trackingContext.ctaPosition,
      intent: 'rent_increase',
      toolName: 'rent_increase_challenge_checker',
      userType: 'landlord',
      jurisdiction: 'england',
      mode,
    });
  };

  const startTool = () => {
    setStarted(true);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    markStarted();
  };

  const setField = <K extends keyof RentCheckerInput>(field: K, value: RentCheckerInput[K]) => {
    setInput((current) => ({ ...current, [field]: value }));
  };

  const validateStep = (stepId: StepId) => {
    const nextErrors: Record<string, string> = {};

    if (stepId === 'property') {
      if (!input.postcode.trim()) nextErrors.postcode = 'Enter the postcode.';
      if (input.bedrooms < 0) nextErrors.bedrooms = 'Enter a valid bedroom count.';
      if (!input.currentRent || input.currentRent <= 0) nextErrors.currentRent = 'Enter the current rent.';
      if (input.propertyType !== 'other' && !input.propertySubtype) {
        nextErrors.propertySubtype = 'Select the closest property subtype.';
      }
      if (!input.proposedRent || input.proposedRent <= 0) {
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
        sourcePage: trackingContext.sourcePage,
        pagePath: trackingContext.pagePath,
        ctaPosition: trackingContext.ctaPosition,
        intent: 'rent_increase',
        step,
        nextStep,
        userType: 'landlord',
        mode,
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
    setInsufficientEvidence(null);

    try {
      const response = await fetch('/api/tools/rent-increase-challenge-checker/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          userType: 'landlord',
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 422 && data.code === 'insufficient_live_comparables') {
          setInsufficientEvidence({
            code: 'insufficient_live_comparables',
            message:
              data.error || 'We could not gather enough live comparable evidence for a grounded result.',
            sourceStatuses: Array.isArray(data.sourceStatuses) ? data.sourceStatuses : [],
          });
          setResult(null);
          return;
        }

        setErrors({ submit: data.error || 'Failed to analyse the rent position.' });
        return;
      }

      setInsufficientEvidence(null);
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
    setInsufficientEvidence(null);
    setStep('property');
    setErrors({});
    setInput({
      ...defaultInput(),
      sessionId: makeSessionId(),
    });
    if (isEmbedded) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const editDetails = () => {
    setInsufficientEvidence(null);
    setStep('property');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const flow = (
    <div
      ref={formRef}
      className="space-y-6"
      onFocusCapture={isEmbedded ? markStarted : undefined}
      onClick={isEmbedded ? markStarted : undefined}
    >
      <div className="flex items-start justify-between gap-6 rounded-[2rem] border border-violet-100 bg-white px-6 py-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Rent checker flow</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {isEmbedded ? resolvedIntroTitle : 'Check the market range, evidence, and next Section 13 route'}
          </h2>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            {isEmbedded ? resolvedIntroCopy : helperSummary}
          </p>
        </div>
        {!started ? (
          <Button onClick={startTool} className="hidden bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300 lg:inline-flex">
            Check my rent increase
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {result ? (
        <RentCheckerResultPage result={result} onRestart={restart} trackingContext={trackingContext} />
      ) : insufficientEvidence ? (
        <RentCheckerInsufficientEvidencePage
          failure={insufficientEvidence}
          onRetry={() => void handleSubmit()}
          onEditDetails={editDetails}
        />
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
                <li>Does the proposed increase look supportable?</li>
                <li>Is the market evidence strong enough?</li>
                <li>How likely is a tenant challenge?</li>
                <li>Should you use Standard, Defence, or fuller protection?</li>
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
  );

  if (isEmbedded) {
    return (
      <div id="rent-increase-checker" className="scroll-mt-24">
        {flow}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf8ff_0%,#f5f3ff_18%,#f8fafc_62%,#ffffff_100%)] pb-20">
      <ToolFunnelTracker
        toolName="Rent Increase & Challenge Checker"
        toolType="checker"
        jurisdiction="england"
      />

      <Container className="space-y-10 py-10 sm:space-y-12 sm:py-12">
        <RentCheckerLanding onStart={startTool} />
        {flow}
      </Container>
    </div>
  );
}

export default RentIncreaseChallengeChecker;
