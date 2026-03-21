/**
 * SeoCtaBlock - Reusable CTA Component for SEO Landing Pages
 *
 * Provides consistent CTA patterns across SEO pages with
 * product-first routing and taxonomy-aware primary destinations.
 */

'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Clock, FileText, Gavel, PoundSterling } from 'lucide-react';
import {
  PRODUCTS,
  TENANCY_AGREEMENT_FROM_PRICE,
} from '@/lib/pricing/products';
import {
  SEO_PRODUCT_ROUTES,
  getPrimaryDestinationAboveFold,
  getSeoPageTaxonomy,
  type SeoProductRoute,
} from '@/lib/seo/page-taxonomy';
import { trackLandingCtaClick } from '@/components/analytics/LandingPageTracker';
import { TrustPositioningBar } from '@/components/marketing/TrustPositioningBar';

export type SeoPageType = 'problem' | 'court' | 'money' | 'general' | 'tenancy' | 'guide' | 'notice';
export type SeoCtaVariant = 'hero' | 'section' | 'faq' | 'inline' | 'final';
export type SeoCtaJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland' | 'uk';

type SeoProductKey = 'notice_only' | 'complete_pack' | 'money_claim' | 'ast';

interface SeoCtaBlockProps {
  /** Type of SEO page - determines CTA emphasis */
  pageType: SeoPageType;
  /** Visual variant of the CTA */
  variant: SeoCtaVariant;
  /** Page path for analytics tracking (e.g., /how-to-evict-tenant) */
  pagePath?: string;
  /** Override primary CTA text */
  primaryText?: string;
  /** Override secondary CTA text */
  secondaryText?: string;
  /** Custom title for section/final variants */
  title?: string;
  /** Custom description for section/final variants */
  description?: string;
  /** Jurisdiction for analytics/context */
  jurisdiction?: SeoCtaJurisdiction;
  /** Additional CSS classes */
  className?: string;
  /** Optional trust positioning bar under CTA heading */
  showTrustPositioningBar?: boolean;
}

const PRODUCT_ROUTE_BY_KEY: Record<SeoProductKey, SeoProductRoute> = {
  notice_only: SEO_PRODUCT_ROUTES.noticeOnly,
  complete_pack: SEO_PRODUCT_ROUTES.completePack,
  money_claim: SEO_PRODUCT_ROUTES.moneyClaim,
  ast: SEO_PRODUCT_ROUTES.ast,
};

const ROUTE_TO_PRODUCT_KEY: Record<SeoProductRoute, SeoProductKey> = {
  [SEO_PRODUCT_ROUTES.noticeOnly]: 'notice_only',
  [SEO_PRODUCT_ROUTES.completePack]: 'complete_pack',
  [SEO_PRODUCT_ROUTES.moneyClaim]: 'money_claim',
  [SEO_PRODUCT_ROUTES.ast]: 'ast',
};

const PRODUCT_LABEL_BY_KEY: Record<SeoProductKey, string> = {
  notice_only: 'Get Court-Ready Notice',
  complete_pack: 'Get Complete Eviction Pack',
  money_claim: 'Start Money Claim',
  ast: 'Create Your Agreement',
};

const PRODUCT_SHORT_LABEL_BY_KEY: Record<SeoProductKey, string> = {
  notice_only: PRODUCTS.notice_only.shortLabel,
  complete_pack: PRODUCTS.complete_pack.shortLabel,
  money_claim: PRODUCTS.money_claim.shortLabel,
  ast: 'Tenancy Agreement Pack',
};

const PRODUCT_PRICE_BY_KEY: Record<SeoProductKey, string> = {
  notice_only: PRODUCTS.notice_only.displayPrice,
  complete_pack: PRODUCTS.complete_pack.displayPrice,
  money_claim: PRODUCTS.money_claim.displayPrice,
  ast: TENANCY_AGREEMENT_FROM_PRICE,
};

type CtaConfigEntry = {
  primary: { label: string; product: SeoProductKey };
  secondary: { label: string; href: string };
  sectionTitle: string;
  sectionDescription: string;
  faqTitle: string;
  faqDescription: string;
  icon: typeof Shield;
};

