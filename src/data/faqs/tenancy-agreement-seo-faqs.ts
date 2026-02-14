/**
 * Tenancy Agreement SEO Landing Page FAQs
 *
 * Jurisdiction-specific FAQs for tenancy agreement landing pages
 * Each page requires 5-8 FAQs focused on:
 * - Legal validity
 * - Court enforceability
 * - Jurisdiction-specific requirements
 * - Common landlord mistakes
 * - Consequences of using wrong agreement type
 */

import type { FAQItem } from '@/components/marketing/FAQSection';

// ============================================
// ENGLAND - ASSURED SHORTHOLD TENANCY (AST)
// ============================================

export const astTenancyAgreementFAQs: FAQItem[] = [
  {
    question: 'Is an Assured Shorthold Tenancy agreement legally valid in England?',
    answer:
      'Yes, an Assured Shorthold Tenancy (AST) is the default and most common type of tenancy agreement in England. It is governed by the Housing Act 1988 (as amended). An AST gives landlords the right to regain possession using Section 21 or Section 8 notices, provided all legal requirements are met.',
  },
  {
    question: 'What happens if I use the wrong tenancy agreement?',
    answer:
      'Using the wrong agreement type can have serious consequences. If you use a Scottish PRT or Welsh Occupation Contract in England, your eviction notices may be invalid. Courts will not grant possession orders based on the wrong legal framework, and you may need to start the process again with the correct documentation.',
  },
  {
    question: 'Can my AST be enforced in court if there is a dispute?',
    answer:
      'Yes, a properly drafted AST is fully enforceable in the English courts. However, enforceability depends on the agreement containing correct legal terms, complying with consumer rights legislation, and being served alongside required documents like the How to Rent guide, EPC, and gas safety certificate.',
  },
  {
    question: 'What must be included in an AST for it to be valid?',
    answer:
      'A valid AST must include: names of landlord and tenant(s), property address, rent amount and payment dates, deposit amount and protection scheme details, tenancy start date and duration, and clear terms on responsibilities. While not legally required, a written agreement is essential for deposit protection compliance and serving valid Section 21 notices.',
  },
  {
    question: 'Do I need a new tenancy agreement if my tenant stays after the fixed term?',
    answer:
      'Not necessarily. When a fixed-term AST ends and the tenant remains, it automatically becomes a statutory periodic tenancy on the same terms. However, you may want to issue a new agreement if you wish to change terms, update rent, or create a new fixed term.',
  },
  {
    question: 'What is the difference between Standard and Premium tenancy agreements?',
    answer:
      'A Standard tenancy agreement covers essential legal requirements for a valid AST. A Premium agreement includes additional protective clauses such as break clauses, guarantor provisions, pet policies, rent review mechanisms, and garden maintenance obligations — providing extra protection if disputes arise later.',
  },
  {
    question: 'Can I use a free tenancy agreement template I found online?',
    answer:
      'Free templates are risky because they may be outdated, contain unenforceable terms, or fail to comply with current legislation. An invalid clause can affect your ability to serve notices or make money claims. Using a professionally drafted, up-to-date agreement reduces the risk of costly legal problems.',
  },
  {
    question: 'Will my tenancy agreement affect my ability to evict later?',
    answer:
      'Yes. A Section 21 notice is only valid if you have provided the tenant with an EPC, gas safety certificate, How to Rent guide, and protected the deposit correctly. If your agreement does not reference these obligations or contains errors, your notice may be invalidated by the court.',
  },
];

export const astTemplateFAQs: FAQItem[] = [
  {
    question: 'What is an AST tenancy agreement template?',
    answer:
      'An AST template is a pre-drafted Assured Shorthold Tenancy agreement that you can customise with your property and tenant details. A good template complies with the Housing Act 1988, includes fair terms under consumer law, and covers essential clauses for rent, deposit, repairs, and ending the tenancy.',
  },
  {
    question: 'Are free AST templates legally valid?',
    answer:
      'Not always. Free templates may be outdated or contain terms that are unenforceable under consumer protection law. Before using any template, check it has been updated for current legislation including the Tenant Fees Act 2019, Deregulation Act 2015, and any recent changes to eviction rules.',
  },
  {
    question: 'Can I edit an AST template myself?',
    answer:
      'Yes, but with caution. You can add clauses specific to your property (e.g., garden maintenance, parking), but avoid terms that could be deemed unfair under the Consumer Rights Act 2015. Unfair terms are not enforceable, and including them could undermine your agreement in court.',
  },
  {
    question: 'What makes a tenancy agreement template "court-ready"?',
    answer:
      'A court-ready template includes all legally required terms, complies with current housing legislation, avoids unfair contract terms, and is structured so that any disputes can be resolved clearly. This is essential if you later need to rely on the agreement for eviction or money claims.',
  },
  {
    question: 'Do both landlord and tenant need to sign the template?',
    answer:
      'While a tenancy can technically exist without signatures, having both parties sign creates clear evidence of agreement. For deposit protection compliance and court proceedings, a signed and dated agreement is strongly recommended.',
  },
  {
    question: 'Can I use the same template for all my properties?',
    answer:
      'Yes, if all properties are in England and let on Assured Shorthold Tenancies. However, you may need to customise clauses for HMOs, furnished vs unfurnished lets, or properties with specific features. Never use an England template for properties in Scotland, Wales, or Northern Ireland.',
  },
];

