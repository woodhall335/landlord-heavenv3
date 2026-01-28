/**
 * Court Form FAQ Data
 *
 * FAQs for N5B form guide and EICR landlord requirements pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const n5bFormFAQs: FAQItem[] = [
  {
    question: 'What is Form N5B?',
    answer: 'Form N5B is the court claim form for accelerated possession under Section 21. It allows you to obtain a possession order without a court hearing if the tenant does not defend the claim.',
  },
  {
    question: 'When can I use Form N5B?',
    answer: 'You can use N5B when: you have served a valid Section 21 notice (Form 6A), the notice period has expired, the tenancy is an assured shorthold tenancy, and you are only claiming possession (not rent arrears).',
  },
  {
    question: 'What documents do I need to submit with N5B?',
    answer: 'Attach: (A) tenancy agreement, (B) Section 21 notice with proof of service, (E) deposit protection certificate, (F) EPC, (G) gas safety certificate, and (H) How to Rent guide. Label each document with the corresponding letter.',
  },
  {
    question: 'How much does it cost to file Form N5B?',
    answer: 'The court fee for N5B accelerated possession is currently £355. You can pay online when filing, or by cheque if posting. Check the HMCTS website for current fees as they change periodically.',
  },
  {
    question: 'How long does N5B take to get a possession order?',
    answer: 'If undefended, typically 6-10 weeks from filing to receiving the order. If the tenant defends or requests postponement, a hearing will be listed, adding 4-8 weeks.',
  },
  {
    question: 'Can I claim rent arrears on Form N5B?',
    answer: 'No. Form N5B is for possession only. To recover rent arrears, you must file a separate money claim using Form N1 or Money Claim Online (MCOL).',
  },
];

export const eicrFAQs: FAQItem[] = [
  {
    question: 'What is an EICR?',
    answer: 'An EICR (Electrical Installation Condition Report) is a report by a qualified electrician assessing the safety of fixed electrical installations in a property: wiring, sockets, consumer unit, and fixed equipment.',
  },
  {
    question: 'Do landlords legally need an EICR?',
    answer: 'Yes, in England since 2020. Landlords must have an EICR before a new tenancy starts and at least every 5 years during a tenancy. Scotland has similar requirements. Wales requirements vary.',
  },
  {
    question: 'What happens if I do not have an EICR?',
    answer: 'Local authorities can impose fines up to £30,000 for non-compliance. Additionally, without a valid EICR, you may not be able to serve a valid Section 21 notice in England.',
  },
  {
    question: 'Do I need to give the EICR to my tenant?',
    answer: 'Yes. You must provide a copy of the EICR to existing tenants within 28 days of the inspection, and to new tenants before they move in. Keep proof you provided it.',
  },
  {
    question: 'What if my EICR shows faults?',
    answer: 'You must complete remedial work for any C1 (danger present) or C2 (potentially dangerous) codes within 28 days, or as specified. Then obtain written confirmation from a qualified electrician that the work is complete.',
  },
  {
    question: 'Who can carry out an EICR?',
    answer: 'A qualified and competent electrician, ideally registered with a government-approved scheme such as NICEIC, NAPIT, or ELECSA. Always verify their credentials before booking.',
  },
];
