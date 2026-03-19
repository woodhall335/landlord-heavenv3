import { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { tenantWontLeaveRelatedLinks } from '@/lib/seo/internal-links';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Gavel,
  Shield,
  Ban,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/tenant-wont-leave';
const PAGE_TITLE = "Tenant Won't Leave After Notice";
const PAGE_TYPE = 'problem' as const;

const faqs = [
  {
    question: "What should I do if my tenant won't leave after notice?",
    answer:
      'If your tenant does not leave when the notice expires, you must move to the court possession stage. Do not change locks, remove belongings, or try to force them out yourself. The next step is usually to check the notice is valid and then apply for possession through the court.',
  },
  {
    question: 'Can I change the locks if the tenant stays after notice?',
    answer:
      'No. If the tenant is still in occupation, changing locks without a court order and lawful enforcement can amount to illegal eviction. Even if the notice has expired, landlords must follow the proper possession and enforcement process.',
  },
  {
    question: 'What if my Section 21 notice has expired and the tenant is still there?',
    answer:
      'If the notice period has expired and the tenant remains in occupation, landlords usually need to apply for possession through the court. Before doing that, check that the notice was validly served and that any preconditions for relying on it were met.',
  },
  {
    question: 'Do I need a possession order before bailiffs can remove the tenant?',
    answer:
      'Yes. In most cases, if the tenant still has not left, the landlord must first obtain a possession order and then, if required, a warrant or enforcement step before bailiffs can attend.',
  },
  {
    question: 'How long does it take if a tenant will not leave?',
    answer:
      'It can take several months from serving notice to court possession and then enforcement. Exact times vary depending on the type of notice used, court delays, paperwork quality, and whether the claim is defended.',
  },
  {
    question: 'What if the tenant also owes rent arrears?',
    answer:
      'If arrears are involved, landlords may want to consider the section 8 route or a rent arrears strategy alongside possession. The right route depends on the facts, paperwork and stage of the matter.',
  },
  {
    question: 'Can I speak to the tenant before going to court?',
    answer:
      'Yes. A calm written reminder, a repayment discussion, or a practical move-out conversation can sometimes resolve matters. But if the tenant still will not leave, you should not delay the legal route indefinitely.',
  },
  {
    question: 'What is the biggest mistake landlords make when a tenant will not leave?',
    answer:
      'The biggest mistake is trying to take shortcuts after the notice expires. Illegal eviction, poor paperwork, or applying to court with an invalid notice can all make the situation slower, more expensive and riskier.',
  },
];

export const metadata: Metadata = {
  title: "Tenant Won't Leave After Notice? What England Landlords Should Do Next",
  description:
    "What to do if your tenant won't leave after notice in England. Learn the legal next steps, possession order process, bailiff enforcement, and what landlords must not do.",
  keywords: [
    "tenant won't leave",
    'tenant refuses to leave',
    'tenant not leaving after section 21',
    "tenant won't move out",
    "what to do if tenant won't leave",
    "evict tenant who won't leave",
    'tenant staying after notice',
    'possession order',
    'bailiff eviction',
    'tenant still in property after notice',
    'tenant not leaving after eviction notice',
    'england possession claim',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/tenant-wont-leave',
  },
  openGraph: {
    title: "Tenant Won't Leave After Notice? What England Landlords Should Do Next",
    description:
      'Legal next steps when a tenant refuses to leave after notice in England, including court possession and bailiff enforcement.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/tenant-wont-leave',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tenant Won't Leave After Notice? What England Landlords Should Do Next",
    description:
      'Legal next steps when a tenant refuses to leave after notice in England.',
  },
};

export default function TenantWontLeavePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: "Tenant Won't Leave After Notice - England Guide",
    description:
      "Guide for England landlords when a tenant won't leave after notice, covering possession claims and enforcement.",
    url: 'https://landlordheaven.co.uk/tenant-wont-leave',
  };

  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Guides', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
          { name: "Tenant Won't Leave", url: 'https://landlordheaven.co.uk/tenant-wont-leave' },
        ])}
      />

      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="england"
      />

      <main className="text-gray-900">
        <UniversalHero
          badge="England Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Tenant Won't Leave After Notice?"
          subtitle={
            <>
              If your tenant is still in the property after notice has expired, you{' '}
              <strong>must follow the legal possession process</strong>. Here is what England
              landlords should do next, what not to do, and how to move from notice to court and
              enforcement.
            </>
          }
          primaryCta={{ label: 'Get Court-Ready Notice — £29.99', href: '/products/notice-only' }}
          secondaryCta={{ label: 'Go to Possession Claim Guide', href: '/possession-claim-guide' }}
          variant="pastel"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Notice route guidance
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Court-stage next steps
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Clear action plan
            </span>
          </div>
        </UniversalHero>

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-12 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900 mb-2">
                    Do not take matters into your own hands
                  </h2>
                  <p className="text-red-800">
                    If a tenant will not leave, it can be tempting to force the issue. Do not do
                    that. Landlords should not change locks, remove belongings, cut off services, or
                    try to pressure the tenant out outside the proper legal process. Even where the
                    tenant owes rent or the notice has expired, possession normally still has to be
                    handled lawfully through the correct route.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What it usually means when a tenant will not leave
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                In many cases, the tenant is not simply “ignoring” the landlord. They may be waiting
                for the court process, disputing the notice, struggling to move, or hoping the
                landlord will not take the next step.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  A tenant staying after notice does <strong>not</strong> mean the landlord
                  automatically gets possession back on the expiry date. In practice, the next stage
                  is often a court possession claim and, if necessary, enforcement after that.
                </p>

                <p>
                  This is one of the most common points of confusion for landlords. Serving notice is
                  important, but it is often only the start of the possession process rather than the
                  end of it.
                </p>

                <p>
                  The right next step usually depends on three things: whether the notice was valid,
                  whether the tenant is in arrears or otherwise in breach, and whether the landlord is
                  now ready to move into court action.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What to do when your tenant won&apos;t leave
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Follow a structured legal process. Most landlords get into trouble when they rush,
                skip checks, or assume the notice itself is enough.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Check the notice is actually valid</h3>
                      <p className="text-gray-700 mb-3">
                        Before going near court, make sure the original notice was valid, correctly
                        completed and properly served. A surprising number of possession problems start
                        with paperwork that looked fine at first glance but fails on detail.
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          Correct form used for the chosen route
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          Correct notice period observed
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          Any required preconditions or supporting compliance steps completed
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          Clear proof of service retained
                        </li>
                      </ul>
                      <div className="mt-4">
                        <Link
                          href="/tools/validators/section-21"
                          className="inline-flex items-center gap-2 text-red-600 font-medium hover:underline"
                        >
                          Check your notice validity
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Choose the correct court route</h3>
                      <p className="text-gray-700 mb-3">
                        Once the notice period has expired and the tenant is still there, the landlord
                        will usually need to apply for possession. The correct route depends on the
                        notice used and the facts of the case.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">No-fault / notice-based route</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            Often used where the landlord is relying on the notice route rather than
                            arrears-based grounds.
                          </p>
                          <p className="text-sm text-gray-500">
                            Check the current form and court route before filing.
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Grounds / arrears route</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            Often relevant where rent arrears, breach, or another possession ground is
                            involved.
                          </p>
                          <p className="text-sm text-gray-500">
                            Usually more fact-sensitive and may involve a hearing.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/possession-claim-guide"
                          className="inline-flex items-center gap-2 text-red-600 font-medium hover:underline"
                        >
                          Read our possession claim guide
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Prepare for delay, defence and court scrutiny</h3>
                      <p className="text-gray-700 mb-3">
                        Even a landlord with a strong case may face delay. Courts may take time to
                        process claims, tenants may defend or seek extra time, and small paperwork
                        problems can cause setbacks.
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                          Court timelines can vary widely
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                          Defended claims usually take longer
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                          Missing paperwork can slow everything down
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Move to enforcement if the tenant still stays</h3>
                      <p className="text-gray-700 mb-3">
                        If the court grants possession and the tenant still does not leave, the matter
                        often moves to enforcement. This is the stage where landlords usually look at
                        bailiff or warrant-related steps.
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                          Possession order first
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                          Enforcement may still take additional time
                        </li>
                        <li className="flex items-start gap-2">
                          <Gavel className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                          Bailiff action normally follows the proper enforcement route, not landlord self-help
                        </li>
                      </ul>
                      <div className="mt-4">
                        <Link
                          href="/warrant-of-possession"
                          className="inline-flex items-center gap-2 text-red-600 font-medium hover:underline"
                        >
                          Learn about warrant of possession
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Why tenants stay after notice
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Understanding the reason can help landlords choose the right next step rather than
                reacting emotionally.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">They are waiting for court action</h3>
                  <p className="text-gray-700">
                    Some tenants know they do not have to leave just because the notice date has
                    passed and will wait for the landlord to take formal possession steps.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">They think the notice is invalid</h3>
                  <p className="text-gray-700">
                    If the tenant believes the notice is defective, they may simply stay and force the
                    landlord to prove the position through the proper route.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">They cannot secure alternative housing</h3>
                  <p className="text-gray-700">
                    Some tenants remain because they are struggling to move, cannot fund a move, or
                    have been told to stay until court action progresses.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">They are in arrears or dispute</h3>
                  <p className="text-gray-700">
                    Where arrears or wider disputes exist, the tenant may dig in, defend, or delay,
                    which makes good paperwork even more important for the landlord.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="problem"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="england"
                title="Need All the Court Forms?"
                description="Our complete eviction route helps landlords move from notice to possession and enforcement with clearer court-stage guidance."
              />
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">What should you do next?</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Link
                  href="/products/notice-only"
                  className="rounded-lg border border-gray-200 bg-white p-3 hover:border-red-600 transition-colors"
                >
                  Start a compliant eviction notice
                </Link>
                <Link
                  href="/possession-claim-guide"
                  className="rounded-lg border border-gray-200 bg-white p-3 hover:border-red-600 transition-colors"
                >
                  Move to possession claim stage
                </Link>
                <Link
                  href="/section-8-rent-arrears-eviction"
                  className="rounded-lg border border-gray-200 bg-white p-3 hover:border-red-600 transition-colors"
                >
                  Use section 8 if arrears are involved
                </Link>
                <Link
                  href="/section-21-notice-template"
                  className="rounded-lg border border-gray-200 bg-white p-3 hover:border-red-600 transition-colors"
                >
                  Use section 21 for the notice route
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Typical possession and enforcement timeline
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Exact timing varies, but many landlords underestimate how long the full route can take
                once notice has expired and the tenant remains in occupation.
              </p>

              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-200 hidden md:block" />

                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <FileText className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Notice is served</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Start</span>
                      </div>
                      <p className="text-gray-700">
                        The landlord serves the relevant notice and waits for the notice period to end.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <Clock className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Tenant stays after expiry</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Next stage</span>
                      </div>
                      <p className="text-gray-700">
                        If the tenant remains, the landlord usually needs to move into the court possession route.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <Scale className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Court possession stage</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Can take weeks or months</span>
                      </div>
                      <p className="text-gray-700">
                        The court reviews the claim, paperwork and any defence before deciding the possession outcome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <Gavel className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Enforcement stage</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Further delay possible</span>
                      </div>
                      <p className="text-gray-700">
                        If the tenant still does not leave after the possession order, enforcement may be needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Practical takeaway:</strong> many landlord cases take far longer than expected once
                  the tenant stays after notice. That is why valid paperwork and the correct next step matter.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FAQSection
          faqs={faqs}
          title="Tenant Won't Leave: FAQ"
          showContactCTA={false}
          variant="gray"
        />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="problem"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="england"
                title="Get Your Eviction Documents Now"
                description="Move from notice to possession with clearer paperwork, compliance checks and step-by-step instructions."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={tenantWontLeaveRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}