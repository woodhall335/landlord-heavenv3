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
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <Container size="large" className="py-20 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="success" size="large" className="mb-6 bg-white/20 text-white">
              🏴󠁧󠁢󠁥󠁮󠁧󠁿 100% UK Coverage • 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland • 🏴 Northern Ireland
            </Badge>

            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
              Legal Documents for UK Landlords
            </h1>

            <p className="text-xl sm:text-2xl mb-8 text-white/90 leading-relaxed">
              Court-ready eviction notices, tenancy agreements & legal documents in minutes.
              <br />
              <span className="font-semibold">Plain English in → Legal documents out</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="large"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100 shadow-lg hover:shadow-xl"
              >
                Start Free Analysis →
              </Button>

              <Button
                size="large"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                See All Products
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap gap-6 justify-center text-sm text-white/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span>Court-ready documents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span>All 3 UK jurisdictions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <Container size="large">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-charcoal mb-4">
              Professional Legal Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the package that fits your needs. All documents are legally compliant,
              court-ready, and indistinguishable from solicitor-prepared documents.
            </p>
          </div>

          {/* Eviction Products */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-charcoal mb-6">Eviction Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <Button fullWidth variant="primary">
                    Get Started →
                  </Button>
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
                  <Button fullWidth variant="primary" size="large">
                    Get Complete Pack →
                  </Button>
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
                  <Button fullWidth variant="primary">
                    Start Claim →
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Tenancy Products */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-charcoal mb-6">Tenancy Agreements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Button fullWidth variant="primary">
                    Create AST →
                  </Button>
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
                  <Button fullWidth variant="primary">
                    Create Premium AST →
                  </Button>
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
                    <Button size="large" variant="primary">
                      Start Free Trial →
                    </Button>
                    <Button size="large" variant="outline">
                      Learn More
                    </Button>
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
      <section className="bg-white py-16 border-t border-gray-200">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">⚖️</div>
              <h4 className="font-semibold text-charcoal mb-1">Legally Compliant</h4>
              <p className="text-sm text-gray-600">Court-ready documents</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🔒</div>
              <h4 className="font-semibold text-charcoal mb-1">Secure & Private</h4>
              <p className="text-sm text-gray-600">Bank-level encryption</p>
            </div>
            <div>
              <div className="text-4xl mb-2">⚡</div>
              <h4 className="font-semibold text-charcoal mb-1">Instant Delivery</h4>
              <p className="text-sm text-gray-600">Documents in minutes</p>
            </div>
            <div>
              <div className="text-4xl mb-2">💯</div>
              <h4 className="font-semibold text-charcoal mb-1">30-Day Guarantee</h4>
              <p className="text-sm text-gray-600">Money back if not satisfied</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-semibold mb-4">Landlord Heaven</h5>
              <p className="text-sm text-gray-400">
                Legal documents for UK landlords. Court-ready, AI-powered, instantly delivered.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Products</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/products/notice-only" className="hover:text-white">Notice Only</Link></li>
                <li><Link href="/products/complete-pack" className="hover:text-white">Complete Eviction Pack</Link></li>
                <li><Link href="/products/money-claim" className="hover:text-white">Money Claim Pack</Link></li>
                <li><Link href="/products/ast" className="hover:text-white">Tenancy Agreements</Link></li>
                <li><Link href="/hmo-pro" className="hover:text-white">HMO Pro</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/refunds" className="hover:text-white">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>© 2025 Landlord Heaven. All rights reserved.</p>
            <p className="mt-2">🏴󠁧󠁢󠁥󠁮󠁧󠁿 England & Wales • 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland • 🏴 Northern Ireland - 100% UK Coverage</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
