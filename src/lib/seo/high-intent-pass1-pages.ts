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
    description: 'Detailed landlord guide for rent arrears cases: evidence, notice choice, arrears schedule, court preparation, and recovery strategy.',
    heroTitle: 'Tenant Stopped Paying Rent: What to Do Next',
    heroSubtitle: 'A practical landlord guide to arrears evidence, notice choice, and possession planning without avoidable resets.',
    icon: '/images/wizard-icons/06-notice-details.png',
    heroBullets: ['Ground 8 threshold and timing explained', 'How to keep the arrears evidence clear', 'When to start with Notice Only and when to move to Complete Pack'],
    primaryCta: { label: 'Start Notice Only for arrears', href: '/products/notice-only' },
    secondaryCta: { label: 'Need court-ready paperwork too? Complete Pack', href: '/products/complete-pack' },
    relatedLinks: [
      { label: 'Section 8 grounds explained', href: '/section-8-grounds-explained' },
      { label: 'Rent arrears eviction guide', href: '/rent-arrears-eviction-guide' },
      { label: 'Eviction notice pack', href: '/eviction-notice' },
      { label: 'Tenant abandoned property', href: '/tenant-abandoned-property' },
    ],
    sections: [
      { title: 'Diagnose the arrears case before serving anything', paragraphs: long('When a tenant stops paying rent, the first mistake landlords often make is rushing into action without getting the file in order. Courts do not decide cases on frustration. They look at the timeline, the evidence, and whether the notice you served was actually available on that date. Start with a clear record of the tenancy start, each rent due date, every payment received, each shortfall, and the arrears balance at the end of each period. That timeline should match the bank records and the tenancy agreement.', 'Next, decide whether you are mainly seeking possession, arrears recovery, or both. That choice affects the letters you send, the evidence you prioritise, and the way you handle settlement discussions. If the tenant has a history of partial payments, record every arrangement and every broken promise because courts often look closely at reasonableness where discretionary grounds are involved.', 'Finally, keep the legal aim separate from the emotion of the dispute. The point is not to punish late payment. It is to get control of the property back and recover what you reasonably can without unnecessary delay. In many cases that means serving the right notice first time, keeping both Section 8 and Section 21 in mind where available, and preparing for a money claim in parallel if the debt is likely to remain after possession.') },
      { title: 'Evidence pack: what judges and advisers expect to see', paragraphs: long('A strong arrears evidence pack is usually more useful than aggressive chasing letters. Include the signed tenancy, a clear rent schedule, the full ledger, bank records showing what was actually received, and any repayment plans that were agreed. Avoid summary sheets that cannot be checked against source documents. If the figures are challenged, you should be able to explain each line calmly and quickly.', 'Landlords often lose momentum because the numbers in the notice, witness statement, and court bundle do not match. Build one master arrears schedule and use it everywhere. Record the rent due, what was paid, the shortfall, the running total, and anything unusual such as benefit delays or a one-off lump sum. If the tenant pays anything after service, update the records immediately and check whether the grounds you were relying on still stand.', 'If there were affordability discussions, keep those records too without turning them into a long argument. Courts usually respond well to landlords who appear organised, factual, and proportionate. The aim is to make the court\'s job simple: accurate numbers, a clear timeline, and no contradictions between documents.') },
      { title: 'Choosing between Section 8, Section 21, or a staged approach', paragraphs: long('For many arrears cases, Section 8 is the direct option because it deals with the breach itself. But whether it is the strongest option depends on the current arrears level, how likely the tenant is to make small part-payments, and whether the surrounding paperwork is in good order. If the threshold could move before the hearing, plan for that risk early rather than assuming it will still be there later.', 'Where Section 21 is still available, some landlords choose to keep the no-fault option open while building the arrears evidence properly. That does not mean serving everything blindly. It means deciding the order and purpose of each step. The best option is usually the one most likely to survive a challenge and get you to possession cleanly, not simply the one that sounds quickest today.', 'If you mainly need the notice and supporting documents prepared properly, start with Notice Only. If the case is already moving towards a claim and you want the paperwork to stay joined up, move to Complete Pack. If possession is no longer the main issue and the debt recovery is, a money claim may become the better next step.') },
      { title: 'Pre-court preparation that prevents hearing-day surprises', paragraphs: long('Before issuing a claim, compare the dates, names, service details, and arrears figures across every document. If there are discrepancies, correct them now and keep a short note explaining why. Small inconsistencies can damage credibility and lead to unnecessary delay.', 'Think ahead to the tenant responses you may face: payment disputes, disrepair set-off arguments, benefit delay explanations, or requests for extra time. You do not need to know exactly what will be said, but you do need a sensible response path for each likely issue. If disrepair is raised, for example, you should already know where the inspection records, repair logs, and access correspondence are.', 'If enforcement may be needed later, gather the practical information early. Occupancy status, vulnerability concerns, and access arrangements can all matter once you have the order, and it is much easier to think about them before the last minute.') },
      { title: 'After possession: arrears recovery and enforcement choices', paragraphs: long('Possession does not end the problem if the arrears are still substantial. Decide early whether you are likely to pursue the money after the tenant leaves and what evidence you would need for that claim. Keep the tenancy account, checkout records, and any forwarding details together. Delay often makes recovery harder because contact trails go cold and assets become more difficult to trace.', 'Be proportionate about enforcement. A county court judgment can support repayment, attachment of earnings, or further enforcement depending on the debtor\'s situation. But not every debt is worth every enforcement step. Set a sensible threshold in advance so you do not spend more trying to recover the debt than the likely outcome justifies.', 'Once the case is over, use it to improve your own systems. Rent monitoring, early arrears letters, guarantor policy, and move-in documentation all affect how easy the next case will be to manage.') },
    ],
    faqs: [
      { question: 'Should I wait for three months arrears before acting?', answer: 'Usually no. Start gathering the evidence and keeping the communications clear straight away, then choose the legal step that fits the arrears position.' },
      { question: 'Can I claim arrears and possession together?', answer: 'Often yes, but the order still matters. The best sequence depends on the facts, the notice position, and how strong the evidence is.' },
      { question: 'Is a payment plan enough to stop eviction preparation?', answer: 'Not by itself. Keep documenting what has been agreed and keep your legal options open until the payments are stable again.' },
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

