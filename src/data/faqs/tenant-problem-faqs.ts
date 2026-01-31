/**
 * Tenant Problem FAQ Data
 *
 * FAQs for tenant not paying rent, tenant won't leave, how to evict, and property damage pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const tenantNotPayingRentFAQs: FAQItem[] = [
  {
    question: 'What should I do first when my tenant stops paying rent?',
    answer: 'Contact the tenant immediately to understand their situation. Document everything in writing. If they cannot pay, discuss a payment plan. Keep records of all communication as evidence for potential court proceedings.',
  },
  {
    question: 'How long should I wait before starting eviction?',
    answer: 'There is no legal minimum, but practically you should allow time for the tenant to respond. Most landlords wait 14-28 days of non-payment before serving notice, while continuing to communicate.',
  },
  {
    question: 'Can I evict a tenant for 1 month unpaid rent?',
    answer: 'You can serve a Section 8 notice under Ground 10 or 11 (some rent lawfully due and unpaid), but these are discretionary. For mandatory Ground 8, you need 2 months arrears at service AND hearing.',
  },
  {
    question: 'Should I use Section 8 or Section 21 for rent arrears?',
    answer: 'Use both if possible. Section 8 Ground 8 gives mandatory possession if arrears stay above 2 months. Section 21 is a backup if the tenant pays down arrears before the hearing.',
  },
  {
    question: 'Can I change the locks if my tenant does not pay rent?',
    answer: 'No, this is illegal. Even if the tenant owes months of rent, you must obtain a court order and use bailiffs to evict. Changing locks without a court order is a criminal offence.',
  },
  {
    question: 'Can I recover rent arrears after the tenant leaves?',
    answer: 'Yes. You can pursue a money claim through MCOL (Money Claim Online) for up to 6 years after the debt arose. You need evidence of the debt and must follow the pre-action protocol.',
  },
];

export const tenantWontLeaveFAQs: FAQItem[] = [
  {
    question: 'What can I do if my tenant refuses to leave after the notice expires?',
    answer: 'You must apply to the court for a possession order. Complete Form N5B (Section 21 accelerated) or Form N5 (Section 8/standard). The court will issue an order requiring the tenant to leave by a specific date.',
  },
  {
    question: 'Can I change the locks if my tenant will not leave?',
    answer: 'No. Changing locks, removing belongings, or cutting off utilities is illegal eviction, a criminal offence under the Protection from Eviction Act 1977. You could face prosecution and a fine or imprisonment.',
  },
  {
    question: 'How long does it take to evict a tenant who refuses to leave?',
    answer: 'After the notice period, expect 2-4 months for court proceedings, plus 4-6 weeks for bailiff enforcement if needed. Total time from notice to eviction is typically 4-8 months.',
  },
  {
    question: 'What if the tenant ignores the court possession order?',
    answer: 'Apply for a warrant of possession using Form N325. County court bailiffs will then attend the property and physically remove the tenant. This typically takes 4-8 weeks after the order date passes.',
  },
  {
    question: 'Can I get compensation if my tenant refuses to leave?',
    answer: 'You can claim mesne profits (compensation for occupation after notice expires) through a separate money claim. This covers the period between when they should have left and when they actually vacate.',
  },
];

export const howToEvictTenantFAQs: FAQItem[] = [
  {
    question: 'How do I legally evict a tenant in the UK?',
    answer: 'You must: (1) serve the correct notice (Section 21 or Section 8 in England), (2) wait for the notice period to expire, (3) apply to court for a possession order, (4) if tenant does not leave, apply for a warrant of possession, (5) bailiffs execute the eviction. You cannot evict without a court order.',
  },
  {
    question: 'How long does the eviction process take UK?',
    answer: 'Typically 4-8 months from serving notice to bailiff eviction. Section 21 accelerated procedure (no hearing) can be faster if undefended. Court delays vary significantly by region.',
  },
  {
    question: 'How much does it cost to evict a tenant UK?',
    answer: 'Court fees are approximately £355 for accelerated possession (Section 21) or £355 for standard possession. Bailiff fees are around £130. Solicitor costs, if used, range from £500-3000 depending on complexity.',
  },
  {
    question: 'Can I evict a tenant without going to court?',
    answer: 'No. In England and Wales, you must obtain a court order to evict a tenant legally. The only exception is if the tenant voluntarily surrenders the tenancy. Evicting without a court order (illegal eviction) is a criminal offence.',
  },
  {
    question: 'What if my tenant refuses to leave after the notice expires?',
    answer: 'Apply to the court for a possession order. If they still do not leave after the order date, apply for a warrant of possession. County court bailiffs will then physically evict the tenant.',
  },
  {
    question: 'Can I evict a tenant in winter UK?',
    answer: 'Yes, there is no legal restriction on evicting tenants during winter months in England and Wales. Courts operate year-round. However, judges may consider vulnerability when setting possession dates.',
  },
];

export const tenantDamagingPropertyFAQs: FAQItem[] = [
  {
    question: 'What counts as tenant damage vs fair wear and tear?',
    answer: 'Fair wear and tear is gradual deterioration from normal use (faded paint, worn carpets). Tenant damage is beyond normal use: holes in walls, burns, stains, broken fixtures, or damage from negligence.',
  },
  {
    question: 'Can I deduct damage costs from the deposit?',
    answer: 'Yes, but only for genuine damage beyond fair wear and tear, with evidence (photos, inventory, quotes). The tenant can dispute deductions through the deposit scheme dispute resolution service.',
  },
  {
    question: 'What if damage costs exceed the deposit?',
    answer: 'You can pursue the tenant for the excess through a money claim. Send a Letter Before Claim, wait 30 days, then file a claim through Money Claim Online (MCOL) with evidence of the damage and costs.',
  },
  {
    question: 'Can I evict a tenant for damaging the property?',
    answer: 'Yes. Use Section 8 Ground 13 (waste or neglect causing deterioration) or Ground 12 (breach of tenancy obligation). These are discretionary grounds, so the court decides if possession is reasonable.',
  },
  {
    question: 'Should I document property condition before the tenancy?',
    answer: 'Absolutely. A detailed inventory with dated photos at check-in and check-out is essential evidence for deposit disputes and damage claims. Without it, proving tenant damage is very difficult.',
  },
  {
    question: 'Can I claim for professional cleaning as damage?',
    answer: 'Only if the property is returned significantly dirtier than at the start. Normal cleaning between tenancies is the landlord cost. Deductions for cleaning must be reasonable and evidenced.',
  },
];
