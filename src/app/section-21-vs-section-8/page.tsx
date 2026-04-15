import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { LegacySection21Banner } from '@/components/seo/LegacySection21Banner';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';
import { SECTION21_COURT_CUTOFF_DATE, SECTION21_END_DATE } from '@/lib/seo/section21-transition-copy';

const canonical = 'https://landlordheaven.co.uk/section-21-vs-section-8';
const ownerPageLink = '/products/notice-only';
const currentRulesLink = '/renters-rights-act-eviction-rules';
const currentGuideLink = '/section-8-notice';
const currentProcessLink = '/eviction-process-england';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Section 21 vs Section 8 | Historical Comparison and Current England Route',
  description:
    'Understand the difference between historical Section 21 intent and the current England possession route, then move back to the current notice path.',
  alternates: { canonical },
  openGraph: {
    title: 'Section 21 vs Section 8 | Historical Comparison and Current England Route',
    description:
      'A practical England guide comparing historical Section 21 terminology with the current England possession route.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const faqs: FAQItem[] = [
  {
    question: 'Are Section 21 and Section 8 still equal live routes in England?',
    answer:
      'No. Section 21 is now historical-only transition language in England, while live cases now need the current England possession route under the Renters’ Rights Act framework.',
  },
  {
    question: 'Why keep a Section 21 vs Section 8 page live at all?',
    answer:
      'Because landlords still search with older terminology. This page translates that intent into the current England notice path, then sends you back to the broad owner page and current live guidance.',
  },
  {
    question: 'Where should broad notice users go first?',
    answer:
      'Broad notice users should go to the eviction notice pack first so they can see the current route, service guidance, and notice-stage workflow before they commit to a specific path.',
  },
  {
    question: 'When does Notice Only become the right next step?',
    answer:
      'Notice Only becomes the right next step once you already understand the case belongs in the live notice workflow and mainly need route checks, service guidance, and validity checks before service.',
  },
];

function SupportCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-[#2a2161]">{title}</h2>
      <div className="mt-4 space-y-4 leading-7 text-gray-700">{children}</div>
    </article>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/section-21-vs-section-8"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 21 vs Section 8',
          description: metadata.description as string,
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-04-05',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' },
          { name: 'Section 21 vs Section 8', url: canonical },
        ])}
      />

      <UniversalHero
        title="Section 21 vs Section 8"
        subtitle="A practical England guide for translating historical Section 21 intent into the current Renters’ Rights Act framework and the current notice path landlords now need."
        primaryCta={{
          label: 'Start eviction notice pack',
          href: ownerPageLink,
        }}
        secondaryCta={{
          label: 'See the current England route',
          href: currentGuideLink,
        }}
        mediaSrc="/images/wizard-icons/05-choice-decision.png"
        mediaAlt="Historical Section 21 versus current England route guide"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Section 21 is now historical-only language in England. This page exists to convert that
          older terminology into the live possession route, the eviction notice pack, and the
          current notice-stage workflow.
        </p>
      </UniversalHero>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
            <LegacySection21Banner />

            <SupportCard title="Quick answer">
              <p>
                Section 21 and Section 8 are no longer equal live options in England. Section 21
                is historical transition support for older search language. Live England cases now
                sit inside the current Renters&apos; Rights Act possession framework, with notice,
                evidence, and court preparation carrying more weight from the start.
              </p>
              <p>
                Broad notice users should start with the{' '}
                <Link href={ownerPageLink} className="font-medium text-primary hover:underline">
                  eviction notice pack
                </Link>{' '}
                first. That page shows the example bundle, service instructions, validity checks,
                and the current route hierarchy before you move into a transactional flow.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  href={currentRulesLink}
                  className="rounded-xl border border-[#E6DBFF] bg-white p-4 hover:bg-[#F8F4FF]"
                >
                  <p className="font-semibold text-[#2a2161]">Renters&apos; Rights Act Eviction Rules</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Use the main England rules page for the post-1 May 2026 framework.
                  </p>
                </Link>
                <Link
                  href="/form-3-section-8"
                  className="rounded-xl border border-[#E6DBFF] bg-white p-4 hover:bg-[#F8F4FF]"
                >
                  <p className="font-semibold text-[#2a2161]">Form 3A</p>
                  <p className="mt-2 text-sm text-gray-700">
                    Review the live England notice form that now sits inside the Section 8 route.
                  </p>
                </Link>
              </div>
            </SupportCard>

            <SupportCard title="What changes when Section 21 ends">
              <p>
                Section 21 is due to end in England on <strong>{SECTION21_END_DATE}</strong>. If a
                qualifying notice is served before then, court proceedings must begin by <strong>{SECTION21_COURT_CUTOFF_DATE}</strong>. That
                means landlords should already be planning around the current England notice and court
                route rather than a Section 21-first workflow.
              </p>
              <p>
                This page stays live because landlords still search with Section 21 language. Its
                purpose is to answer that search clearly, then hand you back to the owner page and
                the live guidance that now matters.
              </p>
            </SupportCard>

            <SupportCard title="Where the owner page and current guide now fit">
              <p>
                The owner page should handle broad notice intent: what the notice-stage bundle
                looks like, how service guidance fits around the form, what validity checks matter,
                and how the current route differs from legacy terminology.
              </p>
              <p>
                The current England notice guide should then take over when you already know the
                case belongs in the live route and you need detail on grounds, evidence, notice
                periods, and what happens next.
              </p>
              <p>
                If you also need the full current possession sequence after notice stage, move next
                to the{' '}
                <Link href={currentProcessLink} className="font-medium text-primary hover:underline">
                  current England eviction process
                </Link>
                .
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={ownerPageLink}
                  className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                >
                  Start eviction notice pack
                </Link>
                <Link
                  href={currentRulesLink}
                  className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
                >
                  Read current England rules
                </Link>
                <Link
                  href={currentGuideLink}
                  className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
                >
                  See the current England route
                </Link>
              </div>
            </SupportCard>

            <SupportCard title="Transactional paths stay downstream">
              <p>
                Notice Only is the primary transactional next step once the route is already
                understood. Complete Pack stays below that because it is for notice-to-court
                continuity, not broad historical search intent.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#E6DBFF] bg-white p-4">
                  <h3 className="text-lg font-semibold text-[#2a2161]">Notice Only</h3>
                  <p className="mt-2 text-gray-700">
                    Best when the route is settled and you mainly need the notice, service
                    instructions, and validity checks before service.
                  </p>
                  <Link
                    href="/products/notice-only"
                    className="mt-4 inline-flex items-center font-semibold text-primary hover:underline"
                  >
                    Start with Notice Only
                  </Link>
                </div>
                <div className="rounded-xl border border-[#E6DBFF] bg-white p-4">
                  <h3 className="text-lg font-semibold text-[#2a2161]">Complete Pack</h3>
                  <p className="mt-2 text-gray-700">
                    Best when the case already needs court-stage continuity, core court forms, and
                    filing guidance.
                  </p>
                  <Link
                    href="/products/complete-pack"
                    className="mt-4 inline-flex items-center font-semibold text-primary hover:underline"
                  >
                    View the complete pack
                  </Link>
                </div>
              </div>
            </SupportCard>
          </div>
        </Container>
      </section>

      <section className="bg-white pb-16">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Use this page to translate older Section 21 language into the current England notice
              path. Then move back to the broad owner page, the current England route, and the
              wider process guide.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={ownerPageLink}
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                Start eviction notice pack
              </Link>
              <Link
                href={currentGuideLink}
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                See the current England route
              </Link>
              <Link
                href={currentProcessLink}
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                View the current England process
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection
        faqs={faqs}
        title="Section 21 vs Current England Route FAQs"
        includeSchema={false}
      />
    </div>
  );
}
