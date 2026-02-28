export type YesNoUnsure = 'yes' | 'no' | 'unsure';

export interface Section21PrecheckInput {
  jurisdiction: 'england';
  landlord_type: 'private_landlord' | 'social_provider' | 'unsure';
  tenancy_start_date: string;
  is_replacement_tenancy: YesNoUnsure;
  original_tenancy_start_date: string | null;
  tenancy_type: 'fixed_term' | 'periodic' | 'unsure';
  fixed_term_end_date: string | null;
  has_break_clause: YesNoUnsure;
  break_clause_earliest_end_date: string | null;
  rent_period: 'weekly' | 'fortnightly' | 'four_weekly' | 'monthly' | 'quarterly' | 'yearly' | 'other' | 'unsure';
  planned_service_date: string;
  service_method: 'hand' | 'first_class_post' | 'document_exchange' | 'email' | 'other' | 'unsure';
  service_before_430pm: YesNoUnsure;
  tenant_consented_email_service: YesNoUnsure | null;

  deposit_taken: YesNoUnsure;
  deposit_received_date: string | null;
  deposit_protected_date: string | null;
  deposit_prescribed_info_served_tenant_date: string | null;
  deposit_paid_by_relevant_person: YesNoUnsure | null;
  deposit_prescribed_info_served_relevant_person_date: string | null;
  deposit_returned_in_full_or_agreed: YesNoUnsure | null;
  deposit_returned_date: string | null;
  deposit_claim_resolved_by_court: YesNoUnsure | null;

  epc_required: YesNoUnsure;
  epc_served_date: string | null;

  gas_installed: YesNoUnsure;
  gas_safety_record_issue_date: string | null;
  gas_safety_record_served_date: string | null;

  how_to_rent_served_date: string | null;
  how_to_rent_served_method: 'hardcopy' | 'email' | 'unsure' | null;
  how_to_rent_was_current_version_at_tenancy_start: YesNoUnsure;

  property_requires_hmo_licence: YesNoUnsure;
  hmo_licence_in_place: YesNoUnsure | null;

  property_requires_selective_licence: YesNoUnsure;
  selective_licence_in_place: YesNoUnsure | null;

  improvement_notice_served: YesNoUnsure;
  improvement_notice_date: string | null;

  emergency_remedial_action_served: YesNoUnsure;
  emergency_remedial_action_date: string | null;

  prohibited_payment_outstanding: YesNoUnsure;
  has_proof_of_service_plan: YesNoUnsure;
}

export enum Section21BlockerReasonCode {
  B001_PLANNED_SERVICE_ON_AFTER_MAY_2026 = 'B001_PLANNED_SERVICE_ON_AFTER_MAY_2026',
  B002_FOUR_MONTH_RULE = 'B002_FOUR_MONTH_RULE',
  B003_SERVICE_METHOD_UNSAFE = 'B003_SERVICE_METHOD_UNSAFE',
  B004_EMAIL_NOT_CONSENTED = 'B004_EMAIL_NOT_CONSENTED',
  B005_RENT_PERIOD_UNKNOWN = 'B005_RENT_PERIOD_UNKNOWN',
  B006_DEPOSIT_INFO_INCOMPLETE = 'B006_DEPOSIT_INFO_INCOMPLETE',
  B007_DEPOSIT_NOT_PROTECTED_30_DAYS = 'B007_DEPOSIT_NOT_PROTECTED_30_DAYS',
  B008_DEPOSIT_PI_NOT_SERVED_30_DAYS = 'B008_DEPOSIT_PI_NOT_SERVED_30_DAYS',
  B009_DEPOSIT_NOT_IN_SCHEME_NOW = 'B009_DEPOSIT_NOT_IN_SCHEME_NOW',
  B010_EPC_MISSING = 'B010_EPC_MISSING',
  B011_GAS_SAFETY_MISSING = 'B011_GAS_SAFETY_MISSING',
  B012_GAS_SAFETY_NOT_CURRENT = 'B012_GAS_SAFETY_NOT_CURRENT',
  B013_HOW_TO_RENT_MISSING = 'B013_HOW_TO_RENT_MISSING',
  B014_LICENSING_HMO_UNLICENSED = 'B014_LICENSING_HMO_UNLICENSED',
  B015_LICENSING_SELECTIVE_UNLICENSED = 'B015_LICENSING_SELECTIVE_UNLICENSED',
  B016_IMPROVEMENT_NOTICE_LAST_6_MONTHS = 'B016_IMPROVEMENT_NOTICE_LAST_6_MONTHS',
  B017_EMERGENCY_REMEDIAL_LAST_6_MONTHS = 'B017_EMERGENCY_REMEDIAL_LAST_6_MONTHS',
  B018_PROHIBITED_PAYMENT_OUTSTANDING = 'B018_PROHIBITED_PAYMENT_OUTSTANDING',
  B019_FIXED_TERM_DATES_INCOMPLETE = 'B019_FIXED_TERM_DATES_INCOMPLETE',
}

