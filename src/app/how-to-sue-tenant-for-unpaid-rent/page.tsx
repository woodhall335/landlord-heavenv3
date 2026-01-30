import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { sueTenantUnpaidRentFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'How to Sue a Tenant for Unpaid Rent | Landlord Guide 2026',
  description:
    'Step-by-step guide to suing a tenant for unpaid rent in England. Learn the County Court process, pre-action requirements, court fees, and how to enforce a judgment.',
  keywords: [
    'how to sue tenant for unpaid rent',
    'sue tenant for rent arrears',
    'take tenant to court for rent',
    'landlord sue tenant',
    'court action for unpaid rent',
    'recover rent from tenant',
    'tenant owes rent what can I do',
    'small claims court tenant',
    'money claim against tenant',
    'CCJ for rent arrears',
  ],
  openGraph: {
    title: 'How to Sue a Tenant for Unpaid Rent | Landlord Heaven',
    description:
      'Complete guide to taking a tenant to court for unpaid rent. Pre-action protocol, court process, and enforcement.',
    type: 'article',
    url: getCanonicalUrl('/how-to-sue-tenant-for-unpaid-rent'),
  },
  alternates: {
    canonical: getCanonicalUrl('/how-to-sue-tenant-for-unpaid-rent'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'How to Sue Tenant for Unpaid Rent', url: '/how-to-sue-tenant-for-unpaid-rent' },
];

export default function SueTenantUnpaidRentPage() {
  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">Legal Action</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                How to Sue a Tenant for Unpaid Rent
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A practical guide for landlords in England who need to take legal action to recover
                rent arrears from a current or former tenant.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/products/money-claim" className="hero-btn-primary">
                  Get Money Claim Pack
                </Link>
                <Link href="/tools/rent-arrears-calculator" className="hero-btn-secondary">
                  Calculate What You&apos;re Owed
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
                <h2>Can You Sue a Tenant for Unpaid Rent?</h2>
                <p>
                  Yes. If a tenant owes you rent, you have the legal right to pursue a <strong>money claim</strong> through
                  the County Court. This applies whether the tenant is still living in the property or has already left.
                </p>
                <p>
                  The formal legal term is a &quot;money claim&quot; rather than &quot;suing,&quot; but the result is the same:
                  a court order (County Court Judgment) confirming the tenant owes you money, which you can then enforce.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                  <p className="text-blue-800 font-semibold mb-2">Good to Know</p>
                  <p className="text-blue-700 text-sm">
                    Most tenants do not defend money claims for rent arrears. If they ignore your claim,
                    you can obtain a default judgment without a court hearing.
                  </p>
                </div>

                <h2>Before You Sue: Pre-Action Protocol</h2>
                <p>
                  Courts require you to follow the <strong>Pre-Action Protocol for Debt Claims</strong> before
                  issuing proceedings. If you skip this step, the court may penalise you on costs.
                </p>

                <h3>What the Protocol Requires</h3>
                <ol>
                  <li>
                    <strong>Send a Letter Before Claim</strong> to the tenant with:
                    <ul>
                      <li>The total amount owed</li>
                      <li>A breakdown of how the debt arose</li>
                      <li>Details of any interest claimed</li>
                      <li>A deadline of at least 30 days to respond</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Include required forms:</strong> Reply form and financial statement
                  </li>
                  <li>
                    <strong>Wait 30 days</strong> for a response before starting court action
                  </li>
                  <li>
                    <strong>Consider any response:</strong> If they propose reasonable payments, you should consider accepting
                  </li>
                </ol>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                  <p className="text-amber-800 font-semibold mb-2">Important</p>
                  <p className="text-amber-700 text-sm">
                    The Letter Before Claim is legally required. Skipping it can result in the judge
                    awarding costs against you, even if you win the case. Our <Link href="/products/money-claim" className="text-amber-800 hover:underline">Money Claim Pack</Link> includes
                    a compliant Letter Before Claim.
                  </p>
                </div>

                <h2>Step-by-Step: How to Sue Your Tenant</h2>

                <h3>Step 1: Calculate What You&apos;re Owed</h3>
                <p>Add up:</p>
                <ul>
                  <li><strong>Rent arrears:</strong> Each missed or partial rent payment</li>
                  <li><strong>Interest:</strong> You can claim 8% statutory interest from when each payment was due</li>
                  <li><strong>Other debts:</strong> Unpaid utilities, damage beyond wear and tear (if applicable)</li>
                </ul>

                <h3>Step 2: Send the Letter Before Claim</h3>
                <p>
                  Post the letter to the tenant&apos;s last known address. Keep proof of posting.
                  If emailing, also send by post. Wait 30 days.
                </p>

                <h3>Step 3: Start Court Proceedings</h3>
                <p>If the tenant does not pay or respond adequately:</p>
                <ul>
                  <li>
                    <strong>Online:</strong> Use <Link href="/mcol-money-claim-online" className="text-primary hover:underline">Money Claim Online (MCOL)</Link> for
                    claims up to £100,000
                  </li>
                  <li>
                    <strong>Paper:</strong> Complete Form N1 and submit to the court
                  </li>
                </ul>
                <p>Pay the court fee (see table below). The fee is added to your claim.</p>

                <h3>Step 4: Court Serves the Claim</h3>
                <p>
                  The court sends the claim to the tenant, who has 14 days to respond (or 28 days
                  if they acknowledge but need more time).
                </p>

                <h3>Step 5: Obtain Judgment</h3>
                <p>If the tenant:</p>
                <ul>
                  <li><strong>Ignores the claim:</strong> Request default judgment (automatic win)</li>
                  <li><strong>Admits the debt:</strong> Request judgment on admission</li>
                  <li><strong>Defends:</strong> The case may go to a hearing</li>
                </ul>
                <p>
                  A <strong>County Court Judgment (CCJ)</strong> is a court order confirming the debt.
                  It stays on their credit file for 6 years.
                </p>

                <h3>Step 6: Enforce the Judgment</h3>
                <p>If the tenant still does not pay:</p>
                <ul>
                  <li><strong>Attachment of Earnings:</strong> Taken from their wages</li>
                  <li><strong>Bailiffs (Warrant of Control):</strong> Seize and sell goods</li>
                  <li><strong>Third Party Debt Order:</strong> Freeze their bank account</li>
                  <li><strong>Charging Order:</strong> Secure debt against their property</li>
                </ul>

                <h2>How Much Does It Cost to Sue a Tenant?</h2>

                <h3>Court Fees</h3>
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
                      <td className="border border-gray-300 px-4 py-2">£300.01 - £500</td>
                      <td className="border border-gray-300 px-4 py-2">£50</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£500.01 - £1,000</td>
                      <td className="border border-gray-300 px-4 py-2">£70</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£1,000.01 - £1,500</td>
                      <td className="border border-gray-300 px-4 py-2">£105</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£1,500.01 - £3,000</td>
                      <td className="border border-gray-300 px-4 py-2">£115</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£3,000.01 - £5,000</td>
                      <td className="border border-gray-300 px-4 py-2">£205</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">£5,000.01 - £10,000</td>
                      <td className="border border-gray-300 px-4 py-2">£455</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Over £10,000</td>
                      <td className="border border-gray-300 px-4 py-2">5% of claim</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm text-gray-600 mt-2">
                  Court fees are added to your claim - if you win, the tenant pays them.
                </p>

                <h3>Enforcement Fees (if needed)</h3>
                <ul>
                  <li>Attachment of Earnings: £110</li>
                  <li>Warrant of Control: £77-£110</li>
                  <li>Third Party Debt Order: £110</li>
                  <li>Charging Order: £110</li>
                </ul>

                <h2>How Long Does It Take?</h2>
                <ul>
                  <li><strong>Pre-action:</strong> 30+ days (required waiting period)</li>
                  <li><strong>Default judgment:</strong> 14-21 days if tenant does not respond</li>
                  <li><strong>Defended case:</strong> 2-6 months for hearing</li>
                  <li><strong>Enforcement:</strong> Varies (weeks to months)</li>
                </ul>

                <h2>What If the Tenant Has No Money?</h2>
                <p>
                  A CCJ is still valuable even if the tenant cannot pay immediately:
                </p>
                <ul>
                  <li>It lasts 6 years and can be enforced when their situation improves</li>
                  <li>It damages their credit rating, affecting their ability to rent elsewhere</li>
                  <li>A charging order secures the debt against any property they buy</li>
                  <li>Attachment of earnings captures future wages</li>
                </ul>

                <h2>Suing a Tenant Who Has Left</h2>
                <p>
                  You can sue a former tenant for rent arrears up to 6 years after the debt arose.
                  You need their current address to serve the claim. If unknown, you can:
                </p>
                <ul>
                  <li>Use a tracing agent to find them</li>
                  <li>Apply to court to serve by alternative means</li>
                  <li>Serve at their last known address</li>
                </ul>

                <h2>Can I Sue and Evict at the Same Time?</h2>
                <p>
                  Yes. The money claim (for rent owed) and possession claim (for eviction) are
                  separate court processes. You can pursue both simultaneously or one after the other.
                </p>
                <p>
                  Many landlords wait until after eviction to issue the money claim, as the final
                  arrears amount is then known.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
                faqs={sueTenantUnpaidRentFAQs}
                title="Frequently Asked Questions"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Recover Your Money?
              </h2>
              <p className="text-gray-600 mb-6">
                Our Money Claim Pack includes the Letter Before Claim, schedule of arrears, interest
                calculations, and step-by-step guidance for MCOL or paper filing.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/products/money-claim" className="hero-btn-primary">
                  Get Money Claim Pack
                </Link>
                <Link href="/money-claim-rent-arrears" className="hero-btn-secondary">
                  Rent Arrears Claim Guide
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
