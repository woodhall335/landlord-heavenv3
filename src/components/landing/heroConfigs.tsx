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
  trustText: 'Built for landlords under pressure | Updated for current housing law',
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
  trustText: 'Updated for current housing law | England, Wales, Scotland and Northern Ireland',
  title: 'Need a New',
  highlightTitle: 'Tenancy Agreement?',
  subtitle: astSubtitle,
  primaryCta: {
    label: 'Create your tenancy agreement ->',
    href: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
  },
  secondaryCta: {
    label: `See the Premium agreement - ${astPremiumPrice}`,
    href: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
  },
  feature:
    'Use the right agreement now so you do not have to fix it when the tenancy goes wrong.',
};

/* ============================================================
   NOTICE ONLY (Eviction Notices)
   ============================================================ */

export const noticeOnlyHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('notice_only'),
  mediaSrc: '/images/notice_bundles.webp',
  trustText: 'Updated for current housing law | England, Wales and Scotland',
  title: 'Need an',
  highlightTitle: 'Eviction Notice UK?',
  subtitle:
    'Your tenant is still in the property and you need to act. We help you choose the right section 8 notice for England, or the right notice for Wales or Scotland, so you do not lose weeks on the wrong route.',
  primaryCta: {
    label: 'Generate your eviction notice ->',
    href: '/wizard?product=notice_only&src=product_page&topic=eviction',
  },
  feature: 'We flag problems before you serve anything, so you do not have to start again.',
};

/* ============================================================
   COMPLETE PACK (England Court Route)
   ============================================================ */

export const completePackHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('complete_pack'),
  mediaSrc: '/images/eviction_packs.webp',
  trustText: 'Updated for current housing law | England-only',
  title: 'Need to Evict a Tenant',
  highlightTitle: 'Complete Eviction Pack',
  subtitle:
    'Section 21 is gone in England from 1 May 2026. If you need the full section 8 eviction route, this pack helps you move from notice to court without piecing the whole case together yourself.',
  primaryCta: {
    label: 'Start your section 8 pack ->',
    href: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  feature: 'Keep your notice, court forms, and evidence lined up from the start.',
};

/* ============================================================
   MONEY CLAIM
   ============================================================ */

export const moneyClaimHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  ...withPreset('money_claim'),
  mediaSrc: '/images/money_claims.webp',
  trustText: 'Updated for current housing law | England-only',
  title: 'Tenant Not Paying Rent?',
  highlightTitle: 'Start a Money Claim',
  subtitle:
    'If the arrears keep rising, this helps you build a money claim for unpaid rent, bills, or damage in plain English and get the paperwork ready tonight.',
  primaryCta: {
    label: 'Start recovering your rent ->',
    href: '/wizard?product=money_claim&topic=debt&src=product_page',
  },
  feature: 'Set out what is owed clearly before the numbers get harder to untangle.',
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
