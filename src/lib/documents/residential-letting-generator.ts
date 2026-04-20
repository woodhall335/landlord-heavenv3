import { readFile } from 'fs/promises';
import path from 'path';

import { generateDocument } from '@/lib/documents/generator';
import { getPackContents } from '@/lib/products/pack-contents';
import type { ResidentialLettingProductSku } from '@/lib/residential-letting/products';
import {
  getEnglandTenancyPurpose,
  shouldIncludeEnglandInformationSheet,
  type EnglandTenancyPurpose,
} from '@/lib/tenancy/england-reform';

export interface ResidentialGeneratedDocument {
  title: string;
  description: string;
  category:
    | 'agreement'
    | 'form'
    | 'report'
    | 'letter'
    | 'schedule'
    | 'guidance'
    | 'checklist';
  document_type: string;
  html: string;
  pdf?: Buffer;
  file_name: string;
}

export interface ResidentialGeneratedPack {
  documents: ResidentialGeneratedDocument[];
}

export type ResidentialDocumentOutputFormat = 'html' | 'pdf' | 'both';

export interface ResidentialGenerationOptions {
  outputFormat?: ResidentialDocumentOutputFormat;
}

interface SharedResidentialData {
  current_date: string;
  property_address: string;
  landlord_name: string;
  landlord_address: string;
  landlord_email: string;
  landlord_phone: string;
  tenant_names: string;
  tenant_primary_name: string;
  rent_amount: string | number;
  deposit_amount: string | number;
  tenancy_start_date: string;
  tenancy_end_date: string;
  document_notes: string;
  facts: Record<string, any>;
}

interface TemplateRow {
  label: string;
  value: string;
}

interface TemplateTable {
  columns: string[];
  rows: string[][];
}

interface TemplateSection {
  heading: string;
  intro?: string;
  rows?: TemplateRow[];
  table?: TemplateTable;
  bullets?: string[];
  paragraphs?: string[];
}

interface TemplateParty {
  label: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
}

interface TemplateDefinedTerm {
  term: string;
  meaning: string;
}

interface TemplateConfig {
  title: string;
  subtitle: string;
  intro: string;
  description: string;
  category: ResidentialGeneratedDocument['category'];
  documentType: string;
  fileName: string;
  templatePath: string;
  counterpartyLabel: string;
  recitals?: string[];
  executionStatement?: string;
  natureOfDocument?: string;
  executionAsDeed?: boolean;
  deedWarning?: string;
}

interface SignatureParty {
  label: string;
  name: string;
  witnessRequired?: boolean;
  witnessNote?: string;
}

interface RentArrearsLetterTemplateData {
  title: string;
  subtitle: string;
  document_reference: string;
  letter_date: string;
  property_address: string;
  landlord_name: string;
  landlord_address: string;
  landlord_email: string;
  landlord_phone: string;
  tenant_name: string;
  tenant_address: string;
  letter_type_label: string;
  is_final_warning: boolean;
  opening_paragraphs: string[];
  arrears_rows: TemplateRow[];
  payment_instruction_rows: TemplateRow[];
  payment_deadline: string;
  response_deadline: string;
  payment_request_paragraphs: string[];
  next_steps: string[];
  detailed_arrears_rows: Array<{
    due_date: string;
    period_covered: string;
    amount_due: string;
    amount_paid: string;
    amount_outstanding: string;
    payment_received_date: string;
    note: string;
  }>;
  protocol_note: string;
  advice_points: string[];
  closing_paragraphs: string[];
}

const RENTERS_RIGHTS_ACT_CUTOVER = '2026-05-01';
const ENGLAND_INFORMATION_SHEET_PDF_PATH = path.join(
  process.cwd(),
  'config',
  'mqs',
  'tenancy_agreement',
  'The_Renters__Rights_Act_Information_Sheet_2026.pdf'
);

type EnglandAssuredResidentialProduct =
  | 'england_standard_tenancy_agreement'
  | 'england_premium_tenancy_agreement'
  | 'england_student_tenancy_agreement'
  | 'england_hmo_shared_house_tenancy_agreement';

type EnglandModernTenancyProduct =
  | EnglandAssuredResidentialProduct
  | 'england_lodger_agreement';

function joinAddress(...parts: Array<string | null | undefined>) {
  return parts.map(toText).filter(Boolean).join(', ');
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function yesNoText(value: unknown, trueLabel = 'Yes', falseLabel = 'No'): string {
  const normalized = toText(value).toLowerCase();
  if (value === true) return trueLabel;
  if (value === false) return falseLabel;
  if (normalized === 'yes' || normalized === 'true') return trueLabel;
  if (normalized === 'no' || normalized === 'false') return falseLabel;
  return toText(value);
}

function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    const text = toText(value);
    if (text) return text;
  }
  return '';
}

function formatIsoDateText(value: unknown): string {
  const text = toText(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return text;

  const [, year, month, day] = match;
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return `${Number(day)} ${monthNames[Number(month) - 1]} ${year}`;
}

function legacyFormatMoney(value: unknown): string {
  if (typeof value === 'string' && value.trim().startsWith('£')) {
    return value.trim();
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  return `£${numeric.toFixed(2)}`;
}

function formatMoney(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('£')) {
      return trimmed;
    }
    if (trimmed.startsWith('Â£')) {
      return trimmed.replace(/^Â£/, '£');
    }
  }

  const legacyFormatted = legacyFormatMoney(value);
  return legacyFormatted.replace(/^Â£/, '£');
}

function splitEntries(value: unknown): string[] {
  const text = toText(value);
  if (!text) return [];

  return text
    .split(/\r?\n|;/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const PREMIUM_VALUE_LABELS: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  managing_agent_portal: 'Managing agent portal',
  mixed_channels: 'Mixed channels depending on issue',
  same_day_emergencies: 'Same day for emergencies',
  within_24_hours: 'Within 24 hours',
  within_48_hours: 'Within 48 hours',
  reasonable_time_by_severity: 'Reasonable time depending on severity',
  quarterly_weekday_daytime: 'Quarterly weekday daytime visits',
  every_6_months_weekday_daytime: 'Every 6 months on weekday daytime visits',
  agreed_case_by_case: 'Agreed case by case with the tenant',
  reasonable_notice_flexible: 'Flexible timing with reasonable notice',
};

const RENT_FREQUENCY_LABELS: Record<string, string> = {
  month: 'Monthly',
  monthly: 'Monthly',
  week: 'Weekly',
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

const INSPECTION_FREQUENCY_LABELS: Record<string, string> = {
  quarterly: 'Quarterly',
  every_6_months: 'Every 6 months',
  annually: 'Annually',
  as_needed: 'As needed',
};

const SMOKING_POLICY_LABELS: Record<string, string> = {
  no: 'No',
  yes: 'Yes',
  vaping_only: 'Vaping only',
};

const SUBLETTING_POLICY_LABELS: Record<string, string> = {
  not_allowed: 'Not allowed',
  written_consent: 'Only with written consent',
  allowed: 'Allowed',
};

const HMO_LICENCE_STATUS_LABELS: Record<string, string> = {
  not_required: 'Not required',
  currently_licensed: 'Currently licensed',
  applied_awaiting: 'Applied / awaiting',
};

const COMMUNAL_CLEANING_LABELS: Record<string, string> = {
  professional_cleaner: 'Professional cleaner',
  tenants_share: 'Tenants share',
  landlord: 'Landlord',
  not_applicable: 'Not applicable',
};

const RESIDENTIAL_DOCUMENT_REFERENCE_CODES: Partial<Record<ResidentialLettingProductSku, string>> = {
  england_standard_tenancy_agreement: 'ENGLAND-STANDARD-TA',
  england_premium_tenancy_agreement: 'ENGLAND-PREMIUM-TA',
  england_student_tenancy_agreement: 'ENGLAND-STUDENT-TA',
  england_hmo_shared_house_tenancy_agreement: 'ENGLAND-HMO-SHARED-HOUSE-TA',
  england_lodger_agreement: 'ENGLAND-LODGER-AGREEMENT',
};

function toTitleCaseWords(text: string): string {
  return text.replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function formatSelectionValue(value: unknown, labels: Record<string, string> = {}): string {
  const text = toText(value);
  if (!text) return '';

  const direct = labels[text] || labels[text.toLowerCase()];
  if (direct) return direct;

  return toTitleCaseWords(text.replace(/_/g, ' '));
}

function formatPremiumOption(value: unknown): string {
  const text = toText(value);
  if (!text) return '';
  return PREMIUM_VALUE_LABELS[text] || formatSelectionValue(text);
}

function buildLabeledObservation(label: string, value: unknown): string | undefined {
  const text = toText(value);
  return text ? `${label}: ${text}` : undefined;
}

function cleanDefinedTerms(
  items: Array<{ term: string; meaning: unknown }>
): TemplateDefinedTerm[] | undefined {
  const cleaned = items
    .map((item) => ({
      term: toText(item.term),
      meaning: formatIsoDateText(item.meaning),
    }))
    .filter((item) => item.term && item.meaning);

  return cleaned.length > 0 ? cleaned : undefined;
}

function parseInventoryItemLines(value: unknown): Array<{
  name: string;
  condition?: string;
  notes?: string;
}> {
  const text = toText(value);
  if (!text) return [];

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim());
      const [name, second, ...rest] = parts;
      if (!name) return null;

      if (rest.length > 0) {
        return {
          name,
          condition: second || undefined,
          notes: rest.join(' | ') || undefined,
        };
      }

      return second
        ? { name, notes: second }
        : { name };
    })
    .filter((item): item is { name: string; condition?: string; notes?: string } => Boolean(item));
}

function buildInventoryRoomData(
  name: string,
  itemLines: unknown,
  conditionSummary?: unknown
) {
  const items = parseInventoryItemLines(itemLines);
  const summary = toText(conditionSummary);

  if (summary) {
    items.push({
      name: 'Overall room condition',
      notes: summary,
    });
  }

  return items.length > 0 ? { name, items } : undefined;
}

function buildStandaloneInventoryRooms(facts: Record<string, any>) {
  return [
    buildInventoryRoomData(
      'Entrance hall / landing',
      facts.entrance_hall_inventory_items,
      facts.entrance_hall_condition
    ),
    buildInventoryRoomData(
      'Reception / living areas',
      facts.reception_room_inventory_items,
      facts.reception_room_condition
    ),
    buildInventoryRoomData(
      'Kitchen and appliances',
      facts.kitchen_inventory_items,
      facts.kitchen_condition
    ),
    buildInventoryRoomData(
      'Bedroom 1',
      facts.bedroom_one_inventory_items,
      facts.bedroom_one_condition
    ),
    buildInventoryRoomData(
      'Bedroom 2 / additional bedrooms',
      facts.bedroom_two_inventory_items,
      facts.bedroom_two_condition
    ),
    buildInventoryRoomData(
      'Bathroom / WC',
      facts.bathroom_inventory_items,
      facts.bathroom_condition
    ),
    buildInventoryRoomData(
      'External areas / garden / bins',
      facts.external_areas_inventory_items,
      facts.external_areas_condition
    ),
    buildInventoryRoomData(
      'Fixtures, fittings, windows, and flooring',
      facts.fixtures_fittings_inventory_items,
      facts.fixtures_fittings_condition
    ),
  ].filter(Boolean);
}

function buildStructuredInspectionRooms(facts: Record<string, any>) {
  const rooms = Array.isArray(facts.inspection_rooms) ? facts.inspection_rooms : [];

  if (rooms.length === 0) {
    const fallbackBullets = cleanList([
      buildLabeledObservation(
        'General summary',
        facts.room_condition_summary || facts.condition_summary || facts.room_condition_notes
      ),
      buildLabeledObservation('Entrance hall / landing', facts.entrance_hall_condition),
      buildLabeledObservation('Reception / living areas', facts.reception_room_condition),
      buildLabeledObservation('Kitchen and appliances', facts.kitchen_condition),
      buildLabeledObservation('Bedroom 1', facts.bedroom_one_condition),
      buildLabeledObservation('Bedroom 2 / additional bedrooms', facts.bedroom_two_condition),
      buildLabeledObservation('Bathroom / WC', facts.bathroom_condition),
      buildLabeledObservation('External areas / garden / bins', facts.external_areas_condition),
      buildLabeledObservation('Fixtures, fittings, windows, and flooring', facts.fixtures_fittings_condition),
    ]);

    return fallbackBullets
      ? [
          {
            name: 'Inspection observations',
            summary_rows: [] as TemplateRow[],
            observation_bullets: fallbackBullets,
            item_rows: [] as Array<Record<string, string>>,
            photo_reference: toText(facts.photo_schedule_reference),
          },
        ]
      : [];
  }

  return rooms.map((room: any) => ({
    name: readRoomName(room),
    summary_rows:
      cleanRows([
        { label: 'Condition summary', value: room.condition },
        { label: 'Cleanliness / presentation', value: room.cleanliness },
        { label: 'Fixtures, fittings, walls and floors', value: room.fixtures },
        { label: 'Defects or maintenance issues', value: room.defects },
        { label: 'Follow-up or action note', value: room.actions },
        { label: 'Tenant comments', value: room.tenant_comments },
      ]) || [],
    observation_bullets: cleanList(room.observations || []) || [],
    item_rows: (Array.isArray(room.items) ? room.items : [])
      .map((item: any) => ({
        item: toText(item.item || item.name),
        condition: toText(item.condition),
        cleanliness: toText(item.cleanliness),
        notes: toText(item.notes),
      }))
      .filter((item: Record<string, string>) => item.item || item.condition || item.cleanliness || item.notes),
    photo_reference: toText(room.photo_reference),
  }));
}

function buildStructuredInventoryRooms(facts: Record<string, any>) {
  const rooms = Array.isArray(facts.inventory_rooms) ? facts.inventory_rooms : [];

  if (rooms.length === 0) {
    return buildStandaloneInventoryRooms(facts).map((room: any) => ({
      name: toText(room.name),
      summary_rows: [] as TemplateRow[],
      item_rows: (Array.isArray(room.items) ? room.items : [])
        .map((item: any) => ({
          item: toText(item.name || item.item),
          condition: toText(item.condition),
          cleanliness: '',
          notes: toText(item.notes),
        }))
        .filter((item: Record<string, string>) => item.item || item.condition || item.notes),
      photo_reference: '',
    }));
  }

  return rooms.map((room: any) => ({
    name: readRoomName(room),
    summary_rows:
      cleanRows([
        { label: 'Condition summary', value: room.condition },
        { label: 'Cleanliness / presentation', value: room.cleanliness },
        { label: 'Room notes', value: room.notes },
        { label: 'Photo reference', value: room.photo_reference },
      ]) || [],
    item_rows: (Array.isArray(room.items) ? room.items : [])
      .map((item: any) => ({
        item: toText(item.item || item.name),
        condition: toText(item.condition),
        cleanliness: toText(item.cleanliness),
        notes: toText(item.notes),
      }))
      .filter((item: Record<string, string>) => item.item || item.condition || item.cleanliness || item.notes),
    photo_reference: toText(room.photo_reference),
  }));
}

function readRoomName(room: Record<string, any>) {
  return toText(room.name) || 'Room';
}

function buildEvidenceAppendix(value: unknown, roomLabel = '') {
  if (!Array.isArray(value)) return [];

  return value
    .map((file: any, index) => ({
      reference: `E${index + 1}`,
      room: roomLabel,
      file_name: toText(file.fileName || file.file_name || file.name) || 'Uploaded evidence',
      category: toText(file.category || file.label),
      uploaded_at: formatIsoDateText(file.uploadedAt || file.uploaded_at),
    }))
    .filter((entry) => entry.file_name);
}

function buildRepeaterTableRows(
  rows: unknown,
  _columns: string[],
  selectors: Array<(row: Record<string, any>) => unknown>
) {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => selectors.map((selector) => selector(row as Record<string, any>)));
}

function cleanRows(rows: Array<{ label: string; value: unknown }>): TemplateRow[] | undefined {
  const cleaned = rows
    .map((row) => ({ label: row.label, value: formatIsoDateText(row.value) }))
    .filter((row) => row.value.length > 0);
  return cleaned.length > 0 ? cleaned : undefined;
}

function cleanTable(columns: string[], rows: Array<Array<unknown>>): TemplateTable | undefined {
  const cleanedColumns = columns.map(toText).filter(Boolean);
  if (cleanedColumns.length === 0) return undefined;

  const cleanedRows = rows
    .map((row) =>
      cleanedColumns.map((_, index) => formatIsoDateText(row[index]))
    )
    .filter((row) => row.some((cell) => cell.length > 0));

  return cleanedRows.length > 0
    ? {
        columns: cleanedColumns,
        rows: cleanedRows,
      }
    : undefined;
}

function cleanList(items: Array<unknown>): string[] | undefined {
  const cleaned = items
    .flatMap((item) => (Array.isArray(item) ? item.map(toText) : [toText(item)]))
    .map((item) => item.trim())
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned : undefined;
}

function createSection(params: {
  heading: string;
  intro?: string;
  rows?: Array<{ label: string; value: unknown }>;
  table?: {
    columns: string[];
    rows: Array<Array<unknown>>;
  };
  bullets?: Array<unknown>;
  paragraphs?: Array<unknown>;
}): TemplateSection {
  const section: TemplateSection = {
    heading: params.heading,
  };

  const intro = toText(params.intro);
  if (intro) section.intro = intro;

  const rows = params.rows ? cleanRows(params.rows) : undefined;
  const table = params.table ? cleanTable(params.table.columns, params.table.rows) : undefined;
  const bullets = params.bullets ? cleanList(params.bullets) : undefined;
  const paragraphs = params.paragraphs ? cleanList(params.paragraphs) : undefined;

  if (rows) section.rows = rows;
  if (table) section.table = table;
  if (bullets) section.bullets = bullets;
  if (paragraphs) section.paragraphs = paragraphs;

  return section;
}

function getTenantRecords(facts: Record<string, any>): Array<Record<string, any>> {
  if (Array.isArray(facts.tenants)) {
    return facts.tenants.filter(Boolean);
  }

  if (facts.tenants && typeof facts.tenants === 'object') {
    return Object.entries(facts.tenants)
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([, tenant]) => tenant as Record<string, any>)
      .filter(Boolean);
  }

  if (facts.tenant_1_name) {
    return [
      {
        full_name: facts.tenant_1_name,
        email: facts.tenant_email,
        phone: facts.tenant_phone,
      },
    ];
  }

  return [];
}

function getAdditionalLandlordRecords(facts: Record<string, any>): Array<Record<string, any>> {
  if (!Array.isArray(facts.additional_landlords)) {
    return [];
  }

  return facts.additional_landlords
    .filter((landlord): landlord is Record<string, any> => Boolean(landlord))
    .map((landlord) => ({
      full_name: toText(landlord.full_name),
      service_address: firstNonEmpty(landlord.service_address, landlord.address),
      email: toText(landlord.email),
      phone: toText(landlord.phone),
    }))
    .filter((landlord) => landlord.full_name);
}

function getTenantNames(facts: Record<string, any>): string {
  const tenants = getTenantRecords(facts);
  if (tenants.length > 0) {
    return tenants.map((tenant) => toText(tenant.full_name)).filter(Boolean).join(', ');
  }
  return firstNonEmpty(facts.tenant_names, facts.tenant_1_name);
}

function getPrimaryTenantName(facts: Record<string, any>): string {
  const tenants = getTenantRecords(facts);
  return firstNonEmpty(tenants[0]?.full_name, facts.tenant_1_name);
}

