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
  'Start with the facts and the outcome you want',
  'Build one evidence file and one timeline',
  'Serve the right notice and keep proof of service',
  'Get the court paperwork consistent before filing',
  'Prepare for the hearing and likely responses',
  'Plan the handover and enforcement stage early',
  'Decide how far to push arrears or damages recovery',
  'Reduce the mistakes that cause delay',
  'What to do over the next 30 days',
];

function buildSections(focus: string): IntentSection[] {
  const angles = [
    'Decide early whether your main aim is possession, debt recovery, or both, so the paperwork matches what you are really trying to achieve.',
    'Use the original documents where you can, so every figure and date can be checked quickly if the tenant or the court challenges them.',
    'Check the service method, service dates, and notice wording before you issue anything, because small technical errors can force a restart.',
    'Compare the dates, names, and figures across every form and schedule before filing, because even small inconsistencies can slow the case down.',
    'Think ahead to likely responses such as disrepair allegations, hardship points, or part-payments that could change the strength of your case.',
    'Plan the enforcement practicalities early, including who is still in the property, whether there are vulnerability concerns, and how the handover would work.',
    'Set a sensible threshold for debt recovery before spending more money on enforcement than the claim is likely to justify.',
    'Use what you learn from the case to tighten your own systems so the same onboarding or arrears mistakes are less likely to happen again.',
    'Turn the guide into a clear task list with dates, then review it every week until the case is resolved.',
  ];

  return sectionTemplates.map((heading, index) => ({
    title: heading,
    paragraphs: [
      `${focus} usually goes better when you break it into clear steps instead of treating it like one long legal problem. At the ${heading.toLowerCase()} stage, start by working out what needs to be true before you do anything else. ${angles[index]} That gives you a much steadier basis for the paperwork that follows.`,
      `This is also the point where landlords often save or lose time later. Keep one master timeline for the tenancy, service events, payments, and key communications, then reuse it across notices, statements, and court paperwork so the story stays consistent. Where you are unsure, write the assumption down and update it when new evidence arrives instead of letting guesswork drive the next step.`,
      `Practical discipline matters as much as the legal theory here. Name the documents clearly, keep the latest version of each file in one place, and check that each action still matches the facts on the day you take it. When you have a choice, the better option is usually the one least likely to be delayed, challenged, or sent back for corrections.`,
    ],
  }));
}

function buildFaqs(focus: string): FAQItem[] {
  return [
    { question: `Is ${focus.toLowerCase()} mainly about forms or strategy?`, answer: `Both. ${focus} works best when the paperwork and the practical approach are planned together from the start.` },
    { question: 'What should I do first?', answer: 'Start by checking the facts, the notice position, and the key documents so you know what legal step actually fits the case.' },
    { question: 'Can I combine possession and money recovery?', answer: 'Often yes, but the order still matters. Keep the possession case clear while preparing the money evidence in parallel.' },
    { question: 'What causes most landlord delays?', answer: 'Date mismatches, weak proof of service, and inconsistent paperwork usually cause the most avoidable setbacks.' },
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
      'Clear next steps for the landlord problem on this page',
      'Practical checks for service, evidence, and court paperwork',
      'Links to the related guides and tools landlords usually need next',
    ],
    primaryCta: seed.primaryCta,
    secondaryCta: seed.secondaryCta,
    relatedLinks: seed.relatedLinks,
    sections: buildSections(seed.focus),
    faqs: buildFaqs(seed.focus),
  };
}

