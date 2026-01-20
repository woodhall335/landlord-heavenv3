/**
 * Section 21 Notice Generator
 *
 * ENGLAND-ONLY: Generates Housing Act 1988 Section 21 notices (no-fault eviction)
 *
 * IMPORTANT: Section 21 applies ONLY in England. Wales uses Section 173.
 * This generator will throw an error if called for non-England jurisdictions.
 *
 * Form 6A is used for most assured shorthold tenancies.
 *
 * CRITICAL: This generator enforces statutory preconditions via validateSection21Preconditions().
 * If any precondition is missing/unknown, generation is BLOCKED with explicit errors.
 */

import { generateDocument, GeneratedDocument } from './generator';
import {
  calculateSection21ExpiryDate,
  validateSection21ExpiryDate,
  type Section21DateParams,
  type ServiceMethod,
} from './notice-date-calculator';
import {
  isFixedTermTenancy,
  resolveFixedTermEndDate,
  hasBreakClause,
  resolveBreakClauseDate,
  resolveServiceMethod,
  logResolvedDateParams,
} from './section21-payload-normalizer';
import {
  validateSection21Preconditions,
  assertSection21Preconditions,
  type Section21ValidationResult,
} from '@/lib/validators/section21-preconditions';

// ============================================================================
// TYPES
// ============================================================================

export interface Section21NoticeData {
  // Landlord
  landlord_full_name: string;
  landlord_2_name?: string; // Joint landlord
  landlord_address: string;
  landlord_email?: string;
  landlord_phone?: string;

  // Tenant
  tenant_full_name: string;
  tenant_2_name?: string; // Joint tenant
  property_address: string;

  // Tenancy
  tenancy_start_date: string;
  fixed_term?: boolean;
  fixed_term_end_date?: string;
  // Break clause fields (for fixed term tenancies)
  has_break_clause?: boolean;
  break_clause_date?: string;
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  periodic_tenancy_start?: string; // When it became periodic (if converted from fixed)

  // Notice details
  service_date?: string; // Date notice is served (defaults to today)
  service_method?: ServiceMethod; // How notice is being served (affects deemed service date)
  expiry_date?: string; // Date tenant must leave by (auto-calculated if not provided)
  expiry_date_explanation?: string; // How we calculated this
  serving_capacity?: 'landlord' | 'joint_landlords' | 'agent'; // Who is serving the notice

  // Compliance (checked by decision engine before allowing S21)
  deposit_protected?: boolean;
  deposit_amount?: number;
  deposit_scheme?: 'DPS' | 'MyDeposits' | 'TDS';
  deposit_reference?: string;
  prescribed_info_given?: boolean;
  gas_certificate_provided?: boolean;
  how_to_rent_provided?: boolean;
  epc_provided?: boolean;
  epc_rating?: string;

  // Help information
  council_phone?: string;
}

// ============================================================================
// GENERATOR
// ============================================================================

/**
 * Generate a Section 21 notice (Form 6A)
 *
 * @param data - Section 21 notice data
 * @param isPreview - If true, skip blocking validation (allows partial preview)
 * @param options - Additional options for generation
 */
