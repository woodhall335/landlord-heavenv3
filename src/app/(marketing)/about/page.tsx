import type { Metadata } from "next";
import { Container, TealHero } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { generateMetadata, StructuredData, breadcrumbSchema, aboutPageSchema } from "@/lib/seo";
import {
  BadgePoundSterling,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  Zap,
  Building2,
  Database,
  CreditCard,
  FileText,
  AlertTriangle
} from "lucide-react";

export const metadata: Metadata = generateMetadata({
  title: "About Us - Mission & Story",
  description: "Landlord Heaven delivers UK landlord legal infrastructure with jurisdiction-specific case bundles for evictions, tenancies, and HMO compliance.",
  path: "/about",
});

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://landlordheaven.com' },
    { name: 'About', url: 'https://landlordheaven.com/about' },
  ];

  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />
      <StructuredData data={aboutPageSchema()} />
      <div className="min-h-screen bg-gray-50">
        <TealHero
        title="Case preparation should be statutory-grounded"
        subtitle="We make professional-grade landlord paperwork accessible, affordable, and compliant across the UK."
        eyebrow="About Landlord Heaven"
      />

      {/* Mission */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">Our Mission</h2>

            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl leading-relaxed mb-6">
                Every year, thousands of UK landlords face the daunting task of evicting problem tenants or claiming
                unpaid rent. They have two choices: pay solicitors £300-600, or spend hours researching complex legal
                forms and risk getting it wrong.
              </p>

              <p className="text-xl leading-relaxed mb-6">
                <strong>We believe there's a better way.</strong>
              </p>

              <p className="text-xl leading-relaxed">
                Landlord Heaven generates court-ready, jurisdiction-specific case bundles in minutes, not hours. We've made
                professional-quality eviction notices, tenancy agreements, and court claims accessible to every UK
                landlord - at a fraction of solicitor costs.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* The Problem */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">The Problem We Solve</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BadgePoundSterling className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Too Expensive</h3>
                <p className="text-gray-700">
                  Solicitors charge £300-600 for eviction documents. For many landlords, this is unaffordable -
                  especially when dealing with rent arrears.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Too Slow</h3>
                <p className="text-gray-700">
                  Solicitors take days or weeks. DIY landlords spend hours researching forms, notice periods, and legal
                  requirements - and still make mistakes.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Too Risky</h3>
                <p className="text-gray-700">
                  One mistake (wrong notice period, missing deposit protection proof, incorrect grounds) can invalidate
                  your case and cost months of lost rent.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Solution */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">Our Solution</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-charcoal mb-4">Smart Document Generation</h3>
                <p className="text-gray-700 mb-4">
                  Our system analyzes your case, selects the correct notice type, calculates notice periods,
                  and generates court-ready documents.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✓ Analyzes 18 eviction grounds in seconds</li>
                  <li>✓ Validates notice periods automatically</li>
                  <li>✓ Checks deposit protection compliance</li>
                  <li>✓ Suggests grounds based on your case</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-charcoal mb-4">UK-Wide Coverage</h3>
                <p className="text-gray-700 mb-4">
                  We support England & Wales, Scotland, AND Northern Ireland. Different
                  jurisdictions have different laws - we handle all of them.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <Image src="/gb-eng.svg" alt="England" width={16} height={16} className="w-4 h-4" />
                    <Image src="/gb-wls.svg" alt="Wales" width={16} height={16} className="w-4 h-4" />
                    England & Wales: Section 8/21, ASTs, Form 6A
                  </li>
                  <li className="flex items-center gap-2">
                    <Image src="/gb-sct.svg" alt="Scotland" width={16} height={16} className="w-4 h-4" />
                    Scotland: Notice to Leave, PRTs, AT6
                  </li>
                  <li className="flex items-center gap-2">
                    <Image src="/gb-nir.svg" alt="Northern Ireland" width={16} height={16} className="w-4 h-4" />
                    Northern Ireland: Tenancy agreements (eviction notices coming 2026)
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-charcoal mb-4">Fast & Affordable</h3>
                <p className="text-gray-700 mb-4">
                  Generate professional documents in 10-15 minutes for £14.99-£129.99. That's 95% cheaper than
                  solicitors, delivered instantly.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✓ Average completion time: 12 minutes</li>
                  <li>✓ Instant PDF download</li>
                  <li>✓ Save £200-400 vs solicitors</li>
                  <li>✓ Professionally curated documents</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-charcoal mb-4">Court-Ready Quality</h3>
                <p className="text-gray-700 mb-4">
                  Our documents use official government forms and are accepted by all UK courts and tribunals.
                  Thousands of successful cases.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✓ Official Form 6A, N5, AT6 formats</li>
                  <li>✓ Comply with latest legislation</li>
                  <li>✓ Smart validation before generation</li>
                  <li>✓ Accepted by all UK courts</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">Our Values</h2>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Transparency First</h3>
                  <p className="text-gray-700">
                    No hidden fees. No surprises. We're upfront about what we do, what we don't do (we're NOT a law
                    firm), and what you're paying for. Clear pricing, clear disclaimers, clear communication.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Quality Over Quantity</h3>
                  <p className="text-gray-700">
                    We use advanced technology - not the cheapest. We validate every document before
                    generation. We'd rather generate fewer high-quality documents than thousands of incorrect ones.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Continuous Improvement</h3>
                  <p className="text-gray-700">
                    UK tenancy law changes constantly. We update our templates and logic every time
                    legislation changes. Recent updates: Renters Reform Bill monitoring, Scotland rent controls, NI
                    tenancy deposit changes.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Customer Support Matters</h3>
                  <p className="text-gray-700">
                    We respond to every email within 24 hours. If our documents have errors, we fix them and refund
                    you. If you're confused, we explain. We're here to help - not just take your money.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Signals */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Why Landlords Trust Us
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">2,000+</div>
                <p className="text-gray-700 font-semibold">Documents Generated</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">4.8/5</div>
                <p className="text-gray-700 font-semibold">Average Rating</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-gray-700 font-semibold">UK Coverage</p>
              </div>
            </div>

            <div className="bg-success/10 border-l-4 border-success p-6 rounded-r-lg mb-8">
              <h3 className="font-semibold text-charcoal mb-2">✅ Eviction Notice Testimonial</h3>
              <blockquote className="text-gray-700 italic">
                "Saved me £350 vs my solicitor. The Section 21 notice was accepted by court first time. Took 10 minutes
                to generate. Absolutely brilliant service."
              </blockquote>
              <p className="text-sm text-gray-600 mt-2">- Manchester Landlord, 3 properties</p>
            </div>

            <div className="bg-success/10 border-l-4 border-success p-6 rounded-r-lg">
              <h3 className="font-semibold text-charcoal mb-2">✅ HMO Compliance Testimonial</h3>
              <blockquote className="text-gray-700 italic">
                "I manage 12 HMOs. HMO Pro has saved me from missing two license renewals (£30k+ fines avoided). Best
                £30/month I spend."
              </blockquote>
              <p className="text-sm text-gray-600 mt-2">- Leeds Portfolio Landlord, 12 HMOs</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Technology */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">Our Technology</h2>

            <div className="prose prose-lg max-w-none text-gray-700 mb-8">
              <p className="text-lg">
                We're not just another template service. We use advanced technology to truly understand your case and
                generate legally accurate documents.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  AI-Powered Generation
                </h4>
                <p className="text-sm text-gray-700">
                  Advanced technology for legal reasoning. Analyzes your case, validates inputs, and generates
                  court-ready documents with proper legal language.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-primary" />
                  </div>
                  Supabase (Database)
                </h4>
                <p className="text-sm text-gray-700">
                  Secure UK/EU cloud storage for your documents and account data. Enterprise-grade encryption and
                  backups.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  Stripe (Payments)
                </h4>
                <p className="text-sm text-gray-700">
                  Industry-leading payment processing. PCI-DSS compliant. We never see or store your card details.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  Official Government Forms
                </h4>
                <p className="text-sm text-gray-700">
                  We use actual Form 6A, N5, AT6, and other official forms - not generic templates. Courts require these
                  specific formats.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="bg-warning/10 border-l-4 border-warning p-8 rounded-r-lg">
              <h3 className="text-2xl font-semibold text-charcoal mb-4 flex items-center gap-2">
                <AlertTriangle className="w-7 h-7 text-warning" />
                Important Legal Notice
              </h3>
              <div className="prose prose-gray max-w-none text-gray-700">
                <p className="mb-3">
                  <strong>Landlord Heaven is NOT a law firm and does NOT provide legal advice.</strong>
                </p>
                <p className="mb-3">
                  We provide document generation services. Our platform helps you create legally valid
                  documents based on information you provide, but:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>We cannot give legal opinions on your specific case</li>
                  <li>We cannot represent you in court</li>
                  <li>We cannot guarantee outcomes</li>
                  <li>We cannot provide strategic legal advice</li>
                </ul>
                <p className="mt-3">
                  <strong>For legal advice, consult a qualified solicitor.</strong> Our service is designed for
                  straightforward cases where landlords are confident in their position and want jurisdiction-specific statutory guidance for
                  document preparation.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Join thousands of UK landlords who've saved time and money with Landlord Heaven.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="hero-btn-primary"
              >
                View Pricing →
              </Link>
              <Link
                href="/wizard?src=about"
                className="hero-btn-secondary"
              >
                Start Wizard →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">Court-ready case bundles • AI-powered • statutory-grounded preparation</p>
          </div>
        </Container>
      </section>
      </div>
    </>
  );
}
