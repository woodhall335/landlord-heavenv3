import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';

const canonical =
  'https://landlordheaven.co.uk/evict-tenant-not-paying-rent';

export const metadata: Metadata = {
  title:
    'Evict Tenant Not Paying Rent | Landlord Rent Arrears Guide | LandlordHeaven',
  description:
    'A plain-English guide for landlords in England dealing with tenants not paying rent. Learn when to act, how Section 8 arrears cases work, what evidence matters, timelines, common delay points, and how to move toward possession without avoidable resets.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Evict Tenant Not Paying Rent | Landlord Rent Arrears Guide | LandlordHeaven',
    description:
      'Learn how landlords usually deal with serious rent arrears, choose the right route, prepare the evidence file, and move toward possession with fewer delays.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#when-a-tenant-stops-paying-rent', label: 'When a tenant stops paying rent' },
  { href: '#section-8-or-section-21', label: 'Section 8 or Section 21?' },
  { href: '#ground-8-10-11-explained', label: 'Grounds 8, 10 and 11 explained' },
  { href: '#evidence-you-need', label: 'Evidence you need' },
  { href: '#how-the-arrears-process-usually-works', label: 'How the arrears process usually works' },
  { href: '#eviction-timeline', label: 'Eviction timeline' },
  { href: '#common-delay-points', label: 'Common delay points' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'Can I evict a tenant for not paying rent?',
    answer:
      'Yes. In England, landlords often use Section 8 where the tenant has fallen into arrears, especially where the arrears are serious and the file supports rent grounds clearly.',
  },
  {
    question: 'Which rent arrears grounds do landlords usually use?',
    answer:
      'Ground 8, Ground 10, and Ground 11 are commonly used in rent arrears cases. Ground 8 is mandatory if the arrears threshold is met at the right times, while Grounds 10 and 11 are discretionary.',
  },
  {
    question: 'Should I wait before acting if the tenant misses rent?',
    answer:
      'Usually no. Landlords normally do best by starting evidence control and chronology work immediately rather than waiting for the arrears file to become harder to reconstruct later.',
  },
  {
    question: 'Can I use Section 21 instead?',
    answer:
      'Sometimes yes, depending on the tenancy and compliance position. Section 21 is a no-fault route, while Section 8 is a breach-based route. The right choice depends on the facts and the strength of the file.',
  },
  {
    question: 'What evidence matters most in a rent arrears eviction case?',
    answer:
      'The most important evidence usually includes the tenancy agreement, an accurate arrears schedule, payment records, the notice served, and proof of service.',
  },
  {
    question: 'How long does it take to evict a tenant for rent arrears?',
    answer:
      'It varies, but landlords should think in stages rather than assume one fixed timescale. Notice period, court processing, possession order, and enforcement can all affect the full timeline.',
  },
  {
    question: 'Can I remove the tenant myself after they stop paying rent?',
    answer:
      'No. Landlords should follow the correct legal route rather than trying to remove the tenant personally.',
  },
  {
    question: 'Should I use Notice Only or Complete Pack?',
    answer:
      'Notice Only is often the better fit where your route is clear and you mainly need the first notice stage handled properly. Complete Pack is usually stronger where you want broader help through court preparation, possession planning, and enforcement readiness.',
  },
];

