import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  possessionClaimRelatedLinks,
  productLinks,
  guideLinks,
  landingPageLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Gavel,
  Shield,
  AlertTriangle,
  PoundSterling,
} from 'lucide-react';

const wizardLinkCompletePack = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'guide',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Possession Claim Guide UK — How to Apply for Court Possession (2026)',
  description: 'Complete guide to applying for a court possession order in England. Form N5, N5B, hearing process, and timelines explained for UK landlords.',
  keywords: [
    'possession claim',
    'court possession order',
    'n5 form',
    'n5b form',
    'accelerated possession',
    'possession proceedings',
    'apply for possession order',
    'county court possession',
    'eviction court process',
    'landlord possession claim',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/possession-claim-guide',
  },
  openGraph: {
    title: 'Possession Claim Guide UK — Court Process Explained | Landlord Heaven',
    description: 'Step-by-step guide to applying for court possession orders. Forms, fees, and timelines for UK landlords.',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'What is a possession claim?',
    answer: 'A possession claim is a legal application to the county court asking for an order that requires your tenant to leave the property. You can only make a possession claim after serving a valid eviction notice and the notice period has expired.',
  },
  {
    question: 'What is the difference between N5 and N5B forms?',
    answer: 'Form N5 is used for standard possession claims (Section 8 and some Section 21 cases) and requires a court hearing. Form N5B is for accelerated possession (Section 21 only) and is usually decided on paper without a hearing, making it faster.',
  },
  {
    question: 'How much does a possession claim cost?',
    answer: 'The court fee is £355 for both standard (N5) and accelerated (N5B) possession claims. If you later need a bailiff warrant, that\'s an additional £130. Using a solicitor typically costs £1,000-2,000 on top of court fees.',
  },
  {
    question: 'How long does the possession claim process take?',
    answer: 'Accelerated possession (N5B) typically takes 6-8 weeks from filing to order. Standard possession (N5) takes 8-12 weeks as it requires a hearing date. Add 4-6 weeks for bailiff enforcement if the tenant doesn\'t leave.',
  },
  {
    question: 'Can the tenant defend against a possession claim?',
    answer: 'Yes. Tenants can file a defence within 14 days. For Section 21, defences are limited to procedural issues (invalid notice, deposit not protected). For Section 8, they can dispute the grounds or argue eviction would be unreasonable.',
  },
  {
    question: 'What happens at a possession hearing?',
    answer: 'The judge reviews your evidence and hears both parties. For mandatory grounds (Section 8 Ground 8), the judge must grant possession if the ground is proved. For discretionary grounds, they consider whether eviction is reasonable.',
  },
  {
    question: 'What is the 14-day possession order?',
    answer: 'If the court grants possession, they typically give the tenant 14 days to leave (or up to 42 days if the tenant claims exceptional hardship). After this date, you can apply for a bailiff warrant if they haven\'t left.',
  },
  {
    question: 'Can I claim rent arrears in the possession claim?',
    answer: 'Yes, you can include a claim for rent arrears and costs in your possession claim using the same N5 form. The court can order the tenant to pay the arrears as part of the possession order.',
  },
];

