import { RequirementsResult, ValidationContext } from './index';
import { FlowCapability } from '../capabilities/matrix';

export function getTenancyAgreementRequirements(
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

  // === TENANCY AGREEMENT SPECIFIC ===

  // Fixed term details
  const isFixedTerm = facts.is_fixed_term;
  if (isFixedTerm === true) {
    if (stage === 'generate' || stage === 'preview') {
      requiredNow.add('fixed_term_end_date');
    } else if (stage === 'checkpoint') {
      warnNow.add('fixed_term_end_date');
    }
  } else if (isFixedTerm === false) {
    derived.add('fixed_term_end_date');
  }

  // Deposit handling
  const depositTaken = facts.deposit_taken;
  if (depositTaken === true) {
    if (stage === 'generate' || stage === 'preview') {
      requiredNow.add('deposit_amount');
    } else if (stage === 'checkpoint') {
      warnNow.add('deposit_amount');
    }

    // Scheme details are good practice for agreements
    if (stage === 'generate') {
      warnNow.add('deposit_scheme_name');
    }
  } else if (depositTaken === false) {
    derived.add('deposit_amount');
    derived.add('deposit_scheme_name');
  }

  // Payment details
  if (stage === 'generate' || stage === 'preview') {
    requiredNow.add('payment_date');
  }

  // Jurisdiction-specific requirements

  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    // AST (Assured Shorthold Tenancy) requirements
    if (stage === 'generate' || stage === 'preview') {
      requiredNow.add('tenancy_type'); // ast, assured, etc.
      requiredNow.add('property_type'); // house, flat, etc.
    }

    // Tenant count
    const jointTenants = facts.joint_tenants;
    if (jointTenants === true) {
      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('tenant_2_name');
      }
    } else if (jointTenants === false) {
      derived.add('tenant_2_name');
    }

    // Landlord count
    const jointLandlords = facts.joint_landlords;
    if (jointLandlords === true) {
      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('landlord_2_name');
      }
    } else if (jointLandlords === false) {
      derived.add('landlord_2_name');
    }

  } else if (jurisdiction === 'scotland') {
    // PRT (Private Residential Tenancy) requirements
    if (stage === 'generate' || stage === 'preview') {
      requiredNow.add('property_type');
      requiredNow.add('property_epc_rating');
      requiredNow.add('landlord_registration_number');
    }

    // PRT-specific fields
    const jointTenants = facts.joint_tenants;
    if (jointTenants === true) {
      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('tenant_2_name');
      }
    } else if (jointTenants === false) {
      derived.add('tenant_2_name');
    }

  } else if (jurisdiction === 'northern-ireland') {
    // Northern Ireland Private Tenancy requirements
    if (stage === 'generate' || stage === 'preview') {
      requiredNow.add('property_type');
      requiredNow.add('number_of_bedrooms');
    }

    // Tenant count
    const jointTenants = facts.joint_tenants;
    if (jointTenants === true) {
      if (stage === 'generate' || stage === 'preview') {
        requiredNow.add('tenant_2_name');
      }
    } else if (jointTenants === false) {
      derived.add('tenant_2_name');
    }
  }

  return { requiredNow, warnNow, derived };
}
