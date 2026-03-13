import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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

const canonical =
  'https://landlordheaven.co.uk/warrant-of-possession-guide';

export const metadata: Metadata = {
  title:
    'Warrant of Possession Guide | What Landlords Do After a Possession Order | LandlordHeaven',
  description:
    'A plain-English warrant of possession guide for landlords in England. Learn when a warrant is needed, how it fits after a possession order, timelines, enforcement steps, common delays, and what happens on eviction day.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Warrant of Possession Guide | What Landlords Do After a Possession Order | LandlordHeaven',
    description:
      'Understand when to apply for a warrant of possession, what happens after the possession date, and how the enforcement stage usually works.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-is-a-warrant-of-possession', label: 'What is a warrant of possession?' },
  { href: '#when-landlords-need-one', label: 'When landlords need one' },
  { href: '#before-applying-for-a-warrant', label: 'Before applying for a warrant' },
  { href: '#how-the-warrant-stage-works', label: 'How the warrant stage works' },
  { href: '#what-happens-on-enforcement-day', label: 'What happens on enforcement day' },
  { href: '#eviction-timeline', label: 'Eviction timeline' },
  { href: '#common-delay-points', label: 'Common delay points' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What is a warrant of possession?',
    answer:
      'A warrant of possession is the enforcement step landlords usually apply for when they already have a possession order but the tenant has not left by the date set by the court.',
  },
  {
    question: 'When do landlords need a warrant of possession?',
    answer:
      'Landlords usually need a warrant of possession when the possession date has passed and the tenant remains in occupation, so lawful enforcement is needed to recover the property.',
  },
  {
    question: 'Does a possession order remove the tenant automatically?',
    answer:
      'No. A possession order sets the legal basis and the date for possession, but if the tenant stays, the landlord normally needs enforcement rather than removing the tenant personally.',
  },
  {
    question: 'What happens after a warrant of possession is issued?',
    answer:
      'Once the warrant stage is processed, enforcement officers can attend the property in line with the court’s authority and recover possession lawfully if the tenant has not left.',
  },
  {
    question: 'How long does a warrant of possession take?',
    answer:
      'The timeline varies by local court and enforcement workload, so landlords should think in stages rather than assume one fixed timescale.',
  },
  {
    question: 'Can landlords change the locks once they have a possession order?',
    answer:
      'Not usually. If the tenant remains after the possession date, landlords should normally follow the lawful enforcement process rather than trying to recover possession themselves.',
  },
  {
    question: 'What is the difference between a possession order and a warrant of possession?',
    answer:
      'A possession order is the court’s decision that the landlord is entitled to the property. A warrant of possession is the enforcement step used when the tenant still does not leave.',
  },
  {
    question: 'Should I use Notice Only or the Complete Eviction Pack at warrant stage?',
    answer:
      'Complete Eviction Pack is usually the stronger fit where the case has already moved into court, possession order, or enforcement planning. Notice Only is generally better where the main need is still the initial notice stage.',
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

export default function WarrantOfPossessionGuidePage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/warrant-of-possession-guide"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Warrant of Possession Guide',
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
          { name: 'Warrant of Possession Guide', url: canonical },
        ])}
      />

      <StructuredData data={faqPageSchema(faqs)} />

      <UniversalHero
        title="Warrant of Possession Guide"
        subtitle="Understand what landlords usually do after a possession order if the tenant still does not leave."
        primaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        secondaryCta={{ label: 'Need notice help first?', href: '/products/notice-only' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Warrant of possession timeline guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains when a warrant of possession is needed, how it fits into the
          wider eviction timeline, and what landlords should prepare before the enforcement
          stage begins.
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
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                A warrant of possession is the enforcement step landlords usually use after
                a possession order where the tenant still has not left by the court’s
                possession date. It is not the same as the possession order itself. The
                possession order gives the landlord the legal right to recover the
                property. The warrant stage is what moves that right toward actual
                enforcement if the tenant remains in occupation.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, this is the point where many landlords realise that
                winning in court and getting the property back are not always the same
                thing. A successful possession claim answers the legal question. The
                warrant of possession answers the practical enforcement question when the
                tenant has still not left voluntarily.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This stage matters because landlords cannot usually skip from possession
                order straight to self-help recovery. If the tenant stays, the case has to
                move through the proper enforcement pathway. That is what protects the
                landlord’s position and keeps the recovery lawful.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The strongest cases treat the warrant stage as part of one continuous
                eviction workflow. Notice quality, service proof, hearing preparation,
                possession order terms, and enforcement readiness all connect. The later
                the case gets, the more expensive early mistakes usually become.
              </p>
            </Card>

            <Card
              id="what-is-a-warrant-of-possession"
              title="What Is a Warrant of Possession?"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A warrant of possession is the step that moves the case from possession
                order to enforcement when the tenant has not left by the required date. It
                is best understood as the lawful bridge between a successful possession
                decision and physical recovery of the property.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Many landlords understandably assume that the possession order is the end
                of the process. In reality, the possession order confirms that the court
                agrees the landlord is entitled to possession. The warrant stage becomes
                relevant only if the tenant does not comply with that order.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That means the warrant is not a replacement for the court case and it is
                not a new legal argument about whether the landlord should win. The court
                has already decided that point. The warrant is about lawful execution of
                the order where voluntary compliance has failed.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In operational terms, the warrant stage is where the possession file and
                the enforcement file meet. The landlord now needs to think about dates,
                court authority, occupancy status, access, locksmith arrangements, and the
                handover of the property after enforcement. That is why this stage often
                feels more practical, even though it remains procedural.
              </p>
            </Card>

            <Card
              id="when-landlords-need-one"
              title="When Landlords Need a Warrant of Possession"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually need a warrant of possession when they already have a
                possession order and the tenant has not left by the date set by the court.
                In other words, the case has succeeded legally but is not yet finished in
                practice.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Some tenants leave when the original notice expires. Others leave after the
                claim is issued or shortly after the hearing. Others leave once the
                possession order is made. The warrant stage exists for the final category:
                the cases where the order has been made and the tenant still remains.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This means the warrant stage is especially common in higher-friction cases,
                longer-running disputes, defended claims, or situations where the tenant
                simply does not act even after the position is legally clear. The landlord
                should not treat this as unusual. It usually means the case has reached the
                final enforcement stage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The more useful question is not whether enforcement is frustrating. It is
                whether the landlord is ready for it when it becomes necessary. Cases tend
                to move more predictably where the landlord thinks about enforcement before
                the possession date has even passed.
              </p>
            </Card>

            <Card
              id="before-applying-for-a-warrant"
              title="Before Applying for a Warrant"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Before moving into the warrant stage, landlords should confirm the exact
                terms of the possession order, whether the possession date has passed, and
                whether the tenant is still in occupation. That sounds obvious, but weak
                file control is a common reason late-stage possession work becomes more
                confusing than it needs to be.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also the point to think operationally. Who will attend on the day
                if enforcement becomes necessary? Will a locksmith be needed? What is the
                plan for securing the property, inspecting condition, and dealing with
                belongings left behind? Landlords who think about those issues before the
                final stage usually handle it with more control.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good enforcement-stage preparation also means reviewing the whole file. The
                landlord should know which notice route was used, what happened at court,
                what order was made, and what date now matters. The more clearly the case
                is understood, the easier it is to run the final stage without avoidable
                mistakes.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Check the exact wording and date in the possession order</li>
                <li>Confirm whether the tenant is still in occupation</li>
                <li>Plan access, security, and practical handover</li>
                <li>Decide who will attend and what support may be needed</li>
                <li>Assume the final stage needs both legal and operational control</li>
              </ul>
            </Card>

            <CtaBand
              title="Already beyond notice stage and into court or enforcement?"
              body="Complete Pack is usually the stronger fit where the case has moved into possession order management, hearing-stage decisions, or enforcement planning. Notice Only is generally better where the landlord still mainly needs the initial notice stage handled properly."
              primaryHref="/products/complete-pack"
              primaryLabel="Start Complete Eviction Pack"
              secondaryHref="/products/notice-only"
              secondaryLabel="Need Notice Only First?"
            />

            <Card
              id="how-the-warrant-stage-works"
              title="How the Warrant Stage Works"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The warrant stage is the step where the landlord moves from court order to
                lawful recovery if the tenant has still not left. In practical terms, this
                is often the point where landlords feel the process has slowed down,
                because they have already succeeded on the legal merits but still do not
                have possession back on the ground.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That frustration is understandable, but the warrant stage exists to protect
                the landlord’s legal position. It ensures that possession is recovered in a
                way the court recognises as lawful. The landlord should therefore treat it
                as the final formal stage, not as an optional extra after the “real” case
                has ended.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good warrant-stage files usually depend on one clean chronology. The
                landlord should know the tenancy route, the notice route, the court order,
                the possession date, and the point at which the file moved into
                enforcement. When those points are clear, the final stage becomes easier
                to manage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The best mindset is to treat the warrant stage not as separate from the
                rest of the case, but as the last segment of the same workflow. A landlord
                who prepares for enforcement from the point of possession order often moves
                through it with more control and fewer avoidable delays.
              </p>
            </Card>

            <Card
              id="what-happens-on-enforcement-day"
              title="What Happens on Enforcement Day"
            >
              <p className="mt-4 leading-7 text-gray-700">
                On enforcement day, authorised officers attend the property to recover
                possession in line with the court’s authority. For many landlords, this is
                the point where the case finally becomes real in practical terms. The
                matter moves from court documents and dates into actual property recovery.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The landlord should approach the day as both a legal and operational event.
                The legal side is the authority already granted by the court. The
                operational side is making sure access, security, handover, and property
                condition are all dealt with properly once possession is recovered.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In some cases, the tenant leaves before the appointment or during it
                without major difficulty. In others, the day may feel tense or uncertain.
                That is why a clear plan matters. If a locksmith is needed, they should be
                arranged. If the property needs immediate securing or inspection, that
                should be planned before the day arrives.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The more organised the landlord is at this point, the faster the case can
                move from enforcement stage to secure possession and practical recovery of
                the property.
              </p>
            </Card>

            <Card
              id="eviction-timeline"
              title="Eviction Timeline and Warrant Stage Timing"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The warrant stage should be understood as the final part of the wider
                eviction timeline, not as a standalone event. By the time a landlord
                reaches enforcement, the case has usually already moved through notice,
                court claim, and possession order stages. That means the timing
                expectation should be based on the full eviction timeline in England rather
                than on the enforcement appointment alone.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In many cases, the overall process from notice to enforcement takes around
                three to six months. Some cases finish sooner where the tenant leaves after
                notice or shortly after the possession order. Others take longer where the
                claim is defended, local court workloads are heavy, or enforcement listing
                times are slow.
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
                      <td className="px-4 py-3">2 weeks – 2 months</td>
                      <td className="px-4 py-3">
                        Landlord serves the relevant notice and waits for expiry.
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Court processing</td>
                      <td className="px-4 py-3">6 – 10 weeks</td>
                      <td className="px-4 py-3">
                        Possession claim is issued and considered by the court.
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Possession order</td>
                      <td className="px-4 py-3">Around 14 days</td>
                      <td className="px-4 py-3">
                        Court sets a date for the tenant to leave the property.
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Warrant / enforcement</td>
                      <td className="px-4 py-3">2 – 6 weeks</td>
                      <td className="px-4 py-3">
                        Enforcement officers recover possession if the tenant still remains.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                For timing expectations, use the eviction timeline England guide as the
                main planning reference. Court backlogs are outside your control, but
                notice validity, service quality, chronology control, and document
                readiness are not.
              </p>
            </Card>

            <Card
              id="common-delay-points"
              title="Common Delay Points"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The biggest timing mistake landlords make is treating the warrant stage as
                though delay starts there. In reality, many late-stage delays are created
                much earlier in the file. By the time a case reaches enforcement, weak
                notice work, poor service records, and inconsistent court paperwork have
                often already added weeks to the process.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Invalid notices or incorrect dates.</span>
                  <span className="block">
                    A defective notice can force the landlord to restart earlier stages,
                    which then pushes enforcement back by weeks or months.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Weak proof of service.</span>
                  <span className="block">
                    If service cannot be shown clearly, the court route may slow down long
                    before the landlord reaches the warrant stage.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Incomplete or inconsistent court paperwork.</span>
                  <span className="block">
                    Poorly prepared files often create avoidable friction at hearing and
                    post-order stage.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Waiting too long to plan enforcement.</span>
                  <span className="block">
                    Landlords who only start thinking about the final stage after the
                    possession date has passed often lose momentum.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Assuming backlogs can be controlled.</span>
                  <span className="block">
                    Local court and enforcement demand are outside the landlord’s control,
                    so the practical focus should be on file quality and readiness.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, court workload is outside your control, but notice
                validity and service quality are not. Landlords usually save more time by
                preventing avoidable resets than by trying to rush the final stage.
              </p>
            </Card>

            <Card
              id="notice-only-vs-complete-pack"
              title="Notice Only vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reading a warrant of possession guide are usually no longer at
                the beginning of the case. In most situations, the issue is not whether a
                notice needs to be drafted in principle. The issue is how to control the
                court and enforcement stages properly once the matter has already become
                procedural and time-sensitive.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the matter has moved into
                court-stage work, possession order management, or enforcement planning. It
                tends to suit landlords who need broader route control, clearer document
                handling, and stronger support across the later stages of the possession
                process.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is generally better where the landlord is still earlier in the
                sequence and mainly needs the notice stage handled properly. It can still
                be the right first step if the case has not yet reached court, but it is
                usually less aligned to a case that is already focused on possession order
                execution and warrant planning.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the later the case stage and the greater the
                enforcement risk, the more likely Complete Pack is the better fit.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Warrant of Possession FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              The warrant stage works best when it is planned before it becomes urgent.
              Landlords who treat enforcement as part of one continuous legal workflow
              usually get more predictable outcomes than landlords who only start planning
              after the possession date has already passed.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              For timing expectations, use the Eviction Timeline England guide as the main
              planning reference, then treat the warrant stage as the final enforcement
              segment of that wider process.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If your case has already moved into court, possession order, or enforcement
              planning, start with Complete Eviction Pack. If you still mainly need the
              initial notice stage handled properly, start with Notice Only first.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products/complete-pack"
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                Start Complete Eviction Pack
              </Link>
              <Link
                href="/products/notice-only"
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Need Notice Only First?
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}