import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Landlord Heaven",
  description: "30-day money-back guarantee. Learn about our refund process and terms.",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="medium">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-charcoal mb-2">Refund Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: November 22, 2025</p>

          <div className="bg-success/10 border-l-4 border-success p-4 mb-8">
            <p className="text-charcoal font-semibold mb-2">💯 30-Day Money-Back Guarantee</p>
            <p className="text-gray-700">
              We stand behind our services. If you're not satisfied, request a full refund within 30 days of purchase.
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">1. Refund Eligibility</h2>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">✅ Eligible for Refund:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>All One-Time Products:</strong> Notice Only, Complete Eviction Pack, Money Claim Pack, Standard
                AST, Premium AST
              </li>
              <li>
                <strong>Within 30 Days:</strong> Request made within 30 days of purchase date
              </li>
              <li>
                <strong>Any Reason:</strong> No questions asked (though feedback is appreciated)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">❌ Not Eligible for Refund:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>After 30 Days:</strong> Refund window has expired
              </li>
              <li>
                <strong>HMO Pro Subscriptions:</strong> You can cancel anytime, but we don't refund partial months (see
                subscription terms below)
              </li>
              <li>
                <strong>Fraudulent Purchases:</strong> Made with stolen payment methods
              </li>
              <li>
                <strong>Abuse:</strong> Repeated refund requests suggesting misuse
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">2. How to Request a Refund</h2>

            <div className="bg-primary-subtle border border-primary/20 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-charcoal mb-4">📧 Simple 3-Step Process:</h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">Email Us</p>
                    <p className="text-sm text-gray-700">
                      Send an email to{" "}
                      <a href="mailto:refunds@landlordheaven.co.uk" className="text-primary hover:underline">
                        refunds@landlordheaven.co.uk
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">Include These Details</p>
                    <p className="text-sm text-gray-700">
                      • Your email address (registered account)
                      <br />
                      • Order number or product name
                      <br />• Brief reason (optional but helpful)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">Get Your Refund</p>
                    <p className="text-sm text-gray-700">
                      We'll process your refund within 5-7 business days back to your original payment method
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">3. Refund Processing Time</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Approval:</strong> Within 24 hours (usually same day)
              </li>
              <li>
                <strong>Processing:</strong> 5-7 business days to original payment method
              </li>
              <li>
                <strong>Bank Processing:</strong> Additional 3-5 business days depending on your bank
              </li>
            </ul>
            <p className="text-sm text-gray-600 italic">
              Total time: Usually 7-10 business days from request to funds in your account
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

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">5. What Happens After a Refund?</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Document Access:</strong> You lose access to generated documents (download before requesting
                refund)
              </li>
              <li>
                <strong>Account:</strong> Your account remains active for future purchases
              </li>
              <li>
                <strong>Cloud Storage:</strong> Documents are deleted after 7 days
              </li>
              <li>
                <strong>Support:</strong> You can still contact support for future help
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">6. Exceptions & Special Cases</h2>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Fraudulent Purchases:</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If your card was used without authorization, contact your bank immediately for a chargeback. Also notify
              us so we can secure your account.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Technical Issues:</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you experienced technical problems preventing you from using our service, contact support first. We'll
              try to fix the issue. If we can't resolve it, we'll issue a refund even outside the 30-day window.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Goodwill Refunds:</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              In exceptional circumstances, we may offer refunds outside our standard policy at our discretion.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">7. Chargebacks</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Please contact us for a refund before filing a chargeback. Chargebacks:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Cost us significant fees (£15-30 per chargeback)</li>
              <li>Take longer to process than our refund system</li>
              <li>May result in account suspension pending investigation</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We process refunds quickly and fairly. Give us a chance to make things right first!
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">8. Contact Information</h2>
            <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4">
              <p className="text-charcoal font-semibold mb-2">Need Help?</p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Refunds:</strong>{" "}
                <a href="mailto:refunds@landlordheaven.co.uk" className="text-primary hover:underline">
                  refunds@landlordheaven.co.uk
                </a>
              </p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Support:</strong>{" "}
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