function splitNames(value: unknown): string[] {
  return toText(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getLandlordParties(
  shared: SharedResidentialData,
  baseLabel = 'Landlord'
): TemplateParty[] {
  const allLandlords = [
    {
      name: shared.landlord_name,
      address: shared.landlord_address,
      email: shared.landlord_email,
      phone: shared.landlord_phone,
    },
    ...getAdditionalLandlordRecords(shared.facts).map((landlord) => ({
      name: landlord.full_name,
      address: firstNonEmpty(landlord.service_address, shared.landlord_address),
      email: landlord.email,
      phone: landlord.phone,
    })),
  ].filter((landlord) => landlord.name);

  const useNumberedLabels = allLandlords.length > 1;

  return allLandlords.map((landlord, index) => ({
    label: useNumberedLabels ? `${baseLabel} ${index + 1}` : baseLabel,
    name: landlord.name,
    address: landlord.address,
    email: landlord.email,
    phone: landlord.phone,
  }));
}

function getLandlordSignatureParties(
  shared: SharedResidentialData,
  baseLabel = 'Landlord'
): SignatureParty[] {
  const allLandlords = [
    { name: shared.landlord_name },
    ...getAdditionalLandlordRecords(shared.facts).map((landlord) => ({
      name: landlord.full_name,
    })),
  ].filter((landlord) => landlord.name);

  const useNumberedLabels = allLandlords.length > 1;

  return allLandlords.map((landlord, index) => ({
    label: useNumberedLabels ? `${baseLabel} ${index + 1}` : baseLabel,
    name: landlord.name,
  }));
}

function normalizeResidentialFacts(rawFacts: Record<string, any>): Record<string, any> {
  const tenants = getTenantRecords(rawFacts);
  const primaryTenant = tenants[0] || {};

  return {
    ...rawFacts,
    tenants,
    separate_bill_payment_rows: Array.isArray(rawFacts.separate_bill_payment_rows)
      ? rawFacts.separate_bill_payment_rows.map((row: Record<string, any>) => ({
          ...row,
          amount_detail: firstNonEmpty(row.amount_detail, row.amount_description, row.amount),
          due_detail: firstNonEmpty(row.due_detail, row.due_description, row.due_date),
        }))
      : rawFacts.separate_bill_payment_rows,
    landlord_full_name: firstNonEmpty(rawFacts.landlord_full_name, rawFacts.sender_name, rawFacts.landlord_name),
    landlord_address: firstNonEmpty(rawFacts.landlord_address, rawFacts.sender_service_address),
    tenant_names: firstNonEmpty(rawFacts.tenant_names, rawFacts.tenant_full_name),
    applicant_name: firstNonEmpty(rawFacts.applicant_name, rawFacts.applicant_full_name, primaryTenant.full_name, rawFacts.tenant_1_name),
    applicant_email: firstNonEmpty(rawFacts.applicant_email, rawFacts.email, rawFacts.tenant_email, primaryTenant.email),
    applicant_phone: firstNonEmpty(rawFacts.applicant_phone, rawFacts.phone, rawFacts.tenant_phone, primaryTenant.phone),
    applicant_date_of_birth: firstNonEmpty(rawFacts.applicant_date_of_birth, rawFacts.date_of_birth),
    current_address: firstNonEmpty(rawFacts.current_address, rawFacts.tenant_last_known_address, primaryTenant.address),
    employment_status: firstNonEmpty(rawFacts.employment_status, rawFacts.applicant_employment_status),
    employer_name: firstNonEmpty(rawFacts.employer_name, rawFacts.applicant_employer_name),
    job_title: firstNonEmpty(rawFacts.job_title, rawFacts.applicant_job_title),
    annual_income: firstNonEmpty(rawFacts.annual_income, rawFacts.applicant_annual_income),
    reference_contact_name: firstNonEmpty(
      rawFacts.reference_contact_name,
      rawFacts.applicant_reference_name,
      rawFacts.current_landlord_name
    ),
    reference_contact_details: firstNonEmpty(
      rawFacts.reference_contact_details,
      rawFacts.applicant_reference_contact,
      rawFacts.current_landlord_contact
    ),
    additional_occupiers: firstNonEmpty(
      rawFacts.additional_occupiers,
      rawFacts.applicant_occupants ? `${rawFacts.applicant_occupants} adult occupant(s)` : ''
    ),
    landlord_consent_status: firstNonEmpty(
      rawFacts.landlord_consent_status,
      rawFacts.consent_status,
      rawFacts.landlord_consent,
      rawFacts.landlord_consent_obtained === true
        ? 'Written consent obtained'
        : rawFacts.landlord_consent_obtained === false
          ? 'Consent not yet obtained'
          : ''
    ),
    assignment_date: firstNonEmpty(rawFacts.assignment_date, rawFacts.assignment_effective_date),
    assignment_scope: firstNonEmpty(rawFacts.assignment_scope, rawFacts.transfer_terms_summary),
    assignment_notes: firstNonEmpty(rawFacts.assignment_notes, rawFacts.transfer_terms_summary),
    release_outgoing_tenant: firstNonEmpty(rawFacts.release_outgoing_tenant, rawFacts.outgoing_tenant_release),
    amendment_scope: firstNonEmpty(
      rawFacts.amendment_scope,
      rawFacts.amended_clauses_reference,
      rawFacts.amendment_title
    ),
    changed_terms_summary: firstNonEmpty(rawFacts.changed_terms_summary, rawFacts.amendment_summary),
    renewal_terms_summary: firstNonEmpty(rawFacts.renewal_terms_summary, rawFacts.amendment_summary),
    renewal_rent_amount: firstNonEmpty(rawFacts.renewal_rent_amount, rawFacts.new_rent_amount),
    bills_split: firstNonEmpty(rawFacts.bills_split, rawFacts.bill_split_summary),
    rent_split: firstNonEmpty(rawFacts.rent_split, rawFacts.rent_split_summary, rawFacts.flatmate_rent_split),
    house_rules: firstNonEmpty(rawFacts.house_rules, rawFacts.house_rules_summary),
    initial_payment_date: firstNonEmpty(rawFacts.initial_payment_date, rawFacts.repayment_start_date),
    instalment_amount: firstNonEmpty(rawFacts.instalment_amount, rawFacts.repayment_amount),
    repayment_frequency: firstNonEmpty(rawFacts.repayment_frequency, rawFacts.instalment_frequency),
    arrears_amount: firstNonEmpty(rawFacts.arrears_amount, rawFacts.arrears_total),
    guarantor_name: firstNonEmpty(rawFacts.guarantor_name, rawFacts.guarantor_full_name),
    letter_type: firstNonEmpty(rawFacts.letter_type, rawFacts.arrears_letter_type),
    missed_rent_periods: firstNonEmpty(rawFacts.missed_rent_periods, rawFacts.arrears_periods_missed),
    arrears_date: firstNonEmpty(rawFacts.arrears_date, rawFacts.arrears_as_at_date),
    payment_details: firstNonEmpty(rawFacts.payment_details, rawFacts.payment_instructions),
    default_consequences: firstNonEmpty(rawFacts.default_consequences, rawFacts.default_consequence),
    default_grace_days: firstNonEmpty(rawFacts.default_grace_days, rawFacts.grace_period_days),
    arrears_schedule_reference: firstNonEmpty(
      rawFacts.arrears_schedule_reference,
      rawFacts.arrears_schedule_attached_reference
    ),
    flatmate_names: firstNonEmpty(rawFacts.flatmate_names, getTenantNames(rawFacts)),
    sublet_deposit: firstNonEmpty(rawFacts.sublet_deposit, rawFacts.sublet_deposit_amount, rawFacts.deposit_amount),
    sublet_rent: firstNonEmpty(rawFacts.sublet_rent, rawFacts.sublet_rent_amount, rawFacts.rent_amount),
    original_agreement_date: firstNonEmpty(rawFacts.original_agreement_date, rawFacts.head_tenancy_start_date),
    current_tenancy_end_date: firstNonEmpty(rawFacts.current_tenancy_end_date, rawFacts.current_term_end_date),
    tenancy_start_date: firstNonEmpty(rawFacts.tenancy_start_date, rawFacts.proposed_move_in_date),
    rent_amount: firstNonEmpty(rawFacts.rent_amount, rawFacts.current_rent_amount, rawFacts.proposed_rent, rawFacts.head_tenancy_rent),
  };
}

function buildSharedData(rawFacts: Record<string, any>): SharedResidentialData {
  const facts = normalizeResidentialFacts(rawFacts);
  const propertyAddress =
    facts.property_address ||
    joinAddress(facts.property_address_line1, facts.property_address_town, facts.property_address_postcode);

  return {
    current_date: firstNonEmpty(facts.current_date, new Date().toISOString().slice(0, 10)),
    property_address: propertyAddress,
    landlord_name: firstNonEmpty(facts.landlord_full_name, facts.sender_name, facts.landlord_name),
    landlord_address:
      facts.landlord_address ||
      joinAddress(
        facts.landlord_address_line1,
        facts.landlord_address_town,
        facts.landlord_address_postcode
      ),
    landlord_email: facts.landlord_email || '',
    landlord_phone: facts.landlord_phone || '',
    tenant_names: getTenantNames(facts),
    tenant_primary_name: getPrimaryTenantName(facts),
    rent_amount: facts.rent_amount || facts.monthly_rent || facts.sublet_rent || '',
    deposit_amount: facts.deposit_amount || facts.sublet_deposit || '',
    tenancy_start_date: facts.tenancy_start_date || facts.inventory_date || '',
    tenancy_end_date: facts.tenancy_end_date || '',
    document_notes: facts.document_notes || '',
    facts,
  };
}

function getNamedTenantParties(shared: SharedResidentialData, label = 'Tenant'): TemplateParty[] {
  const tenants = getTenantRecords(shared.facts);

  if (tenants.length > 0) {
    return tenants
      .map((tenant, index) => ({
        label: tenants.length > 1 ? `${label} ${index + 1}` : label,
        name: toText(tenant.full_name),
        address: toText(tenant.address),
        email: toText(tenant.email),
        phone: toText(tenant.phone),
      }))
      .filter((party) => party.name);
  }

  const names = splitNames(shared.tenant_names);
  if (names.length > 0) {
    return names.map((name, index) => ({
      label: names.length > 1 ? `${label} ${index + 1}` : label,
      name,
    }));
  }

  if (shared.tenant_primary_name) {
    return [{ label, name: shared.tenant_primary_name }];
  }

  return [];
}

function getPartyDetails(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): TemplateParty[] {
  const facts = shared.facts;
  const parties: TemplateParty[] = [];

  const addParty = (party: TemplateParty | null) => {
    if (party && party.name) parties.push(party);
  };

  if (product !== 'flatmate_agreement') {
    parties.push(
      ...getLandlordParties(
        shared,
        product === 'residential_sublet_agreement' || product === 'lease_assignment_agreement'
          ? 'Landlord / consenting party'
          : 'Landlord'
      )
    );
  }

  switch (product) {
    case 'guarantor_agreement':
      parties.push(...getNamedTenantParties(shared));
      addParty({
        label: 'Guarantor',
        name: toText(facts.guarantor_name),
        address: toText(facts.guarantor_address),
        email: toText(facts.guarantor_email),
        phone: toText(facts.guarantor_phone),
      });
      return parties;
    case 'residential_sublet_agreement':
      addParty({
        label: 'Head tenant',
        name: firstNonEmpty(facts.head_tenant_name, shared.tenant_primary_name),
        address: firstNonEmpty(facts.head_tenant_address),
        email: firstNonEmpty(facts.head_tenant_email),
        phone: firstNonEmpty(facts.head_tenant_phone),
      });
      addParty({
        label: 'Subtenant',
        name: toText(facts.subtenant_name),
        address: toText(facts.subtenant_address),
        email: toText(facts.subtenant_email),
        phone: toText(facts.subtenant_phone),
      });
      return parties;
    case 'lease_assignment_agreement':
      addParty({
        label: 'Outgoing tenant',
        name: firstNonEmpty(facts.outgoing_tenant_name, shared.tenant_primary_name),
        address: toText(facts.outgoing_tenant_address),
        email: toText(facts.outgoing_tenant_email),
        phone: toText(facts.outgoing_tenant_phone),
      });
      addParty({
        label: 'Incoming tenant',
        name: toText(facts.incoming_tenant_name),
        address: toText(facts.incoming_tenant_address),
        email: toText(facts.incoming_tenant_email),
        phone: toText(facts.incoming_tenant_phone),
      });
      return parties;
    case 'flatmate_agreement': {
      const occupiers = splitNames(facts.flatmate_names || shared.tenant_names);
      return occupiers.map((name, index) => ({
        label: `Occupier ${index + 1}`,
        name,
      }));
    }
    case 'residential_tenancy_application':
      addParty({
        label: 'Applicant',
        name: firstNonEmpty(facts.applicant_name, shared.tenant_primary_name),
        address: toText(facts.current_address),
        email: toText(facts.applicant_email),
        phone: toText(facts.applicant_phone),
      });
      return parties;
    default:
      parties.push(...getNamedTenantParties(shared));
      return parties;
  }
}

function getCounterpartyName(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): string {
  const facts = shared.facts;

  switch (product) {
    case 'guarantor_agreement':
      return toText(facts.guarantor_name);
    case 'residential_sublet_agreement':
      return toText(facts.subtenant_name);
    case 'lease_assignment_agreement':
      return toText(facts.incoming_tenant_name);
    case 'residential_tenancy_application':
      return toText(facts.applicant_name || shared.tenant_primary_name);
    case 'flatmate_agreement':
      return toText(facts.flatmate_names || shared.tenant_names);
    default:
      return toText(shared.tenant_names || shared.tenant_primary_name);
  }
}

function getCounterpartyAddress(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): string {
  const facts = shared.facts;

  switch (product) {
    case 'guarantor_agreement':
      return toText(facts.guarantor_address);
    case 'residential_sublet_agreement':
      return toText(facts.subtenant_address);
    case 'lease_assignment_agreement':
      return toText(facts.incoming_tenant_address);
    case 'residential_tenancy_application':
      return toText(facts.current_address);
    default:
      return '';
  }
}

function getCounterpartyEmail(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): string {
  const facts = shared.facts;

  switch (product) {
    case 'guarantor_agreement':
      return toText(facts.guarantor_email);
    case 'residential_tenancy_application':
      return toText(facts.applicant_email);
    default:
      return '';
  }
}

function getCounterpartyPhone(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): string {
  const facts = shared.facts;

  switch (product) {
    case 'guarantor_agreement':
      return toText(facts.guarantor_phone);
    case 'residential_tenancy_application':
      return toText(facts.applicant_phone);
    default:
      return '';
  }
}

function getSignatureParties(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData,
  config: TemplateConfig
): SignatureParty[] {
  const facts = shared.facts;
  const tenantParties = getNamedTenantParties(shared);
  const parties: SignatureParty[] = [];

  const addSignatureParty = (party: SignatureParty | null) => {
    if (party && party.name) parties.push(party);
  };

  switch (product) {
    case 'guarantor_agreement':
      parties.push(...getLandlordSignatureParties(shared));
      tenantParties.forEach((tenant, index) =>
        addSignatureParty({
          label: tenantParties.length > 1 ? `Tenant ${index + 1}` : 'Tenant',
          name: tenant.name,
        })
      );
      addSignatureParty({
        label: 'Guarantor',
        name: toText(facts.guarantor_name),
        witnessRequired: true,
        witnessNote: 'The guarantor should sign in the presence of an independent adult witness.',
      });
      return parties;
    case 'lease_assignment_agreement':
      parties.push(...getLandlordSignatureParties(shared));
      addSignatureParty({
        label: 'Outgoing tenant',
        name: firstNonEmpty(facts.outgoing_tenant_name, shared.tenant_primary_name),
      });
      addSignatureParty({ label: 'Incoming tenant', name: toText(facts.incoming_tenant_name) });
      return parties;
    case 'residential_sublet_agreement':
      parties.push(...getLandlordSignatureParties(shared, 'Landlord (consent)'));
      addSignatureParty({
        label: 'Head tenant',
        name: firstNonEmpty(facts.head_tenant_name, shared.tenant_primary_name),
      });
      addSignatureParty({ label: 'Subtenant', name: toText(facts.subtenant_name) });
      return parties;
    case 'flatmate_agreement':
      splitNames(facts.flatmate_names || shared.tenant_names).forEach((name, index) =>
        addSignatureParty({ label: `Occupier ${index + 1}`, name })
      );
      return parties;
    case 'residential_tenancy_application':
      addSignatureParty({
        label: 'Applicant',
        name: firstNonEmpty(facts.applicant_name, shared.tenant_primary_name),
      });
      return parties;
    default:
      parties.push(...getLandlordSignatureParties(shared));
      tenantParties.forEach((tenant, index) =>
        addSignatureParty({
          label: tenantParties.length > 1 ? `${config.counterpartyLabel} ${index + 1}` : config.counterpartyLabel,
          name: tenant.name,
        })
      );
      return parties;
  }
}

function getEffectiveDate(product: ResidentialLettingProductSku, shared: SharedResidentialData): string {
  const facts = shared.facts;

  switch (product) {
    case 'guarantor_agreement':
      return firstNonEmpty(facts.guarantee_commencement_date, shared.tenancy_start_date, shared.current_date);
    case 'residential_sublet_agreement':
      return firstNonEmpty(facts.sublet_start_date, shared.current_date);
    case 'lease_amendment':
      return firstNonEmpty(facts.amendment_effective_date, shared.current_date);
    case 'lease_assignment_agreement':
      return firstNonEmpty(facts.assignment_date, shared.current_date);
    case 'rental_inspection_report':
      return firstNonEmpty(facts.inspection_date, shared.current_date);
    case 'flatmate_agreement':
      return firstNonEmpty(facts.arrangement_start_date, shared.tenancy_start_date, shared.current_date);
    case 'renewal_tenancy_agreement':
      return firstNonEmpty(facts.renewal_start_date, shared.current_date);
    case 'repayment_plan_agreement':
      return firstNonEmpty(facts.initial_payment_date, shared.current_date);
    default:
      return firstNonEmpty(shared.tenancy_start_date, shared.current_date);
  }
}

function buildCommonNote(product: ResidentialLettingProductSku, shared: SharedResidentialData): string {
  const notes = [toText(shared.document_notes)];

  if (
    product === 'renewal_tenancy_agreement' &&
    toText(shared.facts.renewal_start_date) >= RENTERS_RIGHTS_ACT_CUTOVER
  ) {
    notes.push(
      'Important: A renewed or replacement fixed term starting on or after 1 May 2026 may be affected by the Renters\' Rights Act 2025 reforms for England assured tenancies. Confirm the current legal position before relying on this document.'
    );
  }

  return notes.filter(Boolean).join('\n\n');
}

function getTemplateSections(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): TemplateSection[] {
  const facts = shared.facts;
  const rentDisplay = formatMoney(shared.rent_amount) || toText(shared.rent_amount);
  const depositDisplay = formatMoney(shared.deposit_amount) || toText(shared.deposit_amount);
  const tenantNames = shared.tenant_names || shared.tenant_primary_name || 'the Tenant';
  const guaranteeCap = formatMoney(facts.guarantee_cap_amount) || toText(facts.guarantee_cap_amount);
  const subletDepositDisplay = formatMoney(facts.sublet_deposit) || toText(facts.sublet_deposit);
  const subletRentDisplay = formatMoney(facts.sublet_rent) || toText(facts.sublet_rent);
  const instalmentAmount = formatMoney(facts.instalment_amount) || toText(facts.instalment_amount);

  switch (product) {
    case 'england_standard_tenancy_agreement':
      return [
        createSection({
          heading: 'Property, Parties, and Occupation Setup',
          intro:
            'This agreement is intended for an ordinary England residential letting of the Property to the named tenant group for occupation as a home.',
          rows: [
            { label: 'Property', value: shared.property_address },
            { label: 'Landlord', value: shared.landlord_name },
            { label: 'Tenant(s)', value: tenantNames },
            { label: 'Property type', value: facts.property_type },
            { label: 'Bedrooms', value: facts.number_of_bedrooms },
            { label: 'Furnished status', value: facts.furnished_status },
            { label: 'Parking included', value: facts.parking_available },
            { label: 'Number of named occupiers', value: facts.number_of_tenants },
          ],
        }),
        createSection({
          heading: 'Core Residential Letting Terms',
          rows: [
            { label: 'Tenancy start date', value: shared.tenancy_start_date },
            { label: 'Rent', value: rentDisplay },
            { label: 'Rent frequency', value: buildEnglandRentFrequencyText(facts.rent_frequency) },
            { label: 'Rent due day', value: facts.rent_due_day },
            { label: 'Payment method', value: buildEnglandPaymentMethodText(facts) },
            { label: 'Deposit', value: depositDisplay },
            { label: 'Included bills', value: facts.included_bills_notes },
          ],
          bullets: [
            'The Property is let for residential occupation as the tenant main home and not for holiday use, business use, or short-term letting unless stated otherwise in writing.',
            'The Tenant must pay the rent on time and comply with the obligations set out in this agreement in relation to care of the Property, reasonable conduct, and lawful occupation.',
            firstNonEmpty(
              facts.landlord_access_notice
                ? `The Landlord should ordinarily give ${facts.landlord_access_notice} notice before non-emergency access and attend at a reasonable time.`
                : '',
              'The Landlord should ordinarily give reasonable notice before non-emergency access and attend at a reasonable time.'
            ),
          ],
        }),
        createSection({
          heading: 'Property Rules and Practical Management',
          rows: [
            { label: 'Pets at the start', value: yesNoText(facts.pets_allowed) },
            { label: 'Smoking inside', value: buildEnglandSmokingPolicyText(facts.smoking_allowed) },
            { label: 'Subletting / Airbnb policy', value: buildEnglandSublettingPolicyText(facts.subletting_allowed) },
            { label: 'Inspection frequency', value: buildEnglandInspectionFrequencyText(facts.inspection_frequency) },
          ],
          bullets: [
            'The Tenant must keep the Property reasonably clean, ventilated, and heated and must report defects or disrepair promptly.',
            'The Tenant must not cause nuisance, anti-social behaviour, or unlawful activity at the Property.',
            ...splitEntries(facts.additional_terms),
          ],
        }),
      ];
    case 'england_premium_tenancy_agreement':
      return [
        createSection({
          heading: 'Property, Parties, and Premium Residential Scope',
          intro:
            'This premium agreement is intended for an ordinary England residential letting where the parties want fuller operational drafting than the baseline standard route.',
          rows: [
            { label: 'Property', value: shared.property_address },
            { label: 'Landlord', value: shared.landlord_name },
            { label: 'Tenant(s)', value: tenantNames },
            { label: 'Property type', value: facts.property_type },
            { label: 'Bedrooms', value: facts.number_of_bedrooms },
            { label: 'Furnished status', value: facts.furnished_status },
            { label: 'Parking included', value: facts.parking_available },
          ],
        }),
        createSection({
          heading: 'Premium Commercial and Management Terms',
          rows: [
            { label: 'Tenancy start date', value: shared.tenancy_start_date },
            { label: 'Rent', value: rentDisplay },
            { label: 'Rent frequency', value: buildEnglandRentFrequencyText(facts.rent_frequency) },
            { label: 'Rent due day', value: facts.rent_due_day },
            { label: 'Payment method', value: buildEnglandPaymentMethodText(facts) },
            { label: 'Deposit', value: depositDisplay },
            { label: 'Rent increase wording', value: facts.rent_increase_method },
            { label: 'Guarantor expected', value: facts.guarantor_expected },
            { label: 'Primary management contact channel', value: formatPremiumOption(facts.management_contact_channel) },
            { label: 'Routine inspection window', value: formatPremiumOption(facts.routine_inspection_window) },
          ],
          bullets: [
            'This premium route remains an ordinary residential product and is not intended to substitute for the dedicated HMO/shared-house, student, or lodger routes where those occupation structures actually apply.',
            'The parties intend a fuller set of management and operational expectations to be recorded in the agreement so day-to-day administration is clearer from the outset.',
          ],
        }),
        createSection({
          heading: 'Premium Operational Detail',
          paragraphs: [
            firstNonEmpty(
              facts.premium_operational_notes,
              'The parties intend the agreement to include fuller operational detail around reporting, access, management, and day-to-day occupation expectations.'
            ),
            toText(facts.premium_management_schedule),
            buildLabeledObservation(
              'Check-in paperwork and evidence expectation',
              facts.check_in_documentation_expectation
            ),
            buildLabeledObservation(
              'Utilities and account transfer expectation',
              facts.utilities_transfer_expectation
            ),
          ],
          bullets: [
            firstNonEmpty(
              facts.landlord_access_notice
                ? `Non-emergency access should usually be on ${facts.landlord_access_notice} notice at a reasonable time.`
                : '',
              'Non-emergency access should usually be on reasonable notice at a reasonable time.'
            ),
            'The Tenant must report maintenance issues promptly and cooperate reasonably with access for inspections, repairs, safety checks, or contractor visits.',
            'The Landlord should keep practical management arrangements proportionate and consistent with the tenancy structure recorded in this agreement.',
          ],
        }),
        createSection({
          heading: 'Premium Handover, Reporting, and Evidence Protocol',
          rows: [
            { label: 'Repairs reporting contact', value: facts.repair_reporting_contact },
            { label: 'Repairs response expectation', value: formatPremiumOption(facts.repair_response_timeframe) },
            { label: 'Check-in paperwork expectation', value: facts.check_in_documentation_expectation },
            { label: 'Utilities transfer expectation', value: facts.utilities_transfer_expectation },
            { label: 'Contractor key release policy', value: facts.contractor_key_release_policy },
            { label: 'Hand-back expectations', value: facts.handover_expectations },
          ],
          bullets: [
            'The Premium pack is designed to travel with the keys handover record, utilities handover sheet, pet-request addendum, tenancy variation record, and premium management schedule.',
            'Where agents, contractors, or concierge teams are involved, the parties should keep the operational file aligned with the agreement and the supporting schedules.',
          ],
        }),
        createSection({
          heading: 'Property Rules and Occupation Controls',
          rows: [
            { label: 'Pets at the start', value: yesNoText(facts.pets_allowed) },
            { label: 'Smoking inside', value: buildEnglandSmokingPolicyText(facts.smoking_allowed) },
            { label: 'Subletting / Airbnb policy', value: buildEnglandSublettingPolicyText(facts.subletting_allowed) },
            { label: 'Inspection frequency', value: buildEnglandInspectionFrequencyText(facts.inspection_frequency) },
          ],
          bullets: [
            ...splitEntries(facts.additional_terms),
          ],
        }),
      ];
    case 'england_student_tenancy_agreement':
      return [
        createSection({
          heading: 'Property, Parties, and Student Letting Setup',
          intro:
            'This student agreement is intended for an England student-focused letting and records the student-specific occupation features chosen for the tenancy file.',
          rows: [
            { label: 'Property', value: shared.property_address },
            { label: 'Landlord', value: shared.landlord_name },
            { label: 'Tenant(s)', value: tenantNames },
            { label: 'All full-time students', value: yesNoText(facts.all_tenants_full_time_students) },
            { label: 'Joint agreement', value: yesNoText(facts.joint_tenancy) },
            { label: 'Guarantor required', value: yesNoText(facts.guarantor_required) },
            { label: 'Tenant replacement procedure', value: yesNoText(facts.student_replacement_procedure) },
          ],
        }),
        createSection({
          heading: 'Student Commercial Terms',
          rows: [
            { label: 'Tenancy start date', value: shared.tenancy_start_date },
            { label: 'Rent', value: rentDisplay },
            { label: 'Rent frequency', value: buildEnglandRentFrequencyText(facts.rent_frequency) },
            { label: 'Rent due day', value: facts.rent_due_day },
            { label: 'Payment method', value: buildEnglandPaymentMethodText(facts) },
            { label: 'Deposit', value: depositDisplay },
          ],
          bullets: [
            'This product is intended for student-focused residential occupation and records the student-specific features chosen for the tenancy.',
            toText(facts.student_fixed_term_requested)
              ? 'If a fixed-term student structure is being considered, the parties should verify separately that the intended structure and wording are appropriate before relying on it.'
              : '',
          ],
        }),
        createSection({
          heading: 'Guarantors, Sharers, and Student Replacements',
          bullets: [
            facts.guarantor_required === 'yes'
              ? 'One or more tenants are expected to provide a guarantor, and any guarantor arrangements should be documented in a separate guarantor deed where required.'
              : 'No guarantor is expected from the facts currently supplied.',
            facts.student_replacement_procedure === 'yes'
              ? 'The agreement is intended to include a tenant replacement procedure so that any proposed substitute occupier is handled through a defined approval process.'
              : 'No express tenant replacement procedure is currently recorded for the tenancy file.',
            facts.joint_tenancy === 'yes'
              ? 'The named tenants are intended to be recorded on one joint agreement.'
              : 'The guided facts indicate the occupiers may not all be on one joint agreement, so the final structure should be checked carefully before use.',
          ],
        }),
        createSection({
          heading: 'End-of-Term Expectations and Practical Notes',
          paragraphs: [
            toText(facts.student_end_of_term_expectations),
            toText(facts.vacation_period_notes),
          ],
          bullets: [
            'Student occupation often benefits from clear expectations on keys, cleaning, hand-back condition, and practical departure arrangements at the end of occupation.',
          ],
        }),
      ];
    case 'england_hmo_shared_house_tenancy_agreement':
      return [
        createSection({
          heading: 'Property, Parties, and Shared-House Setup',
          intro:
            'This HMO/shared-house agreement is intended for an England multi-occupier or shared-house letting where communal areas and sharer detail need to be recorded expressly.',
          rows: [
            { label: 'Property', value: shared.property_address },
            { label: 'Landlord', value: shared.landlord_name },
            { label: 'Tenant(s)', value: tenantNames },
            { label: 'HMO or licensable shared house', value: yesNoText(facts.is_hmo) },
            { label: 'Number of sharers / rooms', value: facts.number_of_sharers },
            { label: 'Unrelated households', value: yesNoText(facts.unrelated_households) },
            { label: 'Room-by-room / shared occupation', value: yesNoText(facts.room_by_room_occupation) },
          ],
        }),
        createSection({
          heading: 'Shared-House Commercial Terms',
          rows: [
            { label: 'Tenancy start date', value: shared.tenancy_start_date },
            { label: 'Rent', value: rentDisplay },
            { label: 'Rent frequency', value: buildEnglandRentFrequencyText(facts.rent_frequency) },
            { label: 'Rent due day', value: facts.rent_due_day },
            { label: 'Payment method', value: buildEnglandPaymentMethodText(facts) },
            { label: 'Deposit', value: depositDisplay },
            { label: 'HMO licence status', value: buildEnglandHmoLicenceStatusText(facts.hmo_licence_status) },
          ],
        }),
        createSection({
          heading: 'Communal Areas and Shared Facilities',
          rows: [
            { label: 'Communal areas', value: facts.communal_areas },
            { label: 'Communal cleaning', value: buildEnglandCommunalCleaningText(facts.communal_cleaning) },
          ],
          bullets: [
            'The communal areas should be used reasonably and kept in a condition that reflects shared occupation.',
            'Sharers should cooperate over use of kitchens, bathrooms, corridors, external spaces, and any other shared facilities identified in this agreement.',
            ...splitEntries(facts.communal_rules_notes),
          ],
        }),
        createSection({
          heading: 'Sharer Conduct and Access',
          bullets: [
            'The occupiers must not obstruct, monopolise, or misuse communal areas, fire routes, or accessways.',
            'The Landlord may attend communal areas and the Property on reasonable notice for management, inspection, repair, safety, cleaning, or licensing-related purposes where appropriate.',
            'House rules and day-to-day controls should reflect the shared-house nature of the occupation rather than an ordinary single-household letting.',
          ],
        }),
      ];
    case 'england_lodger_agreement':
      return [
        createSection({
          heading: 'Resident-Landlord Room Let Setup',
          intro:
            'This lodger agreement is intended for a resident-landlord room let in England where the occupier shares the home with the landlord.',
          rows: [
            { label: 'Property', value: shared.property_address },
            { label: 'Resident landlord', value: shared.landlord_name },
            { label: 'Lodger', value: tenantNames },
            { label: 'Resident landlord confirmed', value: yesNoText(facts.resident_landlord_confirmed) },
            { label: 'Shared kitchen or bathroom', value: yesNoText(facts.shared_kitchen_or_bathroom) },
            { label: 'Occupation start date', value: shared.tenancy_start_date },
          ],
        }),
        createSection({
          heading: 'Room Let Terms',
          rows: [
            { label: 'Rent', value: rentDisplay },
            { label: 'Payment frequency', value: buildEnglandRentFrequencyText(facts.rent_frequency) },
            { label: 'Deposit', value: depositDisplay },
            { label: 'Licence notice period', value: facts.licence_notice_period },
            { label: 'Services included', value: facts.services_included },
          ],
          bullets: [
            'The lodger is granted permission to occupy the agreed room and to use the agreed shared facilities in common with the resident landlord and any other authorised occupiers.',
            'This product is intended for a resident-landlord arrangement and is separate from the ordinary residential tenancy products.',
          ],
        }),
        createSection({
          heading: 'House Rules and Shared Facilities',
          paragraphs: [
            toText(facts.house_rules_notes),
          ],
          bullets: [
            'The lodger should comply with reasonable house rules relating to guests, noise, security, cleanliness, and use of shared areas.',
            'The resident landlord may update practical house rules from time to time provided any update is reasonable and consistent with the overall arrangement.',
          ],
        }),
        createSection({
          heading: 'Ending the Arrangement',
          bullets: [
            firstNonEmpty(
              facts.licence_notice_period
                ? `Either party may ordinarily end the arrangement on ${facts.licence_notice_period} notice unless a different written agreement is made.`
                : '',
              'Either party may ordinarily end the arrangement on reasonable written notice.'
            ),
            'When the arrangement ends, the lodger should return keys, remove personal belongings, and leave the room and shared areas in the condition required by the agreement.',
          ],
        }),
      ];
    case 'guarantor_agreement':
      return [
        createSection({
          heading: 'Definitions and Tenancy Background',
          intro:
            'This deed supports the residential tenancy identified below and should be read together with the tenancy agreement and any written renewals or variations expressly covered by it.',
          rows: [
            { label: 'Original tenancy date', value: facts.original_agreement_date },
            { label: 'Tenancy start date', value: shared.tenancy_start_date },
            { label: 'Tenant(s)', value: tenantNames },
            { label: 'Property', value: shared.property_address },
            { label: 'Current rent', value: rentDisplay },
            { label: 'Deposit', value: depositDisplay },
            { label: 'Liability cap (if any)', value: guaranteeCap },
          ],
        }),
        createSection({
          heading: 'Guarantor Covenant',
          paragraphs: [
            'In consideration of the Landlord granting or continuing the tenancy of the Property, the Guarantor agrees as principal obligor and not merely as surety to perform the obligations set out in this document.',
          ],
          bullets: [
            'to pay the rent and all other sums lawfully due under the tenancy within 14 days after written demand from the Landlord;',
            'to ensure observance and performance of the tenant covenants contained in the tenancy agreement;',
            'to indemnify the Landlord against losses, damage, and reasonably incurred enforcement costs arising from tenant default.',
          ],
        }),
        createSection({
          heading: 'Nature of Liability',
          bullets: [
            shared.tenant_names.includes(',')
              ? 'Where there is more than one tenant, this guarantee applies on a joint and several basis to the obligations of each tenant and the tenancy as a whole.'
              : 'The Guarantor is liable for the whole of the guaranteed obligations and not merely a proportion of them.',
            'The Landlord may proceed directly against the Guarantor without first taking action against the Tenant, any deposit, or any other security.',
            'Any delay, indulgence, concession, acceptance of part payment, or failure by the Landlord to enforce promptly does not by itself release the Guarantor.',
          ],
        }),
        createSection({
          heading: 'Continuing Guarantee, Renewal, and Variation',
          paragraphs: [
            facts.guarantee_continues_after_renewal === false
              ? 'This guarantee is limited to the tenancy term identified in this document and does not extend to any renewal, replacement tenancy, or further fixed term unless the Guarantor gives fresh written consent.'
              : 'This guarantee is intended to continue for the tenancy, any statutory periodic continuation, and any renewal or written variation of the same tenancy for the same Property and substantially the same tenant group.',
            'No material increase in the Guarantor\'s liability is intended to bind the Guarantor unless that increase is stated in this document or separately accepted by the Guarantor in writing.',
          ],
        }),
        createSection({
          heading: 'Notices and Information',
          rows: [
            { label: 'Guarantor name', value: facts.guarantor_name },
            { label: 'Guarantor address for service', value: facts.guarantor_address },
            { label: 'Guarantor email', value: facts.guarantor_email },
            { label: 'Guarantor phone', value: facts.guarantor_phone },
            { label: 'Relationship to tenant', value: facts.guarantor_relationship },
          ],
          bullets: [
            'The Guarantor must notify the Landlord promptly of any change to the contact details set out above.',
            'Any notice or demand may be served by hand, first-class post, or email to the contact details stated in this document unless updated in writing.',
          ],
        }),
        createSection({
          heading: 'Release, Limitation, and Advice',
          paragraphs: [
            guaranteeCap
              ? `The Guarantor\'s aggregate liability is capped at ${guaranteeCap}, save for liabilities already accrued before release and any expressly excluded from the cap in this document.`
              : 'If no express financial cap is stated in this document, the guarantee applies to the full amount of the guaranteed obligations arising under the tenancy.',
          ],
          bullets: [
            'The Guarantor is released only when the tenancy has ended, all guaranteed liabilities have been discharged, or the Landlord gives an express written release.',
            'The Guarantor acknowledges that they have had the opportunity to read the tenancy agreement and to take independent legal advice before signing.',
          ],
        }),
        createSection({
          heading: 'Governing Law and Execution',
          paragraphs: [
            'This guarantee and any dispute arising out of it are governed by the law of England and Wales.',
            'The parties intend this document to take effect as a deed executed by the Guarantor.',
          ],
        }),
      ];
    case 'residential_sublet_agreement':
      return [
        createSection({
          heading: 'Head Tenancy and Grant of Subtenancy',
          intro:
            'This agreement records a subletting arrangement granted out of an existing tenancy and must remain consistent with the head tenancy and any landlord consent.',
          rows: [
            { label: 'Head tenancy date', value: facts.original_agreement_date },
            { label: 'Head tenant', value: firstNonEmpty(facts.head_tenant_name, shared.tenant_primary_name) },
            { label: 'Subtenant', value: facts.subtenant_name },
            { label: 'Landlord consent status', value: facts.landlord_consent_status },
            { label: 'Consent reference / date', value: firstNonEmpty(facts.landlord_consent_reference, facts.landlord_consent_date) },
            { label: 'Area sublet', value: firstNonEmpty(facts.sublet_scope, shared.property_address) },
            { label: 'Subtenancy start date', value: facts.sublet_start_date },
            { label: 'Subtenancy end date', value: facts.sublet_end_date },
          ],
        }),
        createSection({
          heading: 'Grant, Use, and Occupation',
          bullets: [
            'The Head Tenant lets the agreed part of the Property to the Subtenant for the term stated in this agreement and for residential occupation only.',
            'The Subtenant acquires no greater rights than the Head Tenant can lawfully grant under the head tenancy.',
            facts.permitted_use || 'The Property must be used as a private residence and not for any illegal, immoral, or business purpose.',
            facts.house_rules || 'The Subtenant must comply with any reasonable house rules, building regulations, and estate rules notified by the Head Tenant or Landlord.',
          ],
        }),
        createSection({
          heading: 'Rent, Deposit, and Bills',
          rows: [
            { label: 'Sublet rent', value: subletRentDisplay },
            { label: 'Rent due day', value: firstNonEmpty(facts.sublet_rent_due_day, facts.rent_due_day) },
            { label: 'Deposit', value: subletDepositDisplay },
            { label: 'Bills / utilities arrangement', value: firstNonEmpty(facts.sublet_bills_arrangement, facts.utilities_responsibility) },
            {
              label: 'Payment method',
              value: formatSelectionValue(
                firstNonEmpty(facts.payment_method, facts.sublet_payment_method).toLowerCase().replace(/\s+/g, '_'),
                {
                  standing_order: 'Bank transfer',
                  bank_transfer: 'Bank transfer',
                  cash: 'Cash',
                }
              ),
            },
          ],
          bullets: [
            'The Subtenant must pay rent and any agreed utility contribution on the due dates stated above.',
            subletDepositDisplay
              ? 'Any deposit taken must be held and dealt with in accordance with applicable deposit protection requirements where the subtenancy is an assured shorthold tenancy.'
              : '',
          ],
        }),
        createSection({
          heading: 'Subtenant Obligations',
          bullets: [
            'to keep the occupied accommodation reasonably clean, ventilated, and heated, and to report defects promptly;',
            'to avoid nuisance, harassment, or anti-social behaviour affecting neighbours or other occupiers;',
            'not to assign, sublet, part with possession, or allow additional occupiers without the Head Tenant\'s written consent and any consent required under the head tenancy;',
            'to permit access on reasonable notice for inspection, repairs, safety checks, or viewings where the head tenancy permits.',
            ...splitEntries(facts.subtenant_additional_obligations),
          ],
        }),
        createSection({
          heading: 'Head Tenant Continuing Liability and Indemnity',
          paragraphs: [
            'The Head Tenant remains liable to the Landlord for compliance with the head tenancy during the subtenancy unless the Landlord expressly agrees otherwise in writing.',
            'The Subtenant must indemnify the Head Tenant against losses, claims, or liabilities arising from the Subtenant\'s breach of this agreement or of the head tenancy obligations so far as they apply to the Subtenant\'s occupation.',
          ],
        }),
        createSection({
          heading: 'Termination',
          bullets: [
            'This agreement ends automatically when the stated subtenancy term expires unless renewed in writing.',
            'It may be terminated earlier if the head tenancy ends, if landlord consent is withdrawn where lawfully permitted, or for material breach after written notice where the breach is not remedied within a reasonable time.',
            firstNonEmpty(
              facts.sublet_notice_period,
              facts.notice_period_between_flatmates
                ? `Either party may give ${facts.notice_period_between_flatmates} written notice to end the arrangement.`
                : ''
            ),
          ],
        }),
        createSection({
          heading: 'Governing Law',
          paragraphs: ['This agreement is governed by the law of England and Wales.'],
        }),
      ];
    case 'lease_amendment':
      return [
        createSection({
          heading: 'Existing Tenancy Agreement',
          intro:
            'This document records a targeted variation only. It should be kept with the original tenancy agreement and read together with it.',
          rows: [
            { label: 'Original tenancy date', value: facts.original_agreement_date },
            { label: 'Property', value: shared.property_address },
            { label: 'Landlord', value: shared.landlord_name },
            { label: 'Tenant(s)', value: tenantNames },
            { label: 'Amendment effective date', value: facts.amendment_effective_date },
            { label: 'Clauses / provisions amended', value: facts.amendment_scope },
          ],
        }),
        createSection({
          heading: 'Interpretation and Effect',
          paragraphs: [
            'The parties intend this document to vary the original tenancy agreement only to the extent expressly stated below and not to replace the whole tenancy.',
            'Unless the context requires otherwise, references in this amendment to the tenancy agreement are references to the original tenancy agreement as varied by this document.',
          ],
        }),
        createSection({
          heading: 'Agreed Amendments',
          paragraphs: [
            firstNonEmpty(facts.replacement_clause_text, facts.amendment_summary, facts.changed_terms_summary),
          ],
          bullets: splitEntries(facts.additional_terms),
        }),
        createSection({
          heading: 'Clause Amendment Matrix',
          intro:
            'The following clause-by-clause schedule forms part of this amendment and should be read with the original tenancy wording.',
          table: {
            columns: ['Clause reference', 'Current wording summary', 'Replacement wording', 'Effective date'],
            rows: buildRepeaterTableRows(
              facts.amendment_rows,
              ['Clause reference', 'Current wording summary', 'Replacement wording', 'Effective date'],
              [
                (row) => row.clause_reference,
                (row) => row.current_wording_summary || row.current_position,
                (row) => row.replacement_wording || row.replacement_text,
                (row) => row.effective_date || facts.amendment_effective_date,
              ]
            ),
          },
        }),
        createSection({
          heading: 'Continuing Effect of Original Agreement',
          paragraphs: [
            'Except as expressly amended by this document, all terms of the original tenancy agreement remain unchanged and in full force and effect.',
            'The parties confirm that no waiver of any prior breach is intended unless expressly stated in this amendment.',
          ],
        }),
        createSection({
          heading: 'No Surrender and Regrant Intended',
          paragraphs: [
            'The parties intend this document to operate as a written variation to the existing tenancy and not as a surrender and regrant of the tenancy except to the extent that the law may require otherwise.',
          ],
        }),
        createSection({
          heading: 'Governing Law',
          paragraphs: ['This amendment is governed by the law of England and Wales.'],
        }),
      ];
    case 'lease_assignment_agreement':
      return [
        createSection({
          heading: 'Original Tenancy and Consent',
          intro:
            'This agreement records the assignment of the tenancy from the Outgoing Tenant to the Incoming Tenant and the Landlord\'s consent to that assignment so far as stated here.',
          rows: [
            { label: 'Original tenancy date', value: facts.original_agreement_date },
            { label: 'Outgoing tenant', value: firstNonEmpty(facts.outgoing_tenant_name, shared.tenant_primary_name) },
            { label: 'Incoming tenant', value: facts.incoming_tenant_name },
            { label: 'Assignment date', value: facts.assignment_date },
            { label: 'Landlord consent status', value: facts.landlord_consent_status },
            { label: 'Consent reference / date', value: firstNonEmpty(facts.landlord_consent_reference, facts.landlord_consent_date) },
          ],
        }),
        createSection({
          heading: 'Assignment',
          paragraphs: [
            'With effect from the assignment date, the Outgoing Tenant assigns to the Incoming Tenant the Outgoing Tenant\'s interest in the tenancy so far as capable of assignment.',
            'From the assignment date, the Incoming Tenant is entitled to occupy the Property subject to the terms of the tenancy agreement.',
          ],
        }),
        createSection({
          heading: 'Incoming Tenant Covenant',
          bullets: [
            'The Incoming Tenant covenants with the Landlord to pay the rent and all other sums due under the tenancy from the assignment date.',
            'The Incoming Tenant covenants to observe and perform the tenant obligations in the tenancy agreement from the assignment date.',
            ...splitEntries(facts.assignment_notes),
          ],
        }),
        createSection({
          heading: 'Release of Outgoing Tenant',
          paragraphs: [
            facts.release_outgoing_tenant === 'full_release'
              ? 'The Landlord releases the Outgoing Tenant from tenant obligations falling due after the assignment date, but not from liabilities already accrued before that date.'
              : facts.release_outgoing_tenant === 'partial_release'
                ? 'The Outgoing Tenant is released only to the limited extent stated in this agreement. Any liabilities not expressly released remain enforceable.'
                : 'Unless the Landlord expressly releases the Outgoing Tenant in this clause, the Outgoing Tenant remains liable for any liabilities that remain enforceable against them under the tenancy and general law.',
          ],
        }),
        createSection({
          heading: 'Deposit, Apportionments, and Handover',
          rows: [
            { label: 'Deposit treatment', value: firstNonEmpty(facts.deposit_treatment, facts.assignment_deposit_treatment) },
            { label: 'Rent / utility apportionment', value: firstNonEmpty(facts.assignment_apportionments, facts.assignment_scope) },
            { label: 'Keys / access devices handover', value: firstNonEmpty(facts.keys_handover_notes, facts.assignment_key_handover) },
          ],
          bullets: [
            'Any deposit arrangements must be handled in accordance with the requirements of the relevant tenancy deposit scheme and any prescribed information obligations.',
          ],
        }),
        createSection({
          heading: 'Apportionment Schedule',
          table: {
            columns: ['Item', 'Amount', 'Note'],
            rows: buildRepeaterTableRows(
              facts.assignment_apportionment_rows,
              ['Item', 'Amount', 'Note'],
              [
                (row) => row.item,
                (row) => formatMoney(row.amount),
                (row) => row.note,
              ]
            ),
          },
        }),
        createSection({
          heading: 'Records and Governing Law',
          paragraphs: [
            'This agreement should be stored with the tenancy file together with the original tenancy agreement and any landlord consent to assignment.',
            'This assignment agreement is governed by the law of England and Wales.',
          ],
        }),
      ];
    case 'residential_tenancy_application':
      return [
        createSection({
          heading: 'Applicant and Proposed Letting',
          rows: [
            { label: 'Applicant name', value: facts.applicant_name },
            { label: 'Date of birth', value: facts.applicant_date_of_birth },
            { label: 'Email', value: facts.applicant_email },
            { label: 'Telephone', value: facts.applicant_phone },
            { label: 'Current address', value: facts.current_address },
            { label: 'Desired move-in date', value: firstNonEmpty(facts.desired_move_in_date, facts.proposed_move_in_date) },
            { label: 'Property applied for', value: shared.property_address },
          ],
        }),
        createSection({
          heading: 'Employment and Income',
          rows: [
            { label: 'Employment status', value: facts.employment_status },
            { label: 'Employer / organisation', value: facts.employer_name },
            { label: 'Job title / course', value: facts.job_title },
            { label: 'Annual income', value: formatMoney(facts.annual_income) || facts.annual_income },
            { label: 'Additional income / benefits', value: facts.additional_income_details },
          ],
        }),
        createSection({
          heading: 'Current Accommodation and References',
          rows: [
            { label: 'Current landlord / agent', value: firstNonEmpty(facts.current_landlord_name, facts.reference_contact_name) },
            { label: 'Reference contact details', value: firstNonEmpty(facts.current_landlord_contact, facts.reference_contact_details) },
            { label: 'Current monthly rent', value: formatMoney(facts.current_rent_amount) || facts.current_rent_amount },
            { label: 'Length of occupation', value: facts.length_of_occupation },
            { label: 'Reason for moving', value: facts.reason_for_moving },
          ],
        }),
        createSection({
          heading: 'Occupiers and Relevant Disclosures',
          rows: [
            { label: 'Adult occupiers', value: facts.applicant_occupants },
            { label: 'Children', value: facts.children_count },
            { label: 'Pets', value: yesNoText(facts.applicant_has_pets) },
            { label: 'Smoking household', value: yesNoText(facts.applicant_smoker) },
            { label: 'Adverse credit / CCJ / insolvency details', value: facts.adverse_credit_details },
          ],
        }),
        createSection({
          heading: 'Referencing and Data Use',
          paragraphs: [
            'The Applicant authorises the Landlord and any instructed letting agent or referencing provider to verify identity, residence history, affordability, credit status, landlord references, and right to rent information for the purposes of assessing this application.',
            'The Applicant confirms that information supplied in this application may be stored and used for pre-tenancy administration, anti-fraud checks, and record keeping connected with the proposed letting.',
            'If the application does not proceed, personal data should be retained only so far as reasonably necessary for legitimate business, legal, or regulatory purposes.',
          ],
        }),
      ];
    case 'rental_inspection_report':
      return [
        createSection({
          heading: 'Inspection Particulars',
          intro:
            'This report is intended to provide a dated evidential record of the accommodation inspected and the visible condition observed at the time of inspection.',
          rows: [
            { label: 'Inspection date', value: facts.inspection_date },
            { label: 'Inspection type', value: facts.inspection_type || 'Move-in / move-out inspection' },
            { label: 'Inspector', value: firstNonEmpty(facts.inspector_name, facts.agent_name, shared.landlord_name) },
            { label: 'Occupier or representative present', value: facts.inspection_attended_by },
            { label: 'Furnished status', value: facts.furnished_status },
            { label: 'Photo / video reference', value: facts.photo_schedule_reference },
          ],
        }),
        createSection({
          heading: 'Property Layout and Areas Inspected',
          paragraphs: [
            firstNonEmpty(
              facts.property_layout_notes,
              'The inspection covered the accommodation, common parts reasonably accessible to the inspector, and any external areas identified in this report.'
            ),
          ],
        }),
        createSection({
          heading: 'Keys, Utilities, and Safety',
          rows: [
            { label: 'Keys provided', value: facts.keys_provided_count },
            { label: 'Keys / fobs / access devices', value: firstNonEmpty(facts.keys_provided_summary, facts.keys_handover_notes, facts.keys_issued) },
            { label: 'Combined meter readings', value: facts.utility_meter_readings },
            { label: 'Gas meter', value: facts.meter_reading_gas },
            { label: 'Electric meter', value: facts.meter_reading_electric },
            { label: 'Water meter', value: facts.meter_reading_water },
            { label: 'Alarm test summary', value: facts.alarm_test_summary },
            { label: 'Safety observations', value: facts.safety_checks_summary },
          ],
        }),
        createSection({
          heading: 'Room-by-Room Observations',
          paragraphs: [
            Array.isArray(facts.inspection_rooms) && facts.inspection_rooms.length > 0
              ? `Detailed room-by-room sections are attached below for ${facts.inspection_rooms.length} room(s) or area(s), including observations, item notes, and any linked photo references.`
              : 'Detailed room-by-room observations are set out below together with any item-level notes or photo references captured during the inspection.',
          ],
        }),
        createSection({
          heading: 'Cleanliness, Defects, and Follow-Up',
          paragraphs: [
            firstNonEmpty(facts.cleanliness_overview, facts.cleanliness_notes),
            firstNonEmpty(facts.defects_action_items, facts.damage_notes),
            toText(facts.tenant_comments),
            'Any photographs, videos, inventories, signed attendance notes, safety certificates, and follow-up correspondence should be retained with this report as part of the landlord evidence record.',
          ],
        }),
        createSection({
          heading: 'Follow-Up Action Schedule',
          table: {
            columns: ['Issue / area', 'Action required', 'Owner', 'Target date'],
            rows: buildRepeaterTableRows(
              facts.follow_up_items,
              ['Issue / area', 'Action required', 'Owner', 'Target date'],
              [
                (row) => row.issue || row.room,
                (row) => row.action_required || row.action,
                (row) => row.owner,
                (row) => row.target_date,
              ]
            ),
          },
        }),
        createSection({
          heading: 'Use of Report and Governing Law',
          paragraphs: [
            'This report is intended for use in connection with an England residential tenancy and may be relied on together with the tenancy agreement, inventories, photographs, and other contemporaneous evidence.',
            'This report is governed by the law of England and Wales.',
          ],
        }),
      ];
    case 'flatmate_agreement':
      return [
        createSection({
          heading: 'Status of Arrangement',
          intro:
            'This agreement records practical arrangements between occupiers sharing the Property. It does not by itself create a new tenancy with the Landlord or vary the landlord-facing tenancy unless the Landlord signs a separate document to that effect.',
          rows: [
            { label: 'Occupiers', value: facts.flatmate_names || shared.tenant_names },
            { label: 'Arrangement start date', value: firstNonEmpty(facts.arrangement_start_date, shared.tenancy_start_date) },
            { label: 'Property', value: shared.property_address },
            { label: 'Main tenancy / licence reference date', value: facts.original_agreement_date },
          ],
        }),
        createSection({
          heading: 'Contributions and Shared Costs',
          rows: [
            { label: 'Room allocation', value: facts.room_allocation },
            { label: 'Rent split', value: facts.rent_split },
            { label: 'Bills split', value: facts.bills_split },
            { label: 'Shared purchases', value: facts.shared_purchases },
            { label: 'Replacement occupant process', value: facts.replacement_occupier_process },
          ],
        }),
        createSection({
          heading: 'House Rules and Conduct',
          bullets: [
            facts.house_rules,
            facts.cleaning_schedule,
            facts.guest_rules,
            facts.quiet_hours,
            'Each occupier must respect neighbours, keep common areas reasonably tidy, and comply with the obligations contained in the main tenancy or licence.',
          ],
        }),
        createSection({
          heading: 'Communication and Dispute Resolution',
          paragraphs: [
            firstNonEmpty(
              facts.dispute_resolution,
              'The occupiers will discuss disputes promptly and in good faith, share relevant bill evidence on request, and try to resolve disagreements before involving the Landlord.'
            ),
          ],
        }),
        createSection({
          heading: 'Exit Arrangements',
          rows: [
            { label: 'Notice between flatmates', value: facts.notice_period_between_flatmates },
            { label: 'Exit settlement arrangements', value: facts.exit_arrangements },
          ],
          bullets: [
            'An occupier leaving remains responsible for their agreed share of rent, bills, and damage up to the expiry of the agreed notice period unless the others agree a written replacement arrangement.',
          ],
        }),
        createSection({
          heading: 'Governing Law',
          paragraphs: ['This agreement is governed by the law of England and Wales.'],
        }),
      ];
    case 'renewal_tenancy_agreement':
      return [
        createSection({
          heading: 'Existing Tenancy and Renewal Overview',
          intro:
            'This document records the parties\' agreement for a further tenancy term or renewed tenancy arrangement for the same Property.',
          rows: [
            { label: 'Original tenancy date', value: facts.original_agreement_date },
            { label: 'Current tenancy end date', value: firstNonEmpty(facts.current_tenancy_end_date, shared.tenancy_end_date) },
            { label: 'Renewal start date', value: facts.renewal_start_date },
            { label: 'Renewal end date', value: facts.renewal_end_date },
            {
              label: 'Renewed rent',
              value:
                formatMoney(facts.renewal_rent_amount) ||
                facts.renewal_rent_amount ||
                rentDisplay,
            },
          ],
        }),
        createSection({
          heading: 'Renewed Term',
          paragraphs: [
            'The parties agree that, from the renewal start date, the tenancy of the Property will continue for the renewed term on the terms of the existing tenancy except as expressly varied by this document.',
          ],
        }),
        createSection({
          heading: 'Terms Continuing and Terms Changed',
          paragraphs: [
            firstNonEmpty(facts.renewal_terms_summary, 'All clauses of the existing tenancy continue to apply except where this renewal expressly states otherwise.'),
          ],
          bullets: splitEntries(facts.additional_terms),
        }),
        createSection({
          heading: 'Changed Terms Schedule',
          table: {
            columns: ['Clause / topic', 'Previous position', 'New wording / updated term'],
            rows: buildRepeaterTableRows(
              facts.changed_terms_schedule,
              ['Clause / topic', 'Previous position', 'New wording / updated term'],
              [
                (row) => row.topic || row.clause_reference,
                (row) => row.previous_position || row.current_position,
                (row) => row.new_position,
              ]
            ),
          },
        }),
        createSection({
          heading: 'Deposit and Compliance',
          rows: [
            { label: 'Deposit amount', value: depositDisplay },
            { label: 'Deposit scheme', value: facts.deposit_scheme_name },
            { label: 'Compliance review / prescribed information notes', value: firstNonEmpty(facts.renewal_compliance_notes, facts.deposit_reconfirmation_notes) },
          ],
          paragraphs: [
            'The parties should ensure that any deposit protection, prescribed information, right to rent, licensing, or other compliance steps requiring refresh or confirmation in connection with the renewal are addressed alongside this document.',
          ],
        }),
        createSection({
          heading: 'Relationship with Existing Tenancy',
          paragraphs: [
            'Except as expressly updated by this renewal, all other terms of the existing tenancy remain in force.',
            'This renewal should be stored with the earlier tenancy documents so that there is a clear written chain of the tenancy arrangements for the Property.',
          ],
        }),
        createSection({
          heading: 'Governing Law',
          paragraphs: ['This renewal agreement is governed by the law of England and Wales.'],
        }),
      ];
    case 'repayment_plan_agreement':
      return [
        createSection({
          heading: 'Acknowledgment of Arrears',
          intro:
            'This agreement records a repayment arrangement for rent arrears without waiving the Landlord\'s rights unless expressly stated.',
          rows: [
            { label: 'Arrears amount', value: formatMoney(facts.arrears_amount) || facts.arrears_amount },
            { label: 'Arrears calculated as at', value: facts.arrears_date },
            { label: 'Current contractual rent', value: rentDisplay },
            { label: 'Rent due day', value: facts.rent_due_day },
          ],
        }),
        createSection({
          heading: 'Repayment Schedule',
          rows: [
            { label: 'First repayment date', value: facts.initial_payment_date },
            { label: 'Instalment amount', value: instalmentAmount },
            { label: 'Instalment frequency', value: facts.repayment_frequency },
            { label: 'Final settlement date', value: firstNonEmpty(facts.final_deadline, facts.repayment_end_date) },
            { label: 'Payment method', value: buildEnglandPaymentMethodText(facts) },
          ],
        }),
        createSection({
          heading: 'Instalment Schedule',
          table: {
            columns: ['Due date', 'Instalment amount', 'Running balance', 'Note'],
            rows: buildRepeaterTableRows(
              facts.repayment_schedule_rows,
              ['Due date', 'Instalment amount', 'Running balance', 'Note'],
              [
                (row) => row.due_date,
                (row) => formatMoney(row.amount),
                (row) => formatMoney(row.running_balance || row.balance_after_payment),
                (row) => row.note,
              ]
            ),
          },
        }),
        createSection({
          heading: 'Ongoing Rent and Application of Payments',
          bullets: [
            'The Tenant must continue to pay the ongoing contractual rent in full on the usual due date as well as each instalment under this repayment plan.',
            'Unless the parties agree otherwise in writing, payments received will be applied first to current rent and then to arrears.',
            firstNonEmpty(facts.payment_details, facts.payment_reference_override),
          ],
        }),
        createSection({
          heading: 'Default',
          paragraphs: [
            firstNonEmpty(
              facts.default_consequences,
              'If any instalment or any current rent payment is missed, late, or dishonoured, the Landlord may cancel this plan, demand immediate payment of the outstanding balance, and take any lawful recovery action.'
            ),
          ],
          bullets: [
            firstNonEmpty(
              facts.default_grace_days
                ? `A payment will be treated as in default if it is not received within ${facts.default_grace_days} day(s) of the due date.`
                : ''
            ),
          ],
        }),
        createSection({
          heading: 'Reservation of Rights',
          paragraphs: [
            'Entering into this repayment plan does not amount to a waiver of the Landlord\'s rights in relation to the arrears, any continuing breach, or any statutory or court remedy available to the Landlord.',
            'Any variation to this plan must be in writing and signed by both parties.',
          ],
        }),
        createSection({
          heading: 'Governing Law',
          paragraphs: ['This agreement is governed by the law of England and Wales.'],
        }),
      ];
    default:
      return [];
  }
}

function buildDefinedTerms(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): TemplateDefinedTerm[] | undefined {
  const facts = shared.facts;
  const landlord = shared.landlord_name || 'the Landlord';
  const tenant = shared.tenant_primary_name || shared.tenant_names || 'the Tenant';

  switch (product) {
    case 'guarantor_agreement':
      return cleanDefinedTerms([
        {
          term: 'Tenancy',
          meaning:
            'the residential tenancy of the Property identified in this deed together with any continuation, periodic continuation, or renewal expressly covered by it',
        },
        { term: 'Guarantor', meaning: firstNonEmpty(facts.guarantor_name, 'the guarantor named in this deed') },
        { term: 'Tenant Obligations', meaning: 'the obligations of the Tenant under the tenancy including rent, damage, and other sums properly due' },
      ]);
    case 'residential_sublet_agreement':
      return cleanDefinedTerms([
        { term: 'Head Tenancy', meaning: 'the existing tenancy under which the Head Tenant occupies the Property' },
        { term: 'Subtenancy', meaning: 'the subletting arrangement created by this agreement out of the Head Tenancy' },
        { term: 'Subtenant', meaning: firstNonEmpty(facts.subtenant_name, 'the subtenant identified in this agreement') },
      ]);
    case 'lease_amendment':
      return cleanDefinedTerms([
        { term: 'Existing Tenancy', meaning: 'the earlier tenancy agreement between the parties for the Property' },
        { term: 'Amendment Effective Date', meaning: firstNonEmpty(facts.amendment_effective_date, shared.current_date) },
        { term: 'Amended Clauses', meaning: 'only the clauses expressly varied by this document, with all other terms remaining in force' },
      ]);
    case 'lease_assignment_agreement':
      return cleanDefinedTerms([
        { term: 'Existing Tenancy', meaning: 'the tenancy of the Property immediately before the assignment date' },
        { term: 'Outgoing Tenant', meaning: firstNonEmpty(facts.outgoing_tenant_name, 'the tenant transferring their interest') },
        { term: 'Incoming Tenant', meaning: firstNonEmpty(facts.incoming_tenant_name, 'the tenant taking the assigned interest') },
        { term: 'Assignment Date', meaning: firstNonEmpty(facts.assignment_date, facts.assignment_effective_date, shared.current_date) },
      ]);
    case 'repayment_plan_agreement':
      return cleanDefinedTerms([
        { term: 'Arrears', meaning: 'the unpaid rent and any other sums stated in this agreement as outstanding under the tenancy' },
        { term: 'Instalment', meaning: 'each repayment due on the dates and in the amounts recorded in this agreement' },
        { term: 'Tenancy', meaning: `the tenancy of ${shared.property_address || 'the Property'} under which the arrears arose` },
      ]);
    case 'flatmate_agreement':
      return cleanDefinedTerms([
        { term: 'Shared Home', meaning: `the dwelling at ${shared.property_address || 'the Property'} occupied by the parties to this agreement` },
        { term: 'Occupiers', meaning: firstNonEmpty(shared.tenant_names, tenant) },
        { term: 'House Rules', meaning: 'the conduct, cleaning, guest, noise, and contribution arrangements recorded in this agreement' },
      ]);
    case 'renewal_tenancy_agreement':
      return cleanDefinedTerms([
        { term: 'Existing Tenancy', meaning: 'the earlier tenancy agreement for the Property that this renewal supplements' },
        { term: 'Renewal Start Date', meaning: firstNonEmpty(facts.renewal_start_date, shared.current_date) },
        { term: 'Renewed Rent', meaning: firstNonEmpty(formatMoney(facts.renewal_rent_amount), facts.renewal_rent_amount, formatMoney(shared.rent_amount), shared.rent_amount) },
      ]);
    default:
      return cleanDefinedTerms([
        { term: 'Property', meaning: firstNonEmpty(shared.property_address, 'the property identified in this document') },
        { term: 'Landlord', meaning: landlord },
        { term: 'Tenant', meaning: tenant },
      ]);
  }
}

function buildDocumentReference(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): string {
  const suffix = buildDocumentReferenceSuffix(shared);

  const referenceCode =
    RESIDENTIAL_DOCUMENT_REFERENCE_CODES[product] || product.replace(/_/g, '-').toUpperCase();

  return `RL-${referenceCode}-${suffix}`;
}

function buildDocumentReferenceSuffix(shared: SharedResidentialData): string {
  const caseId = toText(shared.facts.case_id);
  if (!caseId) return toText(shared.current_date).replace(/-/g, '');

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)) {
    return caseId.replace(/-/g, '').slice(-8).toUpperCase();
  }

  const segments = caseId
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase()
    .split('-')
    .filter(Boolean);

  if (segments.length >= 2) {
    return segments.slice(-2).join('-');
  }

  return segments[0] || toText(shared.current_date).replace(/-/g, '');
}

