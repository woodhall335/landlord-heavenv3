export type EnglandLandlordProfile =
  | 'private_landlord'
  | 'private_registered_provider'
  | 'supported_accommodation_provider'
  | 'agricultural_landlord'
  | 'local_authority_owned_company'
  | 'university_or_college'
  | 'minister_of_religion_housing'
  | 'employer_landlord';

export type EnglandGroundCode =
  | '1'
  | '1A'
  | '2'
  | '2ZA'
  | '2ZB'
  | '2ZC'
  | '2ZD'
  | '4'
  | '4A'
  | '5'
  | '5A'
  | '5B'
  | '5C'
  | '5E'
  | '5F'
  | '5G'
  | '5H'
  | '6'
  | '6B'
  | '7'
  | '7A'
  | '7B'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '14A'
  | '14ZA'
  | '15'
  | '17'
  | '18';

export type EnglandCommonReasonKey =
  | 'rent_arrears_serious'
  | 'rent_arrears_other'
  | 'use_or_sale'
  | 'students_or_workers'
  | 'redevelopment'
  | 'asb_or_legal_breach'
  | 'tenancy_breach'
  | 'deterioration'
  | 'no_right_to_rent'
  | 'other';

export type EnglandCourtClaimPath =
  | 'paper_possession'
  | 'rent_only_pcol_or_paper'
  | 'immediate_application_allowed';

export interface EnglandGroundDefinition {
  code: EnglandGroundCode;
  title: string;
  mandatory: boolean;
  noticePeriodDays: number;
  noticePeriodMonths?: number;
  noticePeriodLabel: string;
  commonReason: EnglandCommonReasonKey;
  courtClaimPath: EnglandCourtClaimPath;
  immediateApplicationAllowed?: boolean;
  requiresPriorNotice?: boolean;
  earliestUseAfterTenancyMonths?: number;
  landlordProfiles?: EnglandLandlordProfile[];
  evidenceCategories: string[];
}

