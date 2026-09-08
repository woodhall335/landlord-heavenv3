import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { TenancyJurisdictionSelector } from '@/components/tenancy/TenancyJurisdictionSelector';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/tenancy-agreement-template-uk';
const canonicalUrl = getCanonicalUrl(pagePath);

export const metadata: Metadata = {
  title: 'Tenancy Agreement Template UK | Choose Your Jurisdiction',
  description:
    'Choose a Standard tenancy agreement for England, Wales, Scotland or Northern Ireland. England also offers Premium and specialist agreement products.',
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
          subtitle="Standard agreements are available for England, Wales, Scotland and Northern Ireland. England also offers Premium, Student, HMO / Shared House and Lodger products; choose the property location first so the correct framework and wizard questions are used."
          primaryCta={{
            label: 'Choose property jurisdiction',
            href: '#choose-jurisdiction',
          }}
          secondaryCta={{
            label: 'View standard agreement overview',
            href: '/standard-tenancy-agreement',
          }}
          trustText="Wales, Scotland and Northern Ireland currently offer Standard agreements only. England has additional agreement options."
          feature="Wales offers separate Fixed-Term and Periodic Standard Occupation Contract routes."
          mediaSrc="/images/generated/product-cards/standard-tenancy-agreement.webp"
          mediaAlt="Preview of the guided tenancy agreement workflow"
          ariaLabel="Choose a UK tenancy agreement jurisdiction"
        />
        <section className="border-b border-[#E8E1D7] bg-white py-12">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6D28D9]">
                  Why location comes first
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D]">
                  The UK does not use one tenancy agreement system
                </h2>
                <p className="mt-4 text-base leading-8 text-[#546075]">
                  England, Wales, Scotland and Northern Ireland use different legal terms, required
                  information and possession frameworks. Choose where the property is located before
                  entering any tenancy details so the document route and supporting guidance match the let.
                </p>
              </div>
              <div className="mt-7 grid gap-5 md:grid-cols-3">
                <article className="rounded-[1.5rem] border border-[#E8E1D7] bg-[#FCFBF8] p-5">
                  <h3 className="text-lg font-semibold text-[#141B2D]">Avoid the wrong terminology</h3>
                  <p className="mt-2 text-sm leading-7 text-[#546075]">
                    An England agreement, Welsh occupation contract and Scottish PRT are not interchangeable labels.
                  </p>
                </article>
                <article className="rounded-[1.5rem] border border-[#E8E1D7] bg-[#FCFBF8] p-5">
                  <h3 className="text-lg font-semibold text-[#141B2D]">See only relevant options</h3>
                  <p className="mt-2 text-sm leading-7 text-[#546075]">
                    Specialist choices such as Student, HMO / Shared House and Lodger agreements currently sit in the England route.
                  </p>
                </article>
                <article className="rounded-[1.5rem] border border-[#E8E1D7] bg-[#FCFBF8] p-5">
                  <h3 className="text-lg font-semibold text-[#141B2D]">Build from the actual let</h3>
                  <p className="mt-2 text-sm leading-7 text-[#546075]">
                    After choosing the jurisdiction, use the property and occupier facts to select the appropriate agreement.
                  </p>
                </article>
              </div>
            </div>
          </Container>
        </section>
        <TenancyJurisdictionSelector />
      </main>
    </div>
  );
}
