import type { Metadata } from "next";
import { Container, TealHero } from "@/components/ui";
import Link from "next/link";
import { Cookie, Lock, CreditCard, BarChart3, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Landlord Heaven uses cookies to improve your experience. Manage your cookie preferences.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TealHero title="Cookie Policy" subtitle="How we use cookies to provide the best experience." eyebrow="Compliance" />
      <Container size="medium" className="py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h2 className="text-4xl font-bold text-charcoal mb-2">Cookie Policy</h2>
          <p className="text-sm text-gray-500 mb-8">Last updated: November 22, 2025</p>

          <div className="bg-primary-subtle border-l-4 border-primary p-4 mb-8">
            <p className="text-charcoal font-semibold mb-2 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" />
              What Are Cookies?
            </p>
            <p className="text-gray-700 text-sm">
              Cookies are small text files stored on your device when you visit our website. They help us provide you
              with a better experience by remembering your preferences and improving our services.
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">1. Types of Cookies We Use</h2>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Essential Cookies (Required)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies are necessary for the website to function and cannot be disabled. They include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Authentication Cookies:</strong> Keep you logged in to your account
              </li>
              <li>
                <strong>Session Cookies:</strong> Remember your wizard progress and form data
              </li>
              <li>
                <strong>Security Cookies:</strong> Protect against unauthorized access and CSRF attacks
              </li>
              <li>
                <strong>Load Balancing:</strong> Ensure website stability and performance
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Functional Cookies (Opt-in)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies enhance your experience but are not essential:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Preference Cookies:</strong> Remember your language, region, and display preferences
              </li>
              <li>
                <strong>UI Customization:</strong> Save your dashboard layout and settings
              </li>
              <li>
                <strong>Feature Flags:</strong> Enable/disable experimental features you've opted into
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Analytics Cookies (Opt-in)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Help us understand how visitors use our site:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Google Analytics:</strong> Page views, session duration, bounce rate (anonymized IP addresses)
              </li>
              <li>
                <strong>Conversion Tracking:</strong> Understand which features lead to purchases
              </li>
              <li>
                <strong>Performance Monitoring:</strong> Identify slow pages and technical issues
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Marketing Cookies (Opt-in)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Used to show you relevant advertising:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Retargeting:</strong> Show ads for products you've viewed
              </li>
              <li>
                <strong>Campaign Tracking:</strong> Measure effectiveness of our marketing campaigns
              </li>
              <li>
                <strong>Social Media:</strong> Share buttons and social login features
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">2. Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Some cookies are set by third-party services we use:
            </p>

            <div className="grid gap-4 mb-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  Supabase (Authentication)
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Purpose:</strong> User authentication and session management
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Type:</strong> Essential (required for login)
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Cookie Name:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded">sb-auth-token</code>
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  Stripe (Payments)
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Purpose:</strong> Fraud prevention and payment processing
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Type:</strong> Essential (required for checkout)
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Cookie Names:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded">__stripe_*</code>
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  Google Analytics (Optional)
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Purpose:</strong> Website analytics and usage tracking
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Type:</strong> Analytics (opt-in)
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Cookie Names:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded">_ga, _gid, _gat</code>
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">3. How Long Do Cookies Last?</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Session Cookies:</strong> Deleted when you close your browser
              </li>
              <li>
                <strong>Authentication Cookies:</strong> 30 days (or until you log out)
              </li>
              <li>
                <strong>Preference Cookies:</strong> 12 months
              </li>
              <li>
                <strong>Analytics Cookies:</strong> 24 months (Google Analytics standard)
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">4. Managing Your Cookie Preferences</h2>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Browser Controls:</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control cookies through your browser settings:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
              </li>
              <li>
                <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
              </li>
              <li>
                <strong>Safari:</strong> Preferences → Privacy → Cookies and website data
              </li>
              <li>
                <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
              </li>
            </ul>

            <div className="bg-warning/10 border-l-4 border-warning p-4 mb-4">
              <p className="text-charcoal font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Important
              </p>
              <p className="text-gray-700 text-sm">
                Blocking essential cookies will prevent you from logging in and using key features of our service. We
                recommend only blocking optional analytics and marketing cookies if you have privacy concerns.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">Our Cookie Consent Tool:</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you first visit our site, you'll see a cookie consent banner. You can:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Accept all cookies</li>
              <li>Reject optional cookies (essential cookies only)</li>
              <li>Customize your preferences for each cookie type</li>
              <li>Change your preferences anytime from your account settings</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">5. Do Not Track (DNT)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We respect the "Do Not Track" (DNT) browser setting. When DNT is enabled:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>We disable all analytics and marketing cookies</li>
              <li>We don't track your browsing behavior across our site</li>
              <li>Only essential cookies for authentication and security remain active</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">6. Cookies for Logged-In Users</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have an account and are logged in, we use cookies to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Keep you logged in across sessions</li>
              <li>Remember your wizard progress if you leave mid-flow</li>
              <li>Save your dashboard preferences and filters</li>
              <li>Provide personalized product recommendations</li>
              <li>Show relevant HMO compliance reminders</li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">7. Legal Basis (UK GDPR)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Our legal basis for using cookies:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Legitimate interest (necessary to provide the service)
              </li>
              <li>
                <strong>Functional Cookies:</strong> Consent (opt-in via cookie banner)
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Consent (opt-in via cookie banner)
              </li>
              <li>
                <strong>Marketing Cookies:</strong> Consent (opt-in via cookie banner)
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">8. Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements,
              or our services. Material changes will be notified via email or a prominent notice on our website.
            </p>

            <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-4">9. Contact & Questions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about our use of cookies, contact us:
            </p>
            <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4">
              <p className="text-charcoal font-semibold mb-2">Landlord Heaven</p>
              <p className="text-gray-700 text-sm mb-2">
                Bradford Chamber Business Park, New Lane, Bradford, BD4 8BX
              </p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Phone:</strong>{" "}
                <a href="tel:08712340832" className="text-primary hover:underline">
                  0871 234 0832
                </a>
              </p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@landlordheaven.co.uk" className="text-primary hover:underline">
                  privacy@landlordheaven.co.uk
                </a>
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Privacy Policy:</strong>{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  landlordheaven.co.uk/privacy
                </Link>
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                This cookie policy complies with the UK Privacy and Electronic Communications Regulations (PECR) and UK
                GDPR.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
