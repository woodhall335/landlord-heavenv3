/**
 * Landing Page - Redesigned
 *
 * High-converting landing page for Landlord Heaven.
 * Optimized for trust, value clarity, and conversion.
 *
 * Section Order (optimized for conversion):
 * 1. Hero - Value proposition and primary CTA
 * 2. Trust Bar - Immediate credibility signals
 * 3. Cost Comparison - Anchor value vs solicitors
 * 4. How It Works - Reduce anxiety, show simplicity
 * 5. Products - Clear offerings with pricing
 * 6. Testimonials - Social proof with outcomes
 * 7. UK Coverage - Jurisdiction-specific reassurance
 * 8. FAQ - Address objections
 * 9. Final CTA - Strong closing with value recap
 *
 * Design Principles:
 * - Trust-first: Professional, clean, credible
 * - Value clarity: Savings immediately obvious
 * - Anxiety reduction: Simple process, support available
 * - Action-oriented: Single primary CTA per section
 */

"use client";

import Link from "next/link";
import { Container } from "@/components/ui";
import { TrustBar, CostComparison, Testimonials, FAQ } from "@/components/landing";
import { RiFileTextLine, RiScales3Line, RiMoneyPoundCircleLine, RiClipboardLine, RiCheckLine, RiArrowRightLine, RiTimeLine, RiShieldCheckLine, RiGlobalLine, RiFlashlightLine } from 'react-icons/ri';

