"use client";

import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Container,
  Badge,
  PriceBadge,
} from "@/components/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-600 to-primary-dark text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <Container size="large" className="py-20 sm:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl mb-6 border border-white/30">
              <span className="text-sm font-semibold">Trusted by 10,000+ UK Landlords</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Court-Ready Legal Documents
              <br />
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                In Minutes, Not Hours
              </span>
            </h1>

            <p className="text-xl sm:text-2xl mb-8 text-white leading-relaxed max-w-3xl mx-auto">
              AI-powered conversational wizard guides you through complex legal requirements.
              <br />
              <span className="font-semibold bg-white/20 px-4 py-2 rounded-lg inline-block mt-4">
                Plain English In → Professional Documents Out
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/wizard">
                <Button
                  size="large"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all min-h-button-lg"
                >
                  Start Free Analysis →
                </Button>
              </Link>

              <Link href="/pricing">
                <Button
                  size="large"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 min-h-button-lg"
                >
                  See All Products
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-6 justify-center text-sm text-white">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Court-ready documents</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>All 3 UK jurisdictions</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works - Clear Funnel */}
      <section className="py-20 bg-white border-b border-gray-200">
        <Container size="large">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-charcoal mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your legal documents in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">
                Tell Us Your Situation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Answer simple questions in plain English. Our AI wizard asks only what's relevant to your case.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">
                AI Creates Your Documents
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our legal AI analyzes your answers and generates court-ready documents tailored to your situation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">
                Download & Use
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Instant download of professional PDFs ready for service to tenants or submission to court.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link href="/wizard">
              <Button size="large" variant="primary" className="shadow-lg hover:shadow-xl min-h-button-lg">
                Start Your Free Analysis Now →
              </Button>
            </Link>
            <p className="text-sm text-gray-600 mt-4 font-medium">
              No credit card required • Takes 5-10 minutes
            </p>
          </div>
        </Container>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50">
        <Container size="large">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-charcoal mb-4">
              Professional Legal Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose the package that fits your needs. All documents are legally compliant,
              court-ready, and indistinguishable from solicitor-prepared documents.
            </p>
          </div>

          {/* Eviction Products */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-charcoal mb-8">Eviction Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Notice Only */}
              <Card hoverable variant="elevated" padding="large">
                <CardHeader>
                  <Badge variant="primary">Most Popular</Badge>
                  <CardTitle>Notice Only</CardTitle>
                  <div className="mt-2">
                    <PriceBadge price={29.99} size="large" />
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4">
                    Quick start for landlords who just need the notice.
                  </CardDescription>

                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Section 8/21 or jurisdiction equivalent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Plain-English guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Service checklist</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>12-month cloud storage</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link href="/wizard" className="block">
                    <Button fullWidth variant="primary">
                      Get Started →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Complete Eviction Pack */}
              <Card hoverable variant="bordered" padding="large" className="border-primary">
                <CardHeader>
                  <Badge variant="success">Best Value</Badge>
                  <CardTitle>Complete Eviction Pack</CardTitle>
                  <div className="mt-2">
                    <PriceBadge price={149.99} size="large" />
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4">
                    Full DIY eviction bundle from notice to possession order.
                  </CardDescription>

                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>All notices (Section 8, 21, PRT)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>All court forms (N5, N5B, N119)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Step-by-step eviction guide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Evidence checklist</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Lifetime cloud storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Priority email support</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link href="/wizard" className="block">
                    <Button fullWidth variant="primary" size="large">
                      Get Complete Pack →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Money Claim Pack */}
              <Card hoverable variant="elevated" padding="large">
                <CardHeader>
                  <CardTitle>Money Claim Pack</CardTitle>
                  <div className="mt-2">
                    <PriceBadge price={129.99} size="large" />
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4">
                    Recover rent arrears, damages, and other losses.
                  </CardDescription>

                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>N1 claim form + MCOL guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Plain-English summaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Evidence checklist</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Calculator integrations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Lifetime storage</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link href="/wizard" className="block">
                    <Button fullWidth variant="primary">
                      Start Claim →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Tenancy Products */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-charcoal mb-8">Tenancy Agreements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Standard AST */}
              <Card hoverable variant="elevated" padding="large">
                <CardHeader>
                  <CardTitle>Standard AST</CardTitle>
                  <div className="mt-2">
                    <PriceBadge price={39.99} size="large" />
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4">
                    Basic tenancy agreement for occasional landlords.
                  </CardDescription>

                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Up-to-date AST for your jurisdiction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>All mandatory clauses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Basic guidance notes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Basic e-sign</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link href="/wizard" className="block">
                    <Button fullWidth variant="primary">
                      Create AST →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Premium AST */}
              <Card hoverable variant="elevated" padding="large">
                <CardHeader>
                  <Badge variant="info">Professional</Badge>
                  <CardTitle>Premium AST</CardTitle>
                  <div className="mt-2">
                    <PriceBadge price={59.00} size="large" />
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4">
                    Professional tenancy agreement with flexibility.
                  </CardDescription>

                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Everything in Standard AST</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Break clauses & guarantor clauses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Pet permissions & advanced options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Advanced e-sign with audit trail</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Priority support</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link href="/wizard" className="block">
                    <Button fullWidth variant="primary">
                      Create Premium AST →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* HMO Pro - Feature Card */}
          <div className="mt-16">
            <Card variant="elevated" padding="large" className="bg-gradient-to-br from-secondary/5 to-primary/5 border-2 border-primary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Badge variant="hmo-pro" size="large" className="mb-4">
                    🏢 HMO Pro Membership
                  </Badge>

                  <h3 className="text-3xl font-bold text-charcoal mb-4">
                    Complete HMO Compliance Management
                  </h3>

                  <p className="text-lg text-gray-700 mb-6">
                    From <strong>£19.99/month</strong> • 7-day free trial
                  </p>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">📋</span>
                      <div>
                        <strong className="text-charcoal">Council-Specific Licensing</strong>
                        <p className="text-sm text-gray-600">380+ UK councils in database</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">👥</span>
                      <div>
                        <strong className="text-charcoal">Unlimited Tenant Management</strong>
                        <p className="text-sm text-gray-600">£0 extra per tenant change</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">⏰</span>
                      <div>
                        <strong className="text-charcoal">Automated Reminders</strong>
                        <p className="text-sm text-gray-600">90/30/7-day advance warnings</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <strong className="text-charcoal">Portfolio Dashboard</strong>
                        <p className="text-sm text-gray-600">All HMOs in one place</p>
                      </div>
                    </li>
                  </ul>

                  <div className="flex gap-4">
                    <Link href="/hmo-pro">
                      <Button size="large" variant="primary">
                        Start Free Trial →
                      </Button>
                    </Link>
                    <Link href="/hmo-pro">
                      <Button size="large" variant="outline">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h4 className="text-xl font-semibold text-charcoal mb-4">Pricing Tiers</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700">1-5 HMOs</span>
                      <PriceBadge price={19.99} />
                      <span className="text-sm text-gray-500">£4/property</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700">6-10 HMOs</span>
                      <PriceBadge price={24.99} />
                      <span className="text-sm text-gray-500">£2.50/property</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700">11-15 HMOs</span>
                      <PriceBadge price={29.99} />
                      <span className="text-sm text-gray-500">£2/property</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">16-20 HMOs</span>
                      <PriceBadge price={34.99} />
                      <span className="text-sm text-gray-500">£1.75/property</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    💡 Cancel anytime • No long-term commitment
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white py-20 border-t border-gray-200">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-subtle rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-charcoal mb-2 text-lg">Legally Compliant</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Court-ready documents</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-subtle rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-charcoal mb-2 text-lg">Secure & Private</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Bank-level encryption</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-subtle rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-charcoal mb-2 text-lg">Instant Delivery</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Documents in minutes</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-subtle rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-charcoal mb-2 text-lg">30-Day Guarantee</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Money back if not satisfied</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
