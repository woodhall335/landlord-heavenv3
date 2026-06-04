import type { CaseFacts } from '@/lib/case-facts/schema';
import type { MoneyClaimCase } from './money-claim-pack-generator';
import type { ScotlandMoneyClaimCase } from './scotland-money-claim-pack-generator';
import { mapArrearsItemsToEntries } from './arrears-schedule-mapper';
import { computeEvictionArrears } from '@/lib/eviction/arrears/computeArrears';
import { calculateMoneyClaimFee } from '@/lib/court-fees/hmcts-fees';
import {
  buildMoneyClaimEvidenceSummary,
  normalizeMoneyClaimEvidenceItems,
} from '@/lib/money-claim/evidence-checklist';

/**
 * Build address string from components, with deduplication.
 * Prevents duplicate city/postcode when address_line2 already contains them.
 * Uses comma separator for money claim documents.
 */
function buildAddress(...parts: Array<string | null>): string {
  const cleanParts = parts
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map(p => p.trim());

  if (cleanParts.length === 0) return '';

  // Build address with deduplication - check if part is already present in earlier parts
  const result: string[] = [];
  const addressSoFarLower: string[] = [];

  for (const part of cleanParts) {
    const partLower = part.toLowerCase();
    // Check if this part is already included in any earlier part
    const isSubstringOfExisting = addressSoFarLower.some(existing => existing.includes(partLower));

    if (!isSubstringOfExisting) {
      result.push(part);
      addressSoFarLower.push(partLower);
    }
  }

  return result.join(', ');
}

/**
 * Format arrears items with proper due date computation.
 * @param items - The arrears items from case facts
 * @param rentDueDay - The day of month rent is due (1-31), from tenancy.rent_due_day
 */
function formatArrearsItems(
  items: CaseFacts['issues']['rent_arrears']['arrears_items'],
  rentDueDay?: number | null
) {
  return mapArrearsItemsToEntries(items || [], rentDueDay);
}

function getLastArrearsPeriodEnd(
  items: CaseFacts['issues']['rent_arrears']['arrears_items']
): string | null {
  for (let i = (items || []).length - 1; i >= 0; i -= 1) {
    const periodEnd = items[i]?.period_end;
    if (periodEnd) return periodEnd;
  }

  return null;
}

function buildCanonicalMoneyClaimArrears(facts: CaseFacts): {
  arrears_total?: number;
  arrears_schedule: MoneyClaimCase['arrears_schedule'];
} {
  const items = facts.issues.rent_arrears.arrears_items || [];
  const fallbackTotal = facts.issues.rent_arrears.total_arrears || undefined;
  const rentAmount = facts.tenancy.rent_amount || 0;
  const rentFrequency = facts.tenancy.rent_frequency || 'monthly';

  if (items.length === 0 || rentAmount <= 0) {
    return {
      arrears_total: fallbackTotal,
      arrears_schedule: formatArrearsItems(items, facts.tenancy.rent_due_day),
    };
  }

  const canonical = computeEvictionArrears({
    arrears_items: items,
    total_arrears: facts.issues.rent_arrears.total_arrears,
    rent_amount: rentAmount,
    rent_frequency: rentFrequency,
    rent_due_day: facts.tenancy.rent_due_day,
    schedule_end_date: facts.tenancy.end_date || getLastArrearsPeriodEnd(items),
  });

  return {
    arrears_total: canonical.total || fallbackTotal,
    arrears_schedule: canonical.schedule,
  };
}

function normaliseFrequency(freq: CaseFacts['tenancy']['rent_frequency']): MoneyClaimCase['rent_frequency'] {
  if (freq === 'fortnightly' || freq === 'quarterly' || freq === 'weekly' || freq === 'monthly') return freq;
  return 'monthly';
}

function getMoneyClaimEvidenceItems(facts: CaseFacts) {
  return normalizeMoneyClaimEvidenceItems(
    facts.money_claim.evidence_items,
    facts.money_claim.evidence_types_available
  ).filter((item) => item.available);
}

function coercePositiveAmount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value !== 'string') return null;

  const cleaned = value.replace(/[£,\s]/g, '');
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function sumLineItems(items?: Array<{ amount?: number | string | null }>): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (coercePositiveAmount(item?.amount) ?? 0), 0);
}

