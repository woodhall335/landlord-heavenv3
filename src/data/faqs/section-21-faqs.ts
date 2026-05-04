/**
 * Section 21 Related FAQ Data
 *
 * FAQs for Section 21 notice, Form 6A, no-fault eviction, and UK eviction notice pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const section21NoticeTemplateFAQs: FAQItem[] = [
  {
    question: 'How much notice do I need to give for a Section 21 eviction?',
    answer: 'For new England private-rented cases after 1 May 2026, landlords can no longer serve a new Section 21 notice. Current possession planning should use the prescribed Form 3A / Section 8 route where a statutory ground applies.',
  },
  {
    question: 'Can I serve a Section 21 notice by email?',
    answer: 'Only if your tenancy agreement specifically permits service by email AND you have prior written agreement from the tenant. Otherwise, serve by post or hand delivery.',
  },
  {
    question: 'What documents do I need before serving a Section 21 notice?',
    answer: 'You must have: (1) protected the deposit and served prescribed information, (2) provided a valid EPC, (3) provided a Gas Safety Certificate before occupation, and (4) served the How to Rent guide. Missing any of these makes your notice invalid.',
  },
  {
    question: 'How long is a Section 21 notice valid for?',
    answer: 'You must start court proceedings within 6 months of serving the notice. If you miss this deadline, the notice expires and you must serve a new one.',
  },
  {
    question: 'Can I use Section 21 if my tenant has rent arrears?',
    answer: 'For new England private-rented cases after 1 May 2026, use the current Section 8 / Form 3A route. Ground 8 now needs 3 months rent arrears if rent is monthly, or 13 weeks if rent is weekly or fortnightly, at both notice and hearing stage.',
  },
  {
    question: 'Is Section 21 being abolished?',
    answer: 'Yes. Section 21 ended for new England private-rented cases on 1 May 2026. Landlords now need to use the current possession grounds route and the prescribed Form 3A notice.',
  },
];

export const form6aFAQs: FAQItem[] = [
  {
    question: 'Where can I download Form 6A?',
    answer: 'Form 6A is the old Section 21 form. For new England private-rented cases after 1 May 2026, landlords should not start a new possession plan with Form 6A. Use the current Form 3A / Section 8 route where a ground applies.',
  },
  {
    question: 'Can I use Form 6A in Wales?',
    answer: 'No. Form 6A is only valid for properties in England. Wales uses different forms under the Renting Homes (Wales) Act 2016.',
  },
  {
    question: 'What happens if I use the wrong form?',
    answer: 'If you do not use Form 6A (or a form substantially to the same effect), your notice will be invalid and the court will reject your possession claim. You would need to serve a new notice.',
  },
  {
    question: 'What date do I put on Form 6A?',
    answer: 'Section 2 requires the date you are requiring possession. This must be at least 2 months after you serve the notice, and on or after the end of any fixed term.',
  },
  {
    question: 'Do I need to give a reason on Form 6A?',
    answer: 'Form 6A was the no-fault Section 21 notice. For current new England cases, landlords need a Section 8 ground and should use Form 3A instead.',
  },
  {
    question: 'What do I do after serving Form 6A?',
    answer: 'If a historic Form 6A was served before the reforms, take case-specific advice on transitional validity. For new England private-rented cases after 1 May 2026, use the current Form 3A / Section 8 process and keep proof of service.',
  },
];

export const noFaultEvictionFAQs: FAQItem[] = [
  {
    question: 'What is a no-fault eviction?',
    answer: 'A no-fault eviction was the old Section 21 route that allowed possession without proving tenant fault. For new England private-rented cases after 1 May 2026, that route is no longer live and landlords must rely on statutory possession grounds.',
  },
  {
    question: 'Why would a landlord use no-fault eviction?',
    answer: 'Landlords previously used Section 21 for sale, moving back in, renovation, or simply ending the tenancy. Current England rules now require landlords to rely on the updated possession grounds where those facts apply.',
  },
  {
    question: 'How long does a no-fault eviction take?',
    answer: 'For new England private-rented cases, no-fault eviction is no longer the live route. Timelines now depend on the Section 8 ground, notice period, court listing times, and whether enforcement is needed.',
  },
  {
    question: 'Is no-fault eviction being banned?',
    answer: 'Yes. Section 21 no-fault eviction ended for new England private-rented cases on 1 May 2026. Scotland and Wales already operate different systems with their own notices and grounds.',
  },
  {
    question: 'Can a tenant fight a no-fault eviction?',
    answer: 'For current new England cases, the landlord must prove a statutory ground through the Section 8 route. Tenants can respond to the ground, the evidence, the notice dates, and the service method.',
  },
  {
    question: 'Do I need a reason for no-fault eviction?',
    answer: 'For new England private-rented cases after 1 May 2026, landlords do need a statutory possession ground. The old no-fault Section 21 route is no longer the live new-case route.',
  },
];

export const evictionNoticeUKFAQs: FAQItem[] = [
  {
    question: 'What types of eviction notice are there in the UK?',
    answer: 'England now uses the current Section 8 / Form 3A possession route for new private-rented cases. Wales uses RHW notices under the Renting Homes Act. Scotland uses Notice to Leave. Northern Ireland uses Notice to Quit. Each region has different rules and forms.',
  },
  {
    question: 'Which eviction notice should I use?',
    answer: 'It depends on your region and situation. In England after 1 May 2026, use the current Section 8 / Form 3A route where a statutory ground applies. In Wales, Scotland, or Northern Ireland, use the region-specific notice system.',
  },
  {
    question: 'How much notice do I need to give in each UK region?',
    answer: 'England Section 8 notice periods now depend on the ground, for example 4 weeks for Grounds 8, 10, and 11, and immediate court application for Ground 14 subject to the 14-day order restriction. Wales, Scotland, and Northern Ireland have separate notice systems and time limits.',
  },
  {
    question: 'Can I use an English eviction notice in Scotland?',
    answer: 'No. Section 21 and Section 8 only apply in England. Scotland has its own system under Private Residential Tenancy with 18 eviction grounds and the Notice to Leave form.',
  },
  {
    question: 'What is the fastest way to evict a tenant UK?',
    answer: 'In England, speed depends on the ground, evidence, and court listing times. Ground 14 can allow an immediate court application after notice, while Ground 8 now requires the 3-month or 13-week arrears threshold and 4 weeks notice.',
  },
  {
    question: 'Is a verbal eviction notice valid?',
    answer: 'No. All eviction notices in the UK must be in writing and, in most cases, on a prescribed form. A verbal notice has no legal effect.',
  },
];

export const evictionNoticeTemplateFAQs: FAQItem[] = [
  {
    question: 'What is the difference between Section 21 and Section 8 notices?',
    answer: 'Section 21 was the old no-fault route. For new England private-rented cases after 1 May 2026, landlords use the current Section 8 / Form 3A route and must prove grounds such as arrears, breach, sale, occupation, or antisocial behaviour.',
  },
  {
    question: 'Do I need a solicitor to serve an eviction notice?',
    answer: 'No, landlords can serve notices themselves. However, the notice must be on the correct prescribed form, and for current England private-rented cases that usually means Form 3A for Section 8. Mistakes in grounds, dates, or service can undermine the claim.',
  },
  {
    question: 'How do I serve an eviction notice?',
    answer: 'You can serve by: (1) hand delivery to the tenant, (2) leaving at the property in a prominent place, (3) first class post (allow 2 working days for deemed service), or (4) email only if the tenancy agreement permits it.',
  },
  {
    question: 'What makes an eviction notice invalid?',
    answer: 'Common reasons include: wrong form used, insufficient notice period, notice served before completing compliance (deposit protection, EPC, Gas Cert, How to Rent), mathematical errors in arrears calculations, or incorrect property address.',
  },
  {
    question: 'Can I withdraw an eviction notice?',
    answer: 'Yes, you can choose not to proceed with court action. However, if you want to evict later, you may need to serve a fresh notice. Written confirmation of withdrawal is advisable.',
  },
  {
    question: 'Which eviction notice do I need in Scotland or Wales?',
    answer: 'Scotland uses Notice to Leave under the Private Residential Tenancy system. Wales uses notices under the Renting Homes (Wales) Act 2016, such as forms RHW16 or RHW17. Section 21 and Section 8 only apply in England.',
  },
];
