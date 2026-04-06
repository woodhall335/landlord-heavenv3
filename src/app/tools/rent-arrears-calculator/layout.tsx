import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Rent Arrears Calculator | UK Landlords',
  description:
    'Calculate rent arrears, missed-payment schedules, and interest estimates so you can prepare the next notice or money-claim step with cleaner figures.',
  path: '/tools/rent-arrears-calculator',
  keywords: [
    'rent arrears calculator',
    'arrears schedule calculator',
    'landlord arrears tool',
    'rent arrears interest calculator',
  ],
});

export default function RentArrearsCalculatorLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
