import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Periodic Tenancy Agreement | Rolling Tenancy Guide UK',
  description:
    'Understand periodic tenancy agreements in the UK. Learn about rolling tenancies, notice periods, rent increases, and your rights as a landlord or tenant.',
  keywords: [
    'periodic tenancy agreement',
    'rolling tenancy',
    'monthly tenancy UK',
    'periodic tenancy notice period',
    'statutory periodic tenancy',
    'rolling contract tenancy',
    'month to month tenancy UK',
    'periodic tenancy rent increase',
    'end periodic tenancy',
    'periodic tenancy landlord rights',
  ],
  openGraph: {
    title: 'Periodic Tenancy Agreement | Rolling Tenancy Guide UK',
    description:
      'Understand periodic tenancy agreements in the UK. Learn about rolling tenancies, notice periods, rent increases, and your rights.',
    url: getCanonicalUrl('/periodic-tenancy-agreement'),
    siteName: 'Landlord Heaven',
    type: 'article',
  },
  alternates: {
    canonical: getCanonicalUrl('/rolling-tenancy-agreement'),
  },
};

// Redirect to rolling-tenancy-agreement as they are the same concept
export default function PeriodicTenancyPage() {
  redirect('/rolling-tenancy-agreement');
}
