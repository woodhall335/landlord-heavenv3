import type { ReactNode } from 'react';
import { PRODUCTS } from '@/lib/pricing/products';
import type { HeaderMode } from '@/components/layout/HeaderModeContext';
import type { UniversalHeroProps } from './UniversalHero';

export type HeroConfig = Pick<
  UniversalHeroProps,
  | 'trustText'
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
    Generate a jurisdiction-specific tenancy agreement: Residential Tenancy Agreement (England),
    Occupation Contract (Wales), PRT (Scotland), and NI private tenancy -
    tailored to your jurisdiction and compliance requirements.
  </>
);

const defaultHeroMedia = {
  mediaSrc: '/images/laptop.webp',
  mediaAlt: 'Laptop preview of generated landlord legal documents',
  headerMode: 'autoOnScroll' as HeaderMode,
};

/* ============================================================
   HOME HERO
   ============================================================ */

export const homeHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  trustText:
    'Built for landlords - Updated for current housing law',
  title: 'Tenant Not Paying or',
  highlightTitle: 'Refusing to Leave?',
  subtitle: (
    <>
      Use plain-English guidance to decide between a <strong>Section 21 notice</strong>,
      <strong> Section 8 notice</strong>, or a <strong>money claim</strong> to recover rent arrears.
      Start in minutes and generate the right documents for your next step.
    </>
  ),
  primaryCta: {
    label: 'See which notice you need?',
    href: '/wizard?product',
  },
  secondaryCta: {
    label: 'Recover unpaid rent?',
    href: '/wizard?product=money_claim&topic=debt&src=seo_homepage',
  },
  feature:
    'Legally validated landlord documents with compliance checks, filing guidance, and jurisdiction-specific outputs.',
};

/* ============================================================
   TENANCY AGREEMENTS
   ============================================================ */

export const astHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  mediaSrc: '/images/tenancy_agreements.webp',
  trustText: "Renters' Rights compliant for England - Updated for current housing law - UK-wide coverage",
  title: 'Legally Compliant',
  highlightTitle: 'Tenancy Agreements',
  subtitle: astSubtitle,
  primaryCta: {
    label: 'Generate my tenancy agreement',
    href: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
  },
  secondaryCta: {
    label: `Premium (HMO-Ready) - ${astPremiumPrice}`,
    href: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
  },
  feature:
    'Residential Tenancy Agreement (England), Occupation Contract (Wales), PRT (Scotland), and NI jurisdiction-specific agreements.',
};

/* ============================================================
   NOTICE ONLY (Eviction Notices)
   ============================================================ */

export const noticeOnlyHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  mediaSrc: '/images/notice_bundles.webp',
  trustText:
    'Court-ready - Updated for current housing law - England, Wales & Scotland',
  title: 'Serve the Right',
  highlightTitle: 'Eviction Notice',
  subtitle:
    'Need to evict a tenant in England, Wales, or Scotland? Get the correct possession notice with guided checks for Section 21 notice and Section 8 notice routes so you can act quickly and avoid preventable mistakes.',
  primaryCta: {
    label: 'Start your eviction notice',
    href: '/wizard?product=notice_only&src=product_page&topic=eviction',
  },
  feature:
    'Built against statutory frameworks with reform-aware validation and filing guidance.',
};

/* ============================================================
   COMPLETE PACK (England Court Route)
   ============================================================ */

export const completePackHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  mediaSrc: '/images/eviction_packs.webp',
  trustText: 'Court-ready - Updated for current housing law - England-only',
  title: 'Need to Evict a Tenant',
  highlightTitle: 'Complete Eviction Pack',
  subtitle:
    'From possession notice to court filing, this complete eviction pack gives landlords the full Section 21 / Section 8 route with supporting documents, court forms, and step-by-step guidance.',
  primaryCta: {
    label: 'Start your eviction pack',
    href: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  feature:
    'Section 21/8 notice workflows, N5B claim path, evidence checklist, and filing instructions in one structured case file.',
};

/* ============================================================
   MONEY CLAIM
   ============================================================ */

export const moneyClaimHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  mediaSrc: '/images/money_claims.webp',
  trustText: 'Court-ready - Updated for current housing law - England-only',
  title: 'Tenant Not Paying Rent?',
  highlightTitle: 'Start a Money Claim',
  subtitle:
    'Recover rent arrears, unpaid bills, and property damage through a guided England money claim flow. Build your claim in plain English and download court-ready documents.',
  primaryCta: {
    label: 'Start your money claim',
    href: '/wizard?product=money_claim&topic=debt&src=product_page',
  },
  feature:
    'N1 claim form, PAP-DEBT letter, interest calculation, and structured particulars of claim included.',
};

/* ============================================================
   BLOG
   ============================================================ */

export const blogHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  trustText: 'Landlord Guides & Insights',
  title: 'Landlord Guides',
  highlightTitle: 'Built for Confident Decisions',
  subtitle:
    'Practical guidance on evictions, tenancy law, and landlord compliance across the UK.',
  primaryCta: { label: 'Browse Guides', href: '/blog' },
  secondaryCta: { label: 'View Latest Posts', href: '/blog?view=latest' },
  feature: 'Step-by-step legal guidance updated for current UK regulations.',
};

