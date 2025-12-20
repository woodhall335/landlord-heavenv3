import { RequirementsResult, ValidationContext } from './index';
import { FlowCapability } from '../capabilities/matrix';

export function getMoneyClaimRequirements(
  ctx: ValidationContext & { flow: FlowCapability }
): RequirementsResult {
  const { jurisdiction, route, stage, facts } = ctx;

  const requiredNow = new Set<string>();
  const warnNow = new Set<string>();
  const derived = new Set<string>();

  // === ALWAYS REQUIRED (all jurisdictions) ===
  const alwaysRequired = [
    'landlord_full_name',
    'landlord_address_line1',
    'landlord_city',
    'landlord_postcode',
    'tenant_full_name',
    'property_address_line1',
    'property_city',
    'property_postcode',
    'tenancy_start_date',
    'rent_amount',
    'rent_frequency',
  ];

  if (stage === 'generate' || stage === 'preview') {
    alwaysRequired.forEach(key => requiredNow.add(key));
  } else if (stage === 'checkpoint') {
    alwaysRequired.forEach(key => requiredNow.add(key));
  } else {
    alwaysRequired.forEach(key => warnNow.add(key));
  }

  // === MONEY CLAIM SPECIFIC ===
  // Money claims require claim amounts and evidence

  if (stage === 'generate' || stage === 'preview') {
    // Claim details are strictly required for money claims
    requiredNow.add('claim_type'); // rent_arrears, damages, etc.
    requiredNow.add('total_claim_amount');

    // For rent arrears specifically
    if (facts.claim_type === 'rent_arrears' || facts.claim_type === 'arrears') {
      requiredNow.add('arrears_amount');
      requiredNow.add('arrears_start_date');
      requiredNow.add('arrears_end_date');
    }

    // For damages claims
    if (facts.claim_type === 'damages') {
      requiredNow.add('damage_description');
      requiredNow.add('damage_amount');
    }

  } else if (stage === 'checkpoint') {
    // At checkpoint, warn about claim details
    warnNow.add('claim_type');
    warnNow.add('total_claim_amount');
  }

  // Fixed term handling (useful for breach context)
  const isFixedTerm = facts.is_fixed_term;
  if (isFixedTerm === true) {
    if (stage === 'generate' || stage === 'preview') {
      requiredNow.add('fixed_term_end_date');
    }
  } else if (isFixedTerm === false) {
    derived.add('fixed_term_end_date');
  }

  // Jurisdiction-specific requirements
  if (jurisdiction === 'scotland') {
    // Scotland may have specific money claim requirements
    if (stage === 'generate' || stage === 'preview') {
      // Simple Procedure or Sheriff Court claim
      requiredNow.add('claim_court'); // Which court to file in
    }
  }

  return { requiredNow, warnNow, derived };
}
