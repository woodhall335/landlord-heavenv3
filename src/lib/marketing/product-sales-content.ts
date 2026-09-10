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
  imageSrc?: string;
  imageAlt?: string;
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
  imageSrc?: string;
  imageAlt?: string;
}

export interface ProductSalesCard {
  title: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
}

export interface ProductSalesDecisionCard {
  title: string;
  body: string;
  eyebrow?: string;
  tone?: 'positive' | 'warning' | 'neutral';
}

export interface ProductSalesDecisionBlock {
  title: string;
  intro: ReactNode;
  cards: ProductSalesDecisionCard[];
  primary?: ProductSalesCtaLink;
  secondary?: ProductSalesCtaLink;
}

export interface ProductSalesComparisonBlock {
  title?: string;
  intro?: ReactNode;
  routeCards: ProductSalesRouteCard[];
  routeGridClassName?: string;
}

export interface ProductSalesObjectionItem {
  question: string;
  answer: ReactNode;
}

export interface ProductSalesObjectionBlock {
  title: string;
  intro?: ReactNode;
  items: ProductSalesObjectionItem[];
}

export interface ProductSalesEarlyProofBand {
  priceLabel?: string;
  valueSummary?: ReactNode;
  includedBullets?: string[];
  bestFor?: string;
  notFor?: string;
  preview?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imageHref?: string;
  fullWidthPreview?: boolean;
  mobileImageFirstFullBleed?: boolean;
}

export type ProductSalesIconName =
  | 'location'
  | 'price'
  | 'builder'
  | 'court'
  | 'debt'
  | 'document'
  | 'folder'
  | 'hearing'
  | 'scale'
  | 'chart'
  | 'steps'
  | 'shield';

export interface ProductSalesConversionPanelFeature {
  title: string;
  body: string;
  icon: ProductSalesIconName;
}

export interface ProductSalesConversionPanel {
  eyebrow: string;
  productName: string;
  decisionTitle: string;
  decisionBody: string;
  artworkSrc: string;
  artworkAlt: string;
  features: ProductSalesConversionPanelFeature[];
  previewText: string;
  reassuranceTitle: string;
  reassuranceBody: string;
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

export interface ProductSalesCtaVisual {
  eyebrow: string;
  highlightedText: string;
  artworkSrc: string;
  artworkAlt: string;
  features: ProductSalesConversionPanelFeature[];
  reassuranceTitle: string;
  reassuranceBody: string;
}

export interface ProductSalesCta {
  title: string;
  body: ReactNode;
  primary: ProductSalesCtaLink;
  secondary?: ProductSalesCtaLink;
  guideLinks?: ProductSalesCtaLink[];
  visual?: ProductSalesCtaVisual;
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
  earlyDecisionContent?: ReactNode;
  postHeroContent?: ReactNode;
  afterPostHeroContent?: ReactNode;
  earlyProofBand?: ProductSalesEarlyProofBand;
  conversionPanel?: ProductSalesConversionPanel;
  decisionBlock?: ProductSalesDecisionBlock;
  whatYouGet: {
    hideSection?: boolean;
    title: string;
    intro: ReactNode;
    items?: ProductSalesBreakdownItem[];
    routeCards?: ProductSalesRouteCard[];
    routeGridClassName?: string;
    conditionalTitle?: string;
    conditionalIntro?: ReactNode;
    conditionalItems?: ProductSalesBreakdownItem[];
    preview?: ReactNode;
    sampleProof?: ReactNode;
  };
  comparisonBlock?: ProductSalesComparisonBlock;
  objectionBlock?: ProductSalesObjectionBlock;
  midPageCta?: ProductSalesCta;
  beforeWhyYouNeedThis?: ReactNode;
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
    imageSrc?: string;
    imageAlt?: string;
    imageHref?: string;
    mobileImageFirstFullBleed?: boolean;
    alignImageToSteps?: boolean;
  };
  cta: ProductSalesCta;
  faq: {
    title: string;
    items: FAQItem[];
    includeSchema?: boolean;
  };
}