export const fixedTermPeriodicEnglandFAQs: FAQItem[] = [
  {
    question: 'What is the difference between fixed term and periodic tenancy?',
    answer:
      'A fixed-term tenancy runs for a set period (e.g., 6 or 12 months) with a definite end date. Neither party can normally end it early unless there is a break clause. A periodic tenancy rolls on (weekly or monthly) with no end date until ended by proper notice from either party.',
  },
  {
    question: 'Which is better for landlords: fixed term or periodic?',
    answer:
      'Fixed terms provide income certainty and make it harder for tenants to leave early. However, you also cannot end the tenancy early without grounds. Periodic tenancies offer flexibility but require you to give 2 months notice (Section 21). Many landlords start with a fixed term that converts to periodic.',
  },
  {
    question: 'Can I evict a tenant during a fixed-term tenancy?',
    answer:
      'Only if there are grounds under Section 8 (e.g., rent arrears, breach of tenancy) or a break clause allows early termination. You cannot use Section 21 to end a fixed-term early unless the notice expires on or after the fixed term ends.',
  },
  {
    question: 'What happens when a fixed-term tenancy ends?',
    answer:
      'If the tenant stays and you do not issue a new agreement, a statutory periodic tenancy automatically begins. This runs on the same terms as the original agreement but can be ended with proper notice. No new agreement is legally required.',
  },
  {
    question: 'How much notice must I give on a periodic tenancy?',
    answer:
      'For a Section 21 notice, you must give at least 2 months notice. The notice must expire on the last day of a rental period. For example, if rent is due on the 1st, a notice served on 15th January must expire on 31st March at the earliest.',
  },
  {
    question: 'Can I include a break clause in a fixed-term agreement?',
    answer:
      'Yes. A break clause allows either party to end the tenancy early by giving notice (typically 2 months). This provides flexibility while still having the security of a fixed term. However, the tenant can also use the break clause to leave.',
  },
];

export const jointTenancyEnglandFAQs: FAQItem[] = [
  {
    question: 'What is a joint tenancy agreement?',
    answer:
      'A joint tenancy is where two or more tenants sign the same agreement and are collectively responsible for the whole rent and all obligations. Each tenant is liable for the full rent — so if one tenant leaves, the remaining tenants must cover their share.',
  },
  {
    question: 'What is the difference between joint tenancy and tenancy in common?',
    answer:
      'In a joint tenancy, all tenants have equal rights to the whole property and are jointly liable for rent. In tenancy in common (rare for residential lets), each tenant has a defined share. For most landlords, a joint tenancy with joint and several liability is the safer option.',
  },
  {
    question: 'What is joint and several liability?',
    answer:
      'Joint and several liability means each tenant is individually responsible for the entire rent, not just their share. If one tenant stops paying, you can pursue any or all of the other tenants for the full amount owed. This is essential protection for landlords with multiple tenants.',
  },
  {
    question: 'Can one joint tenant leave without the others?',
    answer:
      'During a fixed term, no tenant can leave unless all parties agree or there is a break clause. On a periodic tenancy, one tenant giving notice can technically end the whole tenancy for all joint tenants. However, you can agree a new tenancy with the remaining tenants.',
  },
  {
    question: 'How do I add or remove a tenant from a joint tenancy?',
    answer:
      'You need to end the existing tenancy and create a new one with the updated tenant names. Alternatively, you can use a deed of assignment (surrender and re-grant) if all parties agree. Simply crossing out names is not legally effective.',
  },
  {
    question: 'Is a joint tenancy suitable for sharers who do not know each other?',
    answer:
      'It can work but carries risks. If tenants fall out or one leaves, the others remain liable for full rent. Consider whether a joint tenancy with joint and several liability is appropriate, or whether separate tenancies (for HMOs with proper licensing) might be better.',
  },
];

