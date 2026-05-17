import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Lodger Agreement Template | Resident Landlord Pack',
  description:
    'Redirecting to the current lodger agreement page for resident landlords, with room-let terms, notice wording, and house records.',
  alternates: { canonical: getCanonicalUrl('/lodger-agreement') },
  robots: { index: false, follow: true },
};

export default function LodgerAgreementTemplatePage() {
  permanentRedirect('/lodger-agreement');
}
