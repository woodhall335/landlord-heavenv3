import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | Landlord Heaven",
  description:
    "Get in touch with Landlord Heaven. Support, refunds, sales inquiries. Average response time: 24 hours.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 py-16 md:py-24">
        <Container size="medium">
          <div className="text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Get In Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to help. Choose the department that best matches your inquiry.
            </p>
          </div>
        </Container>
      </section>

      <Container size="medium" className="py-12">

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* General Support */}
          <div className="bg-white rounded-lg border-2 border-primary p-8">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">General Support</h2>
            <p className="text-gray-700 mb-6">
              Questions about using our services, documents, account issues, or technical problems.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a
                  href="mailto:support@landlordheaven.co.uk"
                  className="text-primary hover:underline font-semibold"
                >
                  support@landlordheaven.co.uk
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Average response time: 24 hours (weekdays)</span>
              </div>
            </div>
            <Link
              href="mailto:support@landlordheaven.co.uk"
              className="block w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-primary-dark transition-colors"
            >
              Email Support
            </Link>
          </div>

          {/* Refunds */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Refunds</h2>
            <p className="text-gray-700 mb-6">
              Request a refund for technical errors, duplicate charges, or unauthorized transactions. Include your order number and email address.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a
                  href="mailto:refunds@landlordheaven.co.uk"
                  className="text-primary hover:underline font-semibold"
                >
                  refunds@landlordheaven.co.uk
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Processing time: 5-7 business days</span>
              </div>
            </div>
            <Link
              href="/refunds"
              className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
            >
              View Refund Policy
            </Link>
          </div>

          {/* Sales */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
            <div className="text-4xl mb-4">💼</div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Sales & Partnerships</h2>
            <p className="text-gray-700 mb-6">
              Bulk pricing for portfolio landlords, letting agent partnerships, white-label solutions, or custom
              integrations.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a
                  href="mailto:sales@landlordheaven.co.uk"
                  className="text-primary hover:underline font-semibold"
                >
                  sales@landlordheaven.co.uk
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Custom pricing available for 10+ documents/month</span>
              </div>
            </div>
            <a
              href="mailto:sales@landlordheaven.co.uk"
              className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
            >
              Email Sales
            </a>
          </div>

          {/* Privacy & Legal */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Privacy & Legal</h2>
            <p className="text-gray-700 mb-6">
              Data protection requests (GDPR), privacy concerns, data deletion, or legal compliance questions.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a
                  href="mailto:privacy@landlordheaven.co.uk"
                  className="text-primary hover:underline font-semibold"
                >
                  privacy@landlordheaven.co.uk
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Response time: 30 days (as required by GDPR)</span>
              </div>
            </div>
            <Link
              href="/privacy"
              className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
            >
              View Privacy Policy
            </Link>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="bg-primary-subtle border border-primary/20 rounded-lg p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-charcoal mb-3">Check Our Help Center First</h2>
          <p className="text-gray-700 mb-6">
            Most questions are answered in our comprehensive FAQ. Save time by checking there first.
          </p>
          <Link
            href="/help"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Browse Help Center →
          </Link>
        </div>

        {/* Response Times */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-charcoal mb-6 text-center">What to Expect</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-semibold text-charcoal mb-2">Response Time</h3>
              <p className="text-sm text-gray-700">
                We aim to respond to all inquiries within 24 hours on weekdays. Weekend emails are answered on Monday.
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold text-charcoal mb-2">Check Spam</h3>
              <p className="text-sm text-gray-700">
                If you don't receive a response within 48 hours, check your spam folder. Add @landlordheaven.co.uk to
                your contacts.
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold text-charcoal mb-2">Include Details</h3>
              <p className="text-sm text-gray-700">
                Help us help you faster: include your account email, order number, and specific details about your
                issue.
              </p>
            </div>
          </div>
        </div>

        {/* Office Hours Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:30 PM GMT
            <br />
            We're a UK-based company. All times are British Standard Time (GMT) or British Summer Time (BST).
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 bg-warning/10 border-l-4 border-warning p-6 rounded-r-lg">
          <p className="text-charcoal font-semibold mb-2">⚠️ Not for Legal Emergencies</p>
          <p className="text-gray-700 text-sm">
            Landlord Heaven provides document generation services, NOT legal advice or emergency legal support. If
            you're facing an imminent court hearing or urgent legal issue, contact a solicitor immediately. We cannot
            provide same-day legal advice or representation.
          </p>
        </div>
      </Container>
    </div>
  );
}
