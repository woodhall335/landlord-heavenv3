import { generateDocument } from '@/lib/documents/generator';
import { generateLetterBeforeAction } from '@/lib/documents/letter-generator';
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
}

interface SignatureParty {
  label: string;
  name: string;
}

function joinAddress(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(', ');
}

function getTenantNames(facts: Record<string, any>): string {
  if (Array.isArray(facts.tenants) && facts.tenants.length > 0) {
    return facts.tenants.map((tenant: any) => tenant.full_name).filter(Boolean).join(', ');
  }
  return facts.tenant_names || facts.tenant_1_name || '';
}

function formatMoney(value: unknown): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  return `\u00A3${numeric.toFixed(2)}`;
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function buildLabeledObservation(label: string, value: unknown): string | undefined {
  const text = toText(value);
  return text ? `${label}: ${text}` : undefined;
}

function cleanRows(rows: Array<{ label: string; value: unknown }>): TemplateRow[] | undefined {
  const cleaned = rows
    .map((row) => ({ label: row.label, value: toText(row.value) }))
    .filter((row) => row.value.length > 0);
  return cleaned.length > 0 ? cleaned : undefined;
}

function cleanList(items: Array<unknown>): string[] | undefined {
  const cleaned = items.map(toText).filter(Boolean);
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

function buildSharedData(facts: Record<string, any>): SharedResidentialData {
  const propertyAddress =
    facts.property_address ||
    joinAddress(facts.property_address_line1, facts.property_address_town, facts.property_address_postcode);

  return {
    current_date: new Date().toISOString().slice(0, 10),
    property_address: propertyAddress,
    landlord_name: facts.landlord_full_name || '',
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
    tenant_primary_name:
      (Array.isArray(facts.tenants) && facts.tenants[0]?.full_name) ||
      facts.tenant_1_name ||
      '',
    rent_amount: facts.rent_amount || facts.monthly_rent || '',
    deposit_amount: facts.deposit_amount || '',
    tenancy_start_date: facts.tenancy_start_date || '',
    tenancy_end_date: facts.tenancy_end_date || '',
    document_notes: facts.document_notes || '',
    facts,
  };
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
      return toText(facts.applicant_email || facts.tenant_email);
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
      return toText(facts.applicant_phone || facts.tenant_phone);
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
  const parties: SignatureParty[] = [];

  if (shared.landlord_name) {
    parties.push({ label: 'Landlord', name: shared.landlord_name });
  }

  switch (product) {
    case 'lease_assignment_agreement':
      if (facts.outgoing_tenant_name || shared.tenant_primary_name) {
        parties.push({
          label: 'Outgoing tenant',
          name: toText(facts.outgoing_tenant_name || shared.tenant_primary_name),
        });
      }
      if (facts.incoming_tenant_name) {
        parties.push({ label: 'Incoming tenant', name: toText(facts.incoming_tenant_name) });
      }
      return parties;
    case 'residential_sublet_agreement':
      if (facts.head_tenant_name || shared.tenant_primary_name) {
        parties.push({
          label: 'Head tenant',
          name: toText(facts.head_tenant_name || shared.tenant_primary_name),
        });
      }
      if (facts.subtenant_name) {
        parties.push({ label: 'Subtenant', name: toText(facts.subtenant_name) });
      }
      return parties;
    case 'flatmate_agreement': {
      const occupiers = toText(facts.flatmate_names || shared.tenant_names)
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);

      if (occupiers.length > 0) {
        return occupiers.map((name, index) => ({
          label: `Occupier ${index + 1}`,
          name,
        }));
      }

      return parties;
    }
    default: {
      const counterpartyName = getCounterpartyName(product, shared);
      if (counterpartyName) {
        parties.push({ label: config.counterpartyLabel, name: counterpartyName });
      }
      return parties;
    }
  }
}

