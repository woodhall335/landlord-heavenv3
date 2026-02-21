/**
 * Northern Ireland FAQ Data
 *
 * FAQs for Northern Ireland eviction and tenancy pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const northernIrelandFAQs: FAQItem[] = [
  {
    question: 'How do I evict a tenant in Northern Ireland?',
    answer: 'Serve a Notice to Quit with the correct notice period (4-12 weeks depending on tenancy length). If the tenant does not leave, apply to the county court for a possession order.',
  },
  {
    question: 'What is the notice period in Northern Ireland?',
    answer: 'It depends on how long the tenant has lived there: 4 weeks for under 5 years, 8 weeks for 5-10 years, and 12 weeks for over 10 years. Always check the Private Tenancies Order.',
  },
  {
    question: 'Is Section 21 available in Northern Ireland?',
    answer: 'No. Section 21 only applies in England. Northern Ireland uses Notice to Quit under the Private Tenancies Act (Northern Ireland) 2022.',
  },
  {
    question: 'Do I need to protect deposits in Northern Ireland?',
    answer: 'Yes. Since 2013, landlords must protect deposits in an approved scheme (NIDIRECT Tenancy Deposit Scheme) and provide prescribed information within 28 days.',
  },
  {
    question: 'Do I need to register as a landlord in Northern Ireland?',
    answer: 'Yes. Private landlords must register with the Northern Ireland Landlord Registration Scheme. It is a legal requirement and failure to register is an offence.',
  },
  {
    question: 'How long does eviction take in Northern Ireland?',
    answer: 'Typically 3-6 months from serving Notice to Quit. Court processing times vary. If the tenant does not leave after a possession order, you need to apply for enforcement.',
  },
];
