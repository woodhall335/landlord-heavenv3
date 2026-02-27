import { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { tenantWontLeaveRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { tenantWontLeaveFAQs } from '@/data/faqs';
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
const faqs = tenantWontLeaveFAQs;

const wizardLinkNoticeOnly = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_tenant-wont-leave',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Tenant Won\'t Leave After Notice? What to Do Next (UK)',
  description: 'What to do when your tenant refuses to leave after an eviction notice in England. Legal options, court possession process, and bailiff enforcement explained.',
  keywords: [
    'tenant won\'t leave',
    'tenant refuses to leave',
    'tenant not leaving after section 21',
    'tenant won\'t move out',
    'what to do if tenant won\'t leave',
    'evict tenant who won\'t leave',
    'tenant staying after notice',
    'possession order',
    'bailiff eviction',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/tenant-wont-leave',
  },
  openGraph: {
    title: 'Tenant Won\'t Leave After Notice? What to Do Next | Landlord Heaven',
    description: 'Legal options when your tenant refuses to leave after serving an eviction notice. Court process and bailiff enforcement explained.',
    type: 'website',
  },
};

export default function TenantWontLeavePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tenant Won\'t Leave After Notice - UK Guide',
    description: 'Legal guide for UK landlords when tenants refuse to leave after an eviction notice.',
    url: 'https://landlordheaven.co.uk/tenant-wont-leave',
  };

  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={pageSchema} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Guides', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
        { name: 'Tenant Won\'t Leave', url: 'https://landlordheaven.co.uk/tenant-wont-leave' },
      ])} />

      {/* Analytics: Attribution + landing_view event */}
      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="england"
      />

      <main>
        {/* Hero Section */}
        <UniversalHero
          badge="England Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Tenant Won't Leave After Notice?"
          subtitle={<>Your tenant ignoring your eviction notice is frustrating — but you <strong>must follow the legal process</strong>. Here&apos;s exactly what to do next.</>}
          primaryCta={{ label: 'Get Court-Ready Notice — £49.99', href: wizardLinkNoticeOnly }}
          secondaryCta={{ label: 'Need Court Forms Too?', href: '/products/complete-pack' }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Section 21 & 8 Included
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Designed for Court Acceptance
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Ready in 5 Minutes
            </span>
          </div>
        </UniversalHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Warning Section */}
        <section className="py-12 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900 mb-2">
                    Do NOT Take Matters Into Your Own Hands
                  </h2>
                  <p className="text-red-800">
                    <strong>Illegal eviction</strong> is a criminal offence. You cannot change locks, remove belongings,
                    cut off utilities, or harass the tenant into leaving. Even if they owe rent or have damaged
                    the property, you must use the court process. Penalties include fines up to £5,000 and
                    potential imprisonment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What To Do Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What to Do When Your Tenant Won&apos;t Leave
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Follow this step-by-step process to legally regain possession of your property.
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Check Your Notice is Valid</h3>
                      <p className="text-gray-600 mb-3">
                        Before going to court, ensure you served a valid <Link href="/eviction-notice-uk" className="text-primary hover:underline">eviction notice</Link> and it was correctly served. Common issues include:
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          Correct form used (Form 6A for Section 21)
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          Deposit protected and prescribed information given
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          Proper notice period observed (2 months for Section 21)
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          EPC, gas safety certificate, and How to Rent guide provided
                        </li>
                      </ul>
                      <div className="mt-4">
                        <Link
                          href="/tools/validators/section-21"
                          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                        >
                          Check your Section 21 validity free
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
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
                      <h3 className="font-bold text-gray-900 mb-2">Apply for a Possession Order</h3>
                      <p className="text-gray-600 mb-3">
                        Once the notice period has expired and the tenant hasn&apos;t left, apply to the county court:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Section 21 (Accelerated)</h4>
                          <p className="text-sm text-gray-600 mb-2">Form N5B — no hearing needed in most cases</p>
                          <p className="text-sm text-gray-500">Court fee: £355</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Section 8 (Standard)</h4>
                          <p className="text-sm text-gray-600 mb-2">Form N5 — requires court hearing</p>
                          <p className="text-sm text-gray-500">Court fee: £355</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/possession-claim-guide"
                          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                        >
                          Read our full possession claim guide
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
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
                      <h3 className="font-bold text-gray-900 mb-2">Wait for the Court Order</h3>
                      <p className="text-gray-600 mb-3">
                        The court will review your application and issue a possession order if valid:
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                          <strong>Accelerated (N5B):</strong> Usually 6-8 weeks, paper-based
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                          <strong>Standard (N5):</strong> 8-12 weeks, includes hearing date
                        </li>
                      </ul>
                      <p className="text-gray-600 mt-3">
                        The order will give the tenant 14-28 days to leave (or immediately for certain grounds).
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
                      <h3 className="font-bold text-gray-900 mb-2">Apply for Bailiff Warrant (If Needed)</h3>
                      <p className="text-gray-600 mb-3">
                        If the tenant still won&apos;t leave after the court order date, apply for a warrant of possession:
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                          Form N325 (county court bailiff) or Form N323 (High Court enforcement)
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                          Typically 4-6 weeks wait for bailiff appointment
                        </li>
                        <li className="flex items-start gap-2">
                          <Gavel className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                          Bailiff fee: £130 (county court) or £66+ (High Court)
                        </li>
                      </ul>
                      <div className="mt-4">
                        <Link
                          href="/warrant-of-possession"
                          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
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

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="problem"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="england"
                title="Need All the Court Forms?"
                description="Our Complete Eviction Pack includes notices, possession claim forms (N5, N5B), witness statements, and step-by-step instructions."
              />
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Typical Eviction Timeline
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                From serving notice to bailiff enforcement — what to expect at each stage.
              </p>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />

                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Serve Notice</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Day 0</span>
                      </div>
                      <p className="text-gray-600">
                        Serve Section 21 (2 months) or Section 8 (2 weeks - 2 months depending on ground)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Notice Period Expires</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">2-8 weeks</span>
                      </div>
                      <p className="text-gray-600">
                        If tenant hasn&apos;t left, you can now apply to court for possession
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <Scale className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Court Possession Order</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">6-12 weeks</span>
                      </div>
                      <p className="text-gray-600">
                        Court reviews claim and issues possession order with leave date
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <Gavel className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Bailiff Enforcement</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">4-6 weeks</span>
                      </div>
                      <p className="text-gray-600">
                        If tenant still won&apos;t leave, bailiffs physically remove them
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Total time:</strong> Typically 4-6 months from serving notice to bailiff enforcement.
                  Section 21 accelerated possession is usually faster than Section 8 standard possession.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={faqs}
          title="Tenant Won't Leave: FAQ"
          showContactCTA={false}
          variant="gray"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="problem"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="england"
                title="Get Your Eviction Documents Now"
                description="Court-ready notices and forms. AI compliance checking. Step-by-step serving instructions."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={tenantWontLeaveRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
