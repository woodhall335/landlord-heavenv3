import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { LegacySection21Banner } from '@/components/seo/LegacySection21Banner';
import { getCanonicalUrl } from '@/lib/seo';
import {
  SECTION21_COURT_CUTOFF_DATE,
  SECTION21_END_DATE,
  SECTION21_PRE_CHANGE_BRIDGE,
} from '@/lib/seo/section21-transition-copy';

const canonical = getCanonicalUrl('/section-21-notice');

export const metadata: Metadata = {
  title: 'Section 21 Notice | Historical-Only Transition Guide for England',
  description: `England landlord guide to the Section 21 transition, the ${SECTION21_END_DATE} end date, and the current possession route to use instead.`,
  alternates: { canonical },
  openGraph: {
    title: 'Section 21 Notice | Historical-Only Transition Guide for England',
    description:
      'Understand what happened to Section 21 in England, the exact dates that mattered, and the current possession route landlords now need instead.',
    url: canonical,
    type: 'article',
  },
};

const content: PillarPageContent = {
  slug: 'section-21-notice',
  title: metadata.title as string,
  description: metadata.description as string,
  heroTitle: 'Section 21 Notice',
  heroSubtitle: `Section 21 ended for new private-rented possession notices in England on ${SECTION21_END_DATE}. This guide explains the change and what landlords should do now.`,
  icon: '/images/wizard-icons/13-section-21.png',
  heroBullets: [
    `Explains clearly that Section 21 ended for new notices on ${SECTION21_END_DATE}.`,
    'Uses the exact dates that matter instead of vague transition wording.',
    'Points landlords back to the current England notice and possession route.',
  ],
  quickAnswer: [
    <>
      Section 21 ended for new private-rented possession notices in England on <strong>{SECTION21_END_DATE}</strong>.
      The deadline to start a Section 21 court claim using a qualifying older notice was <strong>{SECTION21_COURT_CUTOFF_DATE}</strong>.
      Landlords starting a case now must use the current possession framework explained in{' '}
      <Link href="/section-21-ban-uk" className="text-primary font-medium hover:underline">
        Section 21 Ban UK
      </Link>{' '}
      and then in practical terms through{' '}
      <Link href="/renters-rights-act-eviction-rules" className="text-primary font-medium hover:underline">
        Renters' Rights Act Eviction Rules
      </Link>{' '}
      and{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        Section 8 Notice
      </Link>
      .
    </>,
    <>
      {SECTION21_PRE_CHANGE_BRIDGE} If you are dealing with a live England case, start with{' '}
      <Link href="/products/notice-only" className="text-primary font-medium hover:underline">
        Eviction Notice Pack for Landlords
      </Link>{' '}
      and then move into{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        Section 8 Notice
      </Link>{' '}
      once the applicable possession ground is clear.
    </>,
  ],
  routeExplanation: [
    'Section 21 was the possession process many England landlords knew best, so the term remains familiar even though it is no longer available for new notices.',
    'This guide explains the key dates and directs landlords to the current possession framework.',
    'It provides historical context without suggesting that Section 21 remains available for a new England case.',
    'For most current England cases, the real question is no longer "how do I serve a Section 21?" but "which possession route applies now, and what documents do I need to support it?"',
  ],
  processSteps: [
    {
      title: 'Check whether the case is historical or current',
      detail:
        `Section 21 ended for new notices on ${SECTION21_END_DATE}. Any Section 21 matter must relate to court proceedings started by the transitional deadline.`,
    },
    {
      title: 'Use the exact dates',
      detail:
        `Where older notices are being discussed, explain the ${SECTION21_COURT_CUTOFF_DATE} court-start cutoff clearly rather than relying on loose deadline wording.`,
    },
    {
      title: 'Return to the main England notice pack',
      detail:
        'Landlords with a new case should start with the main England notice pack to identify the correct ground, notice and evidence.',
    },
    {
      title: 'Use the current England possession process',
      detail:
        'Current cases need a valid possession ground backed by the correct notice and evidence.',
    },
    {
      title: 'Choose support after the ground is clear',
      detail:
        'Use Notice Only when the ground is already clear. Use Complete Pack when the case is likely to move into court and you need continuity from the start.',
    },
  ],
  checklists: [
    {
      title: 'Transition checklist',
      items: [
        'Explains clearly that Section 21 is now historical-only in England.',
        'Uses exact dates rather than vague countdown wording.',
        'Explains why landlords still encounter the Section 21 term.',
        'Links back into the current England notice framework.',
      ],
    },
    {
      title: 'Supporting links checklist',
      items: [
        'Links to the eviction notice pack as the broad starting page.',
        'Links to Section 8 Notice as the live route.',
        'Links to Section 21 Ban UK as the main explainer.',
        'Links to Eviction Process in England for next-stage planning.',
      ],
    },
    {
      title: 'Choosing what to do next',
      items: [
        'Start with the England notice page if you do not yet know which ground applies.',
        'Read the Section 8 guide for the current grounds-based process.',
        'Choose Notice Only or Complete Pack once the case requirements are clear.',
        'Seek legal advice if a transitional or disputed case is unclear.',
      ],
    },
  ],
  comparisonTable: [
    {
      factor: 'Situation',
      routeA: 'Former Section 21 process',
      routeB: 'Current England possession case',
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
      routeA: 'Eviction Notice Pack for Landlords',
      routeB: 'Section 8 Notice',
      routeC: 'Eviction Process in England',
    },
    {
      factor: 'Suitable support',
      routeA: 'Historical guidance only',
      routeB: 'Notice Only where the ground is settled',
      routeC: 'Complete Pack',
    },
  ],
  decisionGuide: [
    {
      question: 'Is the landlord asking whether Section 21 still exists?',
      recommendation:
        'Use this page to answer that clearly, then direct them to Eviction Notice Pack for Landlords and Section 21 Ban UK.',
    },
    {
      question: 'Does the case now need a live possession route?',
      recommendation:
        'Move next to Eviction Notice Pack for Landlords and then into Section 8 Notice.',
    },
    {
      question: 'Is the landlord still comparing notice options?',
      recommendation:
        'Explain that the old Section 21 comparison no longer applies and that current England cases must follow the current possession route instead.',
    },
    {
      question: 'Which product should I use now?',
      recommendation:
        'Use this page to understand the Section 21 transition, then check the current England possession route before choosing a product.',
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
          Section 21 remains familiar wording for many landlords in England. The important point is to explain clearly that the
          process ended for new notices in England on <strong>{SECTION21_END_DATE}</strong>. For a new case, start with{' '}
          <Link href="/products/notice-only" className="text-primary font-medium hover:underline">
            Eviction Notice Pack for Landlords
          </Link>
          .
        </>,
        <>
          From there, most landlords should move into{' '}
          <Link href="/renters-rights-act-eviction-rules" className="text-primary font-medium hover:underline">
            Renters' Rights Act Eviction Rules
          </Link>{' '}
          , then into{' '}
          <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
            Section 8 Notice
          </Link>{' '}
          and then into the wider{' '}
          <Link href="/eviction-process-england" className="text-primary font-medium hover:underline">
            Eviction Process in England
          </Link>{' '}
          so the next legal step is clear before any documents are generated or served.
        </>,
      ],
    },
    {
      title: 'Why this page still matters',
      paragraphs: [
        'Many landlords still use the Section 21 term because it was the best-known process for years. This guide explains that older terminology, but it is not the place to start a new possession case.',
        'It explains the historical position and the dates that mattered, then points landlords to the current framework.',
        'Treat the information as transition guidance rather than a live service route for a notice that is no longer available.',
      ],
    },
    {
      title: 'The practical question you need to ask now',
      paragraphs: [
        'For current England cases, the key issue is no longer whether Section 21 can be used. It is which possession route now applies, what grounds are available, and what evidence needs to support the case.',
        'For most landlords, the next step is to identify the correct ground through Eviction Notice Pack for Landlords, then prepare the notice and evidence required for that ground.',
      ],
    },
  ],
  supportingLinks: [
    { label: "Renters' Rights Act Eviction Rules", href: '/renters-rights-act-eviction-rules' },
    { label: 'Section 8 Notice', href: '/section-8-notice' },
    { label: 'Form 3A', href: '/form-3-section-8' },
    { label: 'Eviction Process in England', href: '/eviction-process-england' },
    { label: 'Eviction Notice Pack for Landlords', href: '/products/notice-only' },
    { label: 'Section 21 Ban UK', href: '/section-21-ban-uk' },
    { label: 'Start current England notice', href: '/products/notice-only' },
    { label: 'N5 and N119 possession claim guide', href: '/n5-n119-possession-claim' },
    { label: 'Complete Eviction Pack for Landlords', href: '/products/complete-pack' },
  ],
  toolLinks: [
    { label: 'Eviction Notice Pack for Landlords', href: '/products/notice-only' },
    { label: 'Section 8 Notice', href: '/section-8-notice' },
  ],
  productLink: {
    label: 'Full eviction support for the current England route',
    href: '/products/complete-pack',
  },
  primaryCta: { label: 'Start eviction notice pack', href: '/products/notice-only' },
  secondaryCta: { label: 'Read Section 8 Notice', href: '/section-8-notice' },
  faqs: [
    {
      question: 'Did Section 21 end in England?',
      answer: `Yes. Section 21 ended for new private-rented possession notices in England on ${SECTION21_END_DATE}.`,
    },
    {
      question: 'What was the cutoff for older Section 21 notices?',
      answer: `A qualifying Section 21 notice had to be served before ${SECTION21_END_DATE}, and the court claim had to begin by ${SECTION21_COURT_CUTOFF_DATE}. That deadline has passed.`,
    },
    {
      question: 'What replaces Section 21 in current England cases?',
      answer:
        'For most live possession scenarios in England, landlords now need to follow the current possession framework, supported by the right route, evidence, and notice process.',
    },
    {
      question: 'Can I still use this page to start a live case?',
      answer:
        'No. This page is a historical-only transition page. For a live England case, start with Eviction Notice Pack for Landlords and then move into Section 8 Notice.',
    },
    {
      question: 'Why is this historical guide still available?',
      answer:
        'It explains the transition for landlords who know the older Section 21 terminology and points them to the current England notice framework.',
    },
  ],
};

export default function Section21NoticePage() {
  return <PillarPageShell {...content} />;
}
