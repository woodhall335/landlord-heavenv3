export const ENGLAND_REFORM_COMMENCEMENT_DATE = '2026-05-01';

export type EnglandTenancyPurpose =
  | 'new_agreement'
  | 'existing_written_tenancy'
  | 'existing_verbal_tenancy';

export const DEFAULT_ENGLAND_TENANCY_PURPOSE: EnglandTenancyPurpose = 'new_agreement';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function normalizeIsoDateString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  const match = ISO_DATE_PATTERN.exec(trimmed);
  if (!match) return undefined;

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const normalizedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    normalizedDate.getUTCFullYear() !== year ||
    normalizedDate.getUTCMonth() !== month - 1 ||
    normalizedDate.getUTCDate() !== day
  ) {
    return undefined;
  }

  return trimmed;
}

export function normalizeEnglandTenancyPurpose(
  value: unknown
): EnglandTenancyPurpose | undefined {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim() as EnglandTenancyPurpose;
  if (
    normalized === 'new_agreement' ||
    normalized === 'existing_written_tenancy' ||
    normalized === 'existing_verbal_tenancy'
  ) {
    return normalized;
  }

  return undefined;
}

export function getEnglandTenancyPurpose(value: unknown): EnglandTenancyPurpose {
  return normalizeEnglandTenancyPurpose(value) || DEFAULT_ENGLAND_TENANCY_PURPOSE;
}

export function isEnglandPostReformTenancy(params: {
  jurisdiction?: string | null;
  tenancyStartDate?: string | null;
  purpose?: unknown;
}): boolean {
  const { jurisdiction, tenancyStartDate, purpose } = params;

  if (jurisdiction !== 'england') return false;
  if (getEnglandTenancyPurpose(purpose) !== 'new_agreement') return false;
  const normalizedTenancyStartDate = normalizeIsoDateString(tenancyStartDate);
  if (!normalizedTenancyStartDate) return false;

  return normalizedTenancyStartDate >= ENGLAND_REFORM_COMMENCEMENT_DATE;
}

export function shouldIncludeEnglandInformationSheet(params: {
  jurisdiction?: string | null;
  purpose?: unknown;
}): boolean {
  const { jurisdiction, purpose } = params;

  return (
    jurisdiction === 'england' &&
    getEnglandTenancyPurpose(purpose) === 'existing_written_tenancy'
  );
}

export function getEnglandMissingPurposeWarning(params: {
  jurisdiction?: string | null;
  tenancyStartDate?: string | null;
  purpose?: unknown;
}): string | undefined {
  const { jurisdiction, tenancyStartDate, purpose } = params;

  if (jurisdiction !== 'england') return undefined;
  if (normalizeEnglandTenancyPurpose(purpose) !== undefined) return undefined;

  const normalizedTenancyStartDate = normalizeIsoDateString(tenancyStartDate);
  if (!normalizedTenancyStartDate) return undefined;

  if (normalizedTenancyStartDate >= ENGLAND_REFORM_COMMENCEMENT_DATE) {
    return (
      'This England case starts on or after 1 May 2026 but does not record whether it is a new agreement or a transition case. Review the tenancy purpose before relying on the generated pack.'
    );
  }

  return (
    'This England case starts before 1 May 2026 but does not record whether it is a new agreement, an existing written tenancy, or an existing verbal tenancy. Review the tenancy purpose before relying on any transition paperwork due by 31 May 2026.'
  );
}
