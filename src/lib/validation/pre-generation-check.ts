/**
 * Pre-Generation Consistency Check
 *
 * Validates wizard answers before document generation for complete_pack product.
 * Catches contradictions and missing critical data that would produce invalid documents.
 *
 * DESIGN:
 * - Rule-based checks always run
 * - Optional LLM check via ENABLE_LLM_CONSISTENCY_CHECK env flag (default: false)
 * - BLOCKER issues prevent generation (return 400)
 * - WARNING issues are logged but allow generation to proceed
 */

import { jsonCompletion, hasCustomJsonAIClient, ChatMessage, parseAIModel } from '@/lib/ai/openai-client';
import { validateGround8Eligibility } from '@/lib/arrears-engine';
import type { ArrearsItem, TenancyFacts } from '@/lib/case-facts/schema';

// =============================================================================
// Types
// =============================================================================

export type IssueSeverity = 'blocker' | 'warning';

export interface ConsistencyIssue {
  code: string;
  severity: IssueSeverity;
  message: string;
  fields: string[];
  suggestion?: string;
}

export interface PreGenerationCheckResult {
  passed: boolean;
  blockers: ConsistencyIssue[];
  warnings: ConsistencyIssue[];
  llm_check_ran: boolean;
}

// Flat wizard facts format (from getCaseFacts)
export type WizardFactsFlat = Record<string, any>;

// =============================================================================
// Rule-Based Consistency Checks
// =============================================================================

/**
 * Normalize route values to canonical slugs.
 * Handles both legacy display labels and new slug values.
 *
 * Examples:
 * - "Section 8 (fault-based)" -> "section_8"
 * - "Section 21 (no-fault)" -> "section_21"
 * - "section_8" -> "section_8"
 * - "section_21" -> "section_21"
 */
export function normalizeRoute(route: string | undefined): string | undefined {
  if (!route) return route;
  const lower = route.toLowerCase();
  if (lower.includes('section 8') || lower.includes('section_8')) return 'section_8';
  if (lower.includes('section 21') || lower.includes('section_21')) return 'section_21';
  return route;
}

/**
 * Derive jurisdiction from facts.
 * Checks multiple possible field names.
 */
function deriveJurisdiction(facts: WizardFactsFlat): 'england' | 'wales' | 'scotland' | 'northern-ireland' {
  const jurisdiction = facts.jurisdiction || facts.property_country || facts.country || 'england';
  const normalized = jurisdiction.toLowerCase().replace(/[^a-z-]/g, '');

  if (normalized.includes('wales')) return 'wales';
  if (normalized.includes('scotland')) return 'scotland';
  if (normalized.includes('northern') || normalized.includes('ireland') || normalized === 'ni') return 'northern-ireland';
  return 'england';
}

/**
 * Normalize Wales route values.
 */
function normalizeWalesRoute(route: string | undefined): string | undefined {
  if (!route) return route;
  const lower = route.toLowerCase();
  if (lower.includes('section 173') || lower.includes('section_173') || lower.includes('wales_section_173')) return 'wales_section_173';
  if (lower.includes('fault') || lower.includes('breach') || lower.includes('wales_fault')) return 'wales_fault_based';
  return route;
}

/**
 * Run rule-based consistency checks on wizard facts.
 * These always run before generation.
 *
 * Now supports jurisdiction-aware validation for England, Wales, Scotland.
 */
