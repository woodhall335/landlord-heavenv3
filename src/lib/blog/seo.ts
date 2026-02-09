import type { BlogPost } from './types';
import type { BlogRegion } from './categories';
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
];

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

const ensureActionKeyword = (value: string) => {
  if (/(guide|explained|steps|checklist|overview|process)/i.test(value)) {
    return value;
  }
  return `${value} Guide`;
};

const ensureInformationalTitle = (value: string) => {
  if (/(guide|explained|steps|checklist|overview|process)/i.test(value)) {
    return value;
  }
  return `${value} Guide`;
};

const removeCommercialTitleWords = (value: string) =>
  normalizeWhitespace(
    value.replace(/\b(template|download|pdf|generator|form|pack|bundle)\b/gi, '').trim()
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
      `${description} Get the ${jurisdictionLabel} steps and choose the right landlord pack.`
    );
  }
  if (description.length > 160) {
    description = `${description.slice(0, 157).trim()}...`;
  }
  return description;
};

const buildPillarLink = (intent: string, jurisdictionLabel: string) => {
  if (intent === 'money_claim') {
    return {
      href: '/money-claim-unpaid-rent',
      label: 'Money claim guide (England only)',
    };
  }

  if (intent === 'tenancy_agreement') {
    if (jurisdictionLabel === 'England') {
      return {
        href: '/assured-shorthold-tenancy-agreement-template',
        label: 'England tenancy agreement guide',
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
        href: '/eviction-notice-template',
        label: 'England eviction notice guide',
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
        href: '/eviction-process-england',
        label: 'England eviction process guide',
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
    return [
      pillar,
      {
        href: '/products/money-claim',
        label: 'Start a money claim (England only)',
      },
    ];
  }

  if (intent === 'tenancy_agreement') {
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
        href: jurisdictionLabel === 'England' && intent === 'eviction_pack'
          ? '/products/complete-pack'
          : '/products/notice-only',
        label: jurisdictionLabel === 'England' && intent === 'eviction_pack'
          ? 'Get the complete eviction pack'
          : 'Create an eviction notice',
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
  const primaryIntent = commercialResult.links[0]?.intent ?? 'tenancy_agreement';
  let primaryCommercialLink = commercialResult.links[0]?.target ?? COMMERCIAL_LINK_TARGETS.tenancy_agreement;
  if (primaryIntent === 'eviction_pack' && jurisdictionLabel !== 'England') {
    primaryCommercialLink = COMMERCIAL_LINK_TARGETS.eviction_notice;
  }
  const pillarLink = buildPillarLink(primaryIntent, jurisdictionLabel);
  const supportingLinks = buildSupportingLinks(primaryIntent, jurisdictionLabel);

  const sanitizedTitle = stripYearsAndPrices(post.title);
  const baseTitle = ensureActionKeyword(sanitizedTitle);
  const withJurisdiction = ensureJurisdiction(baseTitle, jurisdictionLabel);

  // Only allow explicit noindex flags from blog metadata.
  const shouldNoIndex = Boolean((post as { noindex?: boolean }).noindex);
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
