import { RequirementsResult, ValidationContext } from './index';
import { FlowCapability } from '../capabilities/matrix';

export function getNoticeOnlyRequirements(
  ctx: ValidationContext & { flow: FlowCapability }
): RequirementsResult {
  const { jurisdiction, route, stage, facts } = ctx;

  const requiredNow = new Set<string>();
  const warnNow = new Set<string>();
  const derived = new Set<string>();

  // === CORE REQUIRED FACTS (all routes, all stages >= preview) ===
  // NOTE: Address town/postcode are only strictly required at generate stage for PDF output.
  // At preview stage, we only require address line 1 to identify the property/landlord.
  // This allows users to see previews earlier in the flow.
  const coreRequired = [
    'landlord_full_name',
    'landlord_address_line1',
    'tenant_full_name',
    'property_address_line1',
    'tenancy_start_date',
    'rent_amount',
    'rent_frequency',
  ];

  // Address subfields only required at generate (for PDF output)
  const addressSubfieldsForGenerate = [
    'landlord_address_town',
    'landlord_address_postcode',
    'property_address_town',
    'property_address_postcode',
  ];

  if (stage === 'generate') {
    // At generate, require everything including address subfields
    coreRequired.forEach(key => requiredNow.add(key));
    addressSubfieldsForGenerate.forEach(key => requiredNow.add(key));
  } else if (stage === 'preview') {
    // At preview, require core facts but only warn about address subfields
    coreRequired.forEach(key => requiredNow.add(key));
    addressSubfieldsForGenerate.forEach(key => warnNow.add(key));
  } else if (stage === 'checkpoint') {
    // At checkpoint, require core facts, warn about address subfields
    coreRequired.forEach(key => requiredNow.add(key));
    addressSubfieldsForGenerate.forEach(key => warnNow.add(key));
  } else {
    // wizard: warn about upcoming requirements
    coreRequired.forEach(key => warnNow.add(key));
    addressSubfieldsForGenerate.forEach(key => warnNow.add(key));
  }

  // === ROUTE-SPECIFIC REQUIREMENTS ===

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    // JURISDICTION-SPECIFIC ROUTES:
    // - England: section_21 (no-fault), section_8 (grounds-based) - Housing Act 1988
    // - Wales: wales_section_173 (no-fault), wales_fault_based (grounds-based) - Renting Homes (Wales) Act 2016
    // NOTE: section_8 and section_21 are ENGLAND ONLY. Wales uses wales_* routes.

    if (route === 'section_21' || route === 'wales_section_173') {
      // Section 21 / Wales Section 173 requirements

      // Deposit requirements (CONDITIONAL on deposit_taken)
      const depositTaken = facts.deposit_taken;

      if (depositTaken === true) {
        // If deposit was taken, require deposit compliance facts at generate/preview
        const depositFacts = [
          'deposit_amount',
          'deposit_protected',
          'prescribed_info_given',
        ];

        if (stage === 'generate') {
          // Strict requirement for generate
          depositFacts.forEach(key => requiredNow.add(key));
        } else if (stage === 'preview') {
          // Warn at preview for missing deposit facts
          depositFacts.forEach(key => {
            if (facts[key] === undefined) {
              warnNow.add(key);
            }
          });
        } else if (stage === 'checkpoint') {
          // Checkpoint: require deposit compliance decision
          depositFacts.forEach(key => warnNow.add(key));
        }
      } else if (depositTaken === false) {
        // No deposit taken, don't require deposit facts
        derived.add('deposit_amount');
        derived.add('deposit_protected');
        derived.add('prescribed_info_given');
      } else {
        // deposit_taken not yet answered - warn to collect it
        if (stage !== 'wizard') {
          warnNow.add('deposit_taken');
        }
      }

      // Gas safety (CONDITIONAL on has_gas_appliances)
      const hasGas = facts.has_gas_appliances;
      if (hasGas === true) {
        if (stage === 'generate') {
          requiredNow.add('gas_safety_cert_date');
        } else if (stage === 'preview' || stage === 'checkpoint') {
          warnNow.add('gas_safety_cert_date');
        }
      } else if (hasGas === false) {
        derived.add('gas_safety_cert_date');
      }

      // Notice service date is required (user must specify when they will serve)
      // FIX (Jan 2026): Check both notice_date (new) and notice_service_date (old) field IDs
      if (stage === 'generate' || stage === 'preview') {
        if (!facts.notice_date && !facts.notice_service_date) {
          requiredNow.add('notice_date');
        }
      }

      // Notice expiry date:
      // - Section 21: AUTO-CALCULATED server-side, NOT required from wizard facts
      //   The generateSection21Notice function computes this from service date + tenancy terms
      // - Wales Section 173: May still require user input depending on implementation
      if (route === 'wales_section_173') {
        if (stage === 'generate' || stage === 'preview') {
          requiredNow.add('notice_expiry_date');
        }
      } else {
        // Section 21: expiry is derived/computed, mark as such
        derived.add('notice_expiry_date');
      }

      // Fixed term handling
      const isFixedTerm = facts.is_fixed_term;
      if (isFixedTerm === true) {
        if (stage === 'generate' || stage === 'preview') {
          requiredNow.add('fixed_term_end_date');
        }
      } else if (isFixedTerm === false) {
        derived.add('fixed_term_end_date');
      }

    } else if (route === 'section_8' || route === 'wales_fault_based') {
      // Grounds-based possession requirements
      // - England uses section_8 (Housing Act 1988)
      // - Wales uses wales_fault_based (Renting Homes (Wales) Act 2016)

      // Grounds are required
      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('ground_codes');
        requiredNow.add('notice_expiry_date');
      } else if (stage === 'checkpoint') {
        warnNow.add('ground_codes');
      }

      // Fixed term handling (same as S21)
      const isFixedTerm = facts.is_fixed_term;
      if (isFixedTerm === true) {
        if (stage === 'generate' || stage === 'preview') {
          requiredNow.add('fixed_term_end_date');
        }
      } else if (isFixedTerm === false) {
        derived.add('fixed_term_end_date');
      }

      // Deposit is good practice but not legally required for S8
      // Don't block on deposit for S8
      const depositTaken = facts.deposit_taken;
      if (depositTaken === true) {
        // Warn if deposit not protected, but don't block
        warnNow.add('deposit_protected');
      }
    }

  } else if (jurisdiction === 'scotland') {
    // Scotland: notice_to_leave only

    if (route === 'notice_to_leave') {
      // Scotland-specific required facts
      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('notice_expiry_date');
        requiredNow.add('ground_codes'); // Scotland eviction grounds
      } else if (stage === 'checkpoint') {
        warnNow.add('ground_codes');
      }

      // Fixed term handling
      const isFixedTerm = facts.is_fixed_term;
      if (isFixedTerm === true) {
        if (stage === 'generate' || stage === 'preview') {
          requiredNow.add('fixed_term_end_date');
        }
      }
    }
  }

  // === DERIVED FACTS ===
  // Add any auto-computed facts
  derived.add('selected_notice_route'); // This comes from MQS

  return { requiredNow, warnNow, derived };
}
