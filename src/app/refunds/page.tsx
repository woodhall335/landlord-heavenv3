import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Landlord Heaven",
  description: "Learn about our refund policy for digital products and terms.",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="medium">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-charcoal mb-2">Refund Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: November 22, 2025</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <p className="text-charcoal font-semibold mb-2">📄 Digital Products Policy</p>
            <p className="text-gray-700">
              All products are instantly delivered digital documents. Please review our refund policy below.
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">1. Digital Products - No Refunds</h2>

            <div className="bg-warning/10 border-l-4 border-warning p-4 mb-6">
              <p className="text-gray-700">
                <strong>All products are instantly delivered digital documents.</strong> Due to the instant nature of our digital products, we cannot offer refunds once documents have been generated and delivered. By completing your purchase, you acknowledge that you have reviewed the preview and are satisfied with the product.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">❌ No Refunds For:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>One-Time Products:</strong> Notice Only, Complete Eviction Pack, Money Claim Pack, Standard
                AST, Premium AST - all documents are instantly delivered
              </li>
              <li>
                <strong>HMO Pro Subscriptions:</strong> You can cancel anytime, but we don't refund partial months (see
                subscription terms below)
              </li>
              <li>
                <strong>Downloaded Documents:</strong> Once you have accessed your documents
              </li>
              <li>
                <strong>User Error:</strong> Incorrect information provided during document generation
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">✅ Exceptions:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Technical Errors:</strong> If you were unable to access your documents due to a system error on our end
              </li>
              <li>
                <strong>Duplicate Charges:</strong> If you were charged twice for the same purchase
              </li>
              <li>
                <strong>Fraudulent Purchases:</strong> Unauthorized use of your payment method
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">2. How to Report Issues</h2>

            <div className="bg-primary-subtle border border-primary/20 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-charcoal mb-4">📧 Contact Support:</h3>

              <p className="text-gray-700 mb-4">
                If you experienced a technical issue, duplicate charge, or unauthorized transaction, please contact us immediately:
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">Email Support</p>
                    <p className="text-sm text-gray-700">
                      Send an email to{" "}
                      <a href="mailto:support@landlordheaven.co.uk" className="text-primary hover:underline">
                        support@landlordheaven.co.uk
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">Include These Details</p>
                    <p className="text-sm text-gray-700">
                      • Your email address (registered account)
                      <br />
                      • Order number or transaction ID
                      <br />
                      • Description of the issue
                      <br />• Screenshots if applicable
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">We'll Investigate</p>
                    <p className="text-sm text-gray-700">
                      We'll review your case within 24 hours and resolve technical issues or process legitimate refund requests within 5-7 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">3. Refund Processing Time (For Approved Cases)</h2>
            <p className="text-gray-700 mb-4">
              If your refund request is approved based on the exceptions listed above:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Investigation:</strong> 24-48 hours to review your case
              </li>
              <li>
                <strong>Processing:</strong> 5-7 business days to original payment method (if approved)
              </li>
              <li>
                <strong>Bank Processing:</strong> Additional 3-5 business days depending on your bank
              </li>
            </ul>
            <p className="text-sm text-gray-600 italic">
              Total time: Usually 7-14 business days from request to funds in your account (for approved refunds only)
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">4. HMO Pro Subscription Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              HMO Pro is a monthly subscription with special cancellation terms:
            </p>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">During 7-Day Free Trial:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Cancel Anytime:</strong> No charge if cancelled before trial ends
              </li>
              <li>
                <strong>No Refund Needed:</strong> You won't be charged if you cancel during trial
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">After Trial (Paid Subscription):</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Cancel Anytime:</strong> From your dashboard settings
              </li>
              <li>
                <strong>Access Until End of Period:</strong> You keep access until the end of your current billing cycle
              </li>
              <li>
                <strong>No Partial Refunds:</strong> We don't refund partial months
              </li>
              <li>
                <strong>No Future Charges:</strong> Once cancelled, no further billing occurs
              </li>
            </ul>

            <div className="bg-warning/10 border-l-4 border-warning p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Example:</strong> If you subscribe on Jan 1st and cancel on Jan 15th, you'll keep access until
                Jan 31st but won't be charged for February.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">5. What Happens If a Refund is Approved?</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Document Access:</strong> You will lose access to generated documents
              </li>
              <li>
                <strong>Account:</strong> Your account remains active for future purchases
              </li>
              <li>
                <strong>Cloud Storage:</strong> Documents associated with the refunded order will be deleted
              </li>
              <li>
                <strong>Support:</strong> You can still contact support for future help
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">6. Special Cases</h2>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Fraudulent Purchases:</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If your card was used without authorization, contact your bank immediately for a chargeback. Also notify
              us at support@landlordheaven.co.uk so we can secure your account and investigate.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Technical Issues:</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you experienced technical problems preventing you from accessing your documents, contact support at support@landlordheaven.co.uk immediately. We'll
              investigate and fix the issue. If we cannot resolve it, we may issue a refund at our discretion.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Duplicate Charges:</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you were accidentally charged multiple times for the same purchase, contact us immediately and we'll refund the duplicate charge(s).
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">7. Chargebacks</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Please contact us before filing a chargeback. Chargebacks:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Cost us significant fees (£15-30 per chargeback)</li>
              <li>Take longer to process than directly contacting us</li>
              <li>May result in account suspension pending investigation</li>
              <li>Are only appropriate for unauthorized or fraudulent transactions</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We're committed to fair customer service. Contact us first and we'll work to resolve any legitimate issues!
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">8. Contact Information</h2>
            <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4">
              <p className="text-charcoal font-semibold mb-2">Need Help?</p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Technical Issues & Support:</strong>{" "}
                <a href="mailto:support@landlordheaven.co.uk" className="text-primary hover:underline">
                  support@landlordheaven.co.uk
                </a>
              </p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Billing Questions:</strong>{" "}
                <a href="mailto:support@landlordheaven.co.uk" className="text-primary hover:underline">
                  support@landlordheaven.co.uk
                </a>
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Help Center:</strong>{" "}
                <Link href="/help" className="text-primary hover:underline">
                  landlordheaven.co.uk/help
                </Link>
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                This refund policy is part of our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms & Conditions
                </Link>
                . We reserve the right to update this policy. Material changes will be notified via email.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