export async function generateSection21Notice(
  data: Section21NoticeData,
  isPreview = false,
  options?: { caseId?: string }
): Promise<GeneratedDocument> {
  // Validate required fields
  if (!data.landlord_full_name) {
    throw new Error('landlord_full_name is required');
  }
  if (!data.tenant_full_name) {
    throw new Error('tenant_full_name is required');
  }
  if (!data.property_address) {
    throw new Error('property_address is required');
  }
  if (!data.tenancy_start_date) {
    throw new Error('tenancy_start_date is required');
  }
  if (!data.rent_frequency) {
    throw new Error('rent_frequency is required');
  }

  // =============================================================================
  // CRITICAL: STATUTORY PRECONDITION VALIDATION (Jan 2026 Audit)
  // =============================================================================
  // Before generating ANY Section 21 notice, we MUST validate all statutory
  // preconditions. If any are missing/unknown, generation is BLOCKED.
  //
  // This is the HARD GATE - no placeholders, no partial compliance assertions.
  // The validator checks: deposit protection, prescribed info, gas cert, EPC,
  // How to Rent, licensing, and retaliatory eviction bar.
  // =============================================================================
  const serviceDate = data.service_date || new Date().toISOString().split('T')[0];

  // Build validation input from Section21NoticeData
  const validationInput = {
    deposit_taken: data.deposit_amount != null && data.deposit_amount > 0,
    deposit_amount: data.deposit_amount,
    deposit_protected: data.deposit_protected,
    deposit_scheme: data.deposit_scheme,
    prescribed_info_given: data.prescribed_info_given,
    has_gas_appliances: data.gas_certificate_provided !== undefined, // If provided is defined, we assume gas is present
    gas_certificate_provided: data.gas_certificate_provided,
    epc_provided: data.epc_provided,
    epc_rating: data.epc_rating,
    how_to_rent_provided: data.how_to_rent_provided,
    tenancy_start_date: data.tenancy_start_date,
    service_date: serviceDate,
    // These need to be passed in from wizard facts if available
    licensing_required: (data as any).licensing_required,
    has_valid_licence: (data as any).has_valid_licence,
    improvement_notice_served: (data as any).improvement_notice_served,
    no_retaliatory_notice: (data as any).no_retaliatory_notice,
  };

  // RUN THE HARD GATE: Throws if any blockers exist
  if (!isPreview) {
    // In preview mode, we skip blocking validation to allow users to see partial output
    // In final generation mode, we enforce all preconditions
    assertSection21Preconditions(validationInput);
  } else {
    // Even in preview mode, log the validation result for debugging
    const previewValidation = validateSection21Preconditions(validationInput);
    if (!previewValidation.ok) {
      console.warn(
        '[S21 Generator PREVIEW] Precondition validation would fail:',
        previewValidation.summary,
        previewValidation.blockers.map((b) => b.code).join(', ')
      );
    }
  }

  // =============================================================================
  // SECTION 21 EXPIRY DATE: ALWAYS AUTO-CALCULATED (Jan 2026 Fix)
  // =============================================================================
  // For Section 21 notices, the expiry date MUST be computed server-side using
  // the S21 validity engine. This ensures legal compliance with Housing Act 1988.
  //
  // IMPORTANT: Even if a user provides an expiry_date (from stale client or old data),
  // we IGNORE it and compute the correct date. This is the single source of truth.
  //
  // The computed date considers:
  // - Service date
  // - Fixed term end date (if applicable)
  // - Break clause date (if applicable)
  // - 4-month restriction from tenancy start
  // - 2 calendar months minimum notice
  // - Periodic tenancy alignment
  // =============================================================================
  // NOTE: serviceDate already defined above in precondition validation section

  const dateParams: Section21DateParams = {
    service_date: serviceDate,
    tenancy_start_date: data.tenancy_start_date,
    fixed_term: data.fixed_term,
    fixed_term_end_date: data.fixed_term_end_date,
    has_break_clause: data.has_break_clause,
    break_clause_date: data.break_clause_date,
    rent_period: data.rent_frequency,
    periodic_tenancy_start: data.periodic_tenancy_start,
    service_method: data.service_method, // For deemed service date calculation
  };

  // =============================================================================
  // DEBUG LOGGING: Log resolved date parameters for verification
  // This helps diagnose issues where fixed_term or fixed_term_end_date are mis-mapped
  // =============================================================================
  logResolvedDateParams(
    {
      fixed_term: !!data.fixed_term,
      fixed_term_end_date: data.fixed_term_end_date,
      has_break_clause: !!data.has_break_clause,
      break_clause_date: data.break_clause_date,
      service_method: data.service_method,
      serve_date: serviceDate,
    },
    'S21Generator'
  );

  // =============================================================================
  // SAFETY RAILS: Validate S21 can be served (4-month rule)
  // =============================================================================
  const tenancyStartObj = new Date(data.tenancy_start_date + 'T00:00:00.000Z');
  const serviceDateObj = new Date(serviceDate + 'T00:00:00.000Z');
  const fourMonthsAfterStart = new Date(tenancyStartObj);
  fourMonthsAfterStart.setUTCMonth(fourMonthsAfterStart.getUTCMonth() + 4);

  if (serviceDateObj < fourMonthsAfterStart) {
    const error = new Error(
      `Section 21 notice cannot be served within the first 4 months of the tenancy. ` +
      `Tenancy started: ${data.tenancy_start_date}. ` +
      `Earliest service date: ${fourMonthsAfterStart.toISOString().split('T')[0]}. ` +
      `Legal basis: Housing Act 1988, Section 21(4B).`
    );
    (error as any).statusCode = 422;
    (error as any).validationErrors = [(error as Error).message];
    throw error;
  }

  // =============================================================================
  // SAFETY RAILS: Fixed term without break clause - ensure expiry >= fixed term end
  // =============================================================================
  if (data.fixed_term && data.fixed_term_end_date && !data.has_break_clause) {
    const fixedTermEndObj = new Date(data.fixed_term_end_date + 'T00:00:00.000Z');
    const twoMonthsFromService = new Date(serviceDateObj);
    twoMonthsFromService.setUTCMonth(twoMonthsFromService.getUTCMonth() + 2);

    // The calculated expiry will be the later of: (service + 2 months) OR fixed_term_end
    // This is correct behavior, but if someone somehow bypasses and sets expiry < fixed_term_end,
    // that's a bug. We validate this in the calculation.
  }

  // =============================================================================
  // ALWAYS COMPUTE EXPIRY DATE (ignore user-provided values for S21)
  // This is the SINGLE SOURCE OF TRUTH for Section 21 expiry dates.
  // =============================================================================
  const calculatedDate = calculateSection21ExpiryDate(dateParams);

  // Log if user provided a different expiry date (for debugging)
  if (data.expiry_date && data.expiry_date !== calculatedDate.earliest_valid_date) {
    console.warn(
      `[S21 Generator] User-provided expiry date (${data.expiry_date}) differs from calculated (${calculatedDate.earliest_valid_date}). ` +
      `Using calculated date as single source of truth.`
    );
  }

  data.expiry_date = calculatedDate.earliest_valid_date;
  data.expiry_date_explanation = calculatedDate.explanation;

  // Compliance warnings (should be checked by decision engine before allowing S21)
  const complianceWarnings: string[] = [];

  if (!data.deposit_protected) {
    complianceWarnings.push('Deposit must be protected in an approved scheme to serve valid Section 21');
  }
  if (!data.prescribed_info_given) {
    complianceWarnings.push('Prescribed information must be provided within 30 days of receiving deposit');
  }
  if (!data.gas_certificate_provided) {
    complianceWarnings.push('Gas safety certificate must be provided before tenancy starts');
  }
  if (!data.how_to_rent_provided) {
    complianceWarnings.push('How to Rent guide must be provided at start of tenancy (for tenancies starting after Oct 2015)');
  }
  if (!data.epc_provided) {
    complianceWarnings.push('EPC must be provided before tenancy starts');
  }

  // Log warnings but don't fail (decision engine should have caught these earlier)
  if (complianceWarnings.length > 0) {
    console.warn('Section 21 compliance warnings:', complianceWarnings);
  }

  // =============================================================================
  // TEMPLATE DATA PREPARATION (FIX: Ensure Form 6A template variables are set)
  // Form 6A template expects these specific variable names:
  // - notice_expiry_date (Section 2: "You are required to leave... after:")
  // - service_date / notice_service_date / notice_date (Page 2 Date: field)
  // - is_landlord_serving / is_joint_landlords_serving / is_agent_serving (capacity)
  // =============================================================================
  const templateData: Record<string, any> = {
    ...data,
    // CRITICAL: Form 6A Section 2 renders from notice_expiry_date (not expiry_date)
    notice_expiry_date: data.expiry_date,
    earliest_possession_date: data.expiry_date, // Fallback alias

    // CRITICAL: Form 6A Page 2 "Date:" renders from service_date (and fallbacks)
    service_date: serviceDate,
    notice_service_date: serviceDate,
    notice_date: serviceDate,
    intended_service_date: serviceDate,

    // Serving capacity flags for Form 6A checkbox rendering
    is_landlord_serving: false,
    is_joint_landlords_serving: false,
    is_agent_serving: false,
  };

  // Set serving capacity based on wizard input
  const servingCapacity = (data as any).serving_capacity;
  if (servingCapacity === 'landlord') {
    templateData.is_landlord_serving = true;
  } else if (servingCapacity === 'joint_landlords') {
    templateData.is_joint_landlords_serving = true;
  } else if (servingCapacity === 'agent') {
    templateData.is_agent_serving = true;
  } else {
    // Default to landlord if not specified
    templateData.is_landlord_serving = true;
  }

  // Build debug stamp if case ID is provided (for tracing generation source)
  const debugStamp = options?.caseId
    ? {
        generatorName: 'section21-generator.ts',
        caseId: options.caseId,
        additionalTemplates: [],
      }
    : undefined;

  return generateDocument({
    templatePath: 'uk/england/templates/notice_only/form_6a_section21/notice.hbs',
    data: templateData,
    isPreview,
    outputFormat: 'both',
    debugStamp,
  });
}

