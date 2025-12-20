import { CapabilityMatrix, FlowCapability, getCapabilityMatrix } from '../capabilities/matrix';
import { getNoticeOnlyRequirements } from './noticeOnly';
import { getEvictionPackRequirements } from './evictionPack';
import { getMoneyClaimRequirements } from './moneyClaim';
import { getTenancyAgreementRequirements } from './tenancyAgreement';

export type ValidationStage = 'wizard' | 'checkpoint' | 'preview' | 'generate';

export interface ValidationContext {
  jurisdiction: string;
  product: string;
  route: string;
  stage: ValidationStage;
  facts: Record<string, unknown>;
  matrix?: CapabilityMatrix;
}

export interface RequirementsResult {
  requiredNow: Set<string>;
  warnNow: Set<string>;
  derived: Set<string>;
}

export type RequirementsGetter = (ctx: ValidationContext & { flow: FlowCapability }) => RequirementsResult;

const productHandlers: Record<string, RequirementsGetter> = {
  notice_only: getNoticeOnlyRequirements,
  eviction_pack: getEvictionPackRequirements,
  money_claim: getMoneyClaimRequirements,
  tenancy_agreement: getTenancyAgreementRequirements,
};

export function getRequirements(context: ValidationContext): RequirementsResult {
  const matrix = context.matrix ?? getCapabilityMatrix();
  const flow = matrix?.[context.jurisdiction as keyof CapabilityMatrix]?.[
    context.product as keyof CapabilityMatrix[keyof CapabilityMatrix]
  ] as FlowCapability | undefined;

  if (!flow || flow.status !== 'supported' || !flow.routes.includes(context.route)) {
    return { requiredNow: new Set(), warnNow: new Set(), derived: new Set() };
  }

  const handler = productHandlers[context.product];
  if (!handler) {
    return { requiredNow: new Set(), warnNow: new Set(), derived: new Set() };
  }

  return handler({ ...context, flow });
}
