/**
 * normalize.ts - Mapping between flat WizardFacts (DB) and nested CaseFacts (domain)
 *
 * This file handles the conversion from the flat storage format to the nested
 * domain model used by document generators and analysis tools.
 */

import type { WizardFacts, CaseFacts, PartyDetails } from './schema';
import { createEmptyCaseFacts } from './schema';

/**
 * Helper to safely get a value from flat wizard facts using dot notation
 */
function getWizardValue(wizard: WizardFacts, key: string): any {
  return wizard[key] ?? null;
}

/**
 * Helper to extract tenant data from flat wizard facts
 * Looks for keys like "tenants.0.full_name", "tenants.0.email", etc.
 */
function extractTenants(wizard: WizardFacts): PartyDetails[] {
  const tenants: PartyDetails[] = [];
  const tenantIndices = new Set<number>();

  // Find all tenant indices by scanning keys
  Object.keys(wizard).forEach((key) => {
    const match = key.match(/^tenants\.(\d+)\./);
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
  const base = createEmptyCaseFacts();

  // =============================================================================
  // META - Product and tier information
  // =============================================================================
  base.meta = {
    product: wizard.__meta?.product ?? null,
    original_product: wizard.__meta?.original_product ?? null,
    product_tier: wizard.__meta?.product_tier ?? null,
  };

  // =============================================================================
  // PROPERTY - Address and details
  // =============================================================================
  base.property = {
    address_line1: getWizardValue(wizard, 'property_address_line1'),
    address_line2: getWizardValue(wizard, 'property_address_line2'),
    city: getWizardValue(wizard, 'property_city'),
    postcode: getWizardValue(wizard, 'property_postcode'),
    country: getWizardValue(wizard, 'property_country') ||
             getWizardValue(wizard, 'jurisdiction'),
    is_hmo: getWizardValue(wizard, 'property_is_hmo'),
  };

  // =============================================================================
  // TENANCY - Dates, rent, deposit
  // =============================================================================
  base.tenancy = {
    tenancy_type: getWizardValue(wizard, 'tenancy_type') || 'unknown',
    start_date: getWizardValue(wizard, 'tenancy_start_date'),
    end_date: getWizardValue(wizard, 'tenancy_end_date'),
    fixed_term: getWizardValue(wizard, 'tenancy_fixed_term'),
    fixed_term_months: getWizardValue(wizard, 'tenancy_fixed_term_months'),
    rent_amount: getWizardValue(wizard, 'rent_amount'),
    rent_frequency: getWizardValue(wizard, 'rent_frequency'),
    rent_due_day: getWizardValue(wizard, 'rent_due_day'),
    deposit_amount: getWizardValue(wizard, 'deposit_amount'),
    deposit_protected: getWizardValue(wizard, 'deposit_protected'),
    deposit_scheme_name: getWizardValue(wizard, 'deposit_scheme_name'),
    deposit_protection_date: getWizardValue(wizard, 'deposit_protection_date'),
  };

  // =============================================================================
  // PARTIES - Landlord, agent, solicitor, tenants
  // =============================================================================
  base.parties = {
    landlord: {
      name: getWizardValue(wizard, 'landlord_name') ||
            getWizardValue(wizard, 'landlord.name'),
      email: getWizardValue(wizard, 'landlord_email') ||
             getWizardValue(wizard, 'landlord.email'),
      phone: getWizardValue(wizard, 'landlord_phone') ||
             getWizardValue(wizard, 'landlord.phone'),
      address_line1: getWizardValue(wizard, 'landlord_address_line1') ||
                     getWizardValue(wizard, 'landlord.address_line1'),
      address_line2: getWizardValue(wizard, 'landlord_address_line2') ||
                     getWizardValue(wizard, 'landlord.address_line2'),
      city: getWizardValue(wizard, 'landlord_city') ||
            getWizardValue(wizard, 'landlord.city'),
      postcode: getWizardValue(wizard, 'landlord_postcode') ||
                getWizardValue(wizard, 'landlord.postcode'),
    },
    agent: {
      name: getWizardValue(wizard, 'agent_name') ||
            getWizardValue(wizard, 'agent.name'),
      email: getWizardValue(wizard, 'agent_email') ||
             getWizardValue(wizard, 'agent.email'),
      phone: getWizardValue(wizard, 'agent_phone') ||
             getWizardValue(wizard, 'agent.phone'),
      address_line1: getWizardValue(wizard, 'agent_address_line1') ||
                     getWizardValue(wizard, 'agent.address_line1'),
      address_line2: getWizardValue(wizard, 'agent_address_line2') ||
                     getWizardValue(wizard, 'agent.address_line2'),
      city: getWizardValue(wizard, 'agent_city') ||
            getWizardValue(wizard, 'agent.city'),
      postcode: getWizardValue(wizard, 'agent_postcode') ||
                getWizardValue(wizard, 'agent.postcode'),
    },
    solicitor: {
      name: getWizardValue(wizard, 'solicitor_name') ||
            getWizardValue(wizard, 'solicitor.name'),
      email: getWizardValue(wizard, 'solicitor_email') ||
             getWizardValue(wizard, 'solicitor.email'),
      phone: getWizardValue(wizard, 'solicitor_phone') ||
             getWizardValue(wizard, 'solicitor.phone'),
      address_line1: getWizardValue(wizard, 'solicitor_address_line1') ||
                     getWizardValue(wizard, 'solicitor.address_line1'),
      address_line2: getWizardValue(wizard, 'solicitor_address_line2') ||
                     getWizardValue(wizard, 'solicitor.address_line2'),
      city: getWizardValue(wizard, 'solicitor_city') ||
            getWizardValue(wizard, 'solicitor.city'),
      postcode: getWizardValue(wizard, 'solicitor_postcode') ||
                getWizardValue(wizard, 'solicitor.postcode'),
    },
    tenants: extractTenants(wizard),
  };

  // =============================================================================
  // ISSUES - Arrears, ASB, other breaches
  // TODO: Add detailed mappings for arrears items and ASB incidents
  // =============================================================================
  base.issues = {
    rent_arrears: {
      has_arrears: getWizardValue(wizard, 'has_rent_arrears') ||
                   getWizardValue(wizard, 'rent_arrears.has_arrears'),
      total_arrears: getWizardValue(wizard, 'total_arrears') ||
                     getWizardValue(wizard, 'rent_arrears.total_arrears'),
      arrears_items: [], // TODO: Map from flat arrears.0.period_start, etc.
    },
    asb: {
      has_asb: getWizardValue(wizard, 'has_asb') ||
               getWizardValue(wizard, 'asb.has_asb'),
      description: getWizardValue(wizard, 'asb_description') ||
                   getWizardValue(wizard, 'asb.description'),
      incidents: [], // TODO: Map from flat asb_incidents.0.description, etc.
    },
    other_breaches: {
      has_breaches: getWizardValue(wizard, 'has_other_breaches') ||
                    getWizardValue(wizard, 'other_breaches.has_breaches'),
      description: getWizardValue(wizard, 'other_breaches_description') ||
                   getWizardValue(wizard, 'other_breaches.description'),
    },
  };

  // =============================================================================
  // NOTICE - Section 8, Section 21, etc.
  // TODO: Add mappings for notice details
  // =============================================================================
  base.notice = {
    notice_type: getWizardValue(wizard, 'notice_type'),
    notice_date: getWizardValue(wizard, 'notice_date'),
    expiry_date: getWizardValue(wizard, 'notice_expiry_date') ||
                 getWizardValue(wizard, 'expiry_date'),
    service_method: getWizardValue(wizard, 'notice_service_method') ||
                    getWizardValue(wizard, 'service_method'),
    served_by: getWizardValue(wizard, 'notice_served_by') ||
               getWizardValue(wizard, 'served_by'),
  };

  // =============================================================================
  // COURT - Claim amounts and form requirements
  // TODO: Add mappings for court details
  // =============================================================================
  base.court = {
    route: getWizardValue(wizard, 'court_route'),
    claim_amount_rent: getWizardValue(wizard, 'claim_amount_rent'),
    claim_amount_costs: getWizardValue(wizard, 'claim_amount_costs'),
    claim_amount_other: getWizardValue(wizard, 'claim_amount_other'),
    total_claim_amount: getWizardValue(wizard, 'total_claim_amount'),
    n5_required: getWizardValue(wizard, 'n5_required'),
    n119_required: getWizardValue(wizard, 'n119_required'),
    n1_required: getWizardValue(wizard, 'n1_required'),
    scotland_form3a_required: getWizardValue(wizard, 'scotland_form3a_required'),
    scotland_form_e_required: getWizardValue(wizard, 'scotland_form_e_required'),
  };

  // =============================================================================
  // EVIDENCE - Upload tracking
  // TODO: Add mappings for evidence fields if stored flat
  // =============================================================================
  base.evidence = {
    tenancy_agreement_uploaded: getWizardValue(wizard, 'evidence.tenancy_agreement_uploaded') ?? false,
    rent_schedule_uploaded: getWizardValue(wizard, 'evidence.rent_schedule_uploaded') ?? false,
    bank_statements_uploaded: getWizardValue(wizard, 'evidence.bank_statements_uploaded') ?? false,
    safety_certificates_uploaded: getWizardValue(wizard, 'evidence.safety_certificates_uploaded') ?? false,
    asb_evidence_uploaded: getWizardValue(wizard, 'evidence.asb_evidence_uploaded') ?? false,
    other_evidence_uploaded: getWizardValue(wizard, 'evidence.other_evidence_uploaded') ?? false,
    missing_evidence_notes: getWizardValue(wizard, 'evidence.missing_evidence_notes') || [],
  };

  // =============================================================================
  // SERVICE CONTACT - Service address for legal documents
  // TODO: Add mappings for service contact details
  // =============================================================================
  base.service_contact = {
    service_name: getWizardValue(wizard, 'service_contact.service_name') ||
                  getWizardValue(wizard, 'service_name'),
    service_address_line1: getWizardValue(wizard, 'service_contact.service_address_line1') ||
                           getWizardValue(wizard, 'service_address_line1'),
    service_address_line2: getWizardValue(wizard, 'service_contact.service_address_line2') ||
                           getWizardValue(wizard, 'service_address_line2'),
    service_city: getWizardValue(wizard, 'service_contact.service_city') ||
                  getWizardValue(wizard, 'service_city'),
    service_postcode: getWizardValue(wizard, 'service_contact.service_postcode') ||
                      getWizardValue(wizard, 'service_postcode'),
    service_email: getWizardValue(wizard, 'service_contact.service_email') ||
                   getWizardValue(wizard, 'service_email'),
    service_phone: getWizardValue(wizard, 'service_contact.service_phone') ||
                   getWizardValue(wizard, 'service_phone'),
  };

  return base;
}
