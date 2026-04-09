import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { LegacySection21Banner } from '@/components/seo/LegacySection21Banner';
import { getCanonicalUrl } from '@/lib/seo';

const canonical = getCanonicalUrl('/section-21-notice');

export const metadata: Metadata = {
  title: 'Section 21 Notice | Historical-Only Transition Guide for England',
  description:
    'Historical-only England transition page for Section 21 search intent, explaining that the route ended and that current cases now follow the Renters’ Rights Act possession framework.',
  alternates: { canonical },
  openGraph: {
    title: 'Section 21 Notice | Historical-Only Transition Guide for England',
    description:
      'Understand what happened to Section 21 in England, the exact dates that mattered, and which current possession route landlords now need instead.',
    url: canonical,
    type: 'article',
  },
};

const content: PillarPageContent = {
  slug: 'section-21-notice',
  title: metadata.title as string,
  description: metadata.description as string,
  heroTitle: 'Section 21 Notice',
  heroSubtitle:
    'A historical-only bridge page for landlords still searching Section 21 terms after England moved to the Renters’ Rights Act framework.',
  icon: '/images/wizard-icons/01-tenancy.png',
  heroBullets: [
    'Explains plainly that Section 21 is no longer part of the current England framework.',
    'Uses exact dates instead of vague transition wording.',
    'Routes landlords back to the current England possession and notice path.',
  ],
  quickAnswer: [
    <>
      Section 21 ended in England on <strong>1 May 2026</strong>. If a landlord had already served a qualifying
      Section 21 notice before that date, court proceedings needed to begin by <strong>31 July 2026</strong>. For
      current England cases, the legal framework now follows the Renters&apos; Rights Act and the current possession
      route explained in{' '}
      <Link href="/section-21-ban-uk" className="text-primary font-medium hover:underline">
        our England transition guide
      </Link>{' '}
      and then the practical workflow in{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        the current England notice guide
      </Link>
      .
    </>,
    <>
      Use this page as a transition page for legacy search intent, not as a live “serve it now” page. If you are
      dealing with a current England case, start with{' '}
      <Link href="/eviction-notice-template" className="text-primary font-medium hover:underline">
        the England notice hub
      </Link>{' '}
      and then move into{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        the current England notice route
      </Link>{' '}
      once the present-day route is clear.
    </>,
  ],
  routeExplanation: [
    'Section 21 used to be the familiar no-fault route for many England landlords, which is why search demand for the phrase remains strong even after the legal change.',
    'This page exists to catch that legacy search intent and turn it into accurate transition guidance: explain the end of the route, explain the key dates, and then direct landlords into the current England possession framework.',
    'That is why the page still exists. It answers the historical query honestly, but it does not pretend Section 21 is still the live route for current England cases.',
    'For most present-day England scenarios, the real question is no longer “how do I serve a Section 21?” but “which current possession route applies, and what evidence and process do I need?”',
  ],
  processSteps: [
    {
      title: 'Check whether the query is historical or current',
      detail:
        'Most Section 21 searches are now legacy-intent searches. Start by making clear that the route ended in England on 1 May 2026.',
    },
    {
      title: 'Use the exact dates',
      detail:
        'Where older notices are being discussed, explain the 31 July 2026 court-start cutoff clearly rather than relying on vague timing language.',
    },
    {
      title: 'Return to the main England notice page',
      detail:
        'Broad England notice users should go back to the main notice owner page for route hierarchy, notice examples, and service-stage orientation before choosing a product.',
    },
    {
      title: 'Move into the current England possession route',
      detail:
        'Most current cases now need the live England possession route and a grounds-based plan supported by the right notice and evidence.',
    },
    {
      title: 'Choose a product only after the route is clear',
      detail:
        'Use Notice Only when the current route is already settled. Use Complete Pack when the case is already moving toward court continuity.',
    },
  ],
  checklists: [
    {
      title: 'Transition checklist',
      items: [
        'Explains clearly that Section 21 is now historical-only in England.',
        'Uses exact dates rather than vague countdown wording.',
        'Acknowledges legacy Section 21 search intent directly.',
        'Links back into the current England notice framework.',
      ],
    },
    {
      title: 'Supporting links checklist',
      items: [
        'Links to the England notice hub as the broad owner page.',
        'Links to the current England notice guide as the live route.',
        'Links to the England transition guide as the authority explainer.',
        'Links to the wider England eviction process for next-stage planning.',
      ],
    },
    {
      title: 'Commercial handoff checklist',
      items: [
        'Primary CTA returns to the broad owner page first.',
        'Secondary CTA moves users to the current live route.',
        'Commercial products sit below route clarity, not above it.',
        'Copy stays readable, accurate, and non-spammy.',
      ],
    },
  ],
  comparisonTable: [
    {
      factor: 'Query intent today',
      routeA: 'Historical Section 21 search',
      routeB: 'Current England possession route',
      routeC: 'Court and enforcement planning',
    },
    {
      factor: 'What landlords need',
      routeA: 'Clear transition explanation and exact dates',
      routeB: 'Grounds, evidence, and notice workflow',
      routeC: 'Notice-to-order and enforcement support',
    },
    {
      factor: 'Main destination',
      routeA: 'England notice hub',
      routeB: 'Current England notice guide',
      routeC: 'Eviction process England guide',
    },
    {
      factor: 'Commercial route',
      routeA: 'Support only after route clarity',
      routeB: 'Notice Only where the route is settled',
      routeC: 'Complete Pack',
    },
  ],
  decisionGuide: [
    {
      question: 'Is the landlord asking whether Section 21 still exists?',
      recommendation:
        'Use this page to answer that clearly, then direct them to the England notice hub and the Section 21 transition guide.',
    },
    {
      question: 'Does the case now need a live possession route?',
      recommendation:
        'Move next to the England notice hub and then into the current England notice guide.',
    },
    {
      question: 'Is the user still comparing notice options?',
      recommendation:
        'Explain that the old Section 21 comparison no longer applies and that current England cases must follow the current possession route instead.',
    },
    {
      question: 'Which product should this page prioritise?',
      recommendation:
        'Keep products below the route logic. This page should work as a transition page, not as the main acquisition page.',
    },
  ],
  sections: [
    {
      title: 'Historical note before you do anything else',
      paragraphs: [<LegacySection21Banner key="legacy-banner" compact />],
    },
    {
      title: 'What landlords should understand immediately',
      paragraphs: [
        <>
          This page exists because Section 21 is still one of the most searched landlord terms in England, even after
          the route changed. The right approach is not to ignore that search intent. It is to explain clearly that the
          route ended in England on <strong>1 May 2026</strong>, then send the user back to{' '}
          <Link href="/eviction-notice-template" className="text-primary font-medium hover:underline">
            the main England notice page
          </Link>
          .
        </>,
        <>
          From there, most landlords should move into{' '}
          <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
            the current England notice route
          </Link>{' '}
          and then into the wider{' '}
          <Link href="/eviction-process-england" className="text-primary font-medium hover:underline">
            eviction process in England
          </Link>{' '}
          so the next legal step is clear before any documents are generated or served.
        </>,
      ],
    },
    {
      title: 'Why this page still exists',
      paragraphs: [
        'Many landlords still search for Section 21 out of habit, because it was the best-known route for years. That makes this page useful as a bridge, even though it is no longer the place to start a live possession workflow.',
        'Its job is simple: answer the historical query accurately, explain the dates that mattered, and move people into the current framework without confusion.',
        'That means the page should stay factual and transitional. It should not behave like a live service page for a route that no longer exists.',
      ],
    },
    {
      title: 'The practical question landlords now need to ask',
      paragraphs: [
        'For current England cases, the key issue is no longer whether Section 21 can be used. It is which current possession route applies, what grounds are available, and what evidence needs to support the case.',
        'That is why the best next step for most landlords is to re-enter the current route through the England notice hub, then move into the live notice and possession workflow that now replaces the old Section 21 mindset.',
      ],
    },
  ],
  supportingLinks: [
    { label: 'Eviction notice template (England)', href: '/eviction-notice-template' },
    { label: 'England transition guide', href: '/section-21-ban-uk' },
    { label: 'Current England notice guide', href: '/section-8-notice' },
    { label: 'Start current England notice', href: '/products/notice-only' },
    { label: 'Current England eviction process', href: '/eviction-process-england' },
    { label: 'N5 and N119 possession claim guide', href: '/n5-n119-possession-claim' },
    { label: 'Complete eviction pack', href: '/products/complete-pack' },
  ],
  toolLinks: [
    { label: 'Eviction notice template (England)', href: '/eviction-notice-template' },
    { label: 'Current England notice guide', href: '/section-8-notice' },
  ],
  productLink: {
    label: 'Complete pack for the current England route',
    href: '/products/complete-pack',
  },
  primaryCta: { label: 'View England notice template', href: '/eviction-notice-template' },
  secondaryCta: { label: 'See the current England route', href: '/section-8-notice' },
  faqs: [
    {
      question: 'Did Section 21 end in England?',
      answer: 'Yes. Section 21 ended in England on 1 May 2026.',
    },
    {
      question: 'What was the cutoff for older Section 21 notices?',
      answer: 'Court proceedings on qualifying older Section 21 notices needed to begin by 31 July 2026.',
    },
    {
      question: 'What replaces Section 21 in current England cases?',
      answer:
        'For most live possession scenarios in England, landlords now need to follow the current Renters’ Rights Act possession framework, supported by the correct route, evidence, and notice process.',
    },
    {
      question: 'Can I still use this page to start a live case?',
      answer:
        'No. This page is a historical-only transition page. For live England cases, start with the England notice hub and then move into the current notice route.',
    },
    {
      question: 'Why is this page still live?',
      answer:
        'It remains live to capture legacy Section 21 search intent, explain the transition clearly, and route landlords back into the current England notice framework.',
    },
  ],
};

export default function Section21NoticePage() {
  return <PillarPageShell {...content} />;
}