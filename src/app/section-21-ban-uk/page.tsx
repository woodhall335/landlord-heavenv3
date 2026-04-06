import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { LegacySection21Banner } from '@/components/seo/LegacySection21Banner';
import { getCanonicalUrl } from '@/lib/seo';

const canonical = getCanonicalUrl('/section-21-ban-uk');

export const metadata: Metadata = {
  title: 'Section 21 Ban UK: Renters’ Rights Act Transition Guide for England',
  description:
    'England landlord guide to the end of Section 21, the move into the Renters’ Rights Act framework, and the exact dates that matter for older notices.',
  alternates: { canonical },
  openGraph: {
    title: 'Section 21 Ban UK: Renters’ Rights Act Transition Guide for England',
    description:
      'Use this guide to understand the Section 21 transition in England, what replaced it, and how landlords should handle possession under the current framework.',
    url: canonical,
    type: 'article',
  },
};

const content: PillarPageContent = {
  slug: 'section-21-ban-uk',
  title: metadata.title as string,
  description: metadata.description as string,
  heroTitle: 'Section 21 Ban UK',
  heroSubtitle:
    'What landlords must do now that Section 21 has ended in England, what replaced it, and how to move into the current Renters’ Rights Act possession route without guesswork.',
  icon: '/images/wizard-icons/11-calendar-timeline.png',
  heroBullets: [
    'Uses exact England dates and transition rules, not vague countdown copy.',
    'Explains what replaced Section 21 in plain English.',
    'Routes landlords into the current notice, process, and product path next.',
  ],
  quickAnswer: [
    <>
      Section 21 ended in England on <strong>1 May 2026</strong>. If a landlord had already served a qualifying Section 21
      notice before that date, court proceedings needed to begin by <strong>31 July 2026</strong>. That means most current
      England possession cases now need the Renters&apos; Rights Act framework and the current route explained in{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        the current England notice guide
      </Link>{' '}
      and the wider{' '}
      <Link href="/eviction-process-england" className="text-primary font-medium hover:underline">
        eviction process in England
      </Link>
      .
    </>,
    <>
      Landlords should treat this page as the authority hub for the transition. Use it when the search intent is about
      the ban, what replaces Section 21, or how to evict after Section 21 is gone. Then move into the supporting page
      that matches the live scenario, such as{' '}
      <Link href="/tenant-not-paying-rent" className="text-primary font-medium hover:underline">
        tenant not paying rent in the UK
      </Link>{' '}
      or the current England notice guide.
    </>,
  ],
  routeExplanation: [
    'The Section 21 ban matters because it removed the familiar no-fault route that many England landlords relied on. The replacement conversation is now more evidence-driven, more structured, and more clearly tied to the current possession rules.',
    'That is why this page needs to do more than repeat the headline. It should explain what changed, the exact dates, what replaces Section 21, and the practical actions landlords should take next.',
    'For most live cases, the key next step is not another Section 21 explainer. It is choosing the right current possession route, preparing the evidence bundle, and planning the court sequence before deadlines are missed.',
    'This page therefore acts as the authority hub for the transition, with the supporting routes handling arrears, service, possession claims, and enforcement detail.',
  ],
  processSteps: [
    { title: 'Understand the change and the dates', detail: 'Use 1 May 2026 as the end date for Section 21 in England and 31 July 2026 as the court-start cutoff for qualifying older notices.' },
    { title: 'Stop treating Section 21 as the default live route', detail: 'For most current England possession cases, landlords now need to think in terms of the current possession grounds, evidence, and process continuity.' },
    { title: 'Match the case to the right supporting guide', detail: 'Use the current England notice guide, the rent arrears pillar, or the wider England eviction guide depending on the scenario.' },
    { title: 'Choose the right product-first route', detail: 'Use Complete Pack when the landlord needs broader possession support, or Notice Only when the route is already settled and the need is narrower.' },
    { title: 'Avoid panic and low-quality shortcuts', detail: 'Landlords benefit most from clarity and file quality, not fear-based rushing.' },
  ],
  checklists: [
    {
      title: 'What is happening',
      items: [
        'Section 21 ended in England on 1 May 2026.',
        'Older qualifying notices had a 31 July 2026 court-start cutoff.',
        'The current England possession route now carries the live workflow.',
        'Landlords need better evidence and process control.',
      ],
    },
    {
      title: 'What landlords must do now',
      items: [
        'Identify whether the case is live or legacy.',
        'Move into the current England possession planning for current cases.',
        'Use supporting pages for arrears, court, and enforcement detail.',
        'Choose a product-first route rather than a wizard-first entry point.',
      ],
    },
    {
      title: 'Common mistakes to avoid',
      items: [
        'Using vague “deadline” language without exact dates.',
        'Treating the transition page like a simple news post.',
        'Leaving landlords without a clear next possession route.',
        'Over-linking legacy Section 21 tools instead of the replacement workflow.',
      ],
    },
  ],
  comparisonTable: [
    { factor: 'Before 1 May 2026', routeA: 'Section 21 still existed in England', routeB: 'Section 8 already handled breach-based possession', routeC: 'Court process depended on the route used' },
    { factor: 'After 1 May 2026', routeA: 'Section 21 ended in England', routeB: 'Current possession rules apply in most cases', routeC: 'Court and enforcement planning matter earlier' },
    { factor: 'Best supporting page', routeA: 'Section 21 notice transition guide', routeB: 'Current England notice guide', routeC: 'Eviction process England guide' },
    { factor: 'Commercial route', routeA: 'Bridge into current guidance', routeB: 'Notice Only where route is settled', routeC: 'Complete Pack for broader possession support' },
  ],
  decisionGuide: [
    { question: 'Is the user asking what replaces Section 21?', recommendation: 'Move them next to the current England notice guide because that is the live route they now need in most England cases.' },
    { question: 'Is the problem mainly rent arrears?', recommendation: 'Pair the transition page with the tenant-not-paying-rent pillar so possession and recovery stay aligned.' },
    { question: 'Is the landlord still thinking in Section 21 terms?', recommendation: 'Use the Section 21 notice bridge page to answer the query, then bring them back here and into Section 8.' },
    { question: 'Which product should this page prioritize?', recommendation: 'Use Complete Pack first because this is a transition and route-planning page rather than a narrow drafting page.' },
  ],
  sections: [
    {
      title: 'Historical note before you act',
      paragraphs: [
        <LegacySection21Banner key="legacy-banner" compact />,
      ],
    },
    {
      title: 'What replaces Section 21',
      paragraphs: [
        <>
          For most current England possession scenarios, the replacement route is the current England notice and court path explained in{' '}
          <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
            the current England notice guide
          </Link>
          . That does not mean every case uses the same ground. It means landlords now need to start with the facts,
          choose the grounds carefully, and keep the evidence file cleaner from the outset.
        </>,
        <>
          If the problem is unpaid rent, move next to{' '}
          <Link href="/tenant-not-paying-rent" className="text-primary font-medium hover:underline">
            tenant not paying rent in the UK
          </Link>
          . If the user wants the wider possession sequence after the notice stage, move them to{' '}
          <Link href="/eviction-process-england" className="text-primary font-medium hover:underline">
            eviction process in England
          </Link>
          .
        </>,
      ],
    },
    {
      title: 'How to evict after the ban',
      paragraphs: [
        <>
          After the Section 21 change, landlords generally need a more structured possession workflow: identify the live
          ground, prepare evidence, serve the notice correctly, then move into a standard claim if the tenant stays.
          This is why the transition hub needs clear internal links into the Section 8 and process pillars instead of
          trying to answer every sub-scenario on one page.
        </>,
        <>
          When the route is already clear, the fastest commercial handoff is usually{' '}
          <Link href="/products/notice-only" className="text-primary font-medium hover:underline">
            court-ready eviction notice
          </Link>
          . When route choice, court preparation, or broader process support still matter, use the{' '}
          <Link href="/products/complete-pack" className="text-primary font-medium hover:underline">
            complete eviction pack for England
          </Link>
          .
        </>,
      ],
    },
  ],
  supportingLinks: [
    { label: 'Section 21 notice transition guide', href: '/section-21-notice' },
    { label: 'Current England notice guide', href: '/section-8-notice' },
    { label: 'Tenant not paying rent in the UK', href: '/tenant-not-paying-rent' },
    { label: 'Eviction process England', href: '/eviction-process-england' },
    { label: 'N5 and N119 possession claim guide', href: '/n5-n119-possession-claim' },
    { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' },
  ],
  toolLinks: [
    { label: 'Eviction notice pack', href: '/eviction-notice-template' },
    { label: 'Rent arrears calculator', href: '/tools/rent-arrears-calculator' },
  ],
  productLink: { label: 'Complete pack for post-ban possession', href: '/products/complete-pack' },
  primaryCta: { label: 'Get Complete Eviction Pack', href: '/products/complete-pack' },
  secondaryCta: { label: 'Read the current England notice guide', href: '/section-8-notice' },
  faqs: [
    { question: 'When did Section 21 end in England?', answer: 'Section 21 ended in England on 1 May 2026.' },
    { question: 'What was the court-start cutoff for older notices?', answer: 'Court proceedings on qualifying older Section 21 notices needed to start by 31 July 2026.' },
    { question: 'What replaces Section 21?', answer: 'For most current England cases, landlords now need the Renters’ Rights Act possession framework, the current notice route, and stronger evidence planning.' },
    { question: 'What should landlords do now?', answer: 'Move into the current England notice guide, the England eviction-process guide, and the product-first route that fits the complexity of the case.' },
  ],
};

export default function Section21BanUkPage() {
  return <PillarPageShell {...content} />;
}
