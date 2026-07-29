import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Tenancy Agreement Redirect | Landlord Heaven',
  description:
    'Choose the property jurisdiction before starting the correct tenancy agreement for England, Wales, Scotland or Northern Ireland.',
  keywords: [
    'tenancy agreement redirect',
    'tenancy agreement template',
    'legacy tenancy agreement route',
  ],
  alternates: {
    canonical: getCanonicalUrl('/standard-tenancy-agreement'),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function TenancyAgreementPage() {
  permanentRedirect('/standard-tenancy-agreement#choose-jurisdiction');
}
