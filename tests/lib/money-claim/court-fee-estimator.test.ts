/**
 * Court Fee Estimator Tests
 *
 * Tests the HMCTS fee band calculations for money claims.
 */

import {
  calculateCourtFee,
  formatFee,
  getFeeSummary,
  isWithinMCOLLimit,
  getAdditionalFeesInfo,
} from '@/lib/money-claim/court-fee-estimator';

describe('Court Fee Estimator', () => {
  describe('calculateCourtFee', () => {
    it('returns zero fee for zero claim amount', () => {
      const result = calculateCourtFee(0);
      expect(result.paperFee).toBe(0);
      expect(result.onlineFee).toBe(0);
      expect(result.band).toBe('No claim amount');
    });

    it('returns zero fee for negative claim amount', () => {
      const result = calculateCourtFee(-100);
      expect(result.paperFee).toBe(0);
      expect(result.onlineFee).toBe(0);
    });

    it('calculates correct fee for claims up to £300', () => {
      const result = calculateCourtFee(250);
      expect(result.paperFee).toBe(35);
      expect(result.onlineFee).toBe(35);
      expect(result.band).toBe('Up to £300');
    });

    it('calculates correct fee for claims £300.01 to £500', () => {
      const result = calculateCourtFee(450);
      expect(result.paperFee).toBe(50);
      expect(result.onlineFee).toBe(50);
      expect(result.band).toBe('£300.01 to £500');
    });

    it('calculates correct fee for claims £500.01 to £1,000', () => {
      const result = calculateCourtFee(750);
      expect(result.paperFee).toBe(70);
      expect(result.onlineFee).toBe(70);
      expect(result.band).toBe('£500.01 to £1,000');
    });

    it('calculates correct fee for claims £1,000.01 to £1,500', () => {
      const result = calculateCourtFee(1200);
      expect(result.paperFee).toBe(80);
      expect(result.onlineFee).toBe(80);
      expect(result.band).toBe('£1,000.01 to £1,500');
    });

    it('calculates correct fee for claims £1,500.01 to £3,000', () => {
      const result = calculateCourtFee(2500);
      expect(result.paperFee).toBe(115);
      expect(result.onlineFee).toBe(115);
      expect(result.band).toBe('£1,500.01 to £3,000');
    });

    it('calculates online discount for claims £3,000.01 to £5,000', () => {
      const result = calculateCourtFee(4000);
      expect(result.paperFee).toBe(205);
      expect(result.onlineFee).toBe(185);
      expect(result.hasOnlineDiscount).toBe(true);
      expect(result.band).toBe('£3,000.01 to £5,000');
    });

    it('calculates online discount for claims £5,000.01 to £10,000', () => {
      const result = calculateCourtFee(7500);
      expect(result.paperFee).toBe(455);
      expect(result.onlineFee).toBe(410);
      expect(result.hasOnlineDiscount).toBe(true);
      expect(result.band).toBe('£5,000.01 to £10,000');
    });

    it('handles boundary case at exactly £300', () => {
      const result = calculateCourtFee(300);
      expect(result.paperFee).toBe(35);
      expect(result.band).toBe('Up to £300');
    });

    it('handles boundary case at £300.01', () => {
      const result = calculateCourtFee(300.01);
      expect(result.paperFee).toBe(50);
      expect(result.band).toBe('£300.01 to £500');
    });

    it('handles claims over £100,000 with percentage calculation', () => {
      const result = calculateCourtFee(150000);
      expect(result.paperFee).toBe(7500); // 5% of 150,000
      expect(result.onlineFee).toBe(7500);
      expect(result.band).toBe('Over £100,000 (5% of claim)');
    });

    it('caps fee at £10,000 for very large claims', () => {
      const result = calculateCourtFee(500000);
      expect(result.paperFee).toBe(10000); // Max fee cap
      expect(result.onlineFee).toBe(10000);
    });

    it('includes disclaimer in result', () => {
      const result = calculateCourtFee(1000);
      expect(result.disclaimer).toBeTruthy();
      expect(result.disclaimer.length).toBeGreaterThan(0);
    });
  });

  describe('formatFee', () => {
    it('formats fee as GBP currency', () => {
      expect(formatFee(35)).toBe('£35');
      expect(formatFee(455)).toBe('£455');
      expect(formatFee(10000)).toBe('£10,000');
    });

    it('handles zero', () => {
      expect(formatFee(0)).toBe('£0');
    });
  });

  describe('getFeeSummary', () => {
    it('recommends online filing for small claims', () => {
      const summary = getFeeSummary(500);
      expect(summary.recommended).toBe('online');
    });

    it('calculates savings correctly', () => {
      const summary = getFeeSummary(4000);
      expect(summary.savings).toBe(20); // 205 - 185
    });

    it('calculates total with fee correctly', () => {
      const summary = getFeeSummary(1000);
      expect(summary.totalWithFee).toBe(1070); // 1000 + 70
    });

    it('recommends paper for claims over £100,000', () => {
      const summary = getFeeSummary(150000);
      expect(summary.recommended).toBe('paper');
      expect(summary.savings).toBe(0);
    });
  });

  describe('isWithinMCOLLimit', () => {
    it('returns true for claims under £100,000', () => {
      expect(isWithinMCOLLimit(50000)).toBe(true);
      expect(isWithinMCOLLimit(100000)).toBe(true);
    });

    it('returns false for claims over £100,000', () => {
      expect(isWithinMCOLLimit(100001)).toBe(false);
      expect(isWithinMCOLLimit(200000)).toBe(false);
    });
  });

  describe('getAdditionalFeesInfo', () => {
    it('returns array of additional fees', () => {
      const fees = getAdditionalFeesInfo();
      expect(Array.isArray(fees)).toBe(true);
      expect(fees.length).toBeGreaterThan(0);
    });

    it('each fee has description and fee string', () => {
      const fees = getAdditionalFeesInfo();
      fees.forEach((fee) => {
        expect(fee.description).toBeTruthy();
        expect(fee.fee).toBeTruthy();
      });
    });

    it('includes enforcement fees', () => {
      const fees = getAdditionalFeesInfo();
      const hasWarrant = fees.some((f) => f.description.includes('Warrant'));
      expect(hasWarrant).toBe(true);
    });
  });
});
