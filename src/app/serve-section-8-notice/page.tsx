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

const canonical = 'https://landlordheaven.co.uk/serve-section-8-notice';

const noticeOnlyProductLink = '/products/notice-only';
const completePackProductLink = '/products/complete-pack';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = generateMetadata({
  title: 'Serve a Section 8 Notice 2026 | England Landlord Guide',
  description:
    'Learn how to serve a Section 8 notice in England, choose the right grounds, preserve service evidence, prepare arrears or breach records, and avoid notice-stage mistakes that weaken possession claims.',
  path: '/serve-section-8-notice',
  type: 'article',
  keywords: [
    'serve section 8 notice',
    'section 8 service guide',
    'form 3 service',
    'section 8 grounds',
    'section 8 evidence',
    'section 8 rent arrears',
    'how to serve section 8 notice',
    'section 8 notice england',
    'ground 8 10 11 rent arrears',
    'section 8 notice proof of service',
  ],
});

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-serving-a-section-8-really-means', label: 'What serving a Section 8 really means' },
  { href: '#grounds-matter-first', label: 'Why the grounds matter first' },
  { href: '#before-you-serve', label: 'Before you serve' },
  { href: '#how-section-8-service-usually-works', label: 'How Section 8 service usually works' },
  { href: '#evidence-landlords-should-prepare', label: 'Evidence landlords should prepare' },
  { href: '#ground-8-10-11-rent-arrears', label: 'Grounds 8, 10 and 11 for rent arrears' },
  { href: '#service-methods-and-proof', label: 'Service methods and proof' },
  { href: '#when-landlords-get-into-trouble', label: 'When landlords get into trouble' },
  { href: '#timeline-after-service', label: 'Timeline after service' },
  { href: '#section-8-service-checklist', label: 'Section 8 service checklist' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'How do landlords usually serve a Section 8 notice in England?',
    answer:
      'Landlords usually serve a Section 8 notice by selecting the correct grounds first, completing Form 3 carefully, choosing a sensible service method, and keeping clear proof of what was served, when, and how.',
  },
  {
    question: 'What is the biggest mistake when serving a Section 8 notice?',
    answer:
      'One of the biggest mistakes is focusing only on the notice form and not on the evidence behind the grounds. A correctly served notice can still create problems later if the landlord cannot prove the alleged breach properly.',
  },
  {
    question: 'Do I need proof of service for a Section 8 notice?',
    answer:
      'Yes. Landlords should keep proof of service for a Section 8 notice. Clear service evidence helps show when the notice was delivered and supports the later possession file if the tenant does not leave.',
  },
  {
    question: 'What grounds are commonly used on a Section 8 notice for rent arrears?',
    answer:
      'For rent arrears, landlords commonly rely on Grounds 8, 10 and 11. Ground 8 is mandatory if the arrears threshold is met at service and at the hearing, while Grounds 10 and 11 are discretionary.',
  },
  {
    question: 'Can a Section 8 notice fail because of bad evidence?',
    answer:
      'Yes. A Section 8 case often turns on evidence quality. Weak arrears schedules, missing records, unclear witness material, or poor service proof can all make the possession route harder.',
  },
  {
    question: 'What happens after a Section 8 notice is served?',
    answer:
      'After service, the relevant notice period runs. If the tenant does not resolve the issue or leave, the landlord may need to move to the court possession stage and prove the grounds relied upon.',
  },
  {
    question: 'Should I use Notice Only or Complete Pack for a Section 8 case?',
    answer:
      'Notice Only is usually the better fit where the main need is getting the notice stage handled properly. Complete Pack is usually stronger where the landlord wants broader route control, court preparation, and possession-stage support.',
  },
  {
    question: 'Can I use Section 8 and Section 21 together?',
    answer:
      'In some England cases landlords serve both routes together where appropriate. But each route still has to stand on its own, with its own compliance, notice, and service logic.',
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
        pagePath="/serve-section-8-notice"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'How to Serve a Section 8 Notice',
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
          { name: 'Serve Section 8 Notice', url: canonical },
        ])}
      />

      <UniversalHero
        title="How to Serve a Section 8 Notice"
        subtitle="This guide shows how landlords serve a Section 8 notice properly by choosing the right grounds first, handling service carefully, and keeping the evidence file in shape for court."
        primaryCta={{ label: 'View Section 8 notice pack', href: noticeOnlyProductLink }}
        secondaryCta={{ label: 'Read the Section 8 grounds guide', href: '/section-8-grounds-explained' }}
        mediaSrc="/images/wizard-icons/14-section-8.png"
        mediaAlt="Section 8 notice service guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains how landlords in England usually serve a Section 8 notice,
          what should be checked before service, what evidence matters most, and why
          the grounds behind the notice are often more important than the act of service itself.
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
            <SeoPageContextPanel pathname="/serve-section-8-notice" />
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                Serving a Section 8 notice is not just about filling in Form 3 and sending
                it out. In practical terms, landlords usually need four things to line up at
                the same time: the Section 8 route must actually fit the facts, the correct
                grounds must be chosen, the notice itself must be completed properly, and
                the evidence behind the grounds must still be strong enough if the case later
                reaches court.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is what makes Section 8 different from more procedural notice routes.
                A landlord is not just proving that a notice was served. The landlord is also
                preparing to prove that the tenant breached the tenancy in a way that supports
                possession. So service matters, but evidence quality usually matters just as much.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The safest mindset is simple: prepare the Section 8 file as if a judge may later
                need to understand the whole story from the papers alone. That means checking the
                grounds carefully, using the correct notice period, preserving proof of service,
                and keeping the evidence bundle clear from the start.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get the best results when they treat Section 8
                service as part of one wider possession file rather than as a one-off admin task.
              </p>
            </Card>

            <Card
              id="what-serving-a-section-8-really-means"
              title="What Serving a Section 8 Really Means"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A Section 8 notice is the formal grounds-based possession route used by landlords
                in England when the tenant has allegedly breached the tenancy agreement or where
                another statutory ground applies. Unlike a no-fault route, Section 8 always depends
                on reasons. The landlord has to identify the grounds, state them properly, and later
                prove them if the tenant does not leave.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That means service is only one part of the job. A Section 8 file also has to show
                that the chosen grounds fit the real facts, that the notice period matches the grounds
                being used, and that the documentary record is good enough to support the case if a
                possession hearing follows.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good landlords therefore think about Section 8 in two layers. The first layer is
                legal route control: which grounds are actually available, and are they strong enough?
                The second layer is operational: how should the notice be prepared, served, and evidenced
                so the file still makes sense later?
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, serving a Section 8 notice means starting a court-facing breach case,
                not just delivering a document.
              </p>
            </Card>

            <Card id="grounds-matter-first" title="Why the Grounds Matter First">
              <p className="mt-4 leading-7 text-gray-700">
                Most Section 8 delay comes from weak ground selection rather than weak delivery alone.
                If the landlord picks the wrong grounds, overstates the problem, or fails to match the
                ground to the evidence, the notice can become much harder to rely on later. This is why
                service should never be treated as the first question. The first question is usually:
                what exactly am I alleging, and can I prove it?
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In rent arrears cases, landlords often rely on Grounds 8, 10 and 11 together because
                they serve different purposes. In other files, the issue may be damage, anti-social
                behaviour, or breach of tenancy terms. Each kind of case needs its own evidence logic.
                A grounds-based notice is only as strong as the factual material supporting it.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also where realism matters. Some landlords are tempted to throw in every ground
                that sounds available. That is not always the strongest route. The stronger approach is
                usually the one where the chosen grounds fit the file cleanly and can be explained simply.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the notice usually works best when the grounds are narrow enough to
                prove and broad enough to protect the landlord if one part of the case later weakens.
              </p>
            </Card>

            <Card id="before-you-serve" title="Before You Serve the Notice">
              <p className="mt-4 leading-7 text-gray-700">
                Before a landlord serves Form 3, the first task is normally checking whether the Section 8
                route is actually ready to use on the current facts. That means confirming the tenancy
                details, checking the breach chronology, reviewing the evidence already available, and
                making sure the notice period will be correct for the grounds being relied on.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords should also decide whether they are dealing with a simple
                notice-stage file or a broader possession file that already needs fuller control. That
                distinction often affects whether Notice Only is enough or whether the wider case would
                benefit from broader route and court-stage support.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Confirm Section 8 is the right route on the current facts</li>
                <li>Choose the correct grounds carefully</li>
                <li>Check the notice period required for those grounds</li>
                <li>Prepare the evidence before service happens</li>
                <li>Use the prescribed Form 3 consistently with the rest of the file</li>
                <li>Plan proof of service before delivery takes place</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the easiest Section 8 cases to run later are usually the ones
                prepared slowly enough to avoid basic ground, date, and evidence mistakes at the notice stage.
              </p>
            </Card>

            <Card
              id="how-section-8-service-usually-works"
              title="How Section 8 Service Usually Works"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Once the grounds and evidence position are checked, landlords usually move to the service
                stage by finalising Form 3, confirming the date logic, and choosing a service method that
                fits the tenancy paperwork and leaves a clear trail. A convenient method is not always the
                strongest method. The better service method is usually the one that creates the cleanest
                record if later challenged.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Date control matters here as well. It is not enough to know that the notice was sent at
                some point. The landlord should be able to explain what date was treated as service, why
                that date was used, and how the later notice period was calculated from it. Date confusion
                at this stage often creates avoidable trouble later.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords also do best when they keep the final served version of the notice together with
                the service proof and the key evidence supporting the grounds. That creates one cleaner
                chronology for the later possession stage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, good Section 8 service is usually calm, dated, documented, and tied
                closely to the wider evidence file.
              </p>
            </Card>

            <Card
              id="evidence-landlords-should-prepare"
              title="Evidence Landlords Should Prepare"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 claims often succeed or fail on evidence quality. That is because the court is
                not simply checking whether the notice exists. It is considering whether the alleged breach
                is actually proved. So the strongest landlords usually build the evidence pack before service,
                not after problems appear.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The exact evidence depends on the grounds used, but the logic is usually the same. The file
                should show what happened, when it happened, how it breached the tenancy or statutory ground,
                and what documents support that account.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Tenancy agreement and relevant clauses</li>
                <li>Rent schedule and payment records where arrears are involved</li>
                <li>Correspondence with the tenant about the issue</li>
                <li>Photos, reports, or inspection notes where relevant</li>
                <li>Witness statements or incident records for behaviour-based grounds</li>
                <li>Proof of service for the notice itself</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the better the evidence is organised before service, the less likely
                the landlord is to need a rushed rebuild when the matter escalates to court.
              </p>
            </Card>

            <CtaBand
              title="Need the Section 8 notice stage handled properly before the file gets more expensive?"
              body="Notice Only is usually the better fit where the main issue is getting the Section 8 notice prepared and served correctly now. Complete Pack is usually stronger where the wider possession file, court preparation, or later enforcement planning also needs to be managed carefully."
              primaryHref={noticeOnlyProductLink}
              primaryLabel="View Section 8 Notice Pack"
              secondaryHref={completePackProductLink}
              secondaryLabel="Need broader support? Complete Pack"
            />

            <Card
              id="ground-8-10-11-rent-arrears"
              title="Grounds 8, 10 and 11 for Rent Arrears"
            >
              <p className="mt-4 leading-7 text-gray-700">
                In arrears cases, landlords often rely on Grounds 8, 10 and 11 together because each
                one helps in a different way. Ground 8 is the best-known arrears ground because it is
                mandatory if the threshold is met, but it is also vulnerable if the arrears drop before
                the hearing. Grounds 10 and 11 are discretionary, so they do not create the same automatic
                position, but they often provide useful backup if the tenant pays down some of the debt.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why clear arrears records matter so much. The landlord needs one clean rent schedule
                showing what was due, what was paid, and what remained outstanding at the relevant points.
                Without that, even a case that feels obvious can become harder to present.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get a stronger arrears file by treating the rent
                account as the centre of the claim and keeping the chronology disciplined from service
                through to hearing.
              </p>
            </Card>

            <Card id="service-methods-and-proof" title="Service Methods and Proof">
              <p className="mt-4 leading-7 text-gray-700">
                One of the most overlooked parts of a Section 8 notice is the proof of service. Landlords
                often focus on what the notice says, but later court disputes often focus on whether it
                can be shown to have been served properly and on the date claimed.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The best service method is usually the one that fits the tenancy paperwork, can be explained
                clearly later, and leaves a clean evidential trail. That may mean preserving delivery records,
                certificates, photographs, covering correspondence, or other supporting material depending
                on how the notice was served.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords should aim to keep one simple service file containing the final
                notice, the date used for service, the method used, and the supporting proof that goes with it.
                That makes later possession work much easier.
              </p>
            </Card>

            <Card
              id="when-landlords-get-into-trouble"
              title="When Landlords Get Into Trouble"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most Section 8 problems do not begin with one dramatic error. They usually come from a
                series of smaller decisions that weaken the file over time. A landlord may rush the notice,
                rely on grounds that sounded broadly right but were not checked carefully, or assume the
                court can sort out a messy evidence position later.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Choosing weak or badly matched grounds.</span>
                  <span className="block">
                    The notice can become harder to rely on if the grounds do not fit the facts cleanly.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Using the wrong notice period.</span>
                  <span className="block">
                    Notice-period errors often create avoidable delay and may weaken the route from the start.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Serving the notice before the evidence is ready.</span>
                  <span className="block">
                    Section 8 is a proof-based route, so a weak evidence pack usually catches up later.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Keeping poor service records.</span>
                  <span className="block">
                    Even with strong grounds, unclear service evidence can create extra dispute later.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Relying on Ground 8 alone without thinking ahead.</span>
                  <span className="block">
                    If arrears drop below threshold by the hearing, the file may become more exposed.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually save more time by preventing notice-stage weakness
                than by trying to move quickly on the day of service.
              </p>
            </Card>

            <Card id="timeline-after-service" title="Timeline After Service">
              <p className="mt-4 leading-7 text-gray-700">
                Once a Section 8 notice has been served properly, the case moves into the notice-period
                stage. At that point the landlord’s task is usually to keep the chronology updated,
                preserve service proof, and continue building the evidence file so the later possession
                stage is easier to manage if the tenant does not leave or the breach is not remedied.
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
                        Landlord serves Form 3 and locks the service evidence
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Notice period runs</td>
                      <td className="px-4 py-3">
                        Landlord tracks dates and keeps the evidence file current
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Issue resolves or continues</td>
                      <td className="px-4 py-3">
                        Tenant may pay, remedy, leave, or dispute the allegations
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Possession stage</td>
                      <td className="px-4 py-3">
                        Grounds, evidence, notice, and service proof become central in court
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, good landlords use the period after service to strengthen the wider
                possession file, not to ignore it until a hearing problem appears.
              </p>
            </Card>

            <Card id="section-8-service-checklist" title="Section 8 Service Checklist">
              <p className="mt-4 leading-7 text-gray-700">
                The cleanest Section 8 files usually come from landlords who reduce the process to one
                disciplined checklist rather than relying on memory. Grounds-based cases often look simple
                at the start and then become much more technical later if the basics were skipped.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Check Section 8 is the right route on the facts</li>
                <li>Choose the correct grounds carefully</li>
                <li>Prepare the supporting evidence before service</li>
                <li>Complete the final Form 3 consistently with the file</li>
                <li>Use the correct notice period for the grounds relied on</li>
                <li>Choose the service method deliberately, not casually</li>
                <li>Keep proof showing what was served and how</li>
                <li>Track the file after service so court preparation is easier later</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the strongest checklist is the one that turns later court questions
                into easy file answers.
              </p>
            </Card>

            <Card
              id="notice-only-vs-complete-pack"
              title="Notice Only vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords looking at Section 8 service are often deciding not just what to serve, but
                what level of help the file now needs. Some cases are still basically notice-stage
                cases. Others are already broader possession cases where the notice is only one part
                of a bigger court-facing workflow.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the landlord mainly needs the Section 8
                notice prepared and served correctly now. It tends to suit cases where the route is
                already clear and the main immediate risk is getting the notice stage wrong.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the landlord wants broader support with
                route control, court preparation, possession planning, and later enforcement readiness.
                That tends to matter more where the tenancy history is messy, the evidence file needs
                more control, or delay would be especially costly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Notice Only fits cleaner first-step cases. Complete Pack fits
                Section 8 files where the wider possession workflow also needs to be managed carefully.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Serve Section 8 notice FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">What to do next</h2>

            <p className="mt-4 leading-7 text-gray-700">
              Section 8 service usually works best when the landlord treats the notice as part of one
              controlled possession file rather than as a one-off delivery event. That means checking
              the grounds first, preparing the evidence early, locking the final notice version, and
              preserving proof of service in a way that will still be usable later.
            </p>

            <p className="mt-4 leading-7 text-gray-700">
              The strongest Section 8 cases are often not the fastest-looking ones on day one. They are
              the ones least likely to weaken later because the grounds, notice period, evidence, and
              service record all line up properly from the start.
            </p>

            <p className="mt-4 leading-7 text-gray-700">
              If your main need is getting the Section 8 notice stage handled correctly, start with
              Notice Only. If the wider possession file also needs route control and court-stage
              preparation, start with Complete Pack.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={noticeOnlyProductLink}
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                View Section 8 Notice Pack
              </Link>
              <Link
                href={completePackProductLink}
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Need broader support? Complete Pack
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
