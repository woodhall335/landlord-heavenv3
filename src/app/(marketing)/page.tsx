/**
 * Landing Page - Server Component
 *
 * Homepage routing via marketing route-group.
 */

import { HomeContent } from '@/components/landing';
import { generateMetadata } from '@/lib/seo';
import { StructuredData, websiteSchema } from '@/lib/seo/structured-data';

export const metadata = generateMetadata({
  title: 'Evict a Tenant, Recover Rent Arrears | UK Landlords',
  description:
    'Use Landlord Heaven to choose Section 21 or Section 8, serve the right eviction notice, recover rent arrears, and prepare landlord documents.',
  path: '/',
  keywords: [
    'evict a tenant',
    'eviction notice',
    'section 21',
    'section 8',
    'recover rent arrears',
    'money claim',
    'landlord eviction help',
    'UK landlord documents',
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
