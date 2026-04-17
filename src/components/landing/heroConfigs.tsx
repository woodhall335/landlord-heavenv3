import type { ReactNode } from 'react';
import type { HeaderMode } from '@/components/layout/HeaderModeContext';
import type { PositioningPreset } from '@/lib/marketing/positioning';
import { PRODUCTS } from '@/lib/pricing/products';
import { PUBLIC_PRODUCT_DESCRIPTORS } from '@/lib/public-products';
import type { UniversalHeroProps } from './UniversalHero';

export type HeroConfig = Pick<
  UniversalHeroProps,
  | 'preset'
  | 'badge'
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
    Create the right tenancy agreement for your England let tonight. Choose the
    correct Standard, Premium, Student, HMO / Shared House, or Lodger route
    without digging through outdated templates.
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
  preset: 'home',
  trustText: 'Renters Right Act Compliant Landlord Documents May 2026',
  title: 'Tenant Not Paying or',
  highlightTitle: 'Refusing to Leave?',
  subtitle: (
    <>
      Work out tonight whether you need a <strong>Section 8 notice</strong>, a{' '}
      <strong>court possession pack</strong>, a <strong>money claim</strong>,
      a <strong>rent increase pack</strong>, or the right tenancy agreement for
      your property in England.
    </>
  ),
  primaryCta: {
    label: 'Start with the right route',
    href: '/wizard?topic=eviction&src=seo_homepage',
  },
  secondaryCta: {
    label: 'See pricing',
    href: '/pricing',
  },
  feature: 'Landlord-first guidance, stronger checks, and documents ready to print.',
};

/* ============================================================
   TENANCY AGREEMENTS
   ============================================================ */

export const astHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('ast'),
  preset: 'product_owner',
  badge: PUBLIC_PRODUCT_DESCRIPTORS.ast.heroBadge,
  mediaSrc: '/images/tenancy_agreements.webp',
  trustText: 'England tenancy agreements for landlords | Standard, Premium, Student, HMO, and Lodger',
  title: 'Create the Right',
  highlightTitle: 'Tenancy Agreement for Your England Let',
  subtitle: astSubtitle,
  primaryCta: {
    label: 'Choose your England agreement ->',
    href: PUBLIC_PRODUCT_DESCRIPTORS.ast.wizardHref,
  },
  secondaryCta: {
    label: `Compare Premium agreement - ${astPremiumPrice}`,
    href: PUBLIC_PRODUCT_DESCRIPTORS.england_premium_tenancy_agreement.wizardHref,
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
  preset: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.heroPreset,
  badge: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.heroBadge,
  mediaSrc: '/images/notice_bundles.webp',
  trustText: 'England Section 8 notice generator | Landlord checks before you serve',
  title: 'Eviction Notice Generator',
  highlightTitle: '(Section 8, May 2026)',
  subtitle:
    'Generate the current England Section 8 notice with clearer checks on grounds, dates, service, and compliance before you serve anything.',
  primaryCta: {
    label: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.primaryCtaLabel,
    href: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.wizardHref,
  },
  secondaryCta: {
    label: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.secondaryCtaLabel!,
    href: '/section-8-notice',
  },
  feature: 'We help landlords line up the Section 8 route, dates, and service steps before they serve.',
};

/* ============================================================
   COMPLETE PACK (England Court Route)
   ============================================================ */

export const completePackHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('complete_pack'),
  preset: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.heroPreset,
  badge: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.heroBadge,
  mediaSrc: '/images/eviction_packs.webp',
  trustText: 'Evict a tenant through court | England possession pack',
  title: 'Complete Eviction Pack',
  highlightTitle: 'for England Landlords',
  subtitle:
    'If you need to evict a tenant for rent arrears or because they still will not leave after notice, this England pack brings together the notice, court forms, and filing guidance in one workflow.',
  primaryCta: {
    label: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.primaryCtaLabel,
    href: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.wizardHref,
  },
  secondaryCta: {
    label: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.secondaryCtaLabel!,
    href: '/eviction-process-england',
  },
  feature: 'Generate Form 3A, N5, N119, and the supporting steps in one court-ready flow.',
};

/* ============================================================
   MONEY CLAIM
   ============================================================ */

export const moneyClaimHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('money_claim'),
  preset: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.heroPreset,
  badge: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.heroBadge,
  mediaSrc: '/images/money_claims.webp',
  trustText: 'Recover unpaid rent and tenant debt | England county court pack',
  title: 'Recover Unpaid Rent',
  highlightTitle: 'and Start Your Money Claim Pack',
  subtitle:
    'If your tenant owes rent, damage, bills, or other tenancy debt, this England pack helps you prepare the Letter Before Claim, Form N1, debt schedule, and supporting paperwork tonight.',
  primaryCta: {
    label: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.primaryCtaLabel,
    href: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.wizardHref,
  },
  feature: 'Set out what is owed clearly before the debt file becomes harder to prove and recover.',
};

export const moneyClaimSupportHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('money_claim'),
  preset: 'content_index',
  badge: 'For landlords in England',
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
  preset: 'content_index',
  badge: 'Landlord guides for England',
  trustText: 'Plain-English landlord guides',
  title: 'How to Evict a Tenant,',
  highlightTitle: 'Deal With Arrears, and Act Faster',
  subtitle:
    'Read what matters in plain English, then move to the right next step when you are ready.',
  primaryCta: { label: 'Browse landlord guides ->', href: '/blog' },
  secondaryCta: { label: 'See the latest guides ->', href: '/blog?view=latest' },
  feature: 'Start with the problem, not the legal definition.',
};
