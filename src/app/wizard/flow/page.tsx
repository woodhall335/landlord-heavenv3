/**
 * Wizard Flow Page
 *
 * The main conversational wizard experience
 * Receives document type and jurisdiction from URL params
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WizardContainer } from '@/components/wizard/WizardContainer';
import { StructuredWizard } from '@/components/wizard/StructuredWizard';

function WizardFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [caseId, setCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const type = searchParams.get('type') as 'eviction' | 'money_claim' | 'tenancy_agreement' | null;
  const jurisdiction = searchParams.get('jurisdiction') as 'england-wales' | 'scotland' | 'northern-ireland' | null;
  const product = searchParams.get('product'); // Specific product (notice_only, complete_pack, etc.)
  const editCaseId = searchParams.get('edit'); // Case ID to edit

  // Validate params
  if (!type || !jurisdiction) {
    router.push('/wizard');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid parameters. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Initialize case for structured wizard
  useEffect(() => {
    if (type === 'tenancy_agreement' && !editCaseId) {
      const initializeCase = async () => {
        try {
          const response = await fetch('/api/wizard/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ case_type: type, jurisdiction }),
          });

          if (response.ok) {
            const data = await response.json();
            setCaseId(data.case_id);
          }
        } catch (err) {
          console.error('Failed to initialize case:', err);
        } finally {
          setLoading(false);
        }
      };

      initializeCase();
    } else if (editCaseId) {
      setCaseId(editCaseId);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [type, jurisdiction, editCaseId]);

  const handleComplete = (completedCaseId: string) => {
    // Navigate to preview/checkout page
    router.push(`/wizard/preview/${completedCaseId}`);
  };

  // Use structured wizard for tenancy agreements
  if (type === 'tenancy_agreement') {
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
        onComplete={handleComplete}
      />
    );
  }

  // Use conversational wizard for evictions and money claims
  return (
    <WizardContainer
      caseType={type}
      jurisdiction={jurisdiction}
      product={product || undefined}
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
