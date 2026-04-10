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

const canonical = 'https://landlordheaven.co.uk/eviction-timeline-uk';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Eviction Timeline UK | How Long the Eviction Process Takes for Landlords | LandlordHeaven',
  description:
    'Plain-English landlord guide to how long eviction usually takes in England, where delays happen, and what you can do to keep the case moving.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Eviction Timeline UK | How Long the Eviction Process Takes for Landlords | LandlordHeaven',
    description:
      'Understand how long the eviction process usually takes, what delays landlords most often face, and how to plan from notice to enforcement.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const faqs: FAQItem[] = [
  {
    question: 'How long does eviction usually take in the UK?',
    answer:
      'Many eviction cases take between three and six months from notice to enforcement. The timeline depends on the notice route used, whether the tenant leaves voluntarily, the court route, and local bailiff waiting times.',
  },
  {
    question: 'What stage of eviction takes the longest?',
    answer:
      'Court processing and bailiff enforcement are often the longest stages. These tend to vary by area and can be significantly affected by local workload and listing delays.',
  },
  {
    question: 'Can eviction be completed faster?',
    answer:
      'Sometimes. Cases often move faster when the notice is valid, the document bundle is organised early, and the tenant leaves during or shortly after the notice period.',
  },
  {
    question: 'What delays eviction cases most often?',
    answer:
      'Invalid notices, incorrect dates, weak proof of service, missing compliance documents, unclear arrears schedules, and incomplete court paperwork are common causes of delay.',
  },
  {
    question: 'Does Section 21 usually take longer or shorter than Section 8?',
    answer:
      'That depends on the case. Section 21 can be more straightforward where the paperwork is valid and possession-only relief is sought, while Section 8 can take longer because it often depends on proving breach and attending a hearing.',
  },
  {
    question: 'Does the eviction timeline end when the court grants possession?',
    answer:
      'Not always. If the tenant stays after the possession date, the landlord still needs enforcement. That means the timeline can continue beyond the possession order stage.',
  },
  {
    question: 'Can a landlord speed up the eviction process by changing locks?',
    answer:
      'No. Landlords must not try to recover possession outside the legal process. Unlawful eviction can create serious legal risk and often makes the situation worse.',
  },
  {
    question: 'Should landlords prepare for court before the notice expires?',
    answer:
      'Usually yes. Landlords often save time by organising the evidence bundle, chronology, and service records while the notice period is running rather than waiting until the claim needs to be issued.',
  },
];

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#typical-eviction-timeline-in-england', label: 'Typical timeline' },
  { href: '#why-eviction-timelines-vary', label: 'Why timelines vary' },
  { href: '#stage-1-notice-period', label: 'Stage 1: notice period' },
  { href: '#stage-2-court-application', label: 'Stage 2: court application' },
  { href: '#stage-3-possession-order', label: 'Stage 3: possession order' },
  { href: '#stage-4-bailiff-enforcement', label: 'Stage 4: bailiff enforcement' },
  { href: '#what-can-speed-up-the-timeline', label: 'What speeds it up' },
  { href: '#what-usually-causes-delays', label: 'What causes delays' },
  { href: '#documents-landlords-should-prepare', label: 'Documents to prepare' },
  { href: '#section-21-vs-section-8-timeline', label: 'Section 21 vs Section 8' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

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
        pagePath="/eviction-timeline-uk"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Eviction Timeline UK',
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
          { name: 'Eviction Timeline UK', url: canonical },
        ])}
      />

      <UniversalHero
        title="Eviction Timeline UK"
        subtitle="If you need the property back, this guide shows how long the notice, court, possession order, and enforcement stages usually take and where landlords most often lose time."
        primaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        secondaryCta={{
          label: 'Still at notice stage? Start Notice Only',
          href: '/products/notice-only',
        }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Eviction timeline UK icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Understand the real eviction timeline in England, including notice periods,
          court processing, possession orders, and enforcement.
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
            <SeoPageContextPanel pathname="/eviction-timeline-uk" className="border border-[#CAB6FF] bg-[#FBF8FF]" />
          </div>
        </Container>
      </section>

      <section id="quick-answer" className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card title="Quick Answer">
              <p className="mt-4 text-gray-700 leading-7">
                Landlords often ask how long eviction takes in the UK, but the practical
                answer depends on the route used and how well the case is prepared. Most
                eviction cases in England move through four broad stages: notice, court,
                possession order, and enforcement.
              </p>
              <p className="mt-4 text-gray-700 leading-7">
                In many cases, the total timeline is around three to six months. Some
                cases finish sooner if the tenant leaves after notice. Others take longer
                where the notice is challenged, the claim is defended, or bailiff waiting
                times are heavy.
              </p>
              <p className="mt-4 text-gray-700 leading-7">
                The most important point for landlords is that eviction timelines are
                strongly influenced by paperwork quality. A valid notice, a clear evidence
                bundle, and good service records often save more time than trying to rush a
                weak file through court.
              </p>
            </Card>

            <Card
              id="typical-eviction-timeline-in-england"
              title="Typical Eviction Timeline in England"
            >
              <p className="mt-4 text-gray-700 leading-7">
                While exact timing varies by case, most eviction processes follow a
                recognisable sequence. The route begins with notice, then moves into court
                if the tenant remains, then into possession, and finally into enforcement
                where required.
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

              <p className="mt-4 text-gray-700 leading-7">
                Many cases take between three and six months overall, though local court
                and enforcement delays can extend this. The timeline is best treated as a
                practical range rather than a promise.
              </p>
            </Card>

            <Card id="why-eviction-timelines-vary" title="Why Eviction Timelines Vary">
              <p className="mt-4 text-gray-700 leading-7">
                Not all eviction cases move at the same pace. Several factors influence how
                quickly a landlord regains possession, and many of them arise long before
                the case reaches court.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                The first factor is route choice. A Section 21 case with strong compliance
                documents may move differently from a Section 8 case based on rent arrears
                or nuisance. The second factor is tenant response. Some tenants leave after
                service, some negotiate, and others remain in occupation until court and
                enforcement are complete.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                A third factor is preparation. When the notice is valid, dates are correct,
                and the evidence bundle is organised from the beginning, the landlord is
                less likely to suffer avoidable resets. A weaker file often adds delay even
                where the legal route itself is sound.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                Finally, local court workload and bailiff availability can significantly
                affect timing. This is why landlords should plan for a realistic process
                rather than assuming the shortest possible timeline will apply.
              </p>
            </Card>

            <CtaBand
              title="Need to generate your eviction notice now?"
              body="If you already know the correct route, start with Notice Only. If you want broader support across notice generation, route validation, and possession planning, use the Complete Eviction Pack."
              primaryHref="/products/complete-pack"
              primaryLabel="Start Complete Eviction Pack"
              secondaryHref="/products/notice-only"
              secondaryLabel="Still at notice stage? Start Notice Only"
            />

            <Card id="stage-1-notice-period" title="Stage 1: Notice Period">
              <p className="mt-4 text-gray-700 leading-7">
                The eviction timeline usually begins with the notice stage. Before applying
                to court, landlords must normally serve the correct notice and wait for the
                relevant notice period to expire.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                The notice period depends on the notice type used. Section 21 notices often
                require at least two months’ notice, while Section 8 notices may involve
                shorter periods depending on the legal grounds relied on. Because those
                periods can vary, landlords should validate the dates before service rather
                than relying on assumption.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                This stage is also where many cases quietly end. If the tenant leaves
                voluntarily during the notice period, the case may never need to proceed to
                court. That is one reason notice quality matters so much: the notice stage
                is not just procedural, it is often the stage where the landlord’s next
                move becomes clearer.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                A strong notice stage usually includes more than the notice itself. It
                includes the right form, accurate dates, proof of service, and a file that
                is already being built for court if needed.
              </p>
            </Card>

            <Card id="stage-2-court-application" title="Stage 2: Court Application">
              <p className="mt-4 text-gray-700 leading-7">
                If the tenant does not leave after the notice period expires, landlords can
                apply to court for a possession order. This is the point where the case
                becomes formally judicial rather than just procedural.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                Section 21 cases may qualify for an accelerated possession claim where the
                landlord is seeking possession only and the paperwork is valid. Section 8
                claims usually follow the standard possession route and often involve a
                hearing where both landlord and tenant can present their position.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                Court processing time varies by region, but six to ten weeks is a useful
                working range for many cases. Some claims move faster. Others take longer
                where the court is busy, the tenant responds in detail, or the paperwork
                needs clarification.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                Landlords often save time here by preparing the evidence bundle before the
                notice period has even ended. Waiting until the last minute to organise the
                file is one of the easiest ways to lose momentum in the eviction process.
              </p>
            </Card>

            <Card id="stage-3-possession-order" title="Stage 3: Possession Order">
              <p className="mt-4 text-gray-700 leading-7">
                If the court grants possession, it issues a possession order stating when
                the tenant must leave the property. This is commonly around 14 days after
                the order is made, although the court may allow longer in some cases where
                hardship is shown.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                A possession order is a major milestone, but it is not always the end of
                the landlord’s timeline. Some tenants comply and leave. Others do not,
                which means the case moves into enforcement.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                This stage is often where landlords realise the difference between winning
                the case on paper and actually recovering possession. Both matter, but they
                are not the same thing. A possession order is the bridge between court and
                actual recovery, not the final practical step.
              </p>
            </Card>

            <Card id="stage-4-bailiff-enforcement" title="Stage 4: Bailiff Enforcement">
              <p className="mt-4 text-gray-700 leading-7">
                If the tenant does not leave by the possession date, landlords must apply
                for enforcement. In many cases this means county court bailiffs attending
                the property to lawfully recover possession.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                Bailiff waiting times vary significantly by area and are one of the biggest
                causes of late-stage frustration for landlords. Even where the notice and
                court stages were handled well, enforcement can still add several weeks to
                the overall timeline.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                This is also the point where landlords must stay disciplined. Trying to
                accelerate the process through lock changes or self-help eviction can create
                serious legal problems. The safest route remains lawful enforcement through
                the correct channel.
              </p>
            </Card>

            <Card
              id="what-can-speed-up-the-timeline"
              title="What Can Speed Up the Eviction Timeline"
            >
              <p className="mt-4 text-gray-700 leading-7">
                While landlords cannot control court workload, they can control how well
                the case is prepared. Some of the biggest time savings come from reducing
                avoidable friction before the claim is ever issued.
              </p>

              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>Choosing the correct notice route early</li>
                <li>Validating dates and notice form before service</li>
                <li>Keeping reliable proof of service</li>
                <li>Organising the court bundle while the notice runs</li>
                <li>Keeping rent schedules and communications up to date</li>
              </ul>

              <p className="mt-4 text-gray-700 leading-7">
                In practical terms, the fastest cases are often the best prepared ones. A
                landlord who treats notice, court, and enforcement as connected stages is
                usually in a stronger position than a landlord handling each stage only
                after the previous one fails.
              </p>
            </Card>

            <Card
              id="what-usually-causes-delays"
              title="What Usually Causes Delays in Eviction Cases"
            >
              <p className="mt-4 text-gray-700 leading-7">
                Delays are usually caused by preventable paperwork problems rather than by
                obscure legal arguments. Most slow cases have one or more recurring issues
                somewhere in the file.
              </p>

              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>Invalid or incorrectly dated notices</li>
                <li>Missing compliance documents</li>
                <li>Weak rent arrears evidence</li>
                <li>No reliable proof of service</li>
                <li>Incomplete or inconsistent court applications</li>
                <li>Poor chronology between tenancy, notice, and court bundle</li>
              </ul>

              <p className="mt-4 text-gray-700 leading-7">
                Preparing a complete document bundle before serving notice helps reduce the
                risk of delay later in the process. Landlords often lose weeks not because
                their case is weak, but because the file is inconsistent.
              </p>
            </Card>

            <CtaBand
              title="Start your eviction process correctly"
              body="Landlords who validate the route and documents early often avoid weeks of delay later. Start with the right workflow now."
              primaryHref="/products/complete-pack"
              primaryLabel="Start Complete Eviction Pack"
              secondaryHref="/products/notice-only"
              secondaryLabel="Start Notice Only"
            />

            <Card
              id="documents-landlords-should-prepare"
              title="Documents Landlords Should Prepare Before Tracking the Timeline"
            >
              <p className="mt-4 text-gray-700 leading-7">
                A realistic eviction timeline depends on documents being ready before they
                are needed. Landlords who wait until court stage to build the file often
                find that the timeline stretches unnecessarily.
              </p>

              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>Tenancy agreement and any renewal terms</li>
                <li>Compliance documents relevant to the route used</li>
                <li>Copy of the notice served</li>
                <li>Proof of service showing how and when service took place</li>
                <li>Rent statement and arrears schedule where applicable</li>
                <li>Communication log with the tenant</li>
                <li>Chronology of key dates from tenancy start to notice expiry</li>
              </ul>

              <p className="mt-4 text-gray-700 leading-7">
                The best bundles are chronological and easy to verify. Courts usually
                respond better to a smaller but coherent file than to a larger bundle that
                is hard to follow or internally inconsistent.
              </p>
            </Card>

            <Card
              id="section-21-vs-section-8-timeline"
              title="Section 21 vs Section 8: Timeline Differences"
            >
              <p className="mt-4 text-gray-700 leading-7">
                Many landlords ask whether Section 21 or Section 8 is faster. The answer
                depends less on the label of the route and more on the quality of the file.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                Section 21 can move more cleanly where the landlord only wants possession
                and the compliance record is strong. Section 8 can be slower where the
                court must review breach evidence in detail. However, a weak Section 21
                notice can lose more time than a well-prepared Section 8 claim.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                In practice, the commercially faster route is usually the one that best
                fits the facts and is most likely to remain valid through court and
                enforcement.
              </p>
            </Card>

            <Card
              id="notice-only-vs-complete-pack"
              title="Notice Only vs Complete Pack"
            >
              <p className="mt-4 text-gray-700 leading-7">
                Landlords reading an eviction timeline page are often deciding not just
                what the process looks like, but how much help they need to move through it
                efficiently.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 text-gray-700 leading-7">
                Notice Only is usually the better fit where the route is already clear and
                the landlord mainly needs a compliant notice produced from the correct
                inputs. It is often suitable where the user already understands the wider
                possession process.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">
                Complete Eviction Pack
              </h3>
              <p className="mt-2 text-gray-700 leading-7">
                The Complete Eviction Pack is usually the stronger fit where the route
                still needs validating, the evidence needs organising, or the landlord
                wants broader support across notice, possession, and next-step planning.
              </p>

              <p className="mt-4 text-gray-700 leading-7">
                In practical terms, Notice Only fits a clearer case. Complete Pack fits a
                more managed, end-to-end workflow.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Eviction timeline FAQs for landlords" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">What to do next</h2>
            <p className="mt-4 text-gray-700 leading-7">
              Eviction timelines work best when landlords treat the process as a connected
              workflow rather than a sequence of rushed documents. Confirm the route,
              validate the notice, organise the evidence bundle, and plan for court before
              delays start to build.
            </p>
            <p className="mt-4 text-gray-700 leading-7">
              If the route is already clear and you mainly need the notice itself, start
              with Notice Only. If you want broader support across notice, possession, and
              enforcement planning, start with the Complete Eviction Pack.
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
                Still at notice stage? Start Notice Only
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