function selectedMoneyClaimReasons(facts: CaseFacts): Set<string> {
  const rawFacts = facts as CaseFacts & Record<string, any>;
  const moneyClaim = facts.money_claim as CaseFacts['money_claim'] & Record<string, any>;
  const reasons = new Set<string>();

  if (rawFacts.claiming_rent_arrears === true || moneyClaim.primary_issue === 'unpaid_rent_only') {
    reasons.add('rent_arrears');
  }

  const otherTypes = Array.isArray(moneyClaim.other_amounts_types)
    ? (moneyClaim.other_amounts_types as string[])
    : [];

  for (const type of otherTypes) reasons.add(type);

  if (rawFacts.claiming_damages === true) reasons.add('property_damage');
  if (rawFacts.claiming_other === true) reasons.add('other_charges');
  if (moneyClaim.primary_issue === 'unpaid_rent_and_damage') {
    reasons.add('rent_arrears');
    reasons.add('property_damage');
  }
  if (moneyClaim.primary_issue === 'damage_only') reasons.add('property_damage');

  return reasons;
}

function addFallbackClaimAmountIfNeeded(
  facts: CaseFacts,
  canonicalArrears: ReturnType<typeof buildCanonicalMoneyClaimArrears>,
  damageItems: MoneyClaimCase['damage_items'],
  otherCharges: MoneyClaimCase['other_charges']
): {
  arrears_total?: number;
  damage_items: MoneyClaimCase['damage_items'];
  other_charges: MoneyClaimCase['other_charges'];
} {
  const arrearsTotal = canonicalArrears.arrears_total || 0;
  const damagesTotal = sumLineItems(damageItems);
  const otherChargesTotal = sumLineItems(otherCharges);
  const existingPrincipal = arrearsTotal + damagesTotal + otherChargesTotal;

  if (existingPrincipal > 0) {
    return {
      arrears_total: canonicalArrears.arrears_total,
      damage_items: damageItems,
      other_charges: otherCharges,
    };
  }

  const courtRentAmount = coercePositiveAmount(facts.court.claim_amount_rent);
  const courtOtherAmount = coercePositiveAmount(facts.court.claim_amount_other);
  const courtTotalAmount = coercePositiveAmount(facts.court.total_claim_amount);
  const reasons = selectedMoneyClaimReasons(facts);

  if (courtRentAmount) {
    return {
      arrears_total: courtRentAmount,
      damage_items: damageItems,
      other_charges: courtOtherAmount
        ? [{ description: 'Other amount claimed from the tenant', amount: courtOtherAmount }]
        : otherCharges,
    };
  }

  if (courtOtherAmount) {
    return {
      arrears_total: canonicalArrears.arrears_total,
      damage_items: damageItems,
      other_charges: [{ description: 'Other amount claimed from the tenant', amount: courtOtherAmount }],
    };
  }

  if (courtTotalAmount) {
    if (reasons.has('rent_arrears')) {
      return {
        arrears_total: courtTotalAmount,
        damage_items: damageItems,
        other_charges: otherCharges,
      };
    }

    return {
      arrears_total: canonicalArrears.arrears_total,
      damage_items: damageItems,
      other_charges: [{ description: 'Amount claimed from the tenant', amount: courtTotalAmount }],
    };
  }

  return {
    arrears_total: canonicalArrears.arrears_total,
    damage_items: damageItems,
    other_charges: otherCharges,
  };
}

function calculateExplicitMoneyClaimTotal(
  claimBreakdown: {
    arrears_total?: number;
    damage_items: MoneyClaimCase['damage_items'];
    other_charges: MoneyClaimCase['other_charges'];
  },
  facts: CaseFacts
): number | undefined {
  const itemizedTotal =
    (claimBreakdown.arrears_total || 0) +
    sumLineItems(claimBreakdown.damage_items) +
    sumLineItems(claimBreakdown.other_charges);

  if (itemizedTotal > 0) return itemizedTotal;

  return (
    coercePositiveAmount(facts.court.total_claim_amount) ||
    coercePositiveAmount(facts.court.claim_amount_rent) ||
    coercePositiveAmount(facts.court.claim_amount_other) ||
    undefined
  );
}

