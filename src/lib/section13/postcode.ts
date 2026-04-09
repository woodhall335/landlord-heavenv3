const UK_POSTCODE_REGEX =
  /^([Gg][Ii][Rr]\s?0[Aa]{2}|(?:[A-Za-z][0-9]{1,2}|[A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2}|[A-Za-z][0-9][A-Za-z]|[A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z])\s?[0-9][A-Za-z]{2})$/;

export function normalizeUkPostcode(postcode: string | null | undefined): string {
  const raw = (postcode || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!raw) return '';
  if (raw === 'GIR0AA') return 'GIR 0AA';
  if (raw.length <= 3) return raw;
  return `${raw.slice(0, raw.length - 3)} ${raw.slice(-3)}`;
}

export function isValidUkPostcode(postcode: string | null | undefined): boolean {
  const normalized = normalizeUkPostcode(postcode);
  return Boolean(normalized && UK_POSTCODE_REGEX.test(normalized));
}

export function assertUkPostcode(postcode: string | null | undefined, label = 'postcode'): string {
  const normalized = normalizeUkPostcode(postcode);
  if (!normalized || !isValidUkPostcode(normalized)) {
    throw new Error(`Invalid ${label}. Enter a valid UK postcode.`);
  }
  return normalized;
}

export function maybeNormalizeUkPostcode(postcode: string | null | undefined): string | null {
  const normalized = normalizeUkPostcode(postcode);
  return normalized || null;
}

export function getDomainFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}
