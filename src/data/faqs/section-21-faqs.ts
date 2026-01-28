/**
 * Section 21 Related FAQ Data
 *
 * FAQs for Section 21 notice, Form 6A, no-fault eviction, and UK eviction notice pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const section21NoticeTemplateFAQs: FAQItem[] = [
  {
    question: 'How much notice do I need to give for a Section 21 eviction?',
    answer: 'You must give at least 2 months notice. The notice cannot expire before the end of any fixed term, and for periodic tenancies, the expiry date should align with the last day of a rental period.',
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
    answer: 'Yes, Section 21 is a no-fault notice so you can use it regardless of whether the tenant owes rent. However, Section 8 may be faster if they owe 2+ months rent.',
  },
  {
    question: 'Is Section 21 being abolished?',
    answer: 'The Renters Reform Bill proposes to abolish Section 21 in England. As of January 2026, Section 21 remains available, but landlords should prepare for changes. Check our Section 21 abolition guide for updates.',
  },
];

export const form6aFAQs: FAQItem[] = [
  {
    question: 'Where can I download Form 6A?',
    answer: 'You can download the blank Form 6A from gov.uk, or use our free generator to create a pre-filled form with your details already completed and validated.',
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
    answer: 'No. Form 6A is for no-fault possession under Section 21. You do not need to state any reason for wanting possession.',
  },
  {
    question: 'What do I do after serving Form 6A?',
    answer: 'Keep proof of service (posting receipt, witness statement, or photos). Wait for the notice period to expire. If the tenant has not left, apply to court using Form N5B for accelerated possession.',
  },
];

export const noFaultEvictionFAQs: FAQItem[] = [
  {
    question: 'What is a no-fault eviction?',
    answer: 'A no-fault eviction allows landlords to regain possession without proving the tenant did anything wrong. In England, this is done using Section 21 of the Housing Act 1988.',
  },
  {
    question: 'Why would a landlord use no-fault eviction?',
    answer: 'Common reasons include: selling the property, moving back in, major renovations, or simply ending the tenancy. You do not need to explain your reason to the tenant or court.',
  },
  {
    question: 'How long does a no-fault eviction take?',
    answer: 'Typically 4-6 months: 2 months notice period, then 6-10 weeks for court proceedings (if undefended), plus 4-6 weeks for bailiff enforcement if the tenant does not leave voluntarily.',
  },
  {
    question: 'Is no-fault eviction being banned?',
    answer: 'The Renters Reform Bill proposes to abolish no-fault eviction (Section 21) in England. The timeline remains uncertain. Scotland abolished no-fault eviction in 2017, and Wales extended notice periods significantly.',
  },
  {
    question: 'Can a tenant fight a no-fault eviction?',
    answer: 'Tenants can challenge the validity of the notice (wrong form, insufficient notice, non-compliance with requirements) but cannot dispute the landlord decision to end the tenancy itself.',
  },
  {
    question: 'Do I need a reason for no-fault eviction?',
    answer: 'No. That is why it is called "no-fault" — you do not need to prove any breach or give any reason. However, you must have complied with all legal requirements (deposit protection, gas safety, etc.).',
  },
];

export const evictionNoticeUKFAQs: FAQItem[] = [
  {
    question: 'What types of eviction notice are there in the UK?',
    answer: 'England uses Section 21 (no-fault) and Section 8 (fault-based). Wales uses RHW notices under the Renting Homes Act. Scotland uses Notice to Leave. Northern Ireland uses Notice to Quit. Each region has different rules and forms.',
  },
  {
    question: 'Which eviction notice should I use?',
    answer: 'It depends on your region and situation. In England, use Section 21 for no-fault evictions or Section 8 if the tenant has breached the tenancy. In Wales, Scotland, or NI, you must use region-specific notices.',
  },
  {
    question: 'How much notice do I need to give in each UK region?',
    answer: 'England Section 21: 2 months. England Section 8: 2 weeks to 2 months. Wales: 6 months (no-fault). Scotland: 28-84 days depending on ground. Northern Ireland: 4-12 weeks depending on tenancy length.',
  },
  {
    question: 'Can I use an English eviction notice in Scotland?',
    answer: 'No. Section 21 and Section 8 only apply in England. Scotland has its own system under Private Residential Tenancy with 18 eviction grounds and the Notice to Leave form.',
  },
  {
    question: 'What is the fastest way to evict a tenant UK?',
    answer: 'In England, Section 8 Ground 8 (2+ months rent arrears) with standard procedure, or Section 21 accelerated procedure (no hearing). In serious cases like antisocial behaviour, immediate notice may be possible.',
  },
  {
    question: 'Is a verbal eviction notice valid?',
    answer: 'No. All eviction notices in the UK must be in writing and, in most cases, on a prescribed form. A verbal notice has no legal effect.',
  },
];

export const evictionNoticeTemplateFAQs: FAQItem[] = [
  {
    question: 'What is the difference between Section 21 and Section 8 notices?',
    answer: 'Section 21 is a no-fault notice requiring 2 months notice with no reason needed. Section 8 requires you to prove grounds such as rent arrears or breach of tenancy, with notice periods varying from immediate to 2 months depending on the ground.',
  },
  {
    question: 'Do I need a solicitor to serve an eviction notice?',
    answer: 'No, landlords can serve notices themselves. However, the notice must be on the correct prescribed form (Form 6A for Section 21, Form 3 for Section 8) and served correctly. Mistakes invalidate the notice.',
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
