'use client';

import React from 'react';

type Jurisdiction = 'england-wales' | 'scotland';

interface SectionProps {
  facts: any;
  caseId: string;
  jurisdiction: Jurisdiction;
}

export const ReviewSection: React.FC<SectionProps> = ({
  facts,
  caseId,
  jurisdiction,
}) => {
  const hasAnyFacts =
    facts && typeof facts === 'object' && Object.keys(facts).length > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        This is a high-level review step. You’ll get a detailed Ask Heaven
        analysis and full document bundle generation after completing the wizard.
      </p>

      <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
        <p>
          <span className="font-semibold">Case ID:</span> {caseId}
        </p>
        <p>
          <span className="font-semibold">Jurisdiction:</span> {jurisdiction}
        </p>
      </div>

      {hasAnyFacts && (
        <div className="space-y-2 rounded-md border border-gray-100 bg-white p-3 text-xs text-gray-600">
          <p className="font-semibold text-gray-700">
            Wizard data captured so far
          </p>
          <p>
            We&apos;ve captured structured information for this case across the
            earlier sections. You can go back to edit any section before
            generating your documents.
          </p>
          <details className="mt-1">
            <summary className="cursor-pointer text-[11px] text-gray-500">
              Technical view (for support / troubleshooting)
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-2 text-[11px]">
              {JSON.stringify(facts, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <p className="text-sm text-gray-600">
        Once you’re happy with the information provided in the earlier sections,
        continue to generate your pre-action and claim packs.
      </p>
    </div>
  );
};
