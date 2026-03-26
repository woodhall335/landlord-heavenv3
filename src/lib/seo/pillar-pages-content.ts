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

function paragraph(focus: string, scenario: string, heading: string, angle: string) {
  return `${focus} is most effective when the landlord treats the case as a governed timeline rather than a single notice event. In ${heading.toLowerCase()}, start by stating the legal objective, the tenancy status, and the commercial objective for the property so every action has a measurable reason. ${angle} Build one chronology that captures rent due dates, breach events, communications, and service evidence, then use the same chronology in notices, claim forms, witness statements, and hearing notes to remove contradictions. Landlords in ${scenario} usually lose momentum when they rely on memory or disconnected files, so keep one indexed evidence pack with dated screenshots, certificates, bank extracts, and policy confirmations before each escalation point.`;
}

const deepSectionTitles = [
  'Case triage and route control for landlords',
  'Notice drafting standards and service evidence',
  'Pre-court preparation and contradiction checks',
  'Court filing workflow and hearing readiness',
  'Possession order execution and enforcement planning',
  'Arrears, costs, and financial recovery strategy',
];

const deepAngles = [
  'Define whether possession, arrears recovery, or both is the lead objective before choosing a route, because route confusion causes avoidable restarts.',
  'Cross-check prescribed requirements, notice periods, and tenancy compliance evidence before service so validity risk is reduced early.',
  'Run an internal quality review against dates, figures, annexes, and tenancy documents before filing, because judges focus on accuracy and consistency.',
  'Prepare concise hearing narratives that align evidence to each legal test so the judge can follow your sequence quickly under pressure.',
  'Map enforcement dependencies in advance, including tenant vulnerability indicators and property handover logistics, to avoid post-order delay.',
  'Set a recovery threshold and enforcement budget so debt action stays commercially sensible and proportionate to expected outcomes.',
];

function buildDeepSections(seed: Seed): PillarSection[] {
  return deepSectionTitles.map((title, index) => ({
    title,
    paragraphs: [
      paragraph(seed.focus, seed.scenario, title, deepAngles[index]),
      paragraph(seed.focus, seed.scenario, title, 'When facts change, update your chronology and action list the same day so decisions are based on current evidence rather than assumptions from earlier drafts.'),
      paragraph(seed.focus, seed.scenario, title, 'The fastest route is the route least likely to be challenged, adjourned, or struck out, so prioritise procedural resilience over optimistic timing.'),
    ],
  }));
}

function buildFaqs(topic: string): FAQItem[] {
  return [
    { question: `What is the first step in a ${topic} case?`, answer: 'Start by confirming tenancy type, current compliance position, and the commercial objective for possession or debt recovery before serving anything.' },
    { question: 'Should I use Section 21 or Section 8 first?', answer: 'Choose the route that matches your legal facts: Section 21 for no-fault possession where requirements are met, Section 8 for breach-based possession.' },
    { question: 'Can I recover rent arrears during eviction?', answer: 'Yes, but sequence matters. Protect possession momentum first and prepare arrears evidence in parallel so both objectives can progress.' },
    { question: 'How do I reduce risk of notice invalidity?', answer: 'Use the correct form, verify dates carefully, and retain robust service proof including certificates and communication records.' },
    { question: 'What documents should be in my court bundle?', answer: 'Include tenancy agreement, notice, proof of service, rent schedule, relevant certificates, correspondence, and a clear chronology.' },
    { question: 'What if the tenant raises a defence?', answer: 'Map likely defence themes in advance and prepare fact-based rebuttals linked directly to your documents and timeline.' },
    { question: 'When should I apply for a warrant?', answer: 'If the possession date passes and the tenant remains in occupation, progress to enforcement promptly with complete supporting documents.' },
    { question: 'Is accelerated possession always faster?', answer: 'It can be faster where Section 21 compliance is strong, but errors in forms or evidence can remove that advantage quickly.' },
    { question: 'Should I use landlord tools before filing?', answer: 'Yes. A current paid notice route plus landlord tools reduce drafting errors and improve consistency before court documents are issued.' },
    { question: 'When should I choose full managed support?', answer: 'Choose full support when the case is complex, heavily defended, or commercially critical and you need route confidence and document control.' },
  ];
}

