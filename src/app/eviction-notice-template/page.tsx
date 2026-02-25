import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks } from '@/lib/seo/internal-links';
import { StandardHero } from '@/components/marketing/StandardHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { FAQSection } from '@/components/seo/FAQSection';
import { IntentProductCTA } from '@/components/seo/IntentProductCTA';
import { evictionNoticeTemplateFAQs } from '@/data/faqs';
import { EvictionNoticeBundlePreviewSection } from '@/components/seo/EvictionNoticeBundlePreviewSection';
import { getNoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';
import { CheckCircle, ArrowRight, AlertTriangle, Scale, FileText, Landmark, Info } from 'lucide-react';

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
    <div className="min-h-screen bg-[#fcfaff]">
      <StructuredData data={pageSchema} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Eviction Notice Template', url: 'https://landlordheaven.co.uk/eviction-notice-template' },
      ])} />

      <HeaderConfig mode="autoOnScroll" />
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
          primaryCTA={{
            label: 'Generate Section 21 / Section 8 Notice',
            href: '/products/notice-only',
          }}
          secondaryCTA={{
            label: 'Need the full court bundle?',
            href: '/products/complete-pack',
          }}
          variant="pastel"
          showTrustPositioningBar={false}
        >
          <p className="mt-3 text-sm text-white/75 sm:text-base">
            Going to court next? The complete bundle includes N5/N5B + N119 and filing guidance.
          </p>
        </StandardHero>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
              <EvictionNoticeBundlePreviewSection previews={previews} />
            </div>
          </div>
        </section>

        <section className="bg-[#F3EEFF] py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10 flex justify-center">
                <Image
                  src="/images/why_this_bundle.webp"
                  alt="Why this bundle illustration"
                  width={340}
                  height={340}
                  className="h-auto w-full max-w-[340px] object-contain"
                />
              </div>
              <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 lg:text-5xl">Types of Eviction Notices by Jurisdiction</h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Your wizard route is jurisdiction-specific from the first question, ensuring England, Wales, and Scotland follow the correct statutory pathways.
              </p>

              <div className="grid gap-6 lg:grid-cols-3">
                <article className="rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_30px_rgba(105,46,212,0.1)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFF] border border-[#E6DBFF]">
                      <Landmark className="w-6 h-6 text-[#692ed4]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">England</h3>
                      <span className="text-sm text-gray-500">Housing Act 1988</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 text-gray-700 text-sm">
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" /> Section 21 Notice (Form 6A)</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" /> Section 8 Notice (Form 3)</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" /> Reform deadline awareness built in</li>
                  </ul>
                  <Link href="/products/notice-only" className="inline-flex items-center gap-2 text-[#692ed4] font-medium hover:underline">Generate by jurisdiction <ArrowRight className="w-4 h-4" /></Link>
                </article>

                <article className="rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_30px_rgba(105,46,212,0.1)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFF] border border-[#E6DBFF]">
                      <Scale className="w-6 h-6 text-[#692ed4]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Wales</h3>
                      <span className="text-sm text-gray-500">Renting Homes / Section 173 &amp; RHW23</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 text-gray-700 text-sm">
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" /> Occupation contract pathway checks</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" /> Section 173 notice and RHW23 workflow</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" /> Notice-period and service validation</li>
                  </ul>
                  <Link href="/products/notice-only" className="inline-flex items-center gap-2 text-[#692ed4] font-medium hover:underline">Generate by jurisdiction <ArrowRight className="w-4 h-4" /></Link>
                </article>

                <article className="rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_30px_rgba(105,46,212,0.1)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFF] border border-[#E6DBFF]">
                      <FileText className="w-6 h-6 text-[#692ed4]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Scotland</h3>
                      <span className="text-sm text-gray-500">PRT / Notice to Leave</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 text-gray-700 text-sm">
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" /> Notice to Leave for Private Residential Tenancies</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" /> Ground-specific timeline checks</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" /> Service and statutory wording validation</li>
                  </ul>
                  <Link href="/products/notice-only" className="inline-flex items-center gap-2 text-[#692ed4] font-medium hover:underline">Generate by jurisdiction <ArrowRight className="w-4 h-4" /></Link>
                </article>
              </div>

              <div className="mt-8 rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_10px_28px_rgba(105,46,212,0.08)]">
                <div className="flex items-start gap-4">
                  <Info className="w-5 h-5 text-[#692ed4] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Not sure which notice to use?</h3>
                    <p className="text-gray-600 text-sm">The wizard identifies your jurisdiction first, then maps your facts to the right statutory notice route before document generation.</p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-gray-700">
                Need the full court bundle?{' '}
                <Link href="/products/complete-pack" className="font-semibold text-[#692ed4] hover:underline">
                  View Complete Pack
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-8 shadow-[0_12px_30px_rgba(105,46,212,0.08)]">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Why the correct notice matters</h2>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-gray-700"><AlertTriangle className="w-5 h-5 mt-0.5 text-[#692ed4]" /> Incorrect wording can invalidate possession claims</li>
                    <li className="flex gap-3 text-gray-700"><AlertTriangle className="w-5 h-5 mt-0.5 text-[#692ed4]" /> Notice periods differ by jurisdiction and ground</li>
                    <li className="flex gap-3 text-gray-700"><AlertTriangle className="w-5 h-5 mt-0.5 text-[#692ed4]" /> Reform updates change statutory requirements</li>
                    <li className="flex gap-3 text-gray-700"><AlertTriangle className="w-5 h-5 mt-0.5 text-[#692ed4]" /> Errors can reset your eviction timeline</li>
                  </ul>
                  <p className="mt-6 text-gray-800 font-medium">Serving the correct notice, in the correct format, for your jurisdiction is the foundation of a successful possession claim.</p>
                </div>

                <div className="flex items-center justify-center rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-8 shadow-[0_12px_30px_rgba(105,46,212,0.08)]">
                  <Image
                    src="/images/why_accuracy_matters.webp"
                    alt="Why accuracy matters illustration"
                    width={640}
                    height={640}
                    className="h-auto w-full max-w-[640px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gradient-to-r from-[#692ED4] via-[#7A3BE5] to-[#5a21be] text-white">
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

        <section className="bg-[#F3EEFF] py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Generate Your Jurisdiction-Specific Notice Bundle</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Preview every watermarked document before you pay, then complete your bundle with one-time payment.</p>
              <IntentProductCTA intent={{ product: 'notice_only', src: 'seo_landing' }} label="Generate Court-Ready Notice — £49.99" className="hero-btn-secondary inline-flex items-center justify-center gap-2" />
              <p className="mt-8 text-white/70 text-sm">Preview before paying (watermarked) • Compliance checks • Jurisdiction-specific formatting</p>
            </div>
          </div>
        </section>


        <section className="bg-[#F3EEFF] py-16 lg:py-20">
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
    </div>
  );
}
