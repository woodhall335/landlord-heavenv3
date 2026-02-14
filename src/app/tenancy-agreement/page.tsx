import type { Metadata } from 'next';
import { WizardLandingPage } from '@/components/seo/WizardLandingPage';
import { astStandardContent } from '@/lib/seo/wizard-landing-content';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement');

export const metadata: Metadata = {
  title: astStandardContent.title,
  description: astStandardContent.description,
  keywords: [
    'tenancy agreement',
    'assured shorthold tenancy',
    'AST',
    'occupation contract',
    'private residential tenancy',
    'PRT',
    'northern ireland tenancy',
    'england tenancy agreement',
    'wales tenancy agreement',
    'scotland tenancy agreement',
    'jurisdiction-specific',
    'legally compliant',
    'Housing Act 1988',
    'Renting Homes Wales Act 2016',
  ],
  openGraph: {
    title: astStandardContent.title,
    description: astStandardContent.description,
    url: canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: astStandardContent.title,
    description: astStandardContent.description,
  },
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TenancyAgreementPage() {
  return <WizardLandingPage content={astStandardContent} structuredDataUrl={canonicalUrl} />;
}
