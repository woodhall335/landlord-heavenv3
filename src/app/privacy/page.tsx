import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy Policy | Landlord Heaven",
  description: "How Landlord Heaven collects, uses, and protects your personal data. GDPR compliant.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Privacy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              How we collect, use, and protect your personal data
            </p>
          </div>
        </Container>
      </section>

      <Container size="medium" className="py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <p className="text-sm text-gray-500 mb-8">Last updated: November 22, 2025</p>

          <div className="bg-primary-subtle border-l-4 border-primary p-4 mb-8">
            <p className="text-charcoal font-semibold mb-2">🔒 Your Privacy Matters</p>
            <p className="text-gray-700 text-sm">
              Landlord Heaven is committed to protecting your privacy and complying with UK GDPR. This policy explains
              how we collect, use, and protect your personal data.
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">1. Data Controller</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Landlord Heaven is the data controller responsible for your personal data. Contact us at{" "}
              <a href="mailto:privacy@landlordheaven.co.uk" className="text-primary hover:underline">
                privacy@landlordheaven.co.uk
              </a>
              .
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">2. What Data We Collect</h2>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Information You Provide:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
              <li><strong>Landlord Details:</strong> Property addresses, landlord name, contact information</li>
              <li><strong>Tenant Information:</strong> Tenant names, addresses (for document generation only)</li>
              <li><strong>Payment Information:</strong> Processed securely via Stripe (we never store full card details)</li>
              <li><strong>Case Data:</strong> Information provided through our wizard for document generation</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Information We Collect Automatically:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on site</li>
              <li><strong>Device Information:</strong> Browser type, IP address, device type</li>
              <li><strong>Cookies:</strong> See our Cookie Policy for details</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">3. How We Use Your Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use your data to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Provide Services:</strong> Generate documents, manage your account, process payments</li>
              <li><strong>Document Processing:</strong> Analyze your case information to generate accurate legal documents</li>
              <li><strong>Communication:</strong> Send service emails, updates, and support responses</li>
              <li><strong>Improvement:</strong> Improve our services, fix bugs, develop new features</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations, prevent fraud</li>
              <li><strong>HMO Pro:</strong> Track compliance deadlines, send automated reminders</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">4. Legal Basis for Processing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We process your data under these legal bases:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Contract:</strong> To provide services you've purchased</li>
              <li><strong>Legitimate Interest:</strong> To improve services, prevent fraud</li>
              <li><strong>Consent:</strong> For marketing emails (you can opt out anytime)</li>
              <li><strong>Legal Obligation:</strong> To comply with tax and legal requirements</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We share data with trusted third parties who help us provide services:
            </p>

            <div className="grid gap-4 mb-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-charcoal mb-2">🗄️ Supabase (Database & Auth)</h4>
                <p className="text-sm text-gray-700">Stores your account data and documents. UK/EU servers.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-charcoal mb-2">💳 Stripe (Payments)</h4>
                <p className="text-sm text-gray-700">Processes payments securely. PCI-DSS compliant.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-charcoal mb-2">🤖 Document Processing Services</h4>
                <p className="text-sm text-gray-700">
                  Process your case information to generate legal documents. Data is anonymized where possible.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-charcoal mb-2">📧 Resend (Email)</h4>
                <p className="text-sm text-gray-700">Sends transactional emails and notifications.</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your data for as long as you have an active account, plus:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Account Data:</strong> Deleted within 30 days of account closure (unless legally required)</li>
              <li><strong>Documents:</strong> Stored according to your plan (12 months or lifetime)</li>
              <li><strong>Payment Records:</strong> 7 years (UK tax law requirement)</li>
              <li><strong>Support Tickets:</strong> 2 years for service improvement</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">7. Your Rights (UK GDPR)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Restrict:</strong> Restrict certain types of processing</li>
              <li><strong>Withdraw Consent:</strong> Unsubscribe from marketing emails</li>
            </ul>

            <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4 mb-4">
              <p className="text-charcoal font-semibold mb-2">📬 Exercise Your Rights</p>
              <p className="text-gray-700 text-sm mb-2">
                Email us at{" "}
                <a href="mailto:privacy@landlordheaven.co.uk" className="text-primary hover:underline">
                  privacy@landlordheaven.co.uk
                </a>{" "}
                or use your dashboard settings.
              </p>
              <p className="text-gray-700 text-sm">We'll respond within 30 days.</p>
            </div>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">8. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We protect your data with:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure HTTPS connections (TLS 1.3)</li>
              <li>Regular security audits and penetration testing</li>
              <li>Strict access controls (role-based permissions)</li>
              <li>Encrypted backups</li>
              <li>Two-factor authentication (optional for your account)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">9. International Transfers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data is primarily stored on UK/EU servers. If transferred outside the UK/EU (e.g., to service providers),
              we ensure adequate safeguards through:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Data Processing Agreements</li>
              <li>Anonymization where possible</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">10. Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies to improve your experience. See our{" "}
              <a href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </a>{" "}
              for details. You can control cookies via your browser settings.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">11. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our services are not intended for anyone under 18. We do not knowingly collect data from children.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this policy from time to time. Material changes will be notified via email. Continued use
              after changes constitutes acceptance.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">13. Complaints</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you're unhappy with how we handle your data, contact us first. You also have the right to lodge a
              complaint with the UK Information Commissioner's Office (ICO):
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>ICO:</strong>{" "}
                <a href="https://ico.org.uk/" className="text-primary hover:underline" target="_blank" rel="noopener">
                  ico.org.uk
                </a>
              </p>
              <p className="text-sm text-gray-700">Phone: 0303 123 1113</p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                This privacy policy complies with UK GDPR and the Data Protection Act 2018.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
