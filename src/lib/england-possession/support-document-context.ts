import {
  getEnglandGroundDefinition,
  normalizeEnglandGroundCode,
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

function extractGroundCodes(input: DraftingContextInput): EnglandGroundCode[] {
  const rawValues: string[] = [];

  collectGroundValues(input.selected_ground_codes, rawValues);
  collectGroundValues(input.ground_codes, rawValues);
  collectGroundValues(input.selected_grounds, rawValues);
  collectGroundValues(input.section8_grounds, rawValues);
  collectGroundValues(input.grounds, rawValues);
  collectGroundValues(getFirstValue(input, 'section8.grounds', 'section8_grounds.selected_grounds'), rawValues);

  if (input.ground_numbers) {
    String(input.ground_numbers)
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

export type EnglandSection8SupportContext = DraftingContextInput & {
  drafting_model: EnglandPossessionDraftingModel;
  selected_ground_codes: EnglandGroundCode[];
  notice_name: string;
  form_name: string;
  notice_type: string;
};

export function enrichEnglandSection8SupportContext<T extends DraftingContextInput>(
  input: T,
): T & EnglandSection8SupportContext {
  const groundCodes = extractGroundCodes(input);
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

  const draftingModel = buildEnglandPossessionDraftingModel({
    ...input,
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
    uses_rent_arrears_grounds: groundCodes.some((code) => ['8', '10', '11'].includes(code)),
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
    required_evidence: input.required_evidence || buildRequiredEvidence(groundCodes),
    preview_summary: draftingModel.previewSummary,
    drafting_model: draftingModel,
  };
}
