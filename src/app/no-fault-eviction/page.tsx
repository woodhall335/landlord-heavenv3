import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'No Fault Eviction UK | Section 21 Guide for Landlords [2026]',
  description:
    'Complete guide to no-fault evictions in the UK using Section 21. Learn the requirements, notice periods, and how to serve a valid notice. Includes free Section 21 generator.',
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
    title: 'No Fault Eviction UK | Section 21 Guide',
    description:
      'Everything landlords need to know about no-fault evictions using Section 21 in England.',
    type: 'article',
    url: getCanonicalUrl('/no-fault-eviction'),
  },
  alternates: {
    canonical: getCanonicalUrl('/no-fault-eviction'),
  },
};

const faqs = [
  {
    question: 'What is a no-fault eviction?',
    answer:
      'A no-fault eviction allows a landlord to regain possession of their property without proving the tenant has done anything wrong. In England, this is done using a Section 21 notice. You don\'t need to give a reason for wanting the property back.',
  },
  {
    question: 'Is no-fault eviction being banned?',
    answer:
      'The UK government has proposed abolishing Section 21 no-fault evictions through the Renters Reform Bill. However, as of 2026, Section 21 remains in effect. Check our blog for the latest updates on this legislation.',
  },
  {
    question: 'How much notice must I give for a no-fault eviction?',
    answer:
      'In England, you must give at least 2 months\' notice using Form 6A. The notice cannot expire before the end of any fixed term, and for periodic tenancies, it should align with the tenancy period.',
  },
  {
    question: 'Can I use a no-fault eviction if the tenant has rent arrears?',
    answer:
      'Yes, you can use Section 21 even if the tenant owes rent. However, if arrears are significant (2+ months), you might prefer Section 8 Ground 8, which can be faster if the tenant doesn\'t pay by the court date.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'No Fault Eviction', url: '/no-fault-eviction' },
];

export default function NoFaultEvictionPage() {
  return (
    <>
      <StructuredData data={faqPageSchema(faqs)} />
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
                No Fault Eviction UK: Section 21 Guide
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A no-fault eviction lets you regain possession of your property without proving the
                tenant has breached the tenancy. In England, this is done using a Section 21 notice.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/tools/free-section-21-notice-generator" className="hero-btn-primary">
                  Generate Section 21 Notice
                </Link>
                <Link href="/products/notice-only" className="hero-btn-secondary">
                  Get Full Notice Pack
                </Link>
              </div>
            </div>
          </Container>
        </section>

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

                <h2>Requirements for a Valid No-Fault Eviction</h2>
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
                    Renters Reform Bill Warning
                  </p>
                  <p className="text-amber-700 text-sm">
                    The government has proposed abolishing Section 21 no-fault evictions. While
                    Section 21 remains valid as of 2026, landlords should stay informed about
                    upcoming changes.
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
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
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
