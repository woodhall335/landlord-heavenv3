import { describe, expect, it } from 'vitest';
import {
  bucketArrears,
  bucketMonthsInArrears,
  inferStageFromAskHeaven,
  inferStageFromToolCompletion,
} from '@/lib/journey/stage';

describe('journey stage bucketing', () => {
  it('buckets arrears amounts into stable bands', () => {
    expect(bucketArrears(0)).toBe('0-499');
    expect(bucketArrears(500)).toBe('500-999');
    expect(bucketArrears(1250)).toBe('1000-1999');
    expect(bucketArrears(2750)).toBe('2000-3999');
    expect(bucketArrears(9000)).toBe('4000+');
  });

  it('buckets months in arrears using arrears/rent ratio', () => {
    expect(bucketMonthsInArrears(200, 1000)).toBe('<1');
    expect(bucketMonthsInArrears(1500, 1000)).toBe('1-1.9');
    expect(bucketMonthsInArrears(2200, 1000)).toBe('2-2.9');
    expect(bucketMonthsInArrears(3200, 1000)).toBe('3+');
  });

  it('infers tool stages from derived metrics', () => {
    expect(inferStageFromToolCompletion('rent_arrears_calculator', { months_in_arrears_band: '<1' })).toBe('early_arrears');
    expect(inferStageFromToolCompletion('rent_arrears_calculator', { months_in_arrears_band: '2-2.9' })).toBe('notice_ready');
    expect(inferStageFromToolCompletion('rent_arrears_calculator', { months_in_arrears_band: '3+' })).toBe('court_ready');
    expect(inferStageFromToolCompletion('free_rent_demand_letter')).toBe('demand_sent');
  });

  it('infers ask-heaven stage using explainable keywords', () => {
    expect(inferStageFromAskHeaven('How do I serve section 8 notice?')).toBe('notice_ready');
    expect(inferStageFromAskHeaven('Can I issue an N5 possession claim?')).toBe('court_ready');
    expect(inferStageFromAskHeaven('Need demand letter for rent arrears')).toBe('demand_sent');
    expect(inferStageFromAskHeaven('Tenant paid late rent this month')).toBe('early_arrears');
    expect(inferStageFromAskHeaven('General compliance question')).toBe('unknown');
  });
});
