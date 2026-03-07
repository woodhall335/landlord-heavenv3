/**
 * Pure helper function for generating blog post CTAs
 * Extracted from NextSteps.tsx for use in scripts and tests
 */

import {
  buildAskHeavenLink,
  type AskHeavenTopic,
} from '@/lib/ask-heaven/buildAskHeavenLink';

export interface NextStepsCTAInput {
  slug: string;
  tags?: string[];
  category?: string;
}

export interface NextStepsCTA {
  href: string;
  label: string;
  priority: number;
}

const PRODUCT_HREFS = new Set([
  '/products/notice-only',
  '/products/complete-pack',
  '/products/money-claim',
  '/products/ast',
]);

// England-only URLs that should NEVER appear for Scotland/Wales/NI content
export const ENGLAND_ONLY_URLS = [
  '/section-21-notice-template',
  '/section-8-notice-template',
  '/tools/validators/section-21',
  '/tools/validators/section-8',
  '/tools/free-section-21-notice-generator',
  '/tools/free-section-8-notice-generator',
];

// Map compliance topics to Ask Heaven topics and prompts
const COMPLIANCE_ASK_HEAVEN_MAP: Record<
  string,
  { topic: AskHeavenTopic; prompt: string }
> = {
  deposit: {
    topic: 'deposit',
    prompt: 'What are the deposit protection requirements for landlords?',
  },
  gas_safety: {
    topic: 'gas_safety',
    prompt: 'When must a landlord provide a gas safety certificate?',
  },
  epc: {
    topic: 'epc',
    prompt: 'What EPC rating is required to let a property?',
  },
  eicr: {
    topic: 'eicr',
    prompt: 'Do landlords need an EICR and how often?',
  },
  smoke_alarm: {
    topic: 'smoke_alarms',
    prompt: 'What are the smoke and CO alarm rules for landlords?',
  },
  right_to_rent: {
    topic: 'right_to_rent',
    prompt: 'Do I need to do right to rent checks and how?',
  },
  fire_safety: {
    topic: 'smoke_alarms',
    prompt: 'What are the fire safety requirements for landlords?',
  },
  inventory: {
    topic: 'general',
    prompt: 'What should be included in a property inventory?',
  },
};

/**
 * Determine jurisdiction from slug
 */
export function detectJurisdiction(
  slug: string
): 'england' | 'wales' | 'scotland' | 'northern-ireland' | 'uk-wide' {
  const lowerSlug = slug.toLowerCase();

  if (lowerSlug.startsWith('scotland-')) return 'scotland';
  if (
    lowerSlug.startsWith('wales-') ||
    lowerSlug.includes('renting-homes') ||
    lowerSlug.includes('section-173') ||
    lowerSlug.includes('contract-holder')
  )
    return 'wales';
  if (
    lowerSlug.startsWith('northern-ireland-') ||
    lowerSlug.startsWith('ni-') ||
    lowerSlug.includes('-ni-')
  )
    return 'northern-ireland';
  if (lowerSlug.startsWith('uk-')) return 'uk-wide';

  // Default to england for content without explicit jurisdiction
  return 'england';
}

/**
 * Check if a slug represents non-England content
 */
export function isNonEnglandSlug(slug: string): boolean {
  const lowerSlug = slug.toLowerCase();

  const isScotland = lowerSlug.startsWith('scotland-');
  const isWales =
    lowerSlug.startsWith('wales-') || lowerSlug.includes('renting-homes');
  const isNI =
    lowerSlug.startsWith('northern-ireland-') ||
    lowerSlug.startsWith('ni-') ||
    lowerSlug.includes('-ni-');

  return isScotland || isWales || isNI;
}

/**
 * Pure function to generate CTAs for a blog post
 * This is the same logic used in the NextSteps React component
 *
 * @param input - Blog post metadata (slug, tags, category)
 * @returns Array of CTA objects sorted by priority, max 4 items
 */
