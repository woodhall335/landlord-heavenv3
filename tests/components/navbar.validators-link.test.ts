import { describe, expect, it } from 'vitest';

import { freeTools } from '@/lib/tools/tools';

describe('NavBar free tools configuration', () => {
  it('keeps Ask Heaven first and drops retired validator-generator routes', () => {
    expect(freeTools[0]?.href).toBe('/ask-heaven');

    const hrefs = freeTools.map((tool) => tool.href);

    expect(hrefs).not.toContain('/tools/validators');
    expect(hrefs).not.toContain('/tools/validators/section-21');
    expect(hrefs).not.toContain('/tools/validators/section-8');
    expect(hrefs).not.toContain('/tools/free-section-21-notice-generator');
    expect(hrefs).not.toContain('/tools/free-section-8-notice-generator');
  });

  it('still exposes the surviving free tools', () => {
    const hrefs = freeTools.map((tool) => tool.href);

    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/ask-heaven',
        '/tools/rent-arrears-calculator',
        '/tools/hmo-license-checker',
        '/tools/free-rent-demand-letter',
      ])
    );
  });
});
