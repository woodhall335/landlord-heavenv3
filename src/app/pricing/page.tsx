import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import { generateMetadata } from "@/lib/seo";
import { StructuredData, faqPageSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = generateMetadata({
  title: "Pricing - Compare All Products",
  description: "Compare Landlord Heaven pricing. Notices £39.99, Complete Eviction Pack £199.99, Money Claims £199.99, Tenancy Agreements £9.99-£14.99. All one-time payments.",
  path: "/pricing",
  keywords: [
    "landlord document pricing",
    "eviction notice cost",
    "tenancy agreement price",
    "landlord legal documents",
    "section 21 notice price",
    "complete eviction pack"
  ]
});

// FAQ data for structured data
const faqs = [
  {
    question: "Are there any hidden fees?",
    answer: "No. The prices shown are what you pay. No setup fees, no processing fees, no surprise charges. The only additional cost is court fees (paid directly to the court when filing)."
  },
  {
    question: "What is your refund policy?",
    answer: "All products are instantly delivered digital documents. Due to the instant nature of our digital products, we cannot offer refunds once documents have been generated and delivered. Refunds are only available for technical errors, duplicate charges, or unauthorized transactions."
  },
  {
    question: "Do you offer discounts for multiple documents?",
    answer: "For portfolio landlords needing multiple documents per month, contact sales@landlordheaven.co.uk for custom pricing and volume discounts."
  },
  {
    question: "How much do solicitors charge for the same services?",
    answer: "Typical solicitor fees: Eviction notice £200-300, Court claim preparation £300-500, Money claim £200-350, Tenancy agreement £150-400, HMO compliance consultation £500+ per year. You save £200-400 per case using Landlord Heaven."
  },
  {
    question: "Can I purchase additional products later?",
    answer: "Yes! You can purchase any product at any time. Each product is independent and addresses different landlord needs."
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for SEO */}
      <StructuredData data={faqPageSchema(faqs)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Transparent Pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              No hidden fees. No surprises. Choose the product that fits your needs.
            </p>
            <p className="text-sm text-gray-600">All prices are one-time payments</p>
          </div>
        </Container>
      </section>

      <Container size="large" className="py-12">

        {/* Comparison Table - Desktop */}
        <div className="hidden lg:block overflow-x-auto mb-12">
          <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-6 font-semibold text-charcoal">Feature</th>
                <th className="text-center p-6">
                  <div className="font-semibold text-charcoal mb-2">Notices</div>
                  <div className="text-2xl font-bold text-primary mb-1">£39.99</div>
                  <div className="text-sm text-gray-600">One-time</div>
                </th>
                <th className="text-center p-6">
                  <div className="font-semibold text-charcoal mb-2">Complete Pack</div>
                  <div className="text-2xl font-bold text-primary mb-1">£199.99</div>
                  <div className="text-sm text-gray-600">One-time</div>
                </th>
                <th className="text-center p-6">
                  <div className="font-semibold text-charcoal mb-2">Money Claims</div>
                  <div className="text-2xl font-bold text-primary mb-1">£199.99</div>
                  <div className="text-sm text-gray-600">One-time</div>
                </th>
                <th className="text-center p-6">
                  <div className="font-semibold text-charcoal mb-2">Standard AST</div>
                  <div className="text-2xl font-bold text-primary mb-1">£9.99</div>
                  <div className="text-sm text-gray-600">One-time</div>
                </th>
                <th className="text-center p-6">
                  <div className="font-semibold text-charcoal mb-2">Premium AST</div>
                  <div className="text-2xl font-bold text-primary mb-1">£14.99</div>
                  <div className="text-sm text-gray-600">One-time</div>
                </th>
                {/* HMO Pro column removed - parked for later review */}
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal bg-gray-50" colSpan={6}>
                  Eviction Documents
                </td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Section 8/21 Notice</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Court Possession Claim (N5/N5B)</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Witness Statement</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Money Claim for Arrears</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Rent Arrears Schedule</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
              </tr>

              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal bg-gray-50" colSpan={6}>
                  Tenancy Agreements
                </td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Assured Shorthold Tenancy (AST)</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Scotland PRT / NI Agreement</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">HMO Clauses & Guarantors</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Rent Increase Provisions</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
              </tr>

              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal bg-gray-50" colSpan={6}>
                  Support & Features
                </td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Smart Document Generation</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Full UK Coverage (Eng/Wales/Scot/NI)</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Instant Download</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Email Support</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Document Storage</td>
                <td className="text-center p-4">12+ months</td>
                <td className="text-center p-4">12+ months</td>
                <td className="text-center p-4">12+ months</td>
                <td className="text-center p-4">12+ months</td>
                <td className="text-center p-4">12+ months</td>
              </tr>

              <tr className="border-t bg-gray-100">
                <td className="p-6 font-semibold text-charcoal">Best For:</td>
                <td className="text-center p-6 text-xs text-gray-700">Simple eviction notices</td>
                <td className="text-center p-6 text-xs text-gray-700">Full eviction process</td>
                <td className="text-center p-6 text-xs text-gray-700">Rent arrears claims</td>
                <td className="text-center p-6 text-xs text-gray-700">Standard lettings</td>
                <td className="text-center p-6 text-xs text-gray-700">HMOs & complex</td>
              </tr>

              <tr className="border-t">
                <td className="p-6"></td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=notice_only&src=pricing&topic=eviction"
                    className="hero-btn-primary text-sm px-4 py-2"
                    aria-label="Start notice wizard"
                  >
                    Start Notice Wizard →
                  </Link>
                </td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=complete_pack&src=pricing&topic=eviction"
                    className="hero-btn-primary text-sm px-4 py-2"
                    aria-label="Start eviction pack wizard"
                  >
                    Start Eviction Pack Wizard →
                  </Link>
                </td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=money_claim&src=pricing&topic=arrears"
                    className="hero-btn-primary text-sm px-4 py-2"
                    aria-label="Start money claim wizard"
                  >
                    Start Money Claim Wizard →
                  </Link>
                </td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=ast_standard&src=pricing&topic=tenancy"
                    className="hero-btn-primary text-sm px-4 py-2"
                    aria-label="Create standard tenancy agreement"
                  >
                    Create Tenancy Agreement →
                  </Link>
                </td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=ast_premium&src=pricing&topic=tenancy"
                    className="hero-btn-primary text-sm px-4 py-2"
                    aria-label="Create premium tenancy agreement"
                  >
                    Create Tenancy Agreement →
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-6 mb-12">
          {/* Notices */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-2">Notices</h3>
            <div className="text-3xl font-bold text-primary mb-4">£39.99 <span className="text-sm text-gray-600">one-time</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ Section 8/21 Notice</li>
              <li>✅ Full UK Coverage</li>
              <li>✅ Instant Download</li>
              <li>✅ 12-Month Storage</li>
            </ul>
            <Link
              href="/wizard?product=notice_only&src=pricing&topic=eviction"
              className="hero-btn-primary block w-full text-center"
              aria-label="Start notice wizard"
            >
              Start Notice Wizard →
            </Link>
          </div>

          {/* Complete Eviction Pack */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-2">Complete Pack</h3>
            <div className="text-3xl font-bold text-primary mb-4">£199.99 <span className="text-sm text-gray-600">one-time</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ Section 8/21 Notice</li>
              <li>✅ Court Possession Claim</li>
              <li>✅ Witness Statement</li>
              <li>✅ Full Eviction Bundle</li>
            </ul>
            <Link
              href="/wizard?product=complete_pack&src=pricing&topic=eviction"
              className="hero-btn-primary block w-full text-center"
              aria-label="Start eviction pack wizard"
            >
              Start Eviction Pack Wizard →
            </Link>
          </div>

          {/* Money Claims */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-2">Money Claims</h3>
            <div className="text-3xl font-bold text-primary mb-4">£199.99 <span className="text-sm text-gray-600">one-time</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ Money Claim Forms</li>
              <li>✅ Arrears Schedule</li>
              <li>✅ Witness Statement</li>
              <li>✅ Enforcement Tools</li>
            </ul>
            <Link
              href="/wizard?product=money_claim&src=pricing&topic=arrears"
              className="hero-btn-primary block w-full text-center"
              aria-label="Start money claim wizard"
            >
              Start Money Claim Wizard →
            </Link>
          </div>

          {/* Standard AST */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-2">Standard AST</h3>
            <div className="text-3xl font-bold text-primary mb-4">£9.99 <span className="text-sm text-gray-600">one-time</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ AST/PRT/NI Agreement</li>
              <li>✅ Core Clauses</li>
              <li>✅ Full UK Coverage</li>
              <li>✅ 12+ Month Storage</li>
            </ul>
            <Link
              href="/wizard?product=ast_standard&src=pricing&topic=tenancy"
              className="hero-btn-primary block w-full text-center"
              aria-label="Create standard tenancy agreement"
            >
              Create Tenancy Agreement →
            </Link>
          </div>

          {/* Premium AST */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-2">Premium AST</h3>
            <div className="text-3xl font-bold text-primary mb-4">£14.99 <span className="text-sm text-gray-600">one-time</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ Everything in Standard</li>
              <li>✅ HMO Clauses</li>
              <li>✅ Guarantor Provisions</li>
              <li>✅ Rent Increases</li>
              <li>✅ Advanced Protection</li>
            </ul>
            <Link
              href="/wizard?product=ast_premium&src=pricing&topic=tenancy"
              className="hero-btn-primary block w-full text-center"
              aria-label="Create premium tenancy agreement"
            >
              Create Tenancy Agreement →
            </Link>
          </div>

          {/* HMO Pro removed - parked for later review */}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-charcoal mb-8 text-center">Pricing FAQs</h2>

          <div className="space-y-4">
            <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                Are there any hidden fees?
              </summary>
              <div className="px-6 pb-4 text-gray-700">
                <p>
                  No. The prices shown are what you pay. No setup fees, no processing fees, no surprise charges. The
                  only additional cost is court fees (paid directly to the court when filing).
                </p>
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                What is your refund policy?
              </summary>
              <div className="px-6 pb-4 text-gray-700">
                <p>
                  All products are instantly delivered digital documents. Due to the instant nature of our digital products, we cannot offer refunds once documents have been generated and delivered. Refunds are only available for technical errors, duplicate charges, or unauthorized transactions. HMO Pro offers a 7-day free trial - cancel before trial ends and pay nothing. See our{" "}
                  <Link href="/refunds" className="text-primary hover:underline">
                    full refund policy
                  </Link>{" "}
                  for details.
                </p>
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                Do you offer discounts for multiple documents?
              </summary>
              <div className="px-6 pb-4 text-gray-700">
                <p>
                  For portfolio landlords needing multiple documents per month, contact sales@landlordheaven.co.uk for custom
                  pricing and volume discounts.
                </p>
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                How much do solicitors charge for the same services?
              </summary>
              <div className="px-6 pb-4 text-gray-700">
                <p className="mb-2">Typical solicitor fees:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Eviction notice: £200-300</li>
                  <li>Court claim preparation: £300-500</li>
                  <li>Money claim: £200-350</li>
                  <li>Tenancy agreement: £150-400</li>
                  <li>HMO compliance consultation: £500+ per year</li>
                </ul>
                <p className="mt-2">
                  <strong>You save £200-400 per case</strong> using Landlord Heaven.
                </p>
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                Can I purchase additional products later?
              </summary>
              <div className="px-6 pb-4 text-gray-700">
                <p>
                  Yes! You can purchase any product at any time. Each product is independent and addresses different
                  landlord needs. If you need assistance choosing the right products, contact
                  support@landlordheaven.co.uk for guidance.
                </p>
              </div>
            </details>
          </div>
        </div>
      </Container>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Still Have Questions?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Not sure which product is right for you? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="hero-btn-primary"
              >
                Contact Us →
              </Link>
              <Link
                href="/help"
                className="hero-btn-secondary"
              >
                Browse FAQ →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">Quick response • Expert guidance • No obligation</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
