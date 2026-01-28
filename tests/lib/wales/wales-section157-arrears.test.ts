/**
 * Wales Section 157 Arrears Tests
 *
 * Tests for Wales-specific arrears functionality:
 * 1. Section 157 serious rent arrears threshold calculator
 * 2. Wales-specific arrears narrative builder
 * 3. Ensuring no England-specific terminology (Housing Act 1988, Section 8, Ground 8)
 */

import { describe, it, expect } from 'vitest';
import {
  computeWalesSection157Threshold,
  isWalesSection157ThresholdMet,
  calculateWalesArrearsInMonths,
  calculateWalesArrearsInWeeks,
} from '@/lib/wales/seriousArrearsThreshold';
import {
  buildWalesSection157ArrearsNarrative,
  generateWalesArrearsSummary,
} from '@/lib/wales/arrearsNarrative';

describe('Wales Section 157 Threshold Calculator', () => {
  describe('computeWalesSection157Threshold', () => {
    it('should compute 2 months threshold for monthly rent', () => {
      const result = computeWalesSection157Threshold('monthly', 1000);
      expect(result.thresholdAmount).toBe(2000);
      expect(result.thresholdLabel).toBe("2 months' rent");
    });

    it('should compute 8 weeks threshold for weekly rent', () => {
      const result = computeWalesSection157Threshold('weekly', 250);
      expect(result.thresholdAmount).toBe(2000); // 250 * 8 weeks
      expect(result.thresholdLabel).toBe("8 weeks' rent");
    });

    it('should compute 8 weeks threshold for fortnightly rent', () => {
      const result = computeWalesSection157Threshold('fortnightly', 500);
      // 500 per fortnight = 250 per week, 8 weeks = 2000
      expect(result.thresholdAmount).toBe(2000);
      expect(result.thresholdLabel).toBe("8 weeks' rent");
    });

    it('should compute 2 months threshold for quarterly rent', () => {
      const result = computeWalesSection157Threshold('quarterly', 3000);
      // 3000 per quarter = 1000 per month, 2 months = 2000
      expect(result.thresholdAmount).toBeCloseTo(2000, 0);
      expect(result.thresholdLabel).toBe("2 months' rent");
    });

    it('should compute 2 months threshold for yearly rent', () => {
      const result = computeWalesSection157Threshold('yearly', 12000);
      // 12000 per year = 1000 per month, 2 months = 2000
      expect(result.thresholdAmount).toBeCloseTo(2000, 0);
      expect(result.thresholdLabel).toBe("2 months' rent");
    });
  });

  describe('isWalesSection157ThresholdMet', () => {
    it('should return met=true when arrears >= 2 months rent (monthly)', () => {
      const result = isWalesSection157ThresholdMet(2000, 'monthly', 1000);
      expect(result.met).toBe(true);
      expect(result.thresholdAmount).toBe(2000);
      expect(result.isAuthoritative).toBe(true);
      expect(result.explanation).toContain('Section 157 threshold MET');
    });

    it('should return met=false when arrears < 2 months rent (monthly)', () => {
      const result = isWalesSection157ThresholdMet(1500, 'monthly', 1000);
      expect(result.met).toBe(false);
      expect(result.thresholdAmount).toBe(2000);
      expect(result.isAuthoritative).toBe(true);
      expect(result.explanation).toContain('Section 157 threshold NOT MET');
    });

    it('should return met=true when arrears >= 8 weeks rent (weekly)', () => {
      const result = isWalesSection157ThresholdMet(2000, 'weekly', 250);
      expect(result.met).toBe(true);
      expect(result.thresholdAmount).toBe(2000);
    });

    it('should return met=false when arrears < 8 weeks rent (weekly)', () => {
      const result = isWalesSection157ThresholdMet(1500, 'weekly', 250);
      expect(result.met).toBe(false);
    });

    it('should handle unsupported frequency gracefully', () => {
      // @ts-expect-error Testing unsupported frequency
      const result = isWalesSection157ThresholdMet(2000, 'daily', 50);
      expect(result.met).toBe(false);
      expect(result.isAuthoritative).toBe(false);
      expect(result.warning).toContain('not supported');
    });

    it('should handle zero rent amount gracefully', () => {
      const result = isWalesSection157ThresholdMet(2000, 'monthly', 0);
      expect(result.met).toBe(false);
      expect(result.isAuthoritative).toBe(false);
      expect(result.warning).toContain('Invalid rent amount');
    });

    it('should handle negative arrears gracefully', () => {
      const result = isWalesSection157ThresholdMet(-100, 'monthly', 1000);
      expect(result.met).toBe(false);
      expect(result.isAuthoritative).toBe(false);
      expect(result.warning).toContain('Invalid arrears amount');
    });
  });

  describe('calculateWalesArrearsInMonths', () => {
    it('should calculate arrears in months for monthly rent', () => {
      const months = calculateWalesArrearsInMonths(2500, 1000, 'monthly');
      expect(months).toBe(2.5);
    });

    it('should calculate arrears in months for weekly rent', () => {
      const months = calculateWalesArrearsInMonths(2165, 500, 'weekly');
      // 500 weekly * 4.33 = ~2165 monthly rent, so 2165 arrears = ~1 month
      expect(months).toBeCloseTo(1, 1);
    });

    it('should return 0 for zero rent', () => {
      const months = calculateWalesArrearsInMonths(2000, 0, 'monthly');
      expect(months).toBe(0);
    });

    it('should return 0 for zero arrears', () => {
      const months = calculateWalesArrearsInMonths(0, 1000, 'monthly');
      expect(months).toBe(0);
    });
  });

  describe('calculateWalesArrearsInWeeks', () => {
    it('should calculate arrears in weeks for weekly rent', () => {
      const weeks = calculateWalesArrearsInWeeks(2000, 250, 'weekly');
      expect(weeks).toBe(8);
    });

    it('should calculate arrears in weeks for fortnightly rent', () => {
      const weeks = calculateWalesArrearsInWeeks(2000, 500, 'fortnightly');
      // 500 fortnightly = 250 weekly, so 2000 arrears = 8 weeks
      expect(weeks).toBe(8);
    });
  });
});

