/**
 * Wales Rule Selection Tests
 * CLAUDE CODE FIX #2: Tests UTC date parsing rule selection
 *
 * These are unit tests that mock the config loading.
 * They verify rule selection logic without file system access.
 */

import { getWalesSection173Rule, getWalesFaultBasedRule } from '../wales-notice-periods';

// Mock the config loading to avoid file system in tests
jest.mock('../wales-notice-periods', () => {
  const actualModule = jest.requireActual('../wales-notice-periods');

  return {
    ...actualModule,
    loadWalesNoticePeriods: jest.fn().mockResolvedValue({
      section_173_no_fault: {
        rules: [
          {
            effective_from: '2016-12-01',
            period_months: 2,
            period_days: 60,
            legal_reference: 'Renting Homes (Wales) Act 2016, s.173 (original)',
            notes: 'Initial implementation',
          },
          {
            effective_from: '2022-12-01',
            period_months: 6,
            period_days: 180,
            legal_reference: 'Renting Homes (Wales) Act 2016, s.173 (as amended 2022)',
            notes: 'Increased to 6 months',
          },
        ],
      },
      prohibited_period: {
        months: 6,
      },
      fault_based_sections: {
        section_157: {
          period_days: 14,
          description: 'Serious rent arrears (at least 2 months unpaid)',
          legal_reference: 'Renting Homes (Wales) Act 2016, s.157',
        },
        section_159: {
          period_days: 30,
          description: 'Some rent arrears (less than 2 months)',
          legal_reference: 'Renting Homes (Wales) Act 2016, s.159',
        },
        section_161: {
          period_days: 14,
          description: 'Anti-social behaviour (serious)',
          legal_reference: 'Renting Homes (Wales) Act 2016, s.161',
        },
        section_162: {
          period_days: 30,
          description: 'Breach of occupation contract',
          legal_reference: 'Renting Homes (Wales) Act 2016, s.162',
        },
      },
    }),
  };
});

describe('Wales Section 173 Rule Selection (UTC Date Parsing)', () => {
  test('selects 2-month rule for historic date (2017)', async () => {
    const rule = await getWalesSection173Rule('2017-06-01');

    expect(rule.notice_period_months).toBe(2);
    expect(rule.notice_period_days).toBe(60);
    expect(rule.effective_from).toBe('2016-12-01');
    expect(rule.legal_reference).toContain('original');
  });

  test('selects 6-month rule for current date (2023)', async () => {
    const rule = await getWalesSection173Rule('2023-06-01');

    expect(rule.notice_period_months).toBe(6);
    expect(rule.notice_period_days).toBe(180);
    expect(rule.effective_from).toBe('2022-12-01');
    expect(rule.legal_reference).toContain('amended 2022');
  });

  test('selects 6-month rule for date on rule effective date (2022-12-01)', async () => {
    // CLAUDE CODE FIX #2: Should use new rule on exact effective date
    const rule = await getWalesSection173Rule('2022-12-01');

    expect(rule.notice_period_months).toBe(6);
    expect(rule.effective_from).toBe('2022-12-01');
  });

  test('selects 2-month rule for date just before new rule (2022-11-30)', async () => {
    const rule = await getWalesSection173Rule('2022-11-30');

    expect(rule.notice_period_months).toBe(2);
    expect(rule.effective_from).toBe('2016-12-01');
  });

  test('throws error for date before any rule', async () => {
    await expect(getWalesSection173Rule('2015-01-01')).rejects.toThrow(
      'No Wales Section 173 rule found'
    );
  });

  test('selects latest applicable rule when multiple match', async () => {
    // Both rules are effective, should pick latest
    const rule = await getWalesSection173Rule('2023-01-01');

    expect(rule.effective_from).toBe('2022-12-01'); // Latest rule
    expect(rule.notice_period_months).toBe(6);
  });

  test('uses current date when no service date provided', async () => {
    // No service date = use current date
    const rule = await getWalesSection173Rule();

    // Should be 6 months (current rule)
    expect(rule.notice_period_months).toBe(6);
  });

  test('includes prohibited period in result', async () => {
    const rule = await getWalesSection173Rule('2023-01-01');

    expect(rule.prohibited_period_months).toBe(6);
  });
});

describe('Wales Fault-Based Section Extraction', () => {
  test('extracts Section 157 from "Section 157 - Serious rent arrears"', async () => {
    const rule = await getWalesFaultBasedRule('Section 157 - Serious rent arrears');

    expect(rule.period_days).toBe(14);
    expect(rule.description).toContain('Serious rent arrears');
    expect(rule.legal_reference).toContain('s.157');
  });

  test('extracts Section 159 (case insensitive)', async () => {
    const rule = await getWalesFaultBasedRule('section 159 - Some arrears');

    expect(rule.period_days).toBe(30);
    expect(rule.description).toContain('Some rent arrears');
  });

  test('extracts Section 161', async () => {
    const rule = await getWalesFaultBasedRule('Section 161 - ASB');

    expect(rule.period_days).toBe(14);
    expect(rule.description).toContain('Anti-social');
  });

  test('extracts Section 162', async () => {
    const rule = await getWalesFaultBasedRule('Section 162 - Breach');

    expect(rule.period_days).toBe(30);
    expect(rule.description).toContain('Breach');
  });

  test('throws error for unknown section format', async () => {
    await expect(getWalesFaultBasedRule('Invalid format')).rejects.toThrow(
      'Unknown Wales section format'
    );
  });

  test('throws error for unsupported section number', async () => {
    await expect(getWalesFaultBasedRule('Section 999 - Unknown')).rejects.toThrow(
      'Unknown Wales section: section_999'
    );
  });

  test('handles section number only format', async () => {
    const rule = await getWalesFaultBasedRule('Section 157');

    expect(rule.period_days).toBe(14);
  });
});

describe('Wales Config Structure', () => {
  test('all fault-based sections have required fields', async () => {
    const sections = [157, 159, 161, 162];

    for (const sectionNum of sections) {
      const rule = await getWalesFaultBasedRule(`Section ${sectionNum}`);

      expect(rule.period_days).toBeGreaterThan(0);
      expect(rule.description).toBeTruthy();
      expect(rule.legal_reference).toContain(`s.${sectionNum}`);
    }
  });

  test('Section 173 rules are chronologically ordered', async () => {
    // Get rules for different dates to verify ordering
    const rule2017 = await getWalesSection173Rule('2017-01-01');
    const rule2023 = await getWalesSection173Rule('2023-01-01');

    expect(new Date(rule2017.effective_from)).toBeLessThan(
      new Date(rule2023.effective_from)
    );
  });
});
