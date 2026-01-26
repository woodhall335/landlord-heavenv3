import {
  calculateScotlandNoticeToLeaveExpiryDate,
  calculateSection21ExpiryDate,
  calculateSection8ExpiryDate,
} from '@/lib/documents/notice-date-calculator';
import { getNoticeComplianceSpec } from './notice-compliance-spec';
import { normalizeFactKeys, getAffectedQuestionId, getFactValue } from '@/lib/wizard/normalizeFacts';

type NoticeStage = 'wizard' | 'preview' | 'generate';

export type ComplianceResult = {
  ok: boolean;
  hardFailures: Array<{ code: string; affected_question_id: string; legal_reason: string; user_fix_hint: string }>;
  warnings: Array<{ code: string; affected_question_id: string; legal_reason: string; user_fix_hint: string }>;
  computed?: {
    service_date?: string;
    deemed_service_date?: string;
    expiry_date?: string;
    notice_period_days?: number;
    earliest_proceedings_date?: string;
  };
};

type EvaluateInput = {
  jurisdiction: string;
  product: string;
  selected_route?: string;
  wizardFacts: Record<string, any>;
  question_id?: string;
  stage?: NoticeStage;
};

function normaliseRoute(jurisdiction: string, selected_route?: string) {
  // Check for Wales fault-based FIRST before generic wales check
  if (selected_route === 'wales_fault_based' || selected_route?.includes('fault-based')) {
    return 'notice-only/wales/fault-based';
  }

  if (selected_route && (selected_route.includes('wales') || selected_route === 'section_173')) {
    return 'notice-only/wales/section173';
  }

  if (selected_route === 'notice_to_leave' || selected_route?.includes('notice-to-leave')) {
    return 'notice-only/scotland/notice-to-leave';
  }

  if (selected_route === 'section_21') {
    return 'notice-only/england/section21';
  }

  if (selected_route === 'section_8') {
    return 'notice-only/england/section8';
  }

  if (jurisdiction === 'wales') {
    return 'notice-only/wales/section173';
  }

  if (jurisdiction === 'scotland') {
    return 'notice-only/scotland/notice-to-leave';
  }

  return 'notice-only/england/section8';
}

