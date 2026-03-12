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
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#in-this-guide', label: 'In this guide' },
  { href: '#section-21-vs-section-8', label: 'Section 21 vs Section 8' },
  { href: '#step-by-step-eviction-process', label: 'Step-by-step eviction process' },
  { href: '#eviction-timeline-uk', label: 'Eviction timeline UK' },
  { href: '#documents-landlords-should-prepare', label: 'Documents to prepare' },
  { href: '#common-eviction-mistakes', label: 'Common mistakes' },
  { href: '#rent-arrears-eviction-uk', label: 'Rent arrears eviction' },
  { href: '#what-happens-after-possession-order', label: 'After a possession order' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#related-guides', label: 'Related guides' },
  { href: '#final-cta', label: 'Final next steps' },
];

const faqs: FAQItem[] = [
  {
    question: 'Can landlords evict tenants immediately in the UK?',
    answer: 'No. Landlords must follow the legal eviction process beginning with a valid notice.',
  },
  {
    question: 'How long does eviction take in the UK?',
    answer: 'Usually between 3 and 6 months depending on court delays, notice periods, and enforcement availability.',
  },
  {
    question: 'Can landlords evict tenants for rent arrears?',
    answer: 'Yes. Rent arrears are one of the most common reasons for Section 8 eviction.',
  },
  {
    question: 'Is Section 21 being abolished?',
    answer:
      'The UK government has proposed reforms under the Renters Reform Bill, but Section 21 is still currently available in England.',
  },
  {
    question: 'What is a possession order UK landlords apply for?',
    answer:
      'A possession order is a county court order requiring the tenant to leave by a stated date. If they remain, the landlord must request bailiff enforcement.',
  },
  {
    question: 'What makes an eviction notice UK invalid?',
    answer:
      'Common issues include the wrong form, incorrect expiry date, missing compliance documents, or weak proof of service.',
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
          Learn how the eviction process works in England, what notices landlords must serve, and how long eviction typically takes.
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
              <p className="mt-4 text-gray-700 leading-7">When learning how to evict a tenant in the UK, landlords normally choose between Section 21 eviction and Section 8 eviction.</p>
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
                      <td className="px-4 py-3">Tenant breach, including rent arrears eviction UK cases</td>
                      <td className="px-4 py-3">Form 3, with notice period based on legal grounds</td>
                      <td className="px-4 py-3">Standard possession claim with hearing in most cases</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Notice period: 2 weeks to 2 months</li>
                <li>Court processing: 6 to 10 weeks</li>
                <li>Possession order: around 14 days</li>
                <li>Bailiff enforcement: 2 to 6 weeks</li>
              </ul>
              <p className="mt-4 text-gray-700">Most cases take around 3 to 6 months, though local court delays can extend this.</p>
            </article>

            <article id="documents-landlords-should-prepare" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Documents Landlords Should Prepare</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Tenancy agreement</li>
                <li>Rent payment history</li>
                <li>Deposit protection certificate</li>
                <li>Gas safety certificate</li>
                <li>EPC certificate</li>
                <li>Copies of notices served</li>
                <li>Proof of service</li>
                <li>Communication records with the tenant</li>
              </ul>
            </article>

            <article id="common-eviction-mistakes" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Common Eviction Mistakes</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Serving an invalid Section 21 notice</li>
                <li>Incorrect notice dates</li>
                <li>Weak rent arrears evidence</li>
                <li>No proof of service</li>
                <li>Illegal eviction attempts</li>
              </ul>
            </article>

            <article id="rent-arrears-eviction-uk" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">How to Evict a Tenant for Rent Arrears in the UK</h2>
              <p className="mt-4 text-gray-700 leading-7">Landlords usually use section 8 eviction for rent arrears. Build a dated arrears schedule, align it with tenancy terms, and prepare bank and ledger evidence before the hearing.</p>
              <p className="mt-4 text-gray-700 leading-7">For stronger possession order UK outcomes, present mandatory and discretionary grounds where appropriate and keep records current if partial payments are made.</p>
            </article>

            <article id="what-happens-after-possession-order" className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">What Happens After a Possession Order</h2>
              <p className="mt-4 text-gray-700 leading-7">After the possession order date passes, landlords can apply for bailiff eviction UK enforcement if the tenant remains in occupation.</p>
              <p className="mt-4 text-gray-700 leading-7">Only authorised enforcement officers can remove tenants lawfully. This stage often adds several weeks to the overall eviction timeline UK.</p>
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
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link href="/section-21-notice-guide" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Section 21 notice guide</Link>
              <Link href="/section-8-notice-template" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Section 8 notice template guide</Link>
              <Link href="/eviction-process-england" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Eviction process England</Link>
              <Link href="/eviction-timeline-uk" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Eviction timeline UK</Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="final-cta" className="pb-14">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Final CTA</h2>
            <p className="mt-4 text-gray-700">If you need to start now, map tenancy facts first, choose the correct route, and prepare a complete evidence file before serving any eviction notice UK.</p>
            <p className="mt-4 text-gray-700">A correct first step usually saves weeks across the eviction process UK and reduces rejection risk.</p>
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
