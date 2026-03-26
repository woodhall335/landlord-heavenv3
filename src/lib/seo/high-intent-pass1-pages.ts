import type { FAQItem } from '@/components/seo/FAQSection';
import type { IntentSection } from '@/components/seo/HighIntentPageShell';
import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

export interface HighIntentPageContent {
  slug: string;
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  icon: string;
  heroBullets: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  relatedLinks: Array<{ label: string; href: string }>;
  sections: IntentSection[];
  faqs: FAQItem[];
}

const long = (a: string, b: string, c: string) => [a, b, c];

export const PASS1_PAGES: Record<string, HighIntentPageContent> = {
  'tenant-stopped-paying-rent': {
    slug: 'tenant-stopped-paying-rent',
    title: 'Tenant Stopped Paying Rent: Landlord Action Plan for Arrears and Possession',
    description: 'Detailed landlord guide for rent arrears cases: evidence, notice route choice, arrears schedule, court preparation, and recovery strategy.',
    heroTitle: 'Tenant Stopped Paying Rent: What to Do Next',
    heroSubtitle: 'A practical landlord playbook for arrears evidence, route selection, and possession planning without avoidable resets.',
    icon: '/images/wizard-icons/06-notice-details.png',
    heroBullets: ['Ground 8 threshold and timing explained', 'Arrears evidence pack workflow', 'Product-first CTA flow to Notice Only and Complete Pack'],
    primaryCta: { label: 'Start Notice Only for arrears', href: '/products/notice-only' },
    secondaryCta: { label: 'Need court-ready bundle? Complete Pack', href: '/products/complete-pack' },
    relatedLinks: [
      { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' },
      { label: 'Rent arrears eviction guide', href: '/rent-arrears-eviction-guide' },
      { label: 'Eviction notice pack', href: '/eviction-notice' },
      { label: 'Tenant abandoned property', href: '/tenant-abandoned-property' },
    ],
    sections: [
      { title: 'Diagnose the arrears case before serving anything', paragraphs: long('When a tenant stops paying rent, the first mistake landlords make is reacting with urgency but without file discipline. Courts do not decide cases on frustration; they decide them on chronology, evidence consistency, and whether your notice route was legally available on the day you served it. Start by freezing a reliable timeline: tenancy start, rent due date, every payment received, every shortfall, and the exact arrears balance at each month end. This timeline should match bank records and tenancy agreement terms.', 'Next, decide whether you are pursuing possession only, arrears only, or a coordinated possession-plus-arrears strategy. That decision changes how you draft letters, what evidence you prioritise, and how you frame settlement offers. If the tenant has partial payment history, document every arrangement attempt and every broken promise because courts often scrutinise reasonableness when discretionary grounds are involved. Clear records reduce arguments that arrears were misunderstood or inflated.', 'Finally, separate emotion from legal objective. Your objective is not to punish non-payment; it is to recover control of the property and maximise financial recovery with minimal delay. A commercially sound strategy often means serving correctly first time, preserving optionality between Section 8 and Section 21 where available, and preparing a money claim track in parallel so you are not improvising after possession.') },
      { title: 'Evidence pack: what judges and advisers expect to see', paragraphs: long('A strong arrears evidence pack is usually more valuable than aggressive correspondence. Include the signed tenancy, rent schedule, full ledger, bank statements showing actual receipts, and any agreed repayment plans. Avoid summary spreadsheets that cannot be reconciled to source records. If your figures are challenged, you should be able to prove each line item quickly and calmly. Include dated communications that show the tenant was informed about arrears and had opportunities to resolve.', 'Landlords often lose momentum because the numbers in notices, witness statements, and hearing bundles differ. Build one master arrears schedule and reuse it everywhere. Record rent due, paid, shortfall, running total, and notes for exceptional events such as housing benefit delays or one-off lump sums. If the tenant pays something after service, update records immediately and evaluate whether mandatory grounds remain available. Not updating after part-payment is a common self-inflicted risk.', 'Where affordability conversations happened, preserve those records without over-arguing them. Courts value a landlord who appears organised, factual, and proportionate. Evidence of attempts to engage can support discretionary grounds and improve settlement leverage before hearing. The aim is to make the court’s path simple: accurate numbers, coherent timeline, and no contradictions between documents.') },
      { title: 'Route selection: Section 8, Section 21, or staged combination', paragraphs: long('For many arrears files, Section 8 is the direct route because it addresses the breach itself. However, route strength depends on current arrears level, expected payment volatility, and compliance readiness. If your arrears threshold is fragile because the tenant sometimes pays small sums before key dates, plan for that risk early. A strategy that assumes the threshold will always hold can collapse just before hearing and force avoidable delay.', 'Where Section 21 is still available, many landlords use a staged risk-control approach: preserve no-fault optionality while building arrears evidence robustly. This does not mean serving everything blindly; it means deciding the order and purpose of each step. The best route is the one most likely to survive challenge and deliver possession efficiently, not simply the one that feels fastest today.', 'Use product pages as your main conversion route in this funnel: notice generation for immediate action, complete pack when you need continuity into court, and money-claim product when recovery beyond possession becomes primary. Keeping this sequence explicit improves both landlord outcomes and marketing intent clarity.') },
      { title: 'Pre-court preparation that prevents hearing-day surprises', paragraphs: long('Before issuing a claim, run a contradiction check across all documents. Tenancy dates, rent amount, service dates, and arrears figures must align. If there are discrepancies, correct them now and document why. Do not assume minor inconsistencies are harmless; they can damage credibility and invite unnecessary adjournments. Prepare a concise witness narrative focused on facts, not anger.', 'Prepare for likely tenant responses: payment disputes, disrepair set-off arguments, benefit delay explanations, or requests for extra time. You do not need perfect certainty, but you need a documented response pathway for each scenario. For example, if disrepair is alleged, be ready with inspection history, repair logs, and access correspondence. Many arrears files become mixed disputes when access records are poor.', 'If you expect enforcement later, gather practical information now: occupancy status, vulnerability indicators, and property access considerations. Early preparation shortens the gap between possession order and enforcement action, which is critical in high-loss arrears files.') },
      { title: 'After possession: arrears recovery and enforcement choices', paragraphs: long('Possession is not the end of the commercial problem if arrears remain high. Decide early whether you will pursue post-possession recovery and what evidence you need for a money claim. Preserve tenancy account evidence, checkout records, and forwarding details where available. Delay often weakens recovery because contact trails go cold and assets become harder to identify.', 'Choose enforcement proportionately. A county court judgment can support structured repayment, attachment routes, or further enforcement depending on the debtor profile. Not every debt justifies full enforcement spend, so define your cost-benefit threshold in advance. Landlords who predefine recovery criteria usually avoid throwing good money after bad.', 'Operationally, feed case lessons back into portfolio controls: rent monitoring cadence, arrears trigger letters, guarantor policy, and documentation standards at move-in. Better systems reduce repeat losses and improve future litigation readiness.') },
    ],
    faqs: [
      { question: 'Should I wait for three months arrears before acting?', answer: 'Usually no. Start evidence and communication workflows immediately, then choose route based on legal thresholds and risk.' },
      { question: 'Can I claim arrears and possession together?', answer: 'Often yes, but the right sequence depends on your facts, route eligibility, and evidence quality.' },
      { question: 'Is a payment plan enough to stop eviction preparation?', answer: 'Not by itself. Keep documenting and preserve legal options until performance is stable.' },
    ],
  },
};

export function getPass1Metadata(page: HighIntentPageContent): Metadata {
  const canonical = getCanonicalUrl(`/${page.slug}`);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: { title: page.title, description: page.description, type: 'article', url: canonical },
  };
}
