import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Free Rent Demand Letter Generator | UK Landlords',
  description:
    'Create a clear rent demand letter for arrears, prompt payment properly, and move into the right landlord claim route if the tenant still does not pay.',
  path: '/tools/free-rent-demand-letter',
  keywords: [
    'rent demand letter generator',
    'rent arrears letter',
    'landlord demand letter',
    'free rent demand letter',
  ],
});

export default function FreeRentDemandLetterLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}

