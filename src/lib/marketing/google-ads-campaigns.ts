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
  status?: 'paused' | 'enabled';
  landingPath: string;
  finalUrlSuffix?: string;
  displayPaths?: [string, string];
  productKey: string;
  settings?: {
    channel: 'search';
    dailyBudgetGbp: number;
    biddingStrategy: 'maximize_clicks';
    maxCpcGbp: number;
    location: 'England';
    locationPresenceOnly: boolean;
    language: 'English';
    searchPartners: boolean;
    displayNetwork: boolean;
    primaryConversion: 'purchase';
  };
  positioning: string[];
  keywordGroups: GoogleAdsKeywordGroup[];
  negativeKeywords: string[];
  adCopy: {
    headlines: string[];
    descriptions: string[];
  };
  adVariants?: Array<{
    key: string;
    label: string;
    headlines: string[];
    descriptions: string[];
  }>;
  assets?: {
    callouts: string[];
    sitelinks: Array<{
      text: string;
      path: string;
      descriptions: [string, string];
    }>;
    structuredSnippet: {
      header: string;
      values: string[];
    };
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
    'Review-ready court file',
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
        keyword('review-ready section 8 court file', 'phrase'),
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
      'Preview the review-ready court file before paying and keep your possession file aligned from notice to hearing.',
    ],
  },
};

