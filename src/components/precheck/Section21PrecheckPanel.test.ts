import { describe, expect, it } from 'vitest';
import { getStatusCtaConfig } from './Section21PrecheckPanel';

describe('getStatusCtaConfig', () => {
  it('incomplete disables CTA and does not use valid label', () => {
    const config = getStatusCtaConfig('incomplete');
    expect(config.enabled).toBe(false);
    expect(config.label).toBe('Complete the check to continue');
    expect(config.label).not.toContain('Valid');
  });

  it('risky shows risky CTA label', () => {
    const config = getStatusCtaConfig('risky');
    expect(config.label).toBe('Use Section 8 Instead – Start Workflow');
    expect(config.enabled).toBe(true);
  });

  it('valid shows valid CTA label', () => {
    const config = getStatusCtaConfig('valid');
    expect(config.label).toBe('Section 21 is Valid – Continue');
    expect(config.enabled).toBe(true);
  });
});
