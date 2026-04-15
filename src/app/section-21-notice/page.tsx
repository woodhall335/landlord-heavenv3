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
  description: `England landlord guide for Section 21 notice search intent, explaining that the route is due to end on ${SECTION21_END_DATE} and what landlords should do instead under the current possession framework.`,
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
  heroSubtitle: `If you are still searching for Section 21, this page explains in plain English that the route is due to end in England on ${SECTION21_END_DATE} and shows you what to do next.`,
  icon: '/images/wizard-icons/01-tenancy.png',
  heroBullets: [
    `Explains clearly that Section 21 is due to end in England on ${SECTION21_END_DATE}.`,
    'Uses the exact dates that matter instead of vague transition wording.',
    'Points landlords back to the current England notice and possession route.',
  ],
  quickAnswer: [
    <>
      Section 21 is due to end in England on <strong>{SECTION21_END_DATE}</strong>. If a landlord serves a qualifying
      Section 21 notice before that date, court proceedings must begin by <strong>{SECTION21_COURT_CUTOFF_DATE}</strong>.
      For landlords planning now, the replacement route sits under the current possession framework explained in{' '}
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
      once the present-day route is clear.
    </>,
  ],
  routeExplanation: [
    'Section 21 used to be the route many England landlords knew best, which is why people still search for it now.',
    'The job of this page is to answer that search honestly, explain the key dates clearly, and then move landlords into the current possession framework instead of leaving them stuck in old wording.',
    'That is why this page still matters. It deals with the historical query properly, but it does not pretend Section 21 is still a live option for current England cases.',
    'For most current England cases, the real question is no longer "how do I serve a Section 21?" but "which possession route applies now, and what documents do I need to support it?"',
  ],
  processSteps: [
    {
      title: 'Check whether the search is historical or current',
      detail:
        `Most Section 21 searches are landlords trying to make sense of old wording. Start by making clear that the route is due to end in England on ${SECTION21_END_DATE}.`,
    },
    {
      title: 'Use the exact dates',
      detail:
        `Where older notices are being discussed, explain the ${SECTION21_COURT_CUTOFF_DATE} court-start cutoff clearly rather than relying on loose deadline wording.`,
    },
    {
      title: 'Return to the main England notice pack',
      detail:
        'Landlords with a live case should go back to the main England notice pack for route clarity, notice checks, and service-stage guidance before choosing a product.',
    },
    {
      title: 'Move into the current England possession route',
      detail:
        'Most current cases now need the live England possession route and a grounds-based plan backed by the right notice and evidence.',
    },
    {
      title: 'Choose a product only after the route is clear',
      detail:
        'Use Notice Only when the route is already clear. Use Complete Pack when the case is likely to move into court and you need continuity from the start.',
    },
  ],
  checklists: [
    {
      title: 'Transition checklist',
      items: [
        'Explains clearly that Section 21 is now historical-only in England.',
        'Uses exact dates rather than vague countdown wording.',
        'Acknowledges why landlords still search for Section 21 directly.',
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
      title: 'Commercial handoff checklist',
      items: [
        'Primary CTA returns the landlord to the broad England notice page first.',
        'Secondary CTA moves the landlord to the current live route.',
        'Commercial products sit below route clarity, not above it.',
        'Copy stays readable, accurate, and calm.',
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
      routeA: 'Eviction Notice Pack for Landlords',
      routeB: 'Section 8 Notice',
      routeC: 'Eviction Process in England',
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
          This page exists because Section 21 is still one of the most searched landlord terms in England, even before
          the route changes. The right approach is not to ignore that search intent. It is to explain clearly that the
          route is due to end in England on <strong>{SECTION21_END_DATE}</strong>, then send the landlord back to{' '}
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
        'Many landlords still search for Section 21 out of habit because it was the best-known route for years. That makes this page useful as a bridge, even though it is no longer the place to start a live possession workflow.',
        'Its job is simple: answer the historical question properly, explain the dates that mattered, and move landlords into the current framework without confusion.',
        'That means the page should stay factual and transitional. It should not behave like a live service page for a route that no longer exists.',
      ],
    },
    {
      title: 'The practical question you need to ask now',
      paragraphs: [
        'For current England cases, the key issue is no longer whether Section 21 can be used. It is which possession route now applies, what grounds are available, and what evidence needs to support the case.',
        'That is why the best next step for most landlords is to re-enter the current route through Eviction Notice Pack for Landlords, then move into the live notice and possession workflow that replaced the old Section 21 mindset.',
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
      answer: `Not yet as of 14 April 2026. Section 21 is due to end in England on ${SECTION21_END_DATE}.`,
    },
    {
      question: 'What was the cutoff for older Section 21 notices?',
      answer: `If a qualifying Section 21 notice is served before ${SECTION21_END_DATE}, court proceedings must begin by ${SECTION21_COURT_CUTOFF_DATE}.`,
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
      question: 'Why is this page still live?',
      answer:
        'It remains live to capture legacy Section 21 search intent, explain the transition clearly, and route landlords back into the current England notice framework.',
    },
  ],
};

export default function Section21NoticePage() {
  return <PillarPageShell {...content} />;
}
