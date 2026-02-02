import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

// Re-export the component from money-claim
export { default } from '../money-claim/page';

// Custom metadata for the money-claim-pack URL
export const metadata: Metadata = {
  title: 'Money Claim Pack | Recover Unpaid Rent | Landlord Heaven',
  description:
    'Complete money claim pack for UK landlords. Letter Before Action, N1 form guidance, and evidence checklist to recover rent arrears.',
  keywords: [
    'money claim pack',
    'rent arrears recovery pack',
    'landlord money claim',
    'recover unpaid rent',
    'letter before action template',
    'N1 claim form',
    'county court claim pack',
    'tenant debt recovery',
    'MCOL landlord pack',
    'rent arrears court documents',
  ],
  openGraph: {
    title: 'Money Claim Pack | Recover Unpaid Rent from Tenants',
    description:
      'Complete money claim pack for UK landlords. All documents needed to recover unpaid rent through the county court.',
    url: getCanonicalUrl('/products/money-claim-pack'),
    siteName: 'Landlord Heaven',
    type: 'website',
  },
  alternates: {
    canonical: getCanonicalUrl('/products/money-claim'),
  },
};
