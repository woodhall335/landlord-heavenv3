import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'Rolling Tenancy Agreement UK | Month-to-Month Guide 2026',
  description:
    'Complete guide to rolling tenancy agreements (periodic tenancies) in the UK. Learn how they work, notice periods, rent increases, and how to end a rolling tenancy.',
  keywords: [
    'rolling tenancy agreement',
    'rolling contract tenancy',
    'month to month tenancy UK',
    'periodic tenancy agreement',
    'rolling tenancy notice period',
    'rolling tenancy eviction',
  ],
  openGraph: {
    title: 'Rolling Tenancy Agreement UK | Landlord Heaven',
    description:
      'Everything landlords need to know about rolling (periodic) tenancies in the UK.',
    type: 'article',
    url: getCanonicalUrl('/rolling-tenancy-agreement'),
  },
  alternates: {
    canonical: getCanonicalUrl('/rolling-tenancy-agreement'),
  },
};

const faqs = [
  {
    question: 'What is a rolling tenancy?',
    answer:
      'A rolling tenancy (also called a periodic tenancy) runs on a month-to-month or week-to-week basis with no fixed end date. It usually arises automatically when a fixed-term tenancy expires and the tenant stays on.',
  },
  {
    question: 'How much notice do I need to give to end a rolling tenancy?',
    answer:
      'For Section 21 (no-fault), you need to give at least 2 months notice, expiring on the last day of a tenancy period. For tenant-given notice, they typically need to give one month (or one rental period).',
  },
  {
    question: 'Can I increase rent during a rolling tenancy?',
    answer:
      'Yes. You can increase rent using a Section 13 notice, which requires at least one month\'s notice for monthly tenancies. Alternatively, if the tenant agrees in writing, you can increase rent by mutual agreement.',
  },
  {
    question: 'Is a rolling tenancy the same as a periodic tenancy?',
    answer:
      'Yes, the terms are used interchangeably. A "rolling" or "periodic" tenancy is one that continues from period to period (usually month-to-month) without a fixed end date.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Rolling Tenancy Agreement', url: '/rolling-tenancy-agreement' },
];

export default function RollingTenancyPage() {
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
                <span className="text-sm font-semibold text-primary">Landlord Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Rolling Tenancy Agreement UK
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A rolling tenancy (periodic tenancy) continues month-to-month without a fixed end
                date. Learn how they work and how to manage them effectively.
              </p>
            </div>
          </Container>
        </section>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>What is a Rolling Tenancy?</h2>
                <p>
                  A rolling tenancy (also called a periodic tenancy) is one that runs continuously
                  from one rental period to the next, without a fixed end date. In the UK, most
                  rolling tenancies are:
                </p>
                <ul>
                  <li>
                    <strong>Monthly periodic:</strong> Continuing month-to-month
                  </li>
                  <li>
                    <strong>Weekly periodic:</strong> Continuing week-to-week
                  </li>
                </ul>

                <h2>How Does a Tenancy Become Rolling?</h2>
                <p>A tenancy typically becomes periodic in one of two ways:</p>
                <ol>
                  <li>
                    <strong>Statutory periodic:</strong> When a fixed-term AST expires and the tenant
                    stays on without signing a new agreement, it automatically becomes a statutory
                    periodic tenancy under the Housing Act 1988.
                  </li>
                  <li>
                    <strong>Contractual periodic:</strong> The original tenancy agreement was set up
                    as periodic from the start (no fixed term).
                  </li>
                </ol>

                <h2>Rolling Tenancy vs Fixed Term</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left">Aspect</th>
                        <th className="border border-gray-200 p-3 text-left">Fixed Term</th>
                        <th className="border border-gray-200 p-3 text-left">Rolling/Periodic</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 p-3">Duration</td>
                        <td className="border border-gray-200 p-3">Set end date (e.g., 12 months)</td>
                        <td className="border border-gray-200 p-3">No end date, continues indefinitely</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3">Landlord can end</td>
                        <td className="border border-gray-200 p-3">At end of fixed term (with Section 21)</td>
                        <td className="border border-gray-200 p-3">Any time (with proper notice)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3">Tenant can end</td>
                        <td className="border border-gray-200 p-3">Usually cannot end early</td>
                        <td className="border border-gray-200 p-3">With one rental period notice</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3">Rent increases</td>
                        <td className="border border-gray-200 p-3">Only if agreement allows</td>
                        <td className="border border-gray-200 p-3">Section 13 notice or agreement</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2>Ending a Rolling Tenancy</h2>
                <h3>As a Landlord (Section 21)</h3>
                <p>To end a rolling tenancy using Section 21:</p>
                <ul>
                  <li>Give at least 2 months&apos; notice using Form 6A</li>
                  <li>The notice must expire on the last day of a tenancy period</li>
                  <li>Ensure all compliance requirements are met (deposit, EPC, gas cert, How to Rent)</li>
                </ul>

                <h3>Tenant-Initiated Ending</h3>
                <p>
                  Tenants can usually end a periodic tenancy by giving notice equal to one rental
                  period (one month for monthly tenancies), ending on the last day of a period.
                </p>

                <h2>Advantages and Disadvantages</h2>
                <h3>For Landlords</h3>
                <p><strong>Advantages:</strong></p>
                <ul>
                  <li>Flexibility to end the tenancy with proper notice</li>
                  <li>No need to renew paperwork each year</li>
                  <li>Can increase rent using Section 13</li>
                </ul>
                <p><strong>Disadvantages:</strong></p>
                <ul>
                  <li>Less certainty - tenant can leave with short notice</li>
                  <li>May have void periods if tenant leaves unexpectedly</li>
                </ul>

                <h3>For Tenants</h3>
                <p><strong>Advantages:</strong></p>
                <ul>
                  <li>Flexibility to move with reasonable notice</li>
                  <li>No locked-in period</li>
                </ul>
                <p><strong>Disadvantages:</strong></p>
                <ul>
                  <li>Landlord can serve notice at any time</li>
                  <li>Less security than a fixed term</li>
                </ul>
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
                Need to End a Rolling Tenancy?
              </h2>
              <p className="text-gray-600 mb-6">
                Generate a valid Section 21 notice for your periodic tenancy.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/tools/free-section-21-notice-generator" className="hero-btn-primary">
                  Generate Section 21 Notice
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