export enum Section21WarningReasonCode {
  W001_BANK_HOLIDAY_FALLBACK = 'W001_BANK_HOLIDAY_FALLBACK',
  W002_DOCS_SERVED_AFTER_TENANCY_START = 'W002_DOCS_SERVED_AFTER_TENANCY_START',
  W003_HOW_TO_RENT_VERSION_UNSURE = 'W003_HOW_TO_RENT_VERSION_UNSURE',
  W004_PROOF_OF_SERVICE_WEAK = 'W004_PROOF_OF_SERVICE_WEAK',
  W005_FIXED_TERM_END_AFTER_MIN_NOTICE = 'W005_FIXED_TERM_END_AFTER_MIN_NOTICE',
  W006_DEPOSIT_RETURNED_BUT_LATE = 'W006_DEPOSIT_RETURNED_BUT_LATE',
  W007_TENANCY_TYPE_UNKNOWN = 'W007_TENANCY_TYPE_UNKNOWN',
  W008_REPLACEMENT_TENANCY_UNKNOWN = 'W008_REPLACEMENT_TENANCY_UNKNOWN',
}

const BLOCKER_MESSAGES: Record<Section21BlockerReasonCode, string> = {
  B001_PLANNED_SERVICE_ON_AFTER_MAY_2026:
    'Planned service date is on or after 1 May 2026. Section 21 cannot usually be used after this date in England.',
  B002_FOUR_MONTH_RULE:
    'Section 21 cannot be served within the first 4 months of the tenancy (or original tenancy for renewals).',
  B003_SERVICE_METHOD_UNSAFE:
    'Service method is unknown or not supported for deemed service. Use a recognised method and keep evidence.',
  B004_EMAIL_NOT_CONSENTED: 'Email service selected, but tenant has not confirmed consent to accept service by email.',
  B005_RENT_PERIOD_UNKNOWN:
    'Rent period is unknown. Section 21 notice length can depend on the rent period for some tenancies.',
  B006_DEPOSIT_INFO_INCOMPLETE:
    'Deposit information is incomplete. Deposit compliance must be clear before relying on Section 21.',
  B007_DEPOSIT_NOT_PROTECTED_30_DAYS:
    'Deposit was not protected within 30 days of receipt. Section 21 is barred unless the deposit has been returned or the claim is resolved.',
  B008_DEPOSIT_PI_NOT_SERVED_30_DAYS:
    'Deposit prescribed information was not served within 30 days. Section 21 is barred unless the prescribed information is served or the deposit issue is resolved.',
  B009_DEPOSIT_NOT_IN_SCHEME_NOW:
    'Deposit is not currently held in an authorised scheme. Section 21 cannot be used while this remains the case.',
  B010_EPC_MISSING:
    'EPC has not been provided to the tenant. Section 21 cannot be used until an EPC is served where required.',
  B011_GAS_SAFETY_MISSING:
    'Gas safety record has not been provided to the tenant. Section 21 cannot be used while this requirement is unmet.',
  B012_GAS_SAFETY_NOT_CURRENT:
    'Gas safety record does not appear current as of the planned service date. This can invalidate Section 21.',
  B013_HOW_TO_RENT_MISSING:
    'How to Rent guide has not been provided (or is not confirmed). Section 21 cannot be used while this requirement is unmet.',
  B014_LICENSING_HMO_UNLICENSED:
    'Property appears to require an HMO licence, but no licence is in place. Section 21 is barred while unlicensed.',
  B015_LICENSING_SELECTIVE_UNLICENSED:
    'Property appears to require a selective licence, but no licence is in place. Section 21 is barred while unlicensed.',
  B016_IMPROVEMENT_NOTICE_LAST_6_MONTHS:
    'An improvement notice was served in the last 6 months. Section 21 is restricted in this period.',
  B017_EMERGENCY_REMEDIAL_LAST_6_MONTHS:
    'Emergency remedial action was served in the last 6 months. Section 21 is restricted in this period.',
  B018_PROHIBITED_PAYMENT_OUTSTANDING:
    'A prohibited payment or unlawfully retained holding deposit may be outstanding. Section 21 cannot be used until repaid.',
  B019_FIXED_TERM_DATES_INCOMPLETE:
    'Fixed term / break clause dates are incomplete. Section 21 timing cannot be confirmed.',
};