export const renewUpdateEnglandFAQs: FAQItem[] = [
  {
    question: 'Do I need to create a new tenancy agreement when renewing?',
    answer:
      'Not always. If you want to continue on the same terms, you can let the tenancy become periodic. However, if you want to update terms, increase rent formally, or grant a new fixed term, you should issue a new agreement.',
  },
  {
    question: 'Can I increase rent when renewing a tenancy agreement?',
    answer:
      'Yes. You can agree a new rent in the renewal agreement. Alternatively, on a periodic tenancy, you can use a Section 13 notice to increase rent, giving at least one month notice. The tenant can refer the increase to a tribunal if they dispute it.',
  },
  {
    question: 'What documents do I need to provide at renewal?',
    answer:
      'If issuing a new AST, you should provide the current How to Rent guide (if updated), confirm the deposit remains protected, and ensure the tenant has current EPC and gas safety certificate copies. These are required for valid Section 21 notices.',
  },
  {
    question: 'Can I update tenancy terms during the tenancy?',
    answer:
      'Only with the tenant\'s agreement. You cannot unilaterally change terms mid-tenancy. If you want to add or change clauses (e.g., regarding pets or subletting), negotiate with the tenant and document the agreed changes in a variation agreement or new tenancy.',
  },
  {
    question: 'What happens if I do not renew and the tenant stays?',
    answer:
      'The fixed term ends and a statutory periodic tenancy automatically begins on the same terms. The tenant continues paying the same rent on the same day. You can end this with a Section 21 notice (2 months) or continue indefinitely.',
  },
  {
    question: 'Should I backdate a renewal agreement?',
    answer:
      'No. Date the agreement from when it is actually signed. If there is a gap between the old tenancy ending and the new one starting, the statutory periodic tenancy covers that period. Backdating creates confusion and potential legal issues.',
  },
];

// ============================================
// SCOTLAND - PRIVATE RESIDENTIAL TENANCY (PRT)
// ============================================

export const prtTenancyAgreementFAQs: FAQItem[] = [
  {
    question: 'What is a Private Residential Tenancy in Scotland?',
    answer:
      'A Private Residential Tenancy (PRT) is the only tenancy type available for most private lets in Scotland since 1 December 2017. It replaced the assured and short assured tenancy. PRTs have no fixed end date — they continue until the tenant gives notice or the landlord uses one of 18 statutory grounds.',
  },
  {
    question: 'Is a PRT different from an Assured Shorthold Tenancy?',
    answer:
      'Yes, completely different. ASTs apply in England only. PRTs apply in Scotland. Using an English AST in Scotland would be invalid and unenforceable. You must use a PRT agreement that complies with the Private Housing (Tenancies) (Scotland) Act 2016.',
  },
  {
    question: 'Can I evict a PRT tenant without giving a reason?',
    answer:
      'No. Unlike English ASTs (Section 21), there is no "no-fault" ground for ending a PRT. You must use one of 18 statutory grounds in the Act, such as rent arrears, landlord intending to sell, or landlord moving in. The First-tier Tribunal decides if the ground is established.',
  },
  {
    question: 'How do I end a Private Residential Tenancy?',
    answer:
      'You must serve a Notice to Leave specifying which ground(s) you are using and the notice period required for that ground (28 days to 84 days depending on the ground and length of tenancy). If the tenant does not leave, you apply to the First-tier Tribunal for an eviction order.',
  },
  {
    question: 'What must be included in a Scottish PRT agreement?',
    answer:
      'A PRT must include mandatory statutory terms covering rent, deposits, ending the tenancy, and rent increases. The Scottish Government provides model terms that must be included. You can add additional terms as long as they do not contradict the statutory requirements.',
  },
  {
    question: 'Does the deposit need to be protected in Scotland?',
    answer:
      'Yes. Landlords must protect deposits in an approved Scottish tenancy deposit scheme within 30 working days of the tenancy starting. Failure to protect can result in penalties of up to three times the deposit amount.',
  },
  {
    question: 'Can I use rent pressure zones to limit rent increases?',
    answer:
      'Rent pressure zones allow local authorities to cap rent increases in designated areas. If your property is in a rent pressure zone, rent increases are limited to CPI + 1% per year. Check with your local council whether any zones apply.',
  },
];

