/**
 * HomeContent - Client Component
 *
 * Contains all the interactive homepage content.
 * Extracted from page.tsx to allow server component with metadata export.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui";
import { TrustBar, CostComparison, Testimonials } from "@/components/landing";
import { SocialProofCounter } from "@/components/ui/SocialProofCounter";
import { RiFileTextLine, RiScales3Line, RiMoneyPoundCircleLine, RiClipboardLine, RiCheckLine, RiArrowRightLine, RiShieldCheckLine, RiGlobalLine, RiFlashlightLine, RiSendPlaneFill, RiAddLine, RiMicLine } from 'react-icons/ri';

export default function HomeContent() {
  const router = useRouter();
  const [askQuestion, setAskQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!askQuestion.trim()) return;

    // Navigate to Ask Heaven page with the question as a query parameter
    router.push(`/ask-heaven?q=${encodeURIComponent(askQuestion)}`);
  };

  return (
    <div className="bg-white">
      {/* HERO — Two-column layout with mascot illustration */}
      <section className="relative min-h-[600px] lg:min-h-[700px] pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/herobg.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-left">
              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                Legal Documents
                <span className="block text-primary italic">in Minutes, Not Days</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-lg">
                Generate compliant eviction notices, court forms, and tenancy agreements —
                <span className="font-semibold"> save 80%+ vs solicitor</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-8">
                <Link
                  href="/wizard"
                  className="hero-btn-primary"
                >
                  Generate Your Documents →
                </Link>
                <Link
                  href="/pricing"
                  className="hero-btn-secondary bg-white/80 backdrop-blur-sm"
                >
                  View Pricing →
                </Link>
              </div>

              {/* Trust Indicators - Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 mb-6">
                <span className="flex items-center gap-2">
                  <RiCheckLine className="w-5 h-5 text-primary" />
                  Download instant UK notices & forms
                </span>
                <span className="flex items-center gap-2">
                  <RiCheckLine className="w-5 h-5 text-primary" />
                  Covers Section 21, Section 8,
                </span>
                <span className="flex items-center gap-2">
                  <RiCheckLine className="w-5 h-5 text-primary" />
                  England, Wales & Scotland
                </span>
              </div>

              {/* Social Proof Counter */}
              <div>
                <SocialProofCounter variant="today" className="justify-start" />
              </div>
            </div>

            {/* Right Column - Mascot Illustration */}
            <div className="flex justify-center lg:justify-end items-center order-first lg:order-last">
              <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] xl:w-[600px] xl:h-[600px]">
                <Image
                  src="/images/heromascot.png"
                  alt="Landlord Heaven mascot - helpful owl with legal documents"
                  fill
                  className="object-contain object-center"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* TRUST BAR */}
      <TrustBar />

      {/* COST COMPARISON */}
      <CostComparison />

      {/* HOW IT WORKS */}
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

            <div className="mt-14 text-center">
              <Link
                href="/wizard"
                className="hero-btn-primary"
              >
                Start Your Documents Now →
              </Link>
              <p className="mt-4 text-sm text-gray-500">Free to start • Pay only when you're ready</p>
            </div>
          </div>
        </Container>
      </section>

      {/* PRODUCTS */}
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
              price="£39.99"
              solicitorPrice="£200-300"
              icon={<RiFileTextLine className="w-7 h-7" />}
            />
            <ProductCard
              href="/products/complete-pack"
              title="Complete Eviction Pack"
              description="Full bundle from notice to possession order with court forms and guidance."
              price="£199.99"
              icon={<RiScales3Line className="w-7 h-7" />}
              popular={true}
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
              icon={<RiClipboardLine className="w-7 h-7" />}
            />
          </div>
        </Container>
      </section>

      {/* ASK HEAVEN */}
      <section className="py-20 md:py-24 relative overflow-hidden">
        {/* Gradient background matching Ask Heaven page */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-cyan-50 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-200/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-200/30 via-transparent to-transparent" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Ask Heaven Branding */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Image
                src="/favicon.png"
                alt="Ask Heaven"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <span className="text-2xl font-bold text-gray-900">Ask Heaven</span>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Hi, how can I help you?
              </h2>
              <p className="text-gray-500 text-lg">
                Free UK landlord advice — no sign-up required
              </p>
            </div>

            {/* Main Chat Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden p-6 md:p-8">
              {/* Main Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isLoading && askQuestion.trim()) {
                    handleAskQuestion();
                  }
                }}
                className="mb-8"
              >
                <div className="relative">
                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:border-primary/30 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                    <button
                      type="button"
                      className="p-4 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Add attachment"
                      disabled
                    >
                      <RiAddLine className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      className="flex-1 py-4 text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none text-base"
                      placeholder="Ask about evictions, rent arrears, deposits..."
                      value={askQuestion}
                      onChange={(e) => setAskQuestion(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="p-4 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Voice input"
                      disabled
                    >
                      <RiMicLine className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !askQuestion.trim()}
                      className="m-2 p-3 bg-primary hover:bg-primary-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RiSendPlaneFill className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Eviction notice help', icon: '📄', prompt: 'How do I serve an eviction notice to my tenant?' },
                  { label: 'Rent arrears recovery', icon: '💷', prompt: 'How do I recover unpaid rent from a tenant?' },
                  { label: 'Deposit protection rules', icon: '🛡️', prompt: 'What are the deposit protection requirements?' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setAskQuestion(item.prompt)}
                    className="group p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-lg text-left transition-all duration-200"
                  >
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.prompt}</p>
                  </button>
                ))}
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  Free to use
                </span>
                <span className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  No sign-up required
                </span>
                <span className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  UK law focused
                </span>
              </div>

              <p className="mt-6 text-center text-xs text-gray-400">
                For guidance only — not legal advice. <Link href="/terms" className="text-primary hover:underline">Terms apply</Link>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* UK COVERAGE */}
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

      {/* TESTIMONIAL QUOTE */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-8">
              <span className="text-sm font-semibold text-primary">What Landlords Say</span>
            </div>

            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">
              &ldquo;As a landlord managing multiple properties, trusting the legal documents you generate is everything.
              They need to be compliant, court-ready, and actually work — and Landlord Heaven has delivered on all fronts.&rdquo;
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                SJ
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900">Sarah Johnson</div>
                <div className="text-gray-500">Property Portfolio Manager, Urban Estates Ltd</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Your Documents?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of landlords saving time and money.
              <span className="font-semibold text-gray-800"> Start in under 2 minutes.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link
                href="/wizard"
                className="hero-btn-primary"
              >
                Generate Your Documents →
              </Link>
            </div>

            {/* Final trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500">
              <span className="flex items-center gap-2">
                <RiFlashlightLine className="w-5 h-5 text-primary" />
                Instant download
              </span>
              <span className="flex items-center gap-2">
                <RiShieldCheckLine className="w-5 h-5 text-primary" />
                Court-ready format
              </span>
              <span className="flex items-center gap-2">
                <RiGlobalLine className="w-5 h-5 text-primary" />
                All UK jurisdictions
              </span>
            </div>

            {/* Section 8 CTA - SEO Internal Linking */}
            <div className="mt-8 pt-6 border-t border-gray-300/30">
              <p className="text-gray-600">
                Need a free Section 8 notice?{' '}
                <Link href="/section-8-notice-template" className="text-primary hover:underline font-medium">Template</Link>
                {' • '}
                <Link href="/tools/free-section-8-notice-generator" className="text-primary hover:underline font-medium">Generator</Link>
                {' • '}
                <Link href="/tools/validators/section-8" className="text-primary hover:underline font-medium">Checker</Link>
              </p>
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
  n,
  title,
  description,
  desc,
  time,
}: {
  number?: string;
  n?: string;
  title: string;
  description?: string;
  desc?: string;
  time?: string;
}) {
  const stepNumber = number || n || "1";
  const stepDescription = description || desc || "";

  return (
    <div className="text-center group">
      <div className="relative z-10">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30">
          {stepNumber}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-gray-600">{stepDescription}</p>
      {time && (
        <p className="text-sm text-primary mt-2 font-medium">{time}</p>
      )}
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
  popular = false,
}: {
  href: string;
  title: string;
  description: string;
  price: string;
  solicitorPrice?: string;
  icon: React.ReactNode;
  popular?: boolean;
}) {
  return (
    <Link href={href} className="product-card-wrapper group relative cursor-pointer">
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}
      <div className={`product-card-inner bg-white rounded-2xl p-8 h-full transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 ${popular ? 'border-2 border-[#7C3AED] shadow-lg' : 'card-hover-border'}`}>
        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300 text-primary group-hover:text-white">
          {icon}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 text-sm">{description}</p>

        <div className="flex items-center justify-between">
          <span className="text-primary font-bold">{price}</span>
          <span className="text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
            Learn more
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
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
    <div className="card-hover-border bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg cursor-default group">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 overflow-hidden">
        <Image src={flag} alt={title} width={40} height={40} className="w-10 h-10 object-contain" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <ul className="text-sm text-gray-600 space-y-1">
        {forms.map((form) => (
          <li key={form} className="flex items-center justify-center gap-1.5">
            <RiCheckLine className="w-3 h-3 text-green-500 shrink-0" />
            {form}
          </li>
        ))}
      </ul>
    </div>
  );
}
