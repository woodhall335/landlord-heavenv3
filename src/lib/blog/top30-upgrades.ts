import type { BlogPost, FAQItem } from './types';

export const TOP_30_UPGRADE_SLUGS = [
  'renters-reform-bill-what-landlords-need-to-know',
  'what-is-section-21-notice',
  'section-21-vs-section-8',
  'section-21-validity-checklist',
  'serve-section-21-notice',
  'tenant-ignores-section-21',
  'what-happens-after-section-21',
  'section-8-grounds-explained',
  'section-8-eviction-process',
  'serve-section-8-notice',
  'tenant-ignores-section-8',
  'what-happens-after-section-8',
  'section-8-rent-arrears-eviction',
  'rent-arrears-eviction-guide',
  'tenant-stopped-paying-rent',
  'evict-tenant-not-paying-rent',
  'recover-rent-arrears-after-eviction',
  'tenant-left-without-paying-rent',
  'money-claim-unpaid-rent',
  'mcol-money-claim-online',
  'claim-rent-arrears-tenant',
  'how-to-sue-tenant-for-unpaid-rent',
  'eviction-court-hearing-guide',
  'court-possession-order-guide',
  'possession-order-timeline',
  'n5b-possession-claim-guide',
  'how-long-does-eviction-take-uk',
  'eviction-timeline-uk',
  'how-to-evict-a-tenant-uk',
  'landlord-eviction-checklist',
] as const;

export type Top30Slug = (typeof TOP_30_UPGRADE_SLUGS)[number];

const ranking = new Map(TOP_30_UPGRADE_SLUGS.map((slug, index) => [slug, index + 1]));

const titleAndMetaBySlug: Partial<Record<Top30Slug, { title: string; metaDescription: string }>> = {
  'renters-reform-bill-what-landlords-need-to-know': {
    title: 'Renters’ Rights Act 2025: Landlord Action Plan Before Section 21 Ends',
    metaDescription: 'Understand the Renters’ Rights Act timeline, Section 21 sunset, and the practical possession steps landlords should take now.',
  },
  'what-is-section-21-notice': {
    title: 'What Is a Section 21 Notice? Rules, Notice Period, and Validity Checks',
    metaDescription: 'Clear Section 21 explanation for landlords: when it applies, how long notice lasts, and what invalidates Form 6A.',
  },
  'section-21-vs-section-8': {
    title: 'Section 21 vs Section 8: Which Eviction Route Fits Your Case?',
    metaDescription: 'Compare Section 21 and Section 8 by evidence, speed, court risk, and outcomes so you choose the right possession strategy.',
  },
  'section-21-validity-checklist': {
    title: 'Section 21 Validity Checklist (England): 12 Checks Before You Serve',
    metaDescription: 'Use this Section 21 checklist to verify EPC, gas safety, deposit, and service prerequisites before you issue Form 6A.',
  },
  'serve-section-21-notice': {
    title: 'How to Serve a Section 21 Notice Correctly (Proof, Timing, and Method)',
    metaDescription: 'Step-by-step Section 21 service guide: compliant methods, evidence trail, and what to do if the tenant disputes service.',
  },
  'tenant-ignores-section-21': {
    title: 'Tenant Ignored Section 21? Your Next Court Steps in England',
    metaDescription: 'If a tenant stays after Section 21, follow this accelerated possession pathway to avoid delay and filing mistakes.',
  },
  'what-happens-after-section-21': {
    title: 'What Happens After a Section 21 Notice Expires? Landlord Timeline',
    metaDescription: 'See the exact sequence after Section 21 expiry: possession claim, court paperwork, order stage, and enforcement.',
  },
  'section-8-grounds-explained': {
    title: 'Section 8 Grounds Explained: Mandatory vs Discretionary Possession',
    metaDescription: 'Understand each Section 8 ground, evidence thresholds, and how to build stronger possession claims.',
  },
  'section-8-eviction-process': {
    title: 'Section 8 Eviction Process in England: Notice to Possession Order',
    metaDescription: 'Follow the full Section 8 process with notice timing, court stages, and practical milestones landlords should track.',
  },
  'serve-section-8-notice': {
    title: 'How to Serve a Section 8 Notice (Form 3) Without Procedural Errors',
    metaDescription: 'Practical guide to serving Form 3 correctly with evidence, timing, and service records that support court action.',
  },
};

