import type { Section13State } from '@/lib/section13/types';
import { calculateDepositCap } from '@/lib/validation/mqs-field-validator';

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function isMoneyClaimClaimStatementSectionComplete(facts: Record<string, any>): boolean {
  const basisOfClaim = facts.money_claim?.basis_of_claim;
  const hasBasisOfClaim = typeof basisOfClaim === 'string' && basisOfClaim.trim().length > 0;
  const jurisdiction = facts.__meta?.jurisdiction;
  const isEnglandWales = jurisdiction === 'england' || jurisdiction === 'wales';

  if (isEnglandWales) {
    const interestDecided =
      facts.money_claim?.charge_interest === true || facts.money_claim?.charge_interest === false;
    return interestDecided && hasBasisOfClaim;
  }

  return hasBasisOfClaim;
}

export function isSection13ProposalStepComplete(state: Section13State): boolean {
  const hasServiceMethod = Boolean(state.proposal.serviceMethod);
  const hasOtherServiceMethodDetail =
    state.proposal.serviceMethod !== 'other' ||
    Boolean(state.proposal.serviceMethodOther?.trim());

  return (
    state.proposal.proposedRentAmount != null &&
    Boolean(state.proposal.serviceDate) &&
    Boolean(state.proposal.proposedStartDate) &&
    hasServiceMethod &&
    hasOtherServiceMethodDetail
  );
}

export function hasPositiveDepositAmount(facts: Record<string, any>): boolean {
  const numeric = toFiniteNumber(facts.deposit_amount);
  return numeric !== undefined && numeric > 0;
}

export function isTenancyDepositSectionComplete(facts: Record<string, any>): boolean {
  const depositAmount = toFiniteNumber(facts.deposit_amount);
  if (depositAmount === undefined || depositAmount < 0) return false;

  if (depositAmount === 0) {
    return true;
  }

  if (!facts.deposit_scheme_name) {
    return false;
  }

  if (facts.__meta?.jurisdiction !== 'england') {
    return true;
  }

  const rentAmount = toFiniteNumber(facts.rent_amount);
  const rentFrequency =
    (typeof facts.rent_period === 'string' && facts.rent_period) ||
    (typeof facts.rent_frequency === 'string' && facts.rent_frequency) ||
    'monthly';

  if (rentAmount === undefined) {
    return true;
  }

  const depositCap = calculateDepositCap(rentAmount, rentFrequency, depositAmount);
  return !depositCap?.exceeds;
}
