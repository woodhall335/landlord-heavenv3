import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'EICR Landlord Requirements UK | Electrical Safety Guide 2026',
  description:
    'Complete guide to EICR (Electrical Installation Condition Report) requirements for UK landlords. Learn about the 5-year rule, tenant notification, and penalties for non-compliance.',
  keywords: [
    'EICR landlord',
    'EICR requirements',
    'electrical safety landlord',
    'EICR certificate rental',
    'electrical safety regulations landlords',
    'EICR every 5 years',
  ],
  openGraph: {
    title: 'EICR Landlord Requirements UK | Landlord Heaven',
    description:
      'What landlords need to know about EICR electrical safety certificates.',
    type: 'article',
    url: getCanonicalUrl('/eicr-landlord-requirements'),
  },
  alternates: {
    canonical: getCanonicalUrl('/eicr-landlord-requirements'),
  },
};

const faqs = [
  {
    question: 'What is an EICR?',
    answer:
      'An EICR (Electrical Installation Condition Report) is an inspection of a property\'s electrical installations by a qualified electrician. It checks wiring, sockets, consumer units, and other fixed electrical parts for safety.',
  },
  {
    question: 'How often do landlords need an EICR?',
    answer:
      'Landlords must have an EICR at least every 5 years, or more frequently if the previous report recommends it. New tenancies also require a valid EICR before the tenant moves in.',
  },
  {
    question: 'What happens if I don\'t have an EICR?',
    answer:
      'Local authorities can issue fines of up to £30,000 for non-compliance. They can also arrange for an inspection themselves and recover costs from you, plus require urgent remedial work.',
  },
  {
    question: 'Do I need to give the EICR to tenants?',
    answer:
      'Yes. You must provide a copy of the EICR to existing tenants within 28 days of the inspection. For new tenants, provide it before they move in. Keep proof of providing it.',
  },
  {
    question: 'What if the EICR shows problems?',
    answer:
      'You must complete any remedial work required by the report within 28 days (or the timescale specified in the report if shorter). Then get written confirmation from a qualified electrician that the work is done.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'EICR Landlord Requirements', url: '/eicr-landlord-requirements' },
];

export default function EICRPage() {
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
                <span className="text-sm font-semibold text-primary">Safety Compliance</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                EICR Landlord Requirements UK
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                The Electrical Safety Standards regulations require landlords in England to have
                electrical installations inspected every 5 years. Non-compliance can result in
                fines up to £30,000.
              </p>
            </div>
          </Container>
        </section>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>What is an EICR?</h2>
                <p>
                  An EICR (Electrical Installation Condition Report) is a detailed inspection of a
                  property&apos;s fixed electrical installations. This includes:
                </p>
                <ul>
                  <li>Wiring and cables</li>
                  <li>Sockets and switches</li>
                  <li>Consumer unit (fuse box)</li>
                  <li>Light fittings (fixed, not lamps)</li>
                  <li>Electric showers and cookers</li>
                </ul>
                <p>
                  The inspection must be carried out by a qualified and competent person - typically
                  a registered electrician.
                </p>

                <h2>Legal Requirements</h2>
                <p>
                  The Electrical Safety Standards in the Private Rented Sector (England) Regulations
                  2020 require landlords to:
                </p>
                <ol>
                  <li>
                    Have electrical installations inspected <strong>at least every 5 years</strong>
                  </li>
                  <li>
                    Provide a copy of the EICR to <strong>existing tenants within 28 days</strong> of
                    the inspection
                  </li>
                  <li>
                    Provide a copy to <strong>new tenants before they move in</strong>
                  </li>
                  <li>
                    Provide a copy to the <strong>local authority within 7 days</strong> if requested
                  </li>
                  <li>
                    Keep copies for prospective tenants to view
                  </li>
                </ol>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-6">
                  <p className="text-red-800 font-semibold mb-2">Penalty Warning</p>
                  <p className="text-red-700 text-sm">
                    Failure to comply can result in fines of up to £30,000. Local authorities can
                    also arrange their own inspections and charge you for the cost.
                  </p>
                </div>

                <h2>What Does the EICR Check?</h2>
                <p>The electrician will inspect for:</p>
                <ul>
                  <li>Damage, deterioration, or defects</li>
                  <li>Dangerous conditions</li>
                  <li>Non-compliance with current wiring regulations</li>
                  <li>Earthing and bonding adequacy</li>
                  <li>RCD (residual current device) protection</li>
                </ul>

                <h2>Understanding EICR Results</h2>
                <p>The EICR will include condition codes:</p>
                <ul>
                  <li>
                    <strong>C1 - Danger present:</strong> Risk of injury. Requires immediate action.
                  </li>
                  <li>
                    <strong>C2 - Potentially dangerous:</strong> Requires urgent remedial action.
                  </li>
                  <li>
                    <strong>C3 - Improvement recommended:</strong> Not immediately dangerous but
                    could be improved. Not mandatory.
                  </li>
                  <li>
                    <strong>FI - Further investigation:</strong> More investigation needed to
                    determine condition.
                  </li>
                </ul>
                <p>
                  For C1 and C2 findings, you must complete remedial work within 28 days (or sooner
                  if specified) and obtain written confirmation.
                </p>

                <h2>What If Remedial Work is Needed?</h2>
                <ol>
                  <li>
                    Complete the work within 28 days (or the timescale in the report if shorter)
                  </li>
                  <li>
                    Obtain written confirmation from a qualified electrician that the work is done
                  </li>
                  <li>
                    Provide a copy of the confirmation to tenants within 28 days
                  </li>
                  <li>
                    Provide to the local authority within 28 days if they requested the original
                    report
                  </li>
                </ol>

                <h2>Who Can Do an EICR?</h2>
                <p>
                  The inspection must be done by a &quot;qualified and competent person.&quot; This typically
                  means an electrician who is:
                </p>
                <ul>
                  <li>Registered with a competent person scheme (e.g., NICEIC, NAPIT, ELECSA)</li>
                  <li>Qualified to at least City & Guilds 2391 or equivalent</li>
                </ul>

                <h2>How Much Does an EICR Cost?</h2>
                <p>
                  EICR costs vary by property size and location. Typical prices:
                </p>
                <ul>
                  <li>1-2 bedroom flat: £100-£150</li>
                  <li>3-bedroom house: £150-£250</li>
                  <li>Larger properties: £200-£350+</li>
                </ul>
                <p>
                  Shop around, but prioritise using a properly qualified electrician over the
                  cheapest option.
                </p>

                <h2>Does EICR Affect Section 21?</h2>
                <p>
                  Yes. As of April 2021, you cannot serve a valid Section 21 notice unless you have
                  complied with the EICR requirements. This means:
                </p>
                <ul>
                  <li>Having a valid EICR (within 5 years)</li>
                  <li>Having provided a copy to the tenant</li>
                  <li>Having completed any required remedial work</li>
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
                Ready to Serve Section 21?
              </h2>
              <p className="text-gray-600 mb-6">
                Make sure you&apos;ve got your EICR sorted, then generate your notice.
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
