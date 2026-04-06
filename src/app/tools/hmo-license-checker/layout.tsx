import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'HMO Licence Checker | England Landlords',
  description:
    'Check whether a property is likely to need an HMO licence in England, capture the council lead, and understand the next compliance step before letting.',
  path: '/tools/hmo-license-checker',
  keywords: [
    'hmo licence checker',
    'hmo license checker england',
    'hmo council checker',
    'landlord hmo tool',
  ],
});

export default function HmoLicenseCheckerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
