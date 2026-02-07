import type { TenancyFacts } from '@/lib/case-facts/schema';

export interface Ground8Threshold {
  amount: number;
  description: string;
}

const normalizeFrequency = (frequency: TenancyFacts['rent_frequency']): NonNullable<TenancyFacts['rent_frequency']> =>
  (frequency || 'monthly') as NonNullable<TenancyFacts['rent_frequency']>;

export function getGround8Threshold(
  rentAmount: number,
  rentFrequency: TenancyFacts['rent_frequency']
): Ground8Threshold {
  const frequency = normalizeFrequency(rentFrequency);
  const baseAmount = rentAmount || 0;

  switch (frequency) {
    case 'weekly':
      return { amount: baseAmount * 8, description: '8 weeks' };
    case 'fortnightly':
      return { amount: baseAmount * 4, description: '8 weeks (4 fortnightly payments)' };
    case 'monthly':
      return { amount: baseAmount * 2, description: '2 months' };
    case 'quarterly':
      return { amount: baseAmount * 1, description: '1 quarter' };
    case 'yearly':
      return { amount: baseAmount / 4, description: '3 months' };
    case 'other':
    default:
      return { amount: baseAmount * 2, description: '2 months' };
  }
}

export function isGround8Eligible(params: {
  arrearsTotal: number;
  rentAmount: number;
  rentFrequency: TenancyFacts['rent_frequency'];
}): boolean {
  const { arrearsTotal, rentAmount, rentFrequency } = params;
  const threshold = getGround8Threshold(rentAmount, rentFrequency);

  if (threshold.amount <= 0) {
    return false;
  }

  return arrearsTotal >= threshold.amount;
}
