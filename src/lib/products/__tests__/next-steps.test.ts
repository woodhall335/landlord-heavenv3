/**
 * Next Steps Tests
 *
 * Tests for next steps guidance helper across all jurisdictions and products.
 */

import { describe, it, expect } from 'vitest';
import { getNextSteps } from '../next-steps';
import type { GetNextStepsArgs, NextStepsResult } from '../next-steps';

describe('getNextSteps', () => {
  describe('notice_only product', () => {
    describe('england', () => {
      it('returns Section 21 specific steps', () => {
        const args: GetNextStepsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_21',
        };
        const result = getNextSteps(args);

        expect(result.title).toBe('What to do next');
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.steps.some(s => s.includes('Section 21'))).toBe(true);
        expect(result.steps.some(s => s.includes('accelerated possession'))).toBe(true);
      });

      it('returns Section 8 specific steps', () => {
        const args: GetNextStepsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_8',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Section 8'))).toBe(true);
        expect(result.steps.some(s => s.includes('breach'))).toBe(true);
      });

      it('includes custom notice period when provided', () => {
        const args: GetNextStepsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_8',
          notice_period_days: 14,
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('14 days'))).toBe(true);
      });

      it('uses default notice period when not provided', () => {
        const args: GetNextStepsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_21',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('two months'))).toBe(true);
      });
    });

    describe('wales', () => {
      it('returns Section 173 specific steps (Renting Homes Act)', () => {
        const args: GetNextStepsArgs = {
          product: 'notice_only',
          jurisdiction: 'wales',
          route: 'section_173',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes("Landlord's Notice"))).toBe(true);
        expect(result.steps.some(s => s.includes('contract-holder'))).toBe(true);
        expect(result.steps.some(s => s.includes('6 months'))).toBe(true);
      });

      it('returns fault-based notice steps', () => {
        const args: GetNextStepsArgs = {
          product: 'notice_only',
          jurisdiction: 'wales',
          route: 'fault_based',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Fault-Based'))).toBe(true);
        expect(result.steps.some(s => s.includes('breach'))).toBe(true);
      });
    });

    describe('scotland', () => {
      it('returns Notice to Leave specific steps', () => {
        const args: GetNextStepsArgs = {
          product: 'notice_only',
          jurisdiction: 'scotland',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Notice to Leave'))).toBe(true);
        expect(result.steps.some(s => s.includes('First-tier Tribunal'))).toBe(true);
      });

      it('includes custom notice period when provided', () => {
        const args: GetNextStepsArgs = {
          product: 'notice_only',
          jurisdiction: 'scotland',
          notice_period_days: 28,
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('28 days'))).toBe(true);
      });
    });
  });

  describe('complete_pack product', () => {
    describe('england', () => {
      it('returns Section 21 complete pack steps (accelerated procedure)', () => {
        const args: GetNextStepsArgs = {
          product: 'complete_pack',
          jurisdiction: 'england',
          route: 'section_21',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('N5B'))).toBe(true);
        expect(result.steps.some(s => s.includes('Accelerated'))).toBe(true);
        expect(result.steps.some(s => s.includes('County Court'))).toBe(true);
      });

      it('returns Section 8 complete pack steps (standard procedure)', () => {
        const args: GetNextStepsArgs = {
          product: 'complete_pack',
          jurisdiction: 'england',
          route: 'section_8',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('N5') && s.includes('N119'))).toBe(true);
        expect(result.steps.some(s => s.includes('witness statement'))).toBe(true);
      });
    });

    describe('scotland', () => {
      it('returns First-tier Tribunal specific steps', () => {
        const args: GetNextStepsArgs = {
          product: 'complete_pack',
          jurisdiction: 'scotland',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Form E'))).toBe(true);
        expect(result.steps.some(s => s.includes('First-tier Tribunal'))).toBe(true);
        expect(result.steps.some(s => s.includes('Housing and Property Chamber'))).toBe(true);
        // Should NOT mention County Court
        expect(result.steps.some(s => s.includes('County Court'))).toBe(false);
      });
    });

    describe('wales', () => {
      it('returns Wales County Court steps', () => {
        const args: GetNextStepsArgs = {
          product: 'complete_pack',
          jurisdiction: 'wales',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('N5') && s.includes('N119'))).toBe(true);
        expect(result.steps.some(s => s.includes('County Court'))).toBe(true);
      });
    });
  });

  describe('money_claim product', () => {
    describe('england/wales', () => {
      it('returns England money claim steps with Form N1', () => {
        const args: GetNextStepsArgs = {
          product: 'money_claim',
          jurisdiction: 'england',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Letter Before Claim'))).toBe(true);
        expect(result.steps.some(s => s.includes('Form N1'))).toBe(true);
        expect(result.steps.some(s => s.includes('MCOL'))).toBe(true);
        expect(result.steps.some(s => s.includes('judgment in default'))).toBe(true);
      });

      it('returns same steps for Wales', () => {
        const args: GetNextStepsArgs = {
          product: 'money_claim',
          jurisdiction: 'wales',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Form N1'))).toBe(true);
      });
    });

    describe('scotland (sc_money_claim)', () => {
      it('returns Scotland Simple Procedure steps with Form 3A', () => {
        const args: GetNextStepsArgs = {
          product: 'sc_money_claim',
          jurisdiction: 'scotland',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Pre-Action Letter'))).toBe(true);
        expect(result.steps.some(s => s.includes('Form 3A'))).toBe(true);
        expect(result.steps.some(s => s.includes('Sheriff Court'))).toBe(true);
        expect(result.steps.some(s => s.includes('diligence'))).toBe(true);
        // Should NOT mention MCOL
        expect(result.steps.some(s => s.includes('MCOL'))).toBe(false);
      });

      it('falls back to Scotland steps for generic money_claim in Scotland', () => {
        const args: GetNextStepsArgs = {
          product: 'money_claim',
          jurisdiction: 'scotland',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Form 3A'))).toBe(true);
      });
    });
  });

  describe('ast_standard and ast_premium products', () => {
    describe('england', () => {
      it('returns AST steps for England', () => {
        const args: GetNextStepsArgs = {
          product: 'ast_standard',
          jurisdiction: 'england',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('deposit') && s.includes('30 days'))).toBe(true);
        expect(result.steps.some(s => s.includes('How to Rent'))).toBe(true);
        expect(result.steps.some(s => s.includes('Prescribed Information'))).toBe(true);
      });

      it('returns same steps for ast_premium', () => {
        const standard = getNextSteps({
          product: 'ast_standard',
          jurisdiction: 'england',
        });
        const premium = getNextSteps({
          product: 'ast_premium',
          jurisdiction: 'england',
        });

        expect(standard.steps).toEqual(premium.steps);
      });
    });

    describe('wales', () => {
      it('returns SOC steps with Wales terminology (contract-holder)', () => {
        const args: GetNextStepsArgs = {
          product: 'ast_standard',
          jurisdiction: 'wales',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Standard Occupation Contract'))).toBe(true);
        expect(result.steps.some(s => s.includes('contract-holder'))).toBe(true);
        expect(result.steps.some(s => s.includes('written statement'))).toBe(true);
      });
    });

    describe('scotland', () => {
      it('returns PRT steps with Scotland terminology', () => {
        const args: GetNextStepsArgs = {
          product: 'ast_standard',
          jurisdiction: 'scotland',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Private Residential Tenancy'))).toBe(true);
        expect(result.steps.some(s => s.includes('Easy Read Notes'))).toBe(true);
      });
    });

    describe('northern-ireland', () => {
      it('returns NI Private Tenancy steps', () => {
        const args: GetNextStepsArgs = {
          product: 'ast_standard',
          jurisdiction: 'northern-ireland',
        };
        const result = getNextSteps(args);

        expect(result.steps.some(s => s.includes('Private Tenancy Agreement'))).toBe(true);
        expect(result.steps.some(s => s.includes('28 days'))).toBe(true);
        expect(result.steps.some(s => s.includes('TDS NI') || s.includes('MyDeposits NI'))).toBe(true);
      });
    });
  });

  describe('fallback behavior', () => {
    it('returns generic steps for unknown product', () => {
      const result = getNextSteps({
        product: 'unknown_product',
        jurisdiction: 'england',
      });

      expect(result.title).toBe('What to do next');
      expect(result.steps.length).toBe(1);
      expect(result.steps[0]).toContain('Review your documents');
    });

    it('returns generic steps for unknown jurisdiction', () => {
      const result = getNextSteps({
        product: 'notice_only',
        jurisdiction: 'unknown_jurisdiction',
      });

      expect(result.title).toBe('What to do next');
      expect(result.steps.length).toBe(1);
    });

    it('returns generic steps for unsupported product in NI', () => {
      const result = getNextSteps({
        product: 'notice_only',
        jurisdiction: 'northern-ireland',
      });

      expect(result.steps.length).toBe(1);
      expect(result.steps[0]).toContain('Review your documents');
    });
  });

  describe('NextStepsResult structure', () => {
    it('all results have required fields', () => {
      const testCases: GetNextStepsArgs[] = [
        { product: 'notice_only', jurisdiction: 'england', route: 'section_21' },
        { product: 'complete_pack', jurisdiction: 'scotland' },
        { product: 'money_claim', jurisdiction: 'england' },
        { product: 'sc_money_claim', jurisdiction: 'scotland' },
        { product: 'ast_standard', jurisdiction: 'wales' },
        { product: 'ast_premium', jurisdiction: 'northern-ireland' },
      ];

      for (const args of testCases) {
        const result = getNextSteps(args);

        expect(typeof result.title).toBe('string');
        expect(result.title.length).toBeGreaterThan(0);
        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps.length).toBeGreaterThan(0);

        for (const step of result.steps) {
          expect(typeof step).toBe('string');
          expect(step.length).toBeGreaterThan(0);
        }
      }
    });

    it('steps are non-empty strings', () => {
      const result = getNextSteps({
        product: 'complete_pack',
        jurisdiction: 'england',
        route: 'section_8',
      });

      for (const step of result.steps) {
        expect(step.trim()).not.toBe('');
      }
    });
  });

  describe('jurisdiction normalization', () => {
    it('handles uppercase jurisdiction', () => {
      const result = getNextSteps({
        product: 'notice_only',
        jurisdiction: 'ENGLAND',
        route: 'section_21',
      });

      expect(result.steps.some(s => s.includes('Section 21'))).toBe(true);
    });

    it('handles mixed case jurisdiction', () => {
      const result = getNextSteps({
        product: 'notice_only',
        jurisdiction: 'Scotland',
      });

      expect(result.steps.some(s => s.includes('Notice to Leave'))).toBe(true);
    });
  });
});
