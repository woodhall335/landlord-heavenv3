import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Evict a Tenant in the UK | Complete Landlord Guide | LandlordHeaven',
  description:
    'Learn how to evict a tenant in the UK with a clear, legal step-by-step process covering Section 21, Section 8, possession orders, timelines, bailiffs, and documents.',
  alternates: {
    canonical: 'https://landlordheaven.co.uk/how-to-evict-a-tenant-uk',
  },
};

export default function HowToEvictTenantUkPage() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                LandlordHeaven Legal Guide
              </p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                How to Evict a Tenant in the UK (Complete Landlord Guide)
              </h1>
              <p className="mt-5 text-lg text-slate-700">
                Evicting a tenant in the UK must follow a strict legal process. If landlords try to
                remove a tenant without following the correct steps, the eviction can be invalid or
                even illegal.
              </p>
              <p className="mt-4 text-slate-700">
                This guide explains how to evict a tenant in the UK step-by-step, including the
                correct notices to serve, the court process, and how bailiff enforcement works.
              </p>
              <p className="mt-4 text-slate-700">
                Whether you are dealing with rent arrears, tenancy breaches, or ending a tenancy,
                understanding the eviction process helps you regain possession of your property while
                staying compliant with UK law.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">
                [PLACEHOLDER: Hero illustration showing landlord eviction process UK]
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Suggested alt text: "Landlord reviewing the legal eviction process UK from notice to
                bailiff enforcement"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-2xl font-bold">Quick Answer: How to Evict a Tenant in the UK</h2>
          <p className="mt-4 text-slate-700">The legal eviction process in the UK normally involves five main stages.</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">
            <li>Confirm the tenancy type and eviction route.</li>
            <li>Serve the correct eviction notice (Section 21 or Section 8).</li>
            <li>Wait for the notice period to expire.</li>
            <li>Apply to the county court for a possession order.</li>
            <li>Request bailiff enforcement if the tenant does not leave.</li>
          </ol>
          <p className="mt-4 text-slate-700">
            Most eviction cases fail or get delayed because of incorrect notices, missing
            documents, or poor record-keeping. Preparing a clear timeline and evidence pack before
            serving notice significantly improves success rates.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">In this guide</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a href="#comparison" className="text-blue-700 hover:underline">Section 21 vs Section 8 comparison</a>
            <a href="#process" className="text-blue-700 hover:underline">Step-by-step eviction process UK</a>
            <a href="#timeline" className="text-blue-700 hover:underline">Eviction timeline UK</a>
            <a href="#checklist" className="text-blue-700 hover:underline">Evidence and documents checklist</a>
            <a href="#mistakes" className="text-blue-700 hover:underline">Common eviction mistakes</a>
            <a href="#faqs" className="text-blue-700 hover:underline">FAQs</a>
          </div>
        </div>
      </section>

      <section id="comparison" className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">Section 21 vs Section 8 comparison</h2>
        <p className="mt-3 text-slate-700">
          When learning how to evict a tenant in the UK, landlords normally choose between two legal routes.
        </p>
        <p className="text-slate-700">These are Section 21 eviction and Section 8 eviction.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Route</th>
                <th className="px-4 py-3 font-semibold">Best used when</th>
                <th className="px-4 py-3 font-semibold">Notice</th>
                <th className="px-4 py-3 font-semibold">Court path</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3">Section 21 eviction</td>
                <td className="px-4 py-3">Ending tenancy without proving tenant breach</td>
                <td className="px-4 py-3">At least two months (Form 6A)</td>
                <td className="px-4 py-3">Often accelerated possession</td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3">Section 8 eviction</td>
                <td className="px-4 py-3">Tenant breach such as rent arrears eviction UK cases</td>
                <td className="px-4 py-3">Depends on grounds (often 14 days for Ground 8)</td>
                <td className="px-4 py-3">Standard possession hearing usually required</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">
            [PLACEHOLDER: Section 21 vs Section 8 comparison graphic]
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Suggested alt text: "Visual comparison of section 21 eviction and section 8 eviction routes in England"
          </p>
        </div>
      </section>

      <section id="process" className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">Eviction Process UK: Step-by-Step Guide</h2>
        <p className="mt-3 text-slate-700">
          Understanding the UK eviction process helps landlords avoid costly mistakes and regain possession faster.
        </p>
        <p className="text-slate-700">The correct process depends on the tenancy agreement and the reason for eviction.</p>

        <div className="mt-6 space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-bold">Step 1: Confirm the Tenancy Type</h3>
            <p className="mt-3 text-slate-700">Before starting an eviction, landlords should confirm the tenancy structure.</p>
            <p className="mt-3 text-slate-700">Most private landlords in England use Assured Shorthold Tenancies (ASTs). These can be:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Fixed-term tenancies</li>
              <li>Periodic tenancies</li>
            </ul>
            <p className="mt-3 text-slate-700">The tenancy type determines which eviction route can be used.</p>
            <p className="mt-3 text-slate-700">Landlords must also confirm that key compliance requirements were met when the tenancy began, including:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Deposit protection</li>
              <li>Gas safety certificate</li>
              <li>Energy Performance Certificate (EPC)</li>
              <li>“How to Rent” guide</li>
            </ul>
            <p className="mt-3 text-slate-700">Failure to provide these documents can invalidate a Section 21 eviction notice.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-bold">Step 2: Choose the Correct Eviction Route</h3>
            <p className="mt-3 text-slate-700">Section 21 Eviction (No-Fault Eviction)</p>
            <p className="mt-3 text-slate-700">
              Section 21 allows landlords to regain possession of the property without proving tenant wrongdoing.
            </p>
            <p className="mt-3 text-slate-700">It is commonly used when landlords want to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Sell the property</li>
              <li>Move back into the property</li>
              <li>End a tenancy at the end of a fixed term</li>
              <li>Change tenants</li>
            </ul>
            <p className="mt-3 text-slate-700">Key points about Section 21 eviction:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Requires at least two months notice</li>
              <li>Must use Form 6A</li>
              <li>Can only be used if legal compliance requirements are met</li>
              <li>Cannot be served during the first four months of a tenancy</li>
            </ul>
            <p className="mt-3 text-slate-700">
              If the tenant does not leave after the notice expires, the landlord can apply for accelerated possession through the court.
            </p>

            <p className="mt-5 text-slate-700">Section 8 Eviction (Tenant Breach)</p>
            <p className="mt-3 text-slate-700">Section 8 is used when the tenant has broken the terms of the tenancy agreement.</p>
            <p className="mt-3 text-slate-700">Common reasons include:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Rent arrears</li>
              <li>Anti-social behaviour</li>
              <li>Property damage</li>
              <li>Breach of tenancy conditions</li>
            </ul>
            <p className="mt-3 text-slate-700">The notice period depends on the grounds for possession used.</p>
            <p className="mt-3 text-slate-700">For example:</p>
            <p className="mt-3 text-slate-700">Ground 8 (rent arrears) often requires 14 days notice.</p>
            <p className="mt-3 text-slate-700">
              Section 8 eviction cases usually require a court hearing, where the landlord must present evidence.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-bold">Step 3: Serve the Eviction Notice</h3>
            <p className="mt-3 text-slate-700">Once the correct route is chosen, landlords must serve a valid notice.</p>
            <p className="mt-3 text-slate-700">Common eviction notices include:</p>
            <p className="mt-3 text-slate-700">Section 21 Form 6A – Ending a tenancy without fault</p>
            <p className="text-slate-700">Section 8 Form 3 – Tenant breach or rent arrears</p>
            <p className="mt-3 text-slate-700">Serving the notice correctly is critical.</p>
            <p className="mt-3 text-slate-700">Landlords should keep proof of service such as:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Certificate of posting</li>
              <li>Recorded delivery</li>
              <li>Witness statement</li>
              <li>Email confirmation (if allowed by tenancy agreement)</li>
            </ul>
            <p className="mt-3 text-slate-700">
              Incorrect notice service is one of the most common reasons eviction claims fail in court.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-bold">Step 4: Apply for a Possession Order</h3>
            <p className="mt-3 text-slate-700">If the tenant does not leave after the notice period expires, landlords must apply to court.</p>
            <p className="mt-3 text-slate-700">This is done through the county court possession process.</p>
            <p className="mt-3 text-slate-700">There are two main court routes.</p>
            <h4 className="mt-4 font-semibold">Accelerated Possession (Section 21)</h4>
            <p className="mt-3 text-slate-700">Accelerated possession is normally used when:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>The landlord only wants the property back</li>
              <li>No rent arrears claim is included</li>
            </ul>
            <p className="mt-3 text-slate-700">Advantages include:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Often no court hearing required</li>
              <li>Faster than standard possession claims</li>
              <li>Suitable for most valid Section 21 notices</li>
            </ul>
            <p className="mt-3 text-slate-700">The court will review the paperwork and may issue a possession order without a hearing.</p>

            <h4 className="mt-4 font-semibold">Standard Possession Claim</h4>
            <p className="mt-3 text-slate-700">Standard possession claims are used when:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Rent arrears are involved</li>
              <li>Section 8 eviction is used</li>
              <li>The landlord wants both possession and rent recovery</li>
            </ul>
            <p className="mt-3 text-slate-700">The court will usually schedule a possession hearing.</p>
            <p className="mt-3 text-slate-700">During the hearing, the judge will review:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Rent arrears records</li>
              <li>Tenancy agreement</li>
              <li>Eviction notice</li>
              <li>Evidence of breach</li>
            </ul>
            <p className="mt-3 text-slate-700">If successful, the court will grant a possession order.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-bold">Step 5: Enforce the Eviction</h3>
            <p className="mt-3 text-slate-700">If the tenant still does not leave after a possession order, enforcement becomes necessary.</p>
            <p className="mt-3 text-slate-700">The landlord can apply for:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>County Court Bailiffs</li>
              <li>High Court Enforcement Officers</li>
            </ul>
            <p className="mt-3 text-slate-700">Only authorised bailiffs can legally remove tenants from the property.</p>
            <p className="mt-3 text-slate-700">Landlords must never attempt:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Lock changes</li>
              <li>Removing tenant belongings</li>
              <li>Threatening eviction</li>
            </ul>
            <p className="mt-3 text-slate-700">These actions may be considered illegal eviction.</p>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5">
          <p className="font-semibold">Watch out</p>
          <p className="mt-2 text-slate-700">
            Illegal eviction can result in criminal and civil penalties. Always follow the legal
            eviction notice UK and possession order UK process before arranging any bailiff eviction UK action.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">[PLACEHOLDER: Notice to court to bailiff flowchart]</p>
          <p className="mt-1 text-sm text-slate-600">
            Suggested alt text: "Flowchart of eviction notice UK to possession order UK and bailiff eviction UK"
          </p>
        </div>
      </section>

      <section id="timeline" className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">Eviction timeline UK: how long does it take to evict a tenant UK</h2>
        <p className="mt-3 text-slate-700">UK Eviction Timeline</p>
        <p className="mt-3 text-slate-700">Typical eviction timelines:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          <li>Notice period – 2 weeks to 2 months</li>
          <li>Court processing – 6 to 10 weeks</li>
          <li>Possession order – around 14 days</li>
          <li>Bailiff enforcement – 2 to 6 weeks</li>
        </ul>
        <p className="mt-3 text-slate-700">Most eviction cases take around 3 to 6 months.</p>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold text-slate-900">[PLACEHOLDER: Eviction process timeline infographic]</p>
          <p className="mt-1 text-sm text-slate-600">
            Suggested alt text: "Eviction timeline UK from notice period to court order and bailiff enforcement"
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="font-semibold">Key takeaway</p>
          <p className="mt-2 text-slate-700">
            The eviction process UK is document-sensitive at every stage. Accurate dates, valid
            forms, and clear evidence can reduce eviction timeline UK delays.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-100 p-4">
          <p className="font-semibold text-slate-900">[PLACEHOLDER: Possession order process diagram]</p>
          <p className="mt-1 text-sm text-slate-600">
            Suggested alt text: "Diagram showing accelerated and standard possession order UK court routes"
          </p>
        </div>
      </section>

      <section id="checklist" className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">Evidence / documents checklist</h2>
        <p className="mt-3 text-slate-700">Evidence Landlords Should Prepare</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          <li>Tenancy agreement</li>
          <li>Rent payment history</li>
          <li>Deposit protection certificate</li>
          <li>Gas safety certificate</li>
          <li>EPC certificate</li>
          <li>Copies of notices served</li>
          <li>Proof of service</li>
          <li>Communication records with the tenant</li>
        </ul>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-lg font-bold">Documents you should prepare before serving notice</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            <li>Signed tenancy agreement and any renewal documents</li>
            <li>Deposit prescribed information and scheme confirmation</li>
            <li>Compliance documents served at move-in (gas safety, EPC, How to Rent)</li>
            <li>Rent schedule with missed payment dates and totals</li>
            <li>Communication log and breach evidence bundle</li>
          </ul>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold text-slate-900">[PLACEHOLDER: Eviction documents checklist graphic]</p>
          <p className="mt-1 text-sm text-slate-600">
            Suggested alt text: "Checklist of required eviction documents for UK landlords before serving notice"
          </p>
        </div>
      </section>

      <section id="mistakes" className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">Common mistakes</h2>
        <p className="mt-3 text-slate-700">Common Eviction Mistakes</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          <li>Serving an invalid Section 21 notice</li>
          <li>Incorrect notice dates</li>
          <li>Weak rent arrears evidence</li>
          <li>No proof of service</li>
          <li>Illegal eviction attempts</li>
        </ul>

        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="font-semibold">[CTA MODULE]</p>
          <p className="mt-2"><strong>Heading:</strong> Validate your Section 21 before you serve</p>
          <p><strong>Text:</strong> Reduce rejected claims by checking compliance, dates, and service method before notice issue.</p>
          <p><strong>Primary button:</strong> Start Section 21 Notice Validator</p>
          <p className="mt-3 font-semibold text-slate-900">[PLACEHOLDER: CTA banner for Section 21 checker]</p>
          <p className="mt-1 text-sm text-slate-600">Suggested alt text: "Banner promoting Section 21 Notice Validator for UK landlords"</p>
        </div>
      </section>

      <section id="faqs" className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">FAQs</h2>
        <div className="mt-4 space-y-3">
          {[
            {
              q: 'Can landlords evict tenants immediately in the UK?',
              a: 'No. Landlords must follow the legal eviction process beginning with a valid notice.',
            },
            {
              q: 'How long does eviction take in the UK?',
              a: 'Usually between 3 and 6 months depending on court delays and notice periods.',
            },
            {
              q: 'Can landlords evict tenants for rent arrears?',
              a: 'Yes. Rent arrears are one of the most common reasons for Section 8 eviction.',
            },
            {
              q: 'Is Section 21 being abolished?',
              a: 'The UK government has proposed reforms under the Renters Reform Bill, but Section 21 is still currently available in England.',
            },
            {
              q: 'What is the difference between an eviction notice and a possession order UK?',
              a: 'An eviction notice UK starts the process. A possession order UK is granted by the court if the tenant does not leave after notice expiry.',
            },
            {
              q: 'Do I need a hearing for every section 21 eviction?',
              a: 'Not always. Many valid section 21 eviction claims use accelerated possession, which can proceed without a hearing.',
            },
            {
              q: 'Can I recover rent arrears and possession in one case?',
              a: 'Yes. Standard possession claims are commonly used where landlords seek both possession and arrears recovery.',
            },
            {
              q: 'Who can carry out a bailiff eviction UK?',
              a: 'Only authorised County Court Bailiffs or High Court Enforcement Officers can lawfully remove a tenant.',
            },
          ].map((item) => (
            <details key={item.q} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-semibold">{item.q}</summary>
              <p className="mt-2 text-slate-700">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">Related guides</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li><Link className="text-blue-700 hover:underline" href="/section-21-notice-template">Section 21 notice template guide</Link></li>
          <li><Link className="text-blue-700 hover:underline" href="/section-8-notice-template">Section 8 notice template guide</Link></li>
          <li><Link className="text-blue-700 hover:underline" href="/eviction-process-england">Eviction process England</Link></li>
          <li><Link className="text-blue-700 hover:underline" href="/eviction-timeline-uk">Eviction timeline UK</Link></li>
          <li><Link className="text-blue-700 hover:underline" href="/rent-arrears-letter-template">Rent arrears letter template</Link></li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
            <p className="font-semibold">[CTA MODULE]</p>
            <p className="mt-2"><strong>Heading:</strong> Build your Section 8 pack with the right grounds</p>
            <p><strong>Text:</strong> Generate a legally structured Section 8 Notice with clearer arrears and breach evidence prompts.</p>
            <p><strong>Primary button:</strong> Open Section 8 Notice Generator</p>
            <p className="mt-3 font-semibold text-slate-900">[PLACEHOLDER: CTA banner for Section 8 notice tool]</p>
            <p className="mt-1 text-sm text-slate-600">Suggested alt text: "Banner for Section 8 Notice Generator for landlord breach cases"</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
            <p className="font-semibold">[CTA MODULE]</p>
            <p className="mt-2"><strong>Heading:</strong> Download the complete eviction pack</p>
            <p><strong>Text:</strong> Get notices, court-ready documents, and timeline guidance in one workflow for faster possession action.</p>
            <p><strong>Primary button:</strong> Get Complete Eviction Pack</p>
            <p className="mt-3 font-semibold text-slate-900">[PLACEHOLDER: CTA banner for complete eviction pack]</p>
            <p className="mt-1 text-sm text-slate-600">Suggested alt text: "Banner for complete eviction pack including notice, court, and enforcement documents"</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="font-semibold">[CTA MODULE]</p>
          <p className="mt-2"><strong>Heading:</strong> Plan your case with the Eviction Timeline Guide</p>
          <p><strong>Text:</strong> Understand notice periods, court queues, and bailiff booking windows before you serve notice.</p>
          <p><strong>Primary button:</strong> View Eviction Timeline Guide</p>
        </div>
      </section>
    </main>
  );
}
