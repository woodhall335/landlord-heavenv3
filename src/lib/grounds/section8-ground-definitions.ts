/**
 * England Form 3A Ground Definitions - Compatibility View
 *
 * This module keeps the older SECTION8_GROUND_DEFINITIONS API shape used by
 * preview/normalization/generator code, but the actual ground list, titles,
 * and mandatory/discretionary flags now come from the post-1 May 2026 England
 * ground catalog. That keeps the UI, validator, and generator on one shared
 * set of grounds.
 *
 * IMPORTANT:
 * - The authoritative ground set is in `@/lib/england-possession/ground-catalog`.
 * - The authoritative legal wording for live Form 3A generation is resolved by
 *   `@/lib/england-possession/legal-wording`.
 * - This file is now a synchronous compatibility layer for places that still
 *   need an immediate lookup map.
 */

import {
  ENGLAND_POST_2026_GROUND_CATALOG,
  normalizeEnglandGroundCode,
  type EnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';

export interface Section8GroundDefinition {
  code: string;
  title: string;
  mandatory: boolean;
  legal_basis: string;
  full_text: string;
}

const LEGACY_WORDING_OVERRIDES: Partial<Record<EnglandGroundCode, string>> = {
  '1': 'Not later than the beginning of the tenancy, the landlord gave notice in writing to the tenant that possession might be recovered on this ground or the court is of the opinion that it is just and equitable to dispense with the requirement of notice; and at some time before the beginning of the tenancy, the landlord who is seeking possession or, in the case of joint landlords seeking possession, at least one of them occupied the dwelling-house as his only or principal home; or the landlord who is seeking possession or, in the case of joint landlords seeking possession, at least one of them requires the dwelling-house as his or his spouse\'s only or principal home.',
  '2': 'The dwelling-house is subject to a mortgage granted before the beginning of the tenancy and the mortgagee is entitled to exercise a power of sale conferred on him by the mortgage or by section 101 of the Law of Property Act 1925 and requires possession of the dwelling-house for the purpose of disposing of it with vacant possession in exercise of that power.',
  '4': 'The tenancy is a fixed term tenancy for a term not exceeding twelve months and not later than the beginning of the tenancy the landlord gave notice in writing to the tenant that possession might be recovered on this ground; and at some time within the period of twelve months ending with the beginning of the tenancy, the dwelling-house was let on a tenancy falling within paragraph 8 of Schedule 1 to this Act (student lettings).',
  '5': 'The dwelling-house is held for the purpose of being available for occupation by a minister of religion as a residence from which to perform the duties of his office and not later than the beginning of the tenancy the landlord gave notice in writing to the tenant that possession might be recovered on this ground; and the court is satisfied that the dwelling-house is required for occupation by a minister of religion as such a residence.',
  '6': 'The landlord who is seeking possession or, if that landlord is a registered social landlord or charitable housing trust, a superior landlord intends to demolish or reconstruct the whole or a substantial part of the dwelling-house or to carry out substantial works on the dwelling-house or any part thereof or any building of which it forms part; and the intended work cannot reasonably be carried out without the tenant giving up possession of the dwelling-house.',
  '7': 'The tenancy is a periodic tenancy (including a statutory periodic tenancy) which has devolved under the will or intestacy of the former tenant and the proceedings for the recovery of possession are begun not later than twelve months after the death of the former tenant or, if the court so directs, after the date on which, in the opinion of the court, the landlord or, in the case of joint landlords, any one of them became aware of the former tenant\'s death.',
  '8': 'Both at the date of the service of the notice under section 8 of this Act relating to the proceedings for possession and at the date of the hearing: (a) if rent is payable weekly or fortnightly, at least thirteen weeks\' rent is unpaid; (b) if rent is payable monthly, at least three months\' rent is unpaid; (c) if rent is payable quarterly, at least one quarter\'s rent is more than three months in arrears; and (d) if rent is payable yearly, at least three months\' rent is more than three months in arrears.',
  '9': 'Suitable alternative accommodation is available for the tenant or will be available for him when the order for possession takes effect.',
  '10': 'Some rent lawfully due from the tenant is unpaid on the date on which the proceedings for possession are begun; and except where subsection (1)(b) of section 8 of this Act applies, was in arrears at the date of the service of the notice under that section relating to those proceedings.',
  '11': 'Whether or not any rent is in arrears on the date on which proceedings for possession are begun, the tenant has persistently delayed paying rent which has become lawfully due.',
  '12': 'Any obligation of the tenancy (other than one related to the payment of rent) has been broken or not performed.',
  '13': 'The condition of the dwelling-house or any of the common parts has deteriorated owing to acts of waste by, or the neglect or default of, the tenant or any other person residing in the dwelling-house and, in the case of an act of waste by, or the neglect or default of, a person lodging with the tenant or a sub-tenant of his, the tenant has not taken such steps as he ought reasonably to have taken for the removal of the lodger or sub-tenant.',
  '14': 'The tenant or a person residing in or visiting the dwelling-house: (a) has been guilty of conduct causing or likely to cause a nuisance or annoyance to a person residing, visiting or otherwise engaging in a lawful activity in the locality; or (b) has been convicted of using the dwelling-house or allowing it to be used for immoral or illegal purposes; or (c) has been convicted of an indictable offence committed in, or in the locality of, the dwelling-house.',
  '14A': 'The dwelling-house was occupied (whether alone or with others) by a married couple, a couple who are civil partners of each other, or a couple living together as husband and wife or as if they were civil partners; and one or both of the partners is a tenant of the dwelling-house; and the partner who is not a tenant or, as the case may be, both partners have left the dwelling-house because of violence or threats of violence by the other partner towards that partner or a member of the family of that partner who was residing with that partner immediately before leaving.',
  '15': 'The condition of any furniture provided for use under the tenancy has, in the opinion of the court, deteriorated owing to ill-treatment by the tenant or any other person residing in the dwelling-house and, in the case of ill-treatment by a person lodging with the tenant or by a sub-tenant of his, the tenant has not taken such steps as he ought reasonably to have taken for the removal of the lodger or sub-tenant.',
  '17': 'The tenant is the person, or one of the persons, to whom the tenancy was granted and the landlord was induced to grant the tenancy by a false statement made knowingly or recklessly by the tenant or a person acting at the tenant\'s instigation.',
};

function buildCompatibilityGroundDefinition(code: EnglandGroundCode): Section8GroundDefinition {
  const catalog = ENGLAND_POST_2026_GROUND_CATALOG[code];

  return {
    code,
    title: catalog.title,
    mandatory: catalog.mandatory,
    legal_basis: `Housing Act 1988, Schedule 2, Ground ${code}`,
    full_text:
      LEGACY_WORDING_OVERRIDES[code] ||
      `Ground ${code} - ${catalog.title}. Refer to the current England Form 3A legal wording for the full statutory text.`,
  };
}

export const SECTION8_GROUND_DEFINITIONS: Record<string, Section8GroundDefinition> = Object.fromEntries(
  (Object.keys(ENGLAND_POST_2026_GROUND_CATALOG) as EnglandGroundCode[]).map((code) => [
    code,
    buildCompatibilityGroundDefinition(code),
  ])
);

/**
 * Get the statutory text for a ground code.
 * Handles both numeric and alphanumeric post-2026 ground codes.
 */
export function getSection8StatutoryText(groundCode: number | string): string {
  const normalized = normalizeEnglandGroundCode(groundCode);
  if (!normalized) return '';
  const def = SECTION8_GROUND_DEFINITIONS[normalized];
  return def?.full_text || '';
}

/**
 * Get the full ground definition for a ground code.
 * Handles both numeric and alphanumeric post-2026 ground codes.
 */
export function getSection8GroundDefinition(
  groundCode: number | string
): Section8GroundDefinition | undefined {
  const normalized = normalizeEnglandGroundCode(groundCode);
  if (!normalized) return undefined;
  return SECTION8_GROUND_DEFINITIONS[normalized];
}

/**
 * Enrich a ground object with statutory_text if not already present.
 */
export function enrichGroundWithStatutoryText<T extends { code: number | string; statutory_text?: string }>(
  ground: T
): T & { statutory_text: string } {
  if (ground.statutory_text) {
    return ground as T & { statutory_text: string };
  }

  const def = getSection8GroundDefinition(ground.code);
  return {
    ...ground,
    statutory_text: def?.full_text || '',
  };
}
