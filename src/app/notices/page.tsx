import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Landlord Notices & Templates | Rent Increase, Access, Breach | Landlord Heaven",
  description:
    "Professional landlord notice templates for UK properties. Rent increase notices, access notifications, breach notices, lease addendums, and inventory reports. Legally compliant for England, Wales, Scotland, and Northern Ireland.",
};

export default function NoticesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-emerald-600 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Landlord Notices & Templates</h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Professional notice templates for every landlord situation
            </p>
            <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
              From rent increases to property access, breach notifications to lease amendments.
              Generate legally compliant notices in minutes.
            </p>
          </div>
        </Container>
      </section>

      {/* Notice Types Grid */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              Choose Your Notice Type
            </h2>
            <p className="text-center text-gray-600 mb-12">
              All notices are jurisdiction-specific and court-ready
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Rent Increase Notice */}
              <Link
                href="/products/notices/rent-increase"
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Rent Increase Notice</h3>
                <p className="text-gray-700 mb-4 text-sm">
                  Section 13 notices for England & Wales, Scottish rent increase procedures, and Northern Ireland 2025 rules.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-charcoal">£19.99</span>
                </div>
                <div className="text-primary font-semibold text-sm">Learn More →</div>
              </Link>

              {/* Access Notice */}
              <Link
                href="/products/notices/access-notice"
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">🔑</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Access Notice</h3>
                <p className="text-gray-700 mb-4 text-sm">
                  Notify tenants of your right to access for inspections, repairs, viewings, and emergencies. 24-hour notice templates.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-charcoal">£19.99</span>
                </div>
                <div className="text-primary font-semibold text-sm">Learn More →</div>
              </Link>

              {/* Breach Notice */}
              <Link
                href="/products/notices/breach-notice"
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Breach of Tenancy Notice</h3>
                <p className="text-gray-700 mb-4 text-sm">
                  Formally notify tenants of tenancy breaches with opportunity to remedy. Essential evidence for possession claims.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-charcoal">£19.99</span>
                </div>
                <div className="text-primary font-semibold text-sm">Learn More →</div>
              </Link>

              {/* Lease Addendum */}
              <Link
                href="/products/notices/lease-addendum"
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Lease Addendum</h3>
                <p className="text-gray-700 mb-4 text-sm">
                  Amend existing tenancy agreements. Add or remove clauses, update terms, or make corrections with mutual consent.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-charcoal">£19.99</span>
                </div>
                <div className="text-primary font-semibold text-sm">Learn More →</div>
              </Link>

              {/* Inventory Report */}
              <Link
                href="/products/notices/inventory-report"
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Inventory Report</h3>
                <p className="text-gray-700 mb-4 text-sm">
                  Comprehensive property condition documentation for move-in and move-out. Essential for deposit disputes.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-charcoal">£24.99</span>
                </div>
                <div className="text-primary font-semibold text-sm">Learn More →</div>
              </Link>
            </div>

            <div className="mt-12 bg-primary-subtle border border-primary/20 rounded-lg p-6">
              <p className="text-charcoal font-semibold mb-2">🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🇬🇧 Full UK Coverage</p>
              <p className="text-gray-700">
                All notices are jurisdiction-specific and comply with local regulations:
                <br />• <strong>England & Wales:</strong> Current Housing Act requirements
                <br />• <strong>Scotland:</strong> Private Residential Tenancy rules
                <br />• <strong>Northern Ireland:</strong> Latest 2025 regulations
                <br />
                Our templates automatically generate the correct format for your location.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Use Professional Notices */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Why Use Professional Notice Templates?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Legal Compliance</h3>
                <p className="text-gray-700">
                  Ensure your notices meet all legal requirements for your jurisdiction. Improper notices can invalidate
                  possession proceedings and cost you months of lost rent.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">📄</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Court-Ready Evidence</h3>
                <p className="text-gray-700">
                  Professional notices serve as crucial evidence in possession claims and deposit disputes. Courts expect
                  properly formatted, legally compliant documentation.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Save Time</h3>
                <p className="text-gray-700">
                  Generate notices in minutes instead of hours researching requirements and formatting. Our templates
                  include all necessary clauses and legal language.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Professional Presentation</h3>
                <p className="text-gray-700">
                  Well-formatted notices demonstrate professionalism and seriousness. Tenants are more likely to respond
                  appropriately to official-looking documentation.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">💷</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Cost-Effective</h3>
                <p className="text-gray-700">
                  At £19.99 per notice, our templates cost a fraction of solicitor fees (£150-300) while providing the
                  same legal compliance and professional quality.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Reusable Templates</h3>
                <p className="text-gray-700">
                  Each purchase includes editable templates you can adapt for similar situations in the future, making
                  them a valuable addition to your landlord toolkit.
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
                <h3 className="text-xl font-semibold text-charcoal mb-3">Select Notice Type</h3>
                <p className="text-gray-600">
                  Choose the appropriate notice for your situation. Each template includes guidance on when and how to use it.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Complete Details</h3>
                <p className="text-gray-600">
                  Fill in property details, tenant information, dates, and specific circumstances. Our wizard guides you
                  through required information.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Download & Serve</h3>
                <p className="text-gray-600">
                  Download your completed notice as PDF, print, and serve to your tenant following the included serving
                  instructions.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Common Questions */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Common Questions
            </h2>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Are these notices legally valid?
                </h3>
                <p className="text-gray-700">
                  Yes, our notices are based on current UK law and widely-used professional templates. However, we are
                  NOT a law firm. For complex situations or legal disputes, we recommend consulting a solicitor.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Can I edit the notices after purchase?
                </h3>
                <p className="text-gray-700">
                  Yes! All notices are provided as editable PDFs. You can modify content, add specific clauses, or adjust
                  formatting as needed. Just ensure any changes maintain legal compliance.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Which jurisdiction do the notices cover?
                </h3>
                <p className="text-gray-700">
                  All notices are available for England & Wales, Scotland, and Northern Ireland. When you select a notice
                  type, you'll choose your jurisdiction and receive the appropriate template for your location.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  How do I serve the notice to my tenant?
                </h3>
                <p className="text-gray-700">
                  Each notice includes serving instructions specific to the notice type and jurisdiction. Generally, you can
                  serve by hand delivery, recorded delivery post, or email (if agreed in the tenancy). Always keep proof of service.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-700">
                  We offer refunds within 14 days if the template doesn't meet your needs. However, we cannot offer refunds
                  once a notice has been served to a tenant.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Generate Your Notice?</h2>
            <p className="text-xl mb-8 text-white/90">
              Professional, legally compliant notices in minutes. Choose your notice type above to get started.
            </p>
            <p className="text-sm text-white/80">One-time payment • Instant download • No subscription required</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
