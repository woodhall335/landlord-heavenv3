import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';
import type { FAQItem } from '@/components/seo/FAQSection';
import type { PillarPageContent, PillarSection } from '@/components/seo/PillarPageShell';

interface Seed {
  slug: string;
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  icon: string;
  focus: string;
  scenario: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  supportingLinks: Array<{ label: string; href: string }>;
  toolLinks: Array<{ label: string; href: string }>;
  productLink: { label: string; href: string };
}

const deepSectionTitles = [
  'Start with the facts and the legal position',
  'Get the notice right and prove service',
  'Check the file before you go near the court',
  'Prepare the claim and the hearing properly',
  'Plan possession, handover, and enforcement',
  'Decide what money recovery is worth pursuing',
];

const deepAngles = [
  'Decide early whether you mainly want possession, arrears recovery, or both, because muddled objectives usually lead to muddled paperwork.',
  'Check the notice requirements, notice period, and compliance evidence before service so you are not fixing validity problems later.',
  'Compare the dates, figures, annexes, and tenancy documents before filing, because courts care about accuracy and consistency more than volume.',
  'Prepare a short hearing story that links your evidence to the legal test so the judge can follow the case quickly.',
  'Think through enforcement in advance, including vulnerability issues and property handover logistics, so you are not starting from scratch after the order.',
  'Set a sensible limit on what you will spend to recover money so the enforcement decision stays proportionate to what you may actually get back.',
];

function buildDeepSections(seed: Seed): PillarSection[] {
  return deepSectionTitles.map((title, index) => ({
    title,
    paragraphs: [
      `${seed.focus} gets easier to manage when you break it into clear stages instead of treating it like one big legal problem. At the ${title.toLowerCase()} stage, start by pinning down the tenancy position, what has gone wrong, and what you want from the case. ${deepAngles[index]}`,
      `Keep one chronology covering payments, breach events, service evidence, and key communications, then reuse it across notices, claim forms, witness statements, and hearing notes so the story stays consistent. Landlords dealing with ${seed.scenario} usually lose time when they rely on memory or scattered documents, so keep one indexed evidence file with dated records before each step.`,
      `When the facts change, update your chronology and action list the same day so decisions are based on current evidence rather than assumptions from earlier drafts. The fastest route is usually the one least likely to be challenged, adjourned, or struck out, so prioritise procedural resilience over optimistic timing.`,
    ],
  }));
}

function buildFaqs(topic: string): FAQItem[] {
  return [
    { question: `What is the first step in a ${topic} case?`, answer: 'Start by confirming the tenancy type, the current compliance position, and whether your main aim is possession, debt recovery, or both before you serve anything.' },
    { question: 'Should I use Section 21 or Section 8 first?', answer: 'Choose the route that matches the legal facts: Section 21 for no-fault possession where the requirements are met, Section 8 for breach-based possession.' },
    { question: 'Can I recover rent arrears during eviction?', answer: 'Yes, but sequence matters. Protect possession momentum first and prepare the arrears evidence in parallel so both objectives can progress.' },
    { question: 'How do I reduce the risk of notice invalidity?', answer: 'Use the correct form, verify the dates carefully, and keep robust proof of service including certificates and communication records.' },
    { question: 'What documents should be in the court bundle?', answer: 'Include the tenancy agreement, notice, proof of service, rent schedule, relevant certificates, correspondence, and a clear chronology.' },
    { question: 'What if the tenant raises a defence?', answer: 'Map the likely defence themes in advance and prepare factual rebuttals linked directly to your documents and timeline.' },
    { question: 'When should I apply for a warrant?', answer: 'If the possession date passes and the tenant remains in occupation, move into enforcement promptly with complete supporting documents.' },
    { question: 'Is accelerated possession always faster?', answer: 'It can be faster where Section 21 compliance is strong, but mistakes in forms or evidence can remove that advantage quickly.' },
    { question: 'Should I use landlord tools before filing?', answer: 'Yes. A proper notice pack and the right landlord tools can reduce drafting errors and improve consistency before court papers are issued.' },
    { question: 'When should I choose fuller support?', answer: 'Choose fuller support when the case is complex, likely to be defended, or important enough that you want tighter document control from start to finish.' },
  ];
}

