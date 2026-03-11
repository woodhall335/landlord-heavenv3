import type { Metadata } from 'next';
import { HighIntentPageShell } from '@/components/seo/HighIntentPageShell';
import { PASS1_LONGFORM_PAGES } from '@/lib/seo/pass1-longform-content';
import { getCanonicalUrl } from '@/lib/seo';

const content = PASS1_LONGFORM_PAGES['tenant-damaging-property'];

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
  openGraph: {
    title: content.title,
    description: content.description,
    type: 'article',
    url: getCanonicalUrl('/tenant-damaging-property'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tenant-damaging-property'),
  },
};

export default function TenantDamagingPropertyPage() {
  return <HighIntentPageShell {...content} />;
}
