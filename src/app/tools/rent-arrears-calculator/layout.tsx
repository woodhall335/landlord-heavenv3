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
    'tenant rent arrears calculator',
    'unpaid rent calculator',
    'rent debt schedule',
    'section 8 arrears schedule',
    'money claim rent arrears calculator',
    'late rent payment calculator',
    'landlord rent debt calculator',
    'rent arrears evidence schedule',
  ],
});

export default function RentArrearsCalculatorLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
