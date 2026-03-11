import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/money-claim');
const wizardHref = '/products/money-claim?topic=debt&src=seo_money_claim';

export const metadata: Metadata = {
  title: 'Money Claim for Landlords | Recover Rent Arrears and Tenant Debt',
  description:
    'Court-focused landlord guide to recovering rent arrears and tenant debt: pre-action protocol, claim drafting, evidence, judgment and enforcement.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Money Claim for Landlords | Recover Rent Arrears and Tenant Debt',
    description:
      'Practical landlord process for debt recovery from letter before action through county court judgment and enforcement.',
    url: canonicalUrl,
    type: 'website',
  },
};

const processSteps = [
  {
    title: '1) Confirm what is recoverable',
    body: 'Separate contractual rent arrears, property damage, cleaning costs, and utility sums. Tie each item to tenancy terms, invoices, or evidence. Claims built on guesswork often fail at the response stage because tenants challenge unclear totals.',
  },
  {
    title: '2) Follow pre-action protocol',
    body: 'Send a proper letter before claim, supporting statement, and response form where required. Give the tenant a realistic response window and keep delivery evidence. Courts can penalise parties who skip this stage.',
  },
  {
    title: '3) Build a clear evidence bundle',
    body: 'Prepare a dated chronology, rent ledger, tenancy agreement, communication records, and proof of loss. The aim is not volume; it is clarity and consistency from first arrear to issue date.',
  },
  {
    title: '4) Issue the claim on the right route',
    body: 'Use MCOL where suitable, or issue with the correct claim form route if complexity requires it. The legal route should match claim size, defendant details, and the remedies sought.',
  },
  {
    title: '5) Handle response scenarios quickly',
    body: 'If the tenant admits, negotiate payment or move for judgment terms. If they defend, tighten your particulars and evidence. If they do not respond, move promptly for default judgment.',
  },
  {
    title: '6) Enforce if judgment is unpaid',
    body: 'A judgment is not the end if no money arrives. Plan enforcement in advance: attachment of earnings, third-party debt order, charging order, or enforcement officers depending on circumstances.',
  },
];

const claimHeads = [
  'Rent arrears with a month-by-month schedule and payment history.',
  'Damage beyond fair wear and tear, supported by check-in/check-out evidence and quotes.',
  'Cleaning and clearance costs that are reasonably incurred and documented.',
  'Unpaid utility or council-related sums where liability is clearly evidenced.',
  'Interest and court fees where recoverable under the relevant rules.',
];

const risks = [
  'Skipping the pre-action stage because the debt seems obvious.',
  'Using vague particulars that do not explain how the amount was calculated.',
  'Claiming inflated or duplicated items that undermine credibility.',
  'Failing to keep service records for letters and claim documents.',
  'Assuming a CCJ guarantees payment without enforcement planning.',
  'Mixing possession and debt strategy without deciding the primary objective.',
];

