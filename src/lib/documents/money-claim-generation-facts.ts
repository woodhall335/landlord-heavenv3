import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import type { MoneyClaimCase } from './money-claim-pack-generator';
import { mapCaseFactsToMoneyClaimCase } from './money-claim-wizard-mapper';

type WizardFacts = Record<string, any>;

function readNonBlankString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function resolveMoneyClaimClaimantName(facts: WizardFacts): string | undefined {
  const landlord = facts.parties?.landlord || {};
  const canonicalLandlord = facts.case_facts?.parties?.landlord || {};
  const companyName = readNonBlankString(
    facts.company_name,
    landlord.company_name,
    canonicalLandlord.company_name,
  );
  const individualName = readNonBlankString(
    facts.landlord_full_name,
    facts.landlord_name,
    facts.claimant_full_name,
    landlord.name,
    landlord.full_name,
    canonicalLandlord.name,
  );
  const isCompany =
    facts.landlord_is_company === true ||
    landlord.is_company === true ||
    canonicalLandlord.is_company === true;
  const isExplicitlyIndividual =
    facts.landlord_is_company === false ||
    landlord.is_company === false ||
    canonicalLandlord.is_company === false;

  if (isCompany) return companyName;
  if (individualName) return individualName;
  return isExplicitlyIndividual ? undefined : companyName;
}

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
  const claimantName = resolveMoneyClaimClaimantName(facts);
  const landlord = facts.parties?.landlord || {};
  const canonicalParties = facts.case_facts?.parties;
  const canonicalLandlord = canonicalParties?.landlord || {};

  return {
    ...facts,
    landlord_full_name: claimantName,
    parties: {
      ...(facts.parties || {}),
      landlord: {
        ...landlord,
        name: claimantName,
      },
    },
    ...(facts.case_facts && typeof facts.case_facts === 'object'
      ? {
          case_facts: {
            ...facts.case_facts,
            parties: {
              ...(canonicalParties || {}),
              landlord: {
                ...canonicalLandlord,
                name: claimantName,
              },
            },
          },
        }
      : {}),
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
      has_joint_defendants:
        generationFacts.has_joint_defendants === true ||
        mappedCase.has_joint_defendants === true ||
        Boolean(mappedCase.tenant_2_name),
      case_id: input.caseId,
      claimant_reference: mappedCase.claimant_reference?.trim() || input.caseId,
    },
  };
}
