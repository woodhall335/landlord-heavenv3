import { describe, expect, it } from 'vitest';

import { normalizeWizardStep } from '../wizard-step-taxonomy';

describe('wizard step taxonomy', () => {
  it('maps known step aliases to the same normalized group', () => {
    expect(normalizeWizardStep('section21_compliance')).toMatchObject({
      normalizedStepKey: 'compliance',
      normalizedEventName: 'wizard_step_compliance_complete',
      stepGroup: 'compliance',
    });

    expect(normalizeWizardStep('scotland_notice')).toMatchObject({
      normalizedStepKey: 'notice',
      normalizedEventName: 'wizard_step_notice_complete',
      stepGroup: 'notice',
    });
  });

  it('falls back to a stable sanitized key for unknown steps', () => {
    expect(normalizeWizardStep('Custom Step!')).toMatchObject({
      normalizedStepKey: 'custom_step',
      normalizedEventName: 'wizard_step_custom_step_complete',
      stepGroup: 'custom_step',
    });
  });
});
