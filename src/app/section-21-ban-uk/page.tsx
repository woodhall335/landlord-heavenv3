import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { getCanonicalUrl } from '@/lib/seo';

const canonical = getCanonicalUrl('/section-21-ban-uk');

export const metadata: Metadata = {
  title: 'Section 21 Ban UK: What Landlords Must Do Now (2026 England Guide)',
  description:
    'England landlord guide to the end of Section 21, including what changed on 1 May 2026, the 31 July 2026 court-start cutoff for older notices, what replaces Section 21, and what landlords should do now.',
  alternates: { canonical },
  openGraph: {
    title: 'Section 21 Ban UK: What Landlords Must Do Now (2026 England Guide)',
    description:
      'Use this guide to understand the Section 21 transition in England, what replaces Section 21, and how landlords should handle possession after the ban.',
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
    'What landlords must do now that Section 21 has ended in England, what replaces it, and how to move into a Section 8-led possession plan without guesswork.',
  icon: '/images/wizard-icons/11-calendar-timeline.png',
  heroBullets: [
    'Uses exact England dates and transition rules, not vague countdown copy.',
    'Explains what replaces Section 21 in plain English.',
    'Routes landlords into the right notice, process, and product path next.',
  ],
  quickAnswer: [
    <>
      Section 21 ended in England on <strong>1 May 2026</strong>. If a landlord had already served a qualifying Section 21
      notice before that date, court proceedings needed to begin by <strong>31 July 2026</strong>. That means most current
      England possession cases now need{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        Section 8 notice for the replacement route
      </Link>{' '}
      and the wider{' '}
      <Link href="/eviction-process-uk" className="text-primary font-medium hover:underline">
        eviction process in the UK
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
      or the Section 8 guide.
    </>,
  ],
  routeExplanation: [
    'The Section 21 ban matters because it removes the familiar no-fault route that many England landlords relied on. The replacement conversation is now more Section 8-led, more evidence-driven, and often more process-heavy.',
    'That is why this page needs to do more than repeat the headline. It should explain what changed, the exact dates, what replaces Section 21, and the practical actions landlords should take next.',
    'For most live cases, the key next step is not another Section 21 explainer. It is choosing the right Section 8 route, preparing the evidence bundle, and planning the court sequence before deadlines are missed.',
    'This page therefore acts as the authority hub for the transition, with the supporting routes handling arrears, service, possession claims, and enforcement detail.',
  ],
  processSteps: [
    { title: 'Understand the change and the dates', detail: 'Use 1 May 2026 as the end date for Section 21 in England and 31 July 2026 as the court-start cutoff for qualifying older notices.' },
    { title: 'Stop treating Section 21 as the default live route', detail: 'For most current England possession cases, landlords now need to think in terms of Section 8 grounds, evidence, and process continuity.' },
    { title: 'Match the case to the right supporting guide', detail: 'Use the Section 8 pillar, the rent arrears pillar, or the wider eviction-process guide depending on the scenario.' },
    { title: 'Choose the right product-first route', detail: 'Use Complete Pack when the landlord needs broader possession support, or Notice Only when the route is already settled and the need is narrower.' },
    { title: 'Avoid panic and low-quality shortcuts', detail: 'Landlords benefit most from clarity and file quality, not fear-based rushing.' },
  ],
  checklists: [
    {
      title: 'What is happening',
      items: [
        'Section 21 ended in England on 1 May 2026.',
        'Older qualifying notices had a 31 July 2026 court-start cutoff.',
        'Section 8 now carries much more of the live possession workflow.',
        'Landlords need better evidence and process control.',
      ],
    },
    {
      title: 'What landlords must do now',
      items: [
        'Identify whether the case is live or legacy.',
        'Move into Section 8-led planning for current England cases.',
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
    { factor: 'After 1 May 2026', routeA: 'Section 21 ended in England', routeB: 'Section 8 becomes the live possession route in most cases', routeC: 'Court and enforcement planning matter earlier' },
    { factor: 'Best supporting page', routeA: 'Section 21 notice transition guide', routeB: 'Section 8 notice guide', routeC: 'Eviction process UK guide' },
    { factor: 'Commercial route', routeA: 'Bridge into current guidance', routeB: 'Notice Only where route is settled', routeC: 'Complete Pack for broader possession support' },
  ],
  decisionGuide: [
    { question: 'Is the user asking what replaces Section 21?', recommendation: 'Move them next to the Section 8 notice pillar because that is the live possession route they now need in most England cases.' },
    { question: 'Is the problem mainly rent arrears?', recommendation: 'Pair the transition page with the tenant-not-paying-rent pillar so possession and recovery stay aligned.' },
    { question: 'Is the landlord still thinking in Section 21 terms?', recommendation: 'Use the Section 21 notice bridge page to answer the query, then bring them back here and into Section 8.' },
    { question: 'Which product should this page prioritize?', recommendation: 'Use Complete Pack first because this is a transition and route-planning page rather than a narrow drafting page.' },
  ],
  sections: [
    {
      title: 'What replaces Section 21',
      paragraphs: [
        <>
          For most current England possession scenarios, the replacement route is a stronger{' '}
          <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
            Section 8 notice for rent arrears and breach-based possession
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
          <Link href="/eviction-process-uk" className="text-primary font-medium hover:underline">
            eviction process in the UK
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
    { label: 'Section 8 notice guide', href: '/section-8-notice' },
    { label: 'Tenant not paying rent in the UK', href: '/tenant-not-paying-rent' },
    { label: 'Eviction process UK', href: '/eviction-process-uk' },
    { label: 'What happens after Section 21', href: '/what-happens-after-section-21' },
    { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' },
  ],
  toolLinks: [
    { label: 'Section 8 validator', href: '/tools/validators/section-8' },
    { label: 'Rent arrears calculator', href: '/tools/rent-arrears-calculator' },
  ],
  productLink: { label: 'Complete pack for post-ban possession', href: '/products/complete-pack' },
  primaryCta: { label: 'Get Complete Eviction Pack', href: '/products/complete-pack' },
  secondaryCta: { label: 'Read Section 8 Notice Guide', href: '/section-8-notice' },
  faqs: [
    { question: 'When did Section 21 end in England?', answer: 'Section 21 ended in England on 1 May 2026.' },
    { question: 'What was the court-start cutoff for older notices?', answer: 'Court proceedings on qualifying older Section 21 notices needed to start by 31 July 2026.' },
    { question: 'What replaces Section 21?', answer: 'For most current England cases, the practical replacement route is Section 8-led possession with stronger evidence and process planning.' },
    { question: 'What should landlords do now?', answer: 'Move into the Section 8 notice guide, the eviction-process guide, and the product-first route that fits the complexity of the case.' },
  ],
};

export default function Section21BanUkPage() {
  return <PillarPageShell {...content} />;
}