function buildTemplateData(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData,
  config: TemplateConfig
) {
  const effectiveDate = getEffectiveDate(product, shared);
  const sections = getTemplateSections(product, shared);
  const rentAmountDisplay = formatMoney(shared.rent_amount) || toText(shared.rent_amount);
  const depositAmountDisplay = formatMoney(shared.deposit_amount) || toText(shared.deposit_amount);
  const documentReference = buildDocumentReference(product, shared);
  const parties = getPartyDetails(product, shared);
  const signatureParties = getSignatureParties(product, shared, config);
  const inspectionRooms =
    product === 'rental_inspection_report' ? buildStructuredInspectionRooms(shared.facts) : [];
  const evidenceAppendix =
    product === 'rental_inspection_report'
      ? buildEvidenceAppendix(shared.facts.inspection_evidence_files)
      : [];
  const documentFactsRows =
    cleanRows([
      { label: 'Property', value: shared.property_address },
      { label: 'Parties', value: firstNonEmpty(shared.tenant_names, getCounterpartyName(product, shared)) },
      { label: 'Reference', value: documentReference },
      { label: 'Generated on', value: shared.current_date },
      { label: 'Purpose', value: config.subtitle },
      { label: 'Prepared using guided responses', value: 'Yes' },
    ]) || [];

  return {
    title: config.title,
    subtitle: config.subtitle,
    intro: config.intro,
    generated_on: shared.current_date,
    current_date: shared.current_date,
    document_date: shared.current_date,
    effective_date: effectiveDate,
    agreement_date: effectiveDate,
    nature_of_document: config.natureOfDocument || config.subtitle,
    property_address: shared.property_address,
    landlord_name: shared.landlord_name,
    landlord_address: shared.landlord_address,
    landlord_email: shared.landlord_email,
    landlord_phone: shared.landlord_phone,
    tenant_names: shared.tenant_names,
    tenant_primary_name: shared.tenant_primary_name,
    counterparty_name: getCounterpartyName(product, shared),
    counterparty_address: getCounterpartyAddress(product, shared),
    counterparty_email: getCounterpartyEmail(product, shared),
    counterparty_phone: getCounterpartyPhone(product, shared),
    rent_amount: shared.rent_amount,
    rent_amount_display: rentAmountDisplay,
    deposit_amount: shared.deposit_amount,
    deposit_amount_display: depositAmountDisplay,
    tenancy_start_date: shared.tenancy_start_date,
    tenancy_end_date: shared.tenancy_end_date,
    inspection_date: firstNonEmpty(shared.facts.inspection_date, effectiveDate),
    inspection_type: shared.facts.inspection_type,
    inspector_name: firstNonEmpty(shared.facts.inspector_name, shared.landlord_name),
    sections,
    notes: buildCommonNote(product, shared),
    parties,
    signature_parties: signatureParties,
    defined_terms: buildDefinedTerms(product, shared),
    document_reference: documentReference,
    recitals: config.recitals || [],
    execution_statement:
      config.executionStatement ||
      'This document should be signed and dated by the parties and retained with the tenancy records.',
    execution_as_deed: config.executionAsDeed === true,
    deed_warning: toText(config.deedWarning),
    case_id: toText(shared.facts.case_id),
    document_facts_rows: documentFactsRows,
    inspection_rooms: inspectionRooms,
    evidence_appendix: evidenceAppendix,
    facts: shared.facts,
  };
}

