import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/layout/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/money-claim');
const wizardHref = '/wizard?product=money_claim&src=seo_money_claim&topic=debt';

export const metadata: Metadata = {
  title: 'Money Claim for Landlords | Solicitor-Grade Debt Recovery',
  description:
    'Prepare a legally validated, solicitor-grade, compliance-checked and court-ready money claim path for tenant debt and arrears recovery.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Money Claim for Landlords | Solicitor-Grade Debt Recovery',
    description:
      'Prepare a legally validated, solicitor-grade, compliance-checked and court-ready money claim path for tenant debt and arrears recovery.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function MoneyClaimPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Money Claim', url: canonicalUrl },
          ])}
        />
        <UniversalHero
          title="Court-Ready Money Claim for Rent Debt"
          subtitle="Generate a legally validated, solicitor-grade and compliance-checked debt recovery workflow before filing your claim."
          primaryCta={{ label: 'Start Money Claim Wizard', href: wizardHref }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <Link href={wizardHref} className="hero-btn-primary">Start debt claim wizard</Link>
        </Container>
      </main>
    </div>
  );
}
