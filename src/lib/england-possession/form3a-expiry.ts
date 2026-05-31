import { getSelectedGrounds } from '@/lib/grounds';
import { calculateEarliestValidPossessionDate } from './post-2026-validation';

const SERVICE_DATE_KEYS = [
  'notice_served_date',
  'notice_service_date',
  'notice_date',
  'service_date',
] as const;

function getNestedValue(source: Record<string, any>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
}

function normalizeIsoDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split('T')[0];
}

export function formatUkLongDate(value: string | null | undefined): string {
  if (!value) return '';
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function getForm3AServiceDate(facts: Record<string, any>): string | null {
  for (const key of SERVICE_DATE_KEYS) {
    const normalized = normalizeIsoDate(facts[key]);
    if (normalized) return normalized;
  }

  const nestedCandidates = [
    'notice_service.notice_date',
    'notice_service.date',
    'tenancy.notice_service_date',
  ];

  for (const key of nestedCandidates) {
    const normalized = normalizeIsoDate(getNestedValue(facts, key));
    if (normalized) return normalized;
  }

  return null;
}

export function getForm3ANoticeExpiryDate(facts: Record<string, any>): string | null {
  const candidates = [
    facts.notice_expiry_date,
    facts.expiry_date,
    getNestedValue(facts, 'notice_service.notice_expiry_date'),
    getNestedValue(facts, 'notice_service.expiry_date'),
  ];

  for (const value of candidates) {
    const normalized = normalizeIsoDate(value);
    if (normalized) return normalized;
  }

  return null;
}

export function getForm3AEarliestExpiryDate(facts: Record<string, any>): string | null {
  const serviceDate = getForm3AServiceDate(facts);
  if (!serviceDate) return null;

  const selectedGrounds = getSelectedGrounds(facts);
  if (selectedGrounds.length === 0) return null;

  return calculateEarliestValidPossessionDate(serviceDate, selectedGrounds);
}

export function getForm3AExpiryIssue(facts: Record<string, any>): {
  earliestDate: string | null;
  currentDate: string | null;
  isTooEarly: boolean;
  message: string | null;
} {
  const earliestDate = getForm3AEarliestExpiryDate(facts);
  const currentDate = getForm3ANoticeExpiryDate(facts);
  const isTooEarly = Boolean(earliestDate && currentDate && currentDate < earliestDate);

  return {
    earliestDate,
    currentDate,
    isTooEarly,
    message: isTooEarly
      ? `Notice expiry date is too early. Earliest valid date is ${formatUkLongDate(earliestDate)}.`
      : null,
  };
}