function getTemplateSections(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData
): TemplateSection[] {
  const facts = shared.facts;

  switch (product) {
    case 'guarantor_agreement':
      return [
        createSection({
          heading: 'Guarantor Details',
          intro:
            'This guarantee is intended to support the landlord in relation to the tenant obligations arising under the tenancy of the property in England.',
          rows: [
            { label: 'Guarantor name', value: facts.guarantor_name },
            { label: 'Guarantor address', value: facts.guarantor_address },
            { label: 'Guarantor email', value: facts.guarantor_email },
            { label: 'Guarantor phone', value: facts.guarantor_phone },
            { label: 'Relationship to tenant', value: facts.guarantor_relationship },
          ],
        }),
        createSection({
          heading: 'Guaranteed Obligations',
          intro:
            'The guarantor agrees to answer for the tenant liabilities connected with the tenancy so far as set out in this document and the tenancy arrangements to which it relates.',
          bullets: [
            'Payment of rent and other sums due under the tenancy.',
            'Compliance with the tenant obligations contained in the tenancy agreement.',
            'Reimbursement of reasonable losses arising from breach, damage, or default.',
            facts.guarantee_scope,
          ],
        }),
        createSection({
          heading: 'Continuing Liability and English Law',
          paragraphs: [
            'This guarantee is intended to operate as a continuing security for the obligations identified above unless released in writing by the landlord.',
            'Any forbearance, delay, waiver, indulgence, or temporary arrangement with the tenant does not by itself release the guarantor from liability.',
            'This document is to be interpreted in accordance with the law of England and Wales and retained with the tenancy records as evidence of the guarantee arrangements.',
          ],
        }),
      ];
    case 'residential_sublet_agreement':
      return [
        createSection({
          heading: 'Subletting Arrangement',
          intro:
            'This section records the principal commercial details of the proposed or agreed subletting arrangement.',
          rows: [
            { label: 'Head tenant', value: facts.head_tenant_name || shared.tenant_primary_name },
            { label: 'Subtenant', value: facts.subtenant_name },
            { label: 'Landlord consent', value: facts.landlord_consent_status || facts.landlord_consent },
            { label: 'Sublet start date', value: facts.sublet_start_date },
            { label: 'Sublet end date', value: facts.sublet_end_date },
            { label: 'Sublet rent', value: formatMoney(facts.sublet_rent) || facts.sublet_rent },
          ],
        }),
        createSection({
          heading: 'Occupation Terms',
          bullets: [
            facts.sublet_scope || 'The subtenant occupies the agreed property area for the stated subletting period.',
            facts.sublet_conditions,
            facts.sublet_obligations,
          ],
        }),
        createSection({
          heading: 'Head Tenancy and Compliance Position',
          paragraphs: [
            'Any subletting remains subject to the terms of the head tenancy and the subtenant acquires no greater rights than the head tenant can lawfully grant.',
            'Unless expressly agreed otherwise in writing, the head tenant remains responsible to the landlord for compliance with the principal tenancy obligations during the subletting period.',
            'This document is intended for use in connection with an England residential letting and should be read with the underlying tenancy arrangements and any written consent.',
          ],
        }),
      ];
    case 'lease_amendment':
      return [
        createSection({
          heading: 'Original Agreement',
          intro:
            'This amendment should be retained with the original tenancy agreement and read together with it.',
          rows: [
            { label: 'Original agreement date', value: facts.original_agreement_date },
            { label: 'Amendment effective date', value: facts.amendment_effective_date },
            { label: 'Amendment scope', value: facts.amendment_scope || facts.amendment_title },
          ],
        }),
        createSection({
          heading: 'Agreed Changes',
          bullets: [
            facts.amendment_summary,
            facts.changed_terms_summary,
            facts.additional_terms,
          ],
        }),
        createSection({
          heading: 'Continuing Effect and Governing Law',
          paragraphs: [
            'Except to the extent expressly varied by this amendment, the original tenancy agreement remains in full force and effect.',
            'This amendment does not amount to a waiver of any prior breach unless that waiver is expressly stated in writing.',
            'This amendment is intended for an England residential letting and is to be interpreted in accordance with the law of England and Wales.',
          ],
        }),
      ];
    case 'lease_assignment_agreement':
      return [
        createSection({
          heading: 'Assignment Parties',
          intro:
            'This section records the parties involved in the proposed or agreed transfer of the tenancy interest.',
          rows: [
            { label: 'Outgoing tenant', value: facts.outgoing_tenant_name || shared.tenant_primary_name },
            { label: 'Incoming tenant', value: facts.incoming_tenant_name },
            { label: 'Landlord consent', value: facts.landlord_consent_status || facts.landlord_consent },
            { label: 'Assignment date', value: facts.assignment_date },
          ],
        }),
        createSection({
          heading: 'Transfer of Rights and Duties',
          bullets: [
            'The incoming tenant assumes the tenancy obligations from the assignment date.',
            facts.assignment_scope,
            facts.assignment_notes,
          ],
        }),
        createSection({
          heading: 'Records, Consent, and English Law',
          paragraphs: [
            'This document should be retained with the tenancy file as the written record of the assignment and the relevant date from which liability is intended to transfer.',
            'Any assignment remains subject to the landlord consent position and any requirements contained in the original tenancy arrangements.',
            'This assignment agreement is intended for use in relation to an England residential tenancy and is governed by the law of England and Wales.',
          ],
        }),
      ];
    case 'residential_tenancy_application':
      return [
        createSection({
          heading: 'Applicant Profile',
          rows: [
            { label: 'Applicant name', value: facts.applicant_name || shared.tenant_primary_name },
            { label: 'Applicant email', value: facts.applicant_email || facts.tenant_email },
            { label: 'Applicant phone', value: facts.applicant_phone || facts.tenant_phone },
            { label: 'Current address', value: facts.current_address },
            { label: 'Employment status', value: facts.employment_status },
            { label: 'Employer', value: facts.employer_name },
            { label: 'Annual income', value: formatMoney(facts.annual_income) || facts.annual_income },
          ],
        }),
        createSection({
          heading: 'References and Occupiers',
          bullets: [
            facts.reference_contact_name && `Reference contact: ${facts.reference_contact_name}`,
            facts.reference_contact_details,
            facts.additional_occupiers && `Additional occupiers: ${facts.additional_occupiers}`,
            facts.reference_notes,
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
            { label: 'Inspector', value: facts.inspector_name || facts.agent_name || shared.landlord_name },
            { label: 'Occupier or representative present', value: facts.inspection_attended_by },
            { label: 'Furnished status', value: facts.furnished_status },
            { label: 'Property layout / areas inspected', value: facts.property_layout_notes },
            { label: 'Photo schedule reference', value: facts.photo_schedule_reference },
          ],
        }),
        createSection({
          heading: 'Keys, Utilities, and Safety',
          rows: [
            { label: 'Keys provided', value: facts.keys_provided_count },
            { label: 'Keys / access devices', value: facts.keys_provided_summary || facts.keys_handover_notes || facts.keys_issued },
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
            buildLabeledObservation('General summary', facts.room_condition_summary || facts.condition_summary || facts.room_condition_notes),
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
            toText(facts.cleanliness_overview || facts.cleanliness_notes),
            toText(facts.defects_action_items || facts.damage_notes),
            toText(facts.tenant_comments),
            'Any photographs, videos, signed check-in sheets, inventories, certificates, and follow-up correspondence should be retained with this report as part of the landlord evidence record.',
          ],
        }),
      ];
    case 'flatmate_agreement':
      return [
        createSection({
          heading: 'Occupiers and Contributions',
          intro:
            'This section records the practical arrangements between occupiers sharing the property.',
          rows: [
            { label: 'Named occupiers', value: facts.flatmate_names || shared.tenant_names },
            { label: 'Room allocation', value: facts.room_allocation },
            { label: 'Bills split', value: facts.bills_split },
            { label: 'Shared purchases', value: facts.shared_purchases },
          ],
        }),
        createSection({
          heading: 'House Rules',
          bullets: [
            facts.house_rules,
            facts.cleaning_schedule,
            facts.guest_rules,
            facts.notice_period_between_flatmates,
          ],
        }),
        createSection({
          heading: 'Status of Arrangement',
          paragraphs: [
            'This document is intended to record practical arrangements between occupiers and does not by itself vary the landlord tenancy unless a separate landlord-facing document does so.',
            'Each occupier should ensure that the shared arrangements remain consistent with the obligations contained in the principal tenancy or licence arrangement.',
            'This agreement is intended for residential occupation in England and should be kept with the wider letting records where relevant.',
          ],
        }),
      ];
    case 'renewal_tenancy_agreement':
      return [
        createSection({
          heading: 'Renewal Details',
          intro:
            'This section records the renewed term and the principal commercial terms intended to apply to the continuing letting.',
          rows: [
            { label: 'Current tenancy end date', value: facts.current_tenancy_end_date || shared.tenancy_end_date },
            { label: 'Renewal start date', value: facts.renewal_start_date },
            { label: 'Renewal end date', value: facts.renewal_end_date },
            {
              label: 'Renewed rent',
              value:
                formatMoney(facts.renewal_rent_amount) ||
                facts.renewal_rent_amount ||
                formatMoney(shared.rent_amount) ||
                shared.rent_amount,
            },
          ],
        }),
        createSection({
          heading: 'Renewal Notes',
          bullets: [
            facts.renewal_terms_summary,
            facts.renewal_reason,
            'All unchanged terms of the existing tenancy continue in force unless expressly varied in the renewal.',
          ],
        }),
        createSection({
          heading: 'Continuity, Compliance, and English Law',
          paragraphs: [
            'The parties should retain this renewal with the earlier tenancy documents so there is a clear chain of written records for the property.',
            'Where the deposit, prescribed information, or other compliance steps require review because of the renewal, those matters should be addressed alongside this document.',
            'This renewal is intended for an England residential letting and is governed by the law of England and Wales.',
          ],
        }),
      ];
    case 'repayment_plan_agreement':
      return [
        createSection({
          heading: 'Arrears and Instalments',
          intro:
            'This section records the principal payment terms intended to reduce and clear the arrears balance.',
          rows: [
            { label: 'Arrears amount', value: formatMoney(facts.arrears_amount) || facts.arrears_amount },
            { label: 'Initial payment date', value: facts.initial_payment_date },
            { label: 'Instalment amount', value: formatMoney(facts.instalment_amount) || facts.instalment_amount },
            { label: 'Instalment frequency', value: facts.repayment_frequency },
            { label: 'Final settlement date', value: facts.final_deadline || facts.repayment_end_date },
          ],
        }),
        createSection({
          heading: 'Repayment Conditions',
          bullets: [
            facts.repayment_terms,
            facts.default_consequences ||
              'If the plan is missed or broken, the landlord may continue recovery action for the outstanding balance.',
            facts.additional_terms,
          ],
        }),
        createSection({
          heading: 'Reservation of Rights and Record Keeping',
          paragraphs: [
            'Unless expressly stated otherwise in writing, entry into this repayment plan does not amount to a waiver of the landlord rights in respect of the full arrears balance or any continuing tenancy breach.',
            'Payments received under this plan should be recorded carefully against the arrears account so that the outstanding balance can be evidenced if enforcement later becomes necessary.',
            'This document is intended for an England residential landlord and tenant arrangement and is to be interpreted in accordance with the law of England and Wales.',
          ],
        }),
      ];
    default:
      return [
        createSection({
          heading: 'Document Summary',
          paragraphs: [shared.document_notes || 'Document generated from the guided wizard answers provided.'],
        }),
      ];
  }
}

