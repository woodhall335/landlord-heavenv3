import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/validation/eviction-rules-engine', () => ({
  evaluateEvictionRules: vi.fn(() => ({ blockers: [], warnings: [] })),
  isPhase13Enabled: vi.fn(() => false),
}));

describe('shadow-mode-adapter exports', () => {
  it('exposes runShadowValidation and runShadowValidationBatch', async () => {
    const {
      runShadowValidation,
      runShadowValidationBatch,
      formatShadowReport,
    } = await import('@/lib/validation/shadow-mode-adapter');

    expect(typeof runShadowValidation).toBe('function');
    expect(typeof runShadowValidationBatch).toBe('function');
    expect(typeof formatShadowReport).toBe('function');

    const report = await runShadowValidation({
      jurisdiction: 'england',
      product: 'notice_only',
      route: 'section_21',
      facts: {},
    });

    expect(report.yaml.blockers).toBe(0);
    expect(report.ts.blockers).toBe(0);
    expect(report.parity).toBe(true);

    const batch = await runShadowValidationBatch([
      {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {},
      },
    ]);

    expect(batch.summary.totalCases).toBe(1);
    expect(formatShadowReport(report)).toContain('parity=true');
  });
});
