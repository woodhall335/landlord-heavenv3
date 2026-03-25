/**
 * England Terms Step Alignment Tests
 *
 * Confirms the England tenancy terms step no longer offers break clauses,
 * and that the England-specific wording is aligned to the post-1 May 2026
 * assured periodic flow.
 */

import { describe, expect, it } from 'vitest';
import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';

describe('England terms step mapping guard', () => {
  it('strips break clause data for new England tenancies from 1 May 2026', () => {
    const astData = mapWizardToASTData({
      __meta: { jurisdiction: 'england', product: 'ast_standard' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      break_clause: true,
      break_clause_months: '6 months',
      break_clause_notice_period: '2 months',
    });

    expect(astData.break_clause).toBe(false);
    expect(astData.break_clause_months).toBeUndefined();
    expect(astData.break_clause_notice_period).toBeUndefined();
  });
});

describe('England terms step copy contract', () => {
  it('uses England-specific pets, access, and cleaning wording and hides break clause UI', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/wizard/flows/TenancySectionFlow.tsx'),
      'utf8',
    );

    expect(source).toContain(
      "label={isEngland ? 'Will any pets be authorised at the start?' : 'Are pets allowed?'}",
    );
    expect(source).toContain(
      "A tenant can still ask for written pet consent later, and requests should be considered reasonably.",
    );
    expect(source).toContain(
      "label={isEngland ? 'Notice before non-emergency access' : 'Notice before access'}",
    );
    expect(source).toContain(
      "24 hours is the usual minimum for routine access unless there is an emergency.",
    );
    expect(source).toContain(
      "Require return to the same standard of cleanliness at the end?",
    );
    expect(source).toContain(
      'Do not require a paid professional clean in every case.',
    );
    expect(source).toContain('{!isEngland && (');
  });

  it('keeps the England MQS wording aligned with the live terms step', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const source = fs.readFileSync(
      path.join(process.cwd(), 'config/mqs/tenancy_agreement/england.yaml'),
      'utf8',
    );

    expect(source).toContain(
      'Set agreed pet, smoking, and subletting rules. For England, pet requests should be considered reasonably and recorded in writing.',
    );
    expect(source).toContain('Will any pets be authorised at the start?');
    expect(source).toContain(
      "For England, non-emergency entry should usually be on at least 24 hours' notice and at a reasonable time.",
    );
    expect(source).toContain('Require return to the same standard of cleanliness at the end?');
    expect(source).toContain('No general alterations without written permission');
  });
});
