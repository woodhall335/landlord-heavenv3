import type { ArrearsBand, MonthsInArrearsBand, StageEstimate } from '@/lib/journey/state';

export function bucketArrears(amount: number): ArrearsBand {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  if (safeAmount >= 4000) return '4000+';
  if (safeAmount >= 2000) return '2000-3999';
  if (safeAmount >= 1000) return '1000-1999';
  if (safeAmount >= 500) return '500-999';
  return '0-499';
}

export function bucketMonthsInArrears(arrears: number, rent: number): MonthsInArrearsBand {
  const safeArrears = Number.isFinite(arrears) ? Math.max(0, arrears) : 0;
  const safeRent = Number.isFinite(rent) ? rent : 0;

  if (safeRent <= 0) {
    return safeArrears >= 3 ? '3+' : '<1';
  }

  const months = safeArrears / safeRent;

  if (months >= 3) return '3+';
  if (months >= 2) return '2-2.9';
  if (months >= 1) return '1-1.9';
  return '<1';
}

interface ToolDerivedMetrics {
  months_in_arrears_band?: MonthsInArrearsBand;
  arrears_band?: ArrearsBand;
}

export function inferStageFromToolCompletion(
  toolName: string,
  derivedMetrics: ToolDerivedMetrics = {},
): StageEstimate {
  const normalized = toolName.toLowerCase();

  if (normalized === 'free_rent_demand_letter') {
    return 'demand_sent';
  }

  if (normalized === 'rent_arrears_calculator') {
    if (derivedMetrics.months_in_arrears_band === '3+' || derivedMetrics.arrears_band === '4000+') {
      return 'court_ready';
    }

    if (derivedMetrics.months_in_arrears_band === '2-2.9') {
      return 'notice_ready';
    }

    return 'early_arrears';
  }

  return 'unknown';
}

const STAGE_KEYWORDS: Array<{ stage: StageEstimate; keywords: string[] }> = [
  {
    stage: 'court_ready',
    keywords: ['n5', 'n5b', 'possession claim', 'county court', 'hearing', 'bailiff', 'warrant'],
  },
  {
    stage: 'notice_ready',
    keywords: ['section 8', 'section 21', 'serve notice', 'form 6a', 'notice to leave', 'proof of service'],
  },
  {
    stage: 'demand_sent',
    keywords: ['letter before action', 'demand letter', 'arrears letter', 'final demand'],
  },
  {
    stage: 'early_arrears',
    keywords: ['late rent', 'rent arrears', 'missed rent', 'payment plan'],
  },
];

export function inferStageFromAskHeaven(queryOrTopicHint: string | null | undefined): StageEstimate {
  if (!queryOrTopicHint) return 'unknown';
  const normalized = queryOrTopicHint.toLowerCase();

  for (const group of STAGE_KEYWORDS) {
    if (group.keywords.some((keyword) => normalized.includes(keyword))) {
      return group.stage;
    }
  }

  return 'unknown';
}
