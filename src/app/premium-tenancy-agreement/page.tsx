import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/premium-tenancy-agreement');
const wizardHref = '/wizard?product=tenancy_agreement&src=seo_premium_tenancy_agreement&topic=tenancy';

export const metadata: Metadata = {
  title: 'Premium Tenancy Agreement | Solicitor-Grade Landlord Contract',
  description:
    'Build a legally validated, solicitor-grade, compliance-checked and court-ready premium tenancy agreement for advanced landlord scenarios.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Premium Tenancy Agreement | Solicitor-Grade Landlord Contract',
    description:
      'Build a legally validated, solicitor-grade, compliance-checked and court-ready premium tenancy agreement for advanced landlord scenarios.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function PremiumTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Premium Tenancy Agreement', url: canonicalUrl },
          ])}
        />
        <UniversalHero
          title="Premium Court-Ready Tenancy Agreement"
          subtitle="Create a legally validated, solicitor-grade and compliance-checked contract tailored to complex tenancy arrangements."
          primaryCta={{ label: 'Start Tenancy Wizard', href: wizardHref }}
          secondaryCta={{ label: 'Standard agreement', href: '/tenancy-agreement' }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <Link href={wizardHref} className="hero-btn-primary">Create premium agreement</Link>
        </Container>
      </main>
    </div>
  );
}
