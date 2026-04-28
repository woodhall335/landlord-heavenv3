import { getGround8Threshold } from '@/lib/grounds/ground8-threshold';
import {
  getEnglandGroundDefinition,
  listEnglandGroundDefinitions,
  normalizeEnglandGroundCode,
  type EnglandCommonReasonKey,
  type EnglandGroundCode,
  type EnglandGroundDefinition,
} from '@/lib/england-possession/ground-catalog';
import { buildEnglandEvictionChronology } from '@/lib/england-possession/chronology';
import { ENGLAND_SECTION8_NOTICE_NAME } from '@/lib/england-possession/section8-terminology';

type DraftingInput = Record<string, any>;

interface BundleIndexRow {
  title: string;
  description: string;
  exhibitKey?: string;
}

interface DraftingChecklistSection {
  title: string;
  items: string[];
  note?: string;
}

export interface EnglandGroundDraft {
  code: EnglandGroundCode;
  label: string;
  title: string;
  mandatory: boolean;
  commonReason: EnglandCommonReasonKey;
  noticeParagraphs: string[];
  witnessParagraphs: string[];
  conductParagraphs: string[];
  evidenceItems: string[];
  bundleRows: BundleIndexRow[];
  hearingWarnings: string[];
  timelineItems: string[];
  riskParagraphs: string[];
}

export interface EnglandPossessionDraftingModel {
  groundCodes: EnglandGroundCode[];
  groundLabels: string[];
  groundsLeadParagraph: string;
  groundsBridgeParagraphs: string[];
  noticeExplanationParagraphs: string[];
  n119ReasonParagraphs: string[];
  n119OtherBreachParagraphs: string[];
  n119StepsParagraphs: string[];
  n119DefendantCircumstancesParagraphs: string[];
  n119FinancialParagraphs: string[];
  caseSummary: {
    narrativeParagraphs: string[];
    stepsParagraphs: string[];
    defendantCircumstancesParagraphs: string[];
    financialParagraphs: string[];
  };
  coverLetter: {
    introParagraphs: string[];
    actionItems: string[];
    closingParagraphs: string[];
  };
  evidenceChecklist: {
    overviewParagraphs: string[];
    collectionItems: string[];
    groundSections: DraftingChecklistSection[];
    finalChecks: string[];
  };
  courtFilingGuide: {
    overviewParagraphs: string[];
    preparationItems: string[];
    filingItems: string[];
    afterIssueItems: string[];
    warningParagraphs: string[];
  };
  roadmap: {
    overviewParagraphs: string[];
    noticeStageItems: string[];
    issueStageItems: string[];
    hearingStageItems: string[];
    enforcementStageItems: string[];
    warningParagraphs: string[];
  };
  previewSummary: {
    shortTitle: string;
    narrativeParagraphs: string[];
    readinessItems: string[];
  };
  proofOfService: {
    recordParagraphs: string[];
  };
  serviceInstructions: {
    overviewParagraphs: string[];
    methodNotes: string[];
    evidenceItems: string[];
    afterServiceItems: string[];
    commonMistakes: string[];
  };
  validityChecklist: {
    overviewParagraphs: string[];
    serviceEvidenceItems: string[];
    validityItems: string[];
    afterServiceItems: string[];
    riskParagraphs: string[];
  };
  hearingChecklist: {
    overviewParagraphs: string[];
    beforeItems: string[];
    documentItems: string[];
    atHearingItems: string[];
    contingencyItems: string[];
    warningParagraphs: string[];
  };
  bundleIndex: {
    overviewParagraphs: string[];
    sectionTitle: string;
    groundRows: BundleIndexRow[];
    preparationItems: string[];
  };
      witness: {
    groundsParagraphs: string[];
    rentArrearsParagraphs: string[];
    conductParagraphs: string[];
    evidenceParagraphs: string[];
    evidenceItems: string[];
    timelineItems: string[];
    conclusionParagraphs: string[];
  };
  groundDrafts: EnglandGroundDraft[];
}

type GroundDraftBuilder = (data: DraftingInput, definition: EnglandGroundDefinition) => EnglandGroundDraft;

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrencyText(value: unknown): string {
  return `£${toNumber(value).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function capitalizePhrase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function formatLongDate(value: unknown): string {
  if (!value) return '';

  try {
    const date = new Date(String(value).includes('T') ? String(value) : `${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return '';
  }
}

function getOrdinalSuffix(value: number): string {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) {
    return 'th';
  }

  switch (value % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function describeRentFrequency(value: unknown): string {
  switch (String(value || '').toLowerCase()) {
    case 'weekly':
      return 'weekly';
    case 'fortnightly':
      return 'fortnightly';
    case 'monthly':
      return 'monthly';
    case 'quarterly':
      return 'quarterly';
    case 'yearly':
      return 'yearly';
    default:
      return String(value || 'monthly');
  }
}

function getByPath(source: DraftingInput | null | undefined, path: string): unknown {
  if (!source) return undefined;
  if (path in source) return source[path];

  return path.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in (value as DraftingInput)) {
      return (value as DraftingInput)[segment];
    }
    return undefined;
  }, source);
}

