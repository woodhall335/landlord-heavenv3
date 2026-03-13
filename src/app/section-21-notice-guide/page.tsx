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

const canonical = 'https://landlordheaven.co.uk/section-21-notice-guide';

export const metadata: Metadata = {
  title: 'Section 21 Notice Guide | Rules, Validity, Timing and Next Steps | LandlordHeaven',
  description:
    'A complete Section 21 notice guide for landlords in England covering when to use Form 6A, notice periods, validity checks, common mistakes, court next steps, and when to choose notice-only or a complete eviction pack.',
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'Section 21 Notice Guide | Rules, Validity, Timing and Next Steps | LandlordHeaven',
    description:
      'Learn when and how to use a Section 21 notice, what makes it invalid, what documents landlords need, and what happens after notice expiry.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-is-a-section-21-notice', label: 'What is a Section 21 notice?' },
  { href: '#when-landlords-use-section-21', label: 'When landlords use Section 21' },
  { href: '#section-21-validity-checklist', label: 'Validity checklist' },
  { href: '#how-to-serve-a-section-21-notice', label: 'How to serve a Section 21 notice' },
  { href: '#section-21-timeline', label: 'Section 21 timeline' },
  { href: '#what-happens-after-section-21-expires', label: 'After notice expiry' },
  { href: '#common-section-21-mistakes', label: 'Common mistakes' },
  { href: '#section-21-vs-section-8', label: 'Section 21 vs Section 8' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
];

