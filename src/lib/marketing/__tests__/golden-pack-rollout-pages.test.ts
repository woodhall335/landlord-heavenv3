import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('golden-pack sample-proof rollout pages', () => {
  it('keeps the shared post-hero proof block on money claim and Section 13 product pages', () => {
    const moneyClaimSource = readSource('src/app/(marketing)/products/money-claim/page.tsx');
    const section13StandardSource = readSource(
      'src/app/(marketing)/products/section-13-standard/page.tsx'
    );
    const section13DefenceSource = readSource(
      'src/app/(marketing)/products/section-13-defence/page.tsx'
    );

    for (const source of [
      moneyClaimSource,
      section13StandardSource,
      section13DefenceSource,
    ]) {
      expect(source).toContain("import { GoldenPackProof }");
      expect(source).toContain("from '@/lib/marketing/golden-pack-proof'");
      expect(source).toContain('postHeroContent: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined');
    }
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

  it('renders tenancy sample proof immediately after the hero and before legacy/context content', () => {
    const source = readSource('src/components/seo/EnglandTenancyPage.tsx');
    const heroIndex = source.indexOf('<UniversalHero');
    const sampleProofIndex = source.indexOf(
      "isSalesMode && salesContent?.sampleProof ? ("
    );
    const legacyNoticeIndex = source.indexOf('{legacyNotice ? (');
    const contextPanelIndex = source.indexOf(
      '{pagePath && !isSalesMode ? <SeoPageContextPanel'
    );

    expect(heroIndex).toBeGreaterThanOrEqual(0);
    expect(sampleProofIndex).toBeGreaterThan(heroIndex);
    expect(legacyNoticeIndex).toBeGreaterThan(sampleProofIndex);
    expect(contextPanelIndex).toBeGreaterThan(sampleProofIndex);
  });
});
