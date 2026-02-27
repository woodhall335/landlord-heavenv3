import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/periodic-tenancy-agreement');
const wizardHref = '/wizard?product=tenancy_agreement&topic=tenancy&src=seo_periodic_tenancy_agreement';

export const metadata: Metadata = {
  title: 'Periodic Tenancy Agreement | Compliance-Checked Rolling Contract',
  description:
    'Create a legally validated, solicitor-grade, compliance-checked and court-ready periodic tenancy agreement for rolling tenancies.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Periodic Tenancy Agreement | Compliance-Checked Rolling Contract',
    description:
      'Create a legally validated, solicitor-grade, compliance-checked and court-ready periodic tenancy agreement for rolling tenancies.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function PeriodicTenancyPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Periodic Tenancy Agreement', url: canonicalUrl },
          ])}
        />
        <UniversalHero
          title="Court-Ready Periodic Tenancy Agreement"
          subtitle="Generate a legally validated, solicitor-grade and compliance-checked rolling tenancy agreement with the right clauses."
          primaryCta={{ label: 'Start Tenancy Wizard', href: wizardHref }}
          secondaryCta={{ label: 'Standard tenancy agreement', href: '/tenancy-agreement' }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <Link href={wizardHref} className="hero-btn-primary">Build rolling agreement</Link>
        </Container>
      </main>
    </div>
  );
}
