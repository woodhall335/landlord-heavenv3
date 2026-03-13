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
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';

const canonical = 'https://landlordheaven.co.uk/section-21-validity-checklist';

const noticeOnlyWizardLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_section_21_validity_checklist',
  topic: 'eviction',
});

const completePackWizardLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo_section_21_validity_checklist',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title:
    'Section 21 Validity Checklist | Landlord Compliance and Proof Guide | LandlordHeaven',
  description:
    'A practical Section 21 validity checklist for landlords in England. Learn what must be checked before serving Form 6A, which compliance documents matter, what commonly makes a notice invalid, and how to reduce possession delays.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Section 21 Validity Checklist | Landlord Compliance and Proof Guide | LandlordHeaven',
    description:
      'Plain-English guidance for landlords on checking Section 21 validity before service, including compliance, dates, proof, and common failure points.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-section-21-validity-really-means', label: 'What Section 21 validity really means' },
  { href: '#before-you-even-think-about-serving', label: 'Before you even think about serving' },
  { href: '#section-21-validity-checklist-core', label: 'Core validity checklist' },
  { href: '#deposit-and-prescribed-information', label: 'Deposit and prescribed information' },
  { href: '#gas-safety-epc-how-to-rent', label: 'Gas safety, EPC and How to Rent' },
  { href: '#timing-and-form-6a', label: 'Timing and Form 6A' },
  { href: '#service-and-proof', label: 'Service and proof' },
  { href: '#how-landlords-usually-audit-the-file', label: 'How landlords usually audit the file' },
  { href: '#common-failure-points', label: 'Common failure points' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What makes a Section 21 notice valid?',
    answer:
      'A Section 21 notice is usually only reliable where the tenancy facts, compliance documents, timing, form, and service position all line up properly. Landlords often focus on the form itself, but the wider compliance file usually matters just as much.',
  },
  {
    question: 'Can a Section 21 notice be invalid even if Form 6A looks correct?',
    answer:
      'Yes. A notice can still fail because of deposit issues, missing prescribed information, missing gas safety or EPC records, timing mistakes, or weak proof of service.',
  },
  {
    question: 'Should I check validity before serving a Section 21 notice?',
    answer:
      'Yes. Landlords usually do best when they audit the validity position before service rather than discovering a defect after the notice period has run.',
  },
  {
    question: 'Does proof of service matter for Section 21 validity?',
    answer:
      'Yes. A landlord may have a compliant notice on paper but still face delay if there is weak or unclear evidence showing when and how the notice was served.',
  },
  {
    question: 'What is the biggest Section 21 validity mistake?',
    answer:
      'One of the biggest mistakes is assuming validity is only about the final notice document. In practice, many failures come from the earlier compliance file rather than from the wording of Form 6A itself.',
  },
  {
    question: 'Can I use a Section 21 notice during the first four months of a tenancy?',
    answer:
      'In most cases no. Landlords usually need to check the tenancy timing carefully because serving too early can invalidate the notice and force a restart.',
  },
  {
    question: 'Should I use Notice Only or Complete Pack for a Section 21 validity issue?',
    answer:
      'Notice Only is usually the better fit where the route is already clear and the main need is getting the notice stage handled correctly. Complete Pack is usually stronger where the wider possession file, route choice, or court preparation also needs support.',
  },
  {
    question: 'Is a Section 21 validity checklist mainly about forms or strategy?',
    answer:
      'It is about both. The form matters, but validity is really a file-quality issue. Landlords usually get better outcomes when the compliance file, dates, and service evidence are planned together rather than checked in isolation.',
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
        pagePath="/section-21-validity-checklist"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 21 Validity Checklist',
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
          { name: 'Section 21 Validity Checklist', url: canonical },
        ])}
      />

      <StructuredData data={faqPageSchema(faqs)} />

      <UniversalHero
        title="Section 21 Validity Checklist"
        subtitle="Audit your compliance file before service so you do not lose time, money, and possession momentum to an avoidable invalid notice."
        primaryCta={{ label: 'Start Notice Only', href: noticeOnlyWizardLink }}
        secondaryCta={{ label: 'Get full case continuity', href: completePackWizardLink }}
        mediaSrc="/images/wizard-icons/07-review-finish.png"
        mediaAlt="Section 21 validity checklist guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains what landlords in England usually check before serving
          Form 6A, which compliance records matter most, what commonly makes a Section 21
          notice invalid, and how to turn a messy tenancy file into a cleaner possession file.
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
                A valid Section 21 notice is usually not won or lost on Form 6A alone. In
                practical terms, landlords need the whole file to line up. That usually means
                the tenancy must be at the right stage, the compliance record must be clean,
                the form itself must be correct, and the notice must be served in a way that
                can still be proved later if the tenant does not leave.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The mistake many landlords make is treating validity as a box-ticking task
                that happens after they have already decided to serve. The stronger approach
                is the opposite. Audit validity first. If the route is safe, then generate
                and serve the notice. If the route is not safe, fix the problem or rethink the
                wider possession strategy before the notice goes out.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The biggest time saver in Section 21 work is not speed on the day of service.
                It is preventing a restart later. That is why a proper validity checklist
                matters so much. It reduces the chance that a landlord reaches the court stage
                only to discover that a deposit problem, missing compliance record, date error,
                or weak proof of service has already undermined the route.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get the best results when they treat
                Section 21 validity as a file audit, not just a notice-generation step.
              </p>
            </Card>

            <Card
              id="what-section-21-validity-really-means"
              title="What Section 21 Validity Really Means"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Section 21 validity is often talked about as though it were a single yes or
                no answer. In practice, it is more like a chain. The route only works well
                where several separate links are all strong enough at the same time. The
                tenancy type has to fit. The timing has to work. The compliance history has
                to support the route. The form has to be completed properly. The service
                position has to be clear. If one of those links is weak, the whole route can
                become much harder to rely on later.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is why validity questions should usually be asked before service, not
                after. Once the notice has gone out, landlords are already exposed to the
                risk of wasted time if the route turns out to be weak. A compliance defect
                discovered later can be more expensive than a compliance defect discovered
                before the notice is even generated.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good landlords therefore treat validity in two layers. The first layer is
                route availability: can Section 21 actually be used on these facts? The
                second layer is route reliability: if it can be used, is the file clean
                enough that the notice is likely to stand up later?
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, a valid Section 21 notice is usually the result of good
                preparation earlier in the tenancy, not just good drafting on the day.
              </p>
            </Card>

            <Card
              id="before-you-even-think-about-serving"
              title="Before You Even Think About Serving"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Before a landlord even starts looking at Form 6A, the first question should
                be whether the Section 21 route is the right route on the current facts. That
                means stepping back from the immediate problem and asking whether the tenancy
                file actually supports a no-fault possession route. In some cases the answer
                is yes and the next step is simply a validity audit. In other cases the file
                may already be pointing toward a different route, a different timing decision,
                or a wider possession strategy.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also the point where landlords should avoid drifting into assumptions.
                A tenancy that feels straightforward may still have technical issues hidden in
                the paperwork. A landlord may believe the deposit was handled properly, that
                the right guide was given, or that the dates are safe, but belief is not the
                same as a court-ready file. The stronger approach is to verify each critical
                point from documents, dates, and records.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Check that Section 21 is still the right route on the facts</li>
                <li>Confirm the tenancy timing and status carefully</li>
                <li>Review the compliance file before generating notice documents</li>
                <li>Check the service plan before the notice is finalised</li>
                <li>Decide whether the case only needs notice support or broader route control</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually save more time by pausing here than by
                moving quickly into notice generation with an uncertain file.
              </p>
            </Card>

            <Card
              id="section-21-validity-checklist-core"
              title="Core Section 21 Validity Checklist"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A strong Section 21 validity audit usually works best when it is reduced to
                one disciplined checklist rather than a vague sense that the paperwork is
                probably fine. The point of the checklist is not to create more admin. It is
                to stop the landlord, adviser, or team member from missing the one issue that
                later becomes expensive.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The checklist should normally cover the route itself, the tenancy timing, the
                compliance documents, the deposit position, the actual notice document, and
                the planned service evidence. Each part matters because Section 21 usually
                fails as a chain problem. The landlord may have six things right and one thing
                wrong, but that one weak link can still destabilise the whole file.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Is Section 21 actually available on the tenancy facts?</li>
                <li>Is the tenancy at the right stage for service?</li>
                <li>Has the deposit position been handled and evidenced properly?</li>
                <li>Are the required compliance records available and dated clearly?</li>
                <li>Is Form 6A the correct form and version for the case?</li>
                <li>Are the notice dates accurate and internally consistent?</li>
                <li>Is the service method sensible and provable?</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get a stronger possession file by
                working through those points in order instead of jumping straight to the
                final notice document.
              </p>
            </Card>

            <Card
              id="deposit-and-prescribed-information"
              title="Deposit and Prescribed Information"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Deposit issues are one of the most common reasons landlords discover that a
                Section 21 route is weaker than they thought. That is because the deposit is
                not just a money-handling issue. It often becomes a notice-validity issue as
                well. If the deposit history is unclear, incomplete, or poorly evidenced, the
                landlord may later face an avoidable challenge even if the rest of the file
                looks clean.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why landlords usually need more than a general memory that the deposit
                was sorted out. They need a file that shows what happened, when it happened,
                and what evidence exists to support that position. A weak deposit record often
                becomes more visible once the case is being reviewed for court rather than for
                everyday tenancy management.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, a good validity check asks simple questions. Was the
                deposit dealt with correctly? Is the prescribed information position clear?
                Can those points be supported from the file rather than from memory? If the
                answer to any of those questions is uncertain, the landlord usually needs to
                stop and resolve that uncertainty before serving notice.
              </p>
            </Card>

            <Card
              id="gas-safety-epc-how-to-rent"
              title="Gas Safety, EPC and How to Rent"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Another common validity problem is assuming that compliance documents only
                matter as general tenancy admin. In reality, for Section 21 work, those
                documents often become part of the route itself. Landlords usually need a
                clear record showing that the relevant documents were given properly and that
                the record is capable of being explained later if challenged.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is one of the reasons Section 21 feels document-sensitive compared with
                some other routes. The issue is not only whether a landlord broadly complied.
                The issue is whether the file shows that compliance clearly enough. Missing,
                inconsistent, or badly stored records often create more trouble than landlords
                expect because they raise uncertainty at exactly the point where the route
                needs certainty.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually do best when they gather these records
                into one part of the file before notice generation starts. That makes the
                route easier to audit and reduces the chance that a later court-stage review
                reveals a document problem that could have been found earlier.
              </p>
            </Card>

            <CtaBand
              title="Need the Section 21 notice stage checked properly before you serve?"
              body="If your main issue is validating the Section 21 route and generating the notice correctly, Notice Only is usually the better fit. If the wider possession file, next-step planning, or route control also needs attention, Complete Pack is usually the stronger option."
              primaryHref={noticeOnlyWizardLink}
              primaryLabel="Start Notice Only"
              secondaryHref={completePackWizardLink}
              secondaryLabel="Get full case continuity"
            />

            <Card
              id="timing-and-form-6a"
              title="Timing and Form 6A"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Timing is one of the most deceptively simple parts of Section 21 validity.
                Many landlords know broadly that the notice usually requires at least two
                months and that there are restrictions on serving too early, but broad
                awareness is not enough. The dates still need to be checked carefully on the
                actual tenancy facts. A route that is legally available in principle can still
                be weakened by poor date control in practice.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The same is true of Form 6A. Landlords often think of the form as the main
                Section 21 task, but the form is really only one visible part of the wider
                validity question. The stronger file is the one where the form, the tenancy
                dates, the compliance documents, and the service plan all match each other
                without contradiction.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually benefit from checking the dates twice:
                first at the route-review stage, and again against the final notice before it
                is served. That second check often catches avoidable inconsistencies that
                would otherwise survive into the possession file.
              </p>
            </Card>

            <Card
              id="service-and-proof"
              title="Service and Proof"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A Section 21 notice can be legally sound on paper and still cause delay if
                the service evidence is weak. That is why validity and service should not be
                treated as separate topics. The landlord does not just need a compliant
                notice. The landlord usually also needs a clean service record showing what
                was served, when it was served, how it was served, and what proof exists.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is especially important because many later disputes are practical rather
                than theoretical. The tenant may not argue about the whole legal framework.
                They may simply dispute receipt, date, or delivery method. If the file does
                not answer those questions clearly, avoidable delay becomes more likely.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually do best when they keep the final notice,
                the service method, and the service proof together in one controlled part of
                the file. That way the file tells one consistent story rather than forcing the
                landlord to reconstruct events later from scattered notes.
              </p>
            </Card>

            <Card
              id="how-landlords-usually-audit-the-file"
              title="How Landlords Usually Audit the File"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Good validity checking usually works like an audit rather than like a rushed
                form review. The landlord or adviser gathers the tenancy agreement, compliance
                records, deposit documents, service assumptions, and intended notice dates,
                then checks each part against the others. The goal is not just to see whether
                each document exists. The goal is to see whether the whole story is coherent.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is often where landlords discover that the file is stronger or weaker
                than they thought. Some cases feel complicated emotionally but are legally
                tidy. Others feel simple in conversation but become messy once the actual
                records are reviewed. A calm audit helps separate those two things.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, a useful audit usually asks: what would a judge or court
                reviewer need to understand later, and can the file answer that now? If the
                answer is no, the audit has done its job by exposing the weakness before
                service rather than after expiry.
              </p>
            </Card>

            <Card
              id="common-failure-points"
              title="Common Failure Points"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most invalid Section 21 notices do not fail because of one dramatic mistake
                alone. They usually fail because the file contains one or two quiet weak
                points that nobody checked carefully enough before service. Those weak points
                are often avoidable, which is why the checklist approach is so valuable.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Serving too early.</span>
                  <span className="block">
                    A notice that goes out at the wrong stage of the tenancy can force a
                    complete restart.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Missing or weak compliance records.</span>
                  <span className="block">
                    A landlord may believe the documents were provided but still struggle to
                    prove that cleanly from the file.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Deposit uncertainty.</span>
                  <span className="block">
                    The deposit history may look straightforward until the route is audited
                    properly.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Date inconsistencies.</span>
                  <span className="block">
                    Even small date mistakes can create disproportionate delay later.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Weak service proof.</span>
                  <span className="block">
                    A good notice with poor service evidence can still become a bad possession file.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually save more time by preventing these
                failure points than by trying to fix them after the notice period has already run.
              </p>
            </Card>

            <Card
              id="notice-only-vs-complete-pack"
              title="Notice Only vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords researching a Section 21 validity checklist are often not just
                asking whether the notice can be generated. They are really asking how much
                support the wider file now needs. Some cases are still straightforward
                notice-stage files. Others are already broader possession files where route
                choice, next-step planning, and court-readiness also matter.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the main need is to validate the
                Section 21 route and generate the notice correctly. It tends to suit cases
                where the landlord already understands the route broadly and mainly needs the
                notice stage controlled properly.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the landlord wants broader
                help with route control, possession planning, court preparation, or a file
                that may become more complex once the notice is served. It is often the
                better option where the tenancy history is messier or the commercial cost of
                delay is higher.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, choose Notice Only where the issue is mainly the notice.
                Choose Complete Pack where the wider possession workflow also needs attention.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Section 21 Validity Checklist FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Before serving a Section 21 notice, audit the route, check the compliance
              file, confirm the dates, and plan proof of service. That preparation usually
              determines whether the possession route later feels controlled or expensive.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The strongest outcomes usually come from landlords who do not treat Section 21
              validity as a last-minute form check. They treat it as a structured file audit
              that reduces invalid notices, restarts, and wasted notice periods.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If your route is already broadly clear and you mainly need the notice stage
              handled correctly, start with Notice Only. If you want broader continuity
              across the possession workflow, start with Complete Pack.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={noticeOnlyWizardLink}
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                Start Notice Only
              </Link>
              <Link
                href={completePackWizardLink}
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Get full case continuity
              </Link>
              <Link
                href="/tools/validators/section-21"
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Use Section 21 Validity Checker
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}