export function runRuleBasedChecks(facts: WizardFactsFlat, product: string): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  // Only run complete_pack specific checks for complete_pack/eviction_pack/notice_only
  if (product !== 'complete_pack' && product !== 'eviction_pack' && product !== 'notice_only') {
    return issues;
  }

  // Derive jurisdiction
  const jurisdiction = deriveJurisdiction(facts);

  // Normalize route to canonical slug (handles legacy "Section 8 (fault-based)" etc.)
  const rawRoute = facts.selected_notice_route || facts.eviction_route;
  const route = jurisdiction === 'wales' ? normalizeWalesRoute(rawRoute) : normalizeRoute(rawRoute);

  // ========================================
  // Common Checks (both routes)
  // ========================================

  // Check required party information
  if (!facts.landlord_full_name && !facts.landlord_name) {
    issues.push({
      code: 'MISSING_LANDLORD_NAME',
      severity: 'blocker',
      message: 'Landlord name is required for document generation',
      fields: ['landlord_full_name', 'landlord_name'],
      suggestion: 'Provide the landlord\'s full legal name',
    });
  }

  if (!facts.tenant_full_name && !facts.tenant_name) {
    issues.push({
      code: 'MISSING_TENANT_NAME',
      severity: 'blocker',
      message: 'Tenant name is required for document generation',
      fields: ['tenant_full_name', 'tenant_name'],
      suggestion: 'Provide the tenant\'s full legal name',
    });
  }

  // Check property address
  if (!facts.property_address_line1) {
    issues.push({
      code: 'MISSING_PROPERTY_ADDRESS',
      severity: 'blocker',
      message: 'Property address is required for document generation',
      fields: ['property_address_line1'],
      suggestion: 'Provide the full property address',
    });
  }

  // Check tenancy start date
  if (!facts.tenancy_start_date) {
    issues.push({
      code: 'MISSING_TENANCY_START_DATE',
      severity: 'blocker',
      message: 'Tenancy start date is required for notice period calculations',
      fields: ['tenancy_start_date'],
      suggestion: 'Provide the date the tenancy began',
    });
  }

  // Check notice service date
  const noticeServiceDate = facts.notice_served_date || facts.notice_service_date;
  if (!noticeServiceDate) {
    issues.push({
      code: 'MISSING_NOTICE_SERVICE_DATE',
      severity: 'blocker',
      message: 'Notice service date is required for court applications',
      fields: ['notice_served_date', 'notice_service_date'],
      suggestion: 'Provide the date the notice was/will be served',
    });
  }

  // ========================================
  // Timeline Consistency Checks
  // ========================================

  const today = new Date().toISOString().split('T')[0];

  // Tenancy start date should be in the past
  if (facts.tenancy_start_date && facts.tenancy_start_date > today) {
    issues.push({
      code: 'FUTURE_TENANCY_START',
      severity: 'blocker',
      message: 'Tenancy start date cannot be in the future',
      fields: ['tenancy_start_date'],
      suggestion: 'Verify the tenancy start date is correct',
    });
  }

  // Notice service date should be after tenancy start
  if (noticeServiceDate && facts.tenancy_start_date && noticeServiceDate < facts.tenancy_start_date) {
    issues.push({
      code: 'NOTICE_BEFORE_TENANCY',
      severity: 'blocker',
      message: 'Notice cannot be served before the tenancy started',
      fields: ['notice_served_date', 'tenancy_start_date'],
      suggestion: 'Verify both dates are correct',
    });
  }

  // Notice expiry should be after service date
  const noticeExpiry = facts.notice_expiry_date;
  if (noticeExpiry && noticeServiceDate && noticeExpiry <= noticeServiceDate) {
    issues.push({
      code: 'EXPIRY_BEFORE_SERVICE',
      severity: 'blocker',
      message: 'Notice expiry date must be after service date',
      fields: ['notice_expiry_date', 'notice_served_date'],
      suggestion: 'Notice expiry should be at least 2 weeks after service for Section 8, 2 months for Section 21',
    });
  }

  // ========================================
  // Section 8 Specific Checks
  // ========================================

  if (route === 'section_8') {
    // Must have grounds selected
    const grounds = facts.section8_grounds || facts.section8_grounds_selection;
    if (!grounds || (Array.isArray(grounds) && grounds.length === 0)) {
      issues.push({
        code: 'S8_NO_GROUNDS',
        severity: 'blocker',
        message: 'Section 8 requires at least one ground for possession',
        fields: ['section8_grounds', 'section8_grounds_selection'],
        suggestion: 'Select the applicable grounds for eviction',
      });
    }

    // Check grounds-data consistency
    const groundsArray = Array.isArray(grounds) ? grounds : [grounds];
    const groundsStr = groundsArray.join(' ').toLowerCase();

    // Ground 8/10/11 (arrears grounds) require arrears data
    if (groundsStr.includes('8') || groundsStr.includes('10') || groundsStr.includes('11') || groundsStr.includes('arrears')) {
      const hasArrears = facts.has_rent_arrears === true || facts.has_arrears === true;
      const totalArrears = facts.total_arrears || facts.arrears_total || facts.arrears_at_notice_date;

      if (!hasArrears && !totalArrears) {
        issues.push({
          code: 'S8_ARREARS_GROUND_NO_DATA',
          severity: 'blocker',
          message: 'Arrears grounds selected but no arrears data provided',
          fields: ['has_rent_arrears', 'total_arrears'],
          suggestion: 'Provide arrears amount and confirm arrears status',
        });
      }

      // Ground 8 threshold validation (2+ months arrears required)
      if (groundsStr.includes('8') && (totalArrears || (facts.arrears_items && facts.arrears_items.length > 0))) {
        const rentAmount = facts.rent_amount || 0;
        const rentFrequency = (facts.rent_frequency || 'monthly') as TenancyFacts['rent_frequency'];
        const arrearsItems: ArrearsItem[] = facts.arrears_items || [];

        if (rentAmount > 0) {
          const ground8Result = validateGround8Eligibility({
            arrears_items: arrearsItems,
            rent_amount: rentAmount,
            rent_frequency: rentFrequency,
            jurisdiction: jurisdiction,
            legacy_total_arrears: totalArrears || 0,
          });

          if (!ground8Result.is_eligible) {
            issues.push({
              code: 'GROUND_8_THRESHOLD_NOT_MET',
              severity: 'blocker',
              message: `Ground 8 requires at least 2 months\' arrears: ${ground8Result.explanation}`,
              fields: ['total_arrears', 'arrears_items', 'rent_amount'],
              suggestion: 'Arrears must be at least 2 months rent (8 weeks for weekly) at both notice date and hearing. Consider Ground 10/11 instead.',
            });
          }
        }
      }
    }

    // Ground 14 (ASB) should have ASB details
    if (groundsStr.includes('14') || groundsStr.includes('nuisance') || groundsStr.includes('asb')) {
      const hasAsb = facts.has_asb === true;
      const asbDetails = facts.section8_details || facts.ground_particulars;

      if (!hasAsb && !asbDetails) {
        issues.push({
          code: 'S8_ASB_GROUND_NO_DATA',
          severity: 'warning',
          message: 'Ground 14 (nuisance/ASB) selected but no ASB details provided',
          fields: ['has_asb', 'section8_details'],
          suggestion: 'Provide details of antisocial behaviour incidents',
        });
      }
    }

    // Ground 12 (breach) should have breach details
    if (groundsStr.includes('12') || groundsStr.includes('breach')) {
      const hasBreach = facts.has_breaches === true;
      const breachDetails = facts.section8_details || facts.ground_particulars;

      if (!hasBreach && !breachDetails) {
        issues.push({
          code: 'S8_BREACH_GROUND_NO_DATA',
          severity: 'warning',
          message: 'Ground 12 (breach) selected but no breach details provided',
          fields: ['has_breaches', 'section8_details'],
          suggestion: 'Provide details of tenancy agreement breach',
        });
      }
    }

    // Must have ground particulars
    const particulars = facts.section8_details || facts.ground_particulars;
    if (!particulars) {
      issues.push({
        code: 'S8_NO_PARTICULARS',
        severity: 'blocker',
        message: 'Section 8 requires particulars of each ground',
        fields: ['section8_details', 'ground_particulars'],
        suggestion: 'Provide specific details supporting each ground',
      });
    }
  }

  // ========================================
  // Section 21 Specific Checks
  // ========================================

  if (route === 'section_21') {
    // Deposit protection (if deposit taken)
    const depositTaken = facts.deposit_taken === true || (facts.deposit_amount && facts.deposit_amount > 0);

    if (depositTaken) {
      const depositProtected = facts.deposit_protected === true || facts.deposit_protected_scheme === true;

      if (!depositProtected) {
        issues.push({
          code: 'S21_DEPOSIT_NOT_PROTECTED',
          severity: 'blocker',
          message: 'Section 21 invalid without deposit protection',
          fields: ['deposit_protected', 'deposit_protected_scheme'],
          suggestion: 'Confirm the deposit is protected in an approved scheme',
        });
      }

      // Prescribed information
      const prescribedInfo = facts.prescribed_info_served === true || facts.prescribed_info_given === true;
      if (!prescribedInfo) {
        issues.push({
          code: 'S21_PRESCRIBED_INFO_MISSING',
          severity: 'blocker',
          message: 'Section 21 requires prescribed information to be served',
          fields: ['prescribed_info_served', 'prescribed_info_given'],
          suggestion: 'Confirm prescribed information was given within 30 days of deposit protection',
        });
      }

      // Deposit details for N5B
      if (!facts.deposit_amount) {
        issues.push({
          code: 'S21_MISSING_DEPOSIT_AMOUNT',
          severity: 'warning',
          message: 'Deposit amount needed for Form N5B',
          fields: ['deposit_amount'],
          suggestion: 'Provide the deposit amount for court forms',
        });
      }

      if (!facts.deposit_protection_date) {
        issues.push({
          code: 'S21_MISSING_DEPOSIT_DATE',
          severity: 'warning',
          message: 'Deposit protection date needed for Form N5B',
          fields: ['deposit_protection_date'],
          suggestion: 'Provide the date the deposit was protected',
        });
      }

      if (!facts.deposit_scheme_name) {
        issues.push({
          code: 'S21_MISSING_DEPOSIT_SCHEME',
          severity: 'warning',
          message: 'Deposit scheme name needed for Form N5B',
          fields: ['deposit_scheme_name'],
          suggestion: 'Specify which scheme holds the deposit (DPS, MyDeposits, or TDS)',
        });
      }
    }

    // How to Rent guide (required for tenancies starting Oct 2015+)
    if (facts.tenancy_start_date && facts.tenancy_start_date >= '2015-10-01') {
      const howToRentServed = facts.how_to_rent_served === true || facts.how_to_rent_provided === true;
      if (howToRentServed === false) {
        issues.push({
          code: 'S21_HOW_TO_RENT_MISSING',
          severity: 'blocker',
          message: 'Section 21 requires "How to Rent" guide for post-October 2015 tenancies',
          fields: ['how_to_rent_served', 'how_to_rent_provided'],
          suggestion: 'Confirm the How to Rent guide was provided to the tenant',
        });
      }
    }

    // EPC provided
    if (facts.epc_gas_cert_served === false || facts.epc_provided === false) {
      issues.push({
        code: 'S21_EPC_MISSING',
        severity: 'blocker',
        message: 'Section 21 requires EPC to be provided',
        fields: ['epc_gas_cert_served', 'epc_provided'],
        suggestion: 'Confirm EPC was provided to the tenant',
      });
    }

    // Gas certificate (if gas appliances)
    if (facts.has_gas_appliances === true) {
      const gasProvided = facts.gas_certificate_provided === true || facts.epc_gas_cert_served === true;
      if (!gasProvided) {
        issues.push({
          code: 'S21_GAS_CERT_MISSING',
          severity: 'blocker',
          message: 'Section 21 requires gas safety certificate for properties with gas',
          fields: ['gas_certificate_provided', 'epc_gas_cert_served'],
          suggestion: 'Confirm a valid gas safety certificate was provided',
        });
      }
    }

    // Retaliatory eviction check
    if (facts.no_retaliatory_notice === false || facts.recent_repair_complaints === true) {
      issues.push({
        code: 'S21_RETALIATORY_EVICTION_RISK',
        severity: 'blocker',
        message: 'Section 21 may be invalid due to recent repair complaints',
        fields: ['no_retaliatory_notice', 'recent_repair_complaints'],
        suggestion: 'Wait 6 months after repair complaint resolution or use Section 8',
      });
    }
  }

  // ========================================
  // Wales Section 173 Specific Checks
  // ========================================

  if (jurisdiction === 'wales' && (route === 'wales_section_173' || route?.includes('173'))) {
    // Wales requires 6 months notice for Section 173
    const noticeServiceDate = facts.notice_served_date || facts.notice_service_date;
    const noticeExpiry = facts.notice_expiry_date;

    if (noticeServiceDate && noticeExpiry) {
      const serviceDate = new Date(noticeServiceDate);
      const expiryDate = new Date(noticeExpiry);
      const daysDiff = Math.floor((expiryDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 182) { // 6 months = ~182 days
        issues.push({
          code: 'WALES_S173_NOTICE_PERIOD_SHORT',
          severity: 'blocker',
          message: 'Wales Section 173 requires minimum 6 months notice period',
          fields: ['notice_served_date', 'notice_expiry_date'],
          suggestion: 'Section 173 notice must give at least 6 months notice per Renting Homes (Wales) Act 2016',
        });
      }
    }

    // Wales deposit protection (if deposit taken)
    const depositTaken = facts.deposit_taken === true || (facts.deposit_amount && facts.deposit_amount > 0);
    if (depositTaken) {
      const depositProtected = facts.deposit_protected === true || facts.deposit_protected_wales === true;
      if (!depositProtected) {
        issues.push({
          code: 'WALES_DEPOSIT_NOT_PROTECTED',
          severity: 'blocker',
          message: 'Wales Section 173 invalid without deposit protection',
          fields: ['deposit_protected', 'deposit_protected_wales'],
          suggestion: 'Deposit must be protected in an approved scheme within 30 days',
        });
      }
    }

    // Wales-specific: Written statement of occupation contract
    if (facts.written_statement_provided === false) {
      issues.push({
        code: 'WALES_WRITTEN_STATEMENT_MISSING',
        severity: 'warning',
        message: 'Wales requires written statement of occupation contract',
        fields: ['written_statement_provided'],
        suggestion: 'Renting Homes (Wales) Act 2016 requires landlords to provide a written statement',
      });
    }
  }

  // ========================================
  // Wales Fault-Based (Section 159) Checks
  // ========================================

  if (jurisdiction === 'wales' && (route === 'wales_fault_based' || route?.includes('fault'))) {
    // Wales fault-based requires grounds under Renting Homes (Wales) Act 2016
    // NOTE: section8_grounds is checked as legacy fallback for older wizard data
    // New wizard data should use wales_breach_type field
    const grounds = facts.wales_breach_type || facts.section8_grounds;
    if (!grounds || (Array.isArray(grounds) && grounds.length === 0)) {
      issues.push({
        code: 'WALES_FAULT_NO_GROUNDS',
        severity: 'blocker',
        message: 'Wales fault-based notice requires breach grounds',
        fields: ['wales_breach_type'],
        suggestion: 'Specify the grounds for possession under Schedule 9 of Renting Homes (Wales) Act 2016',
      });
    }

    // Wales fault-based notice period is 56 days (8 weeks) for Section 159
    const noticeServiceDate = facts.notice_served_date || facts.notice_service_date;
    const noticeExpiry = facts.notice_expiry_date;

    if (noticeServiceDate && noticeExpiry) {
      const serviceDate = new Date(noticeServiceDate);
      const expiryDate = new Date(noticeExpiry);
      const daysDiff = Math.floor((expiryDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 56) {
        issues.push({
          code: 'WALES_FAULT_NOTICE_PERIOD_SHORT',
          severity: 'blocker',
          message: 'Wales Section 159 requires minimum 56 days (8 weeks) notice',
          fields: ['notice_served_date', 'notice_expiry_date'],
          suggestion: 'Discretionary grounds require 8 weeks notice per Renting Homes (Wales) Act 2016, s.159',
        });
      }
    }
  }

  // ========================================
  // Scotland Notice to Leave Checks
  // ========================================

  if (jurisdiction === 'scotland') {
    // Scotland requires grounds for eviction
    const grounds = facts.scotland_grounds || facts.notice_to_leave_grounds || facts.prt_grounds;
    if (!grounds || (Array.isArray(grounds) && grounds.length === 0)) {
      issues.push({
        code: 'SCOTLAND_NO_GROUNDS',
        severity: 'blocker',
        message: 'Scotland Notice to Leave requires eviction grounds',
        fields: ['scotland_grounds', 'notice_to_leave_grounds'],
        suggestion: 'Select applicable grounds under Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3',
      });
    }

    // Scotland landlord registration required
    if (!facts.landlord_registration_number && !facts.landlord_reg_number) {
      issues.push({
        code: 'SCOTLAND_LANDLORD_NOT_REGISTERED',
        severity: 'blocker',
        message: 'Scotland requires landlord registration number',
        fields: ['landlord_registration_number', 'landlord_reg_number'],
        suggestion: 'Provide your Scottish Landlord Registration number (required by law)',
      });
    }

    // Scotland pre-action protocol (for rent arrears)
    const groundsStr = Array.isArray(grounds) ? grounds.join(' ').toLowerCase() : (grounds || '').toLowerCase();
    if (groundsStr.includes('arrears') || groundsStr.includes('ground 1') || groundsStr.includes('rent')) {
      if (facts.pre_action_completed !== true && facts.pre_action_protocol_followed !== true) {
        issues.push({
          code: 'SCOTLAND_PRE_ACTION_NOT_COMPLETED',
          severity: 'blocker',
          message: 'Scotland rent arrears eviction requires pre-action protocol compliance',
          fields: ['pre_action_completed', 'pre_action_protocol_followed'],
          suggestion: 'Complete Pre-Action Requirements per Private Residential Tenancies regulations before issuing notice',
        });
      }
    }

    // Scotland minimum notice periods vary by ground
    // Ground 1 (rent arrears) = 28 days, Other grounds = 28-84 days depending on ground
    const noticeServiceDate = facts.notice_served_date || facts.notice_service_date;
    const noticeExpiry = facts.notice_expiry_date;

    if (noticeServiceDate && noticeExpiry) {
      const serviceDate = new Date(noticeServiceDate);
      const expiryDate = new Date(noticeExpiry);
      const daysDiff = Math.floor((expiryDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 28) {
        issues.push({
          code: 'SCOTLAND_NOTICE_PERIOD_SHORT',
          severity: 'blocker',
          message: 'Scotland Notice to Leave requires minimum 28 days notice',
          fields: ['notice_served_date', 'notice_expiry_date'],
          suggestion: 'Most grounds require at least 28 days notice; some require 84 days',
        });
      }
    }
  }

  // ========================================
  // Contradiction Checks
  // ========================================

  // Arrears amount vs has_arrears flag
  const totalArrears = facts.total_arrears || facts.arrears_total;
  // Use explicit check to handle false vs undefined
  const hasArrearsExplicit = facts.has_rent_arrears ?? facts.has_arrears;

  if (totalArrears && totalArrears > 0 && hasArrearsExplicit === false) {
    issues.push({
      code: 'ARREARS_CONTRADICTION',
      severity: 'warning',
      message: 'Arrears amount provided but has_arrears is false',
      fields: ['total_arrears', 'has_rent_arrears'],
      suggestion: 'Confirm whether there are rent arrears',
    });
  }

  if (hasArrearsExplicit === true && (!totalArrears || totalArrears === 0)) {
    issues.push({
      code: 'ARREARS_AMOUNT_MISSING',
      severity: 'warning',
      message: 'Arrears indicated but no amount specified',
      fields: ['total_arrears', 'has_rent_arrears'],
      suggestion: 'Provide the total arrears amount',
    });
  }

  return issues;
}

// =============================================================================
// LLM-Based Consistency Check (Optional)
// =============================================================================

const LLM_CONSISTENCY_SCHEMA = {
  type: 'object',
  properties: {
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'warning'] },
          message: { type: 'string' },
          fields: { type: 'array', items: { type: 'string' } },
          suggestion: { type: 'string' },
        },
        required: ['code', 'severity', 'message', 'fields'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['issues', 'summary'],
};

const LLM_SYSTEM_PROMPT = `You are an expert UK landlord-tenant law analyst reviewing eviction case data before document generation.

Your task is to identify logical inconsistencies, contradictions, or implausible data in the collected case facts.

FOCUS ON:
1. Timeline contradictions (dates that don't make logical sense)
2. Route-data mismatches (e.g., Section 8 selected but no grounds provided)
3. Implausible amounts (e.g., arrears exceeding reasonable bounds)
4. Missing critical data that would invalidate the documents
5. Contradictory answers (e.g., "no deposit taken" but deposit amount provided)

SEVERITY LEVELS:
- "blocker": Critical issues that would produce invalid/useless documents. MUST be fixed before generation.
- "warning": Issues that may weaken the case but don't prevent generation.

DO NOT flag:
- Missing optional fields (only flag if critically needed)
- Style preferences
- Minor formatting issues

Respond with JSON containing "issues" array and brief "summary".`;

/**
 * Run LLM-based consistency check on wizard facts.
 * Only runs if ENABLE_LLM_CONSISTENCY_CHECK=true.
 */
export async function runLLMConsistencyCheck(
  facts: WizardFactsFlat,
  product: string,
  route: string | undefined
): Promise<ConsistencyIssue[]> {
  // Check if LLM check is enabled (default: false)
  const enableLLM = process.env.ENABLE_LLM_CONSISTENCY_CHECK === 'true';
  if (!enableLLM) {
    return [];
  }

  // Check if we have an AI client configured
  if (!hasCustomJsonAIClient() && !process.env.OPENAI_API_KEY) {
    console.warn('[PreGenCheck] LLM check enabled but no AI client available');
    return [];
  }

  const userPrompt = `
Review this eviction case data for the England Complete Eviction Pack:

**Product:** ${product}
**Selected Route:** ${route || 'Not specified'}

**Collected Facts:**
${JSON.stringify(facts, null, 2)}

Identify any logical inconsistencies, contradictions, or critical missing data that would prevent valid document generation.
`;

  const messages: ChatMessage[] = [
    { role: 'system', content: LLM_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  try {
    const result = await jsonCompletion<{
      issues: ConsistencyIssue[];
      summary: string;
    }>(messages, LLM_CONSISTENCY_SCHEMA, {
      model: parseAIModel(process.env.AI_MODEL_CONSISTENCY, 'gpt-4o-mini'),
      temperature: 0.3,
      max_tokens: 2048,
    });

    console.log(`[PreGenCheck] LLM check summary: ${result.json.summary}`);

    return result.json.issues || [];
  } catch (error: any) {
    console.error('[PreGenCheck] LLM consistency check failed:', error.message);
    // Don't block generation if LLM check fails - rule-based checks already ran
    return [];
  }
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Run pre-generation consistency validation.
 *
 * @param facts - Flat wizard facts from getCaseFacts()
 * @param product - Product type (e.g., 'complete_pack', 'eviction_pack')
 * @returns PreGenerationCheckResult with blockers, warnings, and pass/fail status
 */
export async function runPreGenerationCheck(
  facts: WizardFactsFlat,
  product: string
): Promise<PreGenerationCheckResult> {
  const route = facts.selected_notice_route || facts.eviction_route;

  // Always run rule-based checks
  const ruleIssues = runRuleBasedChecks(facts, product);

  // Optionally run LLM check
  const llmIssues = await runLLMConsistencyCheck(facts, product, route);
  const llmCheckRan = llmIssues.length > 0 || process.env.ENABLE_LLM_CONSISTENCY_CHECK === 'true';

  // Combine issues, avoiding duplicates by code
  const seenCodes = new Set<string>();
  const allIssues: ConsistencyIssue[] = [];

  for (const issue of [...ruleIssues, ...llmIssues]) {
    if (!seenCodes.has(issue.code)) {
      seenCodes.add(issue.code);
      allIssues.push(issue);
    }
  }

  // Separate blockers from warnings
  const blockers = allIssues.filter((i) => i.severity === 'blocker');
  const warnings = allIssues.filter((i) => i.severity === 'warning');

  return {
    passed: blockers.length === 0,
    blockers,
    warnings,
    llm_check_ran: llmCheckRan,
  };
}
