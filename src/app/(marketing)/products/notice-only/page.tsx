import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { noticeOnlyHeroConfig } from '@/components/landing/heroConfigs';
import { Container } from '@/components/ui';
import { FAQSection } from '@/components/seo/FAQSection';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import { WhatsIncludedInteractive } from '@/components/value-proposition';
import { getNoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';
import { FunnelProcessSection } from '@/components/funnels';
import { guideLinks, productLinks } from '@/lib/seo/internal-links';

const product = PRODUCTS.notice_only;
const price = product.displayPrice;
const canonicalUrl = getCanonicalUrl('/products/notice-only');

export const metadata: Metadata = {
  title: `Eviction Notice Generator (Section 8, May 2026) | England | ${price}`,
  description:
    'Generate a Section 8 notice for England under the post-May 2026 rules, with landlord checks on grounds, dates, service, and court readiness before you serve.',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `Eviction Notice Generator (Section 8, May 2026) | England | ${price}`,
    description:
      'England-only Section 8 notice generator with checks on grounds, dates, service, and next-step readiness under the current route.',
    url: canonicalUrl,
  },
};

const faqs = [
  {
    question: 'What does this product generate?',
    answer:
      'It generates an England Section 8 notice pack for the post-May 2026 route, including the notice itself, service guidance, and a practical validity checklist before you serve.',
  },
  {
    question: 'Is this England only?',
    answer:
      'Yes. The public product now covers England only and is written for the current England Section 8 route.',
  },
  {
    question: 'Does this help with Form 3A?',
    answer:
      'Yes. Form 3A is the supporting prescribed form terminology, but the product is led as a Section 8 eviction notice generator for landlords.',
  },
  {
    question: 'What does the wizard check before I buy?',
    answer:
      'The wizard checks the landlord route, selected grounds, key dates, service details, and obvious case-readiness issues so you can spot problems before serving the notice.',
  },
  {
    question: 'Can I preview before I pay?',
    answer:
      'Yes. You can preview the generated documents before purchase, then regenerate after edits if you need to correct facts or dates.',
  },
  {
    question: 'When should I choose the Complete Eviction Pack instead?',
    answer:
      'Choose the Complete Eviction Pack if you want the court-stage route as well as the notice. That product is for landlords moving from notice into N5, N119, and the possession claim process.',
  },
];

export const runtime = 'nodejs';

export default async function NoticeOnlyPage() {
  const previews = await getNoticeOnlyPreviewData();

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={productSchema({
          name: 'Eviction Notice Generator (Section 8, May 2026)',
          description:
            'England-only Section 8 notice generator with checks on grounds, dates, service, and court readiness before the notice is served.',
          price: product.price.toString(),
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Products', url: 'https://landlordheaven.co.uk/pricing' },
          { name: 'Eviction Notice Generator (Section 8, May 2026)', url: canonicalUrl },
        ])}
      />

      <UniversalHero {...noticeOnlyHeroConfig} showTrustPositioningBar />
      <FunnelProcessSection product="notice_only" noticePreviews={previews} />

      <section className="border-y border-[#EDE2FF] bg-white">
        <Container>
          <nav className="flex flex-wrap items-center gap-3 py-4 text-sm" aria-label="Section 8 quick links">
            <Link href="#who-this-is-for" className="font-medium text-primary hover:underline">
              Who this is for
            </Link>
            <Link href="#whats-included" className="font-medium text-primary hover:underline">
              What&apos;s included
            </Link>
            <Link href="#england-route" className="font-medium text-primary hover:underline">
              England route guides
            </Link>
            <Link href="#start-now" className="font-medium text-primary hover:underline">
              Start now
            </Link>
          </nav>
        </Container>
      </section>

      <section id="who-this-is-for" className="scroll-mt-24 py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">
              Generate the Section 8 notice landlords actually need to serve
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-700">
              This page is for England landlords who need to increase pressure on an eviction case
              by serving a Section 8 notice under the post-May 2026 rules. The goal is to get the
              notice route, grounds, dates, and service steps right before you buy or serve.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F7F3FF] p-5">
                <h3 className="text-lg font-semibold text-charcoal">Best fit</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                  <li>You need a Section 8 notice for rent arrears, breach, or another valid ground.</li>
                  <li>You want the landlord route checked before you serve anything.</li>
                  <li>You want clearer wording on dates, service, and next steps.</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-[#FFF7ED] p-5">
                <h3 className="text-lg font-semibold text-charcoal">Choose a different product if</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                  <li>You also need N5, N119, and the court-stage possession pack.</li>
                  <li>You are trying to recover debt rather than serve an eviction notice.</li>
                  <li>You need a tenancy agreement or rent increase workflow instead of possession paperwork.</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/wizard/flow?type=eviction&product=notice_only&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Start Eviction Notice Generator
              </Link>
              <Link
                href={productLinks.completePack.href}
                className="inline-flex items-center justify-center rounded-xl border border-[#D9D4EA] bg-white px-5 py-3 text-sm font-semibold text-[#2A3550] transition hover:border-[#BDAFE8]"
              >
                Need the full court pack instead?
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="whats-included" className="scroll-mt-24 py-12 md:py-16">
        <Container>
          <div className="mx-auto mb-6 max-w-6xl">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">What&apos;s included</h2>
            <p className="mt-3 max-w-3xl text-gray-700">
              You get an England notice pack focused on serving a Section 8 case properly: the
              notice itself, practical service guidance, and a validity checklist before you serve.
            </p>
          </div>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <WhatsIncludedInteractive
              product="notice_only"
              defaultJurisdiction="england"
              previews={previews}
              titleOverride="What&apos;s included in your Section 8 notice pack"
              subtitleOverride="England-only notice pack. Preview the documents, then generate the final version when the route and facts look right."
            />
          </div>
        </Container>
      </section>

      <section id="england-route" className="scroll-mt-24 bg-white py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">
              Check the England route before you serve
            </h2>
            <p className="mt-4 max-w-3xl text-gray-700">
              These England guides support the notice route. They explain the current framework,
              broad Section 8 intent, and exact Form 3A terminology without weakening the product
              CTA on this page.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                guideLinks.rentersRightsActEvictionRules,
                guideLinks.section8Notice,
                guideLinks.form3aSection8,
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-[#E6DBFF] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <p className="text-lg font-semibold text-charcoal">{link.title}</p>
                  <p className="mt-3 text-sm leading-6 text-gray-700">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="start-now" className="scroll-mt-24 bg-[#F3EEFF] py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 text-center shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">
              Start the England Section 8 notice route now
            </h2>
            <p className="mt-4 text-gray-700">
              The wizard keeps the route focused on England, checks the details that matter, and
              lets you switch to the Complete Eviction Pack if you decide you want the court-stage
              paperwork as well.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/wizard/flow?type=eviction&product=notice_only&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Start Eviction Notice Generator
              </Link>
              <Link
                href="/wizard/flow?type=eviction&product=complete_pack&src=product_page&topic=eviction"
                className="inline-flex items-center justify-center rounded-xl border border-[#D9D4EA] bg-white px-5 py-3 text-sm font-semibold text-[#2A3550] transition hover:border-[#BDAFE8]"
              >
                Switch to Complete Eviction Pack
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection
        title="Eviction Notice Generator FAQs"
        faqs={faqs}
        className="bg-white py-12 md:py-16"
      />
    </div>
  );
}
