import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function readRepoFile(...segments: string[]): string {
  return readFileSync(join(process.cwd(), ...segments), 'utf8');
}

describe('paid wizard preview copy contract', () => {
  it('uses document-preview language on the money claim final action', () => {
    const moneyClaimFlow = readRepoFile('src', 'components', 'wizard', 'flows', 'MoneyClaimSectionFlow.tsx');

    expect(moneyClaimFlow).toContain('Continue to document preview');
    expect(moneyClaimFlow).toContain("description: 'Review the claim details and continue to the locked document preview'");
    expect(moneyClaimFlow).toContain('product=money_claim');
    expect(moneyClaimFlow).not.toContain('Continue to generate your money claim documents');
    expect(moneyClaimFlow).not.toContain('Fix blockers, then generate the money claim pack.');
  });

  it('keeps tenancy review copy aligned with the locked-preview checkout flow', () => {
    const tenancyFlow = readRepoFile('src', 'components', 'wizard', 'flows', 'TenancySectionFlow.tsx');

    expect(tenancyFlow).toContain('Continue to document preview');
    expect(tenancyFlow).toContain('Ready for preview');
    expect(tenancyFlow).toContain('locked document preview');
    expect(tenancyFlow).toContain('product=${product}');
    expect(tenancyFlow).not.toContain('Ready to Generate');
    expect(tenancyFlow).not.toContain('Ready to generate');
    expect(tenancyFlow).not.toContain('continue to generate them');
  });

  it('keeps Section 13 output wording separate from the unpaid preview step', () => {
    const section13Flow = readRepoFile('src', 'components', 'wizard', 'flows', 'Section13WizardFlow.tsx');

    expect(section13Flow).toContain('Review & pack choice');
    expect(section13Flow).toContain('Continue to document preview');
    expect(section13Flow).toContain('Download and manage outputs');
    expect(section13Flow).toContain('Save and come back later');
    expect(section13Flow).not.toContain('Email a recovery link');
    expect(section13Flow).not.toContain('Generate and manage outputs');
  });
});
