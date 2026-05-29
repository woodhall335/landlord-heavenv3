/**
 * Landing Page - Server Component
 *
 * Homepage routing via marketing route-group.
 */

import { HomeContent } from '@/components/landing';
import { generateMetadata } from '@/lib/seo';
import { StructuredData, websiteSchema } from '@/lib/seo/structured-data';

export const metadata = generateMetadata({
  title: 'Landlord Documents England | Eviction, Rent & Tenancy',
  description:
    'Use Landlord Heaven to handle eviction notices, court paperwork, rent increases, money claims, and tenancy agreements for landlords with property in England.',
  path: '/',
  keywords: [
    'landlord documents england',
    'eviction notice england',
    'section 8 notice pack',
    'section 8 possession claim pack',
    'rent arrears landlord help',
    'recover unpaid rent',
    'landlord money claim pack',
    'section 13 rent increase',
    'form 4a rent increase pack',
    'tenancy agreement england',
    'assured periodic tenancy agreement',
    'court-ready landlord documents',
  ],
});

export default function HomePage() {
  return (
    <>
      <StructuredData data={websiteSchema()} />
      <HomeContent />
    </>
  );
}
