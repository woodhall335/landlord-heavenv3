import { CLAIM_TYPE_CONFIGS } from './config';
import type { ClaimFlowMode, ClaimTypeConfig, ClaimTypeId } from './types';

export type ClaimConfigValidationIssue = {
  configId: ClaimTypeId;
  message: string;
};

export const CLAIM_STEP_IDS = ['claim_type', 'about', 'details', 'evidence', 'check', 'results'] as const;

const LANDLORD_DOCUMENT_TERMS = [
  'tenant',
  'tenancy',
  'landlord',
  'rent arrears',
  'rented property',
];

export function getCollectedFieldPaths(config: ClaimTypeConfig): Set<string> {
  return new Set(
    config.stepFlow.flatMap((step) => step.questions.map((question) => question.fieldPath))
  );
}

export function validateClaimConfig(config: ClaimTypeConfig): ClaimConfigValidationIssue[] {
  const issues: ClaimConfigValidationIssue[] = [];
  const stepIds = config.stepFlow.map((step) => step.stepId);
  const collected = getCollectedFieldPaths(config);

  for (const stepId of CLAIM_STEP_IDS) {
    if (!stepIds.includes(stepId)) {
      issues.push({ configId: config.id, message: `Missing step ${stepId}.` });
    }
  }

  for (const field of config.requiredDocumentFields) {
    const isCollected = collected.has(field) || [...collected].some((collectedField) => collectedField.startsWith(`${field}.`));
    if (!isCollected) {
      issues.push({
        configId: config.id,
        message: `Required document field is not collected by the step flow: ${field}.`,
      });
    }
  }

  if (config.seoKeywords.length < 10) {
    issues.push({ configId: config.id, message: 'Config has fewer than 10 SEO keywords.' });
  }

  if (config.flowMode === 'generic_small_claim') {
    const visibleText = [
      config.label,
      config.cardDescription,
      ...config.packOutputs,
      ...config.stepFlow.flatMap((step) => {
        if (step.stepId === 'claim_type') {
          return [];
        }

        return step.questions.flatMap((question) => [
          question.questionText,
          question.helperText,
          question.typingText ?? '',
        ]);
      }),
    ].join(' ').toLowerCase();

    for (const term of LANDLORD_DOCUMENT_TERMS) {
      if (visibleText.includes(term)) {
        issues.push({
          configId: config.id,
          message: `Generic claim config contains landlord-only wording: ${term}.`,
        });
      }
    }
  }

  return issues;
}

export function validateAllClaimConfigs(): ClaimConfigValidationIssue[] {
  return CLAIM_TYPE_CONFIGS.flatMap(validateClaimConfig);
}

export function getClaimHandoffHref(config: ClaimTypeConfig): string {
  return `/claims?claim=${config.slug}`;
}

export function getFlowModeLabel(flowMode: ClaimFlowMode): string {
  return flowMode === 'landlord_money_claim'
    ? 'Landlord debt claim pack'
    : 'Generic small-claim pack';
}
