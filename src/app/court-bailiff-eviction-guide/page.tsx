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
  'https://landlordheaven.co.uk/court-bailiff-eviction-guide';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Court Bailiff Eviction Guide | County Court Enforcement for Landlords | LandlordHeaven',
  description:
    'A plain-English court bailiff eviction guide for landlords in England.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Court Bailiff Eviction Guide | County Court Enforcement for Landlords | LandlordHeaven',
    description:
      'Understand county court bailiff enforcement, timing, common delay points, and what landlords should prepare after a possession order.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-is-a-court-bailiff-eviction', label: 'What is a court bailiff eviction?' },
  { href: '#when-landlords-need-court-bailiffs', label: 'When landlords need court bailiffs' },
  { href: '#before-bailiff-enforcement', label: 'Before bailiff enforcement' },
  { href: '#how-county-court-bailiff-enforcement-works', label: 'How county court bailiff enforcement works' },
  { href: '#what-happens-on-the-day', label: 'What happens on the day' },
  { href: '#after-the-bailiff-appointment', label: 'After the bailiff appointment' },
  { href: '#eviction-timeline', label: 'Eviction timeline' },
  { href: '#common-delay-points', label: 'Common delay points' },
  { href: '#complete-pack-vs-notice-only', label: 'Complete Pack vs Notice Only' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What is a court bailiff eviction?',
    answer:
      'A court bailiff eviction is the enforcement stage used after a possession order where the tenant still has not left and the landlord needs county court enforcement officers to recover possession lawfully.',
  },
  {
    question: 'When do landlords need county court bailiffs?',
    answer:
      'Landlords usually need county court bailiffs when they already have a possession order but the tenant has not left by the possession date set by the court.',
  },
  {
    question: 'Can a landlord remove the tenant after getting a possession order?',
    answer:
      'Not usually. If the tenant stays after the possession date, the landlord should normally move into lawful enforcement rather than trying to recover possession personally.',
  },
  {
    question: 'What happens on the bailiff appointment day?',
    answer:
      'County court bailiffs attend the property under the court’s authority and recover possession in line with the possession order if the tenant has not already left.',
  },
  {
    question: 'How long does court bailiff eviction take?',
    answer:
      'The timing varies by local court and enforcement workload, so landlords should think in stages and use the wider eviction timeline as the main planning reference.',
  },
  {
    question: 'Do tenants always stay until the bailiff date?',
    answer:
      'No. Some tenants leave after the possession order or shortly before enforcement, but landlords should still prepare as though the appointment will go ahead.',
  },
  {
    question: 'What is the difference between a possession order and bailiff enforcement?',
    answer:
      'A possession order is the court’s decision that the landlord is entitled to possession. Bailiff enforcement is the later stage used if the tenant still does not leave.',
  },
  {
    question: 'Should I use Complete Pack or Notice Only for a court bailiff case?',
    answer:
      'Complete Pack is usually the stronger fit where the case has already moved into court, possession order, or enforcement planning. Notice Only is generally better where the main need is still the initial notice stage.',
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
        pagePath="/court-bailiff-eviction-guide"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Court Bailiff Eviction Guide',
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
          { name: 'Court Bailiff Eviction Guide', url: canonical },
        ])}
      />

      <UniversalHero
        title="Court Bailiff Eviction Guide"
        subtitle="Understand how county court bailiff enforcement fits after a possession order and what landlords should prepare before the final stage."
        primaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        secondaryCta={{ label: 'Need notice help first?', href: '/products/notice-only' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Court bailiff eviction timeline guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains when county court bailiffs are needed, what the
          enforcement stage usually looks like, and how to plan for possession recovery
          without creating avoidable delay.
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

      <section className="bg-white py-8">
        <Container>
          <div className="mx-auto max-w-5xl">
            <SeoPageContextPanel pathname="/court-bailiff-eviction-guide" className="border border-[#CAB6FF] bg-[#FBF8FF]" />
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                A court bailiff eviction is the enforcement stage landlords usually reach
                after winning a possession claim but not yet getting the property back. If
                the tenant stays beyond the possession date in the order, county court
                bailiffs may be needed to recover possession lawfully.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the court order and the bailiff appointment are two
                different things. The possession order answers the legal question of
                whether the landlord is entitled to possession. Bailiff enforcement deals
                with the practical question of what happens if the tenant still does not
                leave.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why the county court bailiff stage matters so much. Many landlords
                feel that once the hearing is over the case should be finished. In
                reality, where the tenant remains after the possession date, enforcement
                is often the final stage needed to convert the court’s decision into real
                possession on the ground.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The strongest landlord files treat this as part of one continuous process
                from notice to court to enforcement. That means notice validity, service
                quality, hearing preparation, possession order management, and final-stage
                planning all connect. The later the case gets, the more expensive early
                mistakes usually become.
              </p>
            </Card>

            <Card
              id="what-is-a-court-bailiff-eviction"
              title="What Is a Court Bailiff Eviction?"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A court bailiff eviction is the stage where county court enforcement
                officers attend the property to recover possession after the tenant has
                failed to leave in accordance with a possession order. It is not the same
                as serving notice, issuing the possession claim, or obtaining the order
                itself. It is the enforcement phase that follows when voluntary
                compliance has not happened.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords should think of this as a post-order process. By the time a case
                reaches county court bailiff stage, the landlord has already gone through
                notice, court, and possession decision. What remains is lawful execution.
                The bailiffs are not deciding whether the landlord should have possession.
                The court has already done that. Their role is to carry out the order.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This distinction matters because many practical mistakes happen when
                landlords blur the line between legal entitlement and physical recovery.
                The possession order gives the legal basis. County court bailiff
                enforcement is the mechanism that turns that basis into actual possession
                if the tenant stays.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In operational terms, the bailiff process also sits at the point where
                court work meets property management. Access planning, locksmith
                arrangements, inspection, security, and any remaining belongings suddenly
                become relevant. That is why enforcement-stage cases often feel more
                practical than earlier stages even though they remain highly procedural.
              </p>
            </Card>

            <Card
              id="when-landlords-need-court-bailiffs"
              title="When Landlords Need Court Bailiffs"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually need county court bailiffs when they already have a
                possession order but the tenant has not left by the date set by the court.
                In other words, the case has already been won in principle, but not yet
                completed in practice.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Some tenants leave when the notice expires. Others leave after the court
                claim is issued or shortly after the hearing. Others leave after the
                possession order is made. County court bailiffs are most relevant in the
                remaining category: cases where the order is clear and the tenant still
                does not go.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That means bailiff enforcement is especially common in higher-friction
                files, defended cases, long-running arrears disputes, or situations where
                the tenant simply remains in occupation despite the court order. The
                landlord should not treat this as unusual. It usually means the case has
                progressed to its final enforcement stage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The more useful question is not whether bailiff enforcement is annoying. It
                is whether the landlord is prepared for it when it becomes necessary.
                Cases usually move more predictably where the landlord is already thinking
                about enforcement before the possession date has even passed.
              </p>
            </Card>

            <Card
              id="before-bailiff-enforcement"
              title="Before Bailiff Enforcement"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Before moving into county court bailiff enforcement, landlords should
                confirm the exact terms of the possession order, whether the possession
                date has passed, and whether the tenant is still in occupation. This
                sounds basic, but weak file control is a common reason late-stage
                possession work becomes more confusing than it needs to be.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also the point to think operationally. Who will attend if
                enforcement goes ahead? Will a locksmith be needed? What is the plan for
                securing the property, checking condition, and dealing with items left
                behind? Landlords who think through those questions before the
                appointment usually handle the day with more control.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good enforcement-stage preparation also means reviewing the whole file. The
                landlord should know which notice route was used, what happened at court,
                what order was made, and what date now matters. The more clearly the case
                is understood, the easier it is to run the final stage without avoidable
                mistakes.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Check the exact wording and dates in the possession order</li>
                <li>Confirm the tenant is still in occupation</li>
                <li>Plan access, security, and property handover</li>
                <li>Decide who will attend and what practical support is needed</li>
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
              id="how-county-court-bailiff-enforcement-works"
              title="How County Court Bailiff Enforcement Works"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The county court bailiff stage is the step where the landlord moves from
                possession order to lawful recovery if the tenant has still not left. In
                practical terms, this is often the point where landlords feel the case has
                slowed down, because they have already succeeded on the legal merits but
                still do not yet have possession back on the ground.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That frustration is understandable, but the enforcement stage exists to
                protect the landlord’s legal position. It ensures that possession is
                recovered in a way the court recognises as lawful. The landlord should
                therefore treat it as the final formal stage, not as an optional extra
                after the “real” case has ended.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good enforcement files usually depend on one clean chronology. The landlord
                should know the tenancy route, the notice route, the possession order, the
                possession date, and the point at which the file moved into enforcement.
                When those points are clear, the final stage becomes easier to manage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The best mindset is to treat county court bailiff enforcement not as
                separate from the rest of the case, but as the last segment of the same
                workflow. A landlord who prepares for enforcement from the point of
                possession order often moves through it with more control and fewer
                avoidable delays.
              </p>
            </Card>

            <Card
              id="what-happens-on-the-day"
              title="What Happens on the Day"
            >
              <p className="mt-4 leading-7 text-gray-700">
                On the day of the appointment, county court bailiffs attend the property
                under the court’s authority to recover possession in line with the order.
                For many landlords, this is the point where the case finally becomes real
                in practical terms. The matter moves from court paperwork and deadlines
                into actual possession recovery.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The landlord should approach the appointment as both a legal and
                operational event. The legal side is the authority already granted by the
                court. The operational side is making sure access, security, inspection,
                and handover are all dealt with properly once possession is recovered.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In some cases, the tenant leaves before the appointment or during it
                without major difficulty. In others, the day may feel tense or uncertain.
                That is why a clear plan matters. If a locksmith is needed, they should
                be arranged. If the property needs immediate securing or inspection, that
                should be planned before the day arrives.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The more organised the landlord is at this point, the faster the case can
                move from enforcement stage to secure possession and practical recovery of
                the property.
              </p>
            </Card>

            <Card
              id="after-the-bailiff-appointment"
              title="After the Bailiff Appointment"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Once the bailiff appointment is completed and possession is recovered, the
                landlord’s focus usually shifts from enforcement to stabilisation. The
                property needs to be secured, access controlled, and any immediate repair,
                cleaning, or condition issues assessed.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also often the point where the landlord takes stock of what remains
                financially unresolved. Arrears, damage, cleaning costs, or other recovery
                issues may still need separate action. The enforcement stage solves the
                possession problem, but it does not automatically solve every commercial
                problem created by the tenancy.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords should also think about the file after enforcement. What worked?
                What caused delay? What would be improved next time? Cases often become
                more efficient when the landlord captures learning from enforcement rather
                than treating each case as a one-off event.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the case usually ends best when the landlord has
                already planned for the post-enforcement stage before the appointment even
                happens. That includes security, inspection, belongings, and the next
                commercial decision for the property.
              </p>
            </Card>

            <Card
              id="eviction-timeline"
              title="Eviction Timeline and Bailiff Stage Timing"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The county court bailiff stage should be understood as the final part of
                the wider eviction timeline, not as a standalone event. By the time a
                landlord reaches enforcement, the case has usually already moved through
                notice, court claim, and possession order stages. That means the timing
                expectation should be based on the full eviction timeline in England
                rather than on the appointment alone.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In many cases, the overall process from notice to enforcement takes around
                three to six months. Some cases finish sooner where the tenant leaves
                after notice or shortly after the possession order. Others take longer
                where the claim is defended, local court workloads are heavy, or bailiff
                listing times are slow.
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
                      <td className="px-4 py-3 font-medium">County court bailiff enforcement</td>
                      <td className="px-4 py-3">2 – 6 weeks</td>
                      <td className="px-4 py-3">
                        Bailiffs recover possession if the tenant still remains.
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
                The biggest timing mistake landlords make is treating the bailiff stage as
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
                    before the landlord reaches the bailiff stage.
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
                  <span className="font-medium">Assuming backlog can be controlled.</span>
                  <span className="block">
                    Local court and bailiff demand are outside the landlord’s control, so
                    the practical focus should be on file quality and readiness.
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
              id="complete-pack-vs-notice-only"
              title="Complete Pack vs Notice Only"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reading a court bailiff eviction guide are usually no longer at
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
                usually less aligned to a file that is already focused on possession order
                execution and county court bailiff planning.
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
        <FAQSection faqs={faqs} title="Court Bailiff Eviction FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              The court bailiff stage works best when it is planned before it becomes
              urgent. Landlords who treat enforcement as part of one continuous legal
              workflow usually get more predictable outcomes than landlords who only start
              planning after the possession date has already passed.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              For timing expectations, use the Eviction Timeline England guide as the main
              planning reference, then treat county court bailiff enforcement as the final
              enforcement segment of that wider process.
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
