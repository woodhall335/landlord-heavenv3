/**
 * Tenancy Agreement FAQ Data
 *
 * FAQs for tenancy agreement, lodger agreement, rolling tenancy, and How to Rent guide pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const tenancyAgreementTemplateFAQs: FAQItem[] = [
  {
    question: 'Do I legally need a written tenancy agreement?',
    answer: 'No, a tenancy can be verbal. However, a written agreement protects both parties and is essential for deposit protection compliance. Without a written agreement, default statutory terms apply.',
  },
  {
    question: 'What should be included in a tenancy agreement?',
    answer: 'Essential terms include: names of landlord and tenant, property address, rent amount and payment date, deposit amount, tenancy start date and duration, and responsibilities for repairs and bills.',
  },
  {
    question: 'What is the difference between a fixed term and periodic tenancy?',
    answer: 'A fixed term runs for a set period (e.g., 12 months) and cannot normally be ended early by either party. A periodic tenancy rolls on a weekly or monthly basis until ended by notice.',
  },
  {
    question: 'Can I use the same tenancy agreement for Scotland or Wales?',
    answer: 'No. Scotland uses Private Residential Tenancy agreements. Wales uses Occupation Contracts under the Renting Homes Act. An English AST template is not valid in these regions.',
  },
  {
    question: 'Can I add my own clauses to a tenancy agreement?',
    answer: 'Yes, but unfair terms are not enforceable under consumer protection law. Clauses must be reasonable and clearly explained. Banning pets entirely, for example, may be considered unfair.',
  },
  {
    question: 'Does the tenant need to sign the tenancy agreement?',
    answer: 'For best practice, yes. Both landlord and tenant should sign and date the agreement, with each party keeping a copy. An unsigned agreement can still be valid but is harder to enforce.',
  },
];

export const lodgerAgreementFAQs: FAQItem[] = [
  {
    question: 'What is the difference between a lodger and a tenant?',
    answer: 'A lodger lives in the same property as the landlord and shares living space (kitchen, bathroom). A tenant has exclusive possession of a self-contained property. Lodgers have fewer legal protections than tenants.',
  },
  {
    question: 'Do I need a tenancy agreement for a lodger?',
    answer: 'You need a lodger agreement, not a tenancy agreement. Lodgers are not covered by the Housing Act 1988, so an AST is not appropriate. A lodger agreement sets out the terms of their licence to occupy.',
  },
  {
    question: 'How much notice do I need to give a lodger?',
    answer: 'There is no statutory minimum notice period for lodgers. Reasonable notice is typically the rental payment period (e.g., one week for weekly rent, one month for monthly rent). Your agreement should specify this.',
  },
  {
    question: 'Do I need to protect a lodger deposit?',
    answer: 'No. The tenancy deposit protection rules only apply to assured shorthold tenancies. Lodger deposits do not need to be placed in a government-approved scheme.',
  },
  {
    question: 'Can I evict a lodger without going to court?',
    answer: 'Yes. Because lodgers have a licence rather than a tenancy, you can ask them to leave with reasonable notice. If they refuse, you can change the locks after the notice period. However, you cannot use force.',
  },
  {
    question: 'Do I pay tax on lodger income?',
    answer: 'You may qualify for the Rent a Room scheme, which allows you to earn up to £7,500 per year tax-free from letting a furnished room in your home. Above this threshold, the income is taxable.',
  },
];

export const rollingTenancyFAQs: FAQItem[] = [
  {
    question: 'What is a rolling tenancy?',
    answer: 'A rolling tenancy (also called periodic tenancy) continues on a repeating basis (usually monthly) with no fixed end date. It typically arises automatically when a fixed-term tenancy ends and the tenant stays.',
  },
  {
    question: 'How do I end a rolling tenancy as a landlord?',
    answer: 'Serve a Section 21 notice giving at least 2 months notice, or a Section 8 notice if there are grounds. The Section 21 notice must expire on the last day of a rental period.',
  },
  {
    question: 'How much notice must a tenant give on a rolling tenancy?',
    answer: 'Tenants must give at least one month notice, ending on the last day of a rental period. For example, if rent is due on the 1st, notice given on 15 January would end the tenancy on 28 February.',
  },
  {
    question: 'Do I need a new tenancy agreement for a rolling tenancy?',
    answer: 'No. The original tenancy agreement continues to apply with the same terms. The only change is that it now rolls periodically instead of being fixed term.',
  },
  {
    question: 'Can I increase rent during a rolling tenancy?',
    answer: 'Yes, but you must follow the correct procedure. Use a Section 13 notice giving at least one month notice (or one rental period if longer). The tenant can refer the increase to a tribunal if they dispute it.',
  },
  {
    question: 'Is a rolling tenancy the same as a statutory periodic tenancy?',
    answer: 'A statutory periodic tenancy arises automatically by law when a fixed term ends. A contractual periodic tenancy is created by a clause in the original agreement. Both function similarly as rolling tenancies.',
  },
];

export const howToRentGuideFAQs: FAQItem[] = [
  {
    question: 'What is the How to Rent guide?',
    answer: 'The How to Rent guide is a government document that landlords in England must provide to tenants at the start of an assured shorthold tenancy. It explains tenant rights and landlord responsibilities.',
  },
  {
    question: 'Do I have to give the How to Rent guide to my tenant?',
    answer: 'Yes, if your property is in England and let on an AST. Failure to provide the current version before the tenancy starts (or at renewal) means you cannot serve a valid Section 21 notice.',
  },
  {
    question: 'Where do I get the How to Rent guide?',
    answer: 'Download the current version free from gov.uk. Search for "How to rent" or visit gov.uk/government/publications/how-to-rent. Always use the version current at the tenancy start date.',
  },
  {
    question: 'Can I email the How to Rent guide?',
    answer: 'Yes, but only if the tenant has agreed to receive documents by email. Keep evidence of the agreement and proof of sending (sent email with attachment). Alternatively, provide a hard copy.',
  },
  {
    question: 'Do I need to provide the How to Rent guide in Wales or Scotland?',
    answer: 'No. The How to Rent guide only applies in England. Wales and Scotland have different tenant information requirements under their respective housing laws.',
  },
  {
    question: 'What happens if I gave the wrong version of How to Rent?',
    answer: 'If you provided an outdated version, your Section 21 notice may be invalid. Provide the correct version and serve a new Section 21 notice. The notice period restarts from the new service date.',
  },
];
