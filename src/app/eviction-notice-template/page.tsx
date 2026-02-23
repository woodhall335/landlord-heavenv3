import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks } from '@/lib/seo/internal-links';
import { StandardHero } from '@/components/marketing/StandardHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { IntentProductCTA, getIntentProductHref } from '@/components/seo/IntentProductCTA';
import { evictionNoticeTemplateFAQs } from '@/data/faqs';
import { EvictionNoticeBundlePreviewSection } from '@/components/seo/EvictionNoticeBundlePreviewSection';
import { getNoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';
import { CheckCircle, ArrowRight, AlertTriangle, Scale, Home, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Eviction Notice Template UK - Possession Notice Download',
  description: 'Choose your jurisdiction and generate an eviction notice template bundle. Section 21/8 (England), Section 173 (Wales), and Notice to Leave (Scotland).',
  keywords: [
    'eviction notice template uk',
    'eviction notice template',
    'possession notice',
    'possession notice template',
    'landlord eviction notice',
    'section 21 eviction',
    'section 8 eviction',
    'tenant eviction notice',
    'eviction letter template',
    'notice seeking possession',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/eviction-notice-template',
  },
  openGraph: {
    title: 'Eviction Notice Template UK | Landlord Heaven',
    description: 'Choose your jurisdiction and generate an eviction notice template bundle with compliance checks.',
    type: 'website',
  },
};

export default async function EvictionNoticeTemplatePage() {
  const previews = await getNoticeOnlyPreviewData();

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Eviction Notice Template UK',
    description: 'Jurisdiction-specific eviction notice template bundles for England, Wales, and Scotland.',
    url: 'https://landlordheaven.co.uk/eviction-notice-template',
    mainEntity: {
      '@type': 'Product',
      name: 'UK Eviction Notice Templates',
      description: 'Court-ready eviction notices for UK landlords',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '49.99',
        highPrice: '49.99',
        priceCurrency: 'GBP',
        offerCount: '1',
      },
    },
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Eviction Notice Template', url: 'https://landlordheaven.co.uk/eviction-notice-template' },
      ])} />

      <main>
        <StandardHero
          badge="Section 21 ends 1 May 2026"
          badgeIcon={<AlertTriangle className="w-4 h-4" />}
          title="Region-Specific Eviction Notice Generator – UK"
          subtitle={
            <>
              England (Section 21 Form 6A &amp; Section 8 Form 3), Wales (Section 173 &amp; RHW23), Scotland (Notice to Leave) — generated correctly for your jurisdiction with reform-aware compliance checks.
              <span className="block mt-3">
                Unlike generic form builders, we validate <strong>20+ legal requirements</strong> before generating court-ready documents — reducing the risk of rejected claims.
              </span>
            </>
          }
          primaryCTA={{ label: 'Generate Court-Ready Notice — £49.99', href: getIntentProductHref({ product: 'notice_only', src: 'seo_landing' }) }}
          variant="pastel"
          showTrustPositioningBar={false}
        />

        <EvictionNoticeBundlePreviewSection previews={previews} />

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Types of Eviction Notices by Jurisdiction</h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Your wizard route is jurisdiction-specific from the first question, ensuring England, Wales, and Scotland follow the correct statutory pathways.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">England Notices</h3>
                      <span className="text-sm text-gray-500">Housing Act 1988</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6 text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Section 21 Notice (Form 6A)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Section 8 Notice (Form 3)</li>
                    <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Reform deadline awareness built in</li>
                  </ul>
                  <Link href="/section-21-notice-template" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">Get England notice help <ArrowRight className="w-4 h-4" /></Link>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Scale className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Wales &amp; Scotland Notices</h3>
                      <span className="text-sm text-gray-500">RHW Act / PRT Rules</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6 text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Wales: Section 173 &amp; RHW23</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Scotland: Notice to Leave</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Ground and notice-period validation</li>
                  </ul>
                  <Link href={getIntentProductHref({ product: 'notice_only', src: 'seo_landing' })} className="inline-flex items-center gap-2 text-primary font-medium hover:underline">Generate by jurisdiction <ArrowRight className="w-4 h-4" /></Link>
                </div>
              </div>

              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Not sure which notice to use?</h3>
                    <p className="text-gray-600 text-sm">The wizard identifies your jurisdiction first, then maps your facts to the right statutory notice route before document generation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Why the correct notice matters</h2>
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <ul className="space-y-4">
                  <li className="flex gap-3 text-gray-700"><AlertTriangle className="w-5 h-5 mt-0.5 text-amber-500" /> Incorrect wording can invalidate possession claims</li>
                  <li className="flex gap-3 text-gray-700"><AlertTriangle className="w-5 h-5 mt-0.5 text-amber-500" /> Notice periods differ by jurisdiction and ground</li>
                  <li className="flex gap-3 text-gray-700"><AlertTriangle className="w-5 h-5 mt-0.5 text-amber-500" /> Reform updates change statutory requirements</li>
                  <li className="flex gap-3 text-gray-700"><AlertTriangle className="w-5 h-5 mt-0.5 text-amber-500" /> Errors can reset your eviction timeline</li>
                </ul>
                <p className="mt-6 text-gray-800 font-medium">Serving the correct notice, in the correct format, for your jurisdiction is the foundation of a successful possession claim.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">Section 21 Ends 1 May 2026</h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">The Renters&apos; Rights Act abolishes no-fault evictions. Act now if you need to evict without proving grounds.</p>
              <Section21Countdown variant="large" className="mb-8 [&_*]:text-white" />
              <IntentProductCTA intent={{ product: 'notice_only', src: 'seo_landing' }} label="Generate Court-Ready Notice — £49.99" className="hero-btn-secondary inline-flex items-center gap-2" />
            </div>
          </div>
        </section>

        <FAQSection faqs={evictionNoticeTemplateFAQs} title="Eviction Notice Template FAQ" showContactCTA={false} variant="gray" />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Generate Your Jurisdiction-Specific Notice Bundle</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Preview every watermarked document before you pay, then complete your bundle with one-time payment.</p>
              <IntentProductCTA intent={{ product: 'notice_only', src: 'seo_landing' }} label="Generate Court-Ready Notice — £49.99" className="hero-btn-secondary inline-flex items-center justify-center gap-2" />
              <p className="mt-8 text-white/70 text-sm">Preview before paying (watermarked) • Compliance checks • Jurisdiction-specific formatting</p>
            </div>
          </div>
        </section>


        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={[
                  productLinks.noticeOnly,
                  productLinks.completePack,
                  toolLinks.section21Generator,
                  toolLinks.section8Generator,
                  blogLinks.section21VsSection8,
                  blogLinks.evictionTimeline,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
