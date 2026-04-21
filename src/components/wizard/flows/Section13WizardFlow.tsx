'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RiAddLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiLoader4Line,
  RiRefreshLine,
  RiUploadCloud2Line,
} from 'react-icons/ri';

import { Button } from '@/components/ui/Button';
import { WizardFlowShell } from '@/components/wizard/shared/WizardFlowShell';
import { getCaseFacts } from '@/lib/wizard/facts-client';
import { getSessionTokenHeaders } from '@/lib/session-token';
import {
  createEmptySection13State,
  getSection13StateFromFacts,
  normalizeSection13State,
} from '@/lib/section13/facts';
import {
  computeSection13Preview,
  getMonthlyEquivalent,
  getWeeklyEquivalent,
} from '@/lib/section13/rules';
import type {
  Section13BundleAsset,
  Section13Comparable,
  Section13ComparableAdjustment,
  Section13EvidenceUpload,
  Section13ProductSku,
  Section13State,
} from '@/lib/section13/types';
import { isSection13ProposalStepComplete } from '@/lib/wizard/flow-completion';

type SectionId =
  | 'tenancy'
  | 'landlord'
  | 'proposal'
  | 'charges'
  | 'comparables'
  | 'adjustments'
  | 'preview'
  | 'outputs';

const STORAGE_PREFIX = 'section13-wizard-draft';

