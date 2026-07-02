import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

import { listEnglandGroundDefinitions } from '@/lib/england-possession/ground-catalog';
import {
  getSelectedGroundDetailPanels,
  hasSelectedArrearsGrounds,
  hasSelectedGroundDetailPanels,
} from '../ground-detail-config';

const CANONICAL_REQUIRED_FACTS = new Set([
  'rent_amount',
  'rent_frequency',
  'arrears_total',
  'ground_particulars',
]);

function englandDecisionRules(): any {
  const rulesPath = path.join(
    process.cwd(),
    'config',
    'jurisdictions',
    'uk',
    'england',
    'decision_rules.yaml',
  );
  return yaml.load(fs.readFileSync(rulesPath, 'utf8'));
}

function codeFromRuleKey(key: string): string {
  return key.replace(/^ground_/, '').toUpperCase();
}

describe('Section 8 ground detail config', () => {
  it('shows detail panels for every non-arrears England ground', () => {
    const nonArrearsGrounds = listEnglandGroundDefinitions()
      .map((ground) => ground.code)
      .filter((code) => !['8', '10', '11'].includes(code));

    const panels = getSelectedGroundDetailPanels(nonArrearsGrounds.map((code) => `Ground ${code}`));

    expect(panels.map((panel) => panel.code).sort()).toEqual([...nonArrearsGrounds].sort());
    expect(panels.every((panel) => panel.fields.length > 0)).toBe(true);
  });

  it('keeps arrears grounds on the arrears schedule path', () => {
    expect(hasSelectedArrearsGrounds(['ground_8', 'Ground 10', 'Ground 11 - Persistent arrears'])).toBe(true);
    expect(hasSelectedGroundDetailPanels(['ground_8', 'Ground 10', 'Ground 11'])).toBe(false);
  });

  it('collects tailored facts for common non-arrears breach and conduct grounds', () => {
    const [breachPanel] = getSelectedGroundDetailPanels(['Ground 12']);
    const [conductPanel] = getSelectedGroundDetailPanels(['ground_14']);

    expect(breachPanel.fields.map((field) => field.field)).toEqual(
      expect.arrayContaining([
        'ground_12.tenancy_clause',
        'ground_12.breach_type',
        'ground_12.breach_dates',
        'ground_12.breach_evidence',
      ]),
    );
    expect(conductPanel.fields.map((field) => field.field)).toEqual(
      expect.arrayContaining([
        'ground_14.incidents_description',
        'ground_14.affected_parties',
        'ground_14.police_reference',
      ]),
    );
  });

  it('keeps England hard-required ground facts aligned with rendered wizard fields', () => {
    const rules = englandDecisionRules();
    const selectableCodes = new Set(listEnglandGroundDefinitions().map((ground) => ground.code));
    const configuredGrounds = {
      ...(rules.section_8_grounds?.mandatory ?? {}),
      ...(rules.section_8_grounds?.discretionary ?? {}),
    };

    for (const [groundKey, config] of Object.entries<any>(configuredGrounds)) {
      const code = codeFromRuleKey(groundKey);

      // Legacy/non-selectable rules can remain in the file for legal reference, but
      // they must not drive hidden wizard validation for current selectable grounds.
      if (!selectableCodes.has(code as any)) {
        continue;
      }

      const [panel] = getSelectedGroundDetailPanels([`Ground ${code}`]);
      const renderedFacts = new Set(panel?.fields.map((field) => field.field) ?? []);
      const allowedFacts = new Set([...CANONICAL_REQUIRED_FACTS, ...renderedFacts]);

      for (const fact of config.required_facts ?? []) {
        expect(
          allowedFacts.has(fact),
          `${groundKey} requires ${fact}, but that fact is not rendered by its wizard panel`,
        ).toBe(true);
      }
    }
  });
});
