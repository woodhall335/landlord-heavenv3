/**
 * normalize.ts - Mapping between flat WizardFacts (DB) and nested CaseFacts (domain)
 *
 * This file handles the conversion from the flat storage format to the nested
 * domain model used by document generators and analysis tools.
 */

import type { WizardFacts, CaseFacts, PartyDetails } from './schema';
import { createEmptyCaseFacts } from './schema';

/**
 * Helper to safely get a value from flat wizard facts using dot notation.
 * Supports legacy keys (e.g., landlord_name) and case_facts-prefixed MQS paths.
 */
function getWizardValue(wizard: WizardFacts, key: string): any {
  const direct = wizard[key];
  if (direct !== undefined && direct !== null) return direct;

  const normalizedKey = key.replace(/^case_facts\./, '').replace(/\[(\d+)\]/g, '.$1');
  const normalizedValue = wizard[normalizedKey];
  if (normalizedValue !== undefined && normalizedValue !== null) return normalizedValue;

  return null;
}

function getFirstValue(wizard: WizardFacts, keys: string[]): any {
  for (const key of keys) {
    const value = getWizardValue(wizard, key);
    if (value !== null && value !== undefined) return value;
  }
  return null;
}

function coerceBoolean(value: any): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['yes', 'true', 'y', '1'].includes(normalized)) return true;
    if (['no', 'false', 'n', '0'].includes(normalized)) return false;
  }
  return Boolean(value);
}

/**
 * Helper to set nested values on CaseFacts using paths like
 * "parties.landlord.name" or "issues.rent_arrears.arrears_items.0".
 */
function setNestedValue(target: Record<string, any>, path: string, value: any) {
  if (value === undefined) return;
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let current: any = target;

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const nextIsIndex = !isLast && !Number.isNaN(Number(parts[index + 1]));
    const numericIndex = Number.isNaN(Number(part)) ? null : Number(part);

    if (numericIndex !== null) {
      if (!Array.isArray(current)) {
        // Ensure current level is array when numeric index encountered
        current = [];
      }
      if (!current[numericIndex]) current[numericIndex] = nextIsIndex ? [] : {};
      if (isLast) {
        current[numericIndex] = value;
      } else {
        current = current[numericIndex];
      }
      return;
    }

    if (isLast) {
      current[part] = value;
      return;
    }

    if (!(part in current) || current[part] === null) {
      current[part] = nextIsIndex ? [] : {};
    }

    current = current[part];
  });
}

/**
 * Helper to extract tenant data from flat wizard facts
 * Looks for keys like "tenants.0.full_name", "tenants.0.email", etc.
 */
