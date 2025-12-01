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
  const hasStartedRef = useRef(false);

  const type = searchParams.get('type') as 'eviction' | 'money_claim' | 'tenancy_agreement' | null;
  const jurisdiction = searchParams.get('jurisdiction') as 'england-wales' | 'scotland' | 'northern-ireland' | null;
  const product = searchParams.get('product'); // Specific product (notice_only, complete_pack, etc.)
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

    try {
      if (editCaseId) {
        setCaseId(editCaseId);
        return;
      }

      const productParam = normalizedProduct || product || type || 'tenancy_agreement';
      const response = await fetch('/api/wizard/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productParam, jurisdiction }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to start wizard: ${response.status}`);
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
  }, [editCaseId, jurisdiction, normalizedProduct, product, type]);

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
    // Navigate to preview/checkout page
    router.push(`/wizard/preview/${completedCaseId}`);
  };

  // Use structured wizard for tenancy agreements and money claims
  if (type === 'tenancy_agreement' || type === 'money_claim') {
    if (loading || !caseId) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Initializing wizard...</p>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading wizard...</p>
        </div>
      </div>
    }>
      <WizardFlowContent />
    </Suspense>
  );
}
