'use client';

import React, { useMemo } from 'react';
import { RiCheckboxCircleLine, RiInformationLine } from 'react-icons/ri';
import { UploadField, EvidenceFileSummary } from '@/components/wizard/fields/UploadField';

interface SectionProps {
  facts: any;
  caseId: string;
  jurisdiction?: string;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

/**
 * Evidence category definition with conditional visibility
 */
interface EvidenceCategory {
  id: string;
  label: string;
  description: string;
  /** Which claim types require this evidence */
  requiredFor: Array<'rent_arrears' | 'property_damage' | 'cleaning' | 'unpaid_utilities' | 'unpaid_council_tax' | 'other_tenant_debt' | 'all'>;
  /** Whether this is strongly recommended vs optional */
  recommended?: boolean;
  /** Tips for this evidence type */
  tips?: string[];
}

const EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  {
    id: 'tenancy_agreement',
    label: 'Tenancy agreement',
    description: 'The signed tenancy agreement or most recent variation. This proves the contractual relationship.',
    requiredFor: ['all'],
    recommended: true,
    tips: [
      'Include any variations or addendums',
      'Ensure all pages are legible',
    ],
  },
  {
    id: 'rent_schedule',
    label: 'Rent schedule / arrears ledger',
    description: 'A spreadsheet or ledger showing rent due, payments received, and running balance over time.',
    requiredFor: ['rent_arrears'],
    recommended: true,
    tips: [
      'Show each payment period clearly',
      'Include dates and amounts for all transactions',
      'The court needs to see how arrears accumulated',
    ],
  },
  {
    id: 'bank_statements',
    label: 'Bank statements',
    description: 'Bank statements showing missed or partial rent payments.',
    requiredFor: ['rent_arrears'],
    tips: [
      'Highlight relevant transactions',
      'Redact unrelated personal information',
    ],
  },
  {
    id: 'demand_letters',
    label: 'Rent demand letters',
    description: 'Copies of any rent demand letters or reminders sent to the tenant.',
    requiredFor: ['rent_arrears'],
    tips: [
      'Include proof of posting or email delivery',
    ],
  },
  {
    id: 'property_photos_before',
    label: 'Check-in photos / inventory',
    description: 'Photos or inventory report from the start of the tenancy showing the condition of the property.',
    requiredFor: ['property_damage', 'cleaning'],
    recommended: true,
    tips: [
      'Dated photos are best',
      'Professional inventory reports carry more weight',
    ],
  },
  {
    id: 'property_photos_after',
    label: 'Check-out photos / damage photos',
    description: 'Photos showing the damage or condition at the end of tenancy.',
    requiredFor: ['property_damage', 'cleaning'],
    recommended: true,
    tips: [
      'Take photos from multiple angles',
      'Include close-ups of specific damage',
      'Ensure photos are clearly dated',
    ],
  },
  {
    id: 'repair_quotes',
    label: 'Repair quotes / invoices',
    description: 'Quotes or invoices for repair work needed to fix the damage.',
    requiredFor: ['property_damage'],
    recommended: true,
    tips: [
      'Get at least 2 quotes if possible',
      'Itemise costs clearly',
    ],
  },
  {
    id: 'cleaning_invoice',
    label: 'Cleaning quotes / invoices',
    description: 'Professional cleaning quotes or invoices for end-of-tenancy clean.',
    requiredFor: ['cleaning'],
    recommended: true,
    tips: [
      'Include before/after photos if available',
      'Itemise specific cleaning tasks',
    ],
  },
  {
    id: 'utility_bills',
    label: 'Utility bills',
    description: 'Utility bills in your name showing amounts owed by the tenant.',
    requiredFor: ['unpaid_utilities'],
    recommended: true,
    tips: [
      'Show the account is in your name',
      'Highlight the period and amounts relating to the tenancy',
    ],
  },
  {
    id: 'council_tax_bills',
    label: 'Council tax bills',
    description: 'Council tax bills and statements showing arrears during the tenancy period.',
    requiredFor: ['unpaid_council_tax'],
    recommended: true,
    tips: [
      'Include the tenancy agreement clause making tenant liable',
      'Show the periods when tenant was responsible',
    ],
  },
  {
    id: 'other_evidence',
    label: 'Other supporting documents',
    description: 'Any other documents that support your claim (e.g., correspondence, receipts, contracts).',
    requiredFor: ['other_tenant_debt', 'all'],
    tips: [
      'Include any written agreements about additional payments',
      'Keep correspondence showing the debt was acknowledged',
    ],
  },
  {
    id: 'letter_before_claim',
    label: 'Letter Before Claim',
    description: 'Copy of the Letter Before Claim (LBC) sent to the tenant, with proof of posting.',
    requiredFor: ['all'],
    recommended: true,
    tips: [
      'Include proof of posting (certificate of posting or tracked delivery)',
      'Keep a copy of the exact letter sent',
    ],
  },
];

/**
 * Get the claim types selected from facts
 */
function getSelectedClaimTypes(facts: any): Set<string> {
  const types = new Set<string>();

  if (facts.claiming_rent_arrears === true) {
    types.add('rent_arrears');
  }

  const otherTypes: string[] = facts.money_claim?.other_amounts_types || [];
  if (otherTypes.includes('property_damage') || facts.claiming_damages === true) {
    types.add('property_damage');
  }
  if (otherTypes.includes('cleaning')) {
    types.add('cleaning');
  }
  if (otherTypes.includes('unpaid_utilities')) {
    types.add('unpaid_utilities');
  }
  if (otherTypes.includes('unpaid_council_tax')) {
    types.add('unpaid_council_tax');
  }
  if (facts.claiming_other === true || otherTypes.includes('other_charges')) {
    types.add('other_tenant_debt');
  }

  return types;
}

