/**
 * Wizard Flow Page
 *
 * The main structured wizard experience
 * Receives document type and jurisdiction from URL params
 */

'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StructuredWizard } from '@/components/wizard/StructuredWizard';
import { MoneyClaimSectionFlow } from '@/components/wizard/flows/MoneyClaimSectionFlow';
import { EvictionSectionFlow } from '@/components/wizard/flows/EvictionSectionFlow';
import { NoticeOnlySectionFlow } from '@/components/wizard/flows/NoticeOnlySectionFlow';
import { TenancySectionFlow } from '@/components/wizard/flows/TenancySectionFlow';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';

// Feature flags: Use new section-based flows
// Set to true to enable the redesigned wizards, false to use legacy StructuredWizard
const USE_EVICTION_SECTION_FLOW = true;
const USE_NOTICE_ONLY_SECTION_FLOW = true;
const USE_TENANCY_SECTION_FLOW = true;

type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement';
type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland' | null;
type AskHeavenProduct = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';

function WizardFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [caseId, setCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialQuestion, setInitialQuestion] = useState<ExtendedWizardQuestion | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  const type = searchParams.get('type') as CaseType | null;
  const jurisdiction = searchParams.get('jurisdiction') as Jurisdiction;
  const product = searchParams.get('product'); // Specific product (notice_only, complete_pack, etc.)
  const productVariant = searchParams.get('product_variant'); // e.g. money_claim_england_wales
  const editCaseId = searchParams.get('case_id'); // Case ID to edit
  const mode = searchParams.get('mode');
  const jumpTo = searchParams.get('jump_to'); // Question ID to jump to (from End Validator "Fix this" button)
  const fixMode = searchParams.get('fix_mode') === 'true'; // Single-question fix mode (returns to validation after save)

  const hasRequiredParams = Boolean(type && jurisdiction);

  useEffect(() => {
    if (!hasRequiredParams) {
      router.push('/wizard');
    }
  }, [hasRequiredParams, router]);

  // Normalize product for Ask Heaven / wizard
  const normalizedProduct = product;

  // Derive a coarse product label for Ask Heaven (its Product union)
  const askHeavenProduct: AskHeavenProduct | null = (() => {
    if (!type) return null;

    if (type === 'money_claim') return 'money_claim';
    if (type === 'tenancy_agreement') return 'tenancy_agreement';

    if (type === 'eviction') {
      // For eviction flows, we treat Ask Heaven product as either notice_only or complete_pack
      if (normalizedProduct === 'notice_only') return 'notice_only';
      return 'complete_pack';
    }

    return null;
  })();

  // Initialize case for structured wizard / section flows
  const startStructuredWizard = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (!type || !jurisdiction) return;

    setLoading(true);
    setStartError(null);

    try {
      // Resume existing case if editing
      if (editCaseId) {
        setCaseId(editCaseId);
        setLoading(false);
        return;
      }

      // Prefer product_variant (from product page) then product, then sensible defaults
      const rawProduct = productVariant || product;

      let startProduct: string;

      if (type === 'money_claim') {
        // Money claim flows: use money_claim product
        startProduct = rawProduct === 'money_claim' ? rawProduct : 'money_claim';
      } else if (type === 'tenancy_agreement') {
        // Tenancy flows: keep AST tiers if provided
        if (
          rawProduct === 'ast_standard' ||
          rawProduct === 'ast_premium' ||
          rawProduct === 'tenancy_agreement'
        ) {
          startProduct = rawProduct;
        } else {
          startProduct = 'tenancy_agreement';
        }
      } else if (type === 'eviction') {
        // Eviction flows: honour notice_only / complete_pack explicitly
        if (rawProduct === 'notice_only' || rawProduct === 'complete_pack') {
          startProduct = rawProduct;
        } else {
          // Sensible default if someone deep-links without a product
          startProduct = 'complete_pack';
        }
      } else {
        // Fallback for any other future types
        startProduct = rawProduct || type || 'tenancy_agreement';
      }

      const response = await fetch('/api/wizard/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: startProduct, jurisdiction }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || `Failed to start wizard: ${response.status}`;
        setStartError(message);
        throw new Error(message);
      }

      const newCaseId = data.case_id ?? data.case?.id;
      if (!newCaseId) {
        throw new Error('Missing case_id from start response');
      }

      setCaseId(newCaseId);
      setInitialQuestion(data.next_question ?? null);
    } catch (err) {
      console.error('Failed to initialize case:', err);
    } finally {
      setLoading(false);
    }
  }, [editCaseId, jurisdiction, product, productVariant, type]);

  useEffect(() => {
    if (!hasRequiredParams) {
      setLoading(false);
      return;
    }

    // All supported case types now use structured / section flows
    if (type === 'tenancy_agreement' || type === 'money_claim' || type === 'eviction') {
      void startStructuredWizard();
    } else if (editCaseId) {
      setCaseId(editCaseId);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [editCaseId, hasRequiredParams, startStructuredWizard, type]);

  // Validate params
  if (!hasRequiredParams) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid parameters. Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleComplete = (completedCaseId: string) => {
    // For eviction cases, all products now go through the review page for analysis
    if (type === 'eviction') {
      const productParam = askHeavenProduct ?? 'complete_pack';
      router.push(`/wizard/review?case_id=${completedCaseId}&product=${productParam}`);
      return;
    }

    // For money claim cases, go to review page (same as eviction complete_pack flow)
    if (type === 'money_claim') {
      router.push(`/wizard/review?case_id=${completedCaseId}&product=money_claim`);
      return;
    }

    // Navigate to preview/checkout page for other case types (tenancy agreements)
    router.push(`/wizard/preview/${completedCaseId}`);
  };

  // Show loading state while initializing
  if (loading || !caseId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Initializing wizard...</p>
          {startError ? (
            <p className="text-sm text-red-600 text-center max-w-md">{startError}</p>
          ) : null}
        </div>
      </div>
    );
  }

  // 🟦 NEW: For money_claim, use the section-based premium flow
  if (type === 'money_claim') {
    // We support money claims for England, Wales, and Scotland
    return (
      <MoneyClaimSectionFlow
        caseId={caseId}
        jurisdiction={jurisdiction as 'england' | 'wales' | 'scotland'}
      />
    );
  }

  // 🟩 NEW: For eviction complete_pack in England/Wales, use the redesigned section-based flow
  // This provides a logical, court-ready, jurisdiction-aware wizard experience.
  if (
    type === 'eviction' &&
    askHeavenProduct === 'complete_pack' &&
    USE_EVICTION_SECTION_FLOW &&
    (jurisdiction === 'england' || jurisdiction === 'wales')
  ) {
    return (
      <EvictionSectionFlow
        caseId={caseId}
        jurisdiction={jurisdiction as 'england' | 'wales'}
      />
    );
  }

  // 🟨 NEW: For eviction notice_only in England/Wales, use the redesigned section-based flow
  // This matches the EvictionSectionFlow design for UI consistency.
  if (
    type === 'eviction' &&
    askHeavenProduct === 'notice_only' &&
    USE_NOTICE_ONLY_SECTION_FLOW &&
    (jurisdiction === 'england' || jurisdiction === 'wales')
  ) {
    return (
      <NoticeOnlySectionFlow
        caseId={caseId}
        jurisdiction={jurisdiction as 'england' | 'wales'}
      />
    );
  }

  // 🟪 NEW: For tenancy_agreement in England/Wales, use the redesigned section-based flow
  // This provides a consistent tab-based UI matching MoneyClaimSectionFlow design.
  if (
    type === 'tenancy_agreement' &&
    USE_TENANCY_SECTION_FLOW &&
    (jurisdiction === 'england' || jurisdiction === 'wales')
  ) {
    return (
      <TenancySectionFlow
        caseId={caseId}
        jurisdiction={jurisdiction as 'england' | 'wales'}
        product={
          normalizedProduct === 'ast_standard' || normalizedProduct === 'ast_premium'
            ? normalizedProduct
            : 'tenancy_agreement'
        }
      />
    );
  }

  // Use existing StructuredWizard for Scotland/NI tenancy agreements and Scotland eviction flows
  if (type === 'tenancy_agreement' || type === 'eviction') {
    return (
      <StructuredWizard
        caseId={caseId}
        caseType={type}
        jurisdiction={jurisdiction}
        product={
          askHeavenProduct ??
          (type === 'tenancy_agreement'
            ? 'tenancy_agreement'
            : 'complete_pack')
        }
        initialQuestion={initialQuestion ?? undefined}
        onComplete={handleComplete}
        mode={mode === 'edit' ? 'edit' : 'default'}
        jumpToQuestionId={jumpTo ?? undefined}
        fixMode={fixMode}
      />
    );
  }

  // Fallback – should rarely be hit with current routing
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Unsupported case type.</p>
      </div>
    </div>
  );
}

export default function WizardFlowPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading wizard...</p>
          </div>
        </div>
      }
    >
      <WizardFlowContent />
    </Suspense>
  );
}
