import type { Metadata } from 'next';
import { WizardLandingPage } from '@/components/seo/WizardLandingPage';
import { astPremiumContent } from '@/lib/seo/wizard-landing-content';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/premium-tenancy-agreement');

export const metadata: Metadata = {
  title: astPremiumContent.title,
  description: astPremiumContent.description,
  keywords: [
    'premium tenancy agreement',
    'HMO clauses',
    'guarantor clauses',
    'HMO tenancy agreement',
    'student tenancy agreement',
    'joint and several liability',
    'multi-tenant agreement',
    'AST premium',
    'occupation contract premium',
    'PRT premium',
    'Housing Act 2004',
    'HMO licensing',
  ],
  openGraph: {
    title: astPremiumContent.title,
    description: astPremiumContent.description,
    url: canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: astPremiumContent.title,
    description: astPremiumContent.description,
  },
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PremiumTenancyAgreementPage() {
  return <WizardLandingPage content={astPremiumContent} structuredDataUrl={canonicalUrl} />;
}
