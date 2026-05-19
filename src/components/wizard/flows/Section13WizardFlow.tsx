'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RiAddLine,
  RiArrowDownSLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiExternalLinkLine,
  RiLoader4Line,
  RiRefreshLine,
  RiUploadCloud2Line,
} from 'react-icons/ri';

import { Button } from '@/components/ui/Button';
import { WizardShellV3 } from '@/components/wizard/shared/WizardShellV3';
import { getCaseFacts } from '@/lib/wizard/facts-client';
import { getSessionTokenHeaders } from '@/lib/session-token';
import {
  createEmptySection13State,
  getSection13StateFromFacts,
  normalizeSection13State,
} from '@/lib/section13/facts';
import {
  computeSection13Preview,
  getSection13PlanRecommendation,
  getMonthlyEquivalent,
  getWeeklyEquivalent,
} from '@/lib/section13/rules';
import type {
  Section13BundleAsset,
  Section13Comparable,
  Section13ComparableAssessment,
  Section13ComparableAdjustment,
  Section13EvidenceUpload,
  Section13PlanRecommendation,
  Section13PreviewMetrics,
  Section13ProductSku,
  Section13State,
} from '@/lib/section13/types';
import { PRODUCTS } from '@/lib/pricing/products';
import { isSection13ProposalStepComplete } from '@/lib/wizard/flow-completion';
import {
  trackWizardReviewViewWithAttribution,
  trackWizardStepCompleteWithAttribution,
} from '@/lib/analytics';
import { normalizeWizardStep } from '@/lib/analytics/wizard-step-taxonomy';
import { getWizardAttribution, markStepCompleted } from '@/lib/wizard/wizardAttribution';

type SectionId =
  | 'tenancy'
  | 'landlord'
  | 'proposal'
  | 'rent_position'
  | 'comparables'
  | 'charges'
  | 'adjustments'
  | 'preview_checkout'
  | 'outputs';

const STORAGE_PREFIX = 'section13-wizard-draft';

const PROPERTY_TYPE_OPTIONS = [
  { value: '', label: 'Select property type' },
  { value: 'house', label: 'House' },
  { value: 'flat', label: 'Flat / apartment' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'studio', label: 'Studio' },
  { value: 'room', label: 'Room / shared house' },
  { value: 'other', label: 'Other / not sure' },
];

const ADJUSTMENT_COPY: Record<
  Section13ComparableAdjustment['category'],
  { label: string; hint: string; placeholder: string }
> = {
  location: {
    label: 'Location difference',
    hint: 'Use this if the listing is in a clearly better or worse spot.',
    placeholder: 'Example: listing is nearer station, so reduce it by 50',
  },
  condition: {
    label: 'Condition difference',
    hint: 'Use this if one property is more modern, larger, or in better condition.',
    placeholder: 'Example: listing is newly refurbished, so reduce it by 75',
  },
  amenities: {
    label: 'Features / bills difference',
    hint: 'Use this for parking, garden, furnishing, bills, or other extras.',
    placeholder: 'Example: listing includes parking, so reduce it by 40',
  },
  custom: {
    label: 'Other difference',
    hint: 'Use this for any other clear difference that affects rent.',
    placeholder: 'Example: listing has a larger garden, so reduce it by 50',
  },
};

const STEP_CONFIG: Array<{
  id: SectionId;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: 'tenancy',
    label: 'Property',
    title: 'Property and rent basics',
    description: 'Start with the property, postcode, bedroom count, current rent, and target rent so the market evidence can appear straight away.',
  },
  {
    id: 'comparables',
    label: 'Market evidence',
    title: 'Comparable listings and adjustments',
    description: 'Pull local listings, review the thumbnails, edit the evidence, and adjust the comparables in one place.',
  },
  {
    id: 'proposal',
    label: 'Notice details',
    title: 'Tenant and notice details',
    description: 'Add the tenant names, tenancy dates, service method, and proposed start date for the Form 4A notice.',
  },
  {
    id: 'landlord',
    label: 'Landlord',
    title: 'Landlord and agent details',
    description: 'Add the landlord contact details and any agent serving the notice.',
  },
  {
    id: 'charges',
    label: 'Charges',
    title: 'Charges included in rent',
    description: 'List only the charges included in the rent, not the ones the tenant pays separately.',
  },
  {
    id: 'preview_checkout',
    label: 'Review & pack choice',
    title: 'Review your rent increase pack choice',
    description: 'Review the local market evidence, see how supportable the rent looks, and continue to the locked document preview before secure payment.',
  },
  {
    id: 'outputs',
    label: 'Outputs',
    title: 'Download and manage outputs',
    description: 'Once paid, this is where you download the documents and build the tribunal bundle if you need it.',
  },
];

const PLAN_FEATURES: Record<Section13ProductSku, string[]> = {
  section13_standard: [
    'Official Form 4A PDF',
    'Rent increase justification report',
    'Proof of service record',
    'Cover letter and email delivery',
  ],
  section13_defensive: [
    'Everything in Standard',
    'Tribunal defence guide',
    'Landlord response template',
    'Legal briefing and evidence checklist',
    'Negotiation email template',
    'Merged tribunal bundle PDF and ZIP export',
  ],
};

const SECTION13_PLAN_TITLES: Record<Section13ProductSku, string> = {
  section13_standard: 'Supported Rent Increase Pack',
  section13_defensive: 'Tribunal-Ready Rent Increase Pack',
};

function getLocalStorageKey(caseId: string) {
  return `${STORAGE_PREFIX}:${caseId}`;
}

function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return `£${Number(value).toFixed(2)}`;
}

