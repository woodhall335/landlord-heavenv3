import {
  listEnglandGroundDefinitions,
  type EnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';

export type EnglandGroundSupportStatus = 'full' | 'partial' | 'blocked';

export interface EnglandGroundSupportEntry {
  code: EnglandGroundCode;
  status: EnglandGroundSupportStatus;
  wizardCoverage: string;
  outputCoverage: string[];
  notes?: string;
}

const DEFAULT_OUTPUT_COVERAGE = [
  'Form 3A particulars',
  'N119 particulars',
  'Witness statement narrative',
  'Evidence checklist',
  'Case summary',
];

function makeEntry(
  code: EnglandGroundCode,
  wizardCoverage: string,
  notes?: string,
): EnglandGroundSupportEntry {
  return {
    code,
    status: 'full',
    wizardCoverage,
    outputCoverage: DEFAULT_OUTPUT_COVERAGE,
    notes,
  };
}

export const ENGLAND_GROUND_SUPPORT_STATUS: Record<EnglandGroundCode, EnglandGroundSupportEntry> = {
  '1': makeEntry('1', 'Dedicated occupation panel', 'Timing restriction applies: cannot be used until at least 12 months after the tenancy began.'),
  '1A': makeEntry('1A', 'Dedicated sale panel', 'Timing restriction applies: cannot be used until at least 12 months after the tenancy began.'),
  '2': makeEntry('2', 'Specialist ground panel', 'Relies on specialist mortgagee / sale evidence.'),
  '2ZA': makeEntry('2ZA', 'Specialist ground panel', 'Landlord-profile restriction enforced by the validator.'),
  '2ZB': makeEntry('2ZB', 'Specialist ground panel', 'Relies on superior-lease end evidence.'),
  '2ZC': makeEntry('2ZC', 'Specialist ground panel', 'Relies on superior-landlord / section 18 transition evidence.'),
  '2ZD': makeEntry('2ZD', 'Specialist ground panel', 'Relies on superior-lease end evidence.'),
  '4': makeEntry('4', 'Specialist ground panel', 'Landlord-profile restriction enforced by the validator.'),
  '4A': makeEntry('4A', 'Specialist ground panel', 'Requires prior notice / tenancy-start prerequisite confirmation.'),
  '5': makeEntry('5', 'Specialist ground panel', 'Landlord-profile restriction enforced by the validator.'),
  '5A': makeEntry('5A', 'Specialist ground panel', 'Landlord-profile restriction enforced by the validator.'),
  '5B': makeEntry('5B', 'Specialist ground panel'),
  '5C': makeEntry('5C', 'Specialist ground panel', 'Landlord-profile restriction enforced by the validator.'),
  '5E': makeEntry('5E', 'Specialist ground panel', 'Landlord-profile restriction enforced by the validator.'),
  '5F': makeEntry('5F', 'Specialist ground panel', 'Landlord-profile restriction enforced by the validator.'),
  '5G': makeEntry('5G', 'Specialist ground panel', 'Landlord-profile restriction enforced by the validator.'),
  '5H': makeEntry('5H', 'Specialist ground panel'),
  '6': makeEntry('6', 'Dedicated redevelopment panel'),
  '6B': makeEntry('6B', 'Dedicated redevelopment / enforcement panel'),
  '7': makeEntry('7', 'Specialist ground panel', 'Relies on death / succession evidence.'),
  '7A': makeEntry('7A', 'Breach / conduct panel', 'Immediate-application route is reflected in notice-period and court-readiness guidance.'),
  '7B': makeEntry('7B', 'Dedicated right-to-rent panel'),
  '8': makeEntry('8', 'Arrears schedule + Section 8 particulars panel', 'Ground 8 threshold is validated against the post-1 May 2026 arrears rule.'),
  '9': makeEntry('9', 'Dedicated alternative-accommodation panel'),
  '10': makeEntry('10', 'Arrears schedule + Section 8 particulars panel'),
  '11': makeEntry('11', 'Arrears schedule + Section 8 particulars panel'),
  '12': makeEntry('12', 'Breach / conduct panel'),
  '13': makeEntry('13', 'Breach / conduct panel'),
  '14': makeEntry('14', 'Breach / conduct panel', 'Immediate-application route is reflected in notice-period and court-readiness guidance.'),
  '14A': makeEntry('14A', 'Breach / conduct panel'),
  '14ZA': makeEntry('14ZA', 'Breach / conduct panel'),
  '15': makeEntry('15', 'Breach / conduct panel'),
  '17': makeEntry('17', 'Breach / conduct panel'),
  '18': makeEntry('18', 'Specialist ground panel', 'Landlord-profile restriction enforced by the validator.'),
};

export function getEnglandGroundSupportEntry(
  code: string | number,
): EnglandGroundSupportEntry | null {
  const normalizedCode = String(code).trim().toUpperCase() as EnglandGroundCode;
  return ENGLAND_GROUND_SUPPORT_STATUS[normalizedCode] || null;
}

export function listEnglandGroundSupportEntries(): EnglandGroundSupportEntry[] {
  return listEnglandGroundDefinitions().map((definition) => ENGLAND_GROUND_SUPPORT_STATUS[definition.code]);
}
