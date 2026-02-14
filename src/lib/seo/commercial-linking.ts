/**
 * Commercial Linking Configuration
 *
 * Single source of truth for automated internal linking to core product pages.
 * Enforces jurisdiction rules and prevents keyword cannibalization.
 *
 * Core Commercial Pages (LOCKED TARGETS):
 * 1. /products/ast - Tenancy Agreements (All UK)
 * 2. /products/notice-only - Eviction Notices (England, Scotland, Wales)
 * 3. /products/complete-pack - Eviction Packs/Bundles (England only)
 * 4. /products/money-claim - Money Claims / Rent Arrears (England only)
 *
 * @see /docs/seo/commercial-linking.md for full documentation
 */

// =============================================================================
// TYPES
// =============================================================================

export type CommercialIntent =
  | 'tenancy_agreement'
  | 'eviction_notice'
  | 'eviction_pack'
  | 'money_claim';

export type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland' | 'uk';

export interface CommercialLinkTarget {
  /** The product page URL (locked - do not change) */
  href: string;
  /** The strict anchor text for the link */
  anchorText: string;
  /** Short description for context */
  description: string;
  /** Which jurisdictions this link is allowed in */
  allowedJurisdictions: Jurisdiction[];
  /** Whether to show a "not supported" disclaimer in forbidden jurisdictions */
  showNotSupportedDisclaimer?: boolean;
}

export interface KeywordGroup {
  /** Primary intent category */
  intent: CommercialIntent;
  /** Keywords that trigger this intent (case-insensitive) */
  keywords: string[];
  /** Phrase patterns that trigger this intent (case-insensitive) */
  phrases: string[];
  /** URL path patterns that indicate this intent */
  pathPatterns: RegExp[];
}

