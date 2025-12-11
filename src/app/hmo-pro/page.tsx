import type { Metadata } from "next";
import { Container, TealHero } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HMO Pro - HMO Compliance Management | Landlord Heaven",
  description:
    "HMO compliance management subscription. License tracking, fire safety reminders, inspection schedules. £19.99-£34.99/month tiered by property count with 7-day free trial.",
};

export default function HMOProPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* V2 Roadmap Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-4">
        <Container>
          <div className="text-center">
            <p className="text-sm font-semibold mb-1 text-white">
              🚧 Coming Soon - V2 Roadmap Feature 🚧
            </p>
            <p className="text-xs text-white/90">
              HMO Pro is currently in development. Expected launch: Q2 2026. For immediate HMO compliance needs, please consult a local property management specialist.
            </p>
          </div>
        </Container>
      </div>

      <TealHero
        title="HMO Pro"
        subtitle="Manage licences, inspections, and compliance timelines with a calm teal workspace."
        eyebrow="HMO compliance - Coming in V2"
      />

      {/* What's Included */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              Never Miss a Compliance Deadline
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              HMO Pro tracks all your licenses, certificates, and inspections. Get automated reminders before deadlines.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* License Tracking */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">License Tracking</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ HMO license expiry tracking</li>
                  <li>✓ Selective licensing monitoring</li>
                  <li>✓ Additional licensing schemes</li>
                  <li>✓ Auto-reminders 90/60/30 days before</li>
                  <li>✓ Renewal application checklists</li>
                </ul>
              </div>

              {/* Fire Safety */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6">
                <div className="text-4xl mb-4">🔥</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Fire Safety Management</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Fire risk assessment deadlines</li>
                  <li>✓ Smoke alarm testing schedule</li>
                  <li>✓ Fire door inspection tracker</li>
                  <li>✓ Emergency lighting checks</li>
                  <li>✓ Fire extinguisher service dates</li>
                </ul>
              </div>

              {/* Gas & Electric */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Gas & Electrical Certificates</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Gas Safety Certificate (annual)</li>
                  <li>✓ EICR expiry tracking (5-year)</li>
                  <li>✓ PAT testing schedules</li>
                  <li>✓ Boiler service reminders</li>
                  <li>✓ Engineer contact management</li>
                </ul>
              </div>

              {/* Inspections */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Council Inspections</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Council inspection date tracking</li>
                  <li>✓ Pre-inspection checklists</li>
                  <li>✓ Previous inspection notes</li>
                  <li>✓ Remedial work deadlines</li>
                  <li>✓ Re-inspection scheduling</li>
                </ul>
              </div>

              {/* Tenant Management */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Tenant & Room Management</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Occupancy limit monitoring</li>
                  <li>✓ Room size compliance (bedrooms)</li>
                  <li>✓ Tenant turnover tracking</li>
                  <li>✓ Right to Rent check reminders</li>
                  <li>✓ Deposit protection tracking</li>
                </ul>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Document Storage</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Cloud storage for all certificates</li>
                  <li>✓ License documents library</li>
                  <li>✓ Inspection reports archive</li>
                  <li>✓ Tenancy agreements storage</li>
                  <li>✓ Download anytime, anywhere</li>
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
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">How HMO Pro Works</h2>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Add Your HMO Properties</h3>
                  <p className="text-gray-700 mb-3">
                    Input your HMO addresses, license numbers, and current certificate expiry dates. Takes 5 minutes per
                    property.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                    <p className="mb-1">
                      <strong>Example:</strong>
                    </p>
                    <p>• 123 Student Road, Manchester</p>
                    <p>• HMO License: Expires 15 Jan 2026</p>
                    <p>• Gas Safety: Expires 3 Mar 2025</p>
                    <p>• EICR: Expires 20 Aug 2027</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Set Reminder Preferences</h3>
                  <p className="text-gray-700 mb-3">
                    Choose when to be reminded (90/60/30 days before expiry). Select email, SMS, or both.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Receive Automated Reminders</h3>
                  <p className="text-gray-700 mb-3">
                    HMO Pro automatically emails you before deadlines. Never miss a license renewal or certificate
                    expiry.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
                    <p className="font-semibold text-charcoal mb-2">Example Email Reminder:</p>
                    <p className="text-gray-700 italic">
                      "⚠️ Your HMO license for 123 Student Road expires in 60 days (15 Jan 2026). Start your renewal
                      application now to avoid penalties. [View Checklist]"
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">View Dashboard & Take Action</h3>
                  <p className="text-gray-700">
                    Check your dashboard anytime to see all upcoming deadlines, overdue items, and property compliance
                    status. Download certificates, view checklists, and track remedial work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why HMO Pro */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">Why HMO Landlords Love HMO Pro</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">💸</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Avoid £30,000+ Fines</h3>
                <p className="text-gray-700 mb-3">
                  Operating an HMO without a valid license = up to £30,000 fine + rent repayment order. HMO Pro ensures
                  you never let licenses expire.
                </p>
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-gray-700">
                  <p className="font-semibold text-red-700 mb-1">Real Case:</p>
                  <p>
                    Leeds landlord fined £24,000 for expired HMO license + ordered to repay £18,000 rent. Total loss:
                    £42,000.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">⏰</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Save 10+ Hours Per Month</h3>
                <p className="text-gray-700">
                  Stop using spreadsheets, calendar reminders, and sticky notes. HMO Pro centralizes everything. No more
                  scrambling when council emails arrive.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🏘️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Multi-Property Management</h3>
                <p className="text-gray-700">
                  Manage 5, 10, or 50 HMOs from one dashboard. See all upcoming deadlines across your portfolio at a
                  glance. Perfect for professional landlords.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Insurance & Mortgage Protection</h3>
                <p className="text-gray-700">
                  Many insurance policies and HMO mortgages require proof of compliance. HMO Pro gives you instant access
                  to all certificates when insurers or lenders ask.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Mobile Access</h3>
                <p className="text-gray-700">
                  Council inspector arrives unexpectedly? Pull up all certificates on your phone instantly. No need to
                  rush home for paperwork.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Cancel Anytime</h3>
                <p className="text-gray-700">
                  No long-term contracts. If you sell your HMOs or it's not right for you, cancel anytime. You keep
                  access until the end of your billing cycle.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">Tiered Pricing</h2>
            <p className="text-center text-gray-600 mb-12">Pay based on the number of HMO properties you manage</p>

            {/* Pricing Tiers */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Tier 1 */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6 text-center">
                <div className="text-purple-600 font-semibold mb-2">1-5 Properties</div>
                <div className="text-4xl font-bold text-charcoal mb-1">£19.99</div>
                <div className="text-sm text-gray-600">/month</div>
              </div>

              {/* Tier 2 */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6 text-center">
                <div className="text-purple-600 font-semibold mb-2">6-10 Properties</div>
                <div className="text-4xl font-bold text-charcoal mb-1">£24.99</div>
                <div className="text-sm text-gray-600">/month</div>
              </div>

              {/* Tier 3 */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6 text-center">
                <div className="text-purple-600 font-semibold mb-2">11-15 Properties</div>
                <div className="text-4xl font-bold text-charcoal mb-1">£29.99</div>
                <div className="text-sm text-gray-600">/month</div>
              </div>

              {/* Tier 4 */}
              <div className="bg-white rounded-lg border-2 border-purple-200 p-6 text-center">
                <div className="text-purple-600 font-semibold mb-2">16-20 Properties</div>
                <div className="text-4xl font-bold text-charcoal mb-1">£34.99</div>
                <div className="text-sm text-gray-600">/month</div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-12 text-center">
              <p className="text-charcoal font-semibold mb-2">21+ Properties?</p>
              <p className="text-gray-700">
                £34.99 base + £5 per additional 5 properties. For example, 25 properties = £39.99/month
              </p>
            </div>

            <div className="bg-linear-to-br from-purple-600 to-indigo-700 text-white rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">All Tiers Include</h3>
                <p className="text-white/90 mb-6">Full access to all HMO Pro features</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                <h4 className="font-semibold text-lg mb-4">What's Included:</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Manage all your HMOs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Automated email reminders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Cloud document storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Mobile app access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Compliance dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Email support</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
                <p className="text-center text-sm">
                  <strong>7-Day Free Trial</strong>
                  <br />
                  No payment required. Cancel before trial ends and pay nothing.
                </p>
              </div>

              <button
                disabled
                className="block w-full bg-gray-400 text-gray-600 px-8 py-4 rounded-lg font-semibold text-lg text-center cursor-not-allowed opacity-60"
              >
                Coming in V2 (Q2 2026)
              </button>

              <p className="text-center text-sm text-white/70 mt-4">
                This feature is currently in development and not yet available
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                💡 <strong>Tip:</strong> Starting from just £19.99/month = £239.88/year. One missed license renewal can cost £30,000. HMO
                Pro pays for itself 125x over.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Who It's For */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">Who Is HMO Pro For?</h2>

            <div className="space-y-6">
              <div className="bg-success/10 border-l-4 border-success p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-charcoal mb-2">✅ Perfect For:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Landlords with 1+ licensed HMOs</li>
                  <li>• Student property landlords (multiple tenancies per year)</li>
                  <li>• Professional landlords managing 5+ HMOs</li>
                  <li>• Portfolio landlords in selective licensing areas</li>
                  <li>• Anyone who's missed a deadline before and paid the price</li>
                </ul>
              </div>

              <div className="bg-gray-50 border-l-4 border-gray-300 p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-charcoal mb-2">❌ Not Right For:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Landlords with only standard (non-HMO) properties</li>
                  <li>• Single property with AST (use our one-time documents instead)</li>
                  <li>• Landlords not subject to licensing (though still useful for certificates)</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  Not sure if you need an HMO license?{" "}
                  <Link href="/help" className="text-primary hover:underline">
                    Check our HMO guide
                  </Link>
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
                <h3 className="text-lg font-semibold text-charcoal mb-2">How does the 7-day free trial work?</h3>
                <p className="text-gray-700">
                  Sign up, add your properties, and test all features for 7 days FREE. No payment required upfront. If
                  you cancel before day 7, you pay nothing. After trial, it's £29.99/month until you cancel.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-700">
                  Yes! Cancel from your dashboard settings anytime. You'll keep access until the end of your current
                  billing period. No partial refunds, but no future charges either.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  How does tiered pricing work?
                </h3>
                <p className="text-gray-700">
                  You pay based on how many HMO properties you manage. 1-5 HMOs = £19.99/month, 6-10 = £24.99, 11-15 = £29.99, 16-20 = £34.99.
                  For 21+ properties, add £5 per additional 5 properties. Your tier updates automatically when you add/remove properties.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">What reminders do I get?</h3>
                <p className="text-gray-700">
                  You'll receive email reminders at 90, 60, and 30 days before any deadline (licenses, certificates,
                  inspections). Customize frequency in settings. SMS reminders coming soon.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Does this work in Scotland/Northern Ireland?
                </h3>
                <p className="text-gray-700">
                  Yes! HMO Pro works across the UK. We track HMO licenses (England/Wales/Scotland/NI), selective
                  licensing, and all standard certificates (Gas Safe, EICR, etc.) regardless of jurisdiction.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What happens to my data if I cancel?
                </h3>
                <p className="text-gray-700">
                  You keep access until your billing period ends. After that, your data is stored for 30 days (in case
                  you return). Download all certificates before cancelling. After 30 days, data is permanently deleted.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Do you apply for licenses on my behalf?
                </h3>
                <p className="text-gray-700">
                  No. HMO Pro is a reminder and tracking tool - we don't submit applications to councils. You'll receive
                  timely reminders with checklists of what documents you need, then you apply yourself (or use your
                  agent).
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-linear-to-br from-purple-600 to-indigo-700">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Coming in V2</h2>
            <p className="text-xl mb-8 text-white/90">
              HMO Pro is currently under development. Expected launch: Q2 2026. We're building a comprehensive HMO compliance management platform.
            </p>
            <button
              disabled
              className="inline-block bg-gray-400 text-gray-600 px-8 py-4 rounded-lg font-semibold text-lg cursor-not-allowed opacity-60 shadow-lg"
            >
              Not Yet Available
            </button>
            <p className="mt-4 text-sm text-white/80">
              Want to be notified when HMO Pro launches? <Link href="/help" className="underline">Contact us</Link>
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
