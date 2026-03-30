import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { getCanonicalUrl } from '@/lib/seo';

const canonical = getCanonicalUrl('/section-21-notice');

export const metadata: Metadata = {
  title: 'Section 21 Notice: Legacy Route, Transition, and What Landlords Do Now',
  description:
    'England bridge page for Section 21 notice intent, explaining the post-1 May 2026 position and the 31 July 2026 court-start cutoff for older notices.',
  alternates: { canonical },
  openGraph: {
    title: 'Section 21 Notice: Legacy Route, Transition, and What Landlords Do Now',
    description:
      'Understand the Section 21 transition in England, the exact dates that matter, and the route landlords now need instead.',
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
    'A bridge page for landlords still searching Section 21 terms after the route changed in England, with exact dates and a clear route back to the current notice owner.',
  icon: '/images/wizard-icons/01-tenancy.png',
  heroBullets: [
    'Explains the Section 21 transition in plain English.',
    'Uses exact England dates instead of vague countdown messaging.',
    'Routes landlords back to the owner page and into the live Section 8 path.',
  ],
  quickAnswer: [
    <>
      Section 21 ended in England on <strong>1 May 2026</strong>. If a landlord had already served a qualifying Section
      21 notice before that date, court proceedings needed to begin by <strong>31 July 2026</strong>. That means most
      live possession cases now need the route explained in{' '}
      <Link href="/section-21-ban-uk" className="text-primary font-medium hover:underline">
        Section 21 ban UK
      </Link>{' '}
      and then the practical workflow in{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        Section 8 notice
      </Link>
      .
    </>,
    <>
      Use this page as the bridge for legacy query intent, not as a live "serve it now" page. Broad England notice
      users should go back to{' '}
      <Link href="/eviction-notice-template" className="text-primary font-medium hover:underline">
        the England notice owner page
      </Link>{' '}
      first, then move into{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        Section 8 notice
      </Link>{' '}
      once the current route is understood.
    </>,
  ],
  routeExplanation: [
    'Section 21 used to be the familiar no-fault route for many England landlords, which is why search intent for the phrase remains strong even after the route change.',
    'The current job of this page is to convert that legacy intent into accurate transition guidance: explain the dates, explain the cutoff for older notices, and then move landlords into the current England notice owner and the live Section 8 route.',
    'This is why the page exists as a bridge rather than a simple redirect label. It captures the query, answers it clearly, then routes the user to the authority pages that now matter.',
    'For most present-day England scenarios, the practical question is no longer "how do I serve Section 21?" but "what replaces Section 21, and which notice route now applies?"',
  ],
  processSteps: [
    { title: 'Confirm whether the query is legacy or live', detail: 'Most Section 21 searches are now legacy-intent searches. Start by clarifying that the route ended on 1 May 2026 in England.' },
    { title: 'Use the exact dates', detail: 'If older notices are being discussed, explain the 31 July 2026 court-start cutoff rather than relying on relative timing.' },
    { title: 'Move back to the owner page', detail: 'Broad England notice users should return to the owner page for the notice example, route hierarchy, and service-stage overview before choosing a transactional path.' },
    { title: 'Move into the replacement route', detail: 'Most current cases need a Section 8-led possession plan, especially where the tenant remains in occupation.' },
    { title: 'Choose a product only after the route is clear', detail: 'Use Notice Only when the Section 8 path is already settled, or Complete Pack when the case is already moving towards court continuity.' },
  ],
  checklists: [
    {
      title: 'Transition checklist',
      items: [
        'Route change explained with exact dates.',
        'Legacy Section 21 query acknowledged clearly.',
        'Owner page linked before transactional routing.',
        'Replacement route linked inside body copy.',
      ],
    },
    {
      title: 'Supporting links checklist',
      items: [
        'Eviction notice template linked as the broad owner.',
        'Section 8 notice linked as the live route.',
        'Section 21 ban UK linked as the authority explainer.',
        'Eviction process UK linked for next-stage planning.',
      ],
    },
    {
      title: 'Commercial handoff checklist',
      items: [
        'Hero CTA returns to the broad owner page.',
        'Secondary CTA sends users to Section 8.',
        'Commercial product stays below the route logic.',
        'Copy stays readable and non-spammy.',
      ],
    },
  ],
  comparisonTable: [
    { factor: 'Query intent today', routeA: 'Legacy no-fault intent', routeB: 'Replacement Section 8 route', routeC: 'Court and enforcement support' },
    { factor: 'What landlords need', routeA: 'Clear dates and transition explanation', routeB: 'Grounds, evidence, and notice workflow', routeC: 'Notice-to-order and enforcement process' },
    { factor: 'Main destination', routeA: 'Eviction notice template owner', routeB: 'Section 8 notice guide', routeC: 'Eviction process UK guide' },
    { factor: 'Commercial route', routeA: 'Support only after route clarity', routeB: 'Notice Only where route is settled', routeC: 'Complete Pack' },
  ],
  decisionGuide: [
    { question: 'Is the landlord asking whether Section 21 still exists?', recommendation: 'Use this page to answer that clearly, then move them to the owner page and the Section 21 ban UK pillar.' },
    { question: 'Does the case now need a live possession route?', recommendation: 'Move next to the owner page and then into the Section 8 notice guide.' },
    { question: 'Is the user still comparing notice options?', recommendation: 'Explain that the old comparison has changed and that Section 8 is now the live route in England.' },
    { question: 'Which product should this page prioritize?', recommendation: 'Keep products below the route logic. This page should not behave like the main acquisition page.' },
  ],
  sections: [
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
            Section 8 notice for the replacement possession route
          </Link>{' '}
          and the wider{' '}
          <Link href="/eviction-process-uk" className="text-primary font-medium hover:underline">
            eviction process in the UK
          </Link>{' '}
          so the next legal step is clear.
        </>,
      ],
    },
  ],
  supportingLinks: [
    { label: 'Eviction notice template (England)', href: '/eviction-notice-template' },
    { label: 'Section 21 ban UK guide', href: '/section-21-ban-uk' },
    { label: 'Section 8 notice guide', href: '/section-8-notice' },
    { label: 'What happens after Section 21', href: '/what-happens-after-section-21' },
    { label: 'Eviction process UK', href: '/eviction-process-uk' },
    { label: 'Section 21 validity checklist', href: '/section-21-validity-checklist' },
  ],
  toolLinks: [
    { label: 'Eviction notice template (England)', href: '/eviction-notice-template' },
    { label: 'Section 8 notice guide', href: '/section-8-notice' },
  ],
  productLink: { label: 'Complete pack for post-ban possession', href: '/products/complete-pack' },
  primaryCta: { label: 'View England notice template', href: '/eviction-notice-template' },
  secondaryCta: { label: 'See the Section 8 route', href: '/section-8-notice' },
  faqs: [
    { question: 'Did Section 21 end in England?', answer: 'Yes. Section 21 ended in England on 1 May 2026.' },
    { question: 'What was the cutoff for older Section 21 notices?', answer: 'Court proceedings on qualifying older Section 21 notices needed to begin by 31 July 2026.' },
    { question: 'What replaces Section 21?', answer: 'For most live possession scenarios in England, landlords now need a Section 8-led route supported by stronger evidence and process planning.' },
    { question: 'Why is this page still live?', answer: 'It works as a bridge for legacy search intent, then routes landlords back to the current notice owner and live support pages.' },
  ],
};

export default function Section21NoticePage() {
  return <PillarPageShell {...content} />;
}
