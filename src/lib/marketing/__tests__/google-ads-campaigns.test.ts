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
        'Solicitor-approved court file',
        'For England landlords',
      ])
    );
  });

  it('targets the Notice Only page as Stage 1 for notice/service sales', () => {
    expect(NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN).toMatchObject({
      objective: 'sales',
      landingPath: '/products/notice-only',
      productKey: 'notice_only',
    });
    expect(NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN.positioning).toEqual(
      expect.arrayContaining([
        'Section 8 Notice and Service File',
        'Includes Form 3A and N215',
        'Prepare the notice file properly',
        'Check before paying',
        'Solicitor-approved notice file',
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
        { text: 'solicitor approved section 8 court file', matchType: 'phrase' },
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
        { text: 'section 8 notice pack', matchType: 'exact' },
        { text: 'section 8 notice and service pack', matchType: 'phrase' },
        { text: 'form 3a section 8 notice', matchType: 'exact' },
        { text: 'n215 certificate of service', matchType: 'phrase' },
        { text: 'rent arrears section 8 notice', matchType: 'phrase' },
      ])
    );
    expect(keywords.every((item) => item.matchType === 'exact' || item.matchType === 'phrase')).toBe(
      true
    );
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
    expect(adText.toLowerCase()).toContain('solicitor-approved');
    expect(adText.toLowerCase()).not.toContain('solicitor reviewed');
  });
});
