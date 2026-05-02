import type { BlogPost } from './types';
import { isPublicBlogDiscoveryRegion, type BlogRegion } from './categories';
import { analyzeBlogPost, isCannibalizing } from '@/lib/seo/blog-commercial-linking';
import { COMMERCIAL_LINK_TARGETS } from '@/lib/seo/commercial-linking';

const YEAR_PATTERN = /\b(19|20)\d{2}\b/g;
const PRICE_PATTERN = /£\s?\d+(?:\.\d{2})?/g;
const EXTRA_SEPARATORS = /\s*[-–—:]\s*$/;

const JURISDICTION_LABELS: Record<BlogRegion | 'uk', string> = {
  england: 'England',
  wales: 'Wales',
  scotland: 'Scotland',
  'northern-ireland': 'Northern Ireland',
  uk: 'UK',
};

const PRODUCT_HREFS = [
  '/products/ast',
  '/products/notice-only',
  '/products/complete-pack',
  '/products/money-claim',
  '/products/section-13-standard',
  '/products/section-13-defence',
  '/standard-tenancy-agreement',
  '/premium-tenancy-agreement',
  '/student-tenancy-agreement',
  '/hmo-shared-house-tenancy-agreement',
  '/lodger-agreement',
];

const BLOG_SEO_PRODUCT_OVERRIDES: Record<
  string,
  { href: string; label: string; anchorText: string; description: string; secondaryHref?: string; secondaryLabel?: string }
> = {
  'england-form-3a-eviction-notice-generator-after-renters-rights-act': {
    href: '/products/notice-only',
    label: 'Eviction Notice Generator for England landlords',
    anchorText: 'Start the Eviction Notice Generator',
    description: 'Create the current Form 3A notice-stage pack for England.',
    secondaryHref: '/products/complete-pack',
    secondaryLabel: 'Complete Eviction Pack',
  },
  'england-complete-eviction-pack-after-section-21-ban': {
    href: '/products/complete-pack',
    label: 'Complete Eviction Pack for England',
    anchorText: 'Start the Complete Eviction Pack',
    description: 'Prepare Form 3A, N5, N119, and court-ready possession paperwork.',
    secondaryHref: '/products/notice-only',
    secondaryLabel: 'Eviction Notice Generator',
  },
  'england-money-claim-unpaid-rent-after-renters-rights-act': {
    href: '/products/money-claim',
    label: 'Money Claim Pack for unpaid rent',
    anchorText: 'Start the Money Claim Pack',
    description: 'Prepare the arrears record and county court money claim route.',
  },
  'england-section-13-rent-increase-pack-after-renters-rights-act': {
    href: '/products/section-13-standard',
    label: 'Standard Section 13 Rent Increase Pack',
    anchorText: 'Start the Standard Section 13 Rent Increase Pack',
    description: 'Build Form 4A with comparable-listing support and rent justification.',
    secondaryHref: '/products/section-13-defence',
    secondaryLabel: 'Section 13 Defence Pack',
  },
  'england-section-13-defence-pack-tribunal-challenge': {
    href: '/products/section-13-defence',
    label: 'Section 13 Defence Pack',
    anchorText: 'Start the Section 13 Defence Pack',
    description: 'Prepare stronger challenge-response and tribunal-facing rent evidence.',
    secondaryHref: '/products/section-13-standard',
    secondaryLabel: 'Standard Section 13 Rent Increase Pack',
  },
  'england-standard-tenancy-agreement-after-1-may-2026': {
    href: '/standard-tenancy-agreement',
    label: 'Standard Tenancy Agreement',
    anchorText: 'Create the Standard Tenancy Agreement',
    description: 'Create a current England agreement for straightforward lets.',
    secondaryHref: '/premium-tenancy-agreement',
    secondaryLabel: 'Premium Tenancy Agreement',
  },
  'england-premium-tenancy-agreement-after-renters-rights-act': {
    href: '/premium-tenancy-agreement',
    label: 'Premium Tenancy Agreement',
    anchorText: 'Create the Premium Tenancy Agreement',
    description: 'Create a more detailed England agreement for higher-risk lets.',
    secondaryHref: '/standard-tenancy-agreement',
    secondaryLabel: 'Standard Tenancy Agreement',
  },
  'england-student-tenancy-agreement-after-renters-rights-act': {
    href: '/student-tenancy-agreement',
    label: 'Student Tenancy Agreement',
    anchorText: 'Create the Student Tenancy Agreement',
    description: 'Create an England agreement shaped around student-let practicalities.',
    secondaryHref: '/hmo-shared-house-tenancy-agreement',
    secondaryLabel: 'HMO Shared House Tenancy Agreement',
  },
  'england-hmo-shared-house-tenancy-agreement-after-renters-rights-act': {
    href: '/hmo-shared-house-tenancy-agreement',
    label: 'HMO Shared House Tenancy Agreement',
    anchorText: 'Create the HMO Shared House Tenancy Agreement',
    description: 'Create shared-occupation paperwork for HMOs and shared houses.',
    secondaryHref: '/premium-tenancy-agreement',
    secondaryLabel: 'Premium Tenancy Agreement',
  },
  'england-lodger-agreement-after-renters-rights-act': {
    href: '/lodger-agreement',
    label: 'Lodger Agreement',
    anchorText: 'Create the Lodger Agreement',
    description: 'Create resident-landlord paperwork for a lodger arrangement.',
    secondaryHref: '/standard-tenancy-agreement',
    secondaryLabel: 'Standard Tenancy Agreement',
  },
};

