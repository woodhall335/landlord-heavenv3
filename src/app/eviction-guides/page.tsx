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
  { href: '/eviction-notice-england', label: 'Eviction Notice England' },
  { href: '/eviction-process-england', label: 'Eviction Process England' },
  { href: '/section-21-vs-section-8', label: 'Section 21 vs Section 8' },
  { href: '/how-long-does-eviction-take', label: 'How Long Does Eviction Take' },
];

const LANDLORD_PROBLEMS = [
  { href: '/tenant-not-paying-rent', label: 'Tenant Not Paying Rent' },
  { href: '/tenant-refusing-access', label: 'Tenant Refusing Access' },
  { href: '/tenant-anti-social-behaviour', label: 'Tenant Anti-Social Behaviour' },
  { href: '/tenant-damaging-property', label: 'Tenant Damaging Property' },
  { href: '/tenant-refuses-to-leave-after-notice', label: 'Tenant Refuses to Leave After Notice' },
];

const NOTICE_GUIDES = [
  { href: '/section-21-notice-guide', label: 'Section 21 Notice Guide' },
  { href: '/section-8-notice-guide', label: 'Section 8 Notice Guide' },
  { href: '/eviction-notice-template', label: 'Eviction Notice Template' },
  { href: '/serve-section-21-notice', label: 'How to Serve Section 21 Notice' },
  { href: '/serve-section-8-notice', label: 'How to Serve Section 8 Notice' },
];

const COURT_PROCESS = [
  { href: '/eviction-court-forms-england', label: 'Eviction Court Forms England' },
  { href: '/n5b-possession-claim-form', label: 'N5B Possession Claim Form' },
  { href: '/possession-order-process', label: 'Possession Order Process' },
  { href: '/warrant-of-possession-guide', label: 'Warrant of Possession Guide' },
  { href: '/court-bailiff-eviction-guide', label: 'Court Bailiff Eviction Guide' },
];

const TOOLS = [
  { href: '/tools/free-section-21-notice-generator', label: 'Free Section 21 Notice Generator' },
  { href: '/tools/free-section-8-notice-generator', label: 'Free Section 8 Notice Generator' },
  { href: '/tools/rent-arrears-calculator', label: 'Rent Arrears Calculator' },
  { href: '/tools/free-rent-demand-letter', label: 'Free Rent Demand Letter Tool' },
  { href: '/tools/validators/section-21', label: 'Section 21 Validity Checker' },
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

            <article className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-charcoal">Landlord problems</h2>
              <p className="mt-2 text-gray-700">Find focused problem pages for common dispute triggers before they escalate into court delay.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {LANDLORD_PROBLEMS.map((guide) => (
                  <Link key={guide.href} href={guide.href} className="rounded-xl border border-[#CDBBFF] bg-white p-4 text-primary font-medium hover:underline">
                    {guide.label}
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-charcoal">Notice guides</h2>
              <p className="mt-2 text-gray-700">Choose the right notice workflow and service method with practical route-specific guidance.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {NOTICE_GUIDES.map((guide) => (
                  <Link key={guide.href} href={guide.href} className="rounded-xl border border-[#CDBBFF] bg-white p-4 text-primary font-medium hover:underline">
                    {guide.label}
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-charcoal">Court process</h2>
              <p className="mt-2 text-gray-700">Move from valid notice to claim, order, and enforcement using the key court-stage pages.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {COURT_PROCESS.map((guide) => (
                  <Link key={guide.href} href={guide.href} className="rounded-xl border border-[#CDBBFF] bg-white p-4 text-primary font-medium hover:underline">
                    {guide.label}
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-charcoal">Tools</h2>
              <p className="mt-2 text-gray-700">Use free landlord tools to reduce drafting errors and improve notice-to-court continuity.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {TOOLS.map((guide) => (
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