function extractTenants(wizard: WizardFacts): PartyDetails[] {
  const isTruthy = <T>(value: T | null | undefined | false): value is T => Boolean(value);

  if (Array.isArray((wizard as any).tenants)) {
    return (wizard as any).tenants
      .filter(isTruthy)
      .map((t: any) => ({
        name: t.full_name || t.name || '',
        email: t.email,
        phone: t.phone || t.phone_number,
        address_line1: t.address_line1,
        address_line2: t.address_line2,
        city: t.city,
        postcode: t.postcode,
      }));
  }

  const partiesTenantsList = (wizard as any).parties?.tenants;
  if (Array.isArray(partiesTenantsList)) {
    return partiesTenantsList
      .filter(isTruthy)
      .map((t: any) => ({
        name: t.full_name || t.name || '',
        email: t.email,
        phone: t.phone || t.phone_number,
        address_line1: t.address_line1,
        address_line2: t.address_line2,
        city: t.city,
        postcode: t.postcode,
      }));
  }

  const tenants: PartyDetails[] = [];

  const explicitPrimaryName =
    getWizardValue(wizard, 'tenant1_name') ||
    getWizardValue(wizard, 'defendant_name_1') ||
    getWizardValue(wizard, 'defendant_full_name') ||
    getWizardValue(wizard, 'defender_full_name') ||
    getWizardValue(wizard, 'defendant_name');

  if (explicitPrimaryName) {
    tenants.push({
      name: explicitPrimaryName,
      email:
        getWizardValue(wizard, 'tenant1_email') ||
        getWizardValue(wizard, 'defendant_email') ||
        getWizardValue(wizard, 'defender_email') ||
        getWizardValue(wizard, 'defender_contact'),
      phone:
        getWizardValue(wizard, 'tenant1_phone') ||
        getWizardValue(wizard, 'defendant_phone') ||
        getWizardValue(wizard, 'defender_phone') ||
        getWizardValue(wizard, 'defender_contact'),
      address_line1: getWizardValue(wizard, 'tenant1_address_line1'),
      address_line2: getWizardValue(wizard, 'tenant1_address_line2'),
      city: getWizardValue(wizard, 'tenant1_city'),
      postcode: getWizardValue(wizard, 'tenant1_postcode'),
    });
  }

  const explicitSecondaryName =
    getWizardValue(wizard, 'tenant2_name') ||
    getWizardValue(wizard, 'defendant_name_2') ||
    getWizardValue(wizard, 'defendant_secondary_name') ||
    getWizardValue(wizard, 'defender_secondary_name');

  if (explicitSecondaryName) {
    tenants.push({
      name: explicitSecondaryName,
      email:
        getWizardValue(wizard, 'tenant2_email') ||
        getWizardValue(wizard, 'defendant_secondary_email') ||
        getWizardValue(wizard, 'defender_secondary_email'),
      phone:
        getWizardValue(wizard, 'tenant2_phone') ||
        getWizardValue(wizard, 'defendant_secondary_phone') ||
        getWizardValue(wizard, 'defender_secondary_phone'),
      address_line1: getWizardValue(wizard, 'tenant2_address_line1'),
      address_line2: getWizardValue(wizard, 'tenant2_address_line2'),
      city: getWizardValue(wizard, 'tenant2_city'),
      postcode: getWizardValue(wizard, 'tenant2_postcode'),
    });
  }

  if (Array.isArray((wizard as any).tenants)) {
    const list = (wizard as any).tenants
      .filter(isTruthy)
      .map((t: any) => ({
        name: t.full_name || t.name || '',
        email: t.email,
        phone: t.phone || t.phone_number,
        address_line1: t.address_line1,
        address_line2: t.address_line2,
        city: t.city,
        postcode: t.postcode,
      }));
    return tenants.length ? tenants.concat(list) : list;
  }

  const partiesTenants = (wizard as any).parties?.tenants;
  if (Array.isArray(partiesTenants)) {
    return partiesTenants
      .filter(isTruthy)
      .map((t: any) => ({
        name: t.full_name || t.name || '',
        email: t.email,
        phone: t.phone || t.phone_number,
        address_line1: t.address_line1,
        address_line2: t.address_line2,
        city: t.city,
        postcode: t.postcode,
      }));
  }

  const tenantIndices = new Set<number>();

  // Find all tenant indices by scanning keys
  Object.keys(wizard).forEach((key) => {
    const match = key.match(/^(?:tenants|parties\.tenants)\.(\d+)\./);
    if (match) {
      tenantIndices.add(parseInt(match[1], 10));
    }
  });

  // Build tenant objects for each index found
  Array.from(tenantIndices)
    .sort((a, b) => a - b)
    .forEach((index) => {
      tenants.push({
        name: getWizardValue(wizard, `tenants.${index}.full_name`) ||
              getWizardValue(wizard, `tenants.${index}.name`),
        email: getWizardValue(wizard, `tenants.${index}.email`),
        phone: getWizardValue(wizard, `tenants.${index}.phone`) ||
               getWizardValue(wizard, `tenants.${index}.phone_number`),
        address_line1: getWizardValue(wizard, `tenants.${index}.address_line1`),
        address_line2: getWizardValue(wizard, `tenants.${index}.address_line2`),
        city: getWizardValue(wizard, `tenants.${index}.city`),
        postcode: getWizardValue(wizard, `tenants.${index}.postcode`),
      });
    });

  return tenants;
}

// -----------------------------------------------------------------------------
// CASE HEALTH - compute contradictions, missing evidence, compliance warnings
// -----------------------------------------------------------------------------

