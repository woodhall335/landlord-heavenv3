import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Tenancy Agreement Redirect | Landlord Heaven',
  description:
    'Legacy tenancy agreement route retained only to redirect landlords to the current England agreement example page.',
  keywords: [
    'tenancy agreement redirect',
    'tenancy agreement template',
    'legacy tenancy agreement route',
  ],
  alternates: {
    canonical: getCanonicalUrl('/tenancy-agreement-template'),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function TenancyAgreementPage() {
  permanentRedirect('/tenancy-agreement-template');
}
