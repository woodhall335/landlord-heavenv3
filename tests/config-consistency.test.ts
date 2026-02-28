/**
 * Single Source of Truth Test
 *
 * Ensures that notice period definitions are consistent across:
 * - TypeScript calculator (notice-date-calculator.ts)
 * - YAML config (decision_rules.yaml)
 * - JSON config (eviction_grounds.json)
 *
 * If this test fails, there is a drift between config sources that could
 * cause runtime inconsistencies in timeline estimates, UI helptext, or PDF generation.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { calculateSection8NoticePeriod } from '@/lib/documents/notice-date-calculator';

interface DecisionRulesYAML {
  section_8_grounds: {
    mandatory: Record<string, { notice_period_days: number }>;
    discretionary: Record<string, { notice_period_days: number }>;
  };
}

interface EvictionGroundsJSON {
  grounds: {
    [key: string]: {
      notice_period_days: number;
    };
  };
}

// Ground notice periods that MUST match across all sources
// Key = ground number, Value = expected days
// Source: Housing Act 1988, Schedule 2, as amended
const EXPECTED_NOTICE_PERIODS: Record<number, number> = {
  1: 60,   // 2 months - landlord previously occupied (mandatory)
  2: 60,   // 2 months - mortgage lender (mandatory)
  3: 14,   // 2 weeks - holiday let (mandatory)
  4: 14,   // 2 weeks - student let (mandatory)
  5: 60,   // 2 months - minister of religion (mandatory)
  6: 60,   // 2 months - demolition/reconstruction (mandatory)
  7: 60,   // 2 months - death of tenant (mandatory)
  8: 14,   // 2 weeks - serious rent arrears (mandatory)
  9: 60,   // 2 months - alternative accommodation (discretionary)
  10: 14,  // 2 weeks - some rent arrears (discretionary)
  11: 14,  // 2 weeks - persistent delay (discretionary)
  12: 14,  // 2 weeks - breach of tenancy (discretionary)
  13: 14,  // 2 weeks - deterioration of dwelling (discretionary)
  14: 14,  // 2 weeks (default) - nuisance/ASB (discretionary)
  15: 14,  // 2 weeks - deterioration of furniture (discretionary)
  17: 14,  // 2 weeks - false statement (discretionary)
};

describe('Config Consistency - Single Source of Truth', () => {
  let yamlConfig: DecisionRulesYAML;
  let jsonConfig: EvictionGroundsJSON;

  beforeAll(() => {
    // Load YAML config
    const yamlPath = join(process.cwd(), 'config/jurisdictions/uk/england/decision_rules.yaml');
    yamlConfig = yaml.load(readFileSync(yamlPath, 'utf-8')) as DecisionRulesYAML;

    // Load JSON config
    const jsonPath = join(process.cwd(), 'config/jurisdictions/uk/england/eviction_grounds.json');
    jsonConfig = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  });

  describe('Ground 10 (Some Rent Arrears) = 14 days', () => {
    it('TypeScript calculator returns 14 days', () => {
      const result = calculateSection8NoticePeriod({
        grounds: [{ code: 10, mandatory: false }],
      });
      expect(result.minimum_legal_days).toBe(14);
    });

    it('YAML decision_rules.yaml has 14 days', () => {
      const ground10 = yamlConfig.section_8_grounds.discretionary.ground_10;
      expect(ground10.notice_period_days).toBe(14);
    });

    it('JSON eviction_grounds.json has 14 days', () => {
      const ground10 = jsonConfig.grounds.ground_10;
      expect(ground10.notice_period_days).toBe(14);
    });
  });

  describe('Ground 11 (Persistent Delay) = 14 days', () => {
    it('TypeScript calculator returns 14 days', () => {
      const result = calculateSection8NoticePeriod({
        grounds: [{ code: 11, mandatory: false }],
      });
      expect(result.minimum_legal_days).toBe(14);
    });

    it('YAML decision_rules.yaml has 14 days', () => {
      const ground11 = yamlConfig.section_8_grounds.discretionary.ground_11;
      expect(ground11.notice_period_days).toBe(14);
    });

    it('JSON eviction_grounds.json has 14 days', () => {
      const ground11 = jsonConfig.grounds.ground_11;
      expect(ground11.notice_period_days).toBe(14);
    });
  });

  describe('All grounds match expected values', () => {
    it.each(Object.entries(EXPECTED_NOTICE_PERIODS))(
      'Ground %s should be %d days across all sources',
      (groundNum, expectedDays) => {
        const groundNumber = parseInt(groundNum);

        // Check TypeScript calculator
        const calcResult = calculateSection8NoticePeriod({
          grounds: [{ code: groundNumber, mandatory: groundNumber <= 8 }],
        });
        expect(calcResult.minimum_legal_days).toBe(expectedDays);

        // Check YAML config
        const yamlKey = `ground_${groundNumber}`;
        const yamlGround =
          yamlConfig.section_8_grounds.mandatory?.[yamlKey] ||
          yamlConfig.section_8_grounds.discretionary?.[yamlKey];

        if (yamlGround) {
          expect(yamlGround.notice_period_days).toBe(expectedDays);
        }

        // Check JSON config (nested under 'grounds')
        const jsonGround = jsonConfig.grounds?.[yamlKey];
        if (jsonGround) {
          expect(jsonGround.notice_period_days).toBe(expectedDays);
        }
      }
    );
  });

  describe('Mixed grounds use maximum notice period', () => {
    it('Ground 8 (14 days) + Ground 10 (14 days) = 14 days', () => {
      const result = calculateSection8NoticePeriod({
        grounds: [
          { code: 8, mandatory: true },
          { code: 10, mandatory: false },
        ],
      });
      expect(result.minimum_legal_days).toBe(14);
    });

    it('Ground 8 (14 days) + Ground 11 (14 days) = 14 days', () => {
      const result = calculateSection8NoticePeriod({
        grounds: [
          { code: 8, mandatory: true },
          { code: 11, mandatory: false },
        ],
      });
      expect(result.minimum_legal_days).toBe(14);
    });

    it('Ground 8 + Ground 10 + Ground 11 = 14 days (all arrears grounds)', () => {
      const result = calculateSection8NoticePeriod({
        grounds: [
          { code: 8, mandatory: true },
          { code: 10, mandatory: false },
          { code: 11, mandatory: false },
        ],
      });
      expect(result.minimum_legal_days).toBe(14);
    });
  });
});