// Pre-configured CTA content by page type
const ctaConfig: Record<SeoPageType, CtaConfigEntry> = {
  problem: {
    primary: { label: 'Get Court-Ready Notice', product: 'notice_only' },
    secondary: { label: 'View Complete Pack', href: '/products/complete-pack' },
    sectionTitle: 'Ready to Take Action?',
    sectionDescription: 'Generate a court-ready eviction notice in minutes. Section 21 and Section 8 included.',
    faqTitle: 'Need to Start the Eviction Process?',
    faqDescription: 'Our Notice Only Pack includes both Section 21 and Section 8 notices, designed for court acceptance.',
    icon: FileText,
  },
  court: {
    primary: { label: 'Get Complete Eviction Pack', product: 'complete_pack' },
    secondary: { label: 'Just Need the Notice?', href: '/products/notice-only' },
    sectionTitle: 'Ready for Court Proceedings?',
    sectionDescription: 'Get all the court forms you need: N5, N5B, N119, witness statements, and more.',
    faqTitle: 'Preparing for the Possession Hearing?',
    faqDescription: 'Our Complete Pack includes everything for court: notices, forms, evidence checklists, and instructions.',
    icon: Gavel,
  },
  money: {
    primary: { label: 'Start Money Claim', product: 'money_claim' },
    secondary: { label: 'Also Need Eviction?', href: '/products/complete-pack' },
    sectionTitle: 'Ready to Recover Your Rent?',
    sectionDescription: 'Generate MCOL-ready court forms to claim unpaid rent through the county court.',
    faqTitle: 'Want to Recover Unpaid Rent?',
    faqDescription: 'Our Money Claim Pack helps you file a claim through MCOL to recover rent arrears.',
    icon: PoundSterling,
  },
  general: {
    primary: { label: 'Get Court-Ready Notice', product: 'notice_only' },
    secondary: { label: 'Learn More', href: '/eviction-notice-template' },
    sectionTitle: 'Ready to Take the Next Step?',
    sectionDescription: 'Generate court-ready eviction documents in minutes. Trusted by over 10,000 UK landlords.',
    faqTitle: 'Need Help With Your Eviction?',
    faqDescription: 'Our documents are designed for court acceptance and include serving instructions.',
    icon: Shield,
  },
  tenancy: {
    primary: { label: 'Create Your Agreement', product: 'ast' },
    secondary: { label: 'View AST Products', href: '/products/ast' },
    sectionTitle: 'Ready to Create Your Tenancy Agreement?',
    sectionDescription: 'Generate a legally compliant tenancy agreement in minutes. All UK jurisdictions supported.',
    faqTitle: 'Need a Professional Tenancy Agreement?',
    faqDescription: 'Our tenancy agreements include all required clauses and comply with current legislation.',
    icon: FileText,
  },
  guide: {
    primary: { label: 'Get Court-Ready Notice', product: 'notice_only' },
    secondary: { label: 'Explore More Guides', href: '/blog' },
    sectionTitle: 'Ready to Take the Next Step?',
    sectionDescription: 'Generate court-ready eviction documents in minutes. Trusted by over 10,000 UK landlords.',
    faqTitle: 'Need Help With Your Eviction?',
    faqDescription: 'Our documents are designed for court acceptance and include serving instructions.',
    icon: Shield,
  },
  notice: {
    primary: { label: 'Get Court-Ready Notice', product: 'notice_only' },
    secondary: { label: 'View Complete Pack', href: '/products/complete-pack' },
    sectionTitle: 'Ready to Serve Your Notice?',
    sectionDescription: 'Generate a court-ready eviction notice with guided steps to reduce common errors.',
    faqTitle: 'Need a Reliable Section 8 Notice?',
    faqDescription: 'Our Notice Only Pack helps you produce a compliant notice and prepare it for service.',
    icon: FileText,
  },
};

function getProductKeyFromRoute(route: SeoProductRoute): SeoProductKey {
  return ROUTE_TO_PRODUCT_KEY[route];
}

function formatProductCta(label: string, productKey: SeoProductKey): string {
  return `${label} - ${PRODUCT_PRICE_BY_KEY[productKey]}`;
}

function getMappedPrimaryProductKey(pageType: SeoPageType, pagePath?: string): SeoProductKey {
  const entry = pagePath ? getSeoPageTaxonomy(pagePath) : null;
  if (!entry) {
    return ctaConfig[pageType].primary.product;
  }

  return getProductKeyFromRoute(getPrimaryDestinationAboveFold(entry));
}

