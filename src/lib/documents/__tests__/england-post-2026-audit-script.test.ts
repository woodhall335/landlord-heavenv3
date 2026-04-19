import { describe, expect, it } from 'vitest';

import {
  buildScenarioDefinitions,
  formatAuditRunDate,
  getAuditOutputPaths,
} from '../../../../scripts/audit-england-post-2026-pack';

describe('England post-2026 audit script helpers', () => {
  it('uses the real run date in audit output paths', () => {
    const now = new Date('2026-04-18T12:34:56.000Z');
    const paths = getAuditOutputPaths(now);

    expect(formatAuditRunDate(now)).toBe('2026-04-18');
    expect(paths.runDate).toBe('2026-04-18');
    expect(paths.auditRoot.replace(/\\/g, '/')).toContain('/artifacts/post-2026-pack-audit/2026-04-18');
    expect(paths.noticeDir.replace(/\\/g, '/')).toContain('/artifacts/post-2026-pack-audit/2026-04-18/notice-only');
    expect(paths.completeDir.replace(/\\/g, '/')).toContain('/artifacts/post-2026-pack-audit/2026-04-18/complete-pack');
    expect(paths.latestRoot.replace(/\\/g, '/')).toContain('/artifacts/post-2026-pack-audit/latest');
    expect(paths.reportPath.replace(/\\/g, '/')).toContain('/artifacts/post-2026-pack-audit/2026-04-18/audit-report.md');
    expect(paths.manifestPath.replace(/\\/g, '/')).toContain('/artifacts/post-2026-pack-audit/2026-04-18/audit-manifest.json');
  });

  it('keeps a broad edge-case scenario matrix for England post-May 2026 audits', () => {
    const scenarios = buildScenarioDefinitions();
    const names = scenarios.map((scenario) => scenario.name);

    expect(new Set(names).size).toBe(names.length);
    expect(scenarios.length).toBeGreaterThanOrEqual(12);
    expect(names).toEqual(expect.arrayContaining([
      'valid_notice_only_sale',
      'valid_complete_pack_arrears',
      'ground8_below_threshold',
      'notice_too_short_for_ground_1A',
      'deposit_unprotected',
      'deposit_protected_late',
      'prescribed_information_missing',
      'tenant_in_breathing_space',
      'section16e_confirmation_missing',
      'complete_pack_evidence_bundle_incomplete',
      'ground_4A_prior_notice_missing',
      'immediate_ground14_route',
      'ground_1A_reletting_warning',
    ]));
  });
});