export const prtTemplateFAQs: FAQItem[] = [
  {
    question: 'Where can I get a PRT tenancy agreement template?',
    answer:
      'The Scottish Government provides a model PRT agreement. However, this basic version may not include all protective clauses landlords need. Professional templates build on the model agreement with additional terms for gardens, pets, and specific property features.',
  },
  {
    question: 'Can I use the Scottish Government model agreement as-is?',
    answer:
      'Yes, it is legally valid. However, the model agreement is basic and does not cover all situations. If you want clauses about pets, professional cleaning, garden maintenance, or property-specific rules, you need to add these as additional terms.',
  },
  {
    question: 'What happens if my PRT template is missing mandatory terms?',
    answer:
      'The statutory terms from the Private Housing (Tenancies) (Scotland) Act 2016 apply automatically, even if not in your written agreement. However, having a complete written agreement avoids confusion and provides clear evidence of what was agreed.',
  },
  {
    question: 'Can I add my own clauses to a PRT agreement?',
    answer:
      'Yes, as long as they do not contradict the statutory terms or create unfair contract terms. Additional terms can cover garden maintenance, parking, decorating, professional cleaning, and other property-specific matters.',
  },
  {
    question: 'Is a PRT template from England valid in Scotland?',
    answer:
      'No. English AST templates are not valid in Scotland. They reference the wrong legislation, wrong eviction procedures, and wrong tenant rights. Using an English template in Scotland could make your agreement unenforceable.',
  },
  {
    question: 'Do I need a new template for each property?',
    answer:
      'You can use the same base template for all Scottish properties, but you must customise it with property-specific details and any relevant additional terms. HMO properties may need specific clauses about shared areas and responsibilities.',
  },
];

export const jointPrtFAQs: FAQItem[] = [
  {
    question: 'How does joint tenancy work under a PRT?',
    answer:
      'Joint PRT tenants are collectively responsible for all obligations including rent. Like in England, joint and several liability means you can pursue any tenant for the full rent. All joint tenants have equal rights to occupy the whole property.',
  },
  {
    question: 'Can one joint PRT tenant leave independently?',
    answer:
      'A PRT continues until all tenants give proper notice or the landlord serves a Notice to Leave. One tenant leaving does not automatically end the PRT for others. The remaining tenants continue the tenancy on the same terms.',
  },
  {
    question: 'How do I add a new tenant to an existing joint PRT?',
    answer:
      'You can add a tenant by creating a new PRT with all tenants named, or by having the new tenant sign an agreement to join the existing tenancy. The deposit protection may need to be updated to reflect the new tenant.',
  },
  {
    question: 'What happens if joint tenants disagree about leaving?',
    answer:
      'All joint tenants should ideally agree, but if one wants to leave, they can give notice of their intention. The remaining tenants and landlord can agree to continue the tenancy without them. This should be documented in writing.',
  },
  {
    question: 'Is joint and several liability automatic in Scotland?',
    answer:
      'It should be explicitly stated in the agreement. While courts may imply it for joint tenants, including a clear joint and several liability clause protects you if you need to pursue one tenant for rent arrears owed by all.',
  },
];

export const updatePrtFAQs: FAQItem[] = [
  {
    question: 'Can I change the rent during a PRT?',
    answer:
      'Yes, but you must follow the statutory procedure. You can only increase rent once per 12 months, must give at least 3 months written notice using the prescribed form, and the tenant can refer the increase to a Rent Officer if they disagree.',
  },
  {
    question: 'How do I update other terms in a PRT?',
    answer:
      'You need the tenant\'s agreement to change non-rent terms. Negotiate the changes and record them in a written variation agreement signed by all parties. You cannot unilaterally change terms during the tenancy.',
  },
  {
    question: 'Do I need to re-protect the deposit if I update the PRT?',
    answer:
      'Not unless the deposit amount changes or the tenancy ends and restarts. If you are creating a new PRT rather than varying the existing one, check whether the deposit protection needs to be updated.',
  },
  {
    question: 'What if the tenant refuses to agree to updated terms?',
    answer:
      'You cannot force the tenant to accept new terms. The existing PRT continues on its current terms. For rent, you can use the statutory increase procedure. For other terms, the tenant must agree voluntarily.',
  },
  {
    question: 'Should I use a new PRT or a variation agreement?',
    answer:
      'A variation agreement is simpler for minor changes. A new PRT may be appropriate for significant changes or when adding/removing tenants. Consider the administrative burden and whether deposit protection needs updating.',
  },
];

