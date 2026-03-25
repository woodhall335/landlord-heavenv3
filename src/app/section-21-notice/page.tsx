import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { getCanonicalUrl } from '@/lib/seo';

const canonical = getCanonicalUrl('/section-21-notice');

export const metadata: Metadata = {
  title: 'Section 21 Notice: Legacy Route, Transition, and What Landlords Do Now',
  description:
    'England bridge page for Section 21 notice intent, explaining the post-1 May 2026 position, the 31 July 2026 court-start cutoff for older notices.',
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
    'A bridge page for landlords still searching Section 21 terms after the route changed in England, with clear dates and the next route they now need.',
  icon: '/images/wizard-icons/01-tenancy.png',
  heroBullets: [
    'Explains the Section 21 transition in plain English.',
    'Uses exact England dates instead of vague countdown messaging.',
    'Moves landlords into the right post-ban possession route.',
  ],
  quickAnswer: [
    <>
      Section 21 ended in England on <strong>1 May 2026</strong>. If a landlord had already served a qualifying Section 21
      notice before that date, court proceedings needed to begin by <strong>31 July 2026</strong>. That means most live
      possession cases now need the route explained in{' '}
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
      Use this page as the bridge for legacy query intent, not as a live “serve it now” page. The right commercial
      handoff for most landlords is the{' '}
      <Link href="/products/complete-pack" className="text-primary font-medium hover:underline">
        complete pack for post-ban possession
      </Link>
      , or the Notice Only route where the user already has a clear Section 8 strategy.
    </>,
  ],
  routeExplanation: [
    'Section 21 used to be the familiar no-fault route for many England landlords, which is why search intent for the phrase remains strong even after the route change.',
    'The important current task is to convert that legacy intent into accurate transition guidance: explain the dates, explain the cutoff for older notices, and then move landlords into the Section 8-led route that now matters.',
    'This is why the page exists as a bridge rather than a simple redirect label. It captures the query, answers it clearly, then routes the user to the current authority page and the supporting process guides.',
    'For most present-day England scenarios, the practical question is no longer “how do I serve Section 21?” but “what replaces Section 21, and what does the possession route look like now?”',
  ],
  processSteps: [
    { title: 'Confirm whether the query is legacy or live', detail: 'Most Section 21 searches are now legacy-intent searches. Start by clarifying that the route ended on 1 May 2026 in England.' },
    { title: 'Use the exact dates', detail: 'If older notices are being discussed, explain the 31 July 2026 court-start cutoff rather than relying on relative timing.' },
    { title: 'Move into the replacement route', detail: 'Most current cases need a Section 8-led possession plan, especially where the tenant remains in occupation.' },
    { title: 'Pair the transition guide with the process guide', detail: 'Once the user understands the change, direct them into the Section 8 notice pillar and the wider eviction-process workflow.' },
    { title: 'Choose the right product route', detail: 'Use Complete Pack for broader possession planning, or Notice Only where the Section 8 path is already clear.' },
  ],
  checklists: [
    {
      title: 'Transition checklist',
      items: [
        'Route change explained with exact dates.',
        'Legacy Section 21 query acknowledged clearly.',
        'Replacement route linked inside body copy.',
        'Post-ban product path is product-first, not wizard-first.',
      ],
    },
    {
      title: 'Supporting links checklist',
      items: [
        'Section 21 ban UK linked as the main authority page.',
        'Section 8 notice linked as the replacement route.',
        'Eviction process UK linked for next-stage planning.',
        'Rent arrears support linked where relevant.',
      ],
    },
    {
      title: 'Commercial handoff checklist',
      items: [
        'Primary CTA goes to Complete Pack.',
        'Secondary commercial destination is reserved for bridge context only.',
        'No wizard-first CTA is shown above the fold.',
        'Copy stays readable and non-spammy.',
      ],
    },
  ],
  comparisonTable: [
    { factor: 'Query intent today', routeA: 'Legacy no-fault intent', routeB: 'Replacement Section 8 route', routeC: 'Court and enforcement support' },
    { factor: 'What landlords need', routeA: 'Clear dates and transition explanation', routeB: 'Grounds, evidence, and notice workflow', routeC: 'Notice-to-order and enforcement process' },
    { factor: 'Main destination', routeA: 'Section 21 ban UK guide', routeB: 'Section 8 notice guide', routeC: 'Eviction process UK guide' },
    { factor: 'Commercial route', routeA: 'Bridge into broader possession support', routeB: 'Notice Only where route is settled', routeC: 'Complete Pack' },
  ],
  decisionGuide: [
    { question: 'Is the landlord asking whether Section 21 still exists?', recommendation: 'Use this page to answer that clearly, then move them to the Section 21 ban UK pillar.' },
    { question: 'Does the case now need a live possession route?', recommendation: 'Move next to the Section 8 notice guide and the eviction-process UK guide.' },
    { question: 'Is the user still comparing notice options?', recommendation: 'Explain that the old comparison has changed and that Section 8 is now the live route in England.' },
    { question: 'Which product should this page prioritize?', recommendation: 'Use Complete Pack as the primary above-fold commercial destination because this page is a transition bridge.' },
  ],
  sections: [
    {
      title: 'What landlords should understand immediately',
      paragraphs: [
        <>
          This bridge page exists because Section 21 remains a major search term even after the route change. The right
          answer is not to pretend the query disappeared. It is to explain clearly that the route ended in England on{' '}
          <strong>1 May 2026</strong>, then route the user into{' '}
          <Link href="/section-21-ban-uk" className="text-primary font-medium hover:underline">
            the main Section 21 ban UK guide
          </Link>
          .
        </>,
        <>
          From there, most landlords need{' '}
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
    { label: 'Section 21 ban UK guide', href: '/section-21-ban-uk' },
    { label: 'Section 8 notice guide', href: '/section-8-notice' },
    { label: 'What happens after Section 21', href: '/what-happens-after-section-21' },
    { label: 'Eviction process UK', href: '/eviction-process-uk' },
    { label: 'Section 21 validity checklist', href: '/section-21-validity-checklist' },
    { label: 'Tenant not paying rent in the UK', href: '/tenant-not-paying-rent' },
  ],
  toolLinks: [
    { label: 'Section 21 validity checker', href: '/tools/validators/section-21' },
    { label: 'Section 8 validator', href: '/tools/validators/section-8' },
  ],
  productLink: { label: 'Complete pack for post-ban possession', href: '/products/complete-pack' },
  primaryCta: { label: 'Get Complete Eviction Pack', href: '/products/complete-pack' },
  secondaryCta: { label: 'Get Court-Ready Notice', href: '/products/notice-only' },
  faqs: [
    { question: 'Did Section 21 end in England?', answer: 'Yes. Section 21 ended in England on 1 May 2026.' },
    { question: 'What was the cutoff for older Section 21 notices?', answer: 'Court proceedings on qualifying older Section 21 notices needed to begin by 31 July 2026.' },
    { question: 'What replaces Section 21?', answer: 'For most live possession scenarios in England, landlords now need a Section 8-led route supported by stronger evidence and process planning.' },
    { question: 'Why is this page still live?', answer: 'It works as a bridge for legacy search intent, then routes landlords to the current authority pages and product flow.' },
  ],
};

export default function Section21NoticePage() {
  return <PillarPageShell {...content} />;
}