function buildTemplateData(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData,
  config: TemplateConfig
) {
  return {
    title: config.title,
    subtitle: config.subtitle,
    intro: config.intro,
    generated_on: shared.current_date,
    property_address: shared.property_address,
    landlord_name: shared.landlord_name,
    landlord_address: shared.landlord_address,
    landlord_email: shared.landlord_email,
    landlord_phone: shared.landlord_phone,
    tenant_names: shared.tenant_names,
    tenant_primary_name: shared.tenant_primary_name,
    tenancy_start_date: shared.tenancy_start_date,
    tenancy_end_date: shared.tenancy_end_date,
    inspection_date: toText(shared.facts.inspection_date) || shared.current_date,
    rent_amount_display: formatMoney(shared.rent_amount) || toText(shared.rent_amount),
    deposit_amount_display: formatMoney(shared.deposit_amount) || toText(shared.deposit_amount),
    sections: getTemplateSections(product, shared),
    notes: toText(shared.document_notes),
    counterparty_label: config.counterpartyLabel,
    counterparty_name: getCounterpartyName(product, shared),
    counterparty_address: getCounterpartyAddress(product, shared),
    counterparty_email: getCounterpartyEmail(product, shared),
    counterparty_phone: getCounterpartyPhone(product, shared),
    signature_parties: getSignatureParties(product, shared, config),
    document_reference:
      toText(shared.facts.case_id || shared.facts.id) || `RL-${shared.current_date.replace(/-/g, '')}`,
    recitals: config.recitals || [],
    execution_statement:
      config.executionStatement ||
      'The parties confirm that they have read this document and agree to be bound by its terms.',
  };
}

