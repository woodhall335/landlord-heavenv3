import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { EVICTION_CLUSTERS } from '@/lib/seo/eviction-authority';
import { getCanonicalUrl } from '@/lib/seo';
import { currentEnglandFrameworkLinks } from '@/lib/seo/internal-links';

const canonical = getCanonicalUrl('/eviction-guides');

const CORE_EVICTION_GUIDES = [
  { href: '/how-to-evict-tenant', label: 'How to Evict a Tenant UK' },
  { href: '/tenant-not-paying-rent', label: 'Tenant Not Paying Rent UK' },
  { href: '/eviction-process-uk', label: 'Eviction Process UK' },
  { href: '/section-8-notice', label: 'Section 8 Notice Guide' },
  { href: '/section-21-ban-uk', label: 'Section 21 Ban UK Guide' },
  { href: '/section-21-notice', label: 'Section 21 Notice Transition Guide' },
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
  { href: '/section-21-ban-uk', label: 'Section 21 Ban UK Guide' },
  { href: '/section-21-notice', label: 'Section 21 Notice Transition Guide' },
  { href: '/section-8-notice', label: 'Section 8 Notice Guide' },
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
  { href: '/products/notice-only', label: 'Eviction Notice Pack' },
  { href: '/products/complete-pack', label: 'Complete Eviction Pack' },
  { href: '/tools/rent-arrears-calculator', label: 'Rent Arrears Calculator' },
  { href: '/tools/free-rent-demand-letter', label: 'Free Rent Demand Letter Tool' },
  { href: '/ask-heaven', label: 'Ask Heaven' },
];

export const metadata: Metadata = {
  title: 'Eviction Guides for Landlords | Notices, Court Process, Arrears and Enforcement',
  description: 'Browse landlord eviction guides organised by tenant problems, notices, court process, rent arrears, and possession enforcement.',
  alternates: { canonical },
  openGraph: {
    title: 'Eviction Guides for Landlords',
    description: 'Browse eviction and landlord problem guides in one clear index.',
    url: canonical,
    type: 'website',
  },
};

export default function EvictionGuidesPage() {
  const itemList = EVICTION_CLUSTERS.flatMap((cluster) => [cluster.parent, ...cluster.pages]);

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper pagePath="/eviction-guides" pageTitle="Eviction Guides" pageType="guide" jurisdiction="england" />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Eviction guides for landlords',
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
            <h1 className="text-4xl font-bold text-charcoal">Eviction guides for landlords</h1>
            <p className="mt-4 max-w-4xl text-gray-700">
              Use this guide index to navigate tenant problems, eviction notices, court process, rent arrears, and possession enforcement pages.
              Start with <Link href="/how-to-evict-tenant" className="text-primary hover:underline">how to evict a tenant legally</Link>, follow the <Link href="/eviction-process-uk" className="text-primary hover:underline">eviction process in the UK</Link>, and use the <Link href="/section-21-ban-uk" className="text-primary hover:underline">Section 21 ending in 2026 transition guide</Link> for the England post-ban route.
            </p>
            <p className="mt-4 max-w-4xl text-gray-700">
              If the property is in England and you need the live post-1 May 2026 route, start with the current England eviction framework below. That bundle is the main authority path for the current rules, Section 8, Form 3A, landlord action steps, and the England possession timeline.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white pb-10">
        <Container>
          <SeoPageContextPanel
            pathname="/eviction-guides"
            className="mx-auto max-w-6xl border border-[#CAB6FF] bg-[#F8F4FF]"
          />
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-6xl space-y-8">
            <article className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-charcoal">
                Current England eviction after 1 May 2026
              </h2>
              <p className="mt-2 text-gray-700">
                Use these five England owner pages when the landlord needs the live framework, not a legacy Section 21 explanation or a generic UK summary.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentEnglandFrameworkLinks.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="rounded-xl border border-[#CDBBFF] bg-white p-4 hover:bg-[#fcfaff]"
                  >
                    <p className="font-semibold text-primary">{guide.title}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{guide.description}</p>
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#CAB6FF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-charcoal">Core Eviction Guides</h2>
              <p className="mt-2 text-gray-700">Start with these main guides for route-level coverage, then drill into the supporting pages below.</p>
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
              <p className="mt-2 text-gray-700">Use landlord tools and live commercial routes to move from research into action without dead-end validators or free-generator pages.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {TOOLS.map((guide) => (
                  <Link key={guide.href} href={guide.href} className="rounded-xl border border-[#CDBBFF] bg-white p-4 text-primary font-medium hover:underline">
                    {guide.label}
                  </Link>
                ))}
              </div>
            </article>

            {EVICTION_CLUSTERS.filter((cluster) => cluster.key !== 'current-england-framework').map((cluster) => (
              <article key={cluster.key} className="rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-charcoal">{cluster.label}</h2>
                <p className="mt-2 text-gray-700">{cluster.description}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <Link href={cluster.parent} className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-4 text-primary hover:underline">
                    Main guide: {cluster.parent}
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
