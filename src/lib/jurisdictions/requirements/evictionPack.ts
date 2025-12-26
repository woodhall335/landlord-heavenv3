import { RequirementsResult, ValidationContext } from './index';
import { FlowCapability } from '../capabilities/matrix';

export function getEvictionPackRequirements(
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
    'landlord_address_town',
    'landlord_address_postcode',
    'tenant_full_name',
    'property_address_line1',
    'property_address_town',
    'property_address_postcode',
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

  // === EVICTION PACK SPECIFIC ===
  // Eviction packs typically include notice + additional supporting docs

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    // Similar to notice_only but may include additional facts for complete pack

    if (route === 'Section 21 (no-fault)' || route === 'Section 173 (no-fault notice)') {
      // Section 21 / Wales Section 173

      const depositTaken = facts.deposit_taken;

      if (depositTaken === true) {
        const depositFacts = [
          'deposit_amount',
          'deposit_protected',
          'prescribed_info_given',
        ];

        if (stage === 'generate') {
          depositFacts.forEach(key => requiredNow.add(key));
        } else if (stage === 'preview') {
          depositFacts.forEach(key => {
            if (facts[key] === undefined) {
              warnNow.add(key);
            }
          });
        } else if (stage === 'checkpoint') {
          depositFacts.forEach(key => warnNow.add(key));
        }
      } else if (depositTaken === false) {
        derived.add('deposit_amount');
        derived.add('deposit_protected');
        derived.add('prescribed_info_given');
      }

      // Gas safety
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

    } else if (route === 'Section 8 (fault-based)' || route === 'Breach of contract (fault-based)') {
      // Section 8 / Wales fault-based

      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('ground_codes');
        requiredNow.add('notice_expiry_date');
      } else if (stage === 'checkpoint') {
        warnNow.add('ground_codes');
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

      // Deposit is good practice but not legally required for S8
      const depositTaken = facts.deposit_taken;
      if (depositTaken === true) {
        warnNow.add('deposit_protected');
      }
    }

  } else if (jurisdiction === 'scotland') {
    // Scotland: notice_to_leave

    if (route === 'notice_to_leave') {
      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('notice_expiry_date');
        requiredNow.add('ground_codes');
      } else if (stage === 'checkpoint') {
        warnNow.add('ground_codes');
      }

      const isFixedTerm = facts.is_fixed_term;
      if (isFixedTerm === true) {
        if (stage === 'generate' || stage === 'preview') {
          requiredNow.add('fixed_term_end_date');
        }
      }
    }
  }

  // Derived facts
  derived.add('selected_notice_route');

  return { requiredNow, warnNow, derived };
}