function toDate(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function addMonths(base: Date, months: number) {
  const copy = new Date(base);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function pickDateValue(facts: Record<string, any>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = key.split('.').reduce<any>((acc, part) => (acc ? acc[part] : undefined), facts);
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

/**
 * PHASE 5: Normalizes section8_grounds to always be an array.
 * Handles various input formats:
 * - Already an array: ['ground_8', 'ground_11'] -> ['ground_8', 'ground_11']
 * - Comma-joined string: 'ground_8,ground_11' -> ['ground_8', 'ground_11']
 * - Single value: 'ground_8' -> ['ground_8']
 * - Null/undefined: -> []
 */
function normalizeSection8Grounds(grounds: any): string[] {
  if (!grounds) return [];

  if (Array.isArray(grounds)) {
    return grounds.filter((g): g is string => typeof g === 'string' && g.length > 0);
  }

  if (typeof grounds === 'string') {
    if (grounds.includes(',')) {
      return grounds.split(',').map(g => g.trim()).filter(g => g.length > 0);
    }
    return grounds.trim() ? [grounds.trim()] : [];
  }

  return [];
}

/**
 * Evaluate notice compliance for notice_only and complete_pack products.
 *
 * @deprecated Phase 9: This function is being replaced by the YAML rules engine.
 * Use `runYamlPrimaryNoticeValidation()` from `@/lib/validation/shadow-mode-adapter`
 * for production validation flows. This TS implementation remains as a fallback
 * when EVICTION_YAML_PRIMARY=false or when YAML validation fails.
 *
 * Migration status:
 * - England S21: ✅ YAML parity achieved
 * - England S8: ✅ YAML parity achieved
 * - Wales S173: ✅ YAML parity achieved
 * - Scotland NTL: ✅ YAML parity achieved
 *
 * This function will be removed once YAML-only mode is stable in production.
 * Track removal progress in CUTOVER_PLAN.md.
 *
 * @param input - Compliance evaluation input
 * @returns Compliance result with hard failures and warnings
 */
export function evaluateNoticeCompliance(input: EvaluateInput): ComplianceResult {
  // Phase 9: Log deprecation warning when called directly (not via YAML primary)
  if (process.env.EVICTION_YAML_PRIMARY === 'true' && process.env.NODE_ENV !== 'test') {
    console.warn(
      '[DEPRECATED] evaluateNoticeCompliance called directly while YAML is primary.',
      'This TS validator should only be used as fallback.',
      { jurisdiction: input.jurisdiction, route: input.selected_route }
    );
  }

  const { jurisdiction, product, selected_route, stage = 'wizard' } = input;

  // Apply canonical fact normalization to ensure consistent field names
  // This handles legacy keys like gas_safety_cert_provided -> gas_certificate_provided
  const wizardFacts = normalizeFactKeys(input.wizardFacts);

  // PHASE 5: Normalize section8_grounds to ensure it's always an array
  if (wizardFacts.section8_grounds !== undefined) {
    wizardFacts.section8_grounds = normalizeSection8Grounds(wizardFacts.section8_grounds);
  }

  const hardFailures: ComplianceResult['hardFailures'] = [];
  const warnings: ComplianceResult['warnings'] = [];
  const computed: NonNullable<ComplianceResult['computed']> = {};

  // Run compliance checks for notice_only and complete_pack products
  // Section 21/Section 8 compliance is critical for both products
  if (product !== 'notice_only' && product !== 'complete_pack') {
    return { ok: true, hardFailures, warnings };
  }

  if (jurisdiction === 'northern-ireland') {
    hardFailures.push({
      code: 'NI_NOTICE_UNSUPPORTED',
      affected_question_id: 'jurisdiction',
      legal_reason: 'Notice-only eviction flows are not supported in Northern Ireland',
      user_fix_hint: 'Select a supported jurisdiction or use the tenancy agreement product for Northern Ireland.',
    });
    return { ok: false, hardFailures, warnings };
  }

  const route = normaliseRoute(jurisdiction, selected_route);
  const spec = getNoticeComplianceSpec(route);

  if (!spec) {
    hardFailures.push({
      code: 'NOTICE-SPEC-MISSING',
      affected_question_id: 'selected_notice_route',
      legal_reason: 'Compliance spec missing for this notice route',
      user_fix_hint: 'Select a supported notice route or contact support',
    });
    return { ok: false, hardFailures, warnings };
  }

  let service_date: string | undefined;
  let expiry_date: string | undefined;

  if (route === 'notice-only/scotland/notice-to-leave') {
    // Scotland canonical MQS fields first
    service_date = pickDateValue(wizardFacts, ['notice.notice_date']);
    expiry_date = pickDateValue(wizardFacts, ['notice.expiry_date']);

    // Legacy/deprecated fallbacks (non-canonical)
    if (!service_date) {
      service_date = pickDateValue(wizardFacts, [
        'notice_service_date',
        'notice.service_date',
        'notice_date',
        'notice_service.notice_date',
      ]);
    }

    if (!expiry_date) {
      expiry_date =
        pickDateValue(wizardFacts, [
          'notice_expiry_date',
          'notice_expiry',
          'notice.notice_expiry',
          'notice_service.notice_expiry_date',
          'notice_service.notice_expiry',
        ]) || wizardFacts.calculated_expiry_date;
    }
  } else {
    // England/Wales canonical MQS fields first
    service_date = pickDateValue(wizardFacts, ['notice_service.notice_date']);
    expiry_date = pickDateValue(wizardFacts, ['notice_service.notice_expiry_date']);

    // Legacy/deprecated fallbacks (non-canonical)
    if (!service_date) {
      service_date = pickDateValue(wizardFacts, [
        'notice_service_date',
        'notice.service_date',
        'notice.notice_date',
        'notice_date',
      ]);
    }

    if (!expiry_date) {
      expiry_date =
        pickDateValue(wizardFacts, [
          'notice_expiry_date',
          'notice.expiry_date',
          'notice_expiry',
          'notice.notice_expiry',
          'notice_service.notice_expiry',
        ]) || wizardFacts.calculated_expiry_date;
    }
  }

  if (service_date) {
    computed.service_date = service_date;
  }
  if (expiry_date) {
    computed.expiry_date = expiry_date;
  }

  // ---------------------------------------------------------------------------
  // BACKWARD COMPATIBILITY ALIASES
  // ---------------------------------------------------------------------------
  // These normalize input keys from old wizard mappings to match evaluator expectations.
  // No logic changes - just key aliasing for test/compatibility.

  // England S8: Accept section8_grounds_selection if section8_grounds missing
  if (!wizardFacts.section8_grounds && wizardFacts.section8_grounds_selection) {
    wizardFacts.section8_grounds = wizardFacts.section8_grounds_selection;
  }

  // Scotland: Parse numeric ground codes from string labels if scotland_ground_codes missing
  if (!wizardFacts.scotland_ground_codes && wizardFacts.eviction_grounds) {
    const evictionGrounds = Array.isArray(wizardFacts.eviction_grounds)
      ? wizardFacts.eviction_grounds
      : [wizardFacts.eviction_grounds];

    const parsedCodes = evictionGrounds
      .map((ground: string) => {
        if (typeof ground === 'number') return ground;
        if (typeof ground === 'string') {
          // Extract numeric code from strings like "Ground 1 - Rent arrears (3+ months)"
          const match = ground.match(/\bground\s*(\d+)/i);
          return match ? parseInt(match[1], 10) : null;
        }
        return null;
      })
      .filter((code): code is number => code !== null && !Number.isNaN(code));

    if (parsedCodes.length > 0) {
      wizardFacts.scotland_ground_codes = parsedCodes;
    }
  }

  // Scotland: Accept pre_action_contact: 'Yes' and map to canonical structure
  if (
    !wizardFacts?.issues?.rent_arrears?.pre_action_confirmed &&
    wizardFacts.pre_action_contact === 'Yes'
  ) {
    if (!wizardFacts.issues) wizardFacts.issues = {};
    if (!wizardFacts.issues.rent_arrears) wizardFacts.issues.rent_arrears = {};
    wizardFacts.issues.rent_arrears.pre_action_confirmed = true;
  }

  // ---------------------------------------------------------------------------
  // ENGLAND & WALES – SECTION 8
  // ---------------------------------------------------------------------------
  if (route === 'notice-only/england/section8') {
    const grounds: string[] = wizardFacts.section8_grounds || [];

    // CRITICAL FIX: Only enforce grounds requirement at or after the grounds selection question.
    // Don't block users before they've had a chance to select grounds.
    // Since grounds now come BEFORE notice_service in the flow, we only check grounds at:
    // - The grounds selection step itself (section8_grounds_selection)
    // - Follow-up questions about grounds (ground14_severity, ground_particulars, notice_strategy)
    // - Final validation when no question_id is provided (tests, final submission)
    // We do NOT check at notice_service anymore since grounds are collected earlier.
    const shouldCheckGrounds = !input.question_id || // No question_id = full validation (tests, final submission)
                                input.question_id === 'section8_grounds_selection' ||
                                input.question_id === 'ground14_severity' ||
                                input.question_id === 'ground_particulars' ||
                                input.question_id === 'notice_strategy';

    if ((!grounds || grounds.length === 0) && shouldCheckGrounds) {
      hardFailures.push({
        code: 'S8-GROUNDS-REQUIRED',
        affected_question_id: 'section8_grounds_selection',
        legal_reason: 'At least one Section 8 ground is required to serve the notice',
        user_fix_hint: 'Choose the ground(s) that apply before continuing',
      });
    }

    if (service_date && grounds?.length) {
      const mappedGrounds = grounds.map((ground) => {
        const match = ground.match(/(\d+|14A)/i);
        const code = match ? match[1] : ground;
        return { code, mandatory: ['1', '2', '3', '4', '5', '6', '7', '8'].includes(String(code)) };
      });

      try {
        const result = calculateSection8ExpiryDate({
          service_date,
          grounds: mappedGrounds,
          tenancy_start_date: wizardFacts.tenancy_start_date,
          fixed_term: wizardFacts.is_fixed_term,
          fixed_term_end_date: wizardFacts.fixed_term_end_date,
          severity: wizardFacts.ground14_severity,
          jurisdiction: jurisdiction === 'wales' ? 'wales' : 'england',
        });
        computed.expiry_date = result.earliest_valid_date;
        computed.notice_period_days = result.notice_period_days;

        if (expiry_date) {
          const entered = toDate(expiry_date);
          const minimum = toDate(result.earliest_valid_date);
          if (entered && minimum && entered < minimum) {
            hardFailures.push({
              code: 'S8-NOTICE-PERIOD',
              affected_question_id: 'notice_expiry_date',
              legal_reason: 'Expiry date is earlier than the statutory minimum for the selected grounds',
              user_fix_hint: `Set the expiry date to at least ${result.earliest_valid_date}`,
            });
          }
        }
      } catch (err) {
        hardFailures.push({
          code: 'S8-NOTICE-PERIOD',
          affected_question_id: 'section8_grounds_selection',
          legal_reason: 'Unable to calculate notice period without valid grounds and service date',
          user_fix_hint: 'Confirm service date and at least one valid ground to continue',
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // ENGLAND – SECTION 21
  // ---------------------------------------------------------------------------
  if (route === 'notice-only/england/section21') {
    const pushStageIssue = (
      issue: { code: string; affected_question_id: string; legal_reason: string; user_fix_hint: string },
      hardWhen: NoticeStage[] = ['preview', 'generate']
    ) => {
      if (hardWhen.includes(stage)) {
        hardFailures.push(issue);
      } else {
        warnings.push(issue);
      }
    };

    if (wizardFacts.deposit_taken === true) {
      if (wizardFacts.deposit_protected === false) {
        pushStageIssue({
          code: 'S21-DEPOSIT-NONCOMPLIANT',
          affected_question_id: 'deposit_protected_scheme',
          legal_reason: 'Deposit must be protected before a Section 21 notice',
          user_fix_hint: 'Protect the deposit in an approved scheme before continuing',
        });
      } else if (wizardFacts.deposit_protected === true) {
        // Check canonical field first, then fallbacks for legacy/alternative field names
        const prescribedInfoGiven =
          wizardFacts.prescribed_info_given ??
          wizardFacts.prescribed_info_provided ??
          wizardFacts.prescribed_info_served ??
          wizardFacts.tenancy?.prescribed_info_given;
        if (prescribedInfoGiven === false) {
          pushStageIssue({
            code: 'S21-DEPOSIT-NONCOMPLIANT',
            affected_question_id: 'prescribed_info_given',
            legal_reason: 'Prescribed information must be served before a Section 21 notice',
            user_fix_hint: 'Serve the prescribed information and confirm before continuing',
          });
        } else if (prescribedInfoGiven === undefined || prescribedInfoGiven === null) {
          pushStageIssue(
            {
              code: 'S21-PRESCRIBED-INFO-REQUIRED',
              affected_question_id: 'prescribed_info_given',
              legal_reason: 'Prescribed information must be confirmed before generating the notice',
              user_fix_hint: 'Confirm whether prescribed information has been served before generating the notice',
            },
            ['generate']
          );
        }
      } else {
        pushStageIssue(
          {
            code: 'S21-DEPOSIT-NONCOMPLIANT',
            affected_question_id: 'deposit_protected_scheme',
            legal_reason: 'Confirm whether the deposit is protected before generating Section 21',
            user_fix_hint: 'Answer the deposit protection question to continue',
          },
          ['generate']
        );
      }

      // -------------------------------------------------------------------------
      // DEPOSIT CAP ENFORCEMENT (Tenant Fees Act 2019)
      // 5 weeks rent max (or 6 weeks if annual rent > £50,000)
      // This is BLOCKING for Section 21 unless landlord confirms refund/reduction
      // -------------------------------------------------------------------------
      const rawDepositAmount = wizardFacts.deposit_amount ?? wizardFacts.tenancy?.deposit_amount;
      const rawRentAmount = wizardFacts.rent_amount ?? wizardFacts.tenancy?.rent_amount;
      const rentFrequency = wizardFacts.rent_frequency ?? wizardFacts.tenancy?.rent_frequency ?? 'monthly';

      // Coerce string inputs to numbers (wizard may store as strings)
      const depositAmount = typeof rawDepositAmount === 'string' ? parseFloat(rawDepositAmount) : rawDepositAmount;
      const rentAmount = typeof rawRentAmount === 'string' ? parseFloat(rawRentAmount) : rawRentAmount;

      if (depositAmount && rentAmount && !isNaN(depositAmount) && !isNaN(rentAmount) && depositAmount > 0 && rentAmount > 0) {
        // Calculate annual rent based on frequency
        let annualRent = rentAmount * 12; // default monthly
        if (rentFrequency === 'weekly') {
          annualRent = rentAmount * 52;
        } else if (rentFrequency === 'fortnightly') {
          annualRent = rentAmount * 26;
        } else if (rentFrequency === 'quarterly') {
          annualRent = rentAmount * 4;
        } else if (rentFrequency === 'yearly') {
          annualRent = rentAmount;
        }

        // Calculate max deposit: 5 weeks (or 6 weeks if annual rent > £50k)
        const weeklyRent = annualRent / 52;
        const maxWeeks = annualRent > 50000 ? 6 : 5;
        const maxDeposit = weeklyRent * maxWeeks;

        if (depositAmount > maxDeposit) {
          // Deposit exceeds cap - check for confirmation
          const confirmationValue = wizardFacts.deposit_reduced_to_legal_cap_confirmed;
          // Accept: 'yes', true, 'not_applicable' (user says it was always within cap)
          const isConfirmed =
            confirmationValue === 'yes' ||
            confirmationValue === true ||
            confirmationValue === 'not_applicable';

          if (!isConfirmed) {
            // If user explicitly says "no" or hasn't answered, block Section 21
            const errorDetails = confirmationValue === 'no'
              ? `You indicated the deposit still exceeds the cap.`
              : `Deposit appears to exceed the legal maximum.`;

            hardFailures.push({
              code: 'S21-DEPOSIT-CAP-EXCEEDED',
              affected_question_id: 'deposit_reduced_to_legal_cap_confirmed',
              legal_reason: `${errorDetails} Entered deposit: £${depositAmount.toFixed(2)}. Maximum allowed: £${maxDeposit.toFixed(2)} (${maxWeeks} weeks' rent based on Tenant Fees Act 2019). Under the Tenant Fees Act 2019, excess deposits must be returned before Section 21 is valid.`,
              user_fix_hint: 'Refund the excess deposit to the tenant before serving Section 21, or use Section 8 instead (deposit cap does not affect Section 8 validity).',
            });
          }
        } else {
          // Deposit is within cap - user's confirmation should match
          const confirmationValue = wizardFacts.deposit_reduced_to_legal_cap_confirmed;
          if (confirmationValue === 'no') {
            // User says deposit exceeds cap but our calculation says it doesn't
            // This is a data inconsistency - warn but don't block
            warnings.push({
              code: 'S21-DEPOSIT-CAP-INCONSISTENT',
              affected_question_id: 'deposit_reduced_to_legal_cap_confirmed',
              legal_reason: `You indicated the deposit exceeds the cap, but based on your rent (£${rentAmount}/${rentFrequency}) and deposit (£${depositAmount}), the deposit appears to be within the legal limit of £${maxDeposit.toFixed(2)}.`,
              user_fix_hint: 'Please verify your rent and deposit amounts are correct.',
            });
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // LICENSING HARD-BLOCK (Housing Act 2004, s.75/s.98)
    // HMO licensing and selective licensing BLOCK Section 21 if:
    // - Property requires licensing AND
    // - No valid licence exists
    // -------------------------------------------------------------------------
    const licensingRequired = wizardFacts.licensing_required;
    const hasValidLicence = wizardFacts.has_valid_licence;

    // Check new MQS fields first (licensing_required + has_valid_licence)
    if (licensingRequired && licensingRequired !== 'not_required') {
      if (hasValidLicence === false) {
        // HARD BLOCK - unlicensed property cannot use Section 21
        hardFailures.push({
          code: 'S21-LICENSING-REQUIRED',
          affected_question_id: 'has_valid_licence',
          legal_reason: `Section 21 notices are INVALID for properties that require licensing but are unlicensed. Housing Act 2004 (HMO: s.75, Selective: s.98) prevents serving a valid Section 21 notice.`,
          user_fix_hint: 'Obtain the required licence before serving a Section 21 notice, or use Section 8 (fault-based) eviction instead.',
        });
      } else if (hasValidLicence === undefined || hasValidLicence === null) {
        // Only block at generate stage if answer not provided
        pushStageIssue(
          {
            code: 'S21-LICENSING-CONFIRM',
            affected_question_id: 'has_valid_licence',
            legal_reason: 'Property requires licensing - confirm you have a valid licence to use Section 21',
            user_fix_hint: 'Confirm whether the property has a valid licence',
          },
          ['generate']
        );
      }
    }

    // Legacy field fallback (property_licensing_status)
    if (wizardFacts.property_licensing_status === 'unlicensed') {
      hardFailures.push({
        code: 'S21-LICENSING',
        affected_question_id: 'property_licensing',
        legal_reason: 'Section 21 cannot be used while the property remains unlicensed. Housing Act 2004 prevents serving a valid Section 21 notice on unlicensed HMO or selectively licensed properties.',
        user_fix_hint: 'Obtain the required licence before serving a Section 21 notice, or use Section 8 (fault-based) eviction instead.',
      });
    } else if (wizardFacts.property_licensing_status === undefined && !licensingRequired) {
      pushStageIssue(
        {
          code: 'S21-LICENSING',
          affected_question_id: 'property_licensing',
          legal_reason: 'Confirm licensing status before generating Section 21',
          user_fix_hint: 'Answer the licensing question to continue',
        },
        ['generate']
      );
    }

    if (wizardFacts.has_gas_appliances === true) {
      // Check canonical field (normalizeFactKeys already handles legacy -> canonical conversion)
      // Use OR logic: block if EITHER field explicitly says false
      const gasCertProvided = wizardFacts.gas_certificate_provided ?? wizardFacts.gas_safety_cert_provided;

      if (gasCertProvided === false) {
        pushStageIssue({
          code: 'S21-GAS-CERT',
          affected_question_id: 'gas_safety_certificate',
          legal_reason: 'Gas safety certificate must be provided before serving Section 21',
          user_fix_hint: 'Confirm the latest gas safety record before continuing',
        });
      } else if (gasCertProvided === undefined) {
        pushStageIssue(
          {
            code: 'S21-GAS-CERT',
            affected_question_id: 'gas_safety_certificate',
            legal_reason: 'Confirm gas safety certificate status',
            user_fix_hint: 'Answer whether a valid gas safety certificate was provided',
          },
          ['generate']
        );
      }
    }

    if (wizardFacts.epc_provided === false) {
      pushStageIssue({
        code: 'S21-EPC',
        affected_question_id: 'epc_provided',
        legal_reason: 'An EPC must be provided before serving Section 21',
        user_fix_hint: 'Confirm EPC has been provided to the tenant',
      });
    } else if (wizardFacts.epc_provided === undefined) {
      pushStageIssue(
        {
          code: 'S21-EPC',
          affected_question_id: 'epc_provided',
          legal_reason: 'Confirm EPC status',
          user_fix_hint: 'Answer whether an EPC was provided',
        },
        ['generate']
      );
    }

    if (wizardFacts.how_to_rent_provided === false) {
      pushStageIssue({
        code: 'S21-H2R',
        affected_question_id: 'how_to_rent_provided',
        legal_reason: 'The latest How to Rent guide must be provided before serving Section 21',
        user_fix_hint: 'Provide the How to Rent guide and confirm service before continuing',
      });
    } else if (wizardFacts.how_to_rent_provided === undefined) {
      pushStageIssue(
        {
          code: 'S21-H2R',
          affected_question_id: 'how_to_rent_provided',
          legal_reason: 'Confirm if the How to Rent guide was served',
          user_fix_hint: 'Answer the How to Rent question before generating the notice',
        },
        ['generate']
      );
    }

    // -------------------------------------------------------------------------
    // RETALIATORY EVICTION BAR HARD-BLOCK (Deregulation Act 2015, s.33)
    // Section 21 is INVALID if:
    // - Local authority has served an improvement notice (Housing Act 2004, s.11)
    // - Local authority has taken emergency remedial action (Housing Act 2004, s.40)
    // The 6-month protection period applies from the date of the notice/action.
    // -------------------------------------------------------------------------
    const hasImprovementNotice = wizardFacts.improvement_notice_served === true ||
                                   wizardFacts.local_authority_improvement_notice === true;
    const hasEmergencyRemedialAction = wizardFacts.emergency_remedial_action === true ||
                                          wizardFacts.local_authority_emergency_action === true;

    if (hasImprovementNotice) {
      hardFailures.push({
        code: 'S21-RETALIATORY-IMPROVEMENT-NOTICE',
        affected_question_id: 'improvement_notice_served',
        legal_reason: 'Section 21 notice is INVALID while an improvement notice is in effect. Under the Deregulation Act 2015 (s.33) and Housing Act 2004, the retaliatory eviction bar prevents serving a valid Section 21 notice for 6 months after an improvement notice.',
        user_fix_hint: 'Wait until the improvement notice has been complied with and 6 months have passed, or use Section 8 (fault-based) eviction if applicable grounds exist.',
      });
    }

    if (hasEmergencyRemedialAction) {
      hardFailures.push({
        code: 'S21-RETALIATORY-EMERGENCY-ACTION',
        affected_question_id: 'emergency_remedial_action',
        legal_reason: 'Section 21 notice is INVALID while emergency remedial action notice is in effect. Under the Deregulation Act 2015 (s.33), the retaliatory eviction bar applies for 6 months after emergency remedial action.',
        user_fix_hint: 'Wait until 6 months have passed after the emergency remedial action, or use Section 8 (fault-based) eviction if applicable grounds exist.',
      });
    }

    // Softer warning for recent repair complaints (may lead to retaliatory bar)
    if (wizardFacts.recent_repair_complaints === true && !hasImprovementNotice && !hasEmergencyRemedialAction) {
      warnings.push({
        code: 'S21-RETALIATORY-RISK',
        affected_question_id: 'recent_repair_complaints_s21',
        legal_reason: 'Recent repair complaints may trigger the retaliatory eviction bar if the local authority issues an improvement notice or takes emergency remedial action',
        user_fix_hint: 'Ensure no outstanding improvement or emergency remedial notices before serving. If the local authority takes action, you cannot serve Section 21 for 6 months.',
      });
    }

    // -------------------------------------------------------------------------
    // PROHIBITED FEES CONFIRMATION (Tenant Fees Act 2019)
    // Section 21 validity may be affected if prohibited fees charged.
    // User must confirm no prohibited fees have been charged.
    // -------------------------------------------------------------------------
    const prohibitedFeesCharged = wizardFacts.prohibited_fees_charged;
    const prohibitedFeesConfirmed = wizardFacts.no_prohibited_fees_confirmed;

    if (prohibitedFeesCharged === true) {
      hardFailures.push({
        code: 'S21-PROHIBITED-FEES',
        affected_question_id: 'prohibited_fees_charged',
        legal_reason: 'Section 21 notice may be INVALID if prohibited fees have been charged to the tenant. Under the Tenant Fees Act 2019 (s.13), a Section 21 notice cannot be given while the tenant is owed a prohibited payment.',
        user_fix_hint: 'Refund any prohibited fees to the tenant before serving a Section 21 notice.',
      });
    } else if (prohibitedFeesConfirmed === false) {
      hardFailures.push({
        code: 'S21-PROHIBITED-FEES-UNCONFIRMED',
        affected_question_id: 'no_prohibited_fees_confirmed',
        legal_reason: 'You must confirm no prohibited fees have been charged to use Section 21. Under the Tenant Fees Act 2019, prohibited payments must be refunded before Section 21 is valid.',
        user_fix_hint: 'Confirm that no prohibited fees have been charged to the tenant, or refund any prohibited fees before proceeding.',
      });
    }

    if (service_date && wizardFacts.tenancy_start_date) {
      const service = toDate(service_date);
      const start = toDate(wizardFacts.tenancy_start_date);
      if (service && start) {
        const fourMonthPoint = addMonths(start, 4);
        if (service < fourMonthPoint) {
          hardFailures.push({
            code: 'S21-FOUR-MONTH-BAR',
            affected_question_id: 'tenancy_start_date',
            legal_reason: 'Section 21 cannot be served within the first four months of the tenancy',
            user_fix_hint: 'Set a service date after the four-month point',
          });
        }
      }
    }

    if (service_date && expiry_date) {
      try {
        const result = calculateSection21ExpiryDate({
          service_date,
          tenancy_start_date: wizardFacts.tenancy_start_date,
          fixed_term: wizardFacts.is_fixed_term,
          fixed_term_end_date: wizardFacts.fixed_term_end_date,
          rent_period: wizardFacts.rent_frequency || 'monthly',
        });
        computed.expiry_date = result.earliest_valid_date;
        computed.notice_period_days = result.notice_period_days;
        if (result.earliest_valid_date) {
          const entered = toDate(expiry_date);
          const minimum = toDate(result.earliest_valid_date);
          if (entered && minimum && entered < minimum) {
            hardFailures.push({
              code: 'S21-DATE-TOO-SOON',
              affected_question_id: 'notice_expiry_date',
              legal_reason: 'Expiry date is earlier than the statutory two-month minimum',
              user_fix_hint: `Set the expiry date to at least ${result.earliest_valid_date}`,
            });
          }
        }
      } catch (err) {
        hardFailures.push({
          code: 'S21-MINIMUM-NOTICE',
          affected_question_id: 'notice_expiry_date',
          legal_reason: 'Unable to calculate the minimum Section 21 notice period',
          user_fix_hint: 'Confirm service date, tenancy start date, and tenancy type to continue',
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // WALES – SECTION 173 (fail-safe, requires explicit confirmation)
  // ---------------------------------------------------------------------------
  if (route === 'notice-only/wales/section173') {
    if (wizardFacts.rent_smart_wales_registered !== true) {
      hardFailures.push({
        code: 'S173-LICENSING',
        affected_question_id: 'rent_smart_wales_registered',
        legal_reason: 'Rent Smart Wales registration is mandatory before serving Section 173',
        user_fix_hint: 'Confirm active registration or licence to proceed',
      });
    }

    const contractStart = toDate(wizardFacts.contract_start_date);
    const service = toDate(service_date);

    if (!contractStart || !service) {
      hardFailures.push({
        code: 'S173-NOTICE-PERIOD-UNDETERMINED',
        affected_question_id: !contractStart ? 'contract_start_date' : 'notice_service_date',
        legal_reason: 'System cannot calculate the statutory minimum notice period without the contract start date and service date',
        user_fix_hint: 'Provide the contract start date and intended service date so we can calculate a valid expiry',
      });
    }

    if (contractStart && service) {
      const prohibitedEnd = addMonths(contractStart, 6);
      if (service < prohibitedEnd) {
        hardFailures.push({
          code: 'S173-PERIOD-BAR',
          affected_question_id: 'notice_service_date',
          legal_reason: 'Section 173 cannot be served in the first six months of the occupation contract',
          user_fix_hint: 'Set the service date after the initial six months of the contract',
        });
      }

      if (!expiry_date) {
        hardFailures.push({
          code: 'S173-NOTICE-PERIOD-UNDETERMINED',
          affected_question_id: 'notice_expiry_date',
          legal_reason: 'Expiry date required to confirm compliance with statutory minimum notice period',
          user_fix_hint: 'Enter an expiry date at least the statutory minimum after service',
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // SCOTLAND – NOTICE TO LEAVE
  // ---------------------------------------------------------------------------
  if (route === 'notice-only/scotland/notice-to-leave') {
    const rawGrounds = Array.isArray(wizardFacts.scotland_ground_codes)
      ? wizardFacts.scotland_ground_codes
      : wizardFacts.scotland_ground_codes
        ? [wizardFacts.scotland_ground_codes]
        : [];

    const grounds: Array<number> = rawGrounds
      .map((ground: number | string) => Number(ground))
      .filter((ground) => !Number.isNaN(ground));
    const preActionConfirmed = wizardFacts?.issues?.rent_arrears?.pre_action_confirmed;
    if (!grounds || grounds.length === 0) {
      hardFailures.push({
        code: 'NTL-GROUND-REQUIRED',
        affected_question_id: 'eviction_grounds',
        legal_reason: 'A valid Schedule 3 ground must be selected',
        user_fix_hint: 'Select the ground that applies to your Notice to Leave',
      });
    }

    const specGroundsMixAllowed = spec?.allow_mixed_grounds !== false;
    if (grounds.length > 1 && !specGroundsMixAllowed) {
      hardFailures.push({
        code: 'NTL-MIXED-GROUNDS',
        affected_question_id: 'eviction_grounds',
        legal_reason: 'Mixed grounds require confirmed statutory notice period approach; system is configured to block until guidance is confirmed',
        user_fix_hint: 'Select a single ground or obtain legal approval for mixed grounds notice periods',
      });
    }

    if (grounds.includes(1) && preActionConfirmed !== true) {
      hardFailures.push({
        code: 'NTL-PRE-ACTION',
        affected_question_id: 'pre_action_contact',
        legal_reason: 'Scottish rent arrears pre-action steps required',
        user_fix_hint: 'Confirm pre-action steps completed',
      });
    }

    if (service_date && grounds?.length) {
      try {
        const result = calculateScotlandNoticeToLeaveExpiryDate({
          service_date,
          grounds: grounds.map((number) => ({ number })),
          pre_action_completed: preActionConfirmed,
        });
        computed.notice_period_days = result.notice_period_days;
        computed.expiry_date = result.earliest_valid_date;

        const entered = expiry_date ? toDate(expiry_date) : undefined;
        const minimum = result.earliest_valid_date ? toDate(result.earliest_valid_date) : undefined;
        if (entered && minimum && entered < minimum) {
          hardFailures.push({
            code: 'NTL-NOTICE-PERIOD',
            affected_question_id: 'notice_expiry',
            legal_reason: 'Expiry date is earlier than the statutory 28/84 day period',
            user_fix_hint: `Set the expiry date to at least ${result.earliest_valid_date}`,
          });
        }
      } catch (err) {
        hardFailures.push({
          code: 'NTL-NOTICE-PERIOD',
          affected_question_id: 'notice_service',
          legal_reason: 'Unable to calculate Notice to Leave period without service date and grounds',
          user_fix_hint: 'Provide a service date and select valid grounds',
        });
      }
    }
  }

  return {
    ok: hardFailures.length === 0,
    hardFailures,
    warnings,
    computed: Object.keys(computed).length > 0 ? computed : undefined,
  };
}