const seeds: PageSeed[] = [
  { slug: 'notice-to-quit-guide', title: 'Notice to Quit Guide for Landlords: Service, Timing, and Next Steps', description: 'Long-form landlord guide to notice to quit, service evidence, court preparation, and the next steps if the tenant still does not leave.', heroTitle: 'Notice to Quit Guide for Landlords', heroSubtitle: 'Understand when notice to quit applies, how to serve it correctly, and what usually happens next if the tenant stays put.', icon: '/images/wizard-icons/06-notice-details.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Need the court paperwork too? Use Complete Pack', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Section 21 notice template', href: '/section-21-notice-template' }, { label: 'Possession claim guide', href: '/possession-claim-guide' }, { label: 'Eviction notice pack', href: '/eviction-notice' }, { label: "Tenant won't leave", href: '/tenant-wont-leave' }], focus: 'Notice to quit planning for residential landlords' },
  { slug: 'section-21-validity-checklist', title: 'Section 21 Validity Checklist: Landlord Compliance and Proof Guide', description: 'Detailed checklist for Section 21 validity, compliance evidence, common failure points, and court-safe preparation.', heroTitle: 'Section 21 Validity Checklist', heroSubtitle: 'Check the compliance file before you serve so you do not lose time on an invalid notice.', icon: '/images/wizard-icons/07-review-finish.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Need the court paperwork too? Use Complete Pack', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Serve Section 21 notice', href: '/serve-section-21-notice' }, { label: 'Accelerated possession guide', href: '/accelerated-possession-guide' }, { label: 'Eviction notice pack', href: '/eviction-notice' }, { label: 'Tenant refusing access', href: '/tenant-refusing-access' }], focus: 'Section 21 validity checklist and compliance audit' },
  { slug: 'section-8-eviction-process', title: 'Section 8 Eviction Process Explained: Arrears, Grounds, and Court Route', description: 'Comprehensive Section 8 guide covering grounds selection, service standards, hearing preparation, and enforcement sequencing.', heroTitle: 'Section 8 Eviction Process', heroSubtitle: 'Follow a court-ready Section 8 process without the usual avoidable mistakes.', icon: '/images/wizard-icons/16-grounds.png', primaryCta: { label: 'Start Notice Only for Section 8', href: '/products/notice-only' }, secondaryCta: { label: 'Need the court paperwork too? Use Complete Pack', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' }, { label: 'Eviction court hearing guide', href: '/eviction-court-hearing-guide' }, { label: 'Eviction notice pack', href: '/eviction-notice' }, { label: 'Tenant stopped paying rent', href: '/tenant-stopped-paying-rent' }], focus: 'Section 8 eviction process for possession and arrears' },
  { slug: 'rent-arrears-eviction-guide', title: 'Rent Arrears Eviction Guide: Possession and Debt Recovery for Landlords', description: 'Long-form guide to rent arrears eviction, threshold management, hearing preparation, and post-possession debt recovery.', heroTitle: 'Rent Arrears Eviction Guide', heroSubtitle: 'Keep the possession case and the arrears recovery organised from the start.', icon: '/images/wizard-icons/15-rent-arrears.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Recover arrears with Money Claim', href: '/products/money-claim' }, relatedLinks: [{ label: 'Tenant not paying rent', href: '/tenant-not-paying-rent' }, { label: 'Money claim unpaid rent', href: '/money-claim-unpaid-rent' }, { label: 'Rent arrears calculator tool', href: '/tools/rent-arrears-calculator' }, { label: 'Recover rent arrears after eviction', href: '/recover-rent-arrears-after-eviction' }], focus: 'Rent arrears eviction and debt recovery sequencing' },
  { slug: 'landlord-eviction-checklist', title: 'Landlord Eviction Checklist: End-to-End Compliance and Court Preparation', description: 'Step-by-step landlord eviction checklist from first checks through enforcement, with evidence standards and court preparation points.', heroTitle: 'Landlord Eviction Checklist', heroSubtitle: 'Use a full landlord checklist to reduce invalid notices, delays, and court surprises.', icon: '/images/wizard-icons/40-tenants.png', primaryCta: { label: 'Choose Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Choose Complete Pack', href: '/products/complete-pack' }, relatedLinks: [{ label: 'How long does eviction take', href: '/how-long-does-eviction-take' }, { label: 'Eviction timeline UK', href: '/eviction-timeline-uk' }, { label: 'Eviction notice pack', href: '/eviction-notice' }, { label: 'Tenant anti-social behaviour', href: '/tenant-anti-social-behaviour' }], focus: 'Landlord eviction checklist for reliable case execution' },
  { slug: 'court-possession-order-guide', title: 'Court Possession Order Guide: Filing, Hearing, and Order Enforcement', description: 'Detailed possession order guide for landlords, including forms, hearing preparation, and enforcement planning.', heroTitle: 'Court Possession Order Guide', heroSubtitle: 'Prepare the possession claim so the paperwork stays clear from notice service to enforcement.', icon: '/images/wizard-icons/07-review-finish.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Need notice drafting first?', href: '/products/notice-only' }, relatedLinks: [{ label: 'Possession claim guide', href: '/possession-claim-guide' }, { label: 'N5B possession claim guide', href: '/n5b-possession-claim-guide' }, { label: 'Eviction notice pack', href: '/eviction-notice' }, { label: "Tenant won't leave", href: '/tenant-wont-leave' }], focus: 'Court possession order preparation and execution' },
  { slug: 'n5b-possession-claim-guide', title: 'N5B Possession Claim Guide: Accelerated Route for Landlords', description: 'In-depth N5B guide covering eligibility, drafting precision, evidence bundles, and the practical points that affect accelerated possession claims.', heroTitle: 'N5B Possession Claim Guide', heroSubtitle: 'Use the accelerated possession process with cleaner documents and fewer avoidable objections.', icon: '/images/wizard-icons/03-property.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Prepare notice first', href: '/products/notice-only' }, relatedLinks: [{ label: 'Accelerated possession guide', href: '/accelerated-possession-guide' }, { label: 'Serve Section 21 notice', href: '/serve-section-21-notice' }, { label: 'Eviction notice pack', href: '/eviction-notice' }, { label: 'Tenant refusing access', href: '/tenant-refusing-access' }], focus: 'N5B accelerated possession claim preparation' },
  { slug: 'serve-section-21-notice', title: 'How to Serve a Section 21 Notice: Method, Timing, and Proof', description: 'Practical landlord guide to serving a Section 21 notice with the proof and records you may need later.', heroTitle: 'Serve a Section 21 Notice Correctly', heroSubtitle: 'Get the method, timing, and proof of service right so the notice stands up later.', icon: '/images/wizard-icons/06-notice-details.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Need the court paperwork too? Use Complete Pack', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Section 21 validity checklist', href: '/section-21-validity-checklist' }, { label: 'N5B possession claim guide', href: '/n5b-possession-claim-guide' }, { label: 'Free eviction notice pack', href: '/eviction-notice' }, { label: "Tenant won't leave", href: '/tenant-wont-leave' }], focus: 'Section 21 service quality and proof' },
  { slug: 'serve-section-8-notice', title: 'How to Serve a Section 8 Notice: Grounds, Dates, and Service Evidence', description: 'Complete guide to Section 8 notice service, grounds, dates, and preparation for possession hearings.', heroTitle: 'Serve a Section 8 Notice Correctly', heroSubtitle: 'Avoid the service and grounds mistakes that most often weaken Section 8 claims.', icon: '/images/wizard-icons/16-grounds.png', primaryCta: { label: 'Start Notice Only', href: '/products/notice-only' }, secondaryCta: { label: 'Build court-ready paperwork', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Section 8 eviction process', href: '/section-8-eviction-process' }, { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' }, { label: 'Free eviction notice pack', href: '/eviction-notice' }, { label: 'Tenant stopped paying rent', href: '/tenant-stopped-paying-rent' }], focus: 'Section 8 notice service and grounds management' },
  { slug: 'tenant-left-without-paying-rent', title: 'Tenant Left Without Paying Rent: Recovery Guide for Landlords', description: 'Landlord guide to tracing former tenants, proving debt, filing claims, and enforcing rent arrears after move-out.', heroTitle: 'Tenant Left Without Paying Rent', heroSubtitle: 'Recover arrears after move-out with clear evidence, sensible tracing, and a practical claim plan.', icon: '/images/wizard-icons/15-rent-arrears.png', primaryCta: { label: 'Start Money Claim', href: '/products/money-claim' }, secondaryCta: { label: 'Need a possession pack instead?', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Recover rent arrears after eviction', href: '/recover-rent-arrears-after-eviction' }, { label: 'Money claim unpaid rent', href: '/money-claim-unpaid-rent' }, { label: 'Rent arrears calculator tool', href: '/tools/rent-arrears-calculator' }, { label: 'Tenant abandoned property', href: '/tenant-abandoned-property' }], focus: 'Former tenant arrears recovery after abandonment or move-out' },
  { slug: 'recover-rent-arrears-after-eviction', title: 'Recover Rent Arrears After Eviction: Judgment and Enforcement Strategy', description: 'Detailed guide to post-eviction arrears recovery, evidence quality, county court claims, and enforcement options.', heroTitle: 'Recover Rent Arrears After Eviction', heroSubtitle: 'Turn the possession outcome into a practical debt recovery decision, with proportionate enforcement planning.', icon: '/images/wizard-icons/15-rent-arrears.png', primaryCta: { label: 'Start Money Claim', href: '/products/money-claim' }, secondaryCta: { label: 'Need eviction guidance too?', href: '/products/complete-pack' }, relatedLinks: [{ label: 'Money claim unpaid rent', href: '/money-claim-unpaid-rent' }, { label: 'Court possession order guide', href: '/court-possession-order-guide' }, { label: 'Pre-action protocol debt guide', href: '/pre-action-protocol-debt' }, { label: 'Tenant left without paying rent', href: '/tenant-left-without-paying-rent' }], focus: 'Post-eviction rent arrears recovery and enforcement' },
  { slug: 'evict-tenant-for-damage', title: 'Evict Tenant for Property Damage: Grounds, Evidence, and Court Preparation', description: 'Long-form guide for landlords dealing with tenant damage, from evidence capture to possession and damages claims.', heroTitle: 'Evict a Tenant for Property Damage', heroSubtitle: 'Build a possession case and a damages plan where serious property damage is involved.', icon: '/images/wizard-icons/03-property.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Claim repair costs separately', href: '/products/money-claim' }, relatedLinks: [{ label: 'Tenant damaging property', href: '/tenant-damaging-property' }, { label: 'Section 8 eviction process', href: '/section-8-eviction-process' }, { label: 'Money claim property damage', href: '/money-claim-property-damage' }, { label: 'Eviction notice pack', href: '/eviction-notice' }], focus: 'Eviction strategy for serious tenant property damage' },
  { slug: 'evict-tenant-anti-social-behaviour', title: 'Evict Tenant for Anti Social Behaviour: Evidence and Possession Route', description: 'Comprehensive anti-social behaviour eviction guide covering incident logs, notices, witness handling, and hearing preparation.', heroTitle: 'Evict a Tenant for Anti-Social Behaviour', heroSubtitle: 'Use clear evidence standards and practical planning in difficult anti-social behaviour cases.', icon: '/images/wizard-icons/40-tenants.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Prepare notice first', href: '/products/notice-only' }, relatedLinks: [{ label: 'Tenant anti-social behaviour guide', href: '/tenant-anti-social-behaviour' }, { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' }, { label: 'Eviction notice pack', href: '/eviction-notice' }, { label: 'Eviction court hearing guide', href: '/eviction-court-hearing-guide' }], focus: 'Anti-social behaviour eviction planning and litigation control' },
  { slug: 'eviction-court-hearing-guide', title: 'Eviction Court Hearing Guide: Bundle, Advocacy, and Outcomes', description: 'Landlord hearing guide with evidence presentation strategy, likely tenant defences, and post-order action planning.', heroTitle: 'Eviction Court Hearing Guide', heroSubtitle: 'Prepare the hearing file, the key points you need to make, and what you will do after the order.', icon: '/images/wizard-icons/07-review-finish.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Need notice drafting first?', href: '/products/notice-only' }, relatedLinks: [{ label: 'Court possession order guide', href: '/court-possession-order-guide' }, { label: 'Possession order timeline', href: '/possession-order-timeline' }, { label: 'Eviction notice pack', href: '/eviction-notice' }, { label: 'Tenant refusing access', href: '/tenant-refusing-access' }], focus: 'Eviction court hearing preparation and outcome management' },
  { slug: 'possession-order-timeline', title: 'Possession Order Timeline: Landlord Milestones from Notice to Enforcement', description: 'Timeline-focused guide to possession order stages, durations, dependencies, and the delays landlords most often run into.', heroTitle: 'Possession Order Timeline', heroSubtitle: 'Understand each possession milestone and what usually affects the timetable.', icon: '/images/wizard-icons/07-review-finish.png', primaryCta: { label: 'Start Complete Pack', href: '/products/complete-pack' }, secondaryCta: { label: 'Need notice first?', href: '/products/notice-only' }, relatedLinks: [{ label: 'How long does eviction take', href: '/how-long-does-eviction-take' }, { label: 'Eviction timeline UK', href: '/eviction-timeline-uk' }, { label: 'Court bailiff eviction guide', href: '/court-bailiff-eviction-guide' }, { label: "Tenant won't leave", href: '/tenant-wont-leave' }], focus: 'Possession order timeline planning and delay prevention' },
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
