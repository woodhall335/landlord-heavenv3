import type { FAQItem } from '@/components/seo/FAQSection';
import type { IntentSection } from '@/components/seo/HighIntentPageShell';
import type { Metadata } from 'next';
import { generateMetadataForPageType } from './metadata';
import type { HighIntentPageContent } from '@/lib/seo/high-intent-pass1-pages';

interface PageSeed {
  slug: string;
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  icon: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  relatedLinks: Array<{ label: string; href: string }>;
  focus: string;
}

const sectionTemplates = [
  'Case triage and objective setting',
  'Evidence pack and chronology control',
  'Notice strategy and service quality',
  'Court filing readiness and document integrity',
  'Hearing and negotiation decision points',
  'Possession enforcement and operational handover',
  'Arrears, damages, and financial recovery workflow',
  'Risk controls that reduce resets and adjournments',
  'Execution checklist for the next 30 days',
];

function longParagraph(focus: string, heading: string, angle: string): string {
  return `${focus} should be managed as a structured project, not a one-off letter exercise. In the ${heading.toLowerCase()} stage, landlords get better outcomes when every action has a clear legal purpose, a dated evidence source, and a fallback route if the tenant disputes facts or delays cooperation. ${angle} Build one master timeline that aligns tenancy terms, service events, payment events, and communication records, then reuse that timeline in notices, witness statements, and court bundles so contradictions do not appear later. This disciplined approach improves credibility, protects hearing momentum, and keeps your conversion path aligned to product page first, wizard second, and checkout only after route confidence is established.`;
}

function buildSections(focus: string): IntentSection[] {
  const angles = [
    'Start by identifying whether your immediate objective is possession, debt recovery, or both, and state the objective in your internal file notes.',
    'Use source documents rather than copied summaries so you can reconcile each figure and date in seconds if challenged by the tenant or judge.',
    'Test service method, deemed service dates, and notice wording before issue so technical errors do not force a full restart.',
    'Run a contradiction check across all forms, annexes, and arrears schedules because even minor date mismatches can invite adjournment.',
    'Prepare for likely responses such as disrepair allegations, hardship requests, and partial-payment tactics that can alter mandatory ground availability.',
    'Plan enforcement logistics early, including occupancy status, vulnerability indicators, locksmith coordination, and inventory security.',
    'Define your debt recovery threshold in advance so enforcement spend remains commercially sensible and proportional to expected recovery.',
    'Add portfolio controls after each case closes so recurring failures in onboarding, compliance, or arrears monitoring are corrected systematically.',
    'Convert this guide into a task list with owners and deadlines, then review progress weekly until possession and recovery goals are completed.',
  ];

  return sectionTemplates.map((heading, index) => ({
    title: heading,
    paragraphs: [
      longParagraph(focus, heading, angles[index]),
      longParagraph(focus, heading, 'Where uncertainty exists, capture assumptions explicitly and update them when new evidence arrives, rather than letting informal assumptions drive legal steps.'),
      longParagraph(focus, heading, 'When choosing routes, prioritise procedural resilience over theoretical speed; the fastest path is the one least likely to be struck out, stayed, or sent back for corrections.'),
    ],
  }));
}

function buildFaqs(focus: string): FAQItem[] {
  return [
    { question: `Is ${focus.toLowerCase()} mainly about forms or strategy?`, answer: `Both. ${focus} works best when document accuracy and route strategy are planned together from day one.` },
    { question: 'Should I move straight to the wizard?', answer: 'Use the product page first to pick the correct route and package, then continue into the wizard with clearer inputs.' },
    { question: 'Can I combine possession and money recovery?', answer: 'Often yes, but sequence matters. Preserve possession momentum while preparing debt evidence in parallel.' },
    { question: 'What causes most landlord delays?', answer: 'Date inconsistencies, weak service evidence, and unclear fallback planning cause most avoidable resets.' },
  ];
}

function makePage(seed: PageSeed): HighIntentPageContent {
  return {
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    heroTitle: seed.heroTitle,
    heroSubtitle: seed.heroSubtitle,
    icon: seed.icon,
    heroBullets: [
      'Product-first funnel routing to reduce dead-end sessions',
      'Court and service risk controls integrated into each stage',
      'Internal links to related guides, tools, and landlord problem pages',
    ],
    primaryCta: seed.primaryCta,
    secondaryCta: seed.secondaryCta,
    relatedLinks: seed.relatedLinks,
    sections: buildSections(seed.focus),
    faqs: buildFaqs(seed.focus),
  };
}

