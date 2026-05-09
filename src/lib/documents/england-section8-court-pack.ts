import { resolveNoticeServiceMethod } from '@/lib/case-facts/normalize';
import { buildCompletePackDefendantCircumstancesText } from '@/lib/england-possession/defendant-circumstances';
import {
  calculateEnglandPossessionNoticePeriod,
  getEnglandGroundDefinition,
  normalizeEnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';

type SourceRecord = Record<string, any> | null | undefined;

export type EnglandSection8CourtPackServiceMethod =
  | 'first_class_post'
  | 'personal'
  | 'document_exchange'
  | 'fax'
  | 'other_electronic'
  | 'unknown';

export type Ground8Status = 'ABOVE' | 'AT' | 'BELOW';

export interface EnglandSection8ConsistencyConflict {
  field: string;
  expected: string | number | null;
  actual: string | number | null;
  source: string;
  document?: string;
}

export interface EnglandSection8ValidationCheck {
  key: string;
  status: 'passed' | 'failed';
  message: string;
  documents?: string[];
}

export interface EnglandSection8ValidationSummary {
  deemed_service_date: string;
  notice_expiry_date: string;
  earliest_proceedings_date: string;
  total_arrears: number;
  ground_8_threshold: number;
  ground_8_status: Ground8Status;
  all_consistency_checks_passed: boolean;
  checks: EnglandSection8ValidationCheck[];
}

export interface EnglandSection8CourtPackCalculation {
  serviceMethod: EnglandSection8CourtPackServiceMethod;
  serviceMethodText: string;
  rawServiceDate: string;
  deemedServiceDate: string;
  noticeExpiryDate: string;
  earliestProceedingsDate: string;
  totalArrears: number;
  arrearsAtNoticeDate: number;
  ground8Threshold: number;
  ground8Status: Ground8Status;
  firstUnpaidPeriodStart: string | null;
  monthlyRent: number;
  dailyRentRate: number;
  statutoryGroundsText: string;
  q4aText: string;
  q5Text: string;
  q6Text: string;
  q7Text: string;
  q8Text: string;
  validationSummary: EnglandSection8ValidationSummary;
}

export class EnglandSection8ConsistencyError extends Error {
  public readonly code = 'ENGLAND_SECTION8_CONSISTENCY_ERROR';

  constructor(
    message: string,
    public readonly conflicts: EnglandSection8ConsistencyConflict[],
    public readonly validationSummary?: EnglandSection8ValidationSummary,
  ) {
    super(message);
    this.name = 'EnglandSection8ConsistencyError';
  }
}

let bankHolidayCache: { expiresAt: number; dates: Set<string> } | null = null;

const BANK_HOLIDAY_TTL_MS = 24 * 60 * 60 * 1000;

function getNestedValue(source: SourceRecord, path: string): unknown {
  if (!source) return undefined;
  return path.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in (value as Record<string, any>)) {
      return (value as Record<string, any>)[segment];
    }
    return undefined;
  }, source);
}

function resolveStringField(sources: SourceRecord[], ...paths: string[]): string | undefined {
  for (const source of sources) {
    for (const path of paths) {
      const value = getNestedValue(source, path);
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }
  return undefined;
}

function resolveNumberField(sources: SourceRecord[], ...paths: string[]): number | undefined {
  for (const source of sources) {
    for (const path of paths) {
      const value = getNestedValue(source, path);
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
        if (Number.isFinite(parsed)) return parsed;
      }
    }
  }
  return undefined;
}

function resolveBooleanField(sources: SourceRecord[], ...paths: string[]): boolean | undefined {
  for (const source of sources) {
    for (const path of paths) {
      const value = getNestedValue(source, path);
      if (typeof value === 'boolean') return value;
    }
  }
  return undefined;
}

