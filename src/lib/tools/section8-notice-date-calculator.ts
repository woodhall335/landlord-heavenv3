import {
  calculateDeemedServiceDate,
  calculateSection8ExpiryDate,
  formatDateUK,
  type ServiceMethod,
} from '@/lib/documents/notice-date-calculator';
import {
  getEnglandGroundDefinition,
  type EnglandCommonReasonKey,
  type EnglandGroundCode,
  type EnglandGroundDefinition,
} from '@/lib/england-possession/ground-catalog';

export type Section8NoticeProblem =
  | 'serious_arrears'
  | 'some_arrears'
  | 'tenancy_breach'
  | 'sale'
  | 'landlord_family'
  | 'antisocial_behaviour'
  | 'property_condition'
  | 'right_to_rent'
  | 'other';

export type Section8NoticeStatus = 'not_served' | 'served_waiting' | 'expired_tenant_still_there';

export interface Section8NoticeDateInput {
  problem: Section8NoticeProblem;
  groundCodes: EnglandGroundCode[];
  actionDate: string;
  serviceMethod: ServiceMethod;
  tenancyStartDate?: string;
  noticeStatus: Section8NoticeStatus;
}

export interface Section8NoticeDateResult {
  selectedGrounds: EnglandGroundDefinition[];
  deemedServiceDate: string;
  earliestCourtDate: string;
  noticePeriodDays: number;
  noticePeriodLabel: string;
  explanation: string;
  groundAvailability: Section8GroundAvailability[];
  blockingIssues: Section8BlockingIssue[];
  evidenceChecklist: string[];
  warnings: string[];
  nextStep: {
    label: string;
    href: string;
    productName: string;
    description: string;
    paidIncludes: string[];
  };
  secondaryActions: Array<{ label: string; href: string }>;
  hasImmediateApplicationGround: boolean;
}

export type Section8GroundAvailabilityStatus = 'available' | 'not_currently_available' | 'needs_review';

export interface Section8GroundAvailability {
  groundCode: EnglandGroundCode;
  groundTitle: string;
  status: Section8GroundAvailabilityStatus;
  statusLabel: 'Available' | 'Not currently available' | 'Needs review';
  earliestGroundExpiryDate?: string;
  currentNoticeExpiryDate: string;
  message: string;
}

export interface Section8BlockingIssue {
  code: 'SECTION_8_BLOCKED';
  groundCode: EnglandGroundCode;
  groundTitle: string;
  message: string;
  tenancyStartDate: string;
  earliestGroundExpiryDate: string;
  currentNoticeExpiryDate: string;
  action: string;
}

export const SECTION8_NOTICE_PROBLEM_OPTIONS: Array<{
  id: Section8NoticeProblem;
  label: string;
  description: string;
  defaultGrounds: EnglandGroundCode[];
}> = [
  {
    id: 'serious_arrears',
    label: 'Tenant owes serious rent arrears',
    description: 'Usually Ground 8, with rent arrears backup grounds where useful.',
    defaultGrounds: ['8', '10', '11'],
  },
  {
    id: 'some_arrears',
    label: 'Tenant owes rent or keeps paying late',
    description: 'Usually discretionary rent arrears grounds.',
    defaultGrounds: ['10', '11'],
  },
  {
    id: 'tenancy_breach',
    label: 'Tenant has breached the tenancy',
    description: 'For non-rent breaches such as unauthorised occupiers or other clause breaches.',
    defaultGrounds: ['12'],
  },
  {
    id: 'sale',
    label: 'I need to sell the property',
    description: 'For the England sale ground where the timing rules fit.',
    defaultGrounds: ['1A'],
  },
  {
    id: 'landlord_family',
    label: 'I or family need to move in',
    description: 'For occupation by the landlord or family where the timing rules fit.',
    defaultGrounds: ['1'],
  },
  {
    id: 'antisocial_behaviour',
    label: 'Anti-social behaviour or serious conduct',
    description: 'For conduct issues where evidence and seriousness matter.',
    defaultGrounds: ['14'],
  },
  {
    id: 'property_condition',
    label: 'Damage or deterioration',
    description: 'For property or furniture deterioration grounds.',
    defaultGrounds: ['13', '15'],
  },
  {
    id: 'right_to_rent',
    label: 'No right to rent',
    description: 'For Home Office right-to-rent cases.',
    defaultGrounds: ['7B'],
  },
  {
    id: 'other',
    label: 'Something else',
    description: 'Start with a general breach route, then check the grounds properly.',
    defaultGrounds: ['12'],
  },
];

