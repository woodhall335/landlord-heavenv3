/**
 * Money Claim Statement Generator
 *
 * Auto-generates basis_of_claim statements based on:
 * - Selected claim reasons (checkboxes)
 * - Property address
 * - Tenant name
 * - Arrears data
 * - Damages data
 * - Tenancy dates
 *
 * Uses dynamic templates that adapt to the specific claims being made.
 */

import type { ClaimReasonType } from '@/components/wizard/sections/money-claim/ClaimDetailsSection';

export interface MoneyClaimFacts {
  // Tenant/defendant (top-level keys used by validator)
  tenant_full_name?: string;
  defendant_name?: string;
  defendant_address_line1?: string;

  // Property (top-level keys used by validator)
  property_address_line1?: string;
  property_address_line2?: string;
  property_address_town?: string;
  property_address_postcode?: string;

  // Tenancy (top-level keys used by validator)
  tenancy_start_date?: string;
  tenancy_end_date?: string;
  rent_amount?: number;
  rent_frequency?: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';

  // Claim flags
  claiming_rent_arrears?: boolean;
  claiming_damages?: boolean;
  claiming_other?: boolean;

  // Arrears data (top-level)
  arrears_items?: Array<{
    period_start?: string | null;
    period_end?: string | null;
    rent_due?: number | null;
    rent_paid?: number | null;
  }>;
  total_arrears?: number;

  // Money claim nested object
  money_claim?: {
    other_amounts_types?: string[];
    damage_items?: Array<{
      id?: string;
      description?: string;
      amount?: number;
      category?: string;
    }>;
    tenant_still_in_property?: boolean;
    basis_of_claim?: string;
    totals?: {
      rent_arrears?: number;
      damage?: number;
      cleaning?: number;
      utilities?: number;
      council_tax?: number;
      other?: number;
      combined_total?: number;
    };
  };

  // Nested parties object (fallback for legacy wizard data)
  parties?: {
    landlord?: {
      name?: string;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      postcode?: string;
    };
    tenants?: Array<{
      name?: string;
      address_line1?: string;
      address_line2?: string;
      postcode?: string;
    }>;
  };

  // Nested property object (fallback for legacy wizard data)
  property?: {
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postcode?: string;
  };

  // Nested tenancy object (fallback for legacy wizard data)
  tenancy?: {
    start_date?: string;
    end_date?: string;
    rent_amount?: number;
    rent_frequency?: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  };

  // Issues nested (legacy path)
  issues?: {
    rent_arrears?: {
      arrears_items?: Array<{
        period_start?: string | null;
        period_end?: string | null;
        rent_due?: number | null;
        rent_paid?: number | null;
      }>;
      total_arrears?: number;
    };
  };
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '£[amount]';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '[date]';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch {
    return '[date]';
  }
}

/**
 * Get full property address string
 * Checks both top-level keys and nested property object as fallback
 */
