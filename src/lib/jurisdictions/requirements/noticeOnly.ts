import { RequirementsResult, ValidationContext } from './index';
import { FlowCapability } from '../capabilities/matrix';

export function getNoticeOnlyRequirements(
  ctx: ValidationContext & { flow: FlowCapability }
): RequirementsResult {
  const { jurisdiction, route, stage, facts } = ctx;

  const requiredNow = new Set<string>();
  const warnNow = new Set<string>();
  const derived = new Set<string>();

  // === ALWAYS REQUIRED (all routes, all stages) ===
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
    // At checkpoint, require core facts
    alwaysRequired.forEach(key => requiredNow.add(key));
  } else {
    // wizard: warn about upcoming requirements
    alwaysRequired.forEach(key => warnNow.add(key));
  }

  // === ROUTE-SPECIFIC REQUIREMENTS ===

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    // England/Wales have section_21 and section_8 (or Wales equivalents)

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

      // Notice expiry date
      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('notice_expiry_date');
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
      // Section 8 / Wales fault-based requirements

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
