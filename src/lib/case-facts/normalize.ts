/**
 * normalize.ts - Mapping between flat WizardFacts (DB) and nested CaseFacts (domain)
 *
 * This file handles the conversion from the flat storage format to the nested
 * domain model used by document generators and analysis tools.
 */

import type { WizardFacts, CaseFacts, PartyDetails } from './schema';
import { createEmptyCaseFacts } from './schema';
import { normalizeRoutes, getPrimaryRoute, routeToDocumentType } from '../wizard/route-normalizer';

/**
 * Helper to safely get a value from flat wizard facts using dot notation.
 * Supports legacy keys (e.g., landlord_name) and case_facts-prefixed MQS paths.
 * Also supports nested object access (e.g., wizard.property.address_line1).
 */
function getWizardValue(wizard: WizardFacts, key: string): any {
  // First try direct key lookup (flat key with dots as string)
  const direct = wizard[key];
  if (direct !== undefined && direct !== null) return direct;

  // Try normalized key
  const normalizedKey = key.replace(/^case_facts\./, '').replace(/\[(\d+)\]/g, '.$1');
  const normalizedValue = wizard[normalizedKey];
  if (normalizedValue !== undefined && normalizedValue !== null) return normalizedValue;

  // Try nested object path navigation (for section-based wizards)
  const parts = normalizedKey.split('.');
  let current: any = wizard;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = null;
      break;
    }
  }
  if (current !== undefined && current !== null) return current;

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
        // We can't reassign the parent reference safely here, so if the
        // structure is wrong we just bail out rather than corrupt it.
        return;
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
    getWizardValue(wizard, 'tenant_full_name') ||  // IMPORTANT: Notice Only YAML maps to this
    getWizardValue(wizard, 'tenant1_name') ||
    getWizardValue(wizard, 'defendant_name_1') ||
    getWizardValue(wizard, 'defendant_full_name') ||
    getWizardValue(wizard, 'defender_full_name') ||
    getWizardValue(wizard, 'defendant_name');

  if (explicitPrimaryName) {
    tenants.push({
      name: explicitPrimaryName,
      email:
        getWizardValue(wizard, 'tenant_email') ||
        getWizardValue(wizard, 'tenant1_email') ||
        getWizardValue(wizard, 'defendant_email') ||
        getWizardValue(wizard, 'defender_email') ||
        getWizardValue(wizard, 'defender_contact'),
      phone:
        getWizardValue(wizard, 'tenant_phone') ||
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
        name:
          getWizardValue(wizard, `tenants.${index}.full_name`) ||
          getWizardValue(wizard, `tenants.${index}.name`),
        email: getWizardValue(wizard, `tenants.${index}.email`),
        phone:
          getWizardValue(wizard, `tenants.${index}.phone`) ||
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

function computeCaseHealth(base: CaseFacts): CaseFacts['case_health'] {
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
    compliance_warnings.push(
      'No supporting evidence flagged (tenancy agreement, statements, or other evidence).'
    );
  }

  // Contradictions (simple heuristics)
  if (
    base.issues.rent_arrears.has_arrears === false &&
    (base.issues.rent_arrears.total_arrears ?? 0) > 0
  ) {
    contradictions.push(
      'Marked as having no rent arrears but a positive arrears total was provided.'
    );
  }

  if (
    base.money_claim.tenant_responded === true &&
    !hasString(base.money_claim.tenant_response_details)
  ) {
    contradictions.push(
      'Tenant is marked as having responded, but no response details were provided.'
    );
  }

  if (
    (base.issues.rent_arrears.total_arrears ?? 0) === 0 &&
    base.money_claim.basis_of_claim === 'rent_arrears'
  ) {
    contradictions.push(
      'Basis of claim is rent arrears but total arrears is recorded as £0.'
    );
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
  // META - Product, tier, jurisdiction, case id
  // =============================================================================
  base.meta = {
    product: wizard.__meta?.product ?? (wizard as any).product ?? null,
    original_product: wizard.__meta?.original_product ?? (wizard as any).product ?? null,
    product_tier: wizard.__meta?.product_tier ?? (wizard as any).product_tier ?? null,
    jurisdiction:
      wizard.__meta?.jurisdiction ??
      (wizard as any).jurisdiction ??
      null,
    case_id:
      wizard.__meta?.case_id ??
      (wizard as any).case_id ??
      null,
  };

  // =============================================================================
  // PROPERTY - Address and details
  // =============================================================================
  base.property.address_line1 ??= getFirstValue(wizard, [
    'case_facts.property.address_line1',
    'property_address.address_line1',
    'property_address',
    'property_address_line1',
    'property.address_line1',
  ]);
  base.property.address_line2 ??= getFirstValue(wizard, [
    'case_facts.property.address_line2',
    'property_address.address_line2',
    'property_address_line2',
    'property.address_line2',
  ]);
  base.property.city ??= getFirstValue(wizard, [
    'case_facts.property.city',
    'property_address.city',
    'property_city',
    'property.city',
    'property_address_town',
  ]);
  base.property.postcode ??= getFirstValue(wizard, [
    'case_facts.property.postcode',
    'property_address.postcode',
    'property_postcode',
    'property.postcode',
    'property_address_postcode',
  ]);
  base.property.country ??= getFirstValue(wizard, [
    'case_facts.property.country',
    'property_country',
    'jurisdiction',
  ]) as any;
  const propertyIsHmo = getFirstValue(wizard, [
    'case_facts.property.is_hmo',
    'property_is_hmo',
    'is_hmo',
    'property.is_hmo',
  ]);
  if (propertyIsHmo !== null) {
    base.property.is_hmo = coerceBoolean(propertyIsHmo);
  }

  // Keep nested address object in sync for callers that use property.address.*
  if (!base.property.address) {
    base.property.address = {
      line1: base.property.address_line1,
      line2: base.property.address_line2,
      city: base.property.city,
      postcode: base.property.postcode,
    };
  } else {
    base.property.address.line1 ??= base.property.address_line1;
    base.property.address.line2 ??= base.property.address_line2;
    base.property.address.city ??= base.property.city;
    base.property.address.postcode ??= base.property.postcode;
  }

  // =============================================================================
  // TENANCY - Dates, rent, deposit
  // =============================================================================
  base.tenancy.tenancy_type =
    (getWizardValue(wizard, 'tenancy_type') as any) || base.tenancy.tenancy_type;
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
  base.tenancy.rent_frequency ??= getFirstValue(wizard, [
    'case_facts.tenancy.rent_frequency',
    'rent_frequency',
    'rent_period',
  ]) as any;
  base.tenancy.rent_due_day ??= getFirstValue(wizard, [
    'case_facts.tenancy.rent_due_day',
    'rent_due_day',
  ]);
  base.tenancy.usual_payment_weekday ??= getFirstValue(wizard, [
    'case_facts.tenancy.usual_payment_weekday',
    'usual_payment_weekday',
  ]);
  base.tenancy.deposit_amount ??= getWizardValue(wizard, 'deposit_amount');
  base.tenancy.deposit_protected ??= getWizardValue(wizard, 'deposit_protected');
  base.tenancy.deposit_scheme_name ??= getWizardValue(wizard, 'deposit_scheme_name');
  base.tenancy.deposit_protection_date ??= getWizardValue(
    wizard,
    'deposit_protection_date'
  );
  base.tenancy.deposit_reference ??= getWizardValue(wizard, 'deposit_reference');

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
  base.parties.landlord.email ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.email',
    'landlord_email',
    'claimant_email',
    'pursuer_email',
    'landlord.email',
  ]);
  base.parties.landlord.phone ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.phone',
    'landlord_phone',
    'claimant_phone',
    'pursuer_phone',
    'landlord.phone',
  ]);
  base.parties.landlord.address_line1 ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.address_line1',
    'landlord_address_line1',
    'claimant_address.address_line1',
    'pursuer_address.address_line1',
    'landlord.address_line1',
    'landlord_address',
  ]);
  base.parties.landlord.address_line2 ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.address_line2',
    'landlord_address_line2',
    'claimant_address.address_line2',
    'pursuer_address.address_line2',
    'landlord.address_line2',
  ]);
  base.parties.landlord.city ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.city',
    'landlord_city',
    'claimant_address.city',
    'pursuer_address.city',
    'landlord.city',
    'landlord_address_town',
  ]);
  base.parties.landlord.postcode ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.postcode',
    'landlord_postcode',
    'claimant_address.postcode',
    'pursuer_address.postcode',
    'landlord.postcode',
    'landlord_address_postcode',
  ]);

  base.parties.agent.name ??= getFirstValue(wizard, [
    'case_facts.parties.agent.name',
    'agent_name',
    'agent.name',
  ]);
  base.parties.agent.email ??= getFirstValue(wizard, [
    'case_facts.parties.agent.email',
    'agent_email',
    'agent.email',
  ]);
  base.parties.agent.phone ??= getFirstValue(wizard, [
    'case_facts.parties.agent.phone',
    'agent_phone',
    'agent.phone',
  ]);
  base.parties.agent.address_line1 ??= getFirstValue(wizard, [
    'case_facts.parties.agent.address_line1',
    'agent_address_line1',
    'agent.address_line1',
  ]);
  base.parties.agent.address_line2 ??= getFirstValue(wizard, [
    'case_facts.parties.agent.address_line2',
    'agent_address_line2',
    'agent.address_line2',
  ]);
  base.parties.agent.city ??= getFirstValue(wizard, [
    'case_facts.parties.agent.city',
    'agent_city',
    'agent.city',
  ]);
  base.parties.agent.postcode ??= getFirstValue(wizard, [
    'case_facts.parties.agent.postcode',
    'agent_postcode',
    'agent.postcode',
  ]);

  base.parties.solicitor.name ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.name',
    'solicitor_name',
    'solicitor.name',
  ]);
  base.parties.solicitor.email ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.email',
    'solicitor_email',
    'solicitor.email',
  ]);
  base.parties.solicitor.phone ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.phone',
    'solicitor_phone',
    'solicitor.phone',
  ]);
  base.parties.solicitor.address_line1 ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.address_line1',
    'solicitor_address_line1',
    'solicitor.address_line1',
  ]);
  base.parties.solicitor.address_line2 ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.address_line2',
    'solicitor_address_line2',
    'solicitor.address_line2',
  ]);
  base.parties.solicitor.city ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.city',
    'solicitor_city',
    'solicitor.city',
  ]);
  base.parties.solicitor.postcode ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.postcode',
    'solicitor_postcode',
    'solicitor.postcode',
  ]);

  if (!base.parties.tenants.length) {
    base.parties.tenants = extractTenants(wizard);
  }

  // =============================================================================
  // ISSUES - Arrears, ASB, other breaches, Section 8 grounds, AST verification
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
  base.issues.rent_arrears.arrears_at_notice_date ??= getFirstValue(wizard, [
    'case_facts.issues.rent_arrears.arrears_at_notice_date',
    'arrears_at_notice_date',
    'arrears_summary.arrears_at_notice_date',
  ]);
  if (!base.issues.rent_arrears.arrears_items.length) {
    const arrearsItems = getFirstValue(wizard, [
      'case_facts.issues.rent_arrears.arrears_items',
      'arrears_items',
    ]);
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
  // Scotland pre-action requirements
  const preActionConfirmed = getFirstValue(wizard, [
    'case_facts.issues.rent_arrears.pre_action_confirmed',
    'pre_action_contact',
    'pre_action_confirmed',
  ]);
  if (preActionConfirmed !== null && preActionConfirmed !== undefined) {
    base.issues.rent_arrears.pre_action_confirmed = coerceBoolean(preActionConfirmed);
  }

  base.issues.asb.has_asb ??= getFirstValue(wizard, [
    'case_facts.issues.asb.has_asb',
    'has_asb',
    'asb.has_asb',
  ]);
  base.issues.asb.description ??= getFirstValue(wizard, [
    'case_facts.issues.asb.description',
    'asb_description',
    'asb.description',
  ]);

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

  // Keep "breaches" alias in sync for case-intel / evidence helpers
  (base.issues as any).breaches ??= base.issues.other_breaches;

  // Section 8 ground-specific details (England & Wales)
  const section8Grounds = getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.selected_grounds',
    'section8_grounds',
    'selected_grounds',
  ]);
  if (Array.isArray(section8Grounds)) {
    base.issues.section8_grounds.selected_grounds = section8Grounds as string[];
  } else if (section8Grounds && typeof section8Grounds === 'string') {
    base.issues.section8_grounds.selected_grounds = [section8Grounds];
  }

  base.issues.section8_grounds.arrears_breakdown ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.arrears_breakdown',
    'arrears_breakdown',
    'section8_arrears_details',
  ]);
  base.issues.section8_grounds.incident_log ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.incident_log',
    'asb_details',
    'section8_other_grounds_narrative',
  ]);
  base.issues.section8_grounds.breach_details ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.breach_details',
    'ground12_details',
    'tenancy_clause_breached',
  ]);
  base.issues.section8_grounds.damage_schedule ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.damage_schedule',
    'damage_details',
    'deterioration_description',
  ]);
  base.issues.section8_grounds.false_statement_details ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.false_statement_details',
    'ground17_details',
    'false_statement_description',
  ]);

  // N5B AST verification (for accelerated possession)
  const astIsAst = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.is_ast',
    'ast_is_ast',
  ]);
  if (astIsAst !== null && astIsAst !== undefined) {
    base.issues.ast_verification.is_ast = coerceBoolean(astIsAst);
  }
  const astNotAgricultural = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_agricultural',
    'ast_not_agricultural',
  ]);
  if (astNotAgricultural !== null && astNotAgricultural !== undefined) {
    base.issues.ast_verification.not_agricultural = coerceBoolean(astNotAgricultural);
  }
  const astNotBusiness = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_business',
    'ast_not_business',
  ]);
  if (astNotBusiness !== null && astNotBusiness !== undefined) {
    base.issues.ast_verification.not_business = coerceBoolean(astNotBusiness);
  }
  const astNotLongLease = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_long_lease',
    'ast_not_long_lease',
  ]);
  if (astNotLongLease !== null && astNotLongLease !== undefined) {
    base.issues.ast_verification.not_long_lease = coerceBoolean(astNotLongLease);
  }
  const astNotFormerSecure = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_former_secure',
    'ast_not_former_secure',
  ]);
  if (astNotFormerSecure !== null && astNotFormerSecure !== undefined) {
    base.issues.ast_verification.not_former_secure = coerceBoolean(astNotFormerSecure);
  }
  const astNotExcluded = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_excluded',
    'ast_not_excluded',
  ]);
  if (astNotExcluded !== null && astNotExcluded !== undefined) {
    base.issues.ast_verification.not_excluded = coerceBoolean(astNotExcluded);
  }
  const astStandardRent = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.standard_rent',
    'ast_standard_rent',
  ]);
  if (astStandardRent !== null && astStandardRent !== undefined) {
    base.issues.ast_verification.standard_rent = coerceBoolean(astStandardRent);
  }

  // =============================================================================
  // NOTICE - Section 8, Section 21, etc.
  // =============================================================================

  // ROUTE NORMALIZATION: Convert user's route intent to canonical format
  // Handles legacy human-readable labels (e.g., "Section 8 - rent arrears / breach")
  // and new canonical values (e.g., "section_8")
  const evictionRouteIntent = getFirstValue(wizard, [
    'eviction_route_intent',
    'eviction_route',
    'route_intent',
  ]);

  if (evictionRouteIntent) {
    const normalizedRoutes = normalizeRoutes(evictionRouteIntent);
    const primaryRoute = getPrimaryRoute(normalizedRoutes);

    // Store normalized route as notice_type if not already set
    if (primaryRoute && !base.notice.notice_type) {
      base.notice.notice_type = routeToDocumentType(primaryRoute);
    }

    // Also set court.route for consistency
    if (primaryRoute && !base.court.route) {
      base.court.route = primaryRoute;
    }
  }

  base.notice.notice_type ??= getFirstValue(wizard, [
    'case_facts.notice.notice_type',
    'notice_type',
    'notice_reason',
  ]);
  base.notice.notice_date ??= getFirstValue(wizard, [
    'case_facts.notice.notice_date',
    'notice_date',
  ]);
  base.notice.service_date ??= getFirstValue(wizard, [
    'case_facts.notice.service_date',
    'notice_service_date',
    'service_date',
  ]);
  base.notice.expiry_date ??= getFirstValue(wizard, [
    'case_facts.notice.expiry_date',
    'notice_expiry_date',
    'expiry_date',
  ]);
  base.notice.service_method ??= getFirstValue(wizard, [
    'case_facts.notice.service_method',
    'notice_service_method',
    'service_method',
  ]);
  base.notice.served_by ??= getFirstValue(wizard, [
    'case_facts.notice.served_by',
    'notice_served_by',
    'served_by',
  ]);

  // =============================================================================
  // COURT - Claim amounts and form requirements
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
  base.court.claim_amount_costs ??= getFirstValue(wizard, [
    'case_facts.court.claim_amount_costs',
    'claim_amount_costs',
  ]);
  base.court.claim_amount_other ??= getFirstValue(wizard, [
    'case_facts.court.claim_amount_other',
    'claim_amount_other',
  ]);
  base.court.total_claim_amount ??= getFirstValue(wizard, [
    'case_facts.court.total_claim_amount',
    'total_claim_amount',
  ]);
  base.court.claimant_reference ??= getFirstValue(wizard, [
    'case_facts.court.claimant_reference',
    'claimant_reference',
  ]);
  base.court.court_name ??= getFirstValue(wizard, [
    'case_facts.court.court_name',
    'court_name',
    'preferred_court',
    'sheriffdom',
  ]);
  base.court.particulars_of_claim ??= getFirstValue(wizard, [
    'case_facts.court.particulars_of_claim',
    'particulars_of_claim',
  ]);
  base.court.n5_required ??= getWizardValue(wizard, 'n5_required');
  base.court.n119_required ??= getWizardValue(wizard, 'n119_required');
  base.court.n1_required ??= getWizardValue(wizard, 'n1_required');
  base.court.scotland_form3a_required ??= getWizardValue(
    wizard,
    'scotland_form3a_required'
  );
  base.court.scotland_form_e_required ??= getWizardValue(
    wizard,
    'scotland_form_e_required'
  );

  // =============================================================================
  // EVIDENCE - Upload tracking
  // =============================================================================
  base.evidence.tenancy_agreement_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.tenancy_agreement_uploaded',
      'evidence.tenancy_agreement_uploaded',
      'tenancy_agreement_uploaded',
    ]) ?? base.evidence.tenancy_agreement_uploaded
  );
  base.evidence.rent_schedule_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.rent_schedule_uploaded',
      'evidence.rent_schedule_uploaded',
      'rent_schedule_uploaded',
    ]) ?? base.evidence.rent_schedule_uploaded
  );
  base.evidence.correspondence_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.correspondence_uploaded',
      'evidence.correspondence_uploaded',
    ]) ?? base.evidence.correspondence_uploaded
  );
  base.evidence.damage_photos_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.damage_photos_uploaded',
      'evidence.damage_photos_uploaded',
      'photos_uploaded',
    ]) ?? base.evidence.damage_photos_uploaded
  );
  base.evidence.authority_letters_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.authority_letters_uploaded',
      'evidence.authority_letters_uploaded',
      'asb_evidence_uploaded',
    ]) ?? base.evidence.authority_letters_uploaded
  );
  base.evidence.bank_statements_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.bank_statements_uploaded',
      'evidence.bank_statements_uploaded',
      'bank_statements_uploaded',
    ]) ?? base.evidence.bank_statements_uploaded
  );
  base.evidence.safety_certificates_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.safety_certificates_uploaded',
      'evidence.safety_certificates_uploaded',
      'safety_certificates_uploaded',
    ]) ?? base.evidence.safety_certificates_uploaded
  );
  base.evidence.asb_evidence_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.asb_evidence_uploaded',
      'evidence.asb_evidence_uploaded',
    ]) ?? base.evidence.asb_evidence_uploaded
  );
  base.evidence.other_evidence_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.other_evidence_uploaded',
      'evidence.other_evidence_uploaded',
      'other_evidence_uploaded',
    ]) ?? base.evidence.other_evidence_uploaded
  );
  const missingEvidenceNotes = getFirstValue(wizard, [
    'case_facts.evidence.missing_evidence_notes',
    'evidence.missing_evidence_notes',
  ]);
  if (Array.isArray(missingEvidenceNotes)) {
    base.evidence.missing_evidence_notes = missingEvidenceNotes as string[];
  }

  const evidenceAnalysis = getFirstValue(wizard, [
    'case_facts.evidence.analysis',
    'evidence.analysis',
  ]);

  if (evidenceAnalysis && typeof evidenceAnalysis === 'object') {
    base.evidence.analysis = evidenceAnalysis as Record<string, any>;
  }

  // =============================================================================
  // SERVICE CONTACT - Service address for legal documents
  // =============================================================================
  base.service_contact.has_override ??= getFirstValue(wizard, [
    'case_facts.service_contact.has_override',
    'service_address_override',
  ]);
  base.service_contact.service_name ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_name',
    'service_contact.service_name',
    'service_name',
  ]);
  base.service_contact.service_address_line1 ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_address_line1',
    'service_contact.service_address_line1',
    'service_address_line1',
  ]);
  base.service_contact.service_address_line2 ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_address_line2',
    'service_contact.service_address_line2',
    'service_address_line2',
  ]);
  base.service_contact.service_address_county ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_address_county',
    'service_contact.service_address_county',
    'service_address_county',
  ]);
  base.service_contact.service_city ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_city',
    'service_contact.service_city',
    'service_city',
  ]);
  base.service_contact.service_postcode ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_postcode',
    'service_contact.service_postcode',
    'service_postcode',
  ]);
  base.service_contact.service_email ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_email',
    'service_contact.service_email',
    'service_email',
  ]);
  base.service_contact.service_phone ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_phone',
    'service_contact.service_phone',
    'service_phone',
  ]);

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
    base.money_claim.payment_day =
      typeof paymentDay === 'string' ? Number(paymentDay) || (paymentDay as any) : (paymentDay as any);
  }
  const damageClaim = getFirstValue(wizard, [
    'damage_claim',
    'case_facts.money_claim.damage_claim',
    'claim_damages',
  ]);
  if (damageClaim !== null && damageClaim !== undefined) {
    base.money_claim.damage_claim = coerceBoolean(damageClaim);
  }

  if (!base.money_claim.damage_items.length) {
    const damageItems = getFirstValue(wizard, [
      'damage_items',
      'case_facts.money_claim.damage_items',
      'damage_items_description',
    ]);
    if (Array.isArray(damageItems)) {
      base.money_claim.damage_items = damageItems as any;
    } else if (typeof damageItems === 'string' && damageItems.trim()) {
      base.money_claim.damage_items = [{ description: damageItems }];
    }
  }

  if (!base.money_claim.other_charges.length) {
    const otherCharges = getFirstValue(wizard, [
      'other_charges',
      'case_facts.money_claim.other_charges',
    ]);
    if (Array.isArray(otherCharges)) {
      base.money_claim.other_charges = otherCharges as any;
    } else if (typeof otherCharges === 'string' && otherCharges.trim()) {
      base.money_claim.other_charges = [{ description: otherCharges }];
    }
  }

  const chargeInterest = getFirstValue(wizard, [
    'charge_interest',
    'case_facts.money_claim.charge_interest',
  ]);
  if (chargeInterest !== null && chargeInterest !== undefined) {
    base.money_claim.charge_interest = coerceBoolean(chargeInterest);
  }
  base.money_claim.interest_start_date ??= getFirstValue(wizard, [
    'interest_start_date',
    'case_facts.money_claim.interest_start_date',
  ]);
  const interestRate = getFirstValue(wizard, [
    'interest_rate',
    'case_facts.money_claim.interest_rate',
  ]);
  if (interestRate !== null && interestRate !== undefined) {
    base.money_claim.interest_rate =
      typeof interestRate === 'string' ? Number(interestRate) || null : (interestRate as any);
  }
  const solicitorCosts = getFirstValue(wizard, [
    'solicitor_costs',
    'case_facts.money_claim.solicitor_costs',
  ]);
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
  base.money_claim.lba_date ??= getFirstValue(wizard, [
    'lba_date',
    'case_facts.money_claim.lba_date',
  ]);
  base.money_claim.lba_method ??= getFirstValue(wizard, [
    'lba_method',
    'case_facts.money_claim.lba_method',
  ]);
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
  const lbaSecondSent = getFirstValue(wizard, [
    'lba_second_sent',
    'case_facts.money_claim.lba_second_sent',
  ]);
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
    base.money_claim.pre_action_deadline_confirmation = coerceBoolean(
      preActionDeadlineConfirm
    );
  }
  base.money_claim.signatory_name ??= getFirstValue(wizard, [
    'signatory_name',
    'case_facts.money_claim.signatory_name',
  ]);
  base.money_claim.signature_date ??= getFirstValue(wizard, [
    'signature_date',
    'case_facts.money_claim.signature_date',
  ]);
  base.money_claim.sheriffdom ??= getFirstValue(wizard, [
    'sheriffdom',
    'case_facts.money_claim.sheriffdom',
  ]);
  const courtJurisdictionConfirmed = getFirstValue(wizard, [
    'court_jurisdiction_confirmed',
    'case_facts.money_claim.court_jurisdiction_confirmed',
  ]);
  if (courtJurisdictionConfirmed !== null && courtJurisdictionConfirmed !== undefined) {
    base.money_claim.court_jurisdiction_confirmed = coerceBoolean(
      courtJurisdictionConfirmed
    );
  }
  base.money_claim.lodging_method ??= getFirstValue(wizard, [
    'lodging_method',
    'case_facts.money_claim.lodging_method',
  ]);
  base.money_claim.demand_letter_date ??= getFirstValue(wizard, [
    'demand_letter_date',
    'case_facts.money_claim.demand_letter_date',
  ]);
  base.money_claim.second_demand_date ??= getFirstValue(wizard, [
    'second_demand_date',
    'case_facts.money_claim.second_demand_date',
  ]);
  base.money_claim.evidence_summary ??= getFirstValue(wizard, [
    'evidence_summary',
    'case_facts.money_claim.evidence_summary',
  ]);
  const basisOfClaim = getFirstValue(wizard, [
    'basis_of_claim',
    'case_facts.money_claim.basis_of_claim',
  ]);
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
    base.money_claim.arrears_schedule_confirmed = coerceBoolean(
      arrearsScheduleConfirmed
    );
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

  // Additional narrative fields for richer AI drafting
  base.money_claim.other_charges_notes ??= getFirstValue(wizard, [
    'other_charges_notes',
    'case_facts.money_claim.other_charges_notes',
  ]);
  base.money_claim.other_costs_notes ??= getFirstValue(wizard, [
    'other_costs_notes',
    'case_facts.money_claim.other_costs_notes',
  ]);
  base.money_claim.other_amounts_summary ??= getFirstValue(wizard, [
    'other_amounts_summary',
    'case_facts.money_claim.other_amounts_summary',
  ]);

  // =============================================================================
  // COMPLIANCE - Gas safety, EPC, How to Rent
  // =============================================================================
  const gasSafety = getFirstValue(wizard, [
    'case_facts.compliance.gas_safety_cert_provided',
    'gas_safety_cert_provided',
    'gas_safety_certificate_provided',
  ]);
  if (gasSafety !== null && gasSafety !== undefined) {
    base.compliance.gas_safety_cert_provided = coerceBoolean(gasSafety);
  }

  const epcProvided = getFirstValue(wizard, [
    'case_facts.compliance.epc_provided',
    'epc_provided',
  ]);
  if (epcProvided !== null && epcProvided !== undefined) {
    base.compliance.epc_provided = coerceBoolean(epcProvided);
  }

  const howToRent = getFirstValue(wizard, [
    'case_facts.compliance.how_to_rent_given',
    'how_to_rent_given',
    'how_to_rent_guide_provided',
  ]);
  if (howToRent !== null && howToRent !== undefined) {
    base.compliance.how_to_rent_given = coerceBoolean(howToRent);
  }

  // Keep "breaches" in sync with "other_breaches" for modules that expect either
  if (!base.issues.breaches) {
    base.issues.breaches = {
      has_breaches: base.issues.other_breaches.has_breaches,
      description: base.issues.other_breaches.description,
    };
  }

  // =============================================================================
  // PROPERTY ADDRESS CONCATENATION
  // Ensure templates receive a single concatenated property_address field
  // =============================================================================

  // Helper to recursively extract string value from nested objects
  const extractStringValue = (part: any): string => {
    if (part === null || part === undefined) return '';
    if (typeof part === 'string') return part.trim();
    if (typeof part === 'number') return String(part).trim();
    if (typeof part === 'boolean') return String(part).trim();

    // Handle objects - try common property names
    if (typeof part === 'object' && !Array.isArray(part)) {
      // Try nested value properties first
      const value = part.value ?? part.label ?? part.text ?? part.content;
      if (value !== null && value !== undefined) {
        // Recursively extract if value is also an object
        return extractStringValue(value);
      }
      // If object has no recognizable properties, try JSON.stringify
      try {
        const keys = Object.keys(part);
        if (keys.length > 0) {
          // Return first non-null value found
          for (const key of keys) {
            const extracted = extractStringValue(part[key]);
            if (extracted) return extracted;
          }
        }
      } catch (e) {
        // Fallback - skip this part
      }
    }

    return '';
  };

  if (base.property.address_line1 || base.property.address_line2 || base.property.city || base.property.postcode) {
    const addressParts = [
      base.property.address_line1,
      base.property.address_line2,
      base.property.city,
      base.property.postcode,
    ]
      .map(extractStringValue)
      .filter(Boolean); // Remove empty strings

    // Add concatenated address for templates that expect property_address
    (base as any).property_address = addressParts.join('\n');

    if (addressParts.length === 0) {
      console.warn('[Normalize] Property address parts found but all extracted as empty');
    } else {
      console.log('[Normalize] Property address concatenated:', addressParts.length, 'parts');
    }
  }

  // =============================================================================
  // TENANT/LANDLORD NAME NORMALIZATION
  // Ensure flat fields exist for templates that expect them
  // =============================================================================
  if (base.parties.tenants.length > 0 && base.parties.tenants[0]?.name) {
    (base as any).tenant_full_name = base.parties.tenants[0].name;
    console.log('[Normalize] Tenant name:', base.parties.tenants[0].name);
  }

  if (base.parties.landlord.name) {
    (base as any).landlord_full_name = base.parties.landlord.name;
    console.log('[Normalize] Landlord name:', base.parties.landlord.name);
  }

  // =============================================================================
  // OBJECT TO STRING FLATTENING (PRESERVE ASK HEAVEN FIELDS)
  // Prevents [object Object] in templates
  // =============================================================================
  Object.keys(base).forEach((key) => {
    const value = (base as any)[key];

    // If it's an object but not Date/Array, flatten it
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      // Check if this is a known nested structure (parties, property, tenancy, etc.)
      // We don't want to flatten these, only unexpected objects
      const knownStructures = [
        'parties',
        'property',
        'tenancy',
        'issues',
        'compliance',
        'money_claim',
        'court',
        'evidence',
        'eviction',
        'meta',
        'case_health',
      ];

      if (knownStructures.includes(key)) {
        // Skip known nested structures
        return;
      }

      console.warn(`[Normalize] Found unexpected object for key "${key}", flattening...`);

      // Special handling for Ask Heaven narrative fields
      if (
        key.includes('particulars') ||
        key.includes('narrative') ||
        key.includes('explanation') ||
        key.includes('summary') ||
        key.includes('description')
      ) {
        // Ask Heaven fields: preserve the full value if it has text content
        if (value.text && typeof value.text === 'string') {
          (base as any)[key] = value.text;
        } else if (value.value && typeof value.value === 'string') {
          (base as any)[key] = value.value;
        } else if (value.content && typeof value.content === 'string') {
          (base as any)[key] = value.content;
        } else {
          // Fallback: try to stringify meaningfully
          (base as any)[key] = JSON.stringify(value);
        }
      } else {
        // Non-narrative fields: standard flattening
        if (value.value !== undefined) {
          (base as any)[key] = value.value;
        } else if (value.label !== undefined) {
          (base as any)[key] = value.label;
        } else if (value.text !== undefined) {
          (base as any)[key] = value.text;
        } else {
          // Last resort: JSON stringify
          (base as any)[key] = JSON.stringify(value);
        }
      }
    }
  });

  console.log('[Normalize] Case facts normalization complete');

  // ---------------------------------------------------------------------------
  // CASE HEALTH - compute contradictions, missing evidence, compliance warnings
  // ---------------------------------------------------------------------------
  base.case_health = computeCaseHealth(base);

  return base;
}

