export type GoogleAdsMatchType = 'exact' | 'phrase';

export interface GoogleAdsKeyword {
  text: string;
  matchType: GoogleAdsMatchType;
}

export interface GoogleAdsKeywordGroup {
  key: string;
  label: string;
  keywords: GoogleAdsKeyword[];
}

export interface GoogleAdsCampaignPlan {
  key: string;
  campaignName: string;
  objective: 'sales';
  landingPath: string;
  productKey: string;
  positioning: string[];
  keywordGroups: GoogleAdsKeywordGroup[];
  negativeKeywords: string[];
  adCopy: {
    headlines: string[];
    descriptions: string[];
  };
}

const keyword = (text: string, matchType: GoogleAdsMatchType): GoogleAdsKeyword => ({
  text,
  matchType,
});

export const COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN: GoogleAdsCampaignPlan = {
  key: 'complete_pack_section_8_court_pack',
  campaignName: 'Complete Pack - Section 8 Court and Possession File - Sales',
  objective: 'sales',
  landingPath: '/products/complete-pack',
  productKey: 'complete_pack',
  positioning: [
    'Section 8 Court and Possession File',
    'Includes Form 3A, N5, N119',
    'Prepare the full possession file',
    'Check before paying',
    'Solicitor-approved court file',
    'For England landlords',
  ],
  keywordGroups: [
    {
      key: 'primary_buyer',
      label: 'Primary buyer keywords',
      keywords: [
        keyword('section 8 court pack', 'exact'),
        keyword('section 8 court pack', 'phrase'),
        keyword('section 8 possession pack', 'exact'),
        keyword('section 8 possession claim pack', 'phrase'),
        keyword('section 8 eviction pack', 'exact'),
        keyword('section 8 eviction documents', 'phrase'),
        keyword('section 8 court papers', 'phrase'),
        keyword('solicitor approved section 8 court file', 'phrase'),
      ],
    },
    {
      key: 'n5_n119',
      label: 'N5 / N119 high-intent keywords',
      keywords: [
        keyword('n5 n119 forms', 'exact'),
        keyword('n5 and n119 forms', 'phrase'),
        keyword('n5 possession claim form', 'phrase'),
        keyword('n119 particulars of claim', 'phrase'),
        keyword('n5 n119 possession claim', 'phrase'),
        keyword('possession claim form n5 n119', 'phrase'),
        keyword('landlord n5 n119 forms', 'phrase'),
      ],
    },
    {
      key: 'rent_arrears_possession',
      label: 'Rent arrears possession keywords',
      keywords: [
        keyword('rent arrears possession claim', 'phrase'),
        keyword('section 8 rent arrears court forms', 'phrase'),
        keyword('evict tenant rent arrears documents', 'phrase'),
        keyword('landlord possession claim rent arrears', 'phrase'),
        keyword('tenant not paying rent section 8 forms', 'phrase'),
      ],
    },
    {
      key: 'problem_aware',
      label: 'Problem-aware keywords',
      keywords: [
        keyword('how to apply for possession order section 8', 'phrase'),
        keyword('court forms after section 8 notice', 'phrase'),
        keyword('what forms after section 8 notice', 'phrase'),
        keyword('section 8 notice expired court forms', 'phrase'),
        keyword('apply to court after section 8 notice', 'phrase'),
      ],
    },
  ],
  negativeKeywords: [
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
  ],
  adCopy: {
    headlines: [
      'Section 8 Court File',
      'Includes Form 3A, N5, N119',
      'For England Landlords',
      'Prepare Possession File',
      'Check Before Paying',
      'Solicitor-Approved Court File',
    ],
    descriptions: [
      'Prepare the full possession file with Form 3A, N5, N119, arrears support, evidence, and hearing documents.',
      'Built for England landlords who expect court action and want the notice, issue, evidence, and hearing file kept together.',
      'Preview the solicitor-approved court file before paying and keep your possession file aligned from notice to hearing.',
    ],
  },
};

export const NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN: GoogleAdsCampaignPlan = {
  key: 'notice_only_section_8_notice_service_file',
  campaignName: 'Notice Only - Section 8 Notice and Service File - Sales',
  objective: 'sales',
  landingPath: '/products/notice-only',
  productKey: 'notice_only',
  positioning: [
    'Section 8 Notice and Service File',
    'Includes Form 3A and N215',
    'Prepare the notice file properly',
    'Check before paying',
    'Solicitor-approved notice file',
    'For England landlords',
  ],
  keywordGroups: [
    {
      key: 'primary_notice_buyer',
      label: 'Primary notice buyer keywords',
      keywords: [
        keyword('section 8 notice pack', 'exact'),
        keyword('section 8 notice pack', 'phrase'),
        keyword('section 8 notice and service pack', 'phrase'),
        keyword('section 8 notice file', 'phrase'),
        keyword('solicitor approved section 8 notice file', 'phrase'),
      ],
    },
    {
      key: 'form_3a_n215',
      label: 'Form 3A / N215 high-intent keywords',
      keywords: [
        keyword('form 3a section 8 notice', 'exact'),
        keyword('form 3a notice pack', 'phrase'),
        keyword('n215 certificate of service', 'phrase'),
        keyword('section 8 n215 certificate', 'phrase'),
      ],
    },
    {
      key: 'rent_arrears_notice',
      label: 'Rent arrears notice keywords',
      keywords: [
        keyword('rent arrears section 8 notice', 'phrase'),
        keyword('section 8 rent arrears notice', 'phrase'),
        keyword('tenant not paying rent section 8 notice', 'phrase'),
      ],
    },
  ],
  negativeKeywords: COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN.negativeKeywords,
  adCopy: {
    headlines: [
      'Section 8 Notice File',
      'Includes Form 3A And N215',
      'For England Landlords',
      'Prepare Notice Properly',
      'Check Before Paying',
      'Solicitor-Approved Notice File',
    ],
    descriptions: [
      'Prepare the notice file properly before anything goes to the tenant, with Form 3A, N215, arrears, and checks.',
      'Built for England landlords who need Stage 1: serve correctly before deciding whether court is needed.',
      'Preview the solicitor-approved notice and service file before paying.',
    ],
  },
};

export function getGoogleAdsKeywords(campaign: GoogleAdsCampaignPlan): GoogleAdsKeyword[] {
  return campaign.keywordGroups.flatMap((group) => group.keywords);
}
