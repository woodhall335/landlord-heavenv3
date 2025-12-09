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
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';

type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement';
type Jurisdiction = 'england-wales' | 'scotland' | 'northern-ireland' | null;
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

  const hasRequiredParams = Boolean(type && jurisdiction);

  useEffect(() => {
    if (!hasRequiredParams) {
      router.push('/wizard');
    }
  }, [hasRequiredParams, router]);

  // Normalise money-claim product variants to a single Ask Heaven / wizard product label
  const normalizedProduct =
    type === 'money_claim' &&
    (product === 'money_claim_england_wales' || product === 'money_claim_scotland')
      ? 'money_claim'
      : product;

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
        return;
      }

      // Prefer product_variant (from product page) then product, then sensible defaults
      const rawProduct = productVariant || product;

      let startProduct: string;

      if (type === 'money_claim') {
        // Money-claim flows: honour specific product variants first
        if (
          rawProduct === 'money_claim_england_wales' ||
          rawProduct === 'money_claim_scotland' ||
          rawProduct === 'money_claim'
        ) {
          startProduct = rawProduct;
        } else {
          startProduct = 'money_claim';
        }
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
    // For eviction cases, route through review page for analysis
    if (type === 'eviction') {
      router.push(`/wizard/review?case_id=${completedCaseId}`);
    } else {
      // Navigate to preview/checkout page for other case types
      router.push(`/wizard/preview/${completedCaseId}`);
    }
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
    // We only support money claims for England & Wales + Scotland
    const sectionJurisdiction =
      jurisdiction === 'england-wales' || jurisdiction === 'scotland'
        ? jurisdiction
        : 'england-wales';

    return (
      <MoneyClaimSectionFlow
        caseId={caseId}
        jurisdiction={sectionJurisdiction}
      />
    );
  }

  // Use existing StructuredWizard for tenancy agreements and evictions
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
