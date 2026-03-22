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

const canonical = 'https://landlordheaven.co.uk/section-21-vs-section-8';

const noticeOnlyProductLink = '/products/notice-only';
const completePackProductLink = '/products/complete-pack';

export const metadata: Metadata = {
  title:
    'Section 21 vs Section 8 | Which Eviction Notice Should Landlords Use? | LandlordHeaven',
  description:
    'Understand the difference between Section 21 and Section 8 eviction notices in England. Learn when landlords use each route, what evidence matters, what risks apply, and how to decide which notice fits the case.',
  alternates: { canonical },
  openGraph: {
    title:
      'Section 21 vs Section 8 | Which Eviction Notice Should Landlords Use? | LandlordHeaven',
    description:
      'A practical landlord guide comparing Section 21 and Section 8 in England, including timing, evidence, compliance and route choice.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-is-section-21', label: 'What Section 21 is' },
  { href: '#what-is-section-8', label: 'What Section 8 is' },
  { href: '#key-differences', label: 'Key differences' },
  { href: '#when-landlords-use-section-21', label: 'When landlords use Section 21' },
  { href: '#when-landlords-use-section-8', label: 'When landlords use Section 8' },
  { href: '#rent-arrears-strategy', label: 'Rent arrears strategy' },
  { href: '#serving-both', label: 'Serving both notices' },
  { href: '#evidence-compliance', label: 'Evidence and compliance' },
  { href: '#court-process', label: 'Court process differences' },
  { href: '#common-mistakes', label: 'Common landlord mistakes' },
  { href: '#eviction-timeline', label: 'Eviction timeline and delay points' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What is the main difference between Section 21 and Section 8?',
    answer:
      'Section 21 is a no-fault possession route, while Section 8 is a fault-based route that depends on legal grounds such as rent arrears or other tenancy breaches.',
  },
  {
    question: 'Is Section 21 easier than Section 8?',
    answer:
      'Section 21 can feel simpler because landlords do not need to prove a tenant breach, but the route depends heavily on compliance. Section 8 can be powerful where the evidence is strong, especially in serious arrears cases.',
  },
  {
    question: 'Can landlords serve Section 21 and Section 8 together?',
    answer:
      'Yes. Some landlords serve both notices where the facts support both routes, especially where rent arrears exist but the landlord also wants a fallback route to possession.',
  },
  {
    question: 'Which route is better for rent arrears?',
    answer:
      'Section 8 is usually the more direct route for rent arrears because it is based on breach and can rely on rent grounds such as 8, 10 and 11. Section 21 may still be used where the compliance file is clean and possession is the main objective.',
  },
  {
    question: 'Does Section 21 still need evidence?',
    answer:
      'Yes, but not evidence of fault. Landlords still need a strong compliance and service file, including deposit handling, prescribed documents, timing, and proof of service.',
  },
  {
    question: 'What is the biggest mistake landlords make when choosing between Section 21 and Section 8?',
    answer:
      'One of the biggest mistakes is picking the route emotionally instead of reviewing the file. Landlords usually get better outcomes when they choose based on compliance strength, evidence quality, and the real objective of the case.',
  },
  {
    question: 'Which notice is faster?',
    answer:
      'It depends on the case. Section 8 can be strong where arrears are clear and the evidence is organised. Section 21 can be more predictable where the compliance file is clean. Court timings themselves are outside the landlord’s control.',
  },
  {
    question: 'Should I use Notice Only or Complete Pack?',
    answer:
      'Notice Only is usually the better fit where the route is already clear and the main need is preparing and serving the notice correctly. Complete Pack is usually stronger where the wider possession file, route control, or court continuity also needs support.',
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
        pagePath="/section-21-vs-section-8"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 21 vs Section 8',
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
          { name: 'Section 21 vs Section 8', url: canonical },
        ])}
      />

      <UniversalHero
        title="Section 21 vs Section 8"
        subtitle="A practical landlord guide to understanding the difference between Section 21 and Section 8 and deciding which route fits the case best."
        primaryCta={{
          label: 'View post-ban possession support',
          href: completePackProductLink,
        }}
        secondaryCta={{
          label: 'Read the Section 21 transition guide',
          href: '/section-21-ban-uk',
        }}
        mediaSrc="/images/wizard-icons/05-choice-decision.png"
        mediaAlt="Section 21 vs Section 8 eviction route comparison guide"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains when landlords in England usually use Section 21,
          when Section 8 is more appropriate, and how to compare compliance risk,
          evidence strength, and possession strategy before serving notice.
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
            <SeoPageContextPanel pathname="/section-21-vs-section-8" />
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                Section 21 and Section 8 are the two main eviction notice routes used by
                landlords in England, but they solve different problems. Section 21 is the
                route landlords usually think about when they want possession of the property
                without needing to prove a tenant breach. Section 8 is the route landlords
                usually think about when there is a specific problem such as rent arrears,
                anti-social behaviour, damage, or another tenancy breach that can be relied on.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The practical decision is rarely just about which form looks easier. The
                stronger question is usually: what does this file support best? A landlord
                with a clean compliance history but weaker breach evidence may lean toward
                Section 21. A landlord with clear arrears schedules or other strong breach
                evidence may lean toward Section 8. In some cases, the answer is not one or
                the other. It may be both.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The most important point is that landlords usually get better results when
                they choose the route based on evidence strength, compliance strength, and
                the real objective of the case rather than on frustration alone.
              </p>
            </Card>

            <Card id="what-is-section-21" title="What Section 21 Is">
              <p className="mt-4 leading-7 text-gray-700">
                Section 21 is commonly described as the no-fault possession route. In plain
                English, that means the landlord does not need to prove that the tenant has
                breached the tenancy agreement in order to seek possession. Instead, the route
                depends on the tenancy being at the right stage and the landlord having met
                the compliance requirements that support the use of Form 6A.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is why Section 21 often looks simple from the outside but is actually a
                document-sensitive route. It may not depend on proving fault, but it does
                depend heavily on deposit handling, prescribed information, required records,
                timing, and service. In practice, the route works best where the landlord’s
                file is clean and can show that the necessary steps were handled properly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually think about Section 21 where the main goal is possession of
                the property itself rather than proving a specific breach. It is often viewed
                as the cleaner route where compliance has been handled well and the tenancy
                facts support it.
              </p>
            </Card>

            <Card id="what-is-section-8" title="What Section 8 Is">
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 is a grounds-based possession route. That means the landlord relies
                on legal grounds showing that the tenant has breached the tenancy agreement or
                that another statutory reason for possession exists. The route is not built on
                compliance in the same way Section 21 is. It is built much more directly on
                facts, evidence, and proof.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The most common Section 8 cases involve rent arrears, especially where the
                landlord relies on Grounds 8, 10 and 11. But the route is wider than arrears
                alone. It can also be used for other tenancy problems where the facts support
                the relevant ground.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Section 8 usually becomes stronger when the landlord has a
                disciplined evidence file. If the arrears schedule is clear, the payment
                records reconcile, and the breach history is well documented, Section 8 can be
                a very direct route. If the evidence is messy, the route usually becomes harder.
              </p>
            </Card>

            <Card id="key-differences" title="Key Differences">
              <p className="mt-4 leading-7 text-gray-700">
                The most useful way to compare Section 21 and Section 8 is not just to ask
                whether one is no-fault and the other is fault-based. The better comparison is
                to ask what each route needs in order to work well. They are both possession
                routes, but they depend on different kinds of strength in the landlord’s file.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Section 21 is usually strongest where the compliance file is clean.</li>
                <li>Section 8 is usually strongest where the evidence of breach is clear.</li>
                <li>Section 21 is often used where possession itself is the main objective.</li>
                <li>Section 8 is often used where the tenant’s conduct or arrears is central.</li>
                <li>Section 8 can align more naturally with arrears-based arguments.</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually choose between them by asking whether
                the stronger part of the file is the compliance side or the breach-evidence side.
              </p>
            </Card>

            <Card id="when-landlords-use-section-21" title="When Landlords Use Section 21">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually use Section 21 where they want possession of the property
                and do not need to build the route around an alleged tenant breach. This often
                happens where the tenancy has reached the right stage, the compliance file is
                clean, and the landlord simply wants the property back for a legitimate next
                step such as sale, reoccupation, or re-letting.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                It is also a route landlords often prefer where the breach case is not strong
                enough to be the centre of the strategy. A landlord may suspect poor conduct or
                inconsistent payment behaviour, but if the evidence behind that conduct is thin,
                Section 21 may still be the more controlled route if the compliance position
                supports it.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Section 21 usually makes more sense where the landlord’s
                strongest argument is not “the tenant breached the tenancy,” but “the property
                should now be returned and the compliance file supports the route.”
              </p>
            </Card>

            <Card id="when-landlords-use-section-8" title="When Landlords Use Section 8">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually use Section 8 where there is a clear breach that can be
                evidenced well enough to support the legal grounds. Rent arrears are the most
                obvious example. If the tenant has fallen behind and the landlord has a strong
                arrears schedule, Section 8 may be the more natural route because it fits the
                real problem in the tenancy.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Section 8 may also be preferred where the landlord wants the case to focus on
                what actually went wrong rather than relying mainly on route compliance. That
                often makes sense where the evidence is already strong and the landlord wants a
                route built around the breach itself.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Section 8 is usually a better fit where the tenancy file
                can tell a clear story about the breach and support it with documents, dates,
                and records that make sense under pressure.
              </p>
            </Card>

            <Card id="rent-arrears-strategy" title="Rent Arrears Strategy">
              <p className="mt-4 leading-7 text-gray-700">
                Rent arrears are where the Section 21 versus Section 8 decision becomes most
                commercially important. Many landlords instinctively move toward Section 8 in
                arrears cases because rent arrears are a direct breach and Grounds 8, 10 and 11
                are designed for that situation. That instinct often makes sense, but only if
                the arrears file is strong.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A strong arrears file usually means one clean rent schedule, payment records
                that reconcile properly, and a clear chronology showing what was due, what was
                paid, and what remained outstanding. If those basics are missing, Section 8 may
                still be possible, but it becomes harder to run confidently.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords in arrears cases usually need to ask two separate
                questions. Is the breach file strong enough for Section 8? And is the compliance
                file strong enough for Section 21? The best strategy often comes from answering
                both rather than assuming the arrears alone make the decision automatically.
              </p>
            </Card>

            <Card id="serving-both" title="Serving Both Notices">
              <p className="mt-4 leading-7 text-gray-700">
                In some cases landlords serve both Section 21 and Section 8. This usually
                happens where the facts support both routes and the landlord wants to avoid
                relying on a single path. Rent arrears cases are a common example. The arrears
                may support Section 8, while the wider compliance file may still support Section 21.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Serving both is not a magic shortcut, and it does not remove the need to get
                each route right. Each notice still has to stand on its own. Section 21 still
                needs a clean compliance and service file. Section 8 still needs proper grounds,
                correct notice logic, and evidence that actually supports the breach.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, serving both notices is usually about route protection, not
                aggression. Landlords sometimes do it because the real question is not which route
                sounds stronger in theory, but which route remains strongest once the case starts
                moving through the system.
              </p>
            </Card>

            <CtaBand
              title="Need the route checked before you serve the wrong notice?"
              body="Notice Only is usually the better fit where the route is already broadly clear and the main need is getting the notice stage right. Complete Pack is usually stronger where the wider possession file, route choice, and later court continuity also need support."
              primaryHref={completePackProductLink}
              primaryLabel="View post-ban possession support"
              secondaryHref={noticeOnlyProductLink}
              secondaryLabel="Legacy notice route only"
            />

            <Card id="evidence-compliance" title="Evidence and Compliance Considerations">
              <p className="mt-4 leading-7 text-gray-700">
                One of the clearest ways to compare the two routes is to compare what kind of
                file each route needs. Section 21 usually lives or dies on compliance, timing,
                form, and service. Section 8 usually lives or dies on evidence, grounds, and
                whether the breach can be proved clearly enough.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This means landlords usually do best by reviewing the stronger side of the file
                before choosing the route. If the landlord has a clean deposit record, good
                prescribed document history, and a reliable service process, Section 21 may be
                very attractive. If the landlord has an excellent arrears schedule, clear payment
                records, and strong breach evidence, Section 8 may be the more natural route.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the route decision is often less about what the landlord
                prefers in theory and more about what the file can support without strain.
              </p>
            </Card>

            <Card id="court-process" title="Court Process Differences">
              <p className="mt-4 leading-7 text-gray-700">
                Both routes can lead to possession proceedings, but they tend to create
                different pressure points once the case moves forward. Section 21 cases often
                focus more heavily on compliance, notice validity, and service proof. Section 8
                cases often focus more heavily on the quality of the evidence and whether the
                legal grounds are actually established on the facts.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why route choice matters early. A weak Section 21 compliance file may
                not look serious until later, when the notice has to be relied on. A weak
                Section 8 evidence file may not look serious until the landlord has to prove the
                breach under pressure. In both cases, early file review usually saves more time
                than late correction.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get better possession outcomes when the
                chosen notice matches the kind of case they are actually able to prove.
              </p>
            </Card>

            <Card id="common-mistakes" title="Common Landlord Mistakes">
              <p className="mt-4 leading-7 text-gray-700">
                The most common mistake is choosing the route emotionally instead of choosing
                it from the file. A landlord may feel that arrears make Section 8 obvious or
                that no-fault possession makes Section 21 automatically easier, but neither
                route works well if the supporting file is weak.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Serving Section 8 without a clean evidence file.</li>
                <li>Serving Section 21 without reviewing compliance properly.</li>
                <li>Assuming one notice is always faster than the other.</li>
                <li>Ignoring service proof.</li>
                <li>Failing to think about fallback strategy where both routes may be possible.</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get better results when they ask which
                route the file supports best, rather than which route sounds best in theory.
              </p>
            </Card>

            <Card id="eviction-timeline" title="Eviction Timeline and Common Delay Points">
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
                This is why route choice matters so much. A landlord cannot control how busy
                the court system is, but a landlord can control whether the case enters that
                system with a clean notice file. Weak Section 21 compliance, weak Section 8
                evidence, or poor service proof can all create avoidable delay long before the
                court backlog becomes the main problem.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually have the most control over the notice
                stage, the evidence pack, the compliance review, and the service record. Those
                are the areas where delay can most often be prevented instead of explained away.
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
                Landlords comparing Section 21 and Section 8 are often deciding not just which
                notice to use, but how much support the wider file now needs. Some cases are
                still basically notice-stage cases. Others are already broader possession files
                where route choice, court continuity, and overall file control matter just as much.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the route is already broadly clear
                and the main need is getting the notice stage handled correctly. It tends to fit
                landlords who mainly need controlled drafting, timing, and service at the notice stage.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is usually the stronger fit where the landlord needs broader help
                with route control, court preparation, possession planning, and continuity across
                the whole case. It tends to matter more where the tenancy history is messy, the
                route choice is commercially important, or delay would be especially costly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, use Notice Only where the issue is mainly the notice. Use
                Complete Pack where the wider possession workflow also needs to be controlled carefully.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Section 21 vs Section 8 FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Before choosing between Section 21 and Section 8, review what the file actually
              supports. A clean compliance file may make Section 21 more attractive. A strong
              breach and arrears file may make Section 8 the more direct route.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The strongest results usually come from landlords who choose the route from the
              evidence, not from instinct alone. That usually means looking at compliance,
              timing, service, grounds, and proof together before notice is served.
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