export const prtMistakesFAQs: FAQItem[] = [
  {
    question: 'What are the most common PRT mistakes landlords make?',
    answer:
      'Common mistakes include: using English AST forms instead of PRT agreements, not providing written tenancy terms within 28 days, failing to register with the landlord register, not protecting deposits within 30 working days, and trying to use "no-fault" eviction which does not exist in Scotland.',
  },
  {
    question: 'What happens if I do not provide written terms?',
    answer:
      'You must provide written terms within 28 days of the tenancy starting. If you do not, the tenant can apply to the First-tier Tribunal. The Tribunal can require you to provide terms and may make a payment order against you (up to one month\'s rent).',
  },
  {
    question: 'Can I be fined for not registering as a landlord?',
    answer:
      'Yes. All private landlords in Scotland must be registered with the local council. Letting without registration is a criminal offence with fines up to £50,000. You also cannot serve a valid Notice to Leave if not registered.',
  },
  {
    question: 'What if I used the wrong eviction ground?',
    answer:
      'If you cite the wrong ground in your Notice to Leave, the Tribunal may refuse the eviction order. You may need to serve a new notice with the correct ground and wait the required notice period again, causing significant delays.',
  },
  {
    question: 'Can an invalid PRT affect my eviction case?',
    answer:
      'Yes. The Tribunal will examine whether all PRT requirements were met. Missing documentation, unregistered landlord status, or unprotected deposits can be raised as defences. Ensuring your PRT is properly set up protects your ability to recover possession.',
  },
  {
    question: 'What if my property was let before 1 December 2017?',
    answer:
      'Tenancies created before 1 December 2017 remain as short assured or assured tenancies under the old rules. Only tenancies created on or after that date are PRTs. Converting an old tenancy to a PRT requires ending the old tenancy and starting a new one.',
  },
];

// ============================================
// WALES - OCCUPATION CONTRACTS
// ============================================

export const occupationContractWalesFAQs: FAQItem[] = [
  {
    question: 'What is a Standard Occupation Contract in Wales?',
    answer:
      'A Standard Occupation Contract is the tenancy type for private landlords in Wales under the Renting Homes (Wales) Act 2016, which came into force on 1 December 2022. It replaced the Assured Shorthold Tenancy in Wales. The tenant is called a "contract-holder" and the landlord is the "landlord".',
  },
  {
    question: 'Is a Welsh occupation contract different from an English AST?',
    answer:
      'Yes. Welsh occupation contracts are governed by the Renting Homes (Wales) Act 2016, not the Housing Act 1988. Different termination procedures apply (Section 173 and Section 181 notices instead of Section 21 and Section 8). Using an English AST in Wales is not valid.',
  },
  {
    question: 'What is a written statement and do I have to provide one?',
    answer:
      'A written statement sets out the terms of the occupation contract. Landlords must provide one within 14 days of the occupation date. Failure to provide it means you cannot serve a Section 173 (no-fault) notice until 6 months after you do provide it.',
  },
  {
    question: 'How do I end a Standard Occupation Contract?',
    answer:
      'For no-fault possession, serve a Section 173 notice giving at least 6 months notice. For breach of contract, serve a Section 181 notice (with 1 month notice for rent arrears, or 14 days for antisocial behaviour). If the contract-holder does not leave, apply to the county court.',
  },
  {
    question: 'What are fundamental and supplementary terms?',
    answer:
      'Fundamental terms are required by law and cannot be changed (e.g., landlord repair obligations). Supplementary terms are default terms that apply unless varied by agreement. You can add additional terms but they must not be unfair or contradict fundamental terms.',
  },
  {
    question: 'Do I need to protect deposits in Wales?',
    answer:
      'Yes. The deposit protection requirements continue under the Renting Homes Act. Deposits must be protected in a government-approved scheme within 30 days. Failure to protect affects your ability to serve possession notices.',
  },
  {
    question: 'Can I use an old AST for a property in Wales?',
    answer:
      'No. All new tenancies created in Wales after 1 December 2022 must be occupation contracts. Existing ASTs converted automatically to occupation contracts on that date. Using an English AST template for new Welsh tenancies is invalid.',
  },
];