export const ENGLAND_POST_2026_GROUND_CATALOG: Record<EnglandGroundCode, EnglandGroundDefinition> = {
  '1': {
    code: '1',
    title: 'Occupation by landlord or family',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'use_or_sale',
    courtClaimPath: 'paper_possession',
    earliestUseAfterTenancyMonths: 12,
    evidenceCategories: ['tenancy timing', 'identity/relationship proof', 'occupation intention statement'],
  },
  '1A': {
    code: '1A',
    title: 'Sale of dwelling house',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'use_or_sale',
    courtClaimPath: 'paper_possession',
    earliestUseAfterTenancyMonths: 12,
    evidenceCategories: ['ownership proof', 'sale intention statement', 'sale evidence'],
  },
  '2': {
    code: '2',
    title: 'Sale by mortgagee',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['mortgage documents', 'lender demand/sale evidence'],
  },
  '2ZA': {
    code: '2ZA',
    title: 'Possession when superior lease ends',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    landlordProfiles: [
      'private_registered_provider',
      'supported_accommodation_provider',
      'agricultural_landlord',
      'local_authority_owned_company',
    ],
    evidenceCategories: ['superior tenancy documents', 'termination/expiry evidence', 'landlord status evidence'],
  },
  '2ZB': {
    code: '2ZB',
    title: 'Possession when superior lease ends',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['superior tenancy documents', 'termination/expiry evidence'],
  },
  '2ZC': {
    code: '2ZC',
    title: 'Possession by superior landlord',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['section 18 landlord-change proof', 'previous landlord status evidence'],
  },
  '2ZD': {
    code: '2ZD',
    title: 'Possession by superior landlord',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['section 18 landlord-change proof', 'superior lease end evidence'],
  },
  '4': {
    code: '4',
    title: 'Student accommodation',
    mandatory: true,
    noticePeriodDays: 14,
    noticePeriodLabel: '2 weeks',
    commonReason: 'students_or_workers',
    courtClaimPath: 'paper_possession',
    landlordProfiles: ['university_or_college'],
    evidenceCategories: ['student accommodation status', 'prior student letting evidence'],
  },
  '4A': {
    code: '4A',
    title: 'Student accommodation for occupation by students',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'students_or_workers',
    courtClaimPath: 'paper_possession',
    requiresPriorNotice: true,
    evidenceCategories: ['HMO/student status evidence', 'prior notice statement', 'academic year timing evidence'],
  },
  '5': {
    code: '5',
    title: 'Ministers of religion',
    mandatory: true,
    noticePeriodDays: 61,
    noticePeriodMonths: 2,
    noticePeriodLabel: '2 months',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    landlordProfiles: ['minister_of_religion_housing'],
    evidenceCategories: ['religious housing status', 'need for minister occupation'],
  },
  '5A': {
    code: '5A',
    title: 'Occupation by agricultural worker',
    mandatory: true,
    noticePeriodDays: 61,
    noticePeriodMonths: 2,
    noticePeriodLabel: '2 months',
    commonReason: 'students_or_workers',
    courtClaimPath: 'paper_possession',
    landlordProfiles: ['agricultural_landlord'],
    evidenceCategories: ['agricultural employment need', 'housing link evidence'],
  },
  '5B': {
    code: '5B',
    title: 'Occupation by person who meets employment requirements',
    mandatory: true,
    noticePeriodDays: 61,
    noticePeriodMonths: 2,
    noticePeriodLabel: '2 months',
    commonReason: 'students_or_workers',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['employment requirements evidence', 'replacement occupier evidence'],
  },
  '5C': {
    code: '5C',
    title: 'End of employment by landlord',
    mandatory: true,
    noticePeriodDays: 61,
    noticePeriodMonths: 2,
    noticePeriodLabel: '2 months',
    commonReason: 'students_or_workers',
    courtClaimPath: 'paper_possession',
    landlordProfiles: ['employer_landlord'],
    evidenceCategories: ['employment link evidence', 'employment end evidence'],
  },
  '5E': {
    code: '5E',
    title: 'Occupation as supported accommodation',
    mandatory: true,
    noticePeriodDays: 28,
    noticePeriodLabel: '4 weeks',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    landlordProfiles: ['supported_accommodation_provider'],
    evidenceCategories: ['supported accommodation status', 'support plan / occupancy evidence'],
  },
  '5F': {
    code: '5F',
    title: 'Dwelling-house occupied as supported accommodation',
    mandatory: true,
    noticePeriodDays: 28,
    noticePeriodLabel: '4 weeks',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    landlordProfiles: ['supported_accommodation_provider'],
    evidenceCategories: ['supported accommodation status', 'occupancy evidence'],
  },
  '5G': {
    code: '5G',
    title: 'Tenancy granted for homelessness',
    mandatory: true,
    noticePeriodDays: 28,
    noticePeriodLabel: '4 weeks',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    landlordProfiles: ['private_registered_provider', 'local_authority_owned_company'],
    evidenceCategories: ['homelessness nomination evidence', 'scheme eligibility evidence'],
  },
  '5H': {
    code: '5H',
    title: 'Occupation as stepping stone accommodation',
    mandatory: true,
    noticePeriodDays: 61,
    noticePeriodMonths: 2,
    noticePeriodLabel: '2 months',
    commonReason: 'students_or_workers',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['stepping stone scheme evidence', 'eligibility criteria evidence'],
  },
  '6': {
    code: '6',
    title: 'Redevelopment',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'redevelopment',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['works/planning evidence', 'contractor or programme evidence', 'statement why possession is required'],
  },
  '6B': {
    code: '6B',
    title: 'Compliance with enforcement action',
    mandatory: true,
    noticePeriodDays: 122,
    noticePeriodMonths: 4,
    noticePeriodLabel: '4 months',
    commonReason: 'asb_or_legal_breach',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['enforcement notice/order', 'compliance evidence'],
  },
  '7': {
    code: '7',
    title: 'Death of tenant',
    mandatory: true,
    noticePeriodDays: 61,
    noticePeriodMonths: 2,
    noticePeriodLabel: '2 months',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['death certificate', 'succession/probate evidence'],
  },
  '7A': {
    code: '7A',
    title: 'Severe antisocial or criminal behaviour',
    mandatory: true,
    noticePeriodDays: 0,
    noticePeriodLabel: 'Immediate application',
    commonReason: 'asb_or_legal_breach',
    courtClaimPath: 'immediate_application_allowed',
    immediateApplicationAllowed: true,
    evidenceCategories: ['conviction/order evidence', 'police/court records'],
  },
  '7B': {
    code: '7B',
    title: 'No right to rent',
    mandatory: true,
    noticePeriodDays: 14,
    noticePeriodLabel: '2 weeks',
    commonReason: 'no_right_to_rent',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['Home Office notice'],
  },
  '8': {
    code: '8',
    title: 'Rent arrears',
    mandatory: true,
    noticePeriodDays: 28,
    noticePeriodLabel: '4 weeks',
    commonReason: 'rent_arrears_serious',
    courtClaimPath: 'rent_only_pcol_or_paper',
    evidenceCategories: ['rent ledger', 'arrears schedule', 'bank statements'],
  },
  '9': {
    code: '9',
    title: 'Suitable alternative accommodation',
    mandatory: false,
    noticePeriodDays: 61,
    noticePeriodMonths: 2,
    noticePeriodLabel: '2 months',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['alternative accommodation details', 'suitability and affordability evidence'],
  },
  '10': {
    code: '10',
    title: 'Any rent arrears',
    mandatory: false,
    noticePeriodDays: 28,
    noticePeriodLabel: '4 weeks',
    commonReason: 'rent_arrears_other',
    courtClaimPath: 'rent_only_pcol_or_paper',
    evidenceCategories: ['rent ledger', 'arrears schedule'],
  },
  '11': {
    code: '11',
    title: 'Persistent arrears',
    mandatory: false,
    noticePeriodDays: 28,
    noticePeriodLabel: '4 weeks',
    commonReason: 'rent_arrears_other',
    courtClaimPath: 'rent_only_pcol_or_paper',
    evidenceCategories: ['payment history pattern', 'rent ledger'],
  },
  '12': {
    code: '12',
    title: 'Breach of tenancy',
    mandatory: false,
    noticePeriodDays: 14,
    noticePeriodLabel: '2 weeks',
    commonReason: 'tenancy_breach',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['tenancy clause', 'breach evidence', 'warning correspondence'],
  },
  '13': {
    code: '13',
    title: 'Deterioration of property',
    mandatory: false,
    noticePeriodDays: 14,
    noticePeriodLabel: '2 weeks',
    commonReason: 'deterioration',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['photos', 'inventory/check-in report', 'repair quotes'],
  },
  '14': {
    code: '14',
    title: 'Antisocial behaviour',
    mandatory: false,
    noticePeriodDays: 0,
    noticePeriodLabel: 'Immediate application',
    commonReason: 'asb_or_legal_breach',
    courtClaimPath: 'immediate_application_allowed',
    immediateApplicationAllowed: true,
    evidenceCategories: ['complaints log', 'witness statements', 'police/council evidence'],
  },
  '14A': {
    code: '14A',
    title: 'Domestic abuse',
    mandatory: false,
    noticePeriodDays: 14,
    noticePeriodLabel: '2 weeks',
    commonReason: 'asb_or_legal_breach',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['domestic abuse evidence', 'occupier departure evidence'],
  },
  '14ZA': {
    code: '14ZA',
    title: 'Rioting',
    mandatory: false,
    noticePeriodDays: 14,
    noticePeriodLabel: '2 weeks',
    commonReason: 'asb_or_legal_breach',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['conviction evidence'],
  },
  '15': {
    code: '15',
    title: 'Deterioration of furniture',
    mandatory: false,
    noticePeriodDays: 14,
    noticePeriodLabel: '2 weeks',
    commonReason: 'deterioration',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['inventory', 'photos', 'repair/replacement evidence'],
  },
  '17': {
    code: '17',
    title: 'False statement',
    mandatory: false,
    noticePeriodDays: 14,
    noticePeriodLabel: '2 weeks',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    evidenceCategories: ['application/reference evidence', 'proof statement was false'],
  },
  '18': {
    code: '18',
    title: 'Supported accommodation',
    mandatory: false,
    noticePeriodDays: 28,
    noticePeriodLabel: '4 weeks',
    commonReason: 'other',
    courtClaimPath: 'paper_possession',
    landlordProfiles: ['supported_accommodation_provider'],
    evidenceCategories: ['supported accommodation status', 'scheme evidence'],
  },
};

