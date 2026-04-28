import type { ReactNode } from 'react';
import type { FAQItem } from '@/components/seo/FAQSection';
import type { UniversalHeroProps } from '@/components/landing/UniversalHero';

export interface ProductSalesBreakdownItem {
  name: string;
  plainEnglish: string;
  function: string;
  riskIfMissing: string;
  landlordOutcome: string;
  includedByDefault: boolean;
  conditionalLabel?: string;
}

export interface ProductSalesRouteCard {
  name: string;
  whatItIs: string;
  problemItSolves: string;
  riskIfWrong: string;
  landlordOutcome: string;
  href: string;
  ctaLabel: string;
  priceLabel?: string;
}

export interface ProductSalesCard {
  title: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
}

export interface ProductSalesEarlyProofBand {
  priceLabel?: string;
  valueSummary?: ReactNode;
  includedBullets?: string[];
  bestFor?: string;
  notFor?: string;
  preview?: ReactNode;
}

export interface ProductSalesStep {
  step: string;
  title: string;
  body: string;
}

export interface ProductSalesCtaLink {
  label: string;
  href: string;
}

export interface ProductSalesCta {
  title: string;
  body: ReactNode;
  primary: ProductSalesCtaLink;
  secondary?: ProductSalesCtaLink;
  guideLinks?: ProductSalesCtaLink[];
}

export type ProductSalesHero = Omit<UniversalHeroProps, 'children'> & {
  children?: ReactNode;
};

export interface ProductSalesPageContent {
  analytics?: {
    pagePath: string;
    pageType: 'entry_page' | 'product_page';
    routeIntent?: string;
  };
  hero: ProductSalesHero;
  postHeroContent?: ReactNode;
  earlyProofBand?: ProductSalesEarlyProofBand;
  whatYouGet: {
    hideSection?: boolean;
    title: string;
    intro: ReactNode;
    items?: ProductSalesBreakdownItem[];
    routeCards?: ProductSalesRouteCard[];
    conditionalTitle?: string;
    conditionalIntro?: ReactNode;
    conditionalItems?: ProductSalesBreakdownItem[];
    preview?: ReactNode;
    sampleProof?: ReactNode;
  };
  whyYouNeedThis: {
    title: string;
    intro: ReactNode;
    cards: ProductSalesCard[];
  };
  howThisHelps: {
    title: string;
    intro: ReactNode;
    cards: ProductSalesCard[];
  };
  howItWorks: {
    title: string;
    intro: ReactNode;
    steps: ProductSalesStep[];
  };
  cta: ProductSalesCta;
  faq: {
    title: string;
    items: FAQItem[];
    includeSchema?: boolean;
  };
}