export interface BlogSeoConfig {
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroIntro: string;
  canonicalPath: string;
  robots: string;
  jurisdictionLabel: string;
  pillarLink: { href: string; label: string };
  supportingLinks: Array<{ href: string; label: string }>;
  primaryCommercialLink: {
    href: string;
    anchorText: string;
    description: string;
  };
  commercialResult: ReturnType<typeof analyzeBlogPost>;
  isIndexable: boolean;
}

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const stripYearsAndPrices = (value: string) =>
  normalizeWhitespace(
    value
      .replace(YEAR_PATTERN, '')
      .replace(PRICE_PATTERN, '')
      .replace(/\(\s*\)/g, '')
      .replace(EXTRA_SEPARATORS, '')
  );

const ensureInformationalTitle = (value: string) => {
  if (/(guide|explained|steps|checklist|overview|process)/i.test(value)) {
    return value;
  }
  return `${value} Guide`;
};

const removeCommercialTitleWords = (value: string) =>
  normalizeWhitespace(
    value.replace(/\b(template|download|pdf|generator|pack|bundle)\b/gi, '').trim()
  );

const ensureJurisdiction = (value: string, jurisdictionLabel: string) => {
  if (jurisdictionLabel === 'UK') {
    return value;
  }
  if (new RegExp(jurisdictionLabel, 'i').test(value)) {
    return value;
  }
  return `${value} (${jurisdictionLabel})`;
};

const enforceTitleLength = (value: string) => {
  if (value.length <= 60) {
    return value;
  }
  const truncated = value.slice(0, 60);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace <= 0) {
    return truncated.trim();
  }
  return truncated.slice(0, lastSpace).trim();
};

const normalizeMetaDescription = (value: string, jurisdictionLabel: string) => {
  let description = stripYearsAndPrices(value);
  if (description.length < 140) {
    description = normalizeWhitespace(
      `${description} Get the ${jurisdictionLabel} steps and choose the right next step.`
    );
  }
  if (description.length > 160) {
    description = `${description.slice(0, 157).trim()}...`;
  }
  return description;
};

const buildPillarLink = (intent: string, jurisdictionLabel: string) => {
  if (intent === 'money_claim') {
    if (jurisdictionLabel === 'England') {
      return {
        href: '/products/money-claim',
        label: 'Landlord money claim pack (England only)',
      };
    }
    return {
      href: '/money-claim',
      label: 'Money claim guide (England only)',
    };
  }

  if (intent === 'tenancy_agreement') {
    if (jurisdictionLabel === 'England') {
      return {
        href: '/products/ast',
        label: 'England tenancy agreements for landlords',
      };
    }
    if (jurisdictionLabel === 'Wales') {
      return {
        href: '/wales-tenancy-agreement-template',
        label: 'Wales tenancy agreement guide',
      };
    }
    if (jurisdictionLabel === 'Scotland') {
      return {
        href: '/private-residential-tenancy-agreement-template',
        label: 'Scotland tenancy agreement guide',
      };
    }
    if (jurisdictionLabel === 'Northern Ireland') {
      return {
        href: '/northern-ireland-tenancy-agreement-template',
        label: 'Northern Ireland tenancy agreement guide',
      };
    }
    return {
      href: '/tenancy-agreement-template',
      label: 'UK tenancy agreement guide',
    };
  }

  if (intent === 'eviction_notice') {
    if (jurisdictionLabel === 'England') {
      return {
        href: '/products/notice-only',
        label: 'Eviction notice pack for landlords',
      };
    }
    if (jurisdictionLabel === 'Wales') {
      return {
        href: '/wales-eviction-notices',
        label: 'Wales eviction notice guide',
      };
    }
    if (jurisdictionLabel === 'Scotland') {
      return {
        href: '/scotland-eviction-notices',
        label: 'Scotland eviction notice guide',
      };
    }
    return {
      href: '/eviction-notice-template',
      label: 'UK eviction notice guide',
    };
  }

  if (intent === 'eviction_pack') {
    if (jurisdictionLabel === 'England') {
      return {
        href: '/products/complete-pack',
        label: 'Complete eviction pack for England',
      };
    }
    if (jurisdictionLabel === 'Wales') {
      return {
        href: '/eviction-process-wales',
        label: 'Wales eviction process guide',
      };
    }
    if (jurisdictionLabel === 'Scotland') {
      return {
        href: '/eviction-process-scotland',
        label: 'Scotland eviction process guide',
      };
    }
    return {
      href: '/how-to-evict-tenant',
      label: 'UK eviction process guide',
    };
  }

  return {
    href: '/how-to-rent-guide',
    label: `${jurisdictionLabel} landlord compliance pillar`,
  };
};

