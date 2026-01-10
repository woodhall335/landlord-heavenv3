/**
 * Notice Period Utils Tests
 *
 * Regression tests for Section 8 notice period calculations.
 * Ensures legally correct notice periods when multiple grounds are included.
 */

import { describe, it, expect } from 'vitest';
import {
  SECTION8_GROUND_NOTICE_PERIODS,
  normalizeGroundCode,
  getGroundNoticePeriod,
  calculateCombinedNoticePeriod,
  compareNoticePeriods,
  isArrearsGround,
  hasArrearsGround,
  getGroundType,
  getGroundDescription,
} from '../../../src/lib/grounds/notice-period-utils';

describe('normalizeGroundCode', () => {
  it('should handle numeric ground codes', () => {
    expect(normalizeGroundCode(8)).toBe('8');
    expect(normalizeGroundCode(10)).toBe('10');
    expect(normalizeGroundCode(14)).toBe('14');
  });

  it('should handle string ground codes', () => {
    expect(normalizeGroundCode('8')).toBe('8');
    expect(normalizeGroundCode('10')).toBe('10');
  });

  it('should handle "Ground X" format', () => {
    expect(normalizeGroundCode('Ground 8')).toBe('8');
    expect(normalizeGroundCode('GROUND 10')).toBe('10');
    expect(normalizeGroundCode('ground 11')).toBe('11');
  });

  it('should handle special grounds like 7A, 7B, 14A', () => {
    expect(normalizeGroundCode('7A')).toBe('7A');
    expect(normalizeGroundCode('7B')).toBe('7B');
    expect(normalizeGroundCode('14A')).toBe('14A');
    expect(normalizeGroundCode('Ground 14A')).toBe('14A');
  });
});

describe('getGroundNoticePeriod', () => {
  it('should return 14 days for Ground 8 (serious arrears)', () => {
    expect(getGroundNoticePeriod('8')).toBe(14);
    expect(getGroundNoticePeriod(8)).toBe(14);
    expect(getGroundNoticePeriod('Ground 8')).toBe(14);
  });

  it('should return 60 days for Ground 10 (some rent arrears)', () => {
    expect(getGroundNoticePeriod('10')).toBe(60);
    expect(getGroundNoticePeriod(10)).toBe(60);
    expect(getGroundNoticePeriod('Ground 10')).toBe(60);
  });

  it('should return 60 days for Ground 11 (persistent late payment)', () => {
    expect(getGroundNoticePeriod('11')).toBe(60);
    expect(getGroundNoticePeriod(11)).toBe(60);
  });

  it('should return 14 days for Ground 14 (nuisance/ASB)', () => {
    expect(getGroundNoticePeriod('14')).toBe(14);
    expect(getGroundNoticePeriod(14)).toBe(14);
  });

  it('should return 0 days for Ground 14A (domestic violence)', () => {
    expect(getGroundNoticePeriod('14A')).toBe(0);
  });

  it('should return 14 days for unknown grounds (safe default)', () => {
    expect(getGroundNoticePeriod('99')).toBe(14);
    expect(getGroundNoticePeriod('unknown')).toBe(14);
  });
});

describe('calculateCombinedNoticePeriod', () => {
  describe('Single ground scenarios', () => {
    it('Ground 8 only => 14 days', () => {
      const result = calculateCombinedNoticePeriod(['8']);
      expect(result.noticePeriodDays).toBe(14);
    });

    it('Ground 10 only => 60 days', () => {
      const result = calculateCombinedNoticePeriod(['10']);
      expect(result.noticePeriodDays).toBe(60);
    });

    it('Ground 11 only => 60 days', () => {
      const result = calculateCombinedNoticePeriod(['11']);
      expect(result.noticePeriodDays).toBe(60);
    });

    it('Ground 14 only => 14 days', () => {
      const result = calculateCombinedNoticePeriod(['14']);
      expect(result.noticePeriodDays).toBe(14);
    });
  });

  describe('Multiple ground scenarios - uses MAX', () => {
    it('Ground 8 (14 days) + Ground 10 (60 days) => 60 days', () => {
      const result = calculateCombinedNoticePeriod(['8', '10']);
      expect(result.noticePeriodDays).toBe(60);
      expect(result.drivingGrounds).toContain('Ground 10');
    });

    it('Ground 8 (14 days) + Ground 11 (60 days) => 60 days', () => {
      const result = calculateCombinedNoticePeriod(['8', '11']);
      expect(result.noticePeriodDays).toBe(60);
      expect(result.drivingGrounds).toContain('Ground 11');
    });

    it('Ground 8 + Ground 10 + Ground 11 => 60 days', () => {
      const result = calculateCombinedNoticePeriod(['8', '10', '11']);
      expect(result.noticePeriodDays).toBe(60);
      // Both 10 and 11 should be driving grounds
      expect(result.drivingGrounds).toContain('Ground 10');
      expect(result.drivingGrounds).toContain('Ground 11');
    });

    it('Ground 8 + Ground 14 => 14 days (both are 14-day grounds)', () => {
      const result = calculateCombinedNoticePeriod(['8', '14']);
      expect(result.noticePeriodDays).toBe(14);
    });

    it('Ground 12 (14 days) + Ground 1 (60 days) => 60 days', () => {
      const result = calculateCombinedNoticePeriod(['12', '1']);
      expect(result.noticePeriodDays).toBe(60);
      expect(result.drivingGrounds).toContain('Ground 1');
    });
  });

  describe('Edge cases', () => {
    it('Empty grounds array => 14 days (default)', () => {
      const result = calculateCombinedNoticePeriod([]);
      expect(result.noticePeriodDays).toBe(14);
    });

    it('handles Ground 14A (0 days) correctly', () => {
      const result = calculateCombinedNoticePeriod(['14A']);
      expect(result.noticePeriodDays).toBe(0);
    });

    it('Ground 14A (0 days) + Ground 8 (14 days) => 14 days', () => {
      const result = calculateCombinedNoticePeriod(['14A', '8']);
      expect(result.noticePeriodDays).toBe(14);
    });
  });

  describe('Explanation generation', () => {
    it('includes correct explanation for 60-day periods', () => {
      const result = calculateCombinedNoticePeriod(['10']);
      expect(result.explanation).toContain('60 days');
      expect(result.explanation).toContain('2 months');
    });

    it('includes correct explanation for 14-day periods', () => {
      const result = calculateCombinedNoticePeriod(['8', '14']);
      expect(result.explanation).toContain('14 days');
    });
  });
});