function buildRentArrearsLetterData(
  shared: SharedResidentialData
): RentArrearsLetterTemplateData {
  const facts = shared.facts;
  const tenantName = shared.tenant_primary_name || shared.tenant_names || 'the Tenant';
  const arrearsAmount = formatMoney(facts.arrears_amount) || toText(facts.arrears_amount);
  const letterType = toText(facts.letter_type).toLowerCase();
  const isFinalWarning = letterType.includes('final');
  const arrearsDateText = formatIsoDateText(firstNonEmpty(facts.arrears_date, shared.current_date));
  const paymentDeadline = firstNonEmpty(facts.final_deadline, facts.response_deadline, shared.current_date);
  const paymentDeadlineText = formatIsoDateText(paymentDeadline);
  const responseDeadline = firstNonEmpty(facts.response_deadline, facts.final_deadline, paymentDeadline);
  const responseDeadlineText = formatIsoDateText(responseDeadline);
  const paymentMethod = buildEnglandPaymentMethodText({
    payment_method: firstNonEmpty(facts.payment_method, 'bank_transfer'),
  });
  const paymentDetails = firstNonEmpty(
    facts.payment_details,
    facts.payment_reference_override,
    facts.bank_details,
    facts.landlord_bank_details
  );
  const detailedArrearsRows = Array.isArray(facts.arrears_schedule_rows)
    ? facts.arrears_schedule_rows
        .map((row: Record<string, any>) => ({
          due_date: formatIsoDateText(row.due_date),
          period_covered: toText(row.period_covered),
          amount_due: formatMoney(row.amount_due),
          amount_paid: formatMoney(row.amount_paid),
          amount_outstanding: formatMoney(row.amount_outstanding),
          payment_received_date: formatIsoDateText(row.payment_received_date),
          note: toText(row.note),
        }))
        .filter((row) =>
          Object.values(row).some((value) => toText(value).length > 0)
        )
    : [];

  const openingParagraphs = isFinalWarning
    ? [
        `I write further to earlier requests for payment. As at ${arrearsDateText}, rent arrears of ${arrearsAmount || 'the stated sum'} remain outstanding on the tenancy of the Property.`,
        'This letter is a final warning and a request for immediate engagement so that the arrears can be resolved without formal recovery steps if possible.',
      ]
    : [
        `Our records show that rent remains overdue on the tenancy of the Property. As at ${arrearsDateText}, the arrears outstanding are ${arrearsAmount || 'the stated sum'}.`,
        'Please treat this letter as a formal demand for payment and contact the Landlord promptly if you dispute the amount or need to discuss repayment proposals.',
      ];

  const paymentRequestParagraphs = [
    `Please pay the outstanding arrears in cleared funds by ${paymentDeadlineText || 'the stated deadline'}.`,
    'If full payment cannot be made immediately, you should provide a realistic written proposal, with dates and amounts, by the response deadline below.',
  ];

  const nextSteps = isFinalWarning
    ? [
        'If payment or a satisfactory written response is not received by the deadline, the Landlord may consider formal debt recovery or possession-related action where lawfully available.',
        'Further action may include sending a separate compliant letter of claim, issuing a county court money claim, or relying on arrears in support of any possession proceedings where permitted.',
      ]
    : [
        'If payment is not made, the Landlord may send a further warning letter, propose a repayment plan, or take other lawful recovery steps.',
      ];

  const protocolNote = isFinalWarning
    ? 'This letter is intended as a final warning only. It is not a complete Letter of Claim under the Pre-Action Protocol for Debt Claims, which has its own content, enclosure, and response requirements and ordinarily allows at least 30 days for a debtor response.'
    : 'This is a professional arrears reminder and payment demand. Any later debt claim should separately consider the requirements of the Pre-Action Protocol for Debt Claims.'
  ;

  return {
    title: 'Rent Arrears Letter',
    subtitle: isFinalWarning
      ? 'Professional final warning for England residential rent arrears'
      : 'Professional arrears demand for England residential rent arrears',
    document_reference: buildDocumentReference('rent_arrears_letter', shared),
    letter_date: shared.current_date,
    property_address: shared.property_address,
    landlord_name: shared.landlord_name,
    landlord_address: shared.landlord_address,
    landlord_email: shared.landlord_email,
    landlord_phone: shared.landlord_phone,
    tenant_name: tenantName,
    tenant_address: shared.property_address || toText(facts.current_address),
    letter_type_label: isFinalWarning ? 'Final warning' : 'Arrears reminder',
    is_final_warning: isFinalWarning,
    opening_paragraphs: openingParagraphs,
    arrears_rows: cleanRows([
      { label: 'Arrears amount', value: arrearsAmount },
      { label: 'Arrears calculated as at', value: arrearsDateText },
      { label: 'Current rent', value: formatMoney(shared.rent_amount) || shared.rent_amount },
      { label: 'Rent due day', value: facts.rent_due_day },
      { label: 'Missed rent periods', value: facts.missed_rent_periods },
      { label: 'Arrears schedule reference', value: facts.arrears_schedule_reference },
    ]) || [],
    payment_instruction_rows: cleanRows([
      { label: 'Payment method', value: paymentMethod },
      { label: 'Payment details', value: paymentDetails },
      { label: 'Payment reference', value: facts.payment_reference_override },
      { label: 'Landlord contact for queries', value: firstNonEmpty(shared.landlord_email, shared.landlord_phone) },
    ]) || [],
    payment_deadline: paymentDeadlineText,
    response_deadline: responseDeadlineText,
    payment_request_paragraphs: paymentRequestParagraphs,
    next_steps: nextSteps,
    detailed_arrears_rows: detailedArrearsRows,
    protocol_note: protocolNote,
    advice_points: [
      'If you believe the arrears figure is incorrect, respond in writing promptly with your reasons and any supporting payment evidence.',
      'If you are in financial difficulty, seek independent debt advice without delay and keep the Landlord informed of any realistic repayment proposal.',
      'Keep a copy of this letter and any payment confirmations or correspondence sent in reply.',
    ],
    closing_paragraphs: [
      'This communication is sent in a professional manner for debt recovery purposes. The Landlord expects prompt payment or a prompt written response but will not pursue payment by harassment or unlawful conduct.',
      'Please ensure that any response is in writing so there is a clear record of what has been proposed or agreed.',
    ],
  };
}