export default function PossessionClaimGuidePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Possession Claim Guide UK',
    description: 'Complete guide to applying for court possession orders in England. Covers N5 and N5B forms, fees, and process.',
    url: 'https://landlordheaven.co.uk/possession-claim-guide',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Guides', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
        { name: 'Possession Claim Guide', url: 'https://landlordheaven.co.uk/possession-claim-guide' },
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="England Only"
          badgeIcon={<Gavel className="w-4 h-4" />}
          title="Possession Claim Guide UK"
          subtitle={<>Your tenant hasn&apos;t left after the notice expired? Here&apos;s how to <strong>apply for a court possession order</strong> to legally regain your property.</>}
          primaryCTA={{ label: 'Get Complete Pack — £199.99', href: wizardLinkCompletePack }}
          secondaryCTA={{ label: 'Learn About N5B Form', href: '/n5b-form-guide' }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              All Court Forms Included
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Witness Statement Template
            </span>
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Step-by-Step Instructions
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Prerequisite Notice */}
        <section className="py-8 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-amber-900 mb-1">Before You Apply</h2>
                  <p className="text-amber-800 text-sm">
                    You must have served a valid eviction notice (Section 21 or Section 8) and the notice
                    period must have expired before making a possession claim. Haven&apos;t served notice yet?{' '}
                    <Link href="/section-21-notice-template" className="underline hover:text-amber-900">
                      Start with Section 21
                    </Link>{' '}
                    or{' '}
                    <Link href="/section-8-notice-template" className="underline hover:text-amber-900">
                      Section 8 template
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Claim Types */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Two Types of Possession Claim
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The type you use depends on which eviction notice you served.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Accelerated N5B */}
                <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Fastest Option
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Accelerated Possession</h3>
                      <span className="text-sm text-gray-500">Form N5B</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    For Section 21 notices only. Usually decided on paper without a court hearing.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No hearing required (usually)
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      6-8 weeks average
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Court fee: £355
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Cannot claim arrears
                    </li>
                  </ul>
                  <Link
                    href="/n5b-form-guide"
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Learn more about N5B
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Standard N5 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Scale className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Standard Possession</h3>
                      <span className="text-sm text-gray-500">Form N5</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    For Section 8 notices and some Section 21 cases. Requires a court hearing.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Gavel className="w-4 h-4 text-primary" />
                      Court hearing required
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-primary" />
                      8-12 weeks average
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <PoundSterling className="w-4 h-4 text-primary" />
                      Court fee: £355
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Can include arrears claim
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkCompletePack}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get N5 form in Complete Pack
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                The Possession Claim Process
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                What to expect from filing your claim to getting your property back.
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Complete the Claim Form</h3>
                      <p className="text-gray-600 mb-3">
                        Fill in form N5 or N5B with property details, tenant information, and grounds for possession.
                        Attach a copy of your eviction notice and proof of service.
                      </p>
                      <p className="text-sm text-gray-500">
                        Our Complete Pack includes pre-filled templates with instructions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">File at the County Court</h3>
                      <p className="text-gray-600 mb-3">
                        Submit your claim to the county court that covers your property&apos;s location.
                        You can file online via PCOL (Possession Claims Online) or by post.
                      </p>
                      <p className="text-sm text-gray-500">
                        Court fee: £355 (payable on submission)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Court Serves the Tenant</h3>
                      <p className="text-gray-600 mb-3">
                        The court sends a copy of your claim to the tenant along with a defence form.
                        The tenant has 14 days to file a defence.
                      </p>
                      <p className="text-sm text-gray-500">
                        If they don&apos;t file a defence, you may get judgment in default.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Hearing or Paper Decision</h3>
                      <p className="text-gray-600 mb-3">
                        <strong>N5B (Accelerated):</strong> Usually decided on paper. Judge reviews documents and makes order.
                        <br />
                        <strong>N5 (Standard):</strong> You attend a hearing to present your case.
                      </p>
                      <p className="text-sm text-gray-500">
                        Our Complete Pack includes witness statement templates for hearings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">5</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Possession Order Granted</h3>
                      <p className="text-gray-600 mb-3">
                        If successful, the court issues a possession order giving the tenant 14-42 days to leave.
                        This is a legally binding court order.
                      </p>
                      <p className="text-sm text-gray-500">
                        If they still don&apos;t leave, proceed to apply for a{' '}
                        <Link href="/warrant-of-possession" className="text-primary hover:underline">
                          warrant of possession
                        </Link>.
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
                title="Get All Court Forms Ready"
                description="Our Complete Eviction Pack includes N5, N5B, N119 forms plus witness statement templates and step-by-step filing instructions."
              />
            </div>
          </div>
        </section>

        {/* Costs Breakdown */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Possession Claim Costs
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Budget for these court fees when planning your possession claim.
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-900">Item</th>
                      <th className="text-right p-4 font-semibold text-gray-900">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-4 text-gray-700">Possession claim (N5 or N5B)</td>
                      <td className="p-4 text-right text-gray-700">£355</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">County court bailiff warrant (N325)</td>
                      <td className="p-4 text-right text-gray-700">£130</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">High Court enforcement (optional)</td>
                      <td className="p-4 text-right text-gray-700">£66+</td>
                    </tr>
                    <tr className="bg-primary/5">
                      <td className="p-4 font-semibold text-gray-900">Total (typical)</td>
                      <td className="p-4 text-right font-semibold text-gray-900">£485-550</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Plus our Complete Pack (£199.99) — <strong>save £850-1,550</strong> vs solicitor fees
                </p>
                <Link
                  href="/eviction-cost-uk"
                  className="inline-flex items-center gap-2 text-primary font-medium mt-2 hover:underline"
                >
                  See full eviction cost breakdown
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Possession Claim FAQ
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
                title="Get Your Court Forms Now"
                description="Complete Eviction Pack includes N5, N5B, witness statements, and step-by-step instructions."
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
                links={possessionClaimRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
