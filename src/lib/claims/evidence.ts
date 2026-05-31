import type { ClaimEvidenceCategory, ClaimWizardAnswers } from './types';

export type EvidenceStrength = 'Strong' | 'Moderate' | 'Weak';

export type EvidenceItemDisplayState = {
  item: ClaimEvidenceCategory;
  visible: boolean;
  triggeredByKeyword: boolean;
  matchedKeyword?: string;
};

export type EvidenceIndexRow = {
  id: string;
  label: string;
  description: string;
};

export const EVIDENCE_INDEX_FOOTER =
  'You should attach copies of the evidence described above when you file this claim. The court will expect to see the actual documents.';

const DEFAULT_NARRATIVE_FIELDS = [
  'claim_story',
  'problem_summary',
  'generic_claim.summary',
  'generic_claim.category_context',
  'generic_claim.work_supplied',
  'generic_claim.chasing_history',
  'generic_claim.fault_description',
  'generic_claim.service_defect',
  'generic_claim.unfinished_or_defective',
  'generic_claim.refusal_reason',
  'generic_claim.repair_or_damage_issue',
];

const SAFE_SHOW_WHEN_PATTERN = /^[\w\s."'()[\]!==<>&|,+\-/*%]+$/;

function setNestedValue(scope: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  if (parts.length < 2) {
    scope[path] = value;
    return;
  }

  let cursor = scope;
  for (const part of parts.slice(0, -1)) {
    if (!cursor[part] || typeof cursor[part] !== 'object' || Array.isArray(cursor[part])) {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[parts.at(-1)!] = value;
}

function toExpressionScope(userAnswers: ClaimWizardAnswers): Record<string, unknown> {
  const scope: Record<string, unknown> = {};

  for (const [path, value] of Object.entries(userAnswers)) {
    scope[path] = value;
    setNestedValue(scope, path, value);
  }

  return scope;
}

function evaluateShowWhen(showWhen: string, userAnswers: ClaimWizardAnswers): boolean {
  if (!SAFE_SHOW_WHEN_PATTERN.test(showWhen)) {
    return false;
  }

  try {
    const scope = toExpressionScope(userAnswers);
    const evaluator = new Function('scope', `with (scope) { return Boolean(${showWhen}); }`);
    return evaluator(scope) === true;
  } catch {
    return false;
  }
}

function getNarrativeText(
  userAnswers: ClaimWizardAnswers,
  narrativeFields: readonly string[] = DEFAULT_NARRATIVE_FIELDS
): string {
  return narrativeFields
    .map((field) => userAnswers[field])
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase();
}

export function getEvidenceItemDisplayState(
  item: ClaimEvidenceCategory,
  userAnswers: ClaimWizardAnswers,
  narrativeFields: readonly string[] = DEFAULT_NARRATIVE_FIELDS
): EvidenceItemDisplayState {
  const showWhenVisible = item.showWhen ? evaluateShowWhen(item.showWhen, userAnswers) : false;
  const narrativeText = getNarrativeText(userAnswers, narrativeFields);
  const matchedKeyword = item.keywordTriggers?.find((keyword) =>
    narrativeText.includes(keyword.toLowerCase())
  );
  const triggeredByKeyword = Boolean(matchedKeyword);
  const hasVisibilityRule = Boolean(item.showWhen || item.keywordTriggers?.length);

  return {
    item,
    visible: hasVisibilityRule ? showWhenVisible || triggeredByKeyword : true,
    triggeredByKeyword,
    matchedKeyword,
  };
}

export function shouldShowEvidenceItem(
  item: ClaimEvidenceCategory,
  userAnswers: ClaimWizardAnswers,
  narrativeFields?: readonly string[]
): boolean {
  return getEvidenceItemDisplayState(item, userAnswers, narrativeFields).visible;
}

export function getVisibleEvidenceItems(
  items: readonly ClaimEvidenceCategory[],
  userAnswers: ClaimWizardAnswers,
  narrativeFields?: readonly string[]
): EvidenceItemDisplayState[] {
  return items
    .map((item) => getEvidenceItemDisplayState(item, userAnswers, narrativeFields))
    .filter((state) => state.visible);
}

export function calculateEvidenceStrength({
  visibleItems,
  selectedIds,
  descriptions,
}: {
  visibleItems: readonly ClaimEvidenceCategory[];
  selectedIds: readonly string[];
  descriptions: Record<string, string>;
}): EvidenceStrength {
  const selected = new Set(selectedIds);
  const requiredItems = visibleItems.filter((item) => item.requiredForDocument);
  const recommendedItems = visibleItems.filter((item) => item.recommended);
  const missingRequired = requiredItems.some((item) => !selected.has(item.id));

  if (missingRequired) {
    return 'Weak';
  }

  const recommendedSelected =
    recommendedItems.length === 0
      ? 1
      : recommendedItems.filter((item) => selected.has(item.id)).length / recommendedItems.length;
  const selectedDescriptions = selectedIds.map((id) => descriptions[id]?.trim() ?? '');
  const averageDescriptionLength =
    selectedDescriptions.length === 0
      ? 0
      : selectedDescriptions.reduce((sum, description) => sum + description.length, 0) /
        selectedDescriptions.length;

  if (recommendedSelected >= 0.7 && averageDescriptionLength > 30) {
    return 'Strong';
  }

  return 'Moderate';
}

export function buildGenericEvidenceIndexRows({
  visibleItems,
  selectedIds,
  descriptions,
}: {
  visibleItems: readonly ClaimEvidenceCategory[];
  selectedIds: readonly string[];
  descriptions: Record<string, string>;
}): EvidenceIndexRow[] {
  const selected = new Set(selectedIds);

  return visibleItems
    .filter((item) => selected.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      description: descriptions[item.id]?.trim() ?? '',
    }));
}