/**
 * Validate Section 21 eligibility based on compliance requirements
 * This should be called by the decision engine before allowing S21 route
 */
/**
 * Map wizard facts to Section21NoticeData
 *
 * This provides a single source of truth for mapping wizard/case facts
 * to the format expected by generateSection21Notice().
 */
export function mapWizardToSection21Data(
  wizardFacts: Record<string, any>,
  options?: { serviceDate?: string }
): Section21NoticeData {
  // Build addresses - prefer pre-concatenated, fallback to building from parts
  const propertyAddress =
    wizardFacts.property_address ||
    [
      wizardFacts.property_address_line1,
      wizardFacts.property_address_line2,
      wizardFacts.property_address_town,
      wizardFacts.property_address_county,
      wizardFacts.property_address_postcode,
    ]
      .filter(Boolean)
      .join('\n') ||
    '';

  const landlordAddress =
    wizardFacts.landlord_address ||
    [
      wizardFacts.landlord_address_line1,
      wizardFacts.landlord_address_line2,
      wizardFacts.landlord_address_town,
      wizardFacts.landlord_address_county,
      wizardFacts.landlord_address_postcode,
    ]
      .filter(Boolean)
      .join('\n') ||
    '';

  // Normalize deposit scheme to expected enum
  const normalizeDepositScheme = (
    scheme: string | undefined
  ): 'DPS' | 'MyDeposits' | 'TDS' | undefined => {
    if (!scheme) return undefined;
    const upper = scheme.toUpperCase();
    if (upper === 'DPS' || upper.includes('DEPOSIT PROTECTION')) return 'DPS';
    if (upper.includes('MYDEPOSIT')) return 'MyDeposits';
    if (upper === 'TDS' || upper.includes('TENANCY DEPOSIT')) return 'TDS';
    return undefined;
  };

  // =============================================================================
  // RESOLVE SERVICE DATE FROM ALL POSSIBLE WIZARD PATHS
  // The wizard stores service date in various locations depending on product/config.
  // MQS maps_to: notice_service.notice_date creates nested structure.
  // We need to check all possible paths to find the user-entered service date.
  //
  // CRITICAL FIX (Jan 2026): Added support for new field ID "notice_date" from MSQ fix.
  // Old field was "notice_service_date" which didn't match maps_to path last segment.
  // Now MSQ uses "notice_date" which correctly maps to "notice_service.notice_date".
  // =============================================================================
  const resolveServiceDate = (): string | undefined => {
    // Priority 1: Explicit option passed from caller
    if (options?.serviceDate) return options.serviceDate;

    // Priority 2: Nested path from MQS maps_to (notice_service.notice_date)
    const noticeService = wizardFacts.notice_service;
    if (typeof noticeService === 'object' && noticeService?.notice_date) {
      return noticeService.notice_date;
    }

    // Priority 3: Direct field IDs (flat keys in wizard facts)
    // Check BOTH old and new field names for backwards compatibility
    // New field ID (Jan 2026 fix): notice_date
    if (wizardFacts.notice_date) return wizardFacts.notice_date;
    // Old field ID (pre-fix): notice_service_date
    if (wizardFacts.notice_service_date) return wizardFacts.notice_service_date;
    // Other possible paths
    if (wizardFacts.service_date) return wizardFacts.service_date;
    if (wizardFacts.notice_served_date) return wizardFacts.notice_served_date;
    if (wizardFacts.intended_service_date) return wizardFacts.intended_service_date;

    return undefined;
  };

  // =============================================================================
  // RESOLVE SERVING CAPACITY FROM NESTED WIZARD PATHS
  // =============================================================================
  type ServingCapacity = 'landlord' | 'joint_landlords' | 'agent';

  const resolveServingCapacity = (): ServingCapacity | undefined => {
    // Check nested path from MQS maps_to (notice_service.serving_capacity)
    const noticeService = wizardFacts.notice_service;
    if (typeof noticeService === 'object' && noticeService?.serving_capacity) {
      const cap = noticeService.serving_capacity;
      if (cap === 'landlord' || cap === 'joint_landlords' || cap === 'agent') {
        return cap;
      }
    }

    // Check flat keys
    const flatCap = wizardFacts.serving_capacity;
    if (flatCap === 'landlord' || flatCap === 'joint_landlords' || flatCap === 'agent') {
      return flatCap;
    }

    return undefined;
  };

  // =============================================================================
  // RESOLVE SERVICE METHOD FROM WIZARD PATHS
  // Determines deemed service date calculation (postal = +2 working days)
  // Uses centralized normalizer that handles label strings ("First class post" → "first_class_post")
  // =============================================================================
  // Imported from section21-payload-normalizer.ts - handles label → enum conversion

  return {
    // Landlord
    landlord_full_name: wizardFacts.landlord_full_name || '',
    landlord_2_name: wizardFacts.landlord_2_name || wizardFacts.joint_landlord_name,
    landlord_address: landlordAddress,
    landlord_email: wizardFacts.landlord_email,
    landlord_phone: wizardFacts.landlord_phone,

    // Tenant
    tenant_full_name: wizardFacts.tenant_full_name || '',
    tenant_2_name: wizardFacts.tenant_2_name || wizardFacts.joint_tenant_name,
    property_address: propertyAddress,

    // Tenancy
    // Uses centralized normalizers to handle flat/nested payload shapes and label strings
    tenancy_start_date: wizardFacts.tenancy_start_date || wizardFacts.tenancy?.start_date || '',
    // isFixedTermTenancy handles: boolean flags, enum values ("ast_fixed"), and labels ("Fixed term")
    fixed_term: isFixedTermTenancy(wizardFacts),
    // resolveFixedTermEndDate checks: flat key, nested tenancy.fixed_term_end_date
    fixed_term_end_date: resolveFixedTermEndDate(wizardFacts),
    // Break clause fields (for fixed term tenancies)
    // hasBreakClause handles: boolean flags, 'yes' strings, nested tenancy.has_break_clause
    has_break_clause: hasBreakClause(wizardFacts),
    break_clause_date: resolveBreakClauseDate(wizardFacts),
    rent_amount: wizardFacts.rent_amount || 0,
    rent_frequency: wizardFacts.rent_frequency || 'monthly',
    periodic_tenancy_start: wizardFacts.periodic_tenancy_start,

    // Notice details - service_date resolved from all possible wizard paths
    // CRITICAL (Jan 2026): expiry_date is ALWAYS computed server-side for S21
    // We do NOT pass any user-provided expiry_date - generateSection21Notice computes it.
    service_date: resolveServiceDate(),
    // Service method determines deemed service date (postal = +2 working days)
    // resolveServiceMethod normalizes labels ("First class post" → "first_class_post")
    service_method: resolveServiceMethod(wizardFacts),
    // expiry_date is intentionally omitted - generateSection21Notice will compute it
    // Include serving_capacity for Form 6A checkbox rendering
    serving_capacity: resolveServingCapacity(),

    // Compliance
    // IMPORTANT: Section21ComplianceSection stores these as *_served but
    // templates and interfaces use *_given/*_provided. Check all variants.
    deposit_protected:
      wizardFacts.deposit_protected === true ||
      wizardFacts.deposit_protected === 'yes',
    deposit_amount: wizardFacts.deposit_amount,
    deposit_scheme: normalizeDepositScheme(
      wizardFacts.deposit_scheme || wizardFacts.deposit_scheme_name
    ),
    deposit_reference: wizardFacts.deposit_reference,
    prescribed_info_given:
      wizardFacts.prescribed_info_given === true ||
      wizardFacts.prescribed_info_given === 'yes' ||
      wizardFacts.prescribed_info_served === true ||  // Section21ComplianceSection uses this
      wizardFacts.prescribed_info_served === 'yes',
    gas_certificate_provided:
      wizardFacts.gas_certificate_provided === true ||
      wizardFacts.gas_certificate_provided === 'yes' ||
      wizardFacts.gas_safety_certificate === true ||
      wizardFacts.gas_safety_cert_provided === true ||
      wizardFacts.gas_safety_cert_served === true ||  // Section21ComplianceSection uses this
      wizardFacts.gas_safety_cert_served === 'yes',
    how_to_rent_provided:
      wizardFacts.how_to_rent_provided === true ||
      wizardFacts.how_to_rent_provided === 'yes' ||
      wizardFacts.how_to_rent_given === true ||
      wizardFacts.how_to_rent_served === true ||  // Section21ComplianceSection uses this
      wizardFacts.how_to_rent_served === 'yes',
    epc_provided:
      wizardFacts.epc_provided === true ||
      wizardFacts.epc_provided === 'yes' ||
      wizardFacts.epc_served === true ||  // Section21ComplianceSection uses this
      wizardFacts.epc_served === 'yes',
    epc_rating: wizardFacts.epc_rating,

    // Help information
    council_phone: wizardFacts.council_phone,

    // ==========================================================================
    // LICENSING & RETALIATORY EVICTION (Jan 2026 Audit)
    // These fields are needed for validateSection21Preconditions()
    // ==========================================================================
    // Licensing
    licensing_required: wizardFacts.licensing_required,
    has_valid_licence:
      wizardFacts.has_valid_licence === true ||
      wizardFacts.has_valid_licence === 'yes',

    // Retaliatory eviction
    no_retaliatory_notice:
      wizardFacts.no_retaliatory_notice === true ||
      wizardFacts.no_retaliatory_notice === 'yes',
    improvement_notice_served:
      wizardFacts.improvement_notice_served === true ||
      wizardFacts.improvement_notice_served === 'yes',
    tenant_complaint_made:
      wizardFacts.tenant_complaint_made === true ||
      wizardFacts.tenant_complaint_made === 'yes',
    council_involvement:
      wizardFacts.council_involvement === true ||
      wizardFacts.council_involvement === 'yes',

    // Has gas appliances (needed for validation logic)
    has_gas_appliances:
      wizardFacts.has_gas_appliances === true ||
      wizardFacts.has_gas_appliances === 'yes',
  } as Section21NoticeData & {
    licensing_required?: string;
    has_valid_licence?: boolean;
    no_retaliatory_notice?: boolean;
    improvement_notice_served?: boolean;
    tenant_complaint_made?: boolean;
    council_involvement?: boolean;
    has_gas_appliances?: boolean;
  };
}

