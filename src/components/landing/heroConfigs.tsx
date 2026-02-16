import type { ReactNode } from 'react';
import { PRODUCTS } from '@/lib/pricing/products';
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
>;

const astStandardPrice = PRODUCTS.ast_standard.displayPrice;
const astPremiumPrice = PRODUCTS.ast_premium.displayPrice;

const astSubtitle: ReactNode = (
  <>
    Generate a jurisdiction-specific tenancy agreement pack: AST (England), Occupation Contract (Wales), PRT (Scotland), and NI private tenancy —
    <span className="font-semibold"> includes a compliance checklist, preview before paying, and instant regeneration</span>
  </>
);

export const homeHeroConfig: HeroConfig = {
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
  secondaryCta: { label: 'View Pricing →', href: '/pricing' },
  feature: 'Complete eviction case bundles. AI-generated. Jurisdiction-specific. Court-ready file output.',
  mascotSrc: '/images/mascots/landlord-heaven-owl-checklist-golden-coins.png',
  mascotAlt: 'Landlord Heaven owl mascot holding a pen and shield',
};

export const astHeroConfig: HeroConfig = {
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
  mascotSrc: '/images/mascots/landlord-heaven-owl-tenancy-tools.png',
  mascotAlt: 'Landlord Heaven owl mascot with tenancy agreement documents',
};

export const section21HeroConfig: HeroConfig = {
  trustText: 'Trusted by UK Landlords',
  title: 'Section 21 Notice',
  highlightTitle: 'Generated in Minutes',
  subtitle: (
    <>
      Create compliant Section 21 paperwork with guided steps and ready-to-file bundle output —
      <span className="font-semibold"> no legal drafting required</span>
    </>
  ),
  primaryCta: { label: 'Start Section 21 Notice →', href: '/wizard?product=notice_only' },
  secondaryCta: { label: 'See Pricing →', href: '/pricing' },
  feature: 'Court-ready notice pack with service guidance',
  mascotSrc: '/images/mascots/landlord-heaven-owl-tenancy-tools.png',
  mascotAlt: 'Landlord Heaven owl mascot with Section 21 notice',
};

export const noticeOnlyHeroConfig: HeroConfig = {
  trustText: 'S21 & S8 (England) • S173 • Notice to Leave',
  title: 'Eviction Notice Bundle',
  highlightTitle: 'Jurisdiction-Specific',
  subtitle: 'Generate a compliance-checked notice bundle with service instructions and a validity checklist. Preview every document before purchase.',
  primaryCta: {
    label: 'Generate my notice bundle →',
    href: '/wizard?product=notice_only&src=product_page&topic=eviction',
  },
  secondaryCta: {
    label: 'Upgrade to Eviction Pack',
    href: '/products/complete-pack',
  },
  feature: 'Built against statutory frameworks with reform-aware validation and filing guidance',
  mascotSrc: '/images/mascots/landlord-heaven-owl-eviction-notice.png',
  mascotAlt: 'Landlord Heaven owl mascot holding an eviction notice',
};

export const completePackHeroConfig: UniversalHeroProps = {
  trustText: 'England-only (HMCTS / County Court forms)',
  title: 'Complete Eviction Case Bundle',
  highlightTitle: 'England-only',
  subtitle: 'Section 21/8 notice routes plus N5 / N5B / N119, witness statement drafting, evidence checklist, and filing guide. Preview before purchase.',
  primaryCta: {
    label: 'Start my England case bundle →',
    href: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  secondaryCta: {
    label: 'Preview before you buy',
    href: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  feature: 'Section 21/8 notice workflows, N5B claim path, evidence checklist, and filing instructions in one case file',
  mascotSrc: '/images/mascots/landlord-heaven-owl-eviction-notice-keys.png',
  mascotAlt: 'Landlord Heaven owl mascot with eviction notice and keys',
};

export const blogHeroConfig: UniversalHeroProps = {
  trustText: 'Landlord Guides & Insights',
  title: 'Landlord Guides',
  highlightTitle: 'built for confident decisions',
  subtitle: 'Practical advice on evictions, tenancy law, and property management for UK landlords.',
  primaryCta: { label: 'Browse Guides →', href: '/blog' },
  secondaryCta: { label: 'View Latest Posts →', href: '/blog?view=latest' },
  feature: 'Step-by-step legal guidance updated for UK regulations',
  mascotSrc: '/images/mascots/landlord-heaven-owl-landlord-guide.png',
  mascotAlt: 'Landlord Heaven owl mascot with landlord guide',
};

export const moneyClaimHeroConfig: UniversalHeroProps = {
  trustText: 'England-only (County Court / MCOL-ready)',
  title: 'Money Claim Pack',
  highlightTitle: 'England-only bundle',
  subtitle: 'For recovering unpaid rent or tenancy-related debt through the County Court (England). You answer guided questions. We structure your claim clearly for filing.',
  primaryCta: {
    label: 'Start my England money claim bundle →',
    href: '/wizard?product=money_claim&src=product_page',
  },
  secondaryCta: {
    label: 'Preview before you buy',
    href: '/wizard?product=money_claim&src=product_page',
  },
  feature: 'N1 claim form, PAP-DEBT letter, and interest calculator included',
  mascotSrc: '/images/mascots/landlord-heaven-owl-judge-court.png',
  mascotAlt: 'Landlord Heaven owl mascot in court attire',
};
