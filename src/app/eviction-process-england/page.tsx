import type { Metadata } from 'next';
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

const canonical = 'https://landlordheaven.co.uk/eviction-process-england';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Eviction Process England | Step-by-Step Landlord Guide | LandlordHeaven',
  description:
    'A complete guide to the eviction process in England covering Section 21, Section 8, notice periods, possession orders, bailiffs, timelines, common mistakes.',
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'Eviction Process England | Step-by-Step Landlord Guide | LandlordHeaven',
    description:
      'Learn how the eviction process works in England, from notice choice and service through possession orders, court stages, and bailiff enforcement.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-the-eviction-process-in-england-looks-like', label: 'How the process works' },
  { href: '#section-21-vs-section-8', label: 'Section 21 vs Section 8' },
  { href: '#how-landlords-choose-the-right-route', label: 'Choosing the right route' },
  { href: '#notice-stage', label: 'Notice stage' },
  { href: '#court-stage', label: 'Court stage' },
  { href: '#possession-order-stage', label: 'Possession order stage' },
  { href: '#bailiff-and-enforcement-stage', label: 'Bailiff and enforcement stage' },
  { href: '#eviction-process-timeline-england', label: 'Eviction timeline' },
  { href: '#documents-landlords-should-prepare', label: 'Documents to prepare' },
  { href: '#common-eviction-process-mistakes', label: 'Common mistakes' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'How does the eviction process in England usually start?',
    answer:
      'The eviction process in England usually starts with choosing the correct notice route and checking the tenancy facts before anything is served. In most cases, landlords first decide whether Section 21 or Section 8 is the stronger legal route for the facts of the case.',
  },
  {
    question: 'What is the difference between Section 21 and Section 8?',
    answer:
      'Section 21 is usually used where the landlord wants possession without relying on tenant breach, while Section 8 is usually used where the tenant has breached the tenancy agreement, such as through rent arrears or anti-social behaviour.',
  },
  {
    question: 'How long does the eviction process in England take?',
    answer:
      'Many cases take several months from notice to enforcement. The overall timeline depends on the notice period, the court route, whether the tenant defends the claim, and local bailiff waiting times.',
  },
  {
    question: 'Can landlords remove tenants without going to court?',
    answer:
      'No. If the tenant does not leave after the notice expires, landlords usually need a possession order and, if necessary, bailiff enforcement. Landlords should not try to remove tenants themselves.',
  },
  {
    question: 'What is a possession order?',
    answer:
      'A possession order is a court order stating when the tenant must leave the property. If the tenant stays after that date, the landlord normally needs to apply for enforcement.',
  },
  {
    question: 'What happens after a possession order is granted?',
    answer:
      'If the tenant leaves, the case may end there. If they remain in occupation, the landlord usually needs to apply for a warrant or another enforcement route so authorised officers can lawfully recover possession.',
  },
  {
    question: 'What is the biggest cause of delay in eviction cases?',
    answer:
      'One of the biggest causes of delay is invalid or inconsistent paperwork. Errors in notice dates, weak proof of service, missing compliance documents, or unclear evidence often slow the process down more than the legal route itself.',
  },
  {
    question: 'Should I choose Notice Only or the Complete Eviction Pack?',
    answer:
      'Notice Only is often suitable where you already know the correct route and mainly need a compliant notice workflow. The Complete Eviction Pack is usually better where you want broader support across notice choice, evidence preparation, court readiness, and the wider possession process.',
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
        pagePath="/eviction-process-england"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Eviction Process England',
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
          { name: 'Eviction Process England', url: canonical },
        ])}
      />
      <UniversalHero
        title="Eviction Process England"
        subtitle="A step-by-step landlord guide covering notice routes, court stages, possession orders, and enforcement."
        primaryCta={{ label: 'Start Notice Only', href: '/products/notice-only' }}
        secondaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Eviction process England icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Learn how the eviction process in England usually works, what landlords need at
          each stage, and how to move from notice through possession and, where necessary,
          bailiff enforcement.
        </p>
      </UniversalHero>

      <section id="quick-answer" className="border-b border-[#E6DBFF] bg-white py-10">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Quick Answer</h2>
            <p className="mt-4 leading-7 text-gray-700">
              The eviction process in England usually follows four broad stages: choosing
              the correct notice route, serving a valid notice, applying to court for
              possession if the tenant stays, and enforcing the order if possession is not
              given voluntarily.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The process is often less about rushing and more about getting each stage
              right. The route chosen, the documents served, the evidence retained, and the
              consistency of the file usually determine whether the case progresses
              smoothly or becomes delayed and expensive.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The clearest England route usually starts with the{' '}
              <Link href="/eviction-process-uk" className="font-medium text-primary hover:underline">
                eviction process in the UK
              </Link>
              , connects notice choice back to the{' '}
              <Link href="/section-8-notice" className="font-medium text-primary hover:underline">
                Section 8 notice guide
              </Link>
              , and keeps the commercial next step on the{' '}
              <Link href="/products/complete-pack" className="font-medium text-primary hover:underline">
                Complete Pack product page
              </Link>{' '}
              once a landlord needs one possession workflow from service through court.
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
            <SeoPageContextPanel
              pathname="/eviction-process-england"
              className="border border-[#E6DBFF] bg-[#FBF8FF]"
            />
            <Card
              id="what-the-eviction-process-in-england-looks-like"
              title="What the Eviction Process in England Looks Like"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The eviction process in England is best understood as a legal workflow with
                linked stages rather than as a single notice or form. Landlords usually
                begin by diagnosing the case: what type of tenancy exists, why possession is
                needed, what compliance documents are in place, and whether the facts point
                towards Section 21 or Section 8.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Once the route is clear, the process moves into the notice stage. This is
                where landlords serve the relevant notice and start building the possession
                record in a way that can later be used at court. If the tenant leaves, the
                process may end there. If not, the file moves into court stage and then,
                where necessary, enforcement.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords often lose time by treating these stages as separate admin tasks.
                In reality, every stage depends on the earlier one. A notice served with
                weak dates or poor evidence can create problems weeks later when the claim
                reaches court. Stronger landlords usually plan the full route from the
                beginning, even if they hope the tenant leaves during the notice period.
              </p>
            </Card>

            <Card id="section-21-vs-section-8" title="Section 21 vs Section 8">
              <p className="mt-4 leading-7 text-gray-700">
                The two main eviction routes landlords usually compare in England are
                Section 21 and Section 8. They both aim at possession, but they serve
                different purposes and depend on different kinds of evidence.
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
                      <td className="px-4 py-3 font-medium">Main focus</td>
                      <td className="px-4 py-3">Validity, compliance, and service</td>
                      <td className="px-4 py-3">Proof of breach and supporting evidence</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Best fit</td>
                      <td className="px-4 py-3">Possession goal with strong compliance file</td>
                      <td className="px-4 py-3">Rent arrears, nuisance, damage, or other breaches</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Section 21 is often chosen where possession is the
                objective and the paperwork is strong. Section 8 is often chosen where the
                tenant has done something that justifies breach-based possession, such as
                falling into rent arrears or causing serious nuisance. The better route is
                usually the one that best matches the facts and the evidence already
                available.
              </p>
            </Card>

            <Card id="how-landlords-choose-the-right-route" title="How Landlords Choose the Right Route">
              <p className="mt-4 leading-7 text-gray-700">
                Route choice is one of the most commercially important decisions in the
                eviction process in England. Landlords usually start by asking three
                questions. First, what type of tenancy is this? Second, do I need
                possession only, or possession plus arrears recovery? Third, what can I
                actually prove if the case reaches court?
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                If the compliance file is complete and the main goal is possession, Section
                21 may be a cleaner route. If the tenant has clearly breached the tenancy,
                Section 8 may be stronger because it reflects the real facts of the case.
                Where landlords try to force the wrong route onto the facts, they often
                create delay rather than speed.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The strongest decision is usually not the one that looks fastest in theory.
                It is the one most likely to remain valid from notice stage through court.
                A route that is robust on evidence is usually commercially faster than a
                route that fails later on validity.
              </p>
            </Card>

            <CtaBand
              title="Need help choosing the correct route before you serve notice?"
              body="Use Notice Only if the route is already clear and you mainly need a compliant notice workflow. Use the Complete Eviction Pack if you want broader support across route choice, evidence, and the wider possession process."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />

            <Card id="notice-stage" title="Notice Stage">
              <p className="mt-4 leading-7 text-gray-700">
                The notice stage is where the legal process becomes live. Once the route
                has been chosen, landlords usually generate the correct notice, check the
                dates carefully, and plan service in a way that can be proved later.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                This stage looks simple from the outside, but it is one of the most common
                sources of delay. Date errors, wrong forms, poor proof of service, or weak
                supporting records can all undermine possession later. For that reason,
                landlords often get better results by validating the file before service
                rather than fixing mistakes after the tenant has challenged the notice.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The correct service method also matters. Depending on the tenancy and the
                facts, service may be by post, by hand, by process server, or by email
                where the agreement clearly allows it. The key point is that service must
                be planned, not improvised, and the landlord should keep a reliable service
                trail.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In practice, landlords should think of the notice stage as the foundation
                for everything that follows. A notice that is clearly drafted, properly
                dated, and backed by proof of service is much easier to take into court if
                the tenant does not leave.
              </p>
            </Card>

            <Card id="court-stage" title="Court Stage">
              <p className="mt-4 leading-7 text-gray-700">
                If the tenant remains after the notice expires, the process usually moves
                to court. The exact court route depends on the notice used and the relief
                being sought. In broad terms, Section 21 cases may move through an
                accelerated route where appropriate, while Section 8 cases usually move
                through a standard possession claim and often involve a hearing.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                At this point, the landlord’s file matters more than ever. The court will
                usually expect a clear chronology, accurate dates, reliable service
                evidence, and supporting documents that all align with each other. Where
                the paperwork is inconsistent, cases often slow down or require further
                explanation.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords sometimes assume that getting to court means the hardest part is
                over. In reality, the court stage is where any earlier weaknesses become
                visible. A case that is tidy on paper often moves more efficiently than a
                case that requires the landlord to explain missing documents or unclear
                figures.
              </p>
            </Card>

            <Card id="possession-order-stage" title="Possession Order Stage">
              <p className="mt-4 leading-7 text-gray-700">
                If the court grants possession, the landlord receives a possession order.
                This order usually states the date by which the tenant must leave the
                property. In many cases that period is relatively short, although the exact
                timing depends on the order made and the circumstances of the case.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                A possession order is a major step, but it is not always the end of the
                process. Some tenants leave after the order is made. Others remain in
                occupation, which means the landlord has to move again into enforcement.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords should treat the possession order stage as a decision point. If
                the tenant leaves, the matter may close. If not, the next enforcement step
                should be planned quickly so the case does not stall unnecessarily between
                judgment and recovery of the property.
              </p>
            </Card>

            <Card id="bailiff-and-enforcement-stage" title="Bailiff and Enforcement Stage">
              <p className="mt-4 leading-7 text-gray-700">
                If the tenant stays after the possession date, landlords usually need
                authorised enforcement to recover the property lawfully. In many cases this
                means county court bailiffs, although in some situations another approved
                route may be considered.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                This stage often causes frustration because landlords assume that a
                possession order means immediate recovery. In reality, enforcement is its
                own stage with its own timing. Bailiff waiting times vary by area and can
                add weeks to the overall eviction process in England.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Landlords must not attempt to bypass this stage by changing locks, removing
                possessions, or pressuring the tenant to leave outside the legal process.
                Self-help eviction creates serious legal risk and can turn a valid
                possession case into a much more difficult dispute.
              </p>
            </Card>

            <CtaBand
              title="Need more than just a notice?"
              body="If your case may move from notice to court and then enforcement, the Complete Eviction Pack is usually the stronger fit. If you already know the route and mainly need the notice itself, Notice Only may be enough."
              primaryHref="/products/complete-pack"
              primaryLabel="Start Complete Eviction Pack"
              secondaryHref="/products/notice-only"
              secondaryLabel="Start Notice Only"
            />

            <Card id="eviction-process-timeline-england" title="Eviction Process Timeline in England">
              <p className="mt-4 leading-7 text-gray-700">
                One of the most common landlord questions is how long the eviction process
                in England takes. The honest answer is that the timeline depends on the
                notice route, the tenant’s response, the court workload, and whether
                enforcement becomes necessary.
              </p>
              <div className="mt-5 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="px-4 py-3 text-left font-semibold">What usually happens</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Route choice and validation</td>
                      <td className="px-4 py-3">Landlord confirms tenancy facts and evidence</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Notice period</td>
                      <td className="px-4 py-3">Depends on the notice and grounds used</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Court stage</td>
                      <td className="px-4 py-3">Possession claim is issued and processed</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Possession order</td>
                      <td className="px-4 py-3">Court sets the date to leave</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Enforcement if needed</td>
                      <td className="px-4 py-3">Bailiffs or another authorised route recover possession</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-7 text-gray-700">
                In practice, weak preparation is often a bigger source of delay than the
                legal stages themselves. Cases with strong evidence, correct forms, valid
                dates, and clean service records usually move more smoothly than cases that
                need to be repaired mid-process.
              </p>
            </Card>

            <Card id="documents-landlords-should-prepare" title="Documents Landlords Should Prepare">
              <p className="mt-4 leading-7 text-gray-700">
                The strongest eviction files are usually built before the claim is issued.
                Landlords should aim to create a document bundle that clearly explains the
                tenancy, the route chosen, the notice served, and what happened after
                service.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Tenancy agreement and any renewal or variation documents</li>
                <li>Compliance records relevant to the notice route</li>
                <li>Copy of the notice served</li>
                <li>Proof of service showing when and how the notice was served</li>
                <li>Rent schedule and payment records where arrears are involved</li>
                <li>Communications with the tenant relevant to the route chosen</li>
                <li>Chronology of events from tenancy start to notice stage</li>
              </ul>
              <p className="mt-4 leading-7 text-gray-700">
                The goal is not to produce the largest bundle possible. It is to produce a
                clear, dated, and internally consistent file. Courts usually respond better
                to evidence that is coherent and easy to verify than to a large but
                disorganised set of papers.
              </p>
            </Card>

            <Card id="common-eviction-process-mistakes" title="Common Eviction Process Mistakes">
              <p className="mt-4 leading-7 text-gray-700">
                The eviction process in England often becomes expensive because of
                preventable mistakes rather than unusual legal issues. The following
                problems appear repeatedly in weaker possession files.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Choosing the wrong route.</span>
                  <span className="block">
                    A landlord can have a genuine need for possession and still lose time by
                    forcing the wrong notice route onto the facts.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Serving invalid notices.</span>
                  <span className="block">
                    Wrong forms, incorrect dates, or missing compliance records often cause
                    delay later.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Weak proof of service.</span>
                  <span className="block">
                    If service cannot be shown clearly, the notice itself may be disputed.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Poor court preparation.</span>
                  <span className="block">
                    Contradictions between the notice, the rent figures, and the chronology
                    often weaken the landlord’s position.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Assuming the possession order ends the case.</span>
                  <span className="block">
                    If the tenant stays, enforcement is still required and needs to be
                    planned.
                  </span>
                </li>
              </ul>
            </Card>

            <Card id="notice-only-vs-complete-pack" title="Notice Only vs Complete Pack">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reaching this page are often not just looking for information.
                They are trying to decide what kind of support the case actually needs.
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the legal route is already
                clear and the main requirement is a compliant notice generated from the
                correct inputs. It is often suitable for experienced landlords, agents, or
                users who already understand the wider possession process.
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                The Complete Eviction Pack is usually the stronger fit where the route
                still needs validating, the evidence needs organising, or the landlord
                wants broader support across notice, possession, and next-step planning.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In simple terms, use Notice Only where the route is already settled. Use
                the Complete Eviction Pack where the case still needs a more structured
                end-to-end workflow.
              </p>
            </Card>

            <CtaBand
              title="Choose the workflow that matches your case"
              body="If you mainly need the notice, start with Notice Only. If you want broader support from route validation through possession planning, choose the Complete Eviction Pack."
              primaryHref="/products/notice-only"
              primaryLabel="Start Notice Only"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />
          </div>
        </Container>
      </section>

      <section id="faqs" className="scroll-mt-24 py-2">
        <FAQSection faqs={faqs} title="Eviction Process England FAQs" />
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card title="Related Guides" id="related-guides">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords researching the eviction process in England often also need
                route-specific guidance on Section 21, Section 8, notice generation,
                possession planning, and the wider landlord workflow.
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
                  Section 21 notice guide: rules, timing, and validity checks
                </Link>
                <Link
                  href="/section-8-notice-guide"
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  Section 8 notice guide: grounds, timing, and evidence
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
                The eviction process in England works best when it is managed as a connected
                workflow rather than a sequence of rushed documents. Confirm the tenancy
                facts, choose the correct route, validate the file, and plan the next stage
                before notice is served.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                If the route is already clear and you mainly need the notice itself, start
                with Notice Only. If you want broader support around evidence, possession
                preparation, and next-step planning, start with the Complete Eviction Pack.
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
