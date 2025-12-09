'use client';

import React from 'react';
import { UploadField, EvidenceFileSummary } from '@/components/wizard/fields/UploadField';

type Jurisdiction = 'england-wales' | 'scotland';

interface SectionProps {
  facts: any;
  caseId: string;
  jurisdiction: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const EvidenceSection: React.FC<SectionProps> = ({
  facts,
  caseId,
  jurisdiction,
  onUpdate,
}) => {
  const evidence = facts.evidence || {};
  const existingFiles: EvidenceFileSummary[] = evidence.files || [];

  const handleFilesChange = (files: EvidenceFileSummary[]) => {
    onUpdate({
      evidence: {
        ...evidence,
        files: files,
      },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Upload documents that support your claim. You don’t have to upload everything now, but the
        arrears schedule or ledger is strongly recommended.
      </p>

      <UploadField
        caseId={caseId}
        questionId="upload_rent_schedule"
        label="Upload rent schedule or ledger"
        description="A spreadsheet or ledger showing how the arrears build up over time."
        evidenceCategory="rent_schedule"
        required={false}
        value={existingFiles.filter((f) => f.category === 'rent_schedule')}
        onChange={handleFilesChange}
      />

      <UploadField
        caseId={caseId}
        questionId="upload_tenancy_agreement"
        label="Tenancy agreement"
        description="The signed tenancy agreement or most recent variation."
        evidenceCategory="tenancy_agreement"
        required={false}
        value={existingFiles.filter((f) => f.category === 'tenancy_agreement')}
        onChange={handleFilesChange}
      />
    </div>
  );
};
