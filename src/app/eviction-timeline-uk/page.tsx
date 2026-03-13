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

const canonical = 'https://landlordheaven.co.uk/eviction-timeline-uk';

export const metadata: Metadata = {
  title:
    'Eviction Timeline UK | How Long the Eviction Process Takes for Landlords | LandlordHeaven',
  description:
    'A detailed eviction timeline for UK landlords explaining how long each stage of the eviction process usually takes, from notice through possession orders and bailiff enforcement.',
  alternates: {
    canonical,
  },
};

const faqs: FAQItem[] = [
  {
    question: 'How long does eviction usually take in the UK?',
    answer:
      'Many eviction cases take between three and six months from notice to enforcement. The timeline depends on the notice used, whether the tenant leaves voluntarily, and court and bailiff waiting times.',
  },
  {
    question: 'What stage of eviction takes the longest?',
    answer:
      'Court processing and bailiff enforcement are often the longest stages. These depend on local court workload and enforcement availability.',
  },
  {
    question: 'Can eviction be completed faster?',
    answer:
      'Possibly. Cases move faster when the notice is valid, the documents are organised early, and the tenant leaves during the notice period.',
  },
  {
    question: 'What delays eviction cases most often?',
    answer:
      'Invalid notices, incorrect dates, weak proof of service, and missing compliance documents are some of the most common causes of delay.',
  },
];

function Card({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article
      id={id}
      className="scroll-mt-24 rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8"
    >
      <h2 className="text-2xl font-semibold text-[#2a2161]">{title}</h2>
      {children}
    </article>
  );
}

function CtaBand({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
      <h3 className="text-xl font-semibold text-[#2a2161]">{title}</h3>
      <p className="mt-3 leading-7 text-gray-700">{body}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={primaryHref}
          className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/eviction-timeline-uk"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Eviction Timeline UK',
          description: metadata.description as string,
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-13',
        })}
      />

      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' },
          { name: 'Eviction Timeline UK', url: canonical },
        ])}
      />

      <StructuredData data={faqPageSchema(faqs)} />

      <UniversalHero
        title="Eviction Timeline UK"
        subtitle="A realistic breakdown of how long each stage of eviction usually takes for landlords."
        primaryCta={{ label: 'Start Notice Only', href: '/products/notice-only' }}
        secondaryCta={{
          label: 'Start Complete Eviction Pack',
          href: '/products/complete-pack',
        }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Eviction timeline UK icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Understand the real eviction timeline in England, including notice periods,
          court processing, possession orders, and enforcement.
        </p>
      </UniversalHero>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card title="Typical Eviction Timeline in England">
              <p className="mt-4 text-gray-700 leading-7">
                Landlords often ask how long eviction takes in the UK. While the exact
                timeline varies by case, most eviction processes follow a predictable
                sequence of stages beginning with notice and ending with enforcement.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="px-4 py-3 text-left font-semibold">Typical time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF]">
                      <td className="px-4 py-3">Notice period</td>
                      <td className="px-4 py-3">2 weeks – 2 months</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF]">
                      <td className="px-4 py-3">Court processing</td>
                      <td className="px-4 py-3">6 – 10 weeks</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF]">
                      <td className="px-4 py-3">Possession order</td>
                      <td className="px-4 py-3">Around 14 days</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF]">
                      <td className="px-4 py-3">Bailiff enforcement</td>
                      <td className="px-4 py-3">2 – 6 weeks</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-gray-700 leading-7">
                Many cases take between three and six months overall, though local court
                delays can extend this.
              </p>
            </Card>

            <Card title="Why Eviction Timelines Vary">
              <p className="mt-4 text-gray-700 leading-7">
                Not all eviction cases follow the same timeline. Several factors influence
                how quickly a landlord regains possession. These include the notice route
                used, whether the tenant leaves voluntarily, the complexity of the case,
                and how busy local courts are.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                For example, Section 21 cases may move faster if the paperwork is valid and
                the accelerated possession route is available. Section 8 cases can take
                longer because they usually involve a court hearing where evidence is
                reviewed.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                The most important factor landlords can control is preparation. Cases with
                accurate notices, organised documents, and clear evidence usually progress
                faster than those where paperwork has to be corrected during the process.
              </p>
            </Card>

            <CtaBand
              title="Need to generate your eviction notice now?"
              body="If you already know the correct route, start with Notice Only. If you want broader support across notice generation, route validation, and possession planning, use the Complete Eviction Pack."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />

            <Card title="Stage 1: Notice Period">
              <p className="mt-4 text-gray-700 leading-7">
                The eviction timeline usually begins with the notice stage. Landlords must
                serve the correct notice before applying to court.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                The notice period depends on the notice type used. Section 21 notices
                typically require at least two months' notice, while Section 8 notices may
                involve shorter periods depending on the grounds relied upon.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                During this stage, tenants may choose to leave voluntarily. If they do,
                landlords may not need to proceed further through the eviction process.
              </p>
            </Card>

            <Card title="Stage 2: Court Application">
              <p className="mt-4 text-gray-700 leading-7">
                If the tenant does not leave after the notice period expires, landlords can
                apply to court for a possession order. Section 21 cases may qualify for an
                accelerated possession claim if there is no rent arrears claim included.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                Section 8 claims typically follow the standard possession route and often
                involve a hearing where both landlord and tenant can present their case.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                Court processing time varies by region but commonly takes between six and
                ten weeks from application to decision.
              </p>
            </Card>

            <Card title="Stage 3: Possession Order">
              <p className="mt-4 text-gray-700 leading-7">
                If the court grants possession, it issues a possession order stating when
                the tenant must leave the property. This is commonly around 14 days after
                the order is made, although the court may allow longer where hardship is
                shown.
              </p>
            </Card>

            <Card title="Stage 4: Bailiff Enforcement">
              <p className="mt-4 text-gray-700 leading-7">
                If the tenant does not leave by the possession date, landlords must apply
                for enforcement. This usually involves county court bailiffs attending the
                property to lawfully recover possession.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                Bailiff waiting times vary significantly depending on local demand and can
                add several weeks to the eviction timeline.
              </p>
            </Card>

            <Card title="Common Reasons Eviction Timelines Get Delayed">
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>Invalid or incorrectly dated eviction notices</li>
                <li>Missing compliance documents</li>
                <li>Weak rent arrears evidence</li>
                <li>No reliable proof of service</li>
                <li>Incomplete court applications</li>
              </ul>

              <p className="mt-4 text-gray-700 leading-7">
                Preparing a complete document bundle before serving notice helps reduce
                the risk of delay later in the process.
              </p>
            </Card>

            <CtaBand
              title="Start your eviction process correctly"
              body="Landlords who validate the route and documents early often avoid weeks of delay later. Start with the right workflow now."
              primaryHref="/products/complete-pack"
              primaryLabel="Start Complete Eviction Pack"
              secondaryHref="/products/notice-only"
              secondaryLabel="Start Notice Only"
            />
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Eviction Timeline UK FAQs" />
      </section>
    </div>
  );
}