export const occupationContractTemplateFAQs: FAQItem[] = [
  {
    question: 'Where can I get an occupation contract template for Wales?',
    answer:
      'The Welsh Government provides a model written statement. However, most landlords need additional terms to cover property-specific matters. Professional templates include the mandatory terms plus practical clauses for gardens, pets, and repairs.',
  },
  {
    question: 'What must a Welsh occupation contract include?',
    answer:
      'The written statement must include all fundamental terms (set by law), supplementary terms (defaults that apply unless varied), and any additional terms you have agreed. Key information includes rent, deposit, occupation date, and property address.',
  },
  {
    question: 'Can I modify the Welsh Government template?',
    answer:
      'You can add supplementary and additional terms but cannot remove or contradict fundamental terms. Fundamental terms cover matters like the landlord\'s repair obligations and the contract-holder\'s right to occupy. Check any additions are fair and lawful.',
  },
  {
    question: 'Is my template compliant with the Renting Homes Act?',
    answer:
      'A compliant template includes all fundamental terms from the Act, correct supplementary terms, and no unfair additional terms. Using an outdated or English template will not be compliant. Professional Welsh templates are drafted specifically for the 2016 Act.',
  },
  {
    question: 'What happens if I use the wrong template in Wales?',
    answer:
      'Using an English AST template in Wales means you do not have a valid occupation contract. Your notices may be invalid, and the contract-holder has different rights than stated in your document. You could face problems if you need to rely on the agreement in court.',
  },
];

export const fixedTermPeriodicWalesFAQs: FAQItem[] = [
  {
    question: 'Can I have a fixed-term occupation contract in Wales?',
    answer:
      'Yes. Like English tenancies, Welsh occupation contracts can be fixed-term (with a specified end date) or periodic (rolling). A fixed-term contract provides certainty for both parties but limits flexibility to end early.',
  },
  {
    question: 'What happens when a fixed-term occupation contract ends?',
    answer:
      'The contract automatically becomes a periodic contract on the same terms unless you agree a new fixed term. You do not need to do anything — the transition happens by law when the fixed term expires and the contract-holder remains.',
  },
  {
    question: 'How do I end a periodic occupation contract?',
    answer:
      'Serve a Section 173 notice giving at least 6 months notice (the minimum cannot be less). The notice must not expire before any fixed term ends. If the contract-holder does not leave, apply to the county court for a possession order.',
  },
  {
    question: 'Can I include a break clause in a Welsh occupation contract?',
    answer:
      'Yes. A break clause allows either party to end a fixed-term contract early by giving the agreed notice. This provides flexibility while still having a fixed term. The minimum notice for a Section 173 (6 months) still applies for landlord-initiated breaks.',
  },
  {
    question: 'What is the minimum fixed term in Wales?',
    answer:
      'There is no statutory minimum fixed term. However, you cannot serve a Section 173 no-fault notice until at least 6 months after the occupation date. This effectively creates a minimum 6-month period before you can seek no-fault possession.',
  },
];

export const jointOccupationContractFAQs: FAQItem[] = [
  {
    question: 'How does joint occupation work in Wales?',
    answer:
      'Joint contract-holders are collectively responsible for all obligations under the occupation contract. Joint and several liability means each person is liable for the full rent. All joint contract-holders have equal rights to occupy the property.',
  },
  {
    question: 'Can one joint contract-holder leave independently?',
    answer:
      'A joint contract-holder can give notice to end their own part of the contract. Under the Renting Homes Act, this does not automatically end the contract for the other joint holders — they can continue if the landlord agrees.',
  },
  {
    question: 'What is succession in Welsh occupation contracts?',
    answer:
      'The Renting Homes Act provides succession rights for certain family members or carers if a contract-holder dies. Priority successors (spouse/partner) and reserve successors (family members) may be entitled to take over the contract.',
  },
  {
    question: 'How do I add someone to a Welsh occupation contract?',
    answer:
      'The contract-holder can request to add a person as a joint contract-holder. You should not unreasonably refuse. Create a new contract or a variation agreement including the additional person and update the written statement.',
  },
  {
    question: 'What if joint contract-holders disagree about the tenancy?',
    answer:
      'Disputes between joint contract-holders do not affect your right to collect full rent from any of them. If one wants to leave, work with all parties to agree a solution — either ending the contract or continuing with remaining holders.',
  },
];

