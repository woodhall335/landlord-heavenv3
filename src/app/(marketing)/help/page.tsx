import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { FAQInline } from "@/components/seo/FAQSection";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Get help with Landlord Heaven. FAQs about eviction notices, tenancy agreements, court claims, and HMO compliance.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-36 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg.webp"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <Container size="large" className="relative z-10">
          <div className="text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Support</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our services, documents, and processes.
            </p>
          </div>
        </Container>
      </section>

      <Container size="large" className="py-12">

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Link
            href="#getting-started"
            className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-primary hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-semibold text-charcoal">Getting Started</h3>
          </Link>
          <Link
            href="#documents"
            className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-primary hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-semibold text-charcoal">Documents</h3>
          </Link>
          <Link
            href="#legal"
            className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-primary hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-2">⚖️</div>
            <h3 className="font-semibold text-charcoal">Legal Questions</h3>
          </Link>
          <Link
            href="#billing"
            className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-primary hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-semibold text-charcoal">Billing & Refunds</h3>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Getting Started */}
          <section id="getting-started" className="mb-16">
            <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3">
              <span className="text-4xl">🚀</span>
              Getting Started
            </h2>

            <FAQInline
              faqs={[
                {
                  question: "How do I create my first document?",
                  answer: (
                    <>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Choose your product category (Notices, Money Claims, Tenancy Agreements, etc.) or click "Start Wizard"</li>
                        <li>Answer questions about your case (property, tenant, dates, grounds)</li>
                        <li>Review the generated document preview</li>
                        <li>Complete payment (£49.99 - £129.99 depending on product)</li>
                        <li>Download your documents as PDF immediately</li>
                      </ol>
                      <p className="mt-3">The entire process takes 10-15 minutes.</p>
                    </>
                  ),
                },
                {
                  question: "Do I need to create an account?",
                  answer: (
                    <>
                      <p>
                        Yes. We require an account to securely store your documents and allow you to access them later. Your
                        account is created during checkout (just email + password).
                      </p>
                      <p className="mt-2">
                        Benefits of having an account:
                        <br />• Access documents anytime from any device
                        <br />• Re-download your case bundle if you lose it
                        <br />• Track all your cases in one dashboard
                        <br />• Regenerate your case bundle with updated information
                      </p>
                    </>
                  ),
                },
                {
                  question: "Which product should I choose?",
                  answer: (
                    <ul className="space-y-3">
                      <li>
                        <strong>Notices (£49.99):</strong> Just need an eviction notice (Section 8/21, Notice to
                        Leave). Tenant might leave voluntarily.
                      </li>
                      <li>
                        <strong>Money Claims (£99.99):</strong> Tenant owes rent arrears. Includes claim forms, arrears schedules, and witness statements.
                      </li>
                      <li>
                        <strong>Standard AST (£14.99):</strong> Simple tenancy agreement for standard lettings.
                      </li>
                      <li>
                        <strong>Premium AST (£24.99):</strong> Advanced tenancy with HMO clauses, guarantors, rent
                        increases.
                      </li>
                      <li>
                        <strong>Free Tools:</strong> Use our notice generators, calculators, and validators to get
                        answers quickly before you upgrade.
                        <div className="mt-2">
                          <Link href="/tools" className="text-primary hover:underline">
                            Browse free tools
                          </Link>
                          <span className="mx-2 text-gray-400">•</span>
                          <Link href="/ask-heaven" className="text-primary hover:underline">
                            Ask Heaven guidance
                          </Link>
                        </div>
                      </li>
                    </ul>
                  ),
                },
                {
                  question: "What jurisdictions do you cover?",
                  answer: (
                    <>
                      <p className="mb-3">
                        <strong>UK-Wide Coverage:</strong>
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Image src="/gb-eng.svg" alt="England" width={16} height={16} className="w-4 h-4 mt-0.5" />
                          <Image src="/gb-wls.svg" alt="Wales" width={16} height={16} className="w-4 h-4 mt-0.5" />
                          <span><strong>England & Wales:</strong> Section 8/21 notices, ASTs, N5/N5B court forms, MCOL</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Image src="/gb-sct.svg" alt="Scotland" width={16} height={16} className="w-4 h-4 mt-0.5" />
                          <span><strong>Scotland:</strong> Notice to Leave, PRTs, First-tier Tribunal forms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Image src="/gb-nir.svg" alt="Northern Ireland" width={16} height={16} className="w-4 h-4 mt-0.5" />
                          <span><strong>Northern Ireland:</strong> Tenancy agreements only (eviction notices planned for 2026)</span>
                        </li>
                      </ul>
                      <p className="mt-3">
                        Our system automatically detects your jurisdiction from the property address and generates the correct
                        documents.
                      </p>
                    </>
                  ),
                },
              ]}
            />
          </section>

          {/* Documents */}
          <section id="documents" className="mb-16">
            <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3">
              <span className="text-4xl">📄</span>
              Documents & Downloads
            </h2>

            <FAQInline
              faqs={[
                {
                  question: "Are the documents legally valid?",
                  answer: (
                    <>
                      <p>
                        <strong>Yes.</strong> Our documents are based on official government forms (Form 6A for Section 21 in England,
                        Notice to Leave for Scotland, RHW forms for Wales) and are accepted by UK courts and tribunals. Thousands of landlords have
                        successfully used them.
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>Note for Wales:</strong> Our Welsh notice forms (RHW16/17/23) are currently English-only. For bilingual versions, obtain official forms from gov.wales.
                      </p>
                      <p className="mt-3 bg-warning/10 border-l-4 border-warning p-3 rounded-r">
                        <strong>Important:</strong> We are NOT a law firm and don't provide legal advice. For complex cases
                        or legal advice, consult a solicitor.
                      </p>
                    </>
                  ),
                },
                {
                  question: "Can I edit the documents after generation?",
                  answer: (
                    <>
                      <p>
                        <strong>Before finalizing:</strong> Yes, you can review and regenerate unlimited times while in the
                        wizard.
                      </p>
                      <p className="mt-2">
                        <strong>After download:</strong> PDFs are editable with PDF software. You can modify text, but
                        ensure any changes comply with UK law.
                      </p>
                      <p className="mt-2">
                        <strong>All products:</strong> Regenerate unlimited times for the same case with updated
                        information (arrears amounts, dates, etc.) before final download
                      </p>
                    </>
                  ),
                },
                {
                  question: "How long are documents stored?",
                  answer: (
                    <>
                      <ul className="space-y-2">
                        <li>
                          <strong>Notices & Money Claims:</strong> 12 months from purchase
                        </li>
                        <li>
                          <strong>Tenancy Agreements:</strong> Available while your account is active
                        </li>
                        <li>
                          <strong>HMO Pro:</strong> While subscription active + 30 days after cancellation
                        </li>
                      </ul>
                      <p className="mt-3 text-sm text-gray-600">
                        Tip: Download and save your documents locally as backup.
                      </p>
                    </>
                  ),
                },
                {
                  question: "I lost my document. Can I re-download?",
                  answer: (
                    <>
                      <p>
                        Yes! Log into your account and go to Dashboard → Documents. All your purchased documents are listed
                        there. Click "Download" to get a fresh copy.
                      </p>
                      <p className="mt-2">
                        If you've forgotten your password, use "Forgot Password" on the login page to reset it.
                      </p>
                    </>
                  ),
                },
                {
                  question: "Can I use documents for multiple properties?",
                  answer: (
                    <>
                      <p>
                        No. Each purchase covers ONE property/case. If you have multiple properties with issues, you'll need
                        to purchase separately for each.
                      </p>
                      <p className="mt-2">
                        <strong>Exception:</strong> HMO Pro (£29.99/month) covers unlimited HMO properties.
                      </p>
                    </>
                  ),
                },
              ]}
            />
          </section>

          {/* Legal Questions */}
          <section id="legal" className="mb-16">
            <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3">
              <span className="text-4xl">⚖️</span>
              Legal Questions
            </h2>

            <FAQInline
              faqs={[
                {
                  question: "Do you provide legal advice?",
                  answer: (
                    <>
                      <p>
                        <strong>No.</strong> Landlord Heaven is NOT a law firm. We provide document generation services,
                        not legal advice or representation.
                      </p>
                      <p className="mt-3">
                        Our system analyzes your inputs and generates appropriate documents, but it cannot:
                        <br />• Give legal opinions on your specific case
                        <br />• Represent you in court
                        <br />• Guarantee outcomes
                        <br />• Provide strategic legal advice
                      </p>
                      <p className="mt-3">
                        <strong>For legal advice, consult a qualified solicitor.</strong>
                      </p>
                    </>
                  ),
                },
                {
                  question: "Will courts accept these documents?",
                  answer: (
                    <>
                      <p>
                        <strong>Yes.</strong> Courts don't care HOW documents were created - only that they're legally
                        valid. Our documents:
                      </p>
                      <ul className="mt-3 space-y-2">
                        <li>✓ Use official government forms (Form 6A, AT6, N5, etc.)</li>
                        <li>✓ Follow current legislation (Housing Act 1988, 2016 Scotland Act, etc.)</li>
                        <li>✓ Include all required information and clauses</li>
                        <li>✓ Are identical to what solicitors produce</li>
                      </ul>
                      <p className="mt-3">
                        Thousands of landlords have successfully used our documents in UK courts and tribunals.
                      </p>
                    </>
                  ),
                },
                {
                  question: "How do I serve the notice to my tenant?",
                  answer: (
                    <>
                      <p className="mb-3">
                        <strong>Recommended methods (in order):</strong>
                      </p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          <strong>Hand delivery:</strong> Give to tenant in person, get them to sign acknowledgment (best
                          proof)
                        </li>
                        <li>
                          <strong>Recorded delivery:</strong> Post via Royal Mail Signed For (proof of service)
                        </li>
                        <li>
                          <strong>First class post:</strong> Legal but harder to prove (take photo of envelope + postage
                          receipt)
                        </li>
                        <li>
                          <strong>Email:</strong> Only if tenancy agreement allows service by email
                        </li>
                      </ol>
                      <p className="mt-3 bg-primary-subtle border-l-4 border-primary p-3 rounded-r">
                        <strong>Important:</strong> Keep proof of service! You'll need it for court. We include a "Proof of
                        Service" template with your documents.
                      </p>
                    </>
                  ),
                },
                {
                  question: "What happens if my notice is rejected by court?",
                  answer: (
                    <>
                      <p>
                        <strong>If rejected due to our error:</strong> We'll regenerate a corrected notice for free AND
                        offer a full refund.
                      </p>
                      <p className="mt-2">
                        <strong>If rejected due to your error:</strong> (incorrect dates, wrong grounds, missing
                        requirements like deposit protection) - we can help regenerate but can't offer a refund.
                      </p>
                      <p className="mt-3">
                        Our system validates your inputs to minimise errors, but you're responsible for providing accurate
                        information.
                      </p>
                    </>
                  ),
                },
                {
                  question: "Can I represent myself in court?",
                  answer: (
                    <>
                      <p>
                        <strong>Yes!</strong> Most landlords represent themselves in possession hearings. It's
                        straightforward if you:
                      </p>
                      <ul className="mt-3 space-y-2">
                        <li>✓ Have proper documents (notice, claim forms, evidence)</li>
                        <li>✓ Followed correct procedures (notice period, deposit protection, etc.)</li>
                        <li>✓ Bring evidence bundle (tenancy agreement, rent statements, notice service proof)</li>
                        <li>✓ Dress professionally and speak clearly</li>
                      </ul>
                      <p className="mt-3">
                        All our legal proceeding products include hearing preparation guides. For complex cases (tenant disputes facts,
                        counterclaims), consider a solicitor.
                      </p>
                    </>
                  ),
                },
              ]}
            />
          </section>

          {/* Billing & Refunds */}
          <section id="billing" className="mb-16">
            <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3">
              <span className="text-4xl">💳</span>
              Billing & Refunds
            </h2>

            <FAQInline
              faqs={[
                {
                  question: "What payment methods do you accept?",
                  answer: (
                    <>
                      <p>We accept all major payment methods via Stripe:</p>
                      <ul className="mt-3 space-y-1">
                        <li>✓ Credit cards (Visa, Mastercard, Amex)</li>
                        <li>✓ Debit cards (UK & international)</li>
                        <li>✓ Apple Pay</li>
                        <li>✓ Google Pay</li>
                      </ul>
                      <p className="mt-3 text-sm text-gray-600">
                        All payments are processed securely by Stripe. We never store your card details.
                      </p>
                    </>
                  ),
                },
                {
                  question: "What's your refund policy?",
                  answer: (
                    <>
                      <p className="mb-3">
                        <strong>All products are instantly delivered digital documents.</strong>
                      </p>
                      <p className="mb-3">
                        Due to the instant nature of our digital products, we cannot offer refunds once documents have been generated and delivered.
                      </p>
                      <p className="mb-3">
                        <strong>Refunds only available for:</strong>
                        <br />• Technical errors preventing document access
                        <br />• Duplicate charges
                        <br />• Unauthorized transactions
                      </p>
                      <p className="mb-3">
                        <strong>Not eligible for refund:</strong>
                        <br />• One-time products after download
                        <br />• HMO Pro (cancel anytime but no partial month refunds)
                        <br />• User error in document generation
                      </p>
                      <p>
                        <Link href="/refunds" className="text-primary hover:underline">
                          See full refund policy →
                        </Link>
                      </p>
                    </>
                  ),
                },
                {
                  question: "How do I request a refund?",
                  answer: (
                    <>
                      <p>Email us at refunds@landlordheaven.co.uk with:</p>
                      <ul className="mt-3 space-y-1">
                        <li>• Your email address (registered account)</li>
                        <li>• Order number or product name</li>
                        <li>• Brief reason (optional but helpful)</li>
                      </ul>
                      <p className="mt-3">
                        We'll process your refund within 24 hours. Money returns to your original payment method in 5-7
                        business days.
                      </p>
                    </>
                  ),
                },
                {
                  question: "How does HMO Pro billing work?",
                  answer: (
                    <ul className="space-y-3">
                      <li>
                        <strong>Free Trial:</strong> 7 days free, no payment required. Cancel before trial ends = £0
                        charged
                      </li>
                      <li>
                        <strong>After Trial:</strong> £29.99/month, billed on same day each month
                      </li>
                      <li>
                        <strong>Cancellation:</strong> Cancel anytime from dashboard. No further billing. Keep access
                        until end of current period.
                      </li>
                      <li>
                        <strong>No Partial Refunds:</strong> If you cancel mid-month, we don't refund the partial month
                        (but you keep access until period ends)
                      </li>
                    </ul>
                  ),
                },
                {
                  question: "Do you offer discounts or bulk pricing?",
                  answer: (
                    <>
                      <p>
                        <strong>Currently, no.</strong> Our prices are already significantly lower than solicitors (you save
                        £200-400 per case).
                      </p>
                      <p className="mt-3">
                        <strong>Best value:</strong>
                        <br />• HMO Pro (£29.99/month) covers unlimited compliance tracking
                        <br />• Volume discounts available for portfolio landlords
                      </p>
                      <p className="mt-3 text-sm text-gray-600">
                        For portfolio landlords needing 10+ documents/month, contact us at sales@landlordheaven.co.uk for
                        custom pricing.
                      </p>
                    </>
                  ),
                },
              ]}
            />
          </section>

          {/* Contact Section */}
          <section className="bg-primary-subtle border border-primary/20 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Still Need Help?</h2>
            <p className="text-gray-700 mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="hero-btn-primary"
              >
                Contact Support
              </Link>
              <a
                href="mailto:support@landlordheaven.co.uk"
                className="hero-btn-secondary"
              >
                Email Us
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Average response time: 24 hours (weekdays)
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
