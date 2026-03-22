import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/periodic-tenancy-agreement');
const wizardHref = '/products/ast';

export const metadata: Metadata = {
  title: 'Periodic Tenancy Agreement | England Residential Tenancy Agreement',
  description:
    'Create an England Residential Tenancy Agreement for rolling and periodic letting arrangements with Renters’ Rights compliant positioning.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Periodic Tenancy Agreement | England Residential Tenancy Agreement',
    description:
      'Create an England Residential Tenancy Agreement for rolling and periodic letting arrangements with Renters’ Rights compliant positioning.',
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
          title="Periodic Residential Tenancy Agreement"
          subtitle="Start the main England tenancy wizard for a Renters’ Rights compliant Residential Tenancy Agreement suited to rolling and periodic tenancy setups."
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