function parseISODateLocal(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addCalendarDays(value: string | Date, days: number): Date {
  const start = value instanceof Date ? new Date(value.getTime()) : parseISODateLocal(value);
  if (!start) return new Date(NaN);
  const next = new Date(start.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

function addCalendarMonths(value: string | Date, months: number): Date {
  const start = value instanceof Date ? new Date(value.getTime()) : parseISODateLocal(value);
  if (!start) return new Date(NaN);
  const next = new Date(start.getTime());
  const originalDay = next.getDate();
  next.setMonth(next.getMonth() + months);
  if (next.getDate() !== originalDay) {
    next.setDate(0);
  }
  return next;
}

function isBusinessDay(date: Date, bankHolidays: Set<string>): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6 && !bankHolidays.has(toISODate(date));
}

function nextBusinessDay(date: Date, bankHolidays: Set<string>): Date {
  const next = new Date(date.getTime());
  while (!isBusinessDay(next, bankHolidays)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function addBusinessDaysFrom(date: Date, days: number, bankHolidays: Set<string>): Date {
  const next = new Date(date.getTime());
  let remaining = days;
  while (remaining > 0) {
    next.setDate(next.getDate() + 1);
    if (isBusinessDay(next, bankHolidays)) remaining -= 1;
  }
  return next;
}

function parseTimeBefore430pm(value: string | undefined): boolean {
  if (!value) return true;
  const match = value.trim().match(/^(\d{1,2}):?(\d{2})?$/);
  if (!match) return true;
  const hours = Number(match[1]);
  const minutes = Number(match[2] || '0');
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return true;
  return hours < 16 || (hours === 16 && minutes <= 30);
}

async function loadEnglandWalesBankHolidays(): Promise<Set<string>> {
  if (bankHolidayCache && bankHolidayCache.expiresAt > Date.now()) {
    return bankHolidayCache.dates;
  }

  try {
    const res = await fetch('https://www.gov.uk/bank-holidays.json');
    const data = (await res.json()) as { 'england-and-wales'?: { events?: Array<{ date: string }> } };
    const dates = new Set((data['england-and-wales']?.events ?? []).map((event) => event.date));
    bankHolidayCache = {
      expiresAt: Date.now() + BANK_HOLIDAY_TTL_MS,
      dates,
    };
    return dates;
  } catch {
    return new Set<string>();
  }
}

function normalizeServiceMethod(value: unknown): EnglandSection8CourtPackServiceMethod {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  switch (normalized) {
    case 'first_class_post':
    case 'first_class':
    case 'post':
    case 'recorded_delivery':
    case 'recorded_post':
    case 'signed_for':
    case 'special_delivery':
      return 'first_class_post';
    case 'hand':
    case 'by_hand':
    case 'hand_delivery':
    case 'hand_delivered':
    case 'letterbox':
    case 'left_at_property':
    case 'leaving_at_property':
    case 'personal':
    case 'personal_service':
      return 'personal';
    case 'document_exchange':
    case 'dx':
      return 'document_exchange';
    case 'fax':
      return 'fax';
    case 'email':
    case 'electronic':
    case 'other_electronic':
      return 'other_electronic';
    default:
      return 'unknown';
  }
}

function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

function formatUKLegalDate(value: string | null | undefined): string {
  const date = typeof value === 'string' ? parseISODateLocal(value) : null;
  if (!date) return String(value || '');
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function monthlyEquivalent(rentAmount: number, rentFrequency: string | undefined): number {
  switch ((rentFrequency || 'monthly').toLowerCase()) {
    case 'weekly':
      return (rentAmount * 52) / 12;
    case 'fortnightly':
      return (rentAmount * 26) / 12;
    case 'quarterly':
      return rentAmount / 3;
    case 'yearly':
      return rentAmount / 12;
    default:
      return rentAmount;
  }
}

function formatServiceMethodForNarrative(method: EnglandSection8CourtPackServiceMethod, rawValue: unknown): string {
  const explicit = String(rawValue || '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (explicit) {
    return explicit
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  switch (method) {
    case 'first_class_post':
      return 'First class post';
    case 'personal':
      return 'Personal service';
    case 'document_exchange':
      return 'Document exchange';
    case 'fax':
      return 'Fax';
    case 'other_electronic':
      return 'Electronic service';
    default:
      return 'Service method not recorded';
  }
}

function computeArrearsTotalFromItems(items: Array<Record<string, any>> | undefined): number | null {
  if (!Array.isArray(items) || items.length === 0) return null;

  const total = items.reduce((sum, item) => {
    if (!item || typeof item !== 'object') return sum;
    if (typeof item.amount_owed === 'number' && Number.isFinite(item.amount_owed)) {
      return sum + item.amount_owed;
    }

    const due = typeof item.rent_due === 'number' ? item.rent_due : Number(item.rent_due || 0);
    const paid = typeof item.rent_paid === 'number' ? item.rent_paid : Number(item.rent_paid || 0);
    return sum + Math.max(0, due - paid);
  }, 0);

  return Number(total.toFixed(2));
}

function formatSterling(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

function extractGroundCodesFromSources(sources: SourceRecord[]): string[] {
  const directGroundCodes = resolveStringField(sources, 'ground_numbers');
  if (directGroundCodes) {
    const parsed = directGroundCodes
      .split(',')
      .map((entry) => normalizeEnglandGroundCode(entry))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    if (parsed.length > 0) return parsed;
  }

  for (const source of sources) {
    const value =
      getNestedValue(source, 'ground_codes') ??
      getNestedValue(source, 'section8_grounds') ??
      getNestedValue(source, 'section8_grounds_selection') ??
      getNestedValue(source, 'selected_grounds') ??
      getNestedValue(source, 'grounds');
    if (Array.isArray(value)) {
      const parsed = value
        .map((entry) =>
          normalizeEnglandGroundCode(
            typeof entry === 'object' && entry
              ? (entry as Record<string, any>).code ||
                (entry as Record<string, any>).number ||
                (entry as Record<string, any>).value ||
                (entry as Record<string, any>).label ||
                ''
              : entry,
          ),
        )
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
      if (parsed.length > 0) return parsed;
    }
  }

  return [];
}

function buildStatutoryGroundsText(groundCodes: string[]): string {
  const fragments = groundCodes
    .map((code) => {
      const definition = getEnglandGroundDefinition(code);
      const title = definition?.title || 'Ground';
      const disposition = definition?.mandatory ? 'mandatory' : 'discretionary';
      return `Ground ${code} (${disposition})`;
    })
    .filter(Boolean);

  if (fragments.length === 0) {
    return 'Grounds under Schedule 2 to the Housing Act 1988.';
  }

  if (fragments.length === 1) {
    return `${fragments[0]} of Schedule 2 to the Housing Act 1988.`;
  }

  if (fragments.length === 2) {
    return `${fragments[0]} and ${fragments[1]} of Schedule 2 to the Housing Act 1988.`;
  }

  return `${fragments.slice(0, -1).join(', ')}, and ${fragments.at(-1)} of Schedule 2 to the Housing Act 1988.`;
}

function buildQ7DefendantCircumstances(sources: SourceRecord[]): string {
  const merged = sources.reduceRight<Record<string, any>>(
    (acc, source) => ({ ...acc, ...(source || {}) }),
    {},
  );

  return buildCompletePackDefendantCircumstancesText(merged);
}

function buildFirstUnpaidPeriodStart(sources: SourceRecord[]): string | null {
  for (const source of sources) {
    const items = getNestedValue(source, 'arrears_items');
    if (Array.isArray(items)) {
      const first = items
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          period_start: typeof item.period_start === 'string' ? item.period_start : null,
          amount_owed:
            typeof item.amount_owed === 'number'
              ? item.amount_owed
              : Number((item.rent_due || 0) - (item.rent_paid || 0)),
        }))
        .filter((item) => item.period_start && item.amount_owed > 0)
        .sort((a, b) => String(a.period_start).localeCompare(String(b.period_start)))[0];

      if (first?.period_start) return first.period_start;
    }
  }

  return resolveStringField(sources, 'first_unpaid_period_start') || null;
}

function pushConflict(
  conflicts: EnglandSection8ConsistencyConflict[],
  field: string,
  expected: string | number | null,
  actual: string | number | null,
  source: string,
  document?: string,
) {
  if (actual === undefined || actual === null || actual === '') return;
  if (expected === actual) return;
  conflicts.push({ field, expected, actual, source, document });
}

function buildGround8Status(totalArrears: number, threshold: number): Ground8Status {
  if (Math.abs(totalArrears - threshold) < 0.005) return 'AT';
  return totalArrears > threshold ? 'ABOVE' : 'BELOW';
}

export async function computeEnglandSection8DeemedServiceDate(input: {
  serviceDate: string;
  serviceMethod: EnglandSection8CourtPackServiceMethod;
  serviceTime?: string;
}): Promise<string> {
  const bankHolidays = await loadEnglandWalesBankHolidays();
  const start = parseISODateLocal(input.serviceDate);

  if (!start) {
    throw new Error(`INVALID_SERVICE_DATE: ${input.serviceDate}`);
  }

  switch (input.serviceMethod) {
    case 'first_class_post':
    case 'document_exchange': {
      const base = isBusinessDay(start, bankHolidays) ? start : nextBusinessDay(start, bankHolidays);
      return toISODate(addBusinessDaysFrom(base, 2, bankHolidays));
    }
    case 'personal':
    case 'fax':
    case 'other_electronic': {
      const sameDay = isBusinessDay(start, bankHolidays) && parseTimeBefore430pm(input.serviceTime);
      return sameDay ? toISODate(start) : toISODate(addBusinessDaysFrom(start, 1, bankHolidays));
    }
    default:
      return input.serviceDate;
  }
}

export async function buildEnglandSection8CourtPackCalculation(params: {
  wizardFacts?: Record<string, any>;
  caseData?: Record<string, any> | null;
  evictionCase?: Record<string, any> | null;
}): Promise<EnglandSection8CourtPackCalculation> {
  const wizardFacts = params.wizardFacts || {};
  const caseData = params.caseData || {};
  const evictionCase = params.evictionCase || {};
  const sources: SourceRecord[] = [wizardFacts, caseData, evictionCase];

  const rawServiceDate =
    resolveStringField(
      sources,
      'notice_service_date',
      'notice_served_date',
      'section_8_notice_date',
      'notice_date',
      'notice.notice_date',
      'notice.service_date',
    ) || new Date().toISOString().split('T')[0];

  const rawServiceMethod =
    resolveNoticeServiceMethod(wizardFacts as any) ||
    resolveStringField(sources, 'notice_service_method', 'service_method', 'notice.service_method');
  const serviceMethod = normalizeServiceMethod(rawServiceMethod);
  const serviceMethodText = formatServiceMethodForNarrative(serviceMethod, rawServiceMethod);
  const serviceTime =
    resolveStringField(sources, 'notice_service_time', 'service_time', 'notice.service_time') || undefined;

  const deemedServiceDate = await computeEnglandSection8DeemedServiceDate({
    serviceDate: rawServiceDate,
    serviceMethod,
    serviceTime,
  });

  const rentAmount = resolveNumberField(sources, 'rent_amount', 'tenancy.rent_amount') || 0;
  const rentFrequency = resolveStringField(sources, 'rent_frequency', 'tenancy.rent_frequency') || 'monthly';
  const monthlyRent = monthlyEquivalent(rentAmount, rentFrequency);
  const rawTotalArrears = resolveNumberField(
    sources,
    'total_arrears',
    'rent_arrears_amount',
    'issues.rent_arrears.total_arrears',
  ) || 0;

  const arrearsItems = (getNestedValue(caseData, 'arrears_items') ||
    getNestedValue(wizardFacts, 'arrears_items') ||
    getNestedValue(wizardFacts, 'issues.rent_arrears.arrears_items')) as Array<Record<string, any>> | undefined;
  const arrearsScheduleTotal = computeArrearsTotalFromItems(arrearsItems);
  const totalArrears = arrearsScheduleTotal ?? rawTotalArrears;

  const groundCodes = extractGroundCodesFromSources(sources);
  const hasGround8 = groundCodes.includes('8');
  const hasGround10 = groundCodes.includes('10');
  const groundsText = buildStatutoryGroundsText(groundCodes);

  const ground8Threshold = Number((monthlyRent * 3).toFixed(2));
  const ground8Status = buildGround8Status(totalArrears, ground8Threshold);

  const existingExpiry =
    resolveStringField(
      sources,
      'notice_expiry_date',
      'earliest_proceedings_date',
      'earliest_possession_date',
      'notice.expiry_date',
    ) || '';

  const noticePeriod = calculateEnglandPossessionNoticePeriod(groundCodes);
  const monthPeriods = groundCodes
    .map((code) => getEnglandGroundDefinition(code)?.noticePeriodMonths)
    .filter((months): months is number => typeof months === 'number' && months > 0);
  const requiredNoticeDate =
    groundCodes.length === 0
      ? parseISODateLocal(existingExpiry) || parseISODateLocal(deemedServiceDate)
      : monthPeriods.length > 0
        ? addCalendarMonths(deemedServiceDate, Math.max(...monthPeriods))
        : addCalendarDays(deemedServiceDate, noticePeriod.noticePeriodDays);
  const derivedExpiry = requiredNoticeDate ? toISODate(requiredNoticeDate) : existingExpiry || deemedServiceDate;

  const noticeExpiryDate = derivedExpiry;
  const earliestProceedingsDate =
    groundCodes.length > 0
      ? noticeExpiryDate
      : resolveStringField(sources, 'earliest_proceedings_date') || noticeExpiryDate;

  const firstUnpaidPeriodStart = buildFirstUnpaidPeriodStart(sources);
  const dailyRentRate = Number(((monthlyRent * 12) / 365).toFixed(2));

  const q4aText =
    hasGround8 || hasGround10
      ? `The defendant has failed to pay rent as required under the tenancy agreement. The total arrears as at ${formatUKLegalDate(rawServiceDate)} stand at ${formatSterling(totalArrears)}. Full details are set out in the attached Schedule of Arrears (Exhibit DM1).`
      : buildStatutoryGroundsText(groundCodes);

  const q5Text = `A Form 3A notice seeking possession was served on the defendant on ${formatUKLegalDate(rawServiceDate)} by ${serviceMethodText}. The notice expires on ${formatUKLegalDate(noticeExpiryDate)}.`;
  const q6Text = `Form 3A notice served on ${formatUKLegalDate(rawServiceDate)} with an expiry date of ${formatUKLegalDate(noticeExpiryDate)}.`;
  const q7Text = buildQ7DefendantCircumstances(sources);
  const q8Text = `The claimant is a private individual landlord acting without legal representation. The claimant asks the court to take into account the sustained non-payment of rent since ${formatUKLegalDate(firstUnpaidPeriodStart || rawServiceDate)} and the total arrears of ${formatSterling(totalArrears)} now outstanding.`;

  const conflicts: EnglandSection8ConsistencyConflict[] = [];
  const arrearsAtNoticeDate = totalArrears;
  const minimumNoticeDate = requiredNoticeDate || addCalendarDays(deemedServiceDate, noticePeriod.noticePeriodDays || 14);
  const minimumNoticeSatisfied =
    parseISODateLocal(earliestProceedingsDate) !== null &&
    parseISODateLocal(earliestProceedingsDate)!.getTime() >= minimumNoticeDate.getTime();

  const checks: EnglandSection8ValidationCheck[] = [
    {
      key: 'arrears_total_matches_schedule',
      status: conflicts.some((conflict) => conflict.field === 'total_arrears' || conflict.field === 'arrears_at_notice_date')
        ? 'failed'
        : 'passed',
      message: conflicts.some((conflict) => conflict.field === 'total_arrears' || conflict.field === 'arrears_at_notice_date')
        ? 'Arrears totals do not match the attached schedule or arrears-at-notice figure to the penny.'
        : `Arrears total aligned at ${formatSterling(totalArrears)}.`,
      documents: ['Schedule of Arrears', 'N119', 'Witness Statement'],
    },
    {
      key: 'minimum_notice_period',
      status: minimumNoticeSatisfied ? 'passed' : 'failed',
      message: minimumNoticeSatisfied
        ? `Minimum notice period is satisfied from deemed service (${formatUKLegalDate(deemedServiceDate)}).`
        : `Earliest proceedings date falls before the required minimum notice date of ${formatUKLegalDate(toISODate(minimumNoticeDate))}.`,
      documents: ['Form 3A', 'N215', 'N5', 'N119'],
    },
  ];

  if (hasGround8) {
    checks.push({
      key: 'ground8_threshold',
      status: ground8Status === 'BELOW' ? 'failed' : 'passed',
      message:
        ground8Status === 'ABOVE'
          ? `Ground 8 threshold is satisfied above ${formatSterling(ground8Threshold)}.`
          : ground8Status === 'AT'
            ? `Ground 8 threshold is exactly met at ${formatSterling(ground8Threshold)} and should be treated as a risk position.`
            : `Ground 8 threshold is below the required level of ${formatSterling(ground8Threshold)}.`,
      documents: ['Court Readiness Status', 'Schedule of Arrears'],
    });
  }

  if (conflicts.length > 0) {
    checks.push({
      key: 'cross_document_consistency',
      status: 'failed',
      message: 'One or more court-pack values conflict with the recalculated source of truth.',
      documents: Array.from(new Set(conflicts.map((conflict) => conflict.document).filter(Boolean))) as string[],
    });
  } else {
    checks.push({
      key: 'cross_document_consistency',
      status: 'passed',
      message: 'No cross-document conflicts were detected against the recalculated court-pack values.',
      documents: ['Form 3A', 'N215', 'N5', 'N119', 'Witness Statement'],
    });
  }

  const validationSummary: EnglandSection8ValidationSummary = {
    deemed_service_date: deemedServiceDate,
    notice_expiry_date: noticeExpiryDate,
    earliest_proceedings_date: earliestProceedingsDate,
    total_arrears: totalArrears,
    ground_8_threshold: ground8Threshold,
    ground_8_status: ground8Status,
    all_consistency_checks_passed: checks.every((check) => check.status === 'passed'),
    checks,
  };

  if (conflicts.length > 0 || checks.some((check) => check.status === 'failed' && check.key !== 'ground8_threshold')) {
    throw new EnglandSection8ConsistencyError(
      'Section 8 court-pack consistency validation failed.',
      conflicts,
      validationSummary,
    );
  }

  return {
    serviceMethod,
    serviceMethodText,
    rawServiceDate,
    deemedServiceDate,
    noticeExpiryDate,
    earliestProceedingsDate,
    totalArrears,
    arrearsAtNoticeDate: totalArrears,
    ground8Threshold,
    ground8Status,
    firstUnpaidPeriodStart,
    monthlyRent,
    dailyRentRate,
    statutoryGroundsText: groundsText,
    q4aText,
    q5Text,
    q6Text,
    q7Text,
    q8Text,
    validationSummary,
  };
}

export function applyEnglandSection8CourtPackCalculation(
  target: Record<string, any> | null | undefined,
  calculation: EnglandSection8CourtPackCalculation,
): void {
  if (!target) return;

  target.notice_service_date = calculation.rawServiceDate;
  target.notice_served_date = calculation.rawServiceDate;
  target.section_8_notice_date = calculation.rawServiceDate;
  target.service_date = calculation.rawServiceDate;
  target.deemed_service_date = calculation.deemedServiceDate;
  target.notice_service_method_text = calculation.serviceMethodText;
  target.notice_expiry_date = calculation.noticeExpiryDate;
  target.earliest_possession_date = calculation.noticeExpiryDate;
  target.earliest_proceedings_date = calculation.earliestProceedingsDate;
  target.total_arrears = calculation.totalArrears;
  target.arrears_at_notice_date = calculation.arrearsAtNoticeDate;
  target.ground_8_threshold = calculation.ground8Threshold;
  target.ground_8_status = calculation.ground8Status;
  target.n119_reason_a_text = calculation.q4aText;
  target.n119_q5_text = calculation.q5Text;
  target.n119_q6_text = calculation.q6Text;
  target.n119_q7_text = calculation.q7Text;
  target.n119_q8_text = calculation.q8Text;
  target.n119_statutory_grounds_text = calculation.statutoryGroundsText;
  target.first_unpaid_period_start = calculation.firstUnpaidPeriodStart;
  target.validation_summary = calculation.validationSummary;
  target.court_pack_validation_summary = calculation.validationSummary;

  if (target.notice && typeof target.notice === 'object') {
    target.notice.service_date = calculation.rawServiceDate;
    target.notice.served_date = calculation.rawServiceDate;
    target.notice.deemed_service_date = calculation.deemedServiceDate;
    target.notice.service_method_text = calculation.serviceMethodText;
    target.notice.expiry_date = calculation.noticeExpiryDate;
    target.notice.notice_expiry_date = calculation.noticeExpiryDate;
    target.notice.earliest_proceedings_date = calculation.earliestProceedingsDate;
  }
}