export interface DetectedIntent {
  intent: CommercialIntent;
  matchedTerms: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface CommercialLinkingResult {
  /** Should a commercial CTA be shown? */
  shouldShow: boolean;
  /** The commercial links to display */
  links: Array<{
    intent: CommercialIntent;
    target: CommercialLinkTarget;
    matchedTerms: string[];
  }>;
  /** Disclaimer text if service not supported */
  disclaimer?: string;
  /** Reason why links were not shown (for debugging) */
  reason?: string;
}

// =============================================================================
// CORE PRODUCT PAGES (LOCKED TARGETS)
// =============================================================================

export const COMMERCIAL_LINK_TARGETS: Record<CommercialIntent, CommercialLinkTarget> = {
  tenancy_agreement: {
    href: '/products/ast',
    anchorText: 'Create a legally valid tenancy agreement',
    description: 'Generate a compliant tenancy agreement for your rental property.',
    allowedJurisdictions: ['england', 'wales', 'scotland', 'northern-ireland', 'uk'],
  },
  eviction_notice: {
    href: '/products/notice-only',
    anchorText: 'Create a legally compliant eviction notice',
    description: 'Get a court-ready eviction notice for your jurisdiction.',
    allowedJurisdictions: ['england', 'wales', 'scotland', 'uk'],
    showNotSupportedDisclaimer: true,
  },
  eviction_pack: {
    href: '/products/complete-pack',
    anchorText: 'Get the full eviction pack (England)',
    description: 'Complete eviction bundle with notice, court forms, and guidance.',
    allowedJurisdictions: ['england'],
  },
  money_claim: {
    href: '/products/money-claim',
    anchorText: 'Claim rent arrears through the county court (England)',
    description: 'Recover unpaid rent and tenant debts via MCOL.',
    allowedJurisdictions: ['england'],
  },
};

// =============================================================================
// KEYWORD DETECTION RULES
// =============================================================================

export const KEYWORD_GROUPS: KeywordGroup[] = [
  // Tenancy Agreement Intent
  {
    intent: 'tenancy_agreement',
    keywords: [
      'tenancy agreement',
      'tenancy contract',
      'ast agreement',
      'assured shorthold tenancy',
      'prt agreement',
      'private residential tenancy',
      'occupation contract',
      'standard occupation contract',
      'tenancy template',
      'rental agreement',
      'letting agreement',
    ],
    phrases: [
      'create tenancy',
      'generate tenancy',
      'tenancy agreement template',
      'free tenancy agreement',
      'download tenancy agreement',
      'write tenancy agreement',
      'draft tenancy agreement',
    ],
    pathPatterns: [
      /\/tenancy-agreement/i,
      /\/ast\b/i,
      /\/prt\b/i,
      /\/occupation-contract/i,
      /\/rental-agreement/i,
    ],
  },

  // Eviction Notice Intent
  {
    intent: 'eviction_notice',
    keywords: [
      'eviction notice',
      'section 21',
      'section 8',
      's21 notice',
      's8 notice',
      'notice to leave',
      'section 173',
      'section 173 notice',
      'possession notice',
      'no fault eviction',
      'no-fault eviction',
      'evict tenant',
      'notice to quit',
    ],
    phrases: [
      'serve eviction notice',
      'serving notice',
      'eviction process',
      'how to evict',
      'evicting a tenant',
      'giving notice to tenant',
      'ending a tenancy',
      'possession proceedings',
    ],
    pathPatterns: [
      /evict/i,
      /section-?21/i,
      /section-?8/i,
      /notice-to-leave/i,
      /possession/i,
      /serve-notice/i,
    ],
  },

  // Eviction Pack/Bundle Intent
  {
    intent: 'eviction_pack',
    keywords: [
      'eviction pack',
      'eviction bundle',
      'complete eviction',
      'full eviction pack',
      'eviction kit',
      'court bundle',
      'possession bundle',
    ],
    phrases: [
      'eviction notice and court',
      'full eviction process',
      'eviction start to finish',
      'n5b form',
      'accelerated possession',
      'court forms for eviction',
      'possession claim forms',
    ],
    pathPatterns: [
      /\/complete-pack/i,
      /\/eviction-pack/i,
      /\/eviction-bundle/i,
      /\/court-bundle/i,
    ],
  },

  // Money Claim Intent
  {
    intent: 'money_claim',
    keywords: [
      'money claim',
      'rent arrears',
      'claim unpaid rent',
      'mcol',
      'county court claim',
      'n1 form',
      'n5b form',
      'recover rent',
      'unpaid rent',
      'tenant debt',
      'rent owed',
    ],
    phrases: [
      'claim back rent',
      'sue for rent',
      'recover arrears',
      'tenant owes rent',
      'money claim online',
      'county court money',
      'small claims rent',
      'former tenant debt',
    ],
    pathPatterns: [
      /\/money-claim/i,
      /\/rent-arrears/i,
      /\/claim-rent/i,
      /\/recover-rent/i,
      /\/mcol/i,
    ],
  },
];

// =============================================================================
// EXCLUDED PATHS (DO NOT APPLY COMMERCIAL LINKING)
// =============================================================================

export const EXCLUDED_PATHS: RegExp[] = [
  // Product pages (they ARE the targets)
  /^\/products\//,
  /^\/wizard/,

  // Auth & user pages
  /^\/auth\//,
  /^\/dashboard/,
  /^\/account/,
  /^\/settings/,

  // Checkout & payment
  /^\/checkout/,
  /^\/payment/,
  /^\/success/,
  /^\/order/,

  // Legal pages
  /^\/privacy/,
  /^\/terms/,
  /^\/cookie/,
  /^\/legal/,
  /^\/disclaimer/,

  // API & internal routes
  /^\/api\//,
  /^\/_next\//,
];

// =============================================================================
// ELIGIBLE PATH PATTERNS (APPLY COMMERCIAL LINKING)
// =============================================================================

export const ELIGIBLE_PATHS: RegExp[] = [
  /^\/blog\//,
  /^\/blog$/,
  /^\/ask-heaven/,
  /^\/tools\//,
  /^\/tools$/,
  /^\/guides\//,
  /^\/how-to/,
  /^\/eviction-guides/,
  /^\/landlord-guides/,
  /^\/templates\//,
  /^\/calculators\//,
  /^\/forms\//,
];

// =============================================================================
// JURISDICTION DETECTION
// =============================================================================

const JURISDICTION_KEYWORDS: Record<Jurisdiction, string[]> = {
  england: [
    'england',
    'english',
    'section 21',
    'section 8',
    'assured shorthold',
    'ast ',
    'ast,',
    'accelerated possession',
    'county court',
    'london',
    'manchester',
    'birmingham',
    'liverpool',
    'bristol',
    'n5b',
    'n1 form',
    'mcol',
  ],
  scotland: [
    'scotland',
    'scottish',
    'prt ',
    'prt,',
    'private residential tenancy',
    'notice to leave',
    'first-tier tribunal',
    'first tier tribunal',
    'landlord registration scotland',
    'edinburgh',
    'glasgow',
    'aberdeen',
  ],
  wales: [
    'wales',
    'welsh',
    'cymru',
    'occupation contract',
    'renting homes act',
    'section 173',
    'rent smart wales',
    'cardiff',
    'swansea',
    'newport',
  ],
  'northern-ireland': [
    'northern ireland',
    'northern-ireland',
    'ni landlord',
    'private tenancies order',
    'belfast',
    'derry',
    'ulster',
  ],
  uk: [
    'uk-wide',
    'united kingdom',
    'across uk',
    'all regions',
    'landlord uk',
  ],
};

/**
 * Detect jurisdiction from text content
 */
export function detectJurisdiction(
  text: string,
  pathname?: string
): Jurisdiction {
  const lowerText = text.toLowerCase();
  const lowerPath = pathname?.toLowerCase() || '';

  // Check pathname first (most reliable)
  if (lowerPath.includes('england') || lowerPath.startsWith('/england-')) {
    return 'england';
  }
  if (lowerPath.includes('scotland') || lowerPath.startsWith('/scotland-')) {
    return 'scotland';
  }
  if (lowerPath.includes('wales') || lowerPath.startsWith('/wales-')) {
    return 'wales';
  }
  if (
    lowerPath.includes('northern-ireland') ||
    lowerPath.startsWith('/northern-ireland-')
  ) {
    return 'northern-ireland';
  }

  // Check text content
  const scores: Record<Jurisdiction, number> = {
    england: 0,
    scotland: 0,
    wales: 0,
    'northern-ireland': 0,
    uk: 0,
  };

  for (const [jurisdiction, keywords] of Object.entries(JURISDICTION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[jurisdiction as Jurisdiction]++;
      }
    }
  }

