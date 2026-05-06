export type MoneyClaimChecklistClaimType =
  | 'rent_arrears'
  | 'property_damage'
  | 'cleaning'
  | 'unpaid_utilities'
  | 'unpaid_council_tax'
  | 'other_tenant_debt';

export interface MoneyClaimEvidenceCategory {
  id: string;
  label: string;
  description: string;
  requiredFor: Array<MoneyClaimChecklistClaimType | 'all'>;
  recommended?: boolean;
  tips?: string[];
}

export interface MoneyClaimEvidenceItem {
  type: string;
  label: string;
  available: boolean;
  description?: string | null;
}

export type MoneyClaimEvidenceStrengthLevel = 'weak' | 'fair' | 'strong';

export interface MoneyClaimEvidenceStrength {
  level: MoneyClaimEvidenceStrengthLevel;
  label: 'Weak' | 'Fair' | 'Strong';
  summary: string;
  selectedRecommended: number;
  totalRecommended: number;
  selectedCount: number;
  missingRecommendedLabels: string[];
}

export const MONEY_CLAIM_EVIDENCE_CATEGORIES: MoneyClaimEvidenceCategory[] = [
  {
    id: 'tenancy_agreement',
    label: 'Tenancy agreement',
    description: 'The signed tenancy agreement or most recent variation. This proves the contract.',
    requiredFor: ['all'],
    recommended: true,
    tips: ['Include any variations or addendums', 'Make sure every page is legible'],
  },
  {
    id: 'rent_schedule',
    label: 'Rent schedule / arrears ledger',
    description: 'A schedule showing rent due, payments received, and the running balance.',
    requiredFor: ['rent_arrears'],
    recommended: true,
    tips: [
      'The arrears schedule in this wizard can be used for this',
      'Show each rent period clearly',
      'Include dates and amounts for missed or part payments',
    ],
  },
  {
    id: 'bank_statements',
    label: 'Bank statements',
    description: 'Statements showing missed, late, or part rent payments.',
    requiredFor: ['rent_arrears'],
    tips: ['Redact unrelated personal spending', 'Highlight the rent transactions if helpful'],
  },
  {
    id: 'demand_letters',
    label: 'Rent demand letters',
    description: 'Copies of rent reminders, demands, or arrears emails sent to the tenant.',
    requiredFor: ['rent_arrears'],
    tips: ['Keep proof of posting or email delivery where you have it'],
  },
  {
    id: 'property_photos_before',
    label: 'Check-in photos / inventory',
    description: 'Photos or an inventory from the start of the tenancy showing property condition.',
    requiredFor: ['property_damage', 'cleaning'],
    recommended: true,
    tips: ['Dated photos are best', 'A signed inventory is stronger than loose photos'],
  },
  {
    id: 'property_photos_after',
    label: 'Check-out photos / damage photos',
    description: 'Photos showing damage or condition at the end of the tenancy.',
    requiredFor: ['property_damage', 'cleaning'],
    recommended: true,
    tips: ['Use clear photos from more than one angle', 'Keep dates where possible'],
  },
  {
    id: 'repair_quotes',
    label: 'Repair quotes / invoices',
    description: 'Quotes, invoices, or receipts for repair work needed because of the damage.',
    requiredFor: ['property_damage'],
    recommended: true,
    tips: ['Itemise costs clearly', 'Two quotes can help if the amount is disputed'],
  },
  {
    id: 'cleaning_invoice',
    label: 'Cleaning quotes / invoices',
    description: 'Professional cleaning quotes, invoices, or receipts.',
    requiredFor: ['cleaning'],
    recommended: true,
    tips: ['Itemise the cleaning tasks', 'Match the invoice to the property condition evidence'],
  },
  {
    id: 'utility_bills',
    label: 'Utility bills',
    description: 'Utility bills or statements showing the sum you say the tenant owes.',
    requiredFor: ['unpaid_utilities'],
    recommended: true,
    tips: ['Show the account period and amount claimed', 'Keep the tenancy clause if it makes the tenant liable'],
  },
  {
    id: 'council_tax_bills',
    label: 'Council tax bills',
    description: 'Council tax bills or statements for the tenancy period.',
    requiredFor: ['unpaid_council_tax'],
    recommended: true,
    tips: ['Show the period claimed', 'Keep the tenancy clause or other proof of liability'],
  },
  {
    id: 'other_evidence',
    label: 'Other supporting documents',
    description: 'Other documents that support the debt, such as correspondence, receipts, or agreements.',
    requiredFor: ['other_tenant_debt', 'all'],
    tips: ['Include written agreements about extra payments', 'Keep messages where the debt was acknowledged'],
  },
  {
    id: 'letter_before_claim',
    label: 'Letter Before Claim',
    description: 'The Letter Before Claim and proof it was sent to the tenant.',
    requiredFor: ['all'],
    recommended: true,
    tips: ['Keep proof of posting or delivery', 'Keep a copy of the exact letter sent'],
  },
];

