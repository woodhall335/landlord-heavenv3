import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eviction Forms & Notices - Section 21, Section 8, Notice to Leave | Landlord Heaven",
  description:
    "Legally compliant eviction notices for UK landlords. Curated by Landlord Heaven. £29.99 per notice. Section 21, Section 8 (England & Wales), Notice to Leave (Scotland), Notice to Quit (Northern Ireland).",
  keywords: "eviction notice, section 21, section 8, notice to leave, notice to quit, landlord eviction forms, tenant eviction UK, possession notice",
};

export default function EvictionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-emerald-600 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Eviction Forms & Notices</h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Curated by Landlord Heaven - Legally Compliant Eviction Notices for All UK Jurisdictions
            </p>
            <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
              Professional eviction notices from £29.99. Fully compliant with current legislation across England & Wales, Scotland, and Northern Ireland.
            </p>
          </div>
        </Container>
      </section>

      {/* Jurisdiction Selector */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              Select Your Jurisdiction
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Eviction procedures vary across the UK. Choose your jurisdiction to see the correct forms.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* England & Wales */}
              <Link href="/eviction/england-wales" className="group">
                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-primary hover:shadow-lg transition-all">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 text-center">
                    <span className="text-4xl mb-3 block">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                    <h3 className="text-2xl font-bold mb-2">England & Wales</h3>
                    <p className="text-sm text-white/90">Housing Act 1988</p>
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-charcoal mb-3">Available Forms:</h4>
                    <ul className="space-y-2 text-sm text-gray-700 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        <span><strong>Section 21:</strong> No-fault eviction (2 months notice)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        <span><strong>Section 8:</strong> Fault-based eviction (17 grounds)</span>
                      </li>
                    </ul>
                    <div className="text-primary font-semibold group-hover:underline">
                      View Forms →
                    </div>
                  </div>
                </div>
              </Link>

              {/* Scotland */}
              <Link href="/eviction/scotland" className="group">
                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-primary hover:shadow-lg transition-all">
                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 text-center">
                    <span className="text-4xl mb-3 block">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
                    <h3 className="text-2xl font-bold mb-2">Scotland</h3>
                    <p className="text-sm text-white/90">Private Housing Act 2016</p>
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-charcoal mb-3">Available Forms:</h4>
                    <ul className="space-y-2 text-sm text-gray-700 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        <span><strong>Notice to Leave:</strong> 18 eviction grounds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        <span>First-tier Tribunal application required</span>
                      </li>
                    </ul>
                    <div className="text-primary font-semibold group-hover:underline">
                      View Forms →
                    </div>
                  </div>
                </div>
              </Link>

              {/* Northern Ireland */}
              <Link href="/eviction/northern-ireland" className="group">
                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-primary hover:shadow-lg transition-all">
                  <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 text-center">
                    <span className="text-4xl mb-3 block">🇬🇧</span>
                    <h3 className="text-2xl font-bold mb-2">Northern Ireland</h3>
                    <p className="text-sm text-white/90">Private Tenancies Order 2006</p>
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-charcoal mb-3">Available Forms:</h4>
                    <ul className="space-y-2 text-sm text-gray-700 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        <span><strong>Notice to Quit:</strong> Ends periodic tenancy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        <span>2025 updates included (28/56/84 day notice)</span>
                      </li>
                    </ul>
                    <div className="text-primary font-semibold group-hover:underline">
                      View Forms →
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Proper Eviction Notices Matter */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Why Proper Eviction Notices Are Critical
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Legal Compliance</h3>
                <p className="text-gray-700">
                  Invalid notices can be rejected by courts, costing you months of delay and lost rent. Our notices are carefully crafted to meet all legal requirements.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Correct Notice Periods</h3>
                <p className="text-gray-700">
                  Different notice types require different notice periods. Section 21 needs 2 months, Section 8 varies by ground (2 weeks to 2 months).
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Mandatory Information</h3>
                <p className="text-gray-700">
                  Each jurisdiction requires specific information and wording. Missing details can invalidate your notice completely.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Court-Ready Format</h3>
                <p className="text-gray-700">
                  If you need to apply for possession, judges expect properly formatted notices. Our templates are accepted by courts across the UK.
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

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Select Your Jurisdiction</h3>
                <p className="text-gray-600">
                  Choose England & Wales, Scotland, or Northern Ireland to see the correct eviction forms for your location.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Fill in Details</h3>
                <p className="text-gray-600">
                  Our wizard asks for tenant names, property address, grounds for eviction, and calculates the correct notice period.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Download & Serve</h3>
                <p className="text-gray-600">
                  Download your professionally formatted notice immediately. Serve to tenant according to legal requirements.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h4 className="font-semibold text-amber-900 mb-3">⚠️ Important: Serving Your Notice</h4>
              <p className="text-gray-700 text-sm">
                Creating the notice is just the first step. You must serve it correctly according to your jurisdiction's rules (hand delivery, registered post, or as specified in tenancy agreement). Keep proof of service - you'll need it if the case goes to court.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Common Eviction Scenarios */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Common Eviction Scenarios
            </h2>

            <div className="space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    🏠
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Selling the Property</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Best option:</strong> Section 21 (England & Wales), Notice to Leave Ground 1 (Scotland), Notice to Quit (Northern Ireland)
                    </p>
                    <p className="text-sm text-gray-600">
                      Use no-fault eviction when you need possession for a legitimate reason. Ensure all compliance requirements are met (deposit protection, certificates, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Rent Arrears</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Best option:</strong> Section 8 Ground 8 or 10 (England & Wales), Notice to Leave Ground 12 (Scotland)
                    </p>
                    <p className="text-sm text-gray-600">
                      For serious rent arrears (2+ months for Ground 8), fault-based eviction is faster. Mandatory grounds mean court must grant possession if proven.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                    🚫
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Anti-Social Behavior</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Best option:</strong> Section 8 Ground 14 (England & Wales), Notice to Leave Ground 15 (Scotland)
                    </p>
                    <p className="text-sm text-gray-600">
                      Document all incidents with dates, times, and witness statements. Anti-social behavior grounds require strong evidence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                    🔨
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Property Damage</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Best option:</strong> Section 8 Ground 13 (England & Wales), Notice to Leave Ground 14 (Scotland)
                    </p>
                    <p className="text-sm text-gray-600">
                      Take photos of damage and get repair quotes. Deterioration of property or furniture beyond normal wear and tear is a valid eviction ground.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Simple, Transparent Pricing
            </h2>

            <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center max-w-md mx-auto">
              <div className="text-5xl font-bold text-primary mb-2">£29.99</div>
              <p className="text-gray-600 mb-6">Per eviction notice</p>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">Jurisdiction-specific legal compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">Automatic notice period calculation</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">Court-ready professional formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">Instant PDF download</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">No subscription required</span>
                </li>
              </ul>

              <Link
                href="#"
                className="block w-full bg-primary text-white px-8 py-4 rounded-lg font-semibold text-center hover:bg-emerald-600 transition-colors"
              >
                Select Your Jurisdiction
              </Link>
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
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Are these notices legally valid?
                </h3>
                <p className="text-gray-700">
                  Yes. Our eviction notices are curated to comply with current legislation in each UK jurisdiction. However, you must ensure you meet all prerequisites (deposit protection, certificates, etc.) and serve the notice correctly.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What's the difference between Section 21 and Section 8?
                </h3>
                <p className="text-gray-700">
                  Section 21 is a "no-fault" eviction - you don't need a reason, but you need 2 months notice and must meet strict compliance requirements. Section 8 is "fault-based" - you need a specific ground (rent arrears, damage, etc.) and notice periods vary from 2 weeks to 2 months depending on the ground.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I use a Section 21 notice immediately?
                </h3>
                <p className="text-gray-700">
                  No. You cannot serve a Section 21 notice during the first 4 months of a tenancy. You must also have protected the deposit, provided prescribed information, gas safety certificate, EPC, electrical safety certificate, and How to Rent guide. Our wizard checks these prerequisites.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  How do I serve the notice?
                </h3>
                <p className="text-gray-700">
                  Methods vary but typically include: hand delivery to tenant, registered/recorded post, or as specified in your tenancy agreement. Always keep proof of service (witness signature, postal receipt, etc.) as you'll need this for court.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  What if the tenant doesn't leave after the notice period?
                </h3>
                <p className="text-gray-700">
                  You must apply to court for a possession order. Never forcibly evict a tenant yourself - this is illegal. In England & Wales, apply using Form N5 (Section 8) or Form N5B (Section 21). In Scotland, apply to the First-tier Tribunal. In Northern Ireland, apply to the county court.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I edit the notice after downloading?
                </h3>
                <p className="text-gray-700">
                  We strongly recommend not editing the legal wording of notices, as this may invalidate them. If you need to make changes, regenerate through our wizard instead.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary to-emerald-600">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Your Eviction Notice?</h2>
            <p className="text-xl mb-8 text-white/90">
              Choose your jurisdiction to get started with a legally compliant notice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/eviction/england-wales"
                className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                England & Wales →
              </Link>
              <Link
                href="/eviction/scotland"
                className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Scotland →
              </Link>
              <Link
                href="/eviction/northern-ireland"
                className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Northern Ireland →
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/80">£29.99 per notice • Instant download • No subscription required</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