function formatDateLabel(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatStatusLabel(value: string | null | undefined): string {
  if (!value) return 'Pending';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getComparableAssessmentId(comparable: Section13Comparable): string {
  return comparable.id || `${comparable.addressSnippet}|${comparable.sortOrder}`;
}

function getComparableReasonBadgeClass(assessment: Section13ComparableAssessment | null | undefined): string {
  if (!assessment) return 'border-gray-200 bg-gray-50 text-gray-700';
  if (assessment.usedInCalculation) return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (assessment.relevanceBand === 'outlier') return 'border-rose-200 bg-rose-50 text-rose-800';
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

function getComparableFreshnessBadgeClass(assessment: Section13ComparableAssessment | null | undefined): string {
  if (!assessment) return 'border-gray-200 bg-gray-50 text-gray-700';
  if (assessment.freshnessBand === 'fresh_90') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (assessment.freshnessBand === 'extended_180') return 'border-amber-200 bg-amber-50 text-amber-800';
  return 'border-rose-200 bg-rose-50 text-rose-800';
}

function getMetadataString(metadata: Record<string, unknown> | null | undefined, keys: string[]): string | null {
  if (!metadata) return null;

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (Array.isArray(value)) {
      const firstString = value.find((item) => typeof item === 'string' && item.trim());
      if (typeof firstString === 'string') {
        return firstString.trim();
      }
    }
  }

  return null;
}

function getComparableThumbnailSource(
  comparable: Section13Comparable,
  assessment: Section13ComparableAssessment | null | undefined
): string | null {
  return (
    getMetadataString(comparable.metadata, [
      'imageUrl',
      'thumbnailUrl',
      'image_url',
      'thumbnail_url',
      'mainImage',
      'mainImageUrl',
      'photoUrl',
    ]) ||
    getMetadataString(assessment?.metadata, [
      'imageUrl',
      'thumbnailUrl',
      'image_url',
      'thumbnail_url',
      'mainImage',
      'mainImageUrl',
      'photoUrl',
    ])
  );
}

function getComparableUsageOverride(comparable: Section13Comparable): 'auto' | 'used' | 'context' | 'excluded' {
  const value = comparable.metadata?.userUsageOverride;
  return value === 'used' || value === 'context' || value === 'excluded' ? value : 'auto';
}

function getMarketVerdict(
  preview: Section13PreviewMetrics | undefined,
  comparableCount: number
): {
  title: string;
  body: string;
  badge: string;
  panelClassName: string;
  badgeClassName: string;
} {
  if (!preview || comparableCount === 0) {
    return {
      title: 'Ready to build the market evidence',
      body: 'Run the local listing check and we will show the landlord where the proposed rent sits before the notice questions.',
      badge: 'Evidence not checked yet',
      panelClassName: 'border-violet-200 bg-violet-50 text-violet-950',
      badgeClassName: 'border-violet-200 bg-white text-violet-900',
    };
  }

  if (preview.evidenceBand === 'strong' && preview.challengeBand !== 'higher_likelihood') {
    return {
      title: 'This is looking well supported',
      body: preview.defensibilitySummarySentence || preview.previewSummary,
      badge: preview.evidenceBandLabel,
      panelClassName: 'border-emerald-200 bg-emerald-50 text-emerald-950',
      badgeClassName: 'border-emerald-200 bg-white text-emerald-900',
    };
  }

  if (preview.challengeBand === 'higher_likelihood' || preview.evidenceBand === 'weak') {
    return {
      title: 'This needs stronger evidence before service',
      body:
        preview.saferRangeGuidance ||
        preview.challengeReasonSummary ||
        'The current comparable set is not yet strong enough for a comfortable Section 13 file.',
      badge: preview.challengeBandLabel,
      panelClassName: 'border-rose-200 bg-rose-50 text-rose-950',
      badgeClassName: 'border-rose-200 bg-white text-rose-900',
    };
  }

  return {
    title: 'This is plausible, but worth tightening',
    body: preview.defensibilitySummarySentence || preview.previewSummary,
    badge: preview.challengeBandLabel,
    panelClassName: 'border-amber-200 bg-amber-50 text-amber-950',
    badgeClassName: 'border-amber-200 bg-white text-amber-900',
  };
}

function getStepCompleteState(
  stepId: SectionId,
  state: Section13State,
  comparables: Section13Comparable[]
): { complete: boolean; hasIssue: boolean } {
  switch (stepId) {
    case 'tenancy':
      return {
        complete:
          Boolean(state.tenancy.propertyAddressLine1) &&
          Boolean(state.tenancy.propertyTownCity) &&
          Boolean(state.tenancy.postcodeRaw) &&
          Boolean(state.comparablesMeta.propertyType) &&
          state.tenancy.bedrooms != null &&
          state.tenancy.currentRentAmount != null &&
          state.proposal.proposedRentAmount != null,
        hasIssue: false,
      };
    case 'landlord':
      return {
        complete:
          Boolean(state.landlord.landlordName) &&
          Boolean(state.landlord.landlordAddressLine1) &&
          Boolean(state.landlord.landlordTownCity),
        hasIssue: false,
      };
    case 'proposal':
      return {
        complete:
          state.tenancy.tenantNames.some((name) => name.trim()) &&
          Boolean(state.tenancy.tenancyStartDate) &&
          isSection13ProposalStepComplete(state),
        hasIssue: Boolean(state.preview && !state.preview.enteredStartDateValid),
      };
    case 'rent_position':
      return {
        complete: isSection13ProposalStepComplete(state),
        hasIssue: Boolean(state.preview && !state.preview.enteredStartDateValid),
      };
    case 'charges':
      return { complete: true, hasIssue: false };
    case 'comparables':
      return { complete: comparables.length > 0, hasIssue: comparables.length === 0 };
    case 'adjustments':
      return {
        complete: comparables.length > 0,
        hasIssue: Boolean(state.preview?.warnings.length),
      };
    case 'preview_checkout':
      return {
        complete: Boolean(state.preview),
        hasIssue: Boolean(state.preview && !state.preview.enteredStartDateValid),
      };
    case 'outputs':
      return { complete: false, hasIssue: false };
    default:
      return { complete: false, hasIssue: false };
  }
}

function buildComparable(
  comparable: Section13Comparable,
  patch: Partial<Section13Comparable>
): Section13Comparable {
  const next = {
    ...comparable,
    ...patch,
  };
  const monthlyEquivalent = Number(
    getMonthlyEquivalent(next.rawRentValue, next.rawRentFrequency).toFixed(2)
  );
  const weeklyEquivalent = Number(
    getWeeklyEquivalent(next.rawRentValue, next.rawRentFrequency).toFixed(2)
  );
  const adjustmentDelta = (next.adjustments || []).reduce(
    (sum, item) => sum + Number(item.normalizedMonthlyDelta || 0),
    0
  );

  return {
    ...next,
    monthlyEquivalent,
    weeklyEquivalent,
    adjustedMonthlyEquivalent: Number((monthlyEquivalent + adjustmentDelta).toFixed(2)),
  };
}

interface Section13WizardFlowProps {
  caseId: string;
  jurisdiction: 'england';
  product: Section13ProductSku;
}

interface Section13OrderStatus {
  paid: boolean;
  fulfillment_status: string | null;
  product_type: string | null;
  has_final_documents: boolean;
  final_document_count: number;
  last_final_document_created_at: string | null;
}

interface Section13BundleJobState {
  id?: string;
  status: string;
  attemptCount?: number | null;
  maxAttempts?: number | null;
  retryAfter?: string | null;
  failureType?: string | null;
  errorMessage?: string | null;
  warningCount?: number | null;
  updatedAt?: string | null;
}

interface Section13SupportRequestState {
  id?: string;
  status: 'received' | 'in_review' | 'responded';
  priority: 'normal' | 'high' | 'urgent';
  handlingMode: 'automated' | 'escalated';
  createdAt?: string | null;
  resolvedAt?: string | null;
}

interface Section13SupportMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string | null;
}

export function Section13WizardFlow({
  caseId,
  jurisdiction,
  product,
}: Section13WizardFlowProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [state, setState] = useState<Section13State>(() => createEmptySection13State(product));
  const [comparables, setComparables] = useState<Section13Comparable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);
  const [csvImportLoading, setCsvImportLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<Section13OrderStatus | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidenceUploads, setEvidenceUploads] = useState<Section13EvidenceUpload[]>([]);
  const [evidenceUploading, setEvidenceUploading] = useState(false);
  const [bundleAssets, setBundleAssets] = useState<Section13BundleAsset[]>([]);
  const [bundleWorkflowStatus, setBundleWorkflowStatus] = useState<string | null>(null);
  const [bundleJob, setBundleJob] = useState<Section13BundleJobState | null>(null);
  const [bundleRegenerating, setBundleRegenerating] = useState(false);
  const [evidenceMessage, setEvidenceMessage] = useState<string | null>(null);
  const [supportMessages, setSupportMessages] = useState<Section13SupportMessage[]>([]);
  const [supportRequest, setSupportRequest] = useState<Section13SupportRequestState | null>(null);
  const [supportInput, setSupportInput] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);

  const hasHydratedRef = useRef(false);
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoScrapeKeyRef = useRef<string | null>(null);
  const hasTrackedReviewRef = useRef(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const localPreview = useMemo(
    () => computeSection13Preview(state, comparables),
    [comparables, state]
  );

  const effectiveState = useMemo(
    () => ({
      ...state,
      preview: localPreview,
    }),
    [localPreview, state]
  );

  const displayedScrapeMessage =
    scrapeMessage || effectiveState.comparablesMeta.lastScrapeSummary || null;
  const marketCalculation = effectiveState.preview?.marketCalculation || null;
  const comparableAssessmentMap = useMemo(() => {
    const map = new Map<string, Section13ComparableAssessment>();
    const allAssessments = [
      ...(marketCalculation?.usedComparables || []),
      ...(marketCalculation?.contextComparables || []),
      ...(marketCalculation?.excludedComparables || []),
    ];
    allAssessments.forEach((assessment) => {
      map.set(assessment.id, assessment);
    });
    return map;
  }, [marketCalculation]);

  const purchasedPlan =
    orderStatus?.paid &&
    (orderStatus.product_type === 'section13_standard' ||
      orderStatus.product_type === 'section13_defensive')
      ? (orderStatus.product_type as Section13ProductSku)
      : null;
  const activePlan = purchasedPlan || effectiveState.selectedPlan;
  const hasPaidDefensiveOrder = purchasedPlan === 'section13_defensive';
  const planRecommendation: Section13PlanRecommendation = useMemo(
    () =>
      getSection13PlanRecommendation(effectiveState.preview, {
        expectTenantChallenge: effectiveState.adjustments.expectTenantChallenge,
        selectedPlan: effectiveState.selectedPlan,
      }),
    [effectiveState.adjustments.expectTenantChallenge, effectiveState.preview, effectiveState.selectedPlan]
  );
  const selectedPlanTitle = SECTION13_PLAN_TITLES[effectiveState.selectedPlan];
  const recommendedPlanTitle = SECTION13_PLAN_TITLES[planRecommendation.recommendedPlan];
  const checkoutButtonLabel =
    effectiveState.selectedPlan === 'section13_defensive'
      ? 'Continue to document preview with the Tribunal-Ready pack'
      : 'Continue to document preview with the Standard Pack';

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setLoading(true);

      const localDraft =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(getLocalStorageKey(caseId))
          : null;
      const localData = localDraft ? JSON.parse(localDraft) : null;
      const facts = await getCaseFacts(caseId);
      const serverState = getSection13StateFromFacts(facts, product);

      if (cancelled) return;

      setState(
        normalizeSection13State(
          localData?.state ? { ...serverState, ...localData.state } : serverState
        )
      );
      setComparables(Array.isArray(localData?.comparables) ? localData.comparables : []);

      const orderResponse = await fetch(`/api/orders/status?case_id=${caseId}`);
      if (orderResponse.ok) {
        setOrderStatus(await orderResponse.json());
      }

      hasHydratedRef.current = true;
      setLoading(false);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [caseId, product]);

  async function persistDraft(options?: { awaitingPayment?: boolean }) {
    setSaving(true);
    setSaveState('saving');
    setSaveError(null);

    try {
      const response = await fetch('/api/section13/save-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSessionTokenHeaders(),
        },
        body: JSON.stringify({
          caseId,
          stepId: STEP_CONFIG[currentStepIndex]?.id,
          state: effectiveState,
          comparables,
          awaitingPayment: options?.awaitingPayment || false,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Draft save failed');
      }
      setSaveState('saved');
      if (saveResetTimeoutRef.current) {
        clearTimeout(saveResetTimeoutRef.current);
      }
      saveResetTimeoutRef.current = setTimeout(() => setSaveState('idle'), 1600);
    } catch (error: any) {
      setSaveError(error?.message || 'Draft save failed');
      setSaveState('idle');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!hasHydratedRef.current) return;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        getLocalStorageKey(caseId),
        JSON.stringify({ state: effectiveState, comparables })
      );
    }

    setSaveState('saving');

    if (pendingSaveRef.current) {
      clearTimeout(pendingSaveRef.current);
    }

    pendingSaveRef.current = setTimeout(() => {
      void persistDraft();
    }, 700);

    return () => {
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, comparables, effectiveState]);

  useEffect(() => {
    return () => {
      if (saveResetTimeoutRef.current) {
        clearTimeout(saveResetTimeoutRef.current);
      }
    };
  }, []);

  async function continueToSharedCheckoutPreview() {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      trackCurrentStepComplete();
      await persistDraft({ awaitingPayment: true });
      const params = new URLSearchParams({
        product: effectiveState.selectedPlan,
        jurisdiction: jurisdiction,
      });
      router.push(`/wizard/preview/${caseId}?${params.toString()}`);
    } catch (error: any) {
      setCheckoutError(error?.message || 'Document preview could not be opened');
    } finally {
      setCheckoutLoading(false);
    }
  }

  const refreshOrderStatus = useCallback(async () => {
    const response = await fetch(`/api/orders/status?case_id=${caseId}`);
    if (response.ok) {
      setOrderStatus(await response.json());
    }
  }, [caseId]);

  const refreshEvidenceUploads = useCallback(async () => {
    const response = await fetch(`/api/section13/upload-evidence?caseId=${caseId}`, {
      headers: getSessionTokenHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      setEvidenceUploads(Array.isArray(data.uploads) ? data.uploads : []);
      return;
    }

    if (response.status === 403) {
      setEvidenceUploads([]);
      return;
    }

    throw new Error('Could not load evidence uploads');
  }, [caseId]);

  const refreshBundleStatus = useCallback(async () => {
    const response = await fetch(`/api/section13/tribunal-bundle?caseId=${caseId}`, {
      headers: getSessionTokenHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      setBundleAssets(Array.isArray(data.assets) ? data.assets : []);
      setBundleWorkflowStatus(data.workflowStatus || null);
      setBundleJob(data.latestJob || null);
      return;
    }

    if (response.status === 403) {
      setBundleAssets([]);
      setBundleWorkflowStatus(null);
      setBundleJob(null);
      return;
    }

    throw new Error('Could not load tribunal bundle status');
  }, [caseId]);

  const refreshSupportState = useCallback(async () => {
    const response = await fetch(`/api/section13/ask-heaven?caseId=${caseId}`, {
      headers: getSessionTokenHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      setSupportMessages(Array.isArray(data.messages) ? data.messages : []);
      setSupportRequest(data.latestSupportRequest || null);
      return;
    }

    if (response.status === 403) {
      setSupportMessages([]);
      setSupportRequest(null);
      return;
    }

    throw new Error('Could not load Section 13 support status');
  }, [caseId]);

  async function handleEvidenceUpload() {
    if (evidenceFiles.length === 0) {
      setEvidenceMessage('Choose at least one PDF, JPG, or PNG file before uploading.');
      return;
    }

    setEvidenceUploading(true);
    setEvidenceMessage(null);

    try {
      const formData = new FormData();
      formData.append('caseId', caseId);
      evidenceFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/section13/upload-evidence', {
        method: 'POST',
        headers: getSessionTokenHeaders(),
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Evidence upload failed');
      }

      setEvidenceFiles([]);
      await refreshEvidenceUploads();

      const warningCount = Array.isArray(data.warnings) ? data.warnings.length : 0;
      setEvidenceMessage(
        warningCount > 0
          ? `Evidence uploaded with ${warningCount} warning${warningCount === 1 ? '' : 's'}.`
          : 'Evidence uploaded successfully.'
      );
    } catch (error: any) {
      setEvidenceMessage(error?.message || 'Evidence upload failed');
    } finally {
      setEvidenceUploading(false);
    }
  }

  async function handleBundleRegenerate() {
    setBundleRegenerating(true);
    setEvidenceMessage(null);

    try {
      const response = await fetch('/api/section13/tribunal-bundle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSessionTokenHeaders(),
        },
        body: JSON.stringify({ caseId }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Tribunal bundle could not be regenerated');
      }

      await Promise.all([refreshOrderStatus(), refreshBundleStatus()]);
      setEvidenceMessage(
        data.latestJob?.status === 'warning' || data.latestJob?.status === 'succeeded'
          ? 'Tribunal bundle refreshed. Review the status below for any warnings.'
          : 'Tribunal bundle regeneration has started. Refresh status if downloads are still processing.'
      );
    } catch (error: any) {
      setEvidenceMessage(error?.message || 'Tribunal bundle could not be regenerated');
    } finally {
      setBundleRegenerating(false);
    }
  }

  async function handleSupportSend() {
    const message = supportInput.trim();
    if (!message) {
      setSupportMessage('Enter a message before sending it to Section 13 support.');
      return;
    }

    setSupportSending(true);
    setSupportMessage(null);

    try {
      const response = await fetch('/api/section13/ask-heaven', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSessionTokenHeaders(),
        },
        body: JSON.stringify({
          caseId,
          message,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Section 13 support could not be reached');
      }

      setSupportInput('');
      setSupportMessage(
        data.handlingMode === 'escalated'
          ? 'Support request received. We have logged it for review.'
          : 'Support reply received.'
      );
      await refreshSupportState();
    } catch (error: any) {
      setSupportMessage(error?.message || 'Section 13 support could not be reached');
    } finally {
      setSupportSending(false);
    }
  }

  function updateState(
    updater: Partial<Section13State> | ((prev: Section13State) => Section13State)
  ) {
    setState((prev) =>
      normalizeSection13State(
        typeof updater === 'function'
          ? updater(prev)
          : {
              ...prev,
              ...updater,
            }
      )
    );
  }

  function updateComparable(index: number, patch: Partial<Section13Comparable>) {
    setComparables((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? buildComparable(item, patch) : item
      )
    );
  }

  function addManualComparable() {
    setComparables((prev) => [
      ...prev,
      {
        source: 'manual_unlinked',
        sourceDateKind: 'unknown',
        addressSnippet: '',
        propertyType: '',
        bedrooms: effectiveState.comparablesMeta.bedrooms ?? effectiveState.tenancy.bedrooms ?? null,
        rawRentValue: 0,
        rawRentFrequency: 'pcm',
        monthlyEquivalent: 0,
        weeklyEquivalent: 0,
        adjustedMonthlyEquivalent: 0,
        isManual: true,
        sortOrder: prev.length,
        adjustments: [],
        metadata: {
          subjectPropertyType: effectiveState.comparablesMeta.propertyType || null,
        },
      },
    ]);
  }

  function removeComparable(index: number) {
    setComparables((prev) =>
      prev
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, sortOrder: itemIndex }))
    );
  }

  function upsertAdjustment(
    comparableIndex: number,
    category: Section13ComparableAdjustment['category'],
    patch: Partial<Section13ComparableAdjustment>
  ) {
    setComparables((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== comparableIndex) return item;

        const existingIndex = item.adjustments.findIndex((adjustment) => adjustment.category === category);
        const existing =
          existingIndex >= 0
            ? item.adjustments[existingIndex]
            : {
                category,
                method: 'manual',
                inputValue: null,
                normalizedMonthlyDelta: 0,
                reason: '',
                sourceKind: 'user',
                isOverride: true,
                sortOrder: item.adjustments.length,
              };

        const nextAdjustment: Section13ComparableAdjustment = {
          ...existing,
          ...patch,
          category,
          sourceKind: 'user',
          isOverride: true,
        };

        const adjustments =
          existingIndex >= 0
            ? item.adjustments.map((adjustment, adjustmentIndex) =>
                adjustmentIndex === existingIndex ? nextAdjustment : adjustment
              )
            : [...item.adjustments, nextAdjustment];

        return buildComparable(item, { adjustments });
      })
    );
  }

  async function handleScrape() {
    const postcode = effectiveState.comparablesMeta.searchPostcodeRaw || effectiveState.tenancy.postcodeRaw;
    const bedrooms = effectiveState.comparablesMeta.bedrooms ?? effectiveState.tenancy.bedrooms;
    const propertyType = effectiveState.comparablesMeta.propertyType || null;
    if (!postcode || !bedrooms) {
      setSaveError('Enter the property postcode and bedroom count before checking local listings.');
      return;
    }

    setScrapeLoading(true);
    setSaveError(null);
    setScrapeMessage('Searching live comparables from Rightmove and OpenRent...');

    try {
      const response = await fetch('/api/section13/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSessionTokenHeaders(),
        },
        body: JSON.stringify({
          caseId,
          postcode,
          bedrooms,
          propertyType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Scrape failed');
      }

      setComparables(data.comparables || []);
      updateState((prev) => ({
        ...prev,
        comparablesMeta: {
          ...prev.comparablesMeta,
          searchPostcodeRaw: postcode,
          bedrooms,
          propertyType,
          lastScrapeAt: new Date().toISOString(),
          lastScrapeSource: data.scrapeSource || null,
          lastScrapeSummary: data.scrapeSummary || null,
        },
      }));
      setScrapeMessage(
        data.scrapeSummary ||
          `Comparable search complete. ${Array.isArray(data.comparables) ? data.comparables.length : 0} listing${Array.isArray(data.comparables) && data.comparables.length === 1 ? '' : 's'} saved.`
      );
    } catch (error: any) {
      setSaveError(error?.message || 'Scrape failed');
      setScrapeMessage(
        error?.message ||
          'We could not gather enough live comparable evidence. Try again, broaden the evidence, or add real linked listings manually to keep moving.'
      );
    } finally {
      setScrapeLoading(false);
    }
  }

  async function handleCsvImport(file: File | null) {
    if (!file) return;
    setCsvImportLoading(true);
    setSaveError(null);
    setScrapeMessage('Retrying live comparable search...');

    try {
      const csvText = await file.text();
      const response = await fetch('/api/section13/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSessionTokenHeaders(),
        },
        body: JSON.stringify({
          caseId,
          csvText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'CSV import failed');
      }

      setComparables(data.comparables || []);
      setScrapeMessage(
        data.importSummary ||
          `CSV import complete. ${Array.isArray(data.comparables) ? data.comparables.length : 0} comparable listing${Array.isArray(data.comparables) && data.comparables.length === 1 ? '' : 's'} saved.`
      );
    } catch (error: any) {
      setSaveError(error?.message || 'CSV import failed');
      setScrapeMessage('CSV import failed. Add a listing link manually if you need to keep building the file.');
    } finally {
      setCsvImportLoading(false);
    }
  }

  const completedCount = STEP_CONFIG.filter((step) =>
    getStepCompleteState(step.id, effectiveState, comparables).complete
  ).length;

  const tabs = STEP_CONFIG.map((step, index) => {
    const stepState = getStepCompleteState(step.id, effectiveState, comparables);
    return {
      id: step.id,
      label: step.label,
      isCurrent: currentStepIndex === index,
      isComplete: stepState.complete,
      hasIssue: stepState.hasIssue,
      onClick: () => setCurrentStepIndex(index),
    };
  });

  const currentStep = STEP_CONFIG[currentStepIndex];
  const currentStepState = getStepCompleteState(currentStep.id, effectiveState, comparables);
  const mustCompleteCurrentStep =
    currentStep.id === 'tenancy' || currentStep.id === 'proposal' || currentStep.id === 'landlord';
  const continueDisabled =
    currentStepIndex === STEP_CONFIG.length - 1 ||
    (mustCompleteCurrentStep && !currentStepState.complete) ||
    checkoutLoading;
  const continueDisabledReason =
    currentStep.id === 'tenancy'
      ? 'Complete the property address, town/city, postcode, property type, bedrooms, current rent, and target rent before continuing.'
      : currentStep.id === 'proposal'
        ? 'Complete the tenant, tenancy date, service date, proposed start date, and service method before continuing.'
        : currentStep.id === 'landlord'
          ? 'Complete the landlord name and address details before continuing.'
          : null;

  function trackCurrentStepComplete() {
    if (!currentStepState.complete) return;

    const normalizedStep = normalizeWizardStep(currentStep.id);
    const shouldTrack = markStepCompleted(currentStep.id, {
      caseId,
      product,
      jurisdiction,
      stepGroup: normalizedStep.stepGroup,
    });

    if (!shouldTrack) return;

    const attribution = getWizardAttribution();
    trackWizardStepCompleteWithAttribution({
      product,
      jurisdiction,
      step: currentStep.id,
      stepIndex: currentStepIndex,
      totalSteps: STEP_CONFIG.length,
      caseId,
      src: attribution.src,
      topic: attribution.topic,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      landing_url: attribution.landing_url,
      first_seen_at: attribution.first_seen_at,
    });
  }

  useEffect(() => {
    if (loading || currentStep.id !== 'preview_checkout' || hasTrackedReviewRef.current) return;

    hasTrackedReviewRef.current = true;
    const attribution = getWizardAttribution();
    trackWizardReviewViewWithAttribution({
      product,
      jurisdiction,
      hasBlockers: Boolean(currentStepState.hasIssue),
      hasWarnings: Boolean(effectiveState.preview?.warnings?.length),
      caseId,
      src: attribution.src,
      topic: attribution.topic,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      landing_url: attribution.landing_url,
      first_seen_at: attribution.first_seen_at,
    });
  }, [
    caseId,
    currentStep.id,
    currentStepState.hasIssue,
    effectiveState.preview?.warnings?.length,
    jurisdiction,
    loading,
    product,
  ]);

  useEffect(() => {
    if (loading || scrapeLoading || currentStep.id !== 'comparables' || comparables.length > 0) return;
    const postcode = effectiveState.comparablesMeta.searchPostcodeRaw || effectiveState.tenancy.postcodeRaw;
    const bedrooms = effectiveState.comparablesMeta.bedrooms ?? effectiveState.tenancy.bedrooms;
    const propertyType = effectiveState.comparablesMeta.propertyType || '';
    if (!postcode || !bedrooms) return;

    const scrapeKey = `${postcode.trim().toUpperCase()}|${bedrooms}|${propertyType}`;
    if (autoScrapeKeyRef.current === scrapeKey) return;
    autoScrapeKeyRef.current = scrapeKey;
    setScrapeMessage('Checking local listings automatically from the property details...');
    void handleScrape();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    comparables.length,
    currentStep.id,
    effectiveState.comparablesMeta.bedrooms,
    effectiveState.comparablesMeta.propertyType,
    effectiveState.comparablesMeta.searchPostcodeRaw,
    effectiveState.tenancy.bedrooms,
    effectiveState.tenancy.postcodeRaw,
    loading,
    scrapeLoading,
  ]);

  useEffect(() => {
    if (currentStep.id !== 'outputs') return;
    if (!hasPaidDefensiveOrder) {
      setEvidenceUploads([]);
      setBundleAssets([]);
      setBundleWorkflowStatus(null);
      setBundleJob(null);
      setSupportMessages([]);
      setSupportRequest(null);
      return;
    }

    void refreshEvidenceUploads().catch(() => {
      setEvidenceMessage('Evidence uploads could not be loaded just now.');
    });
    void refreshBundleStatus().catch(() => {
      setEvidenceMessage('Tribunal bundle status could not be loaded just now.');
    });
    void refreshSupportState().catch(() => {
      setSupportMessage('Section 13 support status could not be loaded just now.');
    });
  }, [
    caseId,
    currentStep.id,
    hasPaidDefensiveOrder,
    refreshBundleStatus,
    refreshEvidenceUploads,
    refreshSupportState,
  ]);

  function renderTextInput(
    label: string,
    value: string | number | null | undefined,
    onChange: (value: string) => void,
    options?: { type?: string; placeholder?: string; step?: string; required?: boolean }
  ) {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#27134a]">{label}</span>
        <input
          type={options?.type || 'text'}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={options?.placeholder}
          step={options?.step}
          required={options?.required}
          className="w-full rounded-2xl border border-[#e1d5ff] bg-[#fcfbff] px-4 py-3 text-sm shadow-sm transition focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      </label>
    );
  }

  function renderStepContent() {
    switch (currentStep.id) {
      case 'tenancy':
        return (
          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5">
              <p className="text-sm font-semibold text-violet-950">Start with the market-facing facts</p>
              <p className="mt-2 text-sm leading-6 text-violet-900">
                Add the property and rent basics first. The next step uses these details to pull local comparables before you answer the procedural notice questions.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {renderTextInput('Property address line 1', effectiveState.tenancy.propertyAddressLine1, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, propertyAddressLine1: value },
                }))
              , { required: true })}
              {renderTextInput('Property address line 2', effectiveState.tenancy.propertyAddressLine2, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, propertyAddressLine2: value },
                }))
              )}
              {renderTextInput('Town / city', effectiveState.tenancy.propertyTownCity, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, propertyTownCity: value },
                }))
              , { required: true })}
              {renderTextInput('Postcode', effectiveState.tenancy.postcodeRaw, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, postcodeRaw: value },
                  comparablesMeta: { ...prev.comparablesMeta, searchPostcodeRaw: value },
                }))
              , { required: true })}
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#27134a]">Property type</span>
                <select
                  required
                  value={effectiveState.comparablesMeta.propertyType || ''}
                  onChange={(event) =>
                    updateState((prev) => ({
                      ...prev,
                      comparablesMeta: {
                        ...prev.comparablesMeta,
                        propertyType: event.target.value || null,
                      },
                    }))
                  }
                  className="w-full rounded-2xl border border-[#e1d5ff] bg-[#fcfbff] px-4 py-3 text-sm shadow-sm transition focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                >
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value || 'blank'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {renderTextInput('Bedrooms', effectiveState.tenancy.bedrooms, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, bedrooms: value ? Number(value) : null },
                  comparablesMeta: { ...prev.comparablesMeta, bedrooms: value ? Number(value) : null },
                }))
              , { type: 'number', required: true })}
              {renderTextInput('Current rent amount', effectiveState.tenancy.currentRentAmount, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, currentRentAmount: value ? Number(value) : null },
                }))
              , { type: 'number', step: '0.01', required: true })}
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-800">Current rent frequency</span>
                <select
                  value={effectiveState.tenancy.currentRentFrequency}
                  onChange={(event) =>
                    updateState((prev) => ({
                      ...prev,
                      tenancy: {
                        ...prev.tenancy,
                        currentRentFrequency: event.target.value as Section13State['tenancy']['currentRentFrequency'],
                      },
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                >
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="4-weekly">4-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              {renderTextInput('Target new rent amount', effectiveState.proposal.proposedRentAmount, (value) =>
                updateState((prev) => ({
                  ...prev,
                  proposal: { ...prev.proposal, proposedRentAmount: value ? Number(value) : null },
                }))
              , { type: 'number', step: '0.01', required: true })}
            </div>
          </div>
        );

      case 'landlord':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {renderTextInput('Landlord name', effectiveState.landlord.landlordName, (value) =>
                updateState((prev) => ({
                  ...prev,
                  landlord: { ...prev.landlord, landlordName: value },
                }))
              )}
              {renderTextInput('Landlord phone', effectiveState.landlord.landlordPhone, (value) =>
                updateState((prev) => ({
                  ...prev,
                  landlord: { ...prev.landlord, landlordPhone: value },
                }))
              )}
              {renderTextInput('Landlord email', effectiveState.landlord.landlordEmail, (value) =>
                updateState((prev) => ({
                  ...prev,
                  landlord: { ...prev.landlord, landlordEmail: value },
                }))
              , { type: 'email' })}
              {renderTextInput('Landlord address line 1', effectiveState.landlord.landlordAddressLine1, (value) =>
                updateState((prev) => ({
                  ...prev,
                  landlord: { ...prev.landlord, landlordAddressLine1: value },
                }))
              )}
              {renderTextInput('Landlord address line 2', effectiveState.landlord.landlordAddressLine2, (value) =>
                updateState((prev) => ({
                  ...prev,
                  landlord: { ...prev.landlord, landlordAddressLine2: value },
                }))
              )}
              {renderTextInput('Landlord town / city', effectiveState.landlord.landlordTownCity, (value) =>
                updateState((prev) => ({
                  ...prev,
                  landlord: { ...prev.landlord, landlordTownCity: value },
                }))
              )}
              {renderTextInput('Landlord postcode', effectiveState.landlord.landlordPostcodeRaw, (value) =>
                updateState((prev) => ({
                  ...prev,
                  landlord: { ...prev.landlord, landlordPostcodeRaw: value },
                }))
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Agent details (optional)</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {renderTextInput('Agent name', effectiveState.landlord.agentName, (value) =>
                  updateState((prev) => ({
                    ...prev,
                    landlord: { ...prev.landlord, agentName: value },
                  }))
                )}
                {renderTextInput('Agent phone', effectiveState.landlord.agentPhone, (value) =>
                  updateState((prev) => ({
                    ...prev,
                    landlord: { ...prev.landlord, agentPhone: value },
                  }))
                )}
                {renderTextInput('Agent email', effectiveState.landlord.agentEmail, (value) =>
                  updateState((prev) => ({
                    ...prev,
                    landlord: { ...prev.landlord, agentEmail: value },
                  }))
                , { type: 'email' })}
                {renderTextInput('Agent address line 1', effectiveState.landlord.agentAddressLine1, (value) =>
                  updateState((prev) => ({
                    ...prev,
                    landlord: { ...prev.landlord, agentAddressLine1: value },
                  }))
                )}
                {renderTextInput('Agent address line 2', effectiveState.landlord.agentAddressLine2, (value) =>
                  updateState((prev) => ({
                    ...prev,
                    landlord: { ...prev.landlord, agentAddressLine2: value },
                  }))
                )}
                {renderTextInput('Agent town / city', effectiveState.landlord.agentTownCity, (value) =>
                  updateState((prev) => ({
                    ...prev,
                    landlord: { ...prev.landlord, agentTownCity: value },
                  }))
                )}
                {renderTextInput('Agent postcode', effectiveState.landlord.agentPostcodeRaw, (value) =>
                  updateState((prev) => ({
                    ...prev,
                    landlord: { ...prev.landlord, agentPostcodeRaw: value },
                  }))
                )}
              </div>
            </div>
          </div>
        );

      case 'proposal':
        return (
          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5">
              <div className="flex flex-wrap gap-2">
                {['Form 4A', 'Service record', 'Justification report'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-900 shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-violet-900">
                This step sets the new rent, the service date, and the proposed start date that carry through the official Form 4A notice and the supporting service record.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-950">Tenant names for the notice</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {effectiveState.tenancy.tenantNames.map((tenant, index) => (
                  <div key={`tenant-${index}`} className="flex items-end gap-2">
                    <div className="flex-1">
                      {renderTextInput(
                        index === 0 ? 'Tenant full name' : `Joint tenant ${index + 1}`,
                        tenant,
                        (value) =>
                          updateState((prev) => ({
                            ...prev,
                            tenancy: {
                              ...prev.tenancy,
                              tenantNames: prev.tenancy.tenantNames.map((name, nameIndex) =>
                                nameIndex === index ? value : name
                              ),
                            },
                          }))
                      )}
                    </div>
                    {index > 0 ? (
                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
                        onClick={() =>
                          updateState((prev) => ({
                            ...prev,
                            tenancy: {
                              ...prev.tenancy,
                              tenantNames: prev.tenancy.tenantNames.filter((_, itemIndex) => itemIndex !== index),
                            },
                          }))
                        }
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-violet-300 px-3 py-2 text-sm font-medium text-violet-700"
                onClick={() =>
                  updateState((prev) => ({
                    ...prev,
                    tenancy: {
                      ...prev.tenancy,
                      tenantNames: [...prev.tenancy.tenantNames, ''],
                    },
                  }))
                }
              >
                <RiAddLine className="h-4 w-4" />
                Add joint tenant
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {renderTextInput('Tenancy start date', effectiveState.tenancy.tenancyStartDate, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, tenancyStartDate: value },
                }))
              , { type: 'date' })}
              {renderTextInput('Date of last rent increase', effectiveState.tenancy.lastRentIncreaseDate, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, lastRentIncreaseDate: value || null },
                }))
              , { type: 'date' })}
              {renderTextInput('First increase after 11 February 2003', effectiveState.tenancy.firstIncreaseAfter2003Date, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, firstIncreaseAfter2003Date: value || null },
                }))
              , { type: 'date' })}
              {renderTextInput('Proposed service date', effectiveState.proposal.serviceDate, (value) =>
                updateState((prev) => ({
                  ...prev,
                  proposal: { ...prev.proposal, serviceDate: value || null },
                }))
              , { type: 'date' })}
              {renderTextInput('Proposed start date', effectiveState.proposal.proposedStartDate, (value) =>
                updateState((prev) => ({
                  ...prev,
                  proposal: { ...prev.proposal, proposedStartDate: value || null },
                }))
              , { type: 'date' })}
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#27134a]">Service method</span>
                <select
                  value={effectiveState.proposal.serviceMethod || ''}
                  onChange={(event) =>
                    updateState((prev) => ({
                      ...prev,
                      proposal: {
                        ...prev.proposal,
                        serviceMethod: (event.target.value || null) as Section13State['proposal']['serviceMethod'],
                        serviceMethodOther:
                          event.target.value === 'other' ? prev.proposal.serviceMethodOther : null,
                      },
                    }))
                  }
                  className="w-full rounded-2xl border border-[#e1d5ff] bg-[#fcfbff] px-4 py-3 text-sm shadow-sm transition focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                >
                  <option value="">Select service method</option>
                  <option value="hand_delivered">Hand delivered</option>
                  <option value="post">Post</option>
                  <option value="registered_post">Registered post</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </select>
              </label>
              {effectiveState.proposal.serviceMethod === 'other' ? (
                renderTextInput(
                  'Other service method',
                  effectiveState.proposal.serviceMethodOther,
                  (value) =>
                    updateState((prev) => ({
                      ...prev,
                      proposal: { ...prev.proposal, serviceMethodOther: value || null },
                    })),
                  { placeholder: 'Describe how the notice will be served' }
                )
              ) : null}
            </div>

            {effectiveState.preview?.earliestValidStartDate ? (
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <p className="text-sm font-semibold text-violet-950">Earliest valid start date</p>
                <p className="mt-2 text-sm text-violet-900">
                  Based on the notice period, tenancy period, and anti-drift rules, the earliest valid date is{' '}
                  <span className="font-semibold">
                    {formatDateLabel(effectiveState.preview.earliestValidStartDate)}
                  </span>
                  .
                </p>
                {effectiveState.preview.validationIssues.length ? (
                  <ul className="mt-3 space-y-1 text-sm text-violet-900">
                    {effectiveState.preview.validationIssues.map((issue) => (
                      <li key={issue}>• {issue}</li>
                    ))}
                  </ul>
                ) : null}
                {!effectiveState.preview.enteredStartDateValid ? (
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateState((prev) => ({
                          ...prev,
                          proposal: {
                            ...prev.proposal,
                            proposedStartDate: effectiveState.preview?.earliestValidStartDate || null,
                          },
                        }))
                      }
                    >
                      Use earliest valid date
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );

      case 'rent_position':
        return (
          <div className="space-y-5">
            <div className="rounded-3xl border border-violet-200 bg-[linear-gradient(180deg,#f8f3ff_0%,#ffffff_100%)] p-5">
              <p className="text-sm font-semibold text-violet-950">Early rent position check</p>
              <h3 className="mt-2 text-xl font-semibold text-gray-950">See whether the proposed increase looks supportable</h3>
              <p className="mt-2 text-sm text-gray-700">
                This helps you judge whether the proposed increase looks supportable before you finish the full evidence pack. It is more than just Form 4A.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Supportable range</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {formatMoney(effectiveState.preview?.proposedRentMonthly)}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {effectiveState.preview?.proposedPositionLabel || 'Add the proposed rent above to see where the figure sits.'}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">LQ</div>
                    <div className="font-semibold text-gray-900">{formatMoney(effectiveState.preview?.lowerQuartile)}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Median</div>
                    <div className="font-semibold text-gray-900">{formatMoney(effectiveState.preview?.median)}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">UQ</div>
                    <div className="font-semibold text-gray-900">{formatMoney(effectiveState.preview?.upperQuartile)}</div>
                  </div>
                </div>
                {marketCalculation?.medianExplanation ? (
                  <p className="mt-4 text-sm text-gray-700">{marketCalculation.medianExplanation}</p>
                ) : null}
                <p className="mt-4 text-sm text-gray-700">
                  {comparables.length > 0
                    ? effectiveState.preview?.previewSummary
                    : 'Run the local listings check next to turn this into a stronger market-backed estimate.'}
                </p>
                {comparables.length > 0 && marketCalculation?.explanationText.length ? (
                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                    {marketCalculation.explanationText.slice(1).map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <p className="text-sm font-semibold text-violet-950">How supportable the proposed rent looks</p>
                <p className="mt-3 text-sm font-semibold text-violet-900">{effectiveState.preview?.challengeBandLabel}</p>
                <p className="text-sm text-violet-900/90">{effectiveState.preview?.challengeBandExplainer}</p>
                {effectiveState.preview?.challengeReasonSummary ? (
                  <p className="mt-2 text-sm text-violet-900/90">{effectiveState.preview.challengeReasonSummary}</p>
                ) : null}
                <p className="mt-3 text-sm font-semibold text-violet-900">{effectiveState.preview?.evidenceBandLabel}</p>
                <p className="text-sm text-violet-900/90">
                  {comparables.length > 0
                    ? effectiveState.preview?.evidenceBandExplainer
                    : 'We will confirm the evidence strength once you pull comparable local listings.'}
                </p>
                {effectiveState.preview?.saferRangeGuidance ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">Safer range guidance</p>
                    <p className="mt-2 text-sm text-amber-900">{effectiveState.preview.saferRangeGuidance}</p>
                  </div>
                ) : null}
                <div className="mt-4 rounded-2xl border border-violet-200 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-gray-950">Defensibility summary</p>
                  <p className="mt-2 text-sm text-gray-700">
                    {effectiveState.preview?.defensibilitySummarySentence}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold text-gray-950">Next best step</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Check local listings automatically so we can compare your proposed rent with the live market and strengthen the justification report.
                  </p>
                </div>
                <Button onClick={() => void handleScrape()} disabled={scrapeLoading}>
                  {scrapeLoading ? (
                    <>
                      <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                      Checking local listings
                    </>
                  ) : (
                    <>Check local listings automatically</>
                  )}
                </Button>
              </div>

              <label className="mt-4 flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950">
                <input
                  type="checkbox"
                  checked={Boolean(effectiveState.adjustments.expectTenantChallenge)}
                  onChange={(event) =>
                    updateState((prev) => ({
                      ...prev,
                      adjustments: {
                        ...prev.adjustments,
                        expectTenantChallenge: event.target.checked,
                      },
                    }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-violet-300 text-violet-700 focus:ring-violet-500"
                />
                <span>I already expect the tenant may challenge this increase.</span>
              </label>
            </div>
          </div>
        );

      case 'charges':
        return (
          <div className="space-y-4">
            {effectiveState.includedCharges.map((charge) => (
              <div key={charge.key} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{charge.label}</p>
                    <p className="text-xs text-gray-600">Only include this if it is included within the rent.</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={charge.included}
                      onChange={(event) =>
                        updateState((prev) => ({
                          ...prev,
                          includedCharges: prev.includedCharges.map((item) =>
                            item.key === charge.key
                              ? { ...item, included: event.target.checked }
                              : item
                          ),
                        }))
                      }
                    />
                    Included
                  </label>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {renderTextInput('Current charge', charge.currentAmount, (value) =>
                    updateState((prev) => ({
                      ...prev,
                      includedCharges: prev.includedCharges.map((item) =>
                        item.key === charge.key
                          ? { ...item, currentAmount: value ? Number(value) : null }
                          : item
                      ),
                    }))
                  , { type: 'number', step: '0.01' })}
                  {renderTextInput('Proposed charge', charge.proposedAmount, (value) =>
                    updateState((prev) => ({
                      ...prev,
                      includedCharges: prev.includedCharges.map((item) =>
                        item.key === charge.key
                          ? { ...item, proposedAmount: value ? Number(value) : null }
                          : item
                      ),
                    }))
                  , { type: 'number', step: '0.01' })}
                </div>
              </div>
            ))}
          </div>
        );

      case 'comparables': {
        const comparableRows = comparables.map((comparable, index) => ({
          comparable,
          index,
          assessment: comparableAssessmentMap.get(getComparableAssessmentId(comparable)) || null,
        }));
        const comparableGroups = [
          {
            key: 'used',
            title: 'Used in market calculation',
            description: 'These listings affect the market median and supportable range.',
            items: comparableRows.filter((row) => row.assessment?.usedInCalculation),
          },
          {
            key: 'context',
            title: 'Context only',
            description: 'These listings help with local context, but they do not change the median or range.',
            items: comparableRows.filter(
              (row) => row.assessment && !row.assessment.usedInCalculation && row.assessment.relevanceBand !== 'outlier'
            ),
          },
          {
            key: 'excluded',
            title: 'Excluded / outlier',
            description: 'These listings are shown for transparency, but they are not relied on in the calculation.',
            items: comparableRows.filter((row) => row.assessment?.relevanceBand === 'outlier'),
          },
        ];
        const uncategorisedRows = comparableRows.filter((row) => !row.assessment);
        const marketSearchPostcode =
          effectiveState.comparablesMeta.searchPostcodeRaw || effectiveState.tenancy.postcodeRaw;
        const marketSearchBedrooms =
          effectiveState.comparablesMeta.bedrooms ?? effectiveState.tenancy.bedrooms;
        const marketSearchPropertyType = effectiveState.comparablesMeta.propertyType || '';
        const marketVerdict = getMarketVerdict(effectiveState.preview, comparables.length);

        return (
          <div className="space-y-6">
            <div className={`rounded-[1.5rem] border p-5 ${marketVerdict.panelClassName}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${marketVerdict.badgeClassName}`}>
                    {marketVerdict.badge}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">{marketVerdict.title}</h3>
                  <p className="mt-2 text-sm leading-7">{marketVerdict.body}</p>
                </div>
                {effectiveState.preview?.proposedRentMonthly ? (
                  <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-left shadow-sm md:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-75">Proposed rent</p>
                    <p className="mt-1 text-2xl font-bold">{formatMoney(effectiveState.preview.proposedRentMonthly)}</p>
                    <p className="mt-1 text-sm opacity-80">{effectiveState.preview.proposedPositionLabel}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold text-gray-950">Market check for this property</p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    We use the postcode, property type, and bedroom count from step one, so the landlord does not have to answer the same search questions twice.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900">
                      {marketSearchPostcode || 'Postcode missing'}
                    </span>
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900">
                      {marketSearchPropertyType
                        ? PROPERTY_TYPE_OPTIONS.find((option) => option.value === marketSearchPropertyType)?.label ||
                          marketSearchPropertyType
                        : 'Property type missing'}
                    </span>
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900">
                      {marketSearchBedrooms != null ? `${marketSearchBedrooms} bedrooms` : 'Bedroom count missing'}
                    </span>
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900">
                      Target rent {formatMoney(effectiveState.proposal.proposedRentAmount)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => setCurrentStepIndex(0)}>
                    Edit property basics
                  </Button>
                  <Button onClick={() => void handleScrape()} disabled={scrapeLoading}>
                    {scrapeLoading ? (
                      <>
                        <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                        Checking local listings
                      </>
                    ) : (
                      <>
                        <RiRefreshLine className="mr-2 h-4 w-4" />
                        Check local listings automatically
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
                  <RiUploadCloud2Line className="h-4 w-4" />
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(event) => void handleCsvImport(event.target.files?.[0] || null)}
                  />
                </label>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-violet-300 px-3 py-2 text-sm font-medium text-violet-700"
                  onClick={addManualComparable}
                >
                  <RiAddLine className="h-4 w-4" />
                  Add manual comparable
                </button>
                {csvImportLoading ? <span className="text-sm text-gray-600">Importing CSV…</span> : null}
              </div>

              {displayedScrapeMessage ? (
                <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900">
                  {displayedScrapeMessage}
                </div>
              ) : null}

              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Stronger with 5+ live comparable listings. We now split the evidence into used, context-only, and excluded listings so you can see exactly which rents drive the median.
              </div>

              {marketCalculation ? (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Used in calculation</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-950">{marketCalculation.usedComparableCount}</p>
                    <p className="mt-2 text-sm text-emerald-900">{marketCalculation.medianExplanation}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">Context only</p>
                    <p className="mt-2 text-2xl font-semibold text-amber-950">{marketCalculation.contextComparables.length}</p>
                    <p className="mt-2 text-sm text-amber-900">
                      Nearby but weaker matches, older listings, or entries that help explain the market without moving the median.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-800">Excluded / outlier</p>
                    <p className="mt-2 text-2xl font-semibold text-rose-950">{marketCalculation.excludedComparables.length}</p>
                    <p className="mt-2 text-sm text-rose-900">
                      Listings that are too stale, mismatched, too distant, or otherwise too distorted to support the market figure.
                    </p>
                  </div>
                </div>
              ) : null}

              {marketCalculation?.explanationText.length ? (
                <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                  <p className="text-sm font-semibold text-violet-950">Calculation basis</p>
                  <ul className="mt-2 space-y-1 text-sm text-violet-900/90">
                    {marketCalculation.explanationText.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              {comparables.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
                  No local listings added yet. Start with the automatic market check, then use CSV or manual entries only if you need to refine the file.
                </div>
              ) : null}

              {effectiveState.preview?.warnings.some((warning) => warning.includes('source-backed comparables')) ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  We still need stronger live comparable evidence before the auto-written justification is fully reliable. Retry the automatic check, upload CSV results, or add a listing link manually.
                </div>
              ) : null}

              {comparables.length > 0 ? (
                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
                  Review each comparable below. You can edit the rent, link, distance, image, bedrooms, and adjustment reasons directly on the listing card.
                </div>
              ) : null}

              {comparableGroups.map((group) =>
                group.items.length > 0 ? (
                  <div key={group.key} className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-950">{group.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{group.description}</p>
                    </div>
                    {group.items.map(({ comparable, index, assessment }) => (
                      <div key={`${getComparableAssessmentId(comparable)}-${index}`} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Comparable {index + 1}</h4>
                            <p className="mt-1 text-sm text-gray-700">{comparable.addressSnippet || 'Address not added yet'}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getComparableReasonBadgeClass(
                                assessment
                              )}`}
                            >
                              {assessment?.reasonLabel || 'Awaiting classification'}
                            </span>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getComparableFreshnessBadgeClass(
                                assessment
                              )}`}
                            >
                              {assessment?.freshnessLabel || 'Freshness pending'}
                            </span>
                            <button
                              type="button"
                              className="text-sm text-rose-700"
                              onClick={() => removeComparable(index)}
                            >
                              <RiDeleteBinLine className="inline h-4 w-4" /> Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                            {getComparableThumbnailSource(comparable, assessment) ? (
                              <img
                                src={getComparableThumbnailSource(comparable, assessment) || ''}
                                alt={`${comparable.addressSnippet || `Comparable ${index + 1}`} listing thumbnail`}
                                className="h-44 w-full object-cover"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex h-44 w-full items-center justify-center px-4 text-center text-sm text-gray-500">
                                No listing image saved yet
                              </div>
                            )}
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            {renderTextInput('Address snippet', comparable.addressSnippet, (value) =>
                              updateComparable(index, { addressSnippet: value })
                            )}
                            {renderTextInput('Property type', comparable.propertyType, (value) =>
                              updateComparable(index, { propertyType: value })
                            )}
                            {renderTextInput('Bedrooms', comparable.bedrooms, (value) =>
                              updateComparable(index, { bedrooms: value ? Number(value) : null })
                            , { type: 'number' })}
                            {renderTextInput('Rent (pcm)', comparable.rawRentValue, (value) =>
                              updateComparable(index, {
                                rawRentValue: value ? Number(value) : 0,
                                rawRentFrequency: 'pcm',
                              })
                            , { type: 'number', step: '0.01' })}
                            {renderTextInput('Listing date', comparable.sourceDateValue, (value) =>
                              updateComparable(index, {
                                sourceDateValue: value || null,
                                sourceDateKind: value ? 'published' : comparable.sourceDateKind,
                              })
                            , { type: 'date' })}
                            {renderTextInput('Listing link', comparable.sourceUrl, (value) =>
                              updateComparable(index, {
                                sourceUrl: value || null,
                                source: value ? 'manual_linked' : 'manual_unlinked',
                              })
                            )}
                            {renderTextInput('Thumbnail / image URL', getComparableThumbnailSource(comparable, assessment) || '', (value) =>
                              updateComparable(index, {
                                metadata: {
                                  ...(comparable.metadata || {}),
                                  imageUrl: value || null,
                                  thumbnailUrl: value || null,
                                },
                              })
                            )}
                            {renderTextInput('Distance (miles)', comparable.distanceMiles, (value) =>
                              updateComparable(index, { distanceMiles: value ? Number(value) : null })
                            , { type: 'number', step: '0.01' })}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-700">
                            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Raw listed rent</div>
                            <div className="mt-1 text-base font-semibold text-gray-950">{formatMoney(assessment?.rentPcmRaw ?? comparable.monthlyEquivalent)}</div>
                          </div>
                          <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-700">
                            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Adjusted rent used</div>
                            <div className="mt-1 text-base font-semibold text-gray-950">{formatMoney(assessment?.rentPcmAdjusted ?? comparable.adjustedMonthlyEquivalent)}</div>
                          </div>
                          <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-700">
                            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Bedrooms / type</div>
                            <div className="mt-1 text-base font-semibold text-gray-950">
                              {comparable.bedrooms ?? '—'} bed · {comparable.propertyType || 'Unknown'}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-700">
                            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Distance / source</div>
                            <div className="mt-1 text-base font-semibold text-gray-950">
                              {comparable.distanceMiles != null ? `${comparable.distanceMiles.toFixed(1)} miles` : 'Distance unknown'}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {assessment?.sourceDomain || comparable.sourceDomain || comparable.source}
                              {assessment?.listedDateLabel || comparable.sourceDateValue
                                ? ` · ${assessment?.listedDateLabel || comparable.sourceDateValue}`
                                : ''}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                            <label className="block space-y-1">
                              <span className="text-sm font-medium text-gray-800">Landlord decision</span>
                              <select
                                value={getComparableUsageOverride(comparable)}
                                onChange={(event) =>
                                  updateComparable(index, {
                                    metadata: {
                                      ...(comparable.metadata || {}),
                                      userUsageOverride: event.target.value,
                                    },
                                  })
                                }
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                              >
                                <option value="auto">Let the wizard decide</option>
                                <option value="used">Use in calculation</option>
                                <option value="context">Keep for context only</option>
                                <option value="excluded">Exclude from calculation</option>
                              </select>
                            </label>
                            {renderTextInput('Reason for decision', getMetadataString(comparable.metadata, ['userUsageReason']) || '', (value) =>
                              updateComparable(index, {
                                metadata: {
                                  ...(comparable.metadata || {}),
                                  userUsageReason: value || null,
                                },
                              })
                            , { placeholder: 'Example: same street, but newly refurbished / too far away / smaller rooms' })}
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                          <p className="text-sm font-semibold text-gray-950">Why this listing was {assessment?.usedInCalculation ? 'used' : assessment?.relevanceBand === 'outlier' ? 'excluded' : 'shown for context'}</p>
                          <p className="mt-2 text-sm text-gray-700">
                            {assessment?.reasonDetail || 'This listing will be classified once the preview recalculates.'}
                          </p>
                          <p className="mt-2 text-sm text-gray-700">
                            Adjustment reason: {assessment?.adjustmentReason || 'No adjustment applied'}
                          </p>
                        </div>

                        <details
                          className="group mt-4 rounded-2xl border-2 border-violet-200 bg-violet-50/70 p-4 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
                          open={comparable.adjustments.length > 0}
                        >
                          <summary className="cursor-pointer list-none">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div className="flex gap-3">
                                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-700 text-white shadow-sm">
                                  <RiEdit2Line className="h-5 w-5" />
                                </span>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-violet-950">Need to adjust this listing?</p>
                                    <span className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-800">
                                      Click to open
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm leading-6 text-violet-900/80">
                                    Use this if this rental is clearly better or worse than your property. Add or subtract a monthly amount so the comparison is fair.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm font-semibold text-violet-950">
                                <span>Adjusted rent {formatMoney(comparable.adjustedMonthlyEquivalent)}</span>
                                <RiArrowDownSLine className="h-5 w-5 transition group-open:rotate-180" />
                              </div>
                            </div>
                          </summary>
                          <div className="mt-4 border-t border-violet-100 pt-4">
                            <div>
                              <p className="text-sm leading-6 text-violet-900/80">
                                Add a minus amount if the listing is better than your property. Add a plus amount if your property is better than the listing.
                              </p>
                            </div>
                            <div className="mt-4 grid gap-3">
                              {(['location', 'condition', 'amenities'] as const).map((category) => {
                                const adjustment = comparable.adjustments.find((item) => item.category === category);
                                const copy = ADJUSTMENT_COPY[category];
                                return (
                                  <div
                                    key={category}
                                    className="grid gap-3 rounded-xl border border-violet-100 bg-white p-3 md:grid-cols-[180px_160px_1fr]"
                                  >
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900">{copy.label}</div>
                                      <p className="mt-1 text-xs leading-5 text-gray-600">{copy.hint}</p>
                                    </div>
                                    {renderTextInput('Monthly rent change', adjustment?.normalizedMonthlyDelta, (value) =>
                                      upsertAdjustment(index, category, {
                                        normalizedMonthlyDelta: value ? Number(value) : 0,
                                      })
                                    , { type: 'number', step: '0.01' })}
                                    {renderTextInput('Why are you changing it?', adjustment?.reason, (value) =>
                                      upsertAdjustment(index, category, { reason: value })
                                    , { placeholder: copy.placeholder })}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </details>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                          <span>Monthly equivalent: {formatMoney(comparable.monthlyEquivalent)}</span>
                          <span>Adjusted: {formatMoney(comparable.adjustedMonthlyEquivalent)}</span>
                          {comparable.sourceUrl ? (
                            <a
                              href={comparable.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-violet-700"
                            >
                              Open listing <RiExternalLinkLine className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null
              )}

              {uncategorisedRows.length > 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                  {uncategorisedRows.length} comparable listing{uncategorisedRows.length === 1 ? '' : 's'} still need classification. Re-run the local market check or adjust the details above.
                </div>
              ) : null}

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-800">Manual justification notes</span>
                  <textarea
                    value={effectiveState.adjustments.manualJustification || ''}
                    onChange={(event) =>
                      updateState((prev) => ({
                        ...prev,
                        adjustments: {
                          ...prev.adjustments,
                          manualJustification: event.target.value,
                        },
                      }))
                    }
                    rows={5}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="Add property-specific context you want preserved in the report."
                  />
                </label>
              </div>
            </div>
          </div>
        );
      }

      case 'adjustments':
        return (
          <div className="space-y-5">
            {comparables.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
                Add comparables first, then come back to adjustments.
              </div>
            ) : null}

            {comparables.map((comparable, index) => (
              <div key={`adjustments-${comparable.id || index}`} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{comparable.addressSnippet || `Comparable ${index + 1}`}</h3>
                    <p className="text-xs text-gray-600">Base monthly equivalent {formatMoney(comparable.monthlyEquivalent)}.</p>
                  </div>
                  <div className="text-sm font-semibold text-violet-900">
                    Adjusted {formatMoney(comparable.adjustedMonthlyEquivalent)}
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  {(['location', 'condition', 'amenities'] as const).map((category) => {
                    const adjustment = comparable.adjustments.find((item) => item.category === category);
                    return (
                      <div key={category} className="grid gap-3 rounded-xl border border-gray-200 p-3 md:grid-cols-[160px_160px_1fr]">
                        <div className="text-sm font-medium capitalize text-gray-900">{category}</div>
                        {renderTextInput('Monthly delta', adjustment?.normalizedMonthlyDelta, (value) =>
                          upsertAdjustment(index, category, {
                            normalizedMonthlyDelta: value ? Number(value) : 0,
                          })
                        , { type: 'number', step: '0.01' })}
                        {renderTextInput('Reason', adjustment?.reason, (value) =>
                          upsertAdjustment(index, category, { reason: value })
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-gray-200 p-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-800">Manual justification notes</span>
                <textarea
                  value={effectiveState.adjustments.manualJustification || ''}
                  onChange={(event) =>
                    updateState((prev) => ({
                      ...prev,
                      adjustments: {
                        ...prev.adjustments,
                        manualJustification: event.target.value,
                      },
                    }))
                  }
                  rows={6}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Add property-specific context you want preserved in the report."
                />
              </label>
            </div>
          </div>
        );

      case 'preview_checkout':
        return (
          <div className="space-y-5">
            <div className="rounded-3xl border border-violet-200 bg-[linear-gradient(180deg,#f8f3ff_0%,#ffffff_100%)] p-5">
              <p className="text-sm font-semibold text-violet-950">Recommended pack</p>
              <h3 className="mt-2 text-xl font-semibold text-gray-950">{planRecommendation.headline}</h3>
              <p className="mt-2 text-sm text-gray-700">{planRecommendation.reason}</p>
              {planRecommendation.upsellMessage ? (
                <p className="mt-3 text-sm text-violet-900">{planRecommendation.upsellMessage}</p>
              ) : null}
              <div className="mt-4 inline-flex rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-900">
                Recommended: {recommendedPlanTitle}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">What we found in the local market</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {formatMoney(effectiveState.preview?.proposedRentMonthly)}
                </p>
                <p className="mt-2 text-sm text-gray-700">{effectiveState.preview?.proposedPositionLabel}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">LQ</div>
                    <div className="font-semibold text-gray-900">{formatMoney(effectiveState.preview?.lowerQuartile)}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Median</div>
                    <div className="font-semibold text-gray-900">{formatMoney(effectiveState.preview?.median)}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">UQ</div>
                    <div className="font-semibold text-gray-900">{formatMoney(effectiveState.preview?.upperQuartile)}</div>
                  </div>
                </div>
                {marketCalculation?.medianExplanation ? (
                  <p className="mt-4 text-sm text-gray-700">{marketCalculation.medianExplanation}</p>
                ) : null}
                <p className="mt-4 text-sm text-gray-700">{effectiveState.preview?.previewSummary}</p>
                {marketCalculation?.explanationText.length ? (
                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                    {marketCalculation.explanationText.slice(1).map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <p className="text-sm font-semibold text-violet-950">How supportable the proposed rent looks</p>
                <p className="mt-3 text-sm font-semibold text-violet-900">{effectiveState.preview?.challengeBandLabel}</p>
                <p className="text-sm text-violet-900/90">{effectiveState.preview?.challengeBandExplainer}</p>
                {effectiveState.preview?.challengeReasonSummary ? (
                  <div className="mt-3 rounded-2xl border border-violet-200 bg-white/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-800">Why this risk band</p>
                    <p className="mt-2 text-sm text-gray-700">{effectiveState.preview.challengeReasonSummary}</p>
                  </div>
                ) : null}
                <p className="mt-3 text-sm font-semibold text-violet-900">{effectiveState.preview?.evidenceBandLabel}</p>
                <p className="text-sm text-violet-900/90">{effectiveState.preview?.evidenceBandExplainer}</p>
                {effectiveState.preview?.saferRangeGuidance ? (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">Safer range guidance</p>
                    <p className="mt-2 text-sm text-amber-900">{effectiveState.preview.saferRangeGuidance}</p>
                  </div>
                ) : null}
                <p className="mt-3 text-xs text-violet-900/80">
                  These bands are evidence signals based on the comparable data and are not legal guarantees.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-950">Defensibility summary</p>
              <p className="mt-2 text-sm text-gray-700">
                {effectiveState.preview?.defensibilitySummarySentence}
              </p>
              {marketCalculation ? (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-700">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Used in calculation</div>
                    <div className="mt-1 text-base font-semibold text-gray-950">{marketCalculation.usedComparableCount}</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-700">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Context only</div>
                    <div className="mt-1 text-base font-semibold text-gray-950">{marketCalculation.contextComparables.length}</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-700">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Excluded / outlier</div>
                    <div className="mt-1 text-base font-semibold text-gray-950">{marketCalculation.excludedComparables.length}</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              The tenant can apply to the tribunal up to the day before the proposed start date. The tribunal can set a lower rent, but not higher than the rent you propose.
            </div>

            {effectiveState.preview?.validationIssues.length ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <ul className="space-y-1 text-sm text-rose-800">
                  {effectiveState.preview.validationIssues.map((issue) => (
                    <li key={issue}>• {issue}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-950">What is included in your pack</p>
              <p className="mt-2 text-sm text-gray-700">
                {selectedPlanTitle} includes the live Form 4A draft, the justification report, and the delivery material tied to this case. The Tribunal-Ready Rent Increase Pack adds the extra challenge-response and tribunal-facing bundle tools when you need stronger preparation.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {(['section13_standard', 'section13_defensive'] as const).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  className={`rounded-2xl border p-5 text-left transition ${
                    effectiveState.selectedPlan === plan
                      ? 'border-violet-500 bg-violet-50 shadow'
                      : 'border-gray-200 bg-white hover:border-violet-300'
                  }`}
                  onClick={() =>
                    updateState((prev) => ({
                      ...prev,
                      selectedPlan: plan,
                    }))
                  }
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-950">{SECTION13_PLAN_TITLES[plan]}</h3>
                      <p className="mt-1 text-2xl font-bold text-violet-900">
                        {plan === 'section13_defensive'
                          ? PRODUCTS.section13_defensive.displayPrice
                          : PRODUCTS.section13_standard.displayPrice}
                      </p>
                    </div>
                  </div>
                  {planRecommendation.recommendedPlan === plan ? (
                    <div className="mt-3 inline-flex rounded-full border border-violet-300 bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">
                      Recommended
                    </div>
                  ) : null}
                  <p className="mt-3 text-sm text-gray-700">
                    {plan === 'section13_defensive'
                      ? 'Best when challenge risk is higher and you want the extra response and tribunal-facing material from the start.'
                      : 'Best when the proposed increase looks supportable and you mainly need Form 4A, the justification report, and the service record.'}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-700">
                    {PLAN_FEATURES[plan].map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-700">
                Payment unlocks the completed Form 4A, your full report, and, for Tribunal-Ready Rent Increase Pack purchases, the tribunal-ready bundle tools.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => void continueToSharedCheckoutPreview()} disabled={checkoutLoading}>
                  {checkoutLoading ? (
                    <>
                      <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                    Opening document preview
                    </>
                  ) : (
                    <>{checkoutButtonLabel}</>
                  )}
                </Button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                  onClick={() => void persistDraft({ awaitingPayment: true })}
                >
                  Save and come back later
                </button>
              </div>
            </div>
          </div>
        );

      case 'outputs':
        return (
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-950">Current purchase status</h3>
              <p className="mt-2 text-sm text-gray-700">
                {orderStatus?.paid
                  ? `Payment confirmed. Fulfillment status: ${formatStatusLabel(orderStatus.fulfillment_status)}.`
                  : 'Continue from review to unlock downloads.'}
              </p>
              {orderStatus?.has_final_documents ? (
                <p className="mt-2 text-sm text-gray-700">
                  {orderStatus.final_document_count} final file{orderStatus.final_document_count === 1 ? '' : 's'} ready.
                  {orderStatus.last_final_document_created_at
                    ? ` Last updated ${formatDateLabel(orderStatus.last_final_document_created_at)}.`
                    : ''}
                </p>
              ) : null}
              <p className="mt-3 text-sm text-gray-700">
                {effectiveState.preview?.defensibilitySummarySentence}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => void refreshOrderStatus()}>
                  Refresh status
                </Button>
                {orderStatus?.paid ? (
                  <Button onClick={() => router.push(`/dashboard/cases/${caseId}`)}>
                    Open downloads
                  </Button>
                ) : null}
              </div>
            </div>

            {evidenceMessage ? (
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
                {evidenceMessage}
              </div>
            ) : null}

            {activePlan === 'section13_defensive' ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <h3 className="text-base font-semibold text-gray-950">Supporting evidence</h3>
                  <p className="mt-2 text-sm text-gray-700">
                    Upload PDFs, JPGs, or PNGs for the tribunal-ready bundle. Limits: 15 files, 10 MB each, 50 MB total.
                  </p>

                  {hasPaidDefensiveOrder ? (
                    <>
                      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300 px-4 py-6 text-center text-sm text-violet-800">
                        <RiUploadCloud2Line className="h-5 w-5" />
                        <span>Select evidence files</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                          multiple
                          className="hidden"
                          onChange={(event) =>
                            setEvidenceFiles(Array.from(event.target.files || []))
                          }
                        />
                      </label>

                      {evidenceFiles.length > 0 ? (
                        <ul className="mt-4 space-y-2 text-sm text-gray-700">
                          {evidenceFiles.map((file) => (
                            <li key={`${file.name}-${file.size}`}>• {file.name}</li>
                          ))}
                        </ul>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button onClick={() => void handleEvidenceUpload()} disabled={evidenceUploading || evidenceFiles.length === 0}>
                          {evidenceUploading ? (
                            <>
                              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                              Uploading evidence
                            </>
                          ) : (
                            <>Upload evidence</>
                          )}
                        </Button>
                        <Button variant="secondary" onClick={() => void refreshEvidenceUploads()}>
                          Refresh uploads
                        </Button>
                      </div>

                      <div className="mt-5 space-y-3">
                        <p className="text-sm font-semibold text-gray-900">Uploaded evidence</p>
                        {evidenceUploads.length ? (
                          <ul className="space-y-2 text-sm text-gray-700">
                            {evidenceUploads.map((upload) => (
                              <li key={upload.id || `${upload.fileName}-${upload.orderIndex}`}>
                                {upload.exhibitLabel || 'Exhibit'}: {upload.fileName} ({formatStatusLabel(upload.uploadStatus)})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-600">No evidence files uploaded yet.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-gray-600">
                      Evidence uploads unlock after a paid Defensive Pack order.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <h3 className="text-base font-semibold text-gray-950">Tribunal bundle</h3>
                  <p className="mt-2 text-sm text-gray-700">
                    Status: {formatStatusLabel(bundleWorkflowStatus || orderStatus?.fulfillment_status || 'pending')}
                  </p>
                  {bundleJob ? (
                    <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                      <p>
                        Latest job: {formatStatusLabel(bundleJob.status)}
                        {bundleJob.attemptCount ? ` (attempt ${bundleJob.attemptCount}${bundleJob.maxAttempts ? ` of ${bundleJob.maxAttempts}` : ''})` : ''}
                      </p>
                      {bundleJob.failureType ? (
                        <p className="mt-1">
                          Failure type: {formatStatusLabel(bundleJob.failureType)}
                          {bundleJob.retryAfter ? ` • Retry after ${formatDateLabel(bundleJob.retryAfter)}` : ''}
                        </p>
                      ) : null}
                      {bundleJob.errorMessage ? (
                        <p className="mt-1 text-rose-700">{bundleJob.errorMessage}</p>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="mt-2 text-sm text-gray-700">
                    Core outputs become available first. Regenerate the merged bundle after adding evidence so the hearing pack stays in sync.
                  </p>

                  {hasPaidDefensiveOrder ? (
                    <>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button onClick={() => void handleBundleRegenerate()} disabled={bundleRegenerating}>
                          {bundleRegenerating ? (
                            <>
                              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                              Regenerating bundle
                            </>
                          ) : (
                            <>Regenerate tribunal bundle</>
                          )}
                        </Button>
                        <Button variant="secondary" onClick={() => void refreshBundleStatus()}>
                          Refresh bundle status
                        </Button>
                      </div>

                      <div className="mt-5 space-y-3">
                        <p className="text-sm font-semibold text-gray-900">Bundle manifest</p>
                        {bundleAssets.length ? (
                          <ul className="space-y-2 text-sm text-gray-700">
                            {bundleAssets.map((asset) => (
                              <li key={asset.id || `${asset.title}-${asset.orderIndex}`}>
                                {(asset.exhibitLabel || asset.logicalSection).replace(/_/g, ' ')}: {asset.title} ({formatStatusLabel(asset.status)})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-600">No tribunal bundle manifest is available yet.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-gray-600">
                      Tribunal-ready bundle tools unlock after a paid Defensive Pack order.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {hasPaidDefensiveOrder ? (
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-950">Section 13 support</h3>
                    <p className="mt-2 text-sm text-gray-700">
                      Use this space for output explanation, evidence-prep questions, bundle steps, and negotiation wording. Rent-setting, outcome prediction, and validator overrides are escalated instead of answered automatically.
                    </p>
                  </div>
                  {supportRequest ? (
                    <div className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900">
                      <div className="font-medium">
                        {supportRequest.status === 'received'
                          ? 'Support request received'
                          : supportRequest.status === 'in_review'
                            ? 'In review'
                            : 'Responded'}
                      </div>
                      <div className="text-xs text-violet-900/80">
                        Priority: {formatStatusLabel(supportRequest.priority)}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 space-y-3">
                  {supportMessages.length ? (
                    <div className="max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-gray-50 p-4">
                      {supportMessages.map((item, index) => (
                        <div
                          key={item.id || `${item.role}-${index}`}
                          className={`rounded-xl px-3 py-2 text-sm ${
                            item.role === 'assistant'
                              ? 'bg-white text-gray-800'
                              : 'bg-violet-100 text-violet-950'
                          }`}
                        >
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {item.role === 'assistant' ? 'Section 13 support' : 'You'}
                          </div>
                          <p className="whitespace-pre-wrap">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No Section 13 support messages yet.
                    </p>
                  )}

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-800">Send a support message</span>
                    <textarea
                      value={supportInput}
                      onChange={(event) => setSupportInput(event.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      placeholder="Ask about your generated outputs, bundle steps, or evidence preparation."
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => void handleSupportSend()} disabled={supportSending || !supportInput.trim()}>
                      {supportSending ? (
                        <>
                          <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                          Sending
                        </>
                      ) : (
                        <>Send message</>
                      )}
                    </Button>
                    <Button variant="secondary" onClick={() => void refreshSupportState()}>
                      Refresh support status
                    </Button>
                  </div>

                  {supportMessage ? (
                    <p className="text-sm text-violet-900">{supportMessage}</p>
                  ) : null}
                </div>
              </div>
            ) : orderStatus?.paid ? (
              <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-700">
                Tribunal-ready bundle tools are included in the Defensive Pack only. Your Standard purchase still includes Form 4A, the justification report, proof of service, and delivery through the dashboard.
              </div>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  }

  const sidebar = (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-950">Section 13 summary</h3>
        <dl className="mt-3 space-y-2 text-sm text-gray-700">
          <div className="flex items-start justify-between gap-3">
            <dt>Current rent</dt>
            <dd>{formatMoney(effectiveState.tenancy.currentRentAmount)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt>Proposed rent</dt>
            <dd>{formatMoney(effectiveState.proposal.proposedRentAmount)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt>Used comparables</dt>
            <dd>{marketCalculation?.usedComparableCount ?? comparables.length}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt>Plan</dt>
            <dd>{effectiveState.selectedPlan === 'section13_defensive' ? 'Defensive' : 'Standard'}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt>Recommended</dt>
            <dd>{recommendedPlanTitle}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <h3 className="text-sm font-semibold text-violet-950">Supportable range signals</h3>
        <p className="mt-2 text-sm font-medium text-violet-900">{effectiveState.preview?.challengeBandLabel}</p>
        <p className="text-sm text-violet-900/90">{effectiveState.preview?.challengeBandExplainer}</p>
        {effectiveState.preview?.challengeReasonSummary ? (
          <p className="mt-2 text-sm text-violet-900/90">{effectiveState.preview.challengeReasonSummary}</p>
        ) : null}
        <p className="mt-3 text-sm font-medium text-violet-900">{effectiveState.preview?.evidenceBandLabel}</p>
        <p className="text-sm text-violet-900/90">{effectiveState.preview?.evidenceBandExplainer}</p>
        {marketCalculation?.medianExplanation ? (
          <p className="mt-3 text-sm text-violet-900/90">{marketCalculation.medianExplanation}</p>
        ) : null}
        {effectiveState.preview?.saferRangeGuidance ? (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {effectiveState.preview.saferRangeGuidance}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        This tool provides assistance only. It does not constitute legal advice. Rent increases must be lawful and reasonable, and you remain responsible for compliance.
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-700">
          <RiLoader4Line className="h-5 w-5 animate-spin" />
          Loading Section 13 wizard…
        </div>
      </div>
    );
  }

  return (
    <WizardShellV3
      title={product === 'section13_defensive' ? 'Tribunal-Ready Rent Increase Pack' : 'Supported Rent Increase Pack'}
      completedCount={completedCount}
      totalCount={STEP_CONFIG.length}
      progress={(completedCount / STEP_CONFIG.length) * 100}
      tabs={tabs}
      sectionTitle={currentStep.title}
      sectionDescription={currentStep.description}
      product={product}
      jurisdiction={jurisdiction}
      currentStepId={currentStep.id}
      saveState={saveState}
      statusChips={['Save answers as you go']}
      showStepCarryForwardHint={false}
      banner={
        saveError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {saveError}
          </div>
        ) : mustCompleteCurrentStep && !currentStepState.complete && continueDisabledReason ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {continueDisabledReason}
          </div>
        ) : saving ? (
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            Saving your draft…
          </div>
        ) : null
      }
      guidancePanel={sidebar}
      navigation={
        <>
          <button
            type="button"
            onClick={() => setCurrentStepIndex((index) => Math.max(0, index - 1))}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
              currentStepIndex === 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-violet-900 border-violet-200 hover:bg-violet-50'
            }`}
          >
            Back
          </button>

          <div className="flex min-w-0 items-center justify-end gap-2 sm:min-w-[220px]">
            <button
              type="button"
              onClick={() => {
                if (mustCompleteCurrentStep && !currentStepState.complete) return;
                if (currentStep.id === 'preview_checkout' && !orderStatus?.paid) {
                  void continueToSharedCheckoutPreview();
                  return;
                }
                trackCurrentStepComplete();
                setCurrentStepIndex((index) => Math.min(STEP_CONFIG.length - 1, index + 1));
              }}
              disabled={continueDisabled}
              title={continueDisabled && continueDisabledReason ? continueDisabledReason : undefined}
              className={`px-7 py-2.5 text-sm font-semibold rounded-xl transition-all min-w-[160px] ${
                continueDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_6px_16px_rgba(109,40,217,0.28)] hover:from-violet-700 hover:to-fuchsia-700'
              }`}
            >
              {currentStep.id === 'preview_checkout' && !orderStatus?.paid ? 'Continue to document preview' : 'Continue'}
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        {renderStepContent()}
        {checkoutError ? <p className="text-sm text-rose-700">{checkoutError}</p> : null}
      </div>
    </WizardShellV3>
  );
}

export default Section13WizardFlow;