/**
 * Public helper used across APIs (checkpoint / analyze) to normalize
 * whatever we have (flat wizard facts or already-nested case facts)
 * into a full CaseFacts object with up-to-date case_health and meta hints.
 */
export function normalizeCaseFacts(
  input: WizardFacts | CaseFacts | null | undefined
): CaseFacts {
  // If nothing sensible provided, return empty skeleton
  if (!input || typeof input !== 'object') {
    return createEmptyCaseFacts();
  }

  // If it already looks like CaseFacts (nested structure),
  // just ensure case_health is present and up-to-date.
  if (
    (input as any).tenancy &&
    (input as any).property &&
    (input as any).parties
  ) {
    const existing = input as CaseFacts;
    return {
      ...existing,
      case_health: existing.case_health ?? computeCaseHealth(existing),
    };
  }

  // Otherwise treat it as flat WizardFacts and map to CaseFacts
  const wizard = input as WizardFacts;
  const base = wizardFactsToCaseFacts(wizard);

  // Try to enrich meta with jurisdiction / case id if present on flat facts
  const jurisdiction =
    (wizard as any).jurisdiction ||
    (wizard as any).case_jurisdiction ||
    wizard.__meta?.jurisdiction;

  const caseId =
    (wizard as any).case_id ||
    (wizard as any).id ||
    wizard.__meta?.case_id;

  if (jurisdiction && !base.meta.jurisdiction) {
    base.meta.jurisdiction = jurisdiction as any;
  }

  if (caseId && !base.meta.case_id) {
    base.meta.case_id = caseId as any;
  }

  // Always recompute case health on the final object
  base.case_health = computeCaseHealth(base);

  return base;
}