const seeds: PageSeed[] = [
  { slug: 'notice-to-quit-guide', title: 'Notice to Quit Guide for Landlords: Service, Timing, and Next Steps', description: 'Long-form landlord guide to notice to quit strategy, service evidence, court preparation, and funnel-safe next actions.', heroTitle: 'Notice to Quit Guide for Landlords', heroSubtitle: 'Understand when notice to quit applies, how to serve correctly, and what to do if the tenant does not leave.', icon: '/images/wizard-icons/06-notice-details.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Need court bundle? Use Complete Pack', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Section 21 notice template', href: '/section-21-notice-template' }, { label: 'Possession claim guide', href: '/possession-claim-guide' }, { label: 'Section 21 validator tool', href: '/tools/validators/section-21' }, { label: 'Tenant won’t leave', href: '/tenant-wont-leave' }], focus: 'Notice to quit planning for residential landlords' },
  { slug: 'section-21-validity-checklist', title: 'Section 21 Validity Checklist: Landlord Compliance and Proof Guide', description: 'Detailed checklist for Section 21 validity, compliance evidence, common failure points, and court-safe preparation.', heroTitle: 'Section 21 Validity Checklist', heroSubtitle: 'Audit your compliance file before service to avoid invalid notices and expensive delay.', icon: '/images/wizard-icons/07-review-finish.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Get full case continuity', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Serve Section 21 notice', href: '/serve-section-21-notice' }, { label: 'Accelerated possession guide', href: '/accelerated-possession-guide' }, { label: 'Section 21 validator tool', href: '/tools/validators/section-21' }, { label: 'Tenant refusing access', href: '/tenant-refusing-access' }], focus: 'Section 21 validity checklist and compliance audit' },
  { slug: 'section-8-eviction-process', title: 'Section 8 Eviction Process Explained: Arrears, Grounds, and Court Route', description: 'Comprehensive Section 8 process guide covering grounds selection, service standards, hearing prep, and enforcement sequencing.', heroTitle: 'Section 8 Eviction Process', heroSubtitle: 'Follow a court-ready process for Section 8 possession claims without avoidable resets.', icon: '/images/wizard-icons/16-grounds.png', primaryCta: { label: 'Start Notice Only for Section 8', href: '/products/notice-only' }, secondaryCta: { label: 'Build full court pack', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' }, { label: 'Eviction court hearing guide', href: '/eviction-court-hearing-guide' }, { label: 'Section 8 validator tool', href: '/tools/validators/section-8' }, { label: 'Tenant stopped paying rent', href: '/tenant-stopped-paying-rent' }], focus: 'Section 8 eviction process for possession and arrears' },
  { slug: 'rent-arrears-eviction-guide', title: 'Rent Arrears Eviction Guide: Possession and Debt Recovery for Landlords', description: 'Long-form guide to rent arrears eviction strategy, threshold management, hearing prep, and post-possession debt recovery.', heroTitle: 'Rent Arrears Eviction Guide', heroSubtitle: 'Coordinate possession and arrears recovery with a structured legal and commercial workflow.', icon: '/images/wizard-icons/15-rent-arrears.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Recover arrears with Money Claim', href: '/products/money-claim' }, relatedLinks: [{ label: 'Tenant not paying rent', href: '/tenant-not-paying-rent' }, { label: 'Money claim unpaid rent', href: '/money-claim-unpaid-rent' }, { label: 'Rent arrears calculator tool', href: '/tools/rent-arrears-calculator' }, { label: 'Recover rent arrears after eviction', href: '/recover-rent-arrears-after-eviction' }], focus: 'Rent arrears eviction and debt recovery sequencing' },
  { slug: 'landlord-eviction-checklist', title: 'Landlord Eviction Checklist: End-to-End Compliance and Court Preparation', description: 'Step-by-step landlord eviction checklist from triage through enforcement, with evidence standards and funnel-safe CTA routing.', heroTitle: 'Landlord Eviction Checklist', heroSubtitle: 'Use a complete legal-operational checklist to reduce invalid notices, delays, and court surprises.', icon: '/images/wizard-icons/40-tenants.png', primaryCta: { label: 'Choose Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Choose Complete Pack', href: '/products/complete-pack' }, relatedLinks: [{ label: 'How long does eviction take', href: '/how-long-does-eviction-take' }, { label: 'Eviction timeline UK', href: '/eviction-timeline-uk' }, { label: 'Section 21 generator tool', href: '/tools/free-section-21-notice-generator' }, { label: 'Tenant anti-social behaviour', href: '/tenant-anti-social-behaviour' }], focus: 'Landlord eviction checklist for reliable case execution' },
  { slug: 'court-possession-order-guide', title: 'Court Possession Order Guide: Filing, Hearing, and Order Enforcement', description: 'Detailed court possession order guide for landlords, including forms, bundles, hearing preparation, and enforcement planning.', heroTitle: 'Court Possession Order Guide', heroSubtitle: 'Prepare your possession order case with documents that align from notice service to enforcement.', icon: '/images/wizard-icons/07-review-finish.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Need notice drafting first?', href: '/products/notice-only' }, relatedLinks: [{ label: 'Possession claim guide', href: '/possession-claim-guide' }, { label: 'N5B possession claim guide', href: '/n5b-possession-claim-guide' }, { label: 'Section 21 validator tool', href: '/tools/validators/section-21' }, { label: 'Tenant won’t leave', href: '/tenant-wont-leave' }], focus: 'Court possession order preparation and execution' },
  { slug: 'n5b-possession-claim-guide', title: 'N5B Possession Claim Guide: Accelerated Route for Landlords', description: 'In-depth N5B guide covering eligibility, drafting precision, evidence bundles, and accelerated possession workflow controls.', heroTitle: 'N5B Possession Claim Guide', heroSubtitle: 'Use the accelerated possession route with cleaner documents and fewer avoidable objections.', icon: '/images/wizard-icons/03-property.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Prepare notice first', href: '/products/notice-only' }, relatedLinks: [{ label: 'Accelerated possession guide', href: '/accelerated-possession-guide' }, { label: 'Serve Section 21 notice', href: '/serve-section-21-notice' }, { label: 'Section 21 validator tool', href: '/tools/validators/section-21' }, { label: 'Tenant refusing access', href: '/tenant-refusing-access' }], focus: 'N5B accelerated possession claim workflow' },
  { slug: 'serve-section-21-notice', title: 'How to Serve a Section 21 Notice: Method, Timing, and Proof', description: 'Practical landlord guide to serving a Section 21 notice with evidence controls that protect possession claims.', heroTitle: 'Serve a Section 21 Notice Correctly', heroSubtitle: 'Service method, timing, and documentation standards for a stronger possession route.', icon: '/images/wizard-icons/06-notice-details.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Need court continuity? Complete Pack', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Section 21 validity checklist', href: '/section-21-validity-checklist' }, { label: 'N5B possession claim guide', href: '/n5b-possession-claim-guide' }, { label: 'Free Section 21 generator tool', href: '/tools/free-section-21-notice-generator' }, { label: 'Tenant won’t leave', href: '/tenant-wont-leave' }], focus: 'Section 21 service quality and evidential proof' },
  { slug: 'serve-section-8-notice', title: 'How to Serve a Section 8 Notice: Grounds, Dates, and Service Evidence', description: 'Complete guide to Section 8 notice service, grounds mapping, deadlines, and preparation for possession hearings.', heroTitle: 'Serve a Section 8 Notice Correctly', heroSubtitle: 'Avoid common grounds and service mistakes that weaken Section 8 possession claims.', icon: '/images/wizard-icons/16-grounds.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Build court-ready file', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Section 8 eviction process', href: '/section-8-eviction-process' }, { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' }, { label: 'Free Section 8 generator tool', href: '/tools/free-section-8-notice-generator' }, { label: 'Tenant stopped paying rent', href: '/tenant-stopped-paying-rent' }], focus: 'Section 8 notice service and grounds management' },
  { slug: 'tenant-left-without-paying-rent', title: 'Tenant Left Without Paying Rent: Recovery Guide for Landlords', description: 'Landlord playbook for tracing former tenants, proving debt, filing claims, and enforcing rent arrears after move-out.', heroTitle: 'Tenant Left Without Paying Rent', heroSubtitle: 'Recover arrears after move-out with structured evidence, tracing, and claim strategy.', icon: '/images/wizard-icons/15-rent-arrears.png', primaryCta: { label: 'Start Money Claim', href: '/products/money-claim' }, secondaryCta: { label: 'Need possession route instead?', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Recover rent arrears after eviction', href: '/recover-rent-arrears-after-eviction' }, { label: 'Money claim unpaid rent', href: '/money-claim-unpaid-rent' }, { label: 'Rent arrears calculator tool', href: '/tools/rent-arrears-calculator' }, { label: 'Tenant abandoned property', href: '/tenant-abandoned-property' }], focus: 'Former tenant arrears recovery after abandonment or move-out' },
  { slug: 'recover-rent-arrears-after-eviction', title: 'Recover Rent Arrears After Eviction: Judgment and Enforcement Strategy', description: 'Detailed guide to post-eviction arrears recovery, evidence quality, county court claims, and enforcement options.', heroTitle: 'Recover Rent Arrears After Eviction', heroSubtitle: 'Turn possession outcomes into practical debt recovery with proportionate enforcement planning.', icon: '/images/wizard-icons/15-rent-arrears.png', primaryCta: { label: 'Start Money Claim', href: '/products/money-claim' }, secondaryCta: { label: 'Need eviction route guidance?', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Money claim unpaid rent', href: '/money-claim-unpaid-rent' }, { label: 'Court possession order guide', href: '/court-possession-order-guide' }, { label: 'Pre-action protocol debt guide', href: '/pre-action-protocol-debt' }, { label: 'Tenant left without paying rent', href: '/tenant-left-without-paying-rent' }], focus: 'Post-eviction rent arrears recovery and enforcement' },
  { slug: 'evict-tenant-for-damage', title: 'Evict Tenant for Property Damage: Grounds, Evidence, and Court Preparation', description: 'Long-form guide for landlords dealing with tenant damage, from evidence capture to possession and damages claims.', heroTitle: 'Evict a Tenant for Property Damage', heroSubtitle: 'Build a robust possession case and parallel damages strategy where serious property damage is involved.', icon: '/images/wizard-icons/03-property.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Claim repair costs separately', href: '/products/money-claim' }, relatedLinks: [{ label: 'Tenant damaging property', href: '/tenant-damaging-property' }, { label: 'Section 8 eviction process', href: '/section-8-eviction-process' }, { label: 'Money claim property damage', href: '/money-claim-property-damage' }, { label: 'Section 8 validator tool', href: '/tools/validators/section-8' }], focus: 'Eviction strategy for serious tenant property damage' },
  { slug: 'evict-tenant-anti-social-behaviour', title: 'Evict Tenant for Anti Social Behaviour: Evidence and Possession Route', description: 'Comprehensive anti-social behaviour eviction guide covering incident logs, notices, witness handling, and hearing prep.', heroTitle: 'Evict a Tenant for Anti-Social Behaviour', heroSubtitle: 'Use clear evidence standards and route planning in complex ASB possession cases.', icon: '/images/wizard-icons/40-tenants.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Prepare notice first', href: '/products/notice-only' }, relatedLinks: [{ label: 'Tenant anti-social behaviour guide', href: '/tenant-anti-social-behaviour' }, { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' }, { label: 'Section 8 generator tool', href: '/tools/free-section-8-notice-generator' }, { label: 'Eviction court hearing guide', href: '/eviction-court-hearing-guide' }], focus: 'Anti-social behaviour eviction planning and litigation control' },
  { slug: 'eviction-court-hearing-guide', title: 'Eviction Court Hearing Guide: Bundle, Advocacy, and Outcomes', description: 'Landlord hearing guide with evidence presentation strategy, likely tenant defences, and post-order action planning.', heroTitle: 'Eviction Court Hearing Guide', heroSubtitle: 'Prepare your hearing file, courtroom narrative, and next-step playbook before hearing day.', icon: '/images/wizard-icons/07-review-finish.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Need notice drafting first?', href: '/products/notice-only' }, relatedLinks: [{ label: 'Court possession order guide', href: '/court-possession-order-guide' }, { label: 'Possession order timeline', href: '/possession-order-timeline' }, { label: 'Section 21 validator tool', href: '/tools/validators/section-21' }, { label: 'Tenant refusing access', href: '/tenant-refusing-access' }], focus: 'Eviction court hearing preparation and outcome management' },
  { slug: 'possession-order-timeline', title: 'Possession Order Timeline: Landlord Milestones from Notice to Enforcement', description: 'Timeline-focused guide to possession order stages, durations, dependencies, and delay mitigation across the eviction funnel.', heroTitle: 'Possession Order Timeline', heroSubtitle: 'Understand each possession milestone and what controls timeline reliability.', icon: '/images/wizard-icons/07-review-finish.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Need notice first?', href: '/products/notice-only' }, relatedLinks: [{ label: 'How long does eviction take', href: '/how-long-does-eviction-take' }, { label: 'Eviction timeline UK', href: '/eviction-timeline-uk' }, { label: 'Court bailiff eviction guide', href: '/court-bailiff-eviction-guide' }, { label: 'Tenant won’t leave', href: '/tenant-wont-leave' }], focus: 'Possession order timeline planning and delay prevention' },
];

export const PASS2_LONGFORM_PAGES: Record<string, HighIntentPageContent> = Object.fromEntries(
  seeds.map((seed) => [seed.slug, makePage(seed)]),
);

export function getPass2Metadata(page: HighIntentPageContent): Metadata {
  return generateMetadataForPageType({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    type: 'article',
    pageType: 'guide',
  });
}