export function getNextStepsCTAs(input: NextStepsCTAInput): NextStepsCTA[] {
  const { slug, tags = [], category = '' } = input;
  const steps: NextStepsCTA[] = [];
  const lowerTags = tags.map((t) => t.toLowerCase());
  const lowerSlug = slug.toLowerCase();
  const lowerCategory = category.toLowerCase();

  // Jurisdiction detection for gating England-only CTAs
  const isScotland = lowerSlug.startsWith('scotland-');
  const isWales =
    lowerSlug.startsWith('wales-') || lowerSlug.includes('renting-homes');
  const isNI =
    lowerSlug.startsWith('northern-ireland-') ||
    lowerSlug.startsWith('ni-') ||
    lowerSlug.includes('-ni-');
  const isNonEngland = isScotland || isWales || isNI;

  // Check for Section 21 related content (England only)
  // Gate: only show Section 21 CTAs for England content
  const isSection21Related =
    !isNonEngland &&
    (lowerSlug.includes('section-21') ||
      lowerTags.some((t) => t.includes('section 21')) ||
      lowerSlug.includes('no-fault') ||
      lowerSlug.includes('assured-shorthold'));

  if (isSection21Related) {
    steps.push({
      href: '/section-21-notice-template',
      label: 'Section 21 Notice Template',
      priority: 1,
    });
    steps.push({
      href: '/products/notice-only',
      label: 'Notice Only Bundle',
      priority: 3,
    });
    steps.push({
      href: '/tools/validators/section-21',
      label: 'Section 21 Validity Checker',
      priority: 2,
    });
  }

  // Check for Section 8 related content (England only)
  // Gate: ground- heuristic should NOT trigger for Scotland/Wales/NI
  const isSection8Related =
    !isNonEngland &&
    (lowerSlug.includes('section-8') ||
      lowerTags.some((t) => t.includes('section 8')) ||
      lowerSlug.includes('ground-'));

  if (isSection8Related) {
    steps.push({
      href: '/section-8-notice-template',
      label: 'Section 8 Notice Template',
      priority: 1,
    });
    steps.push({
      href: '/products/complete-pack',
      label: 'Complete Eviction Pack',
      priority: 3,
    });
    steps.push({
      href: '/tools/validators/section-8',
      label: 'Section 8 Grounds Checker',
      priority: 2,
    });
  }

  // Check for rent arrears content
  if (
    lowerSlug.includes('rent-arrears') ||
    lowerSlug.includes('unpaid-rent') ||
    lowerSlug.includes('money-claim') ||
    lowerTags.some((t) => t.includes('arrears'))
  ) {
    steps.push({
      href: '/products/money-claim',
      label: 'Money Claim Pack',
      priority: 1,
    });
    steps.push({
      href: '/tools/rent-arrears-calculator',
      label: 'Rent Arrears Calculator',
      priority: 2,
    });
  }

  // Check for tenancy agreement content
  if (
    lowerSlug.includes('tenancy-agreement') ||
    lowerSlug.includes('ast') ||
    lowerSlug.includes('occupation-contract') ||
    lowerSlug.includes('prt') ||
    lowerCategory.includes('tenancy')
  ) {
    steps.push({
      href: '/products/ast',
      label: 'Tenancy Agreement Pack',
      priority: 1,
    });
    steps.push({
      href: '/assured-shorthold-tenancy-agreement-template',
      label: 'Tenancy Agreement Template',
      priority: 2,
    });
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: 'general',
        prompt: 'What should a compliant tenancy agreement include?',
        utm_campaign: slug,
      }),
      label: 'Ask About Tenancy Agreements',
      priority: 3,
    });
  }

  // Check for Wales-specific content
  if (lowerSlug.startsWith('wales-') || lowerSlug.includes('renting-homes')) {
    steps.push({
      href: '/wales-eviction-notices',
      label: 'Wales Eviction Guide',
      priority: 1,
    });
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: 'general',
        jurisdiction: 'wales',
        prompt: 'How do I serve a notice under the Renting Homes (Wales) Act?',
        utm_campaign: slug,
      }),
      label: 'Ask Heaven for Wales',
      priority: 2,
    });
    if (!steps.some((s) => s.href.includes('notice-only'))) {
      steps.push({
        href: '/products/notice-only',
        label: 'Notice Only Bundle',
        priority: 3,
      });
    }
  }

  // Check for Scotland-specific content
  if (lowerSlug.startsWith('scotland-')) {
    steps.push({
      href: '/scotland-eviction-notices',
      label: 'Scotland Eviction Guide',
      priority: 1,
    });
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: 'general',
        jurisdiction: 'scotland',
        prompt: 'How do I serve a Notice to Leave in Scotland?',
        utm_campaign: slug,
      }),
      label: 'Ask Heaven for Scotland',
      priority: 2,
    });
    if (!steps.some((s) => s.href.includes('notice-only'))) {
      steps.push({
        href: '/products/notice-only',
        label: 'Notice Only Bundle',
        priority: 3,
      });
    }
  }

  // Check for eviction/possession content
  if (
    lowerSlug.includes('eviction') ||
    lowerSlug.includes('possession') ||
    lowerSlug.includes('bailiff') ||
    lowerCategory.includes('eviction')
  ) {
    if (!steps.some((s) => s.href.includes('complete-pack'))) {
      steps.push({
        href: '/products/complete-pack',
        label: 'Complete Eviction Pack',
        priority: 1,
      });
    }
  }

  // Check for deposit protection content
  if (
    lowerSlug.includes('deposit') ||
    lowerTags.some((t) => t.includes('deposit'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.deposit;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Deposit Rules',
      priority: 2,
    });
  }

  // Check for gas safety content
  if (
    lowerSlug.includes('gas-safety') ||
    lowerSlug.includes('gas-safe') ||
    lowerTags.some((t) => t.includes('gas safety'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.gas_safety;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Gas Safety',
      priority: 2,
    });
  }

  // Check for EPC content
  if (
    lowerSlug.includes('epc') ||
    lowerSlug.includes('energy-performance') ||
    lowerTags.some((t) => t.includes('epc'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.epc;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About EPC Rules',
      priority: 2,
    });
  }

  // Check for electrical safety / EICR content
  if (
    lowerSlug.includes('eicr') ||
    lowerSlug.includes('electrical-safety') ||
    lowerTags.some((t) => t.includes('eicr') || t.includes('electrical'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.eicr;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About EICR Rules',
      priority: 2,
    });
  }

  // Check for smoke/CO alarm / fire safety content
  if (
    lowerSlug.includes('smoke') ||
    lowerSlug.includes('fire-safety') ||
    lowerSlug.includes('carbon-monoxide') ||
    lowerSlug.includes('co-alarm') ||
    lowerTags.some((t) => t.includes('smoke') || t.includes('fire safety'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.smoke_alarm;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Fire Safety',
      priority: 2,
    });
  }

  // Check for right to rent content
  if (
    lowerSlug.includes('right-to-rent') ||
    lowerTags.some((t) => t.includes('right to rent'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.right_to_rent;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Right to Rent',
      priority: 2,
    });
  }

  // Check for inventory content
  if (
    lowerSlug.includes('inventory') ||
    lowerTags.some((t) => t.includes('inventory'))
  ) {
    const askHeavenConfig = COMPLIANCE_ASK_HEAVEN_MAP.inventory;
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: askHeavenConfig.topic,
        prompt: askHeavenConfig.prompt,
        utm_campaign: slug,
      }),
      label: 'Ask About Inventories',
      priority: 3,
    });
  }

  // Check for Northern Ireland content
  if (lowerSlug.startsWith('northern-ireland-')) {
    if (!steps.some((s) => s.href.includes('ask-heaven'))) {
      steps.push({
        href: buildAskHeavenLink({
          source: 'blog',
          topic: 'general',
          jurisdiction: 'northern-ireland',
          utm_campaign: slug,
        }),
        label: 'Ask Heaven for NI',
        priority: 2,
      });
    }
    if (!steps.some((s) => s.href.includes('ast'))) {
      steps.push({
        href: '/products/ast',
        label: 'Tenancy Agreement Pack',
        priority: 3,
      });
    }
  }

  // Check for HMO content
  if (lowerSlug.includes('hmo') || lowerTags.some((t) => t.includes('hmo'))) {
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: 'general',
        prompt: 'What are the HMO licensing requirements?',
        utm_campaign: slug,
      }),
      label: 'Ask About HMO Rules',
      priority: 3,
    });
  }

  // Check for Rent Smart Wales (specific case - doesn't start with wales-)
  if (lowerSlug === 'rent-smart-wales') {
    steps.push({
      href: '/wales-eviction-notices',
      label: 'Wales Eviction Guide',
      priority: 1,
    });
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: 'general',
        jurisdiction: 'wales',
        prompt: 'What are the Rent Smart Wales registration requirements?',
        utm_campaign: slug,
      }),
      label: 'Ask Heaven for Wales',
      priority: 2,
    });
  }

  // Enhanced fallback: UK-wide landlord guides that don't match specific topics
  if (steps.length === 0 || (steps.length === 1 && steps[0].priority >= 10)) {
    steps.push({
      href: buildAskHeavenLink({
        source: 'blog',
        topic: 'general',
        prompt: 'I have a question about being a UK landlord',
        utm_campaign: slug,
      }),
      label: 'Ask Heaven',
      priority: 1,
    });

    if (!steps.some((s) => s.href.includes('ast'))) {
      steps.push({
        href: '/products/ast',
        label: 'Tenancy Agreement Pack',
        priority: 2,
      });
    }

    steps.push({
      href: '/how-to-evict-tenant',
      label: 'UK Eviction Guide',
      priority: 3,
    });
  }

  const uniqueSteps = steps
    .sort((a, b) => a.priority - b.priority)
    .filter(
      (step, index, arr) => arr.findIndex((s) => s.href === step.href) === index
    );

  const productSteps = uniqueSteps.filter((step) => PRODUCT_HREFS.has(step.href));
  const nonProductSteps = uniqueSteps.filter((step) => !PRODUCT_HREFS.has(step.href));

  const fallbackProduct: NextStepsCTA = {
    href: '/products/ast',
    label: 'Tenancy Agreement Pack',
    priority: 99,
  };

  const primaryProduct = productSteps[0] ?? fallbackProduct;

  const finalSteps: NextStepsCTA[] = [];
  if (nonProductSteps[0]) {
    finalSteps.push(nonProductSteps[0]);
  }
  if (nonProductSteps[1]) {
    finalSteps.push(nonProductSteps[1]);
  }
  finalSteps.push(primaryProduct);

  return finalSteps.slice(0, 3);
}

/**
 * Check if CTAs contain any England-only URLs
 * Useful for jurisdiction violation detection
 */
export function hasEnglandOnlyCTAs(ctas: NextStepsCTA[]): boolean {
  return ctas.some((cta) =>
    ENGLAND_ONLY_URLS.some((url) => cta.href.startsWith(url))
  );
}

/**
 * Get list of England-only URLs from CTAs
 */
export function getEnglandOnlyCTAs(ctas: NextStepsCTA[]): string[] {
  return ctas
    .filter((cta) => ENGLAND_ONLY_URLS.some((url) => cta.href.startsWith(url)))
    .map((cta) => cta.href);
}
