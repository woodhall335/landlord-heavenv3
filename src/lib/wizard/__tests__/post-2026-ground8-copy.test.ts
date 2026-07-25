import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('post-1 May 2026 England Ground 8 guidance', () => {
  it('does not expose the superseded two-month threshold in live guidance paths', () => {
    const files = [
      'src/lib/wizard/gating.ts',
      'src/lib/notices/notice-compliance-spec.ts',
      'src/lib/ai/ask-heaven.ts',
      'src/lib/ai/risk-assessment-generator.ts',
      'src/lib/ai/compliance-audit-generator.ts',
    ];
    const source = files.map((file) => readFileSync(file, 'utf8')).join('\n');

    expect(source).not.toMatch(/Ground 8[^\n]*(?:2\+ months|two months)/i);
    expect(source).not.toContain('S8-GROUND8-TWO-MONTHS');
    expect(source).not.toContain('arrears_amount >= rentAmount * 2');
    expect(source).toContain('arrears_amount >= rentAmount * 3');
    expect(source).toContain("3 months' rent for monthly rents");
    expect(source).toContain("13 weeks' rent for weekly or fortnightly rents");
  });
});
