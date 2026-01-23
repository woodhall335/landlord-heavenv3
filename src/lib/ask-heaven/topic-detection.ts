/**
 * Topic Detection for Ask Heaven
 *
 * Detects conversation topics from message text using lightweight regex patterns.
 * Maps topics to relevant product CTAs based on jurisdiction.
 */

import { buildWizardLink, type WizardJurisdiction, type WizardProduct } from '@/lib/wizard/buildWizardLink';

export type Topic =
  | 'eviction'
  | 'arrears'
  | 'tenancy'
  | 'deposit'
  | 'compliance'
  | 'epc'
  | 'gas_safety'
  | 'eicr'
  | 'smoke_alarm'
  | 'carbon_monoxide'
  | 'right_to_rent';

export interface SuggestedCTA {
  label: string;
  href: string;
  price?: number;
  topic?: Topic;
  type: 'wizard' | 'validator' | 'template' | 'guide';
}

/**
 * Topic patterns - lightweight regex-based detection.
 * Extended to include compliance queries.
 */
const TOPIC_PATTERNS: Record<Topic, RegExp> = {
  eviction: /evict|possession|section 21|s21|section 8|s8|notice to leave|remove tenant|end.+tenancy|terminate.+tenant|section 173|s173/i,
  arrears: /arrears|rent owed|unpaid|debt|money claim|recover money|lba|letter before action|outstanding rent|didn't pay|hasn't paid|not paying rent/i,
  tenancy: /tenancy agreement|ast|prt|occupation contract|new tenant|lease|rental agreement|assured shorthold|draft.+agreement|create.+tenancy/i,
  deposit: /deposit|protection|tds|dps|mydeposits|prescribed information|deposit scheme|tenant.+deposit|security deposit|tenancy deposit/i,
  compliance: /complian|legal requirements|landlord obligations|what do i need|checklist|requirements/i,
  epc: /epc|energy performance|energy certificate|energy rating|energy efficiency/i,
  gas_safety: /gas safe|gas certificate|gas safety|cp12|gas check|gas inspection|gas engineer/i,
  eicr: /eicr|electrical safety|electrical certificate|electrical inspection|electrical test|electrical check/i,
  smoke_alarm: /smoke alarm|smoke detector|fire alarm|working alarm/i,
  carbon_monoxide: /carbon monoxide|co alarm|co detector|co2 alarm/i,
  right_to_rent: /right to rent|immigration check|right to reside|passport check|visa check/i,
};

/**
 * Detect topics mentioned in text.
 * Returns array of detected topics.
 */
export function detectTopics(text: string): Topic[] {
  const detected: Topic[] = [];

  for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS)) {
    if (pattern.test(text)) {
      detected.push(topic as Topic);
    }
  }

  return detected;
}

/**
 * Map topic to WizardTopic for buildWizardLink
 */
export function mapTopicToWizardTopic(topic: Topic): 'eviction' | 'arrears' | 'tenancy' | 'deposit' | 'compliance' | 'general' {
  switch (topic) {
    case 'eviction':
      return 'eviction';
    case 'arrears':
      return 'arrears';
    case 'tenancy':
      return 'tenancy';
    case 'deposit':
    case 'epc':
    case 'gas_safety':
    case 'eicr':
    case 'smoke_alarm':
    case 'carbon_monoxide':
    case 'right_to_rent':
    case 'compliance':
      return 'compliance';
    default:
      return 'general';
  }
}

/**
 * CTA definitions by topic and jurisdiction.
 */
interface TopicCTAConfig {
  topics: Topic[];
  ctas: SuggestedCTA[];
  excludeJurisdictions?: string[];
}