  // Find highest scoring jurisdiction
  let maxScore = 0;
  let detectedJurisdiction: Jurisdiction = 'uk';

  for (const [jurisdiction, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedJurisdiction = jurisdiction as Jurisdiction;
    }
  }

  return detectedJurisdiction;
}

// =============================================================================
// CONTENT ANALYSIS
// =============================================================================

/**
 * Detect commercial intent from text content
 */
export function detectIntent(
  text: string,
  pathname?: string
): DetectedIntent[] {
  const lowerText = text.toLowerCase();
  const results: DetectedIntent[] = [];

  for (const group of KEYWORD_GROUPS) {
    const matchedTerms: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'low';

    // Check path patterns first (highest confidence)
    if (pathname) {
      for (const pattern of group.pathPatterns) {
        if (pattern.test(pathname)) {
          matchedTerms.push(`path: ${pathname}`);
          confidence = 'high';
          break;
        }
      }
    }

    // Check keywords
    for (const keyword of group.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchedTerms.push(keyword);
        if (confidence !== 'high') {
          confidence = 'medium';
        }
      }
    }

    // Check phrases
    for (const phrase of group.phrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        matchedTerms.push(phrase);
        confidence = 'high'; // Phrase matches are high confidence
      }
    }

    if (matchedTerms.length > 0) {
      results.push({
        intent: group.intent,
        matchedTerms: [...new Set(matchedTerms)],
        confidence,
      });
    }
  }

  // Sort by confidence (high first)
  return results.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
}

/**
 * Check if a path is eligible for commercial linking
 */
export function isEligiblePath(pathname: string): boolean {
  // Check exclusions first
  for (const pattern of EXCLUDED_PATHS) {
    if (pattern.test(pathname)) {
      return false;
    }
  }

  // Check if explicitly eligible
  for (const pattern of ELIGIBLE_PATHS) {
    if (pattern.test(pathname)) {
      return true;
    }
  }

  // Default: not eligible (conservative approach)
  return false;
}

/**
 * Check if a commercial link is allowed for a jurisdiction
 */
export function isLinkAllowed(
  intent: CommercialIntent,
  jurisdiction: Jurisdiction
): boolean {
  const target = COMMERCIAL_LINK_TARGETS[intent];
  if (!target) return false;

  // 'uk' jurisdiction allows all links where at least one specific jurisdiction is allowed
  if (jurisdiction === 'uk') {
    return target.allowedJurisdictions.length > 0;
  }

  return target.allowedJurisdictions.includes(jurisdiction);
}

/**
 * Get the disclaimer text for unsupported services
 */