function getPropertyAddress(facts: MoneyClaimFacts): string {
  // Try top-level keys first, then nested property object as fallback
  const parts = [
    facts.property_address_line1 || facts.property?.address_line1,
    facts.property_address_line2 || facts.property?.address_line2,
    facts.property_address_town || facts.property?.city,
    facts.property_address_postcode || facts.property?.postcode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : '[property address]';
}

/**
 * Get tenant name with fallback
 * Checks top-level keys, then nested parties.tenants array
 */
function getTenantName(facts: MoneyClaimFacts): string {
  // Try top-level keys first
  if (facts.tenant_full_name) return facts.tenant_full_name;
  if (facts.defendant_name) return facts.defendant_name;

  // Fallback to nested parties.tenants array
  const firstTenant = facts.parties?.tenants?.[0];
  if (firstTenant?.name) return firstTenant.name;

  return '[tenant name]';
}

/**
 * Get tenancy start date with fallback
 */
function getTenancyStartDate(facts: MoneyClaimFacts): string | undefined {
  return facts.tenancy_start_date || facts.tenancy?.start_date;
}

/**
 * Get rent amount with fallback
 */
function getRentAmount(facts: MoneyClaimFacts): number | undefined {
  return facts.rent_amount ?? facts.tenancy?.rent_amount;
}

/**
 * Get rent frequency with fallback
 */
function getRentFrequency(facts: MoneyClaimFacts): MoneyClaimFacts['rent_frequency'] | undefined {
  return facts.rent_frequency || facts.tenancy?.rent_frequency;
}

/**
 * Calculate total arrears from items
 */
function calculateTotalArrears(facts: MoneyClaimFacts): number {
  const items =
    facts.arrears_items ||
    facts.issues?.rent_arrears?.arrears_items ||
    [];

  if (items.length === 0) {
    return facts.total_arrears || facts.issues?.rent_arrears?.total_arrears || 0;
  }

  return items.reduce((total, item) => {
    const due = item.rent_due || 0;
    const paid = item.rent_paid || 0;
    return total + (due - paid);
  }, 0);
}

/**
 * Calculate total damages from items
 */
function calculateTotalDamages(facts: MoneyClaimFacts): number {
  const items = facts.money_claim?.damage_items || [];
  return items.reduce((total, item) => total + (item.amount || 0), 0);
}

/**
 * Get arrears period description
 */
function getArrearsPeriodDescription(facts: MoneyClaimFacts): string {
  const items =
    facts.arrears_items ||
    facts.issues?.rent_arrears?.arrears_items ||
    [];

  if (items.length === 0) return '';

  // Find earliest and latest dates
  const dates = items
    .flatMap((item) => [item.period_start, item.period_end])
    .filter((d): d is string => !!d)
    .sort();

  if (dates.length === 0) return '';

  const earliest = formatDate(dates[0]);
  const latest = formatDate(dates[dates.length - 1]);

  if (earliest === latest) {
    return `since ${earliest}`;
  }
  return `from ${earliest} to ${latest}`;
}

/**
 * Get damages description from items
 * Used for generating summary text about damages claimed.
 */
export function getDamagesDescription(facts: MoneyClaimFacts): string {
  const items = facts.money_claim?.damage_items || [];
  if (items.length === 0) return '';

  // Get unique categories
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];

  if (categories.length === 0) {
    // Fall back to descriptions
    const descriptions = items
      .map((item) => item.description)
      .filter(Boolean)
      .slice(0, 3);
    return descriptions.join(', ');
  }

  // Map categories to readable names
  const categoryNames: Record<string, string> = {
    property_damage: 'property damage',
    cleaning: 'cleaning costs',
    unpaid_utilities: 'unpaid utilities',
    unpaid_council_tax: 'unpaid council tax',
    other_charges: 'other charges',
    legal_costs: 'legal costs',
  };

  return categories
    .map((cat) => categoryNames[cat as string] || cat)
    .join(', ');
}

/**
 * Derive selected claim reasons from facts
 */
export function getClaimReasonsFromFacts(facts: MoneyClaimFacts): Set<ClaimReasonType> {
  const selected = new Set<ClaimReasonType>();

  if (facts.claiming_rent_arrears === true) {
    selected.add('rent_arrears');
  }

  const otherTypes: string[] = facts.money_claim?.other_amounts_types || [];

  if (otherTypes.includes('property_damage')) selected.add('property_damage');
  if (otherTypes.includes('cleaning')) selected.add('cleaning');
  if (otherTypes.includes('unpaid_utilities')) selected.add('unpaid_utilities');
  if (otherTypes.includes('unpaid_council_tax')) selected.add('unpaid_council_tax');

  if (
    facts.claiming_other === true ||
    otherTypes.includes('other_charges') ||
    otherTypes.includes('legal_costs')
  ) {
    selected.add('other_tenant_debt');
  }

  return selected;
}

/**
 * Generate a basis_of_claim statement based on selected claim reasons and facts.
 *
 * This creates a draft statement that the user can review and edit.
 * The statement follows court-appropriate language while remaining in plain English.
 */