export function mapCaseFactsToMoneyClaimCase(facts: CaseFacts): MoneyClaimCase {
  const rawFacts = facts as CaseFacts & Record<string, any>;
  const canonicalArrears = buildCanonicalMoneyClaimArrears(facts);
  const damageItems = (facts.money_claim.damage_items || []) as any;
  const otherCharges = (facts.money_claim.other_charges || []) as any;
  const claimBreakdown = addFallbackClaimAmountIfNeeded(
    facts,
    canonicalArrears,
    damageItems,
    otherCharges
  );
  const landlordAddress = buildAddress(
    facts.parties.landlord.address_line1,
    facts.parties.landlord.address_line2,
    facts.parties.landlord.city
  );
  const propertyAddress = buildAddress(
    facts.property.address_line1,
    facts.property.address_line2,
    facts.property.city
  );

  // Money Claim is ENGLAND-ONLY
  // Scotland uses Simple Procedure (sc_money_claim), Wales/NI not supported
  const jurisdiction: MoneyClaimCase['jurisdiction'] = 'england';
  const evidenceItems = getMoneyClaimEvidenceItems(facts);
  const evidenceSummary =
    facts.money_claim.evidence_summary || buildMoneyClaimEvidenceSummary(evidenceItems) || undefined;
  const totalClaimAmount = calculateExplicitMoneyClaimTotal(claimBreakdown, facts);

  return {
    jurisdiction,
    landlord_full_name: facts.parties.landlord.name || '',
    landlord_2_name: facts.parties.landlord.co_claimant || undefined,
    landlord_address: landlordAddress,
    landlord_postcode: facts.parties.landlord.postcode || undefined,
    landlord_email: facts.parties.landlord.email || undefined,
    landlord_phone: facts.parties.landlord.phone || undefined,
    payment_account_name: rawFacts.payment_account_name || rawFacts.bank_account_name || undefined,
    payment_sort_code: rawFacts.payment_sort_code || rawFacts.bank_sort_code || undefined,
    payment_account_number: rawFacts.payment_account_number || rawFacts.bank_account_number || undefined,
    payment_reference: rawFacts.payment_reference || undefined,
    claimant_reference: facts.court.claimant_reference || undefined,

    tenant_full_name: facts.parties.tenants[0]?.name || '',
    tenant_2_name: facts.parties.tenants[1]?.name || undefined,
    property_address: propertyAddress,
    property_postcode: facts.property.postcode || undefined,

    rent_amount: facts.tenancy.rent_amount || 0,
    rent_frequency: normaliseFrequency(facts.tenancy.rent_frequency),
    payment_day: (facts.money_claim.payment_day || facts.tenancy.rent_due_day || undefined) as any,
    usual_payment_weekday: facts.tenancy.usual_payment_weekday || undefined,
    tenancy_start_date: facts.tenancy.start_date || undefined,
    tenancy_end_date: facts.tenancy.end_date || undefined,

    arrears_total: claimBreakdown.arrears_total,
    arrears_schedule: canonicalArrears.arrears_schedule,
    damage_items: claimBreakdown.damage_items,
    other_charges: claimBreakdown.other_charges,
    total_claim_amount: totalClaimAmount,

    // Interest: only passed if user explicitly opted in via charge_interest === true
    claim_interest: facts.money_claim.charge_interest === true,
    interest_rate: facts.money_claim.charge_interest === true ? (facts.money_claim.interest_rate || undefined) : undefined,
    interest_start_date: facts.money_claim.charge_interest === true ? (facts.money_claim.interest_start_date || undefined) : undefined,

    // =========================================================================
    // COURT FEE AUTO-CALCULATION
    // =========================================================================
    // If no manual fee is provided, auto-calculate based on total claim amount.
    // Uses HMCTS fee bands from hmcts-fees.ts.
    // =========================================================================
    court_fee: facts.court.claim_amount_costs || (() => {
      // Calculate total claim amount (arrears + damages + other charges)
      const arrearsTotal = claimBreakdown.arrears_total || 0;
      const damagesTotal = sumLineItems(claimBreakdown.damage_items);
      const otherChargesTotal = sumLineItems(claimBreakdown.other_charges);
      const totalClaimAmount = arrearsTotal + damagesTotal + otherChargesTotal;

      return totalClaimAmount > 0 ? calculateMoneyClaimFee(totalClaimAmount) : undefined;
    })(),
    solicitor_costs: facts.money_claim.solicitor_costs || undefined,

    court_name: facts.court.court_name || undefined,

    particulars_of_claim: facts.court.particulars_of_claim || facts.money_claim.attempts_to_resolve || undefined,
    signatory_name: facts.money_claim.signatory_name || facts.parties.landlord.name || undefined,
    signature_date: facts.money_claim.signature_date || undefined,

    service_address_line1: facts.service_contact.service_address_line1 || undefined,
    service_address_line2: facts.service_contact.service_address_line2 || undefined,
    service_address_town: facts.service_contact.service_city || undefined,
    service_address_county: facts.service_contact.service_address_county || undefined,
    service_postcode: facts.service_contact.service_postcode || undefined,
    service_phone: facts.service_contact.service_phone || facts.parties.landlord.phone || undefined,
    service_email: facts.service_contact.service_email || facts.parties.landlord.email || undefined,

    // Additional narrative fields for AI drafting
    other_charges_notes: facts.money_claim.other_charges_notes || undefined,
    other_costs_notes: facts.money_claim.other_costs_notes || undefined,
    other_amounts_summary: facts.money_claim.other_amounts_summary || undefined,

    // Enforcement preferences for guidance
    enforcement_preferences: facts.money_claim.enforcement_preferences || undefined,
    enforcement_notes: facts.money_claim.enforcement_notes || undefined,

    // Evidence checklist output. These are user-stated evidence descriptions, not verified uploads.
    evidence_items: evidenceItems.length > 0 ? evidenceItems : undefined,
    evidence_types_available: evidenceItems.length > 0 ? evidenceItems.map((item) => item.type) : undefined,
    evidence_summary: evidenceSummary,
  };
}

