import { getGround8Threshold } from '@/lib/grounds/ground8-threshold';
import {
  getEnglandGroundDefinition,
  normalizeEnglandGroundCode,
  type EnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';

type DraftingInput = Record<string, any>;

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value: unknown): string {
  return `£${toNumber(value).toFixed(2)}`;
}

function formatCurrencyText(value: unknown): string {
  return `GBP ${toNumber(value).toFixed(2)}`;
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
    .filter(Boolean);
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

function describeArrearsPeriods(data: DraftingInput): string {
  const items = Array.isArray(data.arrears_items) ? data.arrears_items : [];
  if (items.length === 0) return '';

  const firstStart = items[0]?.period_start ? formatLongDate(items[0].period_start) : '';
  const lastEnd = items[items.length - 1]?.period_end
    ? formatLongDate(items[items.length - 1].period_end)
    : '';

  const missedPayments = items.filter((item) => toNumber(item?.rent_paid) <= 0 && toNumber(item?.amount_owed) > 0).length;
  const partPayments = items.filter((item) => toNumber(item?.rent_paid) > 0 && toNumber(item?.amount_owed) > 0).length;
  const periodRange =
    firstStart && lastEnd ? `between ${firstStart} and ${lastEnd}` : '';
  const periodCount = items.length;

  const summaryBits = [
    periodCount > 0 ? `${periodCount} rental period${periodCount === 1 ? '' : 's'}` : '',
    periodRange,
    missedPayments > 0 ? `${missedPayments} missed payment${missedPayments === 1 ? '' : 's'}` : '',
    partPayments > 0 ? `${partPayments} part payment${partPayments === 1 ? '' : 's'}` : '',
  ].filter(Boolean);

  return summaryBits.length > 0 ? summaryBits.join(', ') : '';
}

function buildRentCaseOverview(data: DraftingInput): string {
  const rentAmount = toNumber(data.rent_amount);
  const frequency = describeRentFrequency(data.rent_frequency);
  const tenancyStart = formatLongDate(data.tenancy_start_date);
  const paymentDay = Number.parseInt(String(data.payment_day || data.rent_due_day || ''), 10);
  const paymentText = Number.isFinite(paymentDay)
    ? ` on day ${paymentDay} of each rental period`
    : '';

  const overviewParts = [
    tenancyStart ? `The tenancy began on ${tenancyStart}.` : '',
    rentAmount > 0 ? `The contractual rent is ${formatCurrencyText(rentAmount)} payable ${frequency}${paymentText}.` : '',
  ].filter(Boolean);

  return overviewParts.join(' ');
}

function buildGroundNarrative(code: EnglandGroundCode, data: DraftingInput): string {
  const definition = getEnglandGroundDefinition(code);
  const noticeDate = formatLongDate(data.notice_served_date || data.section_8_notice_date);
  const rentAmount = toNumber(data.rent_amount);
  const totalArrears = toNumber(data.total_arrears || data.arrears_at_notice_date || data.current_arrears);
  const arrearsPeriods = describeArrearsPeriods(data);

  switch (code) {
    case '1A': {
      const tenancyStart = formatLongDate(data.tenancy_start_date);
      const base = [
        'Ground 1A is relied on because the claimant intends to sell the dwelling-house on the open market after vacant possession is recovered.',
        tenancyStart ? `The tenancy began on ${tenancyStart} and the landlord should retain sale evidence, such as valuation or marketing instructions, for the hearing.` : '',
      ].filter(Boolean);
      return base.join(' ');
    }

    case '8': {
      const threshold =
        rentAmount > 0
          ? getGround8Threshold(rentAmount, (data.rent_frequency || 'monthly') as any)
          : null;

      return [
        'Ground 8 is relied on as the mandatory serious rent arrears ground.',
        noticeDate && totalArrears > 0
          ? `At the date of service of the Form 3 notice on ${noticeDate}, the arrears were ${formatCurrencyText(totalArrears)}.`
          : '',
        threshold && threshold.amount > 0
          ? `That exceeded the Ground 8 threshold of ${formatCurrencyText(threshold.amount)} (${threshold.description}).`
          : '',
        arrearsPeriods ? `The attached arrears schedule identifies ${arrearsPeriods}.` : 'The attached arrears schedule identifies each missed or short-paid period.',
      ]
        .filter(Boolean)
        .join(' ');
    }

    case '10':
      return [
        'Ground 10 is relied on because rent lawfully due remained unpaid when the notice was served and remains relevant to the possession claim.',
        totalArrears > 0 ? `The arrears balance relied on is ${formatCurrencyText(totalArrears)}.` : '',
      ]
        .filter(Boolean)
        .join(' ');

    case '11':
      return [
        'Ground 11 is relied on because the rent account shows persistent delay in paying rent lawfully due.',
        arrearsPeriods
          ? `The payment history shows arrears across ${arrearsPeriods}.`
          : 'The claimant relies on the rent schedule to show repeated late and missed payments.',
      ]
        .filter(Boolean)
        .join(' ');

    default: {
      const title = definition?.title ? ` (${definition.title})` : '';
      return `Ground ${code}${title} is relied on and the claimant will rely on the evidence gathered for that ground at the hearing.`;
    }
  }
}

function buildSharedNarrativeParagraphs(data: DraftingInput): string[] {
  const grounds = extractGroundCodes(data);
  const overview = buildRentCaseOverview(data);
  const userNarrative = extractNarrativeCandidates(data).find(Boolean) || '';

  const paragraphs: string[] = [];

  if (overview) {
    paragraphs.push(overview);
  }

  grounds.forEach((code) => {
    paragraphs.push(buildGroundNarrative(code, data));
  });

  if (userNarrative && !isThinEnglandNarrative(userNarrative)) {
    paragraphs.push(userNarrative);
  }

  if (userNarrative && isThinEnglandNarrative(userNarrative)) {
    paragraphs.push(`Additional case detail supplied by the landlord: ${userNarrative}`);
  }

  return dedupeParagraphs(paragraphs);
}

function buildForm3NoticeSentence(data: DraftingInput): string {
  const noticeDate = formatLongDate(data.notice_served_date || data.section_8_notice_date);
  return noticeDate ? `The Form 3 notice was served on ${noticeDate}.` : '';
}

export function buildEnglandForm3AExplanation(data: DraftingInput): string {
  return buildSharedNarrativeParagraphs(data).join('\n\n');
}

export function buildN119ReasonForPossessionText(data: DraftingInput): string {
  const grounds = extractGroundCodes(data);
  const paragraphs = dedupeParagraphs([
    ...buildSharedNarrativeParagraphs(data),
    buildForm3NoticeSentence(data),
  ]);

  if (grounds.some((code) => ['8', '10', '11'].includes(code))) {
    return paragraphs.join(' ');
  }

  return paragraphs.slice(0, 2).join(' ');
}

export function buildN119OtherBreachDetailsText(data: DraftingInput): string {
  const explicit = String(data.other_breach_details || '').trim();
  if (explicit) return explicit;

  const nonArrearsGrounds = extractGroundCodes(data).filter((code) => !['8', '10', '11'].includes(code));
  if (nonArrearsGrounds.length === 0) {
    return 'No separate breach particulars are relied on beyond the rent arrears grounds and the attached arrears schedule.';
  }

  return nonArrearsGrounds.map((code) => buildGroundNarrative(code, data)).join(' ');
}

export function buildN119StatutoryGroundsText(data: DraftingInput): string {
  const grounds = extractGroundCodes(data);
  if (grounds.length === 0) return '';

  const groundsText = grounds
    .map((code) => {
      const definition = getEnglandGroundDefinition(code);
      if (!definition) return `Ground ${code}, Schedule 2, Housing Act 1988`;
      const groundType = definition.mandatory ? 'mandatory' : 'discretionary';
      return `Ground ${code}, Schedule 2, Housing Act 1988 (${definition.title}; ${groundType})`;
    })
    .join('; ');

  return `The claimant relies on the following statutory grounds for possession: ${groundsText}.`;
}

export function buildN119StepsTakenText(data: DraftingInput): string {
  const recordedSteps = Array.isArray(data.preActionSteps) ? data.preActionSteps : [];
  const lines = recordedSteps
    .filter((step) => step?.date && step?.description)
    .map((step) => `${formatLongDate(step.date)}: ${String(step.description).trim()}`)
    .filter(Boolean);
  const noticeSentence = buildForm3NoticeSentence(data);
  const recordedNoticeStep = lines.some((line) => /\bform 3\b|\bnotice\b/i.test(line));

  if (lines.length > 0) {
    return [...lines, !recordedNoticeStep ? noticeSentence : '']
      .filter(Boolean)
      .join('\n');
  }

  const arrearsScheduleReference = Array.isArray(data.arrears_items) && data.arrears_items.length > 0
    ? ' The claimant has maintained a rent account and arrears schedule.'
    : '';

  return [
    'The claimant has sought payment of the arrears and kept the tenancy rent account under review.',
    arrearsScheduleReference.trim(),
    noticeSentence ? noticeSentence.replace('was served', 'was then served').replace(/\.$/, ' when the arrears remained unresolved.') : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildN119DefendantCircumstancesText(data: DraftingInput): string {
  const details = [
    data.tenant_vulnerability_details,
    data.vulnerability_details,
    data.known_tenant_defences,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  const benefitsDetails = [data.benefit_type, data.tenant_benefits_details]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  if (details.length > 0 || benefitsDetails.length > 0) {
    const parts: string[] = [];
    if (details.length > 0) {
      parts.push(`Known defendant circumstances: ${details.join(' ')}`);
    }
    if (benefitsDetails.length > 0) {
      parts.push(`Benefit information disclosed to the claimant: ${benefitsDetails.join(', ')}.`);
    }
    return parts.join(' ');
  }

  return "The claimant is not aware of any further information about the defendant's circumstances beyond the facts set out in these particulars and any information the defendant may provide to the court.";
}

export function buildN119FinancialInfoText(data: DraftingInput): string {
  const totalArrears = toNumber(data.total_arrears || data.arrears_at_notice_date || data.current_arrears);
  const rentAmount = toNumber(data.rent_amount);
  const frequency = describeRentFrequency(data.rent_frequency);
  const noticeSentence = buildForm3NoticeSentence(data);

  const parts = [
    totalArrears > 0
      ? `The claimant seeks possession and, if the court thinks fit, judgment for rent arrears currently quantified at ${formatCurrencyText(totalArrears)}.`
      : 'The claimant seeks possession and any costs the court considers appropriate.',
    rentAmount > 0 ? `The contractual rent is ${formatCurrencyText(rentAmount)} payable ${frequency}.` : '',
    noticeSentence,
    'The claimant also seeks the fixed issue fee and any further costs or use and occupation sums the court allows.',
  ].filter(Boolean);

  return parts.join(' ');
}
