import { describe, expect, it } from 'vitest';

import { listEnglandGroundDefinitions } from '@/lib/england-possession/ground-catalog';
import {
  getSelectedGroundDetailPanels,
  hasSelectedArrearsGrounds,
  hasSelectedGroundDetailPanels,
} from '../ground-detail-config';

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
});
