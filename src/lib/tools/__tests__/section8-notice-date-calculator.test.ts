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

  it('blocks Ground 1A when the notice expiry is before the 12-month ground availability date', () => {
    const result = calculateSection8NoticeDateResult({
      problem: 'sale',
      groundCodes: ['1A'],
      actionDate: '2026-05-29',
      serviceMethod: 'first_class_post',
      tenancyStartDate: '2026-01-01',
      noticeStatus: 'not_served',
    });

    expect(result.deemedServiceDate).toBe('2026-06-02');
    expect(result.earliestCourtDate).toBe('2026-10-02');
    expect(result.blockingIssues).toHaveLength(1);
    expect(result.blockingIssues[0]).toMatchObject({
      code: 'SECTION_8_BLOCKED',
      groundCode: '1A',
      earliestGroundExpiryDate: '2027-01-01',
      currentNoticeExpiryDate: '2026-10-02',
    });
    expect(result.blockingIssues[0].message).toContain('cannot be relied upon');
    expect(result.groundAvailability[0]).toMatchObject({
      groundCode: '1A',
      status: 'not_currently_available',
      statusLabel: 'Not currently available',
      earliestGroundExpiryDate: '2027-01-01',
    });
    expect(result.warnings.join(' ')).not.toContain('check whether it can be used');
  });

  it('marks Ground 1A available when the notice expiry is on or after the 12-month point', () => {
    const result = calculateSection8NoticeDateResult({
      problem: 'sale',
      groundCodes: ['1A'],
      actionDate: '2026-09-01',
      serviceMethod: 'hand_delivery',
      tenancyStartDate: '2026-01-01',
      noticeStatus: 'not_served',
    });

    expect(result.earliestCourtDate).toBe('2027-01-01');
    expect(result.blockingIssues).toEqual([]);
    expect(result.groundAvailability[0]).toMatchObject({
      groundCode: '1A',
      status: 'available',
      statusLabel: 'Available',
      earliestGroundExpiryDate: '2027-01-01',
    });
  });

  it('uses landlord-facing evidence labels for Ground 1A sale evidence', () => {
    const result = calculateSection8NoticeDateResult({
      problem: 'sale',
      groundCodes: ['1A'],
      actionDate: '2026-09-01',
      serviceMethod: 'hand_delivery',
      tenancyStartDate: '2026-01-01',
      noticeStatus: 'not_served',
    });

    expect(result.evidenceChecklist).toEqual(
      expect.arrayContaining([
        'Proof of ownership of the property',
        'Statement confirming the genuine intention to sell',
        'Supporting sale evidence, such as estate agent instruction, valuation, marketing plan, or sale preparation records',
      ]),
    );
    expect(result.evidenceChecklist).not.toContain('ownership proof');
    expect(result.evidenceChecklist).not.toContain('sale intention statement');
    expect(result.evidenceChecklist).not.toContain('sale evidence');
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
