"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  FeatureGrid,
  FeatureSplit,
  StepList,
  TealHero,
  TestimonialCard,
} from "@/components/ui";

export default function Home() {
  return (
    <div className="bg-gray-50">
      <TealHero
        title="Legal-tech for confident landlords"
        subtitle="Generate compliant notices, court-ready filings, and compliant HMO packs in minutes with a calm, modern workspace."
        eyebrow="Landlord Heaven Platform"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/wizard">
              <Button variant="secondary" size="large" className="bg-white text-[#009E9E] hover:bg-white/90">
                Start free analysis
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="large" className="border-white text-white hover:bg-white/10">
                View pricing
              </Button>
            </Link>
          </div>
        }
      />

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
          {[
            { title: "Trusted compliance", description: "Up-to-date workflows across England, Wales, Scotland, and Northern Ireland." },
            { title: "Court-ready output", description: "Crystal-clear documents with tenant context, evidence, and route guidance." },
            { title: "Money-back guarantee", description: "30-day guarantee on every pack with unlimited revisions." },
          ].map((item) => (
            <Card key={item.title} padding="large" className="shadow-sm ring-1 ring-gray-200">
              <CardHeader>
                <Badge variant="primary">Featured</Badge>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <FeatureSplit
        eyebrow="Conversational wizard"
        title="Eviction Route Checker"
        subtitle="A calm two-column workspace that guides you from tenant details through to the right legal route and compliant paperwork."
        body={
          <ul className="space-y-2 text-gray-700">
            <li>• Chat-style intake with legal guardrails</li>
            <li>• Live compliance indicators per jurisdiction</li>
            <li>• Instant notices, claims, and letters with explanations</li>
          </ul>
        }
        actions={
          <Link href="/wizard">
            <Button variant="primary" size="large">Launch wizard</Button>
          </Link>
        }
        image={
          <div className="space-y-4">
            {["Your tenant", "Grounds", "Deadline", "Documents"].map((label, idx) => (
              <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">{label}</div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#009E9E]">Step {idx + 1}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Guided prompts keep you compliant and capture the evidence you need.
                </p>
              </div>
            ))}
          </div>
        }
      />

      <FeatureGrid
        eyebrow="Products"
        title="Purpose-built for every landlord scenario"
        subtitle="Curated packs with clean UI, clear outcomes, and confident compliance."
        items={[
          {
            title: "Notice Only",
            description: "Section 8/21 and devolved nation equivalents with service instructions and covering letters.",
            badge: "£29.99",
            icon: "📄",
          },
          {
            title: "Complete Eviction Pack",
            description: "Full journey from notice through witness statements and court filings—ready to download.",
            badge: "£149.99",
            icon: "⚖️",
          },
          {
            title: "Money Claim Pack",
            description: "Rent arrears claims with evidence checklists, POC templates, and guidance notes.",
            badge: "£129.99",
            icon: "💷",
          },
          {
            title: "Tenancy Agreements",
            description: "Modern ASTs and licence agreements with optional addenda and e-sign options.",
            badge: "From £39.99",
            icon: "📝",
          },
          {
            title: "HMO Pro",
            description: "Licensing tracker, inspections, and compliance tasks in one calm dashboard.",
            badge: "Membership",
            icon: "🏠",
          },
          {
            title: "Template Library",
            description: "Letters, addendums, and checklists ready to brand with your landlord details.",
            badge: "Included",
            icon: "📚",
          },
        ]}
      />

      <StepList
        title="Three steps to compliant paperwork"
        subtitle="From intake to download with enterprise-level clarity."
        steps={[
          {
            title: "Describe your tenancy",
            description: "Plain-language chat bubbles capture tenant info, arrears, and tenancy type without legal jargon.",
          },
          {
            title: "We choose the route",
            description: "Our engine maps jurisdiction, grounds, notice periods, and service rules to the right flow.",
          },
          {
            title: "Download with confidence",
            description: "Receive polished PDFs with timelines, next steps, and evidence checklists.",
          },
        ]}
      />

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Loved by professional landlords</h2>
              <p className="text-lg text-gray-600">
                Calm UI, trustworthy outputs, and fast time-to-document make Landlord Heaven feel like an in-house legal team.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TestimonialCard
                  quote="The teal hero and wizard flow make something complex feel effortless."
                  author="Hannah"
                  role="Portfolio Landlord"
                />
                <TestimonialCard
                  quote="I can brief my letting agents with links and timelines straight from the dashboard."
                  author="Tom"
                  role="HMO Owner"
                />
              </div>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-8 shadow-inner ring-1 ring-emerald-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Included with every plan</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Compliance timelines", "Evidence checklists", "Document history", "Secure storage", "Jurisdiction updates", "Live support"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
                    <span className="text-[#009E9E]">✓</span>
                    <span className="text-sm font-semibold text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-[#009E9E] to-emerald-600 px-8 py-12 text-white shadow-lg">
          <div className="grid gap-6 md:grid-cols-[2fr,1fr] md:items-center">
            <div className="space-y-3">
              <h3 className="text-3xl font-bold">Ready to feel confident about every notice?</h3>
              <p className="text-lg text-white/90">Start the Eviction Route Checker and get a clean action plan in minutes.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/wizard">
                <Button variant="secondary" size="large" className="bg-white text-[#009E9E] hover:bg-white/90">
                  Launch the wizard
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="large" className="border-white text-white hover:bg-white/10">
                  Talk to us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