export const SECTION8_NOTICE_GROUND_OPTIONS: EnglandGroundCode[] = [
  '8',
  '10',
  '11',
  '12',
  '1',
  '1A',
  '14',
  '13',
  '15',
  '7B',
  '6',
  '9',
  '17',
];

export const SECTION8_SERVICE_METHOD_OPTIONS: Array<{
  id: ServiceMethod;
  label: string;
  helper: string;
}> = [
  {
    id: 'hand_delivery',
    label: 'Hand delivery',
    helper: 'Treated as served the same day for this calculator.',
  },
  {
    id: 'leaving_at_property',
    label: 'Left at the property',
    helper: 'Treated as served the same day for this calculator.',
  },
  {
    id: 'first_class_post',
    label: 'First class post',
    helper: 'Allows two working days for deemed service.',
  },
  {
    id: 'second_class_post',
    label: 'Second class post',
    helper: 'Allows two working days for deemed service in this calculator.',
  },
  {
    id: 'recorded_delivery',
    label: 'Recorded delivery',
    helper: 'Allows two working days for deemed service.',
  },
];

const COMMON_REASON_EVIDENCE: Partial<Record<EnglandCommonReasonKey, string[]>> = {
  rent_arrears_serious: [
    'Up-to-date rent schedule showing each payment due and received',
    'Bank statements or ledger evidence supporting the arrears figure',
    'Tenancy agreement showing rent amount and payment frequency',
  ],
  rent_arrears_other: [
    'Rent ledger or payment history showing missed or late rent',
    'Copies of rent reminders, payment-plan messages, or arrears correspondence',
  ],
  use_or_sale: [
    'Evidence of sale or occupation intention',
    'Tenancy start date and any timing facts affecting the ground',
  ],
  asb_or_legal_breach: [
    'Incident log with dates, times, and what happened',
    'Witness, police, council, or complaint evidence where available',
  ],
  tenancy_breach: [
    'The tenancy clause relied on',
    'Evidence showing how the clause was breached',
    'Warning letters or messages already sent to the tenant',
  ],
  deterioration: [
    'Photographs, inventory records, and inspection notes',
    'Repair or replacement estimates where available',
  ],
  no_right_to_rent: ['Home Office notice or right-to-rent evidence'],
};

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateOnly(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addCalendarMonths(value: string, months: number): string {
  const result = parseDateOnly(value);
  const originalDay = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months);

  if (result.getUTCDate() < originalDay) {
    result.setUTCDate(0);
  }

  return toDateOnly(result);
}

