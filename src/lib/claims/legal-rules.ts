import type { ClaimTypeId } from './types';

export type GenericClaimLegalRules = {
  legal_basis: string;
  required_elements: string[];
  pre_action_rule: string;
  limitation_warning: string;
  interest_rule: string;
  official_forms: string[];
};

export const GENERIC_CLAIM_LEGAL_RULES: Record<
  Exclude<ClaimTypeId, 'landlord_debt_claim'>,
  GenericClaimLegalRules
> = {
  unpaid_invoice: {
    legal_basis: 'Debt claim for an unpaid invoice after goods, work, or services were supplied.',
    required_elements: [
      'The work, goods, or service supplied',
      'The invoice amount and due date',
      'The defendant identity and service address',
      'The demand or chaser sent before claim',
    ],
    pre_action_rule: 'A clear written demand should normally be sent before issuing a money claim.',
    limitation_warning: 'Most simple contract debts must usually be issued within six years of the breach.',
    interest_rule: 'Interest may be contractual or statutory, but should only be claimed if the user has opted in and checked the basis.',
    official_forms: ['N1 claim form'],
  },
  loan_or_money_owed: {
    legal_basis: 'Debt claim for money lent or otherwise repayable to the claimant.',
    required_elements: [
      'The agreement or reason the money is repayable',
      'The amount advanced or owed',
      'The repayment date or demand for repayment',
      'Any admission, promise, or response from the defendant',
    ],
    pre_action_rule: 'The claimant should give the defendant a clear chance to repay or respond before issuing.',
    limitation_warning: 'Most simple contract debts must usually be issued within six years of the repayment breach.',
    interest_rule: 'Interest may be requested for review where there is a contractual term or a statutory basis.',
    official_forms: ['N1 claim form'],
  },
  faulty_goods_refund: {
    legal_basis: 'Consumer or contract claim for faulty, damaged, or misdescribed goods.',
    required_elements: [
      'The goods bought and the seller identity',
      'The price paid and purchase date',
      'The fault, damage, or misdescription',
      'The refund, repair, or remedy requested before claim',
    ],
    pre_action_rule: 'The seller should be told what is wrong and what remedy is sought before proceedings.',
    limitation_warning: 'Contract claims are usually subject to a six-year limitation period, but consumer remedy timing can matter.',
    interest_rule: 'Interest can be considered on the money claimed, but the refund/remedy basis should be checked first.',
    official_forms: ['N1 claim form'],
  },
  poor_service_contractor_dispute: {
    legal_basis: 'Contract claim for services not performed with reasonable care, skill, or within the agreed scope.',
    required_elements: [
      'The service agreed',
      'The agreed price or estimate',
      'What was defective, missing, late, or not performed',
      'The remedial cost or refund claimed',
    ],
    pre_action_rule: 'The service provider should be given a clear complaint and opportunity to respond.',
    limitation_warning: 'Most contract service claims must usually be issued within six years of breach.',
    interest_rule: 'Interest may be considered on sums claimed if the user opts in and checks the legal basis.',
    official_forms: ['N1 claim form'],
  },
  builder_tradesperson_dispute: {
    legal_basis: 'Contract claim for unfinished, defective, or poor quality building or trade work.',
    required_elements: [
      'The agreed scope of works',
      'Payments already made',
      'The defective or unfinished work',
      'The remedial quote, expert view, or loss calculation',
    ],
    pre_action_rule: 'The builder or tradesperson should receive the complaint, requested remedy, and reasonable time to respond.',
    limitation_warning: 'Most contract claims must usually be issued within six years, but latent defect and specialist advice issues may arise.',
    interest_rule: 'Interest can be considered on the money claim, but the remedial calculation should be clear first.',
    official_forms: ['N1 claim form'],
  },
  deposit_refund: {
    legal_basis: 'Claim for repayment of a deposit where the refund trigger has arisen or deduction is disputed.',
    required_elements: [
      'What the deposit was paid for',
      'The amount and date paid',
      'The refund terms or agreed condition',
      'Why the deposit should now be returned',
    ],
    pre_action_rule: 'The defendant should be asked for the refund and told why the money is due before claim.',
    limitation_warning: 'Most simple contract deposit claims must usually be issued within six years of breach.',
    interest_rule: 'Interest may be considered on the withheld deposit if the user opts in and checks the basis.',
    official_forms: ['N1 claim form'],
  },
  vehicle_repair_damage_dispute: {
    legal_basis: 'Contract or negligence-style money claim for vehicle repair defects, damage, or related direct costs.',
    required_elements: [
      'The garage, repairer, or defendant identity',
      'The repair or damage issue',
      'The amount paid or further repair cost',
      'The complaint, inspection, or refusal timeline',
    ],
    pre_action_rule: 'The defendant should receive a clear complaint, evidence of the issue, and the remedy sought.',
    limitation_warning: 'Most contract claims must usually be issued within six years; accident or negligence facts may need separate advice.',
    interest_rule: 'Interest can be considered on money losses where the user opts in and checks the correct basis.',
    official_forms: ['N1 claim form'],
  },
};

export function getGenericClaimLegalRules(claimType: ClaimTypeId): GenericClaimLegalRules | null {
  if (claimType === 'landlord_debt_claim') return null;
  return GENERIC_CLAIM_LEGAL_RULES[claimType];
}
