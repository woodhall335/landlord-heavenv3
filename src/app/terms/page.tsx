import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Landlord Heaven",
  description: "Terms and conditions for using Landlord Heaven's legal document services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Terms & Conditions</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Please read these terms carefully before using our services
            </p>
          </div>
        </Container>
      </section>

      <Container size="medium" className="py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <p className="text-sm text-gray-500 mb-8">Last updated: November 22, 2025</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using Landlord Heaven ("we", "us", "our"), you accept and agree to be bound by these
              Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">2. Description of Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Landlord Heaven provides legal document generation services for UK landlords, including but not
              limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Eviction notices (Section 8, Section 21, and jurisdiction equivalents)</li>
              <li>Tenancy agreements (ASTs, PRTs, and Northern Ireland equivalents)</li>
              <li>Court forms and money claim documents</li>
              <li>HMO compliance management and tracking</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">3. Not Legal Advice</h2>
            <div className="bg-warning/10 border-l-4 border-warning p-4 mb-4">
              <p className="text-charcoal font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Important Notice
              </p>
              <p className="text-gray-700">
                <strong>Landlord Heaven is NOT a law firm and does NOT provide legal advice.</strong> Our services
                generate documents based on information you provide. We do not review your specific circumstances or
                provide legal opinions. For legal advice, consult a qualified solicitor.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">4. Your Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Providing accurate and complete information when using our services</li>
              <li>Reviewing all generated documents carefully before use</li>
              <li>Ensuring documents are appropriate for your specific situation</li>
              <li>Complying with all applicable laws and regulations</li>
              <li>Properly serving documents according to legal requirements</li>
              <li>Maintaining the confidentiality of your account credentials</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">5. Payment Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>One-Time Products:</strong> Payment is required upfront. All prices are in GBP and include VAT
              where applicable.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>HMO Pro Subscriptions:</strong> Monthly subscriptions with 7-day free trial. Billing occurs on
              the same day each month. You can cancel at any time before the next billing cycle.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">6. Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All products are instantly delivered digital documents. Refunds are only available for technical errors, duplicate charges, or unauthorized transactions. See our{" "}
              <a href="/refunds" className="text-primary hover:underline">
                Refund Policy
              </a>{" "}
              for full details.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content, templates, software, and materials provided by Landlord Heaven are our intellectual property.
              You receive a non-exclusive, non-transferable license to use documents generated for your own landlord
              activities. You may not resell, redistribute, or commercialize our documents or services.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">8. Limitation of Liability</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  We provide services "as is" without warranties of any kind, express or implied
                </li>
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount you paid for the specific service</li>
                <li>We are not responsible for court outcomes or legal proceedings</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">9. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Use our services for any unlawful purpose</li>
              <li>Provide false or misleading information</li>
              <li>Attempt to access unauthorized areas of our systems</li>
              <li>Reverse engineer or copy our software or templates</li>
              <li>Use our services to harass, threaten, or harm others</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">10. Account Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account if you violate these terms or engage in
              fraudulent activity. You may close your account at any time from your dashboard settings.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">11. Data Protection</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We process your personal data in accordance with UK GDPR and our{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              . You have rights over your data including access, correction, and deletion.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update these terms from time to time. Material changes will be notified via email. Continued use
              after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">13. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive
              jurisdiction of the courts of England and Wales.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about these terms, please contact us:
            </p>
            <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4">
              <p className="text-charcoal font-semibold mb-2">Landlord Heaven</p>
              <p className="text-gray-700 text-sm mb-2">
                Bradford Chamber Business Park, New Lane, Bradford, BD4 8BX
              </p>
              <p className="text-gray-700 text-sm mb-2">
                Phone:{" "}
                <a href="tel:08712340832" className="text-primary hover:underline">
                  0871 234 0832
                </a>
              </p>
              <p className="text-gray-700 text-sm mb-2">
                Email:{" "}
                <a href="mailto:support@landlordheaven.co.uk" className="text-primary hover:underline">
                  support@landlordheaven.co.uk
                </a>
              </p>
              <p className="text-gray-700 text-sm">
                Help Center:{" "}
                <a href="/help" className="text-primary hover:underline">
                  landlordheaven.co.uk/help
                </a>
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                By using Landlord Heaven, you acknowledge that you have read, understood, and agree to be bound by these
                Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
