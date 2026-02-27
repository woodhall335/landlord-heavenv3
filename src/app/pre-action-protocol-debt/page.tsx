import { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { preActionProtocolFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Pre-Action Protocol for Debt Claims | Landlord Guide 2026',
  description:
    'Guide to the Pre-Action Protocol for Debt Claims. Required before money claims for rent arrears. Letter templates included.',
  keywords: [
    'pre action protocol debt',
    'pre action protocol rent arrears',
    'letter before claim',
    'pre action protocol landlord',
    'debt claim protocol',
    'money claim pre action',
  ],
  openGraph: {
    title: 'Pre-Action Protocol for Debt Claims | Landlord Heaven',
    description:
      'What landlords need to know about the Pre-Action Protocol before claiming rent arrears.',
    type: 'article',
    url: getCanonicalUrl('/pre-action-protocol-debt'),
  },
  alternates: {
    canonical: getCanonicalUrl('/pre-action-protocol-debt'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Pre-Action Protocol', url: '/pre-action-protocol-debt' },
];

export default function PreActionProtocolPage() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
                <UniversalHero
          badge="Landlord Guide"
          title="Pre-Action Protocol for Debt Claims"
          subtitle="Follow the correct pre-action debt process before issuing a county court claim."
          primaryCta={{ label: 'Start Debt Recovery Wizard', href: '/wizard?product=money_claim&topic=debt&src=seo_pre-action-protocol-debt' }}
          align="center"
          showTrustPositioningBar
        />

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>What is the Pre-Action Protocol?</h2>
                <p>
                  The Pre-Action Protocol for Debt Claims came into force on 1 October 2017. It
                  applies to any business (including landlords) claiming payment of a debt from an
                  individual.
                </p>
                <p>The protocol aims to:</p>
                <ul>
                  <li>Encourage early communication between parties</li>
                  <li>Help debtors understand what is being claimed and why</li>
                  <li>Enable debtors to seek advice before proceedings start</li>
                  <li>Promote settlement without going to court</li>
                </ul>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                  <p className="text-amber-800 font-semibold mb-2">Important</p>
                  <p className="text-amber-700 text-sm">
                    Failure to comply with the protocol can result in the court awarding costs
                    against you, even if you win your claim. Always follow the protocol properly.
                  </p>
                </div>

                <h2>Steps in the Pre-Action Protocol</h2>

                <h3>Step 1: Letter Before Claim</h3>
                <p>You must send a Letter Before Claim that includes:</p>
                <ul>
                  <li>The amount of the debt</li>
                  <li>How the debt arose (e.g., unpaid rent from tenancy at [address])</li>
                  <li>Whether interest and charges are being claimed</li>
                  <li>Details of how the debt can be paid</li>
                  <li>Information about free debt advice services</li>
                  <li>A Reply Form for the debtor to complete</li>
                  <li>An Information Sheet explaining their options</li>
                </ul>

                <h3>Step 2: Wait 30 Days</h3>
                <p>
                  After sending the Letter Before Claim, you must wait at least 30 days before
                  starting court proceedings. This gives the debtor time to:
                </p>
                <ul>
                  <li>Seek debt advice</li>
                  <li>Pay the debt</li>
                  <li>Propose a payment plan</li>
                  <li>Dispute the debt</li>
                </ul>

                <h3>Step 3: Consider the Response</h3>
                <p>If the debtor responds within 30 days:</p>
                <ul>
                  <li>
                    <strong>They pay in full:</strong> Claim resolved
                  </li>
                  <li>
                    <strong>They propose payments:</strong> Consider accepting if reasonable
                  </li>
                  <li>
                    <strong>They dispute the debt:</strong> Review their objections before proceeding
                  </li>
                  <li>
                    <strong>They request more information:</strong> Provide what&apos;s reasonably requested
                  </li>
                </ul>

                <h3>Step 4: Start Court Proceedings (if needed)</h3>
                <p>
                  If the debtor doesn&apos;t respond, doesn&apos;t pay, and doesn&apos;t make reasonable proposals,
                  you can start court proceedings using{' '}
                  <Link href="/money-claim-online-mcol">Money Claim Online (MCOL)</Link>.
                </p>

                <h2>What Must the Letter Before Claim Include?</h2>
                <p>The Letter Before Claim must contain:</p>
                <ol>
                  <li>Your name and address</li>
                  <li>The debtor&apos;s name and address</li>
                  <li>The total amount claimed</li>
                  <li>How the debt arose (brief summary)</li>
                  <li>Whether interest is being claimed (and how calculated)</li>
                  <li>Any charges being added</li>
                  <li>How payment can be made</li>
                  <li>A deadline of at least 30 days to respond</li>
                </ol>

                <h2>Enclosures with the Letter</h2>
                <p>You must include with your Letter Before Claim:</p>
                <ul>
                  <li>
                    <strong>Reply Form:</strong> A form the debtor can use to respond
                  </li>
                  <li>
                    <strong>Information Sheet:</strong> Explains their options and where to get advice
                  </li>
                  <li>
                    <strong>Financial Statement:</strong> Form to complete if requesting a payment plan
                  </li>
                </ul>

                <h2>Timeline Summary</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left">Day</th>
                        <th className="border border-gray-200 p-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 p-3">Day 0</td>
                        <td className="border border-gray-200 p-3">Send Letter Before Claim</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3">Days 1-30</td>
                        <td className="border border-gray-200 p-3">Wait for response</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3">Day 30+</td>
                        <td className="border border-gray-200 p-3">
                          Consider response (if any) and decide whether to proceed
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3">Day 31+</td>
                        <td className="border border-gray-200 p-3">
                          Start court proceedings if appropriate
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
          showTrustPositioningBar
                faqs={preActionProtocolFAQs}
                title="Pre-Action Protocol FAQ"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Start Your Money Claim?
              </h2>
              <p className="text-gray-600 mb-6">
                Our Money Claim Pack includes pre-action letters with all required enclosures.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/products/money-claim" className="hero-btn-primary">
                  Get Money Claim Pack
                </Link>
                <Link href="/tools/rent-arrears-calculator" className="hero-btn-secondary">
                  Calculate Arrears First
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
