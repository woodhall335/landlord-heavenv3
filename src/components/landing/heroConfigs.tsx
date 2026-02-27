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
    Generate a jurisdiction-specific tenancy agreement: AST (England),
    Occupation Contract (Wales), PRT (Scotland), and NI private tenancy —
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
    'Court-ready • Updated for current housing law • UK jurisdiction coverage',
  title: 'Solicitor-Grade',
  highlightTitle: 'Landlord Documents',
  subtitle: (
    <>
      Generate legally validated eviction notices, tenancy agreements, and rent
      recovery claims —
      <span className="font-semibold">
        {' '}
        compliance-checked and ready to file
      </span>
      .
    </>
  ),
  primaryCta: {
    label: 'Start eviction workflow →',
    href: '/wizard?product',
  },
  secondaryCta: {
    label: 'Recover unpaid rent →',
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
  trustText: 'Court-ready • Updated for current housing law • UK-wide coverage',
  title: 'Jurisdiction-Specific',
  highlightTitle: 'Tenancy Agreement',
  subtitle: astSubtitle,
  primaryCta: {
    label: 'Generate my tenancy agreement →',
    href: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
  },
  secondaryCta: {
    label: `Premium (HMO-Ready) - ${astPremiumPrice} →`,
    href: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
  },
  feature:
    'AST (England), Occupation Contract (Wales), PRT (Scotland), and NI jurisdiction-specific agreements.',
};

/* ============================================================
   NOTICE ONLY (Eviction Notices)
   ============================================================ */

export const noticeOnlyHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  trustText:
    'Court-ready • Updated for current housing law • England, Wales & Scotland',
  title: 'Eviction Notice',
  highlightTitle: 'Documents',
  subtitle:
    'Jurisdiction-specific notices for England, Wales & Scotland — compliance-checked and reform-aware. Preview every document before purchase.',
  primaryCta: {
    label: 'Generate my eviction notice →',
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
  trustText: 'Court-ready • Updated for current housing law • England-only',
  title: 'Complete',
  highlightTitle: 'Court Bundle',
  subtitle:
    'Section 21/8 notice routes plus N5 / N5B / N119, witness statement drafting, evidence checklist, and filing guide. Preview before purchase.',
  primaryCta: {
    label: 'Start my England court bundle →',
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
  trustText: 'Court-ready • Updated for current housing law • England-only',
  title: 'Money Claim',
  highlightTitle: 'Documents',
  subtitle:
    'For recovering unpaid rent or tenancy-related debt through the County Court (England). You answer guided questions. We structure your claim clearly for filing.',
  primaryCta: {
    label: 'Start my England money claim →',
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
  primaryCta: { label: 'Browse Guides →', href: '/blog' },
  secondaryCta: { label: 'View Latest Posts →', href: '/blog?view=latest' },
  feature: 'Step-by-step legal guidance updated for current UK regulations.',
};
