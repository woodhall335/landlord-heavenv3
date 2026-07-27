export type AdditionalTenancyJurisdiction =
  | 'wales'
  | 'scotland'
  | 'northern-ireland';

import {
  isNonEnglandStandardTenancyCertified,
  NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION,
} from './non-england-certification';

const ADDITIONAL_TENANCY_JURISDICTIONS = new Set<AdditionalTenancyJurisdiction>([
  'wales',
  'scotland',
  'northern-ireland',
]);

export function isAdditionalTenancyJurisdiction(
  jurisdiction: string | null | undefined
): jurisdiction is AdditionalTenancyJurisdiction {
  return ADDITIONAL_TENANCY_JURISDICTIONS.has(
    jurisdiction as AdditionalTenancyJurisdiction
  );
}

export function isNonEnglandStandardTenancyPubliclyEnabled(
  jurisdiction: string | null | undefined
): boolean {
  if (!isAdditionalTenancyJurisdiction(jurisdiction)) {
    return false;
  }

  if (!isNonEnglandStandardTenancyCertified(jurisdiction)) {
    return false;
  }

  return NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION[jurisdiction].releaseEnabled;
}

export function isStandardTenancyEntryProduct(
  product: string | null | undefined
): boolean {
  return product === 'ast_standard' || product === 'tenancy_agreement';
}
