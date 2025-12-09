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
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        This is a high-level review step. You’ll get a detailed Ask Heaven analysis and full document
        bundle generation after completing the wizard.
      </p>

      <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
        <p>
          <span className="font-semibold">Case ID:</span> {caseId}
        </p>
        <p>
          <span className="font-semibold">Jurisdiction:</span> {jurisdiction}
        </p>
      </div>

      <p className="text-sm text-gray-600">
        Once you’re happy with the information provided in the earlier sections, continue to generate
        your pre-action and claim packs.
      </p>
    </div>
  );
};
