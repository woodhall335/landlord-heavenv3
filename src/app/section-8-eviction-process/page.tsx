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

const canonical = 'https://landlordheaven.co.uk/section-8-eviction-process';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Section 8 Eviction Process 2026 | Step-by-Step Guide for Landlords',
  description:
    'Plain-English landlord guide to the Section 8 eviction process in England, from notice choice and evidence through to hearing and enforcement.',
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'Section 8 Eviction Process 2026 | Step-by-Step Guide for Landlords',
    description:
      'Learn how the Section 8 eviction process works in England, from notice service to possession order and enforcement.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Section 8 Eviction Process 2026 | LandlordHeaven',
    description:
      'Plain-English landlord guide to the Section 8 eviction process in England.',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-is-the-section-8-process', label: 'What is the Section 8 process?' },
  { href: '#when-landlords-use-section-8', label: 'When landlords use Section 8' },
  { href: '#section-8-notice-stage', label: 'Section 8 notice stage' },
  { href: '#court-claim-stage', label: 'Court claim stage' },
  { href: '#hearing-stage', label: 'Hearing stage' },
  { href: '#section-8-timeline', label: 'Timeline' },
  { href: '#common-section-8-mistakes', label: 'Common mistakes' },
  { href: '#evidence-landlords-need', label: 'Evidence landlords need' },
  { href: '#notice-only-vs-complete-pack', label: 'Notice Only vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What is the Section 8 eviction process?',
    answer:
      'The Section 8 eviction process is the route landlords in England use when they want possession based on a tenant breach, such as rent arrears, anti-social behaviour, property damage, or another tenancy breach.',
  },
  {
    question: 'Does the Section 8 process usually involve a hearing?',
    answer:
      'Usually yes. Most Section 8 claims are more hearing-led than accelerated possession because the court often needs to assess the grounds relied on, the evidence, and any response from the tenant.',
  },
  {
    question: 'What notice is used for the Section 8 process?',
    answer:
      'Landlords usually begin the Section 8 process by serving a Section 8 notice using Form 3 and citing the legal grounds they rely on.',
  },
  {
    question: 'Can landlords use more than one ground in a Section 8 notice?',
    answer:
      'Yes. Landlords often rely on multiple grounds where the facts support them, especially in rent arrears cases where more than one ground can strengthen the route.',
  },
  {
    question: 'How long does the Section 8 eviction process take?',
    answer:
      'The timeline varies depending on the grounds used, court availability, hearing delay, and whether the tenant defends the claim. Landlords should think in stages rather than assume one fixed timescale.',
  },
  {
    question: 'What happens if the tenant stays after a Section 8 possession order?',
    answer:
      'If the tenant does not leave by the possession date, the landlord usually needs to apply for enforcement so possession can be recovered lawfully.',
  },
  {
    question: 'What is the biggest mistake in the Section 8 process?',
    answer:
      'One of the biggest mistakes is using the wrong grounds or relying on weak evidence. Section 8 is a breach-based route that depends heavily on proof, route choice, and hearing readiness.',
  },
  {
    question: 'Should I use Notice Only or the Complete Eviction Pack?',
    answer:
      'Notice Only is often the better fit where your Section 8 route is already clear and you mainly need the notice handled properly. The Complete Eviction Pack is usually better where you want broader support across notice, court preparation, and possession planning.',
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
        pagePath="/section-8-eviction-process"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Section 8 Eviction Process',
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
          { name: 'Section 8 Eviction Process', url: canonical },
        ])}
      />

      <UniversalHero
        title="Section 8 Eviction Process"
        subtitle="A step-by-step guide to the breach-based possession route landlords use when a tenant has broken the tenancy."
        primaryCta={{ label: 'Start Section 8 Notice', href: '/products/notice-only' }}
        secondaryCta={{ label: 'Start Complete Eviction Pack', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/09-court.png"
        mediaAlt="Section 8 process guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          Learn how the Section 8 route usually moves from notice service to court claim,
          hearing, possession order, and enforcement if the tenant still does not leave.
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
              pathname="/section-8-eviction-process"
              className="border border-[#E6DBFF] bg-[#FBF8FF]"
            />
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                The Section 8 eviction process is the route landlords in England use when
                they want possession because the tenant has breached the tenancy agreement.
                Instead of relying on a no-fault route, the landlord relies on one or more
                legal grounds such as rent arrears, anti-social behaviour, property damage,
                or another tenancy breach.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In simple terms, the process usually runs through five stages: choose the
                right grounds, serve the Section 8 notice, issue the possession claim if
                the problem is not resolved, prepare for the hearing, and then move to
                enforcement if the tenant still remains after the possession order.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                What makes Section 8 different from the accelerated route is that it is
                usually more evidence-heavy and more hearing-led. The court will often want
                to assess the grounds relied on, the documents supporting them, and any
                response raised by the tenant. That means landlords do best when they treat
                Section 8 as a structured case file rather than a one-form exercise.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The strongest Section 8 cases begin before court. Good route choice, a
                correct notice, clean service evidence, and a consistent chronology often
                matter more than speed. In practice, the safest route is usually the one
                least likely to fall apart once a judge looks closely at it.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                That usually means starting from the{' '}
                <Link href="/section-8-notice" className="font-medium text-primary hover:underline">
                  Section 8 notice guide
                </Link>
                , keeping the broader sequence anchored to the{' '}
                <Link href="/eviction-process-uk" className="font-medium text-primary hover:underline">
                  eviction process in the UK
                </Link>
                , and switching to the{' '}
                <Link href="/products/complete-pack" className="font-medium text-primary hover:underline">
                  Complete Pack product page
                </Link>{' '}
                once the issue is clearly moving from notice into court preparation.
              </p>
            </Card>

            <Card id="what-is-the-section-8-process" title="What Is the Section 8 Process?">
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 is the possession route used where the landlord wants to recover
                the property because the tenant has broken the tenancy agreement or because
                a specific statutory ground for possession applies. It is a breach-based
                route, which means the legal case depends on proving what happened rather
                than simply showing that a tenancy has come to an end through a no-fault
                process.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The route starts with a Section 8 notice, usually on Form 3, which sets out
                the legal grounds being relied on. If the tenant does not put things right,
                leave the property, or otherwise resolve the issue, the landlord can then
                issue a possession claim in the county court. In most cases the court will
                list a hearing so the judge can assess the grounds and the evidence.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                This means the Section 8 process should be understood as a managed sequence:
                notice, evidence development, claim issue, hearing preparation, possession
                order, and then enforcement if needed. Landlords who skip the middle stages
                and focus only on the notice often discover that their case weakens later.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                It is also important to distinguish between understanding Section 8 grounds
                and understanding the Section 8 process. Grounds tell you why you may seek
                possession. Process tells you how to move from that reason to a possession
                order in a way that stands up in court.
              </p>
            </Card>

            <Card id="when-landlords-use-section-8" title="When Landlords Use Section 8">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually use Section 8 where there is a clear tenancy problem that
                can be linked to a recognised legal ground. The most common example is rent
                arrears, but it is far from the only one. Section 8 can also be relevant
                where there is persistent late payment, anti-social behaviour, damage,
                breach of tenancy terms, false statements, or other conduct that gives the
                landlord a legal basis for possession.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Section 8 is usually the better fit where the landlord
                wants the possession route to reflect the actual problem. If the case is
                really about arrears, nuisance, or serious breach, a route built around
                those facts is often more natural than trying to frame the matter through a
                no-fault lens.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                That said, landlords should not assume Section 8 is automatically stronger
                just because the tenant has behaved badly. The route only works well where
                the correct grounds are chosen and the evidence matches them. A strong case
                is not just a story the landlord believes. It is a story the court can
                follow from documents, dates, statements, and a consistent chronology.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 is especially common in high-intent landlord scenarios such as
                serious rent arrears cases, repeated non-payment patterns, anti-social
                behaviour affecting neighbours, or situations where the landlord wants the
                court to deal directly with the breach rather than simply recover
                possession without addressing the underlying conduct.
              </p>
            </Card>

            <Card id="section-8-notice-stage" title="Section 8 Notice Stage">
              <p className="mt-4 leading-7 text-gray-700">
                The first stage of the process is service of the Section 8 notice. This is
                where the landlord identifies the legal grounds being relied on and gives
                the tenant the required notice period. The quality of this stage matters
                far more than many landlords expect because the later court claim depends on
                the notice being correct.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                A good Section 8 notice file does three things well. First, it selects
                grounds that actually fit the facts. Second, it describes the basis of the
                claim clearly enough for the tenant and the court to understand what the
                landlord is relying on. Third, it preserves proof of service so there is no
                uncertainty later about when and how the notice was given.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In rent arrears cases, this is also the point where landlords should decide
                whether to rely on multiple grounds. A main ground may matter most, but
                supporting grounds can still help if the facts shift before the hearing. A
                strong notice should not only reflect the facts on the day it is served. It
                should also be resilient enough to support the claim later.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Service quality matters too. Landlords should keep evidence showing exactly
                when and how the notice was served. Where the route becomes contested later,
                poor proof of service can damage a case that otherwise had merit. Good
                landlords therefore treat notice service as part of the evidence pack, not
                as a routine admin task.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Choose grounds that genuinely match the tenancy problem</li>
                <li>Use the correct notice form and dates</li>
                <li>Keep a clear arrears schedule or breach chronology</li>
                <li>Preserve proof of service from day one</li>
                <li>Assume the notice may later be read closely by a judge</li>
              </ul>
            </Card>

            <CtaBand
              title="Need the Section 8 notice stage handled properly?"
              body="Use Notice Only if your route is already clear and you mainly need the Section 8 notice prepared correctly. Use the Complete Eviction Pack if you want broader support across notice, court preparation, and possession planning."
              primaryHref="/products/notice-only"
              primaryLabel="Start Section 8 Notice"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Start Complete Eviction Pack"
            />

            <Card id="court-claim-stage" title="Court Claim Stage">
              <p className="mt-4 leading-7 text-gray-700">
                If the tenant does not resolve the issue or leave the property after the
                notice period expires, the next step is the court claim. This is where the
                landlord turns the notice file into a possession case. In practice, the
                court stage is where weak preparation starts to show, because every gap in
                the notice file tends to become more expensive once proceedings begin.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The landlord should enter this stage with one organised chronology. That
                chronology should explain the tenancy, the breach, the dates, the notice,
                and the evidence that supports each point. In rent arrears cases, that
                means an up-to-date arrears schedule. In behaviour cases, it means dated
                complaints, statements, logs, or supporting material that clearly connects
                the facts to the grounds relied on.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                A common mistake at this point is assuming that because the landlord knows
                what happened, the court will understand it automatically. Courts respond
                best to files that are easy to follow. If the documents are inconsistent or
                the chronology is unclear, the landlord gives away some of the advantage of
                having a good case.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Good claim preparation is often about contradiction control. The dates in
                the notice, the witness statement, the arrears schedule, the tenancy
                agreement, and the service records should all line up. Even small errors
                can invite challenge because they make the court question the reliability
                of the whole file.
              </p>
            </Card>

            <Card id="hearing-stage" title="Hearing Stage">
              <p className="mt-4 leading-7 text-gray-700">
                Most Section 8 claims involve a hearing. That is one of the biggest
                practical differences between this route and accelerated possession. At the
                hearing, the judge will consider the grounds relied on, the documents filed,
                any tenant response, and whether possession should be granted.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                Hearing preparation is not just about gathering papers. It is about knowing
                how the case works. The landlord or representative should be able to
                explain the tenancy history, the breach relied upon, the notice served, and
                the evidence that proves each point. If the case is discretionary, the
                judge will also consider whether it is reasonable to make a possession
                order, so the landlord should be ready to address that too.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In rent cases, landlords should arrive with updated figures. In behaviour
                cases, they should expect the court to look closely at the quality of the
                evidence and whether the alleged conduct is clearly linked to the statutory
                ground. In all cases, the hearing goes better when the file tells one
                consistent story instead of several disconnected ones.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                A practical way to prepare is to reduce the case to a short hearing map:
                what ground is relied on, what facts prove it, what document supports each
                fact, and what order the landlord is asking the court to make. Judges
                appreciate clarity. Landlords usually benefit when their file is easy to
                navigate under pressure.
              </p>
            </Card>

            <Card id="section-8-timeline" title="Section 8 Timeline">
              <p className="mt-4 leading-7 text-gray-700">
                The Section 8 timeline varies depending on the grounds used, the tenant’s
                response, and court availability. Landlords should think in stages rather
                than assume one fixed end date. The real timeline is shaped by the notice
                period, the speed of claim issue, the hearing date, and whether enforcement
                is needed afterwards.
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
                      <td className="px-4 py-3 font-medium">Notice stage</td>
                      <td className="px-4 py-3">Section 8 notice is served with the chosen grounds</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Pre-claim period</td>
                      <td className="px-4 py-3">Tenant may remedy the breach, pay, respond, or remain in default</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Court claim</td>
                      <td className="px-4 py-3">Landlord issues possession proceedings</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Hearing</td>
                      <td className="px-4 py-3">Judge considers grounds, evidence, and any defence</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Possession order</td>
                      <td className="px-4 py-3">Court decides whether and when possession should be given</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Enforcement if needed</td>
                      <td className="px-4 py-3">Landlord applies for lawful recovery if the tenant stays</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                The biggest reason some cases feel quick and others feel slow is not only
                the court’s backlog. It is also whether the file was ready for each stage.
                A landlord who issues with the wrong grounds, unclear evidence, or weak
                service records often creates delay that could have been avoided.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In practical planning terms, the landlord should expect the route to take
                time and should avoid best-case financial assumptions. Strong preparation
                cannot control the court diary, but it can reduce the risk of self-inflicted
                delay, which is often the most avoidable kind.
              </p>
            </Card>

            <Card id="common-section-8-mistakes" title="Common Section 8 Mistakes">
              <p className="mt-4 leading-7 text-gray-700">
                The most common Section 8 failures usually come from weak preparation rather
                than unusual legal complications. Because the route depends on proving a
                breach, mistakes in route choice and evidence handling tend to matter much
                more than landlords first expect.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Using the wrong ground.</span>
                  <span className="block">
                    The legal ground has to match the real facts of the case, not just the
                    landlord’s frustration.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Relying on weak proof.</span>
                  <span className="block">
                    General allegations are not enough. The court usually wants dated,
                    structured evidence.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Poor notice drafting or service.</span>
                  <span className="block">
                    A defective notice can undermine the claim before the hearing even
                    begins.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Failing to update the file.</span>
                  <span className="block">
                    Arrears figures, payment history, and the factual position can change
                    between notice and hearing.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Turning up underprepared for the hearing.</span>
                  <span className="block">
                    Section 8 is usually a hearing-led route, so landlords need to be ready
                    to explain the case clearly.
                  </span>
                </li>
              </ul>
              <p className="mt-4 leading-7 text-gray-700">
                Another common problem is inconsistency. One date in the notice, a
                different figure in the arrears schedule, and another story in a witness
                statement can damage credibility even where the underlying case had merit.
                Possession work often turns on reliability, which is why disciplined file
                control matters so much.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The safest approach is to treat Section 8 like a structured litigation file
                from day one. One chronology, one evidence index, one route note, and one
                clear hearing objective will usually outperform a stack of loosely related
                documents created in stages.
              </p>
            </Card>

            <Card id="evidence-landlords-need" title="Evidence Landlords Usually Need">
              <p className="mt-4 leading-7 text-gray-700">
                Section 8 is only as strong as the evidence behind it. Landlords often know
                exactly what the tenant has done wrong, but the court still needs that story
                translated into reliable documents and a clear chronology.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                In arrears cases, that usually means an up-to-date arrears schedule,
                payment history, tenancy terms on rent, and a clean explanation of how the
                balance has arisen. In behaviour or damage cases, it often means dated
                complaints, inspection records, photographs, statements, logs, repair
                invoices, correspondence, and anything else that links the conduct to the
                ground relied on.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The point is not to create volume for the sake of it. The point is to make
                the case easy to follow. A smaller, organised file usually performs better
                than a large but chaotic one.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Tenancy agreement and key tenancy terms</li>
                <li>Notice copy and proof of service</li>
                <li>Arrears schedule where rent is involved</li>
                <li>Complaint logs, statements, or inspection notes where behaviour is involved</li>
                <li>One clear chronology tying the evidence together</li>
              </ul>
            </Card>

            <Card
              id="notice-only-vs-complete-pack"
              title="Notice Only vs Complete Eviction Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Many landlords reading about the Section 8 eviction process are not just
                looking for general guidance. They are deciding what level of support their
                case now needs.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Notice Only</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Notice Only is usually the better fit where the Section 8 route is already
                clear, the landlord knows which grounds should be used, and the main need
                is to get the notice stage handled properly. It tends to suit landlords who
                already understand the wider possession process and mainly need the first
                formal step completed correctly.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">
                Complete Eviction Pack
              </h3>
              <p className="mt-2 leading-7 text-gray-700">
                The Complete Eviction Pack is usually the stronger fit where the landlord
                wants broader route validation, stronger document control, and more support
                across the wider possession process. That matters most where the case is
                more complex, the evidence needs tighter handling, or the consequences of a
                failed or delayed claim are high.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, Notice Only is for cleaner notice-led cases. Complete
                Pack is for cases where the wider court workflow still needs to be managed
                carefully from notice through hearing and possible enforcement.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Section 8 Eviction Process FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              The Section 8 eviction process works best when the route is validated early,
              the correct grounds are chosen, and the evidence file is built before the
              case reaches court. Because Section 8 is usually hearing-led, preparation is
              often the difference between a controlled claim and a messy one.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If your Section 8 route is already clear and you mainly need the notice
              stage, start with Notice Only. If you want broader support across notice,
              evidence preparation, court readiness, and possession planning, start with
              the Complete Eviction Pack.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products/notice-only"
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                Start Section 8 Notice
              </Link>
              <Link
                href="/products/complete-pack"
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Start Complete Eviction Pack
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
