/**
 * Wizard Flow Page
 *
 * The main conversational wizard experience
 * Receives document type and jurisdiction from URL params
 */

'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WizardContainer } from '@/components/wizard/WizardContainer';
import { StructuredWizard } from '@/components/wizard/StructuredWizard';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';

function WizardFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [caseId, setCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialQuestion, setInitialQuestion] = useState<ExtendedWizardQuestion | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  const type = searchParams.get('type') as
    | 'eviction'
    | 'money_claim'
    | 'tenancy_agreement'
    | null;
  const jurisdiction = searchParams.get('jurisdiction') as
    | 'england-wales'
    | 'scotland'
    | 'northern-ireland'
    | null;
  const product = searchParams.get('product'); // Specific product (notice_only, complete_pack, etc.)
  const productVariant = searchParams.get('product_variant'); // e.g. money_claim_england_wales
  const normalizedProduct =
    type === 'money_claim' &&
    (product === 'money_claim_england_wales' || product === 'money_claim_scotland')
      ? 'money_claim'
      : product;
  const editCaseId = searchParams.get('case_id'); // Case ID to edit

  const hasRequiredParams = Boolean(type && jurisdiction);

  useEffect(() => {
    if (!hasRequiredParams) {
      router.push('/wizard');
    }
  }, [hasRequiredParams, router]);

  // Initialize case for structured wizard
  const startStructuredWizard = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (!type || !jurisdiction) return;

    setLoading(true);
    setStartError(null);

    try {
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

    if (type === 'tenancy_agreement' || type === 'money_claim') {
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

  // Use structured wizard for tenancy agreements and money claims
  if (type === 'tenancy_agreement' || type === 'money_claim') {
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

    return (
      <StructuredWizard
        caseId={caseId}
        caseType={type}
        jurisdiction={jurisdiction}
        initialQuestion={initialQuestion ?? undefined}
        onComplete={handleComplete}
      />
    );
  }

  // Use conversational wizard for evictions
  return (
    <WizardContainer
      caseType={type!}
      jurisdiction={jurisdiction!}
      product={normalizedProduct || undefined}
      editCaseId={editCaseId || undefined}
      onComplete={handleComplete}
    />
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
