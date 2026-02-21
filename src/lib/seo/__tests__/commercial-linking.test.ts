/**
 * Commercial Linking Tests
 *
 * Comprehensive tests to enforce correct commercial linking across the site.
 * Ensures:
 * 1. Pages mentioning core product terms link to appropriate wizard pages
 * 2. Jurisdiction rules are enforced (no forbidden links)
 * 3. Northern Ireland pages never link to eviction-related products
 * 4. Scotland/Wales pages never link to eviction packs or money claims
 *
 * @see /docs/seo/commercial-linking.md for full documentation
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeContent,
  detectIntent,
  detectJurisdiction,
  isLinkAllowed,
  isEligiblePath,
  COMMERCIAL_LINK_TARGETS,
  KEYWORD_GROUPS,
} from '../commercial-linking';

// =============================================================================
// INTENT DETECTION TESTS
// =============================================================================

describe('Commercial Linking - Intent Detection', () => {
  describe('Tenancy Agreement Intent', () => {
    it('should detect tenancy agreement intent from keywords', () => {
      const intents = detectIntent('How to create a tenancy agreement for your rental property');
      expect(intents.length).toBeGreaterThan(0);
      expect(intents[0].intent).toBe('tenancy_agreement');
    });

    it('should detect AST agreement intent', () => {
      const intents = detectIntent('Assured Shorthold Tenancy agreement template download');
      expect(intents.some((i) => i.intent === 'tenancy_agreement')).toBe(true);
    });

    it('should detect PRT agreement intent', () => {
      const intents = detectIntent('Private Residential Tenancy Scotland PRT');
      expect(intents.some((i) => i.intent === 'tenancy_agreement')).toBe(true);
    });

    it('should detect occupation contract intent', () => {
      const intents = detectIntent('Standard Occupation Contract Wales Renting Homes Act');
      expect(intents.some((i) => i.intent === 'tenancy_agreement')).toBe(true);
    });
  });

  describe('Eviction Notice Intent', () => {
    it('should detect Section 21 notice intent', () => {
      const intents = detectIntent('How to serve a Section 21 notice to tenant');
      expect(intents.some((i) => i.intent === 'eviction_notice')).toBe(true);
    });

    it('should detect Section 8 notice intent', () => {
      const intents = detectIntent('Section 8 notice grounds for eviction');
      expect(intents.some((i) => i.intent === 'eviction_notice')).toBe(true);
    });

    it('should detect Notice to Leave intent (Scotland)', () => {
      const intents = detectIntent('Scottish Notice to Leave PRT eviction');
      expect(intents.some((i) => i.intent === 'eviction_notice')).toBe(true);
    });

    it('should detect Section 173 notice intent (Wales)', () => {
      const intents = detectIntent('Section 173 notice Wales Renting Homes Act');
      expect(intents.some((i) => i.intent === 'eviction_notice')).toBe(true);
    });

    it('should detect eviction process intent', () => {
      const intents = detectIntent('How to evict a tenant who is not paying rent');
      expect(intents.some((i) => i.intent === 'eviction_notice')).toBe(true);
    });
  });

  describe('Eviction Pack Intent', () => {
    it('should detect eviction pack intent', () => {
      const intents = detectIntent('Get the complete eviction pack with all court forms');
      expect(intents.some((i) => i.intent === 'eviction_pack')).toBe(true);
    });

    it('should detect eviction bundle intent', () => {
      const intents = detectIntent('Full eviction bundle including N5B form');
      expect(intents.some((i) => i.intent === 'eviction_pack')).toBe(true);
    });
  });

  describe('Money Claim Intent', () => {
    it('should detect money claim intent', () => {
      const intents = detectIntent('How to file a money claim for unpaid rent');
      expect(intents.some((i) => i.intent === 'money_claim')).toBe(true);
    });

    it('should detect rent arrears intent', () => {
      const intents = detectIntent('Recovering rent arrears through the county court');
      expect(intents.some((i) => i.intent === 'money_claim')).toBe(true);
    });

    it('should detect MCOL intent', () => {
      const intents = detectIntent('Using MCOL to claim unpaid rent from tenant');
      expect(intents.some((i) => i.intent === 'money_claim')).toBe(true);
    });
  });

  describe('Path-based detection', () => {
    it('should detect eviction intent from path', () => {
      const intents = detectIntent('', '/how-to-evict-tenant');
      expect(intents.some((i) => i.intent === 'eviction_notice')).toBe(true);
    });

    it('should detect Section 21 intent from path', () => {
      const intents = detectIntent('', '/tools/section-21-validator');
      expect(intents.some((i) => i.intent === 'eviction_notice')).toBe(true);
    });
  });
});

// =============================================================================
// JURISDICTION DETECTION TESTS
// =============================================================================

describe('Commercial Linking - Jurisdiction Detection', () => {
  it('should detect England from content', () => {
    const jurisdiction = detectJurisdiction('Section 21 notice England AST');
    expect(jurisdiction).toBe('england');
  });

  it('should detect Scotland from content', () => {
    const jurisdiction = detectJurisdiction('Notice to Leave Scotland PRT');
    expect(jurisdiction).toBe('scotland');
  });

  it('should detect Wales from content', () => {
    const jurisdiction = detectJurisdiction('Section 173 notice Wales Renting Homes Act');
    expect(jurisdiction).toBe('wales');
  });

  it('should detect Northern Ireland from content', () => {
    const jurisdiction = detectJurisdiction('Northern Ireland private tenancies order Belfast');
    expect(jurisdiction).toBe('northern-ireland');
  });

  it('should detect jurisdiction from path', () => {
    const jurisdiction = detectJurisdiction('Eviction guide', '/blog/scotland-eviction-guide');
    expect(jurisdiction).toBe('scotland');
  });

  it('should default to UK for ambiguous content', () => {
    const jurisdiction = detectJurisdiction('General landlord advice');
    expect(jurisdiction).toBe('uk');
  });
});

// =============================================================================
// JURISDICTION ENFORCEMENT TESTS (CRITICAL)
// =============================================================================

describe('Commercial Linking - Jurisdiction Enforcement', () => {
  describe('Northern Ireland restrictions', () => {
    it('should NOT allow eviction notices for Northern Ireland', () => {
      expect(isLinkAllowed('eviction_notice', 'northern-ireland')).toBe(false);
    });

    it('should NOT allow eviction packs for Northern Ireland', () => {
      expect(isLinkAllowed('eviction_pack', 'northern-ireland')).toBe(false);
    });

    it('should NOT allow money claims for Northern Ireland', () => {
      expect(isLinkAllowed('money_claim', 'northern-ireland')).toBe(false);
    });

    it('should ALLOW tenancy agreements for Northern Ireland', () => {
      expect(isLinkAllowed('tenancy_agreement', 'northern-ireland')).toBe(true);
    });

    it('should show disclaimer for Northern Ireland eviction pages', () => {
      const result = analyzeContent({
        pathname: '/blog/northern-ireland-eviction-guide',
        title: 'Northern Ireland Eviction Guide',
        description: 'How to evict a tenant in Northern Ireland',
      });

      // Should NOT show eviction links
      const hasEvictionLink = result.links.some(
        (l) => l.intent === 'eviction_notice' || l.intent === 'eviction_pack'
      );
      expect(hasEvictionLink).toBe(false);

      // Should have disclaimer
      expect(result.disclaimer).toBeDefined();
    });
  });

  describe('Scotland restrictions', () => {
    it('should NOT allow eviction packs for Scotland', () => {
      expect(isLinkAllowed('eviction_pack', 'scotland')).toBe(false);
    });

    it('should NOT allow money claims for Scotland', () => {
      expect(isLinkAllowed('money_claim', 'scotland')).toBe(false);
    });

    it('should ALLOW eviction notices for Scotland', () => {
      expect(isLinkAllowed('eviction_notice', 'scotland')).toBe(true);
    });

    it('should ALLOW tenancy agreements for Scotland', () => {
      expect(isLinkAllowed('tenancy_agreement', 'scotland')).toBe(true);
    });
  });

  describe('Wales restrictions', () => {
    it('should NOT allow eviction packs for Wales', () => {
      expect(isLinkAllowed('eviction_pack', 'wales')).toBe(false);
    });

    it('should NOT allow money claims for Wales', () => {
      expect(isLinkAllowed('money_claim', 'wales')).toBe(false);
    });

    it('should ALLOW eviction notices for Wales', () => {
      expect(isLinkAllowed('eviction_notice', 'wales')).toBe(true);
    });

    it('should ALLOW tenancy agreements for Wales', () => {
      expect(isLinkAllowed('tenancy_agreement', 'wales')).toBe(true);
    });
  });

  describe('England - all products allowed', () => {
    it('should allow ALL products for England', () => {
      expect(isLinkAllowed('tenancy_agreement', 'england')).toBe(true);
      expect(isLinkAllowed('eviction_notice', 'england')).toBe(true);
      expect(isLinkAllowed('eviction_pack', 'england')).toBe(true);
      expect(isLinkAllowed('money_claim', 'england')).toBe(true);
    });
  });
});

// =============================================================================
// PATH ELIGIBILITY TESTS
// =============================================================================

describe('Commercial Linking - Path Eligibility', () => {
  describe('Eligible paths', () => {
    it('should be eligible: blog posts', () => {
      expect(isEligiblePath('/blog/section-21-guide')).toBe(true);
      expect(isEligiblePath('/blog/england-eviction-process')).toBe(true);
    });

    it('should be eligible: ask-heaven', () => {
      expect(isEligiblePath('/ask-heaven')).toBe(true);
    });

    it('should be eligible: tools', () => {
      expect(isEligiblePath('/tools')).toBe(true);
      expect(isEligiblePath('/tools/rent-arrears-calculator')).toBe(true);
    });

    it('should be eligible: guides', () => {
      expect(isEligiblePath('/how-to-evict-tenant')).toBe(true);
    });
  });

  describe('Excluded paths (MUST NOT apply commercial linking)', () => {
    it('should NOT be eligible: product pages', () => {
      expect(isEligiblePath('/products/ast')).toBe(false);
      expect(isEligiblePath('/products/notice-only')).toBe(false);
      expect(isEligiblePath('/products/complete-pack')).toBe(false);
      expect(isEligiblePath('/products/money-claim')).toBe(false);
    });

    it('should NOT be eligible: wizard', () => {
      expect(isEligiblePath('/wizard')).toBe(false);
      expect(isEligiblePath('/wizard/step-1')).toBe(false);
    });

    it('should NOT be eligible: auth pages', () => {
      expect(isEligiblePath('/auth/login')).toBe(false);
      expect(isEligiblePath('/auth/signup')).toBe(false);
    });

    it('should NOT be eligible: dashboard', () => {
      expect(isEligiblePath('/dashboard')).toBe(false);
      expect(isEligiblePath('/dashboard/cases')).toBe(false);
    });

    it('should NOT be eligible: checkout/payment', () => {
      expect(isEligiblePath('/checkout')).toBe(false);
      expect(isEligiblePath('/payment')).toBe(false);
      expect(isEligiblePath('/success')).toBe(false);
    });

    it('should NOT be eligible: legal pages', () => {
      expect(isEligiblePath('/privacy')).toBe(false);
      expect(isEligiblePath('/terms')).toBe(false);
    });
  });
});

// =============================================================================
// FULL ANALYSIS TESTS
// =============================================================================

describe('Commercial Linking - Full Content Analysis', () => {
  it('should detect and link eviction notice content correctly', () => {
    const result = analyzeContent({
      pathname: '/blog/england-section-21-guide',
      title: 'Complete Guide to Section 21 Notices in England',
      description: 'Learn how to serve a valid Section 21 notice to evict your tenant',
    });

    expect(result.shouldShow).toBe(true);
    expect(result.links.some((l) => l.intent === 'eviction_notice')).toBe(true);
  });

  it('should detect and link tenancy agreement content correctly', () => {
    const result = analyzeContent({
      pathname: '/blog/uk-tenancy-agreement-guide',
      title: 'How to Create a Tenancy Agreement',
      description: 'Everything landlords need to know about assured shorthold tenancy agreements',
    });

    expect(result.shouldShow).toBe(true);
    expect(result.links.some((l) => l.intent === 'tenancy_agreement')).toBe(true);
  });

  it('should detect and link rent arrears content correctly', () => {
    const result = analyzeContent({
      pathname: '/blog/england-rent-arrears-guide',
      title: 'How to Recover Rent Arrears',
      description: 'File a money claim through MCOL to get your unpaid rent back',
    });

    expect(result.shouldShow).toBe(true);
    expect(result.links.some((l) => l.intent === 'money_claim')).toBe(true);
  });

  it('should respect opt-out flag', () => {
    const result = analyzeContent({
      pathname: '/blog/section-21-guide',
      title: 'Section 21 Guide',
      description: 'All about Section 21',
      optOut: true,
    });

    expect(result.shouldShow).toBe(false);
    expect(result.reason).toContain('opted out');
  });

  it('should not show links for excluded paths', () => {
    const result = analyzeContent({
      pathname: '/products/notice-only',
      title: 'Eviction Notice Pack',
      description: 'Get your Section 21 notice',
    });

    expect(result.shouldShow).toBe(false);
    expect(result.reason).toContain('not eligible');
  });
});

// =============================================================================
// LINK TARGET VALIDATION
// =============================================================================

describe('Commercial Linking - Link Targets (Locked)', () => {
  it('tenancy agreement should link to /products/ast', () => {
    expect(COMMERCIAL_LINK_TARGETS.tenancy_agreement.href).toBe('/products/ast');
  });

  it('eviction notice should link to /products/notice-only', () => {
    expect(COMMERCIAL_LINK_TARGETS.eviction_notice.href).toBe('/products/notice-only');
  });

  it('eviction pack should link to /products/complete-pack', () => {
    expect(COMMERCIAL_LINK_TARGETS.eviction_pack.href).toBe('/products/complete-pack');
  });

  it('money claim should link to /products/money-claim', () => {
    expect(COMMERCIAL_LINK_TARGETS.money_claim.href).toBe('/products/money-claim');
  });

  it('anchor text should NOT contain "Learn More"', () => {
    Object.values(COMMERCIAL_LINK_TARGETS).forEach((target) => {
      expect(target.anchorText.toLowerCase()).not.toContain('learn more');
    });
  });

  it('all targets should have proper anchor text', () => {
    expect(COMMERCIAL_LINK_TARGETS.tenancy_agreement.anchorText).toBe(
      'Create a legally valid tenancy agreement'
    );
    expect(COMMERCIAL_LINK_TARGETS.eviction_notice.anchorText).toBe(
      'Create a legally compliant eviction notice'
    );
    expect(COMMERCIAL_LINK_TARGETS.eviction_pack.anchorText).toBe(
      'Get the full eviction pack (England)'
    );
    expect(COMMERCIAL_LINK_TARGETS.money_claim.anchorText).toBe(
      'Claim rent arrears through the county court (England)'
    );
  });
});

// =============================================================================
// KEYWORD GROUP VALIDATION
// =============================================================================

describe('Commercial Linking - Keyword Groups', () => {
  it('should have keyword groups for all 4 intents', () => {
    const intents = KEYWORD_GROUPS.map((g) => g.intent);
    expect(intents).toContain('tenancy_agreement');
    expect(intents).toContain('eviction_notice');
    expect(intents).toContain('eviction_pack');
    expect(intents).toContain('money_claim');
  });

  it('eviction notice keywords should include all notice types', () => {
    const evictionGroup = KEYWORD_GROUPS.find((g) => g.intent === 'eviction_notice');
    expect(evictionGroup).toBeDefined();

    const keywords = evictionGroup!.keywords.join(' ');
    expect(keywords).toContain('section 21');
    expect(keywords).toContain('section 8');
    expect(keywords).toContain('notice to leave');
    expect(keywords).toContain('section 173');
  });

  it('tenancy agreement keywords should include all tenancy types', () => {
    const tenancyGroup = KEYWORD_GROUPS.find((g) => g.intent === 'tenancy_agreement');
    expect(tenancyGroup).toBeDefined();

    const keywords = tenancyGroup!.keywords.join(' ');
    expect(keywords).toContain('tenancy agreement');
    expect(keywords).toContain('ast');
    expect(keywords).toContain('prt');
    expect(keywords).toContain('occupation contract');
  });
});

// =============================================================================
// REGRESSION TESTS - ENSURE RULES ARE NEVER BROKEN
// =============================================================================

describe('Commercial Linking - Regression Tests', () => {
  it('CRITICAL: NI pages MUST NOT link to eviction products', () => {
    const niPaths = [
      '/blog/northern-ireland-eviction',
      '/blog/northern-ireland-landlord-guide',
    ];

    niPaths.forEach((path) => {
      const result = analyzeContent({
        pathname: path,
        title: 'Northern Ireland Guide',
        description: 'Landlord guide for Northern Ireland',
        bodyText: 'eviction notice tenant possession',
      });

      const forbiddenLinks = result.links.filter(
        (l) =>
          l.intent === 'eviction_notice' ||
          l.intent === 'eviction_pack' ||
          l.intent === 'money_claim'
      );

      expect(
        forbiddenLinks.length,
        `NI path ${path} should not have eviction/money links`
      ).toBe(0);
    });
  });

  it('CRITICAL: Scotland/Wales MUST NOT link to complete-pack or money-claim', () => {
    const scottishResult = analyzeContent({
      pathname: '/blog/scotland-eviction-guide',
      title: 'Scotland Eviction Guide',
      description: 'How to evict in Scotland with Notice to Leave',
      bodyText: 'complete eviction pack money claim rent arrears',
    });

    const welshResult = analyzeContent({
      pathname: '/blog/wales-eviction-guide',
      title: 'Wales Eviction Guide',
      description: 'Section 173 notice guide for Wales',
      bodyText: 'complete eviction pack money claim rent arrears',
    });

    [scottishResult, welshResult].forEach((result) => {
      const forbiddenLinks = result.links.filter(
        (l) => l.intent === 'eviction_pack' || l.intent === 'money_claim'
      );
      expect(forbiddenLinks.length).toBe(0);
    });
  });

  it('Product pages should never have commercial links', () => {
    const productPages = [
      '/products/ast',
      '/products/notice-only',
      '/products/complete-pack',
      '/products/money-claim',
    ];

    productPages.forEach((path) => {
      const result = analyzeContent({
        pathname: path,
        title: 'Product Page',
        description: 'Buy this product',
      });

      expect(result.shouldShow).toBe(false);
    });
  });
});
