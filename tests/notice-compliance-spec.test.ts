import { describe, expect, it } from 'vitest';
import { getNoticeComplianceSpec, noticeComplianceSpecs } from '../src/lib/notices/notice-compliance-spec';

const requiredRoutes = [
  'notice-only/england/section8',
  'notice-only/england/section21',
  'notice-only/wales/section173',
  'notice-only/scotland/notice-to-leave',
] as const;

describe('noticeComplianceSpecs', () => {
  it('includes specs for all required notice-only routes', () => {
    const availableRoutes = noticeComplianceSpecs.map((spec) => spec.route);
    requiredRoutes.forEach((route) => {
      expect(availableRoutes).toContain(route);
    });
  });

  it('defines hard bars and inline validations for each notice', () => {
    noticeComplianceSpecs.forEach((spec) => {
      expect(spec.hard_bars.length).toBeGreaterThan(0);
      expect(spec.inline_validation_rules.length).toBeGreaterThan(0);
      expect(spec.required_inputs.every((input) => input.required)).toBe(true);
    });
  });

  it('retrieves the correct spec by route', () => {
    requiredRoutes.forEach((route) => {
      const spec = getNoticeComplianceSpec(route);
      expect(spec?.route).toBe(route);
    });
  });
});
