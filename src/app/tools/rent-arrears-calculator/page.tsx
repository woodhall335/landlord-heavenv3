import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';
import RentArrearsCalculatorPageClient from './PageClient';

export const metadata: Metadata = {
  title: 'Rent Arrears Calculator | Landlord Debt & Interest (UK)',
  description:
    'Calculate tenant rent arrears, running balance, and statutory interest. Build evidence-ready arrears schedules for next legal steps.',
  alternates: {
    canonical: getCanonicalUrl('/tools/rent-arrears-calculator'),
  },
  openGraph: {
    title: 'Rent Arrears Calculator | Landlord Debt & Interest (UK)',
    description:
      'Calculate arrears totals and statutory interest with a clear landlord-facing schedule.',
    type: 'website',
    url: getCanonicalUrl('/tools/rent-arrears-calculator'),
  },
};

export default function RentArrearsCalculatorPage() {
  return <RentArrearsCalculatorPageClient />;
}
