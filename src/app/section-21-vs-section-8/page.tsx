import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';

const canonical = 'https://landlordheaven.co.uk/section-21-vs-section-8';
const ownerPageLink = '/eviction-notice-template';
const section8GuideLink = '/section-8-notice';
const noticeOnlyProductLink = '/products/notice-only';
const completePackProductLink = '/products/complete-pack';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Section 21 vs Section 8 | Legacy Transition and Current England Notice Route',
  description:
    'Understand the difference between legacy Section 21 intent and the live Section 8 route in England, then move back to the England notice owner for the right path.',
  alternates: { canonical },
  openGraph: {
    title: 'Section 21 vs Section 8 | Legacy Transition and Current England Notice Route',
    description:
      'A practical England guide comparing legacy Section 21 terminology with the live Section 8 route.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const faqs: FAQItem[] = [
  {
    question: 'Are Section 21 and Section 8 still equal live routes in England?',
    answer:
      'No. Section 21 is now mainly a legacy transition term in England, while Section 8 is the live route landlords now need for breach-based possession and arrears-led cases.',
  },
  {
    question: 'Why keep a Section 21 vs Section 8 page live at all?',
    answer:
      'Because landlords still search with older terminology. This page exists to translate that intent into the current England notice path, then send the user back to the broad owner page and the live Section 8 route.',
  },
  {
    question: 'Where should broad notice users go first?',
    answer:
      'Broad notice users should go to the England notice owner page first so they can see the example bundle, service guidance, and route hierarchy before they commit to a specific notice workflow.',
  },
  {
    question: 'When does Notice Only become the right next step?',
    answer:
      'Notice Only becomes the right next step once the landlord already understands that the case belongs in the live notice workflow and mainly needs route checks, service guidance, and validity checks before service.',
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
          dateModified: '2026-03-30',
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
        subtitle="A practical England guide for translating legacy Section 21 intent into the live Section 8 route and the current notice path landlords now need."
        primaryCta={{
          label: 'View England notice template',
          href: ownerPageLink,
        }}
        secondaryCta={{
          label: 'See the Section 8 route',
          href: section8GuideLink,
        }}
        mediaSrc="/images/wizard-icons/05-choice-decision.png"
        mediaAlt="Section 21 versus Section 8 route guide"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Section 21 is now mainly a legacy search term in England. This page exists to convert
          that older terminology into the live Section 8 route, the England notice owner page,
          and the current notice-stage workflow.
        </p>
      </UniversalHero>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
            <SupportCard title="Quick answer">
              <p>
                Section 21 and Section 8 are no longer equal live options in England. Section 21
                is legacy transition support for older search language. Section 8 is the live
                route most landlords now need when the case turns on arrears, breach, nuisance,
                damage, or another provable issue.
              </p>
              <p>
                Broad notice users should start with the{' '}
                <Link href={ownerPageLink} className="font-medium text-primary hover:underline">
                  England notice template owner page
                </Link>{' '}
                first. That page shows the example bundle, service instructions, validity checks,
                and the current route hierarchy before the user moves into a transactional flow.
              </p>
            </SupportCard>

            <SupportCard title="What changed after Section 21 ended">
              <p>
                Section 21 ended in England on <strong>1 May 2026</strong>. Older qualifying
                notices needed court proceedings to begin by <strong>31 July 2026</strong>. That
                means most live possession scenarios now need a Section 8-led route rather than a
                Section 21-first workflow.
              </p>
              <p>
                This page stays live because landlords still search with Section 21 language. Its
                purpose is to answer that search clearly, then hand the user back to the owner
                page and the live Section 8 guide.
              </p>
            </SupportCard>

            <SupportCard title="Where the owner page and Section 8 now fit">
              <p>
                The owner page should handle broad notice intent: what the notice-stage bundle
                looks like, how service guidance fits around the form, what validity checks matter,
                and how the live route differs from legacy terminology.
              </p>
              <p>
                The Section 8 page should then take over when the landlord already knows the case
                belongs in the live route and needs detail on grounds, evidence, notice periods,
                and what happens next.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={ownerPageLink}
                  className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                >
                  View England notice template
                </Link>
                <Link
                  href={section8GuideLink}
                  className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
                >
                  See the Section 8 route
                </Link>
              </div>
            </SupportCard>

            <SupportCard title="Transactional paths stay downstream">
              <p>
                Notice Only is the primary transactional next step once the route is already
                understood. Complete Pack stays below that because it is for notice-to-court
                continuity, not broad notice intent.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#E6DBFF] bg-white p-4">
                  <h3 className="text-lg font-semibold text-[#2a2161]">Notice Only</h3>
                  <p className="mt-2 text-gray-700">
                    Best when the route is settled and the landlord mainly needs the notice,
                    service instructions, and validity checks before service.
                  </p>
                  <Link
                    href={noticeOnlyProductLink}
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
                    href={completePackProductLink}
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
              path. Then move back to the broad owner page and into the live Section 8 route.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={ownerPageLink}
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                View England notice template
              </Link>
              <Link
                href={section8GuideLink}
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                See the Section 8 route
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection faqs={faqs} title="Section 21 vs Section 8 FAQs" />
    </div>
  );
}
