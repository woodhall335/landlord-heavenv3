import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { StructuredData, articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { PASS1_PAGES, getPass1Metadata } from '@/lib/seo/high-intent-pass1-pages';
import { getCanonicalUrl } from '@/lib/seo';

const page = PASS1_PAGES['tenant-stopped-paying-rent'];
export const metadata: Metadata = getPass1Metadata(page);

const faqs = [
  { question: 'Should I wait until rent arrears hit two full months before taking any action?', answer: 'No. Build your arrears file from the first missed payment. Early records, contact logs, and payment chronology make later legal steps faster and more defensible. Waiting usually increases losses and weakens your ability to explain the timeline cleanly if the case reaches court.' },
  { question: 'Can partial payments stop a possession claim?', answer: 'Partial payments can change route strength, especially if you rely on mandatory arrears thresholds. That is why landlords should update arrears schedules after every payment and run route checks before issue and again before hearing. Treat partial payments as a legal variable, not just accounting noise.' },
  { question: 'What evidence should I gather before serving notice?', answer: 'Use a court-ready bundle: tenancy agreement, rent schedule, bank receipts, arrears ledger, service evidence, communication history, repayment offers, and any repair/access logs. Keep one master chronology and one master arrears table so every document tells the same story.' },
  { question: 'What should I do between notice service and court issue?', answer: 'Use that period to pressure-test the file. Reconcile numbers, document further defaults, keep communication factual, and decide whether settlement terms are commercially sensible. This window is where good landlords remove inconsistencies and avoid hearing-day surprises.' },
  { question: 'How do I recover arrears after possession?', answer: 'Possession and debt recovery are separate decisions. After regaining the property, confirm final ledger totals, assess debtor profile, and choose proportionate enforcement. Not every debt justifies full enforcement cost, but having a defined recovery policy prevents ad hoc decisions.' },
  { question: 'Is a direct wizard flow the best first action?', answer: 'For this page the product-first route is deliberate: start with Notice Only where legal route certainty exists, then move to Complete Pack when continuity into court is needed. That keeps user intent aligned with operational stage and avoids premature route commitment.' },
];

const canonical = getCanonicalUrl('/tenant-stopped-paying-rent');

export default function TenantStoppedPayingRentPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper pagePath="/tenant-stopped-paying-rent" pageTitle={page.title} pageType="guide" jurisdiction="england" />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={articleSchema({ headline: page.title, description: page.description, url: canonical, datePublished: '2026-03-01', dateModified: '2026-03-11' })} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Tenant stopped paying rent', url: canonical }])} />

      <UniversalHero
        title="Tenant Stopped Paying Rent: Arrears Recovery and Possession Blueprint"
        subtitle="Build a legally coherent arrears strategy with route selection, partial-payment handling, evidence discipline, and staged escalation before losses compound."
        primaryCta={{ label: 'Start Notice Only for arrears', href: '/products/notice-only?src=stopped_paying_rent_notice' }}
        secondaryCta={{ label: 'Need court continuity? Use Complete Pack', href: '/products/complete-pack?src=stopped_paying_rent_complete' }}
        mediaSrc="/images/wizard-icons/06-notice-details.png"
        mediaAlt="Rent arrears action icon"
        showReviewPill
        showTrustPositioningBar
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          <li>✓ Deeper arrears route selection for unstable payment behaviour</li>
          <li>✓ Partial payment scenarios mapped to legal and commercial decisions</li>
          <li>✓ Evidence checklist, escalation timeline, and post-possession recovery plan</li>
        </ul>
      </UniversalHero>

      <section className="py-12 bg-white" data-page-body>
        <Container>
          <div className="mx-auto max-w-5xl space-y-8 text-gray-700 leading-7">
            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Arrears route selection: choose for durability, not panic speed</h2>
              <p>If a tenant has stopped paying, your first strategic choice is whether you are pursuing immediate notice action, dual-route risk management, or a staged possession-and-recovery pathway. Landlords who act purely on urgency often create contradictions that become visible only at hearing. The route should be selected by legal availability, payment volatility, and your ability to evidence facts consistently across notice, claim form, witness statement, and hearing bundle. If your arrears threshold can swing because the tenant makes intermittent payments, treat that as a central design variable from day one.</p>
              <p>High-performing arrears files are built like project plans. Define your objective, define your failure points, and define your trigger conditions for escalation. For example, if the tenant pays less than contractual rent but enough to alter a threshold at a key date, your route confidence changes. If compliance history is incomplete, a fallback path may be safer than an aggressive single-track strategy. This page intentionally separates tactical speed from legal resilience so landlords can preserve momentum without exposing the case to avoidable resets.</p>
            </article>

            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Partial-payment scenarios that derail weak possession plans</h2>
              <p>Partial payments are one of the most misunderstood risks in arrears possession work. A tenant may pay irregularly, clear one month partially, then default again. If your documentation process is loose, your notice assumptions can become stale before issue. You need a repeatable protocol: record payment date, allocation month, shortfall impact, and whether legal route strength changed. Do not rely on memory or informal spreadsheet edits. The court will assess whether your numbers are accurate at each material stage, not whether your intent was reasonable.</p>
              <p>There are several common patterns: symbolic payments immediately before deadlines, negotiated but unkept promises, housing-benefit delays with sporadic catch-up amounts, and third-party one-off transfers that do not restore regular performance. Each pattern requires a different response. Sometimes settlement on strict terms is commercially correct; sometimes immediate escalation protects long-term recovery. What matters is that you document why each decision was taken and how it aligned with your legal route. This section exists to stop the classic error of treating every incoming payment as automatic progress.</p>
            </article>

            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Evidence checklist: what to assemble before service</h2>
              <p>Your pre-service evidence pack should be structured so an external reviewer can understand the file within minutes. Include the signed tenancy, any variation documents, deposit records, rent schedule, complete ledger, bank transaction evidence, and a dated communication log. Add copies of reminder letters, repayment proposals, and responses. If repairs or access are likely to be raised defensively, include those records now rather than reacting later. Courts reward files that are coherent, contemporaneous, and internally consistent.</p>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Master arrears table with contractual due date, paid amount, and running balance by period.</li>
                <li>Service evidence plan for every notice or key letter, including method and timestamp trail.</li>
                <li>Chronology note explaining payment behaviour, contact attempts, and decision milestones.</li>
                <li>Document reconciliation check so figures match across notice draft, claim draft, and witness evidence.</li>
                <li>Commercial loss summary showing ongoing exposure and rationale for escalation timing.</li>
              </ul>
              <p>Landlords who complete this checklist before serving avoid most avoidable adjournment triggers. It is not about creating legal theatre; it is about removing contradictions that opposing advisers can exploit.</p>
            </article>

            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Escalation timeline from first miss to enforcement readiness</h2>
              <p>Think in phases. Phase one is detection and stabilisation: confirm missed payment, issue factual communication, and start ledger controls. Phase two is route preparation: validate legal pathway, assemble evidence, and pre-draft service documentation. Phase three is notice execution with active monitoring: serve correctly, track new payments, and preserve service proof. Phase four is claim readiness: final checks, witness narrative discipline, and hearing bundle structure. Phase five is post-order enforcement planning, including property access and debt recovery decisioning.</p>
              <p>Most delay is generated by transitions between phases, not the phases themselves. Files stall because landlords change strategy without resetting documents, receive partial payments without updating calculations, or move to claim with unresolved inconsistencies. A timeline model prevents that. It also improves portfolio management because each active arrears case can be scored by stage, risk, and next required action. This allows better resource allocation across multiple properties and reduces crisis-led management.</p>
            </article>

            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">What to do before court: file hardening and settlement discipline</h2>
              <p>Before issue, run a contradiction audit. Check dates, names, arrears figures, service records, and narrative consistency. If your numbers changed because of payments after notice, capture that clearly with a supplemental schedule. Draft witness evidence in plain factual language that explains what happened, what was requested, and what remains unpaid. Avoid emotional commentary. Judges respond better to concise evidence than to frustration-based rhetoric.</p>
              <p>At this stage you should also define settlement boundaries. Some cases benefit from strict consent terms; others require decisive progression because history shows repeated default. Settlement offers should be operationally realistic and time-bound. Document every proposal and response so the court can see you acted proportionately. A disciplined pre-court process increases leverage and often shortens total case duration even where settlement fails.</p>
            </article>

            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">What to do after possession: debt triage and prevention loop</h2>
              <p>After possession, immediately complete final account reconciliation and evidence lock. Confirm move-out condition, meter positions, and any additional losses. Then assess debt recovery viability against cost, enforceability, and debtor profile. A written triage framework prevents impulsive enforcement spend and helps you prioritise cases where recovery probability is high enough to justify action. The objective is net recovery, not procedural activity.</p>
              <p>Use every closed case to improve future controls: rent monitoring triggers, communication templates, guarantor standards, and evidence protocol at tenancy start. Landlords who institutionalise lessons reduce repeat arrears severity and achieve faster outcomes when disputes recur. This page is designed as an operational blueprint, not just a legal checklist, because real portfolio performance depends on execution quality before, during, and after the possession stage.</p>
            </article>

            <article className="rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Internal guides for next decision points</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Link href="/section-8-grounds-explained" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Section 8 grounds explained: choose grounds with evidence alignment</Link>
                <Link href="/how-long-does-eviction-take" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">How long eviction takes: timing assumptions by route stage</Link>
                <Link href="/eviction-timeline-uk" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Eviction timeline UK: operational checkpoints and delay traps</Link>
                <Link href="/products/complete-pack?src=stopped_paying_rent_internal" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Complete Pack when you need continuity from notice to court</Link>
              </div>
            </article>
          </div>
        </Container>
      </section>

      <FAQSection faqs={faqs} title="Tenant stopped paying rent FAQs" />
    </div>
  );
}
