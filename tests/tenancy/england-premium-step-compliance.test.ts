/**
 * England Premium Step Compliance Tests
 *
 * Covers England-only premium wizard/data safeguards that should remain
 * aligned with the post-1 May 2026 framework and Tenant Fees Act limits.
 */

import { describe, expect, it } from 'vitest';
import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';

describe('England premium mapper safeguards', () => {
  it('downgrades old England tenant insurance requirements to a recommendation', () => {
    const astData = mapWizardToASTData({
      __meta: { jurisdiction: 'england', product: 'ast_premium' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      tenant_insurance_required: 'Required',
    });

    expect(astData.tenant_insurance_required).toBe('Strongly recommended');
  });

  it('strips late-payment admin fees for England output', () => {
    const astData = mapWizardToASTData({
      __meta: { jurisdiction: 'england', product: 'ast_premium' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      late_payment_admin_fee: 45,
    });

    expect(astData.late_payment_admin_fee).toBe(0);
  });
});

describe('England premium MQS copy contract', () => {
  it('does not present contents insurance as mandatory and softens cleaning/late fee wording', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const source = fs.readFileSync(
      path.join(process.cwd(), 'config/mqs/tenancy_agreement/england.yaml'),
      'utf8',
    );

    expect(source).toContain(
      'You can recommend contents insurance, but do not make it a compulsory paid service or a condition of the tenancy.',
    );
    expect(source).toContain(
      'Set terms for late rent interest only. In England, separate late-payment admin fees are generally prohibited.',
    );
    expect(source).toContain('Detailed checkout cleaning checklist required?');
    expect(source).toContain('Mention specialist carpet cleaning only if reasonably needed?');
    expect(source).toContain('Mention specialist oven cleaning only if reasonably needed?');
  });
});
