import type { CaseFacts } from '@/lib/case-facts/schema';
import type { MoneyClaimCase } from './money-claim-pack-generator';
import type { ScotlandMoneyClaimCase } from './scotland-money-claim-pack-generator';
import { mapArrearsItemsToEntries, getArrearsScheduleFromFacts } from './arrears-schedule-mapper';
import { calculateMoneyClaimFee } from '@/lib/court-fees/hmcts-fees';

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
 * @deprecated Use mapArrearsItemsToEntries from arrears-schedule-mapper instead
 */
function formatArrearsItems(items: CaseFacts['issues']['rent_arrears']['arrears_items']) {
  return mapArrearsItemsToEntries(items || []);
}

function normaliseFrequency(freq: CaseFacts['tenancy']['rent_frequency']): MoneyClaimCase['rent_frequency'] {
  if (freq === 'fortnightly' || freq === 'quarterly' || freq === 'weekly' || freq === 'monthly') return freq;
  return 'monthly';
}

export function mapCaseFactsToMoneyClaimCase(facts: CaseFacts): MoneyClaimCase {
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

  // Derive jurisdiction from property country or default to england
  const jurisdiction: MoneyClaimCase['jurisdiction'] =
    facts.property.country === 'wales' ? 'wales' :
    facts.property.country === 'scotland' ? 'scotland' :
    'england';

  return {
    jurisdiction,
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

    rent_amount: facts.tenancy.rent_amount || 0,
    rent_frequency: normaliseFrequency(facts.tenancy.rent_frequency),
    payment_day: (facts.money_claim.payment_day || facts.tenancy.rent_due_day || undefined) as any,
    usual_payment_weekday: facts.tenancy.usual_payment_weekday || undefined,
    tenancy_start_date: facts.tenancy.start_date || undefined,
    tenancy_end_date: facts.tenancy.end_date || undefined,

    arrears_total: facts.issues.rent_arrears.total_arrears || undefined,
    arrears_schedule: formatArrearsItems(facts.issues.rent_arrears.arrears_items),
    damage_items: (facts.money_claim.damage_items || []) as any,
    other_charges: (facts.money_claim.other_charges || []) as any,

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
      const arrearsTotal = facts.issues.rent_arrears.total_arrears || 0;
      const damagesTotal = (facts.money_claim.damage_items || [])
        .reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
      const otherChargesTotal = (facts.money_claim.other_charges || [])
        .reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
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
  };
}

export function mapCaseFactsToScotlandMoneyClaimCase(facts: CaseFacts): ScotlandMoneyClaimCase {
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

    arrears_total: facts.issues.rent_arrears.total_arrears || undefined,
    arrears_schedule: formatArrearsItems(facts.issues.rent_arrears.arrears_items),
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
      const arrearsTotal = facts.issues.rent_arrears.total_arrears || 0;
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
    evidence_summary: facts.money_claim.evidence_summary || undefined,
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
