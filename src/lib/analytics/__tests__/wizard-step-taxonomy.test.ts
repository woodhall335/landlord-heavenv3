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

  it('groups Section 13 review and evidence steps into readable GA4 events', () => {
    expect(normalizeWizardStep('preview_checkout')).toMatchObject({
      normalizedStepKey: 'review',
      normalizedEventName: 'wizard_step_review_complete',
      stepGroup: 'review',
    });

    expect(normalizeWizardStep('comparables')).toMatchObject({
      normalizedStepKey: 'evidence',
      normalizedEventName: 'wizard_step_evidence_complete',
      stepGroup: 'evidence',
    });
  });

  it('groups standalone England tenancy agreement steps into shared reporting buckets', () => {
    expect(normalizeWizardStep('property_details')).toMatchObject({
      normalizedStepKey: 'property',
      normalizedEventName: 'wizard_step_property_complete',
      stepGroup: 'property',
    });

    expect(normalizeWizardStep('tenant')).toMatchObject({
      normalizedStepKey: 'tenants',
      normalizedEventName: 'wizard_step_tenants_complete',
      stepGroup: 'tenants',
    });

    expect(normalizeWizardStep('england_pre_tenancy_compliance')).toMatchObject({
      normalizedStepKey: 'compliance',
      normalizedEventName: 'wizard_step_compliance_complete',
      stepGroup: 'compliance',
    });

    expect(normalizeWizardStep('tenancy_terms')).toMatchObject({
      normalizedStepKey: 'terms',
      normalizedEventName: 'wizard_step_terms_complete',
      stepGroup: 'terms',
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