export function getNotSupportedDisclaimer(
  intent: CommercialIntent,
  jurisdiction: Jurisdiction
): string | undefined {
  const target = COMMERCIAL_LINK_TARGETS[intent];

  if (!target.showNotSupportedDisclaimer) {
    return undefined;
  }

  if (
    jurisdiction === 'northern-ireland' &&
    (intent === 'eviction_notice' ||
      intent === 'eviction_pack' ||
      intent === 'money_claim')
  ) {
    return 'Eviction notice and money claim services are not currently available for Northern Ireland. Landlords in Northern Ireland should seek local legal advice.';
  }

  if (
    (jurisdiction === 'scotland' || jurisdiction === 'wales') &&
    (intent === 'eviction_pack' || intent === 'money_claim')
  ) {
    const service = intent === 'eviction_pack' ? 'Eviction packs' : 'Money claims';
    return `${service} are currently available for England only. For ${jurisdiction === 'scotland' ? 'Scotland' : 'Wales'}, please use our eviction notice service.`;
  }

  return undefined;
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

export interface AnalyzeContentOptions {
  /** Page pathname */
  pathname: string;
  /** Page title */
  title?: string;
  /** Page meta description */
  description?: string;
  /** First H1 heading on the page */
  heading?: string;
  /** Optional body text for fallback keyword matching */
  bodyText?: string;
  /** Force opt-out for this page */
  optOut?: boolean;
  /** Override jurisdiction detection */
  jurisdiction?: Jurisdiction;
}

/**
 * Analyze page content and determine which commercial links to show
 *
 * This is the main function that should be called to get commercial linking results.
 */
export function analyzeContent(
  options: AnalyzeContentOptions
): CommercialLinkingResult {
  const { pathname, title, description, heading, bodyText, optOut, jurisdiction: overrideJurisdiction } = options;

  // Check opt-out
  if (optOut) {
    return {
      shouldShow: false,
      links: [],
      reason: 'Page opted out of commercial linking',
    };
  }

  // Check if path is eligible
  if (!isEligiblePath(pathname)) {
    return {
      shouldShow: false,
      links: [],
      reason: `Path ${pathname} is not eligible for commercial linking`,
    };
  }

  // Combine text sources for analysis (prioritize title/heading over body)
  const primaryText = [title, description, heading].filter(Boolean).join(' ');
  const fullText = bodyText ? `${primaryText} ${bodyText}` : primaryText;

  // Detect jurisdiction
  const jurisdiction = overrideJurisdiction || detectJurisdiction(fullText, pathname);

  // Detect intents
  const detectedIntents = detectIntent(primaryText, pathname);

  // If no intents from primary text, try body text with lower confidence
  if (detectedIntents.length === 0 && bodyText) {
    const bodyIntents = detectIntent(bodyText, pathname);
    // Only use body intents with high/medium confidence
    detectedIntents.push(
      ...bodyIntents.filter((i) => i.confidence !== 'low')
    );
  }

  if (detectedIntents.length === 0) {
    return {
      shouldShow: false,
      links: [],
      reason: 'No commercial intent detected',
    };
  }

  // Build links based on intents and jurisdiction
  const links: CommercialLinkingResult['links'] = [];
  let disclaimer: string | undefined;

  for (const detected of detectedIntents) {
    if (isLinkAllowed(detected.intent, jurisdiction)) {
      const target = COMMERCIAL_LINK_TARGETS[detected.intent];
      links.push({
        intent: detected.intent,
        target,
        matchedTerms: detected.matchedTerms,
      });
    } else {
      // Check for disclaimer
      const notSupportedDisclaimer = getNotSupportedDisclaimer(
        detected.intent,
        jurisdiction
      );
      if (notSupportedDisclaimer && !disclaimer) {
        disclaimer = notSupportedDisclaimer;
      }
    }
  }

  // Deduplicate links by intent
  const uniqueLinks = links.filter(
    (link, index, self) =>
      index === self.findIndex((l) => l.intent === link.intent)
  );

  return {
    shouldShow: uniqueLinks.length > 0,
    links: uniqueLinks,
    disclaimer,
    reason: uniqueLinks.length > 0 ? undefined : 'All detected intents are forbidden for this jurisdiction',
  };
}

// =============================================================================
// PRIORITY ORDERING
// =============================================================================

/**
 * Get the priority order for commercial intents
 * Lower number = higher priority
 */
export function getIntentPriority(intent: CommercialIntent): number {
  const priorities: Record<CommercialIntent, number> = {
    eviction_notice: 1, // Most common need
    tenancy_agreement: 2, // High volume
    eviction_pack: 3, // Higher value
    money_claim: 4, // Specialized
  };
  return priorities[intent];
}

/**
 * Sort links by priority
 */
export function sortLinksByPriority(
  links: CommercialLinkingResult['links']
): CommercialLinkingResult['links'] {
  return [...links].sort(
    (a, b) => getIntentPriority(a.intent) - getIntentPriority(b.intent)
  );
}
