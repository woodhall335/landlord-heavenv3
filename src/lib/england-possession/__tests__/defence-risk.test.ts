import { describe, expect, it } from 'vitest';

import {
  hasCompleteDefenceRiskAnswers,
  mergeDefenceRiskUpdate,
  normalizeDefenceRiskList,
  stringifyDefenceRiskList,
} from '@/lib/england-possession/defence-risk';

describe('England defence-risk helpers', () => {
  it('normalizes and stringifies counterclaim lists consistently', () => {
    expect(normalizeDefenceRiskList('disrepair set-off\n deposit penalty ; unlawful fees')).toEqual([
      'disrepair set-off',
      'deposit penalty',
      'unlawful fees',
    ]);
    expect(stringifyDefenceRiskList(['disrepair set-off', 'deposit penalty'])).toBe(
      'disrepair set-off\ndeposit penalty',
    );
  });

  it('requires the extra detail fields when a defence-risk answer is yes', () => {
    expect(
      hasCompleteDefenceRiskAnswers({
        tenant_disputes_claim: true,
        known_tenant_defences: '',
        disrepair_complaints: false,
        previous_court_proceedings: false,
        tenant_vulnerability: false,
        tenant_counterclaim_likely: false,
      }),
    ).toBe(false);

    expect(
      hasCompleteDefenceRiskAnswers({
        tenant_disputes_claim: true,
        known_tenant_defences: 'Tenant says the arrears are due to UC delay.',
        disrepair_complaints: true,
        disrepair_issues_list: 'Persistent mould in rear bedroom.',
        previous_court_proceedings: true,
        previous_proceedings_details: 'Earlier money claim stayed in February 2026.',
        tenant_vulnerability: true,
        tenant_vulnerability_details: 'Mental health support involvement disclosed to landlord.',
        tenant_counterclaim_likely: true,
        counterclaim_grounds: ['disrepair set-off'],
        payment_plan_offered: true,
        payment_plan_response: 'Plan agreed then broken after one payment.',
      }, { requireArrearsContext: true }),
    ).toBe(true);
  });

  it('merges risk updates into both top-level and nested risk payloads', () => {
    const updated = mergeDefenceRiskUpdate(
      {
        risk: {
          disrepair_complaints: false,
        },
      },
      {
        disrepair_complaints: true,
        disrepair_issues_list: 'Boiler failure',
      },
    );

    expect(updated.disrepair_complaints).toBe(true);
    expect(updated.disrepair_issues_list).toBe('Boiler failure');
    expect(updated.risk).toMatchObject({
      disrepair_complaints: true,
      disrepair_issues_list: 'Boiler failure',
    });
  });
});
