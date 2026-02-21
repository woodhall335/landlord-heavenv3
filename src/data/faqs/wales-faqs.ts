/**
 * Wales FAQ Data
 *
 * FAQs for Wales eviction notice pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const walesEvictionFAQs: FAQItem[] = [
  {
    question: 'How do I evict a tenant in Wales?',
    answer: 'Under the Renting Homes (Wales) Act 2016, serve a landlord notice (RHW16, RHW17, or RHW23 depending on grounds). After the notice period, apply to the court for a possession order.',
  },
  {
    question: 'Can I use Section 21 in Wales?',
    answer: 'No. Section 21 does not apply in Wales. The Renting Homes (Wales) Act 2016 replaced the Housing Act 1988 for Welsh tenancies. Use the appropriate RHW notice form instead.',
  },
  {
    question: 'What is the notice period for no-fault eviction in Wales?',
    answer: 'Six months minimum using form RHW16, and only after the first 6 months of the occupation contract. This is significantly longer than the 2 months for Section 21 in England.',
  },
  {
    question: 'What is a standard occupation contract?',
    answer: 'The Welsh equivalent of an assured shorthold tenancy. It is created when you let a property to a tenant in Wales and sets out the rights and responsibilities of both parties.',
  },
  {
    question: 'Do I need to register as a landlord in Wales?',
    answer: 'Yes. All private landlords in Wales must register with Rent Smart Wales. You or your agent must also be licensed to carry out letting and management activities.',
  },
  {
    question: 'How long does eviction take in Wales?',
    answer: 'Typically 8-12 months from serving notice due to the longer notice periods. Court processing times are similar to England. The 6-month no-fault notice significantly extends timelines.',
  },
];
