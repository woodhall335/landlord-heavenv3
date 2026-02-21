import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { lodgerAgreementFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Lodger Agreement Template UK (Live-In Landlords) | Free Template for Live-In Landlords',
  description:
    'Lodger agreement template UK for live-in landlords. Download a free template, understand lodger rights, and create terms for rent, notice, and house rules.',
  keywords: [
    'lodger agreement template',
    'lodger agreement UK',
    'lodger contract template',
    'live in landlord agreement',
    'lodger agreement free',
    'lodger licence agreement',
    'room rental agreement UK',
  ],
  openGraph: {
    title: 'Lodger Agreement Template UK (Live-In Landlords) | Landlord Heaven',
    description:
      'Free lodger agreement template for live-in landlords. Download or generate online.',
    type: 'article',
    url: getCanonicalUrl('/lodger-agreement-template'),
  },
  alternates: {
    canonical: getCanonicalUrl('/lodger-agreement-template'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Lodger Agreement Template', url: '/lodger-agreement-template' },
];

export default function LodgerAgreementPage() {

  const enhancedFaqs = [
    ...lodgerAgreementFAQs,
    { question: "What is the biggest reason landlords get delayed?", answer: "The biggest delay driver is poor evidence and date inconsistencies. Keep a clean chronology, reconcile all amounts, and keep robust proof of service." },
    { question: "Should I keep copies of every letter and attachment?", answer: "Yes. Keep every version sent, all enclosures, and proof of service. Courts often focus on documentary quality when deciding credibility." },
    { question: "When should I move from template stage to paid workflow?", answer: "Move as soon as the matter may escalate to court, disputed arrears, or possession. A guided workflow reduces rejection risk and duplicated costs." },
  ];

  return (
    <>
      <StructuredData data={faqPageSchema(enhancedFaqs)} />
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">Live-In Landlords</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Lodger Agreement Template UK (Live-In Landlords)
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Need a lodger agreement template UK landlords can use with confidence? If you live in the property, you normally need a lodger agreement rather than an AST. Start with the right legal structure, then customise rent, notice, and house rules.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/products/ast" className="hero-btn-primary">
                  Get Lodger Agreement
                </Link>
                <Link href="/products/ast" className="hero-btn-secondary">
                  Compare Standard vs Premium Pack
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>Lodger vs Tenant: What&apos;s the Difference?</h2>
                <p>
                  The key difference is whether the landlord lives in the property:
                </p>
                <ul>
                  <li>
                    <strong>Lodger:</strong> The landlord lives in the property. The lodger shares
                    common areas (kitchen, bathroom) with the landlord. The lodger is an &quot;excluded
                    occupier&quot; with limited rights.
                  </li>
                  <li>
                    <strong>Tenant:</strong> The landlord doesn&apos;t live in the property. The tenant
                    has exclusive possession. The tenant has full assured shorthold tenancy (AST)
                    protections.
                  </li>
                </ul>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                  <p className="text-amber-800 font-semibold mb-2">Important</p>
                  <p className="text-amber-700 text-sm">
                    If you don&apos;t live in the property, you cannot use a lodger agreement. You must
                    use an Assured Shorthold Tenancy agreement instead. Using the wrong agreement
                    could give your occupant tenant rights.
                  </p>
                </div>

                <h2>What Should a Lodger Agreement Include?</h2>
                <p>A comprehensive lodger agreement should cover:</p>
                <ul>
                  <li>
                    <strong>Names and addresses:</strong> Both landlord and lodger details
                  </li>
                  <li>
                    <strong>Room details:</strong> Which room(s) the lodger can use exclusively
                  </li>
                  <li>
                    <strong>Shared areas:</strong> Kitchen, bathroom, living areas they can access
                  </li>
                  <li>
                    <strong>Rent amount and payment:</strong> How much, when, and how to pay
                  </li>
                  <li>
                    <strong>Deposit:</strong> Amount and terms (no protection required)
                  </li>
                  <li>
                    <strong>Notice period:</strong> How much notice either party must give
                  </li>
                  <li>
                    <strong>Services included:</strong> Bills, Wi-Fi, meals, laundry, etc.
                  </li>
                  <li>
                    <strong>House rules:</strong> Guests, smoking, pets, quiet hours, etc.
                  </li>
                </ul>

                <p className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  If you want a faster route from free template to signed paperwork, use our
                  <Link href="/products/ast" className="text-primary hover:underline"> tenancy agreement product pack</Link>
                  to generate and download your final document in one flow.
                </p>

                <h2>Rent a Room Scheme</h2>
                <p>
                  The government&apos;s Rent a Room scheme lets you earn up to <strong>£7,500 per year</strong>{' '}
                  tax-free from letting a furnished room in your main home. This applies whether you
                  have one lodger or several.
                </p>
                <p>Key points:</p>
                <ul>
                  <li>The room must be in your main home (not a second property)</li>
                  <li>The room must be furnished</li>
                  <li>If you earn over £7,500, you must declare it on your tax return</li>
                  <li>The scheme is automatic - you don&apos;t need to apply</li>
                </ul>

                <h2>Ending a Lodger Agreement</h2>
                <p>
                  Because lodgers are &quot;excluded occupiers,&quot; they have fewer rights than tenants:
                </p>
                <ul>
                  <li>You can give notice as agreed in the lodger agreement</li>
                  <li>There&apos;s no minimum statutory notice period</li>
                  <li>You don&apos;t need a court order to evict</li>
                  <li>You can change the locks after the notice expires (though courts prefer
                      reasonable notice)</li>
                </ul>
                <p>
                  However, always follow the notice period in your agreement and treat the lodger
                  fairly to avoid potential harassment claims.
                </p>

                <h2>Do I Need to Do Anything Else?</h2>
                <ul>
                  <li>
                    <strong>Right to Rent:</strong> Yes, you must check the lodger&apos;s immigration
                    status
                  </li>
                  <li>
                    <strong>Deposit protection:</strong> No, not required for lodgers
                  </li>
                  <li>
                    <strong>Gas safety certificate:</strong> Recommended but not legally required
                  </li>
                  <li>
                    <strong>EPC:</strong> Not required for lodgers
                  </li>
                  <li>
                    <strong>How to Rent guide:</strong> Not required for lodgers
                  </li>
                </ul>
              </div>
            </div>

    

        <section className="py-10 bg-white" id="snippet-opportunities">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>What Is a Lodger Agreement?</h2>
              <p>A lodger agreement is a written contract between a resident landlord and someone renting a room in the landlord’s home. It sets rent, notice terms, house rules, and included services. Clear written terms help prevent disputes and show each party’s rights and obligations.</p>

              <h2>Rolling Tenancy Agreement</h2>
              <p>A rolling tenancy agreement continues periodically, usually month to month, after an initial fixed term ends or where no fixed term is used. Payments and notice periods repeat by period. The agreement should state notice requirements clearly so both parties understand how arrangements can end.</p>

              <h3>Lodger vs Tenant Comparison</h3>
              <table>
                <thead>
                  <tr><th>Point</th><th>Lodger</th><th>Tenant</th></tr>
                </thead>
                <tbody>
                  <tr><td>Landlord residence</td><td>Landlord lives in property</td><td>Landlord usually lives elsewhere</td></tr>
                  <tr><td>Legal status</td><td>Licensee arrangement</td><td>Tenancy with statutory rights</td></tr>
                  <tr><td>Possession route</td><td>Reasonable notice and licence terms</td><td>Formal possession process</td></tr>
                  <tr><td>Exclusive possession</td><td>Usually limited</td><td>Usually granted</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" id="guide-navigation">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Landlord Guide</h2>
              <p className="text-gray-700 mb-6">Use this expanded resource for the lodger agreement setup process for live-in landlords. It is designed for landlords who need practical steps, legal context, and clear evidence standards before serving notices or issuing court claims.</p>
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
                <li>Using a generic template without checking tenancy type and jurisdiction.</li>
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
              <p className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">Need a faster route from guidance to action? Use our <Link href="/products/ast" className="text-primary underline">recommended product pathway</Link> to generate compliance-checked documents and keep service evidence aligned for next steps.</p>
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
              <p>Landlords rarely manage ideal cases. Real files usually include partial payment, incomplete paperwork, changing tenant communication, and competing objectives around speed, debt recovery, and possession certainty. For lodger agreement management, the best decision is usually the one that preserves options rather than forcing a single-route strategy too early. That is why experienced landlords separate diagnosis from document generation: first classify the problem, then choose the legal route, then build evidence that supports that route.</p>
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
            <div className="mb-12">
              <FAQSection
                faqs={enhancedFaqs}
                title="Lodger Agreement FAQ"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Need a Lodger Agreement?
              </h2>
              <p className="text-gray-600 mb-6">
                Get a professionally drafted lodger agreement template.
              </p>
              <Link href="/products/ast" className="hero-btn-primary">
                Get Lodger Agreement
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
