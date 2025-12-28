import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Help Center | Landlord Heaven",
  description:
    "Get help with Landlord Heaven. FAQs about eviction notices, tenancy agreements, court claims, and HMO compliance.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
        <Container size="large">
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

            <div className="space-y-4">
              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  How do I create my first document?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Choose your product category (Notices, Money Claims, Tenancy Agreements, etc.) or click "Start Wizard"</li>
                    <li>Answer questions about your case (property, tenant, dates, grounds)</li>
                    <li>Review the generated document preview</li>
                    <li>Complete payment (£29.99 - £179.99 depending on product)</li>
                    <li>Download your documents as PDF immediately</li>
                  </ol>
                  <p className="mt-3">The entire process takes 10-15 minutes.</p>
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  Do I need to create an account?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <p>
                    Yes. We require an account to securely store your documents and allow you to access them later. Your
                    account is created during checkout (just email + password).
                  </p>
                  <p className="mt-2">
                    Benefits of having an account:
                    <br />• Access documents anytime from any device
                    <br />• Re-download documents if you lose them
                    <br />• Track all your cases in one dashboard
                    <br />• Regenerate documents with updated information
                  </p>
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  Which product should I choose?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <ul className="space-y-3">
                    <li>
                      <strong>Notices (£29.99):</strong> Just need an eviction notice (Section 8/21, Notice to
                      Leave). Tenant might leave voluntarily.
                    </li>
                    <li>
                      <strong>Money Claims (£179.99):</strong> Tenant owes rent arrears. Includes claim forms, arrears schedules, and witness statements.
                    </li>
                    <li>
                      <strong>Standard AST (£9.99):</strong> Simple tenancy agreement for standard lettings.
                    </li>
                    <li>
                      <strong>Premium AST (£14.99):</strong> Advanced tenancy with HMO clauses, guarantors, rent
                      increases.
                    </li>
                    <li>
                      <strong>HMO Pro (£29.99/mo):</strong> Manage HMO compliance (licenses, certificates, reminders).
                      Free trial available.
                    </li>
                  </ul>
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  What jurisdictions do you cover?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <p className="mb-3">
                    <strong>100% UK Coverage:</strong>
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
                      <span><strong>Northern Ireland:</strong> Notice to Quit, NI tenancy agreements, County Court forms</span>
                    </li>
                  </ul>
                  <p className="mt-3">
                    Our system automatically detects your jurisdiction from the property address and generates the correct
                    documents.
                  </p>
                </div>
              </details>
            </div>
          </section>

          {/* Documents */}
          <section id="documents" className="mb-16">
            <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3">
              <span className="text-4xl">📄</span>
              Documents & Downloads
            </h2>

            <div className="space-y-4">
              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  Are the documents legally valid?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <p>
                    <strong>Yes.</strong> Our documents use official government forms (Form 6A for Section 21, AT6 for
                    Scotland, etc.) and are accepted by all UK courts and tribunals. Thousands of landlords have
                    successfully used them.
                  </p>
                  <p className="mt-3 bg-warning/10 border-l-4 border-warning p-3 rounded-r">
                    <strong>Important:</strong> We are NOT a law firm and don't provide legal advice. For complex cases
                    or legal advice, consult a solicitor.
                  </p>
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  Can I edit the documents after generation?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
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
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  How long are documents stored?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <ul className="space-y-2">
                    <li>
                      <strong>Notices & Money Claims:</strong> 12 months from purchase
                    </li>
                    <li>
                      <strong>Tenancy Agreements:</strong> Lifetime access (as long as account is active)
                    </li>
                    <li>
                      <strong>HMO Pro:</strong> While subscription active + 30 days after cancellation
                    </li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-600">
                    💡 Tip: Download and save your documents locally as backup.
                  </p>
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  I lost my document. Can I re-download?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <p>
                    Yes! Log into your account and go to Dashboard → Documents. All your purchased documents are listed
                    there. Click "Download" to get a fresh copy.
                  </p>
                  <p className="mt-2">
                    If you've forgotten your password, use "Forgot Password" on the login page to reset it.
                  </p>
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  Can I use documents for multiple properties?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <p>
                    No. Each purchase covers ONE property/case. If you have multiple properties with issues, you'll need
                    to purchase separately for each.
                  </p>
                  <p className="mt-2">
                    <strong>Exception:</strong> HMO Pro (£29.99/month) covers unlimited HMO properties.
                  </p>
                </div>
              </details>
            </div>
          </section>

          {/* Legal Questions */}
          <section id="legal" className="mb-16">
            <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3">
              <span className="text-4xl">⚖️</span>
              Legal Questions
            </h2>

            <div className="space-y-4">
              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  Do you provide legal advice?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
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
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  Will courts accept these documents?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
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
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  How do I serve the notice to my tenant?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
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
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  What happens if my notice is rejected by court?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <p>
                    <strong>If rejected due to our error:</strong> We'll regenerate a corrected notice for free AND
                    offer a full refund.
                  </p>
                  <p className="mt-2">
                    <strong>If rejected due to your error:</strong> (incorrect dates, wrong grounds, missing
                    requirements like deposit protection) - we can help regenerate but can't offer a refund.
                  </p>
                  <p className="mt-3">
                    Our system validates your inputs to minimize errors, but you're responsible for providing accurate
                    information.
                  </p>
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  Can I represent myself in court?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
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
                </div>
              </details>
            </div>
          </section>

          {/* Billing & Refunds */}
          <section id="billing" className="mb-16">
            <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3">
              <span className="text-4xl">💳</span>
              Billing & Refunds
            </h2>

            <div className="space-y-4">
              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  What payment methods do you accept?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
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
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  What's your refund policy?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
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
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  How do I request a refund?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
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
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  How does HMO Pro billing work?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
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
                </div>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-6 py-4 font-semibold text-charcoal cursor-pointer hover:bg-gray-50">
                  Do you offer discounts or bulk pricing?
                </summary>
                <div className="px-6 pb-4 text-gray-700">
                  <p>
                    <strong>Currently, no.</strong> Our prices are already significantly lower than solicitors (you save
                    £200-400 per case).
                  </p>
                  <p className="mt-3">
                    <strong>Best value:</strong>
                    <br />• HMO Pro (from £19.99/month) covers unlimited compliance tracking
                    <br />• Volume discounts available for portfolio landlords
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    For portfolio landlords needing 10+ documents/month, contact us at sales@landlordheaven.co.uk for
                    custom pricing.
                  </p>
                </div>
              </details>
            </div>
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
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Contact Support
              </Link>
              <a
                href="mailto:support@landlordheaven.co.uk"
                className="inline-block bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
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
