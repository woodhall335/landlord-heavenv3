import type { BlogPost } from './types';

export const BLOG_PRODUCT_ROUTES = {
  noticeOnly: '/products/notice-only',
  completePack: '/products/complete-pack',
  moneyClaim: '/products/money-claim',
  ast: '/products/ast',
} as const;

type ProductHref = (typeof BLOG_PRODUCT_ROUTES)[keyof typeof BLOG_PRODUCT_ROUTES];

export interface ProductCtaConfig {
  primaryProductHref: ProductHref;
  secondaryProductHref?: ProductHref;
  ctaLabel: string;
  bullets: [string, string, string];
  iconKey?: 'notice' | 'complete-pack' | 'money-claim' | 'ast';
  usedDefault: boolean;
}

const DEFAULT_CONFIG: ProductCtaConfig = {
  primaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
  secondaryProductHref: BLOG_PRODUCT_ROUTES.completePack,
  ctaLabel: 'Start your eviction notice',
  bullets: ['Choose Section 21 or Section 8 with guided prompts', 'Build a valid eviction notice in plain English', 'Move from advice to action in minutes'],
  iconKey: 'notice',
  usedDefault: true,
};

const MONEY_CLAIM_MATCHERS = [/money claim/i, /rent arrears/i, /arrears/i, /letter before action/i, /mcol/i];
const AST_MATCHERS = [/tenancy agreement/i, /ast/i, /prt/i, /occupation contract/i, /landlord agreement/i];
const COMPLETE_PACK_MATCHERS = [/eviction process/i, /possession claim/i, /n5b/i, /court hearing/i, /bailiff/i];

const matchesAny = (value: string, matchers: RegExp[]) => matchers.some((matcher) => matcher.test(value));

export function getBlogProductCta(post: Pick<BlogPost, 'slug' | 'category' | 'tags' | 'title' | 'targetKeyword'>): ProductCtaConfig {
  const haystack = [post.slug, post.category, post.title, post.targetKeyword, post.tags.join(' ')].join(' ').toLowerCase();

  if (matchesAny(haystack, MONEY_CLAIM_MATCHERS)) {
    return {
      primaryProductHref: BLOG_PRODUCT_ROUTES.moneyClaim,
      secondaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
      ctaLabel: 'Start your money claim',
      bullets: ['Recover rent arrears with a guided money claim flow', 'Organise unpaid rent evidence and claim details', 'Generate court-ready documents for filing'],
      iconKey: 'money-claim',
      usedDefault: false,
    };
  }

  if (matchesAny(haystack, AST_MATCHERS)) {
    return {
      primaryProductHref: BLOG_PRODUCT_ROUTES.ast,
      secondaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
      ctaLabel: 'Start tenancy agreement pack',
      bullets: ['Jurisdiction-aware tenancy clauses', 'Landlord and tenant details auto-filled', 'Ready-to-sign agreement outputs'],
      iconKey: 'ast',
      usedDefault: false,
    };
  }

  if (matchesAny(haystack, COMPLETE_PACK_MATCHERS)) {
    return {
      primaryProductHref: BLOG_PRODUCT_ROUTES.completePack,
      secondaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
      ctaLabel: 'Start your complete eviction pack',
      bullets: ['Notice, possession, and court flow in one place', 'Step-by-step process from notice to filing', 'Court-ready bundle outputs'],
      iconKey: 'complete-pack',
      usedDefault: false,
    };
  }

  return DEFAULT_CONFIG;
}

