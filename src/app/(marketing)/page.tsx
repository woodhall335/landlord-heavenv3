/**
 * Landing Page - Server Component
 *
 * Homepage routing via marketing route-group.
 */

import { HomeContent } from '@/components/landing';
import { generateMetadata } from '@/lib/seo';
import { StructuredData, websiteSchema } from '@/lib/seo/structured-data';

export const metadata = generateMetadata({
  title: 'Landlord Help for Eviction, Rent Increases, Arrears and Tenancy Documents',
  description:
    'Use Landlord Heaven to handle eviction notices, court paperwork, rent increases, money claims, and tenancy agreements with clearer landlord guidance.',
  path: '/',
  keywords: [
    'evict a tenant',
    'eviction notice',
    'section 8',
    'rent increase landlord',
    'section 13 rent increase',
    'recover rent arrears',
    'money claim',
    'landlord eviction help',
    'england landlord documents',
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
