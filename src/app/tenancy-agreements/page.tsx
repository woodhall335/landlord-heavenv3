import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreements');
const wizardHref = '/wizard?product=tenancy_agreement&src=seo_tenancy_agreements&topic=tenancy';

export const metadata: Metadata = {
  title: 'Tenancy Agreements Hub | Solicitor-Grade Landlord Documents',
  description:
    'Explore tenancy agreement options and start a legally validated, solicitor-grade, compliance-checked and court-ready agreement wizard.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreements Hub | Solicitor-Grade Landlord Documents',
    description:
      'Explore tenancy agreement options and start a legally validated, solicitor-grade, compliance-checked and court-ready agreement wizard.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementsHubPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Tenancy Agreements', url: canonicalUrl },
          ])}
        />

        <UniversalHero
          title="Tenancy Agreements for UK Landlords"
          subtitle="Choose your agreement route with legally validated, solicitor-grade, compliance-checked and court-ready drafting support."
          primaryCta={{ label: 'Start Tenancy Wizard', href: wizardHref }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">Standard tenancy agreement</Link>
            <Link href="/premium-tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">Premium tenancy agreement</Link>
            <Link href="/periodic-tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">Periodic tenancy agreement</Link>
            <Link href={wizardHref} className="rounded-lg border p-4 hover:bg-gray-50">Start wizard</Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
