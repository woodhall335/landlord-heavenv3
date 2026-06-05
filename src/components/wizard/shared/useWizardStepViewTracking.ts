'use client';

import { useEffect } from 'react';

import { trackWizardStepViewWithAttribution } from '@/lib/analytics';
import { normalizeWizardStep } from '@/lib/analytics/wizard-step-taxonomy';
import { getWizardAttribution, markStepViewed } from '@/lib/wizard/wizardAttribution';

interface UseWizardStepViewTrackingParams {
  product: string;
  jurisdiction: string;
  stepId?: string | null;
  stepIndex?: number;
  totalSteps?: number;
  caseId?: string;
  enabled?: boolean;
}

export function useWizardStepViewTracking({
  product,
  jurisdiction,
  stepId,
  stepIndex = 0,
  totalSteps = 0,
  caseId,
  enabled = true,
}: UseWizardStepViewTrackingParams): void {
  useEffect(() => {
    if (!enabled || !stepId || !product || !jurisdiction) return;

    const normalizedStep = normalizeWizardStep(stepId);
    const shouldTrack = markStepViewed(stepId, {
      caseId,
      product,
      jurisdiction,
      stepGroup: normalizedStep.stepGroup,
    });

    if (!shouldTrack) return;

    const attribution = getWizardAttribution();
    trackWizardStepViewWithAttribution({
      product,
      jurisdiction,
      step: stepId,
      stepIndex,
      totalSteps,
      caseId,
      src: attribution.src,
      topic: attribution.topic,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      landing_url: attribution.landing_url,
      first_seen_at: attribution.first_seen_at,
    });
  }, [caseId, enabled, jurisdiction, product, stepId, stepIndex, totalSteps]);
}
