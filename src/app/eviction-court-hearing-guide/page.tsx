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
  'https://landlordheaven.co.uk/eviction-court-hearing-guide';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Eviction Court Hearing Guide | Bundle, Evidence and What to Expect | LandlordHeaven',
  description:
    'Plain-English landlord guide to eviction court hearings in England, including bundle preparation, evidence, what judges focus on, and what happens next.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Eviction Court Hearing Guide | Bundle, Evidence and What to Expect | LandlordHeaven',
    description:
      'Landlord guide to preparing an eviction hearing file, understanding what judges focus on, and planning what happens after the hearing.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-happens-at-an-eviction-hearing', label: 'What happens at an eviction hearing?' },
  { href: '#how-landlords-should-prepare', label: 'How landlords should prepare' },
  { href: '#hearing-bundle-and-evidence', label: 'Bundle and evidence' },
  { href: '#what-judges-usually-look-for', label: 'What judges usually look for' },
  { href: '#common-tenant-defences', label: 'Common tenant defences' },
  { href: '#after-the-hearing', label: 'What happens after the hearing' },
  { href: '#timeline-and-outcomes', label: 'Timeline and outcomes' },
  { href: '#common-hearing-mistakes', label: 'Common mistakes' },
  { href: '#complete-pack-vs-notice-only', label: 'Complete Pack vs Notice Only' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What happens at an eviction court hearing?',
    answer:
      'At an eviction court hearing, the judge reviews the landlord’s claim, the notice, the evidence, and any response from the tenant before deciding whether to make a possession order or another type of order.',
  },
  {
    question: 'Do landlords need to attend the hearing?',
    answer:
      'In many cases, yes. A landlord or their representative should usually be ready to explain the case, answer questions, and address any issues raised by the tenant or the judge.',
  },
  {
    question: 'What should landlords bring to an eviction hearing?',
    answer:
      'Landlords should usually bring the tenancy agreement, the notice served, proof of service, rent schedules where relevant, witness material, and a clear chronology of the case.',
  },
  {
    question: 'Can the tenant defend the eviction at the hearing?',
    answer:
      'Yes. Tenants may raise defences such as notice validity problems, disrepair, service issues, payment disputes, or hardship arguments, depending on the type of claim.',
  },
  {
    question: 'What happens if the landlord wins the hearing?',
    answer:
      'If the landlord succeeds, the court may make a possession order. If the tenant does not leave by the possession date, the landlord may need to apply for enforcement.',
  },
  {
    question: 'Can a hearing be adjourned?',
    answer:
      'Yes. A hearing can be adjourned if documents are missing, the evidence is unclear, the court needs more information, or procedural issues need to be dealt with first.',
  },
  {
    question: 'Is the hearing mainly about legal argument?',
    answer:
      'Not always. In many landlord cases, the hearing is mainly about whether the documents, dates, notice, evidence, and chronology support the order being requested.',
  },
  {
    question: 'Should I use Complete Pack or Notice Only for a hearing-stage case?',
    answer:
      'Complete Pack is usually the stronger fit where the case is already moving into court preparation, hearing management, and post-hearing planning. Notice Only is generally better where the main need is the notice stage rather than broader litigation support.',
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
        pagePath="/eviction-court-hearing-guide"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Eviction Court Hearing Guide',
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
          { name: 'Eviction Court Hearing Guide', url: canonical },
        ])}
      />

      <UniversalHero
        title="Eviction Court Hearing Guide"
        subtitle="If your case is heading to a hearing, this guide helps you prepare the bundle properly, understand what the judge is likely to focus on, and plan the next step before the day arrives."
        primaryCta={{ label: 'Start complete eviction pack', href: '/products/complete-pack' }}
        secondaryCta={{ label: 'Need notice drafting first?', href: '/products/notice-only' }}
        mediaSrc="/images/wizard-icons/07-review-finish.png"
        mediaAlt="Eviction court hearing guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide is for landlords who are close to court stage and need a clearer
          hearing strategy, cleaner bundle preparation, and a better understanding of what
          happens after the judge makes a decision.
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
              pathname="/eviction-court-hearing-guide"
              className="border border-[#E6DBFF] bg-[#FBF8FF]"
            />
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                An eviction court hearing is the point where the possession case moves
                from paperwork and preparation into active judicial review. The judge looks
                at the landlord’s claim, the notice served, the supporting evidence, and
                any points raised by the tenant before deciding what order, if any, should
                be made.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                For landlords, the hearing is rarely won by sounding dramatic. It is
                usually won by being clear, organised, and consistent. A strong hearing
                file shows the tenancy history, the legal route chosen, the notice served,
                the supporting chronology, and the exact order the landlord is asking the
                court to make.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the court hearing is where earlier preparation is
                tested. If the notice was defective, if the dates do not line up, if the
                arrears schedule is weak, or if the evidence is disorganised, those issues
                usually surface here. If the case has been prepared well, the hearing is
                often much more straightforward than landlords expect.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The best way to think about hearing day is not as a separate event, but as
                the moment your notice file, claim file, and evidence file all have to
                tell one clean story. Judges respond well to chronology, clarity, and
                documents that match each other. They respond badly to contradiction,
                guesswork, and avoidable confusion.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                It helps to frame hearing day inside the wider{' '}
                <Link href="/eviction-process-uk" className="font-medium text-primary hover:underline">
                  eviction process UK timeline
                </Link>
                , then review the{' '}
                <Link href="/court-possession-order-guide" className="font-medium text-primary hover:underline">
                  court possession order guide
                </Link>{' '}
                for what happens if the judge grants possession, and use the{' '}
                <Link href="/products/complete-pack" className="font-medium text-primary hover:underline">
                  Complete Pack
                </Link>{' '}
                when the case needs a joined-up notice, bundle, and post-hearing workflow.
              </p>
            </Card>

            <Card
              id="what-happens-at-an-eviction-hearing"
              title="What Happens at an Eviction Court Hearing?"
            >
              <p className="mt-4 leading-7 text-gray-700">
                At an eviction hearing, the court reviews the possession claim and decides
                whether the landlord is entitled to the order being requested. That sounds
                simple, but what the judge is really doing is testing whether the legal
                route has been followed properly and whether the documents support the case
                being advanced.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The hearing will usually focus on a small number of core questions. What
                tenancy existed? What notice was served? Was the notice valid? Was it
                served properly? What breach or legal basis is being relied on? What
                evidence proves that basis? What order is now being requested? When those
                questions are easy to answer from the file, the hearing usually runs more
                smoothly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The tenant may attend and respond. In some cases they will dispute the
                landlord’s chronology. In others they may raise service issues, payment
                issues, disrepair complaints, or hardship points. Sometimes they simply
                ask for more time. The landlord should therefore expect the hearing to be
                about both law and case management. Even where the legal route is strong,
                the judge may want to understand practical context before deciding what
                order to make.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Hearing day is not usually about delivering a long speech. It is about
                helping the judge follow the file quickly. That means the landlord or
                representative should know the chronology, know the evidence, and know the
                precise outcome being sought.
              </p>
            </Card>

            <Card
              id="how-landlords-should-prepare"
              title="How Landlords Should Prepare"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Good hearing preparation starts before the court bundle is assembled. The
                first task is to decide exactly what the case is about and what must be
                proved. That sounds obvious, but many hearing files go wrong because the
                landlord includes too much irrelevant material and not enough focused
                material on the actual issue the judge needs to decide.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A strong approach is to build the hearing around one chronology. That
                chronology should cover the tenancy start, key compliance events where
                relevant, breach events, payment history, communications, notice service,
                claim issue, and any important developments since the claim began. If the
                chronology is clear, the rest of the file becomes easier to organise.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords should also think about hearing preparation as contradiction
                control. The tenancy agreement, the notice, the witness statement, the rent
                schedule, and the service evidence should all line up. Even small
                inconsistencies can give the tenant room to challenge the credibility of
                the file.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                It also helps to prepare a short hearing note answering four questions:
                what order is being sought, what legal route supports it, what documents
                prove the case, and what likely defence points need answering. That note
                can be more useful than a large pile of papers if it helps the landlord
                stay focused under pressure.
              </p>
            </Card>

            <Card
              id="hearing-bundle-and-evidence"
              title="Hearing Bundle and Evidence"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A hearing bundle should help the judge understand the case quickly. It is
                not there to prove how much work the landlord has done. It is there to
                make the route, the facts, and the evidence easy to follow.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In most landlord possession cases, the key bundle documents will include
                the tenancy agreement, the notice served, proof of service, the claim
                documents, witness material, and any route-specific evidence such as an
                arrears schedule, payment ledger, inspection records, complaints, photos,
                or correspondence. The exact mix depends on the case, but the principle is
                always the same: every key point should be supported by a clear document.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In arrears cases, the rent schedule often becomes one of the most
                important documents in the hearing file. It should be accurate, current,
                and easy to reconcile. In conduct or breach cases, the most important
                material may be statements, logs, or records that show dates, frequency,
                and the effect of what happened.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                What matters most is coherence. A shorter bundle that clearly proves the
                claim is usually stronger than a longer bundle full of duplicated, loosely
                relevant, or contradictory material. Judges are often dealing with time
                pressure. A clean bundle is an advantage.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Use one master chronology across all documents</li>
                <li>Make sure dates, names, and figures match everywhere</li>
                <li>Include route-specific proof rather than generic background material</li>
                <li>Update arrears schedules and hearing notes before the hearing date</li>
                <li>Assume the judge needs clarity more than volume</li>
              </ul>
            </Card>

            <CtaBand
              title="Already moving into court stage?"
              body="Complete Pack is usually the stronger fit where the case has moved beyond simple notice drafting and now needs tighter hearing preparation, evidence management, and post-hearing planning. Notice Only is generally better where the main need is still the initial notice stage."
              primaryHref="/products/complete-pack"
              primaryLabel="Start Complete Eviction Pack"
              secondaryHref="/products/notice-only"
              secondaryLabel="Need Notice Only First?"
            />

            <Card
              id="what-judges-usually-look-for"
              title="What Judges Usually Look For"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Judges usually focus less on emotion and more on structure. They want to
                know what route is being used, what legal test applies, whether the notice
                was valid, whether the evidence supports the claim, and whether the order
                requested is justified on the facts in front of them.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In a Section 21 style case, notice validity, service, and compliance
                history tend to matter heavily. In a Section 8 case, the judge may look
                more closely at the breach itself, the quality of the evidence, and
                whether the relevant ground is mandatory or discretionary. In either case,
                judges tend to value documents that tell one consistent story.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                They also look at reliability. Does the bundle look organised? Do the
                documents support each other? Can the landlord explain the sequence of
                events without hesitation? Is the hearing note focused on the real issues?
                These things do not replace the legal test, but they influence how easy it
                is for the court to accept the case being advanced.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Where the court sees avoidable confusion, the result may be delay, further
                questions, or adjournment. Where the court sees a well-prepared file and a
                clear route, the hearing often becomes more procedural than confrontational.
              </p>
            </Card>

            <Card
              id="common-tenant-defences"
              title="Common Tenant Defences"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Tenants do not need to produce a perfect defence to slow a case down. Even
                a limited point can matter if it exposes a real weakness in the landlord’s
                file. That is why landlords should prepare for likely defences before the
                hearing instead of reacting to them on the day.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Common defence themes include notice validity, poor service evidence,
                payment disputes, disrepair allegations, retaliatory eviction arguments,
                hardship requests, or challenges to the accuracy of the chronology. In
                rent cases, tenants may also try to reduce arrears before the hearing to
                affect the grounds relied on. In conduct cases, they may dispute the facts
                or question the quality of the evidence.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The best answer to most hearing-stage defences is not rhetorical. It is
                documentary. If service is challenged, the landlord should have service
                proof. If arrears are challenged, the landlord should have an updated and
                accurate rent schedule. If disrepair is raised, the landlord should know
                what records exist and what effect that argument has on the route being
                used.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good hearing preparation means identifying the most likely defence points
                in advance and making sure the file can answer them. That is often the
                difference between a hearing that stays focused and one that drifts into
                confusion.
              </p>
            </Card>

            <Card
              id="after-the-hearing"
              title="What Happens After the Hearing"
            >
              <p className="mt-4 leading-7 text-gray-700">
                After the hearing, the court may make several different kinds of decision.
                It may grant possession outright, grant a suspended or postponed order,
                adjourn the case, dismiss the claim, or ask for further steps before the
                matter is decided. That is why landlords should plan not just for success,
                but for a range of hearing outcomes.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                If possession is granted, the landlord should immediately note the exact
                terms of the order, the possession date, and what needs to happen next. If
                the tenant leaves by that date, the matter may end without enforcement. If
                the tenant remains, the landlord may need to move to a warrant or other
                enforcement step.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                If the order is suspended, the landlord’s next job is usually monitoring.
                The terms need to be tracked carefully because later enforcement may depend
                on proving that those terms were broken. If the case is adjourned, the
                landlord should treat that as a signal to improve the file quickly rather
                than as a neutral delay.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, good hearing preparation always includes a post-hearing
                plan. Landlords who know in advance what they will do after each likely
                outcome usually handle the court stage with more control.
              </p>
            </Card>

            <Card
              id="timeline-and-outcomes"
              title="Timeline and Outcomes"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The hearing itself is only one point in the overall timeline. By the time
                a landlord reaches court, the case has normally already passed through
                notice service, pre-claim waiting, claim issue, and bundle preparation.
                After the hearing, it may still pass through possession order compliance
                and enforcement.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This matters because landlords often treat hearing day as the finish line.
                In reality, it is better understood as a decision point. If the hearing
                goes well, the landlord moves toward possession recovery. If the hearing
                exposes weaknesses, the matter may be delayed, adjourned, or reshaped by
                the order the judge makes.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A realistic outcome map usually includes four possibilities: outright
                possession, conditional possession, delay for more information, or no
                possession order at all. The cleaner the notice file and hearing bundle,
                the more likely the outcome stays close to what the landlord expected.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The most avoidable delays are often the ones caused by poor preparation.
                Clear routes, consistent dates, a focused bundle, and a credible hearing
                note do not eliminate court delay, but they reduce the chances of
                preventable disruption at the one stage where precision matters most.
              </p>
            </Card>

            <Card
              id="common-hearing-mistakes"
              title="Common Hearing Mistakes"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Many hearing-stage problems come from the same underlying mistake:
                landlords treat the hearing as an event instead of the test of a whole
                process. By the time the hearing starts, the court is already examining
                everything that happened before it. That means the hearing usually exposes
                weaknesses that began much earlier.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Turning up with a disorganised bundle.</span>
                  <span className="block">
                    Even a good case becomes harder to win cleanly if the documents are
                    difficult to follow.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Not updating the file before the hearing.</span>
                  <span className="block">
                    Rent figures, communications, and the factual position can change
                    after the claim is issued.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Not anticipating tenant defences.</span>
                  <span className="block">
                    Many hearing delays happen because the landlord has not prepared for
                    obvious service, notice, or evidence challenges.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Focusing on frustration instead of proof.</span>
                  <span className="block">
                    Judges usually need documents and chronology, not emotion.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Not planning beyond the hearing date.</span>
                  <span className="block">
                    A landlord should know what to do after outright possession,
                    conditional orders, adjournment, or enforcement need.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                The safest mindset is to treat hearing day as a controlled presentation of
                a file that was built properly in advance. When the route, evidence, and
                outcome requested all align, the hearing becomes much easier to manage.
              </p>
            </Card>

            <Card
              id="complete-pack-vs-notice-only"
              title="Complete Pack vs Notice Only"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reading an eviction court hearing guide are usually no longer at
                the earliest stage of the case. They are often deciding whether the matter
                now needs broader litigation support rather than just notice drafting.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the case is already moving
                through court-stage work and the landlord wants broader support across
                preparation, evidence control, hearing readiness, and next-step planning.
                That is particularly helpful where the case is high-risk, document-heavy,
                or likely to be defended.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is generally the better fit where the landlord is still at the
                front end of the process and mainly needs the notice stage handled
                properly. It can still be the right starting point where the hearing is not
                yet in view and the immediate problem is getting the notice route right.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the later the case stage and the greater the hearing
                risk, the more likely Complete Pack is the better fit. Where the landlord
                is still solving the first formal step, Notice Only may still be the
                cleaner route.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Eviction court hearing FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">What to do next</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Hearing-stage eviction work rewards preparation more than speed. The
              landlord who arrives with a clean chronology, a focused bundle, and a clear
              post-hearing plan usually puts themselves in a much stronger position than
              the landlord who tries to improvise on the day.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If the case is already moving into hearing preparation and you want broader
              support across bundle quality, evidence control, and next-step planning,
              start with Complete Eviction Pack. If the main need is still the first legal
              step and you need notice drafting first, start with Notice Only.
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
