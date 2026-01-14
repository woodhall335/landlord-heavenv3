import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  warrantOfPossessionRelatedLinks,
  productLinks,
  guideLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  Shield,
  AlertTriangle,
  Gavel,
  Users,
  PoundSterling,
  Home,
} from 'lucide-react';

const wizardLinkCompletePack = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Warrant of Possession UK — Bailiff Eviction Guide (2026)',
  description: 'How to apply for a warrant of possession after getting a court order. County court bailiffs, High Court enforcement, and what to expect on eviction day.',
  keywords: [
    'warrant of possession',
    'bailiff eviction',
    'n325 form',
    'county court bailiff',
    'high court enforcement',
    'eviction warrant',
    'bailiff appointment',
    'possession warrant',
    'enforce possession order',
    'eviction day uk',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/warrant-of-possession',
  },
  openGraph: {
    title: 'Warrant of Possession UK — Bailiff Eviction Guide | Landlord Heaven',
    description: 'Apply for bailiff enforcement after getting a possession order. County court vs High Court options explained.',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'What is a warrant of possession?',
    answer: 'A warrant of possession is a court order authorizing bailiffs to physically remove tenants from a property. You can only apply for one after the court has granted a possession order and the tenant has failed to leave by the specified date.',
  },
  {
    question: 'How do I apply for a warrant of possession?',
    answer: 'Complete Form N325 (Request for Warrant of Possession of Land) and submit it to the same county court that issued your possession order. Pay the fee (£130) and wait for a bailiff appointment date, typically 4-6 weeks.',
  },
  {
    question: 'How much does a warrant of possession cost?',
    answer: 'County court bailiff warrant (Form N325) costs £130. If you transfer to High Court for faster enforcement, the writ fee is £66 plus enforcement officer fees (typically £300-600+ depending on complexity).',
  },
  {
    question: 'How long does it take to get a bailiff appointment?',
    answer: 'County court bailiffs typically have a 4-6 week waiting list. High Court Enforcement Officers (HCEOs) are often faster, sometimes within 1-2 weeks, but cost more and require transferring the case to High Court.',
  },
  {
    question: 'What happens on eviction day?',
    answer: 'Bailiffs arrive at the property (usually between 9am-4pm), request the tenant leave, and if they refuse, physically remove them. You can attend to secure the property immediately after. Bailiffs can use reasonable force if necessary.',
  },
  {
    question: 'Can the tenant stop the bailiff eviction?',
    answer: 'Tenants can apply to the court to suspend the warrant on grounds of exceptional hardship, but this is rarely successful if a valid possession order exists. They must apply before the eviction date.',
  },
  {
    question: 'What should I bring on eviction day?',
    answer: 'Bring: a locksmith (arranged in advance), ID to prove you\'re the landlord, the possession order, and contact details for the bailiff. Consider having a cleaner and photographer booked for immediately after.',
  },
  {
    question: 'What about the tenant\'s belongings?',
    answer: 'You must store belongings left behind for a reasonable period (typically 14-28 days) and make reasonable attempts to contact the tenant. You can charge reasonable storage costs. After this period, you can dispose of items.',
  },
];

