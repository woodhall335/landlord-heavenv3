import type { Metadata } from 'next';
import { HighIntentPageShell } from '@/components/seo/HighIntentPageShell';
import { PASS1_LONGFORM_PAGES } from '@/lib/seo/pass1-longform-content';
import { generateMetadata } from '@/lib/seo';

const content = PASS1_LONGFORM_PAGES['tenant-damaging-property'];

export const metadata: Metadata = generateMetadata({
  title: 'Tenant Damaging Property: Evidence, Possession, and Recovery Strategy',
  description:
    'Detailed landlord guide on evidence packs, deposit versus damages claims, Section 8 route logic, and combining possession with money recovery.',
  path: '/tenant-damaging-property',
  type: 'article',
  keywords: [
    'tenant damaging property',
    'property damage by tenant',
    'section 8 property damage',
    'landlord damage evidence',
  ],
});

export default function TenantDamagingPropertyPage() {
  return <HighIntentPageShell {...content} />;
}