export const NOTICE_ONLY_GOOGLE_ADS_CAMPAIGN: GoogleAdsCampaignPlan = {
  key: 'form3a_notice_sales_2026',
  campaignName: 'LH | Search | Form 3A Notice | England | Sales',
  objective: 'sales',
  status: 'paused',
  landingPath: '/form-3-section-8',
  finalUrlSuffix:
    'utm_source=google&utm_medium=cpc&utm_campaign=form3a_notice_sales_2026&utm_term={keyword}&utm_content={creative}',
  displayPaths: ['form-3a', 'notice-pack'],
  productKey: 'notice_only',
  settings: {
    channel: 'search',
    dailyBudgetGbp: 20,
    biddingStrategy: 'maximize_clicks',
    maxCpcGbp: 2.5,
    location: 'England',
    locationPresenceOnly: true,
    language: 'English',
    searchPartners: false,
    displayNetwork: false,
    primaryConversion: 'purchase',
  },
  positioning: [
    'Section 8 eviction notice and service file',
    'Includes Form 3A and N215',
    'Guided grounds, dates, and service questions',
    'Preview before paying',
    'Fixed price £39.99',
    'For England landlords',
  ],
  keywordGroups: [
    {
      key: 'primary_notice_buyer',
      label: 'Primary notice buyer keywords',
      keywords: [
        keyword('section 8 eviction notice', 'exact'),
        keyword('section 8 eviction notice', 'phrase'),
        keyword('eviction notice england', 'phrase'),
        keyword('landlord eviction notice', 'phrase'),
        keyword('section 8 notice pack', 'exact'),
        keyword('section 8 notice pack', 'phrase'),
        keyword('section 8 notice and service pack', 'phrase'),
        keyword('section 8 notice file', 'phrase'),
        keyword('section 8 notice generator', 'exact'),
        keyword('section 8 notice generator', 'phrase'),
        keyword('buy section 8 notice', 'phrase'),
      ],
    },
    {
      key: 'form_3a_n215',
      label: 'Form 3A / N215 high-intent keywords',
      keywords: [
        keyword('form 3a section 8 notice', 'exact'),
        keyword('form 3a section 8 notice', 'phrase'),
        keyword('form 3a notice pack', 'phrase'),
        keyword('create form 3a notice', 'exact'),
        keyword('create form 3a notice', 'phrase'),
        keyword('form 3a notice online', 'phrase'),
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
  negativeKeywords: [
    ...COMPLETE_PACK_GOOGLE_ADS_CAMPAIGN.negativeKeywords,
    'n5',
    'n119',
    'court forms',
    'court pack',
    'possession claim',
    'possession order',
    'bailiff',
    'accelerated possession',
    'northern ireland',
    'job',
    'jobs',
    'salary',
    'training',
    'course',
  ],
  adCopy: {
    headlines: [
      'Section 8 Eviction Notice',
      'Create Your Eviction Notice',
      'Form 3A Eviction Notice',
      'England Form 3A Notice',
      'Section 8 Notice £39.99',
      'Preview Before You Pay',
      'Includes Form 3A & N215',
      'Eviction Notice Builder',
      'Fixed Price £39.99',
      'For England Landlords',
      'Guided Notice Questions',
      'Notice & Service File',
      'Check Grounds And Dates',
      'Build Your Notice Online',
      'Start Your Form 3A Now',
    ],
    descriptions: [
      'Create your Section 8 eviction notice (Form 3A) and N215 service file for £39.99.',
      'Answer guided questions on grounds, dates and service. Build the notice around your facts.',
      'Prepare Form 3A, an arrears schedule and service checks in one fixed-price online pack.',
      'For England landlords creating an eviction notice. Preview the pack before paying.',
    ],
  },
  adVariants: [
    {
      key: 'risk_reduction',
      label: 'Reduce notice mistakes',
      headlines: [
        'Avoid Notice Date Errors',
        'Serve Form 3A Correctly',
        'Check Grounds Before Service',
        'Reduce Section 8 Mistakes',
        'Section 8 Eviction Notice',
        'Form 3A For England',
        'Includes Form 3A & N215',
        'Check Service Before Serving',
        'Guided Notice Questions',
        'Prepare Notice Properly',
        'For England Landlords',
        'Notice & Service File',
        'Preview Before You Pay',
        'Fixed Price £39.99',
        'Start Your Notice Online',
      ],
      descriptions: [
        'Check the grounds, dates and service steps before serving your Section 8 eviction notice.',
        'Build Form 3A and the N215 service file around your facts with guided questions.',
        'Reduce avoidable notice mistakes with service checks and a clear arrears schedule.',
        'Preview your England notice pack before paying the fixed price of £39.99.',
      ],
    },
    {
      key: 'preview_value',
      label: 'Preview and fixed price',
      headlines: [
        'Preview Your Notice First',
        'See Form 3A Before Paying',
        'Fixed Price Eviction Notice',
        'Form 3A & N215 Included',
        'Section 8 Notice £39.99',
        'Create Your Eviction Notice',
        'England Form 3A Notice',
        'Online Notice Builder',
        'Arrears Schedule Included',
        'Service Checks Included',
        'No Blank Template',
        'Built Around Your Facts',
        'For England Landlords',
        'Start Your Notice Online',
        'Preview Before Payment',
      ],
      descriptions: [
        'Create and inspect your Section 8 eviction notice before paying the fixed £39.99 price.',
        'Form 3A, N215, arrears schedule and service checks are included in one guided pack.',
        'Answer questions about your case and preview documents built around your facts.',
        'Start online today. Check the complete England notice and service file before payment.',
      ],
    },
  ],
  assets: {
    callouts: [
      'Fixed Price £39.99',
      'Preview Before Paying',
      'For England Landlords',
      'Form 3A & N215',
      'Guided Questions',
      'Online Notice Builder',
    ],
    sitelinks: [
      {
        text: 'See The Notice Pack',
        path: '/products/notice-only',
        descriptions: ['See every document included', 'Preview the pack before paying'],
      },
      {
        text: 'Compare Notice & Court',
        path: '/compare/section-8-stage-1-vs-stage-2',
        descriptions: ['Choose the correct Section 8 stage', 'Compare notice and court packs'],
      },
      {
        text: 'Section 8 Grounds Guide',
        path: '/section-8-notice',
        descriptions: ['Understand grounds and evidence', 'Read the current England guide'],
      },
      {
        text: 'Check Notice Dates',
        path: '/tools/section-8-notice-date-calculator',
        descriptions: ['Check the earliest notice date', 'Free England date calculator'],
      },
    ],
    structuredSnippet: {
      header: 'Types',
      values: ['Form 3A', 'N215', 'Arrears schedule', 'Service checklist'],
    },
  },
};

export function getGoogleAdsKeywords(campaign: GoogleAdsCampaignPlan): GoogleAdsKeyword[] {
  return campaign.keywordGroups.flatMap((group) => group.keywords);
}