const questionLed = new Set<Top30Slug>([
  'what-is-section-21-notice',
  'section-21-vs-section-8',
  'what-happens-after-section-21',
  'what-happens-after-section-8',
  'how-long-does-eviction-take-uk',
  'how-to-evict-a-tenant-uk',
  'landlord-eviction-checklist',
  'how-to-sue-tenant-for-unpaid-rent',
]);

const faqByIntent: Record<'section21' | 'section8' | 'arrears' | 'court', FAQItem[]> = {
  section21: [
    { question: 'What makes a Section 21 notice invalid?', answer: 'Common failures include missing deposit protection rules, absent prescribed documents, incorrect notice dates, and weak proof of service.' },
    { question: 'Can I use Section 21 after the notice period ends?', answer: 'Yes, but you must issue the possession claim within the legal window and keep evidence that the original notice was validly served.' },
    { question: 'Should I use notice-only or complete-pack support?', answer: 'Use notice-only if you only need compliant notice preparation. Use complete-pack if you want end-to-end support through court filing.' },
  ],
  section8: [
    { question: 'Which Section 8 grounds are strongest for arrears?', answer: 'Ground 8 is mandatory if thresholds are met; Grounds 10 and 11 are commonly pleaded alongside it to strengthen the claim.' },
    { question: 'What evidence should I keep for Section 8?', answer: 'Maintain rent schedules, tenancy documents, payment logs, communications, and clear proof of notice service.' },
    { question: 'When should I move from notice to court?', answer: 'If the tenant does not remedy or leave by expiry, issue your possession claim promptly to reduce timeline slippage.' },
  ],
  arrears: [
    { question: 'Can I claim arrears and possession together?', answer: 'Yes. Many cases combine possession with a debt element, depending on route and court paperwork used.' },
    { question: 'Is MCOL always the best route for unpaid rent?', answer: 'MCOL suits straightforward debt claims. Complex disputes or possession-linked claims may be better via full county court filing.' },
    { question: 'What if the tenant has already left?', answer: 'You can still pursue debt recovery if you have evidence, current contact details, and a realistic enforcement plan.' },
  ],
  court: [
    { question: 'How long does court possession usually take?', answer: 'Timelines vary by court workload, tenant response, and hearing requirements. Build in contingency for listing delays.' },
    { question: 'What forms are critical for possession claims?', answer: 'It depends on route, but landlords commonly need complete notice packs, claim forms, rent evidence, and service proof.' },
    { question: 'When do I need enforcement after an order?', answer: 'If the tenant stays beyond the possession date, you usually need a warrant or transfer for enforcement.' },
  ],
};

export function isTop30UpgradedPost(slug: string): slug is Top30Slug {
  return TOP_30_UPGRADE_SLUGS.includes(slug as Top30Slug);
}

export function getTop30Rank(slug: string): number {
  return ranking.get(slug as Top30Slug) ?? Number.POSITIVE_INFINITY;
}

export function getUpgradedPostVariant(post: BlogPost): BlogPost {
  if (!isTop30UpgradedPost(post.slug)) return post;
  const upgrade = titleAndMetaBySlug[post.slug];
  if (!upgrade) return post;
  return {
    ...post,
    title: upgrade.title,
    metaDescription: upgrade.metaDescription,
  };
}

