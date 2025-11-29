import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tenancy Agreements - AST, PRT, NI | Landlord Heaven",
  description:
    "Legally compliant tenancy agreements for UK landlords. Curated by Landlord Heaven. Standard (£39.99) or Premium (£59.00). Covers England & Wales, Scotland, Northern Ireland.",
};

export default function ASTPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary to-emerald-600 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tenancy Agreements</h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Curated by Landlord Heaven - Legally Compliant ASTs, PRTs & NI Tenancies
            </p>
            <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
              Choose between Standard (£39.99) or Premium (£59.00) depending on your property complexity and protection
              needs
            </p>
          </div>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              Standard vs Premium
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Both are legally valid. Premium adds extra protection and customization.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Standard AST */}
              <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                <div className="bg-gray-100 p-6 text-center">
                  <h3 className="text-2xl font-bold text-charcoal mb-2">Standard AST</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-charcoal">£39.99</span>
                  </div>
                  <p className="text-sm text-gray-600">Perfect for straightforward lettings</p>
                </div>

                <div className="p-6">
                  <h4 className="font-semibold text-charcoal mb-4">What's Included:</h4>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">Core clauses (rent, deposit, duration, notice)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">Tenant responsibilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">Landlord access rights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">Break clause (optional)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">Pets clause (allowed/not allowed)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">Basic repair obligations</span>
                    </li>
                  </ul>

                  <h4 className="font-semibold text-charcoal mb-3">Best For:</h4>
                  <ul className="space-y-2 mb-6 text-sm text-gray-700">
                    <li>✓ Standard residential properties</li>
                    <li>✓ Single tenants or couples</li>
                    <li>✓ Simple, straightforward lettings</li>
                    <li>✓ First-time landlords</li>
                  </ul>

                  <Link
                    href="/wizard?product=ast_standard"
                    className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
                  >
                    Get Standard - £39.99
                  </Link>
                </div>
              </div>

              {/* Premium AST */}
              <div className="bg-white rounded-lg border-2 border-primary overflow-hidden shadow-lg relative">
                <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMENDED
                </div>
                <div className="bg-linear-to-br from-primary to-emerald-600 text-white p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">Premium AST</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold">£59.00</span>
                  </div>
                  <p className="text-sm text-white/90">Maximum protection & customization</p>
                </div>

                <div className="p-6">
                  <h4 className="font-semibold text-charcoal mb-4">Everything in Standard, PLUS:</h4>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        <strong>HMO-ready clauses</strong> (room licenses, shared facilities)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        <strong>Joint & several liability</strong> (all tenants responsible for full rent)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        <strong>Guarantor clauses</strong> (parent/employer guarantees)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        <strong>Rent increase provisions</strong> (RPI/CPI annual increases)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        <strong>Furnished inventory schedule</strong> (detailed item list)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        <strong>Professional cleaning clause</strong> (end of tenancy)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        <strong>Subletting prohibition</strong> (strict Airbnb prevention)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        <strong>Utility payment clauses</strong> (who pays what)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        <strong>Insurance requirements</strong> (tenant contents insurance)
                      </span>
                    </li>
                  </ul>

                  <h4 className="font-semibold text-charcoal mb-3">Best For:</h4>
                  <ul className="space-y-2 mb-6 text-sm text-gray-700">
                    <li>✓ HMOs (multi-tenant properties)</li>
                    <li>✓ Student lettings</li>
                    <li>✓ Higher-value properties</li>
                    <li>✓ Professional landlords with portfolios</li>
                    <li>✓ Complex tenancy arrangements</li>
                  </ul>

                  <Link
                    href="/wizard?product=ast_premium"
                    className="block w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-emerald-600 transition-colors"
                  >
                    Get Premium - £59.00
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-primary-subtle border border-primary/20 rounded-lg p-6">
              <p className="text-charcoal font-semibold mb-2">🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🇬🇧 Full UK Coverage</p>
              <p className="text-gray-700">
                Both Standard and Premium work across the UK:
                <br />• <strong>England & Wales:</strong> Assured Shorthold Tenancy (AST)
                <br />• <strong>Scotland:</strong> Private Residential Tenancy (PRT)
                <br />• <strong>Northern Ireland:</strong> Private Tenancy Agreement
                <br />
                Our wizard automatically generates the correct format for your jurisdiction.
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

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Answer Questions</h3>
                <p className="text-gray-600">
                  Tell us about your property, tenancy dates, rent amount, deposit, special clauses (pets, break clause,
                  etc.)
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Agreement Generated</h3>
                <p className="text-gray-600">
                  We create a jurisdiction-specific agreement with all clauses pre-filled based on your answers. Review and
                  customize if needed.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Download & Sign</h3>
                <p className="text-gray-600">
                  Download as PDF, print, and get signatures from all parties. Provide copy to tenant as required by
                  law.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-charcoal mb-3">What You'll Receive:</h4>
              <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Main tenancy agreement (10-20 pages)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Prescribed information form (deposits)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> How to Rent guide (England)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> EPC, Gas Safety, EICR checklists
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Signature page template
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span> Tenant welcome letter
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Choose Premium */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              When to Choose Premium
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🏠</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">HMOs & Multi-Tenant</h3>
                <p className="text-gray-700 mb-3">
                  If you're letting to multiple unrelated tenants, Premium is essential. It includes:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Joint & several liability clauses</li>
                  <li>• Shared facilities rules</li>
                  <li>• Individual room licenses</li>
                  <li>• Tenant replacement provisions</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🎓</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Student Lettings</h3>
                <p className="text-gray-700 mb-3">Premium protects you from common student tenancy risks:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Guarantor requirements (parents)</li>
                  <li>• Anti-Airbnb/subletting clauses</li>
                  <li>• Professional cleaning end-clause</li>
                  <li>• Noise/anti-social behavior terms</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">💼</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Professional Landlords</h3>
                <p className="text-gray-700 mb-3">Managing multiple properties? Premium offers:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Rent increase mechanisms (CPI/RPI)</li>
                  <li>• Stronger termination clauses</li>
                  <li>• Detailed inventory schedules</li>
                  <li>• Utility payment clarity</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">High-Value Properties</h3>
                <p className="text-gray-700 mb-3">
                  For properties worth £300k+ or rent £1,500+/month, Premium provides:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Comprehensive insurance requirements</li>
                  <li>• Detailed maintenance obligations</li>
                  <li>• Garden/exterior care clauses</li>
                  <li>• Professional cleaning standards</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-700 mb-4">
                <strong>Still unsure?</strong> Our wizard will ask about your property and recommend Standard or Premium
                based on your answers.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Jurisdiction-Specific */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Jurisdiction-Specific Agreements
            </h2>

            <div className="space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                  <h3 className="text-xl font-semibold text-charcoal">England & Wales - AST</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Assured Shorthold Tenancy (AST) under Housing Act 1988. Includes all mandatory requirements:
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✓ Section 21 compliance (6-month minimum, deposit protection, prescribed info)</li>
                  <li>✓ How to Rent guide (mandatory for Section 21)</li>
                  <li>✓ Right to Rent check reminders</li>
                  <li>✓ Deposit protection scheme details</li>
                </ul>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
                  <h3 className="text-xl font-semibold text-charcoal">Scotland - PRT</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Private Residential Tenancy (PRT) under Private Housing (Tenancies) (Scotland) Act 2016:
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✓ Open-ended tenancy (no fixed term)</li>
                  <li>✓ Rent pressure zone compliance</li>
                  <li>✓ 18 eviction grounds properly worded</li>
                  <li>✓ First-tier Tribunal notice periods</li>
                  <li>✓ Repairing Standard compliance</li>
                </ul>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🇬🇧</span>
                  <h3 className="text-xl font-semibold text-charcoal">Northern Ireland</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Private Tenancy Agreement under Private Tenancies (Northern Ireland) Order 2006:
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✓ Tenancy deposit scheme registration (TDS NI)</li>
                  <li>✓ Notice to Quit provisions</li>
                  <li>✓ Fitness standard compliance</li>
                  <li>✓ Landlord registration requirements</li>
                </ul>
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
                  Is this legally valid or do I need a solicitor?
                </h3>
                <p className="text-gray-700">
                  Both Standard and Premium are legally valid tenancy agreements used by thousands of UK landlords.
                  However, we are NOT a law firm. For complex situations (commercial let, unusual clauses, legal
                  disputes), consult a solicitor.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">Can I edit the agreement?</h3>
                <p className="text-gray-700">
                  Yes! You receive an editable PDF. You can modify clauses, add custom terms, or remove sections. Just
                  ensure any changes comply with tenancy law in your jurisdiction.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What's the difference between Standard and Premium?
                </h3>
                <p className="text-gray-700">
                  Standard (£39.99) covers basic clauses for simple lettings. Premium (£59.00) adds 10+ advanced
                  clauses: HMO provisions, guarantors, rent increases, detailed inventory, insurance requirements, and
                  stronger protections. See comparison table above.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I use this for lodgers or live-in landlords?
                </h3>
                <p className="text-gray-700">
                  No. This is for ASTs/PRTs where the landlord doesn't live in the property. For lodger agreements
                  (resident landlord), you need a different agreement type. Contact us if you need this.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What if I need to make changes after signing?
                </h3>
                <p className="text-gray-700">
                  You can create addendums/amendments signed by both parties. For major changes (rent increase, adding
                  tenant), you may need a new agreement. You can regenerate unlimited times before signing.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Do you include the How to Rent guide?
                </h3>
                <p className="text-gray-700">
                  Yes (England only). We include the latest government How to Rent guide which is mandatory for Section
                  21 notices. Scotland and Northern Ireland have different requirements which are also included.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-linear-to-br from-primary to-emerald-600">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Your Tenancy Agreement?</h2>
            <p className="text-xl mb-8 text-white/90">
              Choose Standard or Premium. Get your jurisdiction-specific agreement in 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/wizard?product=ast_standard"
                className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Standard - £39.99 →
              </Link>
              <Link
                href="/wizard?product=ast_premium"
                className="inline-block bg-charcoal text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors"
              >
                Premium - £59.00 →
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/80">Instant download • Legally compliant • No subscription required</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
