import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { Container } from '@/components/ui/Container';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

const canonical = 'https://landlordheaven.co.uk/how-to-evict-a-tenant-uk';

export const metadata: Metadata = {
  title: 'How to Evict a Tenant in the UK | England Landlord Route',
  description:
    'A practical England-first eviction route for landlords. Start with the notice route if notice comes first, or move into the complete court pack when the case is already progressing.',
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'How to Evict a Tenant in England | Choose the Right Route',
    description:
      'Understand whether you should start with notice only or move straight into the complete eviction pack for the court stage.',
    url: canonical,
    siteName: 'Landlord Heaven',
    type: 'article',
  },
};

const faqs: FAQItem[] = [
  {
    question: 'Do I always need to serve notice before going to court?',
    answer:
      'Usually yes. Most England possession cases start with the correct notice route. The court paperwork matters if the tenant does not leave after notice or the case is already moving beyond the notice stage.',
  },
  {
    question: 'What if my tenant is not paying rent?',
    answer:
      'If the next step is serving notice, start with the Eviction Notice Generator. If the matter is already heading into a possession claim, the Complete Eviction Pack is usually the better fit.',
  },
  {
    question: 'What if the tenant simply will not leave?',
    answer:
      'That usually means you need the fuller possession route, especially if notice has already been served or the next concern is court paperwork rather than notice drafting.',
  },
  {
    question: 'Can I use this page for properties outside England?',
    answer:
      'No. This route page is written for landlords with property in England. Other UK nations follow different possession frameworks.',
  },
  {
    question: 'Where should I go if I want the longer legal explanation first?',
    answer:
      'Use the supporting guides below if you want more detail on Section 8, Form 3A, or the England possession process before you choose the product route.',
  },
];

const routeCards = [
  {
    title: 'Start with notice',
    body:
      'Use this when you still need to serve the notice correctly, settle the grounds, and keep the dates and service record straight before the court stage exists.',
    points: [
      'Best for arrears, breach, or nuisance cases at notice stage',
      'Helps with grounds, dates, service, and the initial file',
      'Routes to the Eviction Notice Generator',
    ],
    href: '/products/notice-only',
    label: 'View Eviction Notice Generator',
    eventName: 'entry_page_secondary_cta_click' as const,
    product: 'notice_only',
  },
  {
    title: 'Already moving toward court',
    body:
      'Use this when notice is not the only task anymore and you need the notice, claim forms, and possession paperwork to hold together in one route.',
    points: [
      'Best when the tenant still will not leave after notice',
      'Brings the notice route and the main court forms together',
      'Routes to the Complete Eviction Pack',
    ],
    href: '/products/complete-pack',
    label: 'View Complete Eviction Pack',
    eventName: 'entry_page_primary_cta_click' as const,
    product: 'complete_pack',
  },
];