function isTruthySelection(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'yes' || normalized === 'true' || normalized === '1' || normalized === 'required';
  }

  return false;
}

function isEnglandAssuredResidentialProduct(
  product: ResidentialLettingProductSku
): product is EnglandAssuredResidentialProduct {
  return (
    product === 'england_standard_tenancy_agreement' ||
    product === 'england_premium_tenancy_agreement' ||
    product === 'england_student_tenancy_agreement' ||
    product === 'england_hmo_shared_house_tenancy_agreement'
  );
}

function isEnglandModernTenancyProduct(
  product: ResidentialLettingProductSku
): product is EnglandModernTenancyProduct {
  return isEnglandAssuredResidentialProduct(product) || product === 'england_lodger_agreement';
}

function toArrayOfText(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean);
  }

  return splitEntries(value);
}

function formatEnglandProductLabel(product: EnglandModernTenancyProduct): string {
  switch (product) {
    case 'england_standard_tenancy_agreement':
      return 'Standard Tenancy Agreement';
    case 'england_premium_tenancy_agreement':
      return 'Premium Tenancy Agreement';
    case 'england_student_tenancy_agreement':
      return 'Student Tenancy Agreement';
    case 'england_hmo_shared_house_tenancy_agreement':
      return 'HMO / Shared House Tenancy Agreement';
    case 'england_lodger_agreement':
      return 'Room Let / Lodger Agreement';
  }
}

function cleanTemplateSections(
  sections: Array<TemplateSection | undefined | null>
): TemplateSection[] {
  return sections.filter((section): section is TemplateSection => {
    if (!section) return false;

    return Boolean(
      section.intro ||
        (section.rows && section.rows.length > 0) ||
        section.table ||
        (section.bullets && section.bullets.length > 0) ||
        (section.paragraphs && section.paragraphs.length > 0)
    );
  });
}

function formatNoticePeriod(value: unknown): string {
  return firstNonEmpty(toText(value), '2 months');
}

const ENGLAND_INCLUDED_BILL_LABELS: Record<string, string> = {
  council_tax: 'Council tax',
  gas: 'Gas',
  electricity: 'Electricity',
  water_sewerage: 'Water / sewerage',
  internet_broadband: 'Internet / broadband',
  communications: 'Communications: telephone, internet, cable, or satellite services',
  tv_licence: 'TV licence',
  green_deal: 'Green Deal energy efficiency improvements',
};

function buildEnglandRentDueDayText(facts: Record<string, any>): string {
  return firstNonEmpty(facts.rent_due_day, facts.rent_due_weekday, facts.rent_due_day_of_month);
}

function buildEnglandPaymentMethodText(facts: Record<string, any>): string {
  return formatSelectionValue(toText(facts.payment_method).toLowerCase().replace(/\s+/g, '_'), {
    standing_order: 'Bank transfer',
    bank_transfer: 'Bank transfer',
    cash: 'Cash',
  });
}

function buildEnglandRentFrequencyText(value: unknown): string {
  return formatSelectionValue(value, RENT_FREQUENCY_LABELS);
}

function buildEnglandInspectionFrequencyText(value: unknown): string {
  return formatSelectionValue(value, INSPECTION_FREQUENCY_LABELS);
}

function buildEnglandSmokingPolicyText(value: unknown): string {
  return formatSelectionValue(value, SMOKING_POLICY_LABELS);
}

function buildEnglandSublettingPolicyText(value: unknown): string {
  return formatSelectionValue(value, SUBLETTING_POLICY_LABELS);
}

function buildEnglandHmoLicenceStatusText(value: unknown): string {
  return formatSelectionValue(value, HMO_LICENCE_STATUS_LABELS);
}

function buildEnglandCommunalCleaningText(value: unknown): string {
  return formatSelectionValue(value, COMMUNAL_CLEANING_LABELS);
}

function buildStatementLine(label: string, value: unknown): string {
  const text = toText(value);
  return text ? `${label}: ${text}.` : '';
}

function buildEnglandIncludedBillsText(facts: Record<string, any>): string {
  const selectedBills = toArrayOfText(facts.included_bills)
    .map((value) => ENGLAND_INCLUDED_BILL_LABELS[value] || value)
    .filter(Boolean);
  const otherNotes = toText(facts.included_bills_other_notes);
  const legacyNotes = toText(facts.included_bills_notes);

  const parts = [
    selectedBills.length > 0 ? selectedBills.join(', ') : '',
    otherNotes,
    !selectedBills.length && !otherNotes ? legacyNotes : '',
  ].filter(Boolean);

  return parts.join('. ');
}

function buildEnglandPaymentAccountRows(facts: Record<string, any>): Array<{ label: string; value: unknown }> {
  if (buildEnglandPaymentMethodText(facts) !== 'Bank transfer') {
    return [];
  }

  return [
    { label: 'Account name', value: firstNonEmpty(facts.payment_account_name, facts.bank_account_name) },
    { label: 'Sort code', value: firstNonEmpty(facts.payment_sort_code, facts.bank_sort_code) },
    { label: 'Account number', value: firstNonEmpty(facts.payment_account_number, facts.bank_account_number) },
  ];
}

function buildEnglandBillCoverageText(facts: Record<string, any>): string {
  if (isTruthySelection(facts.bills_included_in_rent)) {
    return firstNonEmpty(
      buildEnglandIncludedBillsText(facts),
      'The rent is stated to include the bills or services identified by the landlord.'
    );
  }

  return 'No bills are stated to be included in the rent unless this agreement expressly says otherwise.';
}

function buildEnglandSeparateBillBullets(facts: Record<string, any>): string[] {
  if (!isTruthySelection(facts.separate_bill_payments_taken)) {
    return [];
  }

  const rows = Array.isArray(facts.separate_bill_payment_rows)
    ? facts.separate_bill_payment_rows
    : [];

  if (rows.length === 0) {
    return [
      'If the tenant pays any permitted bill separately to the landlord or a connected person, the tenancy terms should state what the bill covers, how the tenant will be told the amount, and when payment is due or how that due date will be notified.',
    ];
  }

  const billTypeLabels: Record<string, string> = {
    council_tax: 'Council tax',
    gas_electric_water: 'Gas, electricity, water, or sewage',
    tv_licence: 'TV licence',
    communications: 'Telephone, broadband, cable, or satellite services',
    green_deal: 'Green Deal energy efficiency charges',
  };

  return rows
    .map((row: Record<string, any>) => {
      const typeLabel = billTypeLabels[toText(row.bill_type)] || toText(row.bill_type) || 'Permitted bill';
      const payee = firstNonEmpty(row.payee, row.collector);
      const amount = firstNonEmpty(row.amount_detail, formatMoney(row.amount), row.amount_description);
      const due = firstNonEmpty(row.due_detail, row.due_description, row.due_date);
      const notes = toText(row.notes);

      return [
        `${typeLabel} is recorded as a permitted bill payment payable in addition to the rent.`,
        amount ? `Amount or pricing basis: ${amount}.` : 'Amount or pricing basis will be notified in writing.',
        due ? `When due or how notified: ${due}.` : 'The due date will be notified in writing.',
        payee ? `Payee: ${payee}.` : '',
        notes ? `Notes: ${notes}.` : '',
      ]
        .filter(Boolean)
        .join(' ');
    })
    .filter(Boolean);
}

function buildEnglandPriorNoticeBullets(facts: Record<string, any>): string[] {
  if (!isTruthySelection(facts.record_prior_notice_grounds)) {
    return [];
  }

  const grounds = toArrayOfText(facts.prior_notice_grounds);

  if (grounds.length === 0) {
    return [];
  }

  const labels: Record<string, string> = {
    ground_2za_superior_lease_sale: 'Ground 2ZA: superior lease sale provision',
    ground_2zb_superior_lease_break: 'Ground 2ZB: superior lease break provision',
    ground_2zc_superior_lease_redevelopment: 'Ground 2ZC: superior lease redevelopment provision',
    ground_2zd_superior_lease_landlord_occupation: 'Ground 2ZD: superior lease occupation provision',
    ground_4_student_occupation: 'Ground 4: student occupation',
    ground_4a_students_for_new_students: 'Ground 4A: student property for incoming students',
    ground_5_minister_of_religion: 'Ground 5: minister of religion',
    ground_5a_agricultural_worker: 'Ground 5A: agricultural worker',
    ground_5b_employment_requirement: 'Ground 5B: employment requirement',
    ground_5c_end_of_landlord_employment: 'Ground 5C: end of landlord employment',
    ground_5d_end_of_employment_requirement: 'Ground 5D: end of employment requirement',
    ground_5e_supported_accommodation: 'Ground 5E: occupation as supported accommodation',
    ground_5f_supported_dwelling_house: 'Ground 5F: dwelling occupied as supported accommodation',
    ground_5g_homelessness_duty: 'Ground 5G: homelessness duty accommodation',
    ground_5h_stepping_stone: 'Ground 5H: stepping-stone accommodation',
    ground_18_supported_accommodation: 'Ground 18: supported accommodation',
  };

  const bullets = grounds.map((ground) => labels[ground] || ground);

  if (grounds.includes('ground_4_student_occupation') && toText(facts.prior_notice_ground_4_details)) {
    bullets.push(`Ground 4 details: ${toText(facts.prior_notice_ground_4_details)}`);
  }

  if (grounds.includes('ground_4a_students_for_new_students') && toText(facts.prior_notice_ground_4a_details)) {
    bullets.push(`Ground 4A details: ${toText(facts.prior_notice_ground_4a_details)}`);
  }

  const supportedGrounds = grounds.filter((ground) =>
    [
      'ground_5e_supported_accommodation',
      'ground_5f_supported_dwelling_house',
      'ground_5g_homelessness_duty',
      'ground_5h_stepping_stone',
      'ground_18_supported_accommodation',
    ].includes(ground)
  );

  if (supportedGrounds.length > 0 && toText(facts.prior_notice_supported_accommodation_details)) {
    bullets.push(`Supported accommodation context: ${toText(facts.prior_notice_supported_accommodation_details)}`);
  }

  return bullets;
}

function buildEnglandAssuredAdditionalTerms(shared: SharedResidentialData): string {
  const notes = toArrayOfText(shared.facts.additional_terms);
  return notes.length > 0 ? notes.join('\n\n') : '';
}

function buildEnglandAssuredNotes(
  product: EnglandAssuredResidentialProduct,
  shared: SharedResidentialData,
  purpose: EnglandTenancyPurpose
): string {
  const parts = [
    purpose === 'existing_verbal_tenancy'
      ? 'This document is intended to provide the written statement of terms for an existing verbal England assured tenancy and should be given to the tenant alongside any supporting compliance documents.'
      : 'This document is intended to record the written terms for an England assured periodic tenancy and should be read with any deposit, guarantor, and pre-tenancy checklist documents in the pack.',
    Number(shared.deposit_amount) > 0 && !toText(shared.facts.deposit_reference_number)
      ? 'Deposit protection reference: use the placeholder wording in the support documents until the final scheme reference is available, then update the served pack within the statutory deadline.'
      : '',
    product === 'england_student_tenancy_agreement' && isTruthySelection(shared.facts.guarantor_required)
      ? 'Where a guarantor will be used, the guarantor deed should be signed and retained with this agreement before occupation begins or as soon as the tenancy file requires.'
      : '',
    product === 'england_premium_tenancy_agreement'
      ? 'The Premium pack is intended to travel with its management schedule, keys handover record, utilities handover sheet, pet-request addendum, and tenancy variation record.'
      : '',
    product === 'england_student_tenancy_agreement'
      ? 'The Student pack is intended to travel with its move-out schedule, handover record, utilities sheet, and any guarantor deed recorded for the tenancy file.'
      : '',
    product === 'england_hmo_shared_house_tenancy_agreement'
      ? 'The HMO / shared-house pack is intended to travel with its house-rules appendix, handover record, utilities sheet, and shared-house support documents.'
      : '',
    buildEnglandAssuredAdditionalTerms(shared),
  ].filter(Boolean);

  return parts.join('\n\n');
}

