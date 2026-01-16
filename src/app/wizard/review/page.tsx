'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CaseStrengthWidget } from '../components/CaseStrengthWidget';
import {
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiFileTextLine,
  RiCloseLine,
  RiShieldCheckLine,
  RiInformationLine,
  RiMoneyPoundCircleLine,
  RiCalendarCheckLine,
  RiFileList3Line,
} from 'react-icons/ri';
import { SmartReviewPanel } from '@/components/wizard/SmartReviewPanel';
import { trackWizardReviewViewWithAttribution, markWizardCompleted } from '@/lib/analytics';
import { getWizardAttribution } from '@/lib/wizard/wizardAttribution';

// Scotland utilities
import {
  getScotlandGrounds,
  getScotlandGroundByNumber,
  getScotlandConfig,
  validateSixMonthRule,
} from '@/lib/scotland/grounds';

// Section 8 ground utilities
import {
  calculateCombinedNoticePeriod,
  compareNoticePeriods,
  normalizeGroundCode,
  getGroundDescription,
  hasArrearsGround,
} from '@/lib/grounds/notice-period-utils';
import {
  getGroundAwareSuggestions,
  isArrearsEvidenceComplete,
} from '@/lib/grounds/evidence-suggestions';
import { saveCaseFacts } from '@/lib/wizard/facts-client';

function ReviewPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const caseId = searchParams.get('case_id');
  const productParam = searchParams.get('product');

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAcknowledgedBlockers, setHasAcknowledgedBlockers] = useState(false);

  // Payment status state for paid-case regeneration flow
  const [isPaid, setIsPaid] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editWindowOpen, setEditWindowOpen] = useState(false);
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(true); // Start true to prevent UI flash

  // Compute derived values BEFORE any conditional returns (null-safe)
  // This ensures hooks are called in the same order on every render
  const jurisdiction = analysis?.jurisdiction;
  const caseType = analysis?.case_type ?? 'eviction';
  const product: string = productParam || analysis?.product || 'complete_pack';

  // Detect flow type based on product
  const isMoneyClaimFlow = product === 'money_claim' || product === 'sc_money_claim' || caseType === 'money_claim';
  const isNoticeOnlyFlow = product === 'notice_only';
  const isTenancyFlow = product === 'tenancy_agreement' || product === 'ast_standard' || product === 'ast_premium' || caseType === 'tenancy_agreement';

  // Compute hasBlockingIssues safely (false when analysis is null)
  const hasBlockingIssues = analysis
    ? isMoneyClaimFlow
      ? (analysis.case_health?.blockers?.length ?? 0) > 0
      : analysis.decision_engine?.blocking_issues?.some(
          (issue: any) => issue.severity === 'blocking'
        )
    : false;

  // All useEffect hooks must be called unconditionally BEFORE any returns
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!caseId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/wizard/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ case_id: caseId }),
        });

        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [caseId]);

  // Reset acknowledgement when case or blocking issues change
  useEffect(() => {
    setHasAcknowledgedBlockers(false);
  }, [caseId, hasBlockingIssues]);

  // Track review page view when analysis loads
  const hasTrackedReview = useRef(false);
  useEffect(() => {
    if (analysis && !hasTrackedReview.current) {
      hasTrackedReview.current = true;
      const attribution = getWizardAttribution();
      trackWizardReviewViewWithAttribution({
        product: product,
        jurisdiction: jurisdiction || 'unknown',
        hasBlockers: hasBlockingIssues,
        hasWarnings: analysis.decision_engine?.blocking_issues?.some(
          (issue: any) => issue.severity === 'warning'
        ) ?? false,
        src: attribution.src,
        topic: attribution.topic,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        landing_url: attribution.landing_url,
        first_seen_at: attribution.first_seen_at,
      });
    }
  }, [analysis, product, jurisdiction, hasBlockingIssues]);

  // Fetch payment status to determine if this is a regeneration flow
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!caseId || !product) {
        setIsLoadingPaymentStatus(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/status?case_id=${caseId}&product=${product}`);
        if (response.ok) {
          const data = await response.json();
          setIsPaid(data.paid === true);
          setEditWindowOpen(data.edit_window_open === true);
        }
      } catch (error) {
        console.error('Failed to fetch payment status:', error);
      } finally {
        setIsLoadingPaymentStatus(false);
      }
    };

    fetchPaymentStatus();
  }, [caseId, product]);

  // Conditional returns AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis || !caseId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">Failed to load analysis</p>
        </Card>
      </div>
    );
  }

  // Common fields from /api/wizard/analyze
  const caseStrengthBand: string = analysis.case_strength_band || 'unknown';
  const isCourtReady: boolean | null =
    typeof analysis.is_court_ready === 'boolean' ? analysis.is_court_ready : null;
  const readinessSummary: string | null = analysis.readiness_summary ?? null;
  const redFlags: string[] = analysis.red_flags || [];
  const complianceIssues: string[] = analysis.compliance_issues || [];
  const evidence = analysis.evidence_overview || {};

  const handleEdit = () => {
    const params = new URLSearchParams({
      case_id: caseId,
      type: caseType,
      jurisdiction: jurisdiction,
      product,
    });

    router.push(`/wizard/flow?${params.toString()}`);
  };

  const handleFixIssues = () => {
    document.getElementById('critical-issues')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProceed = async () => {
    if (hasBlockingIssues && !hasAcknowledgedBlockers) {
      return;
    }

    // For eviction cases, ensure we have a recommended route before preview
    if (!isMoneyClaimFlow) {
      const recommendedRoute = analysis.recommended_route;
      if (!recommendedRoute) {
        alert(
          'Cannot generate preview: The system needs more information to recommend the right notice type. ' +
            'Please complete all required questions and try again.'
        );
        return;
      }
    }

    // PAID CASE: Trigger document regeneration instead of going to checkout
    if (isPaid && editWindowOpen) {
      setIsRegenerating(true);
      try {
        const response = await fetch('/api/orders/regenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: caseId,
            product: product,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to regenerate documents');
        }

        // Success - redirect to dashboard with regeneration success flag
        router.push(`/dashboard/cases/${caseId}?regenerated=true`);
      } catch (error) {
        console.error('Regeneration failed:', error);
        alert(
          'Failed to regenerate documents. Please try again or contact support if the issue persists.'
        );
        setIsRegenerating(false);
      }
      return;
    }

    // UNPAID CASE: Go to preview/checkout
    // Include product param to ensure preview page correctly identifies product type
    // This is critical for notice_only to use the correct preview API
    const previewParams = new URLSearchParams();
    if (product) {
      previewParams.set('product', product);
    }
    if (jurisdiction) {
      previewParams.set('jurisdiction', jurisdiction);
    }
    const queryString = previewParams.toString();
    router.push(`/wizard/preview/${caseId}${queryString ? `?${queryString}` : ''}`);
  };

  const readinessBadge = (() => {
    if (isCourtReady === true) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <RiShieldCheckLine className="h-3 w-3 text-[#7C3AED]" />
          {isMoneyClaimFlow ? 'Ready to issue' : 'Court-ready'}
        </span>
      );
    }
    if (isCourtReady === false) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <RiErrorWarningLine className="h-3 w-3 text-[#7C3AED]" />
          {isMoneyClaimFlow ? 'Needs attention' : 'Not court-ready yet'}
        </span>
      );
    }
    return null;
  })();

  // Render Money Claim specific content
  if (isMoneyClaimFlow) {
    return <MoneyClaimReviewContent
      caseId={caseId}
      analysis={analysis}
      jurisdiction={jurisdiction}
      readinessBadge={readinessBadge}
      caseStrengthBand={caseStrengthBand}
      readinessSummary={readinessSummary}
      redFlags={redFlags}
      complianceIssues={complianceIssues}
      evidence={evidence}
      hasBlockingIssues={hasBlockingIssues}
      hasAcknowledgedBlockers={hasAcknowledgedBlockers}
      onAcknowledgeBlockers={setHasAcknowledgedBlockers}
      onFixIssues={handleFixIssues}
      onEdit={handleEdit}
      onProceed={handleProceed}
      isPaid={isPaid}
      isRegenerating={isRegenerating}
      isLoadingPaymentStatus={isLoadingPaymentStatus}
    />;
  }

  // Render Notice Only specific content
  if (isNoticeOnlyFlow) {
    return <NoticeOnlyReviewContent
      caseId={caseId}
      analysis={analysis}
      jurisdiction={jurisdiction}
      readinessBadge={readinessBadge}
      redFlags={redFlags}
      complianceIssues={complianceIssues}
      hasBlockingIssues={hasBlockingIssues}
      hasAcknowledgedBlockers={hasAcknowledgedBlockers}
      onAcknowledgeBlockers={setHasAcknowledgedBlockers}
      onFixIssues={handleFixIssues}
      onEdit={handleEdit}
      onProceed={handleProceed}
      isPaid={isPaid}
      isRegenerating={isRegenerating}
      isLoadingPaymentStatus={isLoadingPaymentStatus}
    />;
  }

  // Render Tenancy Agreement specific content
  if (isTenancyFlow) {
    return <TenancyReviewContent
      caseId={caseId}
      analysis={analysis}
      jurisdiction={jurisdiction}
      product={product}
      onEdit={handleEdit}
      onProceed={handleProceed}
      isPaid={isPaid}
      isRegenerating={isRegenerating}
      isLoadingPaymentStatus={isLoadingPaymentStatus}
    />;
  }

  // Render Eviction Complete Pack content
  return <EvictionReviewContent
    caseId={caseId}
    analysis={analysis}
    jurisdiction={jurisdiction}
    product={product}
    readinessBadge={readinessBadge}
    caseStrengthBand={caseStrengthBand}
    readinessSummary={readinessSummary}
    redFlags={redFlags}
    complianceIssues={complianceIssues}
    evidence={evidence}
    hasBlockingIssues={hasBlockingIssues}
    hasAcknowledgedBlockers={hasAcknowledgedBlockers}
    onAcknowledgeBlockers={setHasAcknowledgedBlockers}
    onFixIssues={handleFixIssues}
    onEdit={handleEdit}
    onProceed={handleProceed}
    isPaid={isPaid}
    isRegenerating={isRegenerating}
    isLoadingPaymentStatus={isLoadingPaymentStatus}
  />;
}

// ============================================================================
// MONEY CLAIM REVIEW CONTENT
// ============================================================================
interface MoneyClaimReviewContentProps {
  caseId: string;
  analysis: any;
  jurisdiction: string;
  readinessBadge: React.ReactNode;
  caseStrengthBand: string;
  readinessSummary: string | null;
  redFlags: string[];
  complianceIssues: string[];
  evidence: any;
  hasBlockingIssues: boolean;
  hasAcknowledgedBlockers: boolean;
  onAcknowledgeBlockers: (acknowledged: boolean) => void;
  onFixIssues: () => void;
  onEdit: () => void;
  onProceed: () => void;
  isPaid?: boolean;
  isRegenerating?: boolean;
  isLoadingPaymentStatus?: boolean;
}

function MoneyClaimReviewContent({
  caseId,
  analysis,
  jurisdiction,
  readinessBadge,
  caseStrengthBand,
  readinessSummary,
  redFlags,
  complianceIssues,
  evidence,
  hasBlockingIssues,
  hasAcknowledgedBlockers,
  onAcknowledgeBlockers,
  onFixIssues,
  onEdit,
  onProceed,
  isPaid,
  isRegenerating,
  isLoadingPaymentStatus,
}: MoneyClaimReviewContentProps) {
  const caseHealth = analysis.case_health;
  const caseSummary = analysis.case_summary;

  // Calculate claim totals from case_summary
  const totalArrears = caseSummary?.total_arrears ?? 0;
  const damages = caseSummary?.damages ?? 0;
  const otherCharges = caseSummary?.other_charges ?? 0;
  // Interest: only calculate if user explicitly opted in via charge_interest
  const claimInterest = caseSummary?.charge_interest === true;
  const interestRate = claimInterest ? (caseSummary?.interest_rate ?? 8) : 0;
  const totalPrincipal = totalArrears + damages + otherCharges;

  // Estimate interest (roughly 3 months worth for display) - only if opted in
  const estimatedInterest = claimInterest
    ? Number((totalPrincipal * (interestRate / 100) * 0.25).toFixed(2))
    : 0;
  const totalClaim = totalPrincipal + estimatedInterest;

  // Pre-action status
  const preActionStatus = caseSummary?.pre_action_status ?? 'missing';
  const preActionComplete = preActionStatus === 'complete';
  const preActionPartial = preActionStatus === 'partial';

  // Get blockers, risks, warnings from case_health
  const blockers = caseHealth?.blockers ?? [];
  const risks = caseHealth?.risks ?? [];
  const warnings = caseHealth?.warnings ?? [];
  const positives = caseHealth?.positives ?? [];

  // Money claim specific documents
  const moneyClaimDocs = jurisdiction === 'scotland'
    ? [
        { id: 'form_3a', title: 'Form 3A - Simple Procedure Claim', required: true },
        { id: 'particulars', title: 'Particulars of Claim', required: true },
        { id: 'schedule', title: 'Schedule of Arrears', required: true },
        { id: 'interest', title: 'Interest Calculation', required: false },
        { id: 'lba', title: 'Letter Before Claim', required: false },
        { id: 'filing_guide', title: 'Filing Guide', required: false },
      ]
    : [
        { id: 'form_n1', title: 'Form N1 - Money Claim Form', required: true },
        { id: 'particulars', title: 'Particulars of Claim', required: true },
        { id: 'schedule', title: 'Schedule of Arrears', required: true },
        { id: 'interest', title: 'Interest Calculation', required: false },
        { id: 'lba', title: 'Letter Before Claim (PAP-DEBT)', required: true },
        { id: 'info_sheet', title: 'Information Sheet for Defendants', required: true },
        { id: 'reply_form', title: 'Reply Form', required: false },
        { id: 'financial_statement', title: 'Financial Statement Form', required: false },
        { id: 'evidence_index', title: 'Evidence Index', required: false },
        { id: 'filing_guide', title: 'Court Filing Guide', required: false },
        { id: 'enforcement_guide', title: 'Enforcement Guide', required: false },
      ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Money Claim Analysis</h1>
          <p className="text-sm text-gray-600 mt-1">
            We've analysed your claim against the Pre-Action Protocol for Debt Claims for{' '}
            <span className="font-medium">
              {jurisdiction === 'scotland'
                ? 'Scotland (Simple Procedure)'
                : jurisdiction === 'wales'
                ? 'Wales'
                : 'England'}
            </span>
            .
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {readinessBadge}
          {analysis.case_strength_score != null && (
            <div className="text-right text-sm text-gray-600">
              <div className="font-semibold">Claim strength: {analysis.case_strength_score}/100</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">{caseStrengthBand}</div>
            </div>
          )}
        </div>
      </div>

      {/* Readiness Summary */}
      {readinessSummary && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <RiInformationLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-blue-900 mb-1">
                What this means for your claim
              </h2>
              <p className="text-sm text-blue-800">{readinessSummary}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Claim Summary - Money amounts */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RiMoneyPoundCircleLine className="h-5 w-5 text-[#7C3AED]" />
          Claim Summary
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Rent Arrears</p>
            <p className="text-2xl font-bold text-gray-900">
              £{totalArrears.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Damages</p>
            <p className="text-2xl font-bold text-gray-900">
              £{damages.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </p>
          </div>
          {claimInterest ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Interest ({interestRate}%)</p>
              <p className="text-2xl font-bold text-gray-900">
                £{estimatedInterest.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">Estimated to date</p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Interest</p>
              <p className="text-lg text-gray-400">Not claimed</p>
            </div>
          )}
          <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <p className="text-sm text-gray-500 mb-1">Total Claim</p>
            <p className="text-2xl font-bold text-primary">
              £{totalClaim.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">Excluding court fees</p>
          </div>
        </div>
      </Card>

      {/* Blockers - Critical Issues */}
      {blockers.length > 0 && (
        <Card id="critical-issues" className="p-6 border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <RiCloseLine className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Issues to Fix Before Proceeding
              </h2>
              <p className="text-sm text-red-800 mb-3">
                These issues should be resolved before issuing your claim to avoid delays or rejection.
              </p>
              {blockers.map((blocker: any, i: number) => (
                <div key={i} className="mb-2 p-3 bg-white rounded border border-red-200">
                  <p className="font-medium text-red-900">{blocker.title || 'Issue'}</p>
                  <p className="text-sm text-red-700 mt-1">{blocker.message}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Risks */}
      {risks.length > 0 && (
        <Card className="p-6 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <RiErrorWarningLine className="h-6 w-6 text-amber-600 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-amber-900 mb-2">Risks to Consider</h2>
              <ul className="space-y-2">
                {risks.map((risk: any, i: number) => (
                  <li key={i} className="text-sm text-amber-800">
                    • {risk.message || risk.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Pre-Action Protocol Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RiCalendarCheckLine className="h-5 w-5 text-[#7C3AED]" />
          Pre-Action Protocol Status
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {preActionComplete || preActionPartial ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-green-600" />
            ) : (
              <RiErrorWarningLine className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Letter Before Claim sent</p>
              <p className="text-xs text-gray-600">
                {preActionComplete
                  ? 'You have confirmed sending a pre-action demand letter.'
                  : preActionPartial
                  ? 'Partially complete - some details may be missing.'
                  : 'Not confirmed yet - courts expect PAP-DEBT compliance.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {preActionComplete ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-green-600" />
            ) : (
              <RiErrorWarningLine className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">14-day response period</p>
              <p className="text-xs text-gray-600">
                {preActionComplete
                  ? 'Response deadline has passed or been confirmed.'
                  : 'Ensure you have given 14+ days to respond before issuing.'}
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 border-t pt-3">
          The Pre-Action Protocol for Debt Claims requires sending specific documents before issuing.
          Your pack will include all required PAP-DEBT documents.
        </p>
      </Card>

      {/* AI Document Analysis (Smart Review) */}
      {analysis?.case_facts?.__smart_review?.warnings?.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">AI Document Analysis</h2>
          <SmartReviewPanel
            warnings={analysis.case_facts.__smart_review.warnings}
            summary={analysis.case_facts.__smart_review.summary}
            defaultCollapsed={false}
          />
        </Card>
      )}

      {/* Evidence Checklist */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RiFileList3Line className="h-5 w-5 text-[#7C3AED]" />
          Evidence Checklist
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Having these documents ready strengthens your claim and speeds up court processing.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            {evidence.tenancy_agreement_uploaded ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <RiErrorWarningLine className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Tenancy Agreement</p>
              <p className="text-xs text-gray-600">
                {evidence.tenancy_agreement_uploaded
                  ? 'Available - proves the contractual terms.'
                  : 'Not uploaded - essential for proving rent obligation.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {evidence.rent_schedule_uploaded ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <RiErrorWarningLine className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Rent Schedule</p>
              <p className="text-xs text-gray-600">
                {evidence.rent_schedule_uploaded
                  ? 'Available - shows payment history.'
                  : 'Not uploaded - courts expect a clear arrears breakdown.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {evidence.bank_statements_uploaded ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Bank Statements</p>
              <p className="text-xs text-gray-600">
                {evidence.bank_statements_uploaded
                  ? 'Available - supports payment records.'
                  : 'Optional - can help prove payments received/missed.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {evidence.correspondence_uploaded ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Correspondence</p>
              <p className="text-xs text-gray-600">
                {evidence.correspondence_uploaded
                  ? 'Available - shows communication history.'
                  : 'Optional - emails/texts showing requests for payment.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Positives */}
      {positives.length > 0 && (
        <Card className="p-6 border-green-200 bg-green-50">
          <h2 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
            <RiCheckboxCircleLine className="h-5 w-5" />
            What's Looking Good
          </h2>
          <ul className="space-y-1">
            {positives.map((positive: string, i: number) => (
              <li key={i} className="text-sm text-green-800">
                ✓ {positive}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Things to Fix or Improve */}
      {(redFlags.length > 0 || complianceIssues.length > 0) && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Things to Fix or Improve</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {redFlags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-amber-800 mb-2">Red flags</h3>
                <ul className="space-y-1 text-sm text-amber-900">
                  {redFlags.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {complianceIssues.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">Compliance issues</h3>
                <ul className="space-y-1 text-sm text-red-900">
                  {complianceIssues.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Documents to be generated */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RiFileTextLine className="h-5 w-5 text-[#7C3AED]" />
          Documents in Your Pack
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Your money claim pack includes all documents needed for the Pre-Action Protocol
          and court filing:
        </p>
        <ul className="grid md:grid-cols-2 gap-2">
          {moneyClaimDocs.map((doc) => (
            <li key={doc.id} className="flex items-center gap-2 text-sm">
              <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
              <span className="font-medium">{doc.title}</span>
              {doc.required && (
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                  Required
                </span>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="p-6 border-yellow-300 bg-yellow-50">
          <div className="flex items-start gap-3">
            <RiErrorWarningLine className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">Important Warnings</h2>
              <ul className="space-y-1">
                {warnings.map((warning: any, i: number) => (
                  <li key={i} className="text-sm text-yellow-800">
                    • {warning.message || warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {hasBlockingIssues && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Critical issues found</h2>
          <p className="text-sm text-red-800 mb-4">
            These issues may prevent your document from being valid or court-ready. Fix them first,
            or acknowledge and continue.
          </p>
          <label className="flex items-start gap-3 text-sm text-red-900">
            <input
              type="checkbox"
              checked={hasAcknowledgedBlockers}
              onChange={(event) => onAcknowledgeBlockers(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-red-300 text-primary focus:ring-primary"
              aria-label="Acknowledge critical issues"
            />
            <span>
              I understand these issues may prevent the document being court-ready, and I want to
              proceed.
            </span>
          </label>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button onClick={onEdit} variant="outline" className="flex-1">
          Go back &amp; edit answers
        </Button>
        {hasBlockingIssues && (
          <Button
            onClick={onFixIssues}
            variant="outline"
            className="flex-1"
            aria-label="Fix critical issues first"
          >
            Fix issues first
          </Button>
        )}
        <Button
          onClick={onProceed}
          className="flex-1"
          disabled={(hasBlockingIssues && !hasAcknowledgedBlockers) || isRegenerating || isLoadingPaymentStatus}
          aria-disabled={(hasBlockingIssues && !hasAcknowledgedBlockers) || isRegenerating || isLoadingPaymentStatus}
        >
          {isLoadingPaymentStatus ? 'Loading...' : isRegenerating ? 'Regenerating...' : isPaid ? 'Regenerate pack' : 'Proceed to payment & pack'}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500 mt-2">
        {isPaid
          ? 'Your updated answers will be used to regenerate your documents.'
          : 'We will generate your complete money claim pack regardless of readiness status. Your pack includes all PAP-DEBT documents and filing guides.'}
      </p>
    </div>
  );
}

// ============================================================================
// EVICTION REVIEW CONTENT (Original)
// ============================================================================
interface EvictionReviewContentProps {
  caseId: string;
  analysis: any;
  jurisdiction: string;
  product: string;
  readinessBadge: React.ReactNode;
  caseStrengthBand: string;
  readinessSummary: string | null;
  redFlags: string[];
  complianceIssues: string[];
  evidence: any;
  hasBlockingIssues: boolean;
  hasAcknowledgedBlockers: boolean;
  onAcknowledgeBlockers: (acknowledged: boolean) => void;
  onFixIssues: () => void;
  onEdit: () => void;
  onProceed: () => void;
  isPaid?: boolean;
  isRegenerating?: boolean;
  isLoadingPaymentStatus?: boolean;
}

function EvictionReviewContent({
  caseId,
  analysis,
  jurisdiction,
  product,
  readinessBadge,
  caseStrengthBand,
  readinessSummary,
  redFlags,
  complianceIssues,
  evidence,
  hasBlockingIssues,
  hasAcknowledgedBlockers,
  onAcknowledgeBlockers,
  onFixIssues,
  onEdit,
  onProceed,
  isPaid,
  isRegenerating,
  isLoadingPaymentStatus,
}: EvictionReviewContentProps) {
  const recommendedRouteLabel: string =
    analysis.recommended_route_label || analysis.recommended_route || 'Recommended route';

  type PreviewDocument = {
    id: string;
    title?: string;
    document_title?: string;
    type: string;
    jurisdiction: string;
    requiredToFile?: boolean;
  };

  const previewDocuments: PreviewDocument[] = Array.isArray(analysis.preview_documents)
    ? analysis.preview_documents
    : [];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Final Case Analysis</h1>
          <p className="text-sm text-gray-600 mt-1">
            We've analysed your answers against the current rules for{' '}
            <span className="font-medium">
              {jurisdiction === 'england'
                ? 'England'
                : jurisdiction === 'wales'
                ? 'Wales'
                : jurisdiction === 'scotland'
                ? 'Scotland'
                : 'Northern Ireland'}
            </span>
            .
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-semibold">Recommended route: </span>
            {recommendedRouteLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {readinessBadge}
          {analysis.case_strength_score != null && (
            <div className="text-right text-sm text-gray-600">
              <div className="font-semibold">Case strength: {analysis.case_strength_score}/100</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">{caseStrengthBand}</div>
            </div>
          )}
        </div>
      </div>

      {/* Readiness summary */}
      {readinessSummary && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <RiInformationLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-blue-900 mb-1">
                What this means in practice
              </h2>
              <p className="text-sm text-blue-800">{readinessSummary}</p>
              <p className="text-xs text-blue-700 mt-2">
                We will still generate your full pack, including notices, court forms and a
                procedural guide. Use the roadmap and evidence checklist to fix any issues
                before you file at court.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Blocking Issues */}
      {hasBlockingIssues && (
        <Card id="critical-issues" className="p-6 border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <RiCloseLine className="h-6 w-6 text-[#7C3AED] mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Critical Issues Affecting Court Readiness
              </h2>
              <p className="text-sm text-red-800 mb-3">
                These issues may stop a judge granting possession unless they are fixed. Your
                pack will include a procedural guide explaining how to deal with them.
              </p>
              {analysis.decision_engine?.blocking_issues
                ?.filter((issue: any) => issue.severity === 'blocking')
                .map((issue: any, i: number) => (
                  <div key={i} className="mb-2 p-3 bg-white rounded border border-red-200">
                    <p className="font-medium text-red-900">
                      {issue.route?.toUpperCase?.() || 'ROUTE'}: {issue.description}
                    </p>
                    {issue.action_required && (
                      <p className="text-sm text-red-700 mt-1">
                        Action suggested: {issue.action_required}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}

      {hasBlockingIssues && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Critical issues found</h2>
          <p className="text-sm text-red-800 mb-4">
            These issues may prevent your document from being valid or court-ready. Fix them first,
            or acknowledge and continue.
          </p>
          <label className="flex items-start gap-3 text-sm text-red-900">
            <input
              type="checkbox"
              checked={hasAcknowledgedBlockers}
              onChange={(event) => onAcknowledgeBlockers(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-red-300 text-primary focus:ring-primary"
              aria-label="Acknowledge critical issues"
            />
            <span>
              I understand these issues may prevent the document being court-ready, and I want to
              proceed.
            </span>
          </label>
        </Card>
      )}

      {/* Case Strength Widget */}
      {analysis.score_report && <CaseStrengthWidget scoreReport={analysis.score_report} />}

      {/* Scotland-Specific Content */}
      {jurisdiction === 'scotland' && (
        <>
          {/* Scotland 6-Month Rule Check */}
          {(() => {
            const tenancyStartDate = analysis.case_facts?.tenancy_start_date;
            if (!tenancyStartDate) return null;
            const validation = validateSixMonthRule(tenancyStartDate);
            if (!validation.valid) {
              return (
                <Card className="p-6 border-red-300 bg-red-50">
                  <div className="flex items-start gap-3">
                    <RiCloseLine className="h-6 w-6 text-red-600 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-red-900 mb-2">
                        Cannot Serve Notice Yet - 6-Month Rule
                      </h2>
                      <p className="text-sm text-red-800">
                        {validation.message}
                      </p>
                      <p className="text-sm text-red-700 mt-2 font-medium">
                        Earliest notice date: {validation.earliestNoticeDate}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            }
            return null;
          })()}

          {/* Scotland Ground Display (from config) */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Notice to Leave</h2>
            {(() => {
              const selectedGroundNumber = analysis.case_facts?.scotland_eviction_ground;
              const groundData = selectedGroundNumber
                ? getScotlandGroundByNumber(selectedGroundNumber)
                : null;

              if (!groundData) {
                return <p className="text-gray-500">No ground selected</p>;
              }

              return (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded border">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded text-sm shrink-0">
                      {groundData.code}
                    </span>
                    <div>
                      <p className="font-medium">{groundData.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{groundData.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Notice Period</p>
                      <p className="font-medium">{groundData.noticePeriodDays} days</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Ground Type</p>
                      <p className="font-medium text-amber-700">Discretionary</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Discretionary Warning */}
          <Card className="p-6 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <RiErrorWarningLine className="h-6 w-6 text-amber-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-amber-900 mb-2">
                  All Grounds are Discretionary
                </h2>
                <p className="text-sm text-amber-800">
                  Unlike England, Scotland has <strong>no mandatory grounds</strong> for eviction.
                  Even if you prove your ground, the First-tier Tribunal may refuse the eviction
                  order if it considers it unreasonable in the circumstances.
                </p>
              </div>
            </div>
          </Card>

          {/* First-tier Tribunal Info */}
          <Card className="p-6 border-blue-200 bg-blue-50">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">First-tier Tribunal</h2>
            {(() => {
              const config = getScotlandConfig();
              return (
                <div className="space-y-3">
                  <p className="text-sm text-blue-800">
                    In Scotland, eviction cases are heard by the <strong>{config.tribunal}</strong>,
                    not the county courts used in England.
                  </p>
                  <p className="text-sm text-blue-800">
                    Your complete pack includes <strong>{config.tribunalApplication.form}</strong> for
                    applying to the Tribunal. The application fee is {config.tribunalApplication.fee}.
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    {config.tribunalApplication.timeframe}
                  </p>
                </div>
              );
            })()}
          </Card>

          {/* Scotland Documents */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <RiFileTextLine className="h-5 w-5 text-[#7C3AED]" />
              Documents in Your Pack
            </h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <RiCheckboxCircleLine className="w-4 h-4 text-[#7C3AED]" />
                Notice to Leave
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <RiCheckboxCircleLine className="w-4 h-4 text-[#7C3AED]" />
                Form E - Eviction Application
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <RiCheckboxCircleLine className="w-4 h-4 text-[#7C3AED]" />
                Grounds Evidence Summary
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <RiCheckboxCircleLine className="w-4 h-4 text-[#7C3AED]" />
                Service Instructions
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <RiCheckboxCircleLine className="w-4 h-4 text-[#7C3AED]" />
                Tribunal Process Guide
              </li>
            </ul>
          </Card>
        </>
      )}

      {/* Legal Assessment: routes & grounds (England/Wales only) */}
      {jurisdiction !== 'scotland' && (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Legal Assessment</h2>

        {/* Available Routes */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Available routes:</h3>
          {analysis.decision_engine?.recommended_routes?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.decision_engine.recommended_routes.map((route: string) => (
                <span
                  key={route}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  <RiCheckboxCircleLine className="inline h-4 w-4 mr-1 text-[#7C3AED]" />
                  {route.toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-600">No routes currently available.</p>
          )}
        </div>

        {/* Recommended Grounds */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended grounds:</h3>
          {analysis.decision_engine?.recommended_grounds?.length > 0 ? (
            <div className="space-y-2">
              {analysis.decision_engine.recommended_grounds.map((ground: any) => (
                <div key={ground.code} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        Ground {ground.code}: {ground.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{ground.description}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        ground.type === 'mandatory'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ground.type?.toUpperCase?.() || 'GROUND'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No grounds recommended.</p>
          )}
        </div>
      </Card>
      )}

      {/* Things to Fix or Improve */}
      {(redFlags.length > 0 || complianceIssues.length > 0) && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Things to Fix or Improve</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {redFlags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-amber-800 mb-2">Red flags</h3>
                <ul className="space-y-1 text-sm text-amber-900">
                  {redFlags.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {complianceIssues.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">Compliance issues</h3>
                <ul className="space-y-1 text-sm text-red-900">
                  {complianceIssues.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Your eviction pack will include a checklist and roadmap to help you address these
            before or shortly after issuing your claim.
          </p>
        </Card>
      )}

      {/* AI Document Analysis (Smart Review) */}
      {analysis?.case_facts?.__smart_review?.warnings?.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">AI Document Analysis</h2>
          <SmartReviewPanel
            warnings={analysis.case_facts.__smart_review.warnings}
            summary={analysis.case_facts.__smart_review.summary}
            defaultCollapsed={false}
          />
        </Card>
      )}

      {/* Evidence & documents checklist */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Evidence &amp; documents checklist</h2>
        <p className="text-sm text-gray-600 mb-3">
          This is a quick snapshot of the key documents courts expect to see. Uploading them
          now makes your pack much stronger and reduces the risk of delays.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            {evidence.tenancy_agreement_uploaded ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            ) : (
              <RiErrorWarningLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Tenancy agreement</p>
              <p className="text-xs text-gray-600">
                {evidence.tenancy_agreement_uploaded
                  ? 'Marked as provided in your case facts.'
                  : 'Not uploaded yet – strongly recommended so the judge can see the contract.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {evidence.rent_schedule_uploaded ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            ) : (
              <RiErrorWarningLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Rent / arrears schedule</p>
              <p className="text-xs text-gray-600">
                {evidence.rent_schedule_uploaded
                  ? 'Arrears schedule recorded for the claim.'
                  : 'Not uploaded yet – courts expect a clear chronology of missed payments.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {evidence.bank_statements_uploaded ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            ) : (
              <RiErrorWarningLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Bank statements</p>
              <p className="text-xs text-gray-600">
                {evidence.bank_statements_uploaded
                  ? 'Supporting payment history has been flagged.'
                  : 'Not flagged yet – optional, but helpful to prove what was paid or missed.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {evidence.other_evidence_uploaded ? (
              <RiCheckboxCircleLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            ) : (
              <RiErrorWarningLine className="h-5 w-5 text-[#7C3AED] mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Other supporting evidence</p>
              <p className="text-xs text-gray-600">
                {evidence.other_evidence_uploaded
                  ? 'You have flagged additional documents (photos, quotes, correspondence, etc.).'
                  : 'Not flagged yet – think about emails, texts, photos or reports that support your case.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents to be generated */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          <RiFileTextLine className="inline h-5 w-5 mr-2 text-[#7C3AED]" />
          Documents that will be generated
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Based on your case details and jurisdiction, the following documents will be prepared
          in your pack:
        </p>
        <ul className="space-y-2">
          {previewDocuments.length > 0 ? (
            previewDocuments.map((doc) => (
              <li key={doc.id} className="flex items-center gap-2 text-sm">
                <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
                <span className="font-medium">
                  {doc.title ?? doc.document_title ?? 'Untitled document'}
                </span>

                {doc.requiredToFile && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                    Required for filing
                  </span>
                )}
              </li>
            ))
          ) : jurisdiction === 'scotland' ? (
            <>
              <li className="flex items-center gap-2 text-sm">
                <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
                Notice to Leave
              </li>
              {!product.includes('notice_only') && (
                <li className="flex items-center gap-2 text-sm">
                  <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
                  Form E (Tribunal application)
                </li>
              )}
            </>
          ) : (
            <>
              {/* Route-specific notice display for England/Wales */}
              {analysis.recommended_route === 'section_21' ||
              analysis.recommended_route === 'accelerated_possession' ||
              analysis.recommended_route === 'accelerated_section21' ? (
                <li className="flex items-center gap-2 text-sm">
                  <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
                  Section 21 notice (Form 6A)
                </li>
              ) : analysis.recommended_route === 'section_8' ||
                analysis.recommended_route === 'section8_notice' ? (
                <li className="flex items-center gap-2 text-sm">
                  <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
                  Section 8 notice (Form 3)
                </li>
              ) : (
                <>
                  <li className="flex items-center gap-2 text-sm">
                    <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
                    Section 8 notice (Form 3)
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
                    Section 21 notice (Form 6A)
                  </li>
                </>
              )}
              {!product.includes('notice_only') && (
                <li className="flex items-center gap-2 text-sm">
                  <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
                  Form N5 / N119 (court forms)
                </li>
              )}
            </>
          )}
        </ul>
      </Card>

      {/* Warnings (non-blocking) */}
      {analysis.decision_engine?.warnings?.length > 0 && (
        <Card className="p-6 border-yellow-300 bg-yellow-50">
          <div className="flex items-start gap-3">
            <RiErrorWarningLine className="h-6 w-6 text-[#7C3AED] mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">Important warnings</h2>
              <ul className="space-y-1">
                {analysis.decision_engine.warnings.map((warning: string, i: number) => (
                  <li key={i} className="text-sm text-yellow-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button onClick={onEdit} variant="outline" className="flex-1">
          Go back &amp; edit answers
        </Button>
        {hasBlockingIssues && (
          <Button
            onClick={onFixIssues}
            variant="outline"
            className="flex-1"
            aria-label="Fix critical issues first"
          >
            Fix issues first
          </Button>
        )}
        <Button
          onClick={onProceed}
          className="flex-1"
          disabled={(hasBlockingIssues && !hasAcknowledgedBlockers) || isRegenerating || isLoadingPaymentStatus}
          aria-disabled={(hasBlockingIssues && !hasAcknowledgedBlockers) || isRegenerating || isLoadingPaymentStatus}
        >
          {isLoadingPaymentStatus ? 'Loading...' : isRegenerating ? 'Regenerating...' : isPaid ? 'Regenerate pack' : 'Proceed to payment & pack'}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500 mt-2">
        {isPaid
          ? 'Your updated answers will be used to regenerate your documents.'
          : 'We will generate your full pack regardless of readiness. Use the guidance to reach a safe, court-ready position before issuing.'}
      </p>
    </div>
  );
}

// ============================================================================
// NOTICE ONLY REVIEW CONTENT
// ============================================================================
interface NoticeOnlyReviewContentProps {
  caseId: string;
  analysis: any;
  jurisdiction: string;
  readinessBadge: React.ReactNode;
  redFlags: string[];
  complianceIssues: string[];
  hasBlockingIssues: boolean;
  hasAcknowledgedBlockers: boolean;
  onAcknowledgeBlockers: (acknowledged: boolean) => void;
  onFixIssues: () => void;
  onEdit: () => void;
  onProceed: () => void;
  isPaid?: boolean;
  isRegenerating?: boolean;
  isLoadingPaymentStatus?: boolean;
}

function NoticeOnlyReviewContent({
  caseId,
  analysis,
  jurisdiction,
  readinessBadge,
  redFlags,
  complianceIssues,
  hasBlockingIssues,
  hasAcknowledgedBlockers,
  onAcknowledgeBlockers,
  onFixIssues,
  onEdit,
  onProceed,
  isPaid,
  isRegenerating,
  isLoadingPaymentStatus,
}: NoticeOnlyReviewContentProps) {
  // Extract decision engine data
  const decisionEngine = analysis?.decision_engine;
  const blockingIssues = decisionEngine?.blocking_issues?.filter((i: any) => i.severity === 'blocking') || [];
  const warnings = decisionEngine?.warnings || [];
  const recommendedRoute = analysis?.recommended_route;

  const isSection21 = recommendedRoute === 'section_21';
  const isSection8 = recommendedRoute === 'section_8';
  const isWales = jurisdiction === 'wales';
  const isScotland = jurisdiction === 'scotland';

  const hasComplianceIssues = complianceIssues.length > 0;
  const hasWarnings = warnings.length > 0 || redFlags.length > 0;

  // Jurisdiction display label
  const jurisdictionLabel = jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1);

  // =========================================================================
  // Section 8 Grounds Logic - Selected vs Recommended
  // =========================================================================
  // Get user-selected grounds from case facts
  const caseFacts = analysis?.case_facts || analysis?.facts || {};
  const selectedGroundsRaw: string[] = caseFacts?.section8_grounds || [];
  const selectedGrounds = selectedGroundsRaw.map(g => normalizeGroundCode(g));

  // Get decision engine recommended grounds (these are additional recommendations)
  const recommendedGroundsFromEngine: any[] = decisionEngine?.recommended_grounds || [];
  // Filter out grounds that user already selected
  const additionalRecommendedGrounds = recommendedGroundsFromEngine.filter(
    (g) => !selectedGrounds.includes(normalizeGroundCode(g.code))
  );

  // State for opt-in toggle
  const [includeRecommendedGrounds, setIncludeRecommendedGrounds] = useState<boolean>(
    caseFacts?.include_recommended_grounds || false
  );

  // Calculate included grounds based on toggle
  const includedGroundCodes = includeRecommendedGrounds
    ? [...selectedGrounds, ...additionalRecommendedGrounds.map(g => normalizeGroundCode(g.code))]
    : selectedGrounds;

  // Calculate notice periods
  const selectedOnlyPeriod = calculateCombinedNoticePeriod(selectedGrounds);
  const includedPeriod = calculateCombinedNoticePeriod(includedGroundCodes);
  const periodComparison = compareNoticePeriods(
    selectedGrounds,
    additionalRecommendedGrounds.map(g => g.code)
  );

  // Check if arrears grounds are included and if arrears schedule is complete
  const includesArrearsGrounds = hasArrearsGround(includedGroundCodes);
  const arrearsItems = caseFacts?.arrears_items || [];
  const arrearsEvidenceStatus = isArrearsEvidenceComplete(includedGroundCodes, arrearsItems);

  // Get ground-aware suggestions
  const evidenceOverview = analysis?.evidence_overview || {};
  const suggestions = getGroundAwareSuggestions(includedGroundCodes, {
    tenancy_agreement_uploaded: evidenceOverview.tenancy_agreement_uploaded,
    rent_schedule_uploaded: evidenceOverview.rent_schedule_uploaded,
    bank_statements_uploaded: evidenceOverview.bank_statements_uploaded,
    damage_photos_uploaded: evidenceOverview.damage_photos_uploaded,
    authority_letters_uploaded: evidenceOverview.authority_letters_uploaded,
    correspondence_uploaded: evidenceOverview.correspondence_uploaded,
  });

  // Handler for toggle change - persists to case facts
  const handleIncludeRecommendedChange = async (checked: boolean) => {
    setIncludeRecommendedGrounds(checked);

    // Persist to case facts
    try {
      await saveCaseFacts(
        caseId,
        {
          ...caseFacts,
          include_recommended_grounds: checked,
        },
        {
          jurisdiction: jurisdiction as any,
          caseType: 'eviction',
          product: 'notice_only',
        }
      );
    } catch (error) {
      console.error('Failed to save include_recommended_grounds preference:', error);
    }
  };

  // Build route label based on actual route
  const recommendedRouteLabel = isSection8
    ? 'Section 8 Notice (Form 3)'
    : isSection21
    ? 'Section 21 Notice (Form 6A)'
    : isWales
    ? 'RHW Notice'
    : isScotland
    ? 'Notice to Leave'
    : 'Notice';

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <h1 className="text-3xl font-bold text-gray-900">Notice Review</h1>
        <p className="text-gray-600 mt-2">
          {jurisdictionLabel} • {recommendedRouteLabel}
        </p>
        {isSection8 && includedGroundCodes.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Minimum notice period: <span className="font-semibold">{includedPeriod.noticePeriodDays} days</span>
          </p>
        )}
        <div className="mt-4">
          {readinessBadge || (
            hasBlockingIssues || (isSection21 && hasComplianceIssues) ? (
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 font-medium">
                Issues Found - Review Required
              </span>
            ) : hasWarnings || hasComplianceIssues ? (
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-medium">
                Warnings to Review
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 font-medium">
                Ready to Generate
              </span>
            )
          )}
        </div>
      </div>

      {/* Blocking Issues */}
      {blockingIssues.length > 0 && (
        <Card id="critical-issues" className="border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2 mb-4">
            <RiErrorWarningLine className="w-5 h-5" />
            Critical Issues
          </h2>
          <p className="text-red-700 text-sm mb-4">
            These issues may make your notice invalid or unenforceable:
          </p>
          <ul className="space-y-3">
            {blockingIssues.map((issue: any, index: number) => (
              <li key={index} className="flex items-start gap-3 bg-white p-4 rounded border border-red-100">
                <span className="text-red-500 mt-0.5">✕</span>
                <div>
                  <p className="font-medium text-red-900">{issue.description || issue}</p>
                  {issue.action_required && (
                    <p className="text-sm text-red-700 mt-1">
                      <strong>Action:</strong> {issue.action_required}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Section 21 Compliance Checklist */}
      {isSection21 && !isWales && !isScotland && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Section 21 Compliance Checklist</h2>
          <p className="text-gray-600 text-sm mb-4">
            A Section 21 notice is only valid if ALL requirements are met:
          </p>
          <div className="space-y-3">
            {[
              {
                label: 'Deposit protected in government scheme within 30 days',
                failed: complianceIssues.some((i) => i.toLowerCase().includes('deposit')),
              },
              {
                label: 'Prescribed information given to tenant',
                failed: complianceIssues.some((i) => i.toLowerCase().includes('prescribed')),
              },
              {
                label: 'Valid EPC provided to tenant',
                failed: complianceIssues.some((i) => i.toLowerCase().includes('epc')),
              },
              {
                label: '"How to Rent" guide provided',
                failed: complianceIssues.some((i) => i.toLowerCase().includes('how to rent')),
                show: jurisdiction === 'england',
              },
              {
                label: 'Gas safety certificate provided (if applicable)',
                failed: complianceIssues.some((i) => i.toLowerCase().includes('gas')),
              },
            ]
              .filter((item) => item.show !== false)
              .map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.failed ? (
                    <span className="text-red-500 text-xl">✕</span>
                  ) : (
                    <span className="text-green-500 text-xl">✓</span>
                  )}
                  <span className={item.failed ? 'text-red-700 font-medium' : 'text-gray-700'}>
                    {item.label}
                  </span>
                </div>
              ))}
          </div>
          {hasComplianceIssues && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              <strong>Warning:</strong> If any requirements are not met, your Section 21 notice
              will be invalid and the court will not grant possession.
            </div>
          )}
        </Card>
      )}

      {/* Section 8 Grounds - Selected vs Recommended (NEW IMPLEMENTATION) */}
      {isSection8 && (
        <>
          {/* No Grounds Selected - Prompt user to go back */}
          {selectedGrounds.length === 0 && (
            <Card className="p-6 border-amber-200 bg-amber-50">
              <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2 mb-2">
                <RiErrorWarningLine className="w-5 h-5" />
                No grounds selected
              </h2>
              <p className="text-sm text-amber-700 mb-4">
                Please go back and select at least one ground for your Section 8 notice.
                Common grounds for rent arrears include Ground 8 (serious arrears - 2+ months).
              </p>
              <Button
                onClick={onEdit}
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                Go back and select grounds
              </Button>
            </Card>
          )}

          {/* Selected Grounds (User's choice - always included) */}
          {selectedGrounds.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <RiCheckboxCircleLine className="w-5 h-5 text-green-600" />
                Selected Grounds (included in your notice)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                These grounds will be included in your Section 8 notice.
                {selectedOnlyPeriod.noticePeriodDays === 14 && selectedGrounds.length === 1 && selectedGrounds.includes('8') && (
                  <span className="block mt-1 text-green-700 font-medium">
                    Ground 8 only requires 14 days notice.
                  </span>
                )}
              </p>
              <ul className="space-y-3">
                {selectedGrounds.map((groundCode, index) => {
                  const groundInfo = getGroundDescription(groundCode);
                  return (
                    <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                      <span className="font-mono text-sm bg-green-200 px-2 py-1 rounded shrink-0">
                        {groundInfo.code}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{groundInfo.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              groundInfo.type === 'mandatory'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {groundInfo.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {groundInfo.noticePeriodDays} days notice
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                <strong>Notice period for selected grounds:</strong> {selectedOnlyPeriod.noticePeriodDays} days
              </p>
            </Card>
          )}

          {/* Recommended Grounds (Optional - from decision engine) */}
          {additionalRecommendedGrounds.length > 0 && (
            <Card className="p-6 border-blue-200 bg-blue-50/30">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <RiInformationLine className="w-5 h-5 text-blue-600" />
                Recommended Grounds (optional)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Based on your case details, these additional grounds may strengthen your position.
                Including them is <strong>optional</strong>.
              </p>

              {/* Notice period warning */}
              {periodComparison.increasesNotice && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                  <p className="text-amber-800">
                    <strong>Important:</strong> Adding these grounds will increase your notice period
                    from {periodComparison.selectedPeriod} days to {periodComparison.combinedPeriod} days.
                    This will delay when you can start court proceedings.
                  </p>
                </div>
              )}

              <ul className="space-y-3 mb-4">
                {additionalRecommendedGrounds.map((ground: any, index: number) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-white rounded border border-blue-100">
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded shrink-0">
                      {ground.code}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ground.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            ground.type === 'mandatory'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ground.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ground.notice_period_days || getGroundDescription(ground.code).noticePeriodDays} days notice
                        </span>
                      </div>
                      {ground.reasoning && (
                        <p className="text-xs text-gray-500 mt-1">{ground.reasoning}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Opt-in toggle */}
              <div className="border-t pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRecommendedGrounds}
                    onChange={(e) => handleIncludeRecommendedChange(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Include recommended grounds in my notice
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {includeRecommendedGrounds ? (
                        <span className="text-blue-700">
                          Your notice will include {includedGroundCodes.length} ground(s) with a {includedPeriod.noticePeriodDays}-day notice period.
                        </span>
                      ) : (
                        'Your notice will only include your selected grounds.'
                      )}
                    </p>
                  </div>
                </label>
              </div>

              {/* Confirmation when toggled on */}
              {includeRecommendedGrounds && periodComparison.increasesNotice && (
                <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded text-sm">
                  <p className="text-blue-900">
                    <strong>Confirmed:</strong> Your notice period is now {includedPeriod.noticePeriodDays} days
                    (increased from {selectedOnlyPeriod.noticePeriodDays} days).
                    The court cannot hear your case until after this period expires.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Arrears Schedule Blocking Message */}
          {includesArrearsGrounds && !arrearsEvidenceStatus.complete && (
            <Card className="p-6 border-red-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2 mb-2">
                <RiErrorWarningLine className="w-5 h-5" />
                Rent Schedule Required
              </h2>
              <p className="text-sm text-red-700 mb-4">
                {arrearsEvidenceStatus.message}
              </p>
              <Button
                onClick={onEdit}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Complete Arrears Schedule
              </Button>
            </Card>
          )}

          {/* Ground-Aware Evidence Suggestions */}
          {suggestions.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <RiCheckboxCircleLine className="w-5 h-5 text-green-600" />
                Suggestions to strengthen your case
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Based on the grounds in your notice, consider gathering the following evidence:
              </p>
              <ul className="space-y-3">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                    <span className={`text-xs px-2 py-0.5 rounded shrink-0 mt-0.5 ${
                      suggestion.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {suggestion.priority === 'high' ? 'Important' : 'Helpful'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{suggestion.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{suggestion.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Notice Period Summary */}
          <Card className="p-6 bg-gray-50">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <RiCalendarCheckLine className="w-5 h-5 text-gray-600" />
              Notice Period Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Grounds in notice:</span>
                <span className="font-medium">{includedGroundCodes.map(c => `Ground ${c}`).join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum notice period:</span>
                <span className="font-semibold text-lg">{includedPeriod.noticePeriodDays} days</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {includedPeriod.explanation}
              </p>
            </div>
          </Card>
        </>
      )}

      {/* Wales-specific notice info */}
      {isWales && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Wales Notice Information</h2>
          <p className="text-gray-600 text-sm">
            Your notice will be served under the Renting Homes (Wales) Act 2016 using the
            appropriate RHW form.
          </p>
        </Card>
      )}

      {/* Scotland-specific notice info */}
      {isScotland && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Scotland Notice Information</h2>
          <p className="text-gray-600 text-sm">
            Your Notice to Leave will be served under the Private Housing (Tenancies) (Scotland)
            Act 2016.
          </p>
        </Card>
      )}

      {/* Additional suggestions (non-S21, only if there are items and no ground-aware suggestions shown) */}
      {hasComplianceIssues && !isSection21 && suggestions.length === 0 && (
        <Card className="border-blue-200 bg-blue-50/50 p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <RiInformationLine className="w-5 h-5" />
            Additional notes
          </h2>
          <ul className="space-y-2">
            {complianceIssues.map((issue: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-blue-900">
                <span>•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-3">Things to Check</h2>
          <ul className="space-y-2">
            {redFlags.map((flag: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-amber-900">
                <span>•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Warnings from decision engine */}
      {warnings.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Important Notes</h2>
          <ul className="space-y-2">
            {warnings.map((warning: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-blue-900">
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {hasBlockingIssues && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Critical issues found</h2>
          <p className="text-sm text-red-800 mb-4">
            These issues may prevent your document from being valid or court-ready. Fix them first,
            or acknowledge and continue.
          </p>
          <label className="flex items-start gap-3 text-sm text-red-900">
            <input
              type="checkbox"
              checked={hasAcknowledgedBlockers}
              onChange={(event) => onAcknowledgeBlockers(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-red-300 text-primary focus:ring-primary"
              aria-label="Acknowledge critical issues"
            />
            <span>
              I understand these issues may prevent the document being court-ready, and I want to
              proceed.
            </span>
          </label>
        </Card>
      )}

      {/* Documents in Pack */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RiFileList3Line className="w-5 h-5 text-gray-600" />
          Documents in Your Pack
        </h2>
        <ul className="space-y-2">
          {isSection21 ? (
            <>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Form 6A - Section 21 Notice
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Service Instructions
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Compliance Checklist
              </li>
            </>
          ) : isSection8 ? (
            <>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Form 3 - Section 8 Notice
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Service Instructions
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Grounds Summary
              </li>
              {includesArrearsGrounds && arrearsEvidenceStatus.complete && (
                <li className="flex items-center gap-2 text-gray-700">
                  <RiFileTextLine className="w-4 h-4 text-green-500" />
                  Rent Schedule / Arrears Statement
                </li>
              )}
            </>
          ) : isWales ? (
            <>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                RHW Notice Form
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Service Instructions
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Compliance Checklist
              </li>
            </>
          ) : isScotland ? (
            <>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Notice to Leave
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Service Instructions
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Eviction Grounds Summary
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Eviction Notice
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <RiFileTextLine className="w-4 h-4 text-gray-400" />
                Service Instructions
              </li>
            </>
          )}
        </ul>
        <div className="mt-4 pt-4 border-t">
          <p className="text-gray-600">
            Price: <span className="font-semibold text-gray-900">£39.99</span>
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button onClick={onEdit} variant="outline" className="flex-1">
          Go back and edit answers
        </Button>
        {hasBlockingIssues && (
          <Button
            onClick={onFixIssues}
            variant="outline"
            className="flex-1"
            aria-label="Fix critical issues first"
          >
            Fix issues first
          </Button>
        )}
        <Button
          onClick={onProceed}
          className="flex-1"
          disabled={(hasBlockingIssues && !hasAcknowledgedBlockers) || (includesArrearsGrounds && !arrearsEvidenceStatus.complete) || isRegenerating || isLoadingPaymentStatus}
          aria-disabled={(hasBlockingIssues && !hasAcknowledgedBlockers) || (includesArrearsGrounds && !arrearsEvidenceStatus.complete) || isRegenerating || isLoadingPaymentStatus}
        >
          {isLoadingPaymentStatus ? 'Loading...' : isRegenerating ? 'Regenerating...' : isPaid ? 'Regenerate pack' : 'Proceed to payment and pack'}
        </Button>
      </div>

      {/* Disclaimer for issues */}
      {(hasBlockingIssues || (isSection21 && hasComplianceIssues)) && !isPaid && (
        <p className="text-center text-sm text-gray-500 pb-4">
          By proceeding, you acknowledge the issues above. We recommend resolving compliance issues
          before serving your notice.
        </p>
      )}
      {isPaid && (
        <p className="text-center text-sm text-gray-500 pb-4">
          Your updated answers will be used to regenerate your documents.
        </p>
      )}
    </div>
  );
}

// ============================================================================
// TENANCY AGREEMENT REVIEW CONTENT
// ============================================================================
interface TenancyReviewContentProps {
  caseId: string;
  analysis: any;
  jurisdiction: string;
  product: string;
  onEdit: () => void;
  onProceed: () => void;
  isPaid?: boolean;
  isRegenerating?: boolean;
  isLoadingPaymentStatus?: boolean;
}

/**
 * Build validation checks for tenancy agreement
 * Returns blockers (critical issues) and warnings (non-blocking)
 */
function buildTenancyValidation(facts: any, jurisdiction: string) {
  const blockers: Array<{ title: string; message: string }> = [];
  const warnings: Array<{ title: string; message: string }> = [];

  // 1. Property address check
  if (!facts.property_address && !facts.property_full_address) {
    blockers.push({
      title: 'Property address missing',
      message: 'The tenancy agreement requires a valid property address.',
    });
  }

  // 2. Landlord details check
  if (!facts.landlord_name && !facts.landlord_full_name) {
    blockers.push({
      title: 'Landlord name missing',
      message: 'The landlord name is required for the agreement.',
    });
  }

  // 3. Tenant details check
  const tenantLabel = jurisdiction === 'wales' ? 'Contract holder' : 'Tenant';
  if (!facts.tenant_names && !facts.tenant_1_name) {
    blockers.push({
      title: `${tenantLabel} name missing`,
      message: `At least one ${tenantLabel.toLowerCase()} name is required.`,
    });
  }

  // 4. Rent amount check
  if (!facts.rent_amount && !facts.monthly_rent) {
    blockers.push({
      title: 'Rent amount not specified',
      message: 'The rent amount must be specified in the agreement.',
    });
  }

  // 5. Tenancy start date check
  if (!facts.tenancy_start_date && !facts.start_date) {
    blockers.push({
      title: 'Start date missing',
      message: 'The tenancy start date must be specified.',
    });
  }

  // 6. Deposit protection warning (England/Wales only)
  if ((jurisdiction === 'england' || jurisdiction === 'wales') && facts.deposit_amount && facts.deposit_amount > 0) {
    if (!facts.deposit_protected) {
      warnings.push({
        title: 'Deposit protection reminder',
        message: 'You must protect the deposit within 30 days of receiving it and provide prescribed information to the tenant.',
      });
    }
  }

  // 7. Scotland-specific: PRT terms
  if (jurisdiction === 'scotland') {
    if (facts.fixed_term_tenancy === true || facts.tenancy_type === 'fixed_term') {
      warnings.push({
        title: 'Fixed term not available for PRTs',
        message: 'Private Residential Tenancies in Scotland cannot have a fixed term. The tenancy will be open-ended.',
      });
    }
  }

  // 8. HMO license check
  if (facts.is_hmo && !facts.hmo_license_number) {
    warnings.push({
      title: 'HMO license required',
      message: 'This property appears to be an HMO. Ensure you have a valid HMO license.',
    });
  }

  return { blockers, warnings };
}

/**
 * Get jurisdiction-specific landlord obligations
 */
function getJurisdictionObligations(jurisdiction: string): Array<{ title: string; items: string[] }> {
  const commonObligations = [
    'Keep the property in good repair and ensure all installations are safe',
    'Carry out repairs promptly when notified of problems',
    'Provide valid contact details for emergencies',
    'Give proper notice before entering the property',
  ];

  switch (jurisdiction) {
    case 'england':
      return [
        {
          title: 'Before Tenancy Starts',
          items: [
            'Protect the deposit in a government-approved scheme within 30 days',
            'Provide the tenant with prescribed deposit information',
            'Give the tenant the "How to Rent" guide',
            'Provide a valid Energy Performance Certificate (EPC)',
            'Provide a valid Gas Safety Certificate (if gas appliances present)',
            'Ensure all electrical installations are safe (EICR required)',
          ],
        },
        {
          title: 'During the Tenancy',
          items: [
            ...commonObligations,
            'Renew Gas Safety Certificate annually',
            'Ensure smoke and carbon monoxide alarms are fitted on each storey',
            'Give at least 24 hours notice before inspections (in writing)',
          ],
        },
        {
          title: 'At the End of Tenancy',
          items: [
            'Return the deposit within 10 days of agreeing deductions (or referring to ADR)',
            'Provide an itemised list of any proposed deductions',
            'Allow the tenant to attend the checkout inspection',
          ],
        },
      ];

    case 'wales':
      return [
        {
          title: 'Before Contract Starts',
          items: [
            'Register as a landlord with Rent Smart Wales',
            'Ensure the property meets the Fitness for Human Habitation (FFHH) standards',
            'Protect the deposit in a government-approved scheme',
            'Provide a written statement of the occupation contract within 14 days',
            'Provide a valid Energy Performance Certificate (EPC)',
            'Provide a valid Gas Safety Certificate (if applicable)',
            'Provide a valid EICR (Electrical Installation Condition Report)',
          ],
        },
        {
          title: 'During the Contract',
          items: [
            ...commonObligations,
            'Keep the property fit for human habitation throughout',
            'Ensure smoke alarms are installed on each storey',
            'Ensure carbon monoxide alarms are installed where needed',
            'Give at least 24 hours notice before entering the property',
          ],
        },
        {
          title: 'At the End of Contract',
          items: [
            'Return the deposit within the timeframe required by the scheme',
            'Provide evidence for any proposed deductions',
            'Issue proper notice using the correct RHW form',
          ],
        },
      ];

    case 'scotland':
      return [
        {
          title: 'Before Tenancy Starts',
          items: [
            'Register with the Scottish Landlord Register',
            'Provide the tenant with an Easy Read Notes document',
            'Provide a valid Energy Performance Certificate (EPC - minimum band E)',
            'Provide a valid Gas Safety Certificate (if applicable)',
            'Ensure the property meets the Repairing Standard',
            'Provide a Legionella risk assessment',
          ],
        },
        {
          title: 'During the Tenancy',
          items: [
            ...commonObligations,
            'Maintain the property to the Repairing Standard',
            'Install smoke alarms, heat alarms and carbon monoxide detectors',
            'Give reasonable notice before inspections (usually 48 hours)',
          ],
        },
        {
          title: 'At the End of Tenancy',
          items: [
            'Serve a Notice to Leave using the correct form',
            'Give proper notice periods based on eviction ground',
            'Apply to the First-tier Tribunal for eviction (not the courts)',
          ],
        },
      ];

    case 'northern-ireland':
      return [
        {
          title: 'Before Tenancy Starts',
          items: [
            'Register with the Landlord Registration Scheme',
            'Provide a valid Gas Safety Certificate (if applicable)',
            'Provide a valid Energy Performance Certificate (EPC)',
            'Ensure the property meets the Fitness Standard',
          ],
        },
        {
          title: 'During the Tenancy',
          items: [
            ...commonObligations,
            'Maintain the property to the Fitness Standard',
            'Give reasonable notice before inspections',
          ],
        },
        {
          title: 'At the End of Tenancy',
          items: [
            'Serve proper notice using the correct form',
            'Give at least 4 weeks notice (or longer depending on circumstances)',
            'Return any deposit with appropriate deductions documented',
          ],
        },
      ];

    default:
      return [];
  }
}

function TenancyReviewContent({
  caseId,
  analysis,
  jurisdiction,
  product,
  onEdit,
  onProceed,
  isPaid,
  isRegenerating,
  isLoadingPaymentStatus,
}: TenancyReviewContentProps) {
  const facts = analysis.case_facts || {};
  const validation = buildTenancyValidation(facts, jurisdiction);
  const obligations = getJurisdictionObligations(jurisdiction);

  // Determine if premium tier
  const isPremium = product === 'ast_premium' || facts.product_tier?.includes('Premium');

  // Get jurisdiction-specific terminology
  const terminologyMap: Record<string, { agreementType: string; tenantLabel: string }> = {
    england: { agreementType: 'Assured Shorthold Tenancy (AST)', tenantLabel: 'tenant' },
    wales: { agreementType: 'Occupation Contract', tenantLabel: 'contract holder' },
    scotland: { agreementType: 'Private Residential Tenancy (PRT)', tenantLabel: 'tenant' },
    'northern-ireland': { agreementType: 'Private Tenancy', tenantLabel: 'tenant' },
  };
  const terminology = terminologyMap[jurisdiction] || terminologyMap.england;

  // Jurisdiction display label
  const jurisdictionLabel = {
    england: 'England',
    wales: 'Wales',
    scotland: 'Scotland',
    'northern-ireland': 'Northern Ireland',
  }[jurisdiction] || jurisdiction;

  // Documents included in pack
  const standardDocs = [
    { title: `${terminology.agreementType} Agreement`, included: true },
    { title: 'Property Details Schedule', included: true },
    { title: 'Deposit Protection Information', included: true },
    { title: 'Prescribed Information Template', included: jurisdiction === 'england' || jurisdiction === 'wales' },
    { title: 'Easy Read Notes', included: jurisdiction === 'scotland' },
    { title: 'Landlord Obligations Checklist', included: true },
  ].filter(d => d.included);

  const premiumDocs = [
    { title: 'Guarantor Agreement', included: true },
    { title: 'Inventory Template', included: true },
    { title: 'Check-in/Check-out Form', included: true },
    { title: 'HMO Additional Terms', included: facts.is_hmo },
    { title: 'Rent Review Schedule', included: true },
    { title: 'Maintenance Request Form', included: true },
    { title: 'Notice Templates Pack', included: true },
  ].filter(d => d.included);

  const hasBlockers = validation.blockers.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  // Build summary from facts
  const tenantNames = facts.tenant_names || facts.tenant_1_name || 'Not specified';
  const propertyAddress = facts.property_address || facts.property_full_address || 'Not specified';
  const rentAmount = facts.rent_amount || facts.monthly_rent;
  const rentFrequency = facts.rent_frequency || 'monthly';
  const depositAmount = facts.deposit_amount;
  const startDate = facts.tenancy_start_date || facts.start_date;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <h1 className="text-3xl font-bold text-gray-900">Tenancy Agreement Review</h1>
        <p className="text-gray-600 mt-2">
          {jurisdictionLabel} • {terminology.agreementType}
          {isPremium && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">Premium</span>}
        </p>
        <div className="mt-4">
          {hasBlockers ? (
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 font-medium">
              <RiErrorWarningLine className="w-4 h-4 mr-2" />
              Issues to Fix
            </span>
          ) : hasWarnings ? (
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-medium">
              <RiInformationLine className="w-4 h-4 mr-2" />
              Warnings to Review
            </span>
          ) : (
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 font-medium">
              <RiCheckboxCircleLine className="w-4 h-4 mr-2" />
              Ready to Generate
            </span>
          )}
        </div>
      </div>

      {/* Blockers */}
      {hasBlockers && (
        <Card className="border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2 mb-4">
            <RiErrorWarningLine className="w-5 h-5" />
            Required Information Missing
          </h2>
          <p className="text-red-700 text-sm mb-4">
            Please go back and complete these required fields:
          </p>
          <ul className="space-y-3">
            {validation.blockers.map((blocker, index) => (
              <li key={index} className="flex items-start gap-3 bg-white p-4 rounded border border-red-100">
                <RiCloseLine className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-900">{blocker.title}</p>
                  <p className="text-sm text-red-700 mt-1">{blocker.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Agreement Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RiFileTextLine className="w-5 h-5 text-[#7C3AED]" />
          Agreement Summary
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Property Address</p>
            <p className="text-sm font-medium text-gray-900">{propertyAddress}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">{terminology.tenantLabel.charAt(0).toUpperCase() + terminology.tenantLabel.slice(1)}(s)</p>
            <p className="text-sm font-medium text-gray-900">{tenantNames}</p>
          </div>
          {rentAmount && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Rent</p>
              <p className="text-sm font-medium text-gray-900">
                £{Number(rentAmount).toLocaleString('en-GB', { minimumFractionDigits: 2 })} {rentFrequency}
              </p>
            </div>
          )}
          {depositAmount && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Deposit</p>
              <p className="text-sm font-medium text-gray-900">
                £{Number(depositAmount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {startDate && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Pre-Tenancy Checklist */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RiShieldCheckLine className="w-5 h-5 text-[#7C3AED]" />
          Pre-Tenancy Checklist for {jurisdictionLabel}
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Before the tenancy starts, ensure you have completed these legal requirements:
        </p>
        <div className="space-y-4">
          {obligations.filter(o => o.title.toLowerCase().includes('before')).map((section, index) => (
            <div key={index} className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* Warnings */}
      {hasWarnings && (
        <Card className="border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2 mb-4">
            <RiInformationLine className="w-5 h-5" />
            Things to Note
          </h2>
          <ul className="space-y-3">
            {validation.warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-3 bg-white p-4 rounded border border-amber-100">
                <RiErrorWarningLine className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-amber-900">{warning.title}</p>
                  <p className="text-sm text-amber-700 mt-1">{warning.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Landlord Obligations Reminder */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <RiInformationLine className="w-5 h-5 text-[#7C3AED]" />
          Your Obligations as a Landlord in {jurisdictionLabel}
        </h2>
        <div className="space-y-6">
          {obligations.map((section, index) => (
            <div key={index}>
              <h3 className="font-medium text-blue-800 mb-2">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.slice(0, 4).map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-blue-700 flex items-start gap-2">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
                {section.items.length > 4 && (
                  <li className="text-sm text-blue-600 italic ml-4">
                    + {section.items.length - 4} more items in your pack
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-700 mt-4 pt-4 border-t border-blue-200">
          Your pack includes a comprehensive landlord obligations checklist specific to {jurisdictionLabel}.
        </p>
      </Card>

      {/* Documents in Pack */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RiFileTextLine className="w-5 h-5 text-[#7C3AED]" />
          Documents in Your Pack
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Standard Documents</h3>
            <ul className="space-y-2">
              {standardDocs.map((doc, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <RiCheckboxCircleLine className="w-4 h-4 text-[#7C3AED]" />
                  {doc.title}
                </li>
              ))}
            </ul>
          </div>
          {isPremium && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                Premium Documents
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">Premium</span>
              </h3>
              <ul className="space-y-2">
                {premiumDocs.map((doc, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <RiCheckboxCircleLine className="w-4 h-4 text-purple-600" />
                    {doc.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-gray-600">
            Price: <span className="font-semibold text-gray-900">{isPremium ? '£14.99' : '£9.99'}</span>
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button onClick={onEdit} variant="outline" className="flex-1">
          Go back &amp; edit answers
        </Button>
        <Button onClick={onProceed} className="flex-1" disabled={hasBlockers || isRegenerating || isLoadingPaymentStatus}>
          {isLoadingPaymentStatus
            ? 'Loading...'
            : isRegenerating
              ? 'Regenerating...'
              : hasBlockers
                ? 'Fix issues to proceed'
                : isPaid
                  ? 'Regenerate pack'
                  : 'Proceed to payment & pack'}
        </Button>
      </div>

      {hasBlockers && !isPaid && (
        <p className="text-center text-sm text-gray-500 pb-4">
          Please complete all required fields before generating your tenancy agreement.
        </p>
      )}
      {isPaid && (
        <p className="text-center text-sm text-gray-500 pb-4">
          Your updated answers will be used to regenerate your documents.
        </p>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ReviewPageInner />
    </Suspense>
  );
}
