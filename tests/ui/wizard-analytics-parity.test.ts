import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('wizard analytics parity', () => {
  it('tracks Section 13 step completion and in-flow review milestones', () => {
    const source = readSource('src/components/wizard/flows/Section13WizardFlow.tsx');

    expect(source).toContain('trackWizardStepCompleteWithAttribution');
    expect(source).toContain('trackWizardReviewViewWithAttribution');
    expect(source).toContain('markStepCompleted(currentStep.id');
    expect(source).toContain("currentStep.id !== 'preview_checkout'");
    expect(source).toContain('trackCurrentStepComplete();');
  });

  it('tracks standalone England tenancy agreement steps with exact product SKUs', () => {
    const source = readSource('src/components/wizard/flows/ResidentialStandaloneSectionFlow.tsx');

    expect(source).toContain('trackWizardStepCompleteWithAttribution');
    expect(source).toContain('markStepCompleted(step.id');
    expect(source).toContain('product,');
    expect(source).toContain('step: step.id');
    expect(source).not.toContain("product: 'tenancy_agreement'");
  });

  it('keeps money claim and main tenancy step tracking in place', () => {
    const moneyClaimSource = readSource('src/components/wizard/flows/MoneyClaimSectionFlow.tsx');
    const tenancySource = readSource('src/components/wizard/flows/TenancySectionFlow.tsx');

    expect(moneyClaimSource).toContain('trackWizardStepCompleteWithAttribution');
    expect(moneyClaimSource).toContain("product: 'money_claim'");
    expect(moneyClaimSource).toContain('markStepCompleted(current.id');

    expect(tenancySource).toContain('trackWizardStepCompleteWithAttribution');
    expect(tenancySource).toContain("product: product || 'tenancy_agreement'");
    expect(tenancySource).toContain('markStepCompleted(current.id');
  });

  it('tracks checkout starts when resuming a pending checkout session', () => {
    const sharedPreviewSource = readSource('src/app/(app)/wizard/preview/[caseId]/page.tsx');
    const legacyPreviewSource = readSource('src/components/preview/PreviewPageLayout.tsx');

    for (const source of [sharedPreviewSource, legacyPreviewSource]) {
      const pendingBranch = source.slice(
        source.indexOf("if (data.status === 'pending')"),
        source.indexOf('// New checkout session')
      );

      expect(pendingBranch).toContain('trackBeginCheckout(product, productName, priceValue, caseId)');
      expect(pendingBranch).toContain('trackCheckoutStarted({ product, caseId })');
      expect(pendingBranch).toContain('window.location.href = data.checkout_url');
    }
  });
});
