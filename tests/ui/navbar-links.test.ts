import { describe, expect, it } from 'vitest';

import { freeTools } from '@/lib/tools/tools';

describe('NavBar tool links', () => {
  it('keeps only surviving free-tool destinations', () => {
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

  it('does not include retired validator or generator routes', () => {
    const hrefs = freeTools.map((tool) => tool.href);

    expect(hrefs).not.toContain('/tools/validators');
    expect(hrefs).not.toContain('/tools/validators/section-21');
    expect(hrefs).not.toContain('/tools/validators/section-8');
    expect(hrefs).not.toContain('/tools/free-section-21-notice-generator');
    expect(hrefs).not.toContain('/tools/free-section-8-notice-generator');
  });
});