describe('compareNoticePeriods', () => {
  it('detects when adding recommended grounds increases notice period', () => {
    const selected = ['8']; // 14 days
    const recommended = ['10', '11']; // 60 days each

    const result = compareNoticePeriods(selected, recommended);

    expect(result.selectedPeriod).toBe(14);
    expect(result.combinedPeriod).toBe(60);
    expect(result.increasesNotice).toBe(true);
    expect(result.increaseAmount).toBe(46);
    expect(result.explanation).toContain('increase');
  });

  it('detects when adding recommended grounds does NOT increase notice period', () => {
    const selected = ['10']; // 60 days
    const recommended = ['8', '14']; // 14 days each

    const result = compareNoticePeriods(selected, recommended);

    expect(result.selectedPeriod).toBe(60);
    expect(result.combinedPeriod).toBe(60);
    expect(result.increasesNotice).toBe(false);
    expect(result.increaseAmount).toBe(0);
    expect(result.explanation).toContain('remains');
  });

  it('handles empty recommended array', () => {
    const result = compareNoticePeriods(['8'], []);
    expect(result.selectedPeriod).toBe(14);
    expect(result.combinedPeriod).toBe(14);
    expect(result.increasesNotice).toBe(false);
  });
});

describe('isArrearsGround', () => {
  it('returns true for Ground 8', () => {
    expect(isArrearsGround('8')).toBe(true);
    expect(isArrearsGround(8)).toBe(true);
    expect(isArrearsGround('Ground 8')).toBe(true);
  });

  it('returns true for Ground 10', () => {
    expect(isArrearsGround('10')).toBe(true);
    expect(isArrearsGround(10)).toBe(true);
  });

  it('returns true for Ground 11', () => {
    expect(isArrearsGround('11')).toBe(true);
    expect(isArrearsGround(11)).toBe(true);
  });

  it('returns false for non-arrears grounds', () => {
    expect(isArrearsGround('14')).toBe(false);
    expect(isArrearsGround('12')).toBe(false);
    expect(isArrearsGround('1')).toBe(false);
  });
});

describe('hasArrearsGround', () => {
  it('returns true when any arrears ground is present', () => {
    expect(hasArrearsGround(['8'])).toBe(true);
    expect(hasArrearsGround(['10'])).toBe(true);
    expect(hasArrearsGround(['11'])).toBe(true);
    expect(hasArrearsGround(['8', '14'])).toBe(true);
  });

  it('returns false when no arrears grounds are present', () => {
    expect(hasArrearsGround(['14'])).toBe(false);
    expect(hasArrearsGround(['12', '13'])).toBe(false);
    expect(hasArrearsGround([])).toBe(false);
  });
});

describe('getGroundType', () => {
  it('identifies mandatory grounds', () => {
    expect(getGroundType('8')).toBe('mandatory');
    expect(getGroundType('1')).toBe('mandatory');
    expect(getGroundType('2')).toBe('mandatory');
    expect(getGroundType('7A')).toBe('mandatory');
  });

  it('identifies discretionary grounds', () => {
    expect(getGroundType('10')).toBe('discretionary');
    expect(getGroundType('11')).toBe('discretionary');
    expect(getGroundType('12')).toBe('discretionary');
    expect(getGroundType('14')).toBe('discretionary');
  });
});

describe('getGroundDescription', () => {
  it('returns correct info for Ground 8', () => {
    const info = getGroundDescription('8');
    expect(info.code).toBe('8');
    expect(info.title).toContain('arrears');
    expect(info.type).toBe('mandatory');
    expect(info.noticePeriodDays).toBe(14);
  });

  it('returns correct info for Ground 10', () => {
    const info = getGroundDescription('10');
    expect(info.code).toBe('10');
    expect(info.title).toContain('arrears');
    expect(info.type).toBe('discretionary');
    expect(info.noticePeriodDays).toBe(60);
  });
});

describe('Config consistency', () => {
  it('SECTION8_GROUND_NOTICE_PERIODS should have correct values for key grounds', () => {
    // These are the legally mandated notice periods
    expect(SECTION8_GROUND_NOTICE_PERIODS['8']).toBe(14);
    expect(SECTION8_GROUND_NOTICE_PERIODS['10']).toBe(60); // CRITICAL: 2 months, NOT 2 weeks
    expect(SECTION8_GROUND_NOTICE_PERIODS['11']).toBe(60); // CRITICAL: 2 months, NOT 2 weeks
    expect(SECTION8_GROUND_NOTICE_PERIODS['14']).toBe(14);
    expect(SECTION8_GROUND_NOTICE_PERIODS['14A']).toBe(0);
  });
});
