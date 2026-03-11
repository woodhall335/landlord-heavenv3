import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { EVICTION_CLUSTERS } from '@/lib/seo/eviction-authority';
import { getCanonicalUrl } from '@/lib/seo';

const canonical = getCanonicalUrl('/eviction-guides');

const CORE_EVICTION_GUIDES = [
  { href: '/how-to-evict-a-tenant-uk', label: 'How to Evict a Tenant in the UK' },
  { href: '/section-21-notice-guide', label: 'Section 21 Notice Guide' },
  { href: '/section-8-notice-guide', label: 'Section 8 Notice Guide' },
  { href: '/rent-arrears-landlord-guide', label: 'Rent Arrears Landlord Guide' },
  { href: '/eviction-process-england', label: 'Eviction Process England' },
];

export const metadata: Metadata = {
  title: 'Eviction Guides Hub for Landlords | Notices, Court Process, Arrears and Enforcement',
  description: 'Central hub for landlord eviction guides, organised by tenant problems, notices, court process, rent arrears, and possession enforcement.',
  alternates: { canonical },
  openGraph: {
    title: 'Eviction Guides Hub for Landlords',
    description: 'Browse all eviction and landlord problem guides in one crawl-friendly index.',
    url: canonical,
    type: 'website',
  },
};

export default function EvictionGuidesPage() {
  const itemList = EVICTION_CLUSTERS.flatMap((cluster) => [cluster.parent, ...cluster.pages]);

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper pagePath="/eviction-guides" pageTitle="Eviction Guides Hub" pageType="guide" jurisdiction="england" />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Eviction guides hub',
          description: 'Central index of eviction guidance pages for England landlords.',
          url: canonical,
        }}
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Landlord eviction guides',
          itemListElement: itemList.map((url, index) => ({ '@type': 'ListItem', position: index + 1, url: getCanonicalUrl(url) })),
        }}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction guides', url: canonical },
        ])}
      />

      <section className="py-14 bg-white border-b border-[#E6DBFF]">
        <Container>
          <div className="mx-auto max-w-6xl">
            <h1 className="text-4xl font-bold text-charcoal">Eviction guides hub</h1>
            <p className="mt-4 text-gray-700">Use this index to navigate tenant problems, eviction notices, court process, rent arrears, and possession enforcement guides.</p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-6xl space-y-8">

            <article className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-charcoal">Core Eviction Guides</h2>
              <p className="mt-2 text-gray-700">Start with these pillar pages for route-level coverage, then drill into the supporting cluster pages below.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {CORE_EVICTION_GUIDES.map((guide) => (
                  <Link key={guide.href} href={guide.href} className="rounded-xl border border-[#CDBBFF] bg-white p-4 text-primary font-medium hover:underline">
                    {guide.label}
                  </Link>
                ))}
              </div>
            </article>
            {EVICTION_CLUSTERS.map((cluster) => (
              <article key={cluster.key} className="rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-charcoal">{cluster.label}</h2>
                <p className="mt-2 text-gray-700">{cluster.description}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <Link href={cluster.parent} className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4 text-primary hover:underline">
                    Canonical cluster page: {cluster.parent}
                  </Link>
                  {cluster.pages.map((page) => (
                    <Link key={page} href={page} className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4 text-primary hover:underline">
                      {page}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
