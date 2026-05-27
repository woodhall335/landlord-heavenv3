import { describe, expect, it } from 'vitest';
import {
  calculateSection8NoticeDateResult,
  getDefaultSection8GroundsForProblem,
} from '../section8-notice-date-calculator';

describe('section 8 notice date calculator', () => {
  it('calculates Ground 8 timing from deemed postal service', () => {
    const result = calculateSection8NoticeDateResult({
      problem: 'serious_arrears',
      groundCodes: ['8'],
      actionDate: '2026-05-27',
      serviceMethod: 'first_class_post',
      noticeStatus: 'not_served',
    });

    expect(result.deemedServiceDate).toBe('2026-05-29');
    expect(result.earliestCourtDate).toBe('2026-06-26');
    expect(result.noticePeriodDays).toBe(28);
    expect(result.noticePeriodLabel).toBe('4 weeks');
    expect(result.nextStep.href).toBe('/products/notice-only');
    expect(result.evidenceChecklist).toEqual(
      expect.arrayContaining([
        'Up-to-date rent schedule showing each payment due and received',
        'Proof of service plan, plus N215 certificate of service if the case later goes to court',
      ])
    );
  });

  it('uses the longest selected notice period for mixed grounds', () => {
    const result = calculateSection8NoticeDateResult({
      problem: 'sale',
      groundCodes: ['1A', '12'],
      actionDate: '2026-05-27',
      serviceMethod: 'hand_delivery',
      tenancyStartDate: '2025-01-01',
      noticeStatus: 'not_served',
    });

    expect(result.noticePeriodLabel).toBe('4 months');
    expect(result.earliestCourtDate).toBe('2026-09-27');
  });

  it('warns when a restricted sale or occupation ground may be too early', () => {
    const result = calculateSection8NoticeDateResult({
      problem: 'sale',
      groundCodes: ['1A'],
      actionDate: '2026-05-27',
      serviceMethod: 'hand_delivery',
      tenancyStartDate: '2026-01-01',
      noticeStatus: 'not_served',
    });

    expect(result.warnings.join(' ')).toContain('before 01 January 2027');
  });

  it('sends expired notices to the court pack upsell', () => {
    const result = calculateSection8NoticeDateResult({
      problem: 'serious_arrears',
      groundCodes: ['8', '10', '11'],
      actionDate: '2026-04-01',
      serviceMethod: 'hand_delivery',
      noticeStatus: 'expired_tenant_still_there',
    });

    expect(result.nextStep.href).toBe('/products/complete-pack');
    expect(result.nextStep.label).toBe('Prepare my court papers');
  });

  it('provides sensible default grounds for landlord problem choices', () => {
    expect(getDefaultSection8GroundsForProblem('serious_arrears')).toEqual(['8', '10', '11']);
    expect(getDefaultSection8GroundsForProblem('landlord_family')).toEqual(['1']);
  });
});
