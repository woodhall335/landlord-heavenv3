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
  if (/(guide|explained|steps|checklist|overview|process|template)/i.test(value)) {
    return value;
  }
  return `${value} Guide`;
};

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
  let title = value;
  if (title.length < 50) {
    title = `${title} for Landlords`;
  }
  if (title.length < 50) {
    title = `${title} Guide`;
  }
  if (title.length > 60) {
    title = title.slice(0, 60).trim();
  }
  return title;
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
      label: `${jurisdictionLabel} rent arrears recovery guide`,
    };
  }

  if (intent === 'tenancy_agreement') {
    return {
      href: '/periodic-tenancy-agreement',
      label: `${jurisdictionLabel} tenancy agreement pillar guide`,
    };
  }

  if (intent === 'eviction_notice' || intent === 'eviction_pack') {
    if (jurisdictionLabel === 'England') {
      return {
        href: '/eviction-process-england',
        label: 'England eviction process pillar',
      };
    }
    if (jurisdictionLabel === 'Wales') {
      return {
        href: '/eviction-process-wales',
        label: 'Wales eviction process pillar',
      };
    }
    if (jurisdictionLabel === 'Scotland') {
      return {
        href: '/eviction-process-scotland',
        label: 'Scotland eviction process pillar',
      };
    }
    return {
      href: '/how-to-evict-tenant',
      label: 'UK eviction process pillar',
    };
  }

  return {
    href: '/how-to-rent-guide',
    label: `${jurisdictionLabel} landlord compliance pillar`,
  };
};

const buildSupportingLinks = (intent: string, jurisdictionLabel: string) => {
  const links: Array<{ href: string; label: string }> = [];
  const pillar = buildPillarLink(intent, jurisdictionLabel);
  links.push(pillar);

  if (intent === 'money_claim') {
    links.push({
      href: '/tools/rent-arrears-calculator',
      label: `${jurisdictionLabel} rent arrears calculator`,
    });
  } else if (intent === 'tenancy_agreement') {
    links.push({
      href: '/assured-shorthold-tenancy-agreement-template',
      label: `${jurisdictionLabel} tenancy agreement template`,
    });
  } else if (intent === 'eviction_notice' || intent === 'eviction_pack') {
    links.push({
      href: jurisdictionLabel === 'Wales'
        ? '/wales-eviction-notices'
        : jurisdictionLabel === 'Scotland'
        ? '/scotland-eviction-notices'
        : '/eviction-notice-template',
      label: `${jurisdictionLabel} eviction notice guide`,
    });
  } else {
    links.push({
      href: '/tools/rent-arrears-calculator',
      label: `${jurisdictionLabel} rent arrears calculator`,
    });
  }

  return links.slice(0, 2);
};

export const isProductHref = (href: string) =>
  PRODUCT_HREFS.some((productHref) => href.startsWith(productHref));

export const getBlogSeoConfig = (post: BlogPost, region: BlogRegion | null): BlogSeoConfig => {
  const jurisdictionLabel = region ? JURISDICTION_LABELS[region] : 'UK';
  const commercialResult = analyzeBlogPost(post, region);
  const primaryIntent = commercialResult.links[0]?.intent ?? 'tenancy_agreement';
  const primaryCommercialLink = commercialResult.links[0]?.target ?? COMMERCIAL_LINK_TARGETS.tenancy_agreement;
  const pillarLink = buildPillarLink(primaryIntent, jurisdictionLabel);
  const supportingLinks = buildSupportingLinks(primaryIntent, jurisdictionLabel);

  const sanitizedTitle = stripYearsAndPrices(post.title);
  const actionTitle = ensureActionKeyword(sanitizedTitle);
  const withJurisdiction = ensureJurisdiction(actionTitle, jurisdictionLabel);
  const metaTitle = enforceTitleLength(withJurisdiction);

  const heroIntro = normalizeMetaDescription(post.description, jurisdictionLabel);
  const metaDescription = normalizeMetaDescription(post.metaDescription || post.description, jurisdictionLabel);

  const canonicalPath = `/blog/${post.canonicalSlug || post.slug}`;

  // SEO cannibalization control: if the post targets a product-equivalent query,
  // we noindex the post so the product or pillar page stays primary.
  const shouldNoIndex = isCannibalizing(post);

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