export const updateOccupationContractFAQs: FAQItem[] = [
  {
    question: 'How do I increase rent under an occupation contract?',
    answer:
      'You can increase rent by agreement or by serving a rent increase notice. You must give at least 2 months notice using the prescribed form. The contract-holder can refer the increase to a tribunal within 2 months of receiving the notice.',
  },
  {
    question: 'Can I change other terms during the occupation contract?',
    answer:
      'Only by agreement with the contract-holder. You cannot unilaterally change supplementary or additional terms. Any changes should be documented in a written variation notice and both parties should keep copies.',
  },
  {
    question: 'Do I need to update the written statement if terms change?',
    answer:
      'Yes. If any terms change, you must provide an updated written statement to the contract-holder within 14 days. Failure to do so is a breach of your obligations under the Renting Homes Act.',
  },
  {
    question: 'What if my written statement was incomplete?',
    answer:
      'If the written statement did not include all required terms, the statutory terms apply anyway. However, you should provide a corrected statement. Incomplete statements can affect your ability to serve Section 173 notices.',
  },
  {
    question: 'Should I issue a new occupation contract or vary the existing one?',
    answer:
      'For minor changes (e.g., rent increase), a variation is sufficient. For major changes (e.g., different contract-holders, different property), a new contract may be appropriate. Consider the impact on deposit protection and notice periods.',
  },
];

// ============================================
// NORTHERN IRELAND - PRIVATE TENANCIES
// ============================================

export const niTenancyAgreementFAQs: FAQItem[] = [
  {
    question: 'What type of tenancy agreement is used in Northern Ireland?',
    answer:
      'Private tenancies in Northern Ireland are governed by the Private Tenancies (Northern Ireland) Order 2006 and the Private Tenancies Act (Northern Ireland) 2022. The agreements are structured differently from English ASTs and have different legal requirements for notices and deposits.',
  },
  {
    question: 'Is a Northern Ireland tenancy different from an English AST?',
    answer:
      'Yes. Northern Ireland has its own tenancy law separate from England, Wales, and Scotland. Different notice periods, deposit rules, and eviction procedures apply. Using an English AST template in Northern Ireland is not legally valid.',
  },
  {
    question: 'Do I need to provide a written tenancy agreement in NI?',
    answer:
      'Yes. Under the Private Tenancies Act 2022, landlords must provide tenants with a written tenancy agreement within 28 days of the tenancy starting. The agreement must include specific statutory information prescribed by regulations.',
  },
  {
    question: 'How do I end a private tenancy in Northern Ireland?',
    answer:
      'You must serve a valid Notice to Quit. The minimum notice period depends on the length of the tenancy and the reason for ending it. For no-fault possession, longer notice periods apply. If the tenant does not leave, apply to the courts for possession.',
  },
  {
    question: 'Do I need to protect deposits in Northern Ireland?',
    answer:
      'Yes. The tenancy deposit protection scheme operates in Northern Ireland. Deposits must be protected in an approved scheme and the prescribed information given to the tenant. Failure to comply affects your ability to recover possession.',
  },
  {
    question: 'What must a NI tenancy agreement include?',
    answer:
      'The agreement must include: landlord and tenant names, property address, rent amount and payment terms, deposit details and protection information, tenancy start date, and information about how to end the tenancy. Statutory requirements set out additional mandatory content.',
  },
  {
    question: 'Can I use a template from England or Scotland for NI?',
    answer:
      'No. NI tenancy law is separate from the rest of the UK. Templates from England (AST), Scotland (PRT), or Wales (Occupation Contract) are not valid in Northern Ireland. You must use an agreement that complies with Northern Ireland legislation.',
  },
];

export const niTenancyTemplateFAQs: FAQItem[] = [
  {
    question: 'Where can I get a tenancy agreement template for Northern Ireland?',
    answer:
      'Professional templates are available that comply with the Private Tenancies (NI) Order 2006 and Private Tenancies Act 2022. These include all statutory required information and practical clauses for Northern Ireland properties.',
  },
  {
    question: 'What makes a NI tenancy template legally valid?',
    answer:
      'A valid NI template must comply with the Private Tenancies (NI) Order 2006 and the 2022 Act. It should include all prescribed information, correct notice periods, and terms that do not conflict with tenant protection legislation.',
  },
  {
    question: 'Can I add extra clauses to a NI tenancy agreement?',
    answer:
      'Yes, as long as they do not conflict with statutory tenant protections or constitute unfair contract terms. Additional clauses can cover property-specific matters like gardens, parking, and decorating, but must be reasonable.',
  },
  {
    question: 'Is a free template safe to use for NI properties?',
    answer:
      'Free templates may not be updated for current NI legislation, particularly the Private Tenancies Act 2022. Using an outdated or non-compliant template could affect your ability to serve valid notices or make court applications.',
  },
  {
    question: 'Do both parties need to sign the tenancy agreement in NI?',
    answer:
      'While a tenancy can exist without signatures, having both parties sign provides clear evidence of agreement. For compliance with the 2022 Act requirement to provide a written agreement, signatures demonstrate the document was provided and accepted.',
  },
];

