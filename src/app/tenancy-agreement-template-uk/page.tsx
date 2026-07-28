import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { TENANCY_AGREEMENT_REGISTRY } from '@/lib/tenancy/agreement-registry';

const pagePath = '/tenancy-agreement-template-uk';
const canonicalUrl = getCanonicalUrl(pagePath);

const JURISDICTION_LABELS = {
  england: 'England',
  wales: 'Wales',
  scotland: 'Scotland',
  'northern-ireland': 'Northern Ireland',
} as const;

const JURISDICTION_SUMMARIES = {
  england:
    'Compare the supported England agreement routes and choose the agreement that matches the let.',
  wales:
    'Choose a fixed-term or periodic standard occupation contract for a property in Wales.',
  scotland:
    'Create the standard Scotland Private Residential Tenancy and receive the supporting notes.',
  'northern-ireland':
    'Create the standard Northern Ireland private tenancy pack with its prescribed supporting documents.',
} as const;

const jurisdictions = Object.keys(JURISDICTION_LABELS).map((jurisdiction) => {
  const entry = TENANCY_AGREEMENT_REGISTRY.find(
    (candidate) => candidate.jurisdiction === jurisdiction
  );
  if (!entry) {
    throw new Error(`Missing tenancy agreement registry entry for ${jurisdiction}`);
  }
  return {
    name: JURISDICTION_LABELS[jurisdiction as keyof typeof JURISDICTION_LABELS],
    href: entry.detailsRoute,
    summary:
      JURISDICTION_SUMMARIES[
        jurisdiction as keyof typeof JURISDICTION_SUMMARIES
      ],
    releaseStatus: entry.releaseStatus,
  };
});

export const metadata: Metadata = {
  title: 'Tenancy Agreement Template UK | Choose Your Jurisdiction',
  description:
    'Pick the correct UK jurisdiction before choosing a tenancy agreement template. England, Wales, Scotland, and Northern Ireland use different frameworks.',
  alternates: { canonical: canonicalUrl },
  robots: {
    index: false,
    follow: true,
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

      <main className="pt-24 pb-16 md:pt-28 md:pb-20">
        <Container className="max-w-5xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
              UK routing page
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Tenancy Agreement Template UK
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#556177]">
              There is no single interchangeable tenancy agreement template for the whole UK.
              Choose the property jurisdiction first, then move into the correct route.
            </p>
          </div>

          <section className="mt-10 grid gap-5 md:grid-cols-2">
            {jurisdictions.map((jurisdiction) => (
              <article
                key={jurisdiction.name}
                className="rounded-[2rem] border border-[#E5DED2] bg-white p-6 shadow-[0_18px_42px_rgba(31,41,55,0.05)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                  {jurisdiction.name}
                </p>
                <p className="mt-4 text-base leading-7 text-[#556177]">{jurisdiction.summary}</p>
                <p className="mt-3 text-sm font-medium text-[#237A57]">
                  {jurisdiction.releaseStatus === 'available'
                    ? 'Available'
                    : 'Not currently available'}
                </p>
                <Link
                  href={jurisdiction.href}
                  className="mt-6 inline-flex items-center text-sm font-semibold text-[#4A46C8] transition hover:text-[#2F2BA6]"
                >
                  Choose {jurisdiction.name}
                </Link>
              </article>
            ))}
          </section>
        </Container>
      </main>
    </div>
  );
}
