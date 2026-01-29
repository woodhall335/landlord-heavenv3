/**
 * Money Claim FAQ Data
 *
 * FAQs for MCOL, unpaid rent claims, pre-action protocol, schedule of debt, and cleaning costs pages
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

export const moneyClaimUnpaidRentFAQs: FAQItem[] = [
  {
    question: 'How do I make a money claim for unpaid rent?',
    answer: 'First, send a Letter Before Claim and wait 30 days (pre-action protocol). If unpaid, submit your claim through Money Claim Online (MCOL) for claims up to £100,000. You need evidence of the tenancy, rent due, and payments received.',
  },
  {
    question: 'How long do I have to claim unpaid rent?',
    answer: 'You have 6 years from when the rent was due to make a claim. After 6 years, the debt becomes statute-barred and unenforceable through the courts.',
  },
  {
    question: 'Can I claim interest on unpaid rent?',
    answer: 'Yes, you can claim statutory interest at 8% per year from when each payment was due. Calculate interest for each missed payment separately and include it in your claim.',
  },
  {
    question: 'What if the tenant defends the money claim?',
    answer: 'The court will list a hearing (usually small claims track for under £10,000). Bring all evidence: tenancy agreement, rent statements, communication records, and the letter before action. Many tenants do not attend, resulting in judgment in your favour.',
  },
  {
    question: 'How do I enforce a CCJ for rent arrears?',
    answer: 'Options include: attachment of earnings (deducted from wages), warrant of control (bailiffs seize goods), third party debt order (freeze bank accounts), or charging order (secure debt against property). Choice depends on tenant circumstances.',
  },
  {
    question: 'Can I claim rent and evict at the same time?',
    answer: 'Yes, but not in the same court form. The accelerated possession procedure (N5B) is for possession only. File a separate money claim for arrears. You can pursue both simultaneously.',
  },
];

export const mcolFAQs: FAQItem[] = [
  {
    question: 'What is MCOL?',
    answer: 'MCOL (Money Claim Online) is the UK government online service for making money claims up to £100,000. It is faster and cheaper than paper claims, with lower court fees.',
  },
  {
    question: 'How much does MCOL cost?',
    answer: 'Court fees depend on claim value: £35 for claims up to £300, £50 for £300-500, £70 for £500-1000, £105 for £1000-1500, then 4.5% of the claim value up to £10,000, and 5% above that.',
  },
  {
    question: 'How long does MCOL take?',
    answer: 'If undefended, judgment can be obtained in 14-19 days. If the defendant defends, a hearing will be listed, typically 2-4 months later. Total time to enforcement varies depending on the defendant response.',
  },
  {
    question: 'What do I need to use MCOL?',
    answer: 'You need: an email address, debit/credit card for fees, defendant name and address, details of the debt, and evidence you have followed the pre-action protocol.',
  },
  {
    question: 'Can I claim more than £100,000 on MCOL?',
    answer: 'No. For claims over £100,000, you must use paper form N1 and submit to the County Court. MCOL is limited to £100,000.',
  },
  {
    question: 'What happens if the defendant ignores MCOL?',
    answer: 'If they do not respond within 14 days (or 28 days if they acknowledge), you can request default judgment. This gives you a CCJ which you can then enforce.',
  },
];

export const preActionProtocolFAQs: FAQItem[] = [
  {
    question: 'What is the pre-action protocol for debt claims?',
    answer: 'The pre-action protocol sets out steps creditors must take before issuing court proceedings. It aims to encourage settlement without court action, including sending a Letter Before Claim and allowing time to respond.',
  },
  {
    question: 'What must a Letter Before Claim include?',
    answer: 'It must state: the amount owed, how the debt arose, details of any interest claimed, how to pay, the deadline to respond (30 days), and that court action may follow if not paid.',
  },
  {
    question: 'How long must I wait after sending a Letter Before Claim?',
    answer: 'You must wait at least 30 days from when the debtor receives the letter before starting court proceedings. This gives them time to respond, dispute the debt, or propose a payment plan.',
  },
  {
    question: 'What happens if I do not follow the pre-action protocol?',
    answer: 'The court may penalise you on costs, even if you win. You might be ordered to pay the defendant costs or have your costs reduced. Following the protocol also makes your case stronger.',
  },
  {
    question: 'Do I need to follow pre-action protocol for small claims?',
    answer: 'Yes, the protocol applies to all debt claims. However, non-compliance is less likely to result in severe cost penalties in small claims (under £10,000) compared to higher value claims.',
  },
  {
    question: 'What if the debtor responds to my Letter Before Claim?',
    answer: 'If they dispute the debt, consider their response before proceeding. If they propose a payment plan, consider if it is reasonable. If they ignore it or refuse to pay, proceed to court after 30 days.',
  },
];

export const scheduleOfDebtFAQs: FAQItem[] = [
  {
    question: 'What is a schedule of debt?',
    answer: 'A schedule of debt is a document listing each payment owed, when it was due, any payments received, and the running balance. It shows the court exactly how the debt built up.',
  },
  {
    question: 'Do I need a schedule of debt for my money claim?',
    answer: 'Yes, it is strongly recommended. For rent arrears claims, the court expects a clear breakdown showing each missed payment, the date it was due, and how you calculated the total.',
  },
  {
    question: 'How do I calculate interest on the schedule?',
    answer: 'You can claim statutory interest at 8% per year from when each payment was due. Calculate daily interest (8% ÷ 365 × amount) and multiply by days overdue for each debt item.',
  },
  {
    question: 'Should I include the schedule with my N1 form?',
    answer: 'Yes, attach it to your particulars of claim. Label it clearly and reference it in your claim narrative. It makes your claim clearer and more professional.',
  },
  {
    question: 'Can I use a spreadsheet as a schedule of debt?',
    answer: 'Yes, a spreadsheet works well. Include columns for: date due, description, amount owed, payments received, balance, interest, and total. Print it clearly for the court.',
  },
];

export const cleaningCostsFAQs: FAQItem[] = [
  {
    question: 'Can I charge my tenant for cleaning?',
    answer: 'Only if the property is returned significantly dirtier than at check-in, beyond normal use. You need evidence: check-in inventory, check-out photos, and professional cleaning quotes or receipts.',
  },
  {
    question: 'What is a reasonable cleaning deduction?',
    answer: 'You can only deduct the cost to restore the property to its condition at check-in, minus fair wear and tear. A full deep clean is rarely justified unless the property was left excessively dirty.',
  },
  {
    question: 'Can I deduct cleaning from the deposit?',
    answer: 'Yes, but the tenant can dispute it through the deposit scheme. You need evidence: dated inventory with photos at check-in and check-out, showing the difference in cleanliness.',
  },
  {
    question: 'What if cleaning costs exceed the deposit?',
    answer: 'You can pursue the excess through a money claim. Send a Letter Before Claim with evidence, wait 30 days, then file through MCOL. Cleaning claims alone rarely exceed deposits.',
  },
  {
    question: 'Do I need professional cleaning receipts?',
    answer: 'Receipts strengthen your claim but are not essential. Quotes from professional cleaners can establish reasonable costs. Keep all documentation as evidence.',
  },
];
