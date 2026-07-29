export class DocumentDisplayValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentDisplayValueError';
  }
}

export const DOCUMENT_DISPLAY_LABELS = {
  not_designated: 'Not designated',
  designated: 'Designated',
  unknown: 'Not confirmed',
  pending: 'Pending',
  not_applicable: 'Not applicable',
  true: 'Yes',
  false: 'No',
  unsigned: 'Unsigned',
  landlord_signed: 'Landlord signed; tenant signature pending',
  tenant_signed: 'Tenant signed; landlord signature pending',
  fully_signed: 'Fully signed',
} as const;

export type DocumentDisplayValue = keyof typeof DOCUMENT_DISPLAY_LABELS | boolean;

function parseDocumentMoney(value: unknown): number {
  if (typeof value === 'number') {
    if (Number.isFinite(value) && value >= 0) return value;
    throw new DocumentDisplayValueError(`Invalid document currency number: ${String(value)}`);
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(/[£,\s]/g, '');
    if (/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
      const parsed = Number(normalized);
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
  }

  throw new DocumentDisplayValueError(
    `Invalid document currency value: ${value === null ? 'null' : String(value)}`
  );
}

export function formatDocumentCurrency(value: unknown): string {
  return `£${parseDocumentMoney(value).toFixed(2)}`;
}

export function formatDocumentDisplayValue(value: unknown): string {
  const normalized = typeof value === 'boolean' ? String(value) : String(value ?? '').trim();
  if (normalized in DOCUMENT_DISPLAY_LABELS) {
    return DOCUMENT_DISPLAY_LABELS[normalized as keyof typeof DOCUMENT_DISPLAY_LABELS];
  }

  throw new DocumentDisplayValueError(
    `Unsupported customer-facing enum value: ${normalized || '(empty)'}`
  );
}

export function normalizeSentenceFragment(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().replace(/[.!?]+$/u, '');
  return normalized || undefined;
}
