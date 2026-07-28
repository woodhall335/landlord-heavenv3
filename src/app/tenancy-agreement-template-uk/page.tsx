import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { TenancyJurisdictionSelector } from '@/components/tenancy/TenancyJurisdictionSelector';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/tenancy-agreement-template-uk';
const canonicalUrl = getCanonicalUrl(pagePath);

export const metadata: Metadata = {
  title: 'Tenancy Agreement Template UK | Choose Your Jurisdiction',
  description:
    'Pick the correct UK jurisdiction before choosing a tenancy agreement template. England, Wales, Scotland, and Northern Ireland use different frameworks.',
  alternates: { canonical: canonicalUrl },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Tenancy Agreement Template UK | Choose Your Jurisdiction',
    description:
      'Choose England, Wales, Scotland or Northern Ireland before starting the relevant standard tenancy agreement.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementTemplateUkPage() {
  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#141B2D]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement Template UK', url: canonicalUrl },
        ])}
      />

      <main>
        <UniversalHero
          preTitleLabel="UK tenancy agreement routing"
          title="Choose the tenancy agreement for the property jurisdiction"
          subtitle="England, Wales, Scotland and Northern Ireland use different agreement frameworks. Choose the property location first so the correct standard product and wizard questions are used."
          primaryCta={{
            label: 'Choose property jurisdiction',
            href: '#choose-jurisdiction',
          }}
          secondaryCta={{
            label: 'View standard agreement overview',
            href: '/standard-tenancy-agreement',
          }}
          trustText="Released standard agreement routes are selected from the canonical product registry."
          feature="Wales offers separate Fixed-Term and Periodic Standard Occupation Contract routes."
          mediaSrc="/images/wizard-standard-tenancy-agreement.webp"
          mediaAlt="Preview of the guided tenancy agreement workflow"
          ariaLabel="Choose a UK tenancy agreement jurisdiction"
        />
        <TenancyJurisdictionSelector />
      </main>
    </div>
  );
}