export default function Home() {
  return (
    <div className="bg-white">
      {/* ============================================================
          HERO SECTION
          Purpose: Clear value proposition, primary CTA, trust indicators
          ============================================================ */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm border border-purple-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ UK Landlords</span>
            </div>

            {/* Main Headline - Value-focused */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Court-Ready Legal Documents
              <span className="block text-primary">in Minutes, Not Days</span>
            </h1>

            {/* Subheadline - Benefit + differentiation */}
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto">
              Generate compliant eviction notices, court forms, and tenancy agreements —
              <span className="font-semibold text-gray-800"> save 80%+ vs solicitor fees</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/wizard"
                className="group flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
              >
                Generate Your Documents
                <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="text-gray-700 hover:text-primary font-semibold px-6 py-4 transition-colors"
              >
                View Pricing →
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <RiCheckLine className="w-4 h-4 text-green-500" />
                Instant download
              </span>
              <span className="flex items-center gap-1.5">
                <RiCheckLine className="w-4 h-4 text-green-500" />
                Court-ready format
              </span>
              <span className="flex items-center gap-1.5">
                <RiCheckLine className="w-4 h-4 text-green-500" />
                All UK jurisdictions
              </span>
              <span className="flex items-center gap-1.5">
                <RiCheckLine className="w-4 h-4 text-green-500" />
                No legal experience needed
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          TRUST BAR
          Purpose: Build immediate credibility with security signals
          ============================================================ */}
      <TrustBar />

      {/* ============================================================
          COST COMPARISON
          Purpose: Anchor value proposition vs solicitors
          ============================================================ */}
      <CostComparison />

      {/* ============================================================
          HOW IT WORKS
          Purpose: Reduce anxiety, show simplicity
          ============================================================ */}
      <section className="py-20 md:py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-14">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-primary">Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Your Documents in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our guided wizard makes creating professional legal documents easy —
              no legal experience required.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Steps with connecting line */}
            <div className="relative">
              {/* Connecting line (desktop only) */}
              <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-purple-200" />

              <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                <Step
                  number="1"
                  title="Answer Questions"
                  description="Tell us about your situation. Our wizard asks simple questions about your property, tenant, and what you need."
                  time="5-10 minutes"
                />
                <Step
                  number="2"
                  title="Review & Customize"
                  description="We generate the right documents for your jurisdiction. Review them, make any edits, and approve."
                  time="2-3 minutes"
                />
                <Step
                  number="3"
                  title="Download & Serve"
                  description="Pay securely and instantly download your documents with service instructions and checklists."
                  time="Instant"
                />
              </div>
            </div>

            <div className="mt-14 text-center">
              <Link
                href="/wizard"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
              >
                Start Your Documents Now
                <RiArrowRightLine className="w-5 h-5" />
              </Link>
              <p className="mt-4 text-sm text-gray-500">Free to start • Pay only when you're ready</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          PRODUCTS
          Purpose: Clear product offerings with pricing
          ============================================================ */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-14">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-primary">Our Products</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Tenancies
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From serving notices to recovering rent — professional documents at a fraction of solicitor costs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <ProductCard
              href="/products/notice-only"
              title="Eviction Notices"
              description="Section 8, Section 21, and devolved equivalents with service instructions."
              price="£29.99"
              solicitorPrice="£200-300"
              icon={<RiFileTextLine className="w-7 h-7" />}
            />
            <ProductCard
              href="/products/complete-pack"
              title="Complete Eviction Pack"
              description="Full bundle from notice to possession order with court forms and guidance."
              price="£149.99"
              solicitorPrice="£500-800"
              icon={<RiScales3Line className="w-7 h-7" />}
              popular
            />
            <ProductCard
              href="/products/money-claim"
              title="Money Claim Pack"
              description="Rent arrears claims with evidence checklists and particulars of claim."
              price="£179.99"
              solicitorPrice="£400-600"
              icon={<RiMoneyPoundCircleLine className="w-7 h-7" />}
            />
            <ProductCard
              href="/products/ast"
              title="Tenancy Agreements"
              description="Compliant ASTs with optional clauses for HMOs and students."
              price="From £9.99"
              solicitorPrice="£150-400"
              icon={<RiClipboardLine className="w-7 h-7" />}
            />
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/pricing"
              className="text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-2"
            >
              Compare all products and features
              <RiArrowRightLine className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* ============================================================
          TESTIMONIALS
          Purpose: Social proof with specific outcomes
          ============================================================ */}
      <Testimonials />

      {/* ============================================================
          UK COVERAGE
          Purpose: Jurisdiction-specific reassurance
          ============================================================ */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-14">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-primary">UK-Wide Coverage</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Right Documents for Your Region
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Housing law differs across the UK. We automatically generate jurisdiction-specific documents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <JurisdictionCard
              flag="/gb-eng.svg"
              title="England"
              forms={["Assured Shorthold Tenancy", "Section 21 Notice", "Section 8 Notice", "County Court Forms"]}
            />
            <JurisdictionCard
              flag="/gb-wls.svg"
              title="Wales"
              forms={["Standard Occupation Contract", "Section 173 Notice", "Renting Homes Act Forms", "County Court Forms"]}
            />
            <JurisdictionCard
              flag="/gb-sct.svg"
              title="Scotland"
              forms={["Private Residential Tenancy", "Notice to Leave", "First-tier Tribunal Forms", "Simple Procedure"]}
            />
            <JurisdictionCard
              flag="/gb-nir.svg"
              title="Northern Ireland"
              forms={["Private Tenancy Agreement", "Notice to Quit", "Private Tenancies Order", "Court Forms"]}
            />
          </div>
        </Container>
      </section>

      {/* ============================================================
          FAQ
          Purpose: Address objections, reduce friction
          ============================================================ */}
      <FAQ />

      {/* ============================================================
          FINAL CTA
          Purpose: Strong closing with value recap
          ============================================================ */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary to-primary-dark">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Your Documents?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join 10,000+ landlords saving time and money.
              <span className="font-semibold text-white"> Start in under 2 minutes.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/wizard"
                className="group flex items-center gap-2 bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg w-full sm:w-auto justify-center"
              >
                Generate Your Documents
                <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Final trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-purple-100">
              <span className="flex items-center gap-2">
                <RiFlashlightLine className="w-5 h-5" />
                Instant download
              </span>
              <span className="flex items-center gap-2">
                <RiShieldCheckLine className="w-5 h-5" />
                Court-ready guarantee
              </span>
              <span className="flex items-center gap-2">
                <RiGlobalLine className="w-5 h-5" />
                All UK jurisdictions
              </span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

/* ============================================================
   LOCAL COMPONENTS
   ============================================================ */

function Step({
  number,
  title,
  description,
  time,
}: {
  number: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="text-center relative">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 relative z-10 shadow-lg">
        {number}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
        <RiTimeLine className="w-4 h-4" />
        {time}
      </div>
    </div>
  );
}

function ProductCard({
  href,
  title,
  description,
  price,
  solicitorPrice,
  icon,
  popular,
}: {
  href: string;
  title: string;
  description: string;
  price: string;
  solicitorPrice: string;
  icon: React.ReactNode;
  popular?: boolean;
}) {
  return (
    <Link href={href} className="group relative">
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            MOST POPULAR
          </span>
        </div>
      )}
      <div className={`bg-white rounded-2xl border-2 p-8 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${popular ? 'border-primary' : 'border-gray-100 hover:border-primary'}`}>
        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 text-sm">{description}</p>

        <div className="border-t border-gray-100 pt-4 mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-primary">{price}</span>
            <span className="text-sm text-gray-400 line-through">{solicitorPrice}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-600 font-medium">vs solicitor</span>
            <span className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function JurisdictionCard({
  flag,
  title,
  forms,
}: {
  flag: string;
  title: string;
  forms: string[];
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={flag}
          alt={title}
          className="w-10 h-7 rounded border border-gray-200"
        />
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      </div>
      <ul className="space-y-2">
        {forms.map((form, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <RiCheckLine className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            {form}
          </li>
        ))}
      </ul>
    </div>
  );
}
