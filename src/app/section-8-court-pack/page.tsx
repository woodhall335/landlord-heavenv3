import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
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

const canonical = 'https://landlordheaven.co.uk/section-8-court-pack';

const noticeOnlyWizardLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_section_8_court_pack',
  topic: 'eviction',
});

const completePackWizardLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo_section_8_court_pack',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title:
    'Section 8 Court Pack | What Landlords Need for a Stronger Possession File | LandlordHeaven',
  description:
    'A practical guide to the Section 8 court pack in England. Learn what documents landlords usually need, what evidence matters most, what causes court-stage delay, and how to prepare a cleaner possession file.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Section 8 Court Pack | What Landlords Need for a Stronger Possession File | LandlordHeaven',
    description:
      'Plain-English guidance for landlords on preparing a Section 8 court pack, including grounds, evidence, service proof, and common possession-stage delay points.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-a-section-8-court-pack-is', label: 'What a Section 8 court pack is' },
  { href: '#when-landlords-usually-need-it', label: 'When landlords usually need it' },
  { href: '#what-usually-goes-in-the-pack', label: 'What usually goes in the pack' },
  { href: '#grounds-and-evidence', label: 'Grounds and evidence' },
  { href: '#rent-arrears-files', label: 'Rent arrears files' },
  { href: '#service-and-proof', label: 'Service and proof' },
  { href: '#how-landlords-usually-prepare-the-file', label: 'How landlords usually prepare the file' },
  { href: '#common-court-pack-mistakes', label: 'Common court pack mistakes' },
  { href: '#eviction-timeline-and-delay-points', label: 'Eviction timeline and delay points' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What is a Section 8 court pack?',
    answer:
      'A Section 8 court pack is the set of documents landlords usually need once the notice period has run and the case is moving into possession proceedings. It commonly includes the notice, the tenancy agreement, evidence supporting the grounds, service proof, and a clear chronology.',
  },
  {
    question: 'When do landlords need a Section 8 court pack?',
    answer:
      'Landlords usually need it after serving the Section 8 notice, waiting for the relevant notice period to expire, and seeing that the tenant has not resolved the issue or left voluntarily.',
  },
  {
    question: 'What is the most important part of a Section 8 court pack?',
    answer:
      'The most important part is usually the evidence behind the grounds. A Section 8 route is only as strong as the documents, records, and chronology supporting the alleged breach.',
  },
  {
    question: 'Can a Section 8 court pack fail because the notice was served correctly but the evidence is weak?',
    answer:
      'Yes. Unlike a purely notice-led route, Section 8 depends heavily on proof. The notice may be fine, but a weak evidence file can still make the court-stage case much harder.',
  },
  {
    question: 'Do I need proof of service for a Section 8 court pack?',
    answer:
      'Yes. Landlords should keep clear proof showing what was served, when it was served, and how it was delivered. Poor service evidence can create unnecessary dispute later.',
  },
  {
    question: 'What usually causes delay in a Section 8 court pack?',
    answer:
      'Common delay points include weak evidence, inconsistent arrears schedules, unclear grounds selection, poor service proof, and a notice file that was never organised with the court stage in mind.',
  },
  {
    question: 'Should I prepare the court pack before the notice expires?',
    answer:
      'Usually yes. Landlords often get better results when they organise the court-stage file during the notice period rather than waiting until expiry and discovering problems too late.',
  },
  {
    question: 'Should I use Notice Only or Complete Pack for a Section 8 court file?',
    answer:
      'Notice Only is usually the better fit where the main need is still the earlier notice stage. Complete Pack is usually stronger where the file is already moving toward court, broader route control is needed, or the landlord wants continuity across the whole possession process.',
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
        pagePath="/section-8-court-pack"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 8 Court Pack',
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
          { name: 'Section 8 Court Pack', url: canonical },
        ])}
      />

      <StructuredData data={faqPageSchema(faqs)} />

      <UniversalHero
        title="Section 8 Court Pack"
        subtitle="A practical landlord guide to what usually needs to be ready once the notice period has expired and the case is moving toward possession."
        primaryCta={{ label: 'Start Complete Pack', href: completePackWizardLink }}
        secondaryCta={{ label: 'Still at notice stage? Notice Only', href: noticeOnlyWizardLink }}
        mediaSrc="/images/wizard-icons/07-review-finish.png"
        mediaAlt="Section 8 court pack guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains what landlords in England usually include in a
          Section 8 court pack, what evidence matters most, what often causes
          delay at the possession stage, and how to turn a notice file into a
          cleaner court-ready file.
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
                A Section 8 court pack is the bundle of documents and evidence a landlord
                usually needs once the notice period has run and the case is moving toward
                possession proceedings. In practical terms, it is the point where the file
                stops being just a notice file and starts becoming a proof file.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That difference matters because Section 8 is not only about whether a notice
                was served. It is about whether the landlord can prove the legal grounds
                relied on. A notice may be correct, but if the evidence behind the grounds is
                weak, inconsistent, or poorly organised, the court-stage file often feels much
                weaker than expected.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the strongest Section 8 court packs usually come from
                landlords who use the notice period to organise the evidence, confirm the
                chronology, and make sure the grounds can actually be supported under pressure.
              </p>
            </Card>

            <Card
              id="what-a-section-8-court-pack-is"
              title="What a Section 8 Court Pack Is"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A Section 8 court pack is not a single document. It is the wider group of
                documents, records, schedules, and supporting material that usually sits behind
                the possession stage once the Section 8 notice period has expired and the issue
                has not been resolved.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This means the court pack is usually more than a notice plus a tenancy
                agreement. It often includes the evidence supporting the legal grounds, a clear
                chronology, and the service proof showing how the notice entered the case
                properly. In arrears cases, it often revolves around the rent schedule and
                payment records. In other cases, it may depend more on witness material,
                reports, inspection notes, or conduct records.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, a Section 8 court pack is where the landlord’s allegation
                has to become a usable court-stage file rather than a general tenancy complaint.
              </p>
            </Card>

            <Card
              id="when-landlords-usually-need-it"
              title="When Landlords Usually Need It"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually need a Section 8 court pack after the Section 8 notice has
                been served, the required notice period has run, and the tenant has either not
                remedied the problem or not left voluntarily. That is usually the point where
                the file moves from notice-stage management into possession-stage preparation.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The common mistake is treating the court pack as something that can be built at
                the last minute. That approach often exposes weaknesses too late. The better
                approach is usually to start preparing the pack during the notice period so the
                landlord has time to see whether the grounds, evidence, dates, and service
                record actually work together.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually save more time by preparing the court
                file early than by discovering a defect only once the next stage is already due.
              </p>
            </Card>

            <Card
              id="what-usually-goes-in-the-pack"
              title="What Usually Goes in the Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The exact contents depend on the type of Section 8 case, but the pack usually
                revolves around a few core materials. The court generally needs to understand
                the tenancy relationship, the notice relied on, the grounds used, and the
                documents that support those grounds.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>The tenancy agreement and key tenancy terms</li>
                <li>The final version of the Section 8 notice</li>
                <li>Proof showing when and how the notice was served</li>
                <li>The evidence supporting the grounds relied on</li>
                <li>A chronology linking the tenancy, the breach, and the notice</li>
                <li>Supporting schedules, records, reports, or witness material where relevant</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the best court packs are usually not the biggest ones.
                They are the ones where each document serves a clear purpose and fits cleanly
                into the overall story of the case.
              </p>
            </Card>

            <Card
              id="grounds-and-evidence"
              title="Grounds and Evidence"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The heart of the Section 8 court pack is usually the evidence behind the
                grounds. This is the biggest difference between Section 8 and routes that rely
                more heavily on notice compliance alone. With Section 8, the landlord is often
                saying more than “I served the right form.” The landlord is usually saying
                “these facts are true, these are the grounds I rely on, and this pack proves them.”
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That means weak evidence can damage the whole file even if the notice itself
                looks fine. A notice may correctly list the grounds, but the possession-stage
                file still depends on whether the documents actually support those grounds
                clearly enough to survive scrutiny.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get the strongest Section 8 court packs
                when they choose grounds carefully and build the evidence around those exact
                grounds rather than around a general sense that the tenancy went badly.
              </p>
            </Card>

            <Card
              id="rent-arrears-files"
              title="Rent Arrears Files"
            >
              <p className="mt-4 leading-7 text-gray-700">
                In rent arrears cases, the court pack usually revolves around the arrears
                record more than any other single document. Grounds 8, 10 and 11 are common,
                but the legal route only feels strong where the landlord has one clean rent
                schedule, payment records that reconcile properly, and a chronology showing
                how the arrears developed.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is one of the most common areas where files feel weaker than expected.
                Landlords often know the tenant owes money, but the court pack still needs the
                figures to be organised. If the rent schedule is rough, if payments were not
                tracked clearly, or if the arrears total keeps shifting, the court-stage file
                often becomes harder to rely on.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, strong arrears files usually come from landlords who treat
                the rent account as the centre of the claim and build the rest of the pack
                around that record.
              </p>
            </Card>

            <Card
              id="service-and-proof"
              title="Service and Proof"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Even in a proof-heavy Section 8 route, service still matters. The landlord does
                not just need the evidence behind the grounds. The landlord also needs a clear
                service record showing what was served, when it was served, how it was served,
                and what proof exists.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This matters because service disputes often create avoidable friction later. A
                tenant may challenge receipt, timing, or delivery method. If the service record
                is vague, the pack becomes less reliable than it needs to be. A strong evidence
                file can still be slowed down by a weak service file.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the court pack is strongest where the evidence behind the
                grounds and the service history behind the notice both tell the same clean story.
              </p>
            </Card>

            <CtaBand
              title="Already beyond the notice stage and now trying to control the wider court file?"
              body="Complete Pack is usually the stronger fit where the Section 8 notice has already been served and the case now needs broader route control, court-stage preparation, or continuity through possession. Notice Only is usually better where the main need is still the earlier notice stage itself."
              primaryHref={completePackWizardLink}
              primaryLabel="Start Complete Pack"
              secondaryHref={noticeOnlyWizardLink}
              secondaryLabel="Still at notice stage? Notice Only"
            />

            <Card
              id="how-landlords-usually-prepare-the-file"
              title="How Landlords Usually Prepare the File"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The strongest Section 8 court packs are usually prepared in stages rather than
                rushed together at the end. First the landlord identifies the exact grounds and
                the documents supporting them. Then the dates, chronology, and service history
                are checked. Finally the file is turned into one cleaner court-facing pack
                rather than left as a mix of emails, notes, spreadsheets, and loose records.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This process works best where the landlord asks practical questions early. Could
                someone unfamiliar with the case understand why these grounds were chosen? Could
                the court follow the breach history from the documents alone? Are there any gaps
                in the evidence that still need to be resolved while there is time?
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, good Section 8 preparation is usually about making the file
                easier to prove, not just easier to store.
              </p>
            </Card>

            <Card
              id="common-court-pack-mistakes"
              title="Common Court Pack Mistakes"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most Section 8 court pack problems do not come from one dramatic failure. They
                usually come from a series of smaller weaknesses that were never properly
                cleaned up before the file moved toward court.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Weak evidence behind the grounds.</span>
                  <span className="block">
                    A notice can list the right grounds and still fail to persuade if the
                    supporting records are thin or inconsistent.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Unclear arrears schedules.</span>
                  <span className="block">
                    In rent cases, rough or shifting figures often weaken the whole pack.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Poor proof of service.</span>
                  <span className="block">
                    Even a good evidence file can be delayed by weak notice service records.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Choosing too many grounds without discipline.</span>
                  <span className="block">
                    The strongest pack usually fits the file rather than throwing in every possible argument.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Waiting too late to organise the pack.</span>
                  <span className="block">
                    Landlords often lose more time fixing a weak pack than they would spend preparing it earlier.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the biggest improvement most landlords can make is earlier
                control of the evidence file rather than more urgency at the end.
              </p>
            </Card>

            <Card
              id="eviction-timeline-and-delay-points"
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
                backlogs are outside your control, but evidence quality and file organisation are not.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why the Section 8 court pack matters so much. A well-organised pack
                often saves more time than trying to patch together weak grounds or weak
                records later. If the evidence behind the grounds is thin, if the rent schedule
                is inconsistent, or if the service record is poor, the case can lose momentum
                before the wider court backlog even becomes the main issue.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords cannot control how busy the court system is, but
                they can control whether the case enters that system with a cleaner evidence-led file.
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
                Landlords researching a Section 8 court pack are usually not dealing with a
                simple notice-stage question anymore. In many cases, the issue is now broader
                file control: what evidence is actually needed, how the grounds will be
                presented, and whether the pack is strong enough to support the possession stage.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the notice has already been
                served and the case now needs broader route control, court preparation, or
                continuity through possession. It tends to suit landlords who need the wider
                evidence and possession file controlled rather than just the earlier notice step.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the landlord is still earlier in
                the process and mainly needs the Section 8 notice stage handled properly. It
                can still be right in earlier files, but it is usually less aligned to a case
                already moving toward court pack preparation.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the later the case stage and the more important the wider
                evidence file becomes, the more likely Complete Pack is the better fit.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Section 8 Court Pack FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              If your Section 8 notice has already been served and the tenant has not resolved
              the problem or left, this is usually the point to turn the notice file into a
              cleaner court-ready evidence file. That means checking the grounds again,
              confirming the chronology, and making sure the supporting records are strong
              enough for the next stage.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The strongest possession outcomes usually come from landlords who do not wait
              until the court stage to discover what is missing. They use the notice period to
              audit the evidence and reduce avoidable delay before the case moves forward.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={completePackWizardLink}
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                Start Complete Pack
              </Link>
              <Link
                href={noticeOnlyWizardLink}
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Still at notice stage? Notice Only
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}