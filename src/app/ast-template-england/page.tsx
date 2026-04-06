import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'AST Template England Redirect | Landlord Heaven',
  description:
    'Legacy England AST template route retained only to redirect search traffic to the current assured shorthold tenancy agreement template page.',
  keywords: [
    'ast template england',
    'england ast template redirect',
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

export default function ASTTemplateEnglandPage() {
  permanentRedirect('/assured-shorthold-tenancy-agreement-template');
}