const FORM3A_COMMON_REASON_ORDER: EnglandCommonReasonKey[] = [
  'rent_arrears_serious',
  'rent_arrears_other',
  'use_or_sale',
  'students_or_workers',
  'redevelopment',
  'asb_or_legal_breach',
  'tenancy_breach',
  'deterioration',
  'no_right_to_rent',
  'other',
];

export function normalizeEnglandGroundCode(code: string | number): EnglandGroundCode | null {
  const raw = String(code).toUpperCase().trim();
  const stripped = raw.replace(/^GROUND[\s_]*/i, '').trim();
  const directCandidate = stripped.split(/\s*[-–—:]\s*/, 1)[0]?.trim() || stripped;

  if (directCandidate in ENGLAND_POST_2026_GROUND_CATALOG) {
    return directCandidate as EnglandGroundCode;
  }

  const matchedPrefix = stripped.match(/^(\d+[A-Z]*)\b/);
  if (matchedPrefix) {
    const candidate = matchedPrefix[1] as EnglandGroundCode;
    if (candidate in ENGLAND_POST_2026_GROUND_CATALOG) {
      return candidate;
    }
  }

  return null;
}

export function getEnglandGroundDefinition(code: string | number): EnglandGroundDefinition | null {
  const normalized = normalizeEnglandGroundCode(code);
  return normalized ? ENGLAND_POST_2026_GROUND_CATALOG[normalized] : null;
}

