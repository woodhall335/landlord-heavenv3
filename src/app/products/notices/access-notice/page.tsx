import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Property Access Notice - 24 Hour Notice Templates | £19.99 | Landlord Heaven",
  description:
    "Generate professional landlord access notices for UK properties. Templates for inspections, repairs, viewings, and emergencies. 24-hour notice compliance for England, Wales, Scotland, and Northern Ireland. £19.99.",
};

export default function AccessNoticePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-emerald-600 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Property Access Notice</h1>
            <p className="text-xl md:text-2xl mb-6 text-white/90">
              Professional Templates for Landlord Property Access
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl md:text-6xl font-bold">£19.99</span>
              <span className="text-xl text-white/80">one-time</span>
            </div>
            <Link
              href="/wizard?product=access_notice"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Generate Your Notice Now →
            </Link>
            <p className="mt-4 text-sm text-white/80">Instant download • All scenarios covered • No subscription</p>
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">What's Included</h2>
            <p className="text-center text-gray-600 mb-12">
              Templates for every property access scenario
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Routine Inspections */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔍</span>
                  <h3 className="text-xl font-semibold text-charcoal">Routine Inspections</h3>
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
                    <span className="text-gray-700">Quarterly or bi-annual property inspections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Condition checks and maintenance reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Compliance with tenancy agreement terms</span>
                  </li>
                </ul>
              </div>

              {/* Repairs & Maintenance */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔧</span>
                  <h3 className="text-xl font-semibold text-charcoal">Repairs & Maintenance</h3>
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
                    <span className="text-gray-700">Plumber, electrician, or contractor access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Boiler servicing and gas safety checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Emergency repairs and safety assessments</span>
                  </li>
                </ul>
              </div>

              {/* Viewings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">👁️</span>
                  <h3 className="text-xl font-semibold text-charcoal">Property Viewings</h3>
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
                    <span className="text-gray-700">End-of-tenancy viewings for new tenants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Accompanied viewings during notice period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Respectful scheduling for current tenants</span>
                  </li>
                </ul>
              </div>

              {/* Safety Checks */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-xl font-semibold text-charcoal">Safety & Compliance</h3>
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
                    <span className="text-gray-700">Annual gas safety inspections (legal requirement)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">EICR electrical safety testing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Fire alarm and carbon monoxide detector checks</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-primary-subtle border border-primary/20 rounded-lg p-6">
              <h4 className="font-semibold text-charcoal mb-3">Every Notice Includes:</h4>
              <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> 24-hour notice compliance templates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Specific date, time, and duration
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Reason for access clearly stated
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Tenant rights and alternatives
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Proof of delivery template
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Emergency access procedures
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Legal Requirements */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Legal Requirements for Property Access
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">⏰</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">24 Hours Notice</h3>
                <p className="text-gray-700 mb-3">
                  You must give at least 24 hours written notice before accessing the property (except emergencies). This is a
                  legal requirement across all UK jurisdictions.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Exception:</strong> Genuine emergencies (fire, flood, gas leak) allow immediate access without notice.
                  Document the emergency afterwards.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🕐</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Reasonable Times</h3>
                <p className="text-gray-700 mb-3">
                  Access must be at "reasonable times of day" - typically 9am to 6pm on weekdays. Avoid early mornings,
                  late evenings, or unsociable hours unless tenant agrees.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> Offer 2-3 alternative time slots to accommodate tenant schedules. Flexibility maintains
                  good relations.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Written Notice Required</h3>
                <p className="text-gray-700 mb-3">
                  Notice must be in writing (letter, email if agreed). Verbal or text message notice is NOT sufficient and
                  doesn't meet legal requirements.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Best Practice:</strong> Send by email (if agreed in tenancy) and follow up with posted letter or
                  hand-delivered copy.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🚫</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">No Forced Entry</h3>
                <p className="text-gray-700 mb-3">
                  You CANNOT force entry even after giving notice. If tenant refuses access without good reason, this may
                  constitute a breach of tenancy, but you must go through proper legal channels.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Important:</strong> Never let yourself in without tenant present unless tenancy agreement explicitly
                  allows and you have permission.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Best Practices */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Best Practices for Property Access
            </h2>

            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <span>✅</span> Offer Multiple Time Slots
                </h3>
                <p className="text-gray-700">
                  Provide 2-3 alternative dates and times. Example: "Tuesday 10am-12pm, Wednesday 2pm-4pm, or Thursday 10am-12pm."
                  This shows flexibility and increases likelihood of tenant cooperation.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <span>📧</span> Confirm Arrangements
                </h3>
                <p className="text-gray-700">
                  Once tenant agrees to a time, send written confirmation. Request tenant acknowledge receipt and agreement. This
                  prevents misunderstandings and provides evidence if needed.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <span>🎯</span> Be Specific About Purpose
                </h3>
                <p className="text-gray-700">
                  Clearly state why you need access: "Annual gas safety inspection as required by law" or "Repair leaking tap
                  as reported by you on [date]." Vague notices ("general inspection") may cause tenant concern.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <span>⏱️</span> Respect Tenant Privacy
                </h3>
                <p className="text-gray-700">
                  Keep visits brief and focused. Don't snoop, open cupboards, or inspect areas unrelated to stated purpose.
                  Respect tenant's quiet enjoyment rights - excessive or intrusive inspections can constitute harassment.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <span>📸</span> Document Everything
                </h3>
                <p className="text-gray-700">
                  Keep copies of access notices, tenant acknowledgments, and any issues found during inspections. Take dated
                  photos if needed. This evidence is crucial if disputes arise about property condition or access refusal.
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
                  What if my tenant refuses access after proper notice?
                </h3>
                <p className="text-gray-700">
                  First, try to understand their concerns and reschedule. If they persistently refuse reasonable access requests
                  (especially for safety checks), this may breach the tenancy agreement. Document refusals and consider serving
                  a breach notice. Never force entry - seek legal advice if necessary.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I access the property in an emergency without notice?
                </h3>
                <p className="text-gray-700">
                  Yes, for genuine emergencies (fire, flood, gas leak, major leak affecting neighbors). Document the emergency
                  immediately afterwards with photos and written records. Inform tenant as soon as possible. Non-emergencies
                  still require 24-hour notice.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  How many inspections can I do per year?
                </h3>
                <p className="text-gray-700">
                  There's no legal limit, but excessive inspections can constitute harassment. Industry standard is quarterly
                  (every 3 months) or bi-annual (every 6 months). More frequent inspections need good justification (e.g.,
                  previous maintenance issues, HMO compliance requirements).
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I do viewings while tenant still lives there?
                </h3>
                <p className="text-gray-700">
                  Yes, during the notice period when tenant is leaving. Give proper 24-hour notice for each viewing and try to
                  limit frequency (e.g., 2-3 viewings per week maximum). Consider tenant's work schedule and offer compensation
                  (small rent reduction) for cooperation if doing many viewings.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Do these templates work for all UK jurisdictions?
                </h3>
                <p className="text-gray-700">
                  Yes! Access notice requirements are similar across England, Wales, Scotland, and Northern Ireland (24-hour
                  written notice, reasonable times). Our templates are jurisdiction-neutral and comply with all UK requirements.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I use these for commercial properties?
                </h3>
                <p className="text-gray-700">
                  These templates are designed for residential tenancies. Commercial leases often have different access terms
                  specified in the lease agreement. For commercial properties, check your lease terms or consult a solicitor.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Request Property Access?</h2>
            <p className="text-xl mb-8 text-white/90">
              Generate professional access notices in minutes. £19.99 one-time payment.
            </p>
            <Link
              href="/wizard?product=access_notice"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Generate Notice Now - £19.99 →
            </Link>
            <p className="mt-4 text-sm text-white/80">
              Instant download • All scenarios covered • No subscription
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
