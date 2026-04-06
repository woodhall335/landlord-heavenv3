import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'AST Agreement Template Redirect | Landlord Heaven',
  description:
    'Legacy AST agreement template route retained only to redirect landlords to the current assured shorthold tenancy agreement template page.',
  keywords: [
    'ast agreement template',
    'assured shorthold tenancy agreement template',
    'legacy ast redirect',
  ],
  alternates: {
    canonical: getCanonicalUrl('/assured-shorthold-tenancy-agreement-template'),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AstAgreementTemplatePage() {
  permanentRedirect('/assured-shorthold-tenancy-agreement-template');
}
