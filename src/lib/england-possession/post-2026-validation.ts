import { validateGround8Eligibility } from '@/lib/arrears-engine';
import {
  calculateEnglandPossessionNoticePeriod,
  getEnglandGroundDefinition,
  normalizeEnglandGroundCode,
  type EnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';
import { getSelectedGrounds } from '@/lib/grounds';

export interface EnglandPost2026ValidationIssue {
  code: string;
  severity: 'blocking' | 'warning';
  message: string;
  fields: string[];
  legalBasis?: string;
}

export interface EnglandPost2026ValidationResult {
  normalizedGrounds: string[];
  noticePeriodDays: number;
  earliestValidDate: string | null;
  blockingIssues: EnglandPost2026ValidationIssue[];
  warnings: EnglandPost2026ValidationIssue[];
}

function coerceBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
    if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  }
  return null;
}

function coerceNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function firstDefined<T>(...values: Array<T | null | undefined>): T | undefined {
  return values.find((value): value is T => value !== undefined && value !== null);
}

function getPathValue(source: Record<string, any>, path: string): unknown {
  if (!path.includes('.')) {
    return source[path];
  }

  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment];
  }, source);
}

function resolveNoticeServiceDate(facts: Record<string, any>): string | null {
  const candidates = [
    'notice_served_date',
    'notice_service.notice_date',
    'notice_service.date',
    'notice_service_date',
    'service_date',
    'section_8_notice_date',
    'section8_notice_date',
    'notice_date',
    'intended_service_date',
    'tenancy.notice_service_date',
    'tenancy.service_date',
    'date_notice_served',
    'date_of_service',
    'served_on',
    'served_date',
  ];

  for (const candidate of candidates) {
    const value = getPathValue(facts, candidate);
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function resolveNoticeExpiryDate(facts: Record<string, any>): string | null {
  const candidates = [
    'notice_service.notice_expiry_date',
    'notice_service.expiry_date',
    'notice_expiry_date',
    'expiry_date',
    'earliest_possession_date',
    'notice.expiry_date',
    'tenancy.notice_expiry_date',
  ];

  for (const candidate of candidates) {
    const value = getPathValue(facts, candidate);
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function toIsoDate(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().split('T')[0];
}

function addDaysIso(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

function addCalendarMonthsIso(dateStr: string, months: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const originalDay = date.getUTCDate();
  date.setUTCMonth(date.getUTCMonth() + months);

  if (date.getUTCDate() !== originalDay) {
    date.setUTCDate(0);
  }

  return date.toISOString().split('T')[0];
}

export function calculateEarliestValidPossessionDate(
  serviceDate: string,
  grounds: Array<string | number>,
): string | null {
  const normalizedGrounds = grounds
    .map((ground) => normalizeEnglandGroundCode(ground))
    .filter((ground): ground is EnglandGroundCode => Boolean(ground));

  if (normalizedGrounds.length === 0) {
    return null;
  }

  const candidateDates = normalizedGrounds.map((groundCode) => {
    const definition = getEnglandGroundDefinition(groundCode);
    if (!definition) {
      return serviceDate;
    }

    if (definition.noticePeriodMonths && definition.noticePeriodMonths > 0) {
      return addCalendarMonthsIso(serviceDate, definition.noticePeriodMonths);
    }

    return addDaysIso(serviceDate, definition.noticePeriodDays);
  });

  return candidateDates.sort().at(-1) ?? null;
}

function calculateMonthsElapsed(startDate: string, endDate: string): number | null {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
}

function depositRulesApplyToGrounds(grounds: string[]): boolean {
  return grounds.some((ground) => !['7A', '14'].includes(ground));
}

function makeIssue(
  code: string,
  severity: 'blocking' | 'warning',
  message: string,
  fields: string[],
  legalBasis?: string,
): EnglandPost2026ValidationIssue {
  return { code, severity, message, fields, legalBasis };
}

export function validateEnglandPost2026WizardFacts(
  facts: Record<string, any>,
  groundsOverride?: string[],
): EnglandPost2026ValidationResult {
  const selectedGrounds = groundsOverride ?? getSelectedGrounds(facts);
  const normalizedGrounds = selectedGrounds
    .map((ground) => normalizeEnglandGroundCode(ground))
    .filter((ground): ground is EnglandGroundCode => Boolean(ground));

  const { noticePeriodDays } = calculateEnglandPossessionNoticePeriod(normalizedGrounds);
  const serviceDate = resolveNoticeServiceDate(facts);
  const expiryDate = resolveNoticeExpiryDate(facts);
  const earliestValidDate = serviceDate
    ? calculateEarliestValidPossessionDate(serviceDate, normalizedGrounds)
    : null;
  const blockingIssues: EnglandPost2026ValidationIssue[] = [];
  const warnings: EnglandPost2026ValidationIssue[] = [];
  const product = String(firstDefined(facts.__meta?.product, facts.product, 'notice_only'));

  const landlordProfile = String(
    firstDefined(
      facts.landlord_profile,
      facts.parties?.landlord?.landlord_profile,
      'private_landlord',
    ),
  );
  const tenancyStartDate = firstDefined(
    facts.tenancy_start_date,
    facts.tenancy?.start_date,
  );

  normalizedGrounds.forEach((groundCode) => {
    const definition = getEnglandGroundDefinition(groundCode);
    if (!definition) {
      blockingIssues.push({
        code: 'UNKNOWN_FORM3A_GROUND',
        severity: 'blocking',
        message: `Ground ${groundCode} is not mapped in the post-1 May 2026 England Form 3A catalog.`,
        fields: ['section8_grounds', 'selected_grounds'],
        legalBasis: 'Form 3A ground catalog',
      });
      return;
    }

    if (definition.landlordProfiles && !definition.landlordProfiles.includes(landlordProfile as any)) {
      blockingIssues.push({
        code: 'GROUND_LANDLORD_PROFILE_MISMATCH',
        severity: 'blocking',
        message: `Ground ${definition.code} (${definition.title}) is not available for the selected landlord profile.`,
        fields: ['landlord_profile', 'section8_grounds'],
        legalBasis: `Form 3A ground ${definition.code}`,
      });
    }

    if (definition.requiresPriorNotice) {
      const priorNoticeGiven = coerceBoolean(
        firstDefined(
          facts.ground_prerequisite_notice_served,
          facts.prior_notice_served,
          facts.prior_written_notice_given,
        ),
      );

      if (priorNoticeGiven !== true) {
        blockingIssues.push({
          code: 'GROUND_PRIOR_NOTICE_MISSING',
          severity: 'blocking',
          message: `Ground ${definition.code} (${definition.title}) depends on prior written notice or tenancy-start wording. You must confirm that prerequisite before using this ground.`,
          fields: ['ground_prerequisite_notice_served', 'section8_grounds'],
          legalBasis: `Form 3A ground ${definition.code}`,
        });
      }
    }

    if (definition.earliestUseAfterTenancyMonths && tenancyStartDate) {
      const effectiveDate = expiryDate || earliestValidDate;
      const elapsedMonths = effectiveDate ? calculateMonthsElapsed(tenancyStartDate, effectiveDate) : null;

      if (elapsedMonths !== null && elapsedMonths < definition.earliestUseAfterTenancyMonths) {
        blockingIssues.push({
          code: 'GROUND_TIMING_RESTRICTION',
          severity: 'blocking',
          message: `Ground ${definition.code} (${definition.title}) cannot be used on the current notice date. The date in the notice must fall at least ${definition.earliestUseAfterTenancyMonths} months after the tenancy started.`,
          fields: ['tenancy_start_date', 'notice_expiry_date', 'section8_grounds'],
          legalBasis: `Form 3A ground ${definition.code}`,
        });
      }
    }
  });

  const section16EDutiesChecked = coerceBoolean(
    firstDefined(
      facts.section_16e_duties_checked,
      facts.section16e_duties_checked,
    ),
  );
  if (section16EDutiesChecked !== true) {
    blockingIssues.push(
      makeIssue(
        'SECTION_16E_CONFIRMATION_REQUIRED',
        'blocking',
        'Confirm that you have complied with the landlord duties required by section 16E before serving Form 3A or filing the possession claim.',
        ['section_16e_duties_checked'],
        'Renters’ Rights Act 2025 section 16E duties',
      ),
    );
  }

  const breathingSpaceChecked = coerceBoolean(
    firstDefined(
      facts.breathing_space_checked,
      facts.debt_respite_checked,
    ),
  );
  const tenantInBreathingSpace = coerceBoolean(
    firstDefined(
      facts.tenant_in_breathing_space,
      facts.breathing_space_active,
    ),
  );

  if (breathingSpaceChecked !== true) {
    blockingIssues.push(
      makeIssue(
        'BREATHING_SPACE_CHECK_REQUIRED',
        'blocking',
        'You must check whether the tenant is in a Debt Respite Scheme breathing space before serving notice or filing the possession claim.',
        ['breathing_space_checked'],
        'Debt Respite Scheme / breathing space checks',
      ),
    );
  } else if (tenantInBreathingSpace === true) {
    blockingIssues.push(
      makeIssue(
        'TENANT_IN_BREATHING_SPACE',
        'blocking',
        'The tenant is recorded as being in a Debt Respite Scheme breathing space. Do not proceed with service or filing until that restriction has been resolved.',
        ['tenant_in_breathing_space'],
        'Debt Respite Scheme / breathing space restrictions',
      ),
    );
  } else if (tenantInBreathingSpace !== false) {
    warnings.push(
      makeIssue(
        'BREATHING_SPACE_STATUS_UNCONFIRMED',
        'warning',
        'Record the result of the breathing space check so the possession file shows the tenant is not in an active Debt Respite Scheme.',
        ['tenant_in_breathing_space'],
        'Debt Respite Scheme / breathing space checks',
      ),
    );
  }

  const evidenceBundleReady = coerceBoolean(
    firstDefined(
      facts.evidence_bundle_ready,
      facts.evidence_ready,
      facts.required_evidence_ready,
    ),
  );
  if (evidenceBundleReady === false) {
    const evidenceIssue = makeIssue(
      product === 'complete_pack' ? 'EVIDENCE_BUNDLE_INCOMPLETE' : 'EVIDENCE_BUNDLE_REVIEW_RECOMMENDED',
      product === 'complete_pack' ? 'blocking' : 'warning',
      product === 'complete_pack'
        ? 'The complete pack is not ready because the evidence for one or more selected grounds has not been gathered or confirmed.'
        : 'You should gather the evidence for each selected ground before serving the notice so the possession case can be supported if challenged.',
      ['evidence_bundle_ready', 'section8_grounds'],
      'Ground-specific evidence readiness',
    );

    if (product === 'complete_pack') {
      blockingIssues.push(evidenceIssue);
    } else {
      warnings.push(evidenceIssue);
    }
  } else if (product === 'complete_pack' && evidenceBundleReady !== true) {
    blockingIssues.push(
      makeIssue(
        'EVIDENCE_BUNDLE_CONFIRMATION_REQUIRED',
        'blocking',
        'Confirm that the evidence bundle for the selected grounds is ready before generating the complete possession pack.',
        ['evidence_bundle_ready', 'section8_grounds'],
        'Ground-specific evidence readiness',
      ),
    );
  }

  if (normalizedGrounds.includes('1A')) {
    const ground1ARestrictionAcknowledged = coerceBoolean(
      firstDefined(
        facts.ground_1a_reletting_acknowledged,
        facts.ground1a_reletting_acknowledged,
      ),
    );
    if (ground1ARestrictionAcknowledged !== true) {
      warnings.push(
        makeIssue(
          'GROUND_1A_RELETTING_RESTRICTION_AWARENESS',
          'warning',
          'Ground 1A includes a 12-month re-letting restriction after possession is recovered. Keep evidence showing the sale ground is genuine and make sure the landlord understands the post-possession restriction.',
          ['ground_1a_reletting_acknowledged', 'section8_grounds'],
          'Ground 1A post-possession re-letting restriction',
        ),
      );
    }
  }

  if (normalizedGrounds.includes('8')) {
    const rentAmount = coerceNumber(firstDefined(facts.rent_amount, facts.tenancy?.rent_amount));
    const rentFrequency = String(
      firstDefined(facts.rent_frequency, facts.tenancy?.rent_frequency, 'monthly'),
    ) as any;
    const ground8 = validateGround8Eligibility({
      arrears_items: Array.isArray(facts.arrears_items) ? facts.arrears_items : [],
      legacy_total_arrears: coerceNumber(firstDefined(facts.total_arrears, facts.arrears_total)),
      rent_amount: rentAmount,
      rent_frequency: rentFrequency,
      jurisdiction: 'england',
    });

    if (!ground8.is_eligible) {
      blockingIssues.push({
        code: 'GROUND_8_THRESHOLD_NOT_MET',
        severity: 'blocking',
        message: `Ground 8 cannot be used on the current arrears data. ${ground8.explanation}`,
        fields: ['section8_grounds', 'arrears_items', 'rent_amount', 'rent_frequency'],
        legalBasis: 'Ground 8 threshold for England on and after 1 May 2026',
      });
    } else if (!ground8.is_authoritative) {
      warnings.push({
        code: 'GROUND_8_SCHEDULE_RECOMMENDED',
        severity: 'warning',
        message: ground8.legacy_warning || 'Ground 8 appears to meet the threshold, but you still need a detailed arrears schedule for court.',
        fields: ['arrears_items', 'total_arrears'],
        legalBasis: 'Ground 8 arrears evidence',
      });
    }
  }

  if (serviceDate && expiryDate && earliestValidDate) {
    const normalizedExpiry = toIsoDate(expiryDate);
    if (normalizedExpiry && normalizedExpiry < earliestValidDate) {
      blockingIssues.push({
        code: 'NOTICE_PERIOD_TOO_SHORT',
        severity: 'blocking',
        message: `The notice expiry date is too early for the selected Form 3A ground(s). The earliest valid date is ${earliestValidDate}.`,
        fields: ['notice_served_date', 'notice_service_date', 'notice_expiry_date', 'section8_grounds'],
        legalBasis: 'Housing Act 1988 section 8 notice periods as amended from 1 May 2026',
      });
    }
  }

  const depositTaken = coerceBoolean(firstDefined(facts.deposit_taken)) ?? coerceNumber(firstDefined(facts.deposit_amount)) > 0;
  const depositProtected = coerceBoolean(
    firstDefined(facts.deposit_protected, facts.deposit_protected_scheme),
  );
  const depositProtectedWithin30Days = coerceBoolean(firstDefined(facts.deposit_protected_within_30_days));
  const prescribedInfoGiven = coerceBoolean(
    firstDefined(
      facts.prescribed_info_served,
      facts.prescribed_info_given,
      facts.prescribed_info_provided,
    ),
  );
  const depositReturned = coerceBoolean(
    firstDefined(
      facts.deposit_returned,
      facts.deposit_returned_in_full_or_agreed,
    ),
  );

  if (depositTaken && depositRulesApplyToGrounds(normalizedGrounds) && depositReturned !== true) {
    if (depositProtected === false) {
      blockingIssues.push({
        code: 'DEPOSIT_PROTECTION_REQUIRED',
        severity: 'blocking',
        message: 'The court cannot make a possession order on these grounds unless the deposit has been protected in an approved scheme, returned to the tenant, or otherwise fully resolved.',
        fields: ['deposit_taken', 'deposit_protected'],
        legalBasis: 'Deposit protection rules for private rented possession claims on and after 1 May 2026',
      });
    }

    if (depositProtectedWithin30Days === false) {
      blockingIssues.push({
        code: 'DEPOSIT_REQUIREMENTS_NOT_COMPLIED_WITH',
        severity: 'blocking',
        message: 'The deposit protection requirements were not complied with in time. For most Form 3A grounds, you must cure that issue or return the deposit before the court can make a possession order.',
        fields: ['deposit_protected_within_30_days', 'deposit_protection_date'],
        legalBasis: 'Deposit protection rules for private rented possession claims on and after 1 May 2026',
      });
    }

    if (prescribedInfoGiven === false) {
      blockingIssues.push({
        code: 'PRESCRIBED_INFORMATION_REQUIRED',
        severity: 'blocking',
        message: 'For most Form 3A grounds, the court cannot make a possession order unless the tenant received the required prescribed information about deposit protection or the deposit has been returned/resolved.',
        fields: ['prescribed_info_served', 'prescribed_info_given', 'prescribed_info_date'],
        legalBasis: 'Deposit protection rules for private rented possession claims on and after 1 May 2026',
      });
    }
  }

  return {
    normalizedGrounds,
    noticePeriodDays,
    earliestValidDate,
    blockingIssues,
    warnings,
  };
}