const WARNING_MESSAGES: Record<Section21WarningReasonCode, string> = {
  W001_BANK_HOLIDAY_FALLBACK:
    'Bank holiday calendar could not be loaded. Deemed service date may be inaccurate — add extra days.',
  W002_DOCS_SERVED_AFTER_TENANCY_START:
    'Some documents appear to have been served after the tenancy started. This can create risk — consider legal advice.',
  W003_HOW_TO_RENT_VERSION_UNSURE:
    'How to Rent guide version was not confirmed as current at tenancy start. This can invalidate Section 21.',
  W004_PROOF_OF_SERVICE_WEAK:
    'You have not confirmed a clear proof-of-service plan. Keep evidence (photos, posting receipt, witness statement/N215).',
  W005_FIXED_TERM_END_AFTER_MIN_NOTICE:
    'Fixed term ends after the minimum notice period. Ensure the notice date is not earlier than fixed term end unless a valid break clause applies.',
  W006_DEPOSIT_RETURNED_BUT_LATE:
    'Deposit appears to have been returned after late compliance. Section 21 may be possible, but risk remains — consider advice.',
  W007_TENANCY_TYPE_UNKNOWN:
    'Tenancy type is unknown. Timing rules for Section 21 may differ and cannot be fully confirmed.',
  W008_REPLACEMENT_TENANCY_UNKNOWN:
    'It is unclear whether this is a replacement tenancy. The 4-month rule may be calculated inaccurately.',
};

type Reason = { code: string; message: string };

export interface Section21PrecheckResult {
  status: 'incomplete' | 'valid' | 'risky';
  missing_labels: string[];
  deemed_service_date: string | null;
  minimum_notice_months: number | null;
  earliest_after_date: string | null;
  latest_court_start_date: string | null;
  blockers: Reason[];
  warnings: Reason[];
  display: {
    headline: string;
    ctaLabel: string;
    ctaHref: string;
    gatedSummary: string;
    gatedDetails: string[];
  };
}

export type Section21Completeness = {
  complete: boolean;
  missing_keys: Array<keyof Section21PrecheckInput>;
  missing_labels: string[];
};

const CTA_HREF =
  '/wizard/flow?type=eviction&jurisdiction=england&product=notice_only&src=product_page&topic=eviction';
const BANK_CACHE_KEY = 'lh_bank_holidays_ew';
const BANK_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let memoryBankHolidayCache: { expiresAt: number; dates: Set<string> } | null = null;

export function parseISODateLocal(value: string | null | undefined): Date | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  if (Number.isNaN(date.getTime())) return null;
  // Prevent JS date rollover (e.g., 2026-02-31 -> 2026-03-03)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;

  return date;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateUK(value: string | Date | null): string {
  const date = value instanceof Date ? value : parseISODateLocal(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function addCalendarMonths(value: string | Date, months: number): Date {
  const start = value instanceof Date ? new Date(value.getTime()) : parseISODateLocal(value);
  if (!start) return new Date(NaN);
  const y = start.getFullYear();
  const m = start.getMonth();
  const d = start.getDate();
  const firstTarget = new Date(y, m + months, 1);
  const lastDay = new Date(firstTarget.getFullYear(), firstTarget.getMonth() + 1, 0).getDate();
  return new Date(firstTarget.getFullYear(), firstTarget.getMonth(), Math.min(d, lastDay));
}

function addCalendarDays(value: string | Date, days: number): Date {
  const start = value instanceof Date ? new Date(value.getTime()) : parseISODateLocal(value);
  if (!start) return new Date(NaN);
  const d = new Date(start.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function isBusinessDay(date: Date, bankHolidays: Set<string>): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return !bankHolidays.has(toISODate(date));
}

export function addBusinessDays(value: string | Date, days: number, bankHolidays: Set<string>): Date {
  const start = value instanceof Date ? new Date(value.getTime()) : parseISODateLocal(value);
  if (!start) return new Date(NaN);
  const date = new Date(start.getTime());
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (isBusinessDay(date, bankHolidays)) remaining -= 1;
  }
  return date;
}

export async function loadBankHolidaysCached(): Promise<{ dates: Set<string>; usedFallback: boolean }> {
  if (memoryBankHolidayCache && memoryBankHolidayCache.expiresAt > Date.now()) {
    return { dates: memoryBankHolidayCache.dates, usedFallback: false };
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(BANK_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { expiresAt: number; dates: string[] };
        if (parsed.expiresAt > Date.now()) {
          const dates = new Set(parsed.dates);
          memoryBankHolidayCache = { expiresAt: parsed.expiresAt, dates };
          return { dates, usedFallback: false };
        }
      }
    } catch {
      // no-op
    }
  }

  try {
    const res = await fetch('https://www.gov.uk/bank-holidays.json');
    const data = (await res.json()) as { 'england-and-wales'?: { events?: Array<{ date: string }> } };
    const dates = new Set((data['england-and-wales']?.events ?? []).map((e) => e.date));
    const expiresAt = Date.now() + BANK_CACHE_TTL_MS;
    memoryBankHolidayCache = { expiresAt, dates };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(BANK_CACHE_KEY, JSON.stringify({ expiresAt, dates: [...dates] }));
    }
    return { dates, usedFallback: false };
  } catch {
    return { dates: new Set<string>(), usedFallback: true };
  }
}

