import type { BlogPost } from './types';
import { SEO_PRODUCT_ROUTES } from '@/lib/seo/page-taxonomy';

export const BLOG_PRODUCT_ROUTES = {
  noticeOnly: SEO_PRODUCT_ROUTES.noticeOnly,
  completePack: SEO_PRODUCT_ROUTES.completePack,
  moneyClaim: SEO_PRODUCT_ROUTES.moneyClaim,
  ast: SEO_PRODUCT_ROUTES.ast,
  section13Standard: '/products/section-13-standard',
  section13Defence: '/products/section-13-defence',
  standardTenancy: '/standard-tenancy-agreement',
  premiumTenancy: '/premium-tenancy-agreement',
  studentTenancy: '/student-tenancy-agreement',
  hmoSharedHouseTenancy: '/hmo-shared-house-tenancy-agreement',
  lodgerAgreement: '/lodger-agreement',
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
  heading: 'Need to act on this now?',
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

const PRODUCT_REFORM_CTA_OVERRIDES: Record<string, ProductCtaConfig> = {
  'england-form-3a-eviction-notice-generator-after-renters-rights-act': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.completePack,
    eyebrow: 'Form 3A notice',
    heading: 'Need to serve the current England notice?',
    intro:
      'Use the notice-only route for Form 3A, service instructions, the validity checklist, and notice-stage evidence before you serve anything.',
    ctaLabel: 'Start the Eviction Notice Generator',
    bullets: [
      'Built for the post-1 May 2026 England notice route.',
      'Keeps notice-stage work separate from court-pack paperwork.',
      'Preview the documents before payment.',
    ],
    iconKey: 'notice',
    usedDefault: false,
  },
  'england-complete-eviction-pack-after-section-21-ban': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.completePack,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
    eyebrow: 'Notice through court',
    heading: 'Need the full court-ready possession file?',
    intro:
      'Build the Form 3A notice, N5, N119, arrears schedule, evidence checklist, and court-facing file together.',
    ctaLabel: 'Start the Complete Eviction Pack',
    bullets: [
      'Connect the notice and claim paperwork from the start.',
      'Reduce mismatch between grounds, dates, arrears, and particulars.',
      'Designed for England possession cases moving toward court.',
    ],
    iconKey: 'complete-pack',
    usedDefault: false,
  },
  'england-money-claim-unpaid-rent-after-renters-rights-act': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.moneyClaim,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.noticeOnly,
    eyebrow: 'Unpaid rent',
    heading: 'Ready to organise the arrears claim?',
    intro:
      'Prepare the rent debt story, arrears figures, and claim narrative before the file becomes harder to prove.',
    ctaLabel: 'Start the Money Claim Pack',
    bullets: [
      'Keep debt recovery separate from possession paperwork.',
      'Build a clearer arrears record and claim narrative.',
      'Prepare the county court money claim route in plain English.',
    ],
    iconKey: 'money-claim',
    usedDefault: false,
  },
  'england-section-13-rent-increase-pack-after-renters-rights-act': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.section13Standard,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.section13Defence,
    eyebrow: 'Supportable rent increase',
    heading: 'Need more than a blank Form 4A?',
    intro:
      'Check local comparable listings, judge whether the proposed rent looks supportable, and build Form 4A with the justification pack.',
    ctaLabel: 'Start the Standard Section 13 Pack',
    bullets: [
      'Uses live comparable listings to support the proposed rent.',
      'Helps avoid unsupported increases that attract challenge.',
      'Builds Form 4A and the explanation pack together.',
    ],
    iconKey: 'notice',
    usedDefault: false,
  },
  'england-section-13-defence-pack-tribunal-challenge': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.section13Defence,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.section13Standard,
    eyebrow: 'Challenge protection',
    heading: 'Expecting pushback on the rent increase?',
    intro:
      'Add stronger challenge-response and tribunal-facing material around Form 4A, comparable evidence, and rent justification.',
    ctaLabel: 'Start the Section 13 Defence Pack',
    bullets: [
      'Designed for higher-risk rent increase cases.',
      'Turns market evidence into a clearer challenge narrative.',
      'Helps explain why the proposed figure is supportable.',
    ],
    iconKey: 'notice',
    usedDefault: false,
  },
  'england-standard-tenancy-agreement-after-1-may-2026': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.standardTenancy,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.premiumTenancy,
    eyebrow: 'Current England agreement',
    heading: 'Need a clean standard tenancy agreement?',
    intro:
      'Use the standard route for straightforward England lets where old AST-first wording may no longer be the right fit.',
    ctaLabel: 'Create the Standard Agreement',
    bullets: [
      'Built for straightforward England tenancies.',
      'Avoids stale fixed-term AST assumptions.',
      'Preview the agreement before payment.',
    ],
    iconKey: 'ast',
    usedDefault: false,
  },
  'england-premium-tenancy-agreement-after-renters-rights-act': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.premiumTenancy,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.standardTenancy,
    eyebrow: 'Stronger agreement',
    heading: 'Need broader tenancy protection?',
    intro:
      'Use Premium where the tenancy is higher-value, more complex, guarantor-backed, shared, or simply worth a stronger record.',
    ctaLabel: 'Create the Premium Agreement',
    bullets: [
      'More detailed than a basic agreement route.',
      'Better fit for higher-risk lets.',
      'Keeps the landlord file clearer from day one.',
    ],
    iconKey: 'ast',
    usedDefault: false,
  },
  'england-student-tenancy-agreement-after-renters-rights-act': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.studentTenancy,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.hmoSharedHouseTenancy,
    eyebrow: 'Student let',
    heading: 'Setting up a student tenancy?',
    intro:
      'Use a route shaped around student occupiers, academic timing, guarantor expectations, and shared responsibility.',
    ctaLabel: 'Create the Student Agreement',
    bullets: [
      'Designed for student-let practicalities.',
      'Keeps occupier, rent, deposit, and guarantor details organised.',
      'Avoids treating student lets as generic single-household paperwork.',
    ],
    iconKey: 'ast',
    usedDefault: false,
  },
  'england-hmo-shared-house-tenancy-agreement-after-renters-rights-act': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.hmoSharedHouseTenancy,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.premiumTenancy,
    eyebrow: 'HMO and shared house',
    heading: 'Need shared-house paperwork that fits?',
    intro:
      'Use the HMO/shared-house route for room, common-area, house-rule, and responsibility wording that a standard agreement may miss.',
    ctaLabel: 'Create the HMO/Shared House Agreement',
    bullets: [
      'Designed for shared occupation.',
      'Clarifies rooms, common parts, and responsibilities.',
      'Gives landlords more structure than a generic agreement.',
    ],
    iconKey: 'ast',
    usedDefault: false,
  },
  'england-lodger-agreement-after-renters-rights-act': {
    primaryProductHref: BLOG_PRODUCT_ROUTES.lodgerAgreement,
    secondaryProductHref: BLOG_PRODUCT_ROUTES.standardTenancy,
    eyebrow: 'Resident landlord',
    heading: 'Taking in a lodger?',
    intro:
      'Use the lodger route where you live in the property and need the arrangement recorded clearly from the start.',
    ctaLabel: 'Create the Lodger Agreement',
    bullets: [
      'Different from a normal tenancy agreement.',
      'Built for resident landlord arrangements.',
      'Records room use, shared spaces, payments, and house rules.',
    ],
    iconKey: 'ast',
    usedDefault: false,
  },
};

const matchesAny = (value: string, matchers: RegExp[]) =>
  matchers.some((matcher) => matcher.test(value));

export function getBlogProductCta(
  post: Pick<BlogPost, 'slug' | 'category' | 'tags' | 'title' | 'targetKeyword'>
): ProductCtaConfig {
  const override = PRODUCT_REFORM_CTA_OVERRIDES[post.slug];
  if (override) {
    return override;
  }

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
      heading: 'Need the agreement sorted now?',
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
