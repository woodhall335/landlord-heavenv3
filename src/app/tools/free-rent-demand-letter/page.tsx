import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';
import RentDemandLetterGeneratorPageClient from './PageClient';

export const metadata: Metadata = {
  title: 'Free Rent Demand Letter Generator | UK Landlords',
  description:
    'Generate a free rent demand letter for tenant arrears. Build a clear demand letter and move to court-ready money-claim workflows when needed.',
  alternates: {
    canonical: getCanonicalUrl('/tools/free-rent-demand-letter'),
  },
  openGraph: {
    title: 'Free Rent Demand Letter Generator | UK Landlords',
    description:
      'Generate a free rent demand letter for tenant arrears and prepare for next legal steps.',
    type: 'website',
    url: getCanonicalUrl('/tools/free-rent-demand-letter'),
  },
};

export default function FreeRentDemandLetterPage() {
  return <RentDemandLetterGeneratorPageClient />;
}
