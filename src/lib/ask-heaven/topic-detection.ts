/**
 * Topic Detection for Ask Heaven
 *
 * Detects conversation topics from message text using lightweight regex patterns.
 * Maps topics to relevant product CTAs based on jurisdiction.
 */

export type Topic = 'eviction' | 'arrears' | 'tenancy' | 'deposit';

export interface SuggestedCTA {
  label: string;
  href: string;
  price?: number;
  topic?: Topic;
}

/**
 * Topic patterns - lightweight regex-based detection.
 */
const TOPIC_PATTERNS: Record<Topic, RegExp> = {
  eviction: /evict|possession|section 21|s21|section 8|s8|notice to leave|remove tenant|end.+tenancy|terminate.+tenant/i,
  arrears: /arrears|rent owed|unpaid|debt|money claim|recover money|lba|letter before action|outstanding rent/i,
  tenancy: /tenancy agreement|ast|prt|occupation contract|new tenant|lease|rental agreement|assured shorthold/i,
  deposit: /deposit|protection|tds|dps|mydeposits|prescribed information|deposit scheme/i,
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
 * CTA definitions by topic and jurisdiction.
 */
interface TopicCTAConfig {
  topics: Topic[];
  ctas: SuggestedCTA[];
  excludeJurisdictions?: string[];
}

const CTA_CONFIGS: TopicCTAConfig[] = [
  {
    topics: ['eviction'],
    ctas: [
      { label: 'Notice Only', href: '/products/notice-only', price: 29.99, topic: 'eviction' },
      { label: 'Complete Pack', href: '/products/complete-pack', price: 149.99, topic: 'eviction' },
    ],
    excludeJurisdictions: ['northern-ireland'],
  },
  {
    topics: ['arrears'],
    ctas: [
      { label: 'Money Claim Pack', href: '/products/money-claim', price: 179.99, topic: 'arrears' },
      { label: 'Notice Only', href: '/products/notice-only', price: 29.99, topic: 'arrears' },
    ],
    excludeJurisdictions: ['northern-ireland'],
  },
  {
    topics: ['tenancy', 'deposit'],
    ctas: [
      { label: 'Premium AST', href: '/products/ast?tier=premium', price: 14.99, topic: 'tenancy' },
      { label: 'Standard AST', href: '/products/ast?tier=standard', price: 9.99, topic: 'tenancy' },
    ],
    // Tenancy agreements are allowed in NI
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
