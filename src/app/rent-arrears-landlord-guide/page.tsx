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

const canonical = 'https://landlordheaven.co.uk/rent-arrears-landlord-guide';

export const metadata: Metadata = {
  title: 'Rent Arrears Landlord Guide | Recovery, Notices, Section 8 and Next Steps | LandlordHeaven',
  description:
    'A complete rent arrears landlord guide covering what to do when tenants fall behind, how to document arrears, when to use Section 8, what evidence courts expect, and when to choose Notice Only or the Complete Eviction Pack.',
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'Rent Arrears Landlord Guide | Recovery, Notices, Section 8 and Next Steps | LandlordHeaven',
    description:
      'Learn how landlords handle rent arrears, what evidence matters most, when to use Section 8, and how to move from arrears management to possession if needed.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-rent-arrears-mean-for-landlords', label: 'What rent arrears mean' },
  { href: '#what-landlords-should-do-first', label: 'What to do first' },
  { href: '#how-to-document-rent-arrears', label: 'How to document arrears' },
  { href: '#rent-arrears-letter-and-notice-options', label: 'Letters and notice options' },
  { href: '#when-section-8-is-used-for-arrears', label: 'When Section 8 is used' },
  { href: '#rent-arrears-evidence-checklist', label: 'Evidence checklist' },
  { href: '#rent-arrears-timeline', label: 'Rent arrears timeline' },
  { href: '#common-rent-arrears-mistakes', label: 'Common mistakes' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What should landlords do first when rent is late?',
    answer:
      'Landlords usually start by checking the rent schedule, confirming the exact shortfall, and contacting the tenant promptly in writing. Early records are often just as important as later legal documents.',
  },
  {
    question: 'When do rent arrears become serious?',
    answer:
      'Arrears become more serious when missed payments continue, the balance grows, or the tenant stops engaging. From a legal and commercial perspective, landlords should act before the arrears become disorganised or poorly documented.',
  },
  {
    question: 'Can landlords evict tenants for rent arrears?',
    answer:
      'Yes. Rent arrears are one of the most common reasons landlords use Section 8. The strength of the case usually depends on the arrears schedule, payment records, tenancy terms, and the grounds relied on.',
  },
  {
    question: 'What evidence do I need for a rent arrears case?',
    answer:
      'Landlords usually need the tenancy agreement, rent statement, arrears schedule, bank records, communications with the tenant, the notice served, and proof of service. The court will usually expect the figures to be current and consistent.',
  },
  {
    question: 'Can a tenant reduce the strength of a rent arrears claim by making partial payments?',
    answer:
      'Sometimes. Partial payments can affect the grounds relied on, especially where a landlord is depending on a mandatory rent arrears ground. That is why arrears schedules should be updated right up to the hearing date.',
  },
  {
    question: 'Should I use Notice Only or the Complete Eviction Pack for rent arrears?',
    answer:
      'Notice Only is often suitable where you already know the correct notice route and mainly need a compliant notice generated. The Complete Eviction Pack is usually better where you want broader support around arrears strategy, evidence, route choice, and the next possession stages.',
  },
  {
    question: 'Can landlords recover both possession and arrears?',
    answer:
      'In many cases, yes. Landlords often pursue possession alongside arrears recovery, but the route and paperwork should be planned carefully so the claim remains consistent from notice to court.',
  },
  {
    question: 'What is the biggest mistake landlords make with rent arrears?',
    answer:
      'One of the biggest mistakes is letting arrears grow without keeping a clean rent schedule and written record. A weaker paper trail often causes more delay than the arrears themselves.',
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
        pagePath="/rent-arrears-landlord-guide"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Rent Arrears Landlord Guide',
          description: metadata.description as string,
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-12',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Landlord guides', url: 'https://landlordheaven.co.uk/landlord-guides' },
          { name: 'Rent Arrears Landlord Guide', url: canonical },
        ])}
      />
      <StructuredData data={faqPageSchema(faqs)} />

      <UniversalHero
        title="Rent Arrears Landlord Guide"
        subtitle="What landlords should do first, how to document arrears, and when to move from arrears management to legal action."
        primaryCta={{ label: 'Start Notice Only', href: '/products/notice-only' }}
        secondaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Rent arrears landlord guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Learn how landlords handle rent arrears, what records matter most, when Section 8
          may be appropriate, and how to choose the right workflow for arrears recovery
          and possession.
        </p>
      </UniversalHero>

      <section id="quick-answer" className="border-b border-[#E6DBFF] bg-white py-10">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Quick Answer</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Rent arrears should be treated as an evidence and decision-making problem,
              not just a missed payment problem. Landlords usually need to confirm the
              exact balance, record every missed payment, communicate with the tenant in
              writing, and decide early whether the issue is likely to stay at arrears
              management stage or move into notice, court, and possession.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The strongest arrears cases are usually built from clean rent schedules,
              matching bank records, dated communications, and a clear understanding of the
              tenancy terms. The longer landlords wait to organise the file, the harder it
              often becomes to recover arrears cleanly or move confidently into legal
              action.
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
            <Card id="what-rent-arrears-mean-for-landlords" title="What Rent Arrears Mean for Landlords">
              <p className="mt-4 leading-7 text-gray-700">
                Rent arrears are more than just an unpaid balance. For landlords, arrears
                affect cash flow, mortgage commitments, property management decisions, and
                the overall stability of the tenancy. A single late payment may sometimes
                be resolved quickly, but repeated arrears usually point to a wider tenancy
                problem that needs structured handling.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                From a legal and commercial perspective, arrears matter because they often
                become the foundation for later notice and possession decisions. If the
                arrears record is unclear, incomplete, or inconsistent, the landlord may
                struggle later even where the tenant has clearly failed to pay.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                That is why experienced landlords often treat arrears management as an
                early-stage workflow: confirm the figures, document the history, preserve
                communications, and decide whether the case is likely to remain a payment
                issue or become a possession case.
              </p>
            </Card>

            <Card id="what-landlords-should-do-first" title="What Landlords Should Do First">
              <p className="mt-4 leading-7 text-gray-700">
                The first step is to confirm the arrears accurately. Landlords should check
                the tenancy agreement, the rent due date, the payment method, and the
                latest bank records before contacting the tenant. This sounds obvious, but
                many arrears files begin with assumptions rather than verified figures.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Once the amount is clear, landlords usually contact the tenant promptly and
                in writing. The goal is not just to chase payment. It is to create a dated
                record showing when the issue was raised, how the tenant responded, and
                whether any repayment proposal was made.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                At the same time, landlords should start a clean arrears chronology. This
                should record the rent due, the rent paid, the running shortfall, and any
                messages, calls, or agreements relating to the arrears. If the case later
                escalates, this early record often becomes some of the most useful
                evidence.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The key at this stage is control. Landlords do not need to overreact to
                every late payment, but they do need a clean record from the beginning.
              </p>
            </Card>

            <Card id="how-to-document-rent-arrears" title="How to Document Rent Arrears">
              <p className="mt-4 leading-7 text-gray-700">
                A rent arrears file should be built as if it may later be reviewed by a
                judge. That does not mean it needs to be overly legalistic. It means the
                file should be clear, dated, and internally consistent.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The most important document is usually the arrears schedule. This should
                show the rent due on each date, the amount paid, the shortfall, and the
                running total owed. It should be easy for another person to read without
                needing extra explanation.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords should also keep supporting bank records, tenancy terms, and a
                log of communications with the tenant. If the tenant makes partial
                payments, those should be recorded immediately. If the tenant offers a
                repayment plan, the landlord should keep a written note of what was agreed
                and whether the agreement was kept.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Good arrears documentation reduces later confusion. Weak arrears files
                often fail not because the tenant paid rent, but because the landlord’s
                figures are unclear or outdated by the time the matter reaches notice or
                court stage.
              </p>
            </Card>

            <CtaBand
              title="Need a notice generated from a clean arrears workflow?"
              body="If your arrears position is already clear and you mainly need the right notice, start with Notice Only. If you need broader support from arrears strategy through possession preparation, choose the Complete Eviction Pack."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />

            <Card
              id="rent-arrears-letter-and-notice-options"
              title="Rent Arrears Letters and Notice Options"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Before moving into formal possession action, landlords often send rent
                arrears reminders, warning letters, or repayment requests. These can be
                useful both commercially and evidentially because they show the tenant was
                given a clear opportunity to address the shortfall.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The right letter depends on the stage of the problem. A first reminder may
                be appropriate for an early missed payment. A firmer arrears letter may be
                more appropriate where the balance is growing and the tenant is not
                engaging. The purpose is not to add drama; it is to keep the paper trail
                clear and move the case forward in an organised way.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Once landlords decide the problem may require possession, the issue usually
                shifts from informal letters to formal notices. At that stage, landlords
                should be careful not to confuse a collection letter with a legal notice.
                Both have value, but they serve different functions.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In practice, landlords often get better results where the arrears file, the
                communications, and the notice strategy all line up. Mixed messages or
                unclear documents tend to make later court work harder.
              </p>
            </Card>

            <Card
              id="when-section-8-is-used-for-arrears"
              title="When Section 8 Is Used for Arrears"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 is one of the main legal routes landlords use where rent arrears
                become serious enough to justify possession action. It is commonly used
                because it allows landlords to rely directly on the tenant’s payment
                breach, rather than waiting for a no-fault possession route.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In rent arrears cases, landlords often look closely at which grounds apply
                and whether they should rely on both mandatory and discretionary grounds.
                This can matter because the arrears position may change between the notice
                stage and the court hearing if the tenant makes partial payments.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The practical lesson is simple: landlords should not just know that arrears
                exist. They should know exactly how much is owed, on what dates it arose,
                whether the threshold for the chosen grounds is met, and whether the file
                will still make sense if the figures move before the hearing.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Where the case is clearly moving towards possession, landlords often save
                time by validating the notice route early rather than treating notice
                generation as a standalone admin task.
              </p>
            </Card>

            <Card id="rent-arrears-evidence-checklist" title="Rent Arrears Evidence Checklist">
              <p className="mt-4 leading-7 text-gray-700">
                A strong arrears case usually depends on simple documents prepared well.
                The court will usually want to see not just that money is owed, but how the
                landlord calculated the figures and how those figures fit with the tenancy
                history.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Signed tenancy agreement and any renewal documents</li>
                <li>Clear rent schedule showing due dates, payments, and running arrears</li>
                <li>Bank statements or payment records supporting the schedule</li>
                <li>Copies of arrears letters or written repayment requests</li>
                <li>Any agreed repayment plans and whether they were broken</li>
                <li>Copy of the notice served and proof of service</li>
                <li>A dated chronology of missed payments and landlord responses</li>
              </ul>
              <p className="mt-4 leading-7 text-gray-700">
                What matters most is consistency. If the rent schedule says one thing and
                the bank records show another, the landlord’s position can become harder to
                defend. The best evidence bundles are usually simple, chronological, and
                easy to verify.
              </p>
            </Card>

            <CtaBand
              title="Already know this is a rent arrears notice case?"
              body="Use Notice Only when the arrears route is already clear and you mainly need a compliant notice workflow. Use the Complete Eviction Pack if you want broader help around evidence, route validation, and the next court stages."
              primaryHref="/products/notice-only"
              primaryLabel="Go to Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Choose Complete Eviction Pack"
            />

            <Card id="rent-arrears-timeline" title="Rent Arrears Timeline">
              <p className="mt-4 leading-7 text-gray-700">
                Rent arrears cases rarely move in a perfectly straight line. The timeline
                usually depends on how quickly the arrears were identified, whether the
                tenant engages, whether partial payments continue, and whether the case
                stays at collection stage or moves into formal possession action.
              </p>
              <div className="mt-5 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="px-4 py-3 text-left font-semibold">Typical focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Early arrears</td>
                      <td className="px-4 py-3">Confirm figures, contact tenant, build record</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Persistent arrears</td>
                      <td className="px-4 py-3">Formalise chronology and repayment position</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Notice stage</td>
                      <td className="px-4 py-3">Validate route, grounds, dates, and service</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Court stage</td>
                      <td className="px-4 py-3">Present updated arrears evidence and chronology</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Enforcement if needed</td>
                      <td className="px-4 py-3">Possession and arrears recovery planning</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-7 text-gray-700">
                The biggest delay usually comes from weak preparation rather than the fact
                of arrears itself. A landlord who keeps the arrears schedule current and
                validates the next step early is usually in a much better position than a
                landlord trying to rebuild the file after the matter has already escalated.
              </p>
            </Card>

            <Card id="common-rent-arrears-mistakes" title="Common Rent Arrears Mistakes">
              <p className="mt-4 leading-7 text-gray-700">
                Most rent arrears problems grow because the case is left unmanaged for too
                long. The most common mistakes are operational rather than strategic.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Letting arrears build without a clean schedule.</span>
                  <span className="block">
                    Once the figures become unclear, every later step becomes harder.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Mixing informal chasing with weak record-keeping.</span>
                  <span className="block">
                    Calls and messages that are not logged properly are often difficult to
                    rely on later.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Serving a notice before validating the route.</span>
                  <span className="block">
                    Landlords often lose time when they jump to notice generation without
                    first checking grounds, dates, and evidence.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Failing to update figures before hearing.</span>
                  <span className="block">
                    Partial payments can affect the claim, especially where the grounds
                    relied on depend on arrears thresholds.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Treating arrears as a single-stage problem.</span>
                  <span className="block">
                    The strongest landlords plan not just for the missed payment, but for
                    collection, notice, court, and possession if needed.
                  </span>
                </li>
              </ul>
            </Card>

            <Card id="notice-only-vs-complete-pack" title="Notice Only vs Complete Pack">
              <p className="mt-4 leading-7 text-gray-700">
                Many landlords reach this guide because they do not just want information.
                They want to know which workflow matches the maturity of their arrears
                case.
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the right fit where the arrears case is already
                well-documented, the correct route is clear, and the main need is a
                compliant notice workflow. It is often suitable where the landlord has
                already done the record-building work and now needs the notice prepared
                from the right inputs.
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                The Complete Eviction Pack is usually the stronger choice where the arrears
                file still needs validation, the notice route is not fully settled, or the
                landlord wants broader support from arrears strategy into possession and
                enforcement planning.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In short, choose Notice Only where the case is already well-defined.
                Choose the Complete Eviction Pack where the wider workflow still needs to
                be organised and protected against avoidable errors.
              </p>
            </Card>

            <CtaBand
              title="Choose the right arrears workflow before the case gets more expensive"
              body="If you mainly need the notice, start with Notice Only. If you need broader support from arrears evidence through possession planning, choose the Complete Eviction Pack."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />
          </div>
        </Container>
      </section>

      <section id="faqs" className="scroll-mt-24 py-2">
        <FAQSection faqs={faqs} title="Rent Arrears FAQs for Landlords" />
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card title="Related Guides" id="related-guides">
              <p className="mt-4 leading-7 text-gray-700">
                Rent arrears cases often overlap with wider eviction route decisions,
                notice strategy, and possession planning. These related pages help
                landlords move from arrears management to action with fewer gaps.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Link
                  href="/section-8-notice-guide"
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  Section 8 notice guide: grounds, timing, and evidence
                </Link>
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
              </div>
            </Card>

            <Card id="final-cta" title="Next Steps">
              <p className="mt-4 leading-7 text-gray-700">
                When rent arrears start to build, speed matters less than control. Confirm
                the balance, keep the schedule current, preserve the communication trail,
                and validate the next legal step before serving anything.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                If the arrears route is already clear and you mainly need the notice,
                start with Notice Only. If the case needs wider validation, stronger
                evidence handling, and broader possession planning, start with the Complete
                Eviction Pack.
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