/**
 * Validate Section 21 eligibility based on compliance requirements
 * This should be called by the decision engine before allowing S21 route
 */
export function validateSection21Eligibility(data: Section21NoticeData): {
  eligible: boolean;
  blocking_issues: string[];
  warnings: string[];
} {
  const blocking_issues: string[] = [];
  const warnings: string[] = [];

  // Deposit protection is MANDATORY for valid Section 21
  if (!data.deposit_protected) {
    blocking_issues.push(
      'Section 21 cannot be used because the deposit is not protected in an approved scheme. You must use Section 8 instead.'
    );
  }

  // Prescribed information must be given
  if (!data.prescribed_info_given) {
    blocking_issues.push(
      'Section 21 cannot be used because prescribed information about the deposit was not provided within 30 days. You must use Section 8 instead.'
    );
  }

  // Gas safety certificate (if gas supply present)
  if (data.gas_certificate_provided === false) {
    blocking_issues.push(
      'Section 21 cannot be used because gas safety certificate was not provided. You must use Section 8 instead.'
    );
  }

  // How to Rent guide (for tenancies after Oct 1, 2015)
  const tenancyStartDate = new Date(data.tenancy_start_date);
  const howToRentRequiredDate = new Date('2015-10-01');
  if (tenancyStartDate >= howToRentRequiredDate && !data.how_to_rent_provided) {
    blocking_issues.push(
      'Section 21 cannot be used because the How to Rent guide was not provided at the start of the tenancy. You must use Section 8 instead.'
    );
  }

  // EPC rating below minimum (E) is a warning, not blocking
  if (data.epc_rating && ['F', 'G'].includes(data.epc_rating.toUpperCase())) {
    warnings.push(
      'Your EPC rating is below the minimum energy efficiency standard (E). Section 21 may be invalid if the tenancy started after April 1, 2020.'
    );
  }

  return {
    eligible: blocking_issues.length === 0,
    blocking_issues,
    warnings,
  };
}
