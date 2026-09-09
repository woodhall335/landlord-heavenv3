import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { LegacySection21Banner } from '@/components/seo/LegacySection21Banner';
import { getCanonicalUrl } from '@/lib/seo';
import {
  SECTION21_COURT_CUTOFF_DATE,
  SECTION21_END_DATE,
} from '@/lib/seo/section21-transition-copy';

const canonical = getCanonicalUrl('/section-21-ban-uk');

export const metadata: Metadata = {
  title: "Section 21 Ban UK: Renters' Rights Act Transition Guide for England",
  description:
    'England landlord guide to the upcoming end of Section 21, the move into the current possession framework, and the exact dates that matter for older notices.',
  alternates: { canonical },
  openGraph: {
    title: "Section 21 Ban UK: Renters' Rights Act Transition Guide for England",
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
  heroSubtitle: `Section 21 ended for new notices in England on ${SECTION21_END_DATE}. Learn what replaced it and how to prepare a current possession case.`,
  icon: '/images/wizard-icons/11-calendar-timeline.png',
  heroBullets: [
    'Uses exact England dates and transition rules, not vague countdown copy.',
    'Explains what replaced Section 21 in plain English.',
    'Shows landlords the current notice, evidence and possession process.',
  ],
  quickAnswer: [
    <>
      Section 21 ended for new private-rented possession notices in England on <strong>{SECTION21_END_DATE}</strong>.
      The deadline to start a Section 21 court claim using a qualifying older notice was <strong>{SECTION21_COURT_CUTOFF_DATE}</strong>.
      A new case must follow the current possession framework explained in{' '}
      <Link href="/renters-rights-act-eviction-rules" className="text-primary font-medium hover:underline">
        Renters' Rights Act Eviction Rules
      </Link>{' '}
      , then in{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        Section 8 Notice
      </Link>{' '}
      and the wider{' '}
      <Link href="/eviction-process-england" className="text-primary font-medium hover:underline">
        Eviction Process in England
      </Link>
      .
    </>,
    <>
      Use this as the main transition guide if you need to understand the ban, what replaces Section 21, or how to evict
      after Section 21 has ended. Then move into the supporting page that matches the
      live scenario, such as{' '}
      <Link href="/tenant-not-paying-rent" className="text-primary font-medium hover:underline">
        tenant not paying rent in the UK
      </Link>{' '}
      or Section 8 Notice.
    </>,
  ],
  routeExplanation: [
    'The end of Section 21 matters because it removed the route many England landlords used to know best. The replacement conversation is now more evidence-led, more structured, and more closely tied to the current possession rules.',
    'That means this page has to do more than repeat a headline. It needs to explain what changed, the exact dates, what replaced Section 21, and the practical steps landlords should take next.',
    'For most live cases, the next step is not another Section 21 explainer. It is choosing the right current possession route, preparing the evidence bundle, and planning the court sequence before deadlines are missed.',
    'The supporting guides cover arrears, notice service, possession claims and enforcement in more detail.',
  ],
  processSteps: [
    {
      title: 'Understand the change and the dates',
      detail:
        'Use 1 May 2026 as the end date for Section 21 in England and 31 July 2026 as the court-start cutoff for qualifying older notices.',
    },
    {
      title: 'Stop treating Section 21 as the default live route',
      detail:
        'For most current England possession cases, landlords now need to think in terms of the live possession grounds, evidence, and process continuity.',
    },
    {
      title: 'Match the case to the right supporting guide',
      detail:
        'Use Section 8 Notice, the rent arrears pillar, or Eviction Process in England depending on the scenario.',
    },
    {
      title: 'Choose the right level of support',
      detail:
        'Use Complete Pack when you need support through the possession process, or Notice Only when the ground is settled and the task is narrower.',
    },
    {
      title: 'Avoid panic and low-quality shortcuts',
      detail:
        'You are usually better off with clarity and a clean file than with rushed shortcuts that create more delay later.',
    },
  ],
  checklists: [
    {
      title: 'What is happening',
      items: [
        `Section 21 ended for new England notices on ${SECTION21_END_DATE}.`,
        `The ${SECTION21_COURT_CUTOFF_DATE} court-start deadline for qualifying older notices has passed.`,
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
        'Choose the product route that fits the case rather than reacting in a panic.',
      ],
    },
    {
      title: 'Common mistakes to avoid',
      items: [
        'Using vague "deadline" language without exact dates.',
        'Treating the transition page like a simple news post.',
        'Leaving landlords without a clear next possession route.',
        'Over-linking legacy Section 21 tools instead of the replacement workflow.',
      ],
    },
  ],
  comparisonTable: [
    {
      factor: 'Before 1 May 2026',
      routeA: 'Section 21 still existed in England',
      routeB: 'Section 8 already handled breach-based possession',
      routeC: 'Court process depended on the route used',
    },
    {
      factor: 'From 1 May 2026',
      routeA: 'Section 21 is no longer available in England',
      routeB: 'Current possession rules apply in most cases',
      routeC: 'Court and enforcement planning matter earlier',
    },
    {
      factor: 'Best supporting page',
      routeA: 'Section 21 notice transition guide',
      routeB: 'Section 8 Notice',
      routeC: 'Eviction Process in England',
    },
    {
      factor: 'Suitable support',
      routeA: 'Bridge into current guidance',
      routeB: 'Notice Only where route is settled',
      routeC: 'Complete Pack for broader possession support',
    },
  ],
  decisionGuide: [
    {
      question: 'Is the user asking what replaces Section 21?',
      recommendation:
        'Move them next to Section 8 Notice because that is the live route they now need in most England cases.',
    },
    {
      question: 'Is the problem mainly rent arrears?',
      recommendation:
        'Pair the transition page with the tenant-not-paying-rent pillar so possession and recovery stay aligned.',
    },
    {
      question: 'Is the landlord still thinking in Section 21 terms?',
      recommendation:
        'Use the Section 21 notice bridge page to answer the query, then bring them back here and into Section 8.',
    },
    {
      question: 'Which product should this page prioritise?',
      recommendation:
        'Use Complete Pack first because this is a transition and route-planning page rather than a narrow drafting page.',
    },
  ],
  sections: [
    {
      title: 'Historical note before you act',
      paragraphs: [<LegacySection21Banner key="legacy-banner" compact />],
    },
    {
      title: 'What replaces Section 21',
      paragraphs: [
        <>
          For most current England possession scenarios, the replacement route is the current England notice and court
          path explained in{' '}
          <Link href="/renters-rights-act-eviction-rules" className="text-primary font-medium hover:underline">
            Renters' Rights Act Eviction Rules
          </Link>{' '}
          and then in{' '}
          <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
            Section 8 Notice
          </Link>
          . That does not mean every case uses the same ground. It means landlords now need to start with the facts,
          choose the grounds carefully, and keep the evidence file cleaner from the outset.
        </>,
        <>
          If the problem is unpaid rent, move next to{' '}
          <Link href="/tenant-not-paying-rent" className="text-primary font-medium hover:underline">
            tenant not paying rent in the UK
          </Link>
          . If you need the current England notice form itself, review{' '}
          <Link href="/form-3-section-8" className="text-primary font-medium hover:underline">
            Form 3A
          </Link>
          . If you need the wider possession sequence after the notice stage, move next to{' '}
          <Link href="/eviction-process-england" className="text-primary font-medium hover:underline">
            Eviction Process in England
          </Link>
          .
        </>,
      ],
    },
    {
      title: 'How landlords should plan after the ban',
      paragraphs: [
        <>
          After the Section 21 change, landlords generally need a more structured possession workflow: identify the live
          ground, prepare the evidence, serve the notice correctly, then move into a standard claim if the tenant stays.
          That is why this transition hub should point landlords into the Section 8 and process guides instead of trying
          to answer every sub-scenario on one page.
        </>,
        <>
          When you already know which notice is required, start with the{' '}
          <Link href="/products/notice-only" className="text-primary font-medium hover:underline">
            Eviction Notice Pack for Landlords
          </Link>
          . When you still need help choosing the notice or preparing for court, use the{' '}
          <Link href="/products/complete-pack" className="text-primary font-medium hover:underline">
            Complete Eviction Pack for Landlords
          </Link>
          .
        </>,
      ],
    },
  ],
  supportingLinks: [
    { label: "Renters' Rights Act Eviction Rules", href: '/renters-rights-act-eviction-rules' },
    { label: 'Section 8 Notice', href: '/section-8-notice' },
    { label: 'Form 3A', href: '/form-3-section-8' },
    { label: 'Eviction Process in England', href: '/eviction-process-england' },
    { label: 'Section 21 notice transition guide', href: '/section-21-notice' },
    { label: 'Tenant not paying rent in the UK', href: '/tenant-not-paying-rent' },
    { label: 'N5 and N119 possession claim guide', href: '/n5-n119-possession-claim' },
  ],
  toolLinks: [
    { label: 'Eviction notice pack', href: '/eviction-notice-template' },
    { label: 'Rent arrears calculator', href: '/tools/rent-arrears-calculator' },
  ],
  productLink: { label: 'Full eviction support for post-ban possession', href: '/products/complete-pack' },
  primaryCta: { label: 'Start your full eviction pack', href: '/products/complete-pack' },
  secondaryCta: { label: 'Read Section 8 Notice', href: '/section-8-notice' },
  faqs: [
    { question: 'When did Section 21 end in England?', answer: `Section 21 ended for new private-rented possession notices in England on ${SECTION21_END_DATE}.` },
    {
      question: 'What is the court-start cutoff for older notices?',
      answer: `A qualifying notice had to be served before ${SECTION21_END_DATE}, and court proceedings had to start by ${SECTION21_COURT_CUTOFF_DATE}. That deadline has passed.`,
    },
    {
      question: 'What replaces Section 21?',
      answer:
        'For most current England cases, landlords now need the current possession framework, the live notice route, and stronger evidence planning.',
    },
    {
      question: 'What should landlords do now?',
      answer:
        "Move into Renters' Rights Act Eviction Rules, Section 8 Notice, Eviction Process in England, and the product route that matches how complex the case has become.",
    },
  ],
};

export default function Section21BanUkPage() {
  return <PillarPageShell {...content} />;
}