function Card({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
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
        pagePath="/evict-tenant-not-paying-rent"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Evict Tenant Not Paying Rent',
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
          { name: 'Evict Tenant Not Paying Rent', url: canonical },
        ])}
      />

      <UniversalHero
        title="Evict Tenant Not Paying Rent"
        subtitle="A landlord guide to rent arrears action, route choice, and possession planning without avoidable resets."
        primaryCta={{ label: 'Start Notice Only', href: '/products/notice-only' }}
        secondaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Rent arrears eviction timeline guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains how landlords usually respond when a tenant stops paying
          rent, what evidence matters most, and how to move from arrears to possession
          without weakening the file.
        </p>
      </UniversalHero>

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
            <SeoPageContextPanel pathname="/evict-tenant-not-paying-rent" />
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                If a tenant is not paying rent, landlords usually do best by treating the
                case as a controlled arrears file from the first missed payment rather than
                waiting for the problem to become severe before organising the evidence.
                The legal route often depends on how much rent is unpaid, what tenancy
                route is available, and how strong the notice and service history will look
                once the case reaches court.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In many rent arrears cases, Section 8 is the main route because it lets
                the landlord rely directly on the tenant’s breach. In some cases, Section
                21 may also be relevant if the tenancy and compliance history support it.
                The strongest route is usually not the route that sounds fastest. It is the
                route least likely to fail once the dates, records, and court paperwork
                are examined properly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The most important practical step is building one master chronology. That
                chronology should show the tenancy terms, rent due dates, payments
                received, shortfalls, communications, notice service, and every later step
                in the case. Courts usually respond well to files that are easy to follow
                and consistent. They respond badly to arrears cases where figures, dates,
                and documents do not match each other.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                For timing expectations, use the wider eviction timeline in England as the
                main planning reference. Court backlogs are outside your control, but
                notice validity, service quality, chronology control, and arrears schedule
                accuracy are not.
              </p>
            </Card>

            <Card
              id="when-a-tenant-stops-paying-rent"
              title="When a Tenant Stops Paying Rent"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The first mistake many landlords make is waiting too long to organise the
                file. Even if the tenant promises to catch up, the landlord should still
                freeze the payment history immediately and start building a clear arrears
                record. A file that is accurate from the first missed payment is much
                easier to use later than one reconstructed months afterwards from memory
                and partial bank statements.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also the stage to define the real objective. Is the immediate goal
                to recover arrears, to recover possession, or to preserve both options
                while the facts develop? That decision changes how the landlord should
                think about notice route, communications, settlement offers, and later
                court strategy. Cases often become messy when the landlord keeps changing
                objective without updating the file structure.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good early-stage arrears work is mostly about discipline. Record each rent
                due date, each payment received, each promise made, and each broken
                arrangement. If the tenant makes partial payments, update the schedule the
                same day. If the tenant raises affordability or benefit issues, record that
                too. The aim is not to create noise. The aim is to create one reliable
                working history the court can later trust.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords who manage the first missed payment properly
                often preserve more legal options than landlords who delay and then try to
                jump straight to notice stage.
              </p>
            </Card>

            <Card
              id="section-8-or-section-21"
              title="Section 8 or Section 21?"
            >
              <p className="mt-4 leading-7 text-gray-700">
                In rent arrears cases, the natural first question is usually whether the
                case should proceed under Section 8, Section 21, or a combination of
                options considered strategically over time. The answer depends on the
                tenancy type, the compliance position, the level of arrears, and the
                landlord’s objective.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Section 8 is often the core arrears route because it lets the landlord rely
                directly on the tenant’s breach. That usually makes it the more obvious
                legal fit where non-payment is the central issue. Section 21 is different.
                It is a no-fault route and depends on the tenancy and compliance file being
                strong enough to support it. Where both routes are technically available,
                the question is not which label sounds better. The question is which file
                is stronger.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Many landlords benefit from thinking in terms of route resilience rather
                than route optimism. A route that looks faster but collapses on dates,
                service, or compliance usually becomes slower than a route that was chosen
                properly from the start. That is why route choice should be made with the
                chronology and evidence file open, not as an abstract legal preference.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, if rent arrears are the live problem and the evidence
                is clear, Section 8 often becomes the main working route. But the right
                answer always depends on what the file can actually prove.
              </p>
            </Card>

            <Card
              id="ground-8-10-11-explained"
              title="Grounds 8, 10 and 11 Explained"
            >
              <p className="mt-4 leading-7 text-gray-700">
                In arrears cases, landlords often rely on Grounds 8, 10, and 11 together.
                This is not just a drafting habit. It is usually a risk-control strategy.
                Ground 8 is the best-known mandatory arrears ground because if the arrears
                threshold is met when the notice is served and still met at the hearing,
                the court must usually make a possession order.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Ground 10 is discretionary and applies where some rent is unpaid. Ground
                11 is also discretionary and focuses on persistent late payment. These
                grounds matter because arrears cases often change between notice stage and
                hearing stage. A tenant may make a partial payment that reduces arrears
                below the Ground 8 threshold. If the landlord relied only on Ground 8, the
                file may become weaker than expected. If Grounds 10 and 11 were also used,
                the case may still retain useful support.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The deeper point is that arrears grounds are not just labels. They are
                tools that should match both the current facts and the likely hearing-date
                facts. Landlords usually do best when they prepare the route with that
                future hearing date in mind rather than only looking at today’s balance.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Ground 8 often carries the headline weight, but
                Grounds 10 and 11 often provide the procedural resilience that stops the
                case falling apart if the tenant changes behaviour late in the file.
              </p>
            </Card>

            <Card
              id="evidence-you-need"
              title="Evidence You Need"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Rent arrears possession work is only as strong as the evidence pack behind
                it. In most cases, the core documents include the tenancy agreement, a
                clear arrears schedule, payment records, the notice served, proof of
                service, and any supporting communications that explain how the arrears
                developed.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The arrears schedule is usually one of the most important documents in the
                whole file. It should show each rent due date, each payment made, the
                shortfall, and the running balance. It should also reconcile properly with
                the landlord’s bank records or rent account system. If the schedule feels
                hard to follow, the court is unlikely to trust it quickly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Communication records can also matter, but they should support the legal
                chronology rather than replace it. Payment plans, promises to catch up,
                explanations given by the tenant, and repeated defaults can all help the
                court understand the history of the case. What matters is that those
                communications fit the main arrears record instead of contradicting it.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Signed tenancy agreement and any renewal terms</li>
                <li>Accurate arrears schedule with running balance</li>
                <li>Payment records or bank evidence supporting the schedule</li>
                <li>Notice served and proof of service</li>
                <li>Key communications about arrears or payment plans</li>
                <li>One working chronology that matches every important document</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the court usually needs reliability more than volume.
                A shorter file that is clean, accurate, and coherent is often stronger
                than a much larger file full of duplicated or inconsistent material.
              </p>
            </Card>

            <CtaBand
              title="Need the arrears route handled properly from the first step?"
              body="Use Notice Only if your route is already clear and you mainly need the first notice stage prepared properly. Use the Complete Eviction Pack if you want broader support across notice, court preparation, possession planning, and enforcement readiness."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />

            <Card
              id="how-the-arrears-process-usually-works"
              title="How the Arrears Process Usually Works"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most arrears cases move through a recognisable sequence. First the landlord
                identifies the arrears pattern and verifies the payment history. Then the
                landlord chooses the route, serves the relevant notice, and waits through
                the notice period. If the tenant does not resolve the issue or leave, the
                case moves into court and then, if needed later, into possession order and
                enforcement stages.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The biggest practical mistake is treating these stages as separate events.
                In reality, each stage depends on the quality of the stage before it. A
                weak arrears schedule weakens the notice. A weak notice weakens the claim.
                A weak claim weakens the hearing. And a weak hearing result makes the
                enforcement stage slower and more frustrating.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good landlords therefore run the case like one workflow. The same
                chronology should be visible from first missed payment through to final
                possession. The same figures should appear everywhere. The same account of
                events should support the notice, witness statement, and hearing note.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the arrears process works best when the landlord is
                always one stage ahead: choosing the route with the hearing in mind,
                building the evidence pack with the court bundle in mind, and thinking
                about possession recovery before the possession order date has even passed.
              </p>
            </Card>

            <Card
              id="eviction-timeline"
              title="Eviction Timeline and Rent Arrears Cases"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Rent arrears cases should be planned against the wider eviction timeline in
                England rather than against one optimistic deadline. The notice stage, the
                court stage, the possession order stage, and any enforcement stage all
                affect how long the overall case takes.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In many cases, landlords should expect the full route from notice to
                enforcement to take around three to six months. Some files finish sooner
                where the tenant leaves after notice or shortly after the possession order.
                Others take longer where the case is defended, the arrears position
                changes, or local court and enforcement workloads are heavy.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="px-4 py-3 text-left font-semibold">Typical time</th>
                      <th className="px-4 py-3 text-left font-semibold">What happens</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Notice period</td>
                      <td className="px-4 py-3">Usually weeks, depending on route</td>
                      <td className="px-4 py-3">
                        The landlord serves the relevant notice and waits for expiry.
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Court processing</td>
                      <td className="px-4 py-3">Often several weeks</td>
                      <td className="px-4 py-3">
                        The possession claim is issued and moves toward hearing or paper review.
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Possession order</td>
                      <td className="px-4 py-3">Usually around 14 days to leave</td>
                      <td className="px-4 py-3">
                        The court sets a date for the tenant to give up possession.
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Enforcement if needed</td>
                      <td className="px-4 py-3">Often additional weeks</td>
                      <td className="px-4 py-3">
                        Final lawful recovery happens if the tenant stays after the order date.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                For timing expectations, use the eviction timeline England guide as the
                main planning reference. Court backlogs are outside your control, but
                notice validity, service quality, chronology control, and arrears accuracy
                are not.
              </p>
            </Card>

            <Card
              id="common-delay-points"
              title="Common Delay Points"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The biggest timing mistake landlords make is assuming delay starts at
                court. In reality, many arrears files are already slower than they need to
                be before the claim is even issued. Weak payment records, poor service
                evidence, inconsistent rent schedules, and route confusion often create the
                later delays that landlords then blame on the court alone.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Inaccurate arrears schedules.</span>
                  <span className="block">
                    If the figures do not reconcile properly, the whole claim becomes
                    harder to prove cleanly.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Notice errors or bad dates.</span>
                  <span className="block">
                    A defective notice can force a reset and push possession back by weeks
                    or months.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Weak proof of service.</span>
                  <span className="block">
                    If service cannot be shown clearly, the case may slow down long before
                    the landlord reaches hearing stage.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Relying only on one arrears ground.</span>
                  <span className="block">
                    Partial payment before hearing can change the case, which is why route
                    resilience matters.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Poor stage planning.</span>
                  <span className="block">
                    Landlords who only prepare one step at a time often lose momentum when
                    the file moves toward hearing or enforcement.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, court backlogs are outside your control, but notice
                validity and service quality are not. Landlords usually save more time by
                preventing avoidable resets than by trying to rush the final stage.
              </p>
            </Card>

            <Card
              id="notice-only-vs-complete-pack"
              title="Notice Only vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reading an arrears eviction guide are often not just looking for
                general information. They are trying to decide what level of support the
                case now needs.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the arrears route is already
                clear, the landlord knows which notice should be used, and the main need is
                to get the first formal stage prepared properly. It tends to suit landlords
                who already understand the wider possession workflow.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">
                Complete Eviction Pack
              </h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the landlord wants broader
                support across notice, evidence control, court preparation, possession
                planning, and possible enforcement. That tends to matter more where the
                arrears are high, the file is changing quickly, or the commercial risk of
                delay is significant.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Notice Only is for clearer first-step cases. Complete
                Pack is for arrears files where the wider court and possession workflow
                still needs to be managed carefully.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Rent Arrears Eviction FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Rent arrears cases usually become easier to manage when the landlord decides
              early that the file will be treated as one controlled workflow rather than a
              series of disconnected reactions. That means one chronology, one arrears
              schedule, one evidence index, and one clear route plan from notice to
              possession.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              For timing expectations, use the Eviction Timeline England guide as the main
              planning reference, then treat the arrears route as one part of that wider
              process. Court backlogs are outside your control, but file quality is not.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If your route is already clear and you mainly need the first legal step,
              start with Notice Only. If you want broader help across notice, evidence,
              court readiness, and later possession planning, start with Complete Eviction
              Pack.
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
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Start Complete Eviction Pack
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
