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
    Generate compliant AST, Occupation Contract, PRT, and NI tenancy agreements in minutes —
    <span className="font-semibold"> preview before paying and regenerate anytime</span>
  </>
);

export const homeHeroConfig: HeroConfig = {
  trustText: 'Trusted by UK Landlords',
  title: 'Legal Documents',
  highlightTitle: 'in Minutes, Not Days',
  subtitle: (
    <>
      Generate compliant eviction notices, court forms, and tenancy agreements —
      <span className="font-semibold"> save 80%+ vs solicitor</span>
    </>
  ),
  primaryCta: { label: 'Generate Your Documents →', href: '/generate' },
  secondaryCta: { label: 'View Pricing →', href: '/pricing' },
  feature: 'Download instant UK notices & forms',
  mascotSrc: '/images/mascots/landlord-heaven-owl-checklist-golden-coins.png',
  mascotAlt: 'Landlord Heaven owl mascot holding a pen and shield',
};

export const astHeroConfig: HeroConfig = {
  trustText: 'Trusted tenancy agreements for UK landlords',
  title: 'Tenancy Agreements',
  highlightTitle: 'for Every UK Jurisdiction',
  subtitle: astSubtitle,
  primaryCta: {
    label: `Standard - ${astStandardPrice} →`,
    href: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
  },
  secondaryCta: {
    label: `Premium (HMO-Ready) - ${astPremiumPrice} →`,
    href: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
  },
  feature: 'AST (England), Occupation Contract (Wales), PRT (Scotland), and NI templates',
  mascotSrc: '/images/mascots/landlord-heaven-owl-tenancy-tools.png',
  mascotAlt: 'Landlord Heaven owl mascot with tenancy agreement documents',
};

export const section21HeroConfig: HeroConfig = {
  trustText: 'Trusted by UK Landlords',
  title: 'Section 21 Notice',
  highlightTitle: 'Generated in Minutes',
  subtitle: (
    <>
      Create compliant Section 21 paperwork with guided steps and instant downloads —
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
  trustText: 'Eviction Notice Only',
  title: 'Eviction Notice',
  highlightTitle: 'served correctly, fast',
  subtitle: 'Legally Valid Eviction Notices for England, Wales & Scotland — £49.99 one-time',
  primaryCta: {
    label: 'Get Your Notice Now →',
    href: '/wizard?product=notice_only&src=product_page&topic=eviction',
  },
  secondaryCta: {
    label: 'Preview before you buy',
    href: '/wizard?product=notice_only&src=product_page&topic=eviction',
  },
  feature: 'England: Section 21 / Section 8 · Wales: Section 173 · Scotland: Notice to Leave',
  mascotSrc: '/images/mascots/landlord-heaven-owl-eviction-notice.png',
  mascotAlt: 'Landlord Heaven owl mascot holding an eviction notice',
};

export const completePackHeroConfig: UniversalHeroProps = {
  trustText: 'Complete eviction support for England landlords',
  title: 'Complete Eviction Pack',
  highlightTitle: 'ready for court in days',
  subtitle: 'Complete eviction pack for England — £199.99 one-time',
  primaryCta: {
    label: 'Start Your Eviction Pack →',
    href: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  secondaryCta: {
    label: 'Preview before you buy',
    href: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  feature: 'Notice, court forms, witness statement, and filing guidance in one pack',
  mascotSrc: '/images/mascots/landlord-heaven-owl-eviction-notice-keys.png',
  mascotAlt: 'Landlord Heaven owl mascot with eviction notice and keys',
};

export const moneyClaimHeroConfig: UniversalHeroProps = {
  trustText: 'Recover rent arrears with court-ready claims',
  title: 'Money Claim Pack',
  highlightTitle: 'recover rent arrears fast',
  subtitle: 'Fast money claim support for landlords — £99.99 one-time',
  primaryCta: {
    label: 'Start Money Claim →',
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