const CTA_CONFIGS: TopicCTAConfig[] = [
  // Notice Only - available for England, Wales, Scotland (not NI)
  {
    topics: ['eviction'],
    ctas: [
      { label: 'Notice Only', href: '/products/notice-only', price: 39.99, topic: 'eviction', type: 'wizard' },
    ],
    excludeJurisdictions: ['northern-ireland'],
  },
  // Complete Pack - England only
  {
    topics: ['eviction'],
    ctas: [
      { label: 'Complete Pack (England)', href: '/products/complete-pack', price: 149.99, topic: 'eviction', type: 'wizard' },
    ],
    excludeJurisdictions: ['northern-ireland', 'wales', 'scotland'],
  },
  // Money Claim - England only
  {
    topics: ['arrears'],
    ctas: [
      { label: 'Money Claim Pack (England)', href: '/products/money-claim', price: 99.99, topic: 'arrears', type: 'wizard' },
    ],
    excludeJurisdictions: ['northern-ireland', 'wales', 'scotland'],
  },
  // Notice Only for arrears - available for England, Wales, Scotland (not NI)
  {
    topics: ['arrears'],
    ctas: [
      { label: 'Notice Only', href: '/products/notice-only', price: 39.99, topic: 'arrears', type: 'wizard' },
    ],
    excludeJurisdictions: ['northern-ireland'],
  },
  {
    topics: ['tenancy', 'deposit'],
    ctas: [
      { label: 'Premium AST', href: '/products/ast?tier=premium', price: 14.99, topic: 'tenancy', type: 'wizard' },
      { label: 'Standard AST', href: '/products/ast?tier=standard', price: 9.99, topic: 'tenancy', type: 'wizard' },
    ],
    // Tenancy agreements are allowed in NI
  },
  // Compliance topics - push to validators first
  {
    topics: ['deposit'],
    ctas: [
      { label: 'Deposit Checker', href: '/tools/validators/deposit', topic: 'deposit', type: 'validator' },
    ],
  },
  {
    topics: ['epc'],
    ctas: [
      { label: 'EPC Checker', href: '/tools/validators/epc', topic: 'epc', type: 'validator' },
    ],
  },
  {
    topics: ['gas_safety'],
    ctas: [
      { label: 'Gas Safety Checker', href: '/tools/validators/gas-safety', topic: 'gas_safety', type: 'validator' },
    ],
  },
  {
    topics: ['eicr'],
    ctas: [
      { label: 'EICR Checker', href: '/tools/validators/eicr', topic: 'eicr', type: 'validator' },
    ],
  },
  {
    topics: ['smoke_alarm', 'carbon_monoxide'],
    ctas: [
      { label: 'Smoke & CO Alarms Guide', href: '/guides/smoke-co-alarms', topic: 'smoke_alarm', type: 'guide' },
    ],
  },
  {
    topics: ['right_to_rent'],
    ctas: [
      { label: 'Right to Rent Guide', href: '/guides/right-to-rent', topic: 'right_to_rent', type: 'guide' },
    ],
    excludeJurisdictions: ['scotland'], // Right to Rent doesn't apply in Scotland
  },
  {
    topics: ['compliance'],
    ctas: [
      { label: 'Compliance Checklist', href: '/tools/compliance-checklist', topic: 'compliance', type: 'validator' },
    ],
  },
];

/**
 * Get CTAs for detected topics, filtered by jurisdiction.
 *
 * NI Rule: Only return tenancy agreement CTAs for Northern Ireland.
 */
export function getTopicCTAs(topics: Topic[], jurisdiction?: string): SuggestedCTA[] {
  if (topics.length === 0) return [];

  const ctas: SuggestedCTA[] = [];
  const seenHrefs = new Set<string>();

  for (const config of CTA_CONFIGS) {
    // Check if any of the detected topics match this config
    const hasMatchingTopic = config.topics.some((t) => topics.includes(t));
    if (!hasMatchingTopic) continue;

    // Check jurisdiction exclusions
    if (jurisdiction && config.excludeJurisdictions?.includes(jurisdiction)) {
      continue;
    }

    // Add CTAs, avoiding duplicates
    for (const cta of config.ctas) {
      if (!seenHrefs.has(cta.href)) {
        seenHrefs.add(cta.href);
        ctas.push(cta);
      }
    }
  }

  return ctas;
}

/**
 * Check if detected topics warrant showing CTAs.
 * Useful for gating or analytics.
 */
export function hasActionableTopics(topics: Topic[]): boolean {
  return topics.length > 0;
}

/**
 * Get the primary topic from a list (first detected).
 */
export function getPrimaryTopic(topics: Topic[]): Topic | null {
  return topics[0] ?? null;
}

