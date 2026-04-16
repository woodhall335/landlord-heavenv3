import type { BlogPost } from './types';
import { SEO_PRODUCT_ROUTES } from '@/lib/seo/page-taxonomy';

export const BLOG_PRODUCT_ROUTES = {
  noticeOnly: SEO_PRODUCT_ROUTES.noticeOnly,
  completePack: SEO_PRODUCT_ROUTES.completePack,
  moneyClaim: SEO_PRODUCT_ROUTES.moneyClaim,
  ast: SEO_PRODUCT_ROUTES.ast,
} as const;

type ProductHref = (typeof BLOG_PRODUCT_ROUTES)[keyof typeof BLOG_PRODUCT_ROUTES];

export interface ProductCtaConfig {
  primaryProductHref: ProductHref;
  secondaryProductHref?: ProductHref;
  eyebrow: string;
  heading: string;
  intro: string;
  ctaLabel: string;
  bullets: [string, string, string];
  iconKey?: 'notice' | 'complete-pack' | 'money-claim' | 'ast';
  usedDefault: boolean;
}

const DEFAULT_CONFIG: ProductCtaConfig = {
  primaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
  secondaryProductHref: BLOG_PRODUCT_ROUTES.completePack,
  eyebrow: 'Next step for landlords',
  heading: 'Need to act on this tonight?',
  intro:
    'Work out the right notice, avoid the mistakes that slow the case down, and move to the next step without guessing.',
  ctaLabel: 'Find out which notice you need',
  bullets: [
    'Choose the right route before you serve anything.',
    'Answer plain-English questions. We handle the legal logic.',
    'Preview the paperwork before you pay.',
  ],
  iconKey: 'notice',
  usedDefault: true,
};

const MONEY_CLAIM_MATCHERS = [/money claim/i, /rent arrears/i, /arrears/i, /letter before action/i, /mcol/i];
const AST_MATCHERS = [/tenancy agreement/i, /ast/i, /prt/i, /occupation contract/i, /landlord agreement/i];
const COMPLETE_PACK_MATCHERS = [/eviction process/i, /possession claim/i, /n5b/i, /court hearing/i, /bailiff/i];

const matchesAny = (value: string, matchers: RegExp[]) =>
  matchers.some((matcher) => matcher.test(value));

export function getBlogProductCta(
  post: Pick<BlogPost, 'slug' | 'category' | 'tags' | 'title' | 'targetKeyword'>
): ProductCtaConfig {
  const haystack = [
    post.slug,
    post.category,
    post.title,
    post.targetKeyword,
    post.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  if (matchesAny(haystack, MONEY_CLAIM_MATCHERS)) {
    return {
      primaryProductHref: BLOG_PRODUCT_ROUTES.moneyClaim,
      secondaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
      eyebrow: 'Unpaid rent',
      heading: 'Ready to start recovering the money?',
      intro:
        'If the arrears keep growing, move from reading to action with the documents you need for the claim.',
      ctaLabel: 'Start recovering your rent',
      bullets: [
        'Set out what is owed clearly before the numbers get harder to untangle.',
        'Build the claim in plain English.',
        'Get the court paperwork ready for the next step.',
      ],
      iconKey: 'money-claim',
      usedDefault: false,
    };
  }

  if (matchesAny(haystack, AST_MATCHERS)) {
    return {
      primaryProductHref: BLOG_PRODUCT_ROUTES.ast,
      secondaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
      eyebrow: 'New tenancy',
      heading: 'Need the agreement sorted tonight?',
      intro:
        'Use the right agreement for the property now so you are not fixing an old template later.',
      ctaLabel: 'Create your tenancy agreement',
      bullets: [
        'Choose the right England agreement route for the tenancy you are setting up.',
        'Avoid old wording that causes problems later.',
        'Preview it before you pay.',
      ],
      iconKey: 'ast',
      usedDefault: false,
    };
  }

  if (matchesAny(haystack, COMPLETE_PACK_MATCHERS)) {
    return {
      primaryProductHref: BLOG_PRODUCT_ROUTES.completePack,
      secondaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
      eyebrow: 'Court stage',
      heading: 'Need more than just the notice?',
      intro:
        'If the case is moving toward court, keep your notice, forms, and evidence lined up from the start.',
      ctaLabel: 'Start your court pack',
      bullets: [
        'Keep the notice and court forms consistent.',
        'Avoid paying court fees on a weak file.',
        'Get the next-stage paperwork together in one place.',
      ],
      iconKey: 'complete-pack',
      usedDefault: false,
    };
  }

  return DEFAULT_CONFIG;
}