export function computeDeemedServiceDate(
  input: Section21PrecheckInput,
  bankHolidays: Set<string>
): { date: Date | null; blocker?: Section21BlockerReasonCode } {
  const planned = parseISODateLocal(input.planned_service_date);
  if (!planned) return { date: null, blocker: Section21BlockerReasonCode.B003_SERVICE_METHOD_UNSAFE };
  if (input.service_before_430pm === 'unsure') return { date: null, blocker: Section21BlockerReasonCode.B003_SERVICE_METHOD_UNSAFE };

  if (input.service_method === 'first_class_post' || input.service_method === 'document_exchange') {
    return { date: addBusinessDays(planned, 2, bankHolidays) };
  }

  if (input.service_method === 'hand' || input.service_method === 'email') {
    if (input.service_method === 'email' && input.tenant_consented_email_service !== 'yes') {
      return { date: null, blocker: Section21BlockerReasonCode.B004_EMAIL_NOT_CONSENTED };
    }
    const sameDay = input.service_before_430pm === 'yes' && isBusinessDay(planned, bankHolidays);
    return { date: sameDay ? planned : addBusinessDays(planned, 1, bankHolidays) };
  }

  return { date: null, blocker: Section21BlockerReasonCode.B003_SERVICE_METHOD_UNSAFE };
}

function pushUnique(target: Reason[], code: string, message: string): void {
  if (!target.some((item) => item.code === code && item.message === message)) target.push({ code, message });
}

function addBlocker(target: Reason[], code: Section21BlockerReasonCode): void {
  pushUnique(target, code, BLOCKER_MESSAGES[code]);
}

function addWarning(target: Reason[], code: Section21WarningReasonCode): void {
  pushUnique(target, code, WARNING_MESSAGES[code]);
}

