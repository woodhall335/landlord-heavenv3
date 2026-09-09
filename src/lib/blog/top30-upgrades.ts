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
    title: 'Renters’ Rights Act 2025: What England Landlords Must Do Now',
    metaDescription: 'Understand the Renters’ Rights Act changes now in force, including the end of Section 21 and the current possession steps for landlords.',
  },
  'what-is-section-21-notice': {
    title: 'What Was a Section 21 Notice? Current England Rules Explained',
    metaDescription: 'Section 21 ended for new England notices on 1 May 2026. Learn what changed, why the term remains familiar and what landlords use now.',
  },
  'section-21-vs-section-8': {
    title: 'Section 21 vs Section 8: Which Eviction Route Fits Your Case?',
    metaDescription: 'Compare Section 21 and Section 8 by evidence, speed, court risk, and outcomes so you choose the right possession strategy.',
  },
  'section-21-validity-checklist': {
    title: 'Section 21 Validity Checklist: Historical England Guidance',
    metaDescription: 'Historical Section 21 checklist for England, with the transition deadlines and the current grounds-based possession process explained.',
  },
  'serve-section-21-notice': {
    title: 'Can You Still Serve a Section 21 Notice? England Rules After May 2026',
    metaDescription: 'You cannot serve a new Section 21 notice in England. Learn the dates that ended the process and how to use the current possession grounds.',
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
    { question: 'Can I serve a new Section 21 notice in England?', answer: 'No. Section 21 ended for new private-rented possession notices on 1 May 2026, and the deadline for starting a claim with a qualifying older notice has passed.' },
    { question: 'What should landlords use instead?', answer: 'A new possession case must rely on an applicable statutory ground, supported by the correct notice and evidence.' },
    { question: 'Should I use Notice Only or Complete Pack?', answer: 'Use Notice Only if you know the ground and only need the notice stage. Use Complete Pack if you also need court-stage documents and continuity.' },
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
      question: 'Can a landlord start a Section 21 case now?',
      answer: 'No. Section 21 and its transitional court-claim window have ended. A new England case must use an applicable current possession ground.',
      steps: ['Identify the possession reason and supporting evidence.', 'Check the current notice and notice period for that ground.', 'Choose Notice Only or Complete Pack based on the stage of the case.'],
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
    answer: 'Identify the procedural stage, gather the required documents, and choose the matching legal action route.',
    steps: ['Confirm current stage (notice, claim, order, enforcement).', 'Collect forms, dates, and service evidence.', 'Start the targeted product route to prevent rework.'],
  };
}

export function getIntentRoutedLinks(slug: string) {
  if (slug.includes('section-21')) {
    return [
      { href: '/section-21-ban-uk', label: 'What replaced Section 21' },
      { href: '/products/notice-only', label: 'Create my Section 8 notice' },
      { href: '/products/complete-pack', label: 'Prepare my court pack' },
    ];
  }

  if (slug.includes('section-8') || slug.includes('arrears') || slug.includes('rent') || slug.includes('money-claim') || slug.includes('mcol')) {
    return [
      { href: '/section-8-notice-guide', label: 'Section 8 notice guide' },
      { href: '/evict-tenant-not-paying-rent', label: 'Evict tenant not paying rent pathway' },
      { href: '/products/money-claim', label: 'Prepare my money claim' },
    ];
  }

  return [
    { href: '/how-to-evict-a-tenant-uk', label: 'How to evict a tenant UK process' },
    { href: '/products/complete-pack', label: 'Prepare my court pack' },
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
