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
import { SEO_PRICES } from '@/lib/pricing/products';
import WizardClientPage from './WizardClientPage';

/**
 * Product-specific SEO metadata for wizard pages
 *
 * Even though wizard pages are noindex (set in layout.tsx), we still provide
 * meaningful metadata for:
 * - User experience (browser tab titles)
 * - Social sharing / bookmarking
 * - Analytics (page titles in tracking)
 */
interface WizardProductSEO {
  title: string;
  description: string;
  h1: string;
}

const WIZARD_PRODUCT_SEO: Record<string, WizardProductSEO> = {
  notice_only: {
    title: `Eviction Notice Wizard | Section 21, Section 8, Notice to Leave | ${SEO_PRICES.evictionNotice.display}`,
    description:
      'Create a procedurally correct eviction notice for England (Section 21/Section 8), Wales (Section 173/181), or Scotland (Notice to Leave). Guided wizard with compliance checks and official forms.',
    h1: 'Eviction Notice Wizard',
  },
  complete_pack: {
    title: `Complete Eviction Pack Wizard | Notice + Court Forms | England | ${SEO_PRICES.evictionBundle.display}`,
    description:
      'Generate your complete eviction bundle: Section 21 or Section 8 notice, N5/N5B claim forms, N119 Particulars of Claim, and court filing guide. England only.',
    h1: 'Complete Eviction Pack Wizard',
  },
  money_claim: {
    title: `Money Claim Wizard | Form N1 Generator | England | ${SEO_PRICES.moneyClaim.display}`,
    description:
      'Create Form N1 claim form for rent arrears, property damage, and cleaning costs. Automatic 8% interest calculation with daily rate. England county courts only.',
    h1: 'Money Claim Wizard',
  },
  ast_standard: {
    title: `Tenancy Agreement Wizard | AST, Occupation Contract, PRT | ${SEO_PRICES.tenancyStandard.display}`,
    description:
      'Generate a jurisdiction-specific tenancy agreement: AST (England), Standard Occupation Contract (Wales), PRT (Scotland), or Private Tenancy (Northern Ireland).',
    h1: 'Tenancy Agreement Wizard',
  },
  ast_premium: {
    title: `Premium Tenancy Agreement Wizard | HMO & Guarantor Clauses | ${SEO_PRICES.tenancyPremium.display}`,
    description:
      'Create a premium tenancy agreement with HMO clauses, guarantor provisions, inventory, and compliance checklist. All UK jurisdictions supported.',
    h1: 'Premium Tenancy Agreement Wizard',
  },
  tenancy_agreement: {
    title: `Tenancy Agreement Wizard | All UK Jurisdictions | from ${SEO_PRICES.tenancyStandard.display}`,
    description:
      'Generate a compliant tenancy agreement for England (AST), Wales (Occupation Contract), Scotland (PRT), or Northern Ireland. Standard or Premium options.',
    h1: 'Tenancy Agreement Wizard',
  },
};

const DEFAULT_SEO: WizardProductSEO = {
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
  const seo = product && WIZARD_PRODUCT_SEO[product] ? WIZARD_PRODUCT_SEO[product] : DEFAULT_SEO;

  // Build jurisdiction-specific title suffix if applicable
  let title = seo.title;
  if (jurisdiction) {
    const jurisdictionLabel = {
      england: 'England',
      wales: 'Wales',
      scotland: 'Scotland',
      'northern-ireland': 'Northern Ireland',
    }[jurisdiction];
    if (jurisdictionLabel && !title.includes(jurisdictionLabel)) {
      title = title.replace(' | Landlord Heaven', ` | ${jurisdictionLabel} | Landlord Heaven`);
    }
  }

  // Append brand if not present
  if (!title.includes('Landlord Heaven')) {
    title = `${title} | Landlord Heaven`;
  }

  return {
    title,
    description: seo.description,
    openGraph: {
      title,
      description: seo.description,
      type: 'website',
      siteName: 'Landlord Heaven',
    },
    twitter: {
      card: 'summary',
      title,
      description: seo.description,
    },
    // Note: robots noindex is set in layout.tsx for all wizard pages
  };
}

export default function WizardPage() {
  return <WizardClientPage />;
}
