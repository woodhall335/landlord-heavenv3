import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions/types';

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