export function getSection21PrecheckCompleteness(input: Section21PrecheckInput): Section21Completeness {
  const missing_keys: Array<keyof Section21PrecheckInput> = [];
  const missing_labels: string[] = [];
  const addMissing = (key: keyof Section21PrecheckInput, label: string) => {
    if (!missing_keys.includes(key)) missing_keys.push(key);
    if (!missing_labels.includes(label)) missing_labels.push(label);
  };

  if (!input.tenancy_start_date) addMissing('tenancy_start_date', 'Tenancy start date');
  if (!input.is_replacement_tenancy) addMissing('is_replacement_tenancy', 'Replacement tenancy');
  if (input.is_replacement_tenancy === 'yes' && !input.original_tenancy_start_date) addMissing('original_tenancy_start_date', 'Original tenancy start date');
  if (!input.tenancy_type) addMissing('tenancy_type', 'Tenancy type');
  if (input.tenancy_type === 'fixed_term' && !input.fixed_term_end_date) addMissing('fixed_term_end_date', 'Fixed term end date');
  if (input.tenancy_type === 'fixed_term' && !input.has_break_clause) addMissing('has_break_clause', 'Break clause');
  if (input.tenancy_type === 'fixed_term' && input.has_break_clause === 'yes' && !input.break_clause_earliest_end_date) addMissing('break_clause_earliest_end_date', 'Earliest break end date');

  if (!input.rent_period) addMissing('rent_period', 'Rent period');
  if (!input.planned_service_date) addMissing('planned_service_date', 'Planned service date');
  if (!input.service_method) addMissing('service_method', 'Service method');
  if (!input.service_before_430pm) addMissing('service_before_430pm', 'Service before 4:30pm');
  if (input.service_method === 'email' && input.tenant_consented_email_service === null) addMissing('tenant_consented_email_service', 'Tenant consent to email service');

  if (!input.deposit_taken) addMissing('deposit_taken', 'Deposit taken');
  if (input.deposit_taken === 'yes') {
    if (!input.deposit_received_date) addMissing('deposit_received_date', 'Deposit received date');
    if (!input.deposit_protected_date) addMissing('deposit_protected_date', 'Deposit protected date');
    if (!input.deposit_prescribed_info_served_tenant_date) addMissing('deposit_prescribed_info_served_tenant_date', 'Prescribed information given to tenant — date');
    if (input.deposit_paid_by_relevant_person === null) addMissing('deposit_paid_by_relevant_person', 'Deposit paid by someone else (relevant person)');
    if (input.deposit_paid_by_relevant_person === 'yes' && !input.deposit_prescribed_info_served_relevant_person_date) {
      addMissing('deposit_prescribed_info_served_relevant_person_date', 'Prescribed information given to deposit payer (relevant person) — date');
    }
    if (input.deposit_returned_in_full_or_agreed === null) addMissing('deposit_returned_in_full_or_agreed', 'Deposit returned in full / by agreement');
    if (input.deposit_returned_in_full_or_agreed === 'yes' && !input.deposit_returned_date) addMissing('deposit_returned_date', 'Deposit returned date');
    if (input.deposit_claim_resolved_by_court === null) addMissing('deposit_claim_resolved_by_court', 'Deposit claim resolved by court');
  }

  if (!input.epc_required) addMissing('epc_required', 'EPC required');
  if (input.epc_required === 'yes' && !input.epc_served_date) addMissing('epc_served_date', 'EPC served date');

  if (!input.gas_installed) addMissing('gas_installed', 'Gas installed');
  if (input.gas_installed === 'yes' && !input.gas_safety_record_issue_date) addMissing('gas_safety_record_issue_date', 'Gas safety record issue date');
  if (input.gas_installed === 'yes' && !input.gas_safety_record_served_date) addMissing('gas_safety_record_served_date', 'Gas safety record served date');

  if (!input.landlord_type) addMissing('landlord_type', 'Landlord type');
  if (input.landlord_type === 'private_landlord') {
    if (!input.how_to_rent_served_date) addMissing('how_to_rent_served_date', 'How to Rent served date');
    if (!input.how_to_rent_served_method) addMissing('how_to_rent_served_method', 'How to Rent served method');
    if (input.how_to_rent_served_method === 'email' && input.tenant_consented_email_service === null) addMissing('tenant_consented_email_service', 'Tenant consent to email service');
    if (!input.how_to_rent_was_current_version_at_tenancy_start) addMissing('how_to_rent_was_current_version_at_tenancy_start', 'How to Rent was current at tenancy start');
  }

  if (!input.property_requires_hmo_licence) addMissing('property_requires_hmo_licence', 'Property requires HMO licence');
  if (input.property_requires_hmo_licence === 'yes' && input.hmo_licence_in_place === null) addMissing('hmo_licence_in_place', 'HMO licence in place');

  if (!input.property_requires_selective_licence) addMissing('property_requires_selective_licence', 'Property requires selective licence');
  if (input.property_requires_selective_licence === 'yes' && input.selective_licence_in_place === null) addMissing('selective_licence_in_place', 'Selective licence in place');

  if (!input.improvement_notice_served) addMissing('improvement_notice_served', 'Improvement notice served');
  if (input.improvement_notice_served === 'yes' && !input.improvement_notice_date) addMissing('improvement_notice_date', 'Improvement notice date served');

  if (!input.emergency_remedial_action_served) addMissing('emergency_remedial_action_served', 'Emergency remedial action served');
  if (input.emergency_remedial_action_served === 'yes' && !input.emergency_remedial_action_date) addMissing('emergency_remedial_action_date', 'Emergency remedial action date served');

  if (!input.prohibited_payment_outstanding) addMissing('prohibited_payment_outstanding', 'Prohibited payment outstanding');
  if (!input.has_proof_of_service_plan) addMissing('has_proof_of_service_plan', 'Proof of service evidence plan in place');

  return { complete: missing_keys.length === 0, missing_keys, missing_labels };
}

