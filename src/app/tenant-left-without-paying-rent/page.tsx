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

const canonical =
  'https://landlordheaven.co.uk/tenant-left-without-paying-rent';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Tenant Left Without Paying Rent | Recover Rent Arrears After a Tenant Leaves',
  description:
    'Plain-English landlord guide to recovering unpaid rent after a tenant leaves, including final balance checks, evidence, and money-claim decisions.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Tenant Left Without Paying Rent | Recover Rent Arrears After a Tenant Leaves',
    description:
      'Plain-English landlord guidance on unpaid rent after a tenant leaves. Confirm the final balance, separate arrears from end-of-tenancy issues, and decide whether recovery is worth pursuing.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#final-balance', label: 'Confirm the final balance' },
  { href: '#documents-you-need', label: 'Documents you need' },
  { href: '#common-mistakes', label: 'Common mistakes' },
  { href: '#money-claim-vs-complete-pack', label: 'Money Claim vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What should I do if a tenant leaves owing rent?',
    answer:
      'The first step is confirming the final balance properly. Landlords usually review the tenancy agreement, rent due dates, payment records, and any final adjustments so they know exactly what is still owed before deciding on recovery.',
  },
  {
    question: 'Can I recover unpaid rent after a tenant leaves?',
    answer:
      'Yes. A tenant leaving the property does not automatically remove the rent debt. Landlords can still consider recovery, but the strength of the case usually depends on how clear the arrears schedule and supporting records are.',
  },
  {
    question: 'Can I claim rent arrears after the tenancy ends?',
    answer:
      'In many cases, yes. The key issue is usually not whether the tenancy has ended, but whether the landlord can show a clean final balance, a clear rent history, and documents that explain how the debt figure was calculated.',
  },
  {
    question: 'Does the deposit automatically clear the rent arrears?',
    answer:
      'Not automatically. The deposit may contribute to the overall balance depending on the tenancy terms and how the final figures are handled, but landlords still need to calculate the arrears clearly rather than assume the deposit solves everything.',
  },
  {
    question: 'What evidence matters most when the tenant has left without paying rent?',
    answer:
      'The most important documents usually include the tenancy agreement, a clear arrears schedule, payment records, the tenancy timeline, and any documents showing how the final balance was calculated.',
  },
  {
    question: 'Is it always worth pursuing unpaid rent?',
    answer:
      'Not always. Landlords should think both legally and commercially. A debt may be real, but that does not automatically mean recovery will be practical or proportionate.',
  },
  {
    question: 'What is the biggest mistake landlords make once the tenant has gone?',
    answer:
      'A common mistake is assuming they already know the final balance without checking it properly. Weak calculations and mixed-up records often cause more problems later than the arrears themselves.',
  },
  {
    question: 'Should I separate rent arrears from damage or cleaning issues?',
    answer:
      'Yes. Landlords usually do best when pure rent arrears are kept separate from damage, cleaning, utilities, belongings, or deposit disputes. The cleaner the categories are, the easier the position is to explain.',
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
        pagePath="/tenant-left-without-paying-rent"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Tenant Left Without Paying Rent',
          description: metadata.description as string,
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-31',
        })}
      />

      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          {
            name: 'Eviction guides',
            url: 'https://landlordheaven.co.uk/eviction-guides',
          },
          { name: 'Tenant Left Without Paying Rent', url: canonical },
        ])}
      />

      <StructuredData
        data={faqPageSchema(
          faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          }))
        )}
      />

      <UniversalHero
        title="Tenant Left Without Paying Rent"
        subtitle="Confirm what is still owed, separate pure rent arrears from end-of-tenancy issues, and decide whether it makes sense to pursue recovery with a stronger money-claim file."
        primaryCta={{
          label: 'Start recovering unpaid rent',
          href: '/products/money-claim',
        }}
        secondaryCta={{
          label: 'Compare claim routes',
          href: '#money-claim-vs-complete-pack',
        }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Recover unpaid rent after a tenant leaves landlord guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains how landlords usually approach unpaid rent after a
          tenant leaves, how to confirm the final arrears balance, what documents
          matter most, and when it makes sense to turn the file into a money
          claim instead of treating it as a vague leftover tenancy dispute.
        </p>
      </UniversalHero>

      <section className="border-b border-[#E6DBFF] bg-white py-8">
        <Container>
          <div className="mx-auto mb-6 max-w-5xl">
            <SeoPageContextPanel pathname="/tenant-left-without-paying-rent" />
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <nav
              aria-labelledby="guide-links-heading"
              className="rounded-2xl border border-[#E6DBFF] bg-white p-6"
            >
              <h2
                id="guide-links-heading"
                className="text-2xl font-semibold text-[#2a2161]"
              >
                In This Guide
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {jumpLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-xl border border-[#E6DBFF] px-4 py-4 text-primary transition hover:bg-[#F8F4FF]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>

            <div className="rounded-2xl border border-[#E6DBFF] bg-[linear-gradient(180deg,#fbf8ff_0%,#f3ebff_100%)] p-6">
              <h3 className="text-xl font-semibold text-[#2a2161]">
                Former tenant owes rent?
              </h3>

              <p className="mt-3 leading-7 text-gray-700">
                Once the tenant has already gone, landlords usually get better
                results by treating the file as a debt-recovery problem, not as a
                leftover possession problem.
              </p>

              <div className="mt-5 grid gap-3">
                {[
                  'Confirm the final rent arrears balance',
                  'Separate arrears from cleaning, damage, and deposit issues',
                  'Organise the documents into one recovery-ready file',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-[#E6DBFF] bg-white px-4 py-3 text-sm text-gray-700"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/products/money-claim"
                  className="rounded-lg bg-primary px-5 py-3 text-white"
                >
                  Start Money Claim Pack
                </Link>
                <Link
                  href="#money-claim-vs-complete-pack"
                  className="rounded-lg border border-[#D8C8FF] bg-white px-5 py-3 text-primary"
                >
                  Which route do I need?
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                When a tenant leaves without paying rent, the occupation problem
                and the money problem stop being the same thing. The tenant may
                have gone, but the rent debt may still remain. That means the
                next task is usually not possession. It is confirming what is
                still owed and deciding whether the file is strong enough to
                support recovery.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the first job is not chasing the debt
                aggressively. It is confirming the final balance properly.
                Landlords usually need to review the tenancy agreement, check the
                rent due dates, compare those dates with the payments received,
                and calculate the final balance up to the point the tenant left
                or the tenancy ended.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The strongest cases to recover unpaid rent after a tenant leaves
                usually come from landlords who can produce one clean chronology.
                That chronology should show what rent was due, what was paid,
                where the shortfalls happened, and what figure remained
                outstanding at the end. If the file is messy, unclear, or full of
                assumptions, the main problem is often not whether the money is
                owed. It is proving the figure cleanly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The safest way to think about this page is simple. A former
                tenant owing rent does not automatically wipe out the arrears.
                But landlords usually get the best outcome when they stop, tidy
                the file, separate pure rent arrears from every other tenancy-end
                issue, and then decide what step makes commercial and legal sense
                next.
              </p>
            </Card>

            <div className="rounded-2xl border border-[#E6DBFF] bg-[#F7F1FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">
                Do you have a recovery-ready arrears file?
              </h2>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords usually do better once the tenant has left if they stop,
                confirm the final balance, and turn the tenancy records into one
                clean arrears chronology before pursuing recovery.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  'Final rent balance confirmed',
                  'Arrears schedule reconciled',
                  'Payment history checked',
                  'Deposit kept separate from pure arrears',
                  'Supporting documents gathered',
                  'One clean chronology prepared',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-[#E6DBFF] bg-white px-4 py-3 text-sm text-gray-700"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/products/money-claim"
                  className="rounded-lg bg-primary px-5 py-3 text-white"
                >
                  Start Money Claim Pack
                </Link>
                <Link
                  href="#money-claim-vs-complete-pack"
                  className="rounded-lg border border-[#D8C8FF] bg-white px-5 py-3 text-primary"
                >
                  Compare claim routes
                </Link>
              </div>
            </div>

            <Card
              id="what-it-usually-means"
              title="What It Usually Means When a Tenant Leaves Owing Rent"
            >
              <p className="mt-4 leading-7 text-gray-700">
                When landlords say a tenant left without paying rent, several
                different things may be happening at once. In some cases the
                tenant simply moved out after falling behind over a period of
                time. In other cases the tenant left during or after a dispute.
                Sometimes the tenancy had already reached a formal possession
                stage. Sometimes the tenant just disappeared and the landlord was
                left trying to work out what was unpaid.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is why the phrase sounds simple but the file behind it is
                often not. One landlord may be dealing with one missed month and
                a clean record. Another may be dealing with a long running
                arrears history, part-payments, changing promises, deposit
                issues, property condition issues, and uncertainty about the
                exact date the tenant really vacated. These details matter
                because they change what the final balance looks like and how
                easy it is to prove.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The practical shift is that once the tenant has gone, landlords
                are no longer asking how to recover occupation. They are asking
                what is still owed, how reliable the evidence is, and whether it
                is sensible to pursue that balance. That is a different kind of
                file. It needs cleaner numbers, cleaner categories, and clearer
                thinking than many landlords realise.
              </p>
            </Card>

            <Card
              id="first-things-to-check"
              title="First Things to Check After the Tenant Has Gone"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Before looking at recovery, landlords usually need to stabilise
                the facts. That means confirming when the tenant actually left,
                whether the tenancy definitely ended, what rent date the account
                reached before departure, and whether there are any payments
                still in transit or recent credits not yet reflected in the
                ledger.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also the point to check whether the arrears record has
                been kept in a disciplined way. If the landlord has an up-to-date
                rent schedule already, this stage is straightforward. If not, it
                may need reconstructing from bank records, rent logs, and
                correspondence.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Confirm the date the tenant actually vacated</li>
                <li>Check the tenancy end position or possession outcome</li>
                <li>Reconcile the rent account to the relevant final date</li>
                <li>Separate rent arrears from damage or cleaning issues</li>
                <li>Make sure later credits or adjustments are not being missed</li>
              </ul>
            </Card>

            <Card id="final-balance" title="Confirm the Final Balance">
              <p className="mt-4 leading-7 text-gray-700">
                Confirming the final balance is usually the most important stage
                in the whole process. This is where the landlord stops talking in
                rough estimates and works out what is actually owed. The final
                balance should show what rent was due under the tenancy, what
                payments were received, where the shortfalls happened, and what
                figure remained outstanding at the relevant end point.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In most cases, the cleanest way to do this is through a full
                arrears schedule. A good schedule usually lists every rent due
                date, every payment received, the amount of any shortfall, and
                the running balance. If the landlord later makes an adjustment, a
                credit, or a correction, that should be shown clearly rather than
                hidden inside one unexplained total.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Many weak files fail at this stage. Not because no money is owed,
                but because the landlord cannot explain how the figure was
                reached. A debt number written in an email or remembered from a
                rough spreadsheet is not the same as a clean final arrears
                chronology. The stronger file is the one that lets somebody else
                follow the figures without guesswork.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also where precision matters more than frustration. If
                the landlord overstates the balance, ignores credits, or mixes
                rent with unrelated charges, the position becomes weaker rather
                than stronger.
              </p>
            </Card>

            <Card
              id="deposit-and-other-adjustments"
              title="Deposit and Other Adjustments"
            >
              <p className="mt-4 leading-7 text-gray-700">
                One of the most common reasons these files become confused is
                that landlords start treating the deposit as if it automatically
                solves the arrears position. In reality, the deposit may be
                relevant to the overall end-of-tenancy balance, but it does not
                remove the need for a clean arrears calculation.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The same applies to other items. If there are cleaning costs,
                damage charges, replacement items, key issues, or utility-related
                questions, landlords should usually keep them separate from the
                pure rent history. They may matter commercially, but they should
                not be allowed to blur the arrears picture.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get a cleaner outcome when
                they work in layers: first the rent debt, then any later credits,
                then any separate tenancy-end issues.
              </p>
            </Card>

            <CtaBand
              title="Tenant already gone? Focus on the debt file now."
              body="Once the occupation issue is over, landlords usually get better results by turning the file into a clean rent-arrears claim rather than treating it as a leftover eviction problem. Money Claim Pack is usually the stronger fit where the main task is proving the final balance clearly enough to pursue recovery."
              primaryHref="/products/money-claim"
              primaryLabel="Start Money Claim Pack"
              secondaryHref="#money-claim-vs-complete-pack"
              secondaryLabel="Compare claim routes"
            />

            <Card id="documents-you-need" title="Documents You Need">
              <p className="mt-4 leading-7 text-gray-700">
                Once the tenant has gone and the landlord is confirming the final
                position, the most important task is gathering the core documents
                in one place. This is not about creating the biggest possible
                file. It is about creating the clearest one.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Tenancy agreement and relevant rent clauses</li>
                <li>Full arrears schedule with running balance</li>
                <li>Bank records or payment history supporting the schedule</li>
                <li>Correspondence that helps explain the timeline</li>
                <li>Any final tenancy-end calculations or credits</li>
                <li>One concise chronology showing how the file developed</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                The most important document is often the final schedule itself.
                If that schedule is clean, the rest of the file becomes easier to
                understand. If that schedule is weak, the whole file often feels
                less reliable no matter how many extra documents are attached
                around it.
              </p>
            </Card>

            <Card
              id="how-landlords-usually-approach-it"
              title="How Landlords Usually Approach It"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most landlords do not approach this as one dramatic single
                moment. They usually move through stages. First they secure the
                property and confirm the tenant has actually gone. Then they lock
                the final arrears figure. Then they decide whether the debt file
                is strong enough and commercially worth pursuing further.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This matters because the emotional instinct is often to chase the
                money immediately. But emotional urgency is not the same thing as
                file readiness. The stronger approach is usually slower and more
                disciplined at the start.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good landlords also think commercially at this stage. A legally
                valid debt is not always a sensible recovery target. The amount
                owed, the quality of the documents, and the realistic prospect of
                recovery all matter.
              </p>
            </Card>

            <Card
              id="when-the-file-is-strong"
              title="When the File Is Strong Enough to Pursue"
            >
              <p className="mt-4 leading-7 text-gray-700">
                A better question than whether you can pursue the arrears is
                whether the file is strong enough to pursue cleanly. In practical
                terms, a strong file usually has a clear tenancy agreement, a
                clean arrears schedule, payment records that reconcile properly,
                and a final balance that can be explained without confusion.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A weak file often shows the opposite signs. The final number may
                be based on assumptions. Credits may be missing. The rent history
                may not match the bank history. Damage and arrears may be mixed
                together in the same total.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, a good test is whether somebody unfamiliar
                with the tenancy could read the key documents and understand the
                final balance quickly. If they can, the file is usually much
                closer to recovery-ready.
              </p>
            </Card>

            <Card
              id="timeline-after-the-tenant-leaves"
              title="Timeline After the Tenant Leaves"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Once the tenant has left, landlords should think in stages rather
                than assume one fixed timetable. The timeline usually depends
                less on the calendar and more on how clean the file is.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="px-4 py-3 text-left font-semibold">
                        What usually happens
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Tenant gone</td>
                      <td className="px-4 py-3">
                        Landlord confirms the property is back and stabilises the
                        basic facts
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Balance review</td>
                      <td className="px-4 py-3">
                        Rent history is reconciled and the final arrears figure is
                        checked
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Evidence clean-up</td>
                      <td className="px-4 py-3">
                        Key documents are organised into a clearer arrears file
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Decision stage</td>
                      <td className="px-4 py-3">
                        Landlord decides whether the debt is strong enough and
                        worth pursuing
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card id="common-mistakes" title="Common Mistakes Landlords Make">
              <p className="mt-4 leading-7 text-gray-700">
                Most post-tenancy arrears problems are not created by one
                dramatic error. They usually come from a series of smaller file
                mistakes that make the final balance harder to trust.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">
                    Assuming the final balance is obvious.
                  </span>
                  <span className="block">
                    Landlords often know the tenant owes money, but still need a
                    proper final schedule rather than a rough estimate.
                  </span>
                </li>
                <li>
                  <span className="font-medium">
                    Mixing rent debt with every other issue.
                  </span>
                  <span className="block">
                    Damage, cleaning, utilities, and deposit issues can confuse
                    the rent position if they are blended into one unclear total.
                  </span>
                </li>
                <li>
                  <span className="font-medium">
                    Failing to reconcile the payment records.
                  </span>
                  <span className="block">
                    A schedule that does not match the actual payment history
                    usually becomes much weaker under scrutiny.
                  </span>
                </li>
                <li>
                  <span className="font-medium">
                    Leaving the file tidy-up too late.
                  </span>
                  <span className="block">
                    The longer the landlord waits, the harder it can become to
                    reconstruct the timeline cleanly.
                  </span>
                </li>
                <li>
                  <span className="font-medium">
                    Pursuing out of frustration rather than file strength.
                  </span>
                  <span className="block">
                    Recovery decisions are usually stronger when based on
                    evidence quality and realistic recoverability.
                  </span>
                </li>
              </ul>
            </Card>

            <Card
              id="money-claim-vs-complete-pack"
              title="Money Claim Pack vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reading about a tenant moving out owing rent are often
                no longer dealing with the simplest early-stage arrears problem.
                In many cases, the main issue is now proving the final balance
                clearly, deciding whether recovery is worth pursuing, and
                turning the tenancy records into a debt-focused file.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Your situation
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Better route
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">
                        Tenant has already left and you need to recover unpaid
                        rent
                      </td>
                      <td className="px-4 py-3 font-medium">Money Claim Pack</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">
                        Possession history still matters and the file is wider
                        than pure debt
                      </td>
                      <td className="px-4 py-3 font-medium">Complete Pack</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">
                Money Claim Pack
              </h3>
              <p className="mt-2 leading-7 text-gray-700">
                Money Claim Pack is usually the stronger fit where the tenant has
                already left and the landlord now needs a debt-recovery
                workflow. It is better aligned to arrears schedules, letters
                before action, particulars, and the core steps that support a
                county court money claim.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">
                Complete Pack
              </h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is the better secondary route where the wider
                possession history, evidence continuity, or eviction-stage
                strategy still matters to the landlord&apos;s overall position.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection
          faqs={faqs}
          title="Tenant Left Without Paying Rent FAQs"
        />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">
              Next Steps
            </h2>

            <p className="mt-4 leading-7 text-gray-700">
              When a tenant leaves without paying rent, the strongest next move
              is usually not immediate pressure. It is confirming the final rent
              balance properly and turning the tenancy records into one clean
              arrears file. That means one schedule, one chronology, and one
              clear understanding of what is still owed.
            </p>

            <p className="mt-4 leading-7 text-gray-700">
              Landlords usually get better outcomes when they separate the
              occupation problem from the money problem once the tenant has gone.
              The property may be back, but the debt question still needs its
              own structured approach.
            </p>

            <p className="mt-4 leading-7 text-gray-700">
              If the tenant has already gone and your next job is recovering
              unpaid rent or turning the final balance into a clean claim, start
              with Money Claim Pack. If you still need broader possession-route
              continuity or eviction support around the wider file, use Complete
              Pack as the secondary route.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products/money-claim"
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                Start Money Claim Pack
              </Link>
              <Link
                href="/products/complete-pack"
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Need Complete Pack instead?
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