export function mapCaseFactsToScotlandMoneyClaimCase(facts: CaseFacts): ScotlandMoneyClaimCase {
  const canonicalArrears = buildCanonicalMoneyClaimArrears(facts);
  const landlordAddress = buildAddress(
    facts.parties.landlord.address_line1,
    facts.parties.landlord.address_line2,
    facts.parties.landlord.city
  );
  const propertyAddress = buildAddress(
    facts.property.address_line1,
    facts.property.address_line2,
    facts.property.city
  );
  const evidenceItems = getMoneyClaimEvidenceItems(facts);

  return {
    jurisdiction: 'scotland',
    landlord_full_name: facts.parties.landlord.name || '',
    landlord_2_name: facts.parties.landlord.co_claimant || undefined,
    landlord_address: landlordAddress,
    landlord_postcode: facts.parties.landlord.postcode || undefined,
    landlord_email: facts.parties.landlord.email || undefined,
    landlord_phone: facts.parties.landlord.phone || undefined,
    claimant_reference: facts.court.claimant_reference || undefined,

    tenant_full_name: facts.parties.tenants[0]?.name || '',
    tenant_2_name: facts.parties.tenants[1]?.name || undefined,
    property_address: propertyAddress,
    property_postcode: facts.property.postcode || undefined,

    sheriffdom: facts.money_claim.sheriffdom || undefined,
    court_name: facts.court.court_name || undefined,

    rent_amount: facts.tenancy.rent_amount || 0,
    rent_frequency: normaliseFrequency(facts.tenancy.rent_frequency),
    payment_day: (facts.money_claim.payment_day || facts.tenancy.rent_due_day || undefined) as any,
    usual_payment_weekday: facts.tenancy.usual_payment_weekday || undefined,
    tenancy_start_date: facts.tenancy.start_date || undefined,
    tenancy_end_date: facts.tenancy.end_date || undefined,

    arrears_total: canonicalArrears.arrears_total,
    arrears_schedule: canonicalArrears.arrears_schedule,
    damage_items: (facts.money_claim.damage_items || []) as any,
    other_charges: (facts.money_claim.other_charges || []) as any,

    // Interest: only passed if user explicitly opted in via charge_interest === true
    claim_interest: facts.money_claim.charge_interest === true,
    interest_rate: facts.money_claim.charge_interest === true ? (facts.money_claim.interest_rate || undefined) : undefined,
    interest_start_date: facts.money_claim.charge_interest === true ? (facts.money_claim.interest_start_date || undefined) : undefined,

    // =========================================================================
    // COURT FEE AUTO-CALCULATION (Scotland)
    // =========================================================================
    // Scotland Sheriff Court fees differ from England/Wales.
    // If no manual fee is provided, auto-calculate based on total claim amount.
    // Note: Scotland uses different fee bands - this uses HMCTS as approximation.
    // =========================================================================
    court_fee: facts.court.claim_amount_costs || (() => {
      // Calculate total claim amount (arrears + damages + other charges)
      const arrearsTotal = canonicalArrears.arrears_total || 0;
      const damagesTotal = (facts.money_claim.damage_items || [])
        .reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
      const otherChargesTotal = (facts.money_claim.other_charges || [])
        .reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
      const totalClaimAmount = arrearsTotal + damagesTotal + otherChargesTotal;

      return totalClaimAmount > 0 ? calculateMoneyClaimFee(totalClaimAmount) : undefined;
    })(),
    solicitor_costs: facts.money_claim.solicitor_costs || undefined,

    basis_of_claim: facts.money_claim.basis_of_claim || 'rent_arrears',
    attempts_to_resolve: facts.money_claim.attempts_to_resolve || undefined,
    evidence_summary: facts.money_claim.evidence_summary || buildMoneyClaimEvidenceSummary(evidenceItems) || undefined,
    particulars_of_claim: facts.court.particulars_of_claim || undefined,

    signatory_name: facts.money_claim.signatory_name || facts.parties.landlord.name || undefined,
    signature_date: facts.money_claim.signature_date || undefined,

    // Additional narrative fields for AI drafting
    other_charges_notes: facts.money_claim.other_charges_notes || undefined,
    other_costs_notes: facts.money_claim.other_costs_notes || undefined,
    other_amounts_summary: facts.money_claim.other_amounts_summary || undefined,

    // Enforcement preferences for guidance
    enforcement_preferences: facts.money_claim.enforcement_preferences || undefined,
    enforcement_notes: facts.money_claim.enforcement_notes || undefined,
  };
}
