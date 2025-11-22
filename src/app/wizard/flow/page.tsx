/**
 * Wizard Flow Page
 *
 * The main conversational wizard experience
 * Receives document type and jurisdiction from URL params
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WizardContainer } from '@/components/wizard/WizardContainer';

function WizardFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get('type') as 'eviction' | 'money_claim' | 'tenancy_agreement' | null;
  const jurisdiction = searchParams.get('jurisdiction') as 'england-wales' | 'scotland' | 'northern-ireland' | null;
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

  const handleComplete = (caseId: string, analysis: any) => {
    // Navigate to preview/checkout page
    router.push(`/wizard/preview/${caseId}`);
  };

  return (
    <WizardContainer
      caseType={type}
      jurisdiction={jurisdiction}
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