// =============================================================================
// GROUND DEFINITIONS (for Section 8 / England & Wales)
// =============================================================================

/**
 * Official Section 8 ground definitions
 */
const SECTION8_GROUND_DEFINITIONS: Record<number | string, {
  code: number;
  title: string;
  mandatory: boolean;
  legal_basis: string;
  full_text: string;
}> = {
  1: {
    code: 1,
    title: 'Landlord previously occupied as only or principal home',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 1',
    full_text: 'Not later than the beginning of the tenancy, the landlord gave notice that possession might be recovered on this ground; and at some time before the beginning of the tenancy, the landlord (or one of joint landlords) occupied the dwelling-house as his only or principal home.',
  },
  2: {
    code: 2,
    title: 'Mortgage lender requires possession',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 2',
    full_text: 'The dwelling-house is subject to a mortgage granted before the beginning of the tenancy and the mortgagee is entitled to exercise a power of sale and requires possession for the purpose of disposing of the dwelling-house.',
  },
  8: {
    code: 8,
    title: 'Serious rent arrears (at least 8 weeks or 2 months)',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
    full_text: 'At the date of the service of the notice and at the date of the hearing, at least eight weeks\' rent is unpaid if the rent is payable weekly or fortnightly, at least two months\' rent is unpaid if the rent is payable monthly, at least one quarter\'s rent is more than three months in arrears if the rent is payable quarterly, or at least three months\' rent is more than three months in arrears if the rent is payable yearly.',
  },
  10: {
    code: 10,
    title: 'Some rent arrears (unpaid at notice and hearing)',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 10',
    full_text: 'Some rent lawfully due from the tenant is unpaid on the date on which proceedings for possession are begun and was in arrears at the date of service of the notice.',
  },
  11: {
    code: 11,
    title: 'Persistent delay in paying rent',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 11',
    full_text: 'Whether or not any rent is in arrears on the date on which proceedings for possession are begun, the tenant has persistently delayed paying rent which has become lawfully due.',
  },
  12: {
    code: 12,
    title: 'Breach of tenancy obligation',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 12',
    full_text: 'Any obligation of the tenancy (other than one related to the payment of rent) has been broken or not performed.',
  },
  13: {
    code: 13,
    title: 'Deterioration of dwelling',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 13',
    full_text: 'The condition of the dwelling-house or any of the common parts has deteriorated owing to acts of waste by, or the neglect or default of, the tenant or any other person residing in the dwelling-house.',
  },
  14: {
    code: 14,
    title: 'Nuisance or annoyance to neighbours',
    mandatory: false,  // Note: Ground 14 is discretionary, NOT mandatory
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 14',
    full_text: 'The tenant or a person residing in or visiting the dwelling-house has been guilty of conduct causing or likely to cause a nuisance or annoyance to a person residing, visiting or otherwise engaging in a lawful activity in the locality, or has been convicted of using the dwelling-house or allowing it to be used for immoral or illegal purposes, or an arrestable offence committed in, or in the locality of, the dwelling-house.',
  },
  '14A': {
    code: 14,
    title: 'Domestic violence',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 14A',
    full_text: 'The dwelling-house was occupied by a married couple or a couple living together as husband and wife and one or both of the partners is a tenant of the dwelling-house, and the partner who is not a tenant has left because of violence or threats of violence by the other partner.',
  },
  15: {
    code: 15,
    title: 'Deterioration of furniture',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 15',
    full_text: 'The condition of any furniture provided for use under the tenancy has deteriorated owing to ill-treatment by the tenant or any other person residing in the dwelling-house.',
  },
  17: {
    code: 17,
    title: 'False statement induced grant of tenancy',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 17',
    full_text: 'The tenancy was granted on the basis of a false statement knowingly or recklessly made by the tenant or a person acting at the tenant\'s instigation.',
  },
};

