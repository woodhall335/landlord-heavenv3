import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import type { MoneyClaimCase } from './money-claim-pack-generator';
import { mapCaseFactsToMoneyClaimCase } from './money-claim-wizard-mapper';

type WizardFacts = Record<string, any>;

interface MoneyClaimGenerationInput {
  facts: WizardFacts;
  caseId: string;
  jurisdiction: CanonicalJurisdiction;
}

interface MoneyClaimGenerationOutput {
  facts: WizardFacts;
  caseFacts: CaseFacts;
  moneyClaimCase: MoneyClaimCase;
}

export function buildMoneyClaimGenerationFacts({
  facts,
  caseId,
  jurisdiction,
}: MoneyClaimGenerationInput): WizardFacts {
  if (jurisdiction !== 'england') {
    throw new Error(`Money claim generation is only available for England. Received: ${jurisdiction}`);
  }

  const meta = facts.__meta || {};

  return {
    ...facts,
    id: caseId,
    case_id: caseId,
    jurisdiction,
    property_country: facts.property_country || jurisdiction,
    product: facts.product || 'money_claim',
    product_tier: facts.product_tier || 'money_claim',
    pack_type: facts.pack_type || 'money_claim',
    __meta: {
      ...meta,
      case_id: caseId,
      jurisdiction,
      product: meta.product || facts.product || 'money_claim',
    },
  };
}

export function buildMoneyClaimGenerationInput(
  input: MoneyClaimGenerationInput
): MoneyClaimGenerationOutput {
  const generationFacts = buildMoneyClaimGenerationFacts(input);
  const caseFacts = wizardFactsToCaseFacts(generationFacts) as CaseFacts;
  const mappedCase = mapCaseFactsToMoneyClaimCase(caseFacts);

  return {
    facts: generationFacts,
    caseFacts,
    moneyClaimCase: {
      ...mappedCase,
      case_id: input.caseId,
      claimant_reference: mappedCase.claimant_reference?.trim() || input.caseId,
    },
  };
}
