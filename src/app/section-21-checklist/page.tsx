import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
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

const canonical = 'https://landlordheaven.co.uk/section-21-checklist';
const noticeOnlyHref = '/products/notice-only';
const completePackHref = '/products/complete-pack';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Section 21 Checklist | Landlord Compliance, Service and Possession Readiness | LandlordHeaven',
  description:
    'A practical Section 21 checklist for landlords in England.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Section 21 Checklist | Landlord Compliance, Service and Possession Readiness | LandlordHeaven',
    description:
      'Plain-English guidance for landlords on Section 21 compliance, timing, service, and possession readiness before serving notice.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-this-checklist-is-for', label: 'What this checklist is for' },
  { href: '#before-you-serve-anything', label: 'Before you serve anything' },
  { href: '#core-section-21-checklist', label: 'Core Section 21 checklist' },
  { href: '#deposit-checks', label: 'Deposit checks' },
  { href: '#compliance-documents', label: 'Compliance documents' },
  { href: '#timing-and-form-6a', label: 'Timing and Form 6A' },
  { href: '#service-and-proof', label: 'Service and proof' },
  { href: '#how-landlords-usually-review-the-file', label: 'How landlords usually review the file' },
  { href: '#common-section-21-mistakes', label: 'Common Section 21 mistakes' },
  {
    href: '#eviction-timeline-and-common-delay-points',
    label: 'Eviction timeline and common delay points',
  },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What should landlords check before serving a Section 21 notice?',
    answer:
      'Landlords usually need to check route availability, tenancy timing, deposit handling, compliance documents, Form 6A details, and service evidence before serving a Section 21 notice.',
  },
  {
    question: 'Can a Section 21 notice be invalid even if the form looks right?',
    answer:
      'Yes. A notice can still fail because of missing compliance records, deposit issues, timing mistakes, or weak service proof even where Form 6A itself looks correct.',
  },
  {
    question: 'Is a Section 21 checklist mainly about compliance?',
    answer:
      'Not only. Compliance is central, but a strong checklist also covers timing, route suitability, form accuracy, and proof of service so the wider possession file remains usable later.',
  },
  {
    question: 'What is the biggest Section 21 mistake landlords make?',
    answer:
      'One of the biggest mistakes is assuming validity is only about the notice form. In practice, landlords often run into trouble because of earlier compliance issues or weak service evidence.',
  },
  {
    question: 'Should I check Section 21 validity before serving Form 6A?',
    answer:
      'Yes. Landlords usually do best when they audit the file before service rather than discovering a defect after the notice period has already run.',
  },
  {
    question: 'Does proof of service matter for a Section 21 checklist?',
    answer:
      'Yes. A landlord can have a compliant-looking notice but still face delay later if the file does not show clearly when and how the notice was served.',
  },
  {
    question: 'Can I use Section 21 during the first four months of a tenancy?',
    answer:
      'In most cases no. Timing still needs to be checked carefully before service because serving too early can invalidate the notice and force a restart.',
  },
  {
    question: 'Should I use Notice Only or Complete Pack for a Section 21 case?',
    answer:
      'Notice Only is usually the better fit where the route is already clear and the main need is getting the notice stage handled correctly. Complete Pack is usually stronger where the wider possession file and later court workflow also need support.',
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
        pagePath="/section-21-checklist"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 21 Checklist',
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
          { name: 'Section 21 Checklist', url: canonical },
        ])}
      />

      <UniversalHero
        title="Section 21 Checklist"
        subtitle="A practical landlord checklist for checking route safety, compliance, timing, and service before you serve Form 6A."
        primaryCta={{ label: 'Start Notice Only', href: noticeOnlyHref }}
        secondaryCta={{ label: 'Need full case continuity?', href: completePackHref }}
        mediaSrc="/images/wizard-icons/07-review-finish.png"
        mediaAlt="Section 21 checklist guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains what landlords in England usually check before serving
          a Section 21 notice, which documents matter most, what commonly causes
          invalid notices, and how to reduce avoidable resets later in the possession process.
        </p>
      </UniversalHero>

      <section className="bg-white py-8">
        <Container>
          <div className="mx-auto max-w-5xl">
            <SeoPageContextPanel pathname="/section-21-checklist" />
          </div>
        </Container>
      </section>

      <section className="border-b border-[#E6DBFF] bg-white py-8">
        <Container>
          <nav
            aria-labelledby="guide-links-heading"
            className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="mx-auto w-full max-w-[240px] shrink-0 md:mx-0">
                <Image
                  src="/images/section21-checklist.webp"
                  alt="Section 21 checklist illustration"
                  width={240}
                  height={240}
                  className="h-auto w-full rounded-xl"
                />
              </div>

              <div className="flex-1">
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
              </div>
            </div>
          </nav>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                A Section 21 checklist is not just a reminder to use Form 6A. In practical
                terms, it is a way of checking whether the whole route is safe before notice
                is served. Landlords usually need the tenancy timing, deposit record,
                compliance file, notice details, and service plan all to line up together.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The biggest mistake landlords make is treating the Section 21 route like a
                form-filling exercise. The stronger approach is usually the opposite. Audit
                the file first, then generate and serve the notice only once the route looks
                clean enough to rely on later.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This matters because most Section 21 problems do not appear on the day the
                notice is drafted. They usually appear later, once the tenant stays put and
                the file has to be relied on for possession. A missing document, bad date,
                weak service record, or uncertainty in the compliance history can suddenly
                become expensive at that stage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get the best results when they treat
                a Section 21 checklist as a route audit that protects the whole possession
                timeline, not just the notice stage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                If the wider transition position is still unclear, review the{' '}
                <Link href="/section-21-ban-uk" className="font-medium text-primary hover:underline">
                  Section 21 transition guide
                </Link>{' '}
                first, use the{' '}
                <Link href="/section-21-validity-checklist" className="font-medium text-primary hover:underline">
                  Section 21 validity checklist
                </Link>{' '}
                to audit the file, and then move into the{' '}
                <Link href={noticeOnlyHref} className="font-medium text-primary hover:underline">
                  Notice Only workflow
                </Link>{' '}
                once the route is ready to serve.
              </p>
            </Card>

            <Card
              id="what-this-checklist-is-for"
              title="What This Checklist Is For"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A Section 21 checklist is there to answer one practical question before the
                notice is served: is this route actually ready to use? That sounds simple,
                but it is often where avoidable delay begins. Landlords may be sure they
                want the property back and may already have a draft notice in mind, yet the
                route still depends on a wider compliance and timing position.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why a checklist works best when it covers the whole file rather than
                just the final notice. It should test whether the route is available, whether
                the tenancy is at the right stage, whether the key records are present, and
                whether the service plan is strong enough to make sense later if challenged.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good landlords usually use the checklist to prevent restarts rather than to
                diagnose failure after the fact. That is the commercial value of the page.
                A few minutes of disciplined file review before service can save far more
                time than trying to recover from an invalid or weak notice later.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, this checklist is a possession-readiness tool, not just
                a notice reminder.
              </p>
            </Card>

            <Card
              id="before-you-serve-anything"
              title="Before You Serve Anything"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Before a landlord even opens Form 6A, the first question should usually be
                whether Section 21 is still the right route on the facts. That means
                checking the tenancy history, the current objective, and the compliance
                position rather than assuming that no-fault possession is automatically the
                right answer in every case.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also where landlords should avoid relying on memory. A common pattern
                is that the landlord broadly remembers that the deposit was sorted out, that
                the right guide was given, or that the dates are probably fine. But broad
                confidence is not the same as a file that can carry a possession route later.
                Stronger cases are usually built on documents and dates, not recollection.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Check Section 21 is still the right route for the tenancy facts</li>
                <li>Confirm the tenancy timing carefully before notice generation</li>
                <li>Review the compliance file before serving anything</li>
                <li>Check whether the route is notice-stage only or needs broader control</li>
                <li>Plan service and proof before the final notice is produced</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually waste less time by slowing down here
                than by discovering a defect after the notice period has already run.
              </p>
            </Card>

            <Card
              id="core-section-21-checklist"
              title="Core Section 21 Checklist"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The strongest Section 21 files usually come from landlords who reduce the
                route to one disciplined checklist rather than treating the notice as an
                isolated event. The point is not to add more paperwork. The point is to make
                sure the file can answer the obvious later questions before the landlord
                commits to service.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A good checklist normally covers the route itself, the tenancy timing, the
                deposit position, the compliance records, Form 6A, and the service method.
                Section 21 usually fails as a chain problem. The landlord may have several
                things right and one thing wrong, but that one weak point can still force
                delay or a restart.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Is Section 21 available on the current tenancy facts?</li>
                <li>Is the tenancy at the right stage for service?</li>
                <li>Is the deposit position clean and evidenced properly?</li>
                <li>Are the key compliance documents available and clear?</li>
                <li>Is Form 6A completed consistently with the rest of the file?</li>
                <li>Are the dates correct and internally consistent?</li>
                <li>Is the service method sensible and provable?</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get a better notice by checking those
                points in sequence rather than by drafting first and auditing afterwards.
              </p>
            </Card>

            <Card id="deposit-checks" title="Deposit Checks">
              <p className="mt-4 leading-7 text-gray-700">
                Deposit history is one of the most common reasons a Section 21 file looks
                cleaner in conversation than it does on paper. Landlords often remember that
                the deposit was handled, but a possession file usually needs more than a
                general memory. It needs clarity and evidence.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is why a proper checklist usually asks not just whether the deposit was
                dealt with, but whether the file actually proves what happened and when. A
                deposit issue may feel administrative during the tenancy, but it can become
                route-threatening later if the record is weak, inconsistent, or incomplete.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually do best when they treat deposit checks
                as part of route eligibility, not as background admin. If the deposit record
                is uncertain, that uncertainty usually needs to be resolved before service
                rather than after notice expiry.
              </p>
            </Card>

            <Card id="compliance-documents" title="Compliance Documents">
              <p className="mt-4 leading-7 text-gray-700">
                Another common failure point is assuming that compliance documents matter
                only as general tenancy admin. In practice, for Section 21 work, they often
                become part of the route itself. Landlords usually need more than the
                documents in theory. They need a file that shows the documents clearly and
                in a way that can still be explained later.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Missing, inconsistent, or badly stored compliance records often create more
                difficulty than landlords expect because they do not always look like a
                problem until the notice is being reviewed for possession. That is why the
                stronger approach is to collect and audit these records first instead of
                trusting that they are probably somewhere.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get a cleaner Section 21 route when
                the core compliance records are brought into one indexed part of the file
                before notice generation begins.
              </p>
            </Card>

            <CtaBand
              title="Need the Section 21 route checked properly before you serve?"
              body="If the main issue is validating the Section 21 route and generating the notice safely, Notice Only is usually the better fit. If the wider possession workflow, next-step planning, or court continuity also needs support, Complete Pack is usually the stronger option."
              primaryHref={noticeOnlyHref}
              primaryLabel="Start Notice Only"
              secondaryHref={completePackHref}
              secondaryLabel="Need full case continuity?"
            />

            <Card id="timing-and-form-6a" title="Timing and Form 6A">
              <p className="mt-4 leading-7 text-gray-700">
                Timing is one of the most deceptively simple parts of the Section 21 route.
                Many landlords know the broad rule that the notice usually gives at least
                two months and that there are restrictions on serving too early, but broad
                awareness is not enough. The actual dates still need to work on the real
                tenancy facts.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Form 6A matters as well, but it is usually only one visible part of the
                wider validity question. The strongest file is not the one where the form
                merely looks complete. It is the one where the form, the tenancy dates, the
                compliance record, and the service plan all match each other without
                contradiction.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually benefit from checking the route dates
                twice: once before notice generation begins, and again against the final
                notice before service. That second check often catches avoidable inconsistencies.
              </p>
            </Card>

            <Card id="service-and-proof" title="Service and Proof">
              <p className="mt-4 leading-7 text-gray-700">
                A Section 21 notice can be compliant on paper and still cause delay if the
                service evidence is weak. This is why a Section 21 checklist should not stop
                at the notice document itself. The landlord usually also needs a clean
                service record showing what was served, when it was served, how it was
                served, and what proof exists for that sequence.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Many later disputes are practical rather than theoretical. The tenant may
                not challenge the whole legal framework. They may simply dispute receipt,
                date, or delivery method. If the file cannot answer those points clearly,
                the route often becomes slower than it needed to be.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually do best when they keep the final
                notice, the service method, and the service proof together in one part of
                the file so the story is easy to follow later.
              </p>
            </Card>

            <Card
              id="how-landlords-usually-review-the-file"
              title="How Landlords Usually Review the File"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A good Section 21 checklist usually works like an audit rather than a quick
                form review. The landlord or adviser gathers the tenancy agreement, deposit
                records, compliance documents, intended dates, and service assumptions, then
                checks whether the whole file tells one coherent story.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is often where landlords discover that a file is stronger or weaker
                than they thought. Some tenancies feel messy emotionally but are legally
                clean. Others feel simple in conversation but turn out to contain one or two
                document weaknesses that need sorting before service.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, a useful review asks one simple question: if this file
                had to be relied on later, could someone unfamiliar with the tenancy
                understand the route from the documents alone? If not, the checklist has
                done its job by exposing that before service.
              </p>
            </Card>

            <Card
              id="common-section-21-mistakes"
              title="Common Section 21 Mistakes"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most invalid or weak Section 21 files do not fail because of one dramatic
                event. They usually fail because one or two quiet weaknesses were not caught
                in time. That is why a checklist approach usually performs better than a
                rush-to-serve approach.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Serving too early.</span>
                  <span className="block">
                    A notice served at the wrong stage of the tenancy can force a full restart.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Weak compliance records.</span>
                  <span className="block">
                    A landlord may believe the documents were given but still struggle to
                    prove that from the file.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Deposit uncertainty.</span>
                  <span className="block">
                    Deposit history often looks simpler than it really is until it is audited properly.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Date inconsistencies.</span>
                  <span className="block">
                    Even small date errors can create disproportionate delay later.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Poor service proof.</span>
                  <span className="block">
                    A good notice with weak service evidence can still become a bad possession file.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually save more time by preventing these
                mistakes before service than by trying to fix them after notice expiry.
              </p>
            </Card>

            <Card
              id="eviction-timeline-and-common-delay-points"
              title="Eviction Timeline and Common Delay Points"
            >
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#E6DBFF] bg-white">
                <Image
                  src="/images/eviction-timeline.webp"
                  alt="Eviction timeline England guide"
                  width={1920}
                  height={1080}
                  className="h-auto w-full"
                />
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                For timing expectations, use the eviction timeline England guide. Court
                backlogs are outside your control, but notice validity and service quality
                are not.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why landlords usually benefit from treating the Section 21 checklist
                as more than a compliance exercise. A clean route at the start often saves
                more time than trying to repair a weak notice later. If the notice is
                invalid, the service record is poor, or the dates were calculated badly, the
                case can lose momentum before it even reaches the court stage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, some delay points are built into the wider system and
                cannot be accelerated by the landlord. Others are fully avoidable. Landlords
                usually have the most control over the quality of the notice file, the
                strength of service evidence, the consistency of the compliance record, and
                whether the route was audited properly before Form 6A was served.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Invalid notice dates or weak timing logic</li>
                <li>Missing or inconsistent compliance records</li>
                <li>Poor proof of service</li>
                <li>Deposit uncertainty not resolved before service</li>
                <li>Rushed route choice that should have been checked earlier</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords cannot control court backlogs, but they can
                control whether the case enters the system with a cleaner file. That is
                often the difference between a route that moves forward and a route that
                needs to be restarted.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/eviction-timeline-england"
                  className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                >
                  View Eviction Timeline England Guide
                </Link>
              </div>
            </Card>

            <Card
              id="notice-only-vs-complete-pack"
              title="Notice Only vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords researching a Section 21 checklist are often deciding not just
                whether the route is valid, but how much support the wider file now needs.
                Some cases are still straightforward notice-stage cases. Others are already
                broader possession cases where route control, next-step planning, and court
                continuity also matter.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the main need is validating the
                Section 21 route and handling the notice stage correctly. It tends to suit
                cases where the wider route is already broadly understood and the main risk
                is an avoidable notice-stage error.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the landlord wants broader
                help with route control, court preparation, possession planning, and a file
                that may become more complex once the notice is served. It is often the
                better fit where the tenancy history is messier or the commercial cost of
                delay is higher.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, choose Notice Only where the issue is mainly the notice.
                Choose Complete Pack where the wider possession workflow also needs support.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Section 21 Checklist FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Before serving a Section 21 notice, check the route, review the compliance
              file, confirm the dates, and plan proof of service. That preparation usually
              determines whether the possession route later feels controlled or expensive.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The strongest outcomes usually come from landlords who do not treat Section 21
              as a last-minute form task. They treat it as a structured file review that
              reduces invalid notices, restarts, and wasted notice periods.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If your route is already broadly clear and you mainly need the notice stage
              handled correctly, start with Notice Only. If you want broader continuity
              across the possession workflow, start with Complete Pack.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={noticeOnlyHref}
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                Start Notice Only
              </Link>
              <Link
                href={completePackHref}
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Need full case continuity?
              </Link>
              <Link
                href="/eviction-notice"
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Start eviction notice pack
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
