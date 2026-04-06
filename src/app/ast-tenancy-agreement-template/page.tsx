import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'AST Tenancy Agreement Template Redirect | Landlord Heaven',
  description:
    'Legacy AST tenancy agreement template route retained only to redirect landlords to the current assured shorthold tenancy agreement template page.',
  keywords: [
    'ast tenancy agreement template',
    'legacy ast tenancy template',
    'assured shorthold tenancy agreement template',
  ],
  alternates: {
    canonical: getCanonicalUrl('/assured-shorthold-tenancy-agreement-template'),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AstTenancyAgreementTemplatePage() {
  permanentRedirect('/assured-shorthold-tenancy-agreement-template');
}