const STEP_CONFIG: Array<{
  id: SectionId;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: 'tenancy',
    label: 'Tenancy',
    title: 'Tenancy and property details',
    description: 'Capture the tenancy start date, current rent, property address, and any previous increase anchors.',
  },
  {
    id: 'landlord',
    label: 'Landlord',
    title: 'Landlord and agent details',
    description: 'Record the landlord contact details and any agent handling service of the notice.',
  },
  {
    id: 'proposal',
    label: 'Proposal',
    title: 'Proposed rent and start date',
    description: 'Set the new rent, date served, and proposed effective date with the post-1 May 2026 rules applied.',
  },
  {
    id: 'charges',
    label: 'Charges',
    title: 'Charges included in rent',
    description: 'List only the charges that are included within the rent rather than paid separately by the tenant.',
  },
  {
    id: 'comparables',
    label: 'Comparables',
    title: 'Comparable listings',
    description: 'Scrape or import comparable rental listings, then keep only the ones you want to rely on.',
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    title: 'Adjustments and justification',
    description: 'Apply auditable comparable adjustments and add any case-specific narrative you want to keep in the report.',
  },
  {
    id: 'preview',
    label: 'Preview',
    title: 'Preview and choose your plan',
    description: 'See the market-rent position, validation status, and which outputs unlock in each plan before checkout.',
  },
  {
    id: 'outputs',
    label: 'Outputs',
    title: 'Generate and manage outputs',
    description: 'Once paid, this step becomes the home for downloads, tribunal-bundle generation, and delivery status.',
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

function getStepCompleteState(
  stepId: SectionId,
  state: Section13State,
  comparables: Section13Comparable[]
): { complete: boolean; hasIssue: boolean } {
  switch (stepId) {
    case 'tenancy':
      return {
        complete:
          state.tenancy.tenantNames.some((name) => name.trim()) &&
          Boolean(state.tenancy.propertyAddressLine1) &&
          Boolean(state.tenancy.propertyTownCity) &&
          Boolean(state.tenancy.postcodeRaw) &&
          Boolean(state.tenancy.tenancyStartDate) &&
          state.tenancy.currentRentAmount != null,
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
    case 'preview':
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
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySending, setRecoverySending] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
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

  const purchasedPlan =
    orderStatus?.paid &&
    (orderStatus.product_type === 'section13_standard' ||
      orderStatus.product_type === 'section13_defensive')
      ? (orderStatus.product_type as Section13ProductSku)
      : null;
  const activePlan = purchasedPlan || effectiveState.selectedPlan;
  const hasPaidDefensiveOrder = purchasedPlan === 'section13_defensive';

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
    } catch (error: any) {
      setSaveError(error?.message || 'Draft save failed');
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
    if (recoveryEmail.trim()) return;
    if (effectiveState.landlord.landlordEmail?.trim()) {
      setRecoveryEmail(effectiveState.landlord.landlordEmail.trim());
    }
  }, [effectiveState.landlord.landlordEmail, recoveryEmail]);

  async function continueToSharedCheckoutPreview() {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      await persistDraft({ awaitingPayment: true });
      const params = new URLSearchParams({
        product: effectiveState.selectedPlan,
        jurisdiction: jurisdiction,
      });
      router.push(`/wizard/preview/${caseId}?${params.toString()}`);
    } catch (error: any) {
      setCheckoutError(error?.message || 'Checkout preview could not be opened');
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

  async function handleSendRecoveryLink() {
    const email = recoveryEmail.trim();
    if (!email) {
      setRecoveryMessage('Enter an email address before requesting a recovery link.');
      return;
    }

    setRecoverySending(true);
    setRecoveryMessage(null);

    try {
      await persistDraft({ awaitingPayment: true });

      const response = await fetch('/api/section13/send-recovery-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSessionTokenHeaders(),
        },
        body: JSON.stringify({
          caseId,
          email,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Recovery link could not be sent');
      }

      setRecoveryMessage(
        data.emailSent
          ? 'Recovery link sent. The link is valid for 7 days.'
          : data.warning || 'We saved your draft, but the recovery email could not be sent.'
      );
    } catch (error: any) {
      setRecoveryMessage(error?.message || 'Recovery link could not be sent');
    } finally {
      setRecoverySending(false);
    }
  }

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
        metadata: {},
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
    if (!postcode || !bedrooms) {
      setSaveError('Enter a postcode and bedroom count before scraping comparables.');
      return;
    }

    setScrapeLoading(true);
    setSaveError(null);
    setScrapeMessage('Searching Rightmove...');

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
        'Retrying with backup method is unavailable right now. Upload a CSV or add a listing link manually to keep moving.'
      );
    } finally {
      setScrapeLoading(false);
    }
  }

  async function handleCsvImport(file: File | null) {
    if (!file) return;
    setCsvImportLoading(true);
    setSaveError(null);
    setScrapeMessage('Retrying with backup method...');

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
    options?: { type?: string; placeholder?: string; step?: string }
  ) {
    return (
      <label className="block space-y-1">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <input
          type={options?.type || 'text'}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={options?.placeholder}
          step={options?.step}
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      </label>
    );
  }

  function renderStepContent() {
    switch (currentStep.id) {
      case 'tenancy':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
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
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-violet-300 px-3 py-2 text-sm font-medium text-violet-700"
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

            <div className="grid gap-4 md:grid-cols-2">
              {renderTextInput('Property address line 1', effectiveState.tenancy.propertyAddressLine1, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, propertyAddressLine1: value },
                }))
              )}
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
              )}
              {renderTextInput('Postcode', effectiveState.tenancy.postcodeRaw, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, postcodeRaw: value },
                  comparablesMeta: { ...prev.comparablesMeta, searchPostcodeRaw: value },
                }))
              )}
              {renderTextInput('Bedrooms', effectiveState.tenancy.bedrooms, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, bedrooms: value ? Number(value) : null },
                  comparablesMeta: { ...prev.comparablesMeta, bedrooms: value ? Number(value) : null },
                }))
              , { type: 'number' })}
              {renderTextInput('Tenancy start date', effectiveState.tenancy.tenancyStartDate, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, tenancyStartDate: value },
                }))
              , { type: 'date' })}
              {renderTextInput('Current rent amount', effectiveState.tenancy.currentRentAmount, (value) =>
                updateState((prev) => ({
                  ...prev,
                  tenancy: { ...prev.tenancy, currentRentAmount: value ? Number(value) : null },
                }))
              , { type: 'number', step: '0.01' })}
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
            <div className="grid gap-4 md:grid-cols-2">
              {renderTextInput('Proposed rent amount', effectiveState.proposal.proposedRentAmount, (value) =>
                updateState((prev) => ({
                  ...prev,
                  proposal: { ...prev.proposal, proposedRentAmount: value ? Number(value) : null },
                }))
              , { type: 'number', step: '0.01' })}
              {renderTextInput('Notice served date', effectiveState.proposal.serviceDate, (value) =>
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
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-800">Service method</span>
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
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
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

      case 'comparables':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_140px_auto]">
                {renderTextInput('Search postcode', effectiveState.comparablesMeta.searchPostcodeRaw || effectiveState.tenancy.postcodeRaw, (value) =>
                  updateState((prev) => ({
                    ...prev,
                    comparablesMeta: { ...prev.comparablesMeta, searchPostcodeRaw: value },
                  }))
                )}
                {renderTextInput('Bedrooms', effectiveState.comparablesMeta.bedrooms ?? effectiveState.tenancy.bedrooms, (value) =>
                  updateState((prev) => ({
                    ...prev,
                    comparablesMeta: { ...prev.comparablesMeta, bedrooms: value ? Number(value) : null },
                  }))
                , { type: 'number' })}
                <div className="flex items-end">
                  <Button onClick={() => void handleScrape()} disabled={scrapeLoading}>
                    {scrapeLoading ? (
                      <>
                        <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                        Scraping
                      </>
                    ) : (
                      <>
                        <RiRefreshLine className="mr-2 h-4 w-4" />
                        Scrape Rightmove
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
            </div>

            <div className="space-y-4">
              {comparables.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
                  No comparables yet. Scrape Rightmove, upload CSV, or add linked manual listings.
                </div>
              ) : null}

              {effectiveState.preview?.warnings.some((warning) => warning.includes('source-backed comparables')) ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  No valid source-backed comparables are available yet. Retry the scrape, upload CSV results, or add a listing link manually to unlock the auto-written justification.
                </div>
              ) : null}

              {comparables.map((comparable, index) => (
                <div key={`${comparable.id || 'comparable'}-${index}`} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">Comparable {index + 1}</h3>
                    <button
                      type="button"
                      className="text-sm text-rose-700"
                      onClick={() => removeComparable(index)}
                    >
                      <RiDeleteBinLine className="inline h-4 w-4" /> Remove
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {renderTextInput('Address snippet', comparable.addressSnippet, (value) =>
                      updateComparable(index, { addressSnippet: value })
                    )}
                    {renderTextInput('Property type', comparable.propertyType, (value) =>
                      updateComparable(index, { propertyType: value })
                    )}
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
                    {renderTextInput('Distance (miles)', comparable.distanceMiles, (value) =>
                      updateComparable(index, { distanceMiles: value ? Number(value) : null })
                    , { type: 'number', step: '0.01' })}
                  </div>

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
          </div>
        );

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

      case 'preview':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">Proposed rent position</p>
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
              </div>

              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <p className="text-sm font-semibold text-violet-950">Validation and evidence</p>
                <p className="mt-3 text-sm font-semibold text-violet-900">{effectiveState.preview?.challengeBandLabel}</p>
                <p className="text-sm text-violet-900/90">{effectiveState.preview?.challengeBandExplainer}</p>
                <p className="mt-3 text-sm font-semibold text-violet-900">{effectiveState.preview?.evidenceBandLabel}</p>
                <p className="text-sm text-violet-900/90">{effectiveState.preview?.evidenceBandExplainer}</p>
                <p className="mt-3 text-sm text-violet-900">{effectiveState.preview?.previewSummary}</p>
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
                      <h3 className="text-lg font-semibold text-gray-950">
                        {plan === 'section13_defensive' ? 'Defensive Pack' : 'Standard'}
                      </h3>
                      <p className="mt-1 text-2xl font-bold text-violet-900">
                        {plan === 'section13_defensive' ? '£34.99' : '£19.99'}
                      </p>
                    </div>
                  </div>
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
                Payment unlocks the completed Form 4A, your full report, and, for Defensive Pack purchases, the tribunal-ready bundle tools.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => void continueToSharedCheckoutPreview()} disabled={checkoutLoading}>
                  {checkoutLoading ? (
                    <>
                      <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                      Opening checkout preview
                    </>
                  ) : (
                    <>Continue to preview and checkout</>
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

            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-950">Email a recovery link</p>
              <p className="mt-2 text-sm text-gray-700">
                Save this draft outside the current browser. We will email a one-time recovery link valid for 7 days.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                {renderTextInput('Email address', recoveryEmail, setRecoveryEmail, {
                  type: 'email',
                  placeholder: 'name@example.com',
                })}
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => void handleSendRecoveryLink()}
                    disabled={recoverySending || !recoveryEmail.trim()}
                  >
                    {recoverySending ? (
                      <>
                        <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                        Sending link
                      </>
                    ) : (
                      <>Email recovery link</>
                    )}
                  </Button>
                </div>
              </div>
              {recoveryMessage ? (
                <p className="mt-3 text-sm text-violet-900">{recoveryMessage}</p>
              ) : null}
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
                  : 'Complete checkout from the preview step to unlock downloads.'}
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
            <dt>Comparables</dt>
            <dd>{comparables.length}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt>Plan</dt>
            <dd>{effectiveState.selectedPlan === 'section13_defensive' ? 'Defensive' : 'Standard'}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <h3 className="text-sm font-semibold text-violet-950">Bands</h3>
        <p className="mt-2 text-sm font-medium text-violet-900">{effectiveState.preview?.challengeBandLabel}</p>
        <p className="text-sm text-violet-900/90">{effectiveState.preview?.challengeBandExplainer}</p>
        <p className="mt-3 text-sm font-medium text-violet-900">{effectiveState.preview?.evidenceBandLabel}</p>
        <p className="text-sm text-violet-900/90">{effectiveState.preview?.evidenceBandExplainer}</p>
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
    <WizardFlowShell
      title="Section 13 Wizard"
      completedCount={completedCount}
      totalCount={STEP_CONFIG.length}
      progress={(completedCount / STEP_CONFIG.length) * 100}
      stickyTopClass="top-[96px] md:top-[100px]"
      tabs={tabs}
      sectionTitle={currentStep.title}
      sectionDescription={currentStep.description}
      banner={
        saveError ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {saveError}
          </div>
        ) : saving ? (
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            Saving your draft…
          </div>
        ) : null
      }
      sidebar={sidebar}
      navigation={
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => setCurrentStepIndex((index) => Math.max(0, index - 1))}
            disabled={currentStepIndex === 0}
          >
            <RiArrowLeftLine className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{jurisdiction === 'england' ? 'England' : jurisdiction}</span>
            <Button
              onClick={() => {
                if (currentStep.id === 'preview' && !orderStatus?.paid) {
                  void continueToSharedCheckoutPreview();
                  return;
                }
                setCurrentStepIndex((index) => Math.min(STEP_CONFIG.length - 1, index + 1));
              }}
              disabled={currentStepIndex === STEP_CONFIG.length - 1}
            >
              {currentStep.id === 'preview' && !orderStatus?.paid ? 'Go to checkout preview' : 'Continue'}
              <RiArrowRightLine className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {renderStepContent()}
        {checkoutError ? <p className="text-sm text-rose-700">{checkoutError}</p> : null}
      </div>
    </WizardFlowShell>
  );
}

export default Section13WizardFlow;