export function getTop30QuickAnswer(post: BlogPost): { question: string; answer: string; steps: string[] } | null {
  if (!isTop30UpgradedPost(post.slug)) return null;

  if (post.slug.includes('section-21')) {
    return {
      question: 'What is the fastest safe next step for this Section 21 scenario?',
      answer: 'Validate compliance first, then issue or progress the correct possession step without breaking evidence continuity.',
      steps: ['Confirm Form 6A validity + prerequisites.', 'Keep proof of service and key dates in one file.', 'Move to notice-only or complete-pack route based on court readiness.'],
    };
  }

  if (post.slug.includes('section-8')) {
    return {
      question: 'How should landlords handle a Section 8 case efficiently?',
      answer: 'Choose the strongest grounds, preserve evidence quality, and escalate to court promptly when notice expires.',
      steps: ['Match facts to mandatory/discretionary grounds.', 'Serve Form 3 with defensible service records.', 'Issue possession + arrears claim when deadlines pass.'],
    };
  }

  if (post.slug.includes('arrears') || post.slug.includes('rent') || post.slug.includes('money-claim') || post.slug.includes('mcol')) {
    return {
      question: 'What is the best route when rent remains unpaid?',
      answer: 'Run arrears recovery as a staged process: quantify debt, choose possession/debt route, then enforce if required.',
      steps: ['Validate arrears schedule and supporting evidence.', 'Pick possession-first, money-claim, or parallel strategy.', 'Prepare enforcement options before judgment to avoid dead-end wins.'],
    };
  }

  return {
    question: 'What should I do first in this eviction process stage?',
    answer: 'Identify the procedural stage, gather the required documents, and route to the matching legal workflow.',
    steps: ['Confirm current stage (notice, claim, order, enforcement).', 'Collect forms, dates, and service evidence.', 'Start the targeted product route to prevent rework.'],
  };
}

export function getIntentRoutedLinks(slug: string) {
  if (slug.includes('section-21')) {
    return [
      { href: '/section-21-notice-guide', label: 'Section 21 notice guide' },
      { href: '/products/notice-only', label: 'Start notice-only service' },
      { href: '/products/complete-pack', label: 'Use complete pack for court-ready progression' },
    ];
  }

  if (slug.includes('section-8') || slug.includes('arrears') || slug.includes('rent') || slug.includes('money-claim') || slug.includes('mcol')) {
    return [
      { href: '/section-8-notice-guide', label: 'Section 8 notice guide' },
      { href: '/evict-tenant-not-paying-rent', label: 'Evict tenant not paying rent pathway' },
      { href: '/products/money-claim', label: 'Start money-claim pack' },
    ];
  }

  return [
    { href: '/how-to-evict-a-tenant-uk', label: 'How to evict a tenant UK process' },
    { href: '/products/complete-pack', label: 'Start complete eviction pack' },
  ];
}

export function getTop30SupplementalFaqs(post: BlogPost): FAQItem[] {
  if (!isTop30UpgradedPost(post.slug) || !questionLed.has(post.slug)) return [];

  if (post.slug.includes('section-21')) return faqByIntent.section21;
  if (post.slug.includes('section-8')) return faqByIntent.section8;
  if (post.slug.includes('arrears') || post.slug.includes('rent') || post.slug.includes('money-claim') || post.slug.includes('mcol')) {
    return faqByIntent.arrears;
  }
  return faqByIntent.court;
}

export function getImagePlaceholderBlocks(slug: string): Array<{ title: string; description: string }> {
  if (!isTop30UpgradedPost(slug)) return [];

  return [
    {
      title: 'Timeline block placeholder',
      description: 'Insert a stage timeline graphic showing notice, court, order, and enforcement checkpoints for this scenario.',
    },
    {
      title: 'Checklist block placeholder',
      description: 'Add a visual checklist for mandatory documents, compliance checks, and evidence required before progressing.',
    },
    {
      title: 'What happens next flow block placeholder',
      description: 'Embed a decision-flow diagram that routes readers to notice-only, complete-pack, or money-claim next steps.',
    },
  ];
}
