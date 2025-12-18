import {
  calculateScotlandNoticeToLeaveExpiryDate,
  calculateSection21ExpiryDate,
  calculateSection8ExpiryDate,
} from '@/lib/documents/notice-date-calculator';
import { getNoticeComplianceSpec } from './notice-compliance-spec';

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
};

function normaliseRoute(jurisdiction: string, selected_route?: string) {
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

export function evaluateNoticeCompliance(input: EvaluateInput): ComplianceResult {
  const { jurisdiction, product, selected_route, wizardFacts } = input;

  const hardFailures: ComplianceResult['hardFailures'] = [];
  const warnings: ComplianceResult['warnings'] = [];
  const computed: NonNullable<ComplianceResult['computed']> = {};

  if (product !== 'notice_only') {
    return { ok: true, hardFailures, warnings };
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
  // ENGLAND & WALES – SECTION 8
  // ---------------------------------------------------------------------------
  if (route === 'notice-only/england/section8') {
    const grounds: string[] = wizardFacts.section8_grounds || [];
    if (!grounds || grounds.length === 0) {
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
    if (wizardFacts.deposit_taken && (!wizardFacts.deposit_protected || !wizardFacts.prescribed_info_given)) {
      hardFailures.push({
        code: 'S21-DEPOSIT-NONCOMPLIANT',
        affected_question_id: wizardFacts.deposit_protected ? 'prescribed_info_given' : 'deposit_protected_scheme',
        legal_reason: 'Deposit must be protected and prescribed information served before a Section 21 notice',
        user_fix_hint: 'Protect the deposit and serve prescribed information before continuing',
      });
    }

    if (wizardFacts.property_licensing_status === 'unlicensed') {
      hardFailures.push({
        code: 'S21-LICENSING',
        affected_question_id: 'property_licensing',
        legal_reason: 'Section 21 cannot be used while the property remains unlicensed',
        user_fix_hint: 'Record a valid licence or resolve the licensing position to proceed',
      });
    }

    if (wizardFacts.recent_repair_complaints === true) {
      warnings.push({
        code: 'S21-RETALIATORY',
        affected_question_id: 'recent_repair_complaints_s21',
        legal_reason: 'Recent repair complaints may trigger the retaliatory eviction bar',
        user_fix_hint: 'Ensure no outstanding improvement or emergency remedial notices before serving',
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

