/**
 * Scotland FAQ Data
 *
 * FAQs for Scotland eviction and Notice to Leave pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const scotlandEvictionFAQs: FAQItem[] = [
  {
    question: 'How do I evict a tenant in Scotland?',
    answer: 'Serve a Notice to Leave citing one of the 18 statutory grounds. After the notice period (28-84 days depending on ground), apply to the First-tier Tribunal for an eviction order.',
  },
  {
    question: 'What is the notice period for eviction in Scotland?',
    answer: 'It depends on the ground and tenancy length. Rent arrears (Ground 12): 28 days. Landlord selling (Ground 1): 84 days for tenancies over 6 months, 28 days if under 6 months.',
  },
  {
    question: 'Can I use Section 21 in Scotland?',
    answer: 'No. Section 21 only applies in England. Scotland abolished no-fault evictions in 2017 with the Private Residential Tenancy. You must prove one of the 18 statutory grounds.',
  },
  {
    question: 'What is the First-tier Tribunal Scotland?',
    answer: 'The Housing and Property Chamber of the First-tier Tribunal handles eviction cases in Scotland. It replaced the sheriff court for most private rented sector disputes.',
  },
  {
    question: 'Do I need a solicitor for eviction in Scotland?',
    answer: 'No, landlords can represent themselves at the Tribunal. However, complex cases or appeals may benefit from legal representation. The process is designed to be accessible.',
  },
  {
    question: 'How long does eviction take in Scotland?',
    answer: 'Typically 4-8 months from serving Notice to Leave to enforcement. Tribunal processing times vary. If the tenant does not leave after an order, you need a decree from the Tribunal to instruct sheriff officers.',
  },
];

export const scotlandNoticeToLeaveFAQs: FAQItem[] = [
  {
    question: 'What is a Notice to Leave in Scotland?',
    answer: 'The Notice to Leave is the formal notice landlords must serve to end a Private Residential Tenancy in Scotland. It must state the eviction ground(s) and the date the tenant must leave by.',
  },
  {
    question: 'What grounds can I use on a Notice to Leave?',
    answer: 'There are 18 grounds including: landlord intends to sell (Ground 1), landlord moving in (Ground 4), substantial rent arrears (Ground 12), and breach of tenancy (Ground 11). You must have evidence for your chosen ground.',
  },
  {
    question: 'How much notice do I give on a Notice to Leave?',
    answer: '28 days for rent arrears, antisocial behaviour, or criminal conviction grounds. 84 days for most other grounds if the tenancy is over 6 months old. 28 days for any ground if tenancy is under 6 months.',
  },
  {
    question: 'Is there a prescribed form for Notice to Leave?',
    answer: 'Yes. The Scottish Government provides a prescribed Notice to Leave form. You must use this form or one substantially to the same effect. Using the wrong form invalidates your notice.',
  },
  {
    question: 'Can I serve Notice to Leave by email in Scotland?',
    answer: 'Only if the tenancy agreement permits electronic service AND the tenant has agreed. Otherwise, serve by recorded delivery post, hand delivery, or leaving at the property.',
  },
  {
    question: 'What happens after I serve Notice to Leave?',
    answer: 'Wait for the notice period to expire. If the tenant has not left, apply to the First-tier Tribunal Housing and Property Chamber for an eviction order.',
  },
];
