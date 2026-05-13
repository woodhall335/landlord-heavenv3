import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('golden-pack sample-proof rollout pages', () => {
  it('keeps the shared sample-proof wiring on money claim and Section 13 product pages', () => {
    const moneyClaimSource = readSource('src/app/(marketing)/products/money-claim/page.tsx');
    const section13StandardSource = readSource(
      'src/app/(marketing)/products/section-13-standard/page.tsx'
    );
    const section13DefenceSource = readSource(
      'src/app/(marketing)/products/section-13-defence/page.tsx'
    );

    for (const source of [moneyClaimSource, section13StandardSource, section13DefenceSource]) {
      expect(source).toContain("import { GoldenPackProof }");
      expect(source).toContain("from '@/lib/marketing/golden-pack-proof'");
      expect(source).toContain('sampleProof ? (');
      expect(source).toContain('<GoldenPackProof data={sampleProof}');
      expect(source).toContain('samplePageHref={samplePage?.samplePath}');
    }

    expect(moneyClaimSource).toContain('sampleProof: sampleProof ? (');
    expect(section13StandardSource).toContain('earlyProofBand: {');
    expect(section13DefenceSource).toContain('earlyProofBand: {');
  });

  it('keeps the shared tenancy sample-proof wiring on all five England agreement pages', () => {
    const pages = [
      {
        path: 'src/app/standard-tenancy-agreement/page.tsx',
        key: 'england_standard_tenancy_agreement',
      },
      {
        path: 'src/app/premium-tenancy-agreement/page.tsx',
        key: 'england_premium_tenancy_agreement',
      },
      {
        path: 'src/app/student-tenancy-agreement/page.tsx',
        key: 'england_student_tenancy_agreement',
      },
      {
        path: 'src/app/hmo-shared-house-tenancy-agreement/page.tsx',
        key: 'england_hmo_shared_house_tenancy_agreement',
      },
      {
        path: 'src/app/lodger-agreement/page.tsx',
        key: 'england_lodger_agreement',
      },
    ];

    for (const page of pages) {
      const source = readSource(page.path);

      expect(source).toContain(`getGoldenPackProofData('${page.key}')`);
      expect(source).toContain('sampleProof:');
      expect(source).toContain('<GoldenPackProof data={');
    }
  });

  it('uses the Premium golden pack on the broad tenancy agreement template page', () => {
    const source = readSource('src/app/tenancy-agreement-template/page.tsx');

    expect(source).toContain("getGoldenPackProofData('england_premium_tenancy_agreement')");
    expect(source).toContain(
      "getProductSamplePageByPackKey('england_premium_tenancy_agreement')"
    );
    expect(source).toContain('<GoldenPackProof');
    expect(source).not.toContain('SampleAgreementPreview');
  });

  it('renders tenancy sample proof before the detailed pack breakdown in sales mode', () => {
    const source = readSource('src/components/seo/EnglandTenancyPage.tsx');
    const sampleProofIndex = source.indexOf(
      'salesContent.sampleProof ? ('
    );
    const packBreakdownIndex = source.indexOf('{(salesContent.defaultPackItems ?? []).map');

    expect(sampleProofIndex).toBeGreaterThanOrEqual(0);
    expect(packBreakdownIndex).toBeGreaterThan(sampleProofIndex);
  });
});
