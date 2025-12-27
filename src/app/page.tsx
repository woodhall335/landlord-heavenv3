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
    <div className="bg-slate-50">
      {/* Hero Section - Ask Heaven First */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        {/* Accent glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]" />

        <Container>
          <div className="relative max-w-5xl mx-auto">
            {/* Top badge */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                AI-Powered Legal Assistant for UK Landlords
              </span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white mb-6 leading-[1.1] tracking-tight">
              Like Having a Paralegal<br />
              <span className="text-amber-400">On Call 24/7</span>
            </h1>

            <p className="text-xl text-slate-400 text-center max-w-2xl mx-auto mb-4">
              Get instant guidance on evictions, notices, and rent recovery. 
              Then generate court-ready documents for a fraction of solicitor fees.
            </p>

            {/* Price comparison */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className="text-slate-500 line-through">Solicitors: £500+</span>
              <span className="text-white font-semibold">Landlord Heaven: from £29.99</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded">Save 90%+</span>
            </div>

            {/* Ask Heaven Chat Box */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-semibold">Ask Heaven</h2>
                  <p className="text-slate-400 text-sm">Your AI legal assistant • Free • No sign-up</p>
                </div>
              </div>

              {/* Example questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {[
                  "My tenant hasn't paid rent for 3 months - what can I do?",
                  "Can I use Section 21 if I forgot to protect the deposit?",
                  "What's the fastest way to evict a tenant legally?",
                  "How do I recover rent arrears through the courts?"
                ].map((question) => (
                  <button
                    key={question}
                    onClick={() => handleExampleQuestion(question)}
                    className="text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors border border-slate-600/50 hover:border-slate-500"
                  >
                    "{question}"
                  </button>
                ))}
              </div>

              {/* Chat input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={askQuestion}
                  onChange={(e) => setAskQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Describe your situation..."
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                  disabled={isLoading}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={isLoading || !askQuestion.trim()}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {isLoading ? "..." : "Ask"}
                </button>
              </div>

              {/* Response */}
              {showResponse && (
                <div className="mt-4 p-4 bg-slate-900/50 border border-slate-600 rounded-xl">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{responseText}</p>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-3">Ready to take action?</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/wizard?product=complete_pack" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-medium rounded-lg transition-colors">
                        Start Eviction Pack →
                      </Link>
                      <Link href="/ask-heaven" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors">
                        Continue Chat →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Official HMCTS Court Forms
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-Verified Documents
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Instant Download
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Free Validators Section */}
      <section className="py-16 md:py-20 bg-white border-b border-slate-200">
        <Container>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
              Free Tools
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Check Your Legal Position First
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Use our free validators to understand your options before spending a penny.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Section 21 Validator */}
            <Link href="/tools/section-21-validator" className="group">
              <div className="h-full p-6 bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Section 21 Validator</h3>
                <p className="text-slate-600 text-sm mb-3">Check if you can use a no-fault eviction. We'll check deposit, gas cert, EPC, and more.</p>
                <span className="text-amber-600 text-sm font-medium group-hover:underline">Check now →</span>
              </div>
            </Link>

            {/* Section 8 Validator */}
            <Link href="/tools/section-8-validator" className="group">
              <div className="h-full p-6 bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Section 8 Ground Finder</h3>
                <p className="text-slate-600 text-sm mb-3">Find which eviction grounds apply to your situation - arrears, breach, ASB, and more.</p>
                <span className="text-amber-600 text-sm font-medium group-hover:underline">Find grounds →</span>
              </div>
            </Link>

            {/* Tenancy Agreement Validator */}
            <Link href="/tools/tenancy-agreement-validator" className="group">
              <div className="h-full p-6 bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">AST Validator</h3>
                <p className="text-slate-600 text-sm mb-3">Check your tenancy agreement for unfair terms and missing clauses that could void your notice.</p>
                <span className="text-amber-600 text-sm font-medium group-hover:underline">Validate AST →</span>
              </div>
            </Link>

            {/* Rent Arrears Calculator */}
            <Link href="/tools/rent-arrears-calculator" className="group">
              <div className="h-full p-6 bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Arrears Calculator</h3>
                <p className="text-slate-600 text-sm mb-3">Calculate total arrears including interest for your court claim or Section 8 notice.</p>
                <span className="text-amber-600 text-sm font-medium group-hover:underline">Calculate →</span>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-20 bg-slate-50">
        <Container>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full mb-4">
              Court-Ready Documents
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Do You Need?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Official HMCTS forms filled automatically. Download instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Complete Eviction Pack - Featured */}
            <Link href="/products/complete-pack" className="group lg:col-span-2">
              <div className="h-full p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-400 rounded-2xl transition-all hover:shadow-2xl relative overflow-hidden">
                <div className="absolute top-4 right-4 px-3 py-1 bg-amber-400 text-slate-900 text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
                <div className="w-14 h-14 bg-amber-400 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Complete Eviction Pack</h3>
                <p className="text-slate-400 mb-4">Everything from notice to possession order. Official N5, N5B, N119 court forms filled automatically.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-slate-300 text-sm">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Section 8 or Section 21 Notice
                  </li>
                  <li className="flex items-center gap-2 text-slate-300 text-sm">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Official HMCTS N5/N5B Claim Form
                  </li>
                  <li className="flex items-center gap-2 text-slate-300 text-sm">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    N119 Particulars of Claim
                  </li>
                  <li className="flex items-center gap-2 text-slate-300 text-sm">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    AI Smart Review Verification
                  </li>
                </ul>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-slate-500 text-sm line-through">Solicitors: £1,500+</span>
                    <div className="text-3xl font-bold text-white">£149.99</div>
                  </div>
                  <span className="text-amber-400 font-medium group-hover:underline">Get started →</span>
                </div>
              </div>
            </Link>

            {/* Notice Only */}
            <Link href="/products/notice-only" className="group">
              <div className="h-full p-6 bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Notice Only</h3>
                <p className="text-slate-600 text-sm mb-4">Section 8 or Section 21 notice with service instructions. Perfect if you're not going to court yet.</p>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-slate-900">£29.99</div>
                  <span className="text-amber-600 text-sm font-medium group-hover:underline">Select →</span>
                </div>
              </div>
            </Link>

            {/* Money Claim */}
            <Link href="/products/money-claim" className="group">
              <div className="h-full p-6 bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Money Claim</h3>
                <p className="text-slate-600 text-sm mb-4">Recover rent arrears through county court. Form N1 and particulars of claim included.</p>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-slate-900">£129.99</div>
                  <span className="text-amber-600 text-sm font-medium group-hover:underline">Select →</span>
                </div>
              </div>
            </Link>

            {/* Tenancy Agreement */}
            <Link href="/products/ast" className="group">
              <div className="h-full p-6 bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Tenancy Agreement</h3>
                <p className="text-slate-600 text-sm mb-4">Legally compliant AST with all required clauses. HMO and student options available.</p>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-slate-900">from £9.99</div>
                  <span className="text-amber-600 text-sm font-medium group-hover:underline">Select →</span>
                </div>
              </div>
            </Link>

            {/* HMO License Checker */}
            <Link href="/tools/hmo-license-checker" className="group">
              <div className="h-full p-6 bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">HMO Checker</h3>
                <p className="text-slate-600 text-sm mb-4">Check if your property needs an HMO license. Avoid £30,000 fines.</p>
                <div className="flex items-end justify-between">
                  <div className="text-lg font-bold text-emerald-600">Free</div>
                  <span className="text-amber-600 text-sm font-medium group-hover:underline">Check →</span>
                </div>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              From question to court-ready documents in under 15 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Ask Heaven</h3>
              <p className="text-slate-600 text-sm">
                Describe your situation. Our AI assesses your case and recommends the right approach.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Validate</h3>
              <p className="text-slate-600 text-sm">
                Free validators check your compliance and identify potential issues before you start.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Generate</h3>
              <p className="text-slate-600 text-sm">
                Answer guided questions. We auto-fill official HMCTS forms and generate your documents.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Download</h3>
              <p className="text-slate-600 text-sm">
                Instant download with service instructions and evidence checklists. Court-ready.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Us */}
      <section className="py-16 md:py-20 bg-slate-900">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-amber-400/10 text-amber-400 text-sm font-medium rounded-full mb-4">
                Why Landlord Heaven
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Solicitor-Level Documents.<br />
                <span className="text-amber-400">Without the Bill.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                We use the same official HMCTS court forms that solicitors use. 
                The difference? We fill them automatically from your answers, 
                and we charge £149.99 instead of £1,500.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Official HMCTS Forms</h3>
                    <p className="text-slate-400 text-sm">N5, N5B, N119, N1, Form 6A - genuine court forms, not templates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Smart Review</h3>
                    <p className="text-slate-400 text-sm">Our AI checks your evidence against your answers and flags mismatches.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Compliance Built-In</h3>
                    <p className="text-slate-400 text-sm">Blockers prevent invalid notices. We won't let you serve a defective notice.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">24/7 Availability</h3>
                    <p className="text-slate-400 text-sm">No appointments, no waiting. Generate documents at 2am if you need to.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison table */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6 text-center">Cost Comparison</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 text-sm pb-3">Document</th>
                    <th className="text-right text-slate-400 text-sm pb-3">Solicitor</th>
                    <th className="text-right text-amber-400 text-sm pb-3">Us</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 text-slate-300">Eviction Notice</td>
                    <td className="py-3 text-right text-slate-500">£150-300</td>
                    <td className="py-3 text-right text-white font-medium">£29.99</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 text-slate-300">Court Claim Pack</td>
                    <td className="py-3 text-right text-slate-500">£800-1,500</td>
                    <td className="py-3 text-right text-white font-medium">£149.99</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 text-slate-300">Money Claim</td>
                    <td className="py-3 text-right text-slate-500">£500-1,000</td>
                    <td className="py-3 text-right text-white font-medium">£129.99</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 text-slate-300">Tenancy Agreement</td>
                    <td className="py-3 text-right text-slate-500">£200-400</td>
                    <td className="py-3 text-right text-white font-medium">£9.99</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-300 font-medium">Full Eviction</td>
                    <td className="py-3 text-right text-slate-500">£2,000-5,000</td>
                    <td className="py-3 text-right text-amber-400 font-bold">£149.99</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-slate-500 mt-4 text-center">
                *Solicitor costs based on average UK rates. Excludes court fees.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Social Proof - Updated for launch */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full mb-6">
              Trusted by Landlords
            </span>
            
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-4xl font-bold text-slate-900">15 min</div>
                <div className="text-slate-600 text-sm">Average completion</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-slate-900">90%</div>
                <div className="text-slate-600 text-sm">Cost savings</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-slate-900">24/7</div>
                <div className="text-slate-600 text-sm">Always available</div>
              </div>
            </div>

            <blockquote className="text-xl md:text-2xl text-slate-700 italic mb-6">
              "I was quoted £1,200 by a solicitor for eviction documents. 
              Landlord Heaven gave me the exact same court forms for £149.99. 
              Wish I'd found this years ago."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                MK
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-900">Marcus K.</div>
                <div className="text-slate-500 text-sm">Landlord, Birmingham</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-slate-100 to-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Stop Overpaying for Legal Documents
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Get instant guidance from Ask Heaven, then generate court-ready documents 
              for a fraction of what solicitors charge.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/ask-heaven"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
              >
                Ask Heaven (Free) →
              </Link>
              <Link
                href="/products/complete-pack"
                className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-colors"
              >
                Get Eviction Pack - £149.99
              </Link>
            </div>

            <p className="text-sm text-slate-500">
              No sign-up required for Ask Heaven • Official HMCTS forms • Instant download
            </p>
          </div>
        </Container>
      </section>

      {/* Simple footer note */}
      <section className="py-8 bg-slate-50 border-t border-slate-200">
        <Container>
          <p className="text-center text-sm text-slate-500">
            Landlord Heaven provides document generation services. This is not legal advice. 
            For complex situations, consider consulting a solicitor.
          </p>
        </Container>
      </section>
    </div>
  );
}