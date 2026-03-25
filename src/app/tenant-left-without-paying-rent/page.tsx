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

export const metadata: Metadata = {
  title:
    'Tenant Left Without Paying Rent | What Landlords Should Do Next | LandlordHeaven',
  description:
    'A practical guide for landlords in England when a tenant leaves owing rent.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Tenant Left Without Paying Rent | What Landlords Should Do Next | LandlordHeaven',
    description:
      'Plain-English guidance for landlords dealing with unpaid rent after a tenant leaves. Understand the final balance, the evidence that matters, and how landlords usually approach recovery.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-it-usually-means', label: 'What it usually means when a tenant leaves owing rent' },
  { href: '#first-things-to-check', label: 'First things to check after the tenant has gone' },
  { href: '#confirming-the-final-balance', label: 'Confirming the final balance' },
  { href: '#deposit-and-other-adjustments', label: 'Deposit and other adjustments' },
  { href: '#documents-you-need', label: 'Documents you should gather' },
  { href: '#how-landlords-usually-approach-it', label: 'How landlords usually approach it' },
  { href: '#when-the-file-is-strong', label: 'When the file is strong enough to pursue' },
  { href: '#timeline-after-the-tenant-leaves', label: 'Timeline after the tenant leaves' },
  { href: '#common-mistakes', label: 'Common mistakes landlords make' },
  { href: '#money-claim-vs-complete-pack', label: 'Money Claim vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'What should I do if a tenant leaves owing rent?',
    answer:
      'The first step is confirming the final balance properly. Landlords usually review the tenancy agreement, rent due dates, payment records, and any final adjustments so they know exactly what is still owed before deciding on recovery.',
  },
  {
    question: 'Can I still recover unpaid rent after the tenant leaves?',
    answer:
      'Yes. A tenant leaving the property does not automatically remove the rent debt. Landlords can still consider recovery, but the strength of the case usually depends on how clear the arrears schedule and supporting records are.',
  },
  {
    question: 'Should I update the arrears schedule after the tenant leaves?',
    answer:
      'Yes. The arrears schedule should usually be updated to show the final position at the point the tenancy ended or the tenant vacated, so the running balance is clean and easy to explain.',
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
          dateModified: '2026-03-13',
        })}
      />

      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' },
          { name: 'Tenant Left Without Paying Rent', url: canonical },
        ])}
      />

      <UniversalHero
        title="Tenant Left Without Paying Rent"
        subtitle="A practical landlord guide to understanding the arrears position and deciding what to do once a tenant leaves owing rent."
        primaryCta={{ label: 'Start Money Claim Pack', href: '/products/money-claim' }}
        secondaryCta={{ label: 'Need Complete Pack instead?', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Tenant leaving owing rent landlord guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains what landlords usually do when a tenant leaves owing
          rent, how to confirm the final arrears balance, what paperwork matters
          most, and how to decide whether recovery is worth pursuing once the
          occupation problem is over.
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
            <SeoPageContextPanel pathname="/tenant-left-without-paying-rent" />
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                When a tenant leaves without paying rent, the property problem and the
                money problem stop being the same thing. The occupation issue may be over
                because the tenant has gone, but the arrears issue may still remain. That
                means the landlord usually moves from managing possession or tenancy
                control to managing a final debt position.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the first job is not chasing the debt aggressively. It
                is confirming what is actually owed. Landlords normally need to review the
                tenancy agreement, check the rent due dates, compare those dates with the
                payments received, and calculate the final balance up to the point the
                tenant left or the tenancy ended.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The strongest post-tenancy arrears cases usually come from landlords who
                can produce one clean chronology. That chronology should show what rent was
                due, what was paid, where the shortfalls happened, and what the final
                figure became. If the file is messy, unclear, or full of assumptions, the
                problem is often not the legal right to the money. The problem is proving
                the figure cleanly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The safest way to think about this page is simple. A tenant leaving without
                paying rent does not automatically wipe out the arrears. But landlords
                usually get the best outcome when they stop, tidy the file, separate rent
                debt from every other tenancy-end issue, and then decide what step makes
                commercial and legal sense next.
              </p>
            </Card>

            <Card
              id="what-it-usually-means"
              title="What It Usually Means When a Tenant Leaves Owing Rent"
            >
              <p className="mt-4 leading-7 text-gray-700">
                When landlords say a tenant left without paying rent, several different
                things may be happening at once. In some cases the tenant simply moved out
                after falling behind over a period of time. In other cases the tenant left
                during or after a dispute. Sometimes the tenancy had already reached a
                formal possession stage. Sometimes the tenant just disappeared and the
                landlord was left trying to work out what was unpaid.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That is why the phrase sounds simple but the file behind it is often not.
                One landlord may be dealing with one missed month and a clean record.
                Another may be dealing with a long running arrears history, part-payments,
                changing promises, deposit issues, property condition issues, and
                uncertainty about the exact date the tenant really vacated. These details
                matter because they change what the final balance looks like and how easy
                it is to prove.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The key practical shift is that once the tenant has gone, landlords are no
                longer asking how to recover occupation. They are asking what is still
                owed, how reliable the evidence is, and whether it is sensible to pursue
                that balance. That is a different kind of file. It needs cleaner numbers,
                cleaner categories, and clearer thinking than many landlords realise.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually do best when they do not treat the
                tenant leaving as the end of the file. It is usually the moment when the
                file has to be converted from a tenancy-management file into a final
                arrears and recovery file.
              </p>
            </Card>

            <Card
              id="first-things-to-check"
              title="First Things to Check After the Tenant Has Gone"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Before looking at recovery, landlords usually need to stabilise the facts.
                That means confirming when the tenant actually left, whether the tenancy
                definitely ended, what rent date the account reached before departure, and
                whether there are any payments still in transit or recent credits not yet
                reflected in the ledger.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also the point to check whether the arrears record has been kept in
                a disciplined way. If the landlord has an up-to-date rent schedule already,
                this stage is straightforward. If not, it may need reconstructing from
                bank records, rent logs, and correspondence. The longer that process is
                delayed, the harder it often becomes to explain later.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords should also be careful not to bundle every post-tenancy issue
                into one number too early. Rent arrears are one issue. Damage, cleaning,
                utilities, belongings, locksmith costs, and deposit questions may all be
                relevant as well, but they are not automatically the same thing. The more
                clearly those categories are separated, the easier it becomes to explain
                the rent debt itself.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Confirm the date the tenant actually vacated</li>
                <li>Check the tenancy end position or possession outcome</li>
                <li>Reconcile the rent account to the relevant final date</li>
                <li>Separate rent arrears from damage or cleaning issues</li>
                <li>Make sure later credits or adjustments are not being missed</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords often lose more time correcting the basics
                later than they would lose by spending a short period getting the final
                facts straight now.
              </p>
            </Card>

            <Card
              id="confirming-the-final-balance"
              title="Confirming the Final Balance"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Confirming the final balance is usually the most important stage in the
                whole process. This is where the landlord stops talking in rough estimates
                and works out what is actually owed. The final balance should show what
                rent was due under the tenancy, what payments were received, where the
                shortfalls happened, and what figure remained outstanding at the relevant
                end point.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In most cases, the cleanest way to do this is through a full arrears
                schedule. A good schedule usually lists every rent due date, every payment
                received, the amount of any shortfall, and the running balance. If the
                landlord later makes an adjustment, a credit, or a correction, that should
                be shown clearly rather than hidden inside one unexplained total.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Many weak recovery files fail at this stage. Not because no money is owed,
                but because the landlord cannot explain how the figure was reached. A debt
                number written in an email or remembered from a rough spreadsheet is not
                the same as a clean final arrears chronology. The stronger file is the one
                that lets somebody else follow the figures without guesswork.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also where precision matters more than frustration. Landlords are
                often understandably angry when a tenant leaves without paying rent. But
                the file still has to be accurate. If the landlord overstates the balance,
                ignores credits, or mixes rent with unrelated charges, the position becomes
                weaker rather than stronger.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the final balance should answer three simple questions.
                What was due? What was paid? What remained outstanding at the end? If the
                file cannot answer those three questions clearly, it usually needs more
                work before any recovery decision is made.
              </p>
            </Card>

            <Card
              id="deposit-and-other-adjustments"
              title="Deposit and Other Adjustments"
            >
              <p className="mt-4 leading-7 text-gray-700">
                One of the most common reasons these files become confused is that landlords
                start treating the deposit as if it automatically solves the arrears
                position. In reality, the deposit may be relevant to the overall end of
                tenancy balance, but it does not remove the need for a clean arrears
                calculation. The landlord still needs to know what the rent debt was before
                any later adjustments are considered.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The same applies to other items. If there are cleaning costs, damage
                charges, replacement items, key issues, or utility-related questions,
                landlords should usually keep them separate from the pure rent history.
                They may matter commercially, but they should not be allowed to blur the
                arrears picture. A file is easier to trust when each category is clear.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This does not mean the landlord ignores those other issues. It means the
                landlord keeps the rent balance clean first. Then, if appropriate, any
                later credits, deposit allocations, or other adjustments can be shown in a
                way that is easy to understand.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually get a cleaner outcome when they work
                in layers: first the rent debt, then any later credits, then any separate
                tenancy-end issues. Trying to do everything in one blended figure often
                produces a file that nobody can follow confidently.
              </p>
            </Card>

            <CtaBand
              title="Ready to turn the final balance into a debt-recovery file?"
              body="Money Claim Pack is usually the stronger fit once the tenant has already gone and the main task is proving the arrears clearly enough to pursue recovery. Complete Pack is the better secondary route where the wider possession background, evidence continuity, or eviction-stage context still needs active support."
              primaryHref="/products/money-claim"
              primaryLabel="Start Money Claim Pack"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Need Complete Pack instead?"
            />

            <Card
              id="documents-you-need"
              title="Documents You Should Gather"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Once the tenant has gone and the landlord is confirming the final position,
                the most important task is gathering the core documents in one place. This
                is not about creating the biggest possible file. It is about creating the
                clearest one. The best arrears packs are usually disciplined rather than
                bloated.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In most cases, the core records include the tenancy agreement, the rent
                terms, a clear arrears schedule, payment records, and any documents that
                explain the chronology. If the tenancy ended through a possession route,
                the possession history may still matter as background, but the arrears
                figure itself usually remains the central document.
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
                The most important document is often the final schedule itself. If that
                schedule is clean, the rest of the file becomes easier to understand. If
                that schedule is weak, the whole file often feels less reliable no matter
                how many extra documents are attached around it.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually do not need more paperwork. They need
                better organised paperwork. A shorter file with one clear chronology is
                often far stronger than a large folder full of duplicate or mixed material.
              </p>
            </Card>

            <Card
              id="how-landlords-usually-approach-it"
              title="How Landlords Usually Approach It"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most landlords do not approach this as one dramatic single moment. They
                usually move through stages. First they secure the property and confirm the
                tenant has actually gone. Then they lock the final arrears figure. Then
                they decide whether the debt file is strong enough and commercially worth
                pursuing further.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This matters because the emotional instinct is often to chase the money
                immediately. But emotional urgency is not the same thing as file readiness.
                The stronger approach is usually slower and more disciplined at the start.
                Get the final number right. Make sure the documents support it. Separate
                the rent issue from everything else. Then decide what step makes sense.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good landlords also think commercially at this stage. A legally valid debt
                is not always a sensible recovery target. The amount owed, the quality of
                the documents, the likely response, and the realistic prospect of recovery
                all matter. Some cases are clean and worth pursuing. Others are legally
                arguable but practically weak.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the strongest landlord approach is usually calm and
                document-led. One final balance. One final chronology. One clear decision
                about whether the next step is worthwhile.
              </p>
            </Card>

            <Card
              id="when-the-file-is-strong"
              title="When the File Is Strong Enough to Pursue"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords often ask whether they can pursue the arrears once the tenant has
                gone. A better question is whether the file is strong enough to pursue
                cleanly. In practical terms, a strong file usually has a clear tenancy
                agreement, a clean arrears schedule, payment records that reconcile
                properly, and a final balance that can be explained without confusion.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A weak file often shows the opposite signs. The final number may be based
                on assumptions. Credits may be missing. The rent history may not match the
                bank history. Damage and arrears may be mixed together in the same total.
                Or the landlord may be relying on memory rather than a disciplined
                chronology. The debt may still be real, but the file is harder to trust.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why landlords usually do better by assessing both legal strength
                and commercial value together. A case may be technically arguable but still
                not be the right place to spend further time and effort. Equally, a clean,
                well-documented arrears file may justify moving forward because the figures
                are solid and the position is easy to support.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, a good test is whether somebody unfamiliar with the
                tenancy could read the key documents and understand the final balance
                quickly. If they can, the file is usually much closer to recovery-ready. If
                they cannot, the landlord probably still needs to tidy the record first.
              </p>
            </Card>

            <Card
              id="timeline-after-the-tenant-leaves"
              title="Timeline After the Tenant Leaves"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Once the tenant has left, landlords should think in stages rather than
                assume one fixed timetable. The timeline usually depends less on the
                calendar and more on how clean the file is. If the rent schedule is up to
                date and the tenancy records are disciplined, the final balance can be
                confirmed relatively quickly. If the file is confused, the first stage may
                take much longer because the landlord is reconstructing the arrears after
                the fact.
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
                      <td className="px-4 py-3 font-medium">Tenant gone</td>
                      <td className="px-4 py-3">
                        Landlord confirms the property is back and stabilises the basic facts
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Balance review</td>
                      <td className="px-4 py-3">
                        Rent history is reconciled and the final arrears figure is checked
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
                        Landlord decides whether the debt is strong enough and worth pursuing
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                The main point is that most delay at this stage comes from file condition,
                not from the idea of the debt itself. Clear records speed decisions. Messy
                records create hesitation, revision, and avoidable rework.
              </p>
            </Card>

            <Card
              id="common-mistakes"
              title="Common Mistakes Landlords Make"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most post-tenancy arrears problems are not created by one dramatic error.
                They usually come from a series of smaller file mistakes that make the
                final balance harder to trust. The more disciplined the landlord is at the
                end of the tenancy, the easier it becomes to decide what to do next.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Assuming the final balance is obvious.</span>
                  <span className="block">
                    Landlords often know the tenant owes money, but still need a proper
                    final schedule rather than a rough estimate.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Mixing rent debt with every other issue.</span>
                  <span className="block">
                    Damage, cleaning, utilities, and deposit issues can confuse the rent
                    position if they are blended into one unclear total.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Failing to reconcile the payment records.</span>
                  <span className="block">
                    A schedule that does not match the actual payment history usually
                    becomes much weaker under scrutiny.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Leaving the file tidy-up too late.</span>
                  <span className="block">
                    The longer the landlord waits, the harder it can become to reconstruct
                    the timeline cleanly.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Pursuing out of frustration rather than file strength.</span>
                  <span className="block">
                    Recovery decisions are usually stronger when based on evidence quality
                    and realistic recoverability.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the biggest time saver after a tenant leaves is not raw
                speed. It is avoiding file confusion before the next decision is made.
              </p>
            </Card>

            <Card
              id="money-claim-vs-complete-pack"
              title="Money Claim Pack vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reading about a tenant leaving without paying rent are often no
                longer dealing with the simplest early-stage arrears problem. In many
                cases, the main issue is now proving the final balance clearly, deciding
                whether recovery is worth pursuing, and turning the tenancy records into a
                debt-focused file.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Money Claim Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Money Claim Pack is usually the stronger fit where the tenant has already
                left and the landlord now needs a debt-recovery workflow. It is better
                aligned to arrears schedules, letters before action, particulars, and the
                core steps that support a county court money claim.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is the better secondary route where the wider possession
                history, evidence continuity, or eviction-stage strategy still matters to
                the landlord's overall position. It is useful when the debt issue sits
                alongside unfinished route questions rather than replacing them.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, once the tenant has gone and the main question is how
                to recover the balance, Money Claim Pack is usually the better first
                route. Complete Pack remains the backup route where the wider case still
                needs eviction-led support.
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
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              When a tenant leaves without paying rent, the strongest next move is usually
              not immediate pressure. It is confirming the final rent balance properly and
              turning the tenancy records into one clean arrears file. That means one
              schedule, one chronology, and one clear understanding of what is still owed.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              Landlords usually get better outcomes when they separate the occupation
              problem from the money problem once the tenant has gone. The property may be
              back, but the debt question still needs its own structured approach. The
              cleaner the file, the easier it becomes to decide whether pursuing the
              balance is legally and commercially worthwhile.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If the tenant has already gone and your next job is turning the final
              balance into a clean claim, start with Money Claim Pack. If you still need
              broader possession-route continuity or eviction support around the wider
              file, use Complete Pack as the secondary route.
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
