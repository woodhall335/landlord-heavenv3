import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { form6aFAQs } from '@/data/faqs';
import { FunnelCta } from '@/components/funnels';

export const metadata: Metadata = {
  title: 'Form 6A Section 21 Notice | Official Template + Guide',
  description:
    'Form 6A Section 21 notice guide for England landlords. Download the official template, avoid invalid service mistakes, and generate a pre-filled notice fast.',
  keywords: [
    'form 6a',
    'form 6a section 21',
    'section 21 form 6a',
    'form 6a download',
    'form 6a template',
    'section 21 notice form',
    'prescribed form 6a',
  ],
  openGraph: {
    title: 'Form 6A Section 21 Notice | Landlord Heaven',
    description:
      'Everything you need to know about Form 6A - the official Section 21 eviction notice for England.',
    type: 'article',
    url: getCanonicalUrl('/form-6a-section-21'),
  },
  alternates: {
    canonical: getCanonicalUrl('/form-6a-section-21'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Tools', url: '/tools' },
  { name: 'Form 6A Section 21', url: '/form-6a-section-21' },
];

export default function Form6APage() {

  const enhancedFaqs = [
    ...form6aFAQs,
    { question: "What is the biggest reason landlords get delayed?", answer: "The biggest delay driver is poor evidence and date inconsistencies. Keep a clean chronology, reconcile all amounts, and keep robust proof of service." },
    { question: "Should I keep copies of every letter and attachment?", answer: "Yes. Keep every version sent, all enclosures, and proof of service. Courts often focus on documentary quality when deciding credibility." },
    { question: "When should I move from template stage to paid workflow?", answer: "Move as soon as the matter may escalate to court, disputed arrears, or possession. A guided workflow reduces rejection risk and duplicated costs." },
  ];

  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">England Only</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Form 6A Section 21 Notice Template (England)
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Need a Form 6A Section 21 notice? Form 6A is the prescribed notice for no-fault possession in England, and small errors can invalidate your notice. This page shows what to include, how to set dates correctly, and when to use a compliance-checked Notice Only service.
              </p>
            </div>
          </Container>
        </section>

        <Container>
          <div className="-mt-8 mb-10">
            <FunnelCta
              title="Get a compliant Form 6A drafted and served"
              subtitle="Start with Notice Only now, and move to full possession support if the tenant stays."
              primaryHref="/products/notice-only"
              primaryText="Start Notice Only"
              primaryDataCta="notice-only"
              location="above-fold"
              secondaryLinks={[{ href: '/products/complete-pack', text: 'Need full eviction support?', dataCta: 'complete-pack' }]}
            />
          </div>
        </Container>

        {/* Quick Actions */}
        <Container>
          <div className="grid md:grid-cols-2 gap-6 -mt-8 mb-12">
            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Generate Pre-Filled Form 6A</h2>
              <p className="text-gray-600 mb-4">
                Answer a few questions and get a correctly completed Form 6A ready to serve.
              </p>
              <Link
                href="/tools/free-section-21-notice-generator"
                className="hero-btn-primary inline-block"
              >
                Generate Free Notice
              </Link>
            </div>

            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Get Full Notice Pack</h2>
              <p className="text-gray-600 mb-4">
                Form 6A plus compliance checklist, service instructions, and validity checks.
              </p>
              <Link href="/products/notice-only" className="hero-btn-secondary inline-block">
                View Notice Pack
              </Link>
            </div>
          </div>
        </Container>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="prose prose-slate max-w-none">
                <h2>What is Form 6A?</h2>
                <p>
                  Form 6A is the prescribed notice form under Section 21 of the Housing Act 1988 (as
                  amended by the Deregulation Act 2015). It replaced the older "Section 21(1)(b)"
                  and "Section 21(4)(a)" notices from 1 October 2015.
                </p>
                <p>
                  You must use Form 6A (or a form "substantially to the same effect") for all
                  assured shorthold tenancies in England where you want to regain possession without
                  proving fault.
                </p>

                <p className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  Once your dates and compliance documents are confirmed, you can move from a free starter document to a
                  <Link href="/products/notice-only" className="text-primary hover:underline"> court-ready Notice Only pack</Link>
                  that prepares service evidence and next-step guidance.
                </p>

                <h2>When Can You Use Form 6A?</h2>
                <ul>
                  <li>The tenancy is an assured shorthold tenancy (AST)</li>
                  <li>
                    The property is in <strong>England</strong> (Wales has different forms)
                  </li>
                  <li>At least 4 months have passed since the tenancy began</li>
                  <li>You have protected the deposit and served prescribed information</li>
                  <li>
                    You have provided the EPC, Gas Safety Certificate, and <Link href="/how-to-rent-guide" className="text-primary hover:underline">How to Rent guide</Link>
                  </li>
                  <li>No relevant improvement notice or emergency remedial action is in effect</li>
                </ul>

                <h2>How to Complete Form 6A</h2>
                <p>Form 6A requires the following information:</p>
                <ol>
                  <li>
                    <strong>Section 1:</strong> Tenant name(s)
                  </li>
                  <li>
                    <strong>Section 2:</strong> The date you require possession (minimum 2 months
                    from service)
                  </li>
                  <li>
                    <strong>Section 3:</strong> Property address
                  </li>
                  <li>
                    <strong>Section 4:</strong> Landlord name, address, and signature
                  </li>
                </ol>

                <h2>Notice Period Requirements</h2>
                <p>
                  The notice must give at least <strong>2 months&apos; notice</strong>. The expiry
                  date must be:
                </p>
                <ul>
                  <li>At least 2 months from the date of service</li>
                  <li>On or after the end of any fixed term</li>
                  <li>
                    On or after the last day of a period of the tenancy (for periodic tenancies)
                  </li>
                </ul>

                <h2>Common Form 6A Mistakes</h2>
                <ul>
                  <li>Using the wrong form (Welsh form, old format, or unofficial template)</li>
                  <li>Giving less than 2 months&apos; notice</li>
                  <li>Not aligning the expiry date with the tenancy period</li>
                  <li>Serving before complying with deposit protection requirements</li>
                  <li>Not providing the How to Rent guide before serving</li>
                </ul>

                <div className="my-8">
                  <FunnelCta
                    title="Need the next step ready as well?"
                    subtitle="If your notice expires and the tenant does not leave, you will need possession action."
                    primaryHref="/products/complete-pack"
                    primaryText="Get full eviction support"
                    primaryDataCta="complete-pack"
                    location="mid"
                    secondaryLinks={[
                      { href: '/section-21-expired-what-next', text: 'Read next steps after expiry' },
                      { href: '/products/notice-only', text: 'Start with Notice Only', dataCta: 'notice-only' },
                    ]}
                  />
                </div>

                <h2>Form 6A vs Form 3 (Section 8)</h2>
                <p>
                  Form 6A is for <Link href="/no-fault-eviction" className="text-primary hover:underline">no-fault evictions</Link> where you don&apos;t need to
                  prove the tenant did anything wrong. <Link href="/form-3-section-8" className="text-primary hover:underline">Form 3</Link> (Section 8) is for{' '}
                  <strong>fault-based</strong> evictions like rent arrears or breach of tenancy.
                </p>
                <p>
                  <Link href="/section-21-vs-section-8" className="text-primary hover:underline">
                    Compare Section 21 vs Section 8
                  </Link>
                </p>
              </div>
            </div>

    

        <section className="py-10 bg-white" id="snippet-opportunities">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>What Is Form 6A?</h2>
              <p>Form 6A is the prescribed Section 21 notice used in England when a landlord seeks possession without alleging tenant fault. It must contain the correct tenancy details, notice dates, and statutory wording. If service or compliance steps are missing, the notice can be treated as invalid by the court.</p>
              <p>Use the official format and make sure every date aligns with tenancy records and service evidence.</p>

              <h2>How Long Is a Section 21 Notice?</h2>
              <p>A Section 21 notice period is usually at least two months in England. The expiry date must give the tenant the full minimum notice period and be calculated accurately from service. If notice timing is wrong, possession proceedings may be delayed and the landlord may need to serve again.</p>

              <h2>Section 21 Notice Deposit Protection</h2>
              <p>A Section 21 notice is normally invalid if the tenancy deposit was not protected correctly and prescribed information was not served within the legal deadline. Landlords should resolve deposit issues before serving notice. Courts commonly check deposit compliance first when deciding whether possession can proceed.</p>

              <h2>Section 21 Template Free</h2>
              <p>A free Section 21 template should mirror Form 6A wording and include property details, tenant names, landlord details, and a valid notice expiry date. Free starter documents are useful only when completed accurately and served with reliable proof, because formatting or date errors can invalidate possession action.</p>

              <h2>Section 21 Eviction Timeline UK</h2>
              <p>A typical Section 21 timeline includes serving Form 6A, waiting the full notice period, issuing a possession claim if the tenant stays, and then enforcing any possession order. Timeframes vary by court workload, service quality, and whether paperwork is disputed at any stage.</p>

              <h3>How to Serve a Section 21 Notice</h3>
              <ol>
                <li>Confirm deposit protection and prescribed information compliance.</li>
                <li>Verify gas safety, EPC, and required document service history.</li>
                <li>Complete Form 6A with correct names, address, and dates.</li>
                <li>Serve notice using the tenancy agreement service clause.</li>
                <li>Keep dated proof of delivery and a service record.</li>
              </ol>

              <h3>Definition: Accelerated Possession</h3>
              <p>Accelerated possession is a court route used after a valid Section 21 notice where the landlord seeks possession without claiming rent arrears in the same claim. It is usually paper-based at first and still requires complete compliance documents and proof of service.</p>

              <h3>Definition: N5B</h3>
              <p>N5B is the possession claim form commonly used for accelerated possession in England after a Section 21 notice expires. It asks for tenancy details, compliance evidence, and service information. Incomplete or inconsistent answers can cause delays, requests for clarification, or claim rejection.</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" id="guide-navigation">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Landlord Guide</h2>
              <p className="text-gray-700 mb-6">Use this expanded resource for the Form 6A Section 21 service and possession preparation workflow. It is designed for landlords who need practical steps, legal context, and clear evidence standards before serving notices or issuing court claims.</p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <a href="#legal-framework" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Legal framework</a>
                <a href="#step-by-step" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Step-by-step process</a>
                <a href="#mistakes" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Common mistakes</a>
                <a href="#evidence-checklist" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Evidence checklist</a>
                <a href="#timeline-breakdown" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Timeline breakdown</a>
                <a href="#comparison-table" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Comparison table</a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="legal-framework">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Legal Framework Explained for Landlords</h2>
              <p>Landlords get better outcomes when they treat document generation as one part of a full legal workflow. Courts and adjudicators are not only checking whether you used the right template, but also whether you followed the statutory sequence correctly, gave fair notice, and can prove service and compliance. In practice, failures usually happen because a landlord serves too early, uses the wrong dates, or cannot evidence how documents were served.</p>
              <p>The strongest approach is to work from statute to action: identify the governing rules, map those rules to your tenancy facts, then generate documents only after validation. That means confirming tenancy type, start date, rent schedule, deposit status, safety records, licensing, prior correspondence, and any relevant protocol steps. Doing this once in a structured way dramatically reduces avoidable delays and repeat filings.</p>
              <p>Jurisdiction matters at every stage. England, Wales, Scotland, and Northern Ireland have different possession frameworks and terminology, so always anchor your action plan to property location and tenancy regime before relying on any form wording. If you manage across multiple regions, keep separate compliance checklists and document packs for each jurisdiction to avoid cross-jurisdiction errors.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="step-by-step">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Step-by-Step Landlord Process</h2>
              <ol>
                <li><strong>Diagnose the case type:</strong> define whether your objective is debt recovery, possession, or both. This affects notice choice, court track, and evidence format.</li>
                <li><strong>Validate tenancy facts:</strong> check names, address, tenancy dates, rent frequency, rent due date, and occupant status against signed records.</li>
                <li><strong>Run compliance checks:</strong> confirm deposit and prescribed information position, statutory certificates, licensing duties, and any pre-action requirements.</li>
                <li><strong>Select the right pathway:</strong> choose notice-only, debt claim, or combined strategy based on arrears level, tenant behaviour, and timescale.</li>
                <li><strong>Prepare a clear chronology:</strong> build a dated timeline of rent events, correspondence, reminders, and evidence collection milestones.</li>
                <li><strong>Generate the document pack:</strong> produce accurate forms and letters with matching dates, amounts, and party details. Keep consistency across all documents.</li>
                <li><strong>Serve correctly:</strong> use permitted methods, serve all required attachments, and preserve proof of service and delivery attempts.</li>
                <li><strong>Track response windows:</strong> diarise notice expiry, payment deadlines, response dates, and court filing windows so deadlines are never missed.</li>
                <li><strong>Escalate with evidence:</strong> if no resolution, move to court or next notice stage using the same chronology and evidence bundle.</li>
                <li><strong>Keep communication professional:</strong> clear, factual communication often improves settlement chances and strengthens your position if litigation follows.</li>
              </ol>
              <p>This structured process is intentionally conservative. It prioritises enforceability over speed-at-all-costs and prevents rework. Where landlords skip steps, the usual outcome is not just delay; it is duplicated fees, repeated service, and weaker negotiating leverage.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="mistakes">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Common Mistakes That Cause Rejection or Delay</h2>
              <ul>
                <li>Using a generic document draft without checking tenancy type and jurisdiction.</li>
                <li>Serving before prerequisites are satisfied or without required enclosures.</li>
                <li>Date errors: invalid expiry dates, inconsistent chronology, or impossible timelines.</li>
                <li>Amount errors: rent arrears totals that do not reconcile to ledger entries.</li>
                <li>Weak service evidence: no certificate, no proof of posting, no witness notes.</li>
                <li>Switching strategy late without updating previous letters and chronology.</li>
                <li>Overly aggressive correspondence that undermines credibility in court.</li>
              </ul>
              <p>Most of these errors are preventable with a pre-service checklist and a single source of truth for dates and amounts. Keep a master timeline and update it every time you send or receive correspondence.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="evidence-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Evidence Checklist Before You Escalate</h2>
              <ul>
                <li>Signed tenancy/licence agreement and any renewals or variations.</li>
                <li>Rent schedule or ledger showing due dates, paid dates, and running balance.</li>
                <li>Copies of reminder letters, demand notices, and tenant responses.</li>
                <li>Proof of service for every formal document (post, email trail, witness, certificate).</li>
                <li>Compliance documents relevant to your pathway and jurisdiction.</li>
                <li>Chronology document mapping each event to supporting evidence.</li>
                <li>Settlement record where payment plans were offered or negotiated.</li>
              </ul>
              <p className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">Need a faster route from guidance to action? Use our <Link href="/products/notice-only" className="text-primary underline">recommended product pathway</Link> to generate compliance-checked documents and keep service evidence aligned for next steps.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="timeline-breakdown">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Timeline Breakdown</h2>
              <p><strong>Day 0-3:</strong> identify issue, verify tenancy facts, and begin chronology. <strong>Day 4-10:</strong> issue first formal communication and gather proof of service. <strong>Day 11-30:</strong> monitor response and update arrears or compliance records. <strong>Post-deadline:</strong> choose escalation route, finalise evidence bundle, and prepare filing-ready documents.</p>
              <p>Where deadlines are statutory, build in a safety margin and avoid last-day actions. If your process relies on post, include deemed service assumptions and non-delivery contingencies. If your process relies on email, keep complete metadata and sent-item logs.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="comparison-table">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy Comparison Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left">Route</th>
                      <th className="border border-gray-200 p-3 text-left">Best for</th>
                      <th className="border border-gray-200 p-3 text-left">Main risk</th>
                      <th className="border border-gray-200 p-3 text-left">Evidence priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3">Template-only self service</td>
                      <td className="border border-gray-200 p-3">Confident landlords with clean facts</td>
                      <td className="border border-gray-200 p-3">Date/compliance mistakes</td>
                      <td className="border border-gray-200 p-3">Service proof + chronology</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">Guided product workflow</td>
                      <td className="border border-gray-200 p-3">Most landlords needing speed + certainty</td>
                      <td className="border border-gray-200 p-3">Incomplete source information</td>
                      <td className="border border-gray-200 p-3">Validation outputs + attached records</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Immediate court escalation</td>
                      <td className="border border-gray-200 p-3">No response after valid notice/protocol</td>
                      <td className="border border-gray-200 p-3">Weak bundle preparation</td>
                      <td className="border border-gray-200 p-3">Complete documentary bundle</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>



        <section className="py-6 bg-gray-50" id="practical-scenarios">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Practical Landlord Scenarios and Decision Rules</h2>
              <p>Landlords rarely manage ideal cases. Real files usually include partial payment, incomplete paperwork, changing tenant communication, and competing objectives around speed, debt recovery, and possession certainty. For Form 6A Section 21, the best decision is usually the one that preserves options rather than forcing a single-route strategy too early. That is why experienced landlords separate diagnosis from document generation: first classify the problem, then choose the legal route, then build evidence that supports that route.</p>
              <p><strong>Scenario 1: Cooperative but financially stretched tenant.</strong> Start with a firm written plan, confirm the amount due, and set review points. Keep every communication factual and date-stamped. If payments fail twice, escalate immediately rather than allowing repeated informal extensions that weaken your position.</p>
              <p><strong>Scenario 2: No response after formal notice or arrears letter.</strong> Treat silence as a process signal. Move from reminder to formal stage according to your timeline, keep service proof, and avoid emotional wording. The absence of response often makes documentary quality more important, not less.</p>
              <p><strong>Scenario 3: Tenant disputes numbers.</strong> Provide a reconciliation schedule showing each charge, payment, and balance movement. Link each figure to source records. Courts and mediators favour landlords who can produce clear arithmetic and consistent chronology.</p>
              <p><strong>Scenario 4: Multiple tenants or occupants.</strong> Confirm who is legally liable, who signed, and how notices should be addressed and served. Do not assume all occupiers have identical status. Incorrect party details are a frequent source of avoidable delays.</p>
              <p><strong>Scenario 5: Property condition counter-allegations.</strong> Keep maintenance logs, inspection records, contractor invoices, and response times. Even where your main claim is possession or debt, condition evidence can influence credibility and case management outcomes.</p>
              <p>Use the following decision rules to stay on track: validate facts before serving, serve once but serve properly, never let deadlines pass without next-step action, and preserve evidence at the point of event rather than reconstructing later. If your case may reach court, assume every date, amount, and communication could be scrutinised line by line.</p>
              <p>From an operations perspective, create a single case file containing tenancy documents, timeline, financial schedule, correspondence, service proof, and escalation notes. This prevents fragmented evidence and allows fast handover to legal support if needed. Landlords who maintain structured files generally resolve matters faster, either through payment, settlement, or successful court progression.</p>
              <p>Finally, distinguish between urgency and haste. Urgency means acting promptly within a defined legal sequence. Haste means skipping verification to issue documents quickly. The first improves outcomes; the second often causes re-service, adjournment, or rejection. A disciplined, evidence-led approach is the most reliable route to faster possession and stronger debt recovery.</p>
            </div>
          </div>
        </section>



        <section className="py-6 bg-white" id="advanced-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Advanced Pre-Court Checklist for Landlords</h2>
              <p>Use this advanced checklist before final service or filing. It is designed to reduce preventable rejection and improve clarity if your matter is reviewed by a judge, adviser, or mediator.</p>
              <ul>
                <li>Identity and party data verified against signed agreement and latest correspondence.</li>
                <li>Property address appears consistently in every document version and enclosure.</li>
                <li>Tenancy dates, start terms, and any renewals documented without contradiction.</li>
                <li>Rent amount, due date, and payment method cross-checked to bank evidence.</li>
                <li>Arrears or claim schedule reconciled line by line with source transactions.</li>
                <li>Notice or letter date logic checked against statutory minimum periods.</li>
                <li>Service method matches tenancy clause and jurisdiction requirements.</li>
                <li>Certificate of service, proof of posting, and witness note retained.</li>
                <li>All statutory or protocol prerequisites completed and evidenced.</li>
                <li>Communication trail exported with dates, senders, and full message text.</li>
                <li>Photographic or inspection evidence indexed where condition issues exist.</li>
                <li>Any payment plan proposals recorded with acceptance or refusal dates.</li>
                <li>Escalation decision note written to explain why next legal step is justified.</li>
                <li>Bundle index prepared so every statement can be matched to a document.</li>
                <li>Final quality pass completed by reading documents as if you were the court.</li>
              </ul>
              <p>When landlords complete this checklist, case quality improves in three ways: fewer factual errors, stronger service evidence, and cleaner chronology. These improvements directly affect negotiation leverage and reduce avoidable adjournments.</p>
              <p>As a practical rule, if any key item above is incomplete, pause and correct it before service or filing. A one-day delay for quality control is usually better than a multi-week delay caused by rejected or disputed paperwork.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
            <div className="mt-12">
              {/* FAQ schema must be rendered exactly once (via FAQSection). */}
      <FAQSection
                faqs={enhancedFaqs}
                title="Form 6A Frequently Asked Questions"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Create Your Form 6A?
              </h2>
              <p className="text-gray-600 mb-6">
                Generate a correctly completed Section 21 notice in minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/tools/free-section-21-notice-generator" className="hero-btn-primary">
                  Free Generator
                </Link>
                <Link href="/products/complete-pack" className="hero-btn-secondary" data-cta="complete-pack" data-cta-location="bottom">
                  Need full eviction support?
                </Link>
              </div>
            </div>
          </div>
        </Container>

        {/* Bottom padding */}
        <div className="py-12" />
      </div>
    </>
  );
}
