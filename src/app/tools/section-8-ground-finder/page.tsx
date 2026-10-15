import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { Container } from '@/components/ui/Container';
import { Section8GroundFinder } from '@/components/tools/section8/Section8GroundFinder';

const canonical = 'https://landlordheaven.co.uk/tools/section-8-ground-finder';

export const metadata: Metadata = {
  title: 'Which Section 8 Ground Applies? Free Landlord Finder',
  description:
    'Use the free Section 8 ground finder to identify the possession grounds worth investigating, then review the evidence, timing and Form 3A route.',
  alternates: { canonical },
  openGraph: {
    title: 'Which Section 8 Ground Applies? Free Landlord Finder',
    description:
      'Choose the factual reason for possession and find the Section 8 grounds and evidence guides worth investigating.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'website',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FCFAFF]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Landlord tools', url: 'https://landlordheaven.co.uk/tools' },
          { name: 'Section 8 ground finder', url: canonical },
        ])}
      />
      <UniversalHero
        title="Which Section 8 ground should you investigate?"
        subtitle="Start with the facts. This free tool points you towards the relevant ground guides and evidence questions before you prepare Form 3A."
        primaryCta={{ label: 'Start the ground finder', href: '#ground-finder' }}
        secondaryCta={{ label: 'Read all Section 8 grounds', href: '/section-8-grounds-explained' }}
        mediaSrc="/images/wizard-icons/09-court.png"
        mediaAlt="Section 8 possession grounds guide"
        showReviewPill
        showTrustPositioningBar
      />
      <main>
        <section id="ground-finder" className="scroll-mt-24 py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <Section8GroundFinder />
            </div>
          </Container>
        </section>
        <section className="border-y border-[#E6DBFF] bg-white py-10">
          <Container>
            <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
              {[
                ['Check the facts', 'Identify the actual reason for possession rather than choosing a ground from its number alone.'],
                ['Match the evidence', 'Keep the tenancy, ledger, correspondence, photographs or incident records that support the ground.'],
                ['Check dates and service', 'Use the date calculator and preserve proof of how and when Form 3A was served.'],
              ].map(([title, body]) => (
                <article key={title} className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <h2 className="font-semibold text-[#2a2161]">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{body}</p>
                </article>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-5xl text-center text-sm text-gray-600">
              Need help with timing?{' '}
              <Link href="/tools/section-8-notice-date-calculator" className="font-semibold text-primary hover:underline">
                Check the Section 8 notice dates
              </Link>
              .
            </p>
          </Container>
        </section>
      </main>
    </div>
  );
}