export function generateBasisOfClaimStatement(
  facts: MoneyClaimFacts,
  selectedReasons?: Set<ClaimReasonType>
): string {
  // Derive reasons from facts if not provided
  const reasons = selectedReasons || getClaimReasonsFromFacts(facts);

  if (reasons.size === 0) {
    return '';
  }

  const tenantName = getTenantName(facts);
  const propertyAddress = getPropertyAddress(facts);
  const tenantStillInProperty = facts.money_claim?.tenant_still_in_property;

  const parts: string[] = [];

  // Opening statement
  const tenantStatus =
    tenantStillInProperty === true
      ? 'is the tenant'
      : tenantStillInProperty === false
        ? 'was the tenant'
        : 'is/was the tenant';

  const tenancyStart = getTenancyStartDate(facts);
  const tenancyStartStr = tenancyStart
    ? ` which commenced on ${formatDate(tenancyStart)}`
    : '';

  parts.push(
    `The Defendant, ${tenantName}, ${tenantStatus} at ${propertyAddress}${tenancyStartStr}.`
  );

  // Rent arrears claim
  if (reasons.has('rent_arrears')) {
    const totalArrears = calculateTotalArrears(facts);
    const periodDesc = getArrearsPeriodDescription(facts);
    const rentAmount = getRentAmount(facts);
    const rentFreq = getRentFrequency(facts);

    let arrearsStatement = 'The Defendant has failed to pay rent as required under the tenancy agreement';

    if (periodDesc) {
      arrearsStatement += ` ${periodDesc}`;
    }

    if (rentAmount && rentFreq) {
      const freqLabel =
        rentFreq === 'weekly'
          ? 'per week'
          : rentFreq === 'fortnightly'
            ? 'per fortnight'
            : rentFreq === 'monthly'
              ? 'per month'
              : rentFreq === 'quarterly'
                ? 'per quarter'
                : 'per year';
      arrearsStatement += `. The contractual rent is ${formatCurrency(rentAmount)} ${freqLabel}`;
    }

    if (totalArrears > 0) {
      arrearsStatement += `. The total rent arrears amount to ${formatCurrency(totalArrears)}`;
    }

    arrearsStatement += '.';
    parts.push(arrearsStatement);
  }

  // Property damage claim
  if (reasons.has('property_damage')) {
    const damageItems = facts.money_claim?.damage_items?.filter(
      (item) => item.category === 'property_damage'
    );
    const damageTotal = damageItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    let damageStatement =
      'The Defendant has caused damage to the property beyond fair wear and tear';

    if (damageTotal > 0) {
      damageStatement += `, and the cost of repairs amounts to ${formatCurrency(damageTotal)}`;
    }

    damageStatement += '.';
    parts.push(damageStatement);
  }

  // Cleaning costs
  if (reasons.has('cleaning')) {
    const cleaningItems = facts.money_claim?.damage_items?.filter(
      (item) => item.category === 'cleaning'
    );
    const cleaningTotal =
      cleaningItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    let cleaningStatement =
      'The property was left in a condition requiring professional cleaning and/or rubbish removal';

    if (cleaningTotal > 0) {
      cleaningStatement += `, at a cost of ${formatCurrency(cleaningTotal)}`;
    }

    cleaningStatement += '.';
    parts.push(cleaningStatement);
  }

  // Unpaid utilities
  if (reasons.has('unpaid_utilities')) {
    const utilityItems = facts.money_claim?.damage_items?.filter(
      (item) => item.category === 'unpaid_utilities'
    );
    const utilityTotal =
      utilityItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    let utilityStatement =
      'The Defendant has failed to pay utility bills which were the responsibility of the tenant under the tenancy agreement';

    if (utilityTotal > 0) {
      utilityStatement += `, totalling ${formatCurrency(utilityTotal)}`;
    }

    utilityStatement += '.';
    parts.push(utilityStatement);
  }

  // Unpaid council tax
  if (reasons.has('unpaid_council_tax')) {
    const councilTaxItems = facts.money_claim?.damage_items?.filter(
      (item) => item.category === 'unpaid_council_tax'
    );
    const councilTaxTotal =
      councilTaxItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    let councilTaxStatement =
      'The Defendant has failed to pay council tax which was their liability under the tenancy agreement';

    if (councilTaxTotal > 0) {
      councilTaxStatement += `, amounting to ${formatCurrency(councilTaxTotal)}`;
    }

    councilTaxStatement += '.';
    parts.push(councilTaxStatement);
  }

  // Other tenant debt
  if (reasons.has('other_tenant_debt')) {
    const otherItems = facts.money_claim?.damage_items?.filter(
      (item) =>
        item.category === 'other_charges' || item.category === 'legal_costs'
    );
    const otherTotal =
      otherItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    let otherStatement = 'The Defendant also owes additional amounts under the tenancy agreement';

    if (otherTotal > 0) {
      otherStatement += `, totalling ${formatCurrency(otherTotal)}`;
    }

    otherStatement += '.';
    parts.push(otherStatement);
  }

  // Calculate grand total for closing statement
  const totalArrears = reasons.has('rent_arrears') ? calculateTotalArrears(facts) : 0;
  const totalDamages = calculateTotalDamages(facts);
  const grandTotal = totalArrears + totalDamages;

  if (grandTotal > 0) {
    parts.push(`The Claimant seeks recovery of the total sum of ${formatCurrency(grandTotal)}.`);
  }

  return parts.join('\n\n');
}

