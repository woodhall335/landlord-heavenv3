import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { noFaultEvictionFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'No Fault Eviction (England) | Section 21 Guide for Landlords [2026]',
  description:
    'Guide to no-fault evictions using Section 21 in England. Requirements, notice periods, and how to serve a valid notice.',
  keywords: [
    'no fault eviction',
    'no fault eviction UK',
    'section 21 no fault',
    'no fault eviction notice',
    'evict tenant without reason',
    'section 21 notice',
    'no grounds eviction',
  ],
  openGraph: {
    title: 'No Fault Eviction (England) | Section 21 Guide',
    description:
      'Everything landlords need to know about no-fault evictions using Section 21 in England.',
    type: 'article',
    url: getCanonicalUrl('/no-fault-eviction'),
  },
  alternates: {
    canonical: getCanonicalUrl('/no-fault-eviction'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'No Fault Eviction', url: '/no-fault-eviction' },
];

const wizardHref = '/wizard?product=notice_only&src=seo_no-fault-eviction&topic=eviction';

export default function NoFaultEvictionPage() {
  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        <HeaderConfig mode="autoOnScroll" />
        <UniversalHero
          title="No-Fault Eviction (England): Section 21 Guide"
          subtitle="Check Section 21 eligibility, notice timing, and service steps before moving to possession proceedings."
          primaryCta={{ label: 'Start Section 21 Wizard', href: wizardHref }}
          secondaryCta={{ label: 'Section 21 requirements', href: '#requirements' }}
          showTrustPositioningBar
          hideMedia
        />

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>What is a No-Fault Eviction?</h2>
                <p>
                  A no-fault eviction (also called a &quot;no-grounds eviction&quot;) allows a landlord to
                  end an assured shorthold tenancy without needing to prove the tenant has done
                  anything wrong. You don&apos;t need to give a reason - you simply want your property
                  back.
                </p>
                <p>
                  In England, no-fault evictions are carried out using a <strong>Section 21 notice</strong>{' '}
                  under the Housing Act 1988. The prescribed form is <Link href="/form-6a-section-21">Form 6A</Link>.
                </p>

                <h2 id="requirements">Requirements for a Valid No-Fault Eviction</h2>
                <p>Before serving a Section 21 notice, you must have:</p>
                <ul>
                  <li>Protected the tenant&apos;s deposit in a government-approved scheme</li>
                  <li>Provided the deposit prescribed information within 30 days</li>
                  <li>Given the tenant the current &quot;How to Rent&quot; guide</li>
                  <li>Provided a valid Gas Safety Certificate (if applicable)</li>
                  <li>Provided a valid Energy Performance Certificate (EPC)</li>
                  <li>Waited at least 4 months from the start of the tenancy</li>
                </ul>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                  <p className="text-amber-800 font-semibold mb-2">
                    Renters’ Rights Act update
                  </p>
                  <p className="text-amber-700 text-sm">
                    No-fault evictions (Section 21) end from 1 May 2026 in England.
                  </p>
                  <p className="text-amber-700 text-sm mt-2">
                    Official source:{' '}
                    <Link href="https://www.gov.uk/government/news/section-21-no-fault-evictions-to-end-on-1-may-2026" className="underline">GOV.UK</Link>
                  </p>
                </div>

                <h2>How to Serve a No-Fault Eviction Notice</h2>
                <ol>
                  <li>
                    <strong>Check eligibility:</strong> Ensure you&apos;ve met all the requirements above
                  </li>
                  <li>
                    <strong>Complete Form 6A:</strong> Use the official prescribed form for England
                  </li>
                  <li>
                    <strong>Calculate the notice period:</strong> Minimum 2 months from service date
                  </li>
                  <li>
                    <strong>Serve the notice:</strong> By first class post, recorded delivery, or hand
                    delivery with a witness
                  </li>
                  <li>
                    <strong>Keep proof:</strong> Retain evidence of service (posting receipt, delivery
                    confirmation, or witness statement)
                  </li>
                </ol>

                <h2>What Happens After Serving Notice?</h2>
                <p>
                  After the 2-month notice period expires:
                </p>
                <ul>
                  <li>If the tenant leaves, you can take possession</li>
                  <li>
                    If the tenant doesn&apos;t leave, you must apply to court for a possession order using
                    Form N5B (accelerated procedure)
                  </li>
                  <li>The court will grant possession if the notice was valid</li>
                  <li>If the tenant still doesn&apos;t leave, you&apos;ll need to request a bailiff warrant</li>
                </ul>

                <h2>No-Fault vs Fault-Based Eviction</h2>
                <p>
                  If your tenant has rent arrears or breached the tenancy, you might prefer a{' '}
                  <strong>Section 8</strong> (fault-based) eviction. This can sometimes be faster,
                  especially for serious rent arrears.
                </p>
                <p>
                  <Link href="/section-21-vs-section-8">
                    Compare Section 21 vs Section 8
                  </Link>
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
          showTrustPositioningBar
                faqs={noFaultEvictionFAQs}
                title="No-Fault Eviction FAQ"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Start Your No-Fault Eviction?
              </h2>
              <p className="text-gray-600 mb-6">
                Generate a valid Section 21 notice in minutes with our free tool.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/tools/free-section-21-notice-generator" className="hero-btn-primary">
                  Free Section 21 Generator
                </Link>
                <Link href="/products/notice-only" className="hero-btn-secondary">
                  Full Notice Pack
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
