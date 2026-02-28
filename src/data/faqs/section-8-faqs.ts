/**
 * Section 8 Related FAQ Data
 *
 * FAQs for Section 8 notice and Form 3 pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const section8NoticeTemplateFAQs: FAQItem[] = [
  {
    question: 'How much rent arrears do I need for Section 8 Ground 8?',
    answer: 'For Ground 8 (mandatory possession), the tenant must owe at least 2 months rent at both the date you serve the notice AND the court hearing date. If they reduce arrears below 2 months before the hearing, Ground 8 fails.',
  },
  {
    question: 'What is the notice period for Section 8?',
    answer: 'It varies by ground. Ground 8 (rent arrears) requires 2 weeks notice. Grounds 1, 2, 5-7 require 2 months. Ground 14 (antisocial behaviour) can be immediate in serious cases.',
  },
  {
    question: 'What form do I use for Section 8?',
    answer: 'You must use Form 3, the prescribed notice seeking possession under Section 8 of the Housing Act 1988. Using the wrong form invalidates your notice.',
  },
  {
    question: 'Can I serve Section 8 and Section 21 together?',
    answer: 'Yes, many landlords serve both notices simultaneously. This gives you the mandatory Ground 8 route if arrears remain, plus the no-fault Section 21 backup if arrears are paid down.',
  },
  {
    question: 'Is Section 8 mandatory or discretionary?',
    answer: 'It depends on the ground. Grounds 1-8 are mandatory (court must grant possession). Grounds 9-17 are discretionary (court decides if it is reasonable to grant possession).',
  },
  {
    question: 'How long does Section 8 eviction take?',
    answer: 'Typically 3-6 months from serving notice to bailiff eviction. If the tenant defends or requests postponement, it can take longer. Court backlogs vary by region.',
  },
];

export const form3Section8FAQs: FAQItem[] = [
  {
    question: 'What is Form 3?',
    answer: 'Form 3 is the prescribed notice seeking possession of a property let on an assured tenancy under Section 8 of the Housing Act 1988. You must use this form when evicting for fault-based grounds.',
  },
  {
    question: 'Which grounds do I select on Form 3?',
    answer: 'Select all grounds that apply. For rent arrears, typically Ground 8 (mandatory, 2+ months), Ground 10 (some rent due), and Ground 11 (persistent delay). Multiple grounds strengthen your case.',
  },
  {
    question: 'How do I calculate arrears for Form 3?',
    answer: 'Calculate the total rent owed at the date of service. Include any part-periods on a pro-rata basis. The arrears figure must be accurate — errors can invalidate the notice.',
  },
  {
    question: 'What notice period applies to Form 3?',
    answer: 'Two weeks for Grounds 8, 10, 11, 12, 13, 14A, 15, or 17. Two months for Grounds 1, 2, 5, 6, 7, 9, or 16. Immediate for Ground 14 in serious antisocial behaviour cases.',
  },
  {
    question: 'Can I use Form 3 for rent arrears under 2 months?',
    answer: 'Yes, use Ground 10 (some rent lawfully due) or Ground 11 (persistent delay in paying). These are discretionary, so the court decides if eviction is reasonable.',
  },
  {
    question: 'What happens after serving Form 3?',
    answer: 'Wait for the notice period to expire. If the tenant remains and grounds still apply, apply to court using Form N5 for a possession hearing. Unlike Section 21, there is no accelerated procedure.',
  },
];
