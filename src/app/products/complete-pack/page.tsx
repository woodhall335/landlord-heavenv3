import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Complete Eviction Pack - Notice to Court Claim | Landlord Heaven",
  description:
    "Everything you need for a successful eviction. Notice + Court claim forms + Money claim for arrears. £79.99 one-time payment. Save £300+ vs solicitors.",
};

export default function CompletePackPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-charcoal to-gray-800 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary-light">Best Value - Save £300+</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Complete Eviction Pack</h1>
            <p className="text-xl md:text-2xl mb-6 text-white/90">
              Notice to Possession Order - Everything in One Package
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-2xl text-white/60 line-through">£150</span>
              <span className="text-5xl md:text-6xl font-bold">£79.99</span>
            </div>
            <p className="text-white/80 mb-8">One-time payment • No subscription</p>
            <Link
              href="/wizard?product=complete_pack"
              className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 transition-colors shadow-lg"
            >
              Get Complete Pack Now →
            </Link>
            <p className="mt-4 text-sm text-white/80">30-day money-back guarantee</p>
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              Complete Eviction Journey
            </h2>
            <p className="text-center text-gray-600 mb-12">
              From first notice to court possession order - all documents included
            </p>

            <div className="grid gap-6">
              {/* Step 1: Notice */}
              <div className="bg-white rounded-lg border-2 border-primary p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-charcoal mb-3">
                      Eviction Notice{" "}
                      <span className="text-primary text-lg">(Worth £29.99)</span>
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-semibold text-charcoal mb-2">🏴󠁧󠁢󠁥󠁮󠁧󠁿 England & Wales</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Section 8 Notice</li>
                          <li>• Section 21 Notice</li>
                          <li>• Official Form 6A</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal mb-2">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Notice to Leave</li>
                          <li>• All 18 grounds</li>
                          <li>• Tribunal format</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal mb-2">🇬🇧 Northern Ireland</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Notice to Quit</li>
                          <li>• Statutory grounds</li>
                          <li>• County court format</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Court Claim */}
              <div className="bg-white rounded-lg border-2 border-primary p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-charcoal mb-3">
                      Possession Claim Forms{" "}
                      <span className="text-primary text-lg">(Worth £49.99)</span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-charcoal mb-2">Court Documents</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>✓ Claim Form N5/N5B (accelerated)</li>
                          <li>✓ Particulars of Claim</li>
                          <li>✓ Witness Statement</li>
                          <li>✓ Evidence Bundle Checklist</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal mb-2">Supporting Docs</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>✓ Court Filing Instructions</li>
                          <li>✓ Fee Calculator</li>
                          <li>✓ Service Requirements Guide</li>
                          <li>✓ Hearing Preparation Tips</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Money Claim */}
              <div className="bg-white rounded-lg border-2 border-primary p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-charcoal mb-3">
                      Rent Arrears Money Claim{" "}
                      <span className="text-primary text-lg">(Worth £39.99)</span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-charcoal mb-2">Claim Documents</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>✓ Money Claim Online (MCOL) Form</li>
                          <li>✓ Rent Arrears Schedule</li>
                          <li>✓ Interest Calculator</li>
                          <li>✓ Costs Breakdown</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal mb-2">Recovery Tools</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>✓ Default Judgment Application</li>
                          <li>✓ Warrant of Control Request</li>
                          <li>✓ Attachment of Earnings</li>
                          <li>✓ Charging Order Guide</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bonus */}
              <div className="bg-primary-subtle rounded-lg border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-3xl">🎁</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-charcoal mb-3">Bonus: Case Management Tools</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                      <div>
                        <p>✓ Timeline Generator</p>
                        <p>✓ Evidence Checklist</p>
                      </div>
                      <div>
                        <p>✓ Court Fee Calculator</p>
                        <p>✓ Deadline Tracker</p>
                      </div>
                      <div>
                        <p>✓ Serving Instructions</p>
                        <p>✓ Template Letters</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-success/10 border-l-4 border-success p-6 rounded-r-lg">
              <p className="text-charcoal font-semibold mb-2">💰 Total Value: £119.97 → You Pay: £79.99</p>
              <p className="text-gray-700">
                Save £40 by getting everything in one pack. Plus save £300+ vs solicitor fees.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">How It Works</h2>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Complete the Wizard Once</h3>
                  <p className="text-gray-700">
                    Answer questions about your case: tenant details, property, tenancy dates, grounds for eviction,
                    rent arrears. Our AI analyzes everything.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">AI Generates ALL Documents</h3>
                  <p className="text-gray-700">
                    Claude Sonnet 4 generates your eviction notice, court claim forms, witness statement, and money
                    claim - all pre-filled with your case details. Everything is consistent and court-ready.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Follow the Eviction Journey</h3>
                  <p className="text-gray-700 mb-3">We provide a step-by-step timeline:</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="text-primary">→</span> <strong>Day 1:</strong> Serve eviction notice
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-primary">→</span> <strong>Day 14-60:</strong> Wait for notice period to
                      expire
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-primary">→</span> <strong>Day 61:</strong> File possession claim with court
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-primary">→</span> <strong>Day 62:</strong> File money claim for arrears
                      (optional)
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-primary">→</span> <strong>Day 90+:</strong> Attend court hearing
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-primary">→</span> <strong>Day 120:</strong> Bailiff enforcement (if needed)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Download, File, Succeed</h3>
                  <p className="text-gray-700">
                    Download all documents as PDFs. We include instructions for serving, filing with court, and
                    preparing for hearings. You're ready to go.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/wizard?product=complete_pack"
                className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 transition-colors"
              >
                Get Complete Pack - £79.99 →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Complete Pack */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">Why Complete Pack?</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Save £300+ vs Solicitors</h3>
                <p className="text-gray-700 mb-2">
                  Solicitors charge £400-600 for eviction proceedings. You pay £79.99 once.
                </p>
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <p className="text-gray-700">
                    <span className="line-through">Solicitor: £500</span>
                    <br />
                    <span className="text-primary font-semibold">You: £79.99</span>
                    <br />
                    <span className="font-semibold">Savings: £420+</span>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">All Documents in 15 Minutes</h3>
                <p className="text-gray-700">
                  Don't spend hours researching forms, notice periods, and court procedures. Answer questions once, get
                  everything instantly. Solicitors take weeks.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Everything Matches</h3>
                <p className="text-gray-700">
                  All documents use the same case details (dates, amounts, grounds). No contradictions that could sink
                  your case. AI ensures consistency across all forms.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Complete Evidence Bundle</h3>
                <p className="text-gray-700">
                  Courts require specific evidence. We provide a checklist of what to include (tenancy agreement, rent
                  statements, notice service proof) and how to organize it.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🇬🇧</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">100% UK Coverage</h3>
                <p className="text-gray-700">
                  Works in England & Wales (county court), Scotland (First-tier Tribunal), and Northern Ireland (county
                  court). Only service with full UK coverage.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Unlimited Regenerations</h3>
                <p className="text-gray-700">
                  Need to update arrears amount or add another ground? Regenerate documents unlimited times for the same
                  case. No extra fees.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Complete Pack vs Notice Only
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-4 font-semibold text-charcoal">What's Included</th>
                    <th className="text-center p-4 font-semibold text-charcoal">
                      Notice Only
                      <br />
                      <span className="text-sm font-normal text-gray-600">£29.99</span>
                    </th>
                    <th className="text-center p-4 font-semibold text-primary">
                      Complete Pack
                      <br />
                      <span className="text-sm font-normal">£79.99</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-t">
                    <td className="p-4">Eviction Notice (Section 8/21/Notice to Leave)</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4 bg-primary-subtle">✅</td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="p-4">Court Possession Claim Forms (N5/N5B)</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4 bg-primary-subtle">✅</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">Witness Statement</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4 bg-primary-subtle">✅</td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="p-4">Money Claim for Rent Arrears</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4 bg-primary-subtle">✅</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">Rent Arrears Schedule</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4 bg-primary-subtle">✅</td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="p-4">Court Filing Instructions</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4 bg-primary-subtle">✅</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">Evidence Bundle Checklist</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4 bg-primary-subtle">✅</td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="p-4">Unlimited Regenerations</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4 bg-primary-subtle">✅</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4 font-semibold">Best For:</td>
                    <td className="text-center p-4 text-gray-600 text-xs">Simple cases, notice only needed</td>
                    <td className="text-center p-4 bg-primary-subtle font-semibold text-primary text-xs">
                      Complete eviction + arrears recovery
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-700 mb-4">
                <strong>Not sure which to choose?</strong> If your tenant hasn't left after the notice period, you'll
                need court forms anyway. Save money with Complete Pack.
              </p>
              <Link
                href="/wizard?product=complete_pack"
                className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 transition-colors"
              >
                Get Complete Pack - £79.99 →
              </Link>
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
                  Do I need Complete Pack or just Notice Only?
                </h3>
                <p className="text-gray-700">
                  If you're confident your tenant will leave after receiving the notice, start with Notice Only
                  (£29.99). But 70% of evictions require court action. Complete Pack (£79.99) covers the entire journey
                  and saves you buying court forms separately later (£49.99 value).
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I upgrade from Notice Only to Complete Pack?
                </h3>
                <p className="text-gray-700">
                  Yes! If you've already purchased Notice Only and later need court forms, contact us at
                  support@landlordheaven.co.uk. We'll credit your £29.99 and you pay the difference (£50).
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">Are court fees included?</h3>
                <p className="text-gray-700">
                  No, our £79.99 covers document generation only. Court fees are separate and paid directly to the
                  court. Typical fees: £355 for possession claims, £35-£455 for money claims depending on amount. We
                  include a fee calculator.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Will this work in my jurisdiction?
                </h3>
                <p className="text-gray-700">
                  Yes! Complete Pack works in:
                  <br />• England & Wales (County Court)
                  <br />• Scotland (First-tier Tribunal for Scotland Housing and Property Chamber)
                  <br />• Northern Ireland (County Court)
                  <br />
                  We automatically generate the correct forms for your jurisdiction.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What if I need to update the arrears amount?
                </h3>
                <p className="text-gray-700">
                  Complete Pack includes unlimited regenerations. If arrears increase between serving notice and filing
                  with court, just regenerate your documents with updated amounts. Everything stays consistent.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Do you provide legal representation?
                </h3>
                <p className="text-gray-700">
                  No. We provide court-ready documents but are NOT a law firm. You'll represent yourself (most landlords
                  do - possession hearings are straightforward). For complex cases or legal advice, consult a solicitor.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-charcoal to-gray-800">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Everything You Need</h2>
            <p className="text-xl mb-8 text-white/90">
              Complete eviction journey from notice to possession order. Save £300+ vs solicitors.
            </p>
            <Link
              href="/wizard?product=complete_pack"
              className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 transition-colors shadow-lg"
            >
              Get Complete Pack - £79.99 →
            </Link>
            <p className="mt-4 text-sm text-white/80">30-day money-back guarantee • Unlimited regenerations</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
