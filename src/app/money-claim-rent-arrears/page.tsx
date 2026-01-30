import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { rentArrearsClaimFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Claim Rent Arrears from Tenant | Money Claim Guide 2026',
  description:
    'How to claim rent arrears from a tenant in England. Step-by-step guide to recovering unpaid rent through the County Court using MCOL. Pre-action protocol, court fees, and enforcement options.',
  keywords: [
    'claim rent arrears from tenant',
    'money claim rent arrears',
    'recover unpaid rent',
    'tenant owes rent',
    'landlord money claim',
    'MCOL rent arrears',
    'county court rent claim',
    'sue tenant for rent',
    'rent arrears recovery',
    'unpaid rent claim',
  ],
  openGraph: {
    title: 'Claim Rent Arrears from Tenant | Landlord Heaven',
    description:
      'Complete guide to claiming rent arrears from a tenant through the County Court. Pre-action protocol, MCOL process, and enforcement.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-rent-arrears'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-rent-arrears'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Claim Rent Arrears from Tenant', url: '/money-claim-rent-arrears' },
];

export default function MoneyClaimRentArrearsPage() {
  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">Rent Recovery</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Claim Rent Arrears from Your Tenant
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A step-by-step guide for landlords in England to recover unpaid rent through the
                County Court. From pre-action letters to enforcement.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/products/money-claim" className="hero-btn-primary">
                  Get Money Claim Pack
                </Link>
                <Link href="/tools/rent-arrears-calculator" className="hero-btn-secondary">
                  Calculate Arrears
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
                <h2>How to Claim Rent Arrears from a Tenant</h2>
                <p>
                  When a tenant fails to pay rent, you have the legal right to recover the money
                  owed through the County Court. This process is called a <strong>money claim</strong> and
                  is separate from eviction proceedings.
                </p>
                <p>
                  In England, you can use <Link href="/mcol-money-claim-online" className="text-primary hover:underline">Money Claim Online (MCOL)</Link> to
                  claim up to £100,000 in unpaid rent, damages, and other debts.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                  <p className="text-blue-800 font-semibold mb-2">Key Point</p>
                  <p className="text-blue-700 text-sm">
                    You can pursue a money claim even if the tenant is still living in the property.
                    You do not need to evict them first. However, you must follow the pre-action protocol.
                  </p>
                </div>

                <h2>Step 1: Calculate the Total Arrears</h2>
                <p>Before starting your claim, calculate exactly how much is owed:</p>
                <ul>
                  <li><strong>Rent arrears:</strong> Each missed or partial payment</li>
                  <li><strong>Interest:</strong> 8% statutory interest from when each payment was due</li>
                  <li><strong>Court fees:</strong> These will be added to your claim</li>
                </ul>
                <p>
                  Create a clear <Link href="/schedule-of-debt-guide" className="text-primary hover:underline">schedule of debt</Link> showing
                  each payment date, amount due, payments received, and running balance.
                </p>

                <h2>Step 2: Send a Letter Before Claim</h2>
                <p>
                  The <Link href="/money-claim-letter-before-action" className="text-primary hover:underline">Pre-Action Protocol for Debt Claims</Link> requires
                  you to send a formal letter before starting court action. This letter must:
                </p>
                <ul>
                  <li>State the total amount owed and how it was calculated</li>
                  <li>Give a breakdown of the debt (rent periods, amounts)</li>
                  <li>Explain any interest being claimed</li>
                  <li>Give at least 30 days to respond</li>
                  <li>Include a reply form for the tenant to propose payment</li>
                  <li>Warn that court action will follow if not paid</li>
                </ul>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                  <p className="text-amber-800 font-semibold mb-2">Warning</p>
                  <p className="text-amber-700 text-sm">
                    Skipping the Letter Before Claim can result in the court penalising you on costs,
                    even if you win. Always follow the pre-action protocol properly.
                  </p>
                </div>

                <h2>Step 3: Submit Your Claim (MCOL or Form N1)</h2>
                <p>After 30 days with no acceptable response, you can issue court proceedings:</p>

                <h3>Option A: Money Claim Online (MCOL)</h3>
                <ul>
                  <li>Best for claims up to £100,000</li>
                  <li>Lower court fees than paper claims</li>
                  <li>Track progress online</li>
                  <li>Faster processing</li>
                </ul>

                <h3>Option B: Paper Claim (Form N1)</h3>
                <ul>
                  <li>Required for claims over £100,000</li>
                  <li>Submit to County Court Money Claims Centre</li>
                  <li>Same legal process, but slower</li>
                </ul>

                <h2>Step 4: Wait for Defendant Response</h2>
                <p>After the court serves your claim, the tenant (defendant) has:</p>
                <ul>
                  <li><strong>14 days</strong> to respond to the claim</li>
                  <li><strong>28 days</strong> if they acknowledge but need more time</li>
                </ul>
                <p>The tenant can:</p>
                <ul>
                  <li><strong>Admit the claim:</strong> Accept they owe the money</li>
                  <li><strong>Defend:</strong> Dispute part or all of the claim</li>
                  <li><strong>Ignore:</strong> Not respond at all</li>
                </ul>

                <h2>Step 5: Obtain Judgment</h2>
                <p>If the tenant does not respond or admits the claim, you can request:</p>
                <ul>
                  <li>
                    <strong>Default Judgment:</strong> If no response after 14 days
                  </li>
                  <li>
                    <strong>Judgment on Admission:</strong> If they admit owing the money
                  </li>
                </ul>
                <p>
                  This gives you a <strong>County Court Judgment (CCJ)</strong> confirming the debt.
                  The CCJ will appear on the tenant&apos;s credit file for 6 years.
                </p>

                <h2>Step 6: Enforce the Judgment</h2>
                <p>
                  If the tenant still does not pay after you have a CCJ, you can use enforcement methods:
                </p>
                <ul>
                  <li>
                    <strong>Attachment of Earnings:</strong> Deducted from their wages
                  </li>
                  <li>
                    <strong>Warrant of Control:</strong> Bailiffs seize goods
                  </li>
                  <li>
                    <strong>Third Party Debt Order:</strong> Freeze their bank account
                  </li>
                  <li>
                    <strong>Charging Order:</strong> Secure the debt against property they own
                  </li>
                </ul>

                <h2>Court Fees for Rent Arrears Claims</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Claim Amount</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Court Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Up to £300</td>
                      <td className="border border-gray-300 px-4 py-2">£35</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£300.01 to £500</td>
                      <td className="border border-gray-300 px-4 py-2">£50</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£500.01 to £1,000</td>
                      <td className="border border-gray-300 px-4 py-2">£70</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£1,000.01 to £1,500</td>
                      <td className="border border-gray-300 px-4 py-2">£105</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£1,500.01 to £3,000</td>
                      <td className="border border-gray-300 px-4 py-2">£115</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£3,000.01 to £5,000</td>
                      <td className="border border-gray-300 px-4 py-2">£205</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£5,000.01 to £10,000</td>
                      <td className="border border-gray-300 px-4 py-2">£455</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Over £10,000</td>
                      <td className="border border-gray-300 px-4 py-2">5% of claim value</td>
                    </tr>
                  </tbody>
                </table>

                <h2>Can I Claim Rent Arrears and Evict at the Same Time?</h2>
                <p>
                  Yes, but they are separate court processes. The <Link href="/section-8-notice-template" className="text-primary hover:underline">Section 8 eviction</Link> (or
                  Section 21) is for possession of the property. The money claim is for recovering
                  the debt.
                </p>
                <p>
                  You can pursue both simultaneously. Many landlords issue the money claim after
                  the tenant has left, once the final arrears amount is known.
                </p>

                <h2>Time Limit for Claiming Rent Arrears</h2>
                <p>
                  You have <strong>6 years</strong> from when each rent payment was due to make a claim.
                  After 6 years, the debt becomes &quot;statute-barred&quot; and you cannot enforce it
                  through the courts.
                </p>

                <h2>What Documents Do I Need?</h2>
                <ul>
                  <li>Copy of the tenancy agreement</li>
                  <li>Schedule of arrears showing each missed payment</li>
                  <li>Bank statements showing payments received</li>
                  <li>Copy of the Letter Before Claim and proof of sending</li>
                  <li>Any correspondence with the tenant about the debt</li>
                </ul>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
                faqs={rentArrearsClaimFAQs}
                title="Rent Arrears Claim FAQ"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Claim Your Rent Arrears?
              </h2>
              <p className="text-gray-600 mb-6">
                Our Money Claim Pack includes all the documents you need: Letter Before Claim,
                schedule of arrears, interest calculations, and step-by-step filing guidance.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/products/money-claim" className="hero-btn-primary">
                  Get Money Claim Pack
                </Link>
                <Link href="/mcol-money-claim-online" className="hero-btn-secondary">
                  Learn About MCOL
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
