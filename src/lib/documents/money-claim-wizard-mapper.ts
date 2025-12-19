import type { CaseFacts } from '@/lib/case-facts/schema';
import type { MoneyClaimCase } from './money-claim-pack-generator';
import type { ScotlandMoneyClaimCase } from './scotland-money-claim-pack-generator';

function buildAddress(...parts: Array<string | null>): string {
  return parts.filter(Boolean).join(', ');
}

function formatArrearsItems(items: CaseFacts['issues']['rent_arrears']['arrears_items']) {
  return (items || []).map((item) => ({
    period: `${item.period_start} to ${item.period_end}`,
    due_date: item.period_end,
    amount_due: item.rent_due,
    amount_paid: item.rent_paid,
    arrears: (item.rent_due || 0) - (item.rent_paid || 0),
  }));
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

    interest_rate: facts.money_claim.interest_rate || undefined,
    interest_start_date: facts.money_claim.interest_start_date || undefined,

    court_fee: facts.court.claim_amount_costs || undefined,
    solicitor_costs: facts.money_claim.solicitor_costs || undefined,

    court_name: facts.court.court_name || undefined,

    particulars_of_claim: facts.court.particulars_of_claim || facts.money_claim.attempts_to_resolve || undefined,
    signatory_name: facts.money_claim.signatory_name || facts.parties.landlord.name || undefined,
    signature_date: facts.money_claim.signature_date || undefined,

    service_address_line1: facts.service_contact.service_address_line1 || undefined,
    service_address_line2: facts.service_contact.service_address_line2 || undefined,
    service_address_town: facts.service_contact.service_city || undefined,
    service_address_county: facts.service_contact.service_city || undefined,
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

    interest_rate: facts.money_claim.interest_rate || undefined,
    interest_start_date: facts.money_claim.interest_start_date || undefined,

    court_fee: facts.court.claim_amount_costs || undefined,
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
