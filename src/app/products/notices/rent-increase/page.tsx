import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rent Increase Notice - Section 13 | Scotland & NI | £19.99 | Landlord Heaven",
  description:
    "Generate legally compliant rent increase notices for UK properties. Section 13 for England & Wales, Scottish 12-month rules, Northern Ireland 2025 regulations. £19.99 one-time payment.",
};

export default function RentIncreaseNoticePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-emerald-600 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Rent Increase Notice</h1>
            <p className="text-xl md:text-2xl mb-6 text-white/90">
              Legally Compliant Rent Increase Notices for UK Landlords
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl md:text-6xl font-bold">£19.99</span>
              <span className="text-xl text-white/80">one-time</span>
            </div>
            <Link
              href="/wizard?product=rent_increase_notice"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Generate Your Notice Now →
            </Link>
            <p className="mt-4 text-sm text-white/80">Instant download • Legally compliant • No subscription</p>
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">What's Included</h2>
            <p className="text-center text-gray-600 mb-12">
              Jurisdiction-specific rent increase notices with all legal requirements
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* England & Wales */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                  <h3 className="text-xl font-semibold text-charcoal">England & Wales</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Section 13 Notice</strong> - Official Form 4 format
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Minimum 1-month notice period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Must align with rent period anniversary</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Tenant tribunal challenge information</span>
                  </li>
                </ul>
              </div>

              {/* Scotland */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
                  <h3 className="text-xl font-semibold text-charcoal">Scotland</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>PRT Rent Increase Notice</strong> - 2016 Act compliant
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>12-month gap</strong> between increases (strict requirement)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>3 months notice</strong> minimum (longer than E&W)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Rent pressure zone compliance check</span>
                  </li>
                </ul>
              </div>

              {/* Northern Ireland */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🇬🇧</span>
                  <h3 className="text-xl font-semibold text-charcoal">Northern Ireland</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>2025 updated rules</strong> - Latest regulations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">1-month written notice minimum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Fixed-term agreement considerations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Tenant rights and objection procedures</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-primary-subtle border border-primary/20 rounded-lg p-6">
              <h4 className="font-semibold text-charcoal mb-3">Every Notice Includes:</h4>
              <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Pre-filled notice template with your details
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Serving instructions (post, hand, email)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Proof of service template
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Notice period calculator
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Market rent comparison guidance
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Tenant negotiation tips
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* When to Use */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              When to Use a Rent Increase Notice
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Market Rate Alignment</h3>
                <p className="text-gray-700 mb-3">
                  When local rents have increased significantly since you set the current rent. Use market data to justify
                  reasonable increases.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> Check Rightmove and Zoopla for comparable properties in your area. Increases of 3-5% are
                  typically accepted; larger increases may face tribunal challenges.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">💷</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Rising Operating Costs</h3>
                <p className="text-gray-700 mb-3">
                  When your costs have increased (mortgage rates, service charges, property maintenance, insurance premiums).
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> Document your cost increases. While not legally required to justify the increase, it helps
                  maintain good tenant relations.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🏠</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Property Improvements</h3>
                <p className="text-gray-700 mb-3">
                  After making significant improvements (new kitchen, bathroom, double glazing, central heating upgrade).
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> Increases after improvements are more defensible. Keep receipts and before/after photos to
                  demonstrate added value.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">⏰</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Annual Review Cycle</h3>
                <p className="text-gray-700 mb-3">
                  Many landlords implement annual rent reviews to keep pace with inflation and market conditions.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Scotland:</strong> Remember the strict 12-month gap rule. In England & Wales, you can increase more
                  frequently if the tenancy agreement allows.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">How It Works</h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-3">Select Jurisdiction</h3>
                <p className="text-gray-600 text-sm">
                  Choose England & Wales, Scotland, or Northern Ireland for correct legal format.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-3">Enter Details</h3>
                <p className="text-gray-600 text-sm">
                  Property address, current rent, new rent, effective date, tenant names.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-3">Review & Download</h3>
                <p className="text-gray-600 text-sm">
                  Check notice period compliance, download PDF, and review serving instructions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-3">Serve Notice</h3>
                <p className="text-gray-600 text-sm">
                  Serve to tenant via post, hand, or email. Keep proof of service for your records.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/wizard?product=rent_increase_notice"
                className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 transition-colors"
              >
                Generate Your Notice Now →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Important Considerations */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Important Considerations
            </h2>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <span>⚠️</span> Fixed-Term Agreements
                </h3>
                <p className="text-gray-700">
                  You generally CANNOT increase rent during a fixed-term tenancy unless there's a rent review clause in the
                  agreement. Section 13 only applies to periodic tenancies (or after fixed term ends). Check your tenancy
                  agreement first.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <span>🏴󠁧󠁢󠁳󠁣󠁴󠁿</span> Scotland's Strict 12-Month Rule
                </h3>
                <p className="text-gray-700">
                  In Scotland, you MUST wait 12 months between rent increases. This is measured from the date the last increase
                  took effect, not when you served notice. Violating this invalidates your notice entirely.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <span>⚖️</span> Tenant Tribunal Challenges
                </h3>
                <p className="text-gray-700">
                  Tenants can challenge "excessive" rent increases via tribunal (England & Wales) or Rent Assessment Committee
                  (Scotland). The tribunal will compare to market rents for similar properties. Unreasonable increases may be
                  reduced or rejected.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <span>💬</span> Consider Negotiation First
                </h3>
                <p className="text-gray-700">
                  While not legally required, discussing the increase with your tenant before serving formal notice can maintain
                  good relations. Good tenants are valuable - a 5% increase with a reliable tenant is often better than a 10%
                  increase with void periods and tenant turnover.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  How much can I increase the rent?
                </h3>
                <p className="text-gray-700">
                  There's no legal limit on rent increases in England & Wales or Northern Ireland, but the increase must be "fair
                  and realistic" (comparable to market rates). Scotland has rent pressure zones in some areas with caps. Tenants
                  can challenge excessive increases via tribunal.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  How much notice must I give?
                </h3>
                <p className="text-gray-700">
                  <strong>England & Wales:</strong> Minimum 1 month (Section 13). Must align with rent period anniversary.
                  <br />
                  <strong>Scotland:</strong> Minimum 3 months for PRT.
                  <br />
                  <strong>Northern Ireland:</strong> Minimum 1 month written notice.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What if my tenant refuses to pay the increased rent?
                </h3>
                <p className="text-gray-700">
                  If you've served a valid notice and the tenant refuses, you can treat them as being in arrears after the
                  effective date. However, they can also challenge the increase via tribunal or simply give notice to leave. Avoid
                  evicting solely over reasonable rent increases - it's costly and time-consuming.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I increase rent during a fixed-term tenancy?
                </h3>
                <p className="text-gray-700">
                  Only if the tenancy agreement includes a rent review clause that allows it. Otherwise, you must wait until the
                  fixed term ends and the tenancy becomes periodic, or negotiate a new fixed-term agreement with higher rent.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Does this include serving instructions?
                </h3>
                <p className="text-gray-700">
                  Yes! Each notice includes detailed serving instructions for your jurisdiction (hand delivery, recorded post,
                  email if allowed), plus a proof of service template to keep for your records in case of disputes.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Is this legally valid or do I need a solicitor?
                </h3>
                <p className="text-gray-700">
                  Our notices follow standard legal formats used by professional landlords and letting agents. However, we are NOT
                  a law firm. For complex situations (e.g., tribunal challenges, unusual tenancy terms), consult a solicitor.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary to-emerald-600">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Issue Your Rent Increase?</h2>
            <p className="text-xl mb-8 text-white/90">
              Generate a legally compliant notice in minutes. £19.99 one-time payment.
            </p>
            <Link
              href="/wizard?product=rent_increase_notice"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Generate Notice Now - £19.99 →
            </Link>
            <p className="mt-4 text-sm text-white/80">
              Instant download • All UK jurisdictions • No subscription
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
