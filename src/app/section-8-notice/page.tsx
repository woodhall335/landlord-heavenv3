import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarPageShell, type PillarPageContent } from '@/components/seo/PillarPageShell';
import { getCanonicalUrl } from '@/lib/seo';

const canonical = getCanonicalUrl('/section-8-notice');

export const metadata: Metadata = {
  title: 'Section 8 Notice: Grounds, Arrears, and What Landlords Must Do',
  description:
    'England guide to Section 8 notices for landlords, covering grounds, evidence, rent arrears, service, and what replaces Section 21 after 1 May 2026.',
  alternates: { canonical },
  openGraph: {
    title: 'Section 8 Notice: Grounds, Arrears, and What Landlords Must Do',
    description:
      'Use this Section 8 notice guide to understand grounds, evidence, rent arrears, and the England post-Section 21 possession route.',
    url: canonical,
    type: 'article',
  },
};

const content: PillarPageContent = {
  slug: 'section-8-notice',
  title: metadata.title as string,
  description: metadata.description as string,
  heroTitle: 'Section 8 Notice',
  heroSubtitle:
    'The main live England possession route landlords now need after the Section 21 change, with broad notice users sent back to the owner page before they commit to a transactional path.',
  icon: '/images/wizard-icons/15-rent-arrears.png',
  heroBullets: [
    'Grounds-based possession guide for England landlords.',
    'Best used after the owner page has confirmed that Section 8 is the right route.',
    'Keeps Notice Only available, but only after the route guidance is clear.',
  ],
  quickAnswer: [
    <>
      A Section 8 notice is the main live England possession route for rent arrears, breach, nuisance, and other
      evidence-led cases. If you still need the broad notice example or route hierarchy, start with{' '}
      <Link href="/eviction-notice-template" className="text-primary font-medium hover:underline">
        the England eviction notice template hub
      </Link>{' '}
      first, then come back here once you know the case genuinely needs Section 8. Since Section 21 ended in England on
      1 May 2026, many landlords searching for no-fault possession now need to understand{' '}
      <Link href="/section-21-ban-uk" className="text-primary font-medium hover:underline">
        what replaces Section 21
      </Link>{' '}
      in practical terms: a stronger Section 8 file, clearer grounds selection, and cleaner evidence from day one.
    </>,
    <>
      Use this page as the pillar for Section 8 notice intent, then pair it with{' '}
      <Link href="/tenant-not-paying-rent" className="text-primary font-medium hover:underline">
        tenant not paying rent in the UK
      </Link>{' '}
      for arrears-led cases or with{' '}
      <Link href="/section-21-ban-uk" className="text-primary font-medium hover:underline">
        Section 21 ending in 2026
      </Link>{' '}
      when the user is still arriving with legacy no-fault search intent.
    </>,
  ],
  routeExplanation: [
    'Section 8 is a grounds-based notice, so the route is only as strong as the facts and documents supporting it.',
    'It is commonly used for rent arrears, anti-social behaviour, property damage, persistent late payment, and other tenancy breaches that can be evidenced clearly.',
    'The route matters more after the Section 21 change because landlords in England are now more likely to need breach-based possession planning rather than a no-fault shortcut.',
    'That makes the sequence important: choose the grounds, confirm the notice period, serve properly, then prepare the court bundle before the notice expires.',
  ],
  processSteps: [
    { title: 'Identify the strongest grounds', detail: 'Check whether the problem is arrears, breach, nuisance, damage, or a mix of grounds. Use the grounds that match the facts you can prove.' },
    { title: 'Prepare the evidence bundle first', detail: 'Rent ledgers, incident logs, photos, witness notes, and communications should already exist before the notice is served.' },
    { title: 'Serve the Section 8 notice correctly', detail: 'Use the right form, dates, and service method, then keep proof of service ready for court.' },
    { title: 'Track the notice period and tenant response', detail: 'Update the chronology immediately if the tenant makes partial payments or responds in a way that changes the facts.' },
    { title: 'Move into court if the breach remains', detail: 'Standard possession claims usually depend on how cleanly the notice-stage file has been prepared.' },
  ],
  checklists: [
    {
      title: 'Section 8 readiness checklist',
      items: [
        'Grounds match provable facts.',
        'Notice period checked for the selected grounds.',
        'Evidence pack prepared before service.',
        'Proof of service method planned in advance.',
      ],
    },
    {
      title: 'Arrears checklist',
      items: [
        'Rent schedule reconciled with bank records.',
        'Grounds 8, 10, and 11 reviewed where relevant.',
        'Partial payments tracked up to the hearing date.',
        'Debt-recovery follow-on considered in parallel.',
      ],
    },
    {
      title: 'Court checklist',
      items: [
        'Notice and claim facts align.',
        'Bundle is chronological and paginated.',
        'Witness narrative matches the documents.',
        'Product route chosen for the likely complexity level.',
      ],
    },
  ],
  comparisonTable: [
    { factor: 'Best fit', routeA: 'Legacy no-fault query intent only', routeB: 'Rent arrears and breach-led possession', routeC: 'Court and enforcement after the notice expires' },
    { factor: 'Main proof focus', routeA: 'Historic compliance-only framing', routeB: 'Grounds, events, and service evidence', routeC: 'Full court bundle and timeline control' },
    { factor: 'Key supporting page', routeA: 'Section 21 ban UK guide', routeB: 'Tenant not paying rent in the UK', routeC: 'Eviction process UK guide' },
    { factor: 'Commercial route', routeA: 'Bridge into broader possession support', routeB: 'Notice Only when the route is settled', routeC: 'Complete Pack when court progression is likely' },
  ],
  decisionGuide: [
    { question: 'Is unpaid rent the main problem?', recommendation: 'Use this page with the rent arrears pillar so the Section 8 notice and money-claim sequence stay aligned.' },
    { question: 'Does the user still need broad notice guidance first?', recommendation: 'Move them to /eviction-notice-template before you assume Section 8 is already the settled path.' },
    { question: 'Is the case already likely to reach court?', recommendation: 'Choose the Complete Pack rather than relying on notice drafting alone.' },
    { question: 'Do you already know the exact grounds and only need the notice?', recommendation: 'The Notice Only route is usually the fastest commercial fit.' },
  ],
  sections: [
    {
      title: 'Why Section 8 matters more after the Section 21 change',
      paragraphs: [
        <>
          England landlords can no longer treat Section 21 as the default possession route. The practical replacement is
          usually a more evidence-led workflow built around{' '}
          <Link href="/section-8-grounds-explained" className="text-primary font-medium hover:underline">
            Section 8 grounds explained
          </Link>{' '}
          and the wider{' '}
          <Link href="/eviction-process-uk" className="text-primary font-medium hover:underline">
            eviction process in the UK
          </Link>
          .
        </>,
        <>
          That does not mean every case is harder by definition. It means the file quality now carries more weight.
          The landlord who chooses the right grounds early and documents the case cleanly is usually in a stronger
          position than the landlord who waits until the hearing stage to organise the evidence.
        </>,
      ],
    },
    {
      title: 'Natural supporting links for this pillar',
      paragraphs: [
        <>
          Start with{' '}
          <Link href="/eviction-notice-template" className="text-primary font-medium hover:underline">
            the England notice owner page
          </Link>{' '}
          if the landlord still needs the notice example, route hierarchy, or service-stage overview. Then use{' '}
          <Link href="/tenant-not-paying-rent" className="text-primary font-medium hover:underline">
            tenant not paying rent in the UK
          </Link>{' '}
          for arrears-led facts,{' '}
          <Link href="/section-21-ban-uk" className="text-primary font-medium hover:underline">
            what replaces Section 21
          </Link>{' '}
          for transition-intent traffic, and{' '}
          <Link href="/products/notice-only" className="text-primary font-medium hover:underline">
            court-ready Section 8 notice
          </Link>{' '}
          when the route is already settled.
        </>,
      ],
    },
  ],
  supportingLinks: [
    { label: 'Eviction notice template (England)', href: '/eviction-notice-template' },
    { label: 'Tenant not paying rent in the UK', href: '/tenant-not-paying-rent' },
    { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' },
    { label: 'Section 21 ban UK guide', href: '/section-21-ban-uk' },
    { label: 'Serve a Section 8 notice', href: '/serve-section-8-notice' },
    { label: 'Eviction process UK', href: '/eviction-process-uk' },
    { label: 'What happens after Section 8', href: '/what-happens-after-section-8' },
  ],
  toolLinks: [
    { label: 'Eviction notice template (England)', href: '/eviction-notice-template' },
    { label: 'Rent arrears calculator', href: '/tools/rent-arrears-calculator' },
  ],
  productLink: { label: 'Start Notice Only for a settled Section 8 route', href: '/products/notice-only' },
  primaryCta: { label: 'View England notice template', href: '/eviction-notice-template' },
  secondaryCta: { label: 'Start with Notice Only', href: '/products/notice-only' },
  faqs: [
    { question: 'What replaces Section 21 for landlords in England?', answer: 'In many cases, landlords now need a Section 8-led possession plan supported by stronger evidence and grounds selection.' },
    { question: 'Can Section 8 be used for rent arrears?', answer: 'Yes. Rent arrears are one of the most common reasons landlords use a Section 8 notice, especially where grounds 8, 10, and 11 are relevant.' },
    { question: 'When should I choose Notice Only?', answer: 'Choose Notice Only when you already know the correct grounds and mainly need a compliant notice workflow.' },
    { question: 'When should I choose the Complete Eviction Pack?', answer: 'Choose the Complete Eviction Pack when court progression, evidence handling, or route certainty still matter.' },
  ],
};

export default function Section8NoticePage() {
  return <PillarPageShell {...content} />;
}
