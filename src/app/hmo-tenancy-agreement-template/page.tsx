import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'HMO Tenancy Agreement Template | Shared House Rules',
  description:
    'Redirecting to the current HMO tenancy agreement page for England landlords, with shared-house rules, communal-area wording, and records.',
  alternates: { canonical: getCanonicalUrl('/hmo-shared-house-tenancy-agreement') },
  robots: { index: false, follow: true },
};

export default function HmoTenancyAgreementTemplatePage() {
  permanentRedirect('/hmo-shared-house-tenancy-agreement');
}
