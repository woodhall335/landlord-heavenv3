/**
 * Landing Page - Redesigned (Fixed)
 *
 * High-converting landing page for Landlord Heaven.
 * Updated to match existing design patterns from pricing and AST pages.
 *
 * Fixes Applied:
 * - Hero badge matches AST page "Professional Tenancies" badge
 * - Hero buttons use hero-btn-primary/secondary from globals.css
 * - Final CTA uses pastel gradient matching pricing page
 * - Complete Pack solicitor price updated to £1,500-2,500
 * - Enhanced hover effects on all cards
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
          Matches: AST page hero styling
          ============================================================ */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge - Matches AST "Professional Tenancies" badge exactly */}
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">☁️ Trusted by 10,000+ UK Landlords</span>
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

            {/* CTA Buttons - Uses hero-btn-primary/secondary from globals.css */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/wizard" className="hero-btn-primary">
                Generate Your Documents →
              </Link>
              <Link href="/pricing" className="hero-btn-secondary">
                View Pricing
              </Link>
            </div>

            {/* Trust Indicators */}
            <p className="mt-4 text-sm text-gray-600">
              Instant download • Court-ready format • All UK jurisdictions • No legal experience needed
            </p>
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
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
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
              <Link href="/wizard" className="hero-btn-primary">
                Start Your Documents Now →
              </Link>
              <p className="mt-4 text-sm text-gray-600">Free to start • Pay only when you're ready</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          PRODUCTS
          Purpose: Clear product offerings with pricing
          Updated: Complete Pack solicitor price = £1,500-2,500
          ============================================================ */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-14">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
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
              price="£39.99"
              solicitorPrice="£200-300"
              icon={<RiFileTextLine className="w-7 h-7" />}
            />
            <ProductCard
              href="/products/complete-pack"
              title="Complete Eviction Pack"
              description="Full bundle from notice to possession order with court forms and guidance."
              price="£199.99"
              solicitorPrice="£1,500-2,500"
              icon={<RiScales3Line className="w-7 h-7" />}
              popular
            />
            <ProductCard
              href="/products/money-claim"
              title="Money Claim Pack"
              description="Rent arrears claims with evidence checklists and particulars of claim."
              price="£199.99"
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
              className="text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-2 transition-colors"
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
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
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
          Fixed: Uses pastel gradient matching pricing page
          ============================================================ */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Ready to Get Your Documents?
            </h2>
            <p className="text-xl mb-8 text-gray-600">
              Join 10,000+ landlords saving time and money.
              <span className="font-semibold text-gray-800"> Start in under 2 minutes.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/wizard" className="hero-btn-primary">
                Generate Your Documents →
              </Link>
              <Link href="/ask-heaven" className="hero-btn-secondary">
                Ask Heaven a Question
              </Link>
            </div>

            {/* Final trust indicators */}
            <p className="mt-4 text-sm text-gray-600">
              Court-ready documents • Expert guidance • 12+ months secure storage
            </p>
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
    <Link href={href} className="group relative block">
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-subtle-pulse">
            MOST POPULAR
          </span>
        </div>
      )}
      <div className={`bg-white rounded-2xl border-2 p-8 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] ${popular ? 'border-primary shadow-lg' : 'border-gray-200 hover:border-primary'}`}>
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
            <span className="text-xs text-green-600 font-semibold">vs solicitor</span>
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
    <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-default">
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
