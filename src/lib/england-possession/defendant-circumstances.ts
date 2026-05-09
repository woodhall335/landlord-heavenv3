type DefendantCircumstancesInput = Record<string, any> | null | undefined;

export const NO_KNOWN_DEFENDANT_CIRCUMSTANCES_TEXT =
  "The claimant is not aware of any further information about the defendant's circumstances beyond the matters set out in the claim papers.";

const BENEFIT_NO_DETAILS_TEXT =
  'The claimant understands that the defendant may say rent arrears were affected by benefit payment issues. The claimant will rely on the rent account and correspondence in the bundle.';

const PAYMENT_PLAN_NO_RESPONSE_TEXT =
  'The claimant offered the defendant the opportunity to discuss payment by instalments, but no agreement was reached.';

const EMPTY_VALUE_PATTERN =
  /^(?:none|n\/a|na|not applicable|not known|unknown|no|false|null|undefined)$/i;

const INSTRUCTIONAL_PATTERNS = [
  /\bthe landlord should provide\b/i,
  /\byou should add\b/i,
  /\bplease specify\b/i,
  /\bthis note should\b/i,
  /\bthe claimant should\b/i,
  /\bclaimant should\b/i,
  /\bshould exhibit\b/i,
  /\bshould keep\b/i,
  /\bdetails to be confirmed\b/i,
  /\bto be confirmed in the bundle\b/i,
  /\bto be confirmed in the claim bundle\b/i,
];

const BENEFIT_SELECTED_VALUES = new Set([
  'benefit',
  'benefits',
  'housing benefit',
  'housing_benefit',
  'universal credit',
  'universal_credit',
  'uc',
  'dwp',
  'other benefit',
  'other benefits',
  'other_benefit',
  'other_benefits',
]);

const BENEFIT_UNSELECTED_VALUES = new Set([
  '',
  'none',
  'no',
  'false',
  'not applicable',
  'not known',
  'unknown',
]);

function getNestedValue(source: DefendantCircumstancesInput, path: string): any {
  if (!source || typeof source !== 'object') return undefined;
  return path.split('.').reduce<any>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return current[key];
  }, source);
}

function firstValue(source: DefendantCircumstancesInput, paths: string[]): any {
  for (const path of paths) {
    const value = getNestedValue(source, path);
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function coerceText(value: any): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(coerceText).map((entry) => entry.trim()).filter(Boolean).join('; ');
  }
  if (typeof value === 'object') {
    const fields = ['summary', 'details', 'description', 'text', 'value', 'label', 'response', 'notes'];
    return fields.map((field) => coerceText(value[field])).map((entry) => entry.trim()).filter(Boolean).join('; ');
  }
  return '';
}