export default function HowToEvictTenantUkPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/how-to-evict-a-tenant-uk"
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
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' },
          { name: 'How to Evict a Tenant in the UK', url: canonical },
        ])}
      />

      <UniversalHero
        title="How to evict a tenant in England"
        subtitle="Use this page as the route explainer. If you need to serve notice first, start with the notice route. If the case is already moving toward possession paperwork and court, move straight into the complete pack."
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="England landlord eviction route"
        showReviewPill
        showTrustPositioningBar
        actionsSlot={
          <>
            <div className="w-full sm:w-auto">
              <TrackedLink
                href="/products/complete-pack"
                pagePath="/how-to-evict-a-tenant-uk"
                pageType="entry_page"
                ctaLabel="View Complete Eviction Pack"
                ctaPosition="hero"
                eventName="entry_page_primary_cta_click"
                routeIntent="eviction_route"
                product="complete_pack"
                className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
              >
                View Complete Eviction Pack
              </TrackedLink>
            </div>
            <div className="w-full sm:w-auto">
              <TrackedLink
                href="/products/notice-only"
                pagePath="/how-to-evict-a-tenant-uk"
                pageType="entry_page"
                ctaLabel="Start with notice only"
                ctaPosition="hero"
                eventName="entry_page_secondary_cta_click"
                routeIntent="eviction_route"
                product="notice_only"
                className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
              >
                Start with notice only
              </TrackedLink>
            </div>
          </>
        }
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          <li>Built for landlords with property in England.</li>
          <li>Helps you choose between notice-stage and court-stage support quickly.</li>
          <li>Keeps the deeper guides available without making them the first click.</li>
        </ul>
      </UniversalHero>

      <section className="border-b border-[#E6DBFF] bg-white py-10">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#D7C7FF] bg-[#F8F4FF] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Quick answer
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[#2a2161]">
              Most landlords need one of two routes
            </h2>
            <p className="mt-4 max-w-3xl leading-8 text-gray-700">
              If the next practical step is serving the notice correctly, start
              with the Eviction Notice Generator. If notice is already served or
              the case is clearly moving toward possession paperwork and court,
              the Complete Eviction Pack is usually the better route.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {routeCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-[#E6DBFF] bg-white p-6"
                >
                  <h3 className="text-2xl font-semibold text-[#2a2161]">{card.title}</h3>
                  <p className="mt-3 leading-7 text-gray-700">{card.body}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-7 text-gray-700">
                    {card.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <TrackedLink
                    href={card.href}
                    pagePath="/how-to-evict-a-tenant-uk"
                    pageType="entry_page"
                    ctaLabel={card.label}
                    ctaPosition="route_card"
                    eventName={card.eventName}
                    routeIntent="eviction_route"
                    product={card.product}
                    className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                  >
                    {card.label}
                  </TrackedLink>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">The simplest England path</h2>
              <ol className="mt-5 space-y-4 text-gray-700">
                <li>1. Work out whether the next step is notice or court-stage paperwork.</li>
                <li>2. If notice comes first, start the notice route and keep the service record clean.</li>
                <li>3. If the tenant still does not leave, move into the possession paperwork route.</li>
                <li>4. Keep the notice, evidence, and court documents reading like one file.</li>
              </ol>
            </article>

            <article className="rounded-3xl border border-[#D7C7FF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">Where landlords get stuck</h2>
              <ul className="mt-5 space-y-4 text-gray-700">
                <li>They start reading broad legal explainers instead of deciding the next operational step.</li>
                <li>They use notice-only help when the case already needs claim forms and court continuity.</li>
                <li>They jump into court thinking without settling the notice, grounds, and service record first.</li>
                <li>They mix England pages with older UK-wide summaries that no longer help the live case.</li>
              </ul>
            </article>
          </div>
        </Container>
      </section>

      <section className="bg-[#F7F1FF] py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-8">
            <h2 className="text-3xl font-bold text-[#2a2161]">Use the deeper guides only when they help the decision</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  href: '/section-8-notice',
                  title: 'Section 8 notice',
                  body: 'Use this if you want the notice-stage detail before starting the product route.',
                },
                {
                  href: '/form-3-section-8',
                  title: 'Form 3A',
                  body: 'Use this if you need the current England notice form explained in more detail.',
                },
                {
                  href: '/eviction-process-england',
                  title: 'Eviction process in England',
                  body: 'Use this if you want the notice-to-court timeline explained stage by stage.',
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
        faqs={faqs}
        title="How to evict a tenant FAQs"
        showContactCTA={false}
        includeSchema={false}
        variant="white"
      />

      <section className="bg-[#F7F1FF] py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-[#24153F] via-[#35215F] to-[#5F42B5] p-8 text-white shadow-[0_24px_64px_rgba(46,29,86,0.28)] md:p-10">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Choose the route that matches the stage you are actually in
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/85 md:text-lg">
              If notice comes first, start there. If the case is already moving
              toward possession paperwork and court, use the fuller pack instead
              of trying to stitch the stages together later.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedLink
                href="/products/complete-pack"
                pagePath="/how-to-evict-a-tenant-uk"
                pageType="entry_page"
                ctaLabel="View Complete Eviction Pack"
                ctaPosition="final"
                eventName="entry_page_primary_cta_click"
                routeIntent="eviction_route"
                product="complete_pack"
                className="hero-btn-primary"
              >
                View Complete Eviction Pack
              </TrackedLink>
              <TrackedLink
                href="/products/notice-only"
                pagePath="/how-to-evict-a-tenant-uk"
                pageType="entry_page"
                ctaLabel="Start with notice only"
                ctaPosition="final"
                eventName="entry_page_secondary_cta_click"
                routeIntent="eviction_route"
                product="notice_only"
                className="hero-btn-secondary"
              >
                Start with notice only
              </TrackedLink>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
