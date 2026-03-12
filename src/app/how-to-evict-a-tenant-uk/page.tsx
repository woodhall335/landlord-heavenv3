import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'How to Evict a Tenant in the UK | Complete Landlord Guide | LandlordHeaven',
  description:
    'Learn how to evict a tenant in the UK with a clear, legal step-by-step process covering Section 21, Section 8, possession orders, timelines, bailiffs, rent arrears, and the documents landlords should prepare.',
  alternates: {
    canonical: 'https://landlordheaven.co.uk/how-to-evict-a-tenant-uk',
  },
  openGraph: {
    title: 'How to Evict a Tenant in the UK | Complete Landlord Guide | LandlordHeaven',
    description:
      'A practical landlord guide covering Section 21, Section 8, possession orders, eviction timelines, bailiffs, and common mistakes.',
    url: 'https://landlordheaven.co.uk/how-to-evict-a-tenant-uk',
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const canonical = 'https://landlordheaven.co.uk/how-to-evict-a-tenant-uk';

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#section-21-vs-section-8', label: 'Section 21 vs Section 8' },
  { href: '#how-landlords-choose-the-correct-eviction-route', label: 'Choosing the right route' },
  { href: '#step-by-step-eviction-process', label: 'Step-by-step eviction process' },
  { href: '#eviction-timeline-uk', label: 'Eviction timeline UK' },
  { href: '#documents-landlords-should-prepare', label: 'Documents to prepare' },
  { href: '#what-evidence-courts-expect', label: 'Evidence courts expect' },
  { href: '#common-eviction-mistakes', label: 'Common mistakes' },
  { href: '#rent-arrears-eviction-uk', label: 'Rent arrears eviction' },
  { href: '#what-happens-after-possession-order', label: 'After a possession order' },
  { href: '#typical-eviction-scenarios', label: 'Typical scenarios' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#related-guides', label: 'Related guides' },
  { href: '#final-cta', label: 'Next steps for landlords' },
];

const faqs: FAQItem[] = [
  {
    question: 'Can landlords evict tenants immediately in the UK?',
    answer:
      'No. In most cases landlords must first serve a valid notice, then apply to court for a possession order if the tenant does not leave. Enforcement normally requires county court bailiffs or another authorised enforcement route.',
  },
  {
    question: 'How long does eviction take in the UK?',
    answer:
      'Many eviction cases take around 3 to 6 months, but timing depends on the notice period, court workload, whether the claim is defended, and how long bailiff enforcement takes locally.',
  },
  {
    question: 'Can landlords evict tenants for rent arrears?',
    answer:
      'Yes. Rent arrears cases are usually brought under Section 8. Landlords should prepare a clear arrears schedule, payment records, tenancy terms, and updated figures before the court hearing.',
  },
  {
    question: 'Is Section 21 being abolished?',
    answer:
      'Changes have been proposed, but Section 21 is still currently in force in England unless and until new legislation is enacted and brought into effect.',
  },
  {
    question: 'What is a possession order UK landlords apply for?',
    answer:
      'A possession order is a county court order stating when the tenant must leave the property. If the tenant remains after that date, the landlord must apply for enforcement.',
  },
  {
    question: 'What makes an eviction notice UK invalid?',
    answer:
      'Common reasons include using the wrong form, getting dates wrong, serving the notice too early, missing compliance documents, or being unable to prove the notice was served properly.',
  },
  {
    question: 'Can tenants stop eviction by paying rent arrears late?',
    answer:
      'Sometimes. In rent arrears cases, partial payments can affect the grounds relied on, especially where the landlord is using mandatory grounds. That is why landlords should update the arrears schedule before the hearing.',
  },
  {
    question: 'Can landlords change the locks if the tenant stops paying rent?',
    answer:
      'No. Changing the locks without following the legal process can amount to illegal eviction. Landlords should use the correct notice, court process, and authorised enforcement route instead.',
  },
];

export default function HowToEvictTenantUkPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/how-to-evict-a-tenant-uk"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: metadata.title as string,
          description: metadata.description as string,
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-12',
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
          Understand the legal eviction process landlords in England usually follow, from
          choosing the right notice to applying for a possession order and, where needed,
          arranging bailiff enforcement.
        </p>
      </UniversalHero>

      <section id="quick-answer" className="border-b border-[#E6DBFF] bg-white py-10">
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
              Most eviction cases fail or get delayed because of incorrect notices, missing
              documents, or poor record-keeping. Preparing a clear timeline and evidence
              pack before serving notice significantly improves success rates.
            </p>
          </div>
        </Container>
      </section>

      <section id="in-this-guide" className="border-b border-[#E6DBFF] bg-white py-8">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#2a2161]">In This Guide</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {jumpLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <article
              id="section-21-vs-section-8"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">Section 21 vs Section 8</h2>
              <p className="mt-4 leading-7 text-gray-700">
                When learning how to evict a tenant in the UK, landlords usually choose
                between Section 21 and Section 8. Both routes can lead to possession, but
                they are used for different reasons and carry different evidence
                requirements.
              </p>
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
                      <td className="px-4 py-3 font-medium">Section 21 eviction</td>
                      <td className="px-4 py-3">
                        No-fault possession at or after the correct tenancy stage
                      </td>
                      <td className="px-4 py-3">
                        At least two months&apos; notice using Form 6A
                      </td>
                      <td className="px-4 py-3">
                        Often accelerated possession order route if valid
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Section 8 eviction</td>
                      <td className="px-4 py-3">
                        Tenant breach, including cases involving rent arrears
                      </td>
                      <td className="px-4 py-3">
                        Form 3, with notice period based on legal grounds
                      </td>
                      <td className="px-4 py-3">
                        Standard possession claim with hearing in most cases
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-7 text-gray-700">
                In practice, the right route depends on your objective and the quality of
                your file. If your paperwork is fully compliant and you only need
                possession, Section 21 can be more straightforward. If you need to rely on
                breach grounds such as rent arrears, anti-social behaviour, or other
                tenancy breaches, Section 8 is usually the stronger route. Choosing the
                correct route early reduces the risk of rejected claims and wasted time.
              </p>
            </article>

            <div className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
              <h3 className="text-xl font-semibold text-[#2a2161]">
                Not sure which eviction route applies?
              </h3>
              <p className="mt-3 leading-7 text-gray-700">
                Check your tenancy details, compliance records, and notice route before you
                serve anything. A correct route choice early on can reduce delays and help
                you generate court-ready documents.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/tools/validators"
                  className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                >
                  Validate your eviction route
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
                >
                  Start the Complete Eviction Pack
                </Link>
              </div>
            </div>

            <article
              id="how-landlords-choose-the-correct-eviction-route"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                How Landlords Choose the Correct Eviction Route
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually begin by reviewing the tenancy agreement, the tenancy
                start date, and the compliance record before deciding how to evict a tenant
                in the UK. That first review matters because the lawful notice route
                depends on the tenancy type, the facts of the case, and whether the
                required documents were given at the start of the tenancy.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                If the landlord only wants possession and the file is compliant, Section 21
                is often considered first. It is commonly used where a fixed term is ending
                or the landlord wants possession without proving wrongdoing. However,
                Section 21 still depends on valid paperwork, correct dates, and proper
                service.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                If the tenant has breached the agreement, Section 8 is usually the correct
                route. That may include rent arrears, property damage, anti-social
                behaviour, or other repeated breaches. In those cases, the landlord should
                prepare evidence of the breach before serving notice, not after.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The key decision is not simply which route sounds faster. It is which route
                is strongest on the facts and most likely to survive challenge. A route
                that looks quick but fails on validity usually costs more time than a route
                that is properly prepared from the start.
              </p>
            </article>

            <article
              id="step-by-step-eviction-process"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                Step-by-Step Eviction Process
              </h2>
              <div className="mt-4 space-y-4 text-gray-700 leading-7">
                <p>
                  Evicting a tenant in the UK must follow a strict legal process. If
                  landlords try to remove a tenant without following the correct steps, the
                  eviction can be invalid or even illegal.
                </p>
                <p>
                  This guide explains how to evict a tenant in the UK step-by-step,
                  including the correct notices to serve, the court process, and how
                  bailiff enforcement works.
                </p>
                <p>
                  Whether you are dealing with rent arrears, tenancy breaches, or ending a
                  tenancy, understanding the eviction process UK framework helps you regain
                  possession while staying compliant with UK law.
                </p>

                <h3 className="pt-2 text-xl font-semibold text-[#2a2161]">
                  Step 1: Confirm the Tenancy Type
                </h3>
                <p>
                  Most private landlords in England use Assured Shorthold Tenancies (ASTs),
                  usually fixed-term or periodic tenancies. The tenancy type determines
                  which eviction route can be used and which possession rules apply.
                </p>
                <p>
                  Landlords should not assume every occupation arrangement is an AST.
                  Company lets, licences, excluded occupiers, and some social or supported
                  housing arrangements may follow different rules. Confirming the tenancy
                  structure at the start avoids serving the wrong notice later.
                </p>
                <p>
                  Landlords must also confirm key compliance requirements were met when the
                  tenancy began, including deposit protection, gas safety, EPC, and the How
                  to Rent guide. Missing compliance documents can invalidate a Section 21
                  eviction notice and weaken the overall case.
                </p>

                <h3 className="pt-2 text-xl font-semibold text-[#2a2161]">
                  Step 2: Choose the Correct Eviction Route
                </h3>
                <p>
                  Section 21 eviction is commonly used to regain possession without proving
                  tenant wrongdoing. Section 8 eviction is used when the tenant has
                  breached tenancy terms, such as rent arrears, anti-social behaviour, or
                  property damage.
                </p>
                <p>
                  At this stage landlords should decide whether they want possession only,
                  possession plus arrears recovery, or both. That objective affects not
                  just the notice served but also the court route, evidence bundle, and
                  hearing preparation.
                </p>
                <p>
                  A practical way to choose is to compare route strength rather than just
                  headline speed. If the compliance file is incomplete, Section 21 may be
                  risky. If the breach evidence is weak, Section 8 may be harder to prove.
                  The best route is the one that is most likely to remain valid when the
                  claim reaches court.
                </p>

                <h3 className="pt-2 text-xl font-semibold text-[#2a2161]">
                  Step 3: Serve the Eviction Notice
                </h3>
                <p>
                  Use the correct form and keep proof of service. Depending on the tenancy
                  agreement and the circumstances, service may be by post, by hand, by a
                  professional process server, or by email where the tenancy permits it.
                </p>
                <p>
                  Incorrect service is one of the most common reasons an eviction notice UK
                  claim fails. Landlords should keep a certificate of posting, witness
                  statement, process server record, or another reliable service trail.
                </p>
                <p>
                  Notice dates should be checked carefully before service. A date error can
                  invalidate the notice and force the landlord to start again, adding weeks
                  or months to the eviction timeline UK.
                </p>

                <h3 className="pt-2 text-xl font-semibold text-[#2a2161]">
                  Step 4: Apply for a Possession Order
                </h3>
                <p>
                  If the tenant stays after notice expiry, the next stage is a county court
                  possession claim. Section 21 cases may qualify for accelerated possession
                  where no arrears claim is included and the paperwork is valid.
                </p>
                <p>
                  Accelerated possession is often used because it may proceed on the papers
                  without a hearing, although that depends on the case. Standard possession
                  claims are more common where rent arrears are involved or where Section 8
                  grounds are relied on.
                </p>
                <p>
                  At court stage, consistency matters. The notice served, tenancy records,
                  rent schedule, witness statement, and chronology should all tell the same
                  story. Contradictions between dates or figures are a frequent cause of
                  delay.
                </p>

                <h3 className="pt-2 text-xl font-semibold text-[#2a2161]">
                  Step 5: Enforce the Eviction
                </h3>
                <p>
                  If a possession order is ignored, landlords must request county court
                  bailiffs or, where permitted, an authorised High Court enforcement route.
                  Only authorised enforcement officers can lawfully remove the tenant.
                </p>
                <p>
                  This stage often surprises landlords because it is not immediate.
                  Enforcement appointments can take time, particularly where local bailiff
                  demand is high. That is why a possession order is not always the end of
                  the practical eviction process.
                </p>
                <p>
                  Landlords must never attempt self-help eviction such as lock changes,
                  removing belongings, or threatening removal without lawful enforcement.
                  Those actions can create serious legal and financial risk.
                </p>
              </div>
            </article>

            <article
              id="eviction-timeline-uk"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">Eviction Timeline UK</h2>
              <div className="mt-5 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="px-4 py-3 text-left font-semibold">Typical time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Notice period</td>
                      <td className="px-4 py-3">2 weeks to 2 months</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Court processing</td>
                      <td className="px-4 py-3">6 to 10 weeks</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Possession order</td>
                      <td className="px-4 py-3">Around 14 days</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Bailiff enforcement</td>
                      <td className="px-4 py-3">2 to 6 weeks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-7 text-gray-700">
                Most cases take around 3 to 6 months, though local court delays can extend
                this. Straightforward accelerated possession claims may move more quickly,
                while defended Section 8 claims can take longer because the court must
                review evidence and list hearings. Bailiff waiting times can also vary
                significantly by area, so landlords should treat the timeline as a guide
                rather than a guarantee.
              </p>
            </article>

            <article
              id="documents-landlords-should-prepare"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                Documents Landlords Should Prepare
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                A complete document bundle is central to a smooth possession order UK
                claim. Courts expect landlords to show the tenancy terms, compliance
                history, and service evidence clearly and in date order.
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">
                Tenancy and payment records
              </h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-700">
                <li>Signed tenancy agreement</li>
                <li>Rent statement and payment history</li>
                <li>Arrears schedule (for Section 8 eviction)</li>
              </ul>
              <p className="mt-3 leading-7 text-gray-700">
                These documents prove what was agreed, what has been paid, and whether
                grounds such as rent arrears are made out.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">
                Compliance and prescribed information
              </h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-700">
                <li>Deposit protection certificate and prescribed information record</li>
                <li>Gas safety certificate(s)</li>
                <li>EPC certificate</li>
                <li>How to Rent guide service record (if applicable)</li>
              </ul>
              <p className="mt-3 leading-7 text-gray-700">
                These items are often checked first in Section 21 cases and can determine
                whether your notice is valid.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">
                Notice and service evidence
              </h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-700">
                <li>Copy of the eviction notice form served (Form 6A or Form 3)</li>
                <li>
                  Proof of service, such as a certificate of posting, process server
                  record, or accepted email trail
                </li>
                <li>Communication log with the tenant</li>
              </ul>
              <p className="mt-3 leading-7 text-gray-700">
                Service records reduce disputes about dates and help the court confirm
                your eviction timeline UK has been followed lawfully.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A strong evidence bundle should also be organised chronologically. Notice
                dates, arrears figures, service records, and correspondence should match
                across the file. Courts are more likely to move cases forward where the
                evidence is clear, consistent, and easy to verify.
              </p>
            </article>

            <article
              id="what-evidence-courts-expect"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                What Evidence Courts Expect in Eviction Cases
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Courts usually examine whether the landlord has provided a clear and
                consistent record of the tenancy. That means more than simply attaching a
                few documents. The judge will usually want to see how the tenancy started,
                what obligations applied, what notices were served, and what happened after
                service.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In rent arrears cases, the arrears schedule is especially important. It
                should show payment dates, missed payments, running totals, and any partial
                payments. If the rent schedule does not match the bank records or witness
                evidence, the court may question the reliability of the claim.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                For Section 21 cases, courts often focus first on validity points such as
                deposit protection, gas safety, EPC, and service evidence. Missing
                compliance records are a common reason notices are challenged. For either
                route, landlords should present the documents in a sensible order so the
                court can follow the case quickly.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Good evidence does not have to be complicated. It simply needs to be
                coherent, dated, and internally consistent. A shorter file that is well
                organised is often more effective than a larger file that is confused or
                contradictory.
              </p>
            </article>

            <article
              id="common-eviction-mistakes"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                Common Eviction Mistakes
              </h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Serving an invalid Section 21 notice.</span>
                  <span className="block">
                    Using the wrong form version or serving too early can reset your case.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Miscalculating notice dates.</span>
                  <span className="block">
                    An incorrect expiry date can make an eviction notice UK claim
                    unenforceable.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Weak rent arrears evidence.</span>
                  <span className="block">
                    For Section 8 eviction, unclear ledgers and missing bank records can
                    weaken possession claims.
                  </span>
                </li>
                <li>
                  <span className="font-medium">No proof of service.</span>
                  <span className="block">
                    If you cannot prove when and how notice was served, the court may
                    dismiss the claim.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Attempting self-help eviction.</span>
                  <span className="block">
                    Changing locks or removing belongings without a court order and
                    enforcement is unlawful.
                  </span>
                </li>
              </ul>
            </article>

            <article
              id="rent-arrears-eviction-uk"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                How to Evict a Tenant for Rent Arrears in the UK
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually use Section 8 eviction for rent arrears. Build a dated
                arrears schedule, align it with tenancy terms, and prepare bank and ledger
                evidence before the hearing.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                For stronger possession order UK outcomes, present mandatory and
                discretionary grounds where appropriate and keep records current if partial
                payments are made.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Ground 8 is especially important because it can be a mandatory ground for
                possession where the arrears threshold is met both when the notice is
                served and when the case reaches court. That is why landlords should keep
                the arrears position updated right up to the hearing date.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In practice, arrears cases are won or lost on evidence quality. A clear
                rent schedule, matching bank records, and a consistent witness statement
                usually matter more than broad allegations that the tenant has simply
                failed to pay.
              </p>
            </article>

            <article
              id="what-happens-after-possession-order"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                What Happens After a Possession Order
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                A possession order UK judgment normally gives a possession date by which
                the tenant must leave, often within 14 days unless the court allows longer
                due to hardship.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                If the possession date passes and the tenant stays, landlords must apply
                for a warrant of possession so county court bailiffs, or an authorised High
                Court route where permitted, can enforce the order.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Enforcement appointments are not immediate in many areas. Bailiff eviction
                UK waiting times can add several weeks, which is why this step is a common
                source of delay in the wider eviction timeline UK.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords should also remember that possession orders and enforcement are
                separate stages. Winning the possession order is important, but the case is
                not complete until the property is actually recovered or the tenant leaves
                voluntarily.
              </p>
            </article>

            <article
              id="typical-eviction-scenarios"
              className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                Typical Eviction Scenarios Landlords Face
              </h2>
              <p className="mt-4 leading-7 text-gray-700">
                Many landlords start eviction action when a fixed term is ending and they
                want the property back. In that scenario, the main question is usually
                whether Section 21 is available and whether the compliance documents were
                served properly at the start of the tenancy.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Another common scenario is rent arrears. Here, the focus shifts to Section
                8, the arrears schedule, and whether the landlord can prove the breach
                clearly enough for court. Cases involving partial payments often need
                especially careful updating.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Some cases involve persistent tenancy breaches such as anti-social
                behaviour, unauthorised occupants, or property damage. In those cases, the
                strongest files usually combine the tenancy agreement, dated incident
                records, communications, and any supporting third-party evidence.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                A final common scenario is where the tenant simply refuses to leave after a
                valid notice or even after a possession order. In those cases, landlords
                need to plan for the full route from notice to court to enforcement rather
                than assuming possession will happen automatically.
              </p>
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
            <p className="mt-4 leading-7 text-gray-700">
              Use these guides to plan your next step based on your case type, whether you
              are preparing an eviction notice form, managing arrears evidence, or
              estimating likely timescales.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link
                href="/section-21-notice-guide"
                className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
              >
                Section 21 notice guide: rules, timing, and validity checks
              </Link>
<Link
  href="/products/notice-only"
  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
>
  Section 8 notice guide: choosing grounds and evidence
</Link>
              <Link
                href="/eviction-process-england"
                className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
              >
                Eviction process England: full court route explained
              </Link>
              <Link
                href="/eviction-timeline-uk"
                className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
              >
                Eviction timeline UK: realistic stage-by-stage expectations
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="final-cta" className="pb-14">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps for Landlords</h2>
            <p className="mt-4 text-gray-700 leading-7">
              Before serving any eviction notice form, confirm your tenancy facts,
              compliance documents, evidence file, and service method so your case starts
              on the strongest legal footing.
            </p>
            <p className="mt-4 text-gray-700 leading-7">
              A carefully prepared file can reduce avoidable delays, improve possession
              order outcomes, and keep your eviction process route compliant from notice
              through enforcement.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products/complete-pack"
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                Start your eviction route check
              </Link>
              <Link
                href="/tools/validators"
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#F8F4FF]"
              >
                Validate your notice route
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}