export const fixedTermNIFAQs: FAQItem[] = [
  {
    question: 'Can I have a fixed-term tenancy in Northern Ireland?',
    answer:
      'Yes. NI tenancies can be fixed-term (with an end date) or periodic (rolling). Fixed-term tenancies provide certainty but limit early termination. Many landlords use a fixed term that converts to periodic afterwards.',
  },
  {
    question: 'What happens when a fixed-term tenancy ends in NI?',
    answer:
      'If the tenant stays after the fixed term with your agreement, the tenancy usually continues as a periodic tenancy on the same terms. No new agreement is legally required for this continuation.',
  },
  {
    question: 'How much notice is required to end a periodic tenancy in NI?',
    answer:
      'Notice periods in NI depend on the length of the tenancy. For tenancies of less than 12 months, at least 4 weeks notice. For 12 months or more, at least 8 weeks notice. Longer notice may be required in some circumstances under the 2022 Act.',
  },
  {
    question: 'Can I include a break clause in a NI fixed-term tenancy?',
    answer:
      'Yes. A break clause allows either party to end the fixed term early with agreed notice. This provides flexibility while still having the security of a fixed term. The break clause terms should be clearly stated in the agreement.',
  },
  {
    question: 'What is the maximum fixed term I can use in Northern Ireland?',
    answer:
      'There is no statutory maximum for fixed-term tenancies in NI. However, terms over 7 years may require a deed rather than a simple agreement. Most residential tenancies use terms between 6 months and 2 years.',
  },
];

export const jointTenancyNIFAQs: FAQItem[] = [
  {
    question: 'How does joint tenancy work in Northern Ireland?',
    answer:
      'Joint tenants in NI are collectively responsible for all obligations including rent. Joint and several liability means you can pursue any tenant for the full amount owed. All joint tenants have equal rights to occupy the property.',
  },
  {
    question: 'What is joint and several liability in NI?',
    answer:
      'Joint and several liability means each tenant is individually responsible for the entire rent, not just their portion. If one tenant stops paying, you can pursue any or all of the other tenants for the full amount. This should be explicitly stated in the agreement.',
  },
  {
    question: 'Can one joint tenant leave independently in NI?',
    answer:
      'During a fixed term, tenants generally cannot leave independently unless all parties agree or there is a break clause. On a periodic tenancy, one tenant giving notice may end the tenancy for all, though this can be negotiated with remaining tenants.',
  },
  {
    question: 'How do I add or remove a tenant from a joint tenancy in NI?',
    answer:
      'You should end the existing tenancy and create a new one with the updated tenant names, or use a formal variation agreement. Update the deposit protection to reflect any changes in tenant names.',
  },
  {
    question: 'Is a joint tenancy suitable for HMOs in Northern Ireland?',
    answer:
      'Joint tenancies with joint and several liability work well for HMOs where tenants know each other. For HMOs with unrelated tenants, ensure compliance with HMO licensing requirements and consider whether joint or individual tenancies are more appropriate.',
  },
];

export const updateNITenancyFAQs: FAQItem[] = [
  {
    question: 'How do I increase rent during a NI tenancy?',
    answer:
      'You can increase rent by agreement with the tenant or by following the notice procedure in your tenancy agreement. Ensure any rent increase is reasonable and properly notified. The tenant may have rights to challenge excessive increases.',
  },
  {
    question: 'Can I change tenancy terms in Northern Ireland?',
    answer:
      'Only by agreement with the tenant. You cannot unilaterally change terms during the tenancy. If you want to change clauses, discuss with the tenant and document agreed changes in a written variation agreement.',
  },
  {
    question: 'Do I need to provide a new written agreement if terms change?',
    answer:
      'Yes. Under the Private Tenancies Act 2022, any changes to the written agreement must be provided to the tenant in writing. Provide an updated agreement or a variation document showing the changes.',
  },
  {
    question: 'What if my original tenancy agreement is missing required information?',
    answer:
      'You should provide a compliant written agreement as soon as possible. Missing statutory information may affect your ability to serve valid notices. Ensure the updated agreement includes all information required by the 2022 Act.',
  },
  {
    question: 'Should I renew with a new agreement or let it become periodic?',
    answer:
      'Either approach is valid. A new agreement lets you update terms and rent clearly. Letting it become periodic is simpler but continues on existing terms. Consider whether you want to change anything before deciding.',
  },
];