/**
 * Build grounds array from wizard facts with proper structure for Form 3 compliance
 */
function buildGroundsArray(wizard: WizardFacts, templateData: Record<string, any>): any[] {
  const selectedGrounds = getWizardValue(wizard, 'section8_grounds');

  if (!selectedGrounds || (Array.isArray(selectedGrounds) && selectedGrounds.length === 0)) {
    return [];
  }

  const groundsList = Array.isArray(selectedGrounds) ? selectedGrounds : [selectedGrounds];

  return groundsList.map((groundStr: string) => {
    // Parse ground number from string like "Ground 8 - Serious rent arrears"
    const match = groundStr.match(/ground\s*([0-9]+a?)/i);
    const groundNumStr = match ? match[1].toUpperCase() : '';
    const groundNum = groundNumStr === '14A' ? '14A' : parseInt(groundNumStr);

    // Look up ground definition
    const groundDef = SECTION8_GROUND_DEFINITIONS[groundNum];

    if (!groundDef) {
      console.warn(`[buildGroundsArray] Unknown ground: ${groundStr}`);
      return {
        code: groundNumStr,
        mandatory: false,
        title: groundStr,
        legal_basis: 'Housing Act 1988, Schedule 2',
        full_text: '',
        explanation: '',
        particulars: '',
      };
    }

    // Build explanation and particulars based on ground type
    let explanation = '';
    let particulars = '';

    if (groundNum === 8) {
      // Ground 8: Serious rent arrears
      const arrears = templateData.arrears_at_notice_date || templateData.total_arrears || 0;
      const rentAmount = templateData.rent_amount || 0;
      const rentFreq = templateData.rent_frequency || 'monthly';

      // Calculate threshold
      let threshold = 0;
      let thresholdDescription = '';
      if (rentFreq === 'weekly') {
        threshold = rentAmount * 8;
        thresholdDescription = '8 weeks';
      } else if (rentFreq === 'fortnightly') {
        threshold = rentAmount * 4; // 8 weeks = 4 fortnights
        thresholdDescription = '8 weeks (4 fortnightly payments)';
      } else if (rentFreq === 'monthly') {
        threshold = rentAmount * 2;
        thresholdDescription = '2 months';
      } else if (rentFreq === 'quarterly') {
        threshold = rentAmount * 1;
        thresholdDescription = '1 quarter';
      }

      // Only include Ground 8 explanation if threshold is met
      if (arrears >= threshold) {
        explanation = `The tenant currently owes £${arrears.toFixed(2)} in rent arrears. The rent is £${rentAmount} payable ${rentFreq}. At the date of service of this notice, the arrears amount to ${thresholdDescription} of rent or more. This satisfies the threshold for Ground 8 under Schedule 2 of the Housing Act 1988 (as amended).`;
        particulars = `Rent arrears at date of notice: £${arrears.toFixed(2)}\nRent amount: £${rentAmount} (${rentFreq})\nThreshold for Ground 8: £${threshold.toFixed(2)} (${thresholdDescription})\n\nGround 8 is a MANDATORY ground. If the arrears still meet the threshold at the date of the hearing, the court MUST grant possession.`;
      } else {
        explanation = `WARNING: The current arrears of £${arrears.toFixed(2)} do not meet the Ground 8 threshold of ${thresholdDescription} (£${threshold.toFixed(2)}). Ground 8 cannot be relied upon unless the arrears increase before the hearing.`;
        particulars = `Current arrears: £${arrears.toFixed(2)}\nRequired threshold: £${threshold.toFixed(2)} (${thresholdDescription})\n\nGround 8 is NOT satisfied at this time.`;
      }
    } else if (groundNum === 10 || groundNum === 11) {
      // Grounds 10/11: Other arrears grounds
      const arrears = templateData.total_arrears || 0;
      explanation = `The tenant owes £${arrears.toFixed(2)} in rent arrears.`;
      particulars = getWizardValue(wizard, 'section8_other_grounds_narrative') ||
                   getWizardValue(wizard, 'section8_grounds_narrative') ||
                   `Rent arrears outstanding: £${arrears.toFixed(2)}`;

      if (groundNum === 10) {
        particulars += `\n\nGround 10 is a DISCRETIONARY ground. The court will consider all circumstances when deciding whether to grant possession.`;
      } else {
        particulars += `\n\nGround 11 is a DISCRETIONARY ground. The court will consider the pattern of late payments when deciding whether to grant possession.`;
      }
    } else if (groundNum === 12) {
      // Ground 12: Breach of tenancy
      explanation = getWizardValue(wizard, 'section8_other_grounds_narrative') ||
                   getWizardValue(wizard, 'section8_grounds_narrative') ||
                   'The tenant has breached one or more terms of the tenancy agreement.';
      particulars = explanation + '\n\nGround 12 is a DISCRETIONARY ground. The court will consider the nature and severity of the breach.';
    } else if (groundNum === 13 || groundNum === 15) {
      // Grounds 13/15: Property damage
      explanation = getWizardValue(wizard, 'section8_other_grounds_narrative') ||
                   getWizardValue(wizard, 'section8_grounds_narrative') ||
                   'The condition of the property has deteriorated.';
      particulars = explanation + `\n\nGround ${groundNum} is a DISCRETIONARY ground. The court will assess the extent of deterioration.`;
    } else if (groundNum === 14 || groundNumStr === '14A') {
      // Grounds 14/14A: Nuisance/ASB
      explanation = getWizardValue(wizard, 'section8_other_grounds_narrative') ||
                   getWizardValue(wizard, 'section8_grounds_narrative') ||
                   'The tenant or persons at the property have caused nuisance or annoyance.';
      particulars = explanation + `\n\nGround ${groundNumStr} is a DISCRETIONARY ground. The court will consider evidence of nuisance or anti-social behaviour.`;
    } else if (groundNum === 17) {
      // Ground 17: False statement
      explanation = getWizardValue(wizard, 'section8_other_grounds_narrative') ||
                   getWizardValue(wizard, 'section8_grounds_narrative') ||
                   'The tenancy was granted based on a false statement.';
      particulars = explanation + '\n\nGround 17 is a DISCRETIONARY ground. The court will consider whether the false statement was material to the grant of the tenancy.';
    } else {
      // Other grounds
      explanation = getWizardValue(wizard, 'section8_other_grounds_narrative') ||
                   getWizardValue(wizard, 'section8_grounds_narrative') ||
                   '';
      particulars = explanation;
    }

    return {
      code: groundDef.code,
      number: String(groundDef.code),
      mandatory: groundDef.mandatory,
      title: groundDef.title,
      legal_basis: groundDef.legal_basis,
      full_text: groundDef.full_text,
      explanation,
      particulars,
      type: groundDef.mandatory ? 'MANDATORY' : 'DISCRETIONARY',
    };
  });
}