function computeCaseHealth(base: CaseFacts, wizard: WizardFacts): CaseFacts['case_health'] {
  const contradictions: string[] = [];
  const missing_evidence: string[] = [];
  const compliance_warnings: string[] = [];

  const isMoneyClaim =
    base.meta.product === 'money_claim' ||
    base.court.route === 'money_claim';

  if (!isMoneyClaim) {
    return {
      contradictions,
      missing_evidence,
      compliance_warnings,
      risk_level: 'low',
    };
  }

  const hasString = (value: unknown | null | undefined): boolean =>
    typeof value === 'string' && value.trim().length > 0;
  const hasArray = (value: unknown | null | undefined): boolean =>
    Array.isArray(value) && value.length > 0;
  const isTrue = (value: unknown | null | undefined): boolean => value === true;

  // Parties / identity basics
  if (!hasString(base.parties.landlord.name)) {
    missing_evidence.push('Missing landlord/claimant name.');
  }
  if (!base.parties.tenants.length || !hasString(base.parties.tenants[0]?.name)) {
    missing_evidence.push('Missing tenant/defendant name.');
  }

  // Property
  if (!hasString(base.property.address_line1) || !hasString(base.property.postcode)) {
    missing_evidence.push('Missing property address or postcode.');
  }

  // Money claim basics
  if (base.tenancy.rent_amount === null) {
    missing_evidence.push('Missing rent amount for calculating arrears.');
  }
  if (base.issues.rent_arrears.total_arrears === null) {
    missing_evidence.push('Missing total rent arrears figure.');
  }

  // Arrears evidence
  const hasArrearsSchedule =
    base.issues.rent_arrears.arrears_items.length > 0 ||
    base.money_claim.arrears_schedule_confirmed === true ||
    base.evidence.rent_schedule_uploaded === true;

  if (!hasArrearsSchedule) {
    missing_evidence.push('No arrears schedule or rent ledger confirmed.');
  }

  // Attempts to resolve
  if (!hasString(base.money_claim.attempts_to_resolve)) {
    compliance_warnings.push('Attempts to resolve the dispute not described.');
  }

  // PAP-DEBT / pre-action steps
  if (!hasString(base.money_claim.lba_date)) {
    compliance_warnings.push('Letter Before Claim date not provided.');
  }
  if (!hasString(base.money_claim.lba_response_deadline)) {
    compliance_warnings.push('Response deadline for Letter Before Claim not provided.');
  }
  if (!isTrue(base.money_claim.pap_documents_served)) {
    compliance_warnings.push('PAP-DEBT documents not marked as served on the tenant.');
  }
  if (!hasArray(base.money_claim.pap_service_method)) {
    compliance_warnings.push('Service method for PAP-DEBT pack not recorded.');
  }

  // Evidence flags
  const hasAnyEvidenceFlag =
    hasArray(base.money_claim.evidence_types_available) ||
    base.evidence.tenancy_agreement_uploaded ||
    base.evidence.rent_schedule_uploaded ||
    base.evidence.bank_statements_uploaded ||
    base.evidence.other_evidence_uploaded;

  if (!hasAnyEvidenceFlag) {
    compliance_warnings.push('No supporting evidence flagged (tenancy agreement, statements, or other evidence).');
  }

  // Contradictions (simple heuristics)
  if (base.issues.rent_arrears.has_arrears === false && (base.issues.rent_arrears.total_arrears ?? 0) > 0) {
    contradictions.push('Marked as having no rent arrears but a positive arrears total was provided.');
  }

  if (base.money_claim.tenant_responded === true && !hasString(base.money_claim.tenant_response_details)) {
    contradictions.push('Tenant is marked as having responded, but no response details were provided.');
  }

  if ((base.issues.rent_arrears.total_arrears ?? 0) === 0 && base.money_claim.basis_of_claim === 'rent_arrears') {
    contradictions.push('Basis of claim is rent arrears but total arrears is recorded as £0.');
  }

  // Risk level heuristic
  let risk_level: 'low' | 'medium' | 'high' = 'low';

  if (contradictions.length > 0 || missing_evidence.length >= 4) {
    risk_level = 'high';
  } else if (missing_evidence.length > 0 || compliance_warnings.length > 0) {
    risk_level = 'medium';
  }

  return {
    contradictions,
    missing_evidence,
    compliance_warnings,
    risk_level,
  };
}

/**
 * Converts flat WizardFacts (DB storage) to nested CaseFacts (domain model).
 *
 * This mapping focuses on the AST flow initially. Additional mappings can be
 * added as needed for other products and jurisdictions.
 *
 * @param wizard - Flat facts from case_facts.facts column
 * @returns Nested domain model for generators/analysis
 */