async function generateTemplatedResidentialDocument(
  product: ResidentialLettingProductSku,
  shared: SharedResidentialData,
  config: TemplateConfig
): Promise<ResidentialGeneratedDocument> {
  const doc = await generateDocument({
    templatePath: config.templatePath,
    data: buildTemplateData(product, shared, config),
    isPreview: false,
    outputFormat: 'both',
  });

  return {
    title: config.title,
    description: config.description,
    category: config.category,
    document_type: config.documentType,
    html: doc.html,
    pdf: doc.pdf,
    file_name: config.fileName,
  };
}

export async function generateResidentialLettingDocuments(
  product: ResidentialLettingProductSku,
  facts: Record<string, any>
): Promise<ResidentialGeneratedPack> {
  const shared = buildSharedData(facts);

  switch (product) {
    case 'guarantor_agreement':
      return {
        documents: [
          await generateTemplatedResidentialDocument(product, shared, {
            title: 'Guarantor Agreement',
            subtitle: 'England residential tenancy guarantee',
            intro:
              'This document records the guarantor obligation supporting the tenant obligations under the residential tenancy.',
            description: 'England residential guarantor agreement',
            category: 'agreement',
            documentType: 'guarantor_agreement',
            fileName: 'guarantor_agreement.pdf',
            templatePath: 'uk/england/templates/residential/agreement_document.hbs',
            counterpartyLabel: 'Guarantor',
            recitals: [
              'The Landlord is granting or continuing a residential tenancy of the Property in England.',
              'The Guarantor has agreed to guarantee the Tenant obligations recorded in the tenancy arrangements.',
              'The parties wish to record the guarantee in a single signed document.',
            ],
            executionStatement:
              'The Guarantor signs this agreement to confirm the guarantee obligations described in this document.',
          }),
        ],
      };
    case 'residential_sublet_agreement':
      return {
        documents: [
          await generateTemplatedResidentialDocument(product, shared, {
            title: 'Residential Sublet Agreement',
            subtitle: 'England residential subletting arrangement',
            intro:
              'This document records the terms on which the tenant sublets all or part of the property to a subtenant.',
            description: 'England residential sublet agreement',
            category: 'agreement',
            documentType: 'residential_sublet_agreement',
            fileName: 'residential_sublet_agreement.pdf',
            templatePath: 'uk/england/templates/residential/agreement_document.hbs',
            counterpartyLabel: 'Subtenant',
            recitals: [
              'A residential tenancy of the Property is already in place.',
              'The head tenant wishes to grant a subtenancy for the agreed period and on the agreed terms.',
              'The parties intend this document to record the subletting arrangements clearly and in writing.',
            ],
          }),
        ],
      };
    case 'lease_amendment':
      return {
        documents: [
          await generateTemplatedResidentialDocument(product, shared, {
            title: 'Lease Amendment',
            subtitle: 'Variation to an existing tenancy agreement',
            intro:
              'This amendment should be read with the existing tenancy agreement and records the agreed changes only.',
            description: 'England lease amendment agreement',
            category: 'agreement',
            documentType: 'lease_amendment',
            fileName: 'lease_amendment.pdf',
            templatePath: 'uk/england/templates/residential/agreement_document.hbs',
            counterpartyLabel: 'Tenant',
            recitals: [
              'The parties are already bound by an existing tenancy agreement.',
              'The parties wish the original agreement to remain in force except to the extent varied by this document.',
              'This document records the agreed amendments and their effective date.',
            ],
          }),
        ],
      };
    case 'lease_assignment_agreement':
      return {
        documents: [
          await generateTemplatedResidentialDocument(product, shared, {
            title: 'Lease Assignment Agreement',
            subtitle: 'Transfer of tenancy from outgoing to incoming tenant',
            intro:
              'This document records the assignment of the tenancy and the effective transfer date for the incoming tenant.',
            description: 'England lease assignment agreement',
            category: 'agreement',
            documentType: 'lease_assignment_agreement',
            fileName: 'lease_assignment_agreement.pdf',
            templatePath: 'uk/england/templates/residential/agreement_document.hbs',
            counterpartyLabel: 'Incoming tenant',
            recitals: [
              'A tenancy of the Property is currently held by the outgoing tenant.',
              'The Landlord has agreed in principle to the transfer of the tenancy to the incoming tenant on the terms recorded here.',
              'The parties wish to document the transfer date and the assumption of tenancy obligations.',
            ],
            executionStatement:
              'By signing below, the outgoing tenant, incoming tenant, and Landlord confirm the assignment arrangements set out in this agreement.',
          }),
        ],
      };
    case 'residential_tenancy_application':
      return {
        documents: [
          await generateTemplatedResidentialDocument(product, shared, {
            title: 'Residential Tenancy Application',
            subtitle: 'Applicant information and reference form',
            intro:
              'This application captures the applicant details commonly required before a landlord offers an England residential tenancy.',
            description: 'England tenancy application form',
            category: 'form',
            documentType: 'residential_tenancy_application',
            fileName: 'residential_tenancy_application.pdf',
            templatePath: 'uk/england/templates/residential/application_document.hbs',
            counterpartyLabel: 'Applicant',
          }),
        ],
      };
    case 'rental_inspection_report':
      return {
        documents: [
          await generateTemplatedResidentialDocument(product, shared, {
            title: 'Rental Inspection Report',
            subtitle: 'Move-in / move-out property condition record',
            intro:
              'This report records the observed condition of the property, meter readings, keys, and general inspection notes.',
            description: 'England move-in or move-out inspection report',
            category: 'report',
            documentType: 'rental_inspection_report',
            fileName: 'rental_inspection_report.pdf',
            templatePath: 'uk/england/templates/residential/inspection_report.hbs',
            counterpartyLabel: 'Occupier',
          }),
        ],
      };
    case 'inventory_schedule_condition': {
      const doc = await generateDocument({
        templatePath: '_shared/standalone/inventory_standalone.hbs',
        data: {
          ...shared,
          inventory: shared.facts.inventory || null,
          case_id: shared.facts.case_id || shared.facts.id || shared.current_date.replace(/-/g, ''),
          timestamp: Date.now(),
          inspection_date: shared.facts.inspection_date || shared.tenancy_start_date || shared.current_date,
        },
        isPreview: false,
        outputFormat: 'both',
      });

      return {
        documents: [
          {
            title: 'Inventory & Schedule of Condition',
            description: 'England inventory and schedule of condition',
            category: 'schedule',
            document_type: 'inventory_schedule_condition',
            html: doc.html,
            pdf: doc.pdf,
            file_name: 'inventory_schedule_condition.pdf',
          },
        ],
      };
    }
    case 'flatmate_agreement':
      return {
        documents: [
          await generateTemplatedResidentialDocument(product, shared, {
            title: 'Flatmate Agreement',
            subtitle: 'Shared living arrangement for occupiers',
            intro:
              'This agreement records the practical arrangements between flatmates sharing an England residential property.',
            description: 'England flatmate agreement',
            category: 'agreement',
            documentType: 'flatmate_agreement',
            fileName: 'flatmate_agreement.pdf',
            templatePath: 'uk/england/templates/residential/agreement_document.hbs',
            counterpartyLabel: 'Occupier',
            recitals: [
              'The occupiers are sharing residential accommodation in England.',
              'The occupiers want a written record of household contributions, room use, and practical rules.',
              'This agreement is intended to reduce disputes by clearly documenting those arrangements.',
            ],
            executionStatement:
              'Each occupier signs this agreement to confirm the shared living arrangements and household commitments recorded here.',
          }),
        ],
      };
    case 'renewal_tenancy_agreement':
      return {
        documents: [
          await generateTemplatedResidentialDocument(product, shared, {
            title: 'Renewal Tenancy Agreement',
            subtitle: 'Fixed-term renewal for an existing residential tenancy',
            intro:
              'This document records the renewed tenancy term and any updated commercial terms agreed by the parties.',
            description: 'England renewal tenancy agreement',
            category: 'agreement',
            documentType: 'renewal_tenancy_agreement',
            fileName: 'renewal_tenancy_agreement.pdf',
            templatePath: 'uk/england/templates/residential/agreement_document.hbs',
            counterpartyLabel: 'Tenant',
            recitals: [
              'The parties are continuing a residential letting of the Property in England.',
              'The parties wish to grant a renewed tenancy term on the updated commercial terms recorded here.',
              'This agreement supersedes the prior term arrangements only to the extent stated in this document.',
            ],
          }),
        ],
      };
    case 'rent_arrears_letter': {
      const doc = await generateLetterBeforeAction(
        {
          landlord_name: shared.landlord_name,
          landlord_address: shared.landlord_address,
          landlord_email: shared.landlord_email,
          landlord_phone: shared.landlord_phone,
          tenant_name: shared.tenant_primary_name,
          property_address: shared.property_address,
          letter_date: shared.current_date,
          rent_arrears: true,
          arrears_amount: Number(facts.arrears_amount || 0),
          arrears_date: facts.arrears_date || shared.current_date,
          total_owed: Number(facts.arrears_amount || 0),
          final_deadline: facts.final_deadline || shared.current_date,
          response_deadline: facts.response_deadline || facts.final_deadline || shared.current_date,
          payment_deadline: facts.final_deadline || shared.current_date,
          willing_to_negotiate: true,
        },
        false
      );

      return {
        documents: [
          {
            title: 'Rent Arrears Letter',
            description: 'Formal rent arrears letter / letter before action',
            category: 'letter',
            document_type: 'rent_arrears_letter',
            html: doc.html,
            pdf: doc.pdf,
            file_name: 'rent_arrears_letter.pdf',
          },
        ],
      };
    }
    case 'repayment_plan_agreement':
      return {
        documents: [
          await generateTemplatedResidentialDocument(product, shared, {
            title: 'Repayment Plan Agreement',
            subtitle: 'Rent arrears repayment arrangement',
            intro:
              'This document records the agreed instalment plan for clearing rent arrears owed under the tenancy.',
            description: 'England repayment plan agreement',
            category: 'agreement',
            documentType: 'repayment_plan_agreement',
            fileName: 'repayment_plan_agreement.pdf',
            templatePath: 'uk/england/templates/residential/agreement_document.hbs',
            counterpartyLabel: 'Tenant',
            recitals: [
              'Rent arrears have accrued under the tenancy of the Property.',
              'The Landlord and Tenant wish to record an agreed instalment arrangement for repayment of those arrears.',
              'The parties intend this agreement to evidence the repayment timetable and the consequences of default.',
            ],
          }),
        ],
      };
    default:
      throw new Error(`Unsupported residential letting product: ${product}`);
  }
}