function compareEnglandGroundCodes(left: EnglandGroundCode, right: EnglandGroundCode): number {
  const leftMatch = left.match(/^(\d+)([A-Z]*)$/i);
  const rightMatch = right.match(/^(\d+)([A-Z]*)$/i);

  if (!leftMatch || !rightMatch) {
    return left.localeCompare(right);
  }

  const leftNumber = Number.parseInt(leftMatch[1], 10);
  const rightNumber = Number.parseInt(rightMatch[1], 10);

  if (leftNumber !== rightNumber) {
    return leftNumber - rightNumber;
  }

  const leftSuffix = (leftMatch[2] || '').toUpperCase();
  const rightSuffix = (rightMatch[2] || '').toUpperCase();

  if (leftSuffix === rightSuffix) {
    return 0;
  }

  if (!leftSuffix) return -1;
  if (!rightSuffix) return 1;

  return leftSuffix.localeCompare(rightSuffix);
}

export function listEnglandGroundDefinitions(): EnglandGroundDefinition[] {
  return Object.values(ENGLAND_POST_2026_GROUND_CATALOG).sort((left, right) =>
    compareEnglandGroundCodes(left.code, right.code),
  );
}

export function getEnglandGroundNoticePeriodDays(code: string | number): number {
  return getEnglandGroundDefinition(code)?.noticePeriodDays ?? 14;
}

export function calculateEnglandPossessionNoticePeriod(
  grounds: Array<string | number>,
): {
  noticePeriodDays: number;
  drivingGrounds: EnglandGroundCode[];
  immediateApplicationAllowed: boolean;
} {
  const normalized = grounds
    .map((ground) => normalizeEnglandGroundCode(ground))
    .filter((ground): ground is EnglandGroundCode => Boolean(ground));

  if (normalized.length === 0) {
    return { noticePeriodDays: 14, drivingGrounds: [], immediateApplicationAllowed: false };
  }

  const periods = normalized.map((code) => ({
    code,
    days: ENGLAND_POST_2026_GROUND_CATALOG[code].noticePeriodDays,
  }));
  const maxDays = Math.max(...periods.map((entry) => entry.days));

  return {
    noticePeriodDays: maxDays,
    drivingGrounds: periods.filter((entry) => entry.days === maxDays).map((entry) => entry.code),
    immediateApplicationAllowed: periods.some((entry) => entry.days === 0),
  };
}

export function hasEnglandRentArrearsGround(grounds: Array<string | number>): boolean {
  return grounds.some((ground) => ['8', '10', '11'].includes(normalizeEnglandGroundCode(ground) || ''));
}

export function isEnglandRentOnlyClaimEligible(grounds: Array<string | number>): boolean {
  const normalized = grounds
    .map((ground) => normalizeEnglandGroundCode(ground))
    .filter((ground): ground is EnglandGroundCode => Boolean(ground));

  return normalized.length > 0 && normalized.every((ground) => ['8', '10', '11'].includes(ground));
}

export function getEnglandCommonReasonCheckboxes(
  grounds: Array<string | number>,
): Record<EnglandCommonReasonKey, boolean> {
  const selectedReasons = new Set(
    grounds
      .map((ground) => getEnglandGroundDefinition(ground)?.commonReason)
      .filter((reason): reason is EnglandCommonReasonKey => Boolean(reason)),
  );

  return FORM3A_COMMON_REASON_ORDER.reduce(
    (acc, reason) => {
      acc[reason] = selectedReasons.has(reason);
      return acc;
    },
    {} as Record<EnglandCommonReasonKey, boolean>,
  );
}
