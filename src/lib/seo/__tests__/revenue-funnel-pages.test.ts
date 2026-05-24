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

  it('product sales pages initialise attribution and product page view tracking', () => {
    const page = readRepoFile('src', 'components', 'marketing', 'PublicProductSalesPage.tsx');
    const tracker = readRepoFile('src', 'components', 'analytics', 'ProductPageTracker.tsx');

    expect(page).toContain('ProductPageTracker');
    expect(page).toContain("analytics?.pageType === 'product_page'");
    expect(tracker).toContain('initializeAttribution');
    expect(tracker).toContain('trackProductView');
  });

  it('routes rent increase landing directly to Section 13 products without embedded checker', () => {
    const landing = readRepoFile('src', 'app', 'rent-increase', 'page.tsx');
    const guide = readRepoFile('src', 'app', 'rent-increase', 'RentIncreaseGuidePage.tsx');
    const standaloneTool = readRepoFile('src', 'app', 'tools', 'rent-increase-challenge-checker', 'page.tsx');
    const form4a = readRepoFile('src', 'app', 'rent-increase', 'config', 'form-4a-guide.ts');
    const section13 = readRepoFile('src', 'app', 'rent-increase', 'config', 'section13-notice.ts');

    expect(landing).not.toContain('RentIncreaseChallengeChecker');
    expect(landing).not.toContain('mode="embedded"');
    expect(landing).not.toContain('href="#rent-increase-checker"');
    expect(landing).not.toContain('Check rent increase risk');
    expect(landing).not.toContain('Use the free rent checker first');
    expect(landing).toContain('Check my rent increase');
    expect(landing).toContain('Compare the packs');
    expect(landing).not.toContain('Why this converts better than a guide-first page');
    expect(landing).not.toContain('Broad intent still needs a concrete next step');
    expect(landing).not.toContain('Form 4A alone is not the real buying decision');
    expect(landing).not.toContain('How this helps the landlord outcome');
    expect(landing).not.toContain('The page is designed to narrow the choice fast');
    expect(landing).not.toContain('research-led visitors');
    expect(landing).not.toContain('CTA getting buried');
    expect(guide).toContain('RentIncreaseChallengeChecker');
    expect(guide).toContain("config.slug === 'form-4a-guide'");
    expect(guide).toContain('Check if your Form 4A rent is likely to be challenged');
    expect(guide).toContain("href:");
    expect(guide).toContain("'#rent-increase-checker'");
    expect(standaloneTool).toContain('<RentIncreaseChallengeChecker />');
    expect(form4a).toContain('Form 4A Rent Increase Notice 2026: Section 13 Guide');
    expect(section13).toContain('Section 13 Notice 2026: Increase Rent Properly in England');
  });

  it('rent checker product analytics use the embedding page as source context', () => {
    const checker = readRepoFile(
      'src',
      'components',
      'tools',
      'rent-checker',
      'RentIncreaseChallengeChecker.tsx'
    );
    const resultPage = readRepoFile(
      'src',
      'components',
      'tools',
      'rent-checker',
      'RentCheckerResultPage.tsx'
    );

    expect(checker).toContain('sourcePage = STANDALONE_SOURCE_PAGE');
    expect(checker).toContain("mode = 'standalone'");
    expect(checker).toContain("mode?: RentCheckerMode");
    expect(checker).toContain('sourcePage: trackingContext.sourcePage');
    expect(resultPage).toContain('interface RentCheckerTrackingContext');
    expect(resultPage).toContain('sourcePage: context.sourcePage');
    expect(resultPage).toContain('pagePath: context.pagePath');
    expect(resultPage).toContain('trackProductCta(result, result.recommendedProduct, trackingContext)');
    expect(resultPage).toContain("trackEvent('checkout_started', buildCheckoutPayload(result, trackingContext))");
  });

  it('shared SEO CTAs expose stable selectors and conversion tracking events', () => {
    const nextStep = readRepoFile('src', 'components', 'seo', 'CommercialSeoTrackedCta.tsx');
    const commercialBlock = readRepoFile('src', 'components', 'seo', 'CommercialSeoNextStep.tsx');
    const rentCheckerSeo = readRepoFile('src', 'components', 'tools', 'rent-checker', 'RentCheckerSeoPage.tsx');
    const rentCheckerResult = readRepoFile('src', 'components', 'tools', 'rent-checker', 'RentCheckerResultPage.tsx');
    const pillarShell = readRepoFile('src', 'components', 'seo', 'PillarPageShell.tsx');
    const moneyClaim = readRepoFile('src', 'app', 'money-claim', 'page.tsx');

    expect(commercialBlock).toContain('CommercialSeoTrackedCta');
    expect(nextStep).toContain("trackEvent('journey_cta_impression'");
    expect(nextStep).toContain("trackEvent('journey_cta_click'");
    expect(nextStep).toContain("trackEvent('product_cta_clicked'");
    expect(nextStep).toContain("data-testid={variant === 'primary' ? 'guide-primary-cta' : undefined}");
    expect(rentCheckerSeo).toContain('data-testid="hero-primary-cta"');
    expect(rentCheckerSeo).toContain('data-testid="tool-upsell-cta"');
    expect(rentCheckerResult).toContain('data-testid="tool-upsell-cta"');
    expect(pillarShell).toContain('data-testid="guide-primary-cta"');
    expect(moneyClaim).toContain('data-testid="guide-primary-cta"');
  });

  it('conversion funnel audit covers buyer paths and records QA flags', () => {
    const audit = readRepoFile('scripts', 'funnel-audit.mjs');

    for (const journey of [
      'buyer_tenant_not_paying_rent_to_money_claim',
      'buyer_need_section_8_notice_to_notice_only',
      'buyer_notice_ignored_to_complete_pack',
      'buyer_unpaid_rent_after_leaving_to_money_claim',
      'buyer_need_tenancy_agreement_to_owner_page',
      'buyer_rent_increase_challenge_to_defence',
    ]) {
      expect(audit).toContain(journey);
    }

    expect(audit).toContain('conversion_flags');
    expect(audit).toContain('weak_cta_copy');
    expect(audit).toContain('FUNNEL_AUDIT_MODE');
    expect(audit).toContain('buyer-paths');
    expect(audit).toContain('Conversion QA Funnel Audit Summary');
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
    expect(mcol).toContain('Money Claim Online (MCOL) for Landlords: Rent Arrears Guide');
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