function buildPage(seed: Seed): PillarPageContent {
  return {
    ...seed,
    heroBullets: [
      'Route-first guidance for Section 21, Section 8, court, and enforcement decisions.',
      'Long-form process planning with checklists, comparison tables, and decision pathways.',
      'Internal links to the full eviction cluster, tools, and product actions.',
    ],
    quickAnswer: [
      `${seed.focus} should begin with route clarity, compliance verification, and evidence control. Landlords who define whether they need no-fault possession, breach-based possession, or parallel arrears recovery can avoid procedural detours and protect timeline reliability from day one.`,
      `For ${seed.scenario}, the practical sequence is to validate facts, serve the correct notice with defensible service proof, prepare court-ready files before deadlines, and pre-plan enforcement logistics so possession can be executed without avoidable delay.`,
    ],
    routeExplanation: [
      'Section 21 is commonly used when the fixed term has ended or a break clause applies and compliance prerequisites are satisfied. It focuses on regaining possession without proving tenant fault, but validity depends on strict document and timing accuracy.',
      'Section 8 is used where specific breach grounds exist, such as serious arrears or anti-social behaviour. It can provide stronger leverage for breach-led cases, yet requires clear factual evidence tied to the chosen statutory grounds and notice period.',
      'Court route decisions are shaped by notice route, tenant response, and defence complexity. Accelerated processes may suit compliant no-fault files, while standard possession claims are often necessary where facts are disputed or arrears claims are integrated.',
      'Enforcement should be mapped before judgment so there is no handover gap after possession order dates. Bailiff scheduling, property access planning, and post-possession debt recovery should be prepared as part of one coordinated case plan.',
    ],
    processSteps: [
      { title: 'Diagnose case facts and tenancy compliance', detail: `Confirm tenancy status, notice eligibility, compliance documents, rent ledger accuracy, and whether ${seed.scenario} introduces additional risk factors before committing to one route.` },
      { title: 'Select route and issue the correct notice', detail: 'Choose Section 21, Section 8, or a combined strategy based on facts, then serve using reliable methods with complete and dated service evidence retained in one bundle.' },
      { title: 'Run pre-court quality checks', detail: 'Before filing, reconcile every date, figure, and annex across forms and schedules. This prevents contradictions that often trigger adjournments or re-filings.' },
      { title: 'File claim and prepare hearing narrative', detail: 'Issue the claim with full supporting documents, then build a short hearing narrative mapping facts to legal tests so presentation is clear and judge-friendly.' },
      { title: 'Execute possession and next-stage recovery', detail: 'After order, action enforcement promptly if needed, secure property handover steps, and progress arrears or damages recovery according to a pre-set commercial threshold.' },
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
      { question: 'Do you meet all Section 21 requirements?', recommendation: 'If yes, Section 21 may be your primary possession route. If not, remediate gaps or evaluate Section 8 grounds.' },
      { question: 'Is serious rent arrears the core issue?', recommendation: 'Prioritise Section 8 arrears grounds with clear schedules and payment evidence, while keeping fallback options ready.' },
      { question: 'Is possession urgent and likely defended?', recommendation: 'Prepare for standard possession procedure with a robust bundle and hearing strategy rather than relying on speed assumptions.' },
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
    description: 'Complete landlord pillar guide explaining how to evict a tenant in the UK with route decisions, process steps, checklists, and supporting links.',
    heroTitle: 'How to Evict a Tenant in the UK',
    heroSubtitle: 'A complete route-first landlord guide covering notices, possession claims, timelines, and enforcement planning.',
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
      { label: 'Eviction notice pack', href: '/eviction-notice' },
      { label: 'Eviction notice pack', href: '/eviction-notice' },
    ],
    productLink: { label: 'Landlord Complete Pack', href: '/products/complete-pack' },
  },
  {
    slug: 'section-21-notice-guide',
    title: 'Section 21 Notice Guide: Landlord Pillar Page for Validity, Service, Court and Possession',
    description: 'In-depth Section 21 pillar guide for landlords with route controls, service steps, court preparation, and linked resources.',
    heroTitle: 'Section 21 Notice Guide for Landlords',
    heroSubtitle: 'Everything you need to issue a valid Section 21 notice and convert it into possession with fewer delays.',
    icon: '/images/wizard-icons/01-tenancy.png',
    focus: 'Section 21 notice strategy',
    scenario: 'No-fault possession route planning',
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
      { label: 'Section 21 court pack', href: '/section-21-court-pack' },
    ],
    toolLinks: [
      { label: 'Eviction notice pack', href: '/eviction-notice' },
      { label: 'Eviction notice pack', href: '/eviction-notice' },
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
      { label: 'Section 8 court pack', href: '/section-8-court-pack' },
      { label: 'N5 N119 possession claim', href: '/n5-n119-possession-claim' },
      { label: 'Tenant anti-social behaviour', href: '/tenant-anti-social-behaviour' },
      { label: 'Evict tenant not paying rent', href: '/evict-tenant-not-paying-rent' },
    ],
    toolLinks: [
      { label: 'Eviction notice pack', href: '/eviction-notice' },
      { label: 'Eviction notice pack', href: '/eviction-notice' },
    ],
    productLink: { label: 'Complete eviction pack', href: '/products/complete-pack' },
  },
  {
    slug: 'rent-arrears-landlord-guide',
    title: 'Rent Arrears Landlord Guide: Eviction, Recovery and Enforcement Pillar Page',
    description: 'Pillar guide for landlords managing rent arrears, combining eviction route choices with debt recovery and enforcement strategy.',
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
    focus: 'Eviction process England workflow',
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
      { label: 'Eviction notice pack', href: '/eviction-notice' },
      { label: 'Eviction notice pack', href: '/eviction-notice' },
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
