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
import { generateMetadata } from '@/lib/seo';

const canonical = 'https://landlordheaven.co.uk/section-8-notice-guide';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = generateMetadata({
  title: 'Section 8 Notice Guide | Grounds, Arrears & Next Steps',
  description:
    'Section 8 notice guide for landlords in England covering Form 3, grounds for possession, rent arrears, service, evidence, and court next steps.',
  path: '/section-8-notice-guide',
  type: 'article',
  keywords: [
    'section 8 notice guide',
    'form 3',
    'grounds for possession',
    'section 8 rent arrears',
    'serve section 8 notice',
    'section 8 evidence',
  ],
});

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-is-a-section-8-notice', label: 'What is a Section 8 notice?' },
  { href: '#when-landlords-use-section-8', label: 'When landlords use Section 8' },
  { href: '#section-8-grounds-explained', label: 'Section 8 grounds explained' },
  { href: '#section-8-rent-arrears', label: 'Section 8 for rent arrears' },
  { href: '#how-to-serve-a-section-8-notice', label: 'How to serve a Section 8 notice' },
  { href: '#section-8-evidence-checklist', label: 'Evidence checklist' },
  { href: '#section-8-timeline', label: 'Section 8 timeline' },
  { href: '#common-section-8-mistakes', label: 'Common mistakes' },
  { href: '#section-8-vs-section-21', label: 'Section 8 vs Section 21' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What is a Section 8 notice?',
    answer:
      'A Section 8 notice is the notice landlords in England usually use when they want possession based on a tenant breach. Common examples include rent arrears, anti-social behaviour, property damage, or other breaches of the tenancy agreement.',
  },
  {
    question: 'What form is used for a Section 8 notice?',
    answer:
      'Landlords normally use Form 3 for a Section 8 notice. Using the wrong form or the wrong grounds can weaken the claim before it reaches court.',
  },
  {
    question: 'How much notice does a Section 8 notice give?',
    answer:
      'The notice period depends on the grounds relied on. Some grounds may allow shorter notice periods than others, so landlords should always confirm the correct notice period before serving the form.',
  },
  {
    question: 'Can I use Section 8 for rent arrears?',
    answer:
      'Yes. Section 8 is commonly used for rent arrears, especially where the landlord wants to rely on mandatory and discretionary grounds supported by a clear arrears schedule and payment evidence.',
  },
  {
    question: 'What evidence do I need for a Section 8 claim?',
    answer:
      'Landlords usually need the tenancy agreement, the notice served, proof of service, rent records or other breach evidence, and a clear chronology of events. The court will usually expect the documents to be consistent and up to date.',
  },
  {
    question: 'What happens after a Section 8 notice expires?',
    answer:
      'If the tenant does not leave or fix the breach after the notice period ends, the landlord normally needs to apply to court for a possession order. Section 8 claims usually proceed through a standard possession route and often involve a hearing.',
  },
  {
    question: 'Can a Section 8 notice be invalid?',
    answer:
      'Yes. Common problems include using the wrong grounds, getting dates wrong, serving the notice incorrectly, or failing to support the grounds with enough evidence.',
  },
  {
    question: 'Should I use Notice Only or the Complete Eviction Pack?',
    answer:
      'Notice Only is often suitable where you already know Section 8 is the correct route and mainly need a compliant notice workflow. The Complete Eviction Pack is usually a better fit where you want wider support around route choice, evidence quality, and the next court stages.',
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
        pagePath="/section-8-notice-guide"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 8 Notice Guide',
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
          { name: 'Section 8 Notice Guide', url: canonical },
        ])}
      />
      <UniversalHero
        title="Section 8 Notice Guide"
        subtitle="Grounds, timing, evidence, rent arrears, and what landlords should do next."
        primaryCta={{ label: 'Start Notice Only', href: '/products/notice-only' }}
        secondaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Section 8 notice guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Learn when to use a Section 8 notice, which grounds landlords rely on, what
          evidence matters most, and when to choose a Notice Only workflow versus the
          Complete Eviction Pack.
        </p>
      </UniversalHero>

      <section id="quick-answer" className="border-b border-[#E6DBFF] bg-white py-10">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Quick Answer</h2>
            <p className="mt-4 leading-7 text-gray-700">
              A Section 8 notice is the route landlords in England usually use when they
              want possession because the tenant has breached the tenancy agreement. It is
              commonly used for rent arrears, nuisance, anti-social behaviour, property
              damage, or other breaches supported by evidence.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              Unlike Section 21, Section 8 depends less on a no-fault possession route and
              more on proving the legal grounds being relied on. That means the quality of
              the evidence, the correct choice of grounds, accurate dates, and proper
              service all matter from the start.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[#E6DBFF] bg-white py-8">
        <Container>
          <nav
            aria-labelledby="guide-links-heading"
            className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6"
          >
            <h2 id="guide-links-heading" className="text-2xl font-semibold text-[#2a2161]">
              In This Guide
            </h2>
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
          </nav>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card id="what-is-a-section-8-notice" title="What Is a Section 8 Notice?">
              <p className="mt-4 leading-7 text-gray-700">
                A Section 8 notice is the formal notice landlords in England usually serve
                when they want possession based on one or more tenant breaches. It is not a
                general notice to end a tenancy for convenience. Instead, it is a breach
                route that depends on specific legal grounds and evidence to support them.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                This makes Section 8 both powerful and evidence-sensitive. Where the facts
                are strong, it can be the correct and commercially sensible possession
                route. Where the facts are unclear or the evidence is weak, it can become a
                more heavily disputed claim than landlords expect.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords often use Section 8 where they are dealing
                with rent arrears, anti-social behaviour, property damage, persistent late
                payment, unauthorised occupation, or another clear breach of the tenancy
                terms. The core question is not just whether something went wrong, but
                whether the breach can be proved clearly enough for court.
              </p>
            </Card>

            <Card id="when-landlords-use-section-8" title="When Landlords Use Section 8">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually consider Section 8 when the tenant has done something
                that breaches the tenancy agreement or the statutory obligations that apply
                to the tenancy. The most common example is rent arrears, but the route is
                wider than arrears alone.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                It may also be the correct route where there is anti-social behaviour,
                damage to the property, repeated breaches of tenancy conditions, nuisance,
                or other conduct that makes continued occupation difficult. In those cases,
                landlords are not simply asking for possession because they want the
                property back. They are saying the tenant has breached the legal basis on
                which they were allowed to remain in the property.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                That difference matters because Section 8 cases usually turn on evidence.
                Landlords should not think of the notice as the start of the evidence
                exercise. The evidence should already exist before the notice is served,
                and it should match the grounds relied on.
              </p>
            </Card>

            <Card id="section-8-grounds-explained" title="Section 8 Grounds Explained">
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 relies on legal grounds for possession. Some grounds are
                mandatory, meaning the court must make a possession order if the ground is
                made out. Others are discretionary, meaning the court will look at the
                circumstances and decide whether possession is reasonable.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                This is why selecting the correct grounds is one of the most important
                parts of the Section 8 process. A landlord can have a genuine problem with
                the tenancy and still weaken the case by choosing the wrong grounds or by
                failing to present the grounds clearly in the supporting evidence.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In many cases, landlords rely on a combination of grounds rather than just
                one. For example, a rent arrears claim may involve both mandatory and
                discretionary grounds. That gives the court a fuller picture and may help
                protect the case if the arrears position changes before the hearing.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The right question is not “which ground sounds strongest on paper?” It is
                “which grounds match the facts, and which of those can I prove
                consistently?” A smaller number of well-supported grounds is often stronger
                than a longer list that is poorly evidenced.
              </p>
            </Card>

            <CtaBand
              title="Need a Section 8 notice generated properly?"
              body="Use Notice Only if you already know Section 8 is the right route and mainly need a compliant notice workflow. Use the Complete Eviction Pack if you want broader support with route choice, evidence, and next legal steps."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />

            <Card id="section-8-rent-arrears" title="Section 8 for Rent Arrears">
              <p className="mt-4 leading-7 text-gray-700">
                Rent arrears are one of the most common reasons landlords use Section 8.
                In these cases, the strength of the claim usually depends on the arrears
                schedule, bank records, tenancy terms, and the accuracy of the figures used
                throughout the notice and court process.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Ground 8 is especially significant because it can be a mandatory ground if
                the arrears threshold is met at the right points in the case. However,
                landlords often strengthen arrears claims by using mandatory and
                discretionary grounds together, rather than relying on one ground alone.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                A common mistake is treating the arrears schedule as a static document. In
                reality, the arrears position may change before the hearing if the tenant
                makes partial payments. That means landlords should keep the schedule
                updated so the court can see the exact position at the hearing date.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In commercial terms, rent arrears cases often rise or fall on evidence
                quality. A clean ledger, matching bank records, and a dated witness
                narrative are usually more valuable than broad assertions that the tenant
                has been unreliable.
              </p>
            </Card>

            <Card id="how-to-serve-a-section-8-notice" title="How to Serve a Section 8 Notice">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords in England normally use Form 3 for a Section 8 notice. Serving
                the right form is only the start. The notice must also use the correct
                grounds, the correct dates, and a lawful service method that can be proved
                later if the case reaches court.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Service should be planned before the notice is issued, not improvised on
                the day. Depending on the tenancy terms and the facts of the case, service
                may be by post, by hand, by process server, or by email if the tenancy
                agreement clearly permits it.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Proof of service matters because tenants may later dispute when the notice
                was received or whether it was received at all. Good service evidence may
                include a certificate of posting, a witness statement, a process server
                record, or a reliable electronic trail where permitted.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The notice period under Section 8 depends on the grounds used. That means
                landlords should never assume there is one standard Section 8 notice period
                for every case. Getting the notice period wrong can undermine the claim
                before the court even looks at the underlying breach.
              </p>
            </Card>

            <Card id="section-8-evidence-checklist" title="Section 8 Evidence Checklist">
              <p className="mt-4 leading-7 text-gray-700">
                Evidence is the heart of a Section 8 case. The court will usually want to
                see not only that the landlord says a breach occurred, but exactly what
                happened, when it happened, and how the documents support that account.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Signed tenancy agreement and any renewal or variation documents</li>
                <li>Copy of the Section 8 notice served using Form 3</li>
                <li>Proof of service showing how and when the notice was served</li>
                <li>Rent statement, arrears schedule, and bank records for arrears cases</li>
                <li>Incident logs, witness reports, or correspondence for nuisance or damage cases</li>
                <li>Chronology of events showing breach history and landlord action</li>
                <li>Any supporting photos, contractor evidence, or third-party records where relevant</li>
              </ul>
              <p className="mt-4 leading-7 text-gray-700">
                A good Section 8 evidence file is usually chronological and internally
                consistent. Dates, amounts, and allegations should match across the notice,
                the witness evidence, and the supporting documents. If they do not, the
                court may question the reliability of the claim.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords often lose time because the file is incomplete rather than
                because the case is weak. The stronger the evidence bundle is before court,
                the easier it is to move from notice stage to possession stage without
                avoidable delay.
              </p>
            </Card>

            <CtaBand
              title="Already know the grounds and need the notice?"
              body="Notice Only is usually the faster fit where the Section 8 route is already clear. If your case needs broader preparation, stronger evidence handling, or fuller possession support, choose the Complete Eviction Pack."
              primaryHref="/products/notice-only"
              primaryLabel="Go to Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Choose Complete Eviction Pack"
            />

            <Card id="section-8-timeline" title="Section 8 Timeline">
              <p className="mt-4 leading-7 text-gray-700">
                The full Section 8 timeline varies depending on the grounds used, the
                notice period attached to those grounds, whether the tenant responds, and
                how quickly the case reaches court. Because Section 8 usually leads into a
                standard possession claim, landlords should expect the timeline to depend
                heavily on court process rather than notice service alone.
              </p>
              <div className="mt-5 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="px-4 py-3 text-left font-semibold">Typical timing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Ground selection and evidence review</td>
                      <td className="px-4 py-3">Varies by case complexity</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Notice period</td>
                      <td className="px-4 py-3">Depends on the grounds used</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Possession claim</td>
                      <td className="px-4 py-3">After notice expiry if breach remains</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Court hearing</td>
                      <td className="px-4 py-3">Often required</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Enforcement if needed</td>
                      <td className="px-4 py-3">Adds further weeks in many areas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-7 text-gray-700">
                For landlords, the key point is that Section 8 is a managed workflow, not
                a single notice event. Good evidence and accurate notice preparation
                usually save more time than trying to rush a weak file into court.
              </p>
            </Card>

            <Card id="common-section-8-mistakes" title="Common Section 8 Mistakes">
              <p className="mt-4 leading-7 text-gray-700">
                Most Section 8 problems come from preventable preparation errors. The court
                usually expects the grounds, notice, service records, and evidence to align
                closely. Where they do not, the landlord may face delay, adjournment, or a
                dismissed claim.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Using the wrong grounds.</span>
                  <span className="block">
                    A genuine problem with the tenancy can still fail if the legal grounds
                    do not match the facts.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Using the right grounds but weak evidence.</span>
                  <span className="block">
                    Strong allegations without records, dates, or supporting documents are
                    often not enough.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Getting the notice period wrong.</span>
                  <span className="block">
                    Different grounds can carry different notice periods, so assumptions are
                    risky.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Poor proof of service.</span>
                  <span className="block">
                    If service cannot be shown clearly, the notice may be challenged.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Failing to update arrears before the hearing.</span>
                  <span className="block">
                    Partial payments can change the legal position, especially in rent
                    arrears cases.
                  </span>
                </li>
              </ul>
            </Card>

            <Card id="section-8-vs-section-21" title="Section 8 vs Section 21">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords often compare Section 8 and Section 21 before serving notice.
                Section 8 is usually used where there is a provable breach. Section 21 is
                usually used where the landlord wants possession without relying on breach,
                provided the compliance file supports that route.
              </p>
              <div className="mt-5 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Feature</th>
                      <th className="px-4 py-3 text-left font-semibold">Section 8</th>
                      <th className="px-4 py-3 text-left font-semibold">Section 21</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Reason</td>
                      <td className="px-4 py-3">Breach-based possession</td>
                      <td className="px-4 py-3">No-fault possession route</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Typical form</td>
                      <td className="px-4 py-3">Form 3</td>
                      <td className="px-4 py-3">Form 6A</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Evidence focus</td>
                      <td className="px-4 py-3">Proof of the breach and supporting facts</td>
                      <td className="px-4 py-3">Validity, compliance, and service</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Court route</td>
                      <td className="px-4 py-3">Usually standard possession claim</td>
                      <td className="px-4 py-3">May allow accelerated possession if appropriate</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-7 text-gray-700">
                The right route depends on the facts, not preference alone. If the real
                problem is breach and the evidence is there, Section 8 is often the better
                fit. If the landlord simply wants possession and the compliance file is
                strong, Section 21 may be more suitable.
              </p>
            </Card>

            <Card id="notice-only-vs-complete-pack" title="Notice Only vs Complete Pack">
              <p className="mt-4 leading-7 text-gray-700">
                Choosing the right product matters because many landlords are not just
                looking for information. They need a workflow that matches the certainty of
                their case.
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where you already know Section 8 is
                the correct route and mainly need a compliant notice produced from the
                right inputs. It is often suitable for landlords, agents, or repeat users
                who understand the grounds and want the notice workflow handled cleanly.
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                The Complete Eviction Pack is usually the stronger choice where route
                confidence, evidence readiness, next-step planning, or possession workflow
                support still matter. It is often the better fit where the case may proceed
                from notice to court and enforcement.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In simple terms, use Notice Only where the route is already settled. Use
                the Complete Eviction Pack where the wider possession case still needs
                validation and preparation.
              </p>
            </Card>

            <CtaBand
              title="Choose the right Section 8 workflow before you serve"
              body="If you mainly need the notice, start with Notice Only. If you want broader preparation, stronger evidence handling, and a fuller possession workflow, choose the Complete Eviction Pack."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />
          </div>
        </Container>
      </section>

      <section id="faqs" className="scroll-mt-24 py-2">
        <FAQSection faqs={faqs} title="Section 8 Notice FAQs" />
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card title="Related Guides" id="related-guides">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords researching Section 8 often also need guidance on wider eviction
                process, route choice, notice-only workflows, and possession planning.
                These pages help build the full picture.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Link
                  href="/how-to-evict-a-tenant-uk"
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  How to evict a tenant in the UK: full landlord guide
                </Link>
                <Link
                  href="/section-21-notice-guide"
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  Section 21 notice guide: rules, validity checks, and timing
                </Link>
                <Link
                  href="/products/notice-only"
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  Notice Only: generate compliant notice documents
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  Complete Eviction Pack: broader possession workflow support
                </Link>
              </div>
            </Card>

            <Card id="final-cta" title="Next Steps">
              <p className="mt-4 leading-7 text-gray-700">
                Before serving a Section 8 notice, confirm the grounds, validate the
                notice period, organise the evidence bundle, and plan proof of service.
                The strength of that preparation often determines whether the possession
                process feels controlled or chaotic later.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                If you already know Section 8 is the right route and mainly need the
                notice, start with Notice Only. If your case needs wider preparation,
                stronger evidence handling, and fuller possession workflow support, start
                with the Complete Eviction Pack.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/products/notice-only"
                  className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                >
                  Start Notice Only
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  Start Complete Eviction Pack
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}
