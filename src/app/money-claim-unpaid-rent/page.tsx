import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

const canonical = getCanonicalUrl('/money-claim-unpaid-rent');

export const metadata: Metadata = {
  title: 'Money Claim for Unpaid Rent | England Landlord Route',
  description:
    'Use this England landlord route when your main goal is recovering unpaid rent or other tenancy debt. Start with the money claim pack, or use the eviction route if possession is part of the problem.',
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'Money Claim for Unpaid Rent | Choose the Right Route',
    description:
      'Recover debt through the money claim route, and keep possession work separate when that is the clearer next step.',
    type: 'article',
    url: canonical,
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
};

const faqs: FAQItem[] = [
  {
    question: 'Can I recover unpaid rent without seeking possession?',
    answer:
      'Yes. If the main goal is recovering the debt itself, the money claim route is usually the cleaner route, especially once the arrears figure is stable.',
  },
  {
    question: 'What if I want possession as well as arrears?',
    answer:
      'If possession is part of the immediate problem, you may need the eviction route first or alongside it. This page is mainly for the debt-recovery route when the money claim is the main task.',
  },
  {
    question: 'Can I claim for bills, damage, or guarantor debt too?',
    answer:
      'Yes, if those sums are properly documented and belong in the debt file. The key is one clear figure and one coherent supporting bundle.',
  },
  {
    question: 'Do I need a Letter Before Claim first?',
    answer:
      'Usually yes. A money claim is stronger when the pre-action steps, arrears schedule, and supporting papers are settled before issue.',
  },
  {
    question: 'Is this route only for England?',
    answer:
      'Yes. This route page is written for landlords with property in England.',
  },
];

export default function MoneyClaimUnpaidRentPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/money-claim-unpaid-rent"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: metadata.title as string,
          description: metadata.description as string,
          url: canonical,
          datePublished: '2026-04-23',
          dateModified: '2026-04-23',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Debt recovery guides', url: canonical },
          { name: 'Money Claim for Unpaid Rent', url: canonical },
        ])}
      />

      <UniversalHero
        badge="Debt recovery"
        title="Recover unpaid rent without taking the wrong route"
        subtitle="Use the money claim route when the main task is recovering rent, bills, damage, or other tenancy debt in England. If possession is the real next step, use the eviction route instead of forcing everything into one claim."
        variant="pastel"
        showTrustPositioningBar
        actionsSlot={
          <>
            <div className="w-full sm:w-auto">
              <TrackedLink
                href="/products/money-claim"
                pagePath="/money-claim-unpaid-rent"
                pageType="entry_page"
                ctaLabel="View Money Claim Pack"
                ctaPosition="hero"
                eventName="entry_page_primary_cta_click"
                routeIntent="rent_arrears_recovery"
                product="money_claim"
                className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
              >
                View Money Claim Pack
              </TrackedLink>
            </div>
            <div className="w-full sm:w-auto">
              <TrackedLink
                href="/products/notice-only"
                pagePath="/money-claim-unpaid-rent"
                pageType="entry_page"
                ctaLabel="Need possession first? Start notice route"
                ctaPosition="hero"
                eventName="entry_page_secondary_cta_click"
                routeIntent="rent_arrears_recovery"
                product="notice_only"
                className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
              >
                Need possession first? Start notice route
              </TrackedLink>
            </div>
          </>
        }
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          <li>Built for landlords in England recovering tenancy debt.</li>
          <li>Keeps debt recovery distinct from the possession route.</li>
          <li>Pushes the product route up before the guide detail.</li>
        </ul>
      </UniversalHero>

      <section className="border-b border-[#E6DBFF] bg-white py-10">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#D7C7FF] bg-[#F8F4FF] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Quick route
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[#2a2161]">
              Recover the debt separately when that is the clearer job
            </h2>
            <p className="mt-4 max-w-3xl leading-8 text-gray-700">
              Many landlords blur possession and debt recovery together. That can
              slow both. If your main goal is recovering what is owed, start with
              the money claim route. If the immediate issue is getting possession,
              use the eviction route and treat debt recovery as a separate decision.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-[#E6DBFF] bg-white p-6">
                <h3 className="text-2xl font-semibold text-[#2a2161]">Use the money claim route</h3>
                <p className="mt-3 leading-7 text-gray-700">
                  Best when the debt figure is being settled, the tenant may have
                  left, or the main objective is getting judgment for rent, bills,
                  damage, or guarantor debt.
                </p>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-gray-700">
                  <li>Routes to the Money Claim Pack</li>
                  <li>Keeps the arrears schedule, pre-action steps, and claim papers together</li>
                  <li>Works better when the debt file is the real focus</li>
                </ul>
                <TrackedLink
                  href="/products/money-claim"
                  pagePath="/money-claim-unpaid-rent"
                  pageType="entry_page"
                  ctaLabel="View Money Claim Pack"
                  ctaPosition="route_card"
                  eventName="entry_page_primary_cta_click"
                  routeIntent="rent_arrears_recovery"
                  product="money_claim"
                  className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                >
                  View Money Claim Pack
                </TrackedLink>
              </article>

              <article className="rounded-2xl border border-[#E6DBFF] bg-white p-6">
                <h3 className="text-2xl font-semibold text-[#2a2161]">Use the eviction route first</h3>
                <p className="mt-3 leading-7 text-gray-700">
                  Best when the pressing problem is rent arrears plus possession,
                  and the next step is still serving notice or moving into the
                  possession paperwork path.
                </p>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-gray-700">
                  <li>Start with notice only if you are still at notice stage</li>
                  <li>Use the complete pack if the case is already progressing toward court</li>
                  <li>Keep the debt route separate if that becomes the clearer next step later</li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <TrackedLink
                    href="/products/notice-only"
                    pagePath="/money-claim-unpaid-rent"
                    pageType="entry_page"
                    ctaLabel="Start notice route"
                    ctaPosition="route_card"
                    eventName="entry_page_secondary_cta_click"
                    routeIntent="rent_arrears_recovery"
                    product="notice_only"
                    className="inline-flex items-center rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                  >
                    Start notice route
                  </TrackedLink>
                  <TrackedLink
                    href="/products/complete-pack"
                    pagePath="/money-claim-unpaid-rent"
                    pageType="entry_page"
                    ctaLabel="View Complete Eviction Pack"
                    ctaPosition="route_card"
                    eventName="entry_page_secondary_cta_click"
                    routeIntent="rent_arrears_recovery"
                    product="complete_pack"
                    className="inline-flex items-center rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 font-semibold text-primary hover:bg-[#FCFAFF]"
                  >
                    View Complete Eviction Pack
                  </TrackedLink>
                </div>
              </article>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-3xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">What usually needs doing next</h2>
              <ol className="mt-5 space-y-4 text-gray-700">
                <li>1. Decide whether the main job is possession or debt recovery.</li>
                <li>2. If it is debt recovery, stabilise the arrears figure and supporting papers.</li>
                <li>3. Keep the Letter Before Claim, schedule, and claim file aligned.</li>
                <li>4. Use the possession route separately if the tenant still needs removing.</li>
              </ol>
            </article>

            <article className="rounded-3xl border border-[#D7C7FF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">Why claims get slowed down</h2>
              <ul className="mt-5 space-y-4 text-gray-700">
                <li>The rent figure changes because the file was rushed before it was stable.</li>
                <li>The landlord mixes possession paperwork and debt paperwork without a clear route.</li>
                <li>The claim starts before the pre-action steps and supporting documents are tidy.</li>
                <li>The debt is real, but the bundle does not explain it cleanly enough for court.</li>
              </ul>
            </article>
          </div>
        </Container>
      </section>

      <section className="bg-[#F7F1FF] py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-8">
            <h2 className="text-3xl font-bold text-[#2a2161]">Supporting guides if you still want more detail</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  href: '/money-claim',
                  title: 'Money claim guide',
                  body: 'Read the broader England money claim guide if you want the longer walkthrough.',
                },
                {
                  href: '/section-8-notice',
                  title: 'Section 8 notice',
                  body: 'Use this if the immediate issue is still serving notice for arrears and possession.',
                },
                {
                  href: '/eviction-process-england',
                  title: 'Eviction process in England',
                  body: 'Use this if you want the notice-to-court possession sequence explained in more detail.',
                },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-5 transition hover:border-primary hover:bg-white"
                >
                  <p className="text-lg font-semibold text-[#2a2161]">{link.title}</p>
                  <p className="mt-2 leading-7 text-gray-700">{link.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <FAQSection
        title="Money claim for unpaid rent FAQs"
        faqs={faqs}
        includeSchema={false}
        showContactCTA={false}
        variant="white"
      />

      <section className="bg-[#F7F1FF] py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-[#24153F] via-[#35215F] to-[#5F42B5] p-8 text-white shadow-[0_24px_64px_rgba(46,29,86,0.28)] md:p-10">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Recover what is owed with the route that matches the job
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/85 md:text-lg">
              If the debt is the main problem, move into the money claim pack.
              If possession still comes first, use the eviction route instead of
              trying to force both jobs into one unclear file.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedLink
                href="/products/money-claim"
                pagePath="/money-claim-unpaid-rent"
                pageType="entry_page"
                ctaLabel="View Money Claim Pack"
                ctaPosition="final"
                eventName="entry_page_primary_cta_click"
                routeIntent="rent_arrears_recovery"
                product="money_claim"
                className="hero-btn-primary"
              >
                View Money Claim Pack
              </TrackedLink>
              <TrackedLink
                href="/products/notice-only"
                pagePath="/money-claim-unpaid-rent"
                pageType="entry_page"
                ctaLabel="Need possession first? Start notice route"
                ctaPosition="final"
                eventName="entry_page_secondary_cta_click"
                routeIntent="rent_arrears_recovery"
                product="notice_only"
                className="hero-btn-secondary"
              >
                Need possession first? Start notice route
              </TrackedLink>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