export async function evaluateSection21Precheck(input: Section21PrecheckInput): Promise<Section21PrecheckResult> {
  const completeness = getSection21PrecheckCompleteness(input);

  // ✅ Key fix: do not compute blockers/warnings until complete
  if (!completeness.complete) {
    return {
      status: 'incomplete',
      missing_labels: completeness.missing_labels,
      deemed_service_date: null,
      minimum_notice_months: null,
      earliest_after_date: null,
      latest_court_start_date: null,
      blockers: [],
      warnings: [],
      display: {
        headline: 'Incomplete — answer the questions to check eligibility.',
        ctaLabel: 'Complete the check to continue',
        ctaHref: CTA_HREF,
        gatedSummary: 'Answer the questions above to check eligibility.',
        gatedDetails: [],
      },
    };
  }

  const blockers: Reason[] = [];
  const warnings: Reason[] = [];

  const { dates: bankHolidays, usedFallback } = await loadBankHolidaysCached();
  if (usedFallback) addWarning(warnings, Section21WarningReasonCode.W001_BANK_HOLIDAY_FALLBACK);

  const plannedServiceDate = parseISODateLocal(input.planned_service_date);
  const tenancyStartDate = parseISODateLocal(input.tenancy_start_date);

  const deemed = computeDeemedServiceDate(input, bankHolidays);
  if (deemed.blocker) addBlocker(blockers, deemed.blocker);

  if (input.rent_period === 'unsure' || input.rent_period === 'other') {
    addBlocker(blockers, Section21BlockerReasonCode.B005_RENT_PERIOD_UNKNOWN);
  }
  if (input.tenancy_type === 'unsure') addWarning(warnings, Section21WarningReasonCode.W007_TENANCY_TYPE_UNKNOWN);
  if (input.is_replacement_tenancy === 'unsure') addWarning(warnings, Section21WarningReasonCode.W008_REPLACEMENT_TENANCY_UNKNOWN);

  if (plannedServiceDate && plannedServiceDate >= parseISODateLocal('2026-05-01')!) {
    addBlocker(blockers, Section21BlockerReasonCode.B001_PLANNED_SERVICE_ON_AFTER_MAY_2026);
  }

  const baseStart = input.is_replacement_tenancy === 'yes'
    ? parseISODateLocal(input.original_tenancy_start_date)
    : tenancyStartDate;

  if (baseStart && plannedServiceDate && plannedServiceDate < addCalendarMonths(baseStart, 4)) {
    addBlocker(blockers, Section21BlockerReasonCode.B002_FOUR_MONTH_RULE);
  }

  // Deposit checks (only runs when complete)
  if (input.deposit_taken === 'yes') {
    const received = parseISODateLocal(input.deposit_received_date);
    const protectedDate = parseISODateLocal(input.deposit_protected_date);
    const piDate = parseISODateLocal(input.deposit_prescribed_info_served_tenant_date);

    if (!received || !protectedDate || !piDate) addBlocker(blockers, Section21BlockerReasonCode.B006_DEPOSIT_INFO_INCOMPLETE);

    const compliantCutoff = received ? addCalendarDays(received, 30) : null;
    const protectedInTime = compliantCutoff && protectedDate ? protectedDate <= compliantCutoff : false;
    const piInTime = compliantCutoff && piDate ? piDate <= compliantCutoff : false;

    const settled = input.deposit_returned_in_full_or_agreed === 'yes' || input.deposit_claim_resolved_by_court === 'yes';

    if (!protectedInTime) {
      if (settled) addWarning(warnings, Section21WarningReasonCode.W006_DEPOSIT_RETURNED_BUT_LATE);
      else addBlocker(blockers, Section21BlockerReasonCode.B007_DEPOSIT_NOT_PROTECTED_30_DAYS);
    }

    if (!piInTime) {
      if (settled) addWarning(warnings, Section21WarningReasonCode.W006_DEPOSIT_RETURNED_BUT_LATE);
      else addBlocker(blockers, Section21BlockerReasonCode.B008_DEPOSIT_PI_NOT_SERVED_30_DAYS);
    }
  }

  const epcRequired = input.epc_required !== 'no';
  const epcDate = parseISODateLocal(input.epc_served_date);
  if (epcRequired && (!epcDate || (plannedServiceDate && epcDate > plannedServiceDate))) {
    addBlocker(blockers, Section21BlockerReasonCode.B010_EPC_MISSING);
  }

  const gasInstalled = input.gas_installed !== 'no';
  const gasIssueDate = parseISODateLocal(input.gas_safety_record_issue_date);
  const gasServedDate = parseISODateLocal(input.gas_safety_record_served_date);

  if (gasInstalled) {
    if (!gasIssueDate || !gasServedDate || (plannedServiceDate && gasServedDate > plannedServiceDate)) {
      addBlocker(blockers, Section21BlockerReasonCode.B011_GAS_SAFETY_MISSING);
    }
    if (gasIssueDate && plannedServiceDate && addCalendarMonths(gasIssueDate, 12) < plannedServiceDate) {
      addBlocker(blockers, Section21BlockerReasonCode.B012_GAS_SAFETY_NOT_CURRENT);
    }
  }

  const landlordType = input.landlord_type;
  const htrDate = parseISODateLocal(input.how_to_rent_served_date);

  if (landlordType !== 'social_provider' && (!htrDate || (plannedServiceDate && htrDate > plannedServiceDate))) {
    addBlocker(blockers, Section21BlockerReasonCode.B013_HOW_TO_RENT_MISSING);
  }

  // ✅ Only warn/block for How to Rent version when private landlord
  if (landlordType === 'private_landlord') {
    if (input.how_to_rent_was_current_version_at_tenancy_start === 'unsure') addWarning(warnings, Section21WarningReasonCode.W003_HOW_TO_RENT_VERSION_UNSURE);
    if (input.how_to_rent_was_current_version_at_tenancy_start === 'no') addBlocker(blockers, Section21BlockerReasonCode.B013_HOW_TO_RENT_MISSING);
  }

  if (input.property_requires_hmo_licence === 'yes' && input.hmo_licence_in_place !== 'yes') {
    addBlocker(blockers, Section21BlockerReasonCode.B014_LICENSING_HMO_UNLICENSED);
  }

  if (input.property_requires_selective_licence === 'yes' && input.selective_licence_in_place !== 'yes') {
    addBlocker(blockers, Section21BlockerReasonCode.B015_LICENSING_SELECTIVE_UNLICENSED);
  }

  const improvementDate = parseISODateLocal(input.improvement_notice_date);
  if (input.improvement_notice_served === 'yes' && (!improvementDate || (plannedServiceDate && plannedServiceDate < addCalendarMonths(improvementDate, 6)))) {
    addBlocker(blockers, Section21BlockerReasonCode.B016_IMPROVEMENT_NOTICE_LAST_6_MONTHS);
  }

  const remedialDate = parseISODateLocal(input.emergency_remedial_action_date);
  if (input.emergency_remedial_action_served === 'yes' && (!remedialDate || (plannedServiceDate && plannedServiceDate < addCalendarMonths(remedialDate, 6)))) {
    addBlocker(blockers, Section21BlockerReasonCode.B017_EMERGENCY_REMEDIAL_LAST_6_MONTHS);
  }

  if (input.prohibited_payment_outstanding !== 'no') addBlocker(blockers, Section21BlockerReasonCode.B018_PROHIBITED_PAYMENT_OUTSTANDING);
  if (input.has_proof_of_service_plan !== 'yes') addWarning(warnings, Section21WarningReasonCode.W004_PROOF_OF_SERVICE_WEAK);

  const servedDates = [input.epc_served_date, input.gas_safety_record_served_date, input.how_to_rent_served_date, input.deposit_prescribed_info_served_tenant_date]
    .map(parseISODateLocal)
    .filter((v): v is Date => Boolean(v));

  if (tenancyStartDate && servedDates.some((date) => date > tenancyStartDate)) {
    addWarning(warnings, Section21WarningReasonCode.W002_DOCS_SERVED_AFTER_TENANCY_START);
  }

  let minimumMonths: number | null = null;
  if (input.rent_period === 'quarterly') minimumMonths = 3;
  else if (input.rent_period === 'yearly') minimumMonths = 12;
  else if (!['unsure', 'other'].includes(input.rent_period)) minimumMonths = 2;

  let earliestAfterDate: Date | null = null;
  if (deemed.date && minimumMonths !== null) earliestAfterDate = addCalendarMonths(deemed.date, minimumMonths);

  if (input.tenancy_type === 'fixed_term') {
    const ftEnd = parseISODateLocal(input.fixed_term_end_date);
    const breakClauseEarliestEnd = parseISODateLocal(input.break_clause_earliest_end_date);
    if (!ftEnd) addBlocker(blockers, Section21BlockerReasonCode.B019_FIXED_TERM_DATES_INCOMPLETE);
    if (input.has_break_clause === 'unsure') addBlocker(blockers, Section21BlockerReasonCode.B019_FIXED_TERM_DATES_INCOMPLETE);
    if (input.has_break_clause === 'yes' && !breakClauseEarliestEnd) {
      addBlocker(blockers, Section21BlockerReasonCode.B019_FIXED_TERM_DATES_INCOMPLETE);
    }

    const noticeBasedDate = earliestAfterDate;
    if (earliestAfterDate && input.has_break_clause === 'no' && ftEnd && ftEnd > earliestAfterDate) {
      earliestAfterDate = ftEnd;
    }
    if (earliestAfterDate && input.has_break_clause === 'yes' && breakClauseEarliestEnd && breakClauseEarliestEnd > earliestAfterDate) {
      earliestAfterDate = breakClauseEarliestEnd;
    }

    if (ftEnd && noticeBasedDate && ftEnd > noticeBasedDate && input.has_break_clause !== 'no') {
      addWarning(warnings, Section21WarningReasonCode.W005_FIXED_TERM_END_AFTER_MIN_NOTICE);
    }
  }

  const latestCourtStart =
    plannedServiceDate && plannedServiceDate < parseISODateLocal('2026-05-01')! && deemed.date
      ? new Date(Math.min(addCalendarMonths(deemed.date, 6).getTime(), parseISODateLocal('2026-07-31')!.getTime()))
      : null;

  const status: Section21PrecheckResult['status'] = blockers.length ? 'risky' : 'valid';

  const headline =
    status === 'valid'
      ? 'Section 21 appears valid based on your answers.'
      : 'Section 21 may be invalid based on your answers. Section 8 may be safer in this case.';

  const ctaLabel =
    status === 'risky' ? 'Use Section 8 Instead – Start Workflow' : 'Section 21 is Valid – Continue';

  const gatedSummary =
    status === 'risky' ? 'Risk detected — reveal details to see why.' : 'Appears valid — reveal details to review dates and checks.';

  const gatedDetails = [
    ...blockers.map((b) => `• ${b.message}`),
    ...warnings.map((w) => `• ${w.message}`),
    `• Deemed service date: ${formatDateUK(deemed.date)}`,
    `• Earliest leave-after date: ${formatDateUK(earliestAfterDate)}`,
    `• Latest court start date: ${formatDateUK(latestCourtStart)}`,
  ];

  return {
    status,
    missing_labels: [], // ✅ always present; complete => []
    deemed_service_date: deemed.date ? toISODate(deemed.date) : null,
    minimum_notice_months: minimumMonths,
    earliest_after_date: earliestAfterDate ? toISODate(earliestAfterDate) : null,
    latest_court_start_date: latestCourtStart ? toISODate(latestCourtStart) : null,
    blockers,
    warnings,
    display: {
      headline,
      ctaLabel,
      ctaHref: CTA_HREF,
      gatedSummary,
      gatedDetails,
    },
  };
}

