import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { LegacySection21Banner } from '@/components/seo/LegacySection21Banner';
import { getCanonicalUrl } from '@/lib/seo';

const canonical = getCanonicalUrl('/section-21-notice');

export const metadata: Metadata = {
  title: 'Section 21 Notice: Historical-Only Transition Guide for England',
  description:
    'Historical-only England transition page for Section 21 search intent, explaining that the current framework now follows the Renters’ Rights Act and current possession rules.',
  alternates: { canonical },
  openGraph: {
    title: 'Section 21 Notice: Historical-Only Transition Guide for England',
    description:
      'Understand the Section 21 transition in England, the exact dates that matter, and the current Renters’ Rights Act route landlords now need instead.',
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
    'A historical-only bridge page for landlords still searching Section 21 terms after England moved into the Renters’ Rights Act framework.',
  icon: '/images/wizard-icons/01-tenancy.png',
  heroBullets: [
    'Explains in plain English that Section 21 is no longer part of the current framework.',
    'Uses exact England dates instead of vague countdown messaging.',
    'Routes landlords back into the current England possession and notice path.',
  ],
  quickAnswer: [
    <>
      Section 21 ended in England on <strong>1 May 2026</strong>. If a landlord had already served a qualifying
      Section 21 notice before that date, court proceedings needed to begin by <strong>31 July 2026</strong>. For
      current England cases, the framework now follows the Renters&apos; Rights Act and the current possession route
      explained in{' '}
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
      Use this page as a bridge for legacy query intent, not as a live “serve it now” page. If you are dealing with a
      current England case, go back to{' '}
      <Link href="/eviction-notice-template" className="text-primary font-medium hover:underline">
        the England notice hub
      </Link>{' '}
      first, then move into{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        the current notice route
      </Link>{' '}
      once the present-day route is clear.
    </>,
  ],
  routeExplanation: [
    'Section 21 used to be the familiar no-fault route for many England landlords, which is why search intent for the phrase remains strong even after the legal change.',
    'This page now exists to convert that historical search intent into accurate transition guidance: explain the dates, explain the cutoff for older notices, and then move landlords into the current England possession route.',
    'That is why this page remains live rather than disappearing entirely. It answers the search clearly, then sends the user to the authority pages that now matter.',
    'For most present-day England scenarios, the practical question is no longer “how do I serve Section 21?” but “which current possession route applies under the Renters’ Rights Act framework?”',
  ],
  processSteps: [
    { title: 'Confirm whether the query is legacy or live', detail: 'Most Section 21 searches are now legacy-intent searches. Start by clarifying that the route ended on 1 May 2026 in England.' },
    { title: 'Use the exact dates', detail: 'If older notices are being discussed, explain the 31 July 2026 court-start cutoff rather than relying on relative timing.' },
    { title: 'Move back to the owner page', detail: 'Broad England notice users should return to the owner page for the notice example, route hierarchy, and service-stage overview before choosing a transactional path.' },
    { title: 'Move into the replacement route', detail: 'Most current cases need the current England possession route and a grounds-based plan supported by the right evidence.' },
    { title: 'Choose a product only after the route is clear', detail: 'Use Notice Only when the Section 8 path is already settled, or Complete Pack when the case is already moving towards court continuity.' },
  ],
  checklists: [
    {
      title: 'Transition checklist',
      items: [
        'Route change explained with exact dates.',
        'Legacy Section 21 query acknowledged clearly.',
        'Current England hub linked before transactional routing.',
        'Current route linked inside body copy.',
      ],
    },
    {
      title: 'Supporting links checklist',
      items: [
        'Eviction notice template linked as the broad owner.',
        'Current England notice guide linked as the live route.',
        'England transition guide linked as the authority explainer.',
        'Eviction process England linked for next-stage planning.',
      ],
    },
    {
      title: 'Commercial handoff checklist',
      items: [
        'Hero CTA returns to the broad owner page.',
        'Secondary CTA sends users to the current England route.',
        'Commercial product stays below the route logic.',
        'Copy stays readable and non-spammy.',
      ],
    },
  ],
  comparisonTable: [
    { factor: 'Query intent today', routeA: 'Historical Section 21 intent', routeB: 'Current England possession route', routeC: 'Court and enforcement support' },
    { factor: 'What landlords need', routeA: 'Clear dates and transition explanation', routeB: 'Grounds, evidence, and notice workflow', routeC: 'Notice-to-order and enforcement process' },
    { factor: 'Main destination', routeA: 'Eviction notice template owner', routeB: 'Current England notice guide', routeC: 'Eviction process England guide' },
    { factor: 'Commercial route', routeA: 'Support only after route clarity', routeB: 'Notice Only where route is settled', routeC: 'Complete Pack' },
  ],
  decisionGuide: [
    { question: 'Is the landlord asking whether Section 21 still exists?', recommendation: 'Use this page to answer that clearly, then move them to the owner page and the Section 21 ban UK pillar.' },
    { question: 'Does the case now need a live possession route?', recommendation: 'Move next to the owner page and then into the current England notice guide.' },
    { question: 'Is the user still comparing notice options?', recommendation: 'Explain that the old comparison has changed and that landlords must now follow the current possession route in England.' },
    { question: 'Which product should this page prioritize?', recommendation: 'Keep products below the route logic. This page should not behave like the main acquisition page.' },
  ],
  sections: [
    {
      title: 'Historical note before you do anything else',
      paragraphs: [
        <LegacySection21Banner key="legacy-banner" compact />,
      ],
    },
    {
      title: 'What landlords should understand immediately',
      paragraphs: [
        <>
          This bridge page exists because Section 21 remains a major search term even after the route change. The right
          answer is not to pretend the query disappeared. It is to explain clearly that the route ended in England on{' '}
          <strong>1 May 2026</strong>, then route the user into{' '}
          <Link href="/eviction-notice-template" className="text-primary font-medium hover:underline">
            the England notice owner page
          </Link>
          .
        </>,
        <>
          From there, most landlords should move into{' '}
          <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
            the current England notice route
          </Link>{' '}
          and the wider{' '}
          <Link href="/eviction-process-england" className="text-primary font-medium hover:underline">
            eviction process in England
          </Link>{' '}
          so the next legal step is clear.
        </>,
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
  productLink: { label: 'Complete pack for the current England route', href: '/products/complete-pack' },
  primaryCta: { label: 'View England notice template', href: '/eviction-notice-template' },
  secondaryCta: { label: 'See the current England route', href: '/section-8-notice' },
  faqs: [
    { question: 'Did Section 21 end in England?', answer: 'Yes. Section 21 ended in England on 1 May 2026.' },
    { question: 'What was the cutoff for older Section 21 notices?', answer: 'Court proceedings on qualifying older Section 21 notices needed to begin by 31 July 2026.' },
    { question: 'What replaces Section 21?', answer: 'For most live possession scenarios in England, landlords now need the current Renters’ Rights Act possession route supported by stronger evidence and process planning.' },
    { question: 'Why is this page still live?', answer: 'It works as a bridge for legacy search intent, then routes landlords back to the current notice owner and live support pages.' },
  ],
};

export default function Section21NoticePage() {
  return <PillarPageShell {...content} />;
}
