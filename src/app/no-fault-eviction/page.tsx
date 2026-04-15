import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { LegacySection21Banner } from '@/components/seo/LegacySection21Banner';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

const canonical = getCanonicalUrl('/no-fault-eviction');

export const metadata: Metadata = {
  title: 'No-Fault Eviction (England) | Historical Transition and Current Rules',
  description:
    'Historical-only bridge page for landlords searching no-fault eviction terms after England moved into the Renters’ Rights Act framework and current possession rules.',
  keywords: [
    'no fault eviction',
    'no fault eviction england',
    'section 21 no fault',
    'no fault eviction notice',
    'section 21 historical only',
    'renters rights act eviction rules',
  ],
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'No-Fault Eviction (England) | Historical Transition and Current Rules',
    description:
      'Historical-only explanation of no-fault eviction search intent and where landlords should go under the current England framework.',
    type: 'article',
    url: canonical,
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'No-Fault Eviction', url: '/no-fault-eviction' },
];

const faqs = [
  {
    question: 'Is no-fault eviction still a current England route?',
    answer:
      'No. Section 21 ended in England on 1 May 2026, so no-fault eviction should now be treated as historical search language rather than a current live route.',
  },
  {
    question: 'Why keep this page live?',
    answer:
      'Landlords still search for no-fault eviction wording. This page stays live to explain the change calmly, then guide users into the current England possession and eviction rules.',
  },
  {
    question: 'What should I follow instead?',
    answer:
      'Follow the current England possession route, the current notice rules, and the current court process under the Renters’ Rights Act framework.',
  },
  {
    question: 'Where should I go next for a live case?',
    answer:
      'Start with the current England notice guide if you still need route clarity, then move into the current notice pack or complete pack once the route and evidence are clear.',
  },
];

export default function NoFaultEvictionPage() {
  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />
      <StructuredData data={faqPageSchema(faqs)} />

      <div className="min-h-screen bg-gray-50">
        <SeoLandingWrapper
          pagePath="/no-fault-eviction"
          pageTitle={metadata.title as string}
          pageType="guide"
          jurisdiction="england"
        />
        <HeaderConfig mode="autoOnScroll" />
        <UniversalHero
          title="No-Fault Eviction (England)"
          subtitle="A historical-only bridge page for landlords still searching no-fault eviction terms after England moved into the Renters’ Rights Act framework."
          primaryCta={{ label: 'See the current England process', href: '/eviction-process-england' }}
          secondaryCta={{ label: 'Start the current notice pack', href: '/products/notice-only' }}
          showTrustPositioningBar
          hideMedia
        />

        <Container>
          <div className="mx-auto max-w-4xl py-12">
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <SeoPageContextPanel pathname="/no-fault-eviction" />
              <div className="mt-4">
                <LegacySection21Banner compact />
              </div>
            </div>

            <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="prose prose-slate max-w-none">
                <h2>What this page means today</h2>
                <p>
                  “No-fault eviction” is now mainly a historical England search term. Before{' '}
                  <strong>1 May 2026</strong>, landlords often used Section 21 as the familiar
                  no-fault route. That is no longer the current framework.
                </p>
                <p>
                  If you are dealing with a live England case now, do not follow old Section 21,
                  Form 6A, N5B, or accelerated-possession guidance as if it were current. Follow
                  the current possession and eviction rules instead.
                </p>

                <h2>What you should do instead</h2>
                <p>
                  Start with the{' '}
                  <Link href="/section-8-notice" className="font-medium text-primary hover:underline">
                    current England notice guide
                  </Link>{' '}
                  if you still need route clarity. Then move into the wider{' '}
                  <Link href="/eviction-process-england" className="font-medium text-primary hover:underline">
                    England eviction process
                  </Link>{' '}
                  so you are following the current framework from the start.
                </p>
                <p>
                  If your case is already moving toward a live notice or court pack, use the
                  current products rather than older Section 21 routes:
                </p>
                <ul>
                  <li>
                    <Link href="/products/notice-only" className="font-medium text-primary hover:underline">
                      Notice Only
                    </Link>{' '}
                    for the current notice-stage workflow
                  </li>
                  <li>
                    <Link href="/products/complete-pack" className="font-medium text-primary hover:underline">
                      Complete Pack
                    </Link>{' '}
                    for the notice-to-court workflow
                  </li>
                </ul>

                <h2>Historical dates that still matter</h2>
                <p>
                  Section 21 ended in England on <strong>1 May 2026</strong>. If a landlord had
                  already served a qualifying Section 21 notice before that date, court proceedings
                  needed to begin by <strong>31 July 2026</strong>.
                </p>
                <ul>
                  <li>Those dates only matter for genuine historical transition issues.</li>
                  <li>They should not be treated as a current “serve it now” route.</li>
                  <li>Most live England cases now need the current possession process instead.</li>
                </ul>

                <h2>No-fault search intent vs current England possession</h2>
                <p>
                  Landlords still search for no-fault eviction terms, but current England cases now
                  turn on the current possession rules, current notice wording, current court
                  process, and clear evidence planning.
                </p>
                <p>
                  <Link href="/section-21-vs-section-8">
                    Compare historical Section 21 language with the current England route
                  </Link>
                </p>
              </div>
            </div>

            <div className="mb-12">
              <FAQSection
                faqs={faqs}
                title="No-Fault Eviction FAQ"
                showContactCTA={false}
                includeSchema={false}
                variant="white"
              />
            </div>

            <div className="rounded-2xl bg-purple-50 p-8 text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Ready to follow the current England route?
              </h2>
              <p className="mb-6 text-gray-600">
                Move from historical search intent into the current Renters’ Rights Act framework
                and the current England workflow.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/eviction-process-england" className="hero-btn-primary">
                  See the current England process
                </Link>
                <Link href="/products/notice-only" className="hero-btn-secondary">
                  Start current notice pack
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
