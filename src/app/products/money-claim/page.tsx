import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Money Claim Pack - Recover Rent Arrears | Landlord Heaven",
  description:
    "Claim unpaid rent arrears through UK courts. Money Claim Online forms, arrears schedule, interest calculator. £129.99 one-time payment. Instant download.",
};

export default function MoneyClaimPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-amber-500 to-orange-600 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold">Recover Your Money</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Money Claim Pack</h1>
            <p className="text-xl md:text-2xl mb-6 text-white/90">
              Claim Unpaid Rent Through UK Courts
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl md:text-6xl font-bold">£129.99</span>
              <span className="text-xl text-white/80">one-time</span>
            </div>
            <Link
              href="/wizard?product=money_claim"
              className="inline-block bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Start Your Claim Now →
            </Link>
            <p className="mt-4 text-sm text-white/80">Instant download • Legally compliant • England &amp; Wales only (Scotland coming soon)</p>
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">What's Included</h2>
            <p className="text-center text-gray-600 mb-12">
              Everything you need to claim rent arrears through the courts
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Court Forms */}
              <div className="bg-white rounded-lg border-2 border-amber-500 p-6">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-xl font-semibold text-charcoal mb-4">Court Claim Forms</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Official Form N1 (Dec 2024)</strong> - Pre-filled County Court claim form (PDF)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Particulars of Claim</strong> - Staple-ready particulars with interest wording
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Interest Calculation</strong> - Section 69 CCA daily rate and running total
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Evidence Index</strong> - Checklist for attachments behind your N1
                    </span>
                  </li>
                </ul>
              </div>

              {/* Arrears Documentation */}
              <div className="bg-white rounded-lg border-2 border-amber-500 p-6">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-xl font-semibold text-charcoal mb-4">Arrears Documentation</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Rent Arrears Schedule</strong> - Month-by-month breakdown
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Interest Calculator</strong> - 8% statutory interest on arrears
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Legal Costs Breakdown</strong> - Court fees + solicitor costs (if applicable)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Payment History Log</strong> - Track all payments and missed amounts
                    </span>
                  </li>
                </ul>
              </div>

              {/* Recovery Tools */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-4">Enforcement Tools</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Default Judgment Application</strong> - If tenant doesn't respond
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Warrant of Control Request</strong> - Send bailiffs to collect
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Attachment of Earnings Order</strong> - Deduct from tenant's wages
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Charging Order Guide</strong> - Secure debt against tenant's property
                    </span>
                  </li>
                </ul>
              </div>

              {/* Bonus */}
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
                <div className="text-3xl mb-3">✨</div>
                <h3 className="text-xl font-semibold text-charcoal mb-4">Bonus Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Filing instructions (MCOL online + paper)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Timeline: What happens after filing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Defense scenarios and responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Negotiation letter templates</span>
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

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Calculate Arrears</h3>
                <p className="text-sm text-gray-600">
                  Tell us rent amount, payment dates, and what's been paid. We calculate total arrears + interest.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">We Generate Claim</h3>
                <p className="text-sm text-gray-600">
                  Claim forms pre-filled with your case details, arrears schedule, and witness statement ready.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">File Online or Paper</h3>
                <p className="text-sm text-gray-600">
                  File via Money Claim Online (MCOL) or post to your local county court. We include both methods.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Collect Your Money</h3>
                <p className="text-sm text-gray-600">
                  If tenant doesn't pay/defend, apply for default judgment. Then use bailiffs or wage attachment.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-charcoal mb-3">Typical Timeline:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="text-amber-600">→</span> <strong>Day 1:</strong> File claim with court (pay court
                  fee)
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-amber-600">→</span> <strong>Day 7:</strong> Court serves claim on tenant
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-amber-600">→</span> <strong>Day 21:</strong> Tenant has 14 days to respond
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-amber-600">→</span> <strong>Day 28:</strong> If no response, apply for default
                  judgment
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-amber-600">→</span> <strong>Day 35:</strong> Judgment granted (you win!)
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-amber-600">→</span> <strong>Day 42+:</strong> Enforcement (bailiffs, wage
                  attachment, charging order)
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/wizard?product=money_claim"
                className="inline-block bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors"
              >
                Start Your Claim - £129.99 →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* When to Use */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">When to Use Money Claim Pack</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-success/10 border-l-4 border-success p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-charcoal mb-3">✅ Use Money Claim If:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Tenant has left but owes rent arrears</li>
                  <li>• Tenancy has ended, you just want money back</li>
                  <li>• You've already got possession but need arrears</li>
                  <li>• Claim is under £10,000</li>
                  <li>• You know where tenant lives/works (for enforcement)</li>
                </ul>
              </div>

              <div className="bg-warning/10 border-l-4 border-warning p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-charcoal mb-3">⚠️ Need Multiple Products?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Tenant is still in the property? Check our{" "}
                    <Link href="/products/notice-only" className="text-primary hover:underline">Notices</Link>
                  </li>
                  <li>• Need possession claim? Check our{" "}
                    <Link href="/legal-proceedings" className="text-primary hover:underline">Legal Proceedings</Link>
                  </li>
                  <li>• Each product is independent - buy what you need</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-charcoal font-semibold mb-2">💡 Pro Tip</p>
              <p className="text-gray-700">
                Money claims have high success rates (70%+ win) but LOW collection rates (only 30% of judgments are
                fully paid). Only pursue if tenant has assets, employment, or you can find them. Otherwise, accept the
                loss and move on.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Court Fees */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Court Fees (Paid Separately to Court)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-4 border font-semibold text-charcoal">Claim Amount</th>
                    <th className="text-left p-4 border font-semibold text-charcoal">Court Fee (Online)</th>
                    <th className="text-left p-4 border font-semibold text-charcoal">Court Fee (Paper)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border text-gray-700">Up to £300</td>
                    <td className="p-4 border text-gray-700">£25</td>
                    <td className="p-4 border text-gray-700">£35</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 border text-gray-700">£300.01 - £500</td>
                    <td className="p-4 border text-gray-700">£35</td>
                    <td className="p-4 border text-gray-700">£50</td>
                  </tr>
                  <tr>
                    <td className="p-4 border text-gray-700">£500.01 - £1,000</td>
                    <td className="p-4 border text-gray-700">£60</td>
                    <td className="p-4 border text-gray-700">£70</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 border text-gray-700">£1,000.01 - £1,500</td>
                    <td className="p-4 border text-gray-700">£70</td>
                    <td className="p-4 border text-gray-700">£80</td>
                  </tr>
                  <tr>
                    <td className="p-4 border text-gray-700">£1,500.01 - £3,000</td>
                    <td className="p-4 border text-gray-700">£105</td>
                    <td className="p-4 border text-gray-700">£115</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 border text-gray-700">£3,000.01 - £5,000</td>
                    <td className="p-4 border text-gray-700">£185</td>
                    <td className="p-4 border text-gray-700">£205</td>
                  </tr>
                  <tr>
                    <td className="p-4 border text-gray-700">£5,000.01 - £10,000</td>
                    <td className="p-4 border text-gray-700">£410</td>
                    <td className="p-4 border text-gray-700">£455</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <p>• Court fees are paid to the court when filing, NOT to Landlord Heaven</p>
              <p>• If you win, court fees can be added to your claim (tenant pays)</p>
              <p>• Money Claim Online (MCOL) is cheaper - save £10-45 vs paper</p>
              <p>• Our pack includes a fee calculator based on your arrears amount</p>
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
                  Can I claim arrears if the tenant has already left?
                </h3>
                <p className="text-gray-700">
                  Yes! You have 6 years from the date arrears became due to make a claim. Many landlords successfully
                  claim arrears after tenancy ends. You'll need tenant's current address for court service.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">What if I don't know where the tenant lives?</h3>
                <p className="text-gray-700">
                  You can apply to court for "alternative service" (e.g., email, Facebook, last known address). However,
                  if you can't locate them for enforcement, winning the claim won't help you collect. Consider if it's
                  worth pursuing.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I claim interest on the arrears?
                </h3>
                <p className="text-gray-700">
                  Yes! You can claim 8% statutory interest per year on rent arrears (or the rate in your tenancy
                  agreement if higher). Our interest calculator works this out automatically.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What happens if the tenant defends the claim?
                </h3>
                <p className="text-gray-700">
                  If tenant submits a defense, the court will schedule a hearing. You'll need to attend (in person or by
                  phone) and present your evidence (tenancy agreement, rent statements, payment records). Most landlords
                  win if they have proper documentation.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  How do I actually collect the money after winning?
                </h3>
                <p className="text-gray-700">
                  After judgment, if tenant doesn't pay voluntarily, you can use:
                  <br />• Bailiffs (High Court Enforcement Officers) - most effective
                  <br />• Attachment of Earnings - deduct from wages
                  <br />• Charging Order - secure against tenant's property
                  <br />
                  We include guides for all enforcement methods.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  When should I use Money Claims?
                </h3>
                <p className="text-gray-700">
                  Use <strong>Money Claims (£129.99)</strong> when you need to recover rent arrears through the county court.
                  This product focuses specifically on the financial claim process. If your tenant is still in the property
                  and you need to evict them first, start with our{" "}
                  <Link href="/products/notice-only" className="text-primary hover:underline">
                    Notices product
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-linear-to-br from-amber-500 to-orange-600">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Claim Your Arrears?</h2>
            <p className="text-xl mb-8 text-white/90">
              Court-ready money claim documents in 10 minutes. Recover what you're owed.
            </p>
            <Link
              href="/wizard?product=money_claim"
              className="inline-block bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Start Your Claim - £129.99 →
            </Link>
            <p className="mt-4 text-sm text-white/80">Instant download • Legally compliant • No subscription</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
