"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui";
import { RiFileTextLine, RiScales3Line, RiMoneyDollarCircleLine, RiClipboardLine, RiCheckLine } from 'react-icons/ri';

export default function Home() {
  const [askQuestion, setAskQuestion] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const exampleQuestions = useMemo(
    () => [
      "Can I evict a tenant who hasn't paid rent for 3 months?",
      "What's the difference between Section 8 and Section 21?",
      "Do I need to protect the deposit if it's under £100?",
      "How much notice do I need to give for a rent increase?",
    ],
    []
  );

  const handleExampleQuestion = (question: string) => setAskQuestion(question);

  const handleAskQuestion = async () => {
    if (!askQuestion.trim()) return;

    setIsLoading(true);
    setShowResponse(false);

    try {
      const response = await fetch("/api/ask-heaven/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: askQuestion }],
        }),
      });

      const data = await response.json();
      setResponseText(
        data.reply || "Ask Heaven is currently unavailable. Please try again later."
      );
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
      {/* HERO — match Complete Eviction Pack hero style */}
      <section className="bg-linear-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">☁️ Trusted by UK Landlords</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Professional Legal Documents for UK Landlords
            </h1>

            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Generate compliant eviction notices, tenancy agreements, and court-ready filings in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/wizard" className="hero-btn-primary">
                Start Free Wizard →
              </Link>
              <Link href="/pricing" className="hero-btn-secondary">
                View Pricing
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-600">
            </p>
          </div>
        </Container>
      </section>

      {/* PROOF BAR */}
      <section className="py-10 bg-white border-b border-gray-100">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <ProofStat k="10,000+" v="Documents Generated" />
            <ProofStat k="4 Regions" v="UK Coverage" />
            <ProofStat k="24/7" v="Instant Access" />
            <ProofStat k="100%" v="Compliant Output" />
          </div>
        </Container>
      </section>

      {/* PRODUCTS */}
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
            <ProductCard
              href="/products/notice-only"
              title="Eviction Notices"
              desc="Section 8, Section 21, and devolved equivalents with service instructions."
              price="From £29.99"
              icon={<RiFileTextLine className="w-7 h-7 text-primary group-hover:text-white transition-colors" />}
            />
            <ProductCard
              href="/products/complete-pack"
              title="Complete Eviction Pack"
              desc="Full bundle from notice to possession order with court forms and guidance."
              price="£149.99"
              icon={<RiScales3Line className="w-7 h-7 text-primary group-hover:text-white transition-colors" />}
            />
            <ProductCard
              href="/products/money-claim"
              title="Money Claims"
              desc="Rent arrears claims with evidence checklists and POC templates."
              price="£179.99"
              icon={<RiMoneyDollarCircleLine className="w-7 h-7 text-primary group-hover:text-white transition-colors" />}
            />
            <ProductCard
              href="/products/ast"
              title="Tenancy Agreements"
              desc="Compliant ASTs with optional clauses for HMOs and students."
              price="From £9.99"
              icon={<RiClipboardLine className="w-7 h-7 text-primary group-hover:text-white transition-colors" />}
            />
          </div>
        </Container>
      </section>

      {/* ASK HEAVEN — LIGHT (no dark purple) */}
      <section className="py-20 md:py-24 bg-linear-to-br from-purple-50 to-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">☁️ Ask Heaven (Free)</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ask Heaven</h2>
              <p className="text-xl text-gray-600 mb-2">
                Your instant UK landlord and tenant law assistant
              </p>
              <p className="text-gray-500">
                Get answers to any tenancy question — no sign-up required
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Example Questions */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-4">
                  Try a common question:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exampleQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleExampleQuestion(question)}
                      className="text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all text-sm text-gray-700"
                      type="button"
                    >
                      {question}
                    </button>
                  ))}
                </div>

                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                      ☁️
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Powered by Ask Heaven</h3>
                      <p className="text-gray-600 text-sm">
                        Designed for UK landlord scenarios across all 4 jurisdictions.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <MiniBadge top="⚡" label="Instant" />
                    <MiniBadge top="🇬🇧" label="UK Focused" />
                    <MiniBadge top="💯" label="Free" />
                  </div>
                </div>
              </div>

              {/* Chat Box */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ask a question
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={askQuestion}
                    onChange={(e) => setAskQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                    placeholder="Ask me anything about UK landlord-tenant law..."
                    className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={isLoading || !askQuestion.trim()}
                    className="px-8 py-4 bg-primary hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    type="button"
                  >
                    {isLoading ? "Thinking..." : "Ask Heaven"}
                  </button>
                </div>

                {showResponse && (
                  <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">☁️</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-2">Ask Heaven says:</p>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {responseText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="mt-4 text-xs text-gray-500">
                  For guidance and document generation only — not legal advice.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
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
            <Step
              n="1"
              title="Answer Questions"
              desc="Tell us about your situation — property details, tenant information, and what you need to achieve."
            />
            <Step
              n="2"
              title="Review Documents"
              desc="We generate jurisdiction-specific documents. Review, customize if needed, and approve."
            />
            <Step
              n="3"
              title="Download & Serve"
              desc="Instantly download your documents with service instructions and evidence checklists."
            />
          </div>

          <div className="mt-12 text-center">
            <Link href="/wizard" className="hero-btn-primary">
              Start Free Wizard →
            </Link>
          </div>
        </Container>
      </section>

      {/* WHY CHOOSE US */}
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
                We understand the challenges of being a landlord. Our platform provides the tools and guidance you need to
                handle tenancy issues with confidence.
              </p>

              <div className="space-y-6">
                <Tick title="Legally Compliant" desc="Documents updated to reflect UK housing law across all jurisdictions." />
                <Tick title="Court-Ready Output" desc="Every document structured to meet court requirements." />
                <Tick title="Full UK Coverage" desc="England, Wales, Scotland, and Northern Ireland supported." />
                <Tick title="Instant Access" desc="No appointments. Generate documents whenever you need them." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Metric k="£29.99" v="Eviction notices starting price" />
              <Metric k="10 min" v="Average completion time" />
              <Metric k="4" v="UK jurisdictions covered" />
              <Metric k="24/7" v="Available when you need it" />
            </div>
          </div>
        </Container>
      </section>

      {/* UK COVERAGE */}
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
            <Region emoji="🏴" title="England" desc="AST, Section 8, Section 21, County Court forms" />
            <Region emoji="🏴" title="Wales" desc="Occupation Contracts, Section 173, Renting Homes Act" />
            <Region emoji="🏴" title="Scotland" desc="PRT, Notice to Leave, First-tier Tribunal forms" />
            <Region emoji="🇬🇧" title="Northern Ireland" desc="Notice to Quit, Private Tenancy requirements" />
          </div>
        </Container>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-8">
              <span className="text-sm font-semibold text-primary">What Landlords Say</span>
            </div>

            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">
              "As a landlord managing multiple properties, trusting the legal documents you generate is everything.
              They need to be compliant, court-ready, and actually work — and Landlord Heaven has delivered on all fronts."
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
      <section className="py-20 md:py-24 bg-linear-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Create your first document in minutes. No legal experience required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/wizard" className="hero-btn-primary w-full sm:w-auto">
                Start Free Wizard →
              </Link>
              <Link href="/ask-heaven" className="hero-btn-secondary w-full sm:w-auto">
                Ask Heaven a Question
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Court-ready documents • Expert guidance • Lifetime storage
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}

/* ---------------- components ---------------- */

function ProofStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
      <div className="text-3xl font-bold text-gray-900">{k}</div>
      <div className="text-sm text-gray-500">{v}</div>
    </div>
  );
}

function ProductCard({
  href,
  title,
  desc,
  price,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  price: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 h-full transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">{desc}</p>

        <div className="flex items-center justify-between">
          <span className="text-primary font-bold">{price}</span>
          <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Learn more →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
        {n}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

function Tick({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
        <RiCheckLine className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 text-center">
      <div className="text-4xl font-bold text-primary mb-2">{k}</div>
      <div className="text-gray-600">{v}</div>
    </div>
  );
}

function Region({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function MiniBadge({ top, label }: { top: string; label: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 py-3">
      <div className="text-xl">{top}</div>
      <div className="text-xs font-semibold text-gray-700">{label}</div>
    </div>
  );
}
