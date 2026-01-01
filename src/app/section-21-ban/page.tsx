import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import {
  RiAlarmWarningLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
  RiQuestionLine,
  RiFileTextLine,
  RiScales3Line,
} from 'react-icons/ri';

export const metadata: Metadata = {
  title: 'Section 21 Ban 2026 - Last Chance for No-Fault Evictions | Landlord Heaven',
  description:
    'Section 21 no-fault evictions end 1 May 2026. Only 4 months left to serve your notice. Generate court-ready Section 21 notices before the ban.',
  keywords: [
    'section 21 ban',
    'section 21 ending',
    'no fault eviction ban',
    'section 21 deadline 2026',
    'renters reform bill',
    'last chance section 21',
    'serve section 21 before ban',
  ],
  openGraph: {
    title: 'Section 21 Ends 1 May 2026 - Act Now',
    description: 'No-fault evictions are being banned. Generate your Section 21 notice before it\'s too late.',
  },
};

export default function Section21BanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 pt-28 pb-16 md:pt-32 md:pb-20 text-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <RiAlarmWarningLine className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-semibold">URGENT: Time is Running Out</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Section 21 Ends<br />
              <span className="text-yellow-300">1 May 2026</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-white/90">
              No-fault evictions are being permanently banned.
              <br className="hidden md:block" />
              This is your <span className="font-bold">last chance</span> to serve a Section 21 notice.
            </p>

            {/* Countdown */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8">
              <Section21Countdown variant="hero" showSeconds />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/wizard?product=notice_only&jurisdiction=england"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Generate Section 21 Now
                <RiArrowRightLine className="w-5 h-5" />
              </Link>
              <Link
                href="/products/complete-pack"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/20 text-white border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-colors"
              >
                Get Complete Eviction Pack
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* What's Happening Section */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              What's Happening to Section 21?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Timeline */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <RiCalendarLine className="w-6 h-6 text-primary" />
                  Key Dates
                </h3>
                <div className="space-y-4">
                  <TimelineItem
                    date="Now - 30 April 2026"
                    title="Last Window to Serve Section 21"
                    description="You can still serve Section 21 notices during this period."
                    status="active"
                  />
                  <TimelineItem
                    date="1 May 2026"
                    title="Section 21 Banned"
                    description="No new Section 21 notices can be served after this date."
                    status="upcoming"
                  />
                  <TimelineItem
                    date="31 July 2026"
                    title="Court Deadline"
                    description="Last day to start court proceedings on pre-ban Section 21 notices."
                    status="upcoming"
                  />
                  <TimelineItem
                    date="After August 2026"
                    title="Section 8 Only"
                    description="All evictions must use Section 8 grounds-based process."
                    status="future"
                  />
                </div>
              </div>

              {/* What Changes */}
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                    <RiCloseLine className="w-6 h-6" />
                    What You Lose
                  </h3>
                  <ul className="space-y-3 text-red-700">
                    <li className="flex items-start gap-2">
                      <RiCloseLine className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>No-fault evictions (no reason needed)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiCloseLine className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>Simple 2-month notice period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiCloseLine className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>Guaranteed possession (if valid)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiCloseLine className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>Straightforward court process</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <RiScales3Line className="w-6 h-6" />
                    What Replaces It
                  </h3>
                  <ul className="space-y-3 text-amber-700">
                    <li className="flex items-start gap-2">
                      <RiArrowRightLine className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>Section 8 only (must prove grounds)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiArrowRightLine className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>Longer, more complex process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiArrowRightLine className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>Tenant can dispute grounds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiArrowRightLine className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>More documentation required</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Act Now Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why You Should Act NOW
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Don't wait until April - here's why smart landlords are acting today
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <ReasonCard
                icon={<RiCalendarLine className="w-8 h-8" />}
                title="2-Month Notice Period"
                description="Section 21 requires 2 months' notice. If you wait until April, you might miss the deadline."
              />
              <ReasonCard
                icon={<RiScales3Line className="w-8 h-8" />}
                title="Court Backlogs"
                description="Courts will be overwhelmed with last-minute claims. Get ahead of the rush."
              />
              <ReasonCard
                icon={<RiFileTextLine className="w-8 h-8" />}
                title="Compliance Matters"
                description="Invalid notices waste time. Use our validated system to get it right first time."
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              Get Your Section 21 Notice Today
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Court-ready notices, validated and compliant
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Notice Only */}
              <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-primary transition-colors">
                <div className="text-center mb-6">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    Most Popular
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">Notice Only</h3>
                  <p className="text-gray-600 mt-2">Perfect for straightforward evictions</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">£29.99</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <FeatureItem>Court-ready Section 21 notice</FeatureItem>
                  <FeatureItem>Form 6A compliant</FeatureItem>
                  <FeatureItem>Deposit protection checks</FeatureItem>
                  <FeatureItem>Service instructions included</FeatureItem>
                  <FeatureItem>AI-powered validation</FeatureItem>
                </ul>
                <Link
                  href="/wizard?product=notice_only&jurisdiction=england"
                  className="block w-full text-center bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                >
                  Generate Notice Now →
                </Link>
              </div>

              {/* Complete Pack */}
              <div className="bg-gradient-to-br from-primary to-purple-700 rounded-2xl p-8 text-white">
                <div className="text-center mb-6">
                  <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    Best Value
                  </span>
                  <h3 className="text-2xl font-bold">Complete Eviction Pack</h3>
                  <p className="text-white/80 mt-2">Everything for court proceedings</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">£149.99</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <FeatureItem light>Section 21 OR Section 8 notice</FeatureItem>
                  <FeatureItem light>N5/N5B court forms (auto-filled)</FeatureItem>
                  <FeatureItem light>AI witness statement</FeatureItem>
                  <FeatureItem light>Compliance audit report</FeatureItem>
                  <FeatureItem light>Complete filing guide</FeatureItem>
                  <FeatureItem light>Unlimited regenerations</FeatureItem>
                </ul>
                <Link
                  href="/wizard?product=complete_pack&jurisdiction=england"
                  className="block w-full text-center bg-white text-primary py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Complete Pack →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <FAQItem
                question="When exactly does Section 21 end?"
                answer="Section 21 no-fault evictions will be banned from 1 May 2026. After this date, you cannot serve any new Section 21 notices. If you've already served a valid notice before the ban, you have until 31 July 2026 to start court proceedings."
              />
              <FAQItem
                question="What if I serve a Section 21 now - is it still valid?"
                answer="Yes! Any Section 21 notice served before 1 May 2026 remains valid. However, you must start court proceedings before 31 July 2026 if the tenant doesn't leave voluntarily."
              />
              <FAQItem
                question="What happens after Section 21 is banned?"
                answer="After the ban, landlords must use Section 8 grounds-based evictions. This means you'll need to prove specific grounds (like rent arrears, antisocial behaviour, or wanting to sell/move in). The process is more complex and tenants can dispute the grounds."
              />
              <FAQItem
                question="Should I use Section 21 or Section 8 now?"
                answer="If you have grounds for Section 8 (like rent arrears of 2+ months), you might want to use Section 8 as it can be faster. However, if you don't have specific grounds and just want the tenant to leave, Section 21 is your only option - and you need to act before May 2026."
              />
              <FAQItem
                question="How long does the Section 21 process take?"
                answer="You must give at least 2 months' notice. After the notice expires, if the tenant doesn't leave, you'll need to apply to court. With current backlogs, the whole process can take 4-8 months. This is why you should start NOW, not wait until April."
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-red-600 to-orange-600 text-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <RiAlarmWarningLine className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Don't Miss Your Window
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Every day you wait is one less day you have to serve your notice.
              <br />
              Generate your Section 21 now and secure your right to possession.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/wizard?product=notice_only&jurisdiction=england"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Generate Section 21 - £29.99
                <RiArrowRightLine className="w-5 h-5" />
              </Link>
            </div>
            <p className="mt-6 text-white/80 text-sm">
              Instant download • Court-ready format • 100% compliant
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}

// Helper Components

function TimelineItem({
  date,
  title,
  description,
  status,
}: {
  date: string;
  title: string;
  description: string;
  status: 'active' | 'upcoming' | 'future';
}) {
  const dotColor =
    status === 'active'
      ? 'bg-green-500'
      : status === 'upcoming'
      ? 'bg-amber-500'
      : 'bg-gray-300';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${dotColor}`} />
        <div className="w-0.5 h-full bg-gray-200" />
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium text-gray-500">{date}</p>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function ReasonCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function FeatureItem({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <RiCheckLine className={`w-5 h-5 shrink-0 ${light ? 'text-green-300' : 'text-green-600'}`} />
      <span className={light ? 'text-white/90' : 'text-gray-700'}>{children}</span>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
      <summary className="px-6 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
        {question}
        <RiQuestionLine className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-6 pb-4 text-gray-700">
        {answer}
      </div>
    </details>
  );
}