export function wizardFactsToCaseFacts(wizard: WizardFacts): CaseFacts {
  if (!wizard || typeof wizard !== 'object') {
    return createEmptyCaseFacts();
  }

  const base = createEmptyCaseFacts();

  // Apply any MQS answers that map directly to case_facts.* paths
  Object.entries(wizard).forEach(([key, value]) => {
    if (!key.startsWith('case_facts.')) return;
    const path = key.replace(/^case_facts\./, '').replace(/\[(\d+)\]/g, '.$1');
    setNestedValue(base as any, path, value);
  });

  // =============================================================================
  // META - Product and tier information
  // =============================================================================
  base.meta = {
    product: wizard.__meta?.product ?? (wizard as any).product ?? null,
    original_product: wizard.__meta?.original_product ?? (wizard as any).product ?? null,
    product_tier: wizard.__meta?.product_tier ?? (wizard as any).product_tier ?? null,
  };

  // =============================================================================
  // PROPERTY - Address and details
  // =============================================================================
  base.property.address_line1 ??= getFirstValue(wizard, [
    'case_facts.property.address_line1',
    'property_address',
    'property_address_line1',
    'property.address_line1',
  ]);
  base.property.address_line2 ??= getFirstValue(wizard, [
    'case_facts.property.address_line2',
    'property_address_line2',
    'property.address_line2',
  ]);
  base.property.city ??= getFirstValue(wizard, [
    'case_facts.property.city',
    'property_city',
    'property.city',
    'property_address_town',
  ]);
  base.property.postcode ??= getFirstValue(wizard, [
    'case_facts.property.postcode',
    'property_postcode',
    'property.postcode',
    'property_address_postcode',
  ]);
  base.property.country ??= (getFirstValue(wizard, [
    'case_facts.property.country',
    'property_country',
    'jurisdiction',
  ]) as any);
  const propertyIsHmo = getFirstValue(wizard, ['case_facts.property.is_hmo', 'property_is_hmo', 'is_hmo', 'property.is_hmo']);
  if (propertyIsHmo !== null) {
    base.property.is_hmo = coerceBoolean(propertyIsHmo);
  }

  // =============================================================================
  // TENANCY - Dates, rent, deposit
  // =============================================================================
  base.tenancy.tenancy_type = (getWizardValue(wizard, 'tenancy_type') as any) || base.tenancy.tenancy_type;
  base.tenancy.start_date ??= getFirstValue(wizard, [
    'case_facts.tenancy.start_date',
    'tenancy_start_date',
    'start_date',
  ]);
  base.tenancy.end_date ??= getFirstValue(wizard, [
    'case_facts.tenancy.end_date',
    'tenancy_end_date',
  ]);
  const fixedTerm = getFirstValue(wizard, ['tenancy_fixed_term', 'is_fixed_term']);
  if (fixedTerm !== null && fixedTerm !== undefined) {
    base.tenancy.fixed_term = coerceBoolean(fixedTerm);
  }
  base.tenancy.fixed_term_months ??= getWizardValue(wizard, 'tenancy_fixed_term_months');
  base.tenancy.rent_amount ??= getFirstValue(wizard, [
    'case_facts.tenancy.rent_amount',
    'rent_amount',
  ]);
  base.tenancy.rent_frequency ??= (getFirstValue(wizard, [
    'case_facts.tenancy.rent_frequency',
    'rent_frequency',
    'rent_period',
  ]) as any);
  base.tenancy.rent_due_day ??= getFirstValue(wizard, [
    'case_facts.tenancy.rent_due_day',
    'rent_due_day',
  ]);
  base.tenancy.deposit_amount ??= getWizardValue(wizard, 'deposit_amount');
  base.tenancy.deposit_protected ??= getWizardValue(wizard, 'deposit_protected');
  base.tenancy.deposit_scheme_name ??= getWizardValue(wizard, 'deposit_scheme_name');
  base.tenancy.deposit_protection_date ??= getWizardValue(wizard, 'deposit_protection_date');

  // =============================================================================
  // PARTIES - Landlord, agent, solicitor, tenants
  // =============================================================================
  base.parties.landlord.name ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.name',
    'landlord_name',
    'claimant_full_name',
    'pursuer_full_name',
    'landlord.name',
    'landlord_full_name',
  ]);
  base.parties.landlord.co_claimant ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.co_claimant',
    'landlord_co_claimant',
    'claimant_secondary_name',
    'pursuer_secondary_name',
    'claimant_secondary_name',
  ]);
  base.parties.landlord.email ??= getFirstValue(wizard, ['case_facts.parties.landlord.email', 'landlord_email', 'landlord.email']);
  base.parties.landlord.phone ??= getFirstValue(wizard, ['case_facts.parties.landlord.phone', 'landlord_phone', 'landlord.phone']);
  base.parties.landlord.address_line1 ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.address_line1',
    'landlord_address_line1',
    'landlord.address_line1',
    'landlord_address',
  ]);
  base.parties.landlord.address_line2 ??= getFirstValue(wizard, ['case_facts.parties.landlord.address_line2', 'landlord_address_line2', 'landlord.address_line2']);
  base.parties.landlord.city ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.city',
    'landlord_city',
    'landlord.city',
    'landlord_address_town',
  ]);
  base.parties.landlord.postcode ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.postcode',
    'landlord_postcode',
    'landlord.postcode',
    'landlord_address_postcode',
  ]);

  base.parties.agent.name ??= getFirstValue(wizard, ['case_facts.parties.agent.name', 'agent_name', 'agent.name']);
  base.parties.agent.email ??= getFirstValue(wizard, ['case_facts.parties.agent.email', 'agent_email', 'agent.email']);
  base.parties.agent.phone ??= getFirstValue(wizard, ['case_facts.parties.agent.phone', 'agent_phone', 'agent.phone']);
  base.parties.agent.address_line1 ??= getFirstValue(wizard, ['case_facts.parties.agent.address_line1', 'agent_address_line1', 'agent.address_line1']);
  base.parties.agent.address_line2 ??= getFirstValue(wizard, ['case_facts.parties.agent.address_line2', 'agent_address_line2', 'agent.address_line2']);
  base.parties.agent.city ??= getFirstValue(wizard, ['case_facts.parties.agent.city', 'agent_city', 'agent.city']);
  base.parties.agent.postcode ??= getFirstValue(wizard, ['case_facts.parties.agent.postcode', 'agent_postcode', 'agent.postcode']);

  base.parties.solicitor.name ??= getFirstValue(wizard, ['case_facts.parties.solicitor.name', 'solicitor_name', 'solicitor.name']);
  base.parties.solicitor.email ??= getFirstValue(wizard, ['case_facts.parties.solicitor.email', 'solicitor_email', 'solicitor.email']);
  base.parties.solicitor.phone ??= getFirstValue(wizard, ['case_facts.parties.solicitor.phone', 'solicitor_phone', 'solicitor.phone']);
  base.parties.solicitor.address_line1 ??= getFirstValue(wizard, ['case_facts.parties.solicitor.address_line1', 'solicitor_address_line1', 'solicitor.address_line1']);
  base.parties.solicitor.address_line2 ??= getFirstValue(wizard, ['case_facts.parties.solicitor.address_line2', 'solicitor_address_line2', 'solicitor.address_line2']);
  base.parties.solicitor.city ??= getFirstValue(wizard, ['case_facts.parties.solicitor.city', 'solicitor_city', 'solicitor.city']);
  base.parties.solicitor.postcode ??= getFirstValue(wizard, ['case_facts.parties.solicitor.postcode', 'solicitor_postcode', 'solicitor.postcode']);

  if (!base.parties.tenants.length) {
    base.parties.tenants = extractTenants(wizard);
  }

  // =============================================================================
  // ISSUES - Arrears, ASB, other breaches
  // TODO: Add detailed mappings for arrears items and ASB incidents
  // =============================================================================
  base.issues.rent_arrears.has_arrears ??= getFirstValue(wizard, [
    'case_facts.issues.rent_arrears.has_arrears',
    'has_rent_arrears',
    'rent_arrears.has_arrears',
  ]);
  base.issues.rent_arrears.total_arrears ??= getFirstValue(wizard, [
    'case_facts.issues.rent_arrears.total_arrears',
    'total_arrears',
    'arrears_total',
    'rent_arrears.total_arrears',
  ]);
  if (!base.issues.rent_arrears.arrears_items.length) {
    const arrearsItems = getFirstValue(wizard, ['case_facts.issues.rent_arrears.arrears_items', 'arrears_items']);
    if (Array.isArray(arrearsItems)) {
      base.issues.rent_arrears.arrears_items = arrearsItems as any;
    } else if (
      arrearsItems &&
      typeof arrearsItems === 'object' &&
      Array.isArray((arrearsItems as any).arrears_items)
    ) {
      base.issues.rent_arrears.arrears_items = (arrearsItems as any).arrears_items;
    }
  }

  base.issues.asb.has_asb ??= getFirstValue(wizard, ['case_facts.issues.asb.has_asb', 'has_asb', 'asb.has_asb']);
  base.issues.asb.description ??= getFirstValue(wizard, ['case_facts.issues.asb.description', 'asb_description', 'asb.description']);

  base.issues.other_breaches.has_breaches ??= getFirstValue(wizard, [
    'case_facts.issues.other_breaches.has_breaches',
    'has_other_breaches',
    'other_breaches.has_breaches',
  ]);
  base.issues.other_breaches.description ??= getFirstValue(wizard, [
    'case_facts.issues.other_breaches.description',
    'other_breaches_description',
    'other_breaches.description',
  ]);

  // =============================================================================
  // NOTICE - Section 8, Section 21, etc.
  // TODO: Add mappings for notice details
  // =============================================================================
  base.notice.notice_type ??= getFirstValue(wizard, ['case_facts.notice.notice_type', 'notice_type', 'notice_reason']);
  base.notice.notice_date ??= getFirstValue(wizard, ['case_facts.notice.notice_date', 'notice_date']);
  base.notice.expiry_date ??= getFirstValue(wizard, ['case_facts.notice.expiry_date', 'notice_expiry_date', 'expiry_date']);
  base.notice.service_method ??= getFirstValue(wizard, ['case_facts.notice.service_method', 'notice_service_method', 'service_method']);
  base.notice.served_by ??= getFirstValue(wizard, ['case_facts.notice.served_by', 'notice_served_by', 'served_by']);

  // =============================================================================
  // COURT - Claim amounts and form requirements
  // TODO: Add mappings for court details
  // =============================================================================
  base.court.route ??= getFirstValue(wizard, [
    'money_claim_route',
    'case_facts.court.route',
    'court_route',
    'claim_type',
  ]);
  base.court.claim_amount_rent ??= getFirstValue(wizard, [
    'case_facts.court.claim_amount_rent',
    'claim_amount_rent',
    'total_arrears',
    'arrears_total',
  ]);
  base.court.claim_amount_costs ??= getFirstValue(wizard, ['case_facts.court.claim_amount_costs', 'claim_amount_costs']);
  base.court.claim_amount_other ??= getFirstValue(wizard, ['case_facts.court.claim_amount_other', 'claim_amount_other']);
  base.court.total_claim_amount ??= getFirstValue(wizard, ['case_facts.court.total_claim_amount', 'total_claim_amount']);
  base.court.claimant_reference ??= getFirstValue(wizard, ['case_facts.court.claimant_reference', 'claimant_reference']);
  base.court.court_name ??= getFirstValue(wizard, ['case_facts.court.court_name', 'court_name', 'preferred_court', 'sheriffdom']);
  base.court.particulars_of_claim ??= getFirstValue(wizard, ['case_facts.court.particulars_of_claim', 'particulars_of_claim']);
  base.court.n5_required ??= getWizardValue(wizard, 'n5_required');
  base.court.n119_required ??= getWizardValue(wizard, 'n119_required');
  base.court.n1_required ??= getWizardValue(wizard, 'n1_required');
  base.court.scotland_form3a_required ??= getWizardValue(wizard, 'scotland_form3a_required');
  base.court.scotland_form_e_required ??= getWizardValue(wizard, 'scotland_form_e_required');

  // =============================================================================
  // EVIDENCE - Upload tracking
  // TODO: Add mappings for evidence fields if stored flat
  // =============================================================================
  base.evidence.tenancy_agreement_uploaded = Boolean(
    getFirstValue(wizard, ['case_facts.evidence.tenancy_agreement_uploaded', 'evidence.tenancy_agreement_uploaded', 'tenancy_agreement_uploaded']) ??
      base.evidence.tenancy_agreement_uploaded
  );
  base.evidence.rent_schedule_uploaded = Boolean(
    getFirstValue(wizard, ['case_facts.evidence.rent_schedule_uploaded', 'evidence.rent_schedule_uploaded', 'rent_schedule_uploaded']) ??
      base.evidence.rent_schedule_uploaded
  );
  base.evidence.bank_statements_uploaded = Boolean(
    getFirstValue(wizard, ['case_facts.evidence.bank_statements_uploaded', 'evidence.bank_statements_uploaded', 'bank_statements_uploaded']) ??
      base.evidence.bank_statements_uploaded
  );
  base.evidence.safety_certificates_uploaded = Boolean(
    getFirstValue(wizard, ['case_facts.evidence.safety_certificates_uploaded', 'evidence.safety_certificates_uploaded', 'safety_certificates_uploaded']) ??
      base.evidence.safety_certificates_uploaded
  );
  base.evidence.asb_evidence_uploaded = Boolean(
    getFirstValue(wizard, ['case_facts.evidence.asb_evidence_uploaded', 'evidence.asb_evidence_uploaded']) ??
      base.evidence.asb_evidence_uploaded
  );
  base.evidence.other_evidence_uploaded = Boolean(
    getFirstValue(wizard, ['case_facts.evidence.other_evidence_uploaded', 'evidence.other_evidence_uploaded', 'other_evidence_uploaded']) ??
      base.evidence.other_evidence_uploaded
  );
  const missingEvidenceNotes = getFirstValue(wizard, ['case_facts.evidence.missing_evidence_notes', 'evidence.missing_evidence_notes']);
  if (Array.isArray(missingEvidenceNotes)) {
    base.evidence.missing_evidence_notes = missingEvidenceNotes as string[];
  }

  // =============================================================================
  // SERVICE CONTACT - Service address for legal documents
  // TODO: Add mappings for service contact details
  // =============================================================================
  base.service_contact.has_override ??= getFirstValue(wizard, ['case_facts.service_contact.has_override', 'service_address_override']);
  base.service_contact.service_name ??= getFirstValue(wizard, ['case_facts.service_contact.service_name', 'service_contact.service_name', 'service_name']);
  base.service_contact.service_address_line1 ??= getFirstValue(wizard, ['case_facts.service_contact.service_address_line1', 'service_contact.service_address_line1', 'service_address_line1']);
  base.service_contact.service_address_line2 ??= getFirstValue(wizard, ['case_facts.service_contact.service_address_line2', 'service_contact.service_address_line2', 'service_address_line2']);
  base.service_contact.service_city ??= getFirstValue(wizard, ['case_facts.service_contact.service_city', 'service_contact.service_city', 'service_city']);
  base.service_contact.service_postcode ??= getFirstValue(wizard, ['case_facts.service_contact.service_postcode', 'service_contact.service_postcode', 'service_postcode']);
  base.service_contact.service_email ??= getFirstValue(wizard, ['case_facts.service_contact.service_email', 'service_contact.service_email', 'service_email']);
  base.service_contact.service_phone ??= getFirstValue(wizard, ['case_facts.service_contact.service_phone', 'service_contact.service_phone', 'service_phone']);

  // =============================================================================
  // MONEY CLAIM - Claim breakdown, interest, pre-action
  // =============================================================================
  const paymentDay = getFirstValue(wizard, [
    'money_claim_payment_day',
    'payment_day',
    'tenancy_payment_day',
    'rent_due_day',
    'case_facts.money_claim.payment_day',
  ]);
  if (paymentDay !== null && paymentDay !== undefined) {
    base.money_claim.payment_day = typeof paymentDay === 'string' ? Number(paymentDay) || paymentDay : (paymentDay as any);
  }
  const damageClaim = getFirstValue(wizard, ['damage_claim', 'case_facts.money_claim.damage_claim', 'claim_damages']);
  if (damageClaim !== null && damageClaim !== undefined) {
    base.money_claim.damage_claim = coerceBoolean(damageClaim);
  }

  if (!base.money_claim.damage_items.length) {
    const damageItems = getFirstValue(wizard, ['damage_items', 'case_facts.money_claim.damage_items', 'damage_items_description']);
    if (Array.isArray(damageItems)) {
      base.money_claim.damage_items = damageItems as any;
    } else if (typeof damageItems === 'string' && damageItems.trim()) {
      base.money_claim.damage_items = [{ description: damageItems }];
    }
  }

  if (!base.money_claim.other_charges.length) {
    const otherCharges = getFirstValue(wizard, ['other_charges', 'case_facts.money_claim.other_charges']);
    if (Array.isArray(otherCharges)) {
      base.money_claim.other_charges = otherCharges as any;
    } else if (typeof otherCharges === 'string' && otherCharges.trim()) {
      base.money_claim.other_charges = [{ description: otherCharges }];
    }
  }

  const chargeInterest = getFirstValue(wizard, ['charge_interest', 'case_facts.money_claim.charge_interest']);
  if (chargeInterest !== null && chargeInterest !== undefined) {
    base.money_claim.charge_interest = coerceBoolean(chargeInterest);
  }
  base.money_claim.interest_start_date ??= getFirstValue(wizard, [
    'interest_start_date',
    'case_facts.money_claim.interest_start_date',
  ]);
  const interestRate = getFirstValue(wizard, ['interest_rate', 'case_facts.money_claim.interest_rate']);
  if (interestRate !== null && interestRate !== undefined) {
    base.money_claim.interest_rate = typeof interestRate === 'string' ? Number(interestRate) || null : (interestRate as any);
  }
  const solicitorCosts = getFirstValue(wizard, ['solicitor_costs', 'case_facts.money_claim.solicitor_costs']);
  if (solicitorCosts !== null && solicitorCosts !== undefined) {
    base.money_claim.solicitor_costs =
      typeof solicitorCosts === 'string' ? Number(solicitorCosts) || null : (solicitorCosts as any);
  }
  base.money_claim.attempts_to_resolve ??= getFirstValue(wizard, [
    'attempts_to_resolve',
    'payment_attempts',
    'case_facts.money_claim.attempts_to_resolve',
  ]);
  const lbaSent = getFirstValue(wizard, ['lba_sent', 'case_facts.money_claim.lba_sent']);
  if (lbaSent !== null && lbaSent !== undefined) {
    base.money_claim.lba_sent = coerceBoolean(lbaSent);
  }
  base.money_claim.lba_date ??= getFirstValue(wizard, ['lba_date', 'case_facts.money_claim.lba_date']);
  base.money_claim.lba_method ??= getFirstValue(wizard, ['lba_method', 'case_facts.money_claim.lba_method']);
  base.money_claim.lba_response_deadline ??= getFirstValue(wizard, [
    'lba_response_deadline',
    'case_facts.money_claim.lba_response_deadline',
  ]);
  const papDocumentsSent = getFirstValue(wizard, [
    'pap_documents_sent',
    'lba_documents_sent',
    'pre_action_docs_sent',
    'case_facts.money_claim.pap_documents_sent',
  ]);
  if (papDocumentsSent !== null && papDocumentsSent !== undefined) {
    base.money_claim.pap_documents_sent = Array.isArray(papDocumentsSent)
      ? (papDocumentsSent as string[])
      : [papDocumentsSent as any];
  }
  const tenantResponded = getFirstValue(wizard, [
    'tenant_responded',
    'defendant_response',
    'case_facts.money_claim.tenant_responded',
    'pre_action_reply_received',
  ]);
  if (tenantResponded !== null && tenantResponded !== undefined) {
    base.money_claim.tenant_responded = coerceBoolean(tenantResponded);
  }
  base.money_claim.tenant_response_details ??= getFirstValue(wizard, [
    'tenant_response_details',
    'pre_action_reply_details',
    'case_facts.money_claim.tenant_response_details',
  ]);
  const lbaSecondSent = getFirstValue(wizard, ['lba_second_sent', 'case_facts.money_claim.lba_second_sent']);
  if (lbaSecondSent !== null && lbaSecondSent !== undefined) {
    base.money_claim.lba_second_sent = coerceBoolean(lbaSecondSent);
  }
  base.money_claim.lba_second_date ??= getFirstValue(wizard, [
    'lba_second_date',
    'case_facts.money_claim.lba_second_date',
    'pre_action_second_date',
  ]);
  base.money_claim.lba_second_method ??= getFirstValue(wizard, [
    'lba_second_method',
    'case_facts.money_claim.lba_second_method',
    'pre_action_second_method',
  ]);
  base.money_claim.lba_second_response_deadline ??= getFirstValue(wizard, [
    'lba_second_response_deadline',
    'case_facts.money_claim.lba_second_response_deadline',
  ]);
  const preActionDeadlineConfirm = getFirstValue(wizard, [
    'pre_action_deadline_confirmation',
    'pre_action_letter_14day',
    'case_facts.money_claim.pre_action_deadline_confirmation',
  ]);
  if (preActionDeadlineConfirm !== null && preActionDeadlineConfirm !== undefined) {
    base.money_claim.pre_action_deadline_confirmation = coerceBoolean(preActionDeadlineConfirm);
  }
  base.money_claim.signatory_name ??= getFirstValue(wizard, ['signatory_name', 'case_facts.money_claim.signatory_name']);
  base.money_claim.signature_date ??= getFirstValue(wizard, ['signature_date', 'case_facts.money_claim.signature_date']);
  base.money_claim.sheriffdom ??= getFirstValue(wizard, ['sheriffdom', 'case_facts.money_claim.sheriffdom']);
  const courtJurisdictionConfirmed = getFirstValue(wizard, [
    'court_jurisdiction_confirmed',
    'case_facts.money_claim.court_jurisdiction_confirmed',
  ]);
  if (courtJurisdictionConfirmed !== null && courtJurisdictionConfirmed !== undefined) {
    base.money_claim.court_jurisdiction_confirmed = coerceBoolean(courtJurisdictionConfirmed);
  }
  base.money_claim.lodging_method ??= getFirstValue(wizard, [
    'lodging_method',
    'case_facts.money_claim.lodging_method',
  ]);
  base.money_claim.demand_letter_date ??= getFirstValue(wizard, ['demand_letter_date', 'case_facts.money_claim.demand_letter_date']);
  base.money_claim.second_demand_date ??= getFirstValue(wizard, ['second_demand_date', 'case_facts.money_claim.second_demand_date']);
  base.money_claim.evidence_summary ??= getFirstValue(wizard, ['evidence_summary', 'case_facts.money_claim.evidence_summary']);
  const basisOfClaim = getFirstValue(wizard, ['basis_of_claim', 'case_facts.money_claim.basis_of_claim']);
  if (Array.isArray(basisOfClaim)) {
    const hasRent = basisOfClaim.includes('rent_arrears');
    const hasDamage = basisOfClaim.includes('property_damage');
    if (hasRent && hasDamage) base.money_claim.basis_of_claim = 'both' as any;
    else if (hasDamage) base.money_claim.basis_of_claim = 'damages' as any;
    else if (hasRent) base.money_claim.basis_of_claim = 'rent_arrears' as any;
  } else if (basisOfClaim !== null && basisOfClaim !== undefined) {
    if (basisOfClaim === 'property_damage') base.money_claim.basis_of_claim = 'damages' as any;
    else base.money_claim.basis_of_claim = basisOfClaim as any;
  }

  const arrearsScheduleConfirmed = getFirstValue(wizard, [
    'arrears_schedule_confirmed',
    'arrears_schedule_confirm',
    'case_facts.money_claim.arrears_schedule_confirmed',
  ]);
  if (arrearsScheduleConfirmed !== null && arrearsScheduleConfirmed !== undefined) {
    base.money_claim.arrears_schedule_confirmed = coerceBoolean(arrearsScheduleConfirmed);
  }

  const evidenceTypesAvailable = getFirstValue(wizard, [
    'evidence_types_available',
    'case_facts.money_claim.evidence_types_available',
  ]);
  if (evidenceTypesAvailable !== null && evidenceTypesAvailable !== undefined) {
    base.money_claim.evidence_types_available = Array.isArray(evidenceTypesAvailable)
      ? (evidenceTypesAvailable as string[])
      : [evidenceTypesAvailable as any];
  }

  const papDocumentsServed = getFirstValue(wizard, [
    'pap_documents_served',
    'pre_action_letter_served',
    'case_facts.money_claim.pap_documents_served',
  ]);
  if (papDocumentsServed !== null && papDocumentsServed !== undefined) {
    base.money_claim.pap_documents_served = coerceBoolean(papDocumentsServed);
  }
  base.money_claim.pap_service_method ??= getFirstValue(wizard, [
    'pap_service_method',
    'pre_action_service_method',
    'case_facts.money_claim.pap_service_method',
  ]);
  base.money_claim.pap_service_proof ??= getFirstValue(wizard, [
    'pap_service_proof',
    'pre_action_service_proof',
    'case_facts.money_claim.pap_service_proof',
  ]);

  base.money_claim.preferred_issue_route ??= getFirstValue(wizard, [
    'preferred_issue_route',
    'court_issue_route',
    'case_facts.money_claim.preferred_issue_route',
  ]);
  base.money_claim.claim_value_band ??= getFirstValue(wizard, [
    'claim_value_band',
    'case_facts.money_claim.claim_value_band',
  ]);
  const helpWithFees = getFirstValue(wizard, [
    'help_with_fees_needed',
    'case_facts.money_claim.help_with_fees_needed',
  ]);
  if (helpWithFees !== null && helpWithFees !== undefined) {
    base.money_claim.help_with_fees_needed = coerceBoolean(helpWithFees);
  }
  const enforcementPreferences = getFirstValue(wizard, [
    'enforcement_preferences',
    'case_facts.money_claim.enforcement_preferences',
  ]);
  if (enforcementPreferences !== null && enforcementPreferences !== undefined) {
    base.money_claim.enforcement_preferences = Array.isArray(enforcementPreferences)
      ? (enforcementPreferences as string[])
      : [enforcementPreferences as any];
  }
  base.money_claim.enforcement_notes ??= getFirstValue(wizard, [
    'enforcement_notes',
    'case_facts.money_claim.enforcement_notes',
  ]);

  // ---------------------------------------------------------------------------
  // CASE HEALTH - compute contradictions, missing evidence, compliance warnings
  // ---------------------------------------------------------------------------
  base.case_health = computeCaseHealth(base, wizard);

  return base;
}
