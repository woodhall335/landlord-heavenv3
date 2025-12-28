import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { RiCheckboxCircleLine } from "react-icons/ri";

export const metadata: Metadata = {
  title: "Notice Only - Section 8 & 21 Eviction Notices | Landlord Heaven",
  description:
    "Generate court-ready eviction notices for England, Wales, and Scotland in minutes. £29.99 one-time payment. Instant download. Section 8, Section 21, Section 173, and Notice to Leave.",
};

export default function NoticeOnlyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">☁️ Ask Heaven Smart Guidance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Notice Only with Ask Heaven Smart Guidance</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              AI-powered route selection + Court-Ready Eviction Notices
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl md:text-6xl font-bold text-gray-900">£29.99</span>
            </div>
            <Link
              href="/wizard?product=notice_only"
              className="hero-btn-primary"
            >
              Get Your Notice Now →
            </Link>
            <p className="mt-4 text-sm text-gray-600">Instant download • Legally compliant • No subscription</p>
          </div>
        </Container>
      </section>

      {/* Ask Heaven Smart Guidance Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">☁️</div>
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Ask Heaven Smart Guidance (Included!)
              </h2>
              <p className="text-xl text-gray-700 mb-2">
                AI-powered recommendations to maximize your success
              </p>
              <p className="text-gray-600">
                Ask Heaven analyzes your case and provides expert guidance at every step
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Route Recommendation */}
              <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">☁️</span>
                  <h3 className="text-xl font-bold text-charcoal">Smart Route Recommendation</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Ask Heaven analyzes your case and recommends the optimal eviction route:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Optimal route for your jurisdiction (England, Wales, or Scotland)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Compliance blockers identified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Detailed reasoning for each route</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Fix compliance issues before serving</span>
                  </li>
                </ul>
              </div>

              {/* Ground Recommendations */}
              <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">☁️</span>
                  <h3 className="text-xl font-bold text-charcoal">Ground Recommendations</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Ask Heaven pre-selects the strongest legal grounds for your case:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Success probability for each ground</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Required evidence checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Notice period auto-calculated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Legal basis explanation</span>
                  </li>
                </ul>
              </div>

              {/* Auto-Calculated Dates */}
              <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">☁️</span>
                  <h3 className="text-xl font-bold text-charcoal">Auto-Calculated Dates</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Ask Heaven calculates critical dates to ensure legal compliance:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Notice period calculation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Earliest possession date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Route-specific timing warnings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Jurisdiction-specific rules applied</span>
                  </li>
                </ul>
              </div>

              {/* Compliance Checks */}
              <div className="bg-white rounded-xl border-2 border-orange-200 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">☁️</span>
                  <h3 className="text-xl font-bold text-charcoal">Compliance Verification</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Ask Heaven checks critical compliance requirements:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">✓</span>
                    <span>Deposit protection status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">✓</span>
                    <span>Safety certificate checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">✓</span>
                    <span>Jurisdiction-specific compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">✓</span>
                    <span>Route blocker warnings</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Value Callout */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 text-center">
              <p className="text-lg">
                <strong className="font-bold">Ask Heaven Smart Guidance saves hours of research</strong> and prevents costly mistakes like serving invalid notices or choosing weak grounds
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">What's Included</h2>
            <p className="text-center text-gray-600 mb-12">
              Everything you need to start the eviction process legally
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* England */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Image src="/gb-eng.svg" alt="England" width={28} height={28} className="w-7 h-7" />
                  <h3 className="text-xl font-semibold text-charcoal">England</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      <strong>Section 8 Notice</strong> - Rent arrears, breach, antisocial behaviour
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      <strong>Section 21 Notice (Form 6A)</strong> - No-fault eviction
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">Housing Act 1988 - AST framework</span>
                  </li>
                </ul>
              </div>

              {/* Wales */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Image src="/gb-wls.svg" alt="Wales" width={28} height={28} className="w-7 h-7" />
                  <h3 className="text-xl font-semibold text-charcoal">Wales</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      <strong>Section 173 Notice</strong> - No-fault possession
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      <strong>Fault-Based Notices</strong> - Rent arrears, breach, ASB
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">Renting Homes (Wales) Act 2016 - Occupation contracts</span>
                  </li>
                </ul>
              </div>

              {/* Scotland */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Image src="/gb-sct.svg" alt="Scotland" width={28} height={28} className="w-7 h-7" />
                  <h3 className="text-xl font-semibold text-charcoal">Scotland</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      <strong>Notice to Leave</strong> - For PRTs under 2016 Act
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">All 18 eviction grounds covered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">Tribunal-ready format</span>
                  </li>
                </ul>
              </div>


              {/* Bonus Features */}
              <div className="bg-primary-subtle rounded-lg border border-primary/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">☁️</span>
                  <h3 className="text-xl font-semibold text-charcoal">Ask Heaven Features</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">Ask Heaven Smart Guidance (route, grounds, dates)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">Instant PDF download</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                    <span className="text-gray-700">Serve by post or email guide</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">How It Works</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Answer Simple Questions</h3>
                <p className="text-gray-600">
                  Our guided wizard asks about your case: tenant details, grounds for eviction, arrears amount,
                  tenancy dates.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">We Generate Your Notice</h3>
                <p className="text-gray-600">
                  Our system analyzes your case, selects the correct notice type, and generates a court-ready
                  document in seconds.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Download & Serve</h3>
                <p className="text-gray-600">
                  Download your notice as PDF, print, and serve to your tenant. Includes serving instructions and proof
                  of service template.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/wizard?product=notice_only"
                className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors"
              >
                Start Your Notice Now →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Choose Notice Only */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Why Choose Notice Only?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Fast - 5 Minutes</h3>
                <p className="text-gray-700">
                  No more hours researching forms. Answer questions, get your notice instantly. Solicitors charge £200+
                  and take days.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Court-Ready</h3>
                <p className="text-gray-700">
                  All notices use official government formats (Form 6A, AT6, etc.). Accepted by all UK courts and
                  tribunals.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-3">
                  <Image src="/lgb.svg" alt="UK Coverage" width={48} height={48} className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Full UK Coverage - Separate Frameworks</h3>
                <p className="text-gray-700">
                  England (Housing Act 1988), Wales (Renting Homes Act 2016), and Scotland (Private Housing Tenancies Act 2016). Each jurisdiction has distinct legal requirements - never combined.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Smart Validation</h3>
                <p className="text-gray-700">
                  Our system validates your case, checks notice periods, suggests grounds, and ensures compliance
                  with latest laws.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Save £170+</h3>
                <p className="text-gray-700">
                  Solicitors charge £200-300 per notice. Our £29.99 one-time fee saves you money with no quality
                  compromise.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Professional Documents</h3>
                <p className="text-gray-700">
                  Legally compliant documents generated instantly. Accepted by all UK courts and tribunals.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Is this legal? Will courts accept this?
                </h3>
                <p className="text-gray-700">
                  Yes! Our notices use official government forms (Form 6A for Section 21, AT6 for Scotland, etc.). They
                  are identical to what solicitors use and are accepted by all UK courts and tribunals. However, we are
                  NOT a law firm and don't provide legal advice - consult a solicitor for complex cases.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What if I choose the wrong notice type?
                </h3>
                <p className="text-gray-700">
                  Our wizard analyzes your case and recommends the correct notice type based on your jurisdiction,
                  tenancy type, and eviction grounds. You'll see a clear explanation of why each notice is recommended.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">Can I use this for HMO properties?</h3>
                <p className="text-gray-700">
                  Yes! Notice Only works for all tenancy types including HMOs. For HMO compliance management
                  (licensing, fire safety, inspections), check out our{" "}
                  <Link href="/hmo-pro" className="text-primary hover:underline">
                    HMO Pro subscription
                  </Link>
                  .
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What happens after I serve the notice?
                </h3>
                <p className="text-gray-700">
                  After the notice period expires, if the tenant doesn't leave, you'll need to apply to court for a
                  possession order. Our{" "}
                  <Link href="/legal-proceedings" className="text-primary hover:underline">
                    Legal Proceedings products
                  </Link>{" "}
                  include court claim forms to continue the process.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What if my notice is rejected by court?
                </h3>
                <p className="text-gray-700">
                  If your notice is rejected due to an error in our document generation, we'll regenerate a corrected notice for free. However, if it's rejected due to
                  incorrect information you provided or procedural issues (like missing deposit protection), we cannot offer a refund but will help you fix it. All products are digital and instantly delivered, so refunds are only available for technical errors on our end.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I generate multiple notices?
                </h3>
                <p className="text-gray-700">
                  £29.99 covers ONE notice for ONE property/tenant. Need multiple notices? You can purchase additional
                  notices as needed. Each purchase includes unlimited regenerations before final download for that specific case.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Get Your Notice?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Join thousands of UK landlords who've successfully served eviction notices with Landlord Heaven
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wizard?product=notice_only"
                className="hero-btn-primary"
              >
                Start Your Notice - £29.99 →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Instant download • Legally compliant • No subscription
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