/**
 * Generate a short summary for display purposes
 */
export function generateClaimSummary(
  facts: MoneyClaimFacts,
  selectedReasons?: Set<ClaimReasonType>
): string {
  const reasons = selectedReasons || getClaimReasonsFromFacts(facts);

  if (reasons.size === 0) {
    return 'No claim types selected';
  }

  const reasonLabels: Record<ClaimReasonType, string> = {
    rent_arrears: 'rent arrears',
    property_damage: 'property damage',
    cleaning: 'cleaning costs',
    unpaid_utilities: 'unpaid utilities',
    unpaid_council_tax: 'unpaid council tax',
    other_tenant_debt: 'other debt',
  };

  const labels = Array.from(reasons).map((r) => reasonLabels[r]);

  // Format as "X, Y, and Z"
  if (labels.length === 1) {
    return `Claiming for ${labels[0]}`;
  } else if (labels.length === 2) {
    return `Claiming for ${labels[0]} and ${labels[1]}`;
  } else {
    const last = labels.pop();
    return `Claiming for ${labels.join(', ')}, and ${last}`;
  }
}

/**
 * Get a list of missing information that would improve the auto-generated statement
 */
export function getMissingStatementInfo(
  facts: MoneyClaimFacts,
  selectedReasons?: Set<ClaimReasonType>
): string[] {
  const reasons = selectedReasons || getClaimReasonsFromFacts(facts);
  const missing: string[] = [];

  // General info - check top-level and nested paths
  const tenantName = getTenantName(facts);
  if (tenantName === '[tenant name]') {
    missing.push('Tenant/defendant name');
  }

  const propertyAddress = getPropertyAddress(facts);
  if (propertyAddress === '[property address]') {
    missing.push('Property address');
  }

  if (facts.money_claim?.tenant_still_in_property === undefined) {
    missing.push('Whether tenant is still in the property');
  }

  // Rent arrears specific
  if (reasons.has('rent_arrears')) {
    const items = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
    if (items.length === 0 && !facts.total_arrears && !facts.issues?.rent_arrears?.total_arrears) {
      missing.push('Rent arrears schedule or total amount');
    }
    const rentAmount = getRentAmount(facts);
    if (!rentAmount) {
      missing.push('Rent amount');
    }
  }

  // Damages specific
  if (
    reasons.has('property_damage') ||
    reasons.has('cleaning') ||
    reasons.has('unpaid_utilities') ||
    reasons.has('unpaid_council_tax') ||
    reasons.has('other_tenant_debt')
  ) {
    const items = facts.money_claim?.damage_items || [];
    if (items.length === 0) {
      missing.push('Itemised damage/cost schedule');
    }
  }

  return missing;
}
