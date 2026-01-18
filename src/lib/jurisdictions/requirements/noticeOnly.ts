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

  // Helper to check boolean-like values (handles 'yes', 'true', true, etc.)
  const isTruthy = (value: unknown): boolean => {
    if (value === true) return true;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return ['true', 'yes', 'y', '1'].includes(lower);
    }
    return false;
  };

  const isFalsy = (value: unknown): boolean => {
    if (value === false) return true;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return ['false', 'no', 'n', '0'].includes(lower);
    }
    return false;
  };

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    // JURISDICTION-SPECIFIC ROUTES:
    // - England: section_21 (no-fault), section_8 (grounds-based) - Housing Act 1988
    // - Wales: wales_section_173 (no-fault), wales_fault_based (grounds-based) - Renting Homes (Wales) Act 2016
    // NOTE: section_8 and section_21 are ENGLAND ONLY. Wales uses wales_* routes.

    if (route === 'section_21' || route === 'wales_section_173') {
      // Section 21 / Wales Section 173 requirements

      // Deposit requirements (CONDITIONAL on deposit_taken)
      // Use isTruthy to handle both boolean true and string 'yes'/'true'
      const depositTaken = isTruthy(facts.deposit_taken);
      const depositNotTaken = isFalsy(facts.deposit_taken);

      if (depositTaken) {
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
      } else if (depositNotTaken) {
        // No deposit taken, mark deposit facts as derived (not required)
        derived.add('deposit_amount');
        derived.add('deposit_protected');
        derived.add('prescribed_info_given');
      } else {
        // deposit_taken not yet answered - warn to collect it (but don't block on deposit compliance)
        if (stage !== 'wizard') {
          warnNow.add('deposit_taken');
        }
        // Mark deposit compliance facts as derived until we know deposit was taken
        // This prevents false "missing required" errors when user hasn't answered deposit question yet
        derived.add('deposit_amount');
        derived.add('deposit_protected');
        derived.add('prescribed_info_given');
      }

      // Gas safety (CONDITIONAL on has_gas_appliances)
      // Note: gas_safety_cert_date is informational - the blocking check is on gas_certificate_provided
      // The date is only needed for record-keeping, not for Section 21 validity
      const hasGas = isTruthy(facts.has_gas_appliances);
      if (hasGas) {
        // Only warn about gas cert date at generate stage - it's nice-to-have, not blocking
        if (stage === 'generate') {
          warnNow.add('gas_safety_cert_date');
        }
        // gas_certificate_provided is the blocking field, handled by decision engine
      } else {
        // No gas appliances OR not yet answered - mark gas cert date as derived (not required)
        derived.add('gas_safety_cert_date');
      }

      // Notice expiry date - For Section 21, this is AUTO-CALCULATED, not user-provided
      // The MQS only collects notice_expiry_date for Section 8 route
      // Section 21 expiry dates are computed server-side based on service date, fixed term, etc.
      derived.add('notice_expiry_date');

      // Fixed term handling
      const isFixedTerm = isTruthy(facts.is_fixed_term);
      if (isFixedTerm) {
        if (stage === 'generate' || stage === 'preview') {
          requiredNow.add('fixed_term_end_date');
        }
      } else {
        // Not fixed term OR not yet answered - mark as derived
        derived.add('fixed_term_end_date');
      }

    } else if (route === 'section_8' || route === 'wales_fault_based') {
      // Grounds-based possession requirements
      // - England uses section_8 (Housing Act 1988)
      // - Wales uses wales_fault_based (Renting Homes (Wales) Act 2016)

      // Grounds are required
      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('ground_codes');
        // Section 8 DOES collect notice_expiry_date from user (can be auto-calculated or overridden)
        // Mark as warned since it can be auto-computed but user can provide override
        warnNow.add('notice_expiry_date');
      } else if (stage === 'checkpoint') {
        warnNow.add('ground_codes');
      }

      // Fixed term handling (same as S21)
      const isFixedTerm = isTruthy(facts.is_fixed_term);
      if (isFixedTerm) {
        if (stage === 'generate' || stage === 'preview') {
          requiredNow.add('fixed_term_end_date');
        }
      } else {
        // Not fixed term OR not yet answered - mark as derived
        derived.add('fixed_term_end_date');
      }

      // Deposit is good practice but not legally required for S8
      // Don't block on deposit for S8
      const depositTaken = isTruthy(facts.deposit_taken);
      if (depositTaken) {
        // Warn if deposit not protected, but don't block
        warnNow.add('deposit_protected');
      }
    }

  } else if (jurisdiction === 'scotland') {
    // Scotland: notice_to_leave only

    if (route === 'notice_to_leave') {
      // Scotland-specific required facts
      if (stage === 'generate' || stage === 'preview') {
        // Scotland notice_expiry_date is computed server-side like Section 21
        derived.add('notice_expiry_date');

        // Scotland uses scotland_eviction_ground (number) for ground selection
        // The wizard writes ground_codes for new cases, but for backward compatibility
        // we also accept scotland_eviction_ground as satisfying the ground requirement
        const hasGroundCodes = facts.ground_codes && Array.isArray(facts.ground_codes) && (facts.ground_codes as string[]).length > 0;
        const hasScotlandGround = facts.scotland_eviction_ground !== undefined && facts.scotland_eviction_ground !== null;

        if (hasGroundCodes || hasScotlandGround) {
          // Ground is provided - mark as derived (satisfied)
          derived.add('ground_codes');
        } else {
          // No ground selected - require it
          requiredNow.add('ground_codes');
        }

        // Scotland Ground 18 (rent arrears) requires arrears schedule
        // Ground 18 = 3 or more consecutive months of arrears
        const SCOTLAND_RENT_ARREARS_GROUND = 18;
        const isRentArrearsGround = facts.scotland_eviction_ground === SCOTLAND_RENT_ARREARS_GROUND;

        if (isRentArrearsGround) {
          // Check if arrears schedule exists
          const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items;
          const hasArrearsSchedule = Array.isArray(arrearsItems) && arrearsItems.length > 0;

          if (!hasArrearsSchedule) {
            // WARN at both preview and generate - Scotland grounds are all discretionary
            // so we warn rather than block, allowing user to proceed with reduced evidence
            warnNow.add('arrears_items');
          }
        }
      } else if (stage === 'checkpoint') {
        warnNow.add('ground_codes');
      }

      // Fixed term handling
      const isFixedTerm = isTruthy(facts.is_fixed_term);
      if (isFixedTerm) {
        if (stage === 'generate' || stage === 'preview') {
          requiredNow.add('fixed_term_end_date');
        }
      } else {
        derived.add('fixed_term_end_date');
      }
    }
  }

  // === DERIVED FACTS ===
  // Add any auto-computed facts
  derived.add('selected_notice_route'); // This comes from MQS

  return { requiredNow, warnNow, derived };
}