function buildEnglandAssuredSections(
  product: EnglandAssuredResidentialProduct,
  shared: SharedResidentialData,
  purpose: EnglandTenancyPurpose
): TemplateSection[] {
  const facts = shared.facts;
  const periodicNotice = formatNoticePeriod(facts.tenant_notice_period);
  const separateBillBullets = buildEnglandSeparateBillBullets(facts);
  const priorNoticeBullets = buildEnglandPriorNoticeBullets(facts);
  const relevantGas = isTruthySelection(facts.relevant_gas_fitting_present);
  const depositAmountDisplay = formatMoney(shared.deposit_amount) || toText(shared.deposit_amount) || 'No deposit stated';
  const depositReference = firstNonEmpty(
    facts.deposit_reference_number,
    Number(shared.deposit_amount) > 0 ? 'To be completed from the scheme confirmation' : 'No deposit stated'
  );
  const purposeLabel =
    purpose === 'existing_verbal_tenancy'
      ? 'Written statement for an existing tenancy'
      : 'New periodic tenancy agreement';

  return cleanTemplateSections([
    createSection({
      heading: 'Tenancy Status and Core Particulars',
      intro:
        purpose === 'existing_verbal_tenancy'
          ? 'This written statement records the key contractual and statutory terms of an existing verbal England assured tenancy. It is intended to help the landlord provide the required written information without treating the tenancy as a fresh grant.'
          : 'The parties intend the tenant to occupy the Property as their main home on the assured periodic basis described in this document.',
      rows: [
        { label: 'Tenancy type', value: purposeLabel },
        { label: 'Pack', value: formatEnglandProductLabel(product) },
        { label: 'Property type', value: facts.property_type },
        { label: 'Bedrooms', value: facts.number_of_bedrooms },
        { label: 'Furnished status', value: facts.furnished_status },
        { label: 'Parking included', value: yesNoText(facts.parking_available) },
        { label: 'Tenancy start date', value: shared.tenancy_start_date },
      ],
      paragraphs: [
        'The tenancy is intended to continue on a periodic basis unless lawfully brought to an end. No separate fixed-term drafting is created by this document unless a solicitor-approved route is expressly used outside this product.',
      ],
    }),
    createSection({
      heading: 'Rent, Payment Method, and Bill Treatment',
      rows: [
        { label: 'Rent', value: formatMoney(shared.rent_amount) || shared.rent_amount },
        { label: 'Rent period', value: buildEnglandRentFrequencyText(firstNonEmpty(facts.rent_frequency, facts.rent_period, 'month')) },
        { label: 'Rent due day', value: buildEnglandRentDueDayText(facts) },
        { label: 'Payment method', value: buildEnglandPaymentMethodText(facts) },
        { label: 'Bills included in rent', value: yesNoText(facts.bills_included_in_rent) },
        { label: 'Included bills detail', value: buildEnglandBillCoverageText(facts) },
        ...buildEnglandPaymentAccountRows(facts),
      ],
      bullets: [
        'Any rent increase for an England assured tenancy should follow the Section 13 statutory route or any later replacement process required by law. CPI, RPI, or fixed review wording is not intended to override that statutory process in this product.',
        ...separateBillBullets,
      ],
      paragraphs: [
        isTruthySelection(facts.england_rent_in_advance_compliant)
          ? 'The landlord confirms that any rent in advance taken for this tenancy is intended to stay within the limits permitted for England assured tenancies.'
          : '',
      ],
    }),
    createSection({
      heading: 'Deposit Arrangements',
      rows: [
        { label: 'Deposit amount', value: depositAmountDisplay },
        { label: 'Deposit protection scheme', value: firstNonEmpty(facts.deposit_scheme_name, Number(shared.deposit_amount) > 0 ? 'To be confirmed' : 'Not applicable') },
        { label: 'Deposit reference', value: depositReference },
      ],
      paragraphs: Number(shared.deposit_amount) > 0
        ? [
            'If a deposit is taken, it should be protected in an authorised England scheme within the statutory timeframe and the prescribed information should be served in time. The support documents in this pack are intended to help record those details.',
          ]
        : [
            'No tenancy deposit is stated in the landlord answers. If that changes before occupation, the deposit support documents and tenant information should be updated accordingly.',
          ],
    }),
    createSection({
      heading: 'Tenant Ending the Tenancy',
      paragraphs: [
        `The tenant may end the tenancy by giving at least ${periodicNotice} written notice, ending on the appropriate day for the tenancy period unless the law changes or the parties later agree a lawful surrender.`,
        'The tenant should return keys, remove belongings, leave the property reasonably clean, and provide a forwarding address for deposit and final correspondence purposes.',
      ],
      rows: [
        { label: 'Recorded tenant notice period', value: periodicNotice },
        { label: 'End-of-tenancy viewings', value: yesNoText(facts.end_of_tenancy_viewings) },
      ],
    }),
    createSection({
      heading: 'Landlord Ending the Tenancy',
      paragraphs: [
        'In most circumstances, the landlord may only end the tenancy by obtaining an order for possession and the execution of that order. The landlord cannot lawfully end the tenancy just by serving a private break clause or informal notice.',
        'If the landlord seeks possession, the landlord or one of any joint landlords will usually need to serve a possession notice using the correct form, specify the ground or grounds relied on, and give the minimum notice period that applies to that ground or those grounds before court proceedings begin.',
        'Where the landlord wishes to rely on a possession ground that requires prior notice at the start of the tenancy, the ground should be identified clearly in writing now and supported by the relevant factual explanation.',
      ],
    }),
    priorNoticeBullets.length > 0
      ? createSection({
          heading: 'Prior-Notice Grounds',
          bullets: priorNoticeBullets,
        })
      : null,
    isTruthySelection(facts.supported_accommodation_tenancy)
      ? createSection({
          heading: 'Supported Accommodation Status',
          rows: [
            {
              label: 'Granted as supported accommodation',
              value: yesNoText(facts.supported_accommodation_tenancy),
            },
          ],
          paragraphs: [
            'The landlord records that this tenancy is granted as supported accommodation for the purposes stated in the written information provided to the tenant.',
            firstNonEmpty(
              facts.supported_accommodation_explanation,
              'The landlord should keep a written explanation of the support, supervision, or accommodation basis that makes the tenancy a supported-accommodation tenancy.'
            ),
          ],
        })
      : null,
    createSection({
      heading: 'Repairs, Fitness, Safety, and Access',
      rows: [
        { label: 'EPC rating', value: facts.epc_rating },
        { label: 'Gas safety certificate provided', value: relevantGas ? yesNoText(facts.gas_safety_certificate) : 'No relevant gas fitting stated' },
        { label: 'Electrical safety certificate provided', value: yesNoText(facts.electrical_safety_certificate) },
        { label: 'Smoke alarms fitted and tested', value: yesNoText(facts.smoke_alarms_fitted) },
        { label: 'Carbon monoxide alarms where required', value: yesNoText(facts.carbon_monoxide_alarms) },
        { label: 'Right to rent checks completed', value: formatIsoDateText(facts.right_to_rent_check_date) },
      ],
      bullets: [
        'The landlord acknowledges that section 9A of the Landlord and Tenant Act 1985 requires the property to be fit for human habitation to the extent that section applies.',
        'The landlord acknowledges that section 11 of the Landlord and Tenant Act 1985 requires the structure and exterior, and the installations for water, gas, electricity, sanitation, space heating, and hot water, to be kept in repair to the extent that section applies.',
        'Regulation 3 of the Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020 requires relevant electrical safety standards to be met during occupation, relevant electrical installations to be inspected and tested by a qualified person at least every 5 years or sooner if the most recent report requires it, and a copy of that report to be supplied to the tenant.',
        relevantGas
          ? 'Regulation 36 of the Gas Safety (Installations and Use) Regulations 1998 requires any relevant gas fitting and flue to be kept in a safe condition, safety checks to be carried out by a Gas Safe registered engineer at intervals determined in accordance with the Regulations, and a copy of the safety record to be given to the tenant.'
          : '',
        'Non-emergency access should normally take place on notice and at a reasonable time unless emergency circumstances justify immediate entry.',
      ],
      paragraphs: [
        `Recorded access notice expectation: ${firstNonEmpty(facts.landlord_access_notice, '24 hours')}.`,
      ],
    }),
    createSection({
      heading: 'Pets, Adaptations, and Equal Treatment',
      bullets: [
        'The tenant may keep a pet at the property if the tenant asks to do so in line with section 16A of the Housing Act 1988 and the landlord gives consent.',
        'The landlord cannot unreasonably refuse consent to keep a pet and should deal with any pet request reasonably and within the time required by the law then in force.',
        isTruthySelection(facts.tenant_improvements_allowed_with_consent)
          ? 'Where the tenant is entitled to make improvements with the landlord consent, the landlord may not unreasonably withhold consent to an improvement request where a disabled person occupies or intends to occupy the property as their only or main home and the improvement is likely to facilitate that person enjoyment of the property having regard to their disability.'
          : '',
        isTruthySelection(facts.tenant_improvements_allowed_with_consent)
          ? 'The section 190 Equality Act improvement rights do not apply so far as the tenancy already makes like provision, and the tenant can refer to section 6 of the Equality Act 2010 for the meaning of disabled person and section 190(9) for the meaning of improvement.'
          : '',
        isTruthySelection(facts.england_no_discrimination_confirmed)
          ? 'The landlord confirms that the tenancy was not offered or refused on an unlawful discriminatory basis in the recorded answers.'
          : '',
        isTruthySelection(facts.england_no_bidding_confirmed)
          ? 'The landlord confirms that the tenancy was not granted through a prohibited bidding process in the recorded answers.'
          : '',
        buildStatementLine('Pets authorised at the start', yesNoText(facts.pets_allowed)),
        buildStatementLine('Smoking policy', buildEnglandSmokingPolicyText(facts.smoking_allowed)),
        buildStatementLine('Subletting / short-let policy', buildEnglandSublettingPolicyText(facts.subletting_allowed)),
      ],
    }),
    createSection({
      heading:
        product === 'england_premium_tenancy_agreement'
          ? 'Premium Handover, Reporting, and Evidence Protocol'
          : 'Product-Specific Operational Terms',
      paragraphs:
        product === 'england_standard_tenancy_agreement'
          ? [
              'This standard product is intended for an ordinary whole-property residential let and records the core occupation, payment, access, and house-rule terms without the wider operational clauses used in the premium route.',
              buildStatementLine('Inspection frequency recorded', buildEnglandInspectionFrequencyText(facts.inspection_frequency)),
            ]
          : product === 'england_premium_tenancy_agreement'
            ? [
                'This premium product is still an ordinary residential tenancy route, but it records fuller operational detail for inspections, reporting lines, keys, hand-back expectations, and management arrangements.',
                buildStatementLine('Inspection frequency recorded', buildEnglandInspectionFrequencyText(facts.inspection_frequency)),
                firstNonEmpty(
                  facts.management_contact_channel
                    ? `Primary management contact channel: ${formatPremiumOption(facts.management_contact_channel)}.`
                    : '',
                  ''
                ),
                firstNonEmpty(
                  facts.routine_inspection_window
                    ? `Routine inspection window: ${formatPremiumOption(facts.routine_inspection_window)}.`
                    : '',
                  ''
                ),
                firstNonEmpty(
                  facts.repair_reporting_contact
                    ? `Repairs reporting contact: ${facts.repair_reporting_contact}.`
                    : '',
                  ''
                ),
                firstNonEmpty(
                  facts.check_in_documentation_expectation
                    ? `Check-in paperwork and evidence expectation: ${facts.check_in_documentation_expectation}`
                    : '',
                  ''
                ),
                firstNonEmpty(
                  facts.contractor_access_procedure
                    ? `Contractor access procedure: ${facts.contractor_access_procedure}`
                    : '',
                  ''
                ),
                firstNonEmpty(
                  facts.utilities_transfer_expectation
                    ? `Utilities and account transfer expectation: ${facts.utilities_transfer_expectation}`
                    : '',
                  ''
                ),
                firstNonEmpty(
                  facts.handover_expectations
                    ? `Recorded hand-back expectations: ${facts.handover_expectations}`
                    : '',
                  ''
                ),
              ]
            : product === 'england_student_tenancy_agreement'
              ? [
                  'This student tenancy route records sharer arrangements, guarantor expectations, and end-of-term return standards for the tenancy.',
                  isTruthySelection(facts.student_replacement_procedure)
                    ? `A student tenant replacement process is intended to apply if the landlord agrees a suitable replacement and any required documents are completed. Recorded notice window: ${firstNonEmpty(facts.replacement_notice_window, 'Not stated')}. Cost position: ${firstNonEmpty(facts.replacement_cost_responsibility, 'Not stated')}.`
                    : '',
                  toText(facts.student_end_of_term_expectations),
                  firstNonEmpty(
                    facts.student_cleaning_standard
                      ? `Cleaning and room hand-back standard: ${facts.student_cleaning_standard}`
                      : '',
                    ''
                  ),
                ].filter(Boolean)
              : [
                  'This HMO / shared-house route records communal-area arrangements, sharer responsibilities, and HMO-related operational detail in the main agreement.',
                  buildStatementLine('HMO licence status recorded', buildEnglandHmoLicenceStatusText(facts.hmo_licence_status)),
                  buildStatementLine('Communal areas', facts.communal_areas),
                  buildStatementLine('Communal cleaning', buildEnglandCommunalCleaningText(facts.communal_cleaning)),
                  firstNonEmpty(
                    facts.visitor_policy ? `Visitor policy: ${facts.visitor_policy}` : '',
                    ''
                  ),
                  firstNonEmpty(
                    facts.fire_safety_notes ? `Fire safety notes: ${facts.fire_safety_notes}` : '',
                    ''
                  ),
                ].filter(Boolean),
      rows:
        product === 'england_student_tenancy_agreement'
          ? cleanRows([
              { label: 'All tenants full-time students', value: yesNoText(facts.all_tenants_full_time_students) },
              { label: 'Joint tenancy', value: yesNoText(facts.joint_tenancy) },
              { label: 'Guarantor required', value: yesNoText(facts.guarantor_required) },
              { label: 'Guarantor scope', value: facts.student_guarantor_scope },
              { label: 'Replacement request notice window', value: facts.replacement_notice_window },
              { label: 'Replacement costs', value: facts.replacement_cost_responsibility },
              { label: 'Vacation / non-occupation notes', value: facts.vacation_period_notes },
              { label: 'Move-out keys and return process', value: facts.student_move_out_keys_process },
              { label: 'Cleaning and room hand-back standard', value: facts.student_cleaning_standard },
            ])
          : product === 'england_premium_tenancy_agreement'
            ? cleanRows([
                { label: 'Primary management contact channel', value: formatPremiumOption(facts.management_contact_channel) },
                { label: 'Routine inspection window', value: formatPremiumOption(facts.routine_inspection_window) },
                { label: 'Repairs reporting contact', value: facts.repair_reporting_contact },
                { label: 'Repairs response expectation', value: formatPremiumOption(facts.repair_response_timeframe) },
                { label: 'Keys and access devices held', value: facts.key_holders_summary },
                { label: 'Check-in paperwork expectation', value: facts.check_in_documentation_expectation },
                { label: 'Contractor access procedure', value: facts.contractor_access_procedure },
                { label: 'Contractor key release policy', value: facts.contractor_key_release_policy },
                { label: 'Utilities and account transfer expectation', value: facts.utilities_transfer_expectation },
                { label: 'Premium management schedule', value: facts.premium_management_schedule },
                { label: 'Move-out and hand-back expectations', value: facts.handover_expectations },
              ])
          : product === 'england_hmo_shared_house_tenancy_agreement'
            ? cleanRows([
                { label: 'Property is HMO / licensable shared house', value: yesNoText(facts.is_hmo) },
                { label: 'Number of sharers / rooms', value: facts.number_of_sharers },
                { label: 'Communal areas', value: facts.communal_areas },
                { label: 'Shared facilities schedule', value: facts.shared_facilities_schedule },
                { label: 'Communal cleaning', value: buildEnglandCommunalCleaningText(facts.communal_cleaning) },
                { label: 'Visitor policy', value: facts.visitor_policy },
                { label: 'Quiet hours', value: facts.quiet_hours },
                { label: 'Waste and recycling arrangements', value: facts.waste_collection_arrangements },
                { label: 'Fire safety notes', value: facts.fire_safety_notes },
              ])
            : cleanRows([
                { label: 'House rules / additional operational notes', value: facts.house_rules_notes || facts.additional_terms },
                { label: 'Access notice expectation', value: facts.landlord_access_notice },
                { label: 'Inspection frequency', value: buildEnglandInspectionFrequencyText(facts.inspection_frequency) },
              ]),
    }),
    createSection({
      heading: 'Supporting Schedules and File Documents',
      bullets:
        product === 'england_standard_tenancy_agreement'
          ? [
              'This pack includes the main agreement together with a pre-tenancy checklist, keys handover record, utilities handover sheet, pet request addendum, and tenancy variation record.',
            ]
          : product === 'england_premium_tenancy_agreement'
            ? [
                'This pack includes the main agreement together with a pre-tenancy checklist, keys handover record, utilities handover sheet, pet request addendum, tenancy variation record, and a premium management schedule.',
                shouldIncludeGuarantorDeed(product, facts)
                  ? 'A guarantor deed is also included because the recorded answers indicate that a guarantor is expected.'
                  : '',
              ]
            : product === 'england_student_tenancy_agreement'
              ? [
                  'This pack includes the main agreement together with a pre-tenancy checklist, keys handover record, utilities handover sheet, pet request addendum, tenancy variation record, and a student move-out / guarantor schedule.',
                  shouldIncludeGuarantorDeed(product, facts)
                    ? 'A guarantor deed is also included because the recorded answers indicate that a guarantor is required.'
                    : '',
                ]
              : [
                  'This pack includes the main agreement together with a pre-tenancy checklist, keys handover record, utilities handover sheet, pet request addendum, tenancy variation record, and a dedicated HMO / shared-house rules appendix.',
                ],
    }),
    createSection({
      heading: 'Notices and Service Information',
      rows: [
        { label: 'Landlord service address', value: shared.landlord_address },
        { label: 'Landlord email', value: shared.landlord_email },
        { label: 'Landlord phone', value: shared.landlord_phone },
        { label: 'How to Rent guide provided', value: yesNoText(facts.how_to_rent_provided) },
      ],
      paragraphs: [
        'Formal notices should be sent to the landlord service address stated in this document unless the landlord later gives a valid written replacement address for service.',
      ],
    }),
  ]);
}

function buildEnglandTransitionGuidanceSections(
  product: EnglandAssuredResidentialProduct,
  shared: SharedResidentialData
): TemplateSection[] {
  const facts = shared.facts;
  return cleanTemplateSections([
    createSection({
      heading: 'Why This Transition Pack Exists',
      intro:
        'This document is for an existing written England tenancy that is continuing into the post-1 May 2026 assured-tenancy regime. It is not intended to replace the existing written tenancy unless the parties take separate legal steps to do that.',
      rows: [
        { label: 'Main pack', value: formatEnglandProductLabel(product) },
        { label: 'Existing tenancy reference date', value: shared.tenancy_start_date },
        { label: 'Property', value: shared.property_address },
      ],
      paragraphs: [
        'Give the exact government Renters\' Rights Act Information Sheet 2026 PDF to every named tenant and retain proof of service with the tenancy file.',
      ],
    }),
    createSection({
      heading: 'Immediate Actions',
      bullets: [
        'Check that the named tenant list, landlord service address, and rent details remain accurate.',
        'Record the tenant notice position, landlord possession process summary, bill treatment, repair responsibilities, and safety information in the tenancy file.',
        Number(shared.deposit_amount) > 0
          ? 'Review deposit protection details and ensure any prescribed information or updated reference details are retained with the tenancy records.'
          : 'If no deposit is currently taken, no deposit support document is included in this transition pack.',
        'Retain proof that the government information sheet and any supplementary written information were delivered to the tenant.',
      ],
    }),
    createSection({
      heading: 'Matters to Review on the Existing Tenancy File',
      rows: [
        { label: 'Rent amount', value: formatMoney(shared.rent_amount) || shared.rent_amount },
        { label: 'Rent increase method', value: firstNonEmpty(facts.rent_increase_method, 'Section 13 route expected for England assured tenancies') },
        { label: 'Tenant notice period', value: formatNoticePeriod(facts.tenant_notice_period) },
        { label: 'Bills included in rent', value: yesNoText(facts.bills_included_in_rent) },
        { label: 'Prior-notice grounds recorded', value: toArrayOfText(facts.prior_notice_grounds).length > 0 ? 'Yes' : 'No' },
      ],
    }),
    createSection({
      heading: 'Operational and Safety Record',
      rows: [
        { label: 'EPC rating', value: facts.epc_rating },
        { label: 'Right to rent check date', value: facts.right_to_rent_check_date },
        { label: 'Gas safety certificate provided', value: yesNoText(facts.gas_safety_certificate) },
        { label: 'Electrical safety certificate provided', value: yesNoText(facts.electrical_safety_certificate) },
        { label: 'Smoke alarms fitted and tested', value: yesNoText(facts.smoke_alarms_fitted) },
        { label: 'CO alarms where required', value: yesNoText(facts.carbon_monoxide_alarms) },
      ],
      paragraphs: [
        'This transition note is a file-management aid only. Keep the original written tenancy, the government information sheet, and all compliance evidence together in the same tenancy record.',
      ],
    }),
  ]);
}

function buildEnglandLodgerAgreementSections(shared: SharedResidentialData): TemplateSection[] {
  const facts = shared.facts;

  return cleanTemplateSections([
    createSection({
      heading: 'Room Let and Occupation Basis',
      intro:
        'The resident landlord permits the Lodger to occupy the agreed room and use the shared parts of the property on the practical terms recorded below. This product is intended for a resident-landlord arrangement and not for an assured tenancy.',
      rows: [
        { label: 'Room / area occupied', value: firstNonEmpty(facts.let_room_description, 'Room within the property') },
        { label: 'Occupation start date', value: shared.tenancy_start_date },
        { label: 'Resident landlord confirmed', value: yesNoText(facts.resident_landlord_confirmed) },
        { label: 'Shared kitchen or bathroom with landlord', value: yesNoText(facts.shared_kitchen_or_bathroom) },
      ],
    }),
    createSection({
      heading: 'Licence Fee, Bills, and Included Services',
      rows: [
        { label: 'Licence fee / rent', value: formatMoney(shared.rent_amount) || shared.rent_amount },
        { label: 'Payment frequency', value: buildEnglandRentFrequencyText(facts.rent_period || 'month') },
        { label: 'Payment due day', value: facts.rent_due_day },
        { label: 'Payment method', value: buildEnglandPaymentMethodText(facts) },
        { label: 'Bills included', value: buildEnglandBillCoverageText(facts) },
      ],
      paragraphs: [
        'The lodger should pay the licence fee on time and use the property in a clean, respectful, and domestic manner consistent with a room-let in the landlord\'s own home.',
      ],
    }),
    createSection({
      heading: 'Use of Shared Facilities and House Rules',
      rows: [
        { label: 'House rules and shared-space notes', value: facts.house_rules_notes },
        { label: 'Guest policy', value: facts.guest_policy },
        { label: 'Quiet hours', value: facts.quiet_hours },
        { label: 'Shared-space cleaning arrangements', value: facts.shared_space_cleaning },
        { label: 'Smoking policy', value: buildEnglandSmokingPolicyText(facts.smoking_allowed) },
        { label: 'Pets authorised at start', value: yesNoText(facts.pets_allowed) },
      ],
      bullets: [
        'The Lodger should respect the resident landlord, neighbours, and any other occupiers and use shared facilities reasonably.',
        'Any guest, overnight stay, cleaning, kitchen, bathroom, laundry, or rubbish arrangements should follow the house rules recorded in this document.',
      ],
    }),
    createSection({
      heading: 'Access, Safety, and Records',
      rows: [
        { label: 'Right to rent checks completed', value: formatIsoDateText(facts.right_to_rent_check_date) },
        { label: 'Smoke alarms fitted and tested', value: yesNoText(facts.smoke_alarms_fitted) },
        { label: 'CO alarms where required', value: yesNoText(facts.carbon_monoxide_alarms) },
      ],
      paragraphs: [
        'Because the resident landlord lives at the property, day-to-day access and use of common parts should work cooperatively and reasonably. Even so, the lodger should be told about practical arrangements for privacy, quiet hours, and shared-space use.',
      ],
    }),
    createSection({
      heading: 'Notice and Ending the Room Let',
      rows: [
        { label: 'Licence notice period', value: firstNonEmpty(facts.licence_notice_period, '28 days') },
        { label: 'Key return and room hand-back expectations', value: facts.key_return_expectations },
      ],
      paragraphs: [
        'Either party may end the arrangement by giving the recorded notice unless a shorter period is justified by serious misconduct or both parties agree an earlier move-out date in writing.',
        'At the end of the arrangement the lodger should return keys, clear the room, and leave any shared areas in the expected condition.',
      ],
    }),
  ]);
}

function buildEnglandLodgerChecklistSections(shared: SharedResidentialData): TemplateSection[] {
  const facts = shared.facts;

  return cleanTemplateSections([
    createSection({
      heading: 'Before Move-In',
      bullets: [
        'Confirm the room to be occupied, any furniture or household items included, and the house rules applying to shared facilities.',
        'Record the move-in date, key handover, first payment date, and any inventory or condition notes for the room.',
        formatIsoDateText(facts.right_to_rent_check_date)
          ? `Right to rent checks recorded on ${formatIsoDateText(facts.right_to_rent_check_date)}.`
          : 'Complete and record any right to rent checks required for the arrangement.',
      ],
    }),
    createSection({
      heading: 'Household Management',
      bullets: [
        'Explain rubbish, recycling, cleaning, laundry, guest, quiet-hours, and kitchen / bathroom arrangements clearly.',
        'Keep a written note of any shared expenses or services included in the licence fee.',
        'Record any particular security, key, alarm, or access instructions for the household.',
        firstNonEmpty(
          facts.guest_policy ? `Guest policy recorded: ${facts.guest_policy}` : '',
          ''
        ),
        firstNonEmpty(
          facts.shared_space_cleaning
            ? `Shared-space cleaning arrangement: ${facts.shared_space_cleaning}`
            : '',
          ''
        ),
      ],
    }),
    createSection({
      heading: 'Safety and End-of-Let File',
      bullets: [
        `Smoke alarms fitted and tested: ${yesNoText(facts.smoke_alarms_fitted)}.`,
        `CO alarms where required: ${yesNoText(facts.carbon_monoxide_alarms)}.`,
        'Keep a dated copy of the agreement, checklist, payment record, and any inventory or move-in photographs with the room-let file.',
      ],
    }),
  ]);
}

function buildEnglandKeysHandoverSections(
  product: EnglandModernTenancyProduct,
  shared: SharedResidentialData
): TemplateSection[] {
  const facts = shared.facts;
  const occupierLabel = product === 'england_lodger_agreement' ? 'Lodger' : 'Tenant(s)';

  return cleanTemplateSections([
    createSection({
      heading: 'Handover Summary',
      rows: [
        { label: 'Pack', value: formatEnglandProductLabel(product) },
        { label: 'Property', value: shared.property_address },
        { label: occupierLabel, value: shared.tenant_names },
        { label: 'Start date', value: shared.tenancy_start_date },
        { label: 'Keys and access devices', value: firstNonEmpty(facts.key_holders_summary, facts.key_return_expectations, 'Record keys, fobs, alarms, and any concierge access devices here.') },
      ],
      paragraphs: [
        'Use this record to note the physical handover items provided at move-in and the items expected back at the end of occupation.',
      ],
    }),
    createSection({
      heading: 'Practical Checks',
      bullets: [
        'Record the number of keys, fobs, gate controls, or alarm codes handed over.',
        'Confirm meter readings, appliance instructions, and any property-specific access rules on the handover date.',
        'Keep the signed or acknowledged handover record with the main agreement and any inventory or move-in photos.',
      ],
    }),
  ]);
}

function buildEnglandUtilitiesHandoverSections(shared: SharedResidentialData): TemplateSection[] {
  const facts = shared.facts;

  return cleanTemplateSections([
    createSection({
      heading: 'Utilities and Bill Responsibility',
      rows: [
        { label: 'Council tax', value: facts.council_tax_responsibility },
        { label: 'Gas / electric / water', value: facts.utilities_responsibility },
        { label: 'Internet / broadband', value: facts.internet_responsibility },
        { label: 'Bills included in rent', value: yesNoText(facts.bills_included_in_rent) },
        { label: 'Included bills detail', value: buildEnglandBillCoverageText(facts) },
      ],
    }),
    createSection({
      heading: 'Opening Readings and Account Handover',
      bullets: [
        'Record opening meter readings and photographs where relevant at the start of the occupation.',
        'Note current suppliers, council tax reference details, and any service account numbers that need transferring.',
        'Keep this sheet with the agreement, handover record, and any check-in paperwork.',
      ],
    }),
  ]);
}

function buildEnglandPetRequestAddendumSections(shared: SharedResidentialData): TemplateSection[] {
  const facts = shared.facts;

  return cleanTemplateSections([
    createSection({
      heading: 'Pet Request Record',
      rows: [
        { label: 'Property', value: shared.property_address },
        { label: 'Tenant(s)', value: shared.tenant_names },
        { label: 'Pets authorised at the start', value: yesNoText(facts.pets_allowed) },
        { label: 'Current smoking policy', value: buildEnglandSmokingPolicyText(facts.smoking_allowed) },
      ],
      paragraphs: [
        'Use this addendum to record the tenant request, the landlord decision, any conditions attached to consent, and the date the request was decided.',
        'If a pet is approved, keep the signed addendum with the tenancy agreement, inventory, and any cleaning or damage notes that may matter later.',
      ],
    }),
  ]);
}

