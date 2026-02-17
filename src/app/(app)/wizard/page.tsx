/**
 * Wizard Selection Page
 *
 * Server component that provides dynamic SEO metadata based on product parameter,
 * then renders the client-side interactive wizard selection.
 *
 * URL params:
 * - product: notice_only, complete_pack, money_claim, ast_standard, ast_premium, tenancy_agreement
 * - jurisdiction: england, wales, scotland, northern-ireland
 * - src: tracking source
 * - topic: eviction, arrears, tenancy, deposit, compliance
 */

import { Metadata } from 'next';
import { SEO_PRICES, SEO_LANDING_ROUTES } from '@/lib/pricing/products';
import WizardClientPage from './WizardClientPage';
import { HeaderConfig } from '@/components/layout/HeaderConfig';

/**
 * Base URL for canonical links
 */
const BASE_URL = 'https://landlordheaven.co.uk';

/**
 * Product-specific SEO metadata for wizard pages
 *
 * Even though wizard pages are noindex, we still provide meaningful metadata for:
 * - User experience (browser tab titles)
 * - Social sharing / bookmarking
 * - Analytics (page titles in tracking)
 * - Canonical pointing to clean landing routes
 */
interface WizardProductSEO {
  title: string;
  description: string;
  h1: string;
  /** Clean landing route for canonical URL */
  canonicalRoute: string;
}

/**
 * WIZARD_PRODUCT_SEO - Product-specific metadata with canonical routes
 *
 * Each product maps to its clean SEO landing route for canonical URLs.
 * Prices come from SEO_PRICES single source of truth.
 */
export const WIZARD_PRODUCT_SEO: Record<string, WizardProductSEO> = {
  notice_only: {
    title: `Eviction Notice Wizard | Section 21, Section 8, Notice to Leave | ${SEO_PRICES.evictionNotice.display}`,
    description:
      'Create a procedurally correct eviction notice for England (Section 21/Section 8), Wales (Section 173/181), or Scotland (Notice to Leave). Guided wizard with compliance checks and official forms.',
    h1: 'Eviction Notice Wizard',
    canonicalRoute: SEO_LANDING_ROUTES.notice_only,
  },
  complete_pack: {
    title: `Complete Eviction Pack Wizard | Notice + Court Forms | England | ${SEO_PRICES.evictionBundle.display}`,
    description:
      'Generate your complete eviction bundle: Section 21 or Section 8 notice, N5/N5B claim forms, N119 Particulars of Claim, and court filing guide. England only.',
    h1: 'Complete Eviction Pack Wizard',
    canonicalRoute: SEO_LANDING_ROUTES.complete_pack,
  },
  money_claim: {
    title: `Money Claim Wizard | Form N1 Generator | England | ${SEO_PRICES.moneyClaim.display}`,
    description:
      'Create Form N1 claim form for rent arrears, property damage, and cleaning costs. Automatic 8% interest calculation with daily rate. England county courts only.',
    h1: 'Money Claim Wizard',
    canonicalRoute: SEO_LANDING_ROUTES.money_claim,
  },
  ast_standard: {
    title: `Tenancy Agreement Wizard | AST, Occupation Contract, PRT | ${SEO_PRICES.tenancyStandard.display}`,
    description:
      'Generate a jurisdiction-specific tenancy agreement: AST (England), Standard Occupation Contract (Wales), PRT (Scotland), or Private Tenancy (Northern Ireland).',
    h1: 'Tenancy Agreement Wizard',
    canonicalRoute: SEO_LANDING_ROUTES.ast_standard,
  },
  ast_premium: {
    title: `Premium Tenancy Agreement Wizard | HMO & Guarantor Clauses | ${SEO_PRICES.tenancyPremium.display}`,
    description:
      'Create a premium tenancy agreement with HMO clauses, guarantor provisions, inventory, and compliance checklist. All UK jurisdictions supported.',
    h1: 'Premium Tenancy Agreement Wizard',
    canonicalRoute: SEO_LANDING_ROUTES.ast_premium,
  },
  tenancy_agreement: {
    title: `Tenancy Agreement Wizard | All UK Jurisdictions | from ${SEO_PRICES.tenancyStandard.display}`,
    description:
      'Generate a compliant tenancy agreement for England (AST), Wales (Occupation Contract), Scotland (PRT), or Northern Ireland. Standard or Premium options.',
    h1: 'Tenancy Agreement Wizard',
    // Maps to standard tenancy agreement landing page
    canonicalRoute: SEO_LANDING_ROUTES.ast_standard,
  },
};

/**
 * DEFAULT_SEO - Fallback for unknown/empty product param
 * No canonical URL is set for unknown products.
 */
export const DEFAULT_SEO = {
  title: 'Legal Document Wizard | Landlord Heaven',
  description:
    'Guided document creation for UK landlords. Generate eviction notices, court forms, money claims, and tenancy agreements with step-by-step validation.',
  h1: 'Legal Document Wizard',
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const product = typeof params.product === 'string' ? params.product : undefined;
  const jurisdiction = typeof params.jurisdiction === 'string' ? params.jurisdiction : undefined;

  // Get product-specific SEO or default
  const productSeo = product && WIZARD_PRODUCT_SEO[product] ? WIZARD_PRODUCT_SEO[product] : null;
  const seo = productSeo || DEFAULT_SEO;

  // Build jurisdiction-specific title suffix if applicable
  let title = seo.title;
  if (jurisdiction) {
    const jurisdictionLabel = {
      england: 'England',
      wales: 'Wales',
      scotland: 'Scotland',
      'northern-ireland': 'Northern Ireland',
    }[jurisdiction];
    // Add jurisdiction to title if not already present
    if (jurisdictionLabel && !title.includes(jurisdictionLabel)) {
      title = `${title} | ${jurisdictionLabel}`;
    }
  }

  // Append brand if not present
  if (!title.includes('Landlord Heaven')) {
    title = `${title} | Landlord Heaven`;
  }

  // Build canonical URL only for known products
  const canonical = productSeo ? `${BASE_URL}${productSeo.canonicalRoute}` : undefined;

  return {
    title,
    description: seo.description,
    // Canonical points to clean SEO landing route (for known products only)
    ...(canonical && {
      alternates: {
        canonical,
      },
    }),
    openGraph: {
      title,
      description: seo.description,
      type: 'website',
      siteName: 'Landlord Heaven',
      ...(canonical && { url: canonical }),
    },
    twitter: {
      card: 'summary',
      title,
      description: seo.description,
    },
    // Wizard pages: noindex (don't show in search) but follow (crawl links)
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

export default function WizardPage() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <WizardClientPage />
    </>
  );
}
