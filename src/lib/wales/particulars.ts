export const WALES_PARTICULARS_KEYS = [
  'wales_breach_particulars',
  'wales_fault_particulars',
  'wales_part_d_particulars',
  'breach_description',
  'breach_details',
  'breach_summary',
  'asb_description',
  'wales_asb_description',
  'false_statement_details',
  'wales_false_statement_summary',
  'fault_particulars',
  'breach_particulars',
  'particulars',
  'incident_details',
  'rent_arrears_particulars',
  'notice_only.particulars',
  'wales.particulars',
];

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getNestedValue(source: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.');
  let current: unknown = source;
  for (const segment of segments) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

export function pickFirstNonEmptyString(
  source: Record<string, unknown> | null | undefined,
  keys: string[]
): string | null {
  if (!source) {
    return null;
  }

  for (const key of keys) {
    const value = key.includes('.') ? getNestedValue(source, key) : source[key];
    if (typeof value !== 'string') {
      continue;
    }
    const normalized = normalizeWhitespace(value);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return null;
}

export function extractWalesParticularsFromWizardFacts(
  wizardFacts: Record<string, unknown> | null | undefined
): string | null {
  return pickFirstNonEmptyString(wizardFacts, WALES_PARTICULARS_KEYS);
}