// =============================================================================
// NOTICE ONLY TEMPLATE DATA MAPPER (TASK C)
// =============================================================================

/**
 * Maps wizard facts to a unified Notice Only template data object.
 *
 * This function creates ONE consistent flattened object that works for ALL
 * Notice Only templates:
 * - Section 8 Notice (England/Wales)
 * - Section 21 Notice (England/Wales)
 * - Wales Section 173 Landlord's Notice
 * - Scotland Notice to Leave
 *
 * All fields are flattened and normalized with consistent naming.
 * Jurisdiction-specific fields (e.g., contract_holder_full_name for Wales)
 * are mapped alongside standard fields (tenant_full_name).
 *
 * @param wizard - Flat wizard facts from MQS
 * @returns Flattened template data object for Notice Only PDFs
 */
export function mapNoticeOnlyFacts(wizard: WizardFacts): Record<string, any> {
  if (!wizard || typeof wizard !== 'object') {
    return {};
  }

  // Helper to extract string value recursively from objects
  const extractString = (value: any): string | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') return value.trim() || null;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);

    if (typeof value === 'object' && !Array.isArray(value)) {
      const extracted = value.value ?? value.label ?? value.text ?? value.content;
      if (extracted !== null && extracted !== undefined) {
        return extractString(extracted);
      }
    }

    return null;
  };

  const templateData: Record<string, any> = {};

  // =============================================================================
  // LANDLORD DETAILS
  // =============================================================================
  templateData.landlord_full_name = extractString(
    getFirstValue(wizard, [
      'landlord_full_name',
      'landlord.name',
      'landlord_name',
      'parties.landlord.name',
      'claimant_full_name',
    ])
  );

  templateData.landlord_2_name = extractString(
    getFirstValue(wizard, [
      'landlord_2_name',
      'landlord_secondary_name',
      'landlord_co_claimant',
    ])
  );

  // Landlord address - flat fields
  const landlordAddressLine1 = extractString(
    getFirstValue(wizard, [
      'landlord_address_line1',
      'landlord.address_line1',
      'landlord_address',
    ])
  );
  const landlordAddressLine2 = extractString(
    getFirstValue(wizard, ['landlord_address_line2', 'landlord.address_line2'])
  );
  const landlordCity = extractString(
    getFirstValue(wizard, [
      'landlord_address_town',
      'landlord_city',
      'landlord.city',
    ])
  );
  const landlordPostcode = extractString(
    getFirstValue(wizard, [
      'landlord_address_postcode',
      'landlord_postcode',
      'landlord.postcode',
    ])
  );

  // Concatenate landlord address
  const landlordAddressParts = [
    landlordAddressLine1,
    landlordAddressLine2,
    landlordCity,
    landlordPostcode,
  ].filter(Boolean);

  templateData.landlord_address = landlordAddressParts.join('\n') || null;
  templateData.landlord_address_line1 = landlordAddressLine1;
  templateData.landlord_address_line2 = landlordAddressLine2;
  templateData.landlord_city = landlordCity;
  templateData.landlord_postcode = landlordPostcode;

  templateData.landlord_email = extractString(
    getFirstValue(wizard, ['landlord_email', 'landlord.email'])
  );
  templateData.landlord_phone = extractString(
    getFirstValue(wizard, ['landlord_phone', 'landlord.phone'])
  );

  // Scotland-specific
  templateData.landlord_reg_number = extractString(
    getWizardValue(wizard, 'landlord_reg_number')
  );

  // =============================================================================
  // TENANT DETAILS
  // =============================================================================
  templateData.tenant_full_name = extractString(
    getFirstValue(wizard, [
      'tenant_full_name',
      'tenant1_name',
      'contract_holder_full_name', // Wales
      'parties.tenants.0.name',
    ])
  );

  templateData.tenant_2_name = extractString(
    getFirstValue(wizard, [
      'tenant_2_name',
      'tenant2_name',
      'tenant_secondary_name',
    ])
  );

  // Wales-specific: contract_holder_full_name
  templateData.contract_holder_full_name = extractString(
    getFirstValue(wizard, [
      'contract_holder_full_name',
      'tenant_full_name', // Fallback to tenant_full_name
    ])
  );

  // =============================================================================
  // PROPERTY ADDRESS
  // =============================================================================
  const propertyAddressLine1 = extractString(
    getFirstValue(wizard, [
      'property_address_line1',
      'property.address_line1',
      'property_address',
    ])
  );
  const propertyAddressLine2 = extractString(
    getFirstValue(wizard, ['property_address_line2', 'property.address_line2'])
  );
  const propertyCity = extractString(
    getFirstValue(wizard, [
      'property_address_town',
      'property_city',
      'property.city',
    ])
  );
  const propertyPostcode = extractString(
    getFirstValue(wizard, [
      'property_address_postcode',
      'property_postcode',
      'property.postcode',
    ])
  );

  // Concatenate property address
  const propertyAddressParts = [
    propertyAddressLine1,
    propertyAddressLine2,
    propertyCity,
    propertyPostcode,
  ].filter(Boolean);

  templateData.property_address = propertyAddressParts.join('\n') || null;
  templateData.property_address_line1 = propertyAddressLine1;
  templateData.property_address_line2 = propertyAddressLine2;
  templateData.property_city = propertyCity;
  templateData.property_postcode = propertyPostcode;

  // =============================================================================
  // TENANCY/CONTRACT DATES
  // =============================================================================
  templateData.tenancy_start_date = extractString(
    getFirstValue(wizard, [
      'tenancy_start_date',
      'contract_start_date', // Wales
      'start_date',
    ])
  );

  // Wales-specific
  templateData.contract_start_date = extractString(
    getFirstValue(wizard, [
      'contract_start_date',
      'tenancy_start_date', // Fallback
    ])
  );

  templateData.fixed_term = coerceBoolean(
    getFirstValue(wizard, ['is_fixed_term', 'fixed_term', 'tenancy_fixed_term'])
  );

  templateData.fixed_term_end_date = extractString(
    getFirstValue(wizard, ['fixed_term_end_date', 'tenancy_end_date'])
  );

  templateData.periodic_tenancy_start = extractString(
    getWizardValue(wizard, 'periodic_tenancy_start')
  );

  // =============================================================================
  // RENT DETAILS
  // =============================================================================
  const rentAmount = getFirstValue(wizard, ['rent_amount']);
  templateData.rent_amount = rentAmount !== null ? Number(rentAmount) || null : null;

  templateData.rent_frequency = extractString(
    getFirstValue(wizard, ['rent_frequency', 'rent_period'])
  ) as any;

  // Derive rent_period_description from rent_frequency
  const rentFreq = templateData.rent_frequency?.toLowerCase();
  if (rentFreq === 'monthly') {
    templateData.rent_period_description = 'month';
  } else if (rentFreq === 'weekly') {
    templateData.rent_period_description = 'week';
  } else if (rentFreq === 'quarterly') {
    templateData.rent_period_description = 'quarter';
  } else if (rentFreq === 'annually' || rentFreq === 'yearly') {
    templateData.rent_period_description = 'year';
  } else {
    templateData.rent_period_description = rentFreq || 'month'; // default to month
  }

  const paymentDate = getFirstValue(wizard, ['payment_date', 'rent_due_day']);
  templateData.payment_date = paymentDate !== null ? Number(paymentDate) || null : null;

  templateData.next_payment_due = extractString(
    getWizardValue(wizard, 'next_payment_due')
  );

  // =============================================================================
  // NOTICE DATES
  // =============================================================================
  templateData.service_date = extractString(
    getFirstValue(wizard, [
      'notice_service_date',
      'service_date',
      'notice_date', // Scotland
    ])
  );

  templateData.notice_date = extractString(
    getFirstValue(wizard, [
      'notice_date',
      'notice_service_date',
      'service_date',
    ])
  );

  templateData.expiry_date = extractString(
    getFirstValue(wizard, [
      'notice_expiry_date',
      'expiry_date',
    ])
  );

  // Scotland-specific
  templateData.earliest_leaving_date = extractString(
    getWizardValue(wizard, 'earliest_leaving_date')
  );
  templateData.earliest_tribunal_date = extractString(
    getWizardValue(wizard, 'earliest_tribunal_date')
  );
  const noticePeriodDays = getWizardValue(wizard, 'notice_period_days');
  templateData.notice_period_days = noticePeriodDays !== null ? Number(noticePeriodDays) || null : null;

  // =============================================================================
  // NOTICE SERVICE
  // =============================================================================
  templateData.notice_service_method = extractString(
    getFirstValue(wizard, ['notice_service_method', 'service_method'])
  );

  templateData.notice_served_by = extractString(
    getFirstValue(wizard, ['notice_served_by', 'served_by'])
  );

  // =============================================================================
  // DEPOSIT & COMPLIANCE
  // =============================================================================
  const depositTaken = coerceBoolean(
    getFirstValue(wizard, ['deposit_taken', 'deposit_taken_wales', 'deposit_taken_fault'])
  );
  templateData.deposit_taken = depositTaken;

  const depositProtected = coerceBoolean(
    getFirstValue(wizard, ['deposit_protected', 'deposit_protected_wales', 'deposit_protected_fault'])
  );
  templateData.deposit_protected = depositProtected;

  const depositAmount = getFirstValue(wizard, ['deposit_amount']);
  const depositAmountNum = depositAmount !== null && depositAmount !== undefined ? Number(depositAmount) || 0 : 0;

  // Only set deposit_amount if a deposit was actually taken
  if (depositTaken === false) {
    templateData.deposit_amount = 0;
    templateData.deposit_scheme = null;
    templateData.deposit_reference = null;
    templateData.deposit_protection_date = null;
  } else {
    templateData.deposit_amount = depositAmountNum;

    // Only set scheme details if deposit is protected
    if (depositProtected === true) {
      templateData.deposit_scheme = extractString(
        getFirstValue(wizard, [
          'deposit_scheme',
          'deposit_scheme_name',
          'deposit_scheme_wales_s173',
          'deposit_scheme_fault',
        ])
      );

      templateData.deposit_reference = extractString(
        getWizardValue(wizard, 'deposit_reference')
      );

      templateData.deposit_protection_date = extractString(
        getWizardValue(wizard, 'deposit_protection_date')
      );
    } else {
      templateData.deposit_scheme = null;
      templateData.deposit_reference = null;
      templateData.deposit_protection_date = null;
    }
  }

  templateData.prescribed_info_given = coerceBoolean(
    getWizardValue(wizard, 'prescribed_info_given')
  );

  templateData.gas_certificate_provided = coerceBoolean(
    getFirstValue(wizard, ['gas_certificate_provided', 'gas_safety_cert_provided'])
  );

  templateData.gas_safety_cert_provided = coerceBoolean(
    getFirstValue(wizard, ['gas_safety_cert_provided', 'gas_certificate_provided'])
  );

  // Alias for templates that use gas_cert_provided
  templateData.gas_cert_provided = templateData.gas_certificate_provided || templateData.gas_safety_cert_provided;

  templateData.how_to_rent_provided = coerceBoolean(
    getFirstValue(wizard, ['how_to_rent_provided', 'how_to_rent_given'])
  );

  templateData.how_to_rent_given = coerceBoolean(
    getFirstValue(wizard, ['how_to_rent_given', 'how_to_rent_provided'])
  );

  templateData.epc_provided = coerceBoolean(
    getWizardValue(wizard, 'epc_provided')
  );

  templateData.epc_rating = extractString(
    getWizardValue(wizard, 'epc_rating')
  );

  templateData.hmo_license_required = coerceBoolean(
    getWizardValue(wizard, 'hmo_license_required')
  );

  templateData.hmo_license_valid = coerceBoolean(
    getWizardValue(wizard, 'hmo_license_valid')
  );

  // =============================================================================
  // WALES-SPECIFIC COMPLIANCE
  // =============================================================================
  templateData.wales_contract_category = extractString(
    getWizardValue(wizard, 'wales_contract_category')
  );

  templateData.rent_smart_wales_registered = coerceBoolean(
    getWizardValue(wizard, 'rent_smart_wales_registered')
  );

  // =============================================================================
  // ROUTE & GROUNDS
  // =============================================================================
  templateData.selected_notice_route = extractString(
    getFirstValue(wizard, ['selected_notice_route', 'eviction_route', 'route_intent'])
  );

  // Section 8 grounds
  const section8Grounds = getWizardValue(wizard, 'section8_grounds');
  if (Array.isArray(section8Grounds)) {
    templateData.section8_grounds = section8Grounds;
  } else if (section8Grounds && typeof section8Grounds === 'string') {
    templateData.section8_grounds = [section8Grounds];
  }

  // Wales fault-based section
  templateData.wales_fault_based_section = extractString(
    getWizardValue(wizard, 'wales_fault_based_section')
  );

  // =============================================================================
  // ARREARS DATA
  // =============================================================================
  const totalArrears = getFirstValue(wizard, ['total_arrears', 'rent_arrears_amount']);
  templateData.total_arrears = totalArrears !== null ? Number(totalArrears) || null : null;

  const arrearsAtNoticeDate = getWizardValue(wizard, 'arrears_at_notice_date');
  templateData.arrears_at_notice_date = arrearsAtNoticeDate !== null ? Number(arrearsAtNoticeDate) || null : null;

  const arrearsDurationMonths = getWizardValue(wizard, 'arrears_duration_months');
  templateData.arrears_duration_months = arrearsDurationMonths !== null ? Number(arrearsDurationMonths) || null : null;

  templateData.last_payment_date = extractString(
    getWizardValue(wizard, 'last_payment_date')
  );

  const lastPaymentAmount = getWizardValue(wizard, 'last_payment_amount');
  templateData.last_payment_amount = lastPaymentAmount !== null ? Number(lastPaymentAmount) || null : null;

  // =============================================================================
  // ASB & BREACH DETAILS
  // =============================================================================
  templateData.asb_description = extractString(
    getFirstValue(wizard, ['asb_description', 'section8_other_grounds_narrative'])
  );

  templateData.breach_description = extractString(
    getFirstValue(wizard, ['breach_description', 'section8_other_grounds_narrative'])
  );

  templateData.section8_grounds_narrative = extractString(
    getWizardValue(wizard, 'section8_other_grounds_narrative')
  );

  // =============================================================================
  // HELP INFORMATION
  // =============================================================================
  templateData.council_phone = extractString(
    getWizardValue(wizard, 'council_phone')
  );

  // =============================================================================
  // METADATA
  // =============================================================================
  templateData.jurisdiction = extractString(
    getFirstValue(wizard, ['jurisdiction', '__meta.jurisdiction'])
  );

  templateData.product = extractString(
    getFirstValue(wizard, ['product', '__meta.product'])
  );

  // =============================================================================
  // GROUNDS ARRAY (for Section 8 and Scotland)
  // =============================================================================
  templateData.grounds = buildGroundsArray(wizard, templateData);

  // =============================================================================
  // DATES: Ensure notice_date, service_date, earliest_possession_date are always set
  // =============================================================================
  if (!templateData.notice_date && !templateData.service_date) {
    // Default to today if no date provided
    templateData.notice_date = new Date().toISOString().split('T')[0];
    templateData.service_date = templateData.notice_date;
  }

  // Calculate earliest_possession_date if not provided
  if (!templateData.earliest_possession_date && templateData.service_date) {
    const noticePeriodDays = templateData.notice_period_days || 14;
    const serviceDate = new Date(templateData.service_date);
    const earliestDate = new Date(serviceDate.getTime() + noticePeriodDays * 24 * 60 * 60 * 1000);
    templateData.earliest_possession_date = earliestDate.toISOString().split('T')[0];
  }

  // Section 21 Form 6A: possession_date (from notice_expiry_date or earliest_possession_date)
  templateData.possession_date = extractString(
    getFirstValue(wizard, ['possession_date', 'notice_expiry_date', 'leave_by_date'])
  ) || templateData.expiry_date || templateData.earliest_possession_date;

  // Section 21 Form 6A: first_anniversary_date (one year after tenancy_start_date)
  if (templateData.tenancy_start_date) {
    try {
      const startDate = new Date(templateData.tenancy_start_date);
      const anniversaryDate = new Date(startDate);
      anniversaryDate.setFullYear(anniversaryDate.getFullYear() + 1);
      templateData.first_anniversary_date = anniversaryDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('[mapNoticeOnlyFacts] Error calculating first_anniversary_date:', error);
      templateData.first_anniversary_date = null;
    }
  }

  // =============================================================================
  // ADD NESTED OBJECTS FOR TEMPLATE COMPATIBILITY
  // =============================================================================
  // Templates expect nested property object
  templateData.property = {
    address_line1: propertyAddressLine1,
    address_line2: propertyAddressLine2,
    address_town: propertyCity,
    city: propertyCity,
    postcode: propertyPostcode,
    address: templateData.property_address,
  };

  // Templates expect nested tenant object
  templateData.tenant = {
    full_name: templateData.tenant_full_name,
    name_2: templateData.tenant_2_name,
  };

  // Templates expect nested tenancy object
  templateData.tenancy = {
    start_date: templateData.tenancy_start_date,
    end_date: templateData.fixed_term_end_date,
  };

  // Templates expect nested deposit object
  templateData.deposit = {
    taken: templateData.deposit_taken,
    protected: templateData.deposit_protected,
    amount: templateData.deposit_amount,
    scheme: templateData.deposit_scheme,
    scheme_name: templateData.deposit_scheme,
    reference: templateData.deposit_reference,
    protection_date: templateData.deposit_protection_date,
    prescribed_info_given: templateData.prescribed_info_given,
  };

  // Templates expect nested compliance object
  templateData.compliance = {
    gas_cert_provided: templateData.gas_certificate_provided || templateData.gas_safety_cert_provided,
    gas_cert_expiry: null, // Can be added if we have this data
    epc_provided: templateData.epc_provided,
    epc_rating: templateData.epc_rating,
    how_to_rent_given: templateData.how_to_rent_given || templateData.how_to_rent_provided,
    hmo_license_required: templateData.hmo_license_required,
    hmo_license_valid: templateData.hmo_license_valid,
  };

  // Templates expect notice_service_date and notice_expiry_date (in addition to service_date and expiry_date)
  templateData.notice_service_date = templateData.service_date || templateData.notice_date;
  templateData.notice_expiry_date = templateData.expiry_date || templateData.earliest_possession_date;

  // Templates expect metadata.generated_at for generation timestamp
  const now = new Date();

  // Convert jurisdiction code to display name
  const getJurisdictionDisplay = (jurisdiction: string | null): string => {
    if (!jurisdiction) return '';
    const jur = jurisdiction.toLowerCase().trim();
    if (jur === 'england' || jur === 'eng') return 'England';
    if (jur === 'wales' || jur === 'cym') return 'Wales';
    if (jur === 'scotland' || jur === 'sco') return 'Scotland';
    if (jur === 'northern-ireland' || jur === 'ni') return 'Northern Ireland';
    // Legacy: default england-wales to England (Section 8/21 only exist in England)
    if (jur === 'england-wales' || jur === 'england & wales') return 'England';
    return jurisdiction;
  };

  templateData.jurisdiction_display = getJurisdictionDisplay(templateData.jurisdiction);

  templateData.metadata = {
    generated_at: now.toISOString(),
    generated_date: now.toISOString().split('T')[0],
    jurisdiction: templateData.jurisdiction,
    jurisdiction_display: templateData.jurisdiction_display,
    product: templateData.product,
  };

  // Also provide flat generation fields for backward compatibility
  templateData.generation_timestamp = now.toISOString();
  templateData.generation_date = now.toISOString().split('T')[0];

  console.log('[mapNoticeOnlyFacts] Mapped Notice Only template data');
  console.log('[mapNoticeOnlyFacts] Landlord:', templateData.landlord_full_name);
  console.log('[mapNoticeOnlyFacts] Landlord address:', templateData.landlord_address ? 'SET' : 'MISSING');
  console.log('[mapNoticeOnlyFacts] Tenant:', templateData.tenant_full_name);
  console.log('[mapNoticeOnlyFacts] Property address:', templateData.property_address ? 'SET' : 'MISSING');
  console.log('[mapNoticeOnlyFacts] Property object:', templateData.property ? 'SET' : 'MISSING');
  console.log('[mapNoticeOnlyFacts] Tenant object:', templateData.tenant ? 'SET' : 'MISSING');
  console.log('[mapNoticeOnlyFacts] Grounds:', templateData.grounds.length);
  console.log('[mapNoticeOnlyFacts] Dates - notice:', templateData.notice_date, 'service:', templateData.service_date, 'earliest:', templateData.earliest_possession_date);
  console.log('[mapNoticeOnlyFacts] Deposit - amount:', templateData.deposit_amount, 'protected:', templateData.deposit_protected, 'scheme:', templateData.deposit_scheme);

  // PACK DOCUMENT DEBUG - Log what pack templates will receive
  console.log('[mapNoticeOnlyFacts] === PACK DOCUMENT DATA ===');
  console.log('[mapNoticeOnlyFacts] property.address_line1:', templateData.property?.address_line1);
  console.log('[mapNoticeOnlyFacts] property.address_town:', templateData.property?.address_town);
  console.log('[mapNoticeOnlyFacts] property.postcode:', templateData.property?.postcode);
  console.log('[mapNoticeOnlyFacts] tenant.full_name:', templateData.tenant?.full_name);
  console.log('[mapNoticeOnlyFacts] tenancy.start_date:', templateData.tenancy?.start_date);
  console.log('[mapNoticeOnlyFacts] notice_service_date:', templateData.notice_service_date);
  console.log('[mapNoticeOnlyFacts] notice_expiry_date:', templateData.notice_expiry_date);
  console.log('[mapNoticeOnlyFacts] jurisdiction_display:', templateData.jurisdiction_display);
  console.log('[mapNoticeOnlyFacts] ===========================');

  return templateData;
}