function buildPage(seed: Seed): PillarPageContent {
  return {
    ...seed,
    heroBullets: [
      'Clear guidance on notices, court steps, and enforcement.',
      'Practical checklists, comparison tables, and next-step help.',
      'Links to the guides and tools landlords usually need next.',
    ],
    quickAnswer: [
      `${seed.focus} usually starts with three things: checking the facts, checking the paperwork, and choosing the legal step that really fits the case. Landlords who do that early are far less likely to waste time on avoidable notice or court mistakes.`,
      `For ${seed.scenario}, the practical sequence is to confirm the tenancy position, serve the right notice with solid proof of service, get the court papers consistent before deadlines, and think ahead to enforcement so the case does not stall after the order.`,
    ],
    routeExplanation: [
      'Section 21 is usually used when you want possession without relying on tenant fault and the compliance requirements have been met. It can be straightforward, but only when the paperwork and timing are right.',
      'Section 8 is used when you are relying on a specific breach such as serious arrears or anti-social behaviour. It can be stronger for breach-led cases, but only when the facts and evidence really match the grounds you cite.',
      'The court process depends on what notice was served, how the tenant responds, and whether the case is likely to be defended. Some cases are relatively clean; others need fuller preparation from the start.',
      'Enforcement should be planned before judgment, not treated as an afterthought. Bailiff timing, property access, and any follow-on debt recovery are all easier to manage when they are part of the same plan.',
    ],
    processSteps: [
      { title: 'Diagnose the facts and the tenancy position', detail: `Confirm the tenancy status, whether the notice is available, whether the compliance documents are in order, and whether ${seed.scenario} adds extra risk before you commit to the next legal step.` },
      { title: 'Choose the right notice and serve it properly', detail: 'Pick the notice that matches the facts, then serve it using a reliable method and keep full dated proof of service in the same file.' },
      { title: 'Run pre-court quality checks', detail: 'Before filing, reconcile every date, figure, and annex across forms and schedules. That prevents the contradictions that often trigger adjournments or re-filings.' },
      { title: 'File claim and prepare hearing narrative', detail: 'Issue the claim with full supporting documents, then build a short hearing story mapping the facts to the legal test so the case is easy to follow.' },
      { title: 'Execute possession and next-stage recovery', detail: 'After the order, move into enforcement promptly if needed, secure the property handover properly, and only then push arrears or damages recovery as far as it remains commercially sensible.' },
    ],
    checklists: [
      {
        title: 'Notice readiness checklist',
        items: [
          'Tenancy type and route eligibility confirmed.',
          'Notice form, dates, and period checked twice.',
          'Compliance pack assembled (where required).',
          'Service method selected and evidenced.',
          'Internal chronology updated on service day.',
        ],
      },
      {
        title: 'Court filing checklist',
        items: [
          'Claim forms checked against notice details.',
          'Rent schedule reconciled with bank records.',
          'Witness statement chronology is consistent.',
          'All annexes are labelled and paginated.',
          'Defence scenarios and responses prepared.',
        ],
      },
      {
        title: 'Enforcement and recovery checklist',
        items: [
          'Possession date monitored and diarised.',
          'Warrant pathway prepared in advance.',
          'Property handover logistics planned.',
          'Post-possession arrears strategy agreed.',
          'Portfolio learning captured for next case.',
        ],
      },
    ],
    comparisonTable: [
      { factor: 'Main use case', routeA: 'No-fault possession where prerequisites are met.', routeB: 'Breach-driven possession with provable grounds.', routeC: 'When notice has matured and possession still requires court or bailiff execution.' },
      { factor: 'Evidence emphasis', routeA: 'Compliance and service quality.', routeB: 'Breach evidence, chronology, and schedules.', routeC: 'Complete bundle consistency and order enforcement evidence.' },
      { factor: 'Timeline risk', routeA: 'Invalid notice or missing prerequisites.', routeB: 'Weak factual proof or contested grounds.', routeC: 'Administrative delay if post-order actions are not prepared early.' },
      { factor: 'Debt recovery fit', routeA: 'Usually separate unless planned in parallel.', routeB: 'Often aligned with arrears-based grounds.', routeC: 'Strong stage for post-possession money recovery decisions.' },
    ],
    decisionGuide: [
      { question: 'Do you meet all Section 21 requirements?', recommendation: 'If yes, Section 21 may be the right no-fault option. If not, fix the gaps first or look at whether Section 8 fits the facts better.' },
      { question: 'Is serious rent arrears the core issue?', recommendation: 'Prioritise Section 8 arrears grounds with clear schedules and payment evidence, while keeping fallback options ready.' },
      { question: 'Is possession urgent and likely to be defended?', recommendation: 'Prepare for the standard court process with a strong bundle and a clear hearing plan rather than relying on best-case timing.' },
      { question: 'Do you need both possession and debt outcomes?', recommendation: 'Run a dual-track plan: protect possession progression while preparing financially proportionate debt recovery action.' },
    ],
    sections: buildDeepSections(seed),
    faqs: buildFaqs(seed.heroTitle),
  };
}

