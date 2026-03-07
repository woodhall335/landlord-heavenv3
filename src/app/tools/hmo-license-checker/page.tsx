import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';
import HMOLicenseCheckerPageClient from './PageClient';

export const metadata: Metadata = {
  title: 'Free HMO License Checker | England Landlords',
  description:
    'Check whether your property is likely to require an HMO licence in England. Get a quick assessment and council signposting.',
  alternates: {
    canonical: getCanonicalUrl('/tools/hmo-license-checker'),
  },
  openGraph: {
    title: 'Free HMO License Checker | England Landlords',
    description:
      'Check if your property may need an HMO licence and review next compliance steps.',
    type: 'website',
    url: getCanonicalUrl('/tools/hmo-license-checker'),
  },
};

export default function HMOLicenseCheckerPage() {
  return <HMOLicenseCheckerPageClient />;
}
