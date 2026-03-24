import { describe, expect, it } from 'vitest';

import {
  getEnglandMissingPurposeWarning,
  getEnglandTenancyPurpose,
  isEnglandPostReformTenancy,
  normalizeEnglandTenancyPurpose,
  normalizeIsoDateString,
} from '@/lib/tenancy/england-reform';

describe('england-reform', () => {
  it('defaults missing purpose to new agreement for backwards compatibility', () => {
    expect(getEnglandTenancyPurpose(undefined)).toBe('new_agreement');
  });

  it('normalizes known England tenancy purposes and rejects unknown values', () => {
    expect(normalizeEnglandTenancyPurpose(' existing_written_tenancy ')).toBe(
      'existing_written_tenancy'
    );
    expect(normalizeEnglandTenancyPurpose('other')).toBeUndefined();
  });

  it('only accepts canonical ISO calendar dates for England reform checks', () => {
    expect(normalizeIsoDateString('2026-05-01')).toBe('2026-05-01');
    expect(normalizeIsoDateString(' 2026-05-01 ')).toBe('2026-05-01');
    expect(normalizeIsoDateString('2026-05')).toBeUndefined();
    expect(normalizeIsoDateString('2026-05-01T00:00:00Z')).toBeUndefined();
    expect(normalizeIsoDateString('2026-02-30')).toBeUndefined();
  });

  it('only treats England new agreements starting on or after 1 May 2026 as post-reform', () => {
    expect(isEnglandPostReformTenancy({
      jurisdiction: 'england',
      tenancyStartDate: '2026-05-01',
      purpose: 'new_agreement',
    })).toBe(true);

    expect(isEnglandPostReformTenancy({
      jurisdiction: 'england',
      tenancyStartDate: '2026-05-01',
      purpose: 'existing_written_tenancy',
    })).toBe(false);

    expect(isEnglandPostReformTenancy({
      jurisdiction: 'england',
      tenancyStartDate: '2026-04-30',
      purpose: 'new_agreement',
    })).toBe(false);

    expect(isEnglandPostReformTenancy({
      jurisdiction: 'wales',
      tenancyStartDate: '2026-06-01',
      purpose: 'new_agreement',
    })).toBe(false);
  });

  it('does not treat missing or invalid dates as post-reform starts', () => {
    expect(
      isEnglandPostReformTenancy({
        jurisdiction: 'england',
        tenancyStartDate: undefined,
        purpose: 'new_agreement',
      })
    ).toBe(false);

    expect(
      isEnglandPostReformTenancy({
        jurisdiction: 'england',
        tenancyStartDate: '2026-05',
        purpose: 'new_agreement',
      })
    ).toBe(false);
  });

  it('returns a review warning for England cases with missing purpose after 1 May 2026', () => {
    expect(
      getEnglandMissingPurposeWarning({
        jurisdiction: 'england',
        tenancyStartDate: '2026-05-02',
        purpose: undefined,
      })
    ).toContain('1 May 2026');
  });

  it('returns a transition warning for England cases with missing purpose before 1 May 2026', () => {
    expect(
      getEnglandMissingPurposeWarning({
        jurisdiction: 'england',
        tenancyStartDate: '2026-04-30',
        purpose: undefined,
      })
    ).toContain('31 May 2026');
  });

  it('does not warn when the case is non-England or purpose is already recorded', () => {
    expect(
      getEnglandMissingPurposeWarning({
        jurisdiction: 'wales',
        tenancyStartDate: '2026-05-02',
        purpose: undefined,
      })
    ).toBeUndefined();

    expect(
      getEnglandMissingPurposeWarning({
        jurisdiction: 'england',
        tenancyStartDate: '2026-05-02',
        purpose: 'new_agreement',
      })
    ).toBeUndefined();
  });
});
