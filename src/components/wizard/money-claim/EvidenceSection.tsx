'use client';

import React, { useMemo } from 'react';
import {
  RiAlertLine,
  RiCheckboxCircleLine,
  RiFileListLine,
  RiInformationLine,
  RiLightbulbLine,
} from 'react-icons/ri';
import {
  buildMoneyClaimEvidenceSummary,
  calculateMoneyClaimEvidenceStrength,
  getMoneyClaimSelectedClaimTypes,
  getVisibleMoneyClaimEvidenceCategories,
  normalizeMoneyClaimEvidenceItems,
  type MoneyClaimEvidenceCategory,
  type MoneyClaimEvidenceItem,
} from '@/lib/money-claim/evidence-checklist';

interface SectionProps {
  facts: any;
  caseId: string;
  jurisdiction?: string;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

interface LegacyEvidenceFileSummary {
  id?: string;
  fileName?: string;
  name?: string;
  category?: string;
}

const STRENGTH_STYLES = {
  weak: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    text: 'text-red-900',
    muted: 'text-red-700',
  },
  fair: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    muted: 'text-amber-700',
  },
  strong: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-900',
    muted: 'text-green-700',
  },
} as const;

function getLegacyFileName(file: LegacyEvidenceFileSummary): string {
  return file.fileName || file.name || 'Uploaded evidence';
}

function mergeChecklistItems(
  categories: MoneyClaimEvidenceCategory[],
  savedItems: MoneyClaimEvidenceItem[],
  legacyFileCategories: Set<string>
): MoneyClaimEvidenceItem[] {
  const savedByType = new Map(savedItems.map((item) => [item.type, item]));

  return categories.map((category) => {
    const saved = savedByType.get(category.id);
    return {
      type: category.id,
      label: category.label,
      available: saved?.available === true || legacyFileCategories.has(category.id),
      description: saved?.description || '',
    };
  });
}

