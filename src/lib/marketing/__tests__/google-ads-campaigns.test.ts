import { describe, expect, it } from 'vitest';

import {
  COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN,
  NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN,
  getGoogleAdsKeywords,
} from '../google-ads-campaigns';

describe('complete pack Google Ads campaign', () => {
  it('targets the Section 8 court pack product page for sales', () => {
    expect(COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN).toMatchObject({
      objective: 'sales',
      landingPath: '/products/complete-pack',
      productKey: 'complete_pack',
    });
    expect(COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN.positioning).toEqual(
      expect.arrayContaining([
        'Section 8 Court and Possession File',
        'Includes Form 3A, N5, N119',
        'Prepare the full possession file',
        'Check before paying',
        'Review-ready court file',
        'For England landlords',
      ])
    );
  });

  it('targets the certified Form 3A page with an enabled, England-only sales launch', () => {
    expect(NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN).toMatchObject({
      key: 'form3a_notice_sales_2026',
      objective: 'sales',
      status: 'enabled',
      landingPath: '/form-3-section-8',
      productKey: 'notice_only',
      displayPaths: ['form-3a', 'notice-pack'],
      settings: {
        channel: 'search',
        dailyBudgetGbp: 20,
        biddingStrategy: 'maximize_clicks',
        maxCpcGbp: 0.5,
        location: 'England',
        locationPresenceOnly: true,
        language: 'English',
        searchPartners: false,
        displayNetwork: false,
        primaryConversion: 'purchase',
      },
    });
    expect(NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.finalUrlSuffix).toContain(
      'utm_campaign=form3a_notice_sales_2026'
    );
    expect(NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.positioning).toEqual(
      expect.arrayContaining([
        'Section 8 eviction notice and service file',
        'Includes Form 3A and N215',
        'Guided grounds, dates, and service questions',
        'Preview before paying',
        'Fixed price £39.99',
        'For England landlords',
      ])
    );
  });

  it('uses exact and phrase match keywords only', () => {
    const keywords = getGoogleAdsKeywords(COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN);

    expect(keywords).toEqual(
      expect.arrayContaining([
        { text: 'section 8 court pack', matchType: 'exact' },
        { text: 'section 8 court pack', matchType: 'phrase' },
        { text: 'review-ready section 8 court file', matchType: 'phrase' },
        { text: 'n5 n119 forms', matchType: 'exact' },
        { text: 'n119 particulars of claim', matchType: 'phrase' },
        { text: 'rent arrears possession claim', matchType: 'phrase' },
        { text: 'court forms after section 8 notice', matchType: 'phrase' },
      ])
    );
    expect(keywords.every((item) => item.matchType === 'exact' || item.matchType === 'phrase')).toBe(
      true
    );
  });

  it('uses exact and phrase match keywords for the Stage 1 Notice Only campaign', () => {
    const keywords = getGoogleAdsKeywords(NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN);

    expect(keywords).toEqual(
      expect.arrayContaining([
        { text: 'section 8 eviction notice', matchType: 'exact' },
        { text: 'section 8 eviction notice', matchType: 'phrase' },
        { text: 'eviction notice england', matchType: 'phrase' },
        { text: 'landlord eviction notice', matchType: 'phrase' },
        { text: 'section 8 notice pack', matchType: 'exact' },
        { text: 'section 8 notice and service pack', matchType: 'phrase' },
        { text: 'section 8 notice generator', matchType: 'exact' },
        { text: 'form 3a section 8 notice', matchType: 'exact' },
        { text: 'create form 3a notice', matchType: 'phrase' },
        { text: 'n215 certificate of service', matchType: 'phrase' },
        { text: 'rent arrears section 8 notice', matchType: 'phrase' },
      ])
    );
    expect(keywords.every((item) => item.matchType === 'exact' || item.matchType === 'phrase')).toBe(
      true
    );
  });

  it('keeps the Form 3A responsive search ad inside Google asset limits', () => {
    const { headlines, descriptions } = NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.adCopy;

    expect(headlines).toHaveLength(15);
    expect(descriptions).toHaveLength(4);
    expect(headlines.every((headline) => headline.length <= 30)).toBe(true);
    expect(descriptions.every((description) => description.length <= 90)).toBe(true);
    expect(NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.displayPaths?.every((path) => path.length <= 15)).toBe(
      true
    );
    expect(
      NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.assets?.sitelinks.every(
        (sitelink) =>
          sitelink.text.length <= 25 &&
          sitelink.descriptions.every((description) => description.length <= 35)
      )
    ).toBe(true);
  });

  it('defines two distinct responsive search ad tests inside Google asset limits', () => {
    const variants = NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.adVariants ?? [];

    expect(variants).toHaveLength(2);
    expect(variants.map((variant) => variant.key)).toEqual(['risk_reduction', 'preview_value']);
    for (const variant of variants) {
      expect(variant.headlines).toHaveLength(15);
      expect(variant.descriptions).toHaveLength(4);
      expect(variant.headlines.every((headline) => headline.length <= 30)).toBe(true);
      expect(variant.descriptions.every((description) => description.length <= 90)).toBe(true);
    }
  });

  it('defines four ground-specific ad groups inside Google asset limits', () => {
    const adGroups = NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.adGroups ?? [];

    expect(adGroups.map((group) => group.key)).toEqual([
      'rent_arrears',
      'sale_or_occupation',
      'antisocial_behaviour',
      'breach_or_damage',
    ]);
    for (const group of adGroups) {
      expect(group.landingPath).toMatch(/^\/form-3-section-8#/);
      expect(group.displayPaths.every((path) => path.length <= 15)).toBe(true);
      expect(group.keywords.length).toBeGreaterThanOrEqual(7);
      expect(
        group.keywords.every(
          (item) => item.matchType === 'exact' || item.matchType === 'phrase'
        )
      ).toBe(true);
      expect(group.headlines).toHaveLength(15);
      expect(group.descriptions).toHaveLength(4);
      expect(group.headlines.every((headline) => headline.length <= 30)).toBe(true);
      expect(group.descriptions.every((description) => description.length <= 90)).toBe(true);
    }
  });

  it('excludes court-stage, free-template, tenant, and non-England intent', () => {
    expect(NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.negativeKeywords).toEqual(
      expect.arrayContaining([
        'free',
        'template',
        'tenant',
        'section 21',
        'scotland',
        'wales',
        'northern ireland',
        'n5',
        'n119',
        'court pack',
        'possession claim',
      ])
    );
  });

  it('does not make an unsupported solicitor approval claim in the Form 3A ad', () => {
    const adText = [
      ...NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.positioning,
      ...NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.adCopy.headlines,
      ...NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.adCopy.descriptions,
    ]
      .join(' ')
      .toLowerCase();

    expect(adText).not.toContain('solicitor');
    expect(adText).not.toContain('court approved');
  });

  it('starts with the planned negative keywords', () => {
    expect(COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN.negativeKeywords).toEqual(
      expect.arrayContaining([
        'free',
        'template',
        'pdf',
        'download pdf',
        'tenant',
        'council tenant',
        'social housing',
        'shelter',
        'citizens advice',
        'section 8 housing',
        'housing benefit',
        'usa',
        'landlord tenant board',
        'ontario',
        'scotland',
        'wales',
        'section 21',
      ])
    );
  });

  it('does not use court-approved positioning in ad copy', () => {
    const adText = [
      ...COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN.positioning,
      ...COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN.adCopy.headlines,
      ...COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN.adCopy.descriptions,
      ...NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.positioning,
      ...NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.adCopy.headlines,
      ...NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.adCopy.descriptions,
    ].join(' ');

    expect(adText.toLowerCase()).not.toContain('court approved');
    expect(adText.toLowerCase()).toContain('review-ready');
    expect(adText.toLowerCase()).not.toContain('solicitor reviewed');
  });
});