function formatDateLabel(value: string): string {
  return parseDateOnly(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function compareDateOnly(left: string, right: string): number {
  const leftTime = parseDateOnly(left).getTime();
  const rightTime = parseDateOnly(right).getTime();
  return leftTime === rightTime ? 0 : leftTime < rightTime ? -1 : 1;
}

function polishEvidenceLabel(item: string): string {
  const polished: Record<string, string> = {
    'ownership proof': 'Proof of ownership of the property',
    'sale intention statement': 'Statement confirming the genuine intention to sell',
    'sale evidence': 'Supporting sale evidence, such as estate agent instruction, valuation, marketing plan, or sale preparation records',
  };

  return polished[item] || item;
}

function buildNoticePeriodLabel(days: number, grounds: EnglandGroundDefinition[]): string {
  const monthGround = grounds.find((ground) => ground.noticePeriodMonths && ground.noticePeriodDays === days);

  if (monthGround?.noticePeriodLabel) {
    return monthGround.noticePeriodLabel;
  }

  const matchingLabel = grounds.find((ground) => ground.noticePeriodDays === days)?.noticePeriodLabel;
  if (matchingLabel) {
    return matchingLabel;
  }

  if (days === 0) return 'Immediate application';
  if (days % 7 === 0) return `${days / 7} week${days === 7 ? '' : 's'}`;
  return `${days} days`;
}

function buildEvidenceChecklist(grounds: EnglandGroundDefinition[]): string[] {
  const evidence = grounds.flatMap((ground) => [
    ...ground.evidenceCategories,
    ...(COMMON_REASON_EVIDENCE[ground.commonReason] || []),
  ]);

  return unique([
    'Completed Form 3A notice with the same grounds and dates used in your file',
    'Proof of service plan, plus N215 certificate of service if the case later goes to court',
    ...evidence.map(polishEvidenceLabel),
    'Short case summary explaining what has happened and what the landlord wants next',
  ]).slice(0, 9);
}

function buildGroundAvailability(
  input: Section8NoticeDateInput,
  grounds: EnglandGroundDefinition[],
  calculatedNoticeExpiryDate: string,
): { groundAvailability: Section8GroundAvailability[]; blockingIssues: Section8BlockingIssue[] } {
  const blockingIssues: Section8BlockingIssue[] = [];
  const groundAvailability = grounds.map<Section8GroundAvailability>((ground) => {
    if (!ground.earliestUseAfterTenancyMonths) {
      return {
        groundCode: ground.code,
        groundTitle: ground.title,
        status: 'available',
        statusLabel: 'Available',
        currentNoticeExpiryDate: calculatedNoticeExpiryDate,
        message: `Ground ${ground.code} has no 12-month ground-availability restriction in this calculator.`,
      };
    }

    if (!input.tenancyStartDate) {
      return {
        groundCode: ground.code,
        groundTitle: ground.title,
        status: 'needs_review',
        statusLabel: 'Needs review',
        currentNoticeExpiryDate: calculatedNoticeExpiryDate,
        message: `Ground ${ground.code} needs a tenancy start date before ground availability can be confirmed.`,
      };
    }

    const earliestGroundExpiryDate = addCalendarMonths(input.tenancyStartDate, ground.earliestUseAfterTenancyMonths);
    if (compareDateOnly(calculatedNoticeExpiryDate, earliestGroundExpiryDate) < 0) {
      const action =
        `Remove Ground ${ground.code} or move the notice/service date so the notice expiry is on or after ${formatDateLabel(earliestGroundExpiryDate)}.`;

      blockingIssues.push({
        code: 'SECTION_8_BLOCKED',
        groundCode: ground.code,
        groundTitle: ground.title,
        message:
          `Ground ${ground.code} (${ground.title}) cannot be relied upon because the notice would expire before the first ` +
          `${ground.earliestUseAfterTenancyMonths} months of the tenancy have passed.`,
        tenancyStartDate: input.tenancyStartDate,
        earliestGroundExpiryDate,
        currentNoticeExpiryDate: calculatedNoticeExpiryDate,
        action,
      });

      return {
        groundCode: ground.code,
        groundTitle: ground.title,
        status: 'not_currently_available',
        statusLabel: 'Not currently available',
        earliestGroundExpiryDate,
        currentNoticeExpiryDate: calculatedNoticeExpiryDate,
        message:
          `The date calculation is shown for transparency, but Ground ${ground.code} is not available on this notice expiry date.`,
      };
    }

    return {
      groundCode: ground.code,
      groundTitle: ground.title,
      status: 'available',
      statusLabel: 'Available',
      earliestGroundExpiryDate,
      currentNoticeExpiryDate: calculatedNoticeExpiryDate,
      message: `Ground ${ground.code} is available because the notice expiry is on or after ${formatDateLabel(earliestGroundExpiryDate)}.`,
    };
  });

  return { groundAvailability, blockingIssues };
}

function buildWarnings(
  input: Section8NoticeDateInput,
  grounds: EnglandGroundDefinition[],
  groundAvailability: Section8GroundAvailability[],
): string[] {
  const warnings: string[] = [];

  if (grounds.length === 0) {
    return ['Choose at least one ground before relying on the date.'];
  }

  if (input.groundCodes.some((code) => !getEnglandGroundDefinition(code))) {
    warnings.push('One or more selected grounds could not be matched to the current England ground catalog.');
  }

  const restrictedGrounds = grounds.filter((ground) => ground.earliestUseAfterTenancyMonths);
  if (restrictedGrounds.length > 0 && !input.tenancyStartDate) {
    warnings.push('This route can depend on tenancy timing. Add the tenancy start date before relying on the result.');
  }

  for (const availability of groundAvailability) {
    if (availability.status === 'needs_review') {
      warnings.push(`Ground ${availability.groundCode} status: Needs review. Add the tenancy start date to confirm ground availability.`);
    }
  }

  if (grounds.some((ground) => ground.code === '8')) {
    warnings.push('Ground 8 depends on the arrears threshold still being met at the key stages. Keep the rent schedule current.');
  }

  if (grounds.some((ground) => ground.mandatory === false)) {
    warnings.push('Discretionary grounds still need evidence. The court can look closely at whether possession is reasonable.');
  }

  if (grounds.some((ground) => ground.immediateApplicationAllowed)) {
    warnings.push('Immediate application grounds are fact-sensitive. Do not treat the date as the whole risk check.');
  }

  warnings.push('A correct date does not fix the wrong ground, weak wording, or poor service evidence.');

  return unique(warnings);
}

function buildNextStep(input: Section8NoticeDateInput) {
  if (input.noticeStatus === 'expired_tenant_still_there') {
    return {
      label: 'Prepare my court papers',
      href: '/products/complete-pack',
      productName: 'Complete Pack',
      description:
        'Your notice timing points toward the court-paper stage. Prepare the Form 3A file, N215, N5, N119, witness statement, evidence checklist, and filing guide together.',
      paidIncludes: [
        'Form 3A notice and service record carried into the court file',
        'N5, N119, witness statement, and court-readiness checks',
        'Evidence checklist, filing guide, hearing checklist, and case summary',
      ],
    };
  }

  return {
    label: 'Create my Section 8 notice',
    href: '/products/notice-only',
    productName: 'Notice Only',
    description:
      'Use the calculated timing to build the England Form 3A notice, N215 service record, arrears schedule, service instructions, and validity checklist before anything goes to the tenant.',
    paidIncludes: [
      'Form 3A Section 8 notice with grounds and dates aligned',
      'N215 certificate of service, service instructions, and validity checklist',
      'Arrears schedule, case summary, compliance declaration, and what-happens-next guide',
    ],
  };
}

export function getDefaultSection8GroundsForProblem(problem: Section8NoticeProblem): EnglandGroundCode[] {
  return (
    SECTION8_NOTICE_PROBLEM_OPTIONS.find((option) => option.id === problem)?.defaultGrounds ||
    SECTION8_NOTICE_PROBLEM_OPTIONS[0].defaultGrounds
  );
}

export function calculateSection8NoticeDateResult(
  input: Section8NoticeDateInput
): Section8NoticeDateResult {
  const selectedGrounds = input.groundCodes
    .map((code) => getEnglandGroundDefinition(code))
    .filter((ground): ground is EnglandGroundDefinition => Boolean(ground));

  if (selectedGrounds.length === 0) {
    throw new Error('At least one valid Section 8 ground is required');
  }

  const deemedServiceDate = calculateDeemedServiceDate(input.actionDate, input.serviceMethod);
  const calculation = calculateSection8ExpiryDate({
    service_date: deemedServiceDate,
    grounds: selectedGrounds.map((ground) => ({ code: ground.code, mandatory: ground.mandatory })),
    jurisdiction: 'england',
  });
  const noticePeriodLabel = buildNoticePeriodLabel(calculation.notice_period_days, selectedGrounds);
  const hasRentGround = selectedGrounds.some((ground) => ['8', '10', '11'].includes(ground.code));
  const { groundAvailability, blockingIssues } = buildGroundAvailability(
    input,
    selectedGrounds,
    calculation.earliest_valid_date,
  );

  return {
    selectedGrounds,
    deemedServiceDate,
    earliestCourtDate: calculation.earliest_valid_date,
    noticePeriodDays: calculation.notice_period_days,
    noticePeriodLabel,
    explanation:
      deemedServiceDate === input.actionDate
        ? calculation.explanation
        : `We first allowed for deemed service on ${formatDateLabel(deemedServiceDate)}, then calculated the notice period from that date. ${calculation.explanation}`,
    groundAvailability,
    blockingIssues,
    evidenceChecklist: buildEvidenceChecklist(selectedGrounds),
    warnings: buildWarnings(input, selectedGrounds, groundAvailability),
    nextStep: buildNextStep(input),
    secondaryActions: unique([
      hasRentGround ? '/tools/rent-arrears-calculator|Calculate rent arrears' : '',
      hasRentGround ? '/products/money-claim|Recover unpaid rent separately' : '',
      '/section-8-notice-guide|Read the Section 8 guide',
      '/products/complete-pack|Compare the court pack',
    ]).map((item) => {
      const [href, label] = item.split('|');
      return { href, label };
    }),
    hasImmediateApplicationGround: selectedGrounds.some((ground) => ground.immediateApplicationAllowed),
  };
}

export function formatSection8ToolDate(value: string): string {
  return formatDateLabel(value);
}

export function formatSection8ToolDateShort(value: string): string {
  return formatDateUK(value);
}
