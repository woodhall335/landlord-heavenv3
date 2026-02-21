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
    Generate a jurisdiction-specific tenancy agreement pack: AST (England), Occupation Contract (Wales), PRT (Scotland), and NI private tenancy, tailored for your jurisdiction.
  </>
);

const defaultHeroMedia = {
  mediaSrc: '/images/laptop.webp',
  mediaAlt: 'Laptop preview of generated landlord legal documents',
  headerMode: 'autoOnScroll' as HeaderMode,
};

export const homeHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  trustText: 'England, Wales & Scotland Coverage • Reform-aware legal automation',
  title: 'Complete UK Eviction Case Bundles',
  highlightTitle: 'in Minutes',
  subtitle: (
    <>
      Generate your full Section 21, Section 8, Wales Section 173, or Scotland Notice to Leave bundle —
      <span className="font-semibold"> AI-generated, compliance-checked, and ready to file</span>
    </>
  ),
  primaryCta: { label: 'Generate Your Complete Case Bundle →', href: '/wizard' },
  feature: 'Complete eviction case bundles. AI-generated. Jurisdiction-specific. Court-ready file output.',
};

export const astHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  trustText: 'AST (England) • Occupation Contract (Wales) • PRT (Scotland) • NI',
  title: 'Jurisdiction-Specific',
  highlightTitle: 'Tenancy Agreement Pack',
  subtitle: astSubtitle,
  primaryCta: {
    label: 'Generate my tenancy agreement pack →',
    href: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
  },
  secondaryCta: {
    label: `Premium (HMO-Ready) - ${astPremiumPrice} →`,
    href: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
  },
  feature: 'AST (England), Occupation Contract (Wales), PRT (Scotland), and NI jurisdiction-specific agreements',
};

export const noticeOnlyHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  trustText: 'S21 & S8 (England) • S173 • Notice to Leave',
  title: 'Eviction Notice Bundle',
  highlightTitle: 'Jurisdiction-Specific',
  subtitle: 'Generate a compliance-checked notice bundle with service instructions and a validity checklist. Preview every document before purchase.',
  primaryCta: {
    label: 'Generate my notice bundle →',
    href: '/wizard?product=notice_only&src=product_page&topic=eviction',
  },
  feature: 'Built against statutory frameworks with reform-aware validation and filing guidance',
};

export const completePackHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  trustText: 'England-only (HMCTS / County Court forms)',
  title: 'Complete Eviction Case Bundle',
  highlightTitle: 'HMCTS / County Court forms',
  subtitle: 'Section 21/8 notice routes plus N5 / N5B / N119, witness statement drafting, evidence checklist, and filing guide. Preview before purchase.',
  primaryCta: {
    label: 'Start my England case bundle →',
    href: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  feature: 'Section 21/8 notice workflows, N5B claim path, evidence checklist, and filing instructions in one case file',
};

export const blogHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  trustText: 'Landlord Guides & Insights',
  title: 'Landlord Guides',
  highlightTitle: 'built for confident decisions',
  subtitle: 'Practical advice on evictions, tenancy law, and property management for UK landlords.',
  primaryCta: { label: 'Browse Guides →', href: '/blog' },
  secondaryCta: { label: 'View Latest Posts →', href: '/blog?view=latest' },
  feature: 'Step-by-step legal guidance updated for UK regulations',
};

export const moneyClaimHeroConfig: HeroConfig = {
  ...defaultHeroMedia,
  trustText: 'England-only (County Court / MCOL-ready)',
  title: 'Money Claim Pack',
  highlightTitle: 'County Court bundle',
  subtitle: 'For recovering unpaid rent or tenancy-related debt through the County Court (England). You answer guided questions. We structure your claim clearly for filing.',
  primaryCta: {
    label: 'Start my England money claim bundle →',
    href: '/wizard?product=money_claim&src=product_page',
  },
  feature: 'N1 claim form, PAP-DEBT letter, and interest calculator included',
};