/**
 * Determine if the detected topic is a compliance-related topic.
 */
export function isComplianceTopic(topic: Topic): boolean {
  const complianceTopics: Topic[] = ['deposit', 'epc', 'gas_safety', 'eicr', 'smoke_alarm', 'carbon_monoxide', 'right_to_rent', 'compliance'];
  return complianceTopics.includes(topic);
}

/**
 * Get the recommended product for a topic and jurisdiction.
 * Returns null if the product is not supported in the jurisdiction.
 *
 * Regional Product Restrictions (January 2026):
 * - complete_pack: England only
 * - money_claim: England only
 * - notice_only: England, Wales, Scotland (not NI)
 * - tenancy_agreement: All UK regions
 */
export function getRecommendedProduct(
  topic: Topic,
  jurisdiction?: WizardJurisdiction
): { product: WizardProduct; label: string; description: string } | null {
  // Northern Ireland constraints: only tenancy agreements
  if (jurisdiction === 'northern-ireland') {
    if (topic === 'tenancy' || topic === 'deposit') {
      return {
        product: 'tenancy_agreement',
        label: 'Tenancy Agreement',
        description: 'Create a compliant tenancy agreement for Northern Ireland',
      };
    }
    // Don't recommend eviction or money claim products for NI
    if (topic === 'eviction' || topic === 'arrears') {
      return null;
    }
  }

  // Wales and Scotland constraints: only notice_only and tenancy_agreement
  // complete_pack and money_claim are England-only
  if (jurisdiction === 'wales' || jurisdiction === 'scotland') {
    if (topic === 'arrears') {
      // Money claim not available - recommend notice_only for arrears-based eviction
      return {
        product: 'notice_only',
        label: jurisdiction === 'wales' ? 'Section 173 Notice' : 'Notice to Leave',
        description: jurisdiction === 'wales'
          ? 'Generate a Renting Homes Act compliant notice for rent arrears (£39.99)'
          : 'Create a Notice to Leave for rent arrears under PRT (£39.99)',
      };
    }
  }

  // Standard product recommendations
  switch (topic) {
    case 'eviction':
      return {
        product: 'notice_only',
        label: jurisdiction === 'wales' ? 'Section 173 Notice' : jurisdiction === 'scotland' ? 'Notice to Leave' : 'Eviction Notice',
        description: jurisdiction === 'wales'
          ? 'Generate a Renting Homes Act compliant notice (£39.99)'
          : jurisdiction === 'scotland'
          ? 'Create a Notice to Leave for PRT tenancies (£39.99)'
          : 'Create a compliant Section 21 or Section 8 notice (£39.99)',
      };
    case 'arrears':
      // Money claim is England-only
      return {
        product: 'money_claim',
        label: 'Money Claim Pack',
        description: 'Recover rent arrears through the courts (£99.99, England only)',
      };
    case 'tenancy':
      return {
        product: 'ast_standard',
        label: jurisdiction === 'scotland' ? 'PRT Agreement' : jurisdiction === 'wales' ? 'Occupation Contract' : 'Tenancy Agreement',
        description: jurisdiction === 'scotland'
          ? 'Create a compliant Private Residential Tenancy (£9.99)'
          : jurisdiction === 'wales'
          ? 'Generate a Renting Homes Act occupation contract (£9.99)'
          : 'Create an Assured Shorthold Tenancy agreement (£9.99)',
      };
    default:
      return null;
  }
}

/**
 * Build a wizard link for a detected topic with full attribution.
 */
export function buildWizardLinkForTopic(
  topic: Topic,
  jurisdiction?: WizardJurisdiction,
  attribution?: {
    src?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }
): string | null {
  const recommendation = getRecommendedProduct(topic, jurisdiction);
  if (!recommendation) return null;

  return buildWizardLink({
    product: recommendation.product,
    jurisdiction,
    src: (attribution?.src as any) || 'ask_heaven',
    topic: mapTopicToWizardTopic(topic),
    utm_source: attribution?.utm_source,
    utm_medium: attribution?.utm_medium,
    utm_campaign: attribution?.utm_campaign,
  });
}
