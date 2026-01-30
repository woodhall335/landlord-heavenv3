/**
 * Eviction Process FAQ Data
 *
 * FAQs for eviction process pages (England, Scotland, Wales),
 * Section 21 expired, Section 8 rent arrears, possession orders,
 * and Section 8 vs Section 21 comparison.
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

// =============================================================================
// Page 1: Eviction Process England
// =============================================================================

export const evictionProcessEnglandFAQs: FAQItem[] = [
  {
    question: 'How long does the eviction process take in England?',
    answer:
      'The eviction process in England typically takes 4-8 months from serving notice to bailiff enforcement. Section 21 accelerated procedure (no hearing) can be faster at 3-5 months if undefended. Court delays vary significantly by region and time of year.',
  },
  {
    question: 'What is the difference between Section 21 and Section 8 eviction?',
    answer:
      'Section 21 is a no-fault eviction requiring 2 months notice with no reason needed. Section 8 requires specific grounds (like rent arrears or breach) with variable notice periods. Section 21 uses accelerated procedure (paper-based), while Section 8 requires a court hearing.',
  },
  {
    question: 'How much does it cost to evict a tenant in England?',
    answer:
      'Court fees are approximately £355 for possession claims. Bailiff fees for warrant of possession are around £130. If using a solicitor, expect £500-3000 depending on complexity. Our Complete Eviction Pack provides all documents you need for £199.99.',
  },
  {
    question: 'Can I evict a tenant without going to court in England?',
    answer:
      'No. In England, you must obtain a court order to legally evict a tenant. The only exception is if the tenant voluntarily surrenders the tenancy in writing. Evicting without a court order (illegal eviction) is a criminal offence under the Protection from Eviction Act 1977.',
  },
  {
    question: 'What happens if my tenant ignores the eviction notice?',
    answer:
      'If the tenant does not leave after the notice expires, you must apply to the court for a possession order. Once granted, if the tenant still refuses to leave, you apply for a warrant of possession and county court bailiffs will physically evict them.',
  },
  {
    question: 'What documents do I need before serving an eviction notice?',
    answer:
      'Before serving a Section 21 notice, you must have: deposit protected in a government scheme with prescribed information given, valid EPC, gas safety certificate, and How to Rent guide provided. Missing any of these can invalidate your notice.',
  },
  {
    question: 'Can I claim rent arrears at the same time as evicting?',
    answer:
      'Yes. You can claim rent arrears within possession proceedings or file a separate money claim. Many landlords evict first then pursue arrears via MCOL. You can also claim mesne profits for the period the tenant stayed after the notice expired.',
  },
  {
    question: 'Do I need a solicitor to evict a tenant in England?',
    answer:
      'No, you can represent yourself using the correct forms. Most straightforward Section 21 evictions are handled without solicitors using the accelerated procedure. However, contested Section 8 cases or complex situations may benefit from legal advice.',
  },
];

// =============================================================================
// Page 2: Section 21 Expired What Next
// =============================================================================

export const section21ExpiredFAQs: FAQItem[] = [
  {
    question: 'What should I do when my Section 21 notice expires?',
    answer:
      'If the tenant has not left after the notice expires, apply to the court for a possession order using Form N5B (accelerated procedure). You do not need to re-serve the notice. The notice remains valid for 6 months after expiry.',
  },
  {
    question: 'How long is a Section 21 notice valid after it expires?',
    answer:
      'A Section 21 notice remains valid for 6 months after the possession date specified. You must start court proceedings within this window. If 6 months pass, you will need to serve a new notice.',
  },
  {
    question: 'What is the accelerated possession procedure?',
    answer:
      'The accelerated possession procedure (Form N5B) is a paper-based court process for Section 21 evictions. No hearing is required if undefended. The judge reviews documents and issues a possession order, typically within 4-8 weeks.',
  },
  {
    question: 'Can the tenant defend a Section 21 possession claim?',
    answer:
      'Yes. Tenants can challenge on grounds like: notice was invalid, deposit not protected, required documents not provided, or property conditions. If defended, the court may schedule a hearing to consider the defence.',
  },
  {
    question: 'How long after court order must tenant leave?',
    answer:
      'Possession orders typically give 14 days for the tenant to leave, though judges can grant up to 42 days if the tenant requests more time. The tenant must vacate by this date or face bailiff enforcement.',
  },
  {
    question: 'What if the tenant still refuses to leave after the court order?',
    answer:
      'Apply for a warrant of possession using Form N325. County court bailiffs will then attend the property and physically remove the tenant and their belongings. This typically takes 4-8 weeks after application.',
  },
];

// =============================================================================
// Page 3: Section 8 Rent Arrears Eviction
// =============================================================================

export const section8RentArrearsFAQs: FAQItem[] = [
  {
    question: 'When can I use Section 8 for rent arrears eviction?',
    answer:
      'You can serve a Section 8 notice as soon as rent is overdue. For mandatory Ground 8, the tenant must owe at least 2 months rent when you serve the notice AND at the court hearing. Grounds 10 and 11 can be used for any amount of arrears.',
  },
  {
    question: 'What is the difference between Ground 8, 10, and 11?',
    answer:
      'Ground 8 is mandatory (court must grant possession) requiring 2 months arrears. Ground 10 is discretionary, for any amount of unpaid rent. Ground 11 is discretionary, for persistent late payment even if currently paid up. We recommend citing all three.',
  },
  {
    question: 'How long is the notice period for Section 8 rent arrears?',
    answer:
      'For rent arrears grounds (8, 10, 11), the notice period is 2 weeks. This is shorter than Section 21 (2 months). The notice is valid for 12 months, giving you time to start court proceedings.',
  },
  {
    question: 'What if the tenant pays the arrears before the hearing?',
    answer:
      'If the tenant pays down arrears to less than 2 months before the hearing, you lose mandatory Ground 8. However, you can still proceed with Grounds 10 and 11, though the court has discretion to refuse possession.',
  },
  {
    question: 'Can I evict for rent arrears during winter?',
    answer:
      'Yes, there is no legal restriction on evicting for rent arrears during winter months. Courts operate year-round. Judges may consider vulnerability when setting possession dates but cannot refuse possession on Ground 8.',
  },
  {
    question: 'Should I use Section 8 or Section 21 for rent arrears?',
    answer:
      'Consider using both. Section 8 Ground 8 gives mandatory possession if arrears stay above 2 months. Section 21 is a backup if the tenant pays down arrears. Section 8 has a shorter notice period (2 weeks vs 2 months).',
  },
];

// =============================================================================
// Page 4: Apply for Possession Order
// =============================================================================

export const possessionOrderFAQs: FAQItem[] = [
  {
    question: 'What forms do I need to apply for a possession order?',
    answer:
      'For Section 21, use Form N5B (accelerated procedure) plus N215 (certificate of service). For Section 8 or where accelerated procedure is unavailable, use Form N5 (possession claim) and N119 (particulars of claim).',
  },
  {
    question: 'How much does a possession order cost?',
    answer:
      'The court fee for both accelerated (N5B) and standard (N5) possession claims is currently £355. If you need a hearing, there are no additional court fees. Bailiff enforcement (warrant of possession) costs around £130.',
  },
  {
    question: 'What is the difference between accelerated and standard possession?',
    answer:
      'Accelerated possession (N5B) is paper-based with no hearing, only for Section 21. Standard possession (N5) requires a hearing, used for Section 8 or if you are also claiming rent arrears. Standard takes longer but allows money claims.',
  },
  {
    question: 'How long does it take to get a possession order?',
    answer:
      'Accelerated possession takes 4-8 weeks if undefended. Standard possession varies by court but typically 6-12 weeks to hearing, then 14-42 days for the tenant to leave. Add 4-8 weeks for bailiffs if needed.',
  },
  {
    question: 'What happens at a possession hearing?',
    answer:
      'The judge reviews your evidence, hears from both parties, and decides whether to grant possession. For Section 8, they assess if grounds are proven. They may grant outright, suspended, or postponed possession, or dismiss the claim.',
  },
  {
    question: 'What is a suspended possession order?',
    answer:
      'A suspended order means the tenant can stay if they meet conditions, usually paying current rent plus arrears. If they breach conditions, you can apply directly for a warrant of possession without a new hearing.',
  },
];

// =============================================================================
// Page 5: Scotland Eviction Process (PRT)
// =============================================================================

export const scotlandEvictionFAQs: FAQItem[] = [
  {
    question: 'How does eviction work in Scotland?',
    answer:
      'In Scotland, you must serve a Notice to Leave citing one of 18 grounds. After the notice period expires (28-84 days), apply to the First-tier Tribunal for Scotland (Housing and Property Chamber) for an eviction order. There is no Section 21 or Section 8 in Scotland.',
  },
  {
    question: 'What are the eviction grounds in Scotland?',
    answer:
      'Scotland has 18 eviction grounds under the Private Housing (Tenancies) Act 2016. These include: landlord intends to sell (Ground 1), landlord moving in (Ground 4), rent arrears of 3+ months (Ground 12), and antisocial behaviour (Ground 14).',
  },
  {
    question: 'What is the notice period for eviction in Scotland?',
    answer:
      'Notice periods range from 28 days to 84 days depending on the ground and tenancy length. For tenancies under 6 months, 28 days notice applies. For tenancies over 6 months, 84 days notice is required for most grounds.',
  },
  {
    question: 'Is rent arrears eviction mandatory in Scotland?',
    answer:
      'Yes, Ground 12 (rent arrears) is mandatory if the tenant owes at least 3 consecutive months rent when the notice is served AND when the tribunal considers the case. The tribunal must grant an eviction order if this is proven.',
  },
  {
    question: 'How long does eviction take in Scotland?',
    answer:
      'After the notice period, tribunal cases typically take 2-4 months for a hearing. If granted, enforcement may take additional weeks. Total time from notice to eviction is usually 4-7 months depending on ground and complexity.',
  },
  {
    question: 'How do I recover rent arrears in Scotland?',
    answer:
      'For claims under £5,000, use the Sheriff Court Simple Procedure. For claims between £5,000 and £100,000, use Ordinary Cause. Note that the Money Claim Pack is for England only. Scotland has different court processes and forms.',
  },
];

// =============================================================================
// Page 6: Wales Eviction Process (Section 173/178)
// =============================================================================

export const walesEvictionFAQs: FAQItem[] = [
  {
    question: 'What eviction notices apply in Wales?',
    answer:
      'Wales uses Section 173 (no-fault) and Section 178 (breach/rent arrears) under the Renting Homes (Wales) Act 2016. There is no Section 21 or Section 8 in Wales. The terminology differs: tenants are "contract-holders" and tenancies are "occupation contracts".',
  },
  {
    question: 'What is the notice period for Section 173 in Wales?',
    answer:
      'Section 173 requires a minimum 6-month notice period. Additionally, you cannot serve a Section 173 notice in the first 6 months of occupation, and the landlord must have owned the property for at least 6 months before serving.',
  },
  {
    question: 'When can I use Section 178 in Wales?',
    answer:
      'Section 178 is for breach of contract, including rent arrears and antisocial behaviour. The notice period is typically 1 month, or 14 days for serious rent arrears (2 months or more). This is faster than Section 173.',
  },
  {
    question: 'What is a contract-holder in Wales?',
    answer:
      'Under the Renting Homes (Wales) Act 2016, "contract-holder" replaces the term "tenant". They hold an "occupation contract" rather than a tenancy agreement. The landlord is the "landlord" or "community landlord" for social housing.',
  },
  {
    question: 'How long does eviction take in Wales?',
    answer:
      'After the notice period expires, apply to the County Court for a possession order. Court proceedings typically take 2-4 months. If the contract-holder does not leave, bailiff enforcement adds 4-8 weeks. Total time is usually 9-14 months for Section 173.',
  },
  {
    question: 'Can I recover rent arrears in Wales?',
    answer:
      'Yes, rent recovery in Wales uses the County Court (same as England). You can claim through Money Claim Online (MCOL) for claims under £100,000. Note that our Money Claim Pack is currently for England only.',
  },
];

// =============================================================================
// Page 7: Claim Rent Arrears from Tenant
// =============================================================================

export const claimRentArrearsFAQs: FAQItem[] = [
  {
    question: 'How do I claim unpaid rent from a tenant?',
    answer:
      'Send a Letter Before Action giving 30 days to pay. If unpaid, file a claim through Money Claim Online (MCOL) for claims under £100,000. You will need the tenancy agreement, rent statements, and evidence of the debt.',
  },
  {
    question: 'Can I claim rent arrears after the tenant leaves?',
    answer:
      'Yes. You can pursue a money claim for up to 6 years after the debt arose under the Limitation Act 1980. You will need evidence of the debt and must follow the pre-action protocol (PAP-DEBT) before filing.',
  },
  {
    question: 'What is a Letter Before Action?',
    answer:
      'A Letter Before Action (LBA) is a formal letter required by court rules before starting a claim. It must state the amount owed, how it arose, and give the debtor 30 days to respond or pay. Failure to send an LBA can affect costs.',
  },
  {
    question: 'How much does a money claim cost?',
    answer:
      'Court fees depend on the claim amount: £35 for claims up to £300, £70 for £300-500, £105 for £500-1,000, £185 for £1,000-1,500, and percentage-based for higher amounts. Fees are up to £455 for claims to £10,000.',
  },
  {
    question: 'Can I add interest to my money claim?',
    answer:
      'Yes. For contractual debts, you can claim 8% statutory interest per year under the Late Payment of Commercial Debts Act. Interest accrues from when each payment was due. You can also claim reasonable costs.',
  },
  {
    question: 'What if the tenant defends the claim?',
    answer:
      'If the tenant files a defence, the case is allocated to a track (small claims under £10,000). You may need to attend a hearing. Prepare evidence: tenancy agreement, rent schedule, payment records, and correspondence.',
  },
  {
    question: 'Can I claim from a guarantor?',
    answer:
      'Yes, if you have a valid guarantor agreement. The guarantor is jointly liable for rent arrears. Send them a Letter Before Action too. You can claim from both tenant and guarantor but can only recover the debt once.',
  },
  {
    question: 'What happens after I win a money judgment (CCJ)?',
    answer:
      'A County Court Judgment (CCJ) registers on the tenant credit file for 6 years. If they do not pay, you can enforce via bailiffs, attachment of earnings, charging order on property, or third-party debt order on bank accounts.',
  },
];

// =============================================================================
// Page 8: Section 8 vs Section 21 Comparison
// =============================================================================

export const section8VsSection21FAQs: FAQItem[] = [
  {
    question: 'What is the main difference between Section 8 and Section 21?',
    answer:
      'Section 21 is a no-fault eviction requiring no reason but 2 months notice. Section 8 requires specific grounds (like rent arrears or breach) but can have shorter notice periods. Section 21 uses accelerated procedure; Section 8 requires a hearing.',
  },
  {
    question: 'Which eviction notice is faster: Section 8 or Section 21?',
    answer:
      'It depends. Section 8 has a shorter notice period (2 weeks for rent arrears) but requires a court hearing. Section 21 has 2 months notice but uses accelerated procedure (no hearing). Overall, Section 21 is often faster for straightforward cases.',
  },
  {
    question: 'Can I serve both Section 8 and Section 21 at the same time?',
    answer:
      'Yes, this is common practice. Serving both gives you options: if the tenant pays down arrears (losing Ground 8), you still have Section 21. It costs nothing extra to serve both notices together.',
  },
  {
    question: 'Which notice should I use for rent arrears?',
    answer:
      'Use Section 8 with Grounds 8, 10, and 11 for rent arrears. Ground 8 gives mandatory possession if 2+ months arrears persist. Consider also serving Section 21 as backup in case the tenant pays down the arrears.',
  },
  {
    question: 'Is Section 21 being abolished?',
    answer:
      'The Renters Reform Bill proposes abolishing Section 21 in England, likely from late 2026 onwards. After abolition, landlords will need valid Section 8 grounds to evict. Check current legislation before serving notices.',
  },
  {
    question: 'Which notice is cheaper to enforce?',
    answer:
      'Court fees are the same (£355) for both. However, Section 21 accelerated procedure is simpler and rarely requires a solicitor. Section 8 hearings may benefit from legal representation, adding to costs.',
  },
  {
    question: 'What if my Section 21 notice is invalid?',
    answer:
      'If your Section 21 is invalid (deposit issues, missing documents), fall back to Section 8 if you have grounds. Many landlords serve both notices precisely because Section 21 has strict validity requirements.',
  },
];