const buildSupportingLinks = (intent: string, jurisdictionLabel: string) => {
  const pillar = buildPillarLink(intent, jurisdictionLabel);

  if (intent === 'money_claim') {
    if (jurisdictionLabel === 'England') {
      return [
        pillar,
        {
          href: '/money-claim-unpaid-rent',
          label: 'Recover unpaid rent guide',
        },
      ];
    }
    return [
      pillar,
      {
        href: '/products/money-claim',
        label: 'Start a money claim pack (England only)',
      },
    ];
  }

  if (intent === 'tenancy_agreement') {
    if (jurisdictionLabel === 'England') {
      return [
        pillar,
        {
          href: '/standard-tenancy-agreement',
          label: 'Start a standard tenancy agreement',
        },
      ];
    }

    const links = [
      pillar,
      {
        href: '/products/ast',
        label: 'Create a tenancy agreement',
      },
    ];
    return links.slice(0, 2);
  }

  if (intent === 'eviction_notice' || intent === 'eviction_pack') {
    return [
      pillar,
      {
        href:
          jurisdictionLabel === 'England' && intent === 'eviction_pack'
            ? '/eviction-process-england'
            : jurisdictionLabel === 'England'
              ? '/section-8-notice'
              : '/how-to-evict-tenant',
        label:
          jurisdictionLabel === 'England' && intent === 'eviction_pack'
            ? 'Read the England court-stage guide'
            : jurisdictionLabel === 'England'
              ? 'Read the Section 8 notice guide'
              : 'Read the eviction guide',
      },
    ];
  }

  return [
    pillar,
    {
      href: '/tools/rent-arrears-calculator',
      label: 'Rent arrears calculator',
    },
  ];
};

export const isProductHref = (href: string) =>
  PRODUCT_HREFS.some((productHref) => href.startsWith(productHref));

export const getBlogSeoConfig = (post: BlogPost, region: BlogRegion | null): BlogSeoConfig => {
  const jurisdictionLabel = region ? JURISDICTION_LABELS[region] : 'UK';
  const commercialResult = analyzeBlogPost(post, region);
  const completePackSignal = [
    post.title,
    post.description,
    post.metaDescription,
    post.targetKeyword,
    ...(post.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const primaryIntent =
    /complete eviction pack|complete pack|eviction pack/.test(completePackSignal)
      ? 'eviction_pack'
      : commercialResult.links[0]?.intent ?? 'tenancy_agreement';
  let primaryCommercialLink = commercialResult.links[0]?.target ?? COMMERCIAL_LINK_TARGETS.tenancy_agreement;
  if (primaryIntent === 'eviction_pack' && jurisdictionLabel !== 'England') {
    primaryCommercialLink = COMMERCIAL_LINK_TARGETS.eviction_notice;
  }
  let pillarLink = buildPillarLink(primaryIntent, jurisdictionLabel);
  let supportingLinks = buildSupportingLinks(primaryIntent, jurisdictionLabel);
  const productOverride = BLOG_SEO_PRODUCT_OVERRIDES[post.slug];

  if (productOverride && jurisdictionLabel === 'England') {
    primaryCommercialLink = {
      href: productOverride.href,
      anchorText: productOverride.anchorText,
      description: productOverride.description,
      allowedJurisdictions: ['england'],
    };
    pillarLink = {
      href: productOverride.href,
      label: productOverride.label,
    };
    supportingLinks = [
      pillarLink,
      ...(productOverride.secondaryHref && productOverride.secondaryLabel
        ? [{ href: productOverride.secondaryHref, label: productOverride.secondaryLabel }]
        : []),
    ];
  }

  const sanitizedTitle = stripYearsAndPrices(post.title);
  const baseTitle = ensureInformationalTitle(sanitizedTitle);
  const withJurisdiction = ensureJurisdiction(baseTitle, jurisdictionLabel);

  // Only allow explicit noindex flags from blog metadata.
  const shouldNoIndex =
    Boolean((post as { noindex?: boolean }).noindex) ||
    !isPublicBlogDiscoveryRegion(region);
  const needsDeconflict = isCannibalizing(post);

  let metaTitleBase = withJurisdiction;
  if (needsDeconflict) {
    metaTitleBase = removeCommercialTitleWords(metaTitleBase);
    metaTitleBase = ensureInformationalTitle(metaTitleBase);
  }
  const metaTitle = enforceTitleLength(metaTitleBase);

  const heroIntro = normalizeMetaDescription(post.description, jurisdictionLabel);
  const metaDescription = normalizeMetaDescription(post.metaDescription || post.description, jurisdictionLabel);

  const canonicalPath = `/blog/${post.canonicalSlug || post.slug}`;

  return {
    title: metaTitle,
    metaTitle,
    metaDescription,
    heroIntro,
    canonicalPath,
    robots: shouldNoIndex ? 'noindex,follow' : 'index,follow',
    jurisdictionLabel,
    pillarLink,
    supportingLinks,
    primaryCommercialLink,
    commercialResult,
    isIndexable: !shouldNoIndex,
  };
};