const seeds: Seed[] = [
  {
    slug: 'how-to-evict-a-tenant-uk',
    title: 'How to Evict a Tenant in the UK: Landlord Pillar Guide for Notices, Court and Enforcement',
    description: 'Complete landlord pillar guide explaining how to evict a tenant in the UK with notices, court steps, checklists, and supporting links.',
    heroTitle: 'How to Evict a Tenant in the UK',
    heroSubtitle: 'A complete landlord guide covering notices, possession claims, timelines, and enforcement planning.',
    icon: '/images/wizard-icons/06-notice-details.png',
    focus: 'How to evict a tenant in the UK',
    scenario: 'England landlord possession and arrears cases',
    primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' },
    secondaryCta: { label: 'Start Notice Only', href: '/products/notice-only' },
    supportingLinks: [
      { label: 'Section 21 notice template', href: '/section-21-notice-template' },
      { label: 'Section 8 notice template', href: '/section-8-notice-template' },
      { label: 'How long does eviction take', href: '/how-long-does-eviction-take' },
      { label: 'Eviction timeline UK', href: '/eviction-timeline-uk' },
      { label: 'Accelerated possession guide', href: '/accelerated-possession-guide' },
      { label: 'Warrant of possession guide', href: '/warrant-of-possession-guide' },
      { label: 'Court bailiff eviction guide', href: '/court-bailiff-eviction-guide' },
      { label: 'Eviction cost UK', href: '/eviction-cost-uk' },
    ],
    toolLinks: [
      { label: 'Eviction notice pack', href: '/eviction-notice-template' },
      { label: 'Eviction notice pack', href: '/eviction-notice-template' },
    ],
    productLink: { label: 'Landlord Complete Pack', href: '/products/complete-pack' },
  },
  {
    slug: 'section-21-notice-guide',
    title: 'Section 21 Notice Guide: Landlord Pillar Page for Validity, Service, Court and Possession',
    description: 'In-depth Section 21 pillar guide for landlords covering validity, service, court preparation, and linked resources.',
    heroTitle: 'Section 21 Notice Guide for Landlords',
    heroSubtitle: 'Everything you need to issue a valid Section 21 notice and convert it into possession with fewer delays.',
    icon: '/images/wizard-icons/01-tenancy.png',
    focus: 'Section 21 notice strategy',
    scenario: 'no-fault possession planning',
    primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' },
    secondaryCta: { label: 'Use Full Court Pack', href: '/products/complete-pack' },
    supportingLinks: [
      { label: 'Section 21 notice template', href: '/section-21-notice-template' },
      { label: 'Serve Section 21 notice', href: '/serve-section-21-notice' },
      { label: 'Section 21 validity checklist', href: '/section-21-validity-checklist' },
      { label: 'Section 21 checklist', href: '/section-21-checklist' },
      { label: 'Accelerated possession guide', href: '/accelerated-possession-guide' },
      { label: 'N5B possession claim guide', href: '/n5b-possession-claim-guide' },
      { label: 'Section 21 vs Section 8', href: '/section-21-vs-section-8' },
      { label: 'Section 21 court pack', href: '/products/complete-pack' },
    ],
    toolLinks: [
      { label: 'Eviction notice pack', href: '/eviction-notice-template' },
      { label: 'Eviction notice pack', href: '/eviction-notice-template' },
    ],
    productLink: { label: 'Notice Only product', href: '/products/notice-only' },
  },
  {
    slug: 'section-8-notice-guide',
    title: 'Section 8 Notice Guide: Landlord Pillar Page for Grounds, Evidence and Court Process',
    description: 'Comprehensive Section 8 landlord guide covering grounds selection, notice service, evidence standards, court and enforcement.',
    heroTitle: 'Section 8 Notice Guide for Landlords',
    heroSubtitle: 'Grounds-led possession strategy with practical actions for arrears, breach, and defended hearings.',
    icon: '/images/wizard-icons/15-rent-arrears.png',
    focus: 'Section 8 notice and grounds-led possession',
    scenario: 'Breach-based eviction disputes',
    primaryCta: { label: 'Start Section 8 Pack', href: '/products/complete-pack' },
    secondaryCta: { label: 'Prepare Notice First', href: '/products/notice-only' },
    supportingLinks: [
      { label: 'Section 8 notice template', href: '/section-8-notice-template' },
      { label: 'Serve Section 8 notice', href: '/serve-section-8-notice' },
      { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' },
      { label: 'Section 8 eviction process', href: '/section-8-eviction-process' },
      { label: 'Section 8 court pack', href: '/products/complete-pack' },
      { label: 'N5 N119 possession claim', href: '/n5-n119-possession-claim' },
      { label: 'Tenant anti-social behaviour', href: '/tenant-anti-social-behaviour' },
      { label: 'Evict tenant not paying rent', href: '/evict-tenant-not-paying-rent' },
    ],
    toolLinks: [
      { label: 'Eviction notice pack', href: '/eviction-notice-template' },
      { label: 'Eviction notice pack', href: '/eviction-notice-template' },
    ],
    productLink: { label: 'Complete eviction pack', href: '/products/complete-pack' },
  },
  {
    slug: 'rent-arrears-landlord-guide',
    title: 'Rent Arrears Landlord Guide: Eviction, Recovery and Enforcement Pillar Page',
    description: 'Pillar guide for landlords managing rent arrears, combining eviction choices with debt recovery and enforcement strategy.',
    heroTitle: 'Rent Arrears Landlord Guide',
    heroSubtitle: 'A practical eviction and debt recovery framework for sustained arrears cases.',
    icon: '/images/wizard-icons/15-rent-arrears.png',
    focus: 'Rent arrears eviction and recovery planning',
    scenario: 'Long-running arrears cases with payment default',
    primaryCta: { label: 'Start Money Claim', href: '/products/money-claim' },
    secondaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' },
    supportingLinks: [
      { label: 'Rent arrears eviction guide', href: '/rent-arrears-eviction-guide' },
      { label: 'Tenant stopped paying rent', href: '/tenant-stopped-paying-rent' },
      { label: 'Recover rent arrears after eviction', href: '/recover-rent-arrears-after-eviction' },
      { label: 'Tenant left without paying rent', href: '/tenant-left-without-paying-rent' },
      { label: 'How to sue tenant for unpaid rent', href: '/how-to-sue-tenant-for-unpaid-rent' },
      { label: 'Claim rent arrears tenant', href: '/claim-rent-arrears-tenant' },
      { label: 'Money claim unpaid rent', href: '/money-claim-unpaid-rent' },
      { label: 'Rent arrears letter template', href: '/rent-arrears-letter-template' },
    ],
    toolLinks: [
      { label: 'Rent arrears calculator', href: '/tools/rent-arrears-calculator' },
      { label: 'Free rent demand letter', href: '/tools/free-rent-demand-letter' },
    ],
    productLink: { label: 'Money Claim product', href: '/products/money-claim' },
  },
  {
    slug: 'eviction-process-england',
    title: 'Eviction Process England: Landlord Pillar Page from Notice to Bailiff Enforcement',
    description: 'Authoritative England eviction process pillar for landlords, covering notice strategy, court sequence, timelines, and enforcement.',
    heroTitle: 'Eviction Process in England for Landlords',
    heroSubtitle: 'Follow a complete stage-by-stage process from legal notice to possession order and bailiff execution.',
    icon: '/images/wizard-icons/07-review-finish.png',
    focus: 'The eviction process in England',
    scenario: 'End-to-end possession cases from notice to enforcement',
    primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' },
    secondaryCta: { label: 'Start Notice Only', href: '/products/notice-only' },
    supportingLinks: [
      { label: 'Eviction timeline England', href: '/eviction-timeline-england' },
      { label: 'Possession order process', href: '/possession-order-process' },
      { label: 'Court possession order guide', href: '/court-possession-order-guide' },
      { label: 'Bailiff eviction process', href: '/bailiff-eviction-process' },
      { label: 'Warrant of possession guide', href: '/warrant-of-possession-guide' },
      { label: 'Court bailiff eviction guide', href: '/court-bailiff-eviction-guide' },
      { label: 'Eviction court hearing guide', href: '/eviction-court-hearing-guide' },
      { label: 'Landlord eviction checklist', href: '/landlord-eviction-checklist' },
    ],
    toolLinks: [
      { label: 'Eviction notice pack', href: '/eviction-notice-template' },
      { label: 'Eviction notice pack', href: '/eviction-notice-template' },
    ],
    productLink: { label: 'Complete Pack product', href: '/products/complete-pack' },
  },
];

export const PILLAR_PAGES: Record<string, PillarPageContent> = Object.fromEntries(seeds.map((seed) => [seed.slug, buildPage(seed)]));

export function getPillarMetadata(page: PillarPageContent): Metadata {
  const canonical = getCanonicalUrl(`/${page.slug}`);

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'article',
      url: canonical,
    },
  };
}
