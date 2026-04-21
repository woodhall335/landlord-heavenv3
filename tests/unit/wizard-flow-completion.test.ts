import { describe, expect, it } from 'vitest';

import {
  hasPositiveDepositAmount,
  isMoneyClaimClaimStatementSectionComplete,
  isSection13ProposalStepComplete,
  isTenancyDepositSectionComplete,
} from '@/lib/wizard/flow-completion';
import { createEmptySection13State } from '@/lib/section13/facts';

describe('wizard flow completion helpers', () => {
  describe('money claim claim statement completion', () => {
    it('requires both the interest decision and basis of claim in England', () => {
      expect(
        isMoneyClaimClaimStatementSectionComplete({
          __meta: { jurisdiction: 'england' },
          money_claim: {
            charge_interest: false,
          },
        })
      ).toBe(false);

      expect(
        isMoneyClaimClaimStatementSectionComplete({
          __meta: { jurisdiction: 'england' },
          money_claim: {
            basis_of_claim: 'The tenant owes unpaid rent and utility balances under the tenancy.',
          },
        })
      ).toBe(false);
    });

    it('passes once both fields are present for England', () => {
      expect(
        isMoneyClaimClaimStatementSectionComplete({
          __meta: { jurisdiction: 'england' },
          money_claim: {
            charge_interest: true,
            basis_of_claim:
              'The tenant owes unpaid rent and utility balances under the tenancy and has not cleared them after demand.',
          },
        })
      ).toBe(true);
    });
  });

  describe('section 13 proposal completion', () => {
    it('requires service method as well as dates and proposed rent', () => {
      const state = createEmptySection13State('section13_standard');
      state.proposal.proposedRentAmount = 1285;
      state.proposal.serviceDate = '2026-05-01';
      state.proposal.proposedStartDate = '2026-07-01';

      expect(isSection13ProposalStepComplete(state)).toBe(false);

      state.proposal.serviceMethod = 'post';
      expect(isSection13ProposalStepComplete(state)).toBe(true);
    });

    it('requires detail when the service method is other', () => {
      const state = createEmptySection13State('section13_standard');
      state.proposal.proposedRentAmount = 1285;
      state.proposal.serviceDate = '2026-05-01';
      state.proposal.proposedStartDate = '2026-07-01';
      state.proposal.serviceMethod = 'other';

      expect(isSection13ProposalStepComplete(state)).toBe(false);

      state.proposal.serviceMethodOther = 'Courier delivery to the tenant at the property';
      expect(isSection13ProposalStepComplete(state)).toBe(true);
    });
  });

  describe('tenancy deposit completion', () => {
    it('treats a zero-deposit path as complete without a scheme', () => {
      expect(
        isTenancyDepositSectionComplete({
          __meta: { jurisdiction: 'england' },
          deposit_amount: 0,
        })
      ).toBe(true);

      expect(hasPositiveDepositAmount({ deposit_amount: 0 })).toBe(false);
    });

    it('requires a scheme when a positive deposit is taken', () => {
      expect(
        isTenancyDepositSectionComplete({
          __meta: { jurisdiction: 'england' },
          rent_amount: 1200,
          rent_frequency: 'monthly',
          deposit_amount: 1200,
        })
      ).toBe(false);

      expect(
        isTenancyDepositSectionComplete({
          __meta: { jurisdiction: 'england' },
          rent_amount: 1200,
          rent_frequency: 'monthly',
          deposit_amount: 1200,
          deposit_scheme_name: 'DPS',
        })
      ).toBe(true);
    });
  });
});
