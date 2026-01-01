import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import { RiMailLine, RiTimeLine } from 'react-icons/ri';
import {
  MessageCircle,
  BadgePoundSterling,
  Briefcase,
  ShieldCheck,
  Clock,
  Mail,
  FileText,
  AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Landlord Heaven",
  description:
    "Get in touch with Landlord Heaven. Support, refunds, sales inquiries. Average response time: 24 hours.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
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
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">General Support</h2>
            <p className="text-gray-700 mb-6">
              Questions about using our services, documents, account issues, or technical problems.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <RiMailLine className="w-4 h-4 text-primary" />
                </div>
                <a
                  href="mailto:support@landlordheaven.co.uk"
                  className="text-primary hover:underline font-semibold"
                >
                  support@landlordheaven.co.uk
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <RiTimeLine className="w-4 h-4 text-primary" />
                </div>
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
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <BadgePoundSterling className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Refunds</h2>
            <p className="text-gray-700 mb-6">
              Request a refund for technical errors, duplicate charges, or unauthorized transactions. Include your order number and email address.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <RiMailLine className="w-4 h-4 text-primary" />
                </div>
                <a
                  href="mailto:refunds@landlordheaven.co.uk"
                  className="text-primary hover:underline font-semibold"
                >
                  refunds@landlordheaven.co.uk
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <RiTimeLine className="w-4 h-4 text-primary" />
                </div>
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
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Briefcase className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Sales & Partnerships</h2>
            <p className="text-gray-700 mb-6">
              Bulk pricing for portfolio landlords, letting agent partnerships, white-label solutions, or custom
              integrations.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <RiMailLine className="w-4 h-4 text-primary" />
                </div>
                <a
                  href="mailto:sales@landlordheaven.co.uk"
                  className="text-primary hover:underline font-semibold"
                >
                  sales@landlordheaven.co.uk
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <RiTimeLine className="w-4 h-4 text-primary" />
                </div>
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
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-3">Privacy & Legal</h2>
            <p className="text-gray-700 mb-6">
              Data protection requests (GDPR), privacy concerns, data deletion, or legal compliance questions.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <RiMailLine className="w-4 h-4 text-primary" />
                </div>
                <a
                  href="mailto:privacy@landlordheaven.co.uk"
                  className="text-primary hover:underline font-semibold"
                >
                  privacy@landlordheaven.co.uk
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <RiTimeLine className="w-4 h-4 text-primary" />
                </div>
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
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Response Time</h3>
              <p className="text-sm text-gray-700">
                We aim to respond to all inquiries within 24 hours on weekdays. Weekend emails are answered on Monday.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Check Spam</h3>
              <p className="text-sm text-gray-700">
                If you don't receive a response within 48 hours, check your spam folder. Add @landlordheaven.co.uk to
                your contacts.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-primary" />
              </div>
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
          <p className="text-charcoal font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Not for Legal Emergencies
          </p>
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
