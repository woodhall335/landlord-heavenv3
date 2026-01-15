/**
 * SeoCtaBlock - Reusable CTA Component for SEO Landing Pages
 *
 * Provides consistent CTA patterns across all SEO pages with
 * contextual messaging based on page type.
 *
 * Page Types:
 * - problem: Tenant won't leave, not paying rent (Notice Only + Complete Pack)
 * - court: Possession claim, N5B, warrant (Complete Pack emphasis)
 * - money: Money claim related (Money Claim Pack emphasis)
 * - general: General eviction content (balanced CTAs)
 */

'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Clock, FileText, Gavel, PoundSterling } from 'lucide-react';
import { PRODUCTS } from '@/lib/pricing/products';
import { buildWizardLink, type WizardJurisdiction } from '@/lib/wizard/buildWizardLink';
import { trackLandingCtaClick } from '@/components/analytics/LandingPageTracker';

export type SeoPageType = 'problem' | 'court' | 'money' | 'general';

export type SeoCtaVariant = 'hero' | 'section' | 'faq' | 'inline' | 'final';

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
  /** Jurisdiction for wizard links */
  jurisdiction?: WizardJurisdiction;
  /** Additional CSS classes */
  className?: string;
}

// Pre-configured CTA content by page type
const ctaConfig: Record<SeoPageType, {
  primary: { label: string; product: 'notice_only' | 'complete_pack' | 'money_claim' };
  secondary: { label: string; href: string };
  sectionTitle: string;
  sectionDescription: string;
  faqTitle: string;
  faqDescription: string;
  icon: typeof Shield;
}> = {
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
};

/**
 * Get wizard link for a product with optional jurisdiction
 */
function getWizardLink(
  product: 'notice_only' | 'complete_pack' | 'money_claim',
  jurisdiction?: WizardJurisdiction
): string {
  return buildWizardLink({
    product,
    jurisdiction,
    src: 'guide',
    topic: product === 'money_claim' ? 'money_claim' : 'eviction',
  });
}

/**
 * Hero CTA - Used at the top of pages in StandardHero
 * Returns props to pass to StandardHero component
 */
export function getHeroCtaProps(
  pageType: SeoPageType,
  jurisdiction?: WizardJurisdiction
): {
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
} {
  const config = ctaConfig[pageType];
  const product = PRODUCTS[config.primary.product];

  return {
    primaryCTA: {
      label: `${config.primary.label} — ${product.displayPrice}`,
      href: getWizardLink(config.primary.product, jurisdiction),
    },
    secondaryCTA: {
      label: config.secondary.label,
      href: config.secondary.href,
    },
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
  jurisdiction,
  className = '',
}: SeoCtaBlockProps) {
  const config = ctaConfig[pageType];
  const product = PRODUCTS[config.primary.product];
  const wizardHref = getWizardLink(config.primary.product, jurisdiction);
  const Icon = config.icon;

  // Helper to track CTA clicks
  const handleCtaClick = (ctaText?: string) => {
    if (pagePath) {
      trackLandingCtaClick(pagePath, pageType, variant, ctaText);
    }
  };

  // Inline variant - simple text link
  if (variant === 'inline') {
    const ctaText = `${primaryText || config.primary.label} — ${product.displayPrice}`;
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Link
          href={wizardHref}
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
    const ctaText = `${primaryText || config.primary.label} — ${product.displayPrice}`;
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
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href={wizardHref}
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
    const primaryCtaText = `${primaryText || config.primary.label} — ${product.displayPrice}`;
    const secondaryCtaText = secondaryText || config.secondary.label;
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={wizardHref}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                onClick={() => handleCtaClick(primaryCtaText)}
              >
                {primaryCtaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {secondaryText !== '' && (
                <Link
                  href={config.secondary.href}
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
    const primaryCtaText = `${primaryText || config.primary.label} — ${product.displayPrice}`;
    const secondaryProduct = pageType === 'money'
      ? PRODUCTS.complete_pack
      : pageType === 'court'
        ? PRODUCTS.notice_only
        : PRODUCTS.complete_pack;
    const secondaryWizardHref = getWizardLink(
      pageType === 'money' ? 'complete_pack' : pageType === 'court' ? 'notice_only' : 'complete_pack',
      jurisdiction
    );
    const secondaryCtaText = `${secondaryText || secondaryProduct.shortLabel} — ${secondaryProduct.displayPrice}`;

    return (
      <div className={`bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center ${className}`}>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          {title || `Get Your ${pageType === 'money' ? 'Money Claim' : 'Eviction'} Documents Now`}
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {description || 'Court-ready format. AI compliance check. Trusted by over 10,000 UK landlords.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={wizardHref}
            className="hero-btn-secondary inline-flex items-center justify-center gap-2"
            onClick={() => handleCtaClick(primaryCtaText)}
          >
            {primaryCtaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
          {pageType !== 'general' && (
            <Link
              href={secondaryWizardHref}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              onClick={() => handleCtaClick(secondaryCtaText)}
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>
        <p className="mt-8 text-white/70 text-sm">
          {pageType === 'money' ? (
            <>MCOL-Ready Forms &bull; Evidence Checklist &bull; Court Instructions</>
          ) : pageType === 'court' ? (
            <>All Court Forms Included &bull; Witness Statements &bull; Step-by-Step Guide</>
          ) : (
            <>Section 21 & 8 Included &bull; AI Compliance Check &bull; Designed for Court Acceptance</>
          )}
        </p>
      </div>
    );
  }

  // Default/hero variant - simple buttons (use with StandardHero)
  const heroPrimaryText = `${primaryText || config.primary.label} — ${product.displayPrice}`;
  const heroSecondaryText = secondaryText || config.secondary.label;
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <Link
        href={wizardHref}
        className="hero-btn-primary"
        onClick={() => handleCtaClick(heroPrimaryText)}
      >
        {heroPrimaryText}
      </Link>
      <Link
        href={config.secondary.href}
        className="hero-btn-secondary"
        onClick={() => handleCtaClick(heroSecondaryText)}
      >
        {heroSecondaryText}
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
