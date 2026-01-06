'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type Jurisdiction = 'england' | 'wales' | 'scotland';

interface SectionProps {
  // We don't currently use facts in this section, so make it optional
  facts?: any;
  caseId: string;
  jurisdiction: Jurisdiction;
}

export const ReviewSection: React.FC<SectionProps> = ({
  caseId,
  jurisdiction,
}) => {
  const router = useRouter();
  const [previewing, setPreviewing] = useState(false);

  const handlePreview = async () => {
    try {
      setPreviewing(true);
      // Open the HTML preview in a new tab/window
      window.open(
        `/api/money-claim/preview/${encodeURIComponent(caseId)}`,
        '_blank'
      );
    } finally {
      setPreviewing(false);
    }
  };

  const handleProceedToReview = () => {
    // Navigate to the full review page with analysis
    router.push(`/wizard/review?case_id=${caseId}&product=money_claim`);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        You've completed all the required sections. Before you purchase your pack,
        we'll analyse your case against the Pre-Action Protocol for Debt Claims
        and show you any issues that need attention.
      </p>

      <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
        <p>
          <span className="font-semibold">Case ID:</span> {caseId}
        </p>
        <p>
          <span className="font-semibold">Jurisdiction:</span>{' '}
          {jurisdiction === 'scotland'
            ? 'Scotland (Simple Procedure)'
            : jurisdiction === 'wales'
            ? 'Wales'
            : 'England'}
        </p>
      </div>

      {/* Ask Heaven Features Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-3xl mr-3">☁️</div>
          <div>
            <h4 className="font-semibold text-charcoal mb-1">
              Ask Heaven Legal Drafting Included
            </h4>
            <p className="text-sm text-gray-600">
              Your Particulars of Claim and Letter Before Action will be professionally
              drafted by Ask Heaven, saving you £300-600 in solicitor fees.
            </p>
          </div>
        </div>
      </div>

      {/* What's included summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Your pack will include:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {jurisdiction === 'scotland' ? (
            <>
              <li>• Form 3A - Simple Procedure Claim Form</li>
              <li>• Particulars of Claim (AI-drafted)</li>
              <li>• Schedule of Arrears</li>
              <li>• Interest Calculation</li>
              <li>• Pre-Action Letter</li>
              <li>• Filing Guide</li>
            </>
          ) : (
            <>
              <li>• Form N1 - Money Claim Form (official PDF)</li>
              <li>• Particulars of Claim (AI-drafted)</li>
              <li>• Schedule of Arrears</li>
              <li>• Interest Calculation</li>
              <li>• Letter Before Claim (PAP-DEBT compliant)</li>
              <li>• Information Sheet for Defendants</li>
              <li>• Reply Form & Financial Statement Form</li>
              <li>• Evidence Index</li>
              <li>• Court Filing Guide</li>
              <li>• Enforcement Guide</li>
            </>
          )}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={previewing}
          className="inline-flex items-center rounded-md border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
        >
          {previewing ? 'Preparing preview…' : 'Preview draft documents'}
        </button>

        <button
          type="button"
          onClick={handleProceedToReview}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Continue to Full Analysis
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        The full analysis will check your case against PAP-DEBT requirements and
        highlight any issues before you proceed to payment.
      </p>
    </div>
  );
};