export function getMoneyClaimSelectedClaimTypes(facts: any): Set<MoneyClaimChecklistClaimType> {
  const types = new Set<MoneyClaimChecklistClaimType>();

  if (facts?.claiming_rent_arrears === true) {
    types.add('rent_arrears');
  }

  const otherTypes: string[] = facts?.money_claim?.other_amounts_types || [];
  if (otherTypes.includes('property_damage') || facts?.claiming_damages === true) {
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
  if (facts?.claiming_other === true || otherTypes.includes('other_charges')) {
    types.add('other_tenant_debt');
  }

  return types;
}

export function shouldShowMoneyClaimEvidenceCategory(
  category: MoneyClaimEvidenceCategory,
  selectedTypes: Iterable<string>
): boolean {
  if (category.requiredFor.includes('all')) return true;

  const selected = new Set(selectedTypes);
  return category.requiredFor.some((type) => selected.has(type));
}

export function getVisibleMoneyClaimEvidenceCategories(
  selectedTypes: Iterable<string>
): MoneyClaimEvidenceCategory[] {
  return MONEY_CLAIM_EVIDENCE_CATEGORIES.filter((category) =>
    shouldShowMoneyClaimEvidenceCategory(category, selectedTypes)
  );
}

export function getMoneyClaimEvidenceLabel(type: string): string {
  return (
    MONEY_CLAIM_EVIDENCE_CATEGORIES.find((category) => category.id === type)?.label ||
    type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

export function normalizeMoneyClaimEvidenceItems(
  rawItems?: unknown,
  fallbackTypes?: string[] | null
): MoneyClaimEvidenceItem[] {
  const byType = new Map<string, MoneyClaimEvidenceItem>();

  if (Array.isArray(rawItems)) {
    for (const rawItem of rawItems) {
      if (!rawItem || typeof rawItem !== 'object') continue;
      const item = rawItem as Record<string, unknown>;
      const type = typeof item.type === 'string' ? item.type : '';
      if (!type) continue;
      const label =
        typeof item.label === 'string' && item.label.trim()
          ? item.label.trim()
          : getMoneyClaimEvidenceLabel(type);
      const description =
        typeof item.description === 'string' && item.description.trim()
          ? item.description.trim()
          : undefined;

      byType.set(type, {
        type,
        label,
        available: item.available === true,
        description,
      });
    }
  }

  for (const type of fallbackTypes || []) {
    if (!type || byType.has(type)) continue;
    byType.set(type, {
      type,
      label: getMoneyClaimEvidenceLabel(type),
      available: true,
    });
  }

  return Array.from(byType.values());
}

function sentenceWithFullStop(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function buildMoneyClaimEvidenceSummary(items: MoneyClaimEvidenceItem[]): string {
  const selected = normalizeMoneyClaimEvidenceItems(items).filter((item) => item.available);
  if (selected.length === 0) return '';

  return selected
    .map((item) => {
      const label = item.label || getMoneyClaimEvidenceLabel(item.type);
      const description = typeof item.description === 'string' ? item.description.trim() : '';
      if (description) {
        return `The claimant says they have / will rely on ${label}: ${sentenceWithFullStop(description)}`;
      }
      return `The claimant says they have / will rely on ${label}.`;
    })
    .join(' ');
}

export function calculateMoneyClaimEvidenceStrength(
  selectedClaimTypes: Iterable<string>,
  evidenceItems: MoneyClaimEvidenceItem[],
  visibleCategories?: MoneyClaimEvidenceCategory[]
): MoneyClaimEvidenceStrength {
  const visible = visibleCategories || getVisibleMoneyClaimEvidenceCategories(selectedClaimTypes);
  const recommended = visible.filter((category) => category.recommended);
  const selectedAvailable = new Set(
    normalizeMoneyClaimEvidenceItems(evidenceItems)
      .filter((item) => item.available)
      .map((item) => item.type)
  );

  const selectedRecommended = recommended.filter((category) => selectedAvailable.has(category.id)).length;
  const totalRecommended = recommended.length;
  const selectedCount = selectedAvailable.size;
  const missingRecommendedLabels = recommended
    .filter((category) => !selectedAvailable.has(category.id))
    .map((category) => category.label);

  let level: MoneyClaimEvidenceStrengthLevel = 'weak';
  if (selectedCount > 0) {
    const halfRecommended = Math.max(1, Math.ceil(totalRecommended / 2));
    if (
      totalRecommended > 0 &&
      selectedRecommended >= totalRecommended &&
      selectedCount >= Math.min(3, visible.length)
    ) {
      level = 'strong';
    } else if (selectedRecommended >= halfRecommended || selectedCount >= 2) {
      level = 'fair';
    }
  }

  const label: MoneyClaimEvidenceStrength['label'] =
    level === 'strong' ? 'Strong' : level === 'fair' ? 'Fair' : 'Weak';
  const summary =
    level === 'strong'
      ? 'The main evidence categories for this claim are recorded.'
      : level === 'fair'
      ? 'Some useful evidence is recorded, but there are still gaps to consider.'
      : 'Record the documents you have so the claim can explain what supports it.';

  return {
    level,
    label,
    summary,
    selectedRecommended,
    totalRecommended,
    selectedCount,
    missingRecommendedLabels,
  };
}