function normaliseForComparison(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanCaseText(value: any): string {
  let text = coerceText(value)
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text || EMPTY_VALUE_PATTERN.test(text)) return '';

  text = text
    .replace(/\binstallements\b/gi, 'instalments')
    .replace(/\binstallments\b/gi, 'instalments')
    .replace(/\binstallment\b/gi, 'instalment')
    .replace(/\bdidn(?:['\u2019])?t\b/gi, 'did not')
    .replace(/\bD\.W\.P\.\b/gi, 'DWP')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = text.match(/[^.!?]+[.!?]?/g) || [text];
  const cleanedSentences = sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => !INSTRUCTIONAL_PATTERNS.some((pattern) => pattern.test(sentence)));

  return dedupeTextFragments(cleanedSentences).join(' ').replace(/\s+/g, ' ').trim();
}

function dedupeTextFragments(entries: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of entries) {
    const clean = entry.trim();
    if (!clean) continue;
    const key = normaliseForComparison(clean);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }

  return result;
}

function appendPeriod(value: string): string {
  const clean = value.trim();
  if (!clean) return '';
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function asBoolean(value: any): boolean | null {
  if (value === true || value === false) return value;
  const clean = normaliseForComparison(coerceText(value));
  if (['true', 'yes', 'y', '1', 'offered', 'selected'].includes(clean)) return true;
  if (['false', 'no', 'n', '0', 'none', 'not applicable'].includes(clean)) return false;
  return null;
}

function collectCleanTexts(source: DefendantCircumstancesInput, paths: string[]): string[] {
  return dedupeTextFragments(paths.map((path) => cleanCaseText(getNestedValue(source, path))).filter(Boolean));
}

function isBenefitTypeOnly(value: string): boolean {
  const clean = normaliseForComparison(value).replace(/\s+/g, '_');
  return BENEFIT_SELECTED_VALUES.has(clean) || BENEFIT_SELECTED_VALUES.has(clean.replace(/_/g, ' '));
}

function isBenefitSelected(source: DefendantCircumstancesInput, benefitType: string, benefitDetails: string[]): boolean {
  const benefitDelayFlag = asBoolean(firstValue(source, ['benefit_delays', 'benefits_delayed', 'benefit_delay_selected']));
  if (benefitDelayFlag === true) return true;
  if (benefitDetails.length > 0) return true;

  const cleanType = normaliseForComparison(benefitType);
  if (BENEFIT_UNSELECTED_VALUES.has(cleanType)) return false;
  return cleanType.length > 0;
}

function isAlreadyCovered(paragraphs: string[], detail: string): boolean {
  const cleanDetail = normaliseForComparison(detail);
  if (!cleanDetail) return true;

  return paragraphs.some((paragraph) => {
    const cleanParagraph = normaliseForComparison(paragraph);
    return cleanParagraph.includes(cleanDetail) || cleanDetail.includes(cleanParagraph);
  });
}

function addRawParagraph(paragraphs: string[], paragraph: string): void {
  const clean = appendPeriod(paragraph.replace(/\s+/g, ' ').trim());
  if (!clean) return;
  if (isAlreadyCovered(paragraphs, clean)) return;
  paragraphs.push(clean);
}

function buildBenefitParagraphs(source: DefendantCircumstancesInput, existingParagraphs: string[]): string[] {
  const benefitType = cleanCaseText(firstValue(source, ['benefit_type', 'benefits_type']));
  const detailPaths = [
    'tenant_benefits_details',
    'benefit_delay_details',
    'benefits_delay_details',
    'benefit_payment_details',
    'universal_credit_details',
    'dwp_details',
  ];
  const details = collectCleanTexts(source, detailPaths);

  if (benefitType && !isBenefitTypeOnly(benefitType)) {
    details.push(benefitType);
  }

  const uniqueDetails = dedupeTextFragments(details);
  if (!isBenefitSelected(source, benefitType, uniqueDetails)) return [];

  if (uniqueDetails.length === 0) {
    return [BENEFIT_NO_DETAILS_TEXT];
  }

  const detailsText = uniqueDetails.join(' ');
  if (isAlreadyCovered(existingParagraphs, detailsText)) return [];

  return [
    `The claimant understands that benefit or Universal Credit payment issues are said to have affected the arrears. The details provided to the claimant are: ${appendPeriod(detailsText)}`,
  ];
}

export function buildCompletePackDefendantCircumstancesParagraphs(
  source: DefendantCircumstancesInput,
): string[] {
  const paragraphs: string[] = [];

  const explicitCircumstances = collectCleanTexts(source, [
    'defendant_circumstances',
    'defendant_circumstances_details',
    'defendant_known_circumstances',
  ]);
  if (explicitCircumstances.length > 0) {
    addRawParagraph(
      paragraphs,
      `The claimant understands the defendant's circumstances to be as follows: ${appendPeriod(explicitCircumstances.join(' '))}`,
    );
  }

  const vulnerabilityDetails = collectCleanTexts(source, [
    'tenant_vulnerability_details',
    'risk.tenant_vulnerability_details',
    'vulnerability_details',
  ]);
  if (vulnerabilityDetails.length > 0) {
    addRawParagraph(
      paragraphs,
      `The claimant is aware of the following information about the defendant's vulnerability or support needs: ${appendPeriod(vulnerabilityDetails.join(' '))}`,
    );
  } else if (asBoolean(firstValue(source, ['tenant_vulnerability', 'risk.tenant_vulnerability'])) === true) {
    addRawParagraph(
      paragraphs,
      'The claimant is aware that the defendant may say personal circumstances are relevant, but no further details have been provided to the claimant.',
    );
  }

  const knownDefences = cleanCaseText(firstValue(source, ['known_tenant_defences', 'risk.known_tenant_defences']));
  if (knownDefences) {
    addRawParagraph(
      paragraphs,
      `The claimant understands that the defendant may rely on the following defence or dispute points: ${appendPeriod(knownDefences)}`,
    );
  }

  const disrepairDetails = cleanCaseText(firstValue(source, ['disrepair_issues_list', 'risk.disrepair_issues_list']));
  const disrepairDate = cleanCaseText(firstValue(source, ['disrepair_complaint_date', 'risk.disrepair_complaint_date']));
  if (asBoolean(firstValue(source, ['disrepair_complaints', 'risk.disrepair_complaints'])) === true) {
    addRawParagraph(
      paragraphs,
      disrepairDetails
        ? `The claimant understands that the defendant has raised disrepair issues${disrepairDate ? ` on or around ${disrepairDate}` : ''}: ${appendPeriod(disrepairDetails)}`
        : 'The claimant understands that the defendant may raise disrepair issues, but no further details have been provided to the claimant.',
    );
  }

  const previousProceedings = cleanCaseText(
    firstValue(source, ['previous_proceedings_details', 'risk.previous_proceedings_details']),
  );
  if (asBoolean(firstValue(source, ['previous_court_proceedings', 'risk.previous_court_proceedings'])) === true) {
    addRawParagraph(
      paragraphs,
      previousProceedings
        ? `There have been previous proceedings or formal litigation steps relating to this tenancy: ${appendPeriod(previousProceedings)}`
        : 'The claimant is aware that there have been previous proceedings or formal litigation steps relating to this tenancy, but no further details have been provided to the claimant.',
    );
  }

  for (const paragraph of buildBenefitParagraphs(source, paragraphs)) {
    addRawParagraph(paragraphs, paragraph);
  }

  const paymentPlanResponse = cleanCaseText(firstValue(source, ['payment_plan_response', 'risk.payment_plan_response']));
  const paymentPlanOffered = asBoolean(firstValue(source, ['payment_plan_offered', 'risk.payment_plan_offered']));
  if (paymentPlanOffered === true || paymentPlanResponse) {
    addRawParagraph(
      paragraphs,
      paymentPlanResponse
        ? `The claimant offered the defendant the opportunity to discuss payment by instalments. The recorded outcome was: ${appendPeriod(paymentPlanResponse)}`
        : PAYMENT_PLAN_NO_RESPONSE_TEXT,
    );
  }

  const counterclaimGrounds = collectCleanTexts(source, ['counterclaim_grounds', 'risk.counterclaim_grounds']);
  if (asBoolean(firstValue(source, ['tenant_counterclaim_likely', 'risk.tenant_counterclaim_likely'])) === true) {
    addRawParagraph(
      paragraphs,
      counterclaimGrounds.length > 0
        ? `The claimant understands that the defendant may raise a counterclaim or set-off on the following issues: ${appendPeriod(counterclaimGrounds.join('; '))}`
        : 'The claimant understands that the defendant may raise a counterclaim or set-off, but no further details have been provided to the claimant.',
    );
  }

  const cleanParagraphs = dedupeTextFragments(paragraphs);
  return cleanParagraphs.length > 0 ? cleanParagraphs : [NO_KNOWN_DEFENDANT_CIRCUMSTANCES_TEXT];
}

export function buildCompletePackDefendantCircumstancesText(
  source: DefendantCircumstancesInput,
): string {
  return buildCompletePackDefendantCircumstancesParagraphs(source).join(' ');
}
