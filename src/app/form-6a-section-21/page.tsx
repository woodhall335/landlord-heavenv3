import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { form6aFAQs } from '@/data/faqs';
import { FunnelCta } from '@/components/funnels';

export const metadata: Metadata = {
  title: 'Form 6A Section 21 Notice | Official Template + Guide',
  description:
    'Form 6A Section 21 notice guide for England landlords. Download the official template, avoid invalid service mistakes, and generate a pre-filled notice fast.',
  keywords: [
    'form 6a',
    'form 6a section 21',
    'section 21 form 6a',
    'form 6a download',
    'form 6a template',
    'section 21 notice form',
    'prescribed form 6a',
  ],
  openGraph: {
    title: 'Form 6A Section 21 Notice | Landlord Heaven',
    description:
      'Everything you need to know about Form 6A - the official Section 21 eviction notice for England.',
    type: 'article',
    url: getCanonicalUrl('/form-6a-section-21'),
  },
  alternates: {
    canonical: getCanonicalUrl('/form-6a-section-21'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Tools', url: '/tools' },
  { name: 'Form 6A Section 21', url: '/form-6a-section-21' },
];

export default function Form6APage() {
  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">England Only</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Form 6A Section 21 Notice Template (England)
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Need a Form 6A Section 21 notice? Form 6A is the prescribed notice for no-fault possession in England, and small errors can invalidate your notice. This page shows what to include, how to set dates correctly, and when to use a compliance-checked Notice Only service.
              </p>
            </div>
          </Container>
        </section>

        <Container>
          <div className="-mt-8 mb-10">
            <FunnelCta
              title="Get a compliant Form 6A drafted and served"
              subtitle="Start with Notice Only now, and move to full possession support if the tenant stays."
              primaryHref="/products/notice-only"
              primaryText="Start Notice Only"
              primaryDataCta="notice-only"
              location="above-fold"
              secondaryLinks={[{ href: '/products/complete-pack', text: 'Need full eviction support?', dataCta: 'complete-pack' }]}
            />
          </div>
        </Container>

        {/* Quick Actions */}
        <Container>
          <div className="grid md:grid-cols-2 gap-6 -mt-8 mb-12">
            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Generate Pre-Filled Form 6A</h2>
              <p className="text-gray-600 mb-4">
                Answer a few questions and get a correctly completed Form 6A ready to serve.
              </p>
              <Link
                href="/tools/free-section-21-notice-generator"
                className="hero-btn-primary inline-block"
              >
                Generate Free Notice
              </Link>
            </div>

            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Get Full Notice Pack</h2>
              <p className="text-gray-600 mb-4">
                Form 6A plus compliance checklist, service instructions, and validity checks.
              </p>
              <Link href="/products/notice-only" className="hero-btn-secondary inline-block">
                View Notice Pack
              </Link>
            </div>
          </div>
        </Container>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="prose prose-slate max-w-none">
                <h2>What is Form 6A?</h2>
                <p>
                  Form 6A is the prescribed notice form under Section 21 of the Housing Act 1988 (as
                  amended by the Deregulation Act 2015). It replaced the older "Section 21(1)(b)"
                  and "Section 21(4)(a)" notices from 1 October 2015.
                </p>
                <p>
                  You must use Form 6A (or a form "substantially to the same effect") for all
                  assured shorthold tenancies in England where you want to regain possession without
                  proving fault.
                </p>

                <p className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  Once your dates and compliance documents are confirmed, you can move from a free template to a
                  <Link href="/products/notice-only" className="text-primary hover:underline"> court-ready Notice Only pack</Link>
                  that prepares service evidence and next-step guidance.
                </p>

                <h2>When Can You Use Form 6A?</h2>
                <ul>
                  <li>The tenancy is an assured shorthold tenancy (AST)</li>
                  <li>
                    The property is in <strong>England</strong> (Wales has different forms)
                  </li>
                  <li>At least 4 months have passed since the tenancy began</li>
                  <li>You have protected the deposit and served prescribed information</li>
                  <li>
                    You have provided the EPC, Gas Safety Certificate, and <Link href="/how-to-rent-guide" className="text-primary hover:underline">How to Rent guide</Link>
                  </li>
                  <li>No relevant improvement notice or emergency remedial action is in effect</li>
                </ul>

                <h2>How to Complete Form 6A</h2>
                <p>Form 6A requires the following information:</p>
                <ol>
                  <li>
                    <strong>Section 1:</strong> Tenant name(s)
                  </li>
                  <li>
                    <strong>Section 2:</strong> The date you require possession (minimum 2 months
                    from service)
                  </li>
                  <li>
                    <strong>Section 3:</strong> Property address
                  </li>
                  <li>
                    <strong>Section 4:</strong> Landlord name, address, and signature
                  </li>
                </ol>

                <h2>Notice Period Requirements</h2>
                <p>
                  The notice must give at least <strong>2 months&apos; notice</strong>. The expiry
                  date must be:
                </p>
                <ul>
                  <li>At least 2 months from the date of service</li>
                  <li>On or after the end of any fixed term</li>
                  <li>
                    On or after the last day of a period of the tenancy (for periodic tenancies)
                  </li>
                </ul>

                <h2>Common Form 6A Mistakes</h2>
                <ul>
                  <li>Using the wrong form (Welsh form, old format, or unofficial template)</li>
                  <li>Giving less than 2 months&apos; notice</li>
                  <li>Not aligning the expiry date with the tenancy period</li>
                  <li>Serving before complying with deposit protection requirements</li>
                  <li>Not providing the How to Rent guide before serving</li>
                </ul>

                <div className="my-8">
                  <FunnelCta
                    title="Need the next step ready as well?"
                    subtitle="If your notice expires and the tenant does not leave, you will need possession action."
                    primaryHref="/products/complete-pack"
                    primaryText="Get full eviction support"
                    primaryDataCta="complete-pack"
                    location="mid"
                    secondaryLinks={[
                      { href: '/section-21-expired-what-next', text: 'Read next steps after expiry' },
                      { href: '/products/notice-only', text: 'Start with Notice Only', dataCta: 'notice-only' },
                    ]}
                  />
                </div>

                <h2>Form 6A vs Form 3 (Section 8)</h2>
                <p>
                  Form 6A is for <Link href="/no-fault-eviction" className="text-primary hover:underline">no-fault evictions</Link> where you don&apos;t need to
                  prove the tenant did anything wrong. <Link href="/form-3-section-8" className="text-primary hover:underline">Form 3</Link> (Section 8) is for{' '}
                  <strong>fault-based</strong> evictions like rent arrears or breach of tenancy.
                </p>
                <p>
                  <Link href="/section-21-vs-section-8" className="text-primary hover:underline">
                    Compare Section 21 vs Section 8
                  </Link>
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-12">
              <FAQSection
                faqs={form6aFAQs}
                title="Form 6A Frequently Asked Questions"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Create Your Form 6A?
              </h2>
              <p className="text-gray-600 mb-6">
                Generate a correctly completed Section 21 notice in minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/tools/free-section-21-notice-generator" className="hero-btn-primary">
                  Free Generator
                </Link>
                <Link href="/products/complete-pack" className="hero-btn-secondary" data-cta="complete-pack" data-cta-location="bottom">
                  Need full eviction support?
                </Link>
              </div>
            </div>
          </div>
        </Container>

        {/* Bottom padding */}
        <div className="py-12" />
      </div>
    </>
  );
}