function buildEnglandVariationRecordSections(
  product: EnglandAssuredResidentialProduct,
  shared: SharedResidentialData
): TemplateSection[] {
  return cleanTemplateSections([
    createSection({
      heading: 'Variation Record Purpose',
      rows: [
        { label: 'Underlying product', value: formatEnglandProductLabel(product) },
        { label: 'Property', value: shared.property_address },
        { label: 'Landlord', value: shared.landlord_name },
        { label: 'Tenant(s)', value: shared.tenant_names },
      ],
      paragraphs: [
        'Use this record to note agreed changes after the tenancy starts without losing the original signed paperwork.',
        'Any important change should be dated, signed where appropriate, and stored with the main tenancy file.',
      ],
    }),
  ]);
}

function buildEnglandPremiumManagementScheduleSections(shared: SharedResidentialData): TemplateSection[] {
  const facts = shared.facts;

  return cleanTemplateSections([
    createSection({
      heading: 'Premium Management Schedule',
      rows: [
        { label: 'Primary management contact channel', value: formatPremiumOption(facts.management_contact_channel) },
        { label: 'Repairs reporting contact', value: facts.repair_reporting_contact },
        { label: 'Repairs response expectation', value: formatPremiumOption(facts.repair_response_timeframe) },
        { label: 'Inspection frequency', value: buildEnglandInspectionFrequencyText(facts.inspection_frequency) },
        { label: 'Routine inspection window', value: formatPremiumOption(facts.routine_inspection_window) },
        { label: 'Keys and access devices', value: facts.key_holders_summary },
        { label: 'Contractor access procedure', value: facts.contractor_access_procedure },
        { label: 'Contractor key release policy', value: facts.contractor_key_release_policy },
        { label: 'Hand-back expectations', value: facts.handover_expectations },
      ],
      paragraphs: [
        'This schedule sits behind the Premium agreement and records the fuller day-to-day management detail that does not belong in the Standard route.',
      ],
    }),
    createSection({
      heading: 'Premium Check-In and Utilities Protocol',
      rows: [
        { label: 'Check-in paperwork expectation', value: facts.check_in_documentation_expectation },
        { label: 'Utilities and account transfer expectation', value: facts.utilities_transfer_expectation },
      ],
      paragraphs: [
        'Use this section alongside the keys handover record, utilities handover sheet, and any signed inventory or meter evidence kept with the tenancy file.',
      ],
    }),
  ]);
}

function buildEnglandStudentMoveOutScheduleSections(shared: SharedResidentialData): TemplateSection[] {
  const facts = shared.facts;

  return cleanTemplateSections([
    createSection({
      heading: 'Student Move-Out and Guarantor Schedule',
      rows: [
        { label: 'Guarantor required', value: yesNoText(facts.guarantor_required) },
        { label: 'Guarantor scope', value: facts.student_guarantor_scope },
        { label: 'Replacement request notice window', value: facts.replacement_notice_window },
        { label: 'Replacement costs', value: facts.replacement_cost_responsibility },
        { label: 'Move-out keys and return process', value: facts.student_move_out_keys_process },
        { label: 'Cleaning and room hand-back standard', value: facts.student_cleaning_standard },
        { label: 'End-of-term return standard', value: facts.student_end_of_term_expectations },
      ],
    }),
  ]);
}

function buildEnglandHmoHouseRulesSections(shared: SharedResidentialData): TemplateSection[] {
  const facts = shared.facts;

  return cleanTemplateSections([
    createSection({
      heading: 'HMO / Shared House Rules Appendix',
      rows: [
        { label: 'Communal areas', value: facts.communal_areas },
        { label: 'Shared facilities schedule', value: facts.shared_facilities_schedule },
        { label: 'Communal cleaning', value: buildEnglandCommunalCleaningText(facts.communal_cleaning) },
        { label: 'Visitor policy', value: facts.visitor_policy },
        { label: 'Quiet hours', value: facts.quiet_hours },
        { label: 'Waste and recycling arrangements', value: facts.waste_collection_arrangements },
        { label: 'Fire safety notes', value: facts.fire_safety_notes },
      ],
    }),
  ]);
}

function buildEnglandLodgerHouseRulesAppendixSections(shared: SharedResidentialData): TemplateSection[] {
  const facts = shared.facts;

  return cleanTemplateSections([
    createSection({
      heading: 'Lodger House Rules Appendix',
      rows: [
        { label: 'Room occupied', value: facts.let_room_description },
        { label: 'House rules', value: facts.house_rules_notes },
        { label: 'Guest policy', value: facts.guest_policy },
        { label: 'Quiet hours', value: facts.quiet_hours },
        { label: 'Shared-space cleaning', value: facts.shared_space_cleaning },
        { label: 'Included services', value: facts.services_included },
        { label: 'Key return expectations', value: facts.key_return_expectations },
      ],
    }),
  ]);
}

type EnglandDepositSchemeName = 'DPS' | 'MyDeposits' | 'TDS';

interface EnglandDepositSchemeDetails {
  schemeName: EnglandDepositSchemeName;
  schemeWebsite: string;
}

function getEnglandDepositSchemeDetails(schemeName?: string): EnglandDepositSchemeDetails {
  const normalized = (schemeName || '').toLowerCase();

  if (normalized.includes('mydeposits')) {
    return {
      schemeName: 'MyDeposits',
      schemeWebsite: 'https://www.mydeposits.co.uk/',
    };
  }

  if (normalized.includes('tds')) {
    return {
      schemeName: 'TDS',
      schemeWebsite: 'https://www.tenancydepositscheme.com/',
    };
  }

  return {
    schemeName: 'DPS',
    schemeWebsite: 'https://www.depositprotection.com/',
  };
}

function buildEnglandDepositSupportData(shared: SharedResidentialData): Record<string, any> {
  const facts = shared.facts;
  const schemeDetails = getEnglandDepositSchemeDetails(facts.deposit_scheme_name || facts.deposit_scheme);
  const schemeMode = `${facts.deposit_scheme || ''} ${facts.deposit_scheme_name || ''}`.toLowerCase();
  const custodial = schemeMode.includes('custodial');
  const insured = !custodial;
  const depositReference = facts.deposit_reference_number || 'See scheme confirmation';
  const protectionDate =
    facts.deposit_protection_date ||
    facts.prescribed_information_date ||
    facts.deposit_paid_date ||
    shared.tenancy_start_date;
  const tenants = getTenantRecords(facts);

  return {
    ...facts,
    case_id: toText(facts.case_id),
    timestamp: Date.now(),
    property_address: shared.property_address,
    landlord_name: shared.landlord_name,
    landlord_address: shared.landlord_address,
    landlord_email: shared.landlord_email,
    landlord_phone: shared.landlord_phone,
    tenant_names: shared.tenant_names,
    tenant_primary_name: shared.tenant_primary_name,
    rent_amount: shared.rent_amount,
    deposit_amount: shared.deposit_amount,
    current_date: shared.current_date,
    tenancy_start_date: shared.tenancy_start_date,
    agent_manages: Boolean(facts.agent_name || facts.agent_address || facts.agent_email || facts.agent_phone),
    tenants: tenants.map((tenant) => ({
      ...tenant,
      name: tenant.full_name,
      address: (tenant as any).address || shared.property_address,
    })),
    deposit_received_date: facts.deposit_paid_date || shared.tenancy_start_date || shared.current_date,
    scheme_name: schemeDetails.schemeName,
    protection_date: protectionDate,
    deposit_reference: depositReference,
    protection_type: custodial ? 'Custodial' : 'Insured',
    custodial,
    insured,
    deposit_holding_method: custodial
      ? 'Custodial scheme - the deposit is held by the scheme'
      : 'Insured scheme - the deposit is held by the landlord or agent and backed by the scheme',
    scheme_address: 'See the deposit scheme website or membership confirmation for the current registered address.',
    scheme_phone: 'See scheme website',
    scheme_email: 'See scheme website',
    scheme_website: schemeDetails.schemeWebsite,
    scheme_registration: depositReference,
    scheme_adr_name: `${schemeDetails.schemeName} ADR Service`,
    scheme_adr_phone: 'See scheme website',
    scheme_adr_email: 'See scheme website',
    scheme_adr_website: schemeDetails.schemeWebsite,
    scheme_dispute_phone: 'See scheme website',
    scheme_dispute_email: 'See scheme website',
    scheme_dispute_website: schemeDetails.schemeWebsite,
    dispute_deadline: 'the deadline set by your deposit scheme after the tenancy ends',
  };
}

function shouldIncludeGuarantorDeed(
  product: ResidentialLettingProductSku,
  facts: Record<string, any>
): boolean {
  if (product === 'england_student_tenancy_agreement') {
    return isTruthySelection(facts.guarantor_required);
  }

  if (product === 'england_premium_tenancy_agreement') {
    return isTruthySelection(facts.guarantor_expected);
  }

  return false;
}

async function buildEnglandInformationSheetDocument(): Promise<ResidentialGeneratedDocument> {
  const pdf = await readFile(ENGLAND_INFORMATION_SHEET_PDF_PATH);
  const html = [
    '<!doctype html>',
    '<html lang="en">',
    '<head><meta charset="utf-8"><title>Renters\' Rights Act Information Sheet 2026</title></head>',
    '<body style="font-family: Arial, sans-serif; padding: 32px; color: #111827;">',
    '<h1>Renters\' Rights Act Information Sheet 2026</h1>',
    '<p>This bundle includes the exact government PDF stored locally in the repository.</p>',
    '<p>Give this PDF to every named tenant for an existing written England tenancy transition case.</p>',
    '</body>',
    '</html>',
  ].join('');

  return {
    title: 'Renters\' Rights Act Information Sheet 2026',
    description:
      'Exact government PDF for existing written England assured tenancies transitioning into the new regime.',
    category: 'guidance',
    document_type: 'renters_rights_information_sheet_2026',
    html,
    pdf,
    file_name: 'renters_rights_information_sheet_2026.pdf',
  };
}

async function generateEnglandChecklistDocument(
  shared: SharedResidentialData,
  outputFormat: ResidentialDocumentOutputFormat
): Promise<ResidentialGeneratedDocument> {
  const rendered = await generateDocument({
    templatePath: '_shared/standalone/checklist_standalone.hbs',
    data: {
      jurisdiction: 'england',
      property_address: shared.property_address,
      landlord_name: shared.landlord_name,
      current_date: shared.current_date,
      case_id: toText(shared.facts.case_id),
      england_tenancy_purpose: getEnglandTenancyPurpose(shared.facts.england_tenancy_purpose),
    },
    outputFormat,
  });

  return {
    title: 'Pre-Tenancy Checklist (England)',
    description:
      'England compliance checklist covering the main pre-tenancy and written-information actions for the tenancy file.',
    category: 'checklist',
    document_type: 'pre_tenancy_checklist_england',
    html: rendered.html,
    pdf: rendered.pdf,
    file_name: 'pre_tenancy_checklist_england.pdf',
  };
}

async function generateEnglandDepositSupportDocument(
  documentType: 'deposit_protection_certificate' | 'tenancy_deposit_information',
  shared: SharedResidentialData,
  outputFormat: ResidentialDocumentOutputFormat
): Promise<ResidentialGeneratedDocument> {
  const config =
    documentType === 'deposit_protection_certificate'
      ? {
          title: 'Deposit Protection Certificate',
          description: 'Standalone certificate confirming the deposit protection scheme details for England.',
          templatePath: 'uk/england/templates/deposit_protection_certificate.hbs',
          fileName: 'deposit_protection_certificate.pdf',
        }
      : {
          title: 'Prescribed Information Pack',
          description: 'Standalone tenancy deposit prescribed information pack for England.',
          templatePath: 'uk/england/templates/tenancy_deposit_information.hbs',
          fileName: 'prescribed_information_pack.pdf',
        };

  const rendered = await generateDocument({
    templatePath: config.templatePath,
    data: buildEnglandDepositSupportData(shared),
    outputFormat,
  });

  return {
    title: config.title,
    description: config.description,
    category: 'guidance',
    document_type: documentType,
    html: rendered.html,
    pdf: rendered.pdf,
    file_name: config.fileName,
  };
}

async function generateEnglandPackSupportDocument(
  product: EnglandModernTenancyProduct,
  shared: SharedResidentialData,
  outputFormat: ResidentialDocumentOutputFormat,
  params: {
    title: string;
    subtitle: string;
    description: string;
    documentType: string;
    fileName: string;
    category: ResidentialGeneratedDocument['category'];
    natureOfDocument: string;
    intro: string;
    sections: TemplateSection[];
    executionStatement?: string;
  }
): Promise<ResidentialGeneratedDocument> {
  const config: TemplateConfig = {
    title: params.title,
    subtitle: params.subtitle,
    intro: params.intro,
    description: params.description,
    category: params.category,
    documentType: params.documentType,
    fileName: params.fileName,
    templatePath: 'uk/england/templates/residential/agreement_document.hbs',
    counterpartyLabel: product === 'england_lodger_agreement' ? 'Lodger' : 'Tenant',
    natureOfDocument: params.natureOfDocument,
    executionStatement: params.executionStatement,
  };

  return generateTemplatedResidentialDocument(
    product as ResidentialLettingProductSku,
    shared,
    config,
    outputFormat,
    {
      sections: params.sections,
      signature_parties: [
        {
          label: 'File owner',
          name: firstNonEmpty(shared.landlord_name, 'Landlord'),
        },
      ],
    }
  );
}

async function generateModernEnglandPack(
  product: EnglandModernTenancyProduct,
  shared: SharedResidentialData,
  outputFormat: ResidentialDocumentOutputFormat,
  baseConfigs: Record<
    Exclude<ResidentialLettingProductSku, 'inventory_schedule_condition' | 'rent_arrears_letter'>,
    TemplateConfig
  >
): Promise<ResidentialGeneratedPack> {
  const purpose = getEnglandTenancyPurpose(shared.facts.england_tenancy_purpose);
  const packItems = getPackContents({
    product,
    jurisdiction: 'england',
    englandTenancyPurpose: purpose,
    depositTaken: Number(shared.deposit_amount) > 0,
    includeGuarantorDeed: shouldIncludeGuarantorDeed(product, shared.facts),
  });
  const documents: ResidentialGeneratedDocument[] = [];

  for (const item of packItems) {
    switch (item.key) {
      case 'england_standard_tenancy_agreement':
      case 'england_premium_tenancy_agreement':
      case 'england_student_tenancy_agreement':
      case 'england_hmo_shared_house_tenancy_agreement': {
        const assuredProduct = item.key as EnglandAssuredResidentialProduct;
        documents.push(
          await generateTemplatedResidentialDocument(
            assuredProduct,
            shared,
            baseConfigs[assuredProduct],
            outputFormat,
            {
              sections: buildEnglandAssuredSections(assuredProduct, shared, purpose),
              notes: buildEnglandAssuredNotes(assuredProduct, shared, purpose),
              tenancy_end_date: '',
            }
          )
        );
        break;
      }
      case 'england_written_statement_of_terms': {
        const config: TemplateConfig = {
          title: 'England Written Statement of Terms',
          subtitle: `${formatEnglandProductLabel(product)} for an existing verbal tenancy`,
          intro:
            'This document records the written terms and key statutory information for an existing verbal England assured tenancy. It is intended to evidence the current arrangement without pretending a brand new tenancy has been granted.',
          description:
            'Written statement of terms for an existing verbal England assured tenancy.',
          category: 'agreement',
          documentType: 'england_written_statement_of_terms',
          fileName: 'england-written-statement-of-terms.pdf',
          templatePath: 'uk/england/templates/residential/agreement_document.hbs',
          counterpartyLabel: 'Tenant',
          natureOfDocument: 'Written statement of assured tenancy terms',
          recitals: [
            'The tenant already occupies the Property under an existing verbal tenancy arrangement.',
            'The parties intend this written statement to record the key terms and statutory information for the continuing tenancy.',
          ],
          executionStatement:
            'The landlord should give this written statement to the tenant and keep a copy with the tenancy records.',
        };
        documents.push(
          await generateTemplatedResidentialDocument(product, shared, config, outputFormat, {
            sections: buildEnglandAssuredSections(product as EnglandAssuredResidentialProduct, shared, purpose),
            notes: buildEnglandAssuredNotes(product as EnglandAssuredResidentialProduct, shared, purpose),
            tenancy_end_date: '',
          })
        );
        break;
      }
      case 'england_tenancy_transition_guidance': {
        const config: TemplateConfig = {
          title: 'England Tenancy Transition Guidance',
          subtitle: `${formatEnglandProductLabel(product)} transition note for an existing written tenancy`,
          intro:
            'This guidance note is intended to sit on the tenancy file for an existing written England tenancy as part of the post-1 May 2026 transition work.',
          description:
            'Transition note for an existing written England assured tenancy moving into the post-1 May 2026 regime.',
          category: 'guidance',
          documentType: 'england_tenancy_transition_guidance',
          fileName: 'england-tenancy-transition-guidance.pdf',
          templatePath: 'uk/england/templates/residential/agreement_document.hbs',
          counterpartyLabel: 'Tenant',
          natureOfDocument: 'Transition guidance note',
          recitals: [
            'The existing written tenancy remains the main contractual record unless the parties later agree a lawful replacement document.',
            'This guidance note is intended to help the landlord organise the transition paperwork and supporting records for the continuing tenancy.',
          ],
          executionStatement:
            'Keep this transition note with the original written tenancy, the information sheet, and the supporting compliance records.',
        };
        documents.push(
          await generateTemplatedResidentialDocument(product, shared, config, outputFormat, {
            sections: buildEnglandTransitionGuidanceSections(product as EnglandAssuredResidentialProduct, shared),
            signature_parties: [
              {
                label: 'Prepared by',
                name: firstNonEmpty(shared.landlord_name, 'Landlord'),
              },
            ],
          })
        );
        break;
      }
      case 'renters_rights_information_sheet_2026':
        if (shouldIncludeEnglandInformationSheet({ jurisdiction: 'england', purpose })) {
          documents.push(await buildEnglandInformationSheetDocument());
        }
        break;
      case 'pre_tenancy_checklist_england':
        documents.push(await generateEnglandChecklistDocument(shared, outputFormat));
        break;
      case 'england_lodger_agreement':
        documents.push(
          await generateTemplatedResidentialDocument(
            'england_lodger_agreement',
            shared,
            baseConfigs.england_lodger_agreement,
            outputFormat,
            {
              sections: buildEnglandLodgerAgreementSections(shared),
              notes: toArrayOfText(shared.facts.additional_terms).join('\n\n'),
            }
          )
        );
        break;
      case 'england_lodger_checklist': {
        const config: TemplateConfig = {
          title: 'Room Let / Lodger Checklist',
          subtitle: 'Resident-landlord handover and room-let checklist',
          intro:
            'This checklist is intended to sit alongside the room-let agreement and help the resident landlord keep a practical handover and occupancy record.',
          description:
            'Resident-landlord room-let checklist covering handover, house rules, and key practical compliance points.',
          category: 'checklist',
          documentType: 'england_lodger_checklist',
          fileName: 'england-lodger-checklist.pdf',
          templatePath: 'uk/england/templates/residential/agreement_document.hbs',
          counterpartyLabel: 'Lodger',
          natureOfDocument: 'Resident-landlord checklist',
          executionStatement:
            'Keep this checklist with the lodger agreement, key record, and any room inventory or move-in photographs.',
        };
        documents.push(
          await generateTemplatedResidentialDocument(
            'england_lodger_agreement',
            shared,
            config,
            outputFormat,
            {
              sections: buildEnglandLodgerChecklistSections(shared),
              signature_parties: [
                {
                  label: 'Prepared by',
                  name: firstNonEmpty(shared.landlord_name, 'Landlord'),
                },
              ],
            }
          )
        );
        break;
      }
      case 'deposit_protection_certificate':
      case 'tenancy_deposit_information':
        documents.push(await generateEnglandDepositSupportDocument(item.key, shared, outputFormat));
        break;
      case 'england_keys_handover_record':
        documents.push(
          await generateEnglandPackSupportDocument(product, shared, outputFormat, {
            title: 'Keys & Handover Record',
            subtitle: `${formatEnglandProductLabel(product)} move-in handover record`,
            description: 'Practical handover record for keys, access devices, and move-in confirmations.',
            documentType: 'england_keys_handover_record',
            fileName: 'england-keys-handover-record.pdf',
            category: 'checklist',
            natureOfDocument: 'Handover record',
            intro: 'Use this handover record alongside the agreement to note keys, fobs, alarm codes, and the points confirmed at move-in.',
            sections: buildEnglandKeysHandoverSections(product, shared),
            executionStatement: 'Keep this handover record with the agreement, inventory, and any move-in photographs or check-in notes.',
          })
        );
        break;
      case 'england_utilities_handover_sheet':
        documents.push(
          await generateEnglandPackSupportDocument(product, shared, outputFormat, {
            title: 'Utilities & Meter Handover Sheet',
            subtitle: `${formatEnglandProductLabel(product)} utilities handover record`,
            description: 'Record for utilities responsibility, opening readings, and account handover notes.',
            documentType: 'england_utilities_handover_sheet',
            fileName: 'england-utilities-handover-sheet.pdf',
            category: 'checklist',
            natureOfDocument: 'Utilities handover sheet',
            intro: 'Use this sheet to record utility responsibility, supplier details, opening meter readings, and anything handed over to the tenant.',
            sections: buildEnglandUtilitiesHandoverSections(shared),
            executionStatement: 'Keep this sheet with the handover record, supplier correspondence, and any meter-reading photos.',
          })
        );
        break;
      case 'england_pet_request_addendum':
        documents.push(
          await generateEnglandPackSupportDocument(product, shared, outputFormat, {
            title: 'Pet Request / Consent Addendum',
            subtitle: `${formatEnglandProductLabel(product)} pet-request record`,
            description: 'Optional addendum for recording a pet request, decision, and any consent conditions.',
            documentType: 'england_pet_request_addendum',
            fileName: 'england-pet-request-addendum.pdf',
            category: 'schedule',
            natureOfDocument: 'Pet request addendum',
            intro: 'Use this addendum if the tenant asks for a pet or if the landlord wants the consent terms recorded clearly in writing.',
            sections: buildEnglandPetRequestAddendumSections(shared),
            executionStatement: 'If used, store the signed addendum with the tenancy agreement and any updated inventory or cleaning notes.',
          })
        );
        break;
      case 'england_tenancy_variation_record':
        documents.push(
          await generateEnglandPackSupportDocument(product, shared, outputFormat, {
            title: 'Tenancy Variation Record',
            subtitle: `${formatEnglandProductLabel(product)} variation record`,
            description: 'Simple record for agreed changes after the tenancy agreement has been issued.',
            documentType: 'england_tenancy_variation_record',
            fileName: 'england-tenancy-variation-record.pdf',
            category: 'schedule',
            natureOfDocument: 'Variation record',
            intro: 'Use this record to log agreed changes after the main agreement is signed, so the tenancy file stays clear and up to date.',
            sections: buildEnglandVariationRecordSections(
              (product === 'england_lodger_agreement'
                ? 'england_standard_tenancy_agreement'
                : product) as EnglandAssuredResidentialProduct,
              shared
            ),
            executionStatement: 'Any material change should be dated and retained with the tenancy file.',
          })
        );
        break;
      case 'england_premium_management_schedule':
        documents.push(
          await generateEnglandPackSupportDocument(product, shared, outputFormat, {
            title: 'Premium Management Schedule',
            subtitle: 'Premium operational and management schedule',
            description: 'Premium-only schedule for inspections, repairs reporting, keys, contractor access, and hand-back expectations.',
            documentType: 'england_premium_management_schedule',
            fileName: 'england-premium-management-schedule.pdf',
            category: 'schedule',
            natureOfDocument: 'Management schedule',
            intro: 'This Premium schedule records the operational and management detail that sits behind the main agreement.',
            sections: buildEnglandPremiumManagementScheduleSections(shared),
            executionStatement: 'Keep this schedule with the Premium agreement and handover file.',
          })
        );
        break;
      case 'england_student_move_out_schedule':
        documents.push(
          await generateEnglandPackSupportDocument(product, shared, outputFormat, {
            title: 'Student Move-Out & Guarantor Schedule',
            subtitle: 'Student move-out, replacement, and guarantor support schedule',
            description: 'Student-only schedule for guarantor scope, replacement procedure, keys, cleaning, and end-of-term return expectations.',
            documentType: 'england_student_move_out_schedule',
            fileName: 'england-student-move-out-schedule.pdf',
            category: 'schedule',
            natureOfDocument: 'Student move-out schedule',
            intro: 'This schedule records the practical end-of-term, guarantor, and replacement details for the tenancy.',
            sections: buildEnglandStudentMoveOutScheduleSections(shared),
            executionStatement: 'Keep this schedule with the student agreement, any guarantor deed, and the check-out file.',
          })
        );
        break;
      case 'england_hmo_house_rules_appendix':
        documents.push(
          await generateEnglandPackSupportDocument(product, shared, outputFormat, {
            title: 'HMO / Shared House Rules Appendix',
            subtitle: 'Communal areas and sharer house-rules appendix',
            description: 'Shared-house appendix covering communal areas, cleaning, waste, visitors, quiet hours, and fire-safety notes.',
            documentType: 'england_hmo_house_rules_appendix',
            fileName: 'england-hmo-house-rules-appendix.pdf',
            category: 'schedule',
            natureOfDocument: 'House rules appendix',
            intro: 'This appendix records the practical communal-area and shared-house rules for the tenancy.',
            sections: buildEnglandHmoHouseRulesSections(shared),
            executionStatement: 'Keep this appendix with the HMO / shared-house agreement and any property-management notes.',
          })
        );
        break;
      case 'england_lodger_house_rules_appendix':
        documents.push(
          await generateEnglandPackSupportDocument(product, shared, outputFormat, {
            title: 'Lodger House Rules Appendix',
            subtitle: 'Resident-landlord room-let house-rules appendix',
            description: 'Resident-landlord appendix for guests, quiet hours, shared-space cleaning, and room hand-back expectations.',
            documentType: 'england_lodger_house_rules_appendix',
            fileName: 'england-lodger-house-rules-appendix.pdf',
            category: 'schedule',
            natureOfDocument: 'House rules appendix',
            intro: 'This appendix records the practical shared-home rules and room-let expectations for the room let.',
            sections: buildEnglandLodgerHouseRulesAppendixSections(shared),
            executionStatement: 'Keep this appendix with the lodger agreement, checklist, and key handover record.',
          })
        );
        break;
      case 'guarantor_agreement':
        documents.push(
          await generateTemplatedResidentialDocument(
            'guarantor_agreement',
            shared,
            baseConfigs.guarantor_agreement,
            outputFormat
          )
        );
        break;
      default:
        break;
    }
  }

  return { documents };
}