export const EvidenceSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const evidence = facts.evidence || {};
  const existingFiles: LegacyEvidenceFileSummary[] = evidence.files || [];
  const legacyFileCategories = useMemo(
    () => new Set(existingFiles.map((file) => file.category).filter((category): category is string => Boolean(category))),
    [existingFiles]
  );

  const selectedClaimTypes = useMemo(() => getMoneyClaimSelectedClaimTypes(facts), [facts]);
  const visibleCategories = useMemo(
    () => getVisibleMoneyClaimEvidenceCategories(selectedClaimTypes),
    [selectedClaimTypes]
  );
  const savedItems = useMemo(
    () =>
      normalizeMoneyClaimEvidenceItems(
        facts.money_claim?.evidence_items,
        facts.money_claim?.evidence_types_available
      ),
    [facts.money_claim?.evidence_items, facts.money_claim?.evidence_types_available]
  );
  const checklistItems = useMemo(
    () => mergeChecklistItems(visibleCategories, savedItems, legacyFileCategories),
    [visibleCategories, savedItems, legacyFileCategories]
  );
  const selectedItems = checklistItems.filter((item) => item.available);
  const recommendedCategories = visibleCategories.filter((category) => category.recommended);
  const optionalCategories = visibleCategories.filter((category) => !category.recommended);
  const evidenceStrength = calculateMoneyClaimEvidenceStrength(
    selectedClaimTypes,
    checklistItems,
    visibleCategories
  );
  const strengthStyle = STRENGTH_STYLES[evidenceStrength.level];

  const persistChecklist = (nextItems: MoneyClaimEvidenceItem[]) => {
    const evidenceTypesAvailable = nextItems
      .filter((item) => item.available)
      .map((item) => item.type);

    onUpdate({
      money_claim: {
        ...(facts.money_claim || {}),
        evidence_items: nextItems,
        evidence_types_available: evidenceTypesAvailable,
        evidence_summary: buildMoneyClaimEvidenceSummary(nextItems),
      },
      evidence_reviewed: true,
    });
  };

  const updateItem = (
    category: MoneyClaimEvidenceCategory,
    changes: Partial<MoneyClaimEvidenceItem>
  ) => {
    const nextItems = checklistItems.map((item) =>
      item.type === category.id
        ? {
            ...item,
            label: category.label,
            ...changes,
          }
        : item
    );
    persistChecklist(nextItems);
  };

  const markAsReviewed = () => {
    persistChecklist(checklistItems);
  };

  const selectedClaimLabels = Array.from(selectedClaimTypes).map((type) => {
    const labels: Record<string, string> = {
      rent_arrears: 'rent arrears',
      property_damage: 'property damage',
      cleaning: 'cleaning costs',
      unpaid_utilities: 'unpaid utilities',
      unpaid_council_tax: 'unpaid council tax',
      other_tenant_debt: 'other debt',
    };
    return labels[type] || type;
  });

  const renderCategoryCard = (category: MoneyClaimEvidenceCategory) => {
    const item = checklistItems.find((currentItem) => currentItem.type === category.id);
    const checked = item?.available === true;

    return (
      <div
        key={category.id}
        className={`rounded-lg border p-4 transition-colors ${
          checked ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
        }`}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => updateItem(category, { available: event.target.checked })}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="flex-1">
            <span className="flex items-center gap-2 text-sm font-medium text-charcoal">
              {checked && <RiCheckboxCircleLine className="h-5 w-5 text-green-600" />}
              {category.label}
              {category.recommended && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                  Recommended
                </span>
              )}
            </span>
            <span className="mt-1 block text-xs text-gray-600">{category.description}</span>
          </span>
        </label>

        {category.tips && category.tips.length > 0 && (
          <div className="mt-3 border-l-2 border-purple-200 pl-4">
            <p className="mb-1 text-xs font-medium text-purple-700">Useful detail to mention:</p>
            <ul className="space-y-0.5 text-xs text-purple-600">
              {category.tips.map((tip) => (
                <li key={tip}>- {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {checked && (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-gray-700" htmlFor={`evidence_${category.id}`}>
              What does this evidence show?
            </label>
            <textarea
              id={`evidence_${category.id}`}
              value={item?.description || ''}
              onChange={(event) => updateItem(category, { description: event.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="For example: signed AST dated 1 May 2024, or rent ledger showing missed payments from January to March."
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <RiInformationLine className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">No upload needed at this stage</p>
            <p className="mt-1 text-sm text-blue-800">
              Tick the evidence you already have and briefly say what it shows. We will use this
              to strengthen the claim wording without pretending we have checked the documents.
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-lg border p-4 ${strengthStyle.border} ${strengthStyle.bg}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-sm font-semibold ${strengthStyle.text}`}>
              Evidence strength: {evidenceStrength.label}
            </p>
            <p className={`mt-1 text-sm ${strengthStyle.muted}`}>{evidenceStrength.summary}</p>
            <p className={`mt-2 text-xs ${strengthStyle.muted}`}>
              {evidenceStrength.selectedRecommended} of {evidenceStrength.totalRecommended} recommended
              evidence categories selected.
            </p>
          </div>
          <button
            type="button"
            onClick={markAsReviewed}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Mark reviewed
          </button>
        </div>
      </div>

      {selectedClaimTypes.size > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-2">
            <RiFileListLine className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-charcoal">Evidence tailored to your claim</p>
              <p className="mt-1 text-xs text-gray-600">
                Based on your selections, we are showing evidence for: {selectedClaimLabels.join(', ')}.
              </p>
            </div>
          </div>
        </div>
      )}

      {evidenceStrength.missingRecommendedLabels.length > 0 && selectedClaimTypes.size > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <RiLightbulbLine className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Evidence that would strengthen this claim</p>
              <p className="mt-1 text-sm text-amber-800">
                If you have any of these, tick them below and describe them:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-amber-900">
                {evidenceStrength.missingRecommendedLabels.map((label) => (
                  <li key={label} className="flex items-start gap-2">
                    <RiAlertLine className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {recommendedCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Recommended evidence
          </h3>
          {recommendedCategories.map(renderCategoryCard)}
        </div>
      )}

      {optionalCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600">Additional evidence</h3>
          {optionalCategories.map(renderCategoryCard)}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-900">Selected evidence summary</p>
          <ul className="mt-2 space-y-2 text-sm text-green-800">
            {selectedItems.map((item) => (
              <li key={item.type}>
                <span className="font-medium">{item.label}</span>
                {item.description ? <span>: {item.description}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {existingFiles.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900">Previously uploaded files</p>
          <p className="mt-1 text-xs text-gray-600">
            These are still kept for older cases, but new claims can use the checklist above.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            {existingFiles.map((file, index) => (
              <li key={file.id || `${getLegacyFileName(file)}-${index}`}>
                {getLegacyFileName(file)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedClaimTypes.size === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Please go back to <strong>What you&apos;re claiming</strong> and select what you want to
            claim for. The evidence checklist will then narrow down to the relevant items.
          </p>
        </div>
      )}
    </div>
  );
};