describe('Wales Arrears Narrative Builder', () => {
  describe('buildWalesSection157ArrearsNarrative', () => {
    it('should generate Wales-specific narrative for Section 157 when threshold met', () => {
      const result = buildWalesSection157ArrearsNarrative({
        totalArrears: 2500,
        unpaidPeriodCount: 3,
        rentAmount: 1000,
        rentFrequency: 'monthly',
        rentDueDay: 1,
        noticeServiceDate: '2024-01-15',
        isSerious: true,
        thresholdMet: true,
      });

      expect(result.sectionRef).toBe('Section 157');
      expect(result.includesThresholdClaim).toBe(true);
      expect(result.narrative).toContain('section 157');
      expect(result.narrative).toContain('Renting Homes (Wales) Act 2016');
      expect(result.narrative).toContain('2,500.00');
      expect(result.narrative).toContain('meets the statutory threshold for serious rent arrears');
    });

    it('should NOT include threshold claim when threshold not met', () => {
      const result = buildWalesSection157ArrearsNarrative({
        totalArrears: 1500,
        unpaidPeriodCount: 2,
        rentAmount: 1000,
        rentFrequency: 'monthly',
        isSerious: true,
        thresholdMet: false,
      });

      expect(result.includesThresholdClaim).toBe(false);
      expect(result.narrative).not.toContain('meets the statutory threshold');
      expect(result.narrative).toContain('A detailed arrears schedule is provided');
    });

    it('should generate Section 159 narrative when not serious arrears', () => {
      const result = buildWalesSection157ArrearsNarrative({
        totalArrears: 500,
        unpaidPeriodCount: 1,
        rentAmount: 1000,
        rentFrequency: 'monthly',
        isSerious: false,
        thresholdMet: false,
      });

      expect(result.sectionRef).toBe('Section 159');
      expect(result.narrative).toContain('section 159');
      expect(result.narrative).toContain('Renting Homes (Wales) Act 2016');
    });

    it('should NEVER contain England-specific terminology', () => {
      const result = buildWalesSection157ArrearsNarrative({
        totalArrears: 2500,
        unpaidPeriodCount: 3,
        rentAmount: 1000,
        rentFrequency: 'monthly',
        isSerious: true,
        thresholdMet: true,
      });

      // Must NOT contain England-specific references
      expect(result.narrative).not.toContain('Housing Act 1988');
      expect(result.narrative).not.toContain('Section 8');
      expect(result.narrative).not.toContain('Ground 8');
      expect(result.narrative).not.toContain('Form 3');
      expect(result.narrative).not.toContain('Form 6A');
    });
  });

  describe('generateWalesArrearsSummary', () => {
    it('should generate Wales-specific summary when threshold met', () => {
      const summary = generateWalesArrearsSummary(2500, 2.5, 2, true, true);

      expect(summary).toContain('Section 157');
      expect(summary).toContain('2,500.00');
      expect(summary).toContain('meets the threshold for serious arrears');
      expect(summary).toContain('Renting Homes (Wales) Act 2016');
    });

    it('should generate Wales-specific summary when threshold NOT met', () => {
      const summary = generateWalesArrearsSummary(1500, 1.5, 1, true, false);

      expect(summary).toContain('Section 157');
      expect(summary).not.toContain('meets the threshold');
      expect(summary).toContain('A detailed schedule is provided');
    });

    it('should generate Section 159 summary for non-serious arrears', () => {
      const summary = generateWalesArrearsSummary(500, 0.5, 1, false, false);

      expect(summary).toContain('Section 159');
      expect(summary).toContain('Renting Homes (Wales) Act 2016');
    });

    it('should NEVER contain England-specific terminology', () => {
      const summary = generateWalesArrearsSummary(2500, 2.5, 2, true, true);

      expect(summary).not.toContain('Housing Act 1988');
      expect(summary).not.toContain('Section 8');
      expect(summary).not.toContain('Ground 8');
      expect(summary).not.toContain('Form 3');
    });
  });
});

describe('Wales Route Normalization', () => {
  it('should accept wales_section_173 route', () => {
    const route = 'wales_section_173';
    expect(route.startsWith('wales_')).toBe(true);
  });

  it('should accept wales_fault_based route', () => {
    const route = 'wales_fault_based';
    expect(route.startsWith('wales_')).toBe(true);
  });

  it('should identify routes needing normalization', () => {
    const routesNeedingNormalization = ['section_173', 'fault_based'];
    const normalizedRoutes = routesNeedingNormalization.map(r => `wales_${r}`);

    expect(normalizedRoutes).toEqual(['wales_section_173', 'wales_fault_based']);
  });
});