async function generateTemplatedResidentialDocument(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData,
  config: TemplateConfig,
  outputFormat: ResidentialDocumentOutputFormat,
  dataOverrides: Record<string, any> = {}
): Promise<ResidentialGeneratedDocument> {
  const data = {
    ...buildTemplateData(product, shared, config),
    ...dataOverrides,
  };
  const rendered = await generateDocument({
    templatePath: config.templatePath,
    data,
    outputFormat,
  });

  return {
    title: config.title,
    description: config.description,
    category: config.category,
    document_type: config.documentType,
    html: rendered.html,
    pdf: rendered.pdf,
    file_name: config.fileName,
  };
}

export async function generateResidentialLettingDocuments(
  product: ResidentialLettingProductSku,
  facts: Record<string, any>,
  options: ResidentialGenerationOptions = {}
): Promise<ResidentialGeneratedPack> {
  const outputFormat = options.outputFormat || 'both';
  const shared = buildSharedData(facts);

  const agreementTemplate = 'uk/england/templates/residential/agreement_document.hbs';
  const applicationTemplate = 'uk/england/templates/residential/application_document.hbs';
  const inspectionTemplate = 'uk/england/templates/residential/inspection_report.hbs';
  const inventoryTemplate = '_shared/standalone/inventory_standalone.hbs';
  const arrearsTemplate = 'uk/england/templates/residential/rent_arrears_letter.hbs';

  const configs: Record<
    Exclude<ResidentialLettingProductSku, 'inventory_schedule_condition' | 'rent_arrears_letter'>,
    TemplateConfig
  > = {
    england_standard_tenancy_agreement: {
      title: 'Standard Tenancy Agreement',
      subtitle: 'Tenancy agreement for a residential let in England',
      intro:
        'This agreement records the core terms for a straightforward residential letting of the property in England.',
      description:
        'Standard tenancy agreement for a residential let in England.',
      category: 'agreement',
      documentType: 'england_standard_tenancy_agreement',
      fileName: 'england-standard-tenancy-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'Residential tenancy agreement',
      recitals: [
        'The Landlord agrees to let the Property to the Tenant for residential occupation on the terms set out in this agreement.',
        'The parties intend this document to record the principal occupation, payment, and management terms for the letting.',
      ],
      executionStatement:
        'This agreement should be signed by the Landlord and the Tenant and then kept with the tenancy records.',
    },
    england_premium_tenancy_agreement: {
      title: 'Premium Tenancy Agreement',
      subtitle: 'Expanded tenancy agreement for a residential let in England',
      intro:
        'This agreement records a residential letting in England with fuller operational and management drafting than the standard route.',
      description:
        'Premium tenancy agreement for a residential let in England with fuller drafting.',
      category: 'agreement',
      documentType: 'england_premium_tenancy_agreement',
      fileName: 'england-premium-tenancy-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'Premium residential tenancy agreement',
      recitals: [
        'The Landlord agrees to let the Property to the Tenant for residential occupation on the terms set out in this premium agreement.',
        'The parties intend fuller operational and management detail to be recorded in the agreement while keeping the letting within the ordinary residential tenancy file.',
      ],
      executionStatement:
        'This premium agreement should be signed by the Landlord and the Tenant and retained with the tenancy records.',
    },
    england_student_tenancy_agreement: {
      title: 'Student Tenancy Agreement',
      subtitle: 'Tenancy agreement for a student let in England',
      intro:
        'This document records a student-focused England residential letting and the student-specific features recorded for the tenancy file.',
      description:
        'England student tenancy agreement with sharer, guarantor, and end-of-term detail.',
      category: 'agreement',
      documentType: 'england_student_tenancy_agreement',
      fileName: 'england-student-tenancy-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'Student residential tenancy agreement',
      recitals: [
        'The Landlord agrees to let the Property to the Tenant group for student-focused residential occupation on the terms set out in this agreement.',
        'The parties intend student-specific sharer, guarantor, and hand-back expectations to be captured in the agreement.',
      ],
      executionStatement:
        'This student agreement should be signed by the Landlord and the Tenant group and kept with any related guarantor documents.',
    },
    england_hmo_shared_house_tenancy_agreement: {
      title: 'HMO / Shared House Tenancy Agreement',
      subtitle: 'Tenancy agreement for an HMO or shared house in England',
      intro:
        'This document records an England HMO or shared-house letting where communal-area and sharer detail need to be recorded expressly in the main agreement.',
      description:
        'England HMO / shared-house tenancy agreement with communal-area and sharer drafting.',
      category: 'agreement',
      documentType: 'england_hmo_shared_house_tenancy_agreement',
      fileName: 'england-hmo-shared-house-tenancy-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'HMO / shared-house tenancy agreement',
      recitals: [
        'The Landlord agrees to let the Property to the Tenant group for shared residential occupation on the terms set out in this agreement.',
        'The parties intend communal-area, sharer, and property-management detail to form part of the primary agreement.',
      ],
      executionStatement:
        'This HMO/shared-house agreement should be signed by the Landlord and the Tenant group and retained with the property records.',
    },
    england_lodger_agreement: {
      title: 'Room Let / Lodger Agreement',
      subtitle: 'Lodger agreement for a resident-landlord let in England',
      intro:
        'This document records a resident-landlord room let in England and the practical terms on which the lodger occupies the room and shared facilities.',
      description:
        'England resident-landlord lodger agreement for a room let or licence-style arrangement.',
      category: 'agreement',
      documentType: 'england_lodger_agreement',
      fileName: 'england-lodger-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Lodger',
      natureOfDocument: 'Resident-landlord room-let agreement',
      recitals: [
        'The resident Landlord permits the Lodger to occupy the agreed room at the Property and to use the shared facilities identified in this agreement.',
        'The parties intend this document to record the practical room-let terms, house rules, and notice arrangements that apply to the occupation.',
      ],
      executionStatement:
        'This lodger agreement should be signed by the resident Landlord and the Lodger and kept with the room-let records.',
    },
    guarantor_agreement: {
      title: 'Guarantor Agreement',
      subtitle: 'Deed of guarantee and indemnity for an England residential tenancy',
      intro:
        'This deed is intended to give the Landlord direct recourse against the Guarantor for the rent and tenant obligations identified in the tenancy documents.',
      description: 'England residential guarantor agreement drafted as a deed of guarantee and indemnity.',
      category: 'agreement',
      documentType: 'guarantor_agreement',
      fileName: 'guarantor-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'Deed of guarantee and indemnity',
      recitals: [
        'The Landlord has agreed to grant or continue the tenancy of the Property to the Tenant.',
        'The Guarantor has agreed to guarantee the obligations of the Tenant on the terms set out in this deed.',
      ],
      executionStatement:
        'This document is intended to take effect as a deed. The guarantor should sign it in the presence of an independent adult witness.',
      executionAsDeed: true,
      deedWarning:
        'Important: because this document is drafted as a deed, the guarantor signature should be witnessed and the final signed copy retained with the tenancy file.',
    },
    residential_sublet_agreement: {
      title: 'Residential Sublet Agreement',
      subtitle: 'England subtenancy agreement with landlord consent provisions',
      intro:
        'This agreement records the terms on which the Head Tenant sublets all or part of the Property to the Subtenant, subject to any required superior consent.',
      description: 'England residential sublet agreement distinguishing the head tenancy and the subtenancy.',
      category: 'agreement',
      documentType: 'residential_sublet_agreement',
      fileName: 'residential-sublet-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'Subtenancy agreement',
      recitals: [
        'The Head Tenant holds the Property under a superior tenancy.',
        'The parties intend to create a subtenancy only to the extent permitted by the superior tenancy and any landlord consent.',
      ],
      executionStatement:
        'This agreement should be signed by the Head Tenant and the Subtenant. If landlord consent is being documented here, the Landlord should also sign.',
    },
    lease_amendment: {
      title: 'Lease Amendment',
      subtitle: 'England tenancy amendment agreement',
      intro:
        'This agreement is intended to vary specific terms of the existing tenancy without replacing the whole tenancy except where the law requires otherwise.',
      description: 'England tenancy amendment agreement referencing the original tenancy and preserving the balance of its terms.',
      category: 'agreement',
      documentType: 'lease_amendment',
      fileName: 'lease-amendment.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'Variation agreement',
      recitals: [
        'The parties entered into the original tenancy agreement for the Property.',
        'The parties wish to vary only the matters expressly set out in this amendment.',
      ],
      executionStatement:
        'This amendment should be signed by the Landlord and the Tenant and then kept with the original tenancy agreement.',
    },
    lease_assignment_agreement: {
      title: 'Lease Assignment Agreement',
      subtitle: 'England assignment of residential tenancy with landlord consent',
      intro:
        'This agreement records the transfer of the outgoing tenant interest to the incoming tenant and the extent of the Landlord consent to that transfer.',
      description: 'England tenancy assignment agreement for outgoing and incoming tenants with landlord consent.',
      category: 'agreement',
      documentType: 'lease_assignment_agreement',
      fileName: 'lease-assignment-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'Assignment agreement',
      recitals: [
        'The outgoing tenant is currently party to the tenancy of the Property.',
        'The parties wish to record an assignment of the outgoing tenant interest to the incoming tenant with the Landlord consent stated in this document.',
      ],
      executionStatement:
        'This assignment agreement should be signed by the Landlord, the Outgoing Tenant, and the Incoming Tenant.',
    },
    repayment_plan_agreement: {
      title: 'Repayment Plan Agreement',
      subtitle: 'England rent arrears repayment agreement',
      intro:
        'This agreement records a structured proposal for clearing existing rent arrears while preserving the Landlord rights if the plan is not maintained.',
      description: 'England repayment plan agreement for residential rent arrears.',
      category: 'agreement',
      documentType: 'repayment_plan_agreement',
      fileName: 'repayment-plan-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'Repayment agreement',
      recitals: [
        'Rent arrears have accrued under the tenancy of the Property.',
        'The parties wish to record a repayment plan without prejudice to the Landlord rights unless expressly stated.',
      ],
      executionStatement:
        'This agreement should be signed by the Landlord and the Tenant and reviewed against the tenancy arrears ledger if payments are missed.',
    },
    residential_tenancy_application: {
      title: 'Residential Tenancy Application',
      subtitle: 'England residential tenancy application and referencing authority',
      intro:
        'This form is intended to collect core applicant information, affordability details, references, and authority for referencing checks before a tenancy is offered.',
      description: 'England tenancy application form with declarations and referencing authority.',
      category: 'form',
      documentType: 'residential_tenancy_application',
      fileName: 'residential-tenancy-application.pdf',
      templatePath: applicationTemplate,
      counterpartyLabel: 'Applicant',
      natureOfDocument: 'Application form',
      executionStatement:
        'The applicant should sign and date the declaration section. The landlord or agent should retain the completed form with the application record.',
    },
    rental_inspection_report: {
      title: 'Rental Inspection Report',
      subtitle: 'England residential inspection and condition report',
      intro:
        'This report provides a structured written record of condition, cleanliness, safety observations, keys, and utility readings at the inspection date stated below.',
      description: 'England residential rental inspection report for move-in, move-out, or periodic checks.',
      category: 'report',
      documentType: 'rental_inspection_report',
      fileName: 'rental-inspection-report.pdf',
      templatePath: inspectionTemplate,
      counterpartyLabel: 'Occupier',
      natureOfDocument: 'Inspection report',
      executionStatement:
        'The inspector should sign this report. If the occupier attends, the occupier should also sign or record any comments for the tenancy file.',
    },
    flatmate_agreement: {
      title: 'Flatmate Agreement',
      subtitle: 'England occupier sharing agreement',
      intro:
        'This agreement records internal sharing arrangements between occupiers and is intended to sit alongside, not replace, the landlord-facing tenancy documents.',
      description: 'England flatmate agreement covering contributions, house rules, and exit arrangements.',
      category: 'agreement',
      documentType: 'flatmate_agreement',
      fileName: 'flatmate-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Occupier',
      natureOfDocument: 'Occupier sharing agreement',
      recitals: [
        'The occupiers share the Property under a tenancy or licence arrangement.',
        'The occupiers wish to record practical arrangements between themselves regarding occupation and household management.',
      ],
      executionStatement:
        'Each occupier should sign this agreement and keep a copy with the household records.',
    },
    renewal_tenancy_agreement: {
      title: 'Renewal Tenancy Agreement',
      subtitle: 'England tenancy renewal agreement',
      intro:
        'This agreement records the continuation of the tenancy for a new agreed period and the terms that remain in force from the earlier tenancy documents.',
      description: 'England renewal agreement for a continuing residential tenancy.',
      category: 'agreement',
      documentType: 'renewal_tenancy_agreement',
      fileName: 'renewal-tenancy-agreement.pdf',
      templatePath: agreementTemplate,
      counterpartyLabel: 'Tenant',
      natureOfDocument: 'Renewal agreement',
      recitals: [
        'The parties are already bound by an earlier tenancy of the Property.',
        'The parties wish to document a renewed term or continuing arrangement from the renewal start date stated in this agreement.',
      ],
      executionStatement:
        'This agreement should be read together with the earlier tenancy documents and signed by the Landlord and the Tenant.',
    },
  };

  if (isEnglandModernTenancyProduct(product)) {
    return generateModernEnglandPack(product, shared, outputFormat, configs);
  }

  let document: ResidentialGeneratedDocument;

  if (product === 'inventory_schedule_condition') {
    const structuredInventoryRooms = buildStructuredInventoryRooms(shared.facts);
    const standaloneInventoryRooms = buildStandaloneInventoryRooms(shared.facts);
    const inventoryEvidenceAppendix = buildEvidenceAppendix(shared.facts.inventory_evidence_files);
    const inventoryData = {
      current_date: shared.current_date,
      property_address: shared.property_address,
      landlord_name: shared.landlord_name,
      tenant_names: shared.tenant_names,
      tenancy_start_date: firstNonEmpty(shared.tenancy_start_date, shared.facts.inspection_date),
      inspection_date: firstNonEmpty(shared.facts.inventory_date, shared.facts.inspection_date),
      inventory_date: firstNonEmpty(shared.facts.inventory_date, shared.facts.inspection_date),
      agent_name: firstNonEmpty(shared.facts.inspector_name, shared.facts.agent_name),
      meter_reading_gas: shared.facts.meter_reading_gas,
      meter_reading_electric: shared.facts.meter_reading_electric,
      meter_reading_water: shared.facts.meter_reading_water,
      number_of_front_door_keys: shared.facts.number_of_front_door_keys,
      number_of_back_door_keys: shared.facts.number_of_back_door_keys,
      number_of_window_keys: shared.facts.number_of_window_keys,
      number_of_mailbox_keys: shared.facts.number_of_mailbox_keys,
      access_cards_fobs: firstNonEmpty(shared.facts.access_cards_fobs, shared.facts.keys_provided_summary),
      key_replacement_cost: shared.facts.key_replacement_cost,
      document_facts_rows:
        cleanRows([
          { label: 'Property', value: shared.property_address },
          { label: 'Landlord / agent', value: shared.landlord_name },
          { label: 'Tenant(s)', value: shared.tenant_names },
          { label: 'Inventory date', value: firstNonEmpty(shared.facts.inventory_date, shared.facts.inspection_date) },
          { label: 'Prepared using guided responses', value: 'Yes' },
        ]) || [],
      inventory_key_rows:
        cleanRows([
          { label: 'Front door keys', value: shared.facts.number_of_front_door_keys },
          { label: 'Back door keys', value: shared.facts.number_of_back_door_keys },
          { label: 'Window keys', value: shared.facts.number_of_window_keys },
          { label: 'Mailbox keys', value: shared.facts.number_of_mailbox_keys },
          { label: 'Access cards / fobs', value: firstNonEmpty(shared.facts.access_cards_fobs, shared.facts.keys_provided_summary) },
        ]) || [],
      inventory_general_rows:
        cleanRows([
          { label: 'Furnished status', value: shared.facts.furnished_status },
          { label: 'Manuals / documents handed over', value: shared.facts.document_handover_notes },
          { label: 'Safety observations', value: shared.facts.safety_checks_summary },
          { label: 'Tenant comments', value: shared.facts.tenant_comments },
          { label: 'Photo schedule reference', value: shared.facts.photo_schedule_reference },
        ]) || [],
      inventory_evidence_appendix: inventoryEvidenceAppendix,
      custom_inventory_rooms: standaloneInventoryRooms,
      structured_inventory_rooms: structuredInventoryRooms,
      inventory:
        standaloneInventoryRooms.length > 0
          ? { rooms: standaloneInventoryRooms }
          : shared.facts.inventory || null,
      inventory_schedule_notes: [
        buildLabeledObservation('Property layout', shared.facts.property_layout_notes),
        buildLabeledObservation('General condition', shared.facts.room_condition_summary),
        buildLabeledObservation('Cleanliness', shared.facts.cleanliness_overview),
        buildLabeledObservation('Defects / action points', shared.facts.defects_action_items),
        buildLabeledObservation('Keys summary', shared.facts.keys_provided_summary),
        buildLabeledObservation('Combined utility readings', shared.facts.utility_meter_readings),
        buildLabeledObservation('Meter serial numbers', shared.facts.meter_serial_numbers),
        buildLabeledObservation('Safety observations', shared.facts.safety_checks_summary),
        buildLabeledObservation('Photo / evidence reference', shared.facts.photo_schedule_reference),
        buildLabeledObservation('Documents and manuals handed over', shared.facts.document_handover_notes),
        buildLabeledObservation('Tenant comments', shared.facts.tenant_comments),
        toText(shared.document_notes),
      ]
        .filter(Boolean)
        .join('\n\n'),
      additional_tenants: getTenantRecords(shared.facts).length > 1,
      case_id: toText(shared.facts.case_id),
    };

    const rendered = await generateDocument({
      templatePath: inventoryTemplate,
      data: inventoryData,
      outputFormat,
    });

    document = {
      title: 'Inventory & Schedule of Condition',
      description: 'England inventory and schedule of condition for check-in evidence and later comparison.',
      category: 'schedule',
      document_type: 'inventory_schedule_condition',
      html: rendered.html,
      pdf: rendered.pdf,
      file_name: 'inventory-schedule-of-condition.pdf',
    };
  } else if (product === 'rent_arrears_letter') {
    const rendered = await generateDocument({
      templatePath: arrearsTemplate,
      data: buildRentArrearsLetterData(shared),
      outputFormat,
    });

    document = {
      title: 'Rent Arrears Letter',
      description: 'England rent arrears demand letter with professional debt-recovery wording.',
      category: 'letter',
      document_type: 'rent_arrears_letter',
      html: rendered.html,
      pdf: rendered.pdf,
      file_name: 'rent-arrears-letter.pdf',
    };
  } else {
    document = await generateTemplatedResidentialDocument(
      product,
      shared,
      configs[product],
      outputFormat
    );
  }

  return { documents: [document] };
}
