/**
 * Section 8 Ground Definitions - Single Source of Truth
 *
 * Contains the official statutory text from Schedule 2 of the Housing Act 1988
 * for all Section 8 grounds. This module is shared between:
 * - src/lib/case-facts/normalize.ts (preview generation via mapNoticeOnlyFacts)
 * - src/lib/documents/section8-generator.ts (direct notice generation)
 * - src/lib/documents/eviction-pack-generator.ts (eviction pack generation)
 *
 * Form 3 requirement: "Give the full text (as set out in Schedule 2 of the
 * Housing Act 1988 (as amended)) of each ground which is being relied on."
 */

export interface Section8GroundDefinition {
  code: number;
  title: string;
  mandatory: boolean;
  legal_basis: string;
  full_text: string;
}

/**
 * Official Section 8 ground definitions with full statutory text
 * from Schedule 2 of the Housing Act 1988 (as amended).
 *
 * Note: Ground 14A uses string key '14A' as it's a sub-ground.
 */
export const SECTION8_GROUND_DEFINITIONS: Record<number | string, Section8GroundDefinition> = {
  1: {
    code: 1,
    title: 'Landlord previously occupied as only or principal home',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 1',
    full_text: 'Not later than the beginning of the tenancy, the landlord gave notice in writing to the tenant that possession might be recovered on this ground or the court is of the opinion that it is just and equitable to dispense with the requirement of notice; and at some time before the beginning of the tenancy, the landlord who is seeking possession or, in the case of joint landlords seeking possession, at least one of them occupied the dwelling-house as his only or principal home; or the landlord who is seeking possession or, in the case of joint landlords seeking possession, at least one of them requires the dwelling-house as his or his spouse\'s only or principal home.',
  },
  2: {
    code: 2,
    title: 'Mortgage lender requires possession',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 2',
    full_text: 'The dwelling-house is subject to a mortgage granted before the beginning of the tenancy and the mortgagee is entitled to exercise a power of sale conferred on him by the mortgage or by section 101 of the Law of Property Act 1925 and requires possession of the dwelling-house for the purpose of disposing of it with vacant possession in exercise of that power.',
  },
  3: {
    code: 3,
    title: 'Out of season holiday letting',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 3',
    full_text: 'The tenancy is a fixed term tenancy for a term not exceeding eight months and not later than the beginning of the tenancy the landlord gave notice in writing to the tenant that possession might be recovered on this ground; and at some time within the period of twelve months ending with the beginning of the tenancy, the dwelling-house was occupied under a right to occupy it for a holiday.',
  },
  4: {
    code: 4,
    title: 'Out of season student letting',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 4',
    full_text: 'The tenancy is a fixed term tenancy for a term not exceeding twelve months and not later than the beginning of the tenancy the landlord gave notice in writing to the tenant that possession might be recovered on this ground; and at some time within the period of twelve months ending with the beginning of the tenancy, the dwelling-house was let on a tenancy falling within paragraph 8 of Schedule 1 to this Act (student lettings).',
  },
  5: {
    code: 5,
    title: 'Property required for minister of religion',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 5',
    full_text: 'The dwelling-house is held for the purpose of being available for occupation by a minister of religion as a residence from which to perform the duties of his office and not later than the beginning of the tenancy the landlord gave notice in writing to the tenant that possession might be recovered on this ground; and the court is satisfied that the dwelling-house is required for occupation by a minister of religion as such a residence.',
  },
  6: {
    code: 6,
    title: 'Intention to demolish or reconstruct',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 6',
    full_text: 'The landlord who is seeking possession or, if that landlord is a registered social landlord or charitable housing trust, a superior landlord intends to demolish or reconstruct the whole or a substantial part of the dwelling-house or to carry out substantial works on the dwelling-house or any part thereof or any building of which it forms part; and the intended work cannot reasonably be carried out without the tenant giving up possession of the dwelling-house.',
  },
  7: {
    code: 7,
    title: 'Death of periodic tenant (within 12 months)',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 7',
    full_text: 'The tenancy is a periodic tenancy (including a statutory periodic tenancy) which has devolved under the will or intestacy of the former tenant and the proceedings for the recovery of possession are begun not later than twelve months after the death of the former tenant or, if the court so directs, after the date on which, in the opinion of the court, the landlord or, in the case of joint landlords, any one of them became aware of the former tenant\'s death.',
  },
  8: {
    code: 8,
    title: 'Serious rent arrears (at least 8 weeks or 2 months)',
    mandatory: true,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
    full_text: 'Both at the date of the service of the notice under section 8 of this Act relating to the proceedings for possession and at the date of the hearing: (a) if rent is payable weekly or fortnightly, at least eight weeks\' rent is unpaid; (b) if rent is payable monthly, at least two months\' rent is unpaid; (c) if rent is payable quarterly, at least one quarter\'s rent is more than three months in arrears; and (d) if rent is payable yearly, at least three months\' rent is more than three months in arrears.',
  },
  9: {
    code: 9,
    title: 'Suitable alternative accommodation available',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 9',
    full_text: 'Suitable alternative accommodation is available for the tenant or will be available for him when the order for possession takes effect.',
  },
  10: {
    code: 10,
    title: 'Some rent arrears (unpaid at notice and hearing)',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 10',
    full_text: 'Some rent lawfully due from the tenant is unpaid on the date on which the proceedings for possession are begun; and except where subsection (1)(b) of section 8 of this Act applies, was in arrears at the date of the service of the notice under that section relating to those proceedings.',
  },
  11: {
    code: 11,
    title: 'Persistent delay in paying rent',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 11',
    full_text: 'Whether or not any rent is in arrears on the date on which proceedings for possession are begun, the tenant has persistently delayed paying rent which has become lawfully due.',
  },
  12: {
    code: 12,
    title: 'Breach of tenancy obligation',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 12',
    full_text: 'Any obligation of the tenancy (other than one related to the payment of rent) has been broken or not performed.',
  },
  13: {
    code: 13,
    title: 'Deterioration of dwelling',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 13',
    full_text: 'The condition of the dwelling-house or any of the common parts has deteriorated owing to acts of waste by, or the neglect or default of, the tenant or any other person residing in the dwelling-house and, in the case of an act of waste by, or the neglect or default of, a person lodging with the tenant or a sub-tenant of his, the tenant has not taken such steps as he ought reasonably to have taken for the removal of the lodger or sub-tenant.',
  },
  14: {
    code: 14,
    title: 'Nuisance or annoyance to neighbours',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 14',
    full_text: 'The tenant or a person residing in or visiting the dwelling-house: (a) has been guilty of conduct causing or likely to cause a nuisance or annoyance to a person residing, visiting or otherwise engaging in a lawful activity in the locality; or (b) has been convicted of using the dwelling-house or allowing it to be used for immoral or illegal purposes; or (c) has been convicted of an indictable offence committed in, or in the locality of, the dwelling-house.',
  },
  '14A': {
    code: 14,
    title: 'Domestic violence',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 14A',
    full_text: 'The dwelling-house was occupied (whether alone or with others) by a married couple, a couple who are civil partners of each other, or a couple living together as husband and wife or as if they were civil partners; and one or both of the partners is a tenant of the dwelling-house; and the partner who is not a tenant or, as the case may be, both partners have left the dwelling-house because of violence or threats of violence by the other partner towards that partner or a member of the family of that partner who was residing with that partner immediately before leaving.',
  },
  15: {
    code: 15,
    title: 'Deterioration of furniture',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 15',
    full_text: 'The condition of any furniture provided for use under the tenancy has, in the opinion of the court, deteriorated owing to ill-treatment by the tenant or any other person residing in the dwelling-house and, in the case of ill-treatment by a person lodging with the tenant or by a sub-tenant of his, the tenant has not taken such steps as he ought reasonably to have taken for the removal of the lodger or sub-tenant.',
  },
  16: {
    code: 16,
    title: 'Former employee of landlord',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 16',
    full_text: 'The dwelling-house was let to the tenant in consequence of his employment by the landlord seeking possession or a previous landlord under the tenancy and the tenant has ceased to be in that employment.',
  },
  17: {
    code: 17,
    title: 'False statement induced grant of tenancy',
    mandatory: false,
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 17',
    full_text: 'The tenant is the person, or one of the persons, to whom the tenancy was granted and the landlord was induced to grant the tenancy by a false statement made knowingly or recklessly by the tenant or a person acting at the tenant\'s instigation.',
  },
};

/**
 * Get the statutory text for a ground code.
 * Handles both numeric codes and string codes (e.g., '14A').
 */
export function getSection8StatutoryText(groundCode: number | string): string {
  const def = SECTION8_GROUND_DEFINITIONS[groundCode];
  return def?.full_text || '';
}

/**
 * Get the full ground definition for a ground code.
 * Handles both numeric codes and string codes (e.g., '14A').
 */
export function getSection8GroundDefinition(groundCode: number | string): Section8GroundDefinition | undefined {
  return SECTION8_GROUND_DEFINITIONS[groundCode];
}

/**
 * Enrich a ground object with statutory_text if not already present.
 * This is used to ensure all generation paths include statutory text.
 */
export function enrichGroundWithStatutoryText<T extends { code: number; statutory_text?: string }>(
  ground: T
): T & { statutory_text: string } {
  if (ground.statutory_text) {
    return ground as T & { statutory_text: string };
  }

  const def = SECTION8_GROUND_DEFINITIONS[ground.code];
  return {
    ...ground,
    statutory_text: def?.full_text || '',
  };
}
