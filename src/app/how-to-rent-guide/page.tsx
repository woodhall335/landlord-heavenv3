import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { howToRentGuideFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'How to Rent Guide | Landlord Requirements UK 2026',
  description:
    'Guide to the How to Rent checklist for landlords. When to provide it, which version to use. Essential for valid Section 21 notices.',
  keywords: [
    'how to rent guide',
    'how to rent checklist',
    'how to rent landlord',
    'how to rent guide 2026',
    'how to rent section 21',
    'prescribed information tenants',
  ],
  openGraph: {
    title: 'How to Rent Guide | Landlord Heaven',
    description:
      'Landlord guide to the How to Rent checklist - required for valid Section 21 notices.',
    type: 'article',
    url: getCanonicalUrl('/how-to-rent-guide'),
  },
  alternates: {
    canonical: getCanonicalUrl('/how-to-rent-guide'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'How to Rent Guide', url: '/how-to-rent-guide' },
];

export default function HowToRentGuidePage() {
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
                How to Rent Guide: Landlord Requirements
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                The How to Rent guide is a government document you must give to tenants in England.
                Failure to provide it blocks your ability to serve a valid Section 21 notice.
              </p>
            </div>
          </Container>
        </section>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>What is the How to Rent Guide?</h2>
                <p>
                  The &quot;How to Rent: the checklist for renting in England&quot; is a government-published
                  document that explains:
                </p>
                <ul>
                  <li>What tenants should look for before renting</li>
                  <li>What to expect during the tenancy</li>
                  <li>Tenant rights and responsibilities</li>
                  <li>What happens at the end of a tenancy</li>
                  <li>Where to get help if things go wrong</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                  <p className="text-blue-800 font-semibold mb-2">Download Latest Version</p>
                  <p className="text-blue-700 text-sm">
                    Always check gov.uk for the current version of the How to Rent guide. The
                    government updates it periodically.
                  </p>
                </div>

                <h2>Why Does It Matter for Landlords?</h2>
                <p>
                  The How to Rent guide is one of the &quot;prescribed requirements&quot; for Section 21
                  notices under the Deregulation Act 2015. If you don&apos;t provide it:
                </p>
                <ul>
                  <li>
                    <strong>You cannot serve a valid Section 21 notice</strong> until you have
                    provided it
                  </li>
                  <li>
                    Any Section 21 notice served before providing the guide is <strong>invalid</strong>
                  </li>
                  <li>
                    You will not be able to use the accelerated possession procedure
                  </li>
                </ul>

                <h2>When to Provide It</h2>
                <p>
                  You must provide the How to Rent guide to tenants at the start of a new assured
                  shorthold tenancy. Best practice:
                </p>
                <ol>
                  <li>
                    <strong>New tenancies:</strong> Provide before or on the day the tenancy starts
                  </li>
                  <li>
                    <strong>Renewals (same tenant):</strong> Only required if a new version has been
                    published since you last provided it
                  </li>
                  <li>
                    <strong>New tenants in existing properties:</strong> Always provide to new tenants
                  </li>
                </ol>

                <h2>How to Provide It</h2>
                <p>You can provide the How to Rent guide by:</p>
                <ul>
                  <li>
                    <strong>Email:</strong> Send as a PDF attachment or link to the gov.uk page
                  </li>
                  <li>
                    <strong>Hard copy:</strong> Print and hand to the tenant
                  </li>
                  <li>
                    <strong>Post:</strong> Send by post before the tenancy starts
                  </li>
                </ul>

                <h2>Proving You Provided It</h2>
                <p>
                  Keep evidence that you provided the guide. If you go to court, you may need to
                  prove this. Options include:
                </p>
                <ul>
                  <li>Email with delivery/read receipt</li>
                  <li>Signed acknowledgment from the tenant</li>
                  <li>Clause in tenancy agreement confirming receipt</li>
                  <li>Text message confirmation</li>
                </ul>

                <h2>Other Prescribed Requirements</h2>
                <p>
                  The How to Rent guide is just one of the requirements for a valid Section 21. You
                  must also:
                </p>
                <ul>
                  <li>Protect the deposit in a government-approved scheme</li>
                  <li>Serve the deposit prescribed information within 30 days</li>
                  <li>Provide a valid Gas Safety Certificate</li>
                  <li>Provide a valid Energy Performance Certificate (EPC)</li>
                </ul>
                <p>
                  <Link href="/tools/validators/section-21">
                    Check your Section 21 compliance with our validator
                  </Link>
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
                faqs={howToRentGuideFAQs}
                title="How to Rent Guide FAQ"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Serve Section 21?
              </h2>
              <p className="text-gray-600 mb-6">
                Make sure you&apos;ve provided the How to Rent guide, then generate your notice.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/tools/free-section-21-notice-generator" className="hero-btn-primary">
                  Generate Section 21 Notice
                </Link>
                <Link href="/tools/validators/section-21" className="hero-btn-secondary">
                  Check Compliance
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
