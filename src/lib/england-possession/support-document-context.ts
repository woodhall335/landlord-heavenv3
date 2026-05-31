import {
  getEnglandGroundDefinition,
  normalizeEnglandGroundCode,
  type EnglandCommonReasonKey,
  type EnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';
import {
  buildEnglandPossessionDraftingModel,
  type EnglandPossessionDraftingModel,
} from '@/lib/england-possession/pack-drafting';
import {
  ENGLAND_SECTION8_FORM_NAME,
  ENGLAND_SECTION8_NOTICE_NAME,
  ENGLAND_SECTION8_NOTICE_TITLE,
} from '@/lib/england-possession/section8-terminology';

type DraftingContextInput = Record<string, any>;

function toNonEmptyString(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  const text = String(value).trim();
  return text.length > 0 ? text : '';
}

function getByPath(source: DraftingContextInput | null | undefined, path: string): unknown {
  if (!source) return undefined;
  if (path in source) return source[path];

  return path.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in (value as DraftingContextInput)) {
      return (value as DraftingContextInput)[segment];
    }
    return undefined;
  }, source);
}

function getFirstValue(source: DraftingContextInput, ...paths: string[]): unknown {
  for (const path of paths) {
    const value = getByPath(source, path);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
}

function getFirstText(source: DraftingContextInput, ...paths: string[]): string {
  return toNonEmptyString(getFirstValue(source, ...paths));
}

function joinAddressLines(...parts: unknown[]): string {
  return parts
    .map((part) => toNonEmptyString(part))
    .filter(Boolean)
    .join('\n');
}

function formatDateUK(value: unknown): string {
  if (!value) return '';

  try {
    const raw = String(value);
    const date = new Date(raw.includes('T') ? raw : `${raw}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return '';

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

function collectGroundValues(value: unknown, rawValues: string[]): void {
  if (!value) return;

  if (Array.isArray(value)) {
    value.forEach((entry) => collectGroundValues(entry, rawValues));
    return;
  }

  if (typeof value === 'object') {
    const record = value as DraftingContextInput;
    collectGroundValues(record.code ?? record.value ?? record.label ?? record.number, rawValues);
    return;
  }

  rawValues.push(String(value));
}

export function extractEnglandSupportGroundCodes(input: DraftingContextInput | unknown): EnglandGroundCode[] {
  const rawValues: string[] = [];
  const source = input && typeof input === 'object' ? input as DraftingContextInput : {};

  collectGroundValues(Array.isArray(input) ? input : undefined, rawValues);
  collectGroundValues(typeof input === 'string' || typeof input === 'number' ? input : undefined, rawValues);

  collectGroundValues(source.selected_ground_codes, rawValues);
  collectGroundValues(source.ground_codes, rawValues);
  collectGroundValues(source.selected_grounds, rawValues);
  collectGroundValues(source.section8_grounds, rawValues);
  collectGroundValues(source.grounds, rawValues);
  collectGroundValues(getFirstValue(source, 'section8.grounds', 'section8_grounds.selected_grounds'), rawValues);

  if (source.ground_numbers) {
    String(source.ground_numbers)
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => rawValues.push(entry));
  }

  return Array.from(
    new Set(
      rawValues
        .map((entry) => normalizeEnglandGroundCode(entry))
        .filter((entry): entry is EnglandGroundCode => Boolean(entry)),
    ),
  );
}

function buildRequiredEvidence(groundCodes: EnglandGroundCode[]) {
  return groundCodes.map((code) => {
    const definition = getEnglandGroundDefinition(code);
    return {
      ground: `Ground ${code}`,
      title: definition?.title || `Ground ${code}`,
      evidence_items: definition?.evidenceCategories || ['Ground-specific evidence'],
    };
  });
}

function removeArrearsDraftingFields<T extends DraftingContextInput>(input: T): T {
  return {
    ...input,
    arrears: undefined,
    arrears_items: [],
    arrears_schedule: [],
    arrears_total: undefined,
    total_arrears: undefined,
    rent_arrears_amount: undefined,
    arrears_amount: undefined,
    current_arrears: undefined,
    current_arrears_total: undefined,
    current_arrears_amount: undefined,
    arrears_at_notice_date: undefined,
    ground_8_threshold: undefined,
    ground_8_status: undefined,
    issues: {
      ...(input.issues || {}),
      rent_arrears: undefined,
    },
  };
}

const ARREARS_GROUNDS = new Set<EnglandGroundCode>(['8', '10', '11']);
const SALE_OR_USE_REASONS = new Set<EnglandCommonReasonKey>(['use_or_sale']);
const REDEVELOPMENT_REASONS = new Set<EnglandCommonReasonKey>(['redevelopment']);
const BREACH_OR_CONDUCT_REASONS = new Set<EnglandCommonReasonKey>([
  'asb_or_legal_breach',
  'tenancy_breach',
  'deterioration',
  'no_right_to_rent',
]);

export type EnglandGroundEvidenceSection = {
  ground: string;
  code: EnglandGroundCode;
  title: string;
  commonReason: EnglandCommonReasonKey | 'unknown';
  mandatory: boolean;
  mandatoryLabel: 'mandatory' | 'discretionary';
  noticePeriodLabel: string;
  courtClaimPath: string;
  evidenceItems: string[];
  evidence_items: string[];
};

export type EnglandGroundSupportProfile = {
  groundCodes: EnglandGroundCode[];
  hasArrearsGrounds: boolean;
  hasSaleOrUseGrounds: boolean;
  hasRedevelopmentGrounds: boolean;
  hasBreachOrConductGrounds: boolean;
  hasSpecialStatusGrounds: boolean;
  evidenceItems: string[];
  groundEvidenceSections: EnglandGroundEvidenceSection[];
  requiredEvidence: ReturnType<typeof buildRequiredEvidence>;
  evidenceFocusLabel: string;
};

export function buildEnglandGroundSupportProfile(input: DraftingContextInput | EnglandGroundCode[] | unknown): EnglandGroundSupportProfile {
  const groundCodes = extractEnglandSupportGroundCodes(input);
  const definitions = groundCodes
    .map((code) => getEnglandGroundDefinition(code))
    .filter((definition): definition is NonNullable<ReturnType<typeof getEnglandGroundDefinition>> => Boolean(definition));
  const hasArrearsGrounds = groundCodes.some((code) => ARREARS_GROUNDS.has(code));
  const hasSaleOrUseGrounds = definitions.some((definition) => SALE_OR_USE_REASONS.has(definition.commonReason));
  const hasRedevelopmentGrounds = definitions.some((definition) => REDEVELOPMENT_REASONS.has(definition.commonReason));
  const hasBreachOrConductGrounds = definitions.some((definition) =>
    BREACH_OR_CONDUCT_REASONS.has(definition.commonReason),
  );
  const hasSpecialStatusGrounds = definitions.some((definition) => {
    if (hasArrearsGrounds && ARREARS_GROUNDS.has(definition.code)) return false;
    if (SALE_OR_USE_REASONS.has(definition.commonReason)) return false;
    if (REDEVELOPMENT_REASONS.has(definition.commonReason)) return false;
    if (BREACH_OR_CONDUCT_REASONS.has(definition.commonReason)) return false;
    return true;
  });
  const evidenceItems = Array.from(new Set(
    definitions.flatMap((definition) => definition.evidenceCategories || []),
  ));
  const groundEvidenceSections: EnglandGroundEvidenceSection[] = definitions.map((definition) => ({
    ground: `Ground ${definition.code}`,
    code: definition.code,
    title: definition.title,
    commonReason: definition.commonReason,
    mandatory: definition.mandatory,
    mandatoryLabel: definition.mandatory ? 'mandatory' : 'discretionary',
    noticePeriodLabel: definition.noticePeriodLabel,
    courtClaimPath: definition.courtClaimPath,
    evidenceItems: definition.evidenceCategories || ['Ground-specific evidence'],
    evidence_items: definition.evidenceCategories || ['Ground-specific evidence'],
  }));

  return {
    groundCodes,
    hasArrearsGrounds,
    hasSaleOrUseGrounds,
    hasRedevelopmentGrounds,
    hasBreachOrConductGrounds,
    hasSpecialStatusGrounds,
    evidenceItems,
    groundEvidenceSections,
    requiredEvidence: buildRequiredEvidence(groundCodes),
    evidenceFocusLabel: hasArrearsGrounds ? 'arrears and ground-specific evidence' : 'ground-specific evidence',
  };
}

export type EnglandSection8SupportContext = DraftingContextInput & {
  drafting_model: EnglandPossessionDraftingModel;
  ground_support_profile: EnglandGroundSupportProfile;
  selected_ground_codes: EnglandGroundCode[];
  notice_name: string;
  form_name: string;
  notice_type: string;
};

export function enrichEnglandSection8SupportContext<T extends DraftingContextInput>(
  input: T,
): T & EnglandSection8SupportContext {
  const supportProfile = buildEnglandGroundSupportProfile(input);
  const groundCodes = supportProfile.groundCodes;
  const selectedGrounds = groundCodes.map((code) => `Ground ${code}`);
  const landlordFullName = getFirstText(
    input,
    'landlord_full_name',
    'landlord_name',
    'claimant_name',
    'landlord.name',
    'claimant.name',
  );
  const tenantFullName = getFirstText(
    input,
    'tenant_full_name',
    'tenant_name',
    'tenant1_name',
    'defendant_name',
    'tenant.name',
    'defendant.name',
  );
  const tenantSecondName = getFirstText(input, 'tenant_2_name', 'tenant2_name', 'defendant_2_name');
  const propertyAddress =
    getFirstText(input, 'property_address', 'property.full_address', 'property.address') ||
    joinAddressLines(
      getFirstValue(input, 'property_address_line1', 'property.address_line1'),
      getFirstValue(input, 'property_address_line2', 'property.address_line2'),
      getFirstValue(input, 'property_city', 'property.town', 'property.city'),
      getFirstValue(input, 'property_county', 'property.county'),
      getFirstValue(input, 'property_postcode', 'property.postcode'),
    );
  const landlordAddress =
    getFirstText(input, 'landlord_address', 'claimant_address', 'landlord.address', 'claimant.address') ||
    joinAddressLines(
      getFirstValue(input, 'landlord_address_line1', 'service_address_line1', 'landlord.address_line1'),
      getFirstValue(input, 'landlord_address_line2', 'service_address_line2', 'landlord.address_line2'),
      getFirstValue(input, 'landlord_city', 'service_address_town', 'service_address_city', 'landlord.town', 'landlord.city'),
      getFirstValue(input, 'landlord_county', 'service_address_county', 'landlord.county'),
      getFirstValue(input, 'landlord_postcode', 'service_postcode', 'landlord.postcode'),
    );
  const courtName = getFirstText(input, 'court_name', 'court.name');
  const serviceDate =
    getFirstValue(input, 'notice_service_date', 'notice_served_date', 'service_date', 'notice_date', 'notice.service_date') ||
    '';
  const noticeExpiryDate =
    getFirstValue(
      input,
      'notice_expiry_date',
      'earliest_possession_date',
      'expiry_date',
      'notice.expiry_date',
      'earliest_proceedings_date',
    ) || '';
  const earliestProceedingsDate =
    getFirstValue(input, 'earliest_proceedings_date', 'notice_expiry_date', 'earliest_possession_date') ||
    noticeExpiryDate;
  const latestProceedingsDate =
    getFirstValue(input, 'latest_proceedings_date', 'notice.latest_proceedings_date') || '';
  const tenancyStartDate =
    getFirstValue(input, 'tenancy_start_date', 'tenancy.start_date') || '';
  const definitions = groundCodes
    .map((code) => getEnglandGroundDefinition(code))
    .filter((definition): definition is NonNullable<ReturnType<typeof getEnglandGroundDefinition>> => Boolean(definition));

  const draftingInput = supportProfile.hasArrearsGrounds ? input : removeArrearsDraftingFields(input);
  const draftingModel = buildEnglandPossessionDraftingModel({
    ...draftingInput,
    ground_codes: groundCodes,
    selected_ground_codes: groundCodes,
    selected_grounds: selectedGrounds,
    notice_service_date: serviceDate,
    notice_served_date: serviceDate,
    notice_expiry_date: noticeExpiryDate,
    earliest_proceedings_date: earliestProceedingsDate,
  });

  const groundDescriptions =
    definitions.length > 0
      ? definitions.map((definition) => `Ground ${definition.code} – ${definition.title}`).join(', ')
      : String(input.ground_descriptions || '');

  return {
    ...input,
    ground_codes: groundCodes,
    selected_ground_codes: groundCodes,
    selected_grounds: selectedGrounds,
    groundsReliedUpon: input.groundsReliedUpon || selectedGrounds,
    ground_numbers: input.ground_numbers || groundCodes.join(', '),
    grounds_count: groundCodes.length,
    ground_descriptions: groundDescriptions,
    has_mandatory_ground: definitions.some((definition) => definition.mandatory),
    has_ground_1a: groundCodes.includes('1A'),
    uses_rent_arrears_grounds: supportProfile.hasArrearsGrounds,
    has_arrears_grounds: supportProfile.hasArrearsGrounds,
    has_sale_or_use_grounds: supportProfile.hasSaleOrUseGrounds,
    has_redevelopment_grounds: supportProfile.hasRedevelopmentGrounds,
    has_breach_or_conduct_grounds: supportProfile.hasBreachOrConductGrounds,
    has_special_status_grounds: supportProfile.hasSpecialStatusGrounds,
    ground_support_profile: supportProfile,
    ground_evidence_sections: supportProfile.groundEvidenceSections,
    ground_evidence_items: supportProfile.evidenceItems,
    evidence_focus_label: supportProfile.evidenceFocusLabel,
    is_england_post_2026: true,
    form_name: ENGLAND_SECTION8_FORM_NAME,
    notice_name: ENGLAND_SECTION8_NOTICE_NAME,
    notice_type: ENGLAND_SECTION8_NOTICE_NAME,
    notice_title: ENGLAND_SECTION8_NOTICE_NAME,
    official_notice_title: ENGLAND_SECTION8_NOTICE_TITLE,
    landlord_full_name: landlordFullName,
    landlord_name: landlordFullName,
    claimant_name: landlordFullName,
    tenant_full_name: tenantFullName,
    tenant_name: tenantFullName,
    defendant_name: tenantFullName,
    tenant_2_name: tenantSecondName || input.tenant_2_name || input.tenant2_name || '',
    property_address: propertyAddress,
    landlord_address: landlordAddress,
    service_address: input.service_address || landlordAddress,
    court_name: courtName || input.court_name || '',
    service_date: input.service_date || serviceDate,
    notice_service_date: serviceDate,
    notice_served_date: input.notice_served_date || serviceDate,
    earliest_possession_date: input.earliest_possession_date || noticeExpiryDate,
    notice_expiry_date: noticeExpiryDate,
    earliest_proceedings_date: earliestProceedingsDate,
    latest_proceedings_date: latestProceedingsDate,
    display_possession_date: input.display_possession_date || noticeExpiryDate,
    tenancy_start_date_formatted: input.tenancy_start_date_formatted || formatDateUK(tenancyStartDate),
    service_date_formatted: input.service_date_formatted || formatDateUK(serviceDate),
    notice_date_formatted: input.notice_date_formatted || formatDateUK(serviceDate),
    earliest_possession_date_formatted:
      input.earliest_possession_date_formatted || formatDateUK(input.earliest_possession_date || noticeExpiryDate),
    notice_expiry_date_formatted: input.notice_expiry_date_formatted || formatDateUK(noticeExpiryDate),
    earliest_proceedings_date_formatted:
      input.earliest_proceedings_date_formatted || formatDateUK(earliestProceedingsDate),
    latest_proceedings_date_formatted:
      input.latest_proceedings_date_formatted || formatDateUK(latestProceedingsDate),
    display_possession_date_formatted:
      input.display_possession_date_formatted || formatDateUK(input.display_possession_date || noticeExpiryDate),
    clean_output: input.clean_output ?? input.court_mode ?? false,
    court_mode: input.court_mode ?? input.clean_output ?? false,
    required_evidence: input.required_evidence || supportProfile.requiredEvidence,
    preview_summary: draftingModel.previewSummary,
    drafting_model: draftingModel,
  };
}