function getFirstValue(source: DraftingInput, ...paths: string[]): unknown {
  for (const path of paths) {
    const value = getByPath(source, path);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
}

function getFirstString(source: DraftingInput, ...paths: string[]): string {
  const value = getFirstValue(source, ...paths);
  return typeof value === 'string' ? value.trim() : '';
}

function extractNarrativeCandidates(data: DraftingInput): string[] {
  return [
    data.form3a_explanation,
    data.ground_particulars,
    data.section_8_particulars,
    data.section8_details,
    data.particulars_of_claim,
    data.case_summary,
  ]
    .map((value) => String(value || '').trim())
    .filter((value) => !isGeneratedArrearsSummary(value))
    .filter(Boolean);
}

function isGeneratedArrearsSummary(text: string): boolean {
  if (!text) return false;

  const normalized = text
    .replace(/\s+/g, ' ')
    .replace(/Ã‚Â£|Â£/g, '£')
    .trim()
    .toLowerCase();

  return (
    /^total arrears[:\s]+£?\d[\d,.]*(?:\.\d{2})?$/.test(normalized) ||
    /^total arrears[:\s]+gbp\s*\d[\d,.]*(?:\.\d{2})?$/.test(normalized)
  );
}

export function isThinEnglandNarrative(text: string): boolean {
  if (!text) return true;
  const sentences = text.split(/[.!?]\s+/).filter(Boolean);
  return text.length < 180 || sentences.length < 2;
}

function dedupeParagraphs(paragraphs: string[]): string[] {
  const seen = new Set<string>();
  return paragraphs.filter((paragraph) => {
    const normalized = paragraph.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function dedupeList(items: string[]): string[] {
  return dedupeParagraphs(items);
}

function dedupeRows(rows: BundleIndexRow[]): BundleIndexRow[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.title}|${row.description}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractGroundCodes(data: DraftingInput): EnglandGroundCode[] {
  const rawValues: string[] = [];
  const collect = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => collect(entry));
      return;
    }
    rawValues.push(String(value));
  };

  collect(data.ground_codes);
  collect(data.selected_grounds);
  collect(
    getFirstValue(
      data,
      'section8.grounds',
      'section8_grounds.selected_grounds',
      'issues.section8_grounds.selected_grounds',
    ),
  );

  if (data.ground_numbers) {
    String(data.ground_numbers)
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

function getGroundFacts(data: DraftingInput, code: EnglandGroundCode): DraftingInput {
  const normalized = code.toLowerCase();
  const direct =
    getFirstValue(data, `ground_${normalized}`, `ground${normalized}`, `grounds.ground_${normalized}`) || {};
  if (typeof direct === 'object' && direct !== null) {
    return direct as DraftingInput;
  }

  const prefix = `ground_${normalized}.`;
  const flatFacts = Object.entries(data).reduce<DraftingInput>((acc, [key, value]) => {
    if (key.startsWith(prefix) && value !== null && value !== undefined && value !== '') {
      acc[key.slice(prefix.length)] = value;
    }
    return acc;
  }, {});

  return flatFacts;
}

function describeArrearsPeriods(data: DraftingInput): string {
  const items = Array.isArray(data.arrears_items) ? data.arrears_items : [];
  if (items.length === 0) return '';

  const firstStart = items[0]?.period_start ? formatLongDate(items[0].period_start) : '';
  const lastEnd = items[items.length - 1]?.period_end
    ? formatLongDate(items[items.length - 1].period_end)
    : '';
  const missedPayments = items.filter((item) => toNumber(item?.rent_paid) <= 0 && toNumber(item?.amount_owed) > 0).length;
  const partPayments = items.filter((item) => toNumber(item?.rent_paid) > 0 && toNumber(item?.amount_owed) > 0).length;

  return [
    firstStart && lastEnd ? `between ${firstStart} and ${lastEnd}` : '',
    missedPayments > 0 ? `${missedPayments} missed payment${missedPayments === 1 ? '' : 's'}` : '',
    partPayments > 0 ? `${partPayments} short or part payment${partPayments === 1 ? '' : 's'}` : '',
  ]
    .filter(Boolean)
    .join(', ');
}

function buildTenancyOverview(data: DraftingInput): string {
  const tenancyStart = formatLongDate(getFirstValue(data, 'tenancy_start_date', 'tenancy.start_date'));
  const rentAmount = toNumber(getFirstValue(data, 'rent_amount', 'tenancy.rent_amount'));
  const frequency = describeRentFrequency(getFirstValue(data, 'rent_frequency', 'tenancy.rent_frequency'));
  const paymentDay = Number.parseInt(
    String(getFirstValue(data, 'payment_day', 'rent_due_day', 'tenancy.rent_due_day') || ''),
    10,
  );

  return [
    tenancyStart ? `The tenancy began on ${tenancyStart}.` : '',
    rentAmount > 0
      ? `The contractual rent is ${formatCurrencyText(rentAmount)} payable ${frequency}${Number.isFinite(paymentDay) ? ` on the ${paymentDay}${getOrdinalSuffix(paymentDay)} day of each rental period` : ''}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildNoticeTimelineSentence(data: DraftingInput): string {
  const serviceDate = formatLongDate(
    getFirstValue(
      data,
      'notice_service_date',
      'notice_served_date',
      'section_8_notice_date',
      'notice.service_date',
      'notice.served_date',
    ),
  );
  const expiryDate = formatLongDate(
    getFirstValue(data, 'notice_expiry_date', 'earliest_possession_date', 'notice.expiry_date'),
  );
  const proceedingsDate = formatLongDate(getFirstValue(data, 'earliest_proceedings_date'));

  const parts = [
    serviceDate ? `${ENGLAND_SECTION8_NOTICE_NAME} served on ${serviceDate}` : '',
    expiryDate ? `expiring on ${expiryDate}` : '',
    proceedingsDate ? `with proceedings not intended before ${proceedingsDate}` : '',
  ].filter(Boolean);

  return parts.length > 0 ? `${parts.join(', ')}.` : '';
}

function buildGroundLeadParagraph(definitions: EnglandGroundDefinition[], data: DraftingInput): string {
  const property = getFirstString(data, 'property_address', 'property.full_address', 'property.address_line_1');
  const groundsText = definitions.map((definition) => `Ground ${definition.code} (${definition.title})`).join(', ');

  return property
    ? `The claimant seeks possession of ${property} relying on ${groundsText}.`
    : `The claimant seeks possession relying on ${groundsText}.`;
}

function buildBridgeParagraphs(definitions: EnglandGroundDefinition[]): string[] {
  const reasons = Array.from(new Set(definitions.map((definition) => definition.commonReason)));
  if (definitions.length <= 1) return [];

  if (reasons.includes('rent_arrears_serious') || reasons.includes('rent_arrears_other')) {
    return [
      'The arrears history, service chronology, and any further tenancy concerns should be read together as part of one possession case, while each statutory ground remains separately pleaded.',
    ];
  }

  return [
    'The grounds are advanced as part of one coherent possession case arising from the tenancy history, and the supporting evidence should be read together rather than as isolated fragments.',
  ];
}

function buildEvidenceItems(definition: EnglandGroundDefinition): string[] {
  return definition.evidenceCategories.map((item) => capitalizePhrase(item));
}

function buildArrearsDraft(data: DraftingInput, definition: EnglandGroundDefinition): EnglandGroundDraft {
  const rentAmount = toNumber(getFirstValue(data, 'rent_amount', 'tenancy.rent_amount'));
  const rentFrequency = describeRentFrequency(getFirstValue(data, 'rent_frequency', 'tenancy.rent_frequency'));
  const totalArrears = toNumber(
    getFirstValue(data, 'total_arrears', 'arrears_at_notice_date', 'current_arrears', 'arrears.total_arrears'),
  );
  const noticeDate = formatLongDate(getFirstValue(data, 'notice_service_date', 'notice_served_date', 'section_8_notice_date'));
  const arrearsPeriods = describeArrearsPeriods(data);
  const threshold = rentAmount > 0 ? getGround8Threshold(rentAmount, rentFrequency as any) : null;
  const chronology = buildEnglandEvictionChronology(data);

  const paragraphs: string[] = [];

  if (definition.code === '8') {
    paragraphs.push('Ground 8 is relied on as the serious rent arrears ground.');
    if (noticeDate && totalArrears > 0) {
      paragraphs.push(
        `At the date of service of the ${ENGLAND_SECTION8_NOTICE_NAME} on ${noticeDate}, the arrears stood at ${formatCurrencyText(totalArrears)}.`,
      );
    }
    if (threshold && threshold.amount > 0) {
      paragraphs.push(
        `That figure is presented as exceeding the statutory Ground 8 threshold of ${formatCurrencyText(threshold.amount)} (${threshold.description}).`,
      );
    }
  } else if (definition.code === '10') {
    paragraphs.push(
      'Ground 10 is relied on because rent lawfully due was unpaid when the notice was served and remains part of the claim history.',
    );
    if (totalArrears > 0) {
      paragraphs.push(`The arrears balance relied on for Ground 10 is ${formatCurrencyText(totalArrears)}.`);
    }
  } else {
    paragraphs.push(
      'Ground 11 is relied on because the rent account shows repeated delay and irregularity in paying rent lawfully due.',
    );
  }

  paragraphs.push(
    arrearsPeriods
      ? `The rent account and arrears schedule show the unpaid or short-paid periods ${arrearsPeriods}.`
      : 'The claimant relies on the rent account, payment history, and arrears schedule to show the arrears pattern.',
  );

  return {
    code: definition.code,
    label: `Ground ${definition.code}`,
    title: definition.title,
    mandatory: definition.mandatory,
    commonReason: definition.commonReason,
    noticeParagraphs: paragraphs,
    witnessParagraphs: paragraphs,
    conductParagraphs: [],
    evidenceItems: [
      'Updated rent statement and arrears schedule',
      'Payment ledger, bank statements, or rent receipts',
      'Copies of payment demands or arrears correspondence',
    ],
    bundleRows: [
      {
        title: 'Schedule of arrears',
        description: 'Period-by-period rent schedule showing sums due, payments received, and the running balance',
        exhibitKey: 'schedule_of_arrears',
      },
      {
        title: 'Payment history evidence',
        description: 'Bank statements, ledger extracts, or rent receipts supporting the arrears calculation',
      },
    ],
      hearingWarnings:
        definition.code === '8' && threshold
          ? [
              `Ground 8 should only be advanced as a mandatory ground if the arrears still satisfy the threshold of ${formatCurrencyText(threshold.amount)} at the hearing.`,
            ]
          : [],
      timelineItems:
        chronology.timelineItems.length > 0
          ? chronology.timelineItems
          : [noticeDate ? `Notice served: ${noticeDate}` : '', buildNoticeTimelineSentence(data)].filter(Boolean),
      riskParagraphs: [],
    };
}

function buildBreachDraft(data: DraftingInput, definition: EnglandGroundDefinition): EnglandGroundDraft {
  const facts = getGroundFacts(data, definition.code);
  const clause =
    getFirstString(facts, 'tenancy_clause') ||
    getFirstString(data, 'section8_grounds.breach_details', 'issues.section8_grounds.breach_details');
  const breachTypes = getFirstValue(facts, 'breach_type');
  const breachTypeText = Array.isArray(breachTypes) ? breachTypes.join(', ') : String(breachTypes || '').trim();
  const breachDates = getFirstString(facts, 'breach_dates');
  const breachEvidence = getFirstString(facts, 'breach_evidence');
  const warnings = getFirstString(facts, 'warnings_issued');

  const paragraphs = [
    'Ground 12 is relied on because the claimant says the tenant has failed to comply with obligations in the tenancy agreement.',
    clause ? `The alleged breach is said to concern clause or term ${clause}.` : '',
    breachTypeText ? `The pleaded breach concerns ${breachTypeText}.` : '',
    breachDates ? `The relevant incidents or dates are recorded as ${breachDates}.` : '',
    breachEvidence ? `The claimant intends to rely on the following supporting material: ${breachEvidence}.` : '',
    warnings ? `The tenancy file records warnings or requests to remedy the breach: ${warnings}.` : '',
  ].filter(Boolean);

  return {
    code: definition.code,
    label: `Ground ${definition.code}`,
    title: definition.title,
    mandatory: definition.mandatory,
    commonReason: definition.commonReason,
    noticeParagraphs: paragraphs,
    witnessParagraphs: paragraphs,
    conductParagraphs: paragraphs,
    evidenceItems: [
      'Tenancy agreement and the relevant tenancy term',
      'Breach correspondence, warnings, and remedial requests',
      'Photographs, inspection notes, or supporting witness material where relevant',
    ],
    bundleRows: [
      {
        title: 'Tenancy breach evidence',
        description: 'Tenancy clauses, warning letters, and records of the alleged breach',
      },
    ],
    hearingWarnings: [
      'The judge is likely to want the tenancy term, the factual breach, and the supporting evidence set out clearly and without duplication.',
    ],
    timelineItems: [breachDates ? `Breach chronology: ${breachDates}` : 'Chronology of the alleged tenancy breach'].filter(Boolean),
    riskParagraphs: [],
  };
}

function buildDamageDraft(data: DraftingInput, definition: EnglandGroundDefinition): EnglandGroundDraft {
  const facts = getGroundFacts(data, definition.code);
  const description =
    getFirstString(facts, 'damage_description', 'furniture_damaged', 'evidence_description') ||
    getFirstString(data, 'section8_grounds.damage_schedule', 'issues.section8_grounds.damage_schedule');
  const discoveredDate = formatLongDate(getFirstValue(facts, 'damage_discovered_date'));
  const cost = toNumber(getFirstValue(facts, 'damage_cost'));
  const evidence = getFirstString(facts, 'evidence_available', 'evidence_description');

  const paragraphs = [
    `Ground ${definition.code} is relied on because the claimant says the property or its contents have deteriorated through the tenant's conduct or neglect beyond ordinary use.`,
    description ? `The case summary records the relevant damage as follows: ${description}.` : '',
    discoveredDate ? `The damage is said to have been identified on or around ${discoveredDate}.` : '',
    cost > 0 ? `The present estimate of loss or remedial cost is ${formatCurrencyText(cost)}.` : '',
    evidence ? `The claimant intends to rely on ${evidence}.` : '',
  ].filter(Boolean);

  return {
    code: definition.code,
    label: `Ground ${definition.code}`,
    title: definition.title,
    mandatory: definition.mandatory,
    commonReason: definition.commonReason,
    noticeParagraphs: paragraphs,
    witnessParagraphs: paragraphs,
    conductParagraphs: paragraphs,
    evidenceItems: [
      'Photographs, inventory material, or inspection records',
      'Repair estimates, invoices, or replacement evidence',
      'Correspondence notifying the tenant of the condition issues',
    ],
    bundleRows: [
      {
        title: 'Damage and condition evidence',
        description: 'Photographs, inventories, inspection notes, and repair evidence',
      },
    ],
    hearingWarnings: [],
    timelineItems: [discoveredDate ? `Damage discovered: ${discoveredDate}` : 'Chronology of inspection and condition concerns'].filter(Boolean),
    riskParagraphs: [],
  };
}

function buildAsbDraft(data: DraftingInput, definition: EnglandGroundDefinition): EnglandGroundDraft {
  const facts = getGroundFacts(data, definition.code);
  const incidents =
    getFirstString(facts, 'incidents_description') ||
    getFirstString(data, 'section8_grounds.incident_log', 'issues.section8_grounds.incident_log');
  const affected = getFirstString(facts, 'affected_parties');
  const warnings = getFirstString(facts, 'warnings_issued');
  const policeReference = getFirstString(facts, 'police_reference');
  const councilReference = getFirstString(facts, 'council_reference');
  const incidentCount = toNumber(getFirstValue(facts, 'incident_count'));

  const paragraphs = [
    `Ground ${definition.code} is relied on because the claimant says the tenant's conduct has caused nuisance, annoyance, unlawful use, or other serious neighbourhood impact relevant to this ground.`,
    incidents ? `The conduct relied on is summarised as follows: ${incidents}.` : '',
    incidentCount > 0 ? `The current pack data records ${incidentCount} incident${incidentCount === 1 ? '' : 's'} relevant to this ground.` : '',
    affected ? `Those said to have been affected include ${affected}.` : '',
    warnings ? `The file records prior warnings or interventions: ${warnings}.` : '',
    policeReference ? `Police involvement is recorded under reference ${policeReference}.` : '',
    councilReference ? `Council or housing-management involvement is recorded under reference ${councilReference}.` : '',
  ].filter(Boolean);

  return {
    code: definition.code,
    label: `Ground ${definition.code}`,
    title: definition.title,
    mandatory: definition.mandatory,
    commonReason: definition.commonReason,
    noticeParagraphs: paragraphs,
    witnessParagraphs: paragraphs,
    conductParagraphs: paragraphs,
    evidenceItems: [
      'Incident log, complaint records, or witness statements',
      'Police, council, or managing-agent records where available',
      'Warning letters, tenancy breach notices, or investigation notes',
    ],
    bundleRows: [
      {
        title: 'Conduct evidence',
        description: 'Incident log, complaint records, witness statements, and official reports',
      },
    ],
    hearingWarnings: [
      'Keep the language sober and factual. The court will usually expect dates, incidents, and supporting material rather than broad character assertions.',
    ],
    timelineItems: [incidentCount > 0 ? `Incident record: ${incidentCount} matters logged` : 'Incident chronology and response history'].filter(Boolean),
    riskParagraphs: [],
  };
}

function buildSaleUseDraft(data: DraftingInput, definition: EnglandGroundDefinition): EnglandGroundDraft {
  const facts = getGroundFacts(data, definition.code);
  const decisionDate = formatLongDate(getFirstValue(facts, 'decision_date'));
  const evidence = getFirstString(facts, 'supporting_evidence');

  const paragraphs =
    definition.code === '1'
      ? (() => {
          const intendedOccupier = getFirstString(facts, 'intended_occupier');
          const relationship = getFirstString(facts, 'occupier_relationship');
          const occupationReason = getFirstString(facts, 'occupation_reason');
          const intendedStart = formatLongDate(getFirstValue(facts, 'intended_start_date'));
          const occupierSummary =
            intendedOccupier && relationship
              ? `${intendedOccupier}, ${relationship}`
              : intendedOccupier || relationship;

          return [
            'Ground 1 is relied on because the claimant says the landlord or a qualifying family member intends to occupy the property as a home after possession is recovered.',
            occupierSummary ? `The proposed occupier is identified as ${occupierSummary}.` : '',
            occupationReason ? `The stated reason for seeking possession on this ground is: ${occupationReason}.` : '',
            decisionDate ? `The decision to recover possession for that purpose is said to have been made on or about ${decisionDate}.` : '',
            intendedStart ? `Occupation is said to be intended from about ${intendedStart}.` : '',
            evidence ? `The claimant intends to support this ground with ${evidence}.` : '',
          ].filter(Boolean);
        })()
      : (() => {
          const saleReason = getFirstString(facts, 'sale_reason');
          const saleStepsTaken = getFirstString(facts, 'sale_steps_taken');
          const intendedSaleTiming = getFirstString(facts, 'intended_sale_timing');

          return [
            'Ground 1A is relied on because the claimant says the dwelling-house is to be sold with vacant possession.',
            saleReason ? `The stated reason for the proposed sale is: ${saleReason}.` : '',
            saleStepsTaken ? `The current sale preparations are described as follows: ${saleStepsTaken}.` : '',
            decisionDate ? `The decision to market or dispose of the property is said to have been taken on or about ${decisionDate}.` : '',
            intendedSaleTiming ? `The anticipated sale timetable is described as ${intendedSaleTiming}.` : '',
            evidence ? `The claimant intends to support this ground with ${evidence}.` : '',
          ].filter(Boolean);
        })();

  return {
    code: definition.code,
    label: `Ground ${definition.code}`,
    title: definition.title,
    mandatory: definition.mandatory,
    commonReason: definition.commonReason,
    noticeParagraphs: paragraphs,
    witnessParagraphs: [
      ...paragraphs,
      definition.code === '1'
        ? 'The witness statement should identify the proposed occupier clearly and explain why occupation is now intended.'
        : 'The witness statement should explain the present sale intention clearly and identify the current steps taken towards that sale.',
    ],
    conductParagraphs: [],
    evidenceItems: buildEvidenceItems(definition),
    bundleRows: [
      {
        title: `${definition.title} evidence`,
        description: `Documents supporting ${definition.title.toLowerCase()}`,
      },
    ],
    hearingWarnings: ['The court is likely to expect contemporary evidence of the proposed occupation, sale, or other intended use.'],
    timelineItems: [
      decisionDate ? `Decision recorded: ${decisionDate}` : '',
      definition.code === '1' ? 'Chronology of the occupation decision and proposed move-in' : 'Chronology of the decision to sell and sale preparations',
    ].filter(Boolean),
    riskParagraphs: [],
  };
}

function buildRedevelopmentDraft(data: DraftingInput, definition: EnglandGroundDefinition): EnglandGroundDraft {
  const facts = getGroundFacts(data, definition.code);
  const worksDescription = getFirstString(facts, 'works_description');
  const possessionReason = getFirstString(facts, 'possession_requirement_reason');
  const intendedStart = formatLongDate(getFirstValue(facts, 'intended_start_date'));
  const projectStatus = getFirstString(facts, 'planning_or_contractor_status');
  const evidence = getFirstString(facts, 'supporting_evidence');

  const paragraphs = [
    `Ground ${definition.code} is relied on because the claimant says possession is required to carry out the works relied on for ${definition.title.toLowerCase()}.`,
    worksDescription ? `The proposed works are described as follows: ${worksDescription}.` : '',
    possessionReason ? `The claimant says possession is required because ${possessionReason}.` : '',
    intendedStart ? `The works are said to be intended to start on or about ${intendedStart}.` : '',
    projectStatus ? `The current planning, contractor, or project position is described as ${projectStatus}.` : '',
    evidence ? `The claimant intends to rely on ${evidence}.` : '',
  ].filter(Boolean);

  return {
    code: definition.code,
    label: `Ground ${definition.code}`,
    title: definition.title,
    mandatory: definition.mandatory,
    commonReason: definition.commonReason,
    noticeParagraphs: paragraphs,
    witnessParagraphs: [
      ...paragraphs,
      'The witness statement should explain why the works cannot reasonably proceed with the tenant remaining in occupation.',
    ],
    conductParagraphs: [],
    evidenceItems: buildEvidenceItems(definition),
    bundleRows: [
      {
        title: `${definition.title} evidence`,
        description: 'Works proposals, contractor material, permissions, or compliance records',
      },
    ],
    hearingWarnings: ['Be ready to explain why the works genuinely require possession and what documents support that position.'],
    timelineItems: [
      intendedStart ? `Works intended to start: ${intendedStart}` : '',
      'Chronology of the proposed works, approvals, and decision to seek possession',
    ].filter(Boolean),
    riskParagraphs: [],
  };
}

function buildOccupationDraft(data: DraftingInput, definition: EnglandGroundDefinition): EnglandGroundDraft {
  const facts = getGroundFacts(data, definition.code);

  if (definition.code === '7B') {
    const affectedOccupiers = getFirstString(facts, 'affected_occupiers');
    const statusBasis = getFirstString(facts, 'status_basis', 'factual_basis');
    const noticeSource = getFirstString(facts, 'notice_source', 'notice_or_status_details');
    const statusCheckDate = formatLongDate(getFirstValue(facts, 'status_check_date', 'trigger_date'));
    const decisionOrReference = getFirstString(facts, 'decision_or_reference');
    const evidence = getFirstString(facts, 'supporting_evidence');
    const paragraphs = [
      'Ground 7B is relied on because the claimant says the tenancy is affected by immigration status restrictions and the statutory right-to-rent basis for possession is engaged.',
      statusBasis ? `The current status position is summarised as follows: ${statusBasis}.` : '',
      affectedOccupiers ? `The occupiers said to be affected are ${affectedOccupiers}.` : '',
      statusCheckDate ? `The relevant status check or notice is said to date from ${statusCheckDate}.` : '',
      noticeSource ? `The source material relied on is described as ${noticeSource}.` : '',
      decisionOrReference ? `The recorded decision or reference is ${decisionOrReference}.` : '',
      evidence ? `The claimant intends to rely on ${evidence}.` : '',
    ].filter(Boolean);

    return {
      code: definition.code,
      label: `Ground ${definition.code}`,
      title: definition.title,
      mandatory: definition.mandatory,
      commonReason: definition.commonReason,
      noticeParagraphs: paragraphs,
      witnessParagraphs: paragraphs,
      conductParagraphs: [],
      evidenceItems: buildEvidenceItems(definition),
      bundleRows: [
        {
          title: `${definition.title} evidence`,
          description: `Documents supporting ${definition.title.toLowerCase()}`,
        },
      ],
      hearingWarnings: [
        'Be ready to produce the relevant right-to-rent decision, notice, or official confirmation and explain how it applies to the occupiers.',
      ],
      timelineItems: [
        statusCheckDate ? `Status decision or check: ${statusCheckDate}` : '',
        'Chronology of the immigration-status material relied on for possession',
      ].filter(Boolean),
      riskParagraphs: [],
    };
  }

  const factualBasis = getFirstString(facts, 'factual_basis');
  const qualifyingOccupier = getFirstString(facts, 'qualifying_occupier');
  const relationship = getFirstString(facts, 'occupier_relationship');
  const triggerDate = formatLongDate(getFirstValue(facts, 'trigger_date'));
  const noticeOrStatusDetails = getFirstString(facts, 'notice_or_status_details');
  const evidence = getFirstString(facts, 'supporting_evidence');
  const leadParagraph =
    definition.code === '2'
      ? 'Ground 2 is relied on because the claimant says possession is required so a mortgagee or receiver can recover and sell the dwelling following mortgage enforcement.'
      : ['2ZA', '2ZB'].includes(definition.code)
        ? `Ground ${definition.code} is relied on because the claimant says the superior lease or equivalent superior interest governing the occupation is coming to an end and possession is required when that superior arrangement ends.`
        : ['2ZC', '2ZD'].includes(definition.code)
          ? `Ground ${definition.code} is relied on because the claimant says a superior landlord is entitled to recover possession and the present occupation cannot continue once that superior right is enforced.`
          : ['4', '4A'].includes(definition.code)
            ? `Ground ${definition.code} is relied on because the claimant says the dwelling forms part of student accommodation and possession is required for continued student use in accordance with the statutory scheme.`
            : definition.code === '5'
              ? 'Ground 5 is relied on because the claimant says the dwelling is required for occupation by a minister of religion.'
              : ['5A', '5B'].includes(definition.code)
                ? `Ground ${definition.code} is relied on because the claimant says the dwelling is tied to qualifying employment and possession is required for the relevant worker or employment-related occupier.`
                : definition.code === '5C'
                  ? 'Ground 5C is relied on because the dwelling was occupied in connection with employment and that employment position is said to have ended.'
                  : ['5E', '5F', '5G', '5H', '18'].includes(definition.code)
                    ? `Ground ${definition.code} is relied on because the claimant says the dwelling forms part of supported or transitional accommodation and the statutory conditions for recovering possession are met on the recorded facts.`
                    : definition.code === '7'
                      ? 'Ground 7 is relied on because the tenant has died and the claimant says the remaining occupation no longer carries a continuing right to stay under the tenancy.'
                      : definition.commonReason === 'students_or_workers'
                        ? `Ground ${definition.code} is relied on because the claimant says the property is needed for the class of occupier protected by ${definition.title.toLowerCase()}.`
                        : `Ground ${definition.code} is relied on because the claimant says the statutory factual basis for ${definition.title.toLowerCase()} is satisfied on the recorded facts.`;
  const occupierSummary =
    qualifyingOccupier && relationship
      ? `${qualifyingOccupier} (${relationship})`
      : qualifyingOccupier || relationship;
  const paragraphs = [
    leadParagraph,
    factualBasis ? `The claimant says ${factualBasis}.` : '',
    occupierSummary ? `The route is said to apply because it concerns ${occupierSummary}.` : '',
    triggerDate ? `The key date relied on for this route is ${triggerDate}.` : '',
    noticeOrStatusDetails ? `The claimant also relies on ${noticeOrStatusDetails}.` : '',
    evidence ? `The supporting material presently identified includes ${evidence}.` : '',
  ].filter(Boolean);

  return {
    code: definition.code,
    label: `Ground ${definition.code}`,
    title: definition.title,
    mandatory: definition.mandatory,
    commonReason: definition.commonReason,
    noticeParagraphs: paragraphs,
    witnessParagraphs: paragraphs,
    conductParagraphs: [],
    evidenceItems: buildEvidenceItems(definition),
    bundleRows: [
      {
        title: `${definition.title} evidence`,
        description: `Documents supporting ${definition.title.toLowerCase()}`,
      },
    ],
    hearingWarnings:
      definition.commonReason === 'students_or_workers'
        ? [
            'The court is likely to expect clear evidence of the qualifying occupier category and why this statutory route is engaged on current facts.',
          ]
        : [],
    timelineItems: [
      triggerDate ? `Trigger or qualifying date: ${triggerDate}` : '',
      'Chronology of the statutory facts relied on for this specialist ground',
    ].filter(Boolean),
    riskParagraphs: [],
  };
}

function buildAlternativeAccommodationDraft(data: DraftingInput, definition: EnglandGroundDefinition): EnglandGroundDraft {
  const facts = getGroundFacts(data, definition.code);
  const alternativeAddress = getFirstString(facts, 'alternative_address');
  const availabilityDate = formatLongDate(getFirstValue(facts, 'availability_date'));
  const suitabilitySummary = getFirstString(facts, 'suitability_summary');
  const affordabilitySummary = getFirstString(facts, 'affordability_summary');
  const evidence = getFirstString(facts, 'supporting_evidence');
  const paragraphs = [
    'Ground 9 is relied on because the claimant says suitable alternative accommodation is or will be available for the tenant.',
    alternativeAddress ? `The alternative accommodation identified is ${alternativeAddress}.` : '',
    availabilityDate ? `It is said to be available from about ${availabilityDate}.` : '',
    suitabilitySummary ? `The claimant's suitability explanation is: ${suitabilitySummary}.` : '',
    affordabilitySummary ? `The affordability or practical availability is summarised as ${affordabilitySummary}.` : '',
    evidence ? `The claimant intends to rely on ${evidence}.` : '',
  ].filter(Boolean);

  return {
    code: definition.code,
    label: `Ground ${definition.code}`,
    title: definition.title,
    mandatory: definition.mandatory,
    commonReason: definition.commonReason,
    noticeParagraphs: paragraphs,
    witnessParagraphs: [
      ...paragraphs,
      'The witness statement should explain carefully why the accommodation is said to be suitable for this tenant and available when required.',
    ],
    conductParagraphs: [],
    evidenceItems: buildEvidenceItems(definition),
    bundleRows: [
      {
        title: 'Alternative accommodation evidence',
        description: 'Details of the proposed accommodation and why it is said to be suitable',
      },
    ],
    hearingWarnings: ['Suitability should be addressed factually, including location, size, affordability, and availability.'],
    timelineItems: [
      availabilityDate ? `Alternative accommodation available: ${availabilityDate}` : '',
      'Chronology of the identification and availability of alternative accommodation',
    ].filter(Boolean),
    riskParagraphs: [],
  };
}

function buildFalseStatementDraft(data: DraftingInput, definition: EnglandGroundDefinition): EnglandGroundDraft {
  const facts = getGroundFacts(data, definition.code);
  const statementMade = getFirstString(facts, 'statement_made', 'false_statement');
  const statementDate = formatLongDate(getFirstValue(facts, 'statement_date'));
  const trueFacts = getFirstString(facts, 'true_facts');
  const discovery = formatLongDate(getFirstValue(facts, 'discovery_date')) || getFirstString(facts, 'when_discovered');

  const paragraphs = [
    'Ground 17 is relied on because the claimant says the tenancy was induced by a false statement made by or on behalf of the tenant.',
    statementMade ? `The statement relied on is described as follows: ${statementMade}.` : '',
    statementDate ? `That statement is said to have been made on or about ${statementDate}.` : '',
    trueFacts ? `The claimant says the true position was: ${trueFacts}.` : '',
    discovery ? `The alleged falsity is said to have been discovered on or about ${discovery}.` : '',
  ].filter(Boolean);

  return {
    code: definition.code,
    label: `Ground ${definition.code}`,
    title: definition.title,
    mandatory: definition.mandatory,
    commonReason: definition.commonReason,
    noticeParagraphs: paragraphs,
    witnessParagraphs: paragraphs,
    conductParagraphs: [],
    evidenceItems: buildEvidenceItems(definition),
    bundleRows: [
      {
        title: 'False statement evidence',
        description: 'Application, reference, and verification records supporting Ground 17',
      },
    ],
    hearingWarnings: [],
    timelineItems: [
      statementDate ? `Statement date: ${statementDate}` : '',
      discovery ? `Discovery date: ${discovery}` : 'Chronology of the alleged false statement',
    ].filter(Boolean),
    riskParagraphs: [],
  };
}

function resolveGroundDraftBuilder(code: EnglandGroundCode): GroundDraftBuilder {
  if (['8', '10', '11'].includes(code)) return buildArrearsDraft;
  if (code === '12') return buildBreachDraft;
  if (['13', '15'].includes(code)) return buildDamageDraft;
  if (['7A', '14', '14A', '14ZA'].includes(code)) return buildAsbDraft;
  if (['1', '1A'].includes(code)) return buildSaleUseDraft;
  if (['6', '6B'].includes(code)) return buildRedevelopmentDraft;
  if (code === '9') return buildAlternativeAccommodationDraft;
  if (code === '17') return buildFalseStatementDraft;
  return buildOccupationDraft;
}

export const ENGLAND_GROUND_DRAFT_REGISTRY: Record<EnglandGroundCode, GroundDraftBuilder> =
  listEnglandGroundDefinitions().reduce((registry, definition) => {
    registry[definition.code] = resolveGroundDraftBuilder(definition.code);
    return registry;
  }, {} as Record<EnglandGroundCode, GroundDraftBuilder>);

function buildGroundDrafts(data: DraftingInput, codes: EnglandGroundCode[]): EnglandGroundDraft[] {
  return codes
    .map((code) => {
      const definition = getEnglandGroundDefinition(code);
      if (!definition) return null;
      return ENGLAND_GROUND_DRAFT_REGISTRY[code](data, definition);
    })
    .filter((draft): draft is EnglandGroundDraft => Boolean(draft));
}

function buildPreActionParagraphs(data: DraftingInput, groundDrafts: EnglandGroundDraft[]): string[] {
  const recordedSteps = Array.isArray(data.preActionSteps) ? data.preActionSteps : [];
  const stepLines = recordedSteps
    .filter((step) => step?.date && step?.description)
      .map((step) => `${formatLongDate(step.date)}: ${String(step.description).trim()}`)
      .filter(Boolean);
  const noticeTimelineSentence = buildNoticeTimelineSentence(data);
  const chronology = buildEnglandEvictionChronology(data);

  if (stepLines.length > 0) {
    const hasNoticeLine = stepLines.some((line) => /form 3a|form 3|notice/i.test(line));
    return [...stepLines, !hasNoticeLine ? noticeTimelineSentence : ''].filter(Boolean);
  }

  if (chronology.paragraphs.length > 0) {
    return chronology.paragraphs;
  }

  return [
    groundDrafts.some((draft) => ['8', '10', '11'].includes(draft.code))
      ? 'The claimant has maintained the rent account, sought payment, and kept the arrears position under review before issuing proceedings.'
      : 'The claimant has reviewed the tenancy history, gathered the relevant tenancy records, and considered the statutory ground or grounds before issuing proceedings.',
    noticeTimelineSentence,
  ].filter(Boolean);
}

function buildDefendantCircumstancesParagraphs(data: DraftingInput): string[] {
  const vulnerabilityDetails = [data.tenant_vulnerability_details, data.vulnerability_details]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  const knownDefences = String(data.known_tenant_defences || '').trim();
  const disrepairIssues = String(data.disrepair_issues_list || '').trim();
  const disrepairDate = formatLongDate(data.disrepair_complaint_date);
  const previousProceedings = String(data.previous_proceedings_details || '').trim();
  const benefitDetails = [data.benefit_type, data.tenant_benefits_details]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  const counterclaimGrounds = Array.isArray(data.counterclaim_grounds)
    ? data.counterclaim_grounds.map((entry) => String(entry || '').trim()).filter(Boolean)
    : String(data.counterclaim_grounds || '')
        .split(/\r?\n|;/)
        .map((entry) => entry.trim())
        .filter(Boolean);
  const paymentPlanResponse = String(data.payment_plan_response || '').trim();

  const paragraphs = [
    vulnerabilityDetails.length > 0
      ? `Known defendant circumstances: ${vulnerabilityDetails.join(' ')}`
      : '',
    knownDefences
      ? `The claimant understands that the defendant may seek to rely on the following defence or dispute points: ${knownDefences}. The claimant's bundle should answer those points through the chronology, compliance record, and supporting documents.`
      : '',
    data.disrepair_complaints === true
      ? `The defendant has raised disrepair issues${disrepairDate ? ` on or around ${disrepairDate}` : ''}: ${disrepairIssues || 'details to be confirmed in the bundle'}. The claimant should exhibit the relevant inspection, repair, and response evidence so any set-off or counterclaim point is answered directly.`
      : '',
    data.previous_court_proceedings === true
      ? `There have been previous proceedings or formal litigation steps relating to this tenancy: ${previousProceedings || 'details to be confirmed in the claim bundle'}. The present claim should explain that earlier history so the court can see how the current case fits into it.`
      : '',
    benefitDetails.length > 0
      ? `Benefit information disclosed to the claimant: ${benefitDetails.join(', ')}. If arrears are said to be linked to benefit delay or direct payment problems, the claimant should keep the payment chronology and contact history tightly aligned to that explanation.`
      : '',
    data.payment_plan_offered === true
      ? `A payment plan or arrears arrangement was offered${
          paymentPlanResponse
            ? ` and the recorded outcome was: ${paymentPlanResponse}.`
            : " The claimant should exhibit that proposal and the tenant's response or non-compliance."
        }`
      : '',
    data.tenant_counterclaim_likely === true
      ? `A counterclaim or set-off is considered likely${counterclaimGrounds.length > 0 ? ` on the following issues: ${counterclaimGrounds.join('; ')}.` : '.'} The claimant's witness material and hearing preparation should answer those issues expressly rather than leaving them to inference.`
      : '',
  ].filter(Boolean);

  if (paragraphs.length === 0) {
    return [
      "The claimant is not aware of any further information about the defendant's circumstances beyond the matters set out in the claim papers and any information the defendant may wish to place before the court.",
    ];
  }

  return paragraphs;
}

function buildDefenceRiskEvidenceItems(data: DraftingInput): string[] {
  const items: string[] = [];
  const knownDefences = String(data.known_tenant_defences || '').trim();
  const benefitDetails = [data.benefit_type, data.tenant_benefits_details]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  if (knownDefences) {
    items.push(
      `Documents answering the tenant's stated defence or dispute points (${knownDefences}).`,
    );
  }

  if (data.disrepair_complaints === true) {
    items.push(
      'Repair logs, inspection notes, contractor records, photographs, and response correspondence answering any disrepair or set-off point.',
    );
  }

  if (data.previous_court_proceedings === true) {
    items.push('Copies of any previous possession proceedings, orders, or settlement terms affecting this tenancy.');
  }

  if (benefitDetails.length > 0) {
    items.push(
      'Benefit or Universal Credit correspondence, payment screenshots, and rent-account notes explaining any benefit-linked arrears issue.',
    );
  }

  if (data.payment_plan_offered === true) {
    items.push("Copies of any arrears-payment proposal and the tenant's response or non-compliance.");
  }

  if (data.tenant_counterclaim_likely === true) {
    items.push('The documents that most directly answer any likely counterclaim or equitable set-off point.');
  }

  return dedupeList(items);
}

function buildFinancialParagraphs(data: DraftingInput, grounds: EnglandGroundCode[]): string[] {
  const totalArrears = toNumber(getFirstValue(data, 'total_arrears', 'arrears_at_notice_date', 'current_arrears'));
  const rentAmount = toNumber(getFirstValue(data, 'rent_amount', 'tenancy.rent_amount'));
  const frequency = describeRentFrequency(getFirstValue(data, 'rent_frequency', 'tenancy.rent_frequency'));

  return [
    grounds.some((code) => ['8', '10', '11'].includes(code)) && totalArrears > 0
      ? `The claimant seeks possession and, if the court thinks fit, judgment for rent arrears currently quantified at ${formatCurrencyText(totalArrears)}.`
      : 'The claimant seeks possession together with the court fee, any fixed costs allowed, and any further relief the court considers appropriate.',
    rentAmount > 0 ? `The contractual rent is ${formatCurrencyText(rentAmount)} payable ${frequency}.` : '',
    buildNoticeTimelineSentence(data),
  ].filter(Boolean);
}

function buildMethodNotes(data: DraftingInput): string[] {
  const serviceMethod = getFirstString(data, 'notice_service_method', 'service_method', 'notice.service_method').toLowerCase();
  if (serviceMethod.includes('post')) {
    return [
      `Keep the proof of posting, a copy of the served ${ENGLAND_SECTION8_NOTICE_NAME}, and a record of the address used.`,
      'If service is challenged, be ready to explain why the method chosen complied with the tenancy agreement and why the service date used in the pack is the correct date.',
    ];
  }

  if (serviceMethod.includes('recorded') || serviceMethod.includes('signed')) {
    return [
      'Keep the tracking reference and the delivery outcome, but do not assume that a refused or uncollected item resolves all service questions on its own.',
      'If there is any doubt about receipt, preserve the evidence and consider whether another permitted method was or should be used.',
    ];
  }

  return [
    `Keep a served copy of the ${ENGLAND_SECTION8_NOTICE_NAME} and make a clear note of the date, time, address, and person who carried out service.`,
    'If another adult witnessed service, record that fact immediately and retain their contact details.',
  ];
}

function deriveBundleSectionTitle(groundDrafts: EnglandGroundDraft[]): string {
  const reasons = Array.from(new Set(groundDrafts.map((draft) => draft.commonReason)));
  if (reasons.length === 1 && reasons[0] === 'rent_arrears_serious') return 'D. Arrears evidence';
  if (reasons.length === 1 && reasons[0] === 'rent_arrears_other') return 'D. Payment and arrears evidence';
  if (reasons.length === 1 && reasons[0] === 'tenancy_breach') return 'D. Breach evidence';
  if (reasons.length === 1 && reasons[0] === 'asb_or_legal_breach') return 'D. Conduct evidence';
  if (reasons.length === 1 && reasons[0] === 'redevelopment') return 'D. Redevelopment evidence';
  if (reasons.length === 1 && reasons[0] === 'use_or_sale') return 'D. Ground-specific use or sale evidence';
  return 'D. Ground-specific evidence';
}

function buildWitnessEvidenceParagraphs(groundDrafts: EnglandGroundDraft[]): string[] {
  const items = dedupeList(groundDrafts.flatMap((draft) => draft.evidenceItems));
  if (items.length === 0) {
    return ['The claimant relies on the notice, tenancy documents, and the supporting material placed in the bundle.'];
  }

  return [`The claimant relies on the following supporting material: ${items.join('; ')}.`];
}

function buildEvidenceChecklistSections(groundDrafts: EnglandGroundDraft[]): DraftingChecklistSection[] {
  return groundDrafts.map((draft) => ({
    title: `${draft.label} (${draft.title})`,
    items: dedupeList(
      draft.evidenceItems.length > 0
        ? draft.evidenceItems
        : [`Supporting material explaining ${draft.title.toLowerCase()}`],
    ),
    note: draft.mandatory
      ? 'Mandatory ground: the evidence should prove each statutory element clearly at the relevant dates.'
      : 'Discretionary ground: the evidence should prove the factual basis and assist on overall reasonableness.',
  }));
}

function buildCoverLetterSection(params: {
  data: DraftingInput;
  groundCodes: EnglandGroundCode[];
  groundsLeadParagraph: string;
}): EnglandPossessionDraftingModel['coverLetter'] {
  const { data, groundCodes, groundsLeadParagraph } = params;
  const property = getFirstString(data, 'property_address', 'property.full_address');
  const serviceDate = formatLongDate(
    getFirstValue(data, 'notice_service_date', 'notice_served_date', 'service_date', 'notice_date'),
  );
  const noticeTimeline = buildNoticeTimelineSentence(data);

  return {
    introParagraphs: dedupeParagraphs([
      property
        ? `Please find enclosed the ${ENGLAND_SECTION8_NOTICE_NAME} relating to ${property}.`
        : `Please find enclosed the ${ENGLAND_SECTION8_NOTICE_NAME}.`,
      groundsLeadParagraph,
      noticeTimeline,
      serviceDate
        ? `This accompanying letter records the intended service date as ${serviceDate}, but the legal effect comes from the enclosed notice itself.`
        : 'This accompanying letter is provided for clarity only; the legal effect comes from the enclosed notice itself.',
    ]),
    actionItems: dedupeList([
      'Read the enclosed notice carefully and keep a copy of everything served.',
      groundCodes.some((code) => ['8', '10', '11'].includes(code))
        ? 'If the notice relies on rent arrears, contact the landlord or agent promptly if you wish to discuss payment, dispute the rent account, or explain any change in circumstances.'
        : 'Take advice promptly if you disagree with the notice or wish to explain facts that may affect the possession claim.',
      'Seek independent housing advice promptly if you need assistance.',
    ]),
    closingParagraphs: dedupeParagraphs([
      'This letter is a support document only and does not replace the enclosed notice.',
      'If court proceedings are later started, the claimant will still need to prove the statutory ground or grounds relied on.',
    ]),
  };
}

function buildEvidenceChecklistSection(params: {
  data: DraftingInput;
  groundCodes: EnglandGroundCode[];
  groundsLeadParagraph: string;
  groundDrafts: EnglandGroundDraft[];
}): EnglandPossessionDraftingModel['evidenceChecklist'] {
  const { data, groundCodes, groundsLeadParagraph, groundDrafts } = params;
  const serviceMethod = String(getFirstValue(data, 'notice_service_method', 'service_method') || '').toLowerCase();
  const defenceRiskEvidenceItems = buildDefenceRiskEvidenceItems(data);
  const hasDefenceRiskInputs =
    defenceRiskEvidenceItems.length > 0 ||
    String(data.known_tenant_defences || '').trim().length > 0 ||
    data.disrepair_complaints === true ||
    data.tenant_counterclaim_likely === true;

  return {
    overviewParagraphs: dedupeParagraphs([
      groundsLeadParagraph,
      'Assemble the evidence so the court can follow the tenancy history, the notice chronology, and the factual basis of each pleaded ground without having to infer missing steps.',
      buildNoticeTimelineSentence(data),
    ]),
    collectionItems: dedupeList([
      'Signed tenancy agreement and any renewals or variations.',
      `The completed ${ENGLAND_SECTION8_NOTICE_NAME} as served.`,
      serviceMethod ? `Service material showing how the notice was served (${serviceMethod.replace(/_/g, ' ')}).` : 'Service material showing how the notice was served.',
      groundCodes.some((code) => ['8', '10', '11'].includes(code))
        ? 'Up-to-date rent account and arrears schedule, including payments made after service if any.'
        : '',
      'Any correspondence, inspection records, warning letters, or official notices relevant to the pleaded grounds.',
      ...defenceRiskEvidenceItems,
    ]),
    groundSections: buildEvidenceChecklistSections(groundDrafts),
    finalChecks: dedupeList([
      'Remove duplicate, placeholder, or unexplained documents before serving the bundle on the court or the tenant.',
      'Make sure dates, party names, and property details match across the notice, the witness statement, and the court forms.',
      groundCodes.some((code) => ['8', '10', '11'].includes(code))
        ? 'Update the arrears figures immediately before issue and again before any hearing.'
        : 'Check that each specialist ground is supported by the specific prior-notice, status, or occupancy evidence required for that route.',
      hasDefenceRiskInputs
        ? 'If the tenant is likely to dispute the claim, make sure the bundle contains the documents that answer those points directly rather than leaving the judge to infer the response.'
        : '',
    ]),
  };
}

function buildCourtFilingGuideSection(params: {
  data: DraftingInput;
  groundCodes: EnglandGroundCode[];
  groundsLeadParagraph: string;
  groundDrafts: EnglandGroundDraft[];
  evidenceItems: string[];
}): EnglandPossessionDraftingModel['courtFilingGuide'] {
  const { data, groundCodes, groundsLeadParagraph, groundDrafts, evidenceItems } = params;
  const courtName = getFirstString(data, 'court_name') || 'the County Court';
  const rentArrearsOnly = groundCodes.length > 0 && groundCodes.every((code) => ['8', '10', '11'].includes(code));

  return {
    overviewParagraphs: dedupeParagraphs([
      groundsLeadParagraph,
      buildNoticeTimelineSentence(data),
      `If the matter is not resolved after service of the ${ENGLAND_SECTION8_NOTICE_NAME}, the claim should be prepared for filing in ${courtName} using the same factual basis and dates as the notice pack.`,
      rentArrearsOnly
        ? 'The default route in this pack remains the paper county court claim using Form N5 and Form N119. Possession Claim Online may be available only for eligible rent-arrears-only Section 8 claims, so treat that as a limited alternative rather than the general rule.'
        : 'For this claim type, the working assumption is the paper county court route using Form N5 and Form N119.',
    ]),
    preparationItems: dedupeList([
      'Review the notice, proof of service, witness statement, and claim forms together before issue.',
      'Check that the same court name, notice timeline, and grounds appear consistently across the pack.',
      groundCodes.some((code) => ['8', '10', '11'].includes(code))
        ? 'Refresh the arrears schedule to the latest practicable date before filing.'
        : 'Check that the evidence still proves the statutory ground on the date proceedings are issued.',
    ]),
    filingItems: dedupeList([
      'File Form N5, Form N119, the notice, and the supporting proof-of-service record together with any required fee or fee-remission material.',
      'Prepare an indexed bundle containing the tenancy documents, the served notice, service evidence, and the ground-specific documents relied on.',
      ...evidenceItems,
    ]),
    afterIssueItems: dedupeList([
      'Monitor for any defence, witness evidence, or counterclaim and update the bundle so the response documents answer it directly.',
      'If circumstances materially change after issue, update the figures or factual chronology promptly and reflect that change consistently across the pack.',
      'Before the hearing, re-check every court-facing document for blank placeholders, stale dates, or unsupported allegations.',
    ]),
    warningParagraphs: dedupeParagraphs([
      ...groundDrafts.flatMap((draft) => draft.hearingWarnings),
      rentArrearsOnly
        ? 'Only treat Possession Claim Online as potentially available if the claim is genuinely confined to eligible rent-arrears-only Section 8 grounds. Mixed-ground or non-arrears claims should stay on the paper N5 and N119 route.'
        : 'Do not assume Possession Claim Online is available for every claim. If the case is not an eligible rent-arrears-only Section 8 claim, keep to the paper N5 and N119 route.',
      groundCodes.some((code) => ['8', '10', '11'].includes(code))
        ? 'Do not rely on a stale arrears figure or assume that a mandatory arrears ground still applies if payments have reduced the balance.'
        : 'Keep the pleaded grounds fact-specific and ensure the same evidence-led account is carried through the claim forms, witness material, and bundle.',
    ]),
  };
}

function buildRoadmapSection(params: {
  data: DraftingInput;
  groundCodes: EnglandGroundCode[];
  groundsLeadParagraph: string;
  groundDrafts: EnglandGroundDraft[];
}): EnglandPossessionDraftingModel['roadmap'] {
  const { data, groundCodes, groundsLeadParagraph, groundDrafts } = params;

  return {
    overviewParagraphs: dedupeParagraphs([
      groundsLeadParagraph,
      buildNoticeTimelineSentence(data),
      'The steps below should be treated as one continuous possession workflow: serve the notice correctly, preserve the evidence, issue the claim only once the notice period has run, and keep the bundle updated through to hearing.',
    ]),
    noticeStageItems: dedupeList([
      `Serve the ${ENGLAND_SECTION8_NOTICE_NAME} using a permitted method and keep a clear service record.`,
      'Store the served notice, the date of service, and the supporting documents together immediately.',
      'If the tenant responds, keep that correspondence with the service record rather than treating it as a separate file.',
    ]),
    issueStageItems: dedupeList([
      'After the notice period has expired, decide whether the matter has been resolved or whether court proceedings are required.',
      groundCodes.some((code) => ['8', '10', '11'].includes(code))
        ? 'If arrears grounds remain in issue, update the rent account before drafting or filing the claim.'
        : 'If a specialist ground remains in issue, check that the supporting factual basis still applies on the current facts.',
      'Prepare the court forms, witness evidence, and bundle index so they repeat the same chronology and ground wording as the notice pack.',
    ]),
    hearingStageItems: dedupeList([
      'Bring the original notice, proof of service, witness statement, and indexed bundle to the hearing.',
      'Keep oral submissions short, factual, and tied to the specific statutory grounds relied on.',
      'Be ready to identify the most direct document or witness evidence for each disputed point.',
    ]),
    enforcementStageItems: dedupeList([
      'If the court makes a possession order and the tenant does not leave, consider the appropriate enforcement application using the same court-ready bundle structure.',
      'Update the chronology if there has been compliance, payment, or further conduct since the order.',
    ]),
    warningParagraphs: dedupeParagraphs([
      ...groundDrafts.flatMap((draft) => draft.riskParagraphs),
      'Do not leave empty sections, placeholder rows, or unexplained gaps in any document later shown to the tenant or the court.',
    ]),
  };
}

function buildPreviewSummarySection(params: {
  data: DraftingInput;
  groundsLeadParagraph: string;
  noticeExplanationParagraphs: string[];
  preActionParagraphs: string[];
}): EnglandPossessionDraftingModel['previewSummary'] {
  const { data, groundsLeadParagraph, noticeExplanationParagraphs, preActionParagraphs } = params;
  const property = getFirstString(data, 'property_address', 'property.full_address');

  return {
    shortTitle: property ? `England possession case for ${property}` : 'England possession case',
    narrativeParagraphs: dedupeParagraphs([
      groundsLeadParagraph,
      ...noticeExplanationParagraphs.slice(1, 3),
    ]),
    readinessItems: dedupeList([
      ...preActionParagraphs,
      'The same ground-specific narrative should carry through the notice, any witness statement, and the court claim materials.',
    ]),
  };
}

export function buildEnglandPossessionDraftingModel(data: DraftingInput): EnglandPossessionDraftingModel {
  const groundCodes = extractGroundCodes(data);
  const groundDrafts = buildGroundDrafts(data, groundCodes);
  const definitions = groundCodes
    .map((code) => getEnglandGroundDefinition(code))
    .filter((definition): definition is EnglandGroundDefinition => Boolean(definition));
  const groundLabels = definitions.map((definition) => `Ground ${definition.code} (${definition.title})`);
  const groundsLeadParagraph = definitions.length > 0 ? buildGroundLeadParagraph(definitions, data) : '';
  const groundsBridgeParagraphs = buildBridgeParagraphs(definitions);
  const tenancyOverview = buildTenancyOverview(data);
  const userNarrative = extractNarrativeCandidates(data).find(Boolean) || '';
  const preActionParagraphs = buildPreActionParagraphs(data, groundDrafts);
  const chronology = buildEnglandEvictionChronology(data);
  const defendantCircumstancesParagraphs = buildDefendantCircumstancesParagraphs(data);
  const financialParagraphs = buildFinancialParagraphs(data, groundCodes);
  const evidenceItems = dedupeList(groundDrafts.flatMap((draft) => draft.evidenceItems));

  const noticeExplanationParagraphs = dedupeParagraphs([
    groundsLeadParagraph,
    tenancyOverview,
    ...groundDrafts.flatMap((draft) => draft.noticeParagraphs),
    ...groundsBridgeParagraphs,
    buildNoticeTimelineSentence(data),
    userNarrative && !isThinEnglandNarrative(userNarrative) ? userNarrative : '',
    userNarrative && isThinEnglandNarrative(userNarrative) ? `Additional case detail supplied by the landlord: ${userNarrative}` : '',
  ]);

  const n119ReasonParagraphs = dedupeParagraphs([
    groundsLeadParagraph,
    tenancyOverview,
    ...groundDrafts.flatMap((draft) => draft.noticeParagraphs),
    ...groundsBridgeParagraphs,
    buildNoticeTimelineSentence(data),
  ]);

  const n119OtherBreachParagraphs = dedupeParagraphs(
    groundDrafts
      .filter((draft) => !['8', '10', '11'].includes(draft.code))
      .flatMap((draft) => draft.noticeParagraphs),
  );
  const coverLetter = buildCoverLetterSection({
    data,
    groundCodes,
    groundsLeadParagraph,
  });
  const evidenceChecklist = buildEvidenceChecklistSection({
    data,
    groundCodes,
    groundsLeadParagraph,
    groundDrafts,
  });
  const courtFilingGuide = buildCourtFilingGuideSection({
    data,
    groundCodes,
    groundsLeadParagraph,
    groundDrafts,
    evidenceItems,
  });
  const roadmap = buildRoadmapSection({
    data,
    groundCodes,
    groundsLeadParagraph,
    groundDrafts,
  });
  const previewSummary = buildPreviewSummarySection({
    data,
    groundsLeadParagraph,
    noticeExplanationParagraphs,
    preActionParagraphs,
  });

  return {
    groundCodes,
    groundLabels,
    groundsLeadParagraph,
    groundsBridgeParagraphs,
    noticeExplanationParagraphs,
    n119ReasonParagraphs,
    n119OtherBreachParagraphs:
      n119OtherBreachParagraphs.length > 0
        ? n119OtherBreachParagraphs
        : ['No separate non-arrears breach particulars are relied on beyond the pleaded grounds and the supporting documents.'],
    n119StepsParagraphs: preActionParagraphs,
    n119DefendantCircumstancesParagraphs: defendantCircumstancesParagraphs,
    n119FinancialParagraphs: financialParagraphs,
    caseSummary: {
      narrativeParagraphs: noticeExplanationParagraphs,
      stepsParagraphs: preActionParagraphs,
      defendantCircumstancesParagraphs,
      financialParagraphs,
    },
    coverLetter,
    evidenceChecklist,
    courtFilingGuide,
    roadmap,
    previewSummary,
      proofOfService: {
        recordParagraphs: dedupeParagraphs([
          `Keep the served copy of the ${ENGLAND_SECTION8_NOTICE_NAME}, the completed Form N215 certificate of service, and any supporting delivery evidence together in the same file.`,
          groundDrafts.some((draft) => draft.commonReason === 'asb_or_legal_breach')
            ? 'Where service itself may become contentious, preserve contemporaneous notes, any witness details, and copies of all follow-up communications.'
            : '',
        groundDrafts.some((draft) => ['8', '10', '11'].includes(draft.code))
          ? 'If the claim includes arrears grounds, keep the served notice with the rent schedule that was current at the time of service.'
          : '',
      ]),
    },
    serviceInstructions: {
      overviewParagraphs: dedupeParagraphs([
        groundsLeadParagraph,
        buildNoticeTimelineSentence(data),
      ]),
        methodNotes: buildMethodNotes(data),
        evidenceItems: dedupeList(['Served copy of the notice', 'Completed Form N215 certificate of service', ...evidenceItems]),
      afterServiceItems: dedupeList([
        'Record immediately when, where, and how service was carried out.',
        'Keep the notice timeline consistent across the proof of service, witness statement, and court forms.',
        groundCodes.some((code) => ['8', '10', '11'].includes(code))
          ? 'Update the arrears schedule to the latest practicable date before issuing proceedings or attending any hearing.'
          : 'Retain the supporting documents that explain why the statutory ground remains factually justified at issue and at hearing.',
      ]),
      commonMistakes: dedupeList([
        'Using one service date on the notice and a different date in the support documents.',
        'Leaving unsupported allegations in the pack without the document or witness material needed to prove them.',
        groundCodes.some((code) => ['8', '10', '11'].includes(code))
          ? 'Relying on a stale arrears figure or an outdated payment schedule.'
          : 'Serving a notice that states the statutory ground but does not clearly set out the tenancy-specific facts relied on.',
      ]),
    },
    validityChecklist: {
      overviewParagraphs: dedupeParagraphs([
        groundsLeadParagraph,
        buildNoticeTimelineSentence(data),
      ]),
        serviceEvidenceItems: dedupeList(['Copy of the served notice', 'Completed Form N215 certificate of service or service witness note', ...buildMethodNotes(data)]),
      validityItems: dedupeList([
        `Check that the same party names, address, grounds, court name, and notice timeline appear consistently across the ${ENGLAND_SECTION8_NOTICE_NAME}, the support documents, and any court forms.`,
        ...groundDrafts.flatMap((draft) => (draft.hearingWarnings.length > 0 ? draft.hearingWarnings : [])),
        groundCodes.some((code) => ['8', '10', '11'].includes(code))
          ? 'If arrears grounds are relied on, make sure the arrears schedule and the pleaded figures still match the current rent account.'
          : '',
      ]),
      afterServiceItems: dedupeList([
        'Review the pack as a whole before issue so that dates, court details, and ground wording remain aligned.',
        'Remove empty or unused sections rather than leaving placeholder text or blank visual gaps in court-facing documents.',
      ]),
      riskParagraphs: dedupeParagraphs(groundDrafts.flatMap((draft) => draft.riskParagraphs)),
    },
    hearingChecklist: {
      overviewParagraphs: dedupeParagraphs([groundsLeadParagraph, buildNoticeTimelineSentence(data)]),
      beforeItems: dedupeList([
        'Review the notice, service record, witness statement, and bundle index together so the pack remains internally consistent.',
        groundCodes.some((code) => ['8', '10', '11'].includes(code))
          ? 'Update the arrears schedule and check that the figure to be stated to the judge matches the latest rent account.'
          : 'Check that the witness statement and exhibits still describe the pleaded ground accurately as at the hearing date.',
        'Check whether the tenant has filed a defence, witness statement, or counterclaim and identify the documents that answer it.',
      ]),
      documentItems: dedupeList(['Indexed court bundle', 'Original tenancy agreement', ENGLAND_SECTION8_NOTICE_NAME, 'Proof of service evidence', ...evidenceItems]),
      atHearingItems: dedupeList([
        'Keep submissions short, factual, and tied to the pleaded ground or grounds.',
        groundCodes.some((code) => ['8', '10', '11'].includes(code))
          ? 'Explain the current arrears position, the rent cadence, and the documents supporting the running balance.'
          : 'Explain why the statutory ground is made out on the facts and where the supporting evidence appears in the bundle.',
        'Be ready to identify what you accept, what you dispute, and which exhibit addresses the point.',
      ]),
      contingencyItems: dedupeList([
        'If the tenant raises disrepair, set-off, or a counterclaim, keep the response anchored to the pleadings and documents.',
        groundCodes.some((code) => ['8', '10', '11'].includes(code))
          ? 'If a payment is made shortly before the hearing, update the figures immediately and reconsider the effect on any mandatory arrears ground.'
          : 'If the tenant challenges the factual basis of the ground, identify the most direct witness or documentary material supporting the allegation.',
      ]),
      warningParagraphs: dedupeParagraphs(groundDrafts.flatMap((draft) => draft.hearingWarnings)),
    },
    bundleIndex: {
      overviewParagraphs: dedupeParagraphs([
        groundsLeadParagraph,
        'Arrange the bundle so that the notice, service evidence, and ground-specific supporting documents can be followed without the reader having to infer missing steps.',
      ]),
      sectionTitle: deriveBundleSectionTitle(groundDrafts),
      groundRows: dedupeRows(groundDrafts.flatMap((draft) => draft.bundleRows)),
      preparationItems: dedupeList([
        'Paginate the bundle consistently and update the exhibit references if documents are added or removed.',
        'Keep the court-facing bundle free from unused sections, stray technical notes, and irrelevant material.',
      ]),
    },
    witness: {
      groundsParagraphs: dedupeParagraphs([
        groundsLeadParagraph,
        ...groundDrafts.flatMap((draft) => draft.witnessParagraphs),
        ...groundsBridgeParagraphs,
        buildNoticeTimelineSentence(data),
      ]),
      rentArrearsParagraphs: dedupeParagraphs(
        groundDrafts
          .filter((draft) => ['8', '10', '11'].includes(draft.code))
          .flatMap((draft) => draft.witnessParagraphs),
      ),
        conductParagraphs: dedupeParagraphs(groundDrafts.flatMap((draft) => draft.conductParagraphs)),
        evidenceParagraphs: buildWitnessEvidenceParagraphs(groundDrafts),
        evidenceItems,
        timelineItems: dedupeList([
          formatLongDate(getFirstValue(data, 'tenancy_start_date', 'tenancy.start_date'))
            ? `Tenancy start: ${formatLongDate(getFirstValue(data, 'tenancy_start_date', 'tenancy.start_date'))}`
            : '',
          ...chronology.timelineItems,
          ...groundDrafts.flatMap((draft) => draft.timelineItems),
          buildNoticeTimelineSentence(data),
        ]),
      conclusionParagraphs: financialParagraphs,
    },
    groundDrafts,
  };
}

export function buildEnglandForm3AExplanation(data: DraftingInput): string {
  return buildEnglandPossessionDraftingModel(data).noticeExplanationParagraphs.join('\n\n');
}

export function buildN119ReasonForPossessionText(data: DraftingInput): string {
  return buildEnglandPossessionDraftingModel(data).n119ReasonParagraphs.join(' ');
}

export function buildN119OtherBreachDetailsText(data: DraftingInput): string {
  const explicit = String(data.other_breach_details || '').trim();
  if (explicit) return explicit;

  return buildEnglandPossessionDraftingModel(data).n119OtherBreachParagraphs.join(' ');
}

export function buildN119StatutoryGroundsText(data: DraftingInput): string {
  const grounds = extractGroundCodes(data);
  if (grounds.length === 0) return '';

  const groundsText = grounds
    .map((code) => {
      const definition = getEnglandGroundDefinition(code);
      if (!definition) return `Ground ${code}, Schedule 2, Housing Act 1988`;
      return `Ground ${code}, Schedule 2, Housing Act 1988 (${definition.title}; ${definition.mandatory ? 'mandatory' : 'discretionary'})`;
    })
    .join('; ');

  return `The claimant relies on the following statutory grounds for possession: ${groundsText}.`;
}

export function buildN119StepsTakenText(data: DraftingInput): string {
  return buildEnglandPossessionDraftingModel(data).n119StepsParagraphs.join('\n');
}

export function buildN119DefendantCircumstancesText(data: DraftingInput): string {
  return buildEnglandPossessionDraftingModel(data).n119DefendantCircumstancesParagraphs.join(' ');
}

export function buildN119FinancialInfoText(data: DraftingInput): string {
  return buildEnglandPossessionDraftingModel(data).n119FinancialParagraphs.join(' ');
}
