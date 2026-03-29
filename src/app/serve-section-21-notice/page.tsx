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
import { generateMetadata } from '@/lib/seo';

const canonical = 'https://landlordheaven.co.uk/serve-section-21-notice';

const noticeOnlyProductLink = '/products/notice-only';
const completePackProductLink = '/products/complete-pack';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = generateMetadata({
  title: 'Serve a Section 21 Notice | Valid Service for Landlords',
  description:
    'Learn how to serve a Section 21 notice in England, preserve proof of service, avoid invalid notice mistakes, and protect the possession route.',
  path: '/serve-section-21-notice',
  type: 'article',
  keywords: [
    'serve section 21 notice',
    'form 6a service',
    'section 21 proof of service',
    'section 21 valid service',
    'section 21 notice',
    'landlord service guide',
  ],
});

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-serving-a-section-21-really-means', label: 'What serving a Section 21 really means' },
  { href: '#before-you-serve', label: 'Before you serve the notice' },
  { href: '#how-section-21-service-usually-works', label: 'How Section 21 service usually works' },
  { href: '#proof-of-service', label: 'Proof of service' },
  { href: '#what-landlords-should-check-on-form-6a', label: 'What landlords should check on Form 6A' },
  { href: '#when-landlords-get-into-trouble', label: 'When landlords get into trouble' },
  { href: '#timeline-after-service', label: 'Timeline after service' },
  { href: '#section-21-service-checklist', label: 'Section 21 service checklist' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'How do landlords usually serve a Section 21 notice in England?',
    answer:
      'Landlords usually serve a Section 21 notice by following the tenancy agreement service terms where appropriate, using Form 6A, choosing a sensible service method, and keeping clear evidence of what was served, when, and how.',
  },
  {
    question: 'Does serving a Section 21 notice mean the tenant has to leave immediately?',
    answer:
      'No. Serving the notice starts the formal notice stage. It does not by itself end the tenancy immediately or allow the landlord to change locks or recover possession without following the legal process.',
  },
  {
    question: 'What is the biggest mistake when serving a Section 21 notice?',
    answer:
      'One of the biggest mistakes is focusing only on the form and ignoring the service evidence. A correctly drafted notice can still create problems later if the landlord cannot show when and how it was actually served.',
  },
  {
    question: 'Do I need proof of service for a Section 21 notice?',
    answer:
      'Yes. Landlords should always keep proof of service. Even where the notice itself is correct, weak or unclear service evidence can create avoidable delay when the file moves toward court.',
  },
  {
    question: 'Can I email a Section 21 notice?',
    answer:
      'That depends on the tenancy terms and the wider service position. Landlords usually do best by choosing a service method that fits the tenancy paperwork and leaves stronger evidence rather than relying on convenience alone.',
  },
  {
    question: 'What happens after a Section 21 notice is served?',
    answer:
      'After service, the notice period runs. If the tenant does not leave voluntarily at the end of that period, the landlord may need to move to the court possession stage.',
  },
  {
    question: 'Should I use Notice Only or Complete Pack for a Section 21 case?',
    answer:
      'Notice Only is often the better fit where the landlord mainly needs the notice stage handled correctly. Complete Pack is usually stronger where the landlord wants broader support with route control, court preparation, and later possession planning.',
  },
  {
    question: 'Can a Section 21 notice fail because of service problems?',
    answer:
      'Yes. Even where the notice form itself looks fine, poor service method, bad dates, or weak evidence of delivery can cause delay and weaken the possession file.',
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
        pagePath="/serve-section-21-notice"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'How to Serve a Section 21 Notice',
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
          { name: 'Serve Section 21 Notice', url: canonical },
        ])}
      />

      <UniversalHero
        title="How to Serve a Section 21 Notice"
        subtitle="A practical landlord guide to valid service, proof of service, and avoiding notice-stage mistakes that later delay possession."
        primaryCta={{ label: 'View post-ban possession support', href: completePackProductLink }}
        secondaryCta={{ label: 'Read the Section 21 transition guide', href: '/section-21-ban-uk' }}
        mediaSrc="/images/wizard-icons/13-section-21.png"
        mediaAlt="Section 21 notice service guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains how landlords in England usually serve a Section 21 notice,
          what should be checked before service, how to preserve proof properly, and why
          a strong service record matters just as much as the form itself.
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
            <SeoPageContextPanel pathname="/serve-section-21-notice" />
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                Serving a Section 21 notice is not just about filling in Form 6A and
                sending it out. In practical terms, landlords usually need three things to
                line up at the same time: the Section 21 route must actually be available,
                the notice itself must be completed properly, and the service method must
                leave a clean evidence trail that still makes sense if the tenant does not
                leave and the file later reaches court.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Many service problems happen because landlords treat the notice and the
                proof of service as separate issues. They are not. A notice that is drafted
                correctly but served badly can still create delay. A notice that is served
                on the wrong date, through the wrong method, or without usable evidence can
                become much harder to rely on later.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The safest mindset is simple: serve the notice as if a judge may later need
                to understand exactly what happened without relying on memory. That means
                checking the tenancy facts first, using the right form, choosing a service
                method carefully, and preserving evidence of what was done, when it was
                done, and why that method was used.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get the best results when they treat
                Section 21 service as part of the wider possession workflow rather than as
                one isolated admin step.
              </p>
            </Card>

            <Card
              id="what-serving-a-section-21-really-means"
              title="What Serving a Section 21 Really Means"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A Section 21 notice is the formal no-fault notice route used by landlords
                in England where the tenancy and compliance position support it. But
                serving the notice does not by itself end the tenancy immediately and it
                does not give the landlord a right to recover possession without following
                the legal process. It is the notice stage of a larger route.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This matters because some landlords think of service as the whole job. In
                reality, service is only one part of a broader file. The file has to show
                that the Section 21 route was available, that the notice was completed
                properly, that the notice period was handled correctly, and that the notice
                was served in a way that can later be explained confidently.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good landlords therefore think about service in two layers. The first layer
                is legal route control: can Section 21 be used at all on these facts? The
                second layer is operational: if it can, what is the cleanest service method
                and what evidence will exist if the tenant later disputes receipt, date, or
                delivery method?
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, serving a Section 21 notice means starting a formal
                possession route properly, not just sending a document and hoping the
                tenant leaves.
              </p>
            </Card>

            <Card id="before-you-serve" title="Before You Serve the Notice">
              <p className="mt-4 leading-7 text-gray-700">
                Before a landlord serves Form 6A, the first question should be whether the
                Section 21 route is actually safe to use on the file as it stands. That is
                why service should never be treated as a simple delivery task. The service
                stage only works well when the route itself has already been checked.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This usually means checking the tenancy position, confirming the current
                tenancy facts, and making sure the landlord is not overlooking a blocker
                that would later make the notice harder to rely on. Even where the route is
                broadly available, landlords still need to be disciplined about dates and
                consistency. A correct route can still become a weak file if the notice is
                rushed or the wrong date logic is used.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                It is also worth deciding at this stage whether the landlord only needs the
                notice served properly or whether the wider case already needs broader route
                control. That distinction often affects whether Notice Only is enough or
                whether the landlord will later benefit from fuller support through court
                preparation and possession planning.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Confirm the Section 21 route is still the right route</li>
                <li>Check the tenancy and date position carefully</li>
                <li>Make sure Form 6A is being used correctly</li>
                <li>Decide which service method is strongest on the file</li>
                <li>Prepare to preserve service evidence before delivery happens</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the easiest notices to defend later are usually the ones
                that were prepared slowly enough to avoid basic route and date mistakes.
              </p>
            </Card>

            <Card
              id="how-section-21-service-usually-works"
              title="How Section 21 Service Usually Works"
            >
              <p className="mt-4 leading-7 text-gray-700">
                In most cases, landlords start by checking how the tenancy paperwork deals
                with notices and service. That does not mean blindly following one clause
                without thought. It means understanding what the tenancy says, what method
                is realistically available, and which method is likely to leave the clearest
                evidence if the case later moves into the possession stage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Some landlords focus too heavily on convenience and not enough on later
                proof. A convenient method is not always the strongest method. The better
                approach is usually the one that creates the clearest chain between the
                final notice document, the service date, and the evidence showing how it
                reached the tenant or the property.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Timing also matters. It is not enough to know roughly when the notice was
                sent. The file should show when it was served, how the date was chosen, and
                how the later notice period was calculated from that point. Date confusion
                at service stage often creates avoidable uncertainty later.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, good Section 21 service is usually calm, dated,
                documented, and deliberately built so the file will still make sense months
                later if the tenant does not leave.
              </p>
            </Card>

            <Card id="proof-of-service" title="Proof of Service">
              <p className="mt-4 leading-7 text-gray-700">
                Proof of service is often where otherwise decent Section 21 files become
                weaker. Landlords may have the right form, the right intention, and the
                right general route, but still fail to preserve enough evidence about what
                was actually served and when. That creates avoidable risk later because the
                possession file may end up depending on recollection instead of clear proof.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The best proof of service is usually simple and organised. It should make it
                easy to answer obvious later questions. What exact notice was served? On
                what date? By what method? To what address? What record exists showing that
                event? If the answer to any of those questions is fuzzy, the service stage
                usually needs tightening.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords also do best when they keep service evidence together with the
                final version of the notice and the date logic used for the notice period.
                That way the whole service record can be understood as one sequence rather
                than as scattered notes. Possession cases usually become easier when notice,
                date, and service proof all sit in one controlled part of the file.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Keep the final signed or finalised notice version</li>
                <li>Keep a dated record of the service method used</li>
                <li>Record the exact service date relied on</li>
                <li>Keep delivery or posting evidence where relevant</li>
                <li>Store everything together with the service chronology</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the notice is only half the story. The other half is
                being able to prove later that service happened properly.
              </p>
            </Card>

            <CtaBand
              title="Need the Section 21 notice stage handled properly before the file gets more expensive?"
              body="Notice Only is usually the better fit where the main issue is getting the Section 21 notice prepared and served correctly now. Complete Pack is usually stronger where the wider possession file, court preparation, or later enforcement planning also needs to be managed carefully."
              primaryHref={completePackProductLink}
              primaryLabel="View post-ban possession support"
              secondaryHref={noticeOnlyProductLink}
              secondaryLabel="Need broader support? Complete Pack"
            />

            <Card
              id="what-landlords-should-check-on-form-6a"
              title="What Landlords Should Check on Form 6A"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A Section 21 file can fail because the route was unavailable, because the
                date logic was weak, or because service proof was poor. But landlords
                should not overlook the obvious point either: the actual Form 6A still has
                to be completed carefully and consistently with the rest of the file.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This means checking names, address details, tenancy references where
                relevant, and the date logic used in the notice. It also means making sure
                the final version being served is the actual version kept in the file. One
                common practical problem is that a landlord ends up with multiple drafts,
                unclear edits, or uncertainty over which version was really sent.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually get better results when they treat the final notice like a
                court document from the moment it is generated. That means locking the final
                version, checking it against the tenancy facts, and making sure the rest of
                the service record refers back to that exact same notice rather than to a
                rough earlier draft.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, consistency is the key point. A strong Form 6A is not
                just one that looks complete in isolation. It is one that matches the rest
                of the tenancy and service chronology cleanly.
              </p>
            </Card>

            <Card
              id="when-landlords-get-into-trouble"
              title="When Landlords Get Into Trouble"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most Section 21 service problems do not come from one dramatic mistake.
                They usually come from a series of smaller decisions that make the file
                harder to rely on later. A landlord may rush the notice because the tenant
                relationship has deteriorated, rely on an untested delivery method because
                it feels convenient, or assume that basic notes will be enough if the case
                reaches court months later.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Treating the notice as an admin task only.</span>
                  <span className="block">
                    Service works best when it is planned as part of the wider possession file.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Using weak or unclear service evidence.</span>
                  <span className="block">
                    A landlord may later struggle to prove how and when the notice was served.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Rushing the date logic.</span>
                  <span className="block">
                    Bad date calculations at service stage often create later notice-period problems.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Relying on the wrong route assumptions.</span>
                  <span className="block">
                    Service cannot rescue a file where Section 21 should not have been used on those facts.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Failing to lock the final document version.</span>
                  <span className="block">
                    Draft confusion can create avoidable inconsistency later in the possession file.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually save more time by preventing notice
                resets than by trying to make service feel fast on the day.
              </p>
            </Card>

            <Card id="timeline-after-service" title="Timeline After Service">
              <p className="mt-4 leading-7 text-gray-700">
                Once a Section 21 notice has been served properly, the file moves into the
                notice-period stage. At that point the landlord’s task is usually to keep
                the chronology clean, preserve the service record, and be ready for the next
                step if the tenant does not leave voluntarily by the end of the notice
                period.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The key thing to remember is that service is not the end of the route. It
                is the point at which the rest of the route becomes possible. Landlords who
                use the notice period well often organise the evidence, check the file for
                consistency, and make sure the later possession stage will not be delayed by
                avoidable document problems.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="px-4 py-3 text-left font-semibold">What usually happens</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Notice served</td>
                      <td className="px-4 py-3">
                        Landlord serves Form 6A and locks the service evidence
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Notice period runs</td>
                      <td className="px-4 py-3">
                        Landlord tracks dates and prepares for the next step if needed
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Tenant leaves or stays</td>
                      <td className="px-4 py-3">
                        If the tenant remains, the case may move toward court possession
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Possession stage</td>
                      <td className="px-4 py-3">
                        Notice, service proof, and tenancy documents become central again
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, good landlords use the time after service to strengthen
                the wider possession file, not to forget about it until a problem appears.
              </p>
            </Card>

            <Card
              id="section-21-service-checklist"
              title="Section 21 Service Checklist"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The cleanest Section 21 files usually come from landlords who reduce the
                process to one disciplined checklist rather than relying on memory. Service
                problems often begin when the landlord thinks the file is simple and skips
                one or two basic controls that later turn out to matter.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Check Section 21 is the right route on the current facts</li>
                <li>Prepare the final Form 6A carefully and lock the final version</li>
                <li>Choose the service method deliberately, not casually</li>
                <li>Record the service date clearly</li>
                <li>Keep proof showing what was served and how</li>
                <li>Store the notice and proof together in one indexed part of the file</li>
                <li>Use the notice period to prepare the next stage of the possession route</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the strongest checklist is the one that turns later
                court questions into easy file answers.
              </p>
            </Card>

            <Card
              id="notice-only-vs-complete-pack"
              title="Notice Only vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords looking at Section 21 service are often deciding not just what to
                serve, but what level of help the case now needs. Some files are still
                basically notice-stage files. Others are already wider possession files
                where the service step is only one part of a bigger route problem.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the landlord mainly needs the
                Section 21 notice prepared and served correctly now. It tends to suit files
                where the route is already clear and the main immediate risk is getting the
                notice stage wrong.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the landlord wants broader
                support with route control, court preparation, possession planning, and
                later enforcement readiness. That tends to matter more where the tenancy
                history is messy, the commercial pressure is higher, or delay would be
                especially costly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Notice Only fits clearer first-step cases. Complete
                Pack fits Section 21 files where the wider possession workflow also needs
                to be controlled carefully.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Serve Section 21 Notice FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Section 21 service usually works best when the landlord treats the notice as
              part of one controlled possession file rather than as a one-off delivery
              event. That means checking the route first, locking the final notice version,
              choosing service carefully, and preserving proof in a way that will still be
              usable later.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The strongest Section 21 cases are often not the fastest-looking ones on day
              one. They are the ones least likely to need a restart because the route,
              notice, and service evidence all line up properly from the start.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If your main need is getting the Section 21 notice stage handled correctly,
              start with Notice Only. If the wider possession file also needs route control
              and court-stage preparation, start with Complete Pack.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={completePackProductLink}
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                View post-ban possession support
              </Link>
              <Link
                href={noticeOnlyProductLink}
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Legacy notice route only
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