/**
 * Check if an evidence category should be shown based on selected claim types
 */
function shouldShowCategory(category: EvidenceCategory, selectedTypes: Set<string>): boolean {
  // 'all' means always show
  if (category.requiredFor.includes('all')) {
    return true;
  }

  // Check if any of the required claim types are selected
  return category.requiredFor.some((type) => selectedTypes.has(type));
}

export const EvidenceSection: React.FC<SectionProps> = ({
  facts,
  caseId,
  onUpdate,
}) => {
  const evidence = facts.evidence || {};
  const existingFiles: EvidenceFileSummary[] = evidence.files || [];

  // Get selected claim types
  const selectedClaimTypes = useMemo(() => getSelectedClaimTypes(facts), [facts]);

  // Filter categories to show based on claim types
  const visibleCategories = useMemo(() => {
    return EVIDENCE_CATEGORIES.filter((cat) => shouldShowCategory(cat, selectedClaimTypes));
  }, [selectedClaimTypes]);

  // Group into recommended and optional
  const recommendedCategories = visibleCategories.filter((c) => c.recommended);
  const optionalCategories = visibleCategories.filter((c) => !c.recommended);

  // Count uploaded files per category
  const getFilesForCategory = (categoryId: string) => {
    return existingFiles.filter((f) => f.category === categoryId);
  };

  const handleFilesChange = (files: EvidenceFileSummary[]) => {
    onUpdate({
      evidence: {
        ...evidence,
        files,
      },
      // Mark evidence as reviewed when files are uploaded
      evidence_reviewed: true,
    });
  };

  // Mark as reviewed without uploading
  const markAsReviewed = () => {
    onUpdate({
      evidence_reviewed: true,
    });
  };

  // Summary of what's been uploaded
  const totalUploaded = existingFiles.length;
  const recommendedUploaded = recommendedCategories.filter(
    (c) => getFilesForCategory(c.id).length > 0
  ).length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Upload documents that support your claim. The evidence shown below is based on the
        claim types you selected. Strong evidence significantly improves your chances of success.
      </p>

      {/* Summary card */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-charcoal">
              Evidence uploaded: {totalUploaded} {totalUploaded === 1 ? 'file' : 'files'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {recommendedUploaded} of {recommendedCategories.length} recommended categories completed
            </p>
          </div>
          {totalUploaded === 0 && (
            <button
              type="button"
              onClick={markAsReviewed}
              className="text-xs text-primary hover:underline"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>

      {/* Claim-specific context */}
      {selectedClaimTypes.size > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <RiInformationLine className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Evidence tailored to your claim
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on your selections, we&apos;re showing evidence categories relevant to:{' '}
                {Array.from(selectedClaimTypes)
                  .map((t) => {
                    const labels: Record<string, string> = {
                      rent_arrears: 'rent arrears',
                      property_damage: 'property damage',
                      cleaning: 'cleaning costs',
                      unpaid_utilities: 'unpaid utilities',
                      unpaid_council_tax: 'unpaid council tax',
                      other_tenant_debt: 'other debt',
                    };
                    return labels[t] || t;
                  })
                  .join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommended evidence */}
      {recommendedCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Recommended Evidence
          </h3>

          {recommendedCategories.map((category) => {
            const categoryFiles = getFilesForCategory(category.id);
            const hasFiles = categoryFiles.length > 0;

            return (
              <div
                key={category.id}
                className={`rounded-lg border p-4 ${
                  hasFiles ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {hasFiles && (
                        <RiCheckboxCircleLine className="w-5 h-5 text-green-600" />
                      )}
                      <span className="text-sm font-medium text-charcoal">
                        {category.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>

                {category.tips && category.tips.length > 0 && (
                  <div className="mb-3 pl-4 border-l-2 border-purple-200">
                    <p className="text-xs font-medium text-purple-700 mb-1">Tips:</p>
                    <ul className="text-xs text-purple-600 space-y-0.5">
                      {category.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <UploadField
                  caseId={caseId}
                  questionId={`upload_${category.id}`}
                  jurisdiction="england"
                  label=""
                  description=""
                  evidenceCategory={category.id}
                  required={false}
                  value={categoryFiles}
                  onChange={handleFilesChange}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Optional evidence */}
      {optionalCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600">
            Additional Evidence (Optional)
          </h3>

          {optionalCategories.map((category) => {
            const categoryFiles = getFilesForCategory(category.id);
            const hasFiles = categoryFiles.length > 0;

            return (
              <div
                key={category.id}
                className={`rounded-lg border p-4 ${
                  hasFiles ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {hasFiles && (
                        <RiCheckboxCircleLine className="w-5 h-5 text-green-600" />
                      )}
                      <span className="text-sm font-medium text-charcoal">
                        {category.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>

                {category.tips && category.tips.length > 0 && (
                  <div className="mb-3 pl-4 border-l-2 border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Tips:</p>
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      {category.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <UploadField
                  caseId={caseId}
                  questionId={`upload_${category.id}`}
                  jurisdiction="england"
                  label=""
                  description=""
                  evidenceCategory={category.id}
                  required={false}
                  value={categoryFiles}
                  onChange={handleFilesChange}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* No claim types selected message */}
      {selectedClaimTypes.size === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Please go back to the <strong>Claim Details</strong> section and select what you&apos;re
            claiming for. The evidence requirements will update based on your selections.
          </p>
        </div>
      )}
    </div>
  );
};
