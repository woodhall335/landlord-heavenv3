import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { StructuredData, articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'How to Evict a Tenant in the UK | Complete Landlord Guide | LandlordHeaven',
  description:
    'Learn how to evict a tenant in the UK with a clear, legal step-by-step process covering Section 21, Section 8, possession orders, timelines, bailiffs, and documents.',
  alternates: {
    canonical: 'https://landlordheaven.co.uk/how-to-evict-a-tenant-uk',
  },
};

const canonical = 'https://landlordheaven.co.uk/how-to-evict-a-tenant-uk';

const jumpLinks = [
  { href: '#section-21-vs-section-8', label: 'Section 21 vs Section 8' },
  { href: '#step-by-step-eviction-process', label: 'Step-by-step eviction process' },
  { href: '#eviction-timeline-uk', label: 'Eviction timeline UK' },
  { href: '#documents-landlords-should-prepare', label: 'Documents to prepare' },
  { href: '#common-eviction-mistakes', label: 'Common mistakes' },
  { href: '#rent-arrears-eviction-uk', label: 'Rent arrears eviction' },
  { href: '#what-happens-after-possession-order', label: 'After a possession order' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#related-guides', label: 'Related guides' },
  { href: '#final-cta', label: 'Next steps for landlords' },
];

const faqs: FAQItem[] = [
  {
    question: 'Can landlords evict tenants immediately in the UK?',
    answer: 'No. In almost all cases landlords must serve a valid notice first, then obtain a court possession order before enforcement can happen.',
  },
  {
    question: 'How long does eviction take in the UK?',
    answer:
      'Most landlord cases take about 3 to 6 months from notice to enforcement. Straightforward claims can move faster, while defended cases, local court backlogs, and bailiff waiting times can add several weeks.',
  },
  {
    question: 'Can landlords evict tenants for rent arrears?',
    answer:
      'Yes. Landlords usually use a section 8 eviction route for rent arrears and rely on clear evidence such as rent schedules, bank statements, and the tenancy agreement. Keep the arrears total updated right up to the hearing, because late or partial payments can affect which grounds apply.',
  },
  {
    question: 'Is Section 21 being abolished?',
    answer:
      'The law has been proposed for reform, but section 21 eviction is still currently available in England unless and until new legislation is brought into force. Landlords should check the latest position before serving notice so they use the correct route.',
  },
  {
    question: 'What is a possession order UK landlords apply for?',
    answer:
      'A possession order UK landlords apply for is a county court order that sets the date a tenant must leave the property. If the tenant stays after that date, the landlord must apply for enforcement and arrange a bailiff eviction UK appointment.',
  },
  {
    question: 'What makes an eviction notice UK invalid?',
    answer:
      'Common issues include using the wrong form, giving the wrong notice dates, or failing to meet key compliance requirements. A notice can also fail if you cannot prove valid service, so keep clear evidence of when and how it was delivered.',
  },
];

export default function HowToEvictTenantUkPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper pagePath="/how-to-evict-a-tenant-uk" pageTitle={metadata.title as string} pageType="guide" jurisdiction="england" />
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: metadata.title as string,
          description: metadata.description as string,
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-01',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' },
          { name: 'How to Evict a Tenant in the UK', url: canonical },
        ])}
      />
      <StructuredData data={faqPageSchema(faqs)} />

      <UniversalHero
        title="How to Evict a Tenant in the UK"
        subtitle="A step-by-step landlord guide covering Section 21, Section 8, court possession orders, and bailiff enforcement."
        primaryCta={{ label: 'Start complete eviction pack', href: '/products/complete-pack' }}
        secondaryCta={{ label: 'Validate your route first', href: '/tools/validators' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="How to Evict a Tenant in the UK icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Get practical, step-by-step support from route validation through document preparation, compliance checks, and jurisdiction-specific workflows, so you can move forward with confidence.
        </p>
      </UniversalHero>

      <section id="quick-answer" className="py-10 bg-white border-b border-[#E6DBFF]">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Quick Answer</h2>
            <p className="mt-4 text-gray-700">
              The legal eviction process in the UK normally involves five main stages.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-gray-700">
              <li>Confirm the tenancy type and eviction route.</li>
              <li>Serve the correct eviction notice (Section 21 or Section 8).</li>
              <li>Wait for the notice period to expire.</li>
              <li>Apply to the county court for a possession order.</li>
              <li>Request bailiff enforcement if the tenant does not leave.</li>
            </ol>
            <p className="mt-4 text-gray-700">
              Most eviction cases fail or get delayed because of incorrect notices, missing documents, or poor record-keeping. Preparing a clear timeline and evidence pack before serving notice significantly improves success rates.
            </p>
          </div>
        </Container>
      </section>

      <section id="in-this-guide" className="py-8 bg-white border-b border-[#E6DBFF]">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#2a2161]">In This Guide</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {jumpLinks.map((link) => (
                <a key={link.href} href={link.href} className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 bg-white">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <article id="section-21-vs-section-8" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Section 21 vs Section 8</h2>
              <p className="mt-4 text-gray-700 leading-7">When learning how to evict a tenant in the UK, landlords normally choose between section 21 eviction and section 8 eviction.</p>
              <div className="mt-5 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Route</th>
                      <th className="px-4 py-3 text-left font-semibold">Best used when</th>
                      <th className="px-4 py-3 text-left font-semibold">Notice and form</th>
                      <th className="px-4 py-3 text-left font-semibold">Court route</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">Section 21 eviction</td>
                      <td className="px-4 py-3">No-fault possession at or after the correct tenancy stage</td>
                      <td className="px-4 py-3">At least two months&apos; notice using Form 6A</td>
                      <td className="px-4 py-3">Often accelerated possession order route (if valid)</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">Section 8 eviction</td>
                      <td className="px-4 py-3">Tenant breach, including cases involving rent arrears</td>
                      <td className="px-4 py-3">Form 3, with notice period based on legal grounds</td>
                      <td className="px-4 py-3">Standard possession claim with hearing in most cases</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-gray-700 leading-7">Section 21 is usually used when you want possession at the right tenancy stage and your compliance paperwork is in order. Section 8 is usually used when you need to prove a breach, such as rent arrears, anti-social behaviour, or other tenancy failures. Choosing the right route early helps you avoid invalid notices, reduce delay, and prepare the correct court file from the start.</p>
            </article>

            <article id="step-by-step-eviction-process" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Step-by-Step Eviction Process</h2>
              <div className="mt-4 space-y-4 text-gray-700 leading-7">
                <p>Evicting a tenant in the UK must follow a strict legal process. If landlords try to remove a tenant without following the correct steps, the eviction can be invalid or even illegal.</p>
                <p>This guide explains how to evict a tenant in the UK step-by-step, including the correct notices to serve, the court process, and how bailiff enforcement works.</p>
                <p>Whether you are dealing with rent arrears, tenancy breaches, or ending a tenancy, understanding the eviction process UK framework helps you regain possession while staying compliant with UK law.</p>
                <h3 className="text-xl font-semibold text-[#2a2161] pt-2">Step 1: Confirm the Tenancy Type</h3>
                <p>Most private landlords in England use Assured Shorthold Tenancies (ASTs), usually fixed-term or periodic tenancies. The tenancy type determines which eviction route can be used.</p>
                <p>Landlords must also confirm key compliance requirements were met when the tenancy began, including deposit protection, gas safety, EPC, and the How to Rent guide. Missing compliance documents can invalidate a section 21 eviction notice.</p>
                <h3 className="text-xl font-semibold text-[#2a2161] pt-2">Step 2: Choose the Correct Eviction Route</h3>
                <p>Section 21 eviction is commonly used to regain possession without proving tenant wrongdoing. Section 8 eviction is used when the tenant has breached tenancy terms, such as rent arrears, anti-social behaviour, or property damage.</p>
                <h3 className="text-xl font-semibold text-[#2a2161] pt-2">Step 3: Serve the Eviction Notice</h3>
                <p>Use the correct form and keep proof of service (certificate of posting, witness statement, or permitted email evidence). Incorrect service is one of the most common reasons an eviction notice UK claim fails.</p>
                <h3 className="text-xl font-semibold text-[#2a2161] pt-2">Step 4: Apply for a Possession Order</h3>
                <p>If the tenant stays after notice expiry, apply through county court. Section 21 cases may qualify for accelerated possession where no arrears claim is included. Section 8 and arrears claims usually proceed through a standard possession hearing.</p>
                <h3 className="text-xl font-semibold text-[#2a2161] pt-2">Step 5: Enforce the Eviction</h3>
                <p>If a possession order is ignored, landlords must request county court bailiffs or high court enforcement officers. Landlords must never attempt self-help eviction such as lock changes or removing belongings.</p>
              </div>
            </article>

            <article id="eviction-timeline-uk" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Eviction Timeline UK</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="px-4 py-3 text-left font-semibold">Typical Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">Notice period</td>
                      <td className="px-4 py-3">2 weeks to 2 months</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">Court processing</td>
                      <td className="px-4 py-3">6 to 10 weeks</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">Possession order</td>
                      <td className="px-4 py-3">Around 14 days</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">Bailiff enforcement</td>
                      <td className="px-4 py-3">2 to 6 weeks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-gray-700">Local court listing and bailiff availability can extend the overall eviction timeline UK.</p>
            </article>

            <article id="documents-landlords-should-prepare" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Documents Landlords Should Prepare</h2>
              <p className="mt-4 text-gray-700 leading-7">A complete document bundle is central to a smooth possession order UK claim. Courts expect landlords to show the tenancy terms, compliance history, and service evidence clearly and in date order.</p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Tenancy and payment records</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-700">
                <li>Signed tenancy agreement</li>
                <li>Rent statement and payment history</li>
                <li>Arrears schedule (for section 8 eviction)</li>
              </ul>
              <p className="mt-3 text-gray-700 leading-7">These documents prove what was agreed, what has been paid, and whether grounds such as rent arrears are made out.</p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Compliance and prescribed information</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-700">
                <li>Deposit protection certificate and prescribed information record</li>
                <li>Gas safety certificate(s)</li>
                <li>EPC certificate</li>
                <li>How to Rent guide service record (if applicable)</li>
              </ul>
              <p className="mt-3 text-gray-700 leading-7">These items are often checked first in section 21 eviction cases and can determine whether your notice is valid.</p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice and service evidence</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-700">
                <li>Copy of the eviction notice UK form served (Form 6A or Form 3)</li>
                <li>Proof of service (certificate of posting, process server record, or accepted email trail)</li>
                <li>Communication log with the tenant</li>
              </ul>
              <p className="mt-3 text-gray-700 leading-7">Service records reduce disputes about dates and help the court confirm your eviction timeline UK has been followed lawfully.</p>
            </article>

            <article id="common-eviction-mistakes" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Common Eviction Mistakes</h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  Serving an invalid section 21 notice.
                  <span className="block">Using the wrong form version or serving too early can reset your case.</span>
                </li>
                <li>
                  Miscalculating notice dates.
                  <span className="block">An incorrect expiry date can make an eviction notice UK unenforceable.</span>
                </li>
                <li>
                  Weak rent arrears evidence.
                  <span className="block">For section 8 eviction, unclear ledgers and missing bank records can weaken possession claims.</span>
                </li>
                <li>
                  No proof of service.
                  <span className="block">If you cannot prove when and how notice was served, the court may dismiss the claim.</span>
                </li>
                <li>
                  Attempting self-help eviction.
                  <span className="block">Changing locks or removing belongings without a court order and enforcement is unlawful.</span>
                </li>
              </ul>
            </article>

            <article id="rent-arrears-eviction-uk" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">How to Evict a Tenant for Rent Arrears in the UK</h2>
              <p className="mt-4 text-gray-700 leading-7">Landlords usually rely on section 8 eviction when arrears are the main reason for possession. Start with a clear, dated arrears schedule and cross-check every figure against your tenancy terms and payment records.</p>
              <p className="mt-4 text-gray-700 leading-7">Evidence quality matters. Courts expect reliable ledgers, bank statements, and a clean timeline showing what was due, what was paid, and what remains outstanding.</p>
              <p className="mt-4 text-gray-700 leading-7">Update the arrears position right before the hearing, because partial payments can change the grounds available and affect the outcome of a rent arrears eviction UK claim.</p>
            </article>

            <article id="what-happens-after-possession-order" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">What Happens After a Possession Order</h2>
              <p className="mt-4 text-gray-700 leading-7">A possession order UK judgment sets a possession date by which the tenant must leave. In many cases this is around 14 days, although the court can allow longer in limited hardship situations.</p>
              <p className="mt-4 text-gray-700 leading-7">If the tenant remains after that date, the order does not enforce itself. Landlords must apply for enforcement, usually by requesting a warrant of possession for county court bailiffs (or an authorised High Court route where permitted).</p>
              <p className="mt-4 text-gray-700 leading-7">Bailiff eviction UK appointments can take time in busy areas, so this stage often adds delay even after the court has granted possession.</p>
            </article>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="How to Evict a Tenant in the UK FAQs" />
      </section>

      <section id="related-guides" className="py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Related Guides</h2>
            <p className="mt-4 text-gray-700 leading-7">Use these guides to plan your next step based on your case type, whether you are preparing an eviction notice UK form, managing arrears evidence, or estimating likely timescales.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/section-21-notice-guide" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Section 21 notice guide: rules, timing, and validity checks</Link>
              <Link href="/section-8-notice-template" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Section 8 notice guide: choosing grounds and evidence</Link>
              <Link href="/eviction-process-england" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Eviction process England: full court route explained</Link>
              <Link href="/eviction-timeline-uk" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Eviction timeline UK: realistic stage-by-stage expectations</Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="final-cta" className="pb-14">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps for Landlords</h2>
            <p className="mt-4 text-gray-700">Before serving any eviction notice UK form, confirm your tenancy facts, compliance documents, and service method so your case starts on the strongest legal footing.</p>
            <p className="mt-4 text-gray-700">A carefully prepared file can reduce avoidable delays, improve possession order UK outcomes, and keep your eviction process UK route compliant from notice through enforcement.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products/complete-pack" className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95">Start your eviction route check</Link>
              <Link href="/tools/validators" className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#F8F4FF]">Validate your notice route</Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