export default function WarrantOfPossessionPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Warrant of Possession UK - Bailiff Eviction Guide',
    description: 'Guide to applying for warrant of possession and bailiff enforcement in England.',
    url: 'https://landlordheaven.co.uk/warrant-of-possession',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Guides', url: 'https://landlordheaven.co.uk/possession-claim-guide' },
        { name: 'Warrant of Possession', url: 'https://landlordheaven.co.uk/warrant-of-possession' },
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Final Step"
          badgeIcon={<Gavel className="w-4 h-4" />}
          title="Warrant of Possession — Bailiff Eviction"
          subtitle={<>Your tenant won&apos;t leave despite the court order? A <strong>warrant of possession</strong> authorizes bailiffs to physically remove them.</>}
          primaryCTA={{ label: 'Get Complete Pack — £199.99', href: wizardLinkCompletePack }}
          secondaryCTA={{ label: 'View Possession Claim Guide', href: '/possession-claim-guide' }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              N325 Form Guidance
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Eviction Day Checklist
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              4-6 Weeks Typical Wait
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Prerequisite */}
        <section className="py-8 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-amber-900 mb-1">Possession Order Required First</h2>
                  <p className="text-amber-800 text-sm">
                    You can only apply for a warrant of possession after the court has granted a possession
                    order and the tenant has failed to leave by the date specified in that order. See our{' '}
                    <Link href="/possession-claim-guide" className="underline hover:text-amber-900">
                      possession claim guide
                    </Link>{' '}
                    for the previous step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Options */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Two Ways to Enforce Your Possession Order
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose between county court bailiffs (cheaper) or High Court enforcement (faster).
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* County Court */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">County Court Bailiff</h3>
                      <span className="text-sm text-gray-500">Form N325</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Standard route through the county court that issued your possession order.
                    Lower cost but longer waiting times.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <PoundSterling className="w-4 h-4 text-green-500" />
                      Cost: £130 court fee
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Waiting time: 4-6 weeks
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No transfer required
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500">
                    Best for: Standard evictions where time isn&apos;t critical
                  </p>
                </div>

                {/* High Court */}
                <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Faster
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Gavel className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">High Court Enforcement</h3>
                      <span className="text-sm text-gray-500">Writ of Possession</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Transfer your case to High Court for faster enforcement by High Court
                    Enforcement Officers (HCEOs).
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <PoundSterling className="w-4 h-4 text-amber-500" />
                      Cost: £66 + £300-600 HCEO fees
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-green-500" />
                      Waiting time: 1-2 weeks
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-primary" />
                      Requires N293A transfer form
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500">
                    Best for: Urgent situations or problem tenants
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Apply for a Warrant of Possession
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Steps to request bailiff enforcement through the county court.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Wait for the Order Date to Pass</h3>
                      <p className="text-gray-600">
                        Your possession order specifies a date by which the tenant must leave (typically 14-42 days
                        from the order). You cannot apply for a warrant until after this date.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Complete Form N325</h3>
                      <p className="text-gray-600">
                        Fill in Form N325 (Request for Warrant of Possession of Land) with the case number,
                        property address, and your details. It&apos;s straightforward if you have your possession order.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Submit and Pay the Fee</h3>
                      <p className="text-gray-600">
                        Submit Form N325 to the county court that issued your possession order. Pay the £130 fee.
                        You can do this online, by post, or in person.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Wait for Appointment</h3>
                      <p className="text-gray-600">
                        The court will issue the warrant and schedule a bailiff appointment. You&apos;ll receive a letter
                        with the date (typically 4-6 weeks from application). The tenant also receives notice.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-green-600">5</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Eviction Day</h3>
                      <p className="text-gray-600">
                        Attend the property on the scheduled date. Bailiffs will remove the tenant and hand over
                        possession. Have a locksmith ready to change locks immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="section"
                jurisdiction="england"
                title="Need All Court Documents?"
                description="Our Complete Pack includes guides for warrant applications plus all earlier documents (notices, possession claim forms, witness statements)."
              />
            </div>
          </div>
        </section>

        {/* Eviction Day Checklist */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Eviction Day Checklist
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Be prepared for when the bailiffs arrive.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Documents to Bring
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Photo ID (passport/driving licence)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Copy of possession order</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Warrant letter from court</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Bailiff contact number</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" />
                      Arrange in Advance
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Locksmith (on standby nearby)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Professional cleaner (book for same day)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Camera/phone for photos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Storage solution for belongings</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">On the Day</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Arrive 15 minutes before scheduled time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Stay calm and let bailiffs lead</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Photograph property condition before cleaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Change locks immediately after handover</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Secure any belongings left behind</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Warrant of Possession FAQ
              </h2>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <SeoCtaBlock
                pageType="court"
                variant="faq"
                jurisdiction="england"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="final"
                jurisdiction="england"
                title="Get All Your Eviction Documents"
                description="Complete Eviction Pack covers every stage from notice to possession. Court-ready format with step-by-step guidance."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={warrantOfPossessionRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
