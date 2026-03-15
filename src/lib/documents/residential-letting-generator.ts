import { generateDocument } from '@/lib/documents/generator';
import type { ResidentialLettingProductSku } from '@/lib/residential-letting/products';

export interface ResidentialGeneratedDocument {
  title: string;
  description: string;
  category: 'agreement' | 'form' | 'report' | 'letter' | 'schedule';
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

interface TemplateSection {
  heading: string;
  intro?: string;
  rows?: TemplateRow[];
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
  protocol_note: string;
  advice_points: string[];
  closing_paragraphs: string[];
}

const RENTERS_RIGHTS_ACT_CUTOVER = '2026-05-01';

function joinAddress(...parts: Array<string | null | undefined>) {
  return parts.map(toText).filter(Boolean).join(', ');
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function yesNoText(value: unknown, trueLabel = 'Yes', falseLabel = 'No'): string {
  if (value === true) return trueLabel;
  if (value === false) return falseLabel;
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

function formatMoney(value: unknown): string {
  if (typeof value === 'string' && value.trim().startsWith('£')) {
    return value.trim();
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  return `£${numeric.toFixed(2)}`;
}

function splitEntries(value: unknown): string[] {
  const text = toText(value);
  if (!text) return [];

  return text
    .split(/\r?\n|;/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildLabeledObservation(label: string, value: unknown): string | undefined {
  const text = toText(value);
  return text ? `${label}: ${text}` : undefined;
}

function cleanRows(rows: Array<{ label: string; value: unknown }>): TemplateRow[] | undefined {
  const cleaned = rows
    .map((row) => ({ label: row.label, value: formatIsoDateText(row.value) }))
    .filter((row) => row.value.length > 0);
  return cleaned.length > 0 ? cleaned : undefined;
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
  bullets?: Array<unknown>;
  paragraphs?: Array<unknown>;
}): TemplateSection {
  const section: TemplateSection = {
    heading: params.heading,
  };

  const intro = toText(params.intro);
  if (intro) section.intro = intro;

  const rows = params.rows ? cleanRows(params.rows) : undefined;
  const bullets = params.bullets ? cleanList(params.bullets) : undefined;
  const paragraphs = params.paragraphs ? cleanList(params.paragraphs) : undefined;

  if (rows) section.rows = rows;
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

function normalizeResidentialFacts(rawFacts: Record<string, any>): Record<string, any> {
  const tenants = getTenantRecords(rawFacts);
  const primaryTenant = tenants[0] || {};

  return {
    ...rawFacts,
    tenants,
    applicant_name: firstNonEmpty(rawFacts.applicant_name, primaryTenant.full_name, rawFacts.tenant_1_name),
    applicant_email: firstNonEmpty(rawFacts.applicant_email, rawFacts.tenant_email, primaryTenant.email),
    applicant_phone: firstNonEmpty(rawFacts.applicant_phone, rawFacts.tenant_phone, primaryTenant.phone),
    current_address: firstNonEmpty(rawFacts.current_address, primaryTenant.address),
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
    amendment_scope: firstNonEmpty(
      rawFacts.amendment_scope,
      rawFacts.amended_clauses_reference,
      rawFacts.amendment_title
    ),
    changed_terms_summary: firstNonEmpty(rawFacts.changed_terms_summary, rawFacts.amendment_summary),
    renewal_terms_summary: firstNonEmpty(rawFacts.renewal_terms_summary, rawFacts.amendment_summary),
    bills_split: firstNonEmpty(rawFacts.bills_split, rawFacts.bill_split_summary),
    rent_split: firstNonEmpty(rawFacts.rent_split, rawFacts.flatmate_rent_split),
    house_rules: firstNonEmpty(rawFacts.house_rules, rawFacts.house_rules_summary),
    initial_payment_date: firstNonEmpty(rawFacts.initial_payment_date, rawFacts.repayment_start_date),
    instalment_amount: firstNonEmpty(rawFacts.instalment_amount, rawFacts.repayment_amount),
    letter_type: firstNonEmpty(rawFacts.letter_type, rawFacts.arrears_letter_type),
    missed_rent_periods: firstNonEmpty(rawFacts.missed_rent_periods, rawFacts.arrears_periods_missed),
    arrears_schedule_reference: firstNonEmpty(
      rawFacts.arrears_schedule_reference,
      rawFacts.arrears_schedule_attached_reference
    ),
    flatmate_names: firstNonEmpty(rawFacts.flatmate_names, getTenantNames(rawFacts)),
    sublet_deposit: firstNonEmpty(rawFacts.sublet_deposit, rawFacts.deposit_amount),
    sublet_rent: firstNonEmpty(rawFacts.sublet_rent, rawFacts.rent_amount),
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
    landlord_name: firstNonEmpty(facts.landlord_full_name, facts.landlord_name),
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
    tenancy_start_date: facts.tenancy_start_date || '',
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
    addParty({
      label:
        product === 'residential_sublet_agreement' || product === 'lease_assignment_agreement'
          ? 'Landlord / consenting party'
          : 'Landlord',
      name: shared.landlord_name,
      address: shared.landlord_address,
      email: shared.landlord_email,
      phone: shared.landlord_phone,
    });
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
      addSignatureParty({ label: 'Landlord', name: shared.landlord_name });
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
      addSignatureParty({ label: 'Landlord', name: shared.landlord_name });
      addSignatureParty({
        label: 'Outgoing tenant',
        name: firstNonEmpty(facts.outgoing_tenant_name, shared.tenant_primary_name),
      });
      addSignatureParty({ label: 'Incoming tenant', name: toText(facts.incoming_tenant_name) });
      return parties;
    case 'residential_sublet_agreement':
      addSignatureParty({ label: 'Landlord (consent)', name: shared.landlord_name });
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
      addSignatureParty({ label: 'Landlord', name: shared.landlord_name });
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
            { label: 'Payment method', value: firstNonEmpty(facts.payment_method, facts.sublet_payment_method) },
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
            yesNoText(facts.release_outgoing_tenant) === 'Yes'
              ? 'The Landlord releases the Outgoing Tenant from tenant obligations falling due after the assignment date, but not from liabilities already accrued before that date.'
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
            { label: 'Desired move-in date', value: facts.desired_move_in_date },
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
          bullets: [
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
            { label: 'Payment method', value: facts.payment_method },
          ],
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

function buildDocumentReference(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): string {
  const suffix = toText(shared.facts.case_id)
    ? toText(shared.facts.case_id).slice(-8).toUpperCase()
    : toText(shared.current_date).replace(/-/g, '');

  return `RL-${product.replace(/_/g, '-').toUpperCase()}-${suffix}`;
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
    sections,
    notes: buildCommonNote(product, shared),
    parties,
    signature_parties: signatureParties,
    document_reference: documentReference,
    recitals: config.recitals || [],
    execution_statement:
      config.executionStatement ||
      'This document should be signed and dated by the parties and retained with the tenancy records.',
    execution_as_deed: config.executionAsDeed === true,
    deed_warning: toText(config.deedWarning),
    case_id: toText(shared.facts.case_id),
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
  const paymentDeadline = firstNonEmpty(facts.final_deadline, facts.response_deadline, shared.current_date);
  const responseDeadline = firstNonEmpty(facts.response_deadline, facts.final_deadline, paymentDeadline);
  const paymentMethod = firstNonEmpty(facts.payment_method, 'Bank transfer');
  const paymentDetails = firstNonEmpty(
    facts.payment_details,
    facts.payment_reference_override,
    facts.bank_details,
    facts.landlord_bank_details
  );

  const openingParagraphs = isFinalWarning
    ? [
        `I write further to earlier requests for payment. As at ${firstNonEmpty(facts.arrears_date, shared.current_date)}, rent arrears of ${arrearsAmount || 'the stated sum'} remain outstanding on the tenancy of the Property.`,
        'This letter is a final warning and a request for immediate engagement so that the arrears can be resolved without formal recovery steps if possible.',
      ]
    : [
        `Our records show that rent remains overdue on the tenancy of the Property. As at ${firstNonEmpty(facts.arrears_date, shared.current_date)}, the arrears outstanding are ${arrearsAmount || 'the stated sum'}.`,
        'Please treat this letter as a formal demand for payment and contact the Landlord promptly if you dispute the amount or need to discuss repayment proposals.',
      ];

  const paymentRequestParagraphs = [
    `Please pay the outstanding arrears in cleared funds by ${paymentDeadline || 'the stated deadline'}.`,
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
      { label: 'Arrears calculated as at', value: facts.arrears_date },
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
    payment_deadline: paymentDeadline,
    response_deadline: responseDeadline,
    payment_request_paragraphs: paymentRequestParagraphs,
    next_steps: nextSteps,
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

async function generateTemplatedResidentialDocument(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData,
  config: TemplateConfig,
  outputFormat: ResidentialDocumentOutputFormat
): Promise<ResidentialGeneratedDocument> {
  const data = buildTemplateData(product, shared, config);
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

  let document: ResidentialGeneratedDocument;

  if (product === 'inventory_schedule_condition') {
    const inventoryData = {
      current_date: shared.current_date,
      property_address: shared.property_address,
      landlord_name: shared.landlord_name,
      tenant_names: shared.tenant_names,
      tenancy_start_date: firstNonEmpty(shared.tenancy_start_date, shared.facts.inspection_date),
      inspection_date: shared.facts.inspection_date,
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
      inventory: shared.facts.inventory,
      inventory_schedule_notes: [
        buildLabeledObservation('Property layout', shared.facts.property_layout_notes),
        buildLabeledObservation('General condition', shared.facts.room_condition_summary),
        buildLabeledObservation('Cleanliness', shared.facts.cleanliness_overview),
        buildLabeledObservation('Defects / action points', shared.facts.defects_action_items),
        buildLabeledObservation('Keys summary', shared.facts.keys_provided_summary),
        buildLabeledObservation('Combined utility readings', shared.facts.utility_meter_readings),
        buildLabeledObservation('Safety observations', shared.facts.safety_checks_summary),
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
