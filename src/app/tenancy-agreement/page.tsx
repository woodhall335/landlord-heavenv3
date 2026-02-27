import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement');
const wizardHref = '/wizard?product=tenancy_agreement&src=seo_tenancy_agreement&topic=tenancy';

export const metadata: Metadata = {
  title: 'Tenancy Agreement | Legally Validated Landlord Contract',
  description:
    'Generate a legally validated, solicitor-grade, compliance-checked and court-ready tenancy agreement for landlords in minutes.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreement | Legally Validated Landlord Contract',
    description:
      'Generate a legally validated, solicitor-grade, compliance-checked and court-ready tenancy agreement for landlords in minutes.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Tenancy Agreement', url: canonicalUrl },
          ])}
        />
        <UniversalHero
          title="Solicitor-Grade Tenancy Agreement for Landlords"
          subtitle="Start with a legally validated, compliance-checked and court-ready tenancy agreement workflow designed for UK lettings."
          primaryCta={{ label: 'Start Tenancy Wizard', href: wizardHref }}
          secondaryCta={{ label: 'Premium agreement', href: '/premium-tenancy-agreement' }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <Link href={wizardHref} className="hero-btn-primary">Create tenancy agreement</Link>
        </Container>
      </main>
    </div>
  );
}
