"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionShell } from "@/components/ui/SectionShell";
import { NumberedSteps } from "@/components/ui/NumberedSteps";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { ROICalculator } from "@/components/ui/ROICalculator";
import { CTASection } from "@/components/ui/CTASection";

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
      const response = await fetch('/api/ask-heaven', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: askQuestion }),
      });

      const data = await response.json();
      setResponseText(data.answer || "Ask Heaven is currently unavailable. Please try again later.");
      setShowResponse(true);
    } catch (error) {
      setResponseText("Ask Heaven is currently unavailable. Please try again later.");
      setShowResponse(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section - Full page with light purple background */}
      <HeroSection
        eyebrow="LANDLORD HEAVEN"
        title="Create, send, and manage legal documents faster than ever"
        subtitle="Professional legal documents for UK landlords. Generate compliant notices, tenancy agreements, and court-ready filings in minutes. No legal experience required."
        background="lavender"
        align="center"
        badge="No credit card required"
        actions={
          <>
            <Link href="/wizard">
              <Button 
                variant="secondary" 
                size="large" 
                className="bg-secondary text-white hover:bg-secondary-dark shadow-lg font-bold px-10 py-4"
              >
                Start free wizard
              </Button>
            </Link>
            <Link href="/pricing">
              <Button 
                variant="outline" 
                size="large" 
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-100 font-semibold px-10 py-4"
              >
                View pricing
              </Button>
            </Link>
          </>
        }
        mediaSlot={
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-6 border border-gray-200">
            <div className="aspect-video bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">📄</div>
                <div className="text-gray-700 font-semibold">Document Preview</div>
              </div>
            </div>
          </div>
        }
      />

      {/* Ask Heaven Section - Gradient background */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">☁️</div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Ask Heaven
            </h2>
            <p className="text-xl text-gray-700 mb-2">
              Your AI-powered landlord and tenant law assistant
            </p>
            <p className="text-gray-600">
              Get instant answers to your UK tenancy questions - completely free
            </p>
          </div>

          {/* Example Questions */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
              Try these common questions:
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
                  className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300 text-sm text-gray-700 hover:text-blue-700 font-medium"
                >
                  💬 {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Area */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="Ask me anything about UK landlord-tenant law..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={handleAskQuestion}
                disabled={isLoading || !askQuestion.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? "☁️ Thinking..." : "Ask Heaven"}
              </Button>
            </div>

            {/* Response Area */}
            {showResponse && (
              <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">☁️</div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-2">Ask Heaven says:</p>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{responseText}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "⚡", title: "Instant Answers", desc: "No waiting for solicitor callbacks" },
              { icon: "🇬🇧", title: "UK Law Expert", desc: "England, Wales, Scotland & NI" },
              { icon: "💯", title: "100% Free", desc: "Unlimited questions, no sign-up required" }
            ].map((item) => (
              <div key={item.title} className="text-center p-4 bg-white/70 rounded-lg">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-bold text-gray-900 text-sm mb-1">{item.title}</div>
                <div className="text-xs text-gray-600">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA to Products */}
          <div className="mt-8 text-center">
            <p className="text-gray-700 mb-4">
              Need full legal documents? Check out our professional packs →
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Link href="/products/notice-only">
                <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-6">
                  Eviction Notices £29.99
                </Button>
              </Link>
              <Link href="/products/complete-pack">
                <Button variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold px-6">
                  Complete Pack £149.99
                </Button>
              </Link>
              <Link href="/products/money-claim">
                <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold px-6">
                  Money Claims £179.99
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section - White background */}
      <SectionShell background="white" padding="large">
        <div className="text-center mb-16">
          <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">TRUSTED BY LANDLORDS</p>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Why choose Landlord Heaven?
          </h2>
        </div>

        <div className="grid max-w-6xl mx-auto grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { 
              title: "Trusted compliance", 
              description: "Up-to-date workflows across England, Wales, Scotland, and Northern Ireland with automatic jurisdiction detection.", 
              icon: "✓" 
            },
            { 
              title: "Court-ready output", 
              description: "Crystal-clear documents with tenant context, evidence checklists, and detailed route guidance for every scenario.", 
              icon: "⚖️" 
            },
            { 
              title: "Instant download", 
              description: "Professionally curated documents with unlimited regenerations before payment. No hidden fees or subscriptions.", 
              icon: "⚡" 
            },
          ].map((item) => (
            <div 
              key={item.title} 
              className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-secondary/10 text-3xl mb-6">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{item.description}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* NumberedSteps Section - Cream background */}
      <SectionShell background="cream" padding="large">
        <NumberedSteps
          title="Get court-ready documents in 3 simple steps"
          subtitle="Our streamlined process makes creating professional legal documents easier than ever"
          steps={[
            {
              number: "1",
              title: "Create or upload a document",
              description: "Start from scratch with our guided wizard or upload an existing file. Microsoft Word (.docx) documents are fully editable and can be converted to templates."
            },
            {
              number: "2",
              title: "Customize and approve",
              description: "Add your details, select jurisdiction-specific clauses, and review compliance indicators. Our system ensures everything meets current legal requirements."
            },
            {
              number: "3",
              title: "Download and use",
              description: "Instantly download your court-ready documents with covering letters, service instructions, and evidence checklists. Unlimited regenerations before payment."
            }
          ]}
        />
      </SectionShell>

      {/* Features Grid - White background */}
      <SectionShell background="white" padding="large">
        <div className="text-center mb-16">
          <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">COMPREHENSIVE SOLUTIONS</p>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Purpose-built for every landlord scenario
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professionally curated documents with clean UI, clear outcomes, and confident compliance
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Eviction Notices",
              description: "Section 8/21 and devolved equivalents with service instructions",
              price: "£29.99",
              icon: "📄",
            },
            {
              title: "Complete Eviction Pack",
              description: "Full bundle from notice to possession order with forms and guidance",
              price: "£149.99",
              icon: "⚖️",
            },
            {
              title: "Money Claims",
              description: "Rent arrears claims with evidence checklists and POC templates",
              price: "£179.99",
              icon: "💷",
            },
            {
              title: "Tenancy Agreements",
              description: "Compliant ASTs with optional clauses for HMOs and students",
              price: "£49.99",
              icon: "📋",
            },
          ].map((item) => (
            <div 
              key={item.title}
              className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all border border-gray-100 hover:border-secondary/20"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="mb-4">
                <span className="inline-block bg-secondary/10 text-secondary font-bold text-sm px-3 py-1 rounded-full">
                  {item.price}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Testimonial Section - Lavender background */}
      <SectionShell background="lavender" padding="large">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Leading landlords excel with Landlord Heaven
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <TestimonialCard
            quote="As a landlord managing multiple properties, trusting the legal documents you generate is everything. They need to be compliant, court-ready, and actually work — and Landlord Heaven has delivered on all fronts. If you're looking for a solution that's not just software, but a true partnership, you won't find anything better."
            author="Sarah Johnson"
            role="Property Portfolio Manager"
            company="Urban Estates Ltd"
          />
        </div>
      </SectionShell>

      {/* ROI Calculator Section - White background */}
      <SectionShell background="white" padding="large">
        <div className="text-center mb-16">
          <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">CALCULATE YOUR SAVINGS</p>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            See the impact of smarter document management
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Automating key aspects of your legal workflow saves time, money, and effort
          </p>
        </div>

        <ROICalculator 
          title="Your current setup"
          subtitle="Schedule a free consultation to see how much you could save"
        />
      </SectionShell>

      {/* Features Split - Cream background */}
      <SectionShell background="cream" padding="large">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <span className="inline-block bg-secondary/10 text-secondary font-bold text-sm px-4 py-2 rounded-full mb-4">
                CONVERSATIONAL WIZARD
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Eviction Route Checker
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              A calm two-column workspace that guides you from tenant details through to the right legal route and compliant paperwork.
            </p>
            <ul className="space-y-3 text-lg text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-secondary font-bold">✓</span>
                <span>Chat-style intake with built-in legal guardrails</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-secondary font-bold">✓</span>
                <span>Live compliance indicators per jurisdiction</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-secondary font-bold">✓</span>
                <span>Instant notices, claims, and letters with explanations</span>
              </li>
            </ul>
            <div>
              <Link href="/wizard">
                <Button 
                  variant="secondary" 
                  size="large" 
                  className="bg-secondary text-white hover:bg-secondary-dark shadow-lg font-bold px-10"
                >
                  Launch wizard
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {["Your tenant details", "Grounds & evidence", "Deadline calculator", "Generated documents"].map((label, idx) => (
              <div key={label} className="rounded-2xl bg-white p-6 shadow-card border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-gray-900 text-lg">{label}</div>
                  <span className="rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-bold text-secondary">
                    Step {idx + 1}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Guided prompts keep you compliant and capture the evidence you need for court.
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* Final CTA Section - White background with dark CTA card */}
      <SectionShell background="white" padding="large">
        <CTASection
          title="Ready to create professional legal documents?"
          subtitle="Start the wizard and get court-ready documents in minutes. No legal experience required."
          actions={
            <>
              <Link href="/wizard" className="w-full md:w-auto">
                <Button 
                  variant="secondary" 
                  size="large" 
                  className="bg-secondary text-white hover:bg-secondary-dark shadow-xl font-bold w-full md:w-auto px-10"
                >
                  Start free wizard
                </Button>
              </Link>
              <Link href="/help" className="w-full md:w-auto">
                <Button 
                  variant="outline" 
                  size="large" 
                  className="border-2 border-white text-white hover:bg-white/15 font-semibold w-full md:w-auto px-10"
                >
                  Contact support
                </Button>
              </Link>
            </>
          }
        />
      </SectionShell>
    </div>
  );
}
