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
  'https://landlordheaven.co.uk/tenant-stopped-paying-rent';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Tenant Stopped Paying Rent 2026 | Landlord Action Plan for Arrears and Possession | LandlordHeaven',
  description:
    'A high-intent landlord guide for when a tenant stops paying rent.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Tenant Stopped Paying Rent 2026 | Landlord Action Plan for Arrears and Possession | LandlordHeaven',
    description:
      'Learn how landlords usually respond when a tenant stops paying rent, what evidence matters most, and how to move from arrears to possession with fewer delays.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tenant Stopped Paying Rent 2026 | LandlordHeaven',
    description:
      'What landlords usually do when a tenant stops paying rent and arrears start building.',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#first-steps-when-rent-stops', label: 'First steps when rent stops' },
  { href: '#section-8-vs-section-21', label: 'Section 8 vs Section 21' },
  { href: '#grounds-8-10-11', label: 'Grounds 8, 10 and 11' },
  { href: '#arrears-evidence-pack', label: 'Arrears evidence pack' },
  { href: '#how-the-process-usually-runs', label: 'How the process usually runs' },
  { href: '#eviction-timeline', label: 'Eviction timeline' },
  { href: '#common-delay-points', label: 'Common delay points' },
  { href: '#what-not-to-do', label: 'What not to do' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What should I do first if my tenant stops paying rent?',
    answer:
      'Start by locking a clear payment chronology immediately. Record the rent due dates, payments received, arrears balance, and key communications before deciding which legal route fits best.',
  },
  {
    question: 'Can I evict a tenant for not paying rent?',
    answer:
      'Yes. In England, landlords often use Section 8 in serious rent arrears cases, especially where the evidence pack is strong and the arrears grounds fit clearly.',
  },
  {
    question: 'Which rent arrears grounds do landlords usually use?',
    answer:
      'Ground 8, Ground 10, and Ground 11 are commonly used together in rent arrears cases. Ground 8 is mandatory if the threshold is met, while Grounds 10 and 11 are discretionary.',
  },
  {
    question: 'Should I wait for the arrears to get worse before acting?',
    answer:
      'Usually no. Landlords often do best by starting evidence control and chronology work immediately rather than trying to reconstruct the case later.',
  },
  {
    question: 'Can I use Section 21 instead of Section 8?',
    answer:
      'Sometimes yes, depending on the tenancy and compliance position. Section 21 is a no-fault route, while Section 8 is a breach-based route focused on arrears and other tenancy breaches.',
  },
  {
    question: 'What evidence matters most in a rent arrears case?',
    answer:
      'The most important documents usually include the tenancy agreement, an accurate arrears schedule, payment records, the notice served, and proof of service.',
  },
  {
    question: 'How long does it take to evict a tenant for rent arrears?',
    answer:
      'It varies, but landlords should think in stages rather than assume one fixed timescale. Notice period, court processing, possession order, and enforcement can all affect the full timeline.',
  },
  {
    question: 'Should I use Notice Only or Complete Pack?',
    answer:
      'Notice Only is often the better fit where your route is already clear and you mainly need the first notice stage handled properly. Complete Pack is usually stronger where you want broader support through court preparation, possession planning, and enforcement readiness.',
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
        pagePath="/tenant-stopped-paying-rent"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Tenant Stopped Paying Rent',
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
          { name: 'Tenant Stopped Paying Rent', url: canonical },
        ])}
      />

      <UniversalHero
        title="Tenant Stopped Paying Rent"
        subtitle="A practical landlord playbook for arrears evidence, route selection, and possession planning without avoidable resets."
        primaryCta={{ label: 'Start Notice Only for arrears', href: '/products/notice-only' }}
        secondaryCta={{ label: 'Need court-ready bundle? Complete Pack', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Rent arrears eviction timeline guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains what landlords usually do when rent stops, how to preserve
          the strongest legal route, and how to move from arrears evidence to possession
          with fewer delays.
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
            <SeoPageContextPanel pathname="/tenant-stopped-paying-rent" />
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                When a tenant stops paying rent, landlords usually do best by treating the
                case as a controlled arrears workflow from the first missed payment rather
                than waiting for the file to become urgent. The legal route often depends
                on how much rent is unpaid, what tenancy route is available, and how
                strong the evidence and service history will look if the matter reaches
                court.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In many serious arrears cases, Section 8 becomes the main route because it
                lets the landlord rely directly on the breach. In some cases, Section 21
                may also be relevant if the tenancy and compliance file support it. The
                strongest route is usually not the one that sounds fastest. It is the one
                least likely to fail once the dates, records, and notice history are
                examined properly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The most important practical step is building one master chronology. That
                chronology should show the tenancy terms, rent due dates, payments
                received, shortfalls, communications, notice service, and each later step
                in the case. Courts usually respond well to arrears files that are easy to
                follow and internally consistent.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                There is also a wider strategic point now. As Section 21 is being phased
                out in England, many landlords should expect serious arrears cases to rely
                more heavily on Section 8 and stronger breach-based files over time. That
                makes arrears discipline even more important.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                For timing expectations, use the eviction timeline England guide as the
                main planning reference. Court backlogs are outside your control, but
                notice validity, service quality, chronology control, and arrears schedule
                accuracy are not.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                To keep the file structured, start with{' '}
                <Link href="/tenant-not-paying-rent" className="font-medium text-primary hover:underline">
                  tenant not paying rent
                </Link>{' '}
                as the main arrears pillar, move into the{' '}
                <Link href="/section-8-notice" className="font-medium text-primary hover:underline">
                  Section 8 notice guide
                </Link>{' '}
                when the notice route is becoming clearer, and use{' '}
                <Link href="/products/notice-only" className="font-medium text-primary hover:underline">
                  Notice Only
                </Link>{' '}
                if the next practical step is generating the first arrears notice cleanly.
              </p>
            </Card>

            <Card
              id="first-steps-when-rent-stops"
              title="First Steps When Rent Stops"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The first mistake many landlords make is waiting too long to organise the
                file. Even if the tenant promises to catch up, the landlord should still
                lock the payment history immediately and start building a clear arrears
                record. A file that is accurate from the first missed payment is much
                easier to use later than one reconstructed months afterwards from memory
                and partial records.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also the point to define the commercial objective. Is the
                immediate goal to recover arrears, to recover possession, or to preserve
                both options while the facts develop? That decision affects notice route,
                communication strategy, settlement discussions, and later court planning.
                Cases often become messy when the landlord keeps changing objective
                without updating the file structure.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good early-stage arrears work is mostly about discipline. Record each rent
                due date, each payment received, each shortfall, and each arrangement made
                or broken. If the tenant raises affordability or benefit issues, record
                that too. The goal is not to create volume. The goal is to create one
                reliable working history the court can later trust.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords also do best when they avoid emotional drift. Arrears cases can
                become frustrating quickly, especially if the tenant goes quiet, offers
                partial payments, or gives repeated assurances that are not kept. But the
                legal file usually becomes stronger when the landlord responds with
                structure rather than with improvisation.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords who manage the first missed payment properly
                usually preserve more legal options than landlords who delay and then try
                to jump straight to formal notice stage.
              </p>
            </Card>

            <Card
              id="section-8-vs-section-21"
              title="Section 8 vs Section 21"
            >
              <p className="mt-4 leading-7 text-gray-700">
                In rent arrears cases, the natural first question is often whether the
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
                the real question is which file is stronger and which route is more
                resilient once challenged.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Many landlords benefit from thinking in terms of route resilience rather
                than route optimism. A route that looks faster but collapses on dates,
                service, or compliance usually becomes slower than a route that was chosen
                properly from the start. That is why route choice should be made with the
                chronology and evidence file open, not as an abstract preference.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                There is also a changing policy backdrop. Because Section 21 is being
                phased out, landlords should expect the Section 8 route to matter more in
                future possession work. That does not mean Section 21 is irrelevant in
                every live file today. It does mean landlords should stop assuming that
                every rent arrears case can be solved by falling back on a no-fault route.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, if rent arrears are the live problem and the evidence
                is clear, Section 8 often becomes the main working route. But the right
                answer always depends on what the file can actually prove.
              </p>
            </Card>

            <Card
              id="grounds-8-10-11"
              title="Grounds 8, 10 and 11"
            >
              <p className="mt-4 leading-7 text-gray-700">
                In arrears cases, landlords often rely on Grounds 8, 10, and 11 together.
                This is not just a drafting habit. It is usually a risk-control strategy.
                Ground 8 is the best-known mandatory arrears ground because, if the
                arrears threshold is met when the notice is served and still met at the
                hearing, the court must usually make a possession order.
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
                Good route planning also requires honesty about what can change. If the
                tenant has a pattern of paying just enough to disrupt the claim, the file
                should be built with that possibility in mind. The landlord’s job is not
                just to choose the strongest ground on the day of notice. It is to choose
                a route that still makes sense once the tenant reacts.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Ground 8 often carries the headline weight, but
                Grounds 10 and 11 often provide the procedural resilience that stops the
                case falling apart if the tenant changes behaviour late in the file.
              </p>
            </Card>

            <Card
              id="arrears-evidence-pack"
              title="Arrears Evidence Pack"
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
                bank records or the rent account system. If the schedule feels hard to
                follow, the court is unlikely to trust it quickly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Communication records can matter too, but they should support the legal
                chronology rather than replace it. Payment plans, promises to catch up,
                explanations given by the tenant, and repeated defaults can all help the
                court understand the history of the case. What matters is that those
                communications fit the main arrears record instead of contradicting it.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords should also think ahead to how the file will read under pressure.
                A judge should be able to look at the tenancy agreement, the rent schedule,
                the payment records, and the notice file and understand the progression of
                the case without guesswork. A strong arrears pack is usually one that can
                be understood quickly and challenged only with difficulty.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Signed tenancy agreement and any renewal terms</li>
                <li>Accurate arrears schedule with running balance</li>
                <li>Payment records supporting the schedule</li>
                <li>Notice served and proof of service</li>
                <li>Key communications about arrears or payment plans</li>
                <li>One working chronology that matches every important document</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the court usually needs reliability more than volume.
                A shorter file that is clean, accurate, and coherent is often stronger
                than a larger file full of duplicated or inconsistent material.
              </p>
            </Card>

            <CtaBand
              title="Need the arrears route handled properly from the first step?"
              body="Use Notice Only if your route is already clear and you mainly need the first notice stage prepared properly. Use the Complete Eviction Pack if you want broader support across notice, court preparation, possession planning, and enforcement readiness."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only for arrears"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Need court-ready bundle? Complete Pack"
            />

            <Card
              id="how-the-process-usually-runs"
              title="How the Process Usually Runs"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most arrears cases move through a recognisable sequence. First the
                landlord identifies the arrears pattern and verifies the payment history.
                Then the landlord chooses the route, serves the relevant notice, and waits
                through the notice period. If the tenant does not resolve the issue or
                leave, the case moves into court and then, if needed later, into
                possession order and enforcement stages.
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
                It also helps to think in reverse. If the case reaches hearing, what will
                the judge need to see? If enforcement becomes necessary, what dates and
                documents will matter then? Working backwards from those questions often
                helps landlords spot weaknesses before they become expensive.
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
                where the tenant leaves after notice or shortly after the possession
                order. Others take longer where the case is defended, the arrears position
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

              <p className="mt-4 leading-7 text-gray-700">
                The more serious the arrears become, the more expensive delay usually is.
                That is why landlords often benefit from planning both legally and
                commercially at the same time. The right route is the one that is not only
                available but is also strong enough to move through the possession process
                without unnecessary resets.
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
                A second common problem is commercial indecision. Some landlords spend too
                long treating the case as temporary when the chronology already shows a
                pattern of non-payment. Others become too aggressive too early and damage
                the clarity of the file by switching strategy repeatedly. The best results
                usually come from structured escalation, not panic or drift.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, court backlogs are outside your control, but notice
                validity and service quality are not. Landlords usually save more time by
                preventing avoidable resets than by trying to rush the final stage.
              </p>
            </Card>

            <Card
              id="what-not-to-do"
              title="What Not to Do When a Tenant Stops Paying Rent"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Some of the costliest arrears cases become difficult not because the tenant
                stopped paying, but because the landlord reacted in a way that weakened the
                file. When rent stops, landlords should be especially careful not to turn a
                solvable legal problem into a messy procedural one.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Do not change locks or threaten self-help eviction.</span>
                  <span className="block">
                    Possession must be recovered lawfully through the correct route.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Do not rely on memory for payment history.</span>
                  <span className="block">
                    Arrears figures should be documented properly from the start.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Do not send a notice just to “see what happens.”</span>
                  <span className="block">
                    Route choice should be made deliberately, not speculatively.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Do not assume partial payment makes the problem go away.</span>
                  <span className="block">
                    In many cases it simply changes the legal shape of the file.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Do not let the chronology split into multiple versions.</span>
                  <span className="block">
                    The rent schedule, witness statement, notice file, and court papers should all align.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the landlord’s job is to reduce confusion. Every action
                should make the case easier to prove later, not harder.
              </p>
            </Card>

            <Card
              id="notice-only-vs-complete-pack"
              title="Notice Only vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reading an arrears eviction guide are often not just looking for
                general information. They are deciding what level of support the case now
                needs.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the arrears route is already
                clear, the landlord knows which notice should be used, and the main need is
                to get the first formal stage prepared properly. It tends to suit
                landlords who already understand the wider possession workflow.
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
        <FAQSection faqs={faqs} title="Tenant Stopped Paying Rent FAQs" />
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
                Start Notice Only for arrears
              </Link>
              <Link
                href="/products/complete-pack"
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Need court-ready bundle? Complete Pack
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
