import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Landlord Money Claim Pack | Rent Arrears & Debt',
  description:
    'Redirecting to the current landlord money claim pack for unpaid rent, damage, bills, guarantor debt, and MCOL claim preparation.',
  alternates: { canonical: getCanonicalUrl('/products/money-claim') },
  robots: { index: false, follow: true },
};

export default function MoneyClaimPackAliasPage() {
  permanentRedirect('/products/money-claim');
}
