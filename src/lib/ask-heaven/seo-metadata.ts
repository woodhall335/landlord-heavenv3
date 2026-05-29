import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions/types';

const TOPIC_KEYWORD_MAP: Record<AskHeavenQuestion['primary_topic'], string[]> = {
  eviction: [
    'landlord eviction help',
    'section 8 notice advice',
    'possession claim guidance',
  ],
  arrears: [
    'rent arrears landlord help',
    'recover unpaid rent',
    'tenant not paying rent',
  ],
  deposit: [
    'tenancy deposit rules',
    'landlord deposit dispute',
    'deposit protection guidance',
  ],
  tenancy: [
    'tenancy agreement help',
    'landlord tenancy advice',
    'rental agreement guidance',
  ],
  compliance: [
    'landlord compliance help',
    'rental property compliance',
    'landlord legal obligations',
  ],
  damage_claim: [
    'tenant damage claim',
    'landlord property damage',
    'recover damage costs from tenant',
  ],
  notice_periods: [
    'landlord notice period',
    'eviction notice period',
    'tenant notice rules',
  ],
  court_process: [
    'landlord court process',
    'possession hearing guidance',
    'county court landlord claim',
  ],
  tenant_rights: [
    'tenant rights landlord question',
    'landlord duties to tenant',
    'rental rights guidance',
  ],
  landlord_obligations: [
    'landlord obligations guidance',
    'landlord legal duties',
    'rental compliance obligations',
  ],
  other: [
    'landlord question answer',
    'ask heaven landlord help',
    'uk landlord guidance',
  ],
};

export function truncateAskHeavenMetaTitle(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 20 ? trimmed.slice(0, lastSpace) : trimmed).trim();
}

export function normalizeAskHeavenMetaDescription(
  summary: string,
  question: string,
  jurisdictions: AskHeavenQuestion['jurisdictions']
): string {
  const MIN_LENGTH = 150;
  const MAX_LENGTH = 160;

  const normalizedSummary = summary.replace(/\s+/g, ' ').trim();
  const normalizedQuestion = question.replace(/\s+/g, ' ').trim().replace(/[?!.]+$/, '');
  const jurisdictionLabel = formatAskHeavenJurisdictionsForMeta(jurisdictions);

  if (normalizedSummary.length >= MIN_LENGTH && normalizedSummary.length <= MAX_LENGTH) {
    return normalizedSummary;
  }

  const fragments = [
    normalizedSummary,
    `Landlord guidance for ${jurisdictionLabel}.`,
    'Covers key steps, deadlines, evidence, and common mistakes.',
    normalizedQuestion ? `Topic: ${normalizedQuestion}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (fragments.length > MAX_LENGTH) {
    return truncateToWordBoundary(fragments, MAX_LENGTH);
  }

  if (fragments.length >= MIN_LENGTH) {
    return fragments;
  }

  const padded = `${fragments} Includes practical next steps for UK landlords.`
    .replace(/\s+/g, ' ')
    .trim();

  let finalDescription = padded;
  if (finalDescription.length < MIN_LENGTH) {
    finalDescription = `${finalDescription} Trusted Ask Heaven guidance for landlords.`
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (finalDescription.length > MAX_LENGTH) {
    return truncateToWordBoundary(finalDescription, MAX_LENGTH);
  }

  return finalDescription;
}

export function getAskHeavenSeoTitle(question: AskHeavenQuestion): string {
  return question.seo_title?.trim() || question.question;
}

export function getAskHeavenH1(question: AskHeavenQuestion): string {
  return question.seo_h1?.trim() || question.question;
}

export function buildAskHeavenKeywords(question: AskHeavenQuestion): string[] {
  const explicitKeywords = normalizeKeywordList(question.seo_keywords ?? []);
  if (explicitKeywords.length >= 10) {
    return explicitKeywords.slice(0, 12);
  }

  const jurisdictionLabels = question.jurisdictions.map(formatAskHeavenJurisdiction);
  return normalizeKeywordList([
    ...explicitKeywords,
    question.question,
    question.summary,
    question.primary_topic.replace(/_/g, ' '),
    ...jurisdictionLabels.map((label) => `${label} landlord help`),
    ...jurisdictionLabels.map((label) => `${label} rental law question`),
    ...TOPIC_KEYWORD_MAP[question.primary_topic],
    'Ask Heaven landlord answer',
    'landlord legal guidance UK',
    'landlord next steps',
  ]).slice(0, 12);
}

export function getAskHeavenH2Headings(question: AskHeavenQuestion): string[] {
  const explicitHeadings = normalizeKeywordList(question.seo_h2_headings ?? []);
  if (explicitHeadings.length >= 2) {
    return explicitHeadings.slice(0, 4);
  }

  const topicLabel = question.primary_topic.replace(/_/g, ' ');
  return [
    ...explicitHeadings,
    `What this ${topicLabel} answer covers`,
    'Recommended next steps for landlords',
  ].slice(0, 4);
}

export function formatAskHeavenJurisdiction(jurisdiction: string): string {
  const map: Record<string, string> = {
    england: 'England',
    wales: 'Wales',
    scotland: 'Scotland',
    'northern-ireland': 'N. Ireland',
    'uk-wide': 'UK',
  };
  return map[jurisdiction] || jurisdiction;
}

function formatAskHeavenJurisdictionsForMeta(
  jurisdictions: AskHeavenQuestion['jurisdictions']
): string {
  if (!jurisdictions.length) {
    return 'the UK';
  }

  const labels = Array.from(
    new Set(
      jurisdictions.map((jurisdiction) => {
        if (jurisdiction === 'uk-wide') return 'the UK';
        return formatAskHeavenJurisdiction(jurisdiction);
      })
    )
  );

  if (labels.includes('the UK')) return 'the UK';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function truncateToWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  const candidate = (lastSpace > Math.floor(maxLength * 0.6)
    ? trimmed.slice(0, lastSpace)
    : trimmed
  ).trim();
  return `${candidate.replace(/[.,;:!?-]+$/, '')}.`;
}

function normalizeKeywordList(values: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of values) {
    const keyword = value.replace(/\s+/g, ' ').trim();
    if (!keyword) {
      continue;
    }

    const key = keyword.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(keyword);
  }

  return normalized;
}
