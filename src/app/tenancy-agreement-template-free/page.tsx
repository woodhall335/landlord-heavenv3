import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Free Tenancy Agreement Template Redirect | Landlord Heaven',
  description:
    'Legacy free tenancy agreement template route retained only to redirect search traffic to the current England agreement example page.',
  keywords: [
    'free tenancy agreement template',
    'tenancy agreement template redirect',
    'legacy free tenancy route',
  ],
  alternates: {
    canonical: getCanonicalUrl('/tenancy-agreement-template'),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function TenancyAgreementTemplateFreePage() {
  permanentRedirect('/tenancy-agreement-template');
}
