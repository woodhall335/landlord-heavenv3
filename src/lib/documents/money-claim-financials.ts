import { calculateMoneyClaimFee } from '@/lib/court-fees/hmcts-fees';
import {
  getFinalRunningBalance,
  normalizeArrearsEntryRunningBalances,
} from './arrears-schedule-mapper';
import type { ClaimLineItem, MoneyClaimCase } from './money-claim-pack-generator';

export interface MoneyClaimFinancials {
  arrears_total: number;
  damages_total: number;
  other_total: number;
  total_principal: number;
  claim_interest: boolean;
  interest_rate: number | null;
  interest_to_date: number | null;
  daily_interest: number | null;
  interest_days: number | null;
  total_claim_amount: number;
  court_fee: number;
  solicitor_costs: number;
  total_with_fees: number;
}

function roundMoney(value: number): number {
  return Number((Number.isFinite(value) ? value : 0).toFixed(2));
}

function sumLineItems(items?: ClaimLineItem[]): number {
  return (items || []).reduce((total, item) => total + (Number(item.amount) || 0), 0);
}

function calculateInterestDays(startDate?: string): number {
  if (!startDate) return 90;

  const parsed = new Date(`${startDate}${startDate.includes('T') ? '' : 'T00:00:00.000Z'}`);
  if (Number.isNaN(parsed.getTime())) return 90;

  const today = new Date();
  const diffMs = today.getTime() - parsed.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function calculateMoneyClaimFinancials(claim: MoneyClaimCase): MoneyClaimFinancials {
  const normalizedArrearsSchedule = normalizeArrearsEntryRunningBalances(claim.arrears_schedule || []);
  const arrears_total = roundMoney(
    normalizedArrearsSchedule.length > 0
      ? getFinalRunningBalance(normalizedArrearsSchedule)
      : claim.arrears_total || 0
  );
  const damages_total = roundMoney(sumLineItems(claim.damage_items));
  const other_total = roundMoney(sumLineItems(claim.other_charges));
  const total_principal = roundMoney(arrears_total + damages_total + other_total);
  const claimInterest = claim.claim_interest === true;

  let interest_rate: number | null = null;
  let interest_to_date: number | null = null;
  let daily_interest: number | null = null;
  let interest_days: number | null = null;

  if (claimInterest) {
    interest_rate = claim.interest_rate ?? 8;
    daily_interest =
      claim.daily_interest ?? roundMoney((total_principal * (interest_rate / 100)) / 365);
    interest_days = calculateInterestDays(claim.interest_start_date);
    interest_to_date = claim.interest_to_date ?? roundMoney(daily_interest * interest_days);
  }

  const total_claim_amount = roundMoney(total_principal + (interest_to_date ?? 0));
  const court_fee = roundMoney(
    claim.court_fee ?? (total_claim_amount > 0 ? calculateMoneyClaimFee(total_claim_amount) : 0)
  );
  const solicitor_costs = roundMoney(claim.solicitor_costs ?? 0);

  return {
    arrears_total,
    damages_total,
    other_total,
    total_principal,
    claim_interest: claimInterest,
    interest_rate,
    interest_to_date,
    daily_interest,
    interest_days,
    total_claim_amount,
    court_fee,
    solicitor_costs,
    total_with_fees: roundMoney(total_claim_amount + court_fee + solicitor_costs),
  };
}

export function assertMoneyClaimFinancialsReady(
  financials: MoneyClaimFinancials,
  context = 'money claim document generation'
) {
  if (financials.total_principal <= 0) {
    throw new Error(
      `[money-claim] Refusing to generate ${context}: claim principal is £0. ` +
        'Check rent arrears, damage items, and other charges mapping before generating customer documents.'
    );
  }
}

export function buildMoneyClaimFinancialTemplateData(
  claim: MoneyClaimCase,
  financials = calculateMoneyClaimFinancials(claim)
) {
  return {
    ...financials,
    claim_amount: financials.total_claim_amount,
    other_charges_total: financials.other_total,
    interest_daily_rate: financials.daily_interest ?? 0,
    daily_rate: financials.daily_interest ?? 0,
    days_elapsed: financials.interest_days ?? 0,
    interest_amount: financials.interest_to_date ?? 0,
  };
}
