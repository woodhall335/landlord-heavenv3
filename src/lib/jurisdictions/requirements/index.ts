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
  status?: 'ok' | 'unsupported' | 'misconfigured';
  statusReason?: string;
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

  // Fail-closed: unsupported flows
  if (!flow) {
    return {
      requiredNow: new Set(),
      warnNow: new Set(),
      derived: new Set(),
      status: 'unsupported',
      statusReason: `Flow ${context.jurisdiction}/${context.product} is not defined in capability matrix`,
    };
  }

  // Fail-closed: misconfigured flows
  if (flow.status === 'misconfigured') {
    return {
      requiredNow: new Set(),
      warnNow: new Set(),
      derived: new Set(),
      status: 'misconfigured',
      statusReason: `Flow ${context.jurisdiction}/${context.product} is misconfigured: ${flow.derivedFrom.notes?.join('; ') || 'unknown reason'}`,
    };
  }

  // Fail-closed: unsupported status
  if (flow.status === 'unsupported') {
    return {
      requiredNow: new Set(),
      warnNow: new Set(),
      derived: new Set(),
      status: 'unsupported',
      statusReason: `Flow ${context.jurisdiction}/${context.product} is not supported`,
    };
  }

  // Fail-closed: route not in supported routes
  if (!flow.routes.includes(context.route)) {
    return {
      requiredNow: new Set(),
      warnNow: new Set(),
      derived: new Set(),
      status: 'unsupported',
      statusReason: `Route ${context.route} is not available for ${context.jurisdiction}/${context.product}. Available routes: ${flow.routes.join(', ')}`,
    };
  }

  // Handler not found - should not happen but fail-closed
  const handler = productHandlers[context.product];
  if (!handler) {
    return {
      requiredNow: new Set(),
      warnNow: new Set(),
      derived: new Set(),
      status: 'misconfigured',
      statusReason: `No requirement handler found for product ${context.product}`,
    };
  }

  // OK: supported flow
  const result = handler({ ...context, flow });
  return {
    ...result,
    status: 'ok',
  };
}
