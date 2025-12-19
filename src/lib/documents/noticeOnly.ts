import type { JurisdictionKey } from '@/lib/jurisdictions/rulesLoader';
import { evaluateWizardGate, type WizardGateResult } from '@/lib/wizard/gating';

export interface NoticeValidationFailure {
  code: string;
  user_message: string;
  internal_reason?: string;
  fields?: string[];
}

export interface NoticeValidationOutcome {
  blocking: NoticeValidationFailure[];
  warnings: NoticeValidationFailure[];
}

export function validateNoticeOnlyBeforeRender(params: {
  jurisdiction: JurisdictionKey;
  facts: Record<string, any>;
  selectedGroundCodes: number[];
  selectedRoute?: string;
}): NoticeValidationOutcome {
  const { jurisdiction, facts, selectedGroundCodes } = params;
  const hasGroundsArray = Array.isArray(facts.section8_grounds) && facts.section8_grounds.length > 0;
  const inferredGrounds = selectedGroundCodes.length > 0
    ? selectedGroundCodes.map((code) => `ground_${code}`)
    : undefined;
  const factsWithGrounds = hasGroundsArray || !inferredGrounds
    ? facts
    : { ...facts, section8_grounds: inferredGrounds };

  const wizardGate: WizardGateResult = evaluateWizardGate({
    case_type: 'eviction',
    product: 'notice_only',
    jurisdiction,
    facts: factsWithGrounds,
  });

  return {
    blocking: wizardGate.blocking.map((b) => ({
      code: b.code,
      user_message: b.user_message ?? b.message,
      internal_reason: b.internal_reason,
      fields: b.fields,
    })),
    warnings: wizardGate.warnings.map((w) => ({
      code: w.code,
      user_message: w.message,
      fields: w.fields,
    })),
  };
}

export function assertNoticeOnlyValid(params: {
  jurisdiction: JurisdictionKey;
  facts: Record<string, any>;
  selectedGroundCodes: number[];
}): void {
  const outcome = validateNoticeOnlyBeforeRender(params);
  if (outcome.blocking.length > 0) {
    const message = outcome.blocking.map((b) => `${b.code}: ${b.user_message}`).join('; ');
    const error = new Error(`NOTICE_ONLY_VALIDATION_FAILED: ${message}`);
    throw error;
  }
}
