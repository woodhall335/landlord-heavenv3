import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = fs.readFileSync(
  path.join(process.cwd(), 'src/app/(marketing)/paid/section-8-notice/page.tsx'),
  'utf8'
);
const illustrationSource = fs.readFileSync(
  path.join(process.cwd(), 'config/marketing-illustrations.ts'),
  'utf8'
);

describe('paid Section 8 landing page', () => {
  it('keeps the paid page aligned with the canonical product owner and relevant search intent', () => {
    expect(pageSource).toContain("title: 'Section 8 Notice Generator & Form 3A Pack | £39.99'");
    expect(pageSource).toContain("alternates: { canonical: getCanonicalUrl('/products/notice-only') }");
    expect(pageSource).toContain("robots: { index: false, follow: true }");
    expect(pageSource).toContain("'Section 8 eviction notice'");
    expect(pageSource).toContain("'Form 3A Section 8 notice'");
    expect(pageSource).toContain("'N215 certificate of service'");
  });

  it('preserves the real sample preview and tracked notice-only conversion route', () => {
    expect(pageSource).toContain("getGoldenPackProofData('notice_only')");
    expect(pageSource).toContain('<GoldenPackProof');
    expect(pageSource).toContain('CommercialSeoTrackedCta');
    expect(pageSource).toContain('product=notice_only');
    expect(pageSource).toContain('ctaPosition="hero"');
    expect(pageSource).toContain('ctaPosition="final"');
  });

  it('uses one cohesive watercolor illustration system', () => {
    expect(pageSource).toContain('/images/section8-paid-hero-watercolor-v2.webp');
    expect(pageSource).toContain('/images/section8-legal-checks-watercolor-v2.webp');
    expect(pageSource).toContain('/images/section8-workspace-watercolor-v2.webp');
    expect(pageSource).not.toContain('/images/tenant-is-not-paying-rent.webp');
    expect(pageSource).toContain('MARKETING_ILLUSTRATIONS.section8');
    expect(illustrationSource).toContain("section8-process-guided-questions");
    expect(illustrationSource).toContain("section8-stage-court-possession");
    expect(illustrationSource).toContain("site-tenancy-northern-ireland");
    expect(illustrationSource).toContain("site-compliance-protection");
  });

  it('restores the desktop review pill immediately inside the hero', () => {
    expect(pageSource).toContain('data-testid="hero-review-pill-desktop"');
    expect(pageSource).toContain('data-testid="hero-review-pill-trust"');
    expect(pageSource).toContain('4.8/5 | 2095 reviews');
  });

  it('keeps every reusable illustration in the optimized public asset library', () => {
    const filenames = [...illustrationSource.matchAll(/illustration\('([^']+)'/g)].map((match) => match[1]);
    expect(filenames).toHaveLength(66);
    for (const filename of filenames) {
      expect(
        fs.existsSync(path.join(process.cwd(), 'public/images/illustrations/landlord-documents', `${filename}.webp`)),
        `${filename}.webp should exist`
      ).toBe(true);
    }
  });

  it('avoids absolute legal-outcome claims in the sales copy', () => {
    expect(pageSource).not.toContain('100% legally compliant');
    expect(pageSource).not.toContain('the court throws your case out');
    expect(pageSource).not.toContain('No proof = no case');
    expect(pageSource).toContain('procedural document preparation, not legal advice');
  });
});
