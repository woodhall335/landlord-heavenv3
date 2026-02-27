import { describe, expect, it } from 'vitest';
import { getStatusCtaConfig } from './Section21PrecheckPanel';

describe('getStatusCtaConfig', () => {
  it('returns disabled incomplete CTA copy', () => {
    const config = getStatusCtaConfig('incomplete');
    expect(config.label).toBe('Complete the check to continue');
    expect(config.enabled).toBe(false);
  });

  it('returns risky CTA copy', () => {
    const config = getStatusCtaConfig('risky');
    expect(config.label).toBe('Use Section 8 Instead – Start Workflow');
    expect(config.enabled).toBe(true);
  });

  it('returns valid CTA copy', () => {
    const config = getStatusCtaConfig('valid');
    expect(config.label).toBe('Section 21 is Valid – Continue');
    expect(config.enabled).toBe(true);
  });
});