function getPrimaryHref(pageType: SeoPageType, pagePath?: string): string {
  const entry = pagePath ? getSeoPageTaxonomy(pagePath) : null;
  if (!entry) {
    return PRODUCT_ROUTE_BY_KEY[ctaConfig[pageType].primary.product];
  }

  return getPrimaryDestinationAboveFold(entry);
}

function getPrimaryLabel(pageType: SeoPageType, pagePath?: string): string {
  const defaultLabel = ctaConfig[pageType].primary.label;
  const defaultProduct = ctaConfig[pageType].primary.product;
  const mappedProduct = getMappedPrimaryProductKey(pageType, pagePath);

  if (!pagePath || mappedProduct === defaultProduct) {
    return defaultLabel;
  }

  return PRODUCT_LABEL_BY_KEY[mappedProduct];
}

function getHeroSecondaryCta(
  pageType: SeoPageType,
  pagePath?: string,
  secondaryText?: string
): { label: string; href: string } {
  const config = ctaConfig[pageType];
  const entry = pagePath ? getSeoPageTaxonomy(pagePath) : null;

  if (!entry) {
    return { label: secondaryText || config.secondary.label, href: config.secondary.href };
  }

  if (entry.pageRole === 'bridge' && entry.secondaryProduct) {
    const productKey = getProductKeyFromRoute(entry.secondaryProduct);
    return {
      label: secondaryText || formatProductCta(PRODUCT_SHORT_LABEL_BY_KEY[productKey], productKey),
      href: entry.secondaryProduct,
    };
  }

  return {
    label: secondaryText || 'Read the supporting guide',
    href: entry.supportingPage,
  };
}

function getSectionSecondaryHref(pageType: SeoPageType, pagePath?: string): string {
  const entry = pagePath ? getSeoPageTaxonomy(pagePath) : null;
  if (entry?.pageRole === 'bridge' && entry.secondaryProduct) {
    return entry.secondaryProduct;
  }

  return ctaConfig[pageType].secondary.href;
}

/**
 * Hero CTA - Used at the top of pages in StandardHero
 * Returns props to pass to hero components
 */
export function getHeroCtaProps(
  pageType: SeoPageType,
  pagePath?: string,
  _jurisdiction?: SeoCtaJurisdiction
): {
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
} {
  const primaryProduct = getMappedPrimaryProductKey(pageType, pagePath);

  return {
    primaryCTA: {
      label: formatProductCta(getPrimaryLabel(pageType, pagePath), primaryProduct),
      href: getPrimaryHref(pageType, pagePath),
    },
    secondaryCTA: getHeroSecondaryCta(pageType, pagePath),
  };
}

/**
 * SeoCtaBlock Component
 *
 * Renders different CTA variants based on placement in the page.
 */
