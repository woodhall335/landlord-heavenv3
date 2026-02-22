import type { Metadata } from 'next';
import { WizardLandingPage } from '@/components/seo/WizardLandingPage';
import { moneyClaimContent } from '@/lib/seo/wizard-landing-content';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/money-claim');

export const metadata: Metadata = {
  title: moneyClaimContent.title,
  description: moneyClaimContent.description,
  keywords: [
    'money claim',
    'N1 form',
    'N1 claim form',
    'rent arrears claim',
    'county court claim',
    'interest calculation',
    'daily rate',
    'PAP-DEBT',
    'letter before claim',
    'tenant debt recovery',
    'MCOL',
    'money claim online',
    'landlord money claim',
  ],
  openGraph: {
    title: moneyClaimContent.title,
    description: moneyClaimContent.description,
    url: canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: moneyClaimContent.title,
    description: moneyClaimContent.description,
  },
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MoneyClaimPage() {
  return <WizardLandingPage content={moneyClaimContent} structuredDataUrl={canonicalUrl} showAskHeavenWidget={false} />;
}
