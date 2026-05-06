import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readRepoFile(...segments: string[]) {
  return readFileSync(join(process.cwd(), ...segments), 'utf8');
}

describe('revenue-focused SEO funnels', () => {
  it('CommercialBridge tracks required no-PII funnel payload fields', () => {
    const bridge = readRepoFile('src', 'components', 'marketing', 'CommercialBridge.tsx');

    expect(bridge).toContain('commercial_bridge_viewed');
    expect(bridge).toContain('commercial_bridge_clicked');
    for (const field of [
      'sourcePage',
      'intent',
      'ctaPosition',
      'destination',
      'recommendedProduct',
      'productClicked',
      'userType',
    ]) {
      expect(bridge).toContain(field);
    }
  });

  it('routes rent increase pages to the checker before Section 13 products', () => {
    const landing = readRepoFile('src', 'app', 'rent-increase', 'page.tsx');
    const guide = readRepoFile('src', 'app', 'rent-increase', 'RentIncreaseGuidePage.tsx');
    const form4a = readRepoFile('src', 'app', 'rent-increase', 'config', 'form-4a-guide.ts');
    const section13 = readRepoFile('src', 'app', 'rent-increase', 'config', 'section13-notice.ts');

    expect(landing).toContain('RentIncreaseBridge');
    expect(landing).toContain('Check rent increase risk');
    expect(landing.indexOf('Check rent increase risk')).toBeLessThan(landing.indexOf('Generate Section 13 pack'));
    expect(guide).toContain("primaryCta={{ label: 'Check rent increase risk'");
    expect(guide).toContain('RentIncreaseBridge');
    expect(form4a).toContain('Form 4A Rent Increase 2026: Check If Your Rent Is Supportable');
    expect(section13).toContain('Section 13 Notice 2026: Increase Rent Properly in England');
  });

  it('routes Section 8 and court-claim pages into the correct product choices', () => {
    const form3 = readRepoFile('src', 'components', 'seo', 'CurrentFrameworkGuidePage.tsx');
    const section8Template = readRepoFile('src', 'app', 'section-8-notice-template', 'page.tsx');
    const n5 = readRepoFile('src', 'app', 'n5-n119-possession-claim', 'page.tsx');

    expect(form3).toContain('Section8Bridge');
    expect(section8Template).toContain('Section8Bridge');
    expect(section8Template).toContain('Section 8 Notice Template 2026: Form 3A Guide for England');
    expect(n5).toContain('CourtClaimBridge');
    expect(n5).toContain('Build complete eviction pack');
    expect(n5).toContain('Prepare N5 and N119 together');
    expect(n5).toContain('N5 and N119 Possession Claim Forms: Court Pack for Landlords');
  });

  it('routes MCOL and money claim content to the Money Claim Pack', () => {
    const mcol = readRepoFile('src', 'app', 'money-claim-online-mcol', 'page.tsx');
    const blog = readRepoFile('src', 'app', '(marketing)', 'blog', '[slug]', 'page.tsx');
    const alias = readRepoFile('src', 'app', '(marketing)', 'products', 'money-claim-pack', 'page.tsx');

    expect(mcol).toContain('MoneyClaimBridge');
    expect(mcol).toContain('MCOL Rent Arrears Claim: Money Claim Pack for Landlords');
    expect(blog).toContain("slug === 'england-money-claim-online'");
    expect(blog).toContain('MoneyClaimBridge');
    expect(alias).toContain("permanentRedirect('/products/money-claim')");
  });

  it('replaces the How to Rent final Section 21 CTA with a landlord action chooser', () => {
    const page = readRepoFile('src', 'app', 'how-to-rent-guide', 'page.tsx');

    expect(page).not.toContain('Ready to Serve Section 21?');
    expect(page).not.toContain('Generate Section 21 Notice');
    expect(page).toContain('Choose the landlord action you need next');
    expect(page).toContain('Check rent increase risk');
    expect(page).toContain('Create money claim pack');
  });
});
