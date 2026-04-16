import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { completePackHeroConfig } from '@/components/landing/heroConfigs';
import { Container } from '@/components/ui';
import { FAQSection } from '@/components/seo/FAQSection';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import { getCompletePackPreviewData } from '@/lib/previews/completePackPreviews';
import { WhatsIncludedInteractive } from '@/components/value-proposition';
import { FunnelProcessSection } from '@/components/funnels';
import { guideLinks, productLinks } from '@/lib/seo/internal-links';

const product = PRODUCTS.complete_pack;
const price = product.displayPrice;
const canonicalUrl = getCanonicalUrl('/products/complete-pack');

export const metadata: Metadata = {
  title: `Complete Eviction Pack (Court Possession - England) | ${price}`,
  description:
    'Prepare the England court-possession route with a Section 8 notice, N5, N119, possession claim drafting, and filing guidance in one workflow.',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `Complete Eviction Pack (Court Possession - England) | ${price}`,
    description:
      'Court possession pack for landlords in England with the Section 8 route, N5, N119, evidence prompts, and filing guidance in one workflow.',
    url: canonicalUrl,
  },
};

const faqs = [
  {
    question: 'What does the Complete Eviction Pack include?',
    answer:
      'It includes the England notice-to-court route: the Section 8 notice, service guidance, core court forms including N5 and N119, filing guidance, and supporting prompts for the possession claim.',
  },
  {
    question: 'Who is this built for?',
    answer:
      'It is built for landlords handling the court possession route for property in England.',
  },
  {
    question: 'When should I choose this instead of the notice product?',
    answer:
      'Choose this pack when you want the full court-possession route rather than the notice alone. If you only need to serve the notice first, the Eviction Notice Generator is the better fit.',
  },
  {
    question: 'Does this include N5 and N119?',
    answer:
      'Yes. N5 and N119 are part of the court-stage pack for England possession claims, alongside the notice and filing guidance.',
  },
  {
    question: 'Can I preview before I pay?',
    answer:
      'Yes. You can review the generated pack before purchase, then regenerate after edits if your facts, dates, or evidence notes change.',
  },
  {
    question: 'Does this replace legal advice?',
    answer:
      'No. It is a document-generation and workflow product, not a solicitor. It helps you prepare the route and paperwork more clearly, but it does not provide representation or legal advice.',
  },
];

export const runtime = 'nodejs';

export default async function CompleteEvictionPackPage() {
  const previews = await getCompletePackPreviewData();

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={productSchema({
          name: 'Complete Eviction Pack',
          description:
            'Court possession pack for landlords in England with Section 8 notice generation, N5, N119, evidence prompts, and filing guidance.',
          price: product.price.toString(),
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Products', url: 'https://landlordheaven.co.uk/pricing' },
          { name: 'Complete Eviction Pack', url: canonicalUrl },
        ])}
      />

      <UniversalHero {...completePackHeroConfig} showTrustPositioningBar />
      <FunnelProcessSection product="complete_pack" completePackPreviews={previews} />

      <section className="border-y border-[#EDE2FF] bg-white">
        <Container>
          <nav className="flex flex-wrap items-center gap-3 py-4 text-sm" aria-label="Complete Eviction Pack quick links">
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
              The full England route from Section 8 notice to court possession
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-700">
              This page is for landlords who already know they want more than the notice. It is the
              court-possession route for England, bringing the Section 8 notice together with N5,
              N119, evidence prompts, and filing guidance in one workflow.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F7F3FF] p-5">
                <h3 className="text-lg font-semibold text-charcoal">Best fit</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                  <li>You need the notice and the court-stage possession paperwork together.</li>
                  <li>You want the N5 and N119 route prepared in the same workflow as the notice.</li>
                  <li>You want a clearer handoff from notice expiry into filing.</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-[#FFF7ED] p-5">
                <h3 className="text-lg font-semibold text-charcoal">Choose a different product if</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                  <li>You only need to serve the Section 8 notice first.</li>
                  <li>You are recovering debt rather than preparing possession paperwork.</li>
                  <li>You need a tenancy agreement or rent increase product instead.</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/wizard/flow?type=eviction&product=complete_pack&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Start Complete Eviction Pack
              </Link>
              <Link
                href={productLinks.noticeOnly.href}
                className="inline-flex items-center justify-center rounded-xl border border-[#D9D4EA] bg-white px-5 py-3 text-sm font-semibold text-[#2A3550] transition hover:border-[#BDAFE8]"
              >
                Only need the notice?
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
              You get the England court-possession pack in one place: the notice stage, the court
              forms, and the guidance that helps you move cleanly from notice expiry into filing.
            </p>
          </div>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <WhatsIncludedInteractive
              product="complete_pack"
              previews={previews}
              titleOverride="What&apos;s included in your Complete Eviction Pack"
              subtitleOverride="Preview the notice, N5, N119, and supporting documents before you buy."
            />
          </div>
        </Container>
      </section>

      <section id="england-route" className="scroll-mt-24 bg-white py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">
              Check the England court route before you file
            </h2>
            <p className="mt-4 max-w-3xl text-gray-700">
              These guides support the possession route and help this page own the right court-stage
              intent without drifting back into mixed-jurisdiction wording.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                guideLinks.rentersRightsActEvictionRules,
                guideLinks.howToEvictTenantEngland,
                guideLinks.evictionProcessEngland,
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
              Prepare the full England possession route now
            </h2>
            <p className="mt-4 text-gray-700">
              Start with the court-stage product if you want the Section 8 notice, N5, N119, and
              filing guidance aligned in one England workflow from the beginning.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/wizard/flow?type=eviction&product=complete_pack&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Start Complete Eviction Pack
              </Link>
              <Link
                href="/wizard/flow?type=eviction&product=notice_only&src=product_page&topic=eviction"
                className="inline-flex items-center justify-center rounded-xl border border-[#D9D4EA] bg-white px-5 py-3 text-sm font-semibold text-[#2A3550] transition hover:border-[#BDAFE8]"
              >
                Switch to Eviction Notice Generator
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection
        title="Complete Eviction Pack FAQs"
        faqs={faqs}
        className="bg-white py-12 md:py-16"
      />
    </div>
  );
}
