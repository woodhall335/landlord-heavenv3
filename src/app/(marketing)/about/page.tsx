import type { Metadata } from "next";
import { Container, TealHero } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { generateMetadata, StructuredData, breadcrumbSchema, aboutPageSchema } from "@/lib/seo";
import { LANDLORD_DOCUMENT_PRICE_RANGE } from "@/lib/pricing/products";
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
  title: "About Landlord Heaven | England Landlord Document Platform",
  description:
    "Learn how Landlord Heaven helps landlords in England handle eviction notices, court paperwork, money claims, rent increases, and tenancy agreements in plain English.",
  path: "/about",
  keywords: [
    "about landlord heaven",
    "England landlord documents",
    "section 8 notices",
    "tenancy agreements",
    "possession documents",
  ],
});

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://landlordheaven.co.uk' },
    { name: 'About', url: 'https://landlordheaven.co.uk/about' },
  ];

  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />
      <StructuredData data={aboutPageSchema()} />
      <div className="min-h-screen bg-gray-50">
        <TealHero
        title="You should not need a solicitor just to get the paperwork started"
        subtitle="We help you get the paperwork moving without paying solicitor rates just to start."
        eyebrow="About Landlord Heaven"
      />

      {/* Mission */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">Our Mission</h2>

            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl leading-relaxed mb-6">
                Every year, thousands of landlords face the daunting task of evicting problem tenants or claiming
                unpaid rent. They have two choices: pay solicitors £300-600, or spend hours researching complex legal
                forms and risk getting it wrong.
              </p>

              <p className="text-xl leading-relaxed mb-6">
                <strong>We believe there's a better way.</strong>
              </p>

              <p className="text-xl leading-relaxed">
                Landlord Heaven helps landlords in England put the right paperwork in place in minutes, not hours. We make eviction notices, tenancy agreements, rent increase documents, and money claims easier to start when you need a clear next step without paying solicitor rates just to begin.
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
                  Solicitors often charge £300-600 for eviction documents alone. For many landlords, that is a hard cost to justify when the immediate need is understanding the route, getting the paperwork started, and keeping the case moving.
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
                  and prepares the documents you need for the route you are taking.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>Analyzes 18 eviction grounds in seconds</li>
                  <li>Validates notice periods automatically</li>
                  <li>Checks deposit protection compliance</li>
                  <li>Suggests grounds based on your case</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-charcoal mb-4">Built Around the England Landlord Route</h3>
                <p className="text-gray-700 mb-4">
                  The public site is written for landlords dealing with property in England, so the
                  journey, search pages, and product routing all match the rules landlords are
                  actually searching for.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <Image src="/gb-eng.svg" alt="England" width={16} height={16} className="w-4 h-4" />
                    England: Section 8 notice generation, court possession packs, money claims, rent increases, and tenancy agreements
                  </li>
                  <li className="flex items-center gap-2">
                    Historic non-England cases remain accessible through direct account support
                  </li>
                  <li className="flex items-center gap-2">
                    Public discovery, navigation, and recommendations all follow the same England-first product catalog
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-charcoal mb-4">Fast & Affordable</h3>
                <p className="text-gray-700 mb-4">
                  Generate professional documents in 10-15 minutes for {LANDLORD_DOCUMENT_PRICE_RANGE}. That's 95% cheaper than
                  solicitors, delivered instantly.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>Average completion time: 12 minutes</li>
                  <li>Instant PDF download</li>
                  <li>Save £200-400 vs solicitors</li>
                  <li>Professionally curated documents</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-charcoal mb-4">Documents Built for the Real Process</h3>
                <p className="text-gray-700 mb-4">
                  Our documents use the official forms and formats landlords are expected to rely on for the England routes we publicly support. The goal is to help you start with the right paperwork and avoid obvious errors that slow cases down.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>Official Form 3A, N5, N119, and related England court formats</li>
                  <li>Comply with latest legislation</li>
                  <li>Smart validation before generation</li>
                  <li>Built for the England possession and tenancy routes we publicly sell</li>
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
                    England landlord law changes constantly. We update our public templates and logic
                    every time the live England routes change, including the post-1 May 2026 eviction
                    and tenancy framework updates.
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
                <div className="text-4xl font-bold text-primary mb-2">England</div>
                <p className="text-gray-700 font-semibold">Public Product Focus</p>
              </div>
            </div>

            <div className="bg-success/10 border-l-4 border-success p-6 rounded-r-lg mb-8">
              <h3 className="font-semibold text-charcoal mb-2">Eviction Notice Testimonial</h3>
              <blockquote className="text-gray-700 italic">
                "Saved me £350 vs my solicitor. The notice was accepted by court first time. Took 10 minutes
                to generate. Absolutely brilliant service."
              </blockquote>
              <p className="text-sm text-gray-600 mt-2">- Manchester Landlord, 3 properties</p>
            </div>

            <div className="bg-success/10 border-l-4 border-success p-6 rounded-r-lg">
              <h3 className="font-semibold text-charcoal mb-2">HMO Compliance Testimonial</h3>
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
                  documents with the right structure and language for the route you are following.
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
                  We use actual Form 3A, N5, N119, Form N1, Form 4A, and other official forms - not generic document drafts. Courts require these
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
                  straightforward cases where landlords are confident in their position and want clear guidance on the documents you need for
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
              Join landlords across England who want to save time and money with Landlord Heaven.
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
            <p className="mt-4 text-sm text-gray-600">Preview before you pay | Update and regenerate | One-time pricing</p>
          </div>
        </Container>
      </section>
      </div>
    </>
  );
}


