"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionShell } from "@/components/ui/SectionShell";
import { NumberedSteps } from "@/components/ui/NumberedSteps";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { ROICalculator } from "@/components/ui/ROICalculator";
import { CTASection } from "@/components/ui/CTASection";

export default function Home() {
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
            <div className="aspect-video bg-linear-to-br from-lavender-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">📄</div>
                <div className="text-gray-700 font-semibold">Document Preview</div>
              </div>
            </div>
          </div>
        }
      />

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
              price: "£129.99",
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
