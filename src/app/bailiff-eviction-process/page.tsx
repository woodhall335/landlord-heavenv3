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
  'https://landlordheaven.co.uk/bailiff-eviction-process';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Bailiff Eviction Process | What Happens After a Possession Order | LandlordHeaven',
  description:
    'Plain-English landlord guide to the bailiff eviction process in England, including enforcement steps, timing, and what to prepare before eviction day.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Bailiff Eviction Process | What Happens After a Possession Order | LandlordHeaven',
    description:
      'Landlord guide to the bailiff eviction process, enforcement steps, timelines, and what to prepare before eviction day.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-is-the-bailiff-eviction-process', label: 'What is the bailiff eviction process?' },
  { href: '#when-landlords-need-bailiffs', label: 'When landlords need bailiffs' },
  { href: '#before-you-apply-for-bailiffs', label: 'Before you apply for bailiffs' },
  { href: '#applying-for-enforcement', label: 'Applying for enforcement' },
  { href: '#what-happens-on-eviction-day', label: 'What happens on eviction day' },
  { href: '#after-the-bailiff-appointment', label: 'After the bailiff appointment' },
  { href: '#eviction-timeline', label: 'Eviction timeline' },
  { href: '#common-delay-points', label: 'Common delay points' },
  { href: '#complete-pack-vs-notice-only', label: 'Complete Pack vs Notice Only' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What is the bailiff eviction process?',
    answer:
      'The bailiff eviction process is the enforcement stage used when a tenant stays in the property after the possession date in a court order, and the landlord needs authorised officers to recover possession lawfully.',
  },
  {
    question: 'Can landlords remove the tenant themselves after a possession order?',
    answer:
      'No. If the tenant stays after the possession date, landlords usually need to apply for lawful enforcement rather than trying to remove the tenant themselves.',
  },
  {
    question: 'When do landlords need county court bailiffs?',
    answer:
      'Landlords usually need county court bailiffs when they already have a possession order but the tenant has not left by the date set by the court.',
  },
  {
    question: 'What happens on eviction day?',
    answer:
      'On eviction day, authorised bailiffs attend the property, recover possession in accordance with the court order, and allow the landlord to take control of the property back lawfully.',
  },
  {
    question: 'How long does the bailiff eviction process take?',
    answer:
      'The timeline varies by court and enforcement workload, so landlords should treat it as a staged process rather than assume one fixed timescale.',
  },
  {
    question: 'What should landlords prepare before the bailiff appointment?',
    answer:
      'Landlords should usually prepare the possession order details, access arrangements, locksmith attendance if needed, property handover planning, and any documents the enforcement stage may require.',
  },
  {
    question: 'Do tenants always stay until the bailiff date?',
    answer:
      'No. Some tenants leave after the possession order or shortly before the enforcement appointment, but landlords should still prepare as though the appointment will go ahead.',
  },
  {
    question: 'Should I use Complete Pack or Notice Only for a bailiff-stage case?',
    answer:
      'Complete Pack is usually the stronger fit where the case has already moved into court or enforcement planning. Notice Only is generally better where the landlord still mainly needs help with the initial notice stage.',
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
        pagePath="/bailiff-eviction-process"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Bailiff Eviction Process',
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
          { name: 'Bailiff Eviction Process', url: canonical },
        ])}
      />

      <UniversalHero
        title="Bailiff Eviction Process"
        subtitle="Understand what happens after a possession order and how landlords move from court decision to lawful recovery of the property."
        primaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        secondaryCta={{ label: 'Need notice help first?', href: '/products/notice-only' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Bailiff eviction timeline guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains when landlords need bailiff enforcement, what documents and
          planning matter before the appointment, and what to expect on eviction day.
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
            <SeoPageContextPanel
              pathname="/bailiff-eviction-process"
              className="border border-[#E6DBFF] bg-[#FBF8FF]"
            />
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                The bailiff eviction process is the enforcement stage landlords usually
                reach after winning a possession claim but not yet getting the property
                back. If the tenant stays beyond the date set in the possession order, the
                landlord normally needs authorised officers to recover possession lawfully.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, bailiff enforcement is what turns a court decision into
                real possession on the ground. The possession order confirms the landlord’s
                legal right to recover the property, but if the tenant does not leave, the
                landlord still needs the correct enforcement step to complete the process.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why the bailiff stage matters so much. Many landlords assume that
                winning the court order means the property is immediately back. In reality,
                a possession order and an eviction appointment are different stages. The
                court answers the legal question first, and enforcement then deals with the
                practical question of getting possession back lawfully.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The strongest landlord files treat bailiff eviction as part of one
                continuous workflow from notice to court to enforcement. That means the
                landlord is already thinking about service proof, possession dates,
                enforcement timing, property handover, and post-eviction recovery before
                the bailiff appointment is even requested.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually keep enforcement cleaner when they track the wider{' '}
                <Link href="/eviction-process-uk" className="font-medium text-primary hover:underline">
                  eviction process in the UK
                </Link>
                , check the handoff against the{' '}
                <Link href="/warrant-of-possession-guide" className="font-medium text-primary hover:underline">
                  warrant of possession guide
                </Link>
                , and move to the{' '}
                <Link href="/products/complete-pack" className="font-medium text-primary hover:underline">
                  Complete Pack product page
                </Link>{' '}
                once the file is already in court or enforcement mode.
              </p>
            </Card>

            <Card
              id="what-is-the-bailiff-eviction-process"
              title="What Is the Bailiff Eviction Process?"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The bailiff eviction process is the stage where court-authorised
                enforcement officers attend the property to recover possession after the
                tenant has failed to leave in accordance with a possession order. It is not
                the same thing as serving notice, issuing a claim, or obtaining the order
                itself. It is the enforcement phase that follows when voluntary compliance
                has not happened.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords should think of this as a post-order process. By the time the
                case reaches bailiff stage, the landlord has already gone through notice,
                court, and possession decision. What remains is lawful execution. The role
                of bailiffs is not to decide whether the landlord should have possession.
                The court has already done that. Their role is to carry out the order in a
                controlled and lawful way.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This distinction matters because many practical errors happen when
                landlords blur the line between legal entitlement and physical recovery.
                The possession order gives the landlord the legal basis. The bailiff stage
                is the mechanism that enforces it if the tenant stays.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In operational terms, the bailiff process also sits at the point where
                court work meets property management. Access planning, locksmith
                arrangements, inventory handover, security, and any remaining belongings
                suddenly become relevant. That is why bailiff-stage cases often feel more
                practical than earlier stages, even though they remain highly procedural.
              </p>
            </Card>

            <Card
              id="when-landlords-need-bailiffs"
              title="When Landlords Need Bailiffs"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually need bailiff enforcement when they already have a
                possession order but the tenant has not left by the date the court set. In
                other words, the case has already been won in principle, but not yet
                completed in practice.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Some tenants leave when the notice expires. Others leave after the court
                claim is issued. Others leave after the possession hearing. But where the
                tenant remains after the possession date, the landlord normally cannot take
                the final step alone. That is where enforcement becomes necessary.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Bailiffs are therefore most relevant in cases where the landlord’s route
                has already succeeded through court but cooperation has still not happened.
                This often includes higher-friction cases, long-running arrears disputes,
                defended claims, or situations where the tenant simply does not leave even
                after the court order is clear.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The landlord should not treat the need for bailiffs as unusual or as a sign
                that the case has failed. It usually means the case has progressed to its
                final enforcement stage. The better question is whether the landlord is
                prepared for that stage when it arrives.
              </p>
            </Card>

            <Card
              id="before-you-apply-for-bailiffs"
              title="Before You Apply for Bailiffs"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Before applying for enforcement, landlords should confirm exactly what the
                possession order says, whether the possession date has passed, and whether
                there is any reason the enforcement pathway needs to be adjusted. This
                sounds basic, but many delays at enforcement stage come from weak file
                control rather than from the core legal route.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also the time to think operationally. If the eviction goes ahead,
                who will attend? Does a locksmith need to be there? What is the plan for
                regaining access, checking condition, securing the property, and dealing
                with items left behind? Landlords who think through those questions early
                usually handle enforcement day more smoothly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A good enforcement file should also be internally consistent. The landlord
                should know the notice route used, the order made, the date that matters,
                and the next step required. Enforcement-stage confusion often comes from
                landlords treating the order as the end of the process instead of the start
                of the final stage.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Check the exact possession order terms and dates</li>
                <li>Confirm the tenant is still in occupation</li>
                <li>Prepare access and property handover planning</li>
                <li>Decide who will attend and what practical support is needed</li>
                <li>Assume the enforcement stage needs both legal and operational control</li>
              </ul>
            </Card>

            <CtaBand
              title="Already past notice stage and moving into enforcement?"
              body="Complete Pack is usually the stronger fit where the case has already moved into court, possession order, or enforcement planning. Notice Only is generally better where the landlord still mainly needs the initial notice stage handled properly."
              primaryHref="/products/complete-pack"
              primaryLabel="Start Complete Eviction Pack"
              secondaryHref="/products/notice-only"
              secondaryLabel="Need Notice Only First?"
            />

            <Card
              id="applying-for-enforcement"
              title="Applying for Enforcement"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Applying for enforcement is the step where the landlord asks the court to
                move from possession order to actual recovery of the property. In practical
                terms, this is often the point where the case feels slowest to landlords,
                because they have already proved the claim but still do not yet have the
                property back.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That frustration is understandable, but the enforcement stage exists to
                protect the landlord’s legal position. It ensures that possession is
                recovered in a way the court recognises as lawful. The landlord therefore
                needs to approach the application stage as the final formal step rather
                than as an annoying extra.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good enforcement applications usually depend on the same principle as the
                rest of the case: one clean chronology. The landlord should know the
                tenancy route, the notice route, the possession order date, and the exact
                moment the file moved into enforcement. When those points are clear,
                everything else tends to be easier.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The best mindset is to treat enforcement not as separate from the case, but
                as the final segment of the same workflow. A landlord who has prepared for
                this stage from the point of court order usually moves through it with far
                more control.
              </p>
            </Card>

            <Card
              id="what-happens-on-eviction-day"
              title="What Happens on Eviction Day"
            >
              <p className="mt-4 leading-7 text-gray-700">
                On eviction day, authorised bailiffs attend the property to recover
                possession in accordance with the court order. Their attendance is what
                turns the court decision into actual possession on the ground. For many
                landlords, this is the point where the case finally becomes real in
                practical terms.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The landlord should approach eviction day as both a legal and operational
                event. The legal side is the enforcement authority already granted by the
                court. The operational side is making sure access, security, property
                condition, and handover are all handled properly once the tenant leaves or
                is removed in accordance with the order.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In many cases, the tenant leaves before or during the appointment without
                major conflict. In others, the day may feel tense or uncertain. That is
                why landlords benefit from turning up with a clear plan instead of treating
                the appointment as the end of all planning. If a locksmith is needed, they
                should be prepared. If the property needs securing immediately afterwards,
                that should be planned in advance.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The more organised the landlord is at this stage, the faster the case can
                move from enforcement appointment to secure possession and practical
                recovery of the property.
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
                already planned for the post-bailiff stage before the appointment even
                happens. That includes security, inspection, belongings, and the next
                commercial decision for the property.
              </p>
            </Card>

            <Card
              id="eviction-timeline"
              title="Eviction Timeline and Bailiff Stage Timing"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The bailiff stage should be understood as the final part of the wider
                eviction timeline, not as a standalone event. By the time a landlord
                reaches enforcement, the case has usually already moved through notice,
                court claim, and possession order stages. That means the true timing
                expectation should be based on the full eviction timeline in England rather
                than on the bailiff appointment alone.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In many cases, the overall process from notice to enforcement takes around
                three to six months. Some cases finish sooner where the tenant leaves after
                notice or shortly after the possession order. Others take longer where the
                claim is defended, local court workloads are heavy, or bailiff listing
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
                      <td className="px-4 py-3 font-medium">Bailiff enforcement</td>
                      <td className="px-4 py-3">2 – 6 weeks</td>
                      <td className="px-4 py-3">
                        Authorised enforcement officers recover possession if needed.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                For timing expectations, use the eviction timeline England guide as the
                main reference point. Court backlogs and bailiff availability are outside
                your control, but notice validity, service quality, chronology control, and
                document readiness are not.
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
                    If service cannot be shown clearly, the court route may slow down
                    before the landlord ever reaches the bailiff stage.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Incomplete court paperwork.</span>
                  <span className="block">
                    Inconsistent or poorly prepared claim files often create avoidable
                    friction at hearing and post-order stage.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Waiting too long to prepare for enforcement.</span>
                  <span className="block">
                    Landlords who only start planning after the possession date often lose
                    momentum on the final handover.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Assuming court backlog can be controlled.</span>
                  <span className="block">
                    Local listing pressure and bailiff demand are outside the landlord’s
                    control, so the practical focus should be on file quality, service
                    standards, and readiness.
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
              id="complete-pack-vs-notice-only"
              title="Complete Pack vs Notice Only"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reading a bailiff eviction process guide are usually no longer at
                the start of the case. In most situations, the issue is not whether a
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
                execution and bailiff planning.
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
        <FAQSection faqs={faqs} title="Bailiff Eviction Process FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              The bailiff stage works best when it is planned before it becomes urgent.
              Landlords who treat enforcement as part of one continuous legal workflow
              usually get more predictable outcomes than landlords who only start planning
              after the possession date has already passed.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              For timing expectations, use the Eviction Timeline England guide as the main
              planning reference, then treat the bailiff stage as the final enforcement
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
