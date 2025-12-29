export type CanonicalJurisdiction =
  | 'england'
  | 'wales'
  | 'scotland'
  | 'northern-ireland';

export function normalizeJurisdiction(input?: string | null): CanonicalJurisdiction | null {
  if (!input) return null;
  const normalized = input.trim().toLowerCase();
  if (normalized === 'ni' || normalized === 'northern ireland' || normalized === 'northern-ireland') {
    return 'northern-ireland';
  }
  if (normalized === 'england' || normalized === 'wales' || normalized === 'scotland') {
    return normalized as CanonicalJurisdiction;
  }
  return null;
}
