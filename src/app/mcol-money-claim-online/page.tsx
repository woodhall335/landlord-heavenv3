import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { mcolFAQs } from '@/data/faqs';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';

const moneyClaimProductLink = '/products/money-claim';

export const metadata: Metadata = {
  title: 'MCOL Money Claim Online | Landlord Process Guide for Rent Arrears',
  description:
    'Practical landlord guide to MCOL (Money Claim Online): pre-action protocol, particulars drafting, response handling, judgment and enforcement.',
  keywords: [
    'MCOL',
    'money claim online',
    'MCOL landlord',
    'money claim rent arrears',
    'county court claim',
    'recover rent arrears',
    'small claims court landlord',
  ],
  openGraph: {
    title: 'MCOL Money Claim Online | Landlord Process Guide for Rent Arrears',
    description:
      'How landlords should use Money Claim Online (MCOL) with compliant pre-action steps and court-ready drafting.',
    type: 'article',
    url: getCanonicalUrl('/mcol-money-claim-online'),
  },
  alternates: {
    canonical: getCanonicalUrl('/mcol-money-claim-online'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'MCOL Money Claim Online', url: '/mcol-money-claim-online' },
];

const mcolPitfalls = [
  'Issuing before protocol steps are complete and documented.',
  'Using vague particulars that do not explain the debt calculation.',
  'Claiming amounts that cannot be traced to tenancy records or invoices.',
  'Waiting too long to request default judgment after no response.',
  'Assuming judgment equals payment without enforcement planning.',
  'Not preparing for a defence even where the debt appears straightforward.',
];

export default function MCOLPage() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        <UniversalHero
          badge="Debt Recovery"
          title="MCOL: Money Claim Online for Landlords"
          subtitle="Use the county court online route with the right pre-action records, drafting standards, and response strategy to recover rent arrears and tenant debt."
          primaryCta={{ label: 'View Money Claim Pack', href: moneyClaimProductLink }}
          secondaryCta={{ label: 'Calculate Arrears', href: '/tools/rent-arrears-calculator' }}
          variant="pastel"
        />

        <section className="bg-white py-8">
          <Container>
            <div className="max-w-4xl mx-auto">
              <SeoPageContextPanel pathname="/mcol-money-claim-online" />
            </div>
          </Container>
        </section>

        <Container>
          <div className="max-w-4xl mx-auto py-12 space-y-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="prose prose-slate max-w-none">
                <h2>What MCOL is (and why landlords use it)</h2>
                <p>
                  MCOL is the government&apos;s online county court claim route for qualifying debt cases in England and Wales. For landlords,
                  it is commonly used to recover unpaid rent, tenancy-linked damage costs, unpaid utility sums, and other contractual debts.
                  The commercial advantage is speed and process clarity versus ad hoc paper filing.
                </p>
                <p>
                  The practical warning is equally important: MCOL is only efficient when your pre-action work and particulars are strong.
                  Weak preparation creates delays, amendments, or avoidable defence risk. In other words, MCOL is a filing route, not a substitute
                  for case preparation.
                </p>

                <h2>Before MCOL: complete pre-action protocol properly</h2>
                <p>
                  You should complete the <Link href="/pre-action-protocol-debt" className="text-primary hover:underline">Pre-Action Protocol for Debt Claims</Link>
                  {' '}before issue. That usually means a clear letter before claim, supporting information, a response window, and a record of what
                  was sent and when. Courts can penalise non-compliance even where the underlying debt is genuine.
                </p>
                <ol>
                  <li>State the debt clearly, including dates and calculations.</li>
                  <li>Attach supporting schedule and core documents where appropriate.</li>
                  <li>Allow the correct response period and keep proof of delivery.</li>
                  <li>Consider reasonable repayment proposals before issue.</li>
                </ol>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                  <p className="text-amber-800 font-semibold mb-2">Court-facing principle</p>
                  <p className="text-amber-700 text-sm">
                    Judges expect parties to attempt proportionate pre-action resolution. Good protocol records improve your position if the tenant later
                    argues unreasonable conduct or requests adverse costs orders.
                  </p>
                </div>

                <h2>MCOL process for landlords: step by step</h2>
                <h3>Step 1: Build your debt file before logging in</h3>
                <p>
                  Prepare your claim narrative first: tenancy terms, payment obligations, missed payments, correspondence, and total owed.
                  If you draft this offline, your MCOL entry is faster and less error-prone.
                </p>

                <h3>Step 2: Enter claim details and particulars accurately</h3>
                <p>
                  Include the defendant&apos;s correct details, debt basis, and concise particulars. Avoid emotional or broad allegations. Courts need
                  a factual and contractual explanation: what was due, what was unpaid, and why the defendant is liable.
                </p>

                <h3>Step 3: Pay court fee and monitor service milestones</h3>
                <p>
                  Court fees are added to the claim. After service, response deadlines begin running. Track dates tightly. Delay at this stage can
                  mean missed default judgment opportunities.
                </p>

                <h3>Step 4: Handle responses by scenario</h3>
                <ul>
                  <li><strong>No response:</strong> Apply for default judgment promptly.</li>
                  <li><strong>Admission:</strong> Seek judgment terms that are realistic and enforceable.</li>
                  <li><strong>Defence:</strong> Prepare concise factual rebuttal tied to documents and chronology.</li>
                </ul>

                <h3>Step 5: Plan enforcement before judgment arrives</h3>
                <p>
                  If your debtor profile suggests payment resistance, pre-plan likely enforcement paths. Attachment of earnings, third-party debt orders,
                  charging orders, or enforcement officers each suit different recoverability profiles.
                </p>

                <h2>How to draft better particulars for rent arrears claims</h2>
                <p>
                  Particulars should read like a structured timeline, not a complaint letter. A practical format is: tenancy start and rent terms,
                  arrears chronology, protocol steps taken, total claimed, interest basis, and relief sought.
                </p>
                <p>
                  Where landlords lose credibility is inconsistent numbers. Your rent ledger, letter before claim, and issued claim amount should reconcile.
                  If you revise figures, explain the reason clearly and update every linked document.
                </p>

                <h2>MCOL suitability limits and route choice</h2>
                <p>
                  MCOL has route constraints and is not ideal for every matter. If your case includes complex non-monetary issues, unclear defendant identity,
                  or procedural complications, assess whether another claim route is better before paying issue fees.
                </p>
                <p>
                  For many straightforward landlord debt cases, MCOL remains the fastest route from protocol completion to judgment stage, provided that
                  drafting and evidence quality are handled properly.
                </p>

                <h2>Common landlord mistakes on MCOL claims</h2>
                <ul>
                  {mcolPitfalls.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <h2>MCOL and possession strategy: keep objectives clear</h2>
                <p>
                  If your tenant still occupies the property, debt recovery should be coordinated with possession planning. Decide whether your immediate
                  objective is vacancy, financial recovery, or both. Then sequence documents accordingly so the two routes support rather than conflict.
                </p>
                <p>
                  A common approach is to preserve a strong ongoing debt schedule while progressing possession on the right notice and court path.
                  This avoids rushed drafting and preserves negotiation leverage.
                </p>

                <h2>After judgment: enforcement is part of the process, not an afterthought</h2>
                <p>
                  A county court judgment confirms liability but does not guarantee payment. Effective recovery often depends on choosing enforcement that
                  matches the debtor&apos;s circumstances. If income is stable, attachment may work. If funds are traceable, third-party debt route may be
                  suitable. If assets exist, a charging route may protect longer-term recovery.
                </p>
              </div>
            </div>


            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="prose prose-slate max-w-none">
                <h2>MCOL pre-issue quality standard (landlord checklist)</h2>
                <p>
                  Before issuing, run a strict quality check. Good claims are predictable because every number and date is traceable. Weak claims rely on assumptions.
                  The checklist below is designed to reduce rework and improve conversion from issue to enforceable outcome.
                </p>
                <ul>
                  <li>Debt schedule reconciles with tenancy terms and payment records.</li>
                  <li>Letter before claim and supporting forms were sent and logged.</li>
                  <li>Response period has expired or been handled reasonably.</li>
                  <li>Particulars are factual, concise, and free from duplicated sums.</li>
                  <li>Service details are accurate and defendant identity is confirmed.</li>
                  <li>Post-judgment enforcement path has been considered in advance.</li>
                </ul>
                <h2>If the tenant defends: how to stay in control</h2>
                <p>
                  A defence does not mean your claim is weak. It means your case management now matters more. Respond by returning to chronology:
                  tenancy obligation, payment history, protocol correspondence, and amount reconciliation. Resist the urge to expand into broad narrative.
                  Precision usually performs better than volume.
                </p>
                <p>
                  Keep your litigation posture commercially grounded. If defence points are minor and debt remains largely uncontested, targeted settlement discussions
                  can save time without sacrificing recovery value. If core liability is denied, strengthen documentary proof and proceed methodically.
                </p>
                <h2>Drafting particulars that survive scrutiny</h2>
                <p>
                  Think of particulars as a contract-and-numbers summary, not a grievance statement. Courts need to understand legal basis and debt arithmetic quickly.
                  Start with tenancy terms (rent amount, due frequency, payment method), then list the missed periods, partial payments, and resulting balance.
                  If claiming ancillary sums such as damage or cleaning, separate those heads and identify documentary sources.
                </p>
                <p>
                  Where possible, avoid blended totals without explanation. A defendant should be able to test each figure against your schedule.
                  This transparency lowers defence opportunities and helps if the case progresses to allocation or hearing. If you rely on statutory interest,
                  state the period and rate clearly so the court can replicate the calculation.
                </p>

                <h2>Evidence architecture for landlords</h2>
                <p>
                  Good MCOL cases use a simple evidence architecture: core contract documents, payment records, pre-action correspondence, and issue-stage filings.
                  Keep each document labelled by date and purpose. If a document does not support liability, quantum, or conduct, it may not belong in your primary file.
                </p>
                <p>
                  Build a one-page chronology that references document numbers. This becomes your navigation tool when responding to tenant messages,
                  preparing witness material, or discussing settlement. Without this, landlords often re-read large files repeatedly and still miss inconsistencies.
                </p>

                <h2>Settlement and negotiation inside the MCOL lifecycle</h2>
                <p>
                  Commercially, settlement can be a strong outcome when repayment reliability exists. The objective is net recovery with controlled risk,
                  not litigation for its own sake. Use clear terms: amount admitted, payment schedule, default consequences, and whether judgment is entered,
                  stayed, or requested on breach. Ambiguous agreements usually create a second dispute.
                </p>
                <p>
                  Even where you prefer judgment, a realistic pre-hearing offer can show reasonableness and help cost arguments later. Keep negotiation records factual,
                  dated, and consistent with your pleaded case. Do not make side concessions that conflict with your debt schedule.
                </p>

                <h2>Landlord execution checklist (weekly)</h2>
                <ul>
                  <li>Update arrears and payment records with reconciliation notes.</li>
                  <li>Review deadlines for responses, acknowledgments, and judgment applications.</li>
                  <li>Log every tenant communication with date, summary, and action taken.</li>
                  <li>Check whether enforcement intelligence has improved (employer, bank, assets).</li>
                  <li>Reassess whether settlement now outperforms litigation timeline.</li>
                </ul>
                <p>
                  Consistent weekly case control is often the difference between a file that drifts and a file that converts into payment.
                </p>
                <h2>MCOL landlord FAQ for decision points</h2>
                <p>
                  <strong>Can you claim if the tenant has moved out?</strong> Yes, provided service and defendant identification are handled correctly.
                  Former tenant claims are common, but tracing quality affects enforceability.
                </p>
                <p>
                  <strong>Should you include every disputed charge in one claim?</strong> Only where evidence is mature.
                  Adding weak heads of loss can reduce confidence in your strongest rent arrears elements.
                </p>
                <p>
                  <strong>Is default judgment automatic?</strong> It is procedural, not automatic in the casual sense.
                  You still need correct issue, service, timing, and application steps.
                </p>
                <p>
                  <strong>When should you escalate to legal advice?</strong> Escalate when claims become legally complex,
                  defence raises substantive technical points, or multi-party liability creates procedural risk.
                  For straightforward debt recovery, disciplined process and evidence usually matter most.
                </p>

                <h2>MCOL timing discipline</h2>
                <p>
                  Date control is a practical advantage in debt litigation. Track protocol expiry dates, response deadlines, acknowledgment windows, and judgment request timing.
                  Inactivity after valid service is one of the easiest places to lose momentum. Landlords who run a dated action log typically progress faster and with fewer errors.
                </p>

                <h2>Final takeaway for high-intent landlords</h2>
                <p>
                  MCOL works best when treated as part of a disciplined recovery system: protocol compliance, accurate pleading, date control,
                  and enforcement planning. Landlords who adopt this system usually move faster, defend challenges more effectively, and recover a higher
                  proportion of debts than landlords who issue quickly with incomplete files.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Related landlord actions</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Link href="/money-claim-unpaid-rent" className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-primary transition-colors">
                  Read full unpaid rent claim guide
                </Link>
                <Link href="/how-to-sue-tenant-for-unpaid-rent" className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-primary transition-colors">
                  Step-by-step: sue tenant for rent arrears
                </Link>
                <Link href="/money-claim-small-claims-landlord" className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-primary transition-colors">
                  Small claims landlord process
                </Link>
                <Link href="/products/complete-pack" className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-primary transition-colors">
                  Tenant still in property? Add possession workflow
                </Link>
              </div>
            </div>

            <div>
              <FAQSection
                faqs={mcolFAQs}
                title="MCOL Frequently Asked Questions"
                showContactCTA={false}
                variant="white"
              />
            </div>

            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Ready to issue a stronger MCOL claim?</h2>
              <p className="text-gray-600 mb-6">
                Build your claim pack with protocol documents, arrears schedule structure, and court-ready drafting flow.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/products/money-claim" className="hero-btn-primary">
                  Get Money Claim Pack
                </Link>
                <Link href="/tools/rent-arrears-calculator" className="hero-btn-secondary">
                  Calculate Arrears First
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
