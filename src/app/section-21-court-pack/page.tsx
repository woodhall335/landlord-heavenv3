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
const canonical = 'https://landlordheaven.co.uk/section-21-court-pack';
const noticeOnlyHref = '/products/notice-only';
const completePackHref = '/products/complete-pack';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Section 21 Court Pack 2026 | Court-Ready Possession File for Landlords | LandlordHeaven',
  description:
    'A practical guide to the Section 21 court pack in England.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Section 21 Court Pack 2026 | Court-Ready Possession File for Landlords | LandlordHeaven',
    description:
      'Plain-English guidance for landlords on preparing a Section 21 court pack, including notice, compliance documents, service proof, delay risks, and why prompt action matters while Section 21 is being phased out.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Section 21 Court Pack 2026 | LandlordHeaven',
    description:
      'What landlords usually need for possession after a Section 21 notice expires.',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#section-21-changing-soon', label: 'Section 21 is changing soon' },
  { href: '#what-a-section-21-court-pack-is', label: 'What a Section 21 court pack is' },
  { href: '#when-landlords-usually-need-it', label: 'When landlords usually need it' },
  { href: '#what-usually-goes-in-the-pack', label: 'What usually goes in the pack' },
  { href: '#notice-compliance-and-service', label: 'Notice, compliance and service' },
  { href: '#why-court-packs-often-feel-weaker-than-expected', label: 'Why packs often feel weaker than expected' },
  { href: '#how-landlords-usually-prepare-the-file', label: 'How landlords usually prepare the file' },
  { href: '#common-court-pack-mistakes', label: 'Common court pack mistakes' },
  { href: '#eviction-timeline-and-delay-points', label: 'Eviction timeline and delay points' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What is a Section 21 court pack?',
    answer:
      'A Section 21 court pack is the set of documents landlords usually need when the tenant has not left after the notice period and the case needs to move into the possession stage. It commonly includes the notice, compliance records, service proof, tenancy documents, and court-facing supporting material.',
  },
  {
    question: 'When do landlords need a Section 21 court pack?',
    answer:
      'Landlords usually need the court pack after the Section 21 notice has been served correctly, the notice period has expired, and the tenant has not left voluntarily.',
  },
  {
    question: 'Why does it matter that Section 21 is being phased out?',
    answer:
      'It matters because landlords relying on a valid existing Section 21 notice should usually avoid delay. If Section 21 is being removed from the live possession landscape, landlords with an already-served notice typically have more reason to get the court-stage file organised promptly rather than waiting.',
  },
  {
    question: 'What is the biggest problem with a Section 21 court pack?',
    answer:
      'One of the biggest problems is assuming that a notice file automatically becomes a strong court file. In practice, landlords often discover missing compliance records, weak service proof, or inconsistent dates when they start preparing the pack properly.',
  },
  {
    question: 'Does the court pack only include the notice?',
    answer:
      'No. The notice is central, but the pack usually also needs the tenancy agreement, compliance records, deposit information where relevant, and proof showing when and how the notice was served.',
  },
  {
    question: 'Can a Section 21 court pack fail because of weak service evidence?',
    answer:
      'Yes. Even if the notice itself is correct, poor or unclear proof of service can create delay and weaken the possession file at court stage.',
  },
  {
    question: 'Should I prepare the court pack before the notice expires?',
    answer:
      'Usually yes. Landlords often benefit from reviewing and organising the court-stage file during the notice period rather than waiting until expiry and discovering avoidable problems too late.',
  },
  {
    question: 'Should I use Notice Only or Complete Pack for a Section 21 court file?',
    answer:
      'Notice Only is usually the better fit where the main need is still the notice stage itself. Complete Pack is usually stronger where the file is already moving toward court, broader route control is needed, or the landlord wants continuity across the whole possession process.',
  },
  {
    question: 'What usually causes delay once a Section 21 case reaches court preparation?',
    answer:
      'Common delay points include missing compliance records, poor service proof, weak date logic, uncertainty around deposit handling, and a notice file that was never organised with the court stage in mind.',
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
        pagePath="/section-21-court-pack"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 21 Court Pack',
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
          { name: 'Section 21 Court Pack', url: canonical },
        ])}
      />

      <UniversalHero
        title="Section 21 Court Pack"
        subtitle="A practical landlord guide to what usually needs to be ready once the notice period has expired and the case is moving toward possession."
        primaryCta={{ label: 'Start Complete Pack', href: completePackHref }}
        secondaryCta={{ label: 'Still at notice stage? Notice Only', href: noticeOnlyHref }}
        mediaSrc="/images/wizard-icons/07-review-finish.png"
        mediaAlt="Section 21 court pack guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains what landlords in England usually include in a
          Section 21 court pack, what often causes delay at the possession stage,
          and how to turn a notice file into a cleaner court-ready file.
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
              pathname="/section-21-court-pack"
              className="border border-[#E6DBFF] bg-[#FBF8FF]"
            />
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                A Section 21 court pack is the set of documents a landlord usually needs once
                the notice period has run and the tenant has not left. In practical terms, it
                is the point where the landlord stops asking “was the notice served?” and
                starts asking “is the whole possession file strong enough for court?”
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The biggest misconception is that a good notice automatically becomes a good
                court pack. Sometimes it does. Often it does not. A notice file that looked
                fine during service may still contain weak compliance records, poor service
                proof, or date inconsistencies that only become obvious once the landlord tries
                to prepare the possession stage properly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                There is also a strategic timing point now: Section 21 is expected to be phased
                out under the Renters&apos; Rights reforms, so landlords who already hold a valid
                Section 21 notice usually have a stronger reason to move promptly rather than
                letting the file drift.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the best Section 21 court packs usually come from landlords
                who use the notice period to audit the whole file, organise the supporting
                records, and remove uncertainty before the case is pushed into the court stage.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The cleanest handover usually comes from landlords who review the{' '}
                <Link href="/section-21-ban-uk" className="font-medium text-primary hover:underline">
                  Section 21 transition guide
                </Link>
                , map the court handoff against{' '}
                <Link href="/section-21-expired-what-next" className="font-medium text-primary hover:underline">
                  what happens after a Section 21 expires
                </Link>
                , and move onto the{' '}
                <Link href="/products/complete-pack" className="font-medium text-primary hover:underline">
                  Complete Pack product page
                </Link>{' '}
                once the notice stage is already behind them.
              </p>
            </Card>

            <Card
              id="section-21-changing-soon"
              title="Section 21 Is Changing Soon"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords should now read any Section 21 court-pack decision in the context of
                wider England tenancy reform. Section 21 is expected to be phased out under the
                Renters&apos; Rights reforms, which means this route should be treated as a live
                transitional process rather than a long-term certainty.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That does not mean every existing Section 21 file has suddenly become unusable.
                It does mean landlords who already have a valid notice should usually think
                carefully before delaying the court stage. If a valid route already exists,
                waiting can create unnecessary risk.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, this makes court-pack quality even more important. A landlord
                with a valid Section 21 notice usually wants the possession file checked, cleaned,
                and moved forward properly while the route is still available to them.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The commercial message is simple: if you are already on the Section 21 route, do
                not treat the court pack as something to think about later. Treat it as the live
                next stage now.
              </p>
            </Card>

            <Card
              id="what-a-section-21-court-pack-is"
              title="What a Section 21 Court Pack Is"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A Section 21 court pack is not one single court form. It is the wider bundle
                of documents and supporting material that usually sits behind the possession
                stage once the Section 21 notice has expired and the tenant has not left.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This matters because landlords sometimes think the court stage begins only when
                a form needs filling in. In reality, the court stage begins much earlier from a
                file-preparation point of view. The notice, the compliance records, the service
                record, the tenancy agreement, and the chronology all need to make sense as one
                coherent file long before the court formally reviews the case.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the court pack is where a landlord’s earlier preparation is
                tested. A clean pack usually reflects a clean file. A messy pack usually reveals
                that the earlier notice stage was never fully controlled.
              </p>
            </Card>

            <Card
              id="when-landlords-usually-need-it"
              title="When Landlords Usually Need It"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually need a Section 21 court pack after three things have happened.
                First, the Section 21 notice has been served. Second, the notice period has run.
                Third, the tenant has not left voluntarily. That is usually the moment the file
                moves from notice-stage management into possession-stage preparation.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The commercial mistake is waiting until that point to look at the wider file.
                Landlords often do better when they start reviewing the court pack during the
                notice period itself. That gives them time to check whether the compliance
                records are actually present, whether the service proof is clear, and whether
                the notice file is likely to survive later scrutiny.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is even more important where landlords are conscious that Section 21 is not
                a forever route. If you already have a valid notice in hand, it usually makes
                sense to treat the court pack as a priority, not a future admin task.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the earlier the court pack is reviewed, the more chance the
                landlord has to catch avoidable weaknesses before they become expensive delays.
              </p>
            </Card>

            <Card
              id="what-usually-goes-in-the-pack"
              title="What Usually Goes in the Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Although the exact contents vary by case, most Section 21 court packs revolve
                around the same core materials. The court usually needs to understand the
                tenancy relationship, the route relied on, the notice served, and the records
                showing that the route was handled properly.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>The tenancy agreement and key tenancy details</li>
                <li>The final version of the Section 21 notice</li>
                <li>Proof showing when and how the notice was served</li>
                <li>Deposit and prescribed information records where relevant</li>
                <li>Required compliance documents and supporting evidence</li>
                <li>A clean chronology showing the route from tenancy to notice expiry</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get the strongest pack by focusing on
                clarity rather than volume. A shorter, disciplined file is often more useful
                than a large folder full of mixed documents that do not explain themselves well.
              </p>
            </Card>

            <Card
              id="notice-compliance-and-service"
              title="Notice, Compliance and Service"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The centre of the Section 21 court pack is not just the notice itself. It is
                the relationship between the notice, the compliance file, and the service
                evidence. Those three things usually rise or fall together. A perfectly drafted
                Form 6A can still become unhelpful if the service evidence is weak or if the
                compliance history behind the route is unclear.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is why landlords usually benefit from reviewing the route as a chain rather
                than as isolated documents. Was the route available? Was the notice correct? Was
                the service method sensible and provable? Are the compliance records capable of
                supporting the route if the file is challenged? These are usually the questions
                that matter most when the pack is being built.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the court pack is strongest where the notice, the compliance
                history, and the service proof all tell one consistent story.
              </p>
            </Card>

            <CtaBand
              title="Already past the notice stage and now trying to control the wider court file?"
              body="Complete Pack is usually the stronger fit where the Section 21 notice has already been served and the file now needs broader route control, court-stage preparation, or continuity through possession. Notice Only is usually better where the main need is still the earlier notice stage itself."
              primaryHref={completePackHref}
              primaryLabel="Start Complete Pack"
              secondaryHref={noticeOnlyHref}
              secondaryLabel="Still at notice stage? Notice Only"
            />

            <Card
              id="why-court-packs-often-feel-weaker-than-expected"
              title="Why Court Packs Often Feel Weaker Than Expected"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Many landlords are surprised by how different the file feels once it has to be
                prepared for court. During the notice stage, the route can look straightforward.
                But once the documents are assembled properly, missing pieces often become more
                obvious. The service note may be too vague. The compliance record may not be as
                clean as remembered. The dates may not line up as neatly as expected.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This does not always mean the route has failed. But it does mean the landlord is
                often discovering the real quality of the file later than they should have done.
                That is why court pack preparation is usually stronger when it starts before
                expiry rather than after.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, a weak-feeling court pack usually reflects earlier file
                uncertainty, not just bad luck at the court stage.
              </p>
            </Card>

            <Card
              id="how-landlords-usually-prepare-the-file"
              title="How Landlords Usually Prepare the File"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The strongest Section 21 court packs are usually built in stages. First the
                landlord identifies the core route documents. Then they check that the dates,
                compliance records, and service history all line up. Then they turn those
                documents into one cleaner possession file rather than leaving them scattered
                across email chains, folders, and notes.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This process works best when the landlord asks practical court-stage questions.
                Could somebody unfamiliar with the tenancy understand the route from the pack
                alone? Does the file explain what was served, when it was served, and why the
                route is available? If not, the file usually still needs work.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, good court-pack preparation is usually about file
                discipline, not about creating a larger pile of paperwork.
              </p>
            </Card>

            <Card
              id="common-court-pack-mistakes"
              title="Common Court Pack Mistakes"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most Section 21 court pack problems do not come from one dramatic failure. They
                usually come from smaller weaknesses that were never cleaned up properly before
                the case moved toward court.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Assuming the notice file is enough by itself.</span>
                  <span className="block">
                    A notice-stage file often still needs restructuring before it becomes a
                    reliable court-stage file.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Poor proof of service.</span>
                  <span className="block">
                    Even a good notice can create delay if the service record is vague or weak.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Missing or inconsistent compliance records.</span>
                  <span className="block">
                    Compliance problems often become much more visible once the file is reviewed for court.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Weak chronology.</span>
                  <span className="block">
                    If the file does not explain the route clearly, the court pack often feels less reliable.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Waiting too late to organise the file.</span>
                  <span className="block">
                    Landlords usually lose more time correcting a weak court pack than they would lose by reviewing it earlier.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the biggest improvement most landlords can make is not speed
                for its own sake. It is earlier control of the court-stage file.
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
                backlogs are outside your control, but notice validity and file quality are not.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why the Section 21 court pack matters so much. A clean file often saves
                more time than trying to repair a weak one once the possession stage is already
                under way. If the notice was invalid, the service record is poor, or the court
                pack is disorganised, the case can lose momentum before the court even gets to
                the wider backlog issue.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                There is also a wider strategic delay risk now. Where Section 21 is being phased
                out, landlords who already have a valid route usually have more reason to avoid
                drift and move the file forward while it is still live and usable.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords cannot control how busy the court system is, but
                they can control whether the case enters that system with a cleaner pack.
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
                Landlords researching a Section 21 court pack are often no longer dealing with
                a simple notice-stage question. In many cases, the issue is now broader file
                control: what documents are actually needed, how the route is going to be
                presented, and whether the pack is strong enough to support the possession stage.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the notice has already been
                served and the case now needs broader route control, court preparation, or
                continuity through possession. It tends to suit landlords who need the wider
                file controlled rather than just the earlier notice step.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the landlord is still earlier in
                the process and mainly needs the Section 21 notice stage itself handled
                properly. It can still be right in earlier files, but it is usually less
                aligned to a case already moving toward court pack preparation.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the later the case stage and the more important the wider
                possession file becomes, the more likely Complete Pack is the better fit.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Section 21 Court Pack FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              If your Section 21 notice has already been served and the tenant has not left,
              now is usually the time to turn the notice file into a cleaner court-ready file.
              That means checking the route again, confirming the compliance records, and
              making sure the service proof and chronology are strong enough for the next stage.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The strongest possession outcomes usually come from landlords who do not wait
              until the court stage to discover what is missing. They use the notice period to
              audit the file and reduce avoidable delay before the case moves forward.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              It also makes sense to be commercially realistic: if you already hold a valid
              Section 21 notice, and Section 21 is being phased out, leaving the case to drift
              is usually the wrong move.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={completePackHref}
                  className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                >
                  Start Complete Pack
                </Link>
                <Link
                  href={noticeOnlyHref}
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
