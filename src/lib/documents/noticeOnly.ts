import type { JurisdictionKey } from '@/lib/jurisdictions/rulesLoader';
import { evaluateWizardGate, type WizardGateResult } from '@/lib/wizard/gating';

export interface NoticeValidationFailure {
  code: string;
  user_message: string;
  internal_reason?: string;
  fields?: string[];
  affected_question_id?: string;
  user_fix_hint?: string;
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
  stage?: 'wizard' | 'preview' | 'generate';
}): NoticeValidationOutcome {
  const { jurisdiction, facts, selectedGroundCodes, stage = 'wizard' } = params;
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
    stage,
  });

  return {
    blocking: wizardGate.blocking.map((b) => ({
      code: b.code,
      user_message: b.user_message ?? b.message,
      internal_reason: b.internal_reason,
      fields: b.fields,
      affected_question_id: (b as any).affected_question_id,
      user_fix_hint: b.user_fix_hint,
    })),
    warnings: wizardGate.warnings.map((w) => ({
      code: w.code,
      user_message: w.message,
      fields: w.fields,
      affected_question_id: (w as any).affected_question_id,
      user_fix_hint: (w as any).user_fix_hint,
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
