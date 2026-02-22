import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  n5bFormRelatedLinks,
  productLinks,
  guideLinks,
  landingPageLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { n5bFormFAQs } from '@/data/faqs';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  Shield,
  AlertTriangle,
  Gavel,
  X,
} from 'lucide-react';

const wizardLinkCompletePack = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'guide',
  topic: 'eviction',
});

const faqs = n5bFormFAQs;

export const metadata: Metadata = {
  title: 'N5B Form Guide UK — Accelerated Possession Procedure (2026)',
  description: 'Complete guide to Form N5B for accelerated possession in England. When to use it, how to fill it in, and what to expect from the court process.',
  keywords: [
    'n5b form',
    'form n5b',
    'accelerated possession',
    'accelerated possession procedure',
    'n5b accelerated possession',
    'section 21 court form',
    'possession claim form',
    'n5b guide',
    'how to fill in n5b',
    'accelerated eviction',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/n5b-form-guide',
  },
  openGraph: {
    title: 'N5B Form Guide UK — Accelerated Possession | Landlord Heaven',
    description: 'How to use Form N5B for accelerated possession after serving Section 21 notice. Step-by-step guide.',
    type: 'website',
  },
};

export default function N5BFormGuidePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'N5B Form Guide - Accelerated Possession',
    description: 'Complete guide to using Form N5B for accelerated possession procedure in England.',
    url: 'https://landlordheaven.co.uk/n5b-form-guide',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Guides', url: 'https://landlordheaven.co.uk/possession-claim-guide' },
        { name: 'N5B Form Guide', url: 'https://landlordheaven.co.uk/n5b-form-guide' },
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Section 21 Only"
          badgeIcon={<FileText className="w-4 h-4" />}
          title="N5B Form Guide — Accelerated Possession"
          subtitle={<>Form N5B is the <strong>fastest way to get a possession order</strong> after serving Section 21. No court hearing needed in most cases. If you also need to recover arrears, see our <Link href="/money-claim-online-mcol" className="text-primary hover:underline">Money Claim Online (MCOL) guide</Link>.</>}
          primaryCTA={{ label: 'Get Complete Pack — £129.99', href: wizardLinkCompletePack }}
          secondaryCTA={{ label: 'Need Section 21 First?', href: '/section-21-notice-template' }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              N5B Form Included
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Filing Instructions
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              6-8 Weeks to Order
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
                  <h2 className="font-bold text-amber-900 mb-1">Section 21 Required First</h2>
                  <p className="text-amber-800 text-sm">
                    Form N5B can only be used after serving a valid{' '}
                    <Link href="/form-6a-section-21" className="underline hover:text-amber-900">Form 6A Section 21 notice</Link>{' '}
                    and the notice period has expired. If you haven&apos;t served notice yet, start with our{' '}
                    <Link href="/section-21-notice-template" className="underline hover:text-amber-900">
                      Section 21 template
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* N5B vs N5 Comparison */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                N5B vs N5: Which Form Do You Need?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose based on your eviction notice type and whether you&apos;re claiming rent arrears.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl border border-gray-200 shadow-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                      <th className="text-center p-4 font-semibold text-primary">N5B (Accelerated)</th>
                      <th className="text-center p-4 font-semibold text-gray-900">N5 (Standard)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-4 text-gray-700">Notice type</td>
                      <td className="p-4 text-center text-gray-700">Section 21 only</td>
                      <td className="p-4 text-center text-gray-700">Section 8 or Section 21</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Court hearing</td>
                      <td className="p-4 text-center">
                        <span className="text-green-600 font-medium">Usually no</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-amber-600 font-medium">Yes, required</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Typical timeline</td>
                      <td className="p-4 text-center text-gray-700">6-8 weeks</td>
                      <td className="p-4 text-center text-gray-700">8-12 weeks</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Claim rent arrears?</td>
                      <td className="p-4 text-center">
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Court fee</td>
                      <td className="p-4 text-center text-gray-700">£355</td>
                      <td className="p-4 text-center text-gray-700">£355</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Written tenancy required?</td>
                      <td className="p-4 text-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-gray-500">No</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Our Recommendation</h4>
                    <p className="text-gray-600 text-sm">
                      Use N5B when you just want possession quickly and don&apos;t need to claim arrears.
                      Use N5 when you have Section 8 grounds or want to include an arrears claim.
                      Our Complete Pack includes both forms so you&apos;re covered either way.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Fill In Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Fill In Form N5B
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Key sections you&apos;ll need to complete on the accelerated possession form.
              </p>

              <div className="space-y-6">
                {/* Section 1 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Claimant and Defendant Details</h3>
                      <p className="text-gray-600">
                        Enter your name (or company name) as the claimant, and all tenant names as defendants.
                        Include full addresses for both parties.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Property Details</h3>
                      <p className="text-gray-600">
                        Full address of the rental property. Confirm it&apos;s let on an assured shorthold
                        tenancy and the date the tenancy began.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Section 21 Notice Details</h3>
                      <p className="text-gray-600">
                        Date the Section 21 notice was served, the date it expires, and confirmation that
                        Form 6A was used. You&apos;ll attach a copy of the notice.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Compliance Confirmation</h3>
                      <p className="text-gray-600">
                        Confirm the deposit was protected, prescribed information provided, and all required
                        documents were given to the tenant (EPC, gas certificate, How to Rent guide).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">5</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Statement of Truth</h3>
                      <p className="text-gray-600">
                        Sign the statement confirming all information is true. False statements can be
                        contempt of court — ensure everything is accurate.
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
                title="Get Form N5B Ready to File"
                description="Our Complete Pack includes pre-structured N5B with guidance for every section, plus all supporting documents you'll need."
              />
            </div>
          </div>
        </section>

        {/* What Happens After */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Happens After You File N5B
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The court process from filing to possession order.
              </p>

              <div className="relative">
                {/* Timeline */}
                <div className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Court Issues Claim</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Week 1</span>
                      </div>
                      <p className="text-gray-600">
                        Court sends copy to tenant with defence form. Tenant has 14 days to respond.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Defence Period</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Week 2-3</span>
                      </div>
                      <p className="text-gray-600">
                        If tenant files defence, court may order a hearing. If no defence, proceeds to paper decision.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gavel className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Judge Reviews</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Week 4-6</span>
                      </div>
                      <p className="text-gray-600">
                        Judge reviews documents and makes decision. If satisfied, issues possession order.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Possession Order</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Week 6-8</span>
                      </div>
                      <p className="text-gray-600">
                        Order gives tenant 14 days to leave. If they don&apos;t, apply for{' '}
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

        {/* FAQ Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <FAQSection
                faqs={faqs}
                title="N5B Form FAQ"
                showContactCTA={false}
                variant="white"
              />

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
                title="Get Your N5B Form Ready"
                description="Complete Eviction Pack includes N5B, N5, witness statements, and step-by-step filing instructions."
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
                links={n5bFormRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