export const SECTION21_PRECHECK_DEFAULT_INPUT: Section21PrecheckInput = {
  jurisdiction: 'england',
  landlord_type: 'unsure',
  tenancy_start_date: '',
  is_replacement_tenancy: 'unsure',
  original_tenancy_start_date: null,
  tenancy_type: 'unsure',
  fixed_term_end_date: null,
  has_break_clause: 'unsure',
  break_clause_earliest_end_date: null,
  rent_period: 'unsure',
  planned_service_date: '',
  service_method: 'unsure',
  service_before_430pm: 'unsure',
  tenant_consented_email_service: null,
  deposit_taken: 'unsure',
  deposit_received_date: null,
  deposit_protected_date: null,
  deposit_prescribed_info_served_tenant_date: null,
  deposit_paid_by_relevant_person: null,
  deposit_prescribed_info_served_relevant_person_date: null,
  deposit_returned_in_full_or_agreed: null,
  deposit_returned_date: null,
  deposit_claim_resolved_by_court: null,
  epc_required: 'unsure',
  epc_served_date: null,
  gas_installed: 'unsure',
  gas_safety_record_issue_date: null,
  gas_safety_record_served_date: null,
  how_to_rent_served_date: null,
  how_to_rent_served_method: null,
  how_to_rent_was_current_version_at_tenancy_start: 'unsure',
  property_requires_hmo_licence: 'unsure',
  hmo_licence_in_place: null,
  property_requires_selective_licence: 'unsure',
  selective_licence_in_place: null,
  improvement_notice_served: 'unsure',
  improvement_notice_date: null,
  emergency_remedial_action_served: 'unsure',
  emergency_remedial_action_date: null,
  prohibited_payment_outstanding: 'unsure',
  has_proof_of_service_plan: 'unsure',
};