export function SeoCtaBlock({
  pageType,
  variant,
  pagePath,
  primaryText,
  secondaryText,
  title,
  description,
  className = '',
  showTrustPositioningBar = false,
}: SeoCtaBlockProps) {
  const config = ctaConfig[pageType];
  const primaryProductKey = getMappedPrimaryProductKey(pageType, pagePath);
  const primaryHref = getPrimaryHref(pageType, pagePath);
  const Icon = config.icon;
  const entry = pagePath ? getSeoPageTaxonomy(pagePath) : null;

  // Helper to track CTA clicks
  const handleCtaClick = (ctaText?: string) => {
    if (pagePath) {
      trackLandingCtaClick(pagePath, pageType, variant, ctaText);
    }
  };

  // Inline variant - simple text link
  if (variant === 'inline') {
    const ctaText = formatProductCta(primaryText || getPrimaryLabel(pageType, pagePath), primaryProductKey);
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Link
          href={primaryHref}
          className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          onClick={() => handleCtaClick(ctaText)}
        >
          {ctaText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Section variant - mid-page CTA block
  if (variant === 'section') {
    const ctaText = formatProductCta(primaryText || getPrimaryLabel(pageType, pagePath), primaryProductKey);
    return (
      <div className={`bg-primary/5 rounded-xl p-6 lg:p-8 border border-primary/20 ${className}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {title || config.sectionTitle}
            </h3>
            <p className="text-gray-600">
              {description || config.sectionDescription}
            </p>
            {showTrustPositioningBar ? (
              <TrustPositioningBar variant="compact" className="mx-auto mt-6 max-w-5xl" />
            ) : null}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href={primaryHref}
              className="hero-btn-primary text-center whitespace-nowrap"
              onClick={() => handleCtaClick(ctaText)}
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // FAQ variant - CTA after FAQ section
  if (variant === 'faq') {
    const primaryCtaText = formatProductCta(primaryText || getPrimaryLabel(pageType, pagePath), primaryProductKey);
    const secondaryHref = getSectionSecondaryHref(pageType, pagePath);
    const secondaryCtaText =
      secondaryText ||
      (entry?.pageRole === 'bridge' && entry.secondaryProduct
        ? formatProductCta(
            PRODUCT_SHORT_LABEL_BY_KEY[getProductKeyFromRoute(entry.secondaryProduct)],
            getProductKeyFromRoute(entry.secondaryProduct)
          )
        : config.secondary.label);

    return (
      <div className={`bg-gray-50 rounded-xl p-6 lg:p-8 mt-8 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              {title || config.faqTitle}
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              {description || config.faqDescription}
            </p>
            {showTrustPositioningBar ? (
              <TrustPositioningBar variant="compact" className="mx-auto mt-6 max-w-5xl" />
            ) : null}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                onClick={() => handleCtaClick(primaryCtaText)}
              >
                {primaryCtaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {secondaryText !== '' && (
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  onClick={() => handleCtaClick(secondaryCtaText)}
                >
                  {secondaryCtaText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Final variant - large gradient CTA block
  if (variant === 'final') {
    const primaryCtaText = formatProductCta(primaryText || getPrimaryLabel(pageType, pagePath), primaryProductKey);
    const secondaryProductKey =
      pageType === 'money'
        ? 'complete_pack'
        : pageType === 'court'
          ? 'notice_only'
          : 'complete_pack';
    const secondaryHref = PRODUCT_ROUTE_BY_KEY[secondaryProductKey];
    const secondaryCtaText =
      secondaryText || formatProductCta(PRODUCT_SHORT_LABEL_BY_KEY[secondaryProductKey], secondaryProductKey);

    return (
      <div className={`bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center ${className}`}>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          {title || `Get Your ${pageType === 'money' ? 'Money Claim' : 'Eviction'} Documents Now`}
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {description || 'Court-ready format. AI compliance check. Trusted by over 10,000 UK landlords.'}
        </p>
        {showTrustPositioningBar ? (
          <TrustPositioningBar variant="compact" className="mx-auto mt-6 max-w-5xl" />
        ) : null}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={primaryHref}
            className="hero-btn-secondary inline-flex items-center justify-center gap-2"
            onClick={() => handleCtaClick(primaryCtaText)}
          >
            {primaryCtaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
          {pageType !== 'general' && (
            <Link
              href={secondaryHref}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              onClick={() => handleCtaClick(secondaryCtaText)}
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>
        <p className="mt-8 text-white/70 text-sm">
          {pageType === 'money' ? (
            <>MCOL-ready forms &bull; Evidence checklist &bull; Court instructions</>
          ) : pageType === 'court' ? (
            <>All court forms included &bull; Witness statements &bull; Step-by-step guide</>
          ) : (
            <>Section 21 and Section 8 included &bull; AI compliance check &bull; Designed for court acceptance</>
          )}
        </p>
      </div>
    );
  }

  // Default/hero variant - simple buttons
  const heroPrimaryText = formatProductCta(primaryText || getPrimaryLabel(pageType, pagePath), primaryProductKey);
  const heroSecondary = getHeroSecondaryCta(pageType, pagePath, secondaryText);

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <Link
        href={primaryHref}
        className="hero-btn-primary"
        onClick={() => handleCtaClick(heroPrimaryText)}
      >
        {heroPrimaryText}
      </Link>
      <Link
        href={heroSecondary.href}
        className="hero-btn-secondary"
        onClick={() => handleCtaClick(heroSecondary.label)}
      >
        {heroSecondary.label}
      </Link>
    </div>
  );
}

/**
 * Disclaimer component for SEO pages
 * Required on all informational pages
 */
export function SeoDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div className={`text-sm text-gray-500 border-t border-gray-200 pt-6 mt-8 ${className}`}>
      <p className="flex items-start gap-2">
        <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          <strong>For general information only.</strong> This page provides educational content about
          UK landlord law and is not legal advice. Laws vary by jurisdiction and change over time.
          For advice specific to your situation, consult a qualified solicitor.
        </span>
      </p>
    </div>
  );
}

export default SeoCtaBlock;
