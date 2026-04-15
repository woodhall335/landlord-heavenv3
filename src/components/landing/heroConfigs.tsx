import type { ReactNode } from 'react';
import type { HeaderMode } from '@/components/layout/HeaderModeContext';
import type { PositioningPreset } from '@/lib/marketing/positioning';
import { PRODUCTS } from '@/lib/pricing/products';
import type { UniversalHeroProps } from './UniversalHero';

export type HeroConfig = Pick<
  UniversalHeroProps,
  | 'trustText'
  | 'trustPositioningPreset'
  | 'title'
  | 'highlightTitle'
  | 'subtitle'
  | 'primaryCta'
  | 'secondaryCta'
  | 'feature'
  | 'mascotSrc'
  | 'mascotAlt'
  | 'mediaSrc'
  | 'mediaAlt'
> & {
  headerMode?: HeaderMode;
};

const astPremiumPrice = PRODUCTS.ast_premium.displayPrice;

const astSubtitle: ReactNode = (
  <>
    Create the right tenancy agreement for your property tonight. Use a tenancy
    agreement for England, an occupation contract for Wales, a PRT for Scotland,
    or a private tenancy agreement for Northern Ireland without digging through
    old templates.
  </>
);

const defaultHeroMedia = {
  mediaSrc: '/images/laptop.webp',
  mediaAlt: 'Laptop preview of generated landlord legal documents',
  headerMode: 'autoOnScroll' as HeaderMode,
};

function withPreset(
  trustPositioningPreset: PositioningPreset
): Pick<HeroConfig, 'trustPositioningPreset'> {
  return { trustPositioningPreset };
}

/* ============================================================
   HOME HERO
   ============================================================ */

export const homeHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('home'),
  trustText: 'Built for landlords under pressure | Renters Right Act Compliant 2026',
  title: 'Tenant Not Paying or',
  highlightTitle: 'Refusing to Leave?',
  subtitle: (
    <>
      Work out tonight whether you need a <strong>section 8 notice</strong>, a{' '}
      <strong>money claim</strong> for unpaid rent, or a new tenancy agreement,
      then generate the right documents without guessing.
    </>
  ),
  primaryCta: {
    label: 'Find out which notice you need ->',
    href: '/wizard?product=notice_only&topic=eviction&src=seo_homepage',
  },
  secondaryCta: {
    label: 'Start recovering your rent ->',
    href: '/wizard?product=money_claim&topic=debt&src=seo_homepage',
  },
  feature: 'Answer plain-English questions. We handle the legal logic.',
};

/* ============================================================
   TENANCY AGREEMENTS
   ============================================================ */

export const astHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('ast'),
  mediaSrc: '/images/tenancy_agreements.webp',
  trustText: 'England tenancy agreements for landlords | Standard, Premium, Student, HMO, and Lodger',
  title: 'Create the Right',
  highlightTitle: 'Tenancy Agreement for Your England Let',
  subtitle: astSubtitle,
  primaryCta: {
    label: 'Choose your England agreement ->',
    href: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
  },
  secondaryCta: {
    label: `Compare Premium agreement - ${astPremiumPrice}`,
    href: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
  },
  feature:
    'Pick the route that matches the property, occupiers, and management setup before problems start.',
};

/* ============================================================
   NOTICE ONLY (Eviction Notices)
   ============================================================ */

export const noticeOnlyHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('notice_only'),
  mediaSrc: '/images/notice_bundles.webp',
  trustText: 'Evict a tenant legally | Landlord notice pack with route checks before you serve',
  title: 'Eviction Notice Pack',
  highlightTitle: 'for Landlords',
  subtitle:
    'If your tenant is still in the property and you need to act, we help you choose, generate, and serve the right eviction notice for England, Wales, or Scotland so you do not lose time on the wrong route.',
  primaryCta: {
    label: 'Start your eviction notice pack ->',
    href: '/wizard?product=notice_only&src=product_page&topic=eviction',
  },
  feature: 'We help landlords evict tenants legally by lining up the notice route, dates, and service steps first.',
};

/* ============================================================
   COMPLETE PACK (England Court Route)
   ============================================================ */

export const completePackHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('complete_pack'),
  mediaSrc: '/images/eviction_packs.webp',
  trustText: 'Evict a tenant through court | England possession pack',
  title: 'Complete Eviction Pack',
  highlightTitle: 'for England Landlords',
  subtitle:
    'If you need to evict a tenant for rent arrears or because they still will not leave after notice, this England pack brings together the notice, court forms, and filing guidance in one workflow.',
  primaryCta: {
    label: 'Start your England court pack ->',
    href: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  feature: 'Generate Form 3A, N5, N119, and the supporting steps in one court-ready flow.',
};

/* ============================================================
   MONEY CLAIM
   ============================================================ */

export const moneyClaimHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('money_claim'),
  mediaSrc: '/images/money_claims.webp',
  trustText: 'Recover unpaid rent and tenant debt | England county court pack',
  title: 'Recover Unpaid Rent',
  highlightTitle: 'and Start Your Money Claim Pack',
  subtitle:
    'If your tenant owes rent, damage, bills, or other tenancy debt, this England pack helps you prepare the Letter Before Claim, Form N1, debt schedule, and supporting paperwork tonight.',
  primaryCta: {
    label: 'Start your money claim pack ->',
    href: '/wizard?product=money_claim&topic=debt&src=product_page',
  },
  feature: 'Set out what is owed clearly before the debt file becomes harder to prove and recover.',
};

export const moneyClaimSupportHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('money_claim'),
  mediaSrc: '/images/money_claims.webp',
  trustText: 'England landlord debt-recovery support | Product owner plus scenario guides',
  title: 'Need help with a',
  highlightTitle: 'landlord money claim?',
  subtitle:
    'Start with the landlord money claim pack, then use the support guides when you need help with a specific filing, evidence, or enforcement question.',
  primaryCta: {
    label: 'Start money claim pack ->',
    href: '/products/money-claim',
  },
  secondaryCta: {
    label: 'View money claim guide ->',
    href: '/money-claim',
  },
  feature: 'Use the support guides to solve a specific filing or evidence question without losing the main claim route.',
};

/* ============================================================
   BLOG
   ============================================================ */

export const blogHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('blog'),
  trustText: 'Plain-English landlord guides',
  title: 'How to Evict a Tenant,',
  highlightTitle: 'Deal With Arrears, and Act Faster',
  subtitle:
    'Read what matters in plain English, then move to the right next step when you are ready.',
  primaryCta: { label: 'Browse landlord guides ->', href: '/blog' },
  secondaryCta: { label: 'See the latest guides ->', href: '/blog?view=latest' },
  feature: 'Start with the problem, not the legal definition.',
};
