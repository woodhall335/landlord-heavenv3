import type { ArrearsItem } from '@/lib/case-facts/schema';
import { ENGLAND_SECTION8_NOTICE_NAME } from '@/lib/england-possession/section8-terminology';

type ChronologyInput = Record<string, any>;

export interface EnglandEvictionChronology {
  paragraphs: string[];
  timelineItems: string[];
  previewText: string;
  hasArrearsSummary: boolean;
}

function getByPath(source: ChronologyInput | null | undefined, path: string): unknown {
  if (!source) return undefined;
  if (path in source) return source[path];

  return path.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in (value as ChronologyInput)) {
      return (value as ChronologyInput)[segment];
    }
    return undefined;
  }, source);
}

function getFirstValue(source: ChronologyInput, ...paths: string[]): unknown {
  for (const path of paths) {
    const value = getByPath(source, path);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
}

function getFirstString(source: ChronologyInput, ...paths: string[]): string {
  const value = getFirstValue(source, ...paths);
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrencyText(value: unknown): string {
  return `£${toNumber(value).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLongDate(value: unknown): string {
  if (!value) return '';

  try {
    const raw = String(value);
    const date = new Date(raw.includes('T') ? raw : `${raw}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return '';
  }
}

function describeResponsiveness(value: unknown): string {
  switch (String(value || '').trim()) {
    case 'not_responding':
      return 'The tenant is not responding to payment-chase or contact attempts.';
    case 'intermittent':
      return 'The tenant responds intermittently but has not resolved the position.';
    case 'engaging_but_not_paying':
      return 'The tenant is engaging with the landlord but is not clearing the arrears.';
    case 'disputing':
      return 'The tenant is disputing the arrears, the notice, or the underlying possession position.';
    default:
      return '';
  }
}

function getArrearsItems(data: ChronologyInput): ArrearsItem[] {
  const directItems = getFirstValue(
    data,
    'arrears_items',
    'issues.rent_arrears.arrears_items',
    'arrears.items',
  );

  return Array.isArray(directItems) ? (directItems as ArrearsItem[]) : [];
}

function getAmountOwed(item: ArrearsItem): number {
  if (typeof item.amount_owed === 'number' && Number.isFinite(item.amount_owed)) {
    return Math.max(item.amount_owed, 0);
  }

  return Math.max(toNumber(item.rent_due) - toNumber(item.rent_paid), 0);
}

function summarizeArrears(data: ChronologyInput): {
  paragraph: string;
  timelineItems: string[];
  hasArrears: boolean;
} {
  const arrearsItems = getArrearsItems(data)
    .map((item) => ({ ...item, amount_owed: getAmountOwed(item) }))
    .filter((item) => (item.amount_owed || 0) > 0)
    .sort((left, right) => String(left.period_start).localeCompare(String(right.period_start)));

  if (arrearsItems.length === 0) {
    return {
      paragraph: '',
      timelineItems: [],
      hasArrears: false,
    };
  }

  const firstItem = arrearsItems[0];
  const latestItem = arrearsItems[arrearsItems.length - 1];
  const totalArrears =
    toNumber(getFirstValue(data, 'total_arrears', 'issues.rent_arrears.total_arrears', 'arrears.total_arrears')) ||
    arrearsItems.reduce((sum, item) => sum + (item.amount_owed || 0), 0);

  const firstPeriod = formatLongDate(firstItem.period_start) || formatLongDate(firstItem.period_end);
  const latestPeriod = formatLongDate(latestItem.period_start) || formatLongDate(latestItem.period_end);
  const paragraphParts = [
    firstPeriod ? `The rent account first shows an unpaid or short-paid period from ${firstPeriod}.` : '',
    latestPeriod && latestPeriod !== firstPeriod ? `The most recent affected rental period is ${latestPeriod}.` : '',
    totalArrears > 0
      ? `The current arrears total is ${formatCurrencyText(totalArrears)} across ${arrearsItems.length} missed or short-paid rental period${arrearsItems.length === 1 ? '' : 's'}.`
      : '',
  ].filter(Boolean);

  const timelineItems = [
    firstPeriod ? `First unpaid or short-paid period: ${firstPeriod}` : '',
    latestPeriod ? `Most recent arrears period: ${latestPeriod}` : '',
    totalArrears > 0 ? `Current arrears: ${formatCurrencyText(totalArrears)}` : '',
    arrearsItems.length > 0 ? `Missed or short-paid periods recorded: ${arrearsItems.length}` : '',
  ].filter(Boolean);

  return {
    paragraph: paragraphParts.join(' '),
    timelineItems,
    hasArrears: true,
  };
}

function buildNoticeParagraph(data: ChronologyInput): { paragraph: string; timelineItem: string } {
  const routeHint = String(
    getFirstValue(data, 'selected_notice_route', 'recommended_route', 'eviction_route', 'claim_type', 'notice_type') || '',
  ).toLowerCase();
  const noticeLabel =
    routeHint.includes('section_8') || routeHint.includes('section 8')
      ? ENGLAND_SECTION8_NOTICE_NAME
      : 'notice';
  const serviceDate = formatLongDate(
    getFirstValue(data, 'notice_service_date', 'notice_served_date', 'section_8_notice_date', 'notice.service_date'),
  );
  const expiryDate = formatLongDate(
    getFirstValue(data, 'notice_expiry_date', 'earliest_possession_date', 'earliest_proceedings_date', 'notice.expiry_date'),
  );

  if (!serviceDate && !expiryDate) {
    return { paragraph: '', timelineItem: '' };
  }

  return {
    paragraph: [
      serviceDate ? `The ${noticeLabel} service milestone currently recorded is ${serviceDate}.` : '',
      expiryDate ? `The possession / proceedings date currently recorded in the file is ${expiryDate}.` : '',
    ]
      .filter(Boolean)
      .join(' '),
    timelineItem:
      serviceDate && expiryDate
        ? `Notice served on ${serviceDate}; current proceedings date ${expiryDate}`
        : serviceDate
          ? `Notice served on ${serviceDate}`
          : `Current proceedings date ${expiryDate}`,
  };
}

function buildContactParagraph(data: ChronologyInput): { paragraph: string; timelineItems: string[] } {
  const totalAttemptsValue = getFirstValue(data, 'communication_timeline.total_attempts', 'total_attempts');
  const totalAttempts = totalAttemptsValue === null || totalAttemptsValue === undefined ? null : toNumber(totalAttemptsValue);
  const responsiveness = describeResponsiveness(
    getFirstValue(data, 'communication_timeline.tenant_responsiveness', 'tenant_responsiveness'),
  );
  const additionalDetail = getFirstString(
    data,
    'communication_timeline.log',
    'communication_timeline.narrative',
    'section8_grounds.incident_log',
    'issues.section8_grounds.incident_log',
    'section8_grounds.breach_details',
    'issues.section8_grounds.breach_details',
  );

  const paragraph = [
    totalAttempts !== null && !Number.isNaN(totalAttempts)
      ? `The landlord records ${totalAttempts} payment-chase or contact attempt${totalAttempts === 1 ? '' : 's'} before court filing.`
      : '',
    responsiveness,
    additionalDetail ? `Additional chronology or breach detail: ${additionalDetail}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const timelineItems = [
    totalAttempts !== null && !Number.isNaN(totalAttempts)
      ? `Recorded payment-chase or contact attempts: ${totalAttempts}`
      : '',
    responsiveness ? responsiveness : '',
  ].filter(Boolean);

  return { paragraph, timelineItems };
}

function buildReadinessParagraph(data: ChronologyInput): string {
  const evidenceReady = getFirstValue(data, 'evidence_bundle_ready');
  if (evidenceReady === true) {
    return 'The landlord-held evidence bundle has been confirmed as ready alongside the generated possession paperwork.';
  }
  if (evidenceReady === false) {
    return 'The landlord-held evidence bundle is not yet complete, so the generated pack should be treated as a drafting file pending the remaining external records.';
  }
  return '';
}

export function buildEnglandEvictionChronology(data: ChronologyInput): EnglandEvictionChronology {
  const arrears = summarizeArrears(data);
  const notice = buildNoticeParagraph(data);
  const contact = buildContactParagraph(data);
  const readiness = buildReadinessParagraph(data);

  const paragraphs = [arrears.paragraph, contact.paragraph, notice.paragraph, readiness].filter(Boolean);
  const timelineItems = [...arrears.timelineItems, ...contact.timelineItems, notice.timelineItem].filter(Boolean);

  return {
    paragraphs,
    timelineItems,
    previewText: paragraphs.join('\n\n'),
    hasArrearsSummary: arrears.hasArrears,
  };
}
