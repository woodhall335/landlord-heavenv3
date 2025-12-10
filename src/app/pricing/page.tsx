import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import { generateMetadata } from "@/lib/seo";

export const metadata: Metadata = generateMetadata({
  title: "Pricing - Compare All Products",
  description: "Compare Landlord Heaven pricing. Notices £29.99, Money Claims £179.99, Tenancy Agreements £39.99-£59.00, HMO Pro £19.99-£34.99/month.",
  path: "/pricing",
  keywords: [
    "landlord document pricing",
    "eviction notice cost",
    "tenancy agreement price",
    "landlord legal documents",
    "section 21 notice price",
    "HMO compliance cost"
  ]
});

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 py-16 md:py-24">
        <Container size="large">
          <div className="text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Transparent Pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No hidden fees. No surprises. Choose the product that fits your needs. All prices are one-time payments
              except HMO Pro.
            </p>
          </div>
        </Container>
      </section>

      <Container size="large" className="py-12">

        {/* Comparison Table - Desktop */}
        <div className="hidden lg:block overflow-x-auto mb-12">
          <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-6 font-semibold text-charcoal w-1/4">Feature</th>
                <th className="text-center p-6 w-1/6">
                  <div className="font-semibold text-charcoal mb-2">Notices</div>
                  <div className="text-3xl font-bold text-primary mb-1">£29.99</div>
                  <div className="text-sm text-gray-600">One-time</div>
                </th>
                <th className="text-center p-6 w-1/6">
                  <div className="font-semibold text-charcoal mb-2">Money Claims</div>
                  <div className="text-3xl font-bold text-primary mb-1">£179.99</div>
                  <div className="text-sm text-gray-600">One-time</div>
                </th>
                <th className="text-center p-6 w-1/6">
                  <div className="font-semibold text-charcoal mb-2">Standard AST</div>
                  <div className="text-3xl font-bold text-primary mb-1">£39.99</div>
                  <div className="text-sm text-gray-600">One-time</div>
                </th>
                <th className="text-center p-6 w-1/6">
                  <div className="font-semibold text-charcoal mb-2">Premium AST</div>
                  <div className="text-3xl font-bold text-primary mb-1">£59.00</div>
                  <div className="text-sm text-gray-600">One-time</div>
                </th>
                <th className="text-center p-6 w-1/6">
                  <div className="font-semibold text-charcoal mb-2">HMO Pro</div>
                  <div className="text-3xl font-bold text-primary mb-1">£19.99-£34.99</div>
                  <div className="text-sm text-gray-600">/month</div>
                </th>
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
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Court Possession Claim (N5/N5B)</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Witness Statement</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Money Claim for Arrears</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Rent Arrears Schedule</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
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
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Scotland PRT / NI Agreement</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">HMO Clauses & Guarantors</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Rent Increase Provisions</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
                <td className="text-center p-4">❌</td>
              </tr>

              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal bg-gray-50" colSpan={6}>
                  HMO Compliance
                </td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">License Expiry Tracking</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Fire Safety Reminders</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 text-gray-700">Gas/EICR Certificate Tracking</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">✅</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-4 text-gray-700">Tiered Pricing (1-20+ properties)</td>
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
                <td className="text-center p-4">❌</td>
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
                <td className="text-center p-4">7-day trial</td>
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
                <td className="text-center p-4">12 months</td>
                <td className="text-center p-4">12 months</td>
                <td className="text-center p-4">Lifetime</td>
                <td className="text-center p-4">Lifetime</td>
                <td className="text-center p-4">While active</td>
              </tr>

              <tr className="border-t bg-gray-100">
                <td className="p-6 font-semibold text-charcoal">Best For:</td>
                <td className="text-center p-6 text-xs text-gray-700">Simple eviction notices</td>
                <td className="text-center p-6 text-xs text-gray-700">Rent arrears claims</td>
                <td className="text-center p-6 text-xs text-gray-700">Standard lettings</td>
                <td className="text-center p-6 text-xs text-gray-700">HMOs & complex</td>
                <td className="text-center p-6 text-xs text-gray-700">Multi-HMO landlords</td>
              </tr>

              <tr className="border-t">
                <td className="p-6"></td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=notice_only"
                    className="inline-block bg-gray-200 text-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Get Started
                  </Link>
                </td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=money_claim"
                    className="inline-block bg-gray-200 text-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Get Started
                  </Link>
                </td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=ast_standard"
                    className="inline-block bg-gray-200 text-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Get Started
                  </Link>
                </td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=ast_premium"
                    className="inline-block bg-gray-200 text-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Get Started
                  </Link>
                </td>
                <td className="text-center p-6">
                  <Link
                    href="/wizard?product=hmo_pro"
                    className="inline-block bg-gray-200 text-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Free Trial
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
            <div className="text-3xl font-bold text-primary mb-4">£29.99 <span className="text-sm text-gray-600">one-time</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ Section 8/21 Notice</li>
              <li>✅ Full UK Coverage</li>
              <li>✅ Instant Download</li>
              <li>✅ 12-Month Storage</li>
            </ul>
            <Link
              href="/wizard?product=notice_only"
              className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Money Claims */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-2">Money Claims</h3>
            <div className="text-3xl font-bold text-primary mb-4">£179.99 <span className="text-sm text-gray-600">one-time</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ Money Claim Forms</li>
              <li>✅ Arrears Schedule</li>
              <li>✅ Witness Statement</li>
              <li>✅ Enforcement Tools</li>
            </ul>
            <Link
              href="/wizard?product=money_claim"
              className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Standard AST */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-2">Standard AST</h3>
            <div className="text-3xl font-bold text-primary mb-4">£39.99 <span className="text-sm text-gray-600">one-time</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ AST/PRT/NI Agreement</li>
              <li>✅ Core Clauses</li>
              <li>✅ Full UK Coverage</li>
              <li>✅ Lifetime Storage</li>
            </ul>
            <Link
              href="/wizard?product=ast_standard"
              className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Premium AST */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-2">Premium AST</h3>
            <div className="text-3xl font-bold text-primary mb-4">£59.00 <span className="text-sm text-gray-600">one-time</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ Everything in Standard</li>
              <li>✅ HMO Clauses</li>
              <li>✅ Guarantor Provisions</li>
              <li>✅ Rent Increases</li>
              <li>✅ Advanced Protection</li>
            </ul>
            <Link
              href="/wizard?product=ast_premium"
              className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* HMO Pro */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-2">HMO Pro</h3>
            <div className="text-3xl font-bold text-primary mb-4">£19.99-£34.99 <span className="text-sm text-gray-600">/month</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li>✅ Tiered by Property Count</li>
              <li>✅ License Tracking</li>
              <li>✅ Certificate Reminders</li>
              <li>✅ 7-Day Free Trial</li>
            </ul>
            <Link
              href="/wizard?product=hmo_pro"
              className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
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

        {/* CTA */}
        <div className="mt-16 bg-linear-to-br from-primary to-emerald-600 text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Not sure which product is right for you? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/help"
              className="inline-block bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Browse FAQ
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