const faqs: FAQItem[] = [
  {
    question: 'What is a Section 21 notice?',
    answer:
      'A Section 21 notice is a notice used by landlords in England to seek possession of an Assured Shorthold Tenancy without relying on a tenant breach. It is commonly used when a landlord wants the property back at the right stage of the tenancy and the compliance requirements have been met.',
  },
  {
    question: 'How much notice does a Section 21 notice give?',
    answer:
      'A Section 21 notice usually gives at least two months’ notice. The dates must be calculated carefully because errors can invalidate the notice and delay possession.',
  },
  {
    question: 'Can I use a Section 21 notice during the first four months of a tenancy?',
    answer:
      'No. In most cases a Section 21 notice cannot be served during the first four months of the original tenancy. Landlords should check timing before serving Form 6A.',
  },
  {
    question: 'What documents do I need before serving a Section 21 notice?',
    answer:
      'Landlords should usually check deposit protection, prescribed information, gas safety records, EPC, and the How to Rent guide. Missing compliance documents are one of the most common reasons a Section 21 notice is challenged.',
  },
  {
    question: 'What form is used for a Section 21 notice?',
    answer:
      'Landlords in England normally use Form 6A for Section 21 notices. Using the wrong form or an outdated version can create validity problems.',
  },
  {
    question: 'What happens if the tenant does not leave after a Section 21 notice expires?',
    answer:
      'If the tenant remains after the notice period ends, the landlord usually needs to apply to court for possession. Where only possession is sought and the paperwork is valid, this may proceed through the accelerated possession route.',
  },
  {
    question: 'Can a Section 21 notice be invalid?',
    answer:
      'Yes. Common reasons include missing compliance documents, errors in dates, invalid service, deposit protection failures, or serving the notice too early.',
  },
  {
    question: 'Should I choose Notice Only or the Complete Eviction Pack?',
    answer:
      'Notice Only is often suitable where you already understand the route and mainly need a compliant notice generated. The Complete Eviction Pack is usually better where you want broader support across route choice, document preparation, and possession workflow.',
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
        pagePath="/section-21-notice-guide"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 21 Notice Guide',
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
          { name: 'Section 21 Notice Guide', url: canonical },
        ])}
      />
      <StructuredData data={faqPageSchema(faqs)} />

      <UniversalHero
        title="Section 21 Notice Guide"
        subtitle="Rules, timing, validity checks, and what landlords should do next."
        primaryCta={{ label: 'Start Notice Only', href: '/products/notice-only' }}
        secondaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Section 21 notice guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Learn when to use a Section 21 notice, what makes it valid, what documents you
          need, and when landlords should choose a Notice Only workflow versus a Complete
          Eviction Pack.
        </p>
      </UniversalHero>

      <section id="quick-answer" className="border-b border-[#E6DBFF] bg-white py-10">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Quick Answer</h2>
            <p className="mt-4 text-gray-700 leading-7">
              A Section 21 notice is the route landlords in England usually consider when
              they want possession of an Assured Shorthold Tenancy without relying on a
              tenant breach. In most cases it must be served using Form 6A, it usually
              requires at least two months’ notice, and it will only be reliable if the
              compliance file is in order before service.
            </p>
            <p className="mt-4 text-gray-700 leading-7">
              The most common reason a Section 21 notice fails is not speed, but validity.
              Date errors, service problems, deposit issues, or missing documents can all
              undermine possession later. That is why landlords should treat Section 21 as
              a document-sensitive process, not just a form-filling task.
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
            <Card id="what-is-a-section-21-notice" title="What Is a Section 21 Notice?">
              <p className="mt-4 leading-7 text-gray-700">
                A Section 21 notice is the notice landlords in England usually use when
                they want possession without relying on rent arrears or another tenancy
                breach. It is often described as the “no-fault” possession route, although
                in practice it still depends on careful timing, correct documents, and
                valid service.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                For most private landlords, Section 21 only makes sense where the tenancy
                is an Assured Shorthold Tenancy and the compliance history is clean. The
                court will not treat the route as automatic just because the landlord wants
                the property back. If the notice is defective or the tenancy paperwork is
                inconsistent, possession can still be delayed or refused.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually use Section 21 when a fixed term is
                ending, when they want possession of the property, or when they prefer a
                possession-only route rather than a breach-based claim. Where the facts are
                more complex, landlords often compare Section 21 against Section 8 before
                serving anything.
              </p>
            </Card>

            <Card id="when-landlords-use-section-21" title="When Landlords Use Section 21">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords commonly consider Section 21 where they want the property back at
                the end of a tenancy or at a lawful point during a periodic tenancy. It is
                often chosen where the landlord’s goal is possession rather than proving
                misconduct, particularly when the paperwork is strong and the tenancy file
                is compliant.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Typical examples include a landlord preparing to sell, a landlord wanting
                to re-let on different terms, or a landlord simply seeking possession at
                the correct stage of the tenancy. In these scenarios, Section 21 can be a
                commercially sensible route because it is focused on possession rather than
                arguing breach facts in court.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                That said, landlords should not choose Section 21 purely because it sounds
                simpler. If the compliance history is weak, if the dates are uncertain, or
                if there are deposit issues, the route can become fragile. A slower but
                more robust route is often commercially faster than a notice that fails on
                validity.
              </p>
            </Card>

            <Card id="section-21-validity-checklist" title="Section 21 Validity Checklist">
              <p className="mt-4 leading-7 text-gray-700">
                Before serving a Section 21 notice, landlords should run a validity check.
                The strongest possession claims usually come from files that were reviewed
                before the notice was generated, not corrected later after the tenant has
                challenged the paperwork.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Check the tenancy is the right type for Section 21.</li>
                <li>Confirm the tenancy is at the correct stage for service.</li>
                <li>Confirm deposit protection and prescribed information were handled correctly.</li>
                <li>Check gas safety records and EPC requirements.</li>
                <li>Check the How to Rent guide was provided where required.</li>
                <li>Use the correct form, usually Form 6A.</li>
                <li>Check all dates carefully before service.</li>
                <li>Plan proof of service before notice issue.</li>
              </ul>
              <p className="mt-4 leading-7 text-gray-700">
                This is where many landlords underestimate the process. A Section 21
                notice is only as good as the evidence behind it. If the file is missing
                key compliance records, or if the dates are inconsistent across the notice
                and supporting documents, the claim can be weakened before it even reaches
                court.
              </p>
            </Card>

            <CtaBand
              title="Need a compliant Section 21 notice fast?"
              body="Use Notice Only when you mainly need a properly generated notice and clear next-step guidance. Use the Complete Eviction Pack if you want broader possession workflow support."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />

            <Card id="how-to-serve-a-section-21-notice" title="How to Serve a Section 21 Notice">
              <p className="mt-4 leading-7 text-gray-700">
                Serving the notice correctly matters just as much as generating it
                correctly. A valid notice that cannot be proven to have been served
                properly can still create possession problems later.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually review the tenancy agreement first to check what service
                methods are allowed. Depending on the facts, service may be by post, by
                hand, by process server, or by email if the tenancy terms permit it.
                Whatever method is used, the landlord should be able to prove the date and
                method of service with reliable evidence.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Good service evidence may include a certificate of posting, a witness
                statement, a process server record, or an accepted email trail. The goal
                is not just to show the notice exists, but to show the court exactly when
                and how it was served.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Service is also where avoidable mistakes creep in. Wrong dates, serving too
                early, using the wrong address, or relying on a method not supported by
                the tenancy can all undermine the notice. Landlords usually save the most
                time by validating service planning before sending the document.
              </p>
            </Card>

            <Card id="section-21-timeline" title="Section 21 Timeline">
              <p className="mt-4 leading-7 text-gray-700">
                The headline timeline for Section 21 often sounds simple: serve the notice,
                wait at least two months, then apply for possession if the tenant remains.
                In reality, the full Section 21 timeline depends on validity, tenant
                response, court listing speeds, and enforcement delays.
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
                      <td className="px-4 py-3 font-medium">Pre-service validation</td>
                      <td className="px-4 py-3">Varies by file quality</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Notice period</td>
                      <td className="px-4 py-3">Usually at least 2 months</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Possession application</td>
                      <td className="px-4 py-3">After notice expiry if tenant stays</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Court processing</td>
                      <td className="px-4 py-3">Often several weeks</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Enforcement if needed</td>
                      <td className="px-4 py-3">Often adds further weeks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords should treat this as a managed workflow rather than a single
                notice event. A valid notice served with clean evidence can support a much
                faster path than a notice that has to be re-served or defended because the
                dates or compliance record are inconsistent.
              </p>
            </Card>

            <Card id="what-happens-after-section-21-expires" title="What Happens After a Section 21 Notice Expires">
              <p className="mt-4 leading-7 text-gray-700">
                If the tenant leaves before the expiry date, the route may end there. If
                the tenant remains in occupation after the notice expires, the landlord
                usually needs to move to court for possession.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Where the claim is possession-only and the Section 21 file is valid,
                landlords often look at the accelerated possession route. This is one
                reason Section 21 is commercially attractive when the paperwork is strong.
                The court may be able to deal with the claim on the papers without a full
                hearing, although that always depends on the case.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The important point is that the notice itself does not remove the tenant.
                Possession still depends on the next legal stage if the tenant does not go
                voluntarily. Landlords who plan for notice, court, and enforcement from
                the beginning usually avoid the most expensive delays.
              </p>
            </Card>

            <CtaBand
              title="Already know you want a Section 21 generated?"
              body="Notice Only is usually the right fit where you already understand the route and want a compliant notice workflow. If you need broader help from validation through possession planning, choose the Complete Eviction Pack."
              primaryHref="/products/notice-only"
              primaryLabel="Go to Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Choose Complete Eviction Pack"
            />

            <Card id="common-section-21-mistakes" title="Common Section 21 Mistakes">
              <p className="mt-4 leading-7 text-gray-700">
                Most Section 21 failures are not caused by obscure legal arguments. They
                usually come from preventable operational mistakes.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Serving too early.</span>
                  <span className="block">
                    A Section 21 notice usually cannot be served during the first four
                    months of the original tenancy.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Using the wrong form or version.</span>
                  <span className="block">
                    Landlords should usually use Form 6A and confirm it is the correct form
                    for the tenancy.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Getting dates wrong.</span>
                  <span className="block">
                    Incorrect expiry dates are one of the most common reasons a notice is
                    challenged.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Missing compliance documents.</span>
                  <span className="block">
                    Deposit protection records, gas safety, EPC, and the How to Rent guide
                    can all affect validity.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Weak proof of service.</span>
                  <span className="block">
                    If service cannot be proved, possession can be delayed or the claim may
                    need to be restarted.
                  </span>
                </li>
              </ul>
              <p className="mt-4 leading-7 text-gray-700">
                In commercial terms, each of these errors increases cost, delay, and the
                chance that the landlord will have to start again. That is why validation
                before document generation is usually more valuable than fixing mistakes
                after service.
              </p>
            </Card>

            <Card id="section-21-vs-section-8" title="Section 21 vs Section 8">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords often compare Section 21 and Section 8 before serving notice.
                Section 21 is usually used where possession is the main goal and the
                compliance file is strong. Section 8 is usually used where the tenant has
                breached the tenancy, such as through rent arrears or anti-social
                behaviour.
              </p>
              <div className="mt-5 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Feature</th>
                      <th className="px-4 py-3 text-left font-semibold">Section 21</th>
                      <th className="px-4 py-3 text-left font-semibold">Section 8</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Reason</td>
                      <td className="px-4 py-3">Possession without relying on breach</td>
                      <td className="px-4 py-3">Possession based on breach grounds</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Typical form</td>
                      <td className="px-4 py-3">Form 6A</td>
                      <td className="px-4 py-3">Form 3</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Evidence burden</td>
                      <td className="px-4 py-3">High validity burden on compliance and service</td>
                      <td className="px-4 py-3">High proof burden on breach facts</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Best fit</td>
                      <td className="px-4 py-3">Clear compliance file and possession goal</td>
                      <td className="px-4 py-3">Rent arrears, nuisance, damage, or other breaches</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-7 text-gray-700">
                The route choice should come from the facts, not from assumptions. A
                compliant Section 21 can be efficient, but where the paperwork is weak or
                the real issue is breach, Section 8 may be the more resilient route.
              </p>
            </Card>

            <Card id="notice-only-vs-complete-pack" title="Notice Only vs Complete Eviction Pack">
              <p className="mt-4 leading-7 text-gray-700">
                This is one of the most important practical decisions on the page. Many
                landlords do not just need information; they need the right workflow for
                their case. The best option depends on how confident you already are about
                the route and how much support you need beyond notice generation.
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where you already understand that
                Section 21 is the right route and mainly want a compliant notice workflow.
                It is often suitable for experienced landlords, agents, or repeat users who
                want the notice created efficiently without stepping into a broader
                possession pack.
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                The Complete Eviction Pack is usually the stronger option where route
                choice, evidence readiness, next-step planning, or court preparation still
                need attention. It is often the better choice where the case may move from
                notice to possession application and enforcement.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In simple terms, choose Notice Only where the route is already clear.
                Choose the Complete Eviction Pack where the wider possession workflow still
                needs validating.
              </p>
            </Card>

            <CtaBand
              title="Choose the right workflow before you serve notice"
              body="If you mainly need the notice, start with Notice Only. If you need broader route support, stronger preparation, and a fuller possession workflow, start with the Complete Eviction Pack."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />
          </div>
        </Container>
      </section>

      <section id="faqs" className="scroll-mt-24 py-2">
        <FAQSection faqs={faqs} title="Section 21 Notice FAQs" />
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card title="Related Guides" id="related-guides">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords researching Section 21 often also need guidance on route choice,
                eviction timing, possession workflow, and what to do if the case turns
                into a breach-based claim. These guides help build the wider picture.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Link
                  href="/how-to-evict-a-tenant-uk"
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  How to evict a tenant in the UK: full landlord guide
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
                <Link
                  href="/eviction-timeline-uk"
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  Eviction timeline UK: stage-by-stage expectations
                </Link>
              </div>
            </Card>

            <Card id="final-cta" title="Next Steps">
              <p className="mt-4 leading-7 text-gray-700">
                Before serving a Section 21 notice, confirm the tenancy facts, validate the
                compliance file, check the dates, and plan proof of service. The quality of
                that preparation usually determines whether possession later feels simple or
                expensive.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                If your route is already clear and you mainly need the notice itself, start
                with Notice Only. If you want a broader workflow that supports possession
                planning beyond notice generation, start with the Complete Eviction Pack.
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