import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/tenancy-agreement-template-uk';
const canonicalUrl = getCanonicalUrl(pagePath);

const jurisdictions = [
  {
    name: 'England',
    href: '/tenancy-agreement-template',
    summary:
      'Use the England template hub for the sample agreement preview and the Standard / Premium journey.',
  },
  {
    name: 'Wales',
    href: '/wales-tenancy-agreement-template',
    summary: 'Use the Wales route if the property uses the Welsh occupation-contract framework.',
  },
  {
    name: 'Scotland',
    href: '/private-residential-tenancy-agreement-template',
    summary: 'Use the Scotland route for private residential tenancy agreement wording.',
  },
  {
    name: 'Northern Ireland',
    href: '/northern-ireland-tenancy-agreement-template',
    summary: 'Use the Northern Ireland route for private tenancy wording and local compliance.',
  },
];

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

