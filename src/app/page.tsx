"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui";

export default function Home() {
  const [askQuestion, setAskQuestion] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleExampleQuestion = (question: string) => {
    setAskQuestion(question);
  };

  const handleAskQuestion = async () => {
    if (!askQuestion.trim()) return;

    setIsLoading(true);
    setShowResponse(false);

    try {
      const response = await fetch('/api/ask-heaven/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: askQuestion }]
        }),
      });

      const data = await response.json();
      setResponseText(data.reply || "Ask Heaven is currently unavailable. Please try again later.");
      setShowResponse(true);
    } catch {
      setResponseText("Ask Heaven is currently unavailable. Please try again later.");
      setShowResponse(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section - AST-style gradient */}
      <section className="relative bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 py-20 md:py-28 lg:py-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-300/40 blur-3xl" />
          <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
        </div>

        <Container>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Trusted by UK Landlords</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Professional Legal Documents for UK Landlords
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
              Generate compliant eviction notices, tenancy agreements, and court-ready filings in minutes.
              Covering England, Wales, Scotland, and Northern Ireland.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/wizard"
                className="hero-btn-primary w-full sm:w-auto"
              >
                Start Free Wizard
              </Link>
              <Link
                href="/pricing"
                className="hero-btn-secondary w-full sm:w-auto"
              >
                View Pricing
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              No credit card required • Instant download • Court-ready documents
            </p>
          </div>
        </Container>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-white border-b border-gray-100">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">10,000+</div>
              <div className="text-sm text-gray-500">Documents Generated</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-200" />
            <div>
              <div className="text-3xl font-bold text-gray-900">4 Regions</div>
              <div className="text-sm text-gray-500">Full UK Coverage</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-200" />
            <div>
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-500">Instant Access</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-200" />
            <div>
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-500">Legally Compliant</div>
            </div>
          </div>
        </Container>
      </section>

      {/* What We Do Section */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-primary">What We Do</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Tenancies
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From serving notices to recovering rent arrears, we provide the documents and guidance landlords need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Eviction Notices */}
            <Link href="/products/notice-only" className="group">
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 h-full transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Eviction Notices</h3>
                <p className="text-gray-600 mb-4">Section 8, Section 21, and devolved equivalents with service instructions.</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">From £29.99</span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">Learn more →</span>
                </div>
              </div>
            </Link>

            {/* Complete Pack */}
            <Link href="/products/complete-pack" className="group">
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 h-full transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Complete Eviction Pack</h3>
                <p className="text-gray-600 mb-4">Full bundle from notice to possession order with court forms and guidance.</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">£149.99</span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">Learn more →</span>
                </div>
              </div>
            </Link>

            {/* Money Claims */}
            <Link href="/products/money-claim" className="group">
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 h-full transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Money Claims</h3>
                <p className="text-gray-600 mb-4">Rent arrears claims with evidence checklists and POC templates.</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">£179.99</span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">Learn more →</span>
                </div>
              </div>
            </Link>

            {/* Tenancy Agreements */}
            <Link href="/products/ast" className="group">
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 h-full transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Tenancy Agreements</h3>
                <p className="text-gray-600 mb-4">Compliant ASTs with optional clauses for HMOs and students.</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">From £9.99</span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">Learn more →</span>
                </div>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* Ask Heaven Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Subtle glow effects */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-purple-500 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
        </div>

        <Container>
          <div className="relative max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-2xl">☁️</span>
                <span className="text-sm font-semibold text-white">AI-Powered Legal Assistant</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ask Heaven
              </h2>
              <p className="text-xl text-gray-300 mb-2">
                Your instant UK landlord and tenant law assistant
              </p>
              <p className="text-gray-400">
                Get answers to any tenancy question - completely free, no sign-up required
              </p>
            </div>

            {/* Example Questions */}
            <div className="mb-8">
              <p className="text-sm font-medium text-gray-400 mb-4 text-center">
                Try a common question:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Can I evict a tenant who hasn't paid rent for 3 months?",
                  "What's the difference between Section 8 and Section 21?",
                  "Do I need to protect the deposit if it's under £100?",
                  "How much notice do I need to give for a rent increase?"
                ].map((question) => (
                  <button
                    key={question}
                    onClick={() => handleExampleQuestion(question)}
                    className="text-left p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all text-sm text-gray-300 hover:text-white"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={askQuestion}
                  onChange={(e) => setAskQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Ask me anything about UK landlord-tenant law..."
                  className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={isLoading || !askQuestion.trim()}
                  className="px-8 py-4 bg-primary hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {isLoading ? "Thinking..." : "Ask Heaven"}
                </button>
              </div>

              {/* Response */}
              {showResponse && (
                <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">☁️</div>
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-2">Ask Heaven says:</p>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{responseText}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-sm font-medium text-white">Instant Answers</div>
                <div className="text-xs text-gray-400">No waiting</div>
              </div>
              <div>
                <div className="text-2xl mb-2">🇬🇧</div>
                <div className="text-sm font-medium text-white">UK Law Expert</div>
                <div className="text-xs text-gray-400">All 4 regions</div>
              </div>
              <div>
                <div className="text-2xl mb-2">💯</div>
                <div className="text-sm font-medium text-white">100% Free</div>
                <div className="text-xs text-gray-400">Unlimited questions</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-primary">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Court-Ready Documents in 3 Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our guided wizard makes creating professional legal documents simple
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Answer Questions</h3>
              <p className="text-gray-600">
                Tell us about your situation - property details, tenant information, and what you need to achieve.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Review Documents</h3>
              <p className="text-gray-600">
                We generate jurisdiction-specific documents. Review, customize if needed, and approve.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Download & Serve</h3>
              <p className="text-gray-600">
                Instantly download your documents with service instructions and evidence checklists.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/wizard"
              className="hero-btn-primary"
            >
              Start Free Wizard
            </Link>
          </div>
        </Container>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
                <span className="text-sm font-semibold text-primary">Why Landlord Heaven</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built by Landlords, for Landlords
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We understand the challenges of being a landlord. Our platform provides the tools and guidance
                you need to handle tenancy issues with confidence.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Legally Compliant</h3>
                    <p className="text-gray-600">Documents updated to reflect the latest UK housing law across all jurisdictions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Court-Ready Output</h3>
                    <p className="text-gray-600">Every document formatted and structured to meet court requirements.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Full UK Coverage</h3>
                    <p className="text-gray-600">England, Wales, Scotland, and Northern Ireland - we've got you covered.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Instant Access</h3>
                    <p className="text-gray-600">No waiting for appointments or solicitors. Get documents when you need them.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">£29.99</div>
                <div className="text-gray-600">Eviction notices starting price</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">10 min</div>
                <div className="text-gray-600">Average completion time</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">4</div>
                <div className="text-gray-600">UK jurisdictions covered</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-600">Available when you need it</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Jurisdiction Coverage */}
      <section className="py-20 md:py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-primary">UK Coverage</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Jurisdiction-Specific Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Housing law varies across the UK. We generate the right documents for your region.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
              <h3 className="font-bold text-gray-900 mb-2">England</h3>
              <p className="text-sm text-gray-600">AST, Section 8, Section 21, County Court forms</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏴󠁧󠁢󠁷󠁬󠁳󠁿</div>
              <h3 className="font-bold text-gray-900 mb-2">Wales</h3>
              <p className="text-sm text-gray-600">Occupation Contracts, Section 173, Renting Homes Act</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
              <h3 className="font-bold text-gray-900 mb-2">Scotland</h3>
              <p className="text-sm text-gray-600">PRT, Notice to Leave, First-tier Tribunal forms</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🇬🇧</div>
              <h3 className="font-bold text-gray-900 mb-2">Northern Ireland</h3>
              <p className="text-sm text-gray-600">Notice to Quit, Private Tenancy requirements</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonial */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-8">
              <span className="text-sm font-semibold text-primary">What Landlords Say</span>
            </div>

            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">
              "As a landlord managing multiple properties, trusting the legal documents you generate is everything.
              They need to be compliant, court-ready, and actually work - and Landlord Heaven has delivered on all fronts."
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

      {/* Final CTA */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Create your first document in minutes. No legal experience required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/wizard"
                className="hero-btn-primary w-full sm:w-auto"
              >
                Start Free Wizard
              </Link>
              <Link
                href="/ask-heaven"
                className="hero-btn-secondary w-full sm:w-auto"
              >
                Ask Heaven a Question
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              No credit card required • Instant download • Full UK coverage
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