export default function MoneyClaimPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Money Claim', url: canonicalUrl },
          ])}
        />
        <UniversalHero
          title="Landlord Money Claim: Recover Rent Arrears and Tenant Debt"
          subtitle="Use a practical court-ready workflow from pre-action protocol to enforcement, with clear drafting and evidence standards that reduce delay risk."
          primaryCta={{ label: 'Start Money Claim Wizard', href: wizardHref }}
          secondaryCta={{ label: 'See unpaid rent guide', href: '/money-claim-unpaid-rent' }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <div className="mx-auto max-w-5xl space-y-10 text-gray-700">
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
              <h2 className="text-2xl font-bold text-gray-900">When this page is the right route</h2>
              <p className="mt-4">
                This page is for landlords with a commercial objective: recover money owed by a current or former tenant through a structured civil debt process.
                You are not here for generic legal theory. You need route clarity, practical steps, and a sequence that preserves credibility if the tenant
                defends the claim. In most cases, the biggest delay drivers are not obscure legal points; they are weak pre-action records, inconsistent
                calculations, and unclear particulars.
              </p>
              <p className="mt-4">
                If your tenant is still in occupation, debt recovery often sits alongside possession strategy. That does not mean doing everything at once.
                It means deciding your primary short-term objective (vacant possession, debt recovery, or both), then choosing documents and timing that do
                not conflict. For many landlords, a clear debt file also improves negotiation leverage before hearing stage.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <Link href="/money-claim-unpaid-rent" className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:border-primary">Unpaid rent claim guide</Link>
                <Link href="/pre-action-protocol-debt" className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:border-primary">Pre-action protocol checklist</Link>
                <Link href="/mcol-money-claim-online" className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:border-primary">MCOL process explainer</Link>
                <Link href="/tools/rent-arrears-calculator" className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:border-primary">Arrears + interest calculator</Link>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-7">
              <h2 className="text-2xl font-bold text-gray-900">End-to-end process landlords should follow</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {processSteps.map((step) => (
                  <article key={step.title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm">{step.body}</p>
                  </article>
                ))}
              </div>
              <p className="mt-6">
                The commercial logic is simple: the earlier you standardise documents and chronology, the less expensive correction work you do later.
                Landlords who leave drafting until the last minute often submit inconsistent amounts, unclear narratives, or missing evidence.
                Those problems can be fixed, but fixing them under deadlines is slower and costlier than building correctly from day one.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
              <h2 className="text-2xl font-bold text-gray-900">What you can usually claim (and how to prove it)</h2>
              <ul className="mt-4 space-y-2">
                {claimHeads.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <p className="mt-4">
                Strong claims connect each figure to a source document. For rent, that is typically tenancy terms plus transaction history. For damage and
                cleaning, that is inventory condition evidence, invoice reasonableness, and causation. For utilities and ancillary sums, liability should
                be explicit in the tenancy arrangement or later agreement. If a number cannot be explained quickly, do not assume a judge will fill the gap.
              </p>
              <p className="mt-4">
                Avoid “bundle dumping.” A large stack of screenshots is not automatically persuasive. Courts and defendants need a readable narrative:
                what was due, what was paid, what remained outstanding, what was communicated, and what opportunities were given to resolve without proceedings.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-7">
              <h2 className="text-2xl font-bold text-gray-900">Particulars of claim: clarity beats complexity</h2>
              <p className="mt-4">
                Your particulars are where many landlord claims underperform. Good particulars are concise, chronological, and specific. They identify the
                legal basis of liability, the key factual events, and the exact sums claimed. They do not rely on emotion or generic accusations.
              </p>
              <p className="mt-4">
                A practical drafting structure is: parties, tenancy context, payment obligations, breach timeline, pre-action steps, amount breakdown,
                interest basis, and relief sought. If the tenant files a defence, this structure helps you respond quickly because each allegation is already
                anchored to a document and date.
              </p>
              <p className="mt-4">
                If you are uncertain whether your matter fits MCOL format constraints, check route suitability early. Re-issuing on another route after
                rejected filing wastes fee budget and time. This is a common issue where landlords copy old templates without adapting to present facts.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
              <h2 className="text-2xl font-bold text-gray-900">Mistakes that weaken otherwise valid debt claims</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {risks.map((risk) => (
                  <p key={risk} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">{risk}</p>
                ))}
              </div>
              <p className="mt-5">
                These are avoidable process failures, not inevitable litigation risk. Most can be reduced through staged prep: protocol documents first,
                arrears and evidence schedule second, particulars third, then issue and service. The order matters.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-7">
              <h2 className="text-2xl font-bold text-gray-900">Response, judgment and enforcement: do not stop at issue</h2>
              <p className="mt-4">
                Many landlords treat claim issue as the finish line. It is only the midpoint. You need a response plan for three outcomes: admission,
                defence, or no response. Admissions may still require careful judgment wording around instalments and default consequences. Defences require
                a disciplined factual response rather than reactive argument. No response requires timely default judgment action and correct procedural steps.
              </p>
              <p className="mt-4">
                After judgment, enforcement strategy should be practical and proportionate. If the debtor has regular employment, attachment of earnings may
                be effective. If you know where funds are held, a third-party debt order can be considered. If the debtor has real property, a charging
                order may protect recovery over time. Enforcement choice is a commercial decision informed by recoverability, not only legal availability.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
              <h2 className="text-2xl font-bold text-gray-900">Should you run debt recovery and possession together?</h2>
              <p className="mt-4">
                This is one of the most important strategic choices for landlords. If the tenant remains in the property and arrears are increasing,
                possession workflow may be the immediate priority because ongoing occupation can expand losses each month. Debt recovery can still run,
                but timing should avoid duplicating work or creating contradictions in your factual narrative.
              </p>
              <p className="mt-4">
                A practical pattern is: stabilise possession route documentation, maintain a clear debt schedule in parallel, then issue debt claim once
                protocol and evidence are fully lined up. Where landlords go wrong is trying to file both routes with partially prepared data and then
                correcting totals repeatedly. Courts expect consistency. Tenants and advisers will exploit inconsistencies where they can.
              </p>
              <p className="mt-4">
                If your goal is fastest vacancy plus later financial recovery, say that explicitly in your internal case notes and document sequence.
                If your goal is immediate debt judgment because tenant has left and traceable assets exist, build your file around recoverability evidence.
                Either way, decide your objective first and draft around it.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-7">
              <h2 className="text-2xl font-bold text-gray-900">Landlord FAQ: high-intent questions before filing</h2>
              <div className="mt-4 space-y-5 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-900">Can you claim after the tenancy ends?</h3>
                  <p className="mt-1">Yes. Former tenant claims are common. The key challenge is service and debtor traceability, not legal entitlement alone.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Should you include every disputed item in one claim?</h3>
                  <p className="mt-1">Only if evidence is mature and coherent. Weak add-ons can dilute otherwise strong rent arrears claims.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Is a hearing always required?</h3>
                  <p className="mt-1">No. Unanswered claims can proceed by default judgment, but the paperwork still needs to be accurate.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Do landlords recover legal costs in full?</h3>
                  <p className="mt-1">Not always. Cost recovery depends on track, conduct, and case outcomes. Build a process that minimises avoidable spend.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">What if the tenant offers instalments before issue?</h3>
                  <p className="mt-1">Assess affordability and compliance risk pragmatically. A realistic plan may outperform immediate issue where recovery is likely.</p>
                </div>
              </div>
            </section>


            <section className="rounded-2xl border border-gray-200 bg-white p-7">
              <h2 className="text-2xl font-bold text-gray-900">Commercial playbook: choosing actions by debt profile</h2>
              <p className="mt-4">
                Not every arrears case should be run the same way. Your decision should reflect debt size, evidence quality, and probable recoverability.
                For smaller clean debts with clear payment records, speed and clarity matter most. For larger or mixed claims (rent, damage, utilities),
                document discipline matters more because defendant challenge risk increases.
              </p>
              <p className="mt-4">
                A useful approach is to classify the case before issue: (1) likely uncontested and collectible, (2) likely uncontested but difficult to enforce,
                (3) likely defended, or (4) factually complex. This classification informs how much detail you need in particulars, whether settlement should be
                prioritised, and how aggressively to plan enforcement. Treat this as commercial triage, not legal pessimism.
              </p>
              <p className="mt-4">
                Landlords often over-focus on hearing outcomes and under-focus on collectability. A perfect judgment against an untraceable debtor can be less
                valuable than a well-documented settlement or staged enforcement path. Build your plan around realistic cash recovery, not just litigation milestones.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
              <h2 className="text-2xl font-bold text-gray-900">Internal links for next step clarity</h2>
              <p className="mt-4">
                Use the pages below as a practical sequence, not random reading. Start with protocol and debt quantification, then route specifics,
                then enforcement support:
              </p>
              <ul className="mt-4 space-y-2">
                <li>• <Link href="/pre-action-protocol-debt" className="text-primary hover:underline">Pre-action protocol debt guide</Link> for compliant first contact and response windows.</li>
                <li>• <Link href="/tools/rent-arrears-calculator" className="text-primary hover:underline">Rent arrears calculator</Link> for clear running totals and interest logic.</li>
                <li>• <Link href="/mcol-money-claim-online" className="text-primary hover:underline">MCOL process page</Link> for online issue and response handling.</li>
                <li>• <Link href="/money-claim-small-claims-landlord" className="text-primary hover:underline">Small claims landlord guide</Link> for hearing-stage expectations.</li>
                <li>• <Link href="/money-claim-ccj-enforcement" className="text-primary hover:underline">CCJ enforcement guide</Link> for post-judgment recovery options.</li>
              </ul>
              <p className="mt-4">
                Sequencing content this way helps landlords avoid the most common failure pattern: filing quickly, then backfilling core protocol and evidence records
                under deadline pressure.
              </p>
            </section>
            <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-7">
              <h2 className="text-2xl font-bold text-gray-900">Landlord next steps</h2>
              <p className="mt-4">
                If you need to move now, start with a structured pack and then tailor it to your evidence. You can also branch into specialised pages for
                route-specific detail (MCOL process, unpaid rent depth guide, protocol requirements, and arrears tools).
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={wizardHref} className="hero-btn-primary">Start money claim workflow</Link>
                <Link href="/products/complete-pack" className="hero-btn-secondary">Tenant still in property? See complete eviction pack</Link>
              </div>
            </section>
          </div>
        </Container>
      </main>
    </div>
  );
}
