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
    'evict a tenant',
    'eviction notice',
    'section 8',
    'rent increase landlord',
    'section 13 rent increase',
    'recover rent arrears',
    'money claim',
    'landlord eviction help england',
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
