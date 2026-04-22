/**
 * Section 8 Related FAQ Data
 *
 * FAQs for Section 8 notice and Form 3 pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const section8NoticeTemplateFAQs: FAQItem[] = [
  {
    question: 'How much rent arrears do I need for Section 8 Ground 8?',
    answer: 'For Ground 8 (mandatory possession), the tenant must owe at least 3 months rent if rent is monthly, or 13 weeks rent if rent is paid weekly or fortnightly, at both the date you serve the notice AND the court hearing date. If they reduce arrears below the threshold before the hearing, Ground 8 fails.',
  },
  {
    question: 'What is the notice period for Section 8?',
    answer: 'It varies by ground. Grounds 8, 10, and 11 now require 4 weeks notice. Grounds 1, 1A, 2, and 6 require 4 months. Some others require 2 months or 2 weeks, and Ground 14 can still be immediate in serious cases.',
  },
  {
    question: 'What form do I use for Section 8?',
    answer: 'You must use Form 3, the prescribed notice seeking possession under Section 8 of the Housing Act 1988. Using the wrong form invalidates your notice.',
  },
  {
    question: 'Can I serve Section 8 and Section 21 together?',
    answer: 'Not for new England private-rented cases after 1 May 2026. Section 21 ended for that route, so landlords now use the current Form 3A possession route and choose the grounds that fit the case.',
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
    answer: 'Select all grounds that apply. For rent arrears, typically Ground 8 (mandatory, if the post-May 2026 threshold is met), Ground 10 (some rent due), and Ground 11 (persistent delay). Multiple grounds strengthen your case.',
  },
  {
    question: 'How do I calculate arrears for Form 3?',
    answer: 'Calculate the total rent owed at the date of service. Include any part-periods on a pro-rata basis. The arrears figure must be accurate — errors can invalidate the notice.',
  },
  {
    question: 'What notice period applies to Form 3?',
    answer: 'It depends on the ground. Grounds 8, 10, and 11 now require 4 weeks notice. Grounds 12, 13, 14A, 14ZA, 15, and 17 require 2 weeks. Grounds 5, 5A, 5B, 5C, 5H, 7, and 9 require 2 months. Grounds 1, 1A, 2, and 6 require 4 months. Ground 14 can still be immediate in serious antisocial behaviour cases.',
  },
  {
    question: 'Can I use Form 3 for rent arrears below the Ground 8 threshold?',
    answer: 'Yes, use Ground 10 (some rent lawfully due) or Ground 11 (persistent delay in paying). These are discretionary, so the court decides if eviction is reasonable. Ground 8 only becomes available once the higher post-May 2026 threshold is met.',
  },
  {
    question: 'What happens after serving Form 3?',
    answer: 'Wait for the notice period to expire. If the tenant remains and grounds still apply, apply to court using Form N5 for a possession hearing. Unlike Section 21, there is no accelerated procedure.',
  },
];







