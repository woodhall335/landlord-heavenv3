import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { getCanonicalUrl } from '@/lib/seo';

const canonical = getCanonicalUrl('/eviction-process-uk');

export const metadata: Metadata = {
  title: 'Eviction Process UK: What Landlords Must Do Step by Step',
  description:
    'UK landlord guide to the eviction process, including route selection, notice stage, court progression, Section 8 after the Section 21 ban, and enforcement planning.',
  alternates: { canonical },
  openGraph: {
    title: 'Eviction Process UK: What Landlords Must Do Step by Step',
    description:
      'Understand the eviction process in the UK, then move into the correct England notice, court, and enforcement workflow.',
    url: canonical,
    type: 'article',
  },
};

const content: PillarPageContent = {
  slug: 'eviction-process-uk',
  title: metadata.title as string,
  description: metadata.description as string,
  heroTitle: 'Eviction Process UK',
  heroSubtitle:
    'A route-first guide for landlords who need the next legal step, not generic advice that skips the notice, court, or enforcement sequence.',
  icon: '/images/wizard-icons/07-review-finish.png',
  heroBullets: [
    'Understand the notice-to-court sequence before deadlines are missed.',
    'Know when Section 8, debt recovery, or regional routes change the process.',
    'Move from information to a product-first landlord workflow when you are ready.',
  ],
  quickAnswer: [
    <>
      The eviction process in the UK starts with route selection, not form filling. Landlords usually move faster
      when they confirm jurisdiction first, then choose the safest notice route, then prepare the court file before
      the notice expires. For England cases, that often means using{' '}
      <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
        the Section 8 notice guide
      </Link>{' '}
      and the wider{' '}
      <Link href="/section-21-ban-uk" className="text-primary font-medium hover:underline">
        Section 21 ban transition guide
      </Link>{' '}
      together.
    </>,
    <>
      Use this page as the UK-wide process overview, then branch into the right supporting guide for your scenario.
      If the main problem is arrears, pair it with{' '}
      <Link href="/tenant-not-paying-rent" className="text-primary font-medium hover:underline">
        tenant not paying rent in the UK
      </Link>
      . If the issue is possession after notice expiry, move into the court-stage pages and enforcement workflow.
    </>,
  ],
  routeExplanation: [
    'The process is not identical across England, Wales, Scotland, and Northern Ireland, so landlords should treat this page as a UK intent hub that routes them into the correct jurisdiction-specific sequence.',
    'In England, the post-1 May 2026 position is more Section 8-led because Section 21 has ended. That makes evidence quality, grounds selection, and court-readiness more important earlier in the workflow.',
    'Once notice expires, most delays come from inconsistencies between the tenancy facts, service proof, rent schedule, and court forms. The fastest process is the one that is least likely to be restarted.',
    'Enforcement should be planned before judgment. If the tenant is likely to stay past the possession date, landlords should already know which warrant or bailiff step follows and what documents will be needed.',
  ],
  processSteps: [
    { title: 'Confirm jurisdiction and tenancy facts', detail: 'Identify whether the property is in England, Wales, Scotland, or Northern Ireland, then confirm the tenancy type, compliance position, and main commercial objective.' },
    { title: 'Choose the right notice route', detail: 'Use a no-fault, grounds-based, or regional route only when the facts support it. In England, many landlords now need a Section 8-led possession plan.' },
    { title: 'Serve the notice with evidence continuity', detail: 'Keep proof of service, dated communications, rent schedules, and compliance records aligned so the court file is already taking shape at notice stage.' },
    { title: 'Prepare claim paperwork before expiry', detail: 'Do not wait until the last day of the notice period to gather annexes, statements, and chronology. Filing tends to be cleaner when the bundle is prepared in advance.' },
    { title: 'Escalate to enforcement if possession is still refused', detail: 'Track the possession date, then move promptly to warrant or bailiff action if the tenant remains.' },
  ],
  checklists: [
    {
      title: 'Route checklist',
      items: [
        'Jurisdiction confirmed before choosing notice language.',
        'Tenancy type and compliance history reviewed.',
        'Main objective set: possession, arrears, or both.',
        'Relevant supporting guide opened before service.',
      ],
    },
    {
      title: 'Court bundle checklist',
      items: [
        'Notice and proof of service match the chronology.',
        'Rent schedule and bank records reconcile.',
        'Supporting documents are labelled and dated.',
        'Claim route matches the notice route.',
      ],
    },
    {
      title: 'Enforcement checklist',
      items: [
        'Possession date diarised.',
        'Warrant pathway identified early.',
        'Property handover plan prepared.',
        'Debt-recovery follow-on reviewed if arrears remain.',
      ],
    },
  ],
  comparisonTable: [
    { factor: 'Best use', routeA: 'Legacy no-fault search intent only', routeB: 'Grounds-based or arrears-led possession', routeC: 'Court, order, and enforcement stages after notice expires' },
    { factor: 'Evidence burden', routeA: 'Compliance-heavy', routeB: 'Grounds and chronology heavy', routeC: 'Full bundle consistency and order execution' },
    { factor: 'Main supporting guide', routeA: 'Section 21 ban and transition pages', routeB: 'Section 8 notice and rent arrears guides', routeC: 'Possession order timeline and bailiff guides' },
    { factor: 'Commercial route', routeA: 'Bridge into broader possession support', routeB: 'Notice Only or Complete Pack depending certainty', routeC: 'Usually Complete Pack' },
  ],
  decisionGuide: [
    { question: 'Is the property in England and the route now grounds-led?', recommendation: 'Start with the Section 8 guide and the Section 21 transition page before serving notice.' },
    { question: 'Is unpaid rent the main issue?', recommendation: 'Pair this page with the tenant-not-paying-rent pillar so notice and money-claim sequencing stay aligned.' },
    { question: 'Has the tenant stayed after notice expiry?', recommendation: 'Move to the court-stage and enforcement guides rather than relying on notice-stage content alone.' },
    { question: 'Are you still comparing jurisdictions?', recommendation: 'Use this page as the hub, then move into the regional guide that matches the property location.' },
  ],
  sections: [
    {
      title: 'What the eviction process looks like after Section 21',
      paragraphs: [
        <>
          England landlords now need a clearer possession plan because the old Section 21 route has ended. That is why
          the process overview needs to point landlords toward{' '}
          <Link href="/section-8-notice" className="text-primary font-medium hover:underline">
            Section 8 notice for rent arrears and breach-based possession
          </Link>{' '}
          and then into the court-stage workflow when the tenant does not leave.
        </>,
        <>
          This does not mean every case becomes a court battle immediately. It means the quality of the file at notice
          stage matters more. Landlords who keep one clean chronology usually move through the process with fewer
          contradictions and fewer avoidable delays.
        </>,
      ],
    },
    {
      title: 'Natural next steps for landlords',
      paragraphs: [
        <>
          If the problem is unpaid rent, move next to{' '}
          <Link href="/tenant-not-paying-rent" className="text-primary font-medium hover:underline">
            tenant not paying rent in the UK
          </Link>
          . If the issue is legacy Section 21 search intent or confusion about what replaced it, use{' '}
          <Link href="/section-21-ban-uk" className="text-primary font-medium hover:underline">
            Section 21 ending in 2026
          </Link>{' '}
          for the current England position.
        </>,
        <>
          When you are ready to move from process guidance to document generation, the commercial handoff for most
          process-led cases is the{' '}
          <Link href="/products/complete-pack" className="text-primary font-medium hover:underline">
            complete eviction pack for England
          </Link>
          .
        </>,
      ],
    },
  ],
  supportingLinks: [
    { label: 'How to evict a tenant in the UK', href: '/how-to-evict-tenant' },
    { label: 'Section 8 notice guide', href: '/section-8-notice' },
    { label: 'Section 21 ban UK guide', href: '/section-21-ban-uk' },
    { label: 'Tenant not paying rent in the UK', href: '/tenant-not-paying-rent' },
    { label: 'Possession order timeline', href: '/possession-order-timeline' },
    { label: 'Bailiff eviction process', href: '/bailiff-eviction-process' },
  ],
  toolLinks: [
    { label: 'Eviction notice pack', href: '/eviction-notice-template' },
    { label: 'Rent arrears calculator', href: '/tools/rent-arrears-calculator' },
  ],
  productLink: { label: 'Complete eviction pack for England', href: '/products/complete-pack' },
  primaryCta: { label: 'Get Complete Eviction Pack', href: '/products/complete-pack' },
  secondaryCta: { label: 'Read Section 8 Notice Guide', href: '/section-8-notice' },
  faqs: [
    { question: 'What is the first step in the eviction process UK?', answer: 'Confirm the jurisdiction, tenancy facts, and correct notice route before serving anything.' },
    { question: 'What replaces Section 21 in England?', answer: 'England landlords now need a Section 8-led possession plan in most post-1 May 2026 cases.' },
    { question: 'When should landlords prepare court forms?', answer: 'Prepare the court bundle before notice expiry so the file is ready if the tenant stays.' },
    { question: 'Which product fits process-led eviction cases?', answer: 'Most notice-to-court cases fit the Complete Eviction Pack because the workflow runs beyond notice drafting alone.' },
  ],
};

export default function EvictionProcessUkPage() {
  return <PillarPageShell {...content} />;
}
