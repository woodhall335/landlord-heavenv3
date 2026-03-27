import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { getCanonicalUrl } from '@/lib/seo';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';
const canonical = getCanonicalUrl('/money-claim-unpaid-rent');

const moneyClaimProductLink = '/products/money-claim';

const moneyClaimPrice = PRODUCTS.money_claim.displayPrice;

export const metadata: Metadata = {
  title: 'Money Claim for Unpaid Rent | Landlord Court Recovery Guide',
  description:
    'Landlord guide to making a money claim for unpaid rent in England.',
  keywords: [
    'money claim unpaid rent',
    'money claim for unpaid rent',
    'landlord money claim rent arrears',
    'mcol unpaid rent',
    'county court unpaid rent landlord',
    'recover rent arrears court',
    'letter before claim rent arrears',
    'rent arrears money claim england',
    'sue tenant unpaid rent',
    'county court judgment rent arrears',
    'tenant left owing rent money claim',
    'rent arrears claim landlord',
  ],
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'Money Claim for Unpaid Rent | Landlord Court Recovery Guide',
    description:
      'Practical landlord guide to recovering unpaid rent through a county court money claim, from pre-action steps to judgment and enforcement.',
    type: 'article',
    url: canonical,
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Money Claim for Unpaid Rent | Landlord Court Recovery Guide',
    description:
      'Landlord guide to rent arrears money claims, MCOL, judgment, and enforcement.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-a-money-claim-is', label: 'What a money claim is' },
  { href: '#when-landlords-use-this-route', label: 'When landlords use this route' },
  { href: '#before-you-issue', label: 'Before you issue' },
  { href: '#letter-before-claim', label: 'Letter Before Claim' },
  { href: '#what-your-arrears-file-needs', label: 'Arrears file checklist' },
  { href: '#step-by-step-process', label: 'Step-by-step process' },
  { href: '#tenant-defends-the-claim', label: 'If the tenant defends' },
  { href: '#judgment-and-enforcement', label: 'Judgment and enforcement' },
  { href: '#court-fees-and-timing', label: 'Court fees and timing' },
  { href: '#common-mistakes', label: 'Common mistakes' },
  { href: '#money-claim-pack-fit', label: 'When this route fits best' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'Can a landlord make a money claim for unpaid rent?',
    answer:
      'Yes. In England, a landlord can bring a county court money claim for unpaid rent against a current or former tenant. The strongest claims usually have a clear arrears schedule, a stable final figure, and proper pre-action steps before issue.',
  },
  {
    question: 'Do I need a Letter Before Claim before issuing a money claim for rent arrears?',
    answer:
      'Usually yes. Landlords are generally expected to follow the Pre-Action Protocol for Debt Claims, which usually means sending a Letter Before Claim, providing the relevant debt information, and allowing time for a response before starting court proceedings.',
  },
  {
    question: 'Can I use MCOL for unpaid rent?',
    answer:
      'Often yes, especially for more straightforward arrears claims. But the key question is usually not whether MCOL is available. It is whether the debt file is clean enough to issue properly without contradictions in the figures or supporting papers.',
  },
  {
    question: 'What documents do I need for a money claim for unpaid rent?',
    answer:
      'Landlords usually need the tenancy agreement, a full arrears schedule, payment records, the Letter Before Claim, proof of sending, and a clear calculation of the amount claimed. If interest is included, that calculation should also be clear and consistent.',
  },
  {
    question: 'Can I bring a money claim after the tenant has left?',
    answer:
      'Yes. Former tenants can still be pursued for rent arrears. In many cases the debt file is actually easier to stabilise once the tenancy has ended and the final arrears figure can be confirmed.',
  },
  {
    question: 'Does a County Court Judgment guarantee payment?',
    answer:
      'No. A CCJ confirms the debt, but it does not guarantee recovery by itself. If the debtor still does not pay, landlords may need to choose an enforcement route based on what is realistically known about income, bank accounts, or assets.',
  },
  {
    question: 'Should I wait until the tenant leaves before bringing a rent arrears money claim?',
    answer:
      'That depends on the case. Many landlords prefer to separate possession from debt recovery so the final arrears figure is easier to settle. Others need to move sooner. The best route is usually the one that gives the landlord the clearest and most defensible debt file.',
  },
  {
    question: 'What is the biggest mistake in a rent arrears money claim?',
    answer:
      'One of the biggest mistakes is issuing too early with inconsistent figures or weak pre-action documents. Landlords often know money is owed, but a court claim still needs one clear amount supported by one coherent file.',
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

export default function MoneyClaimUnpaidRentPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/money-claim-unpaid-rent"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Money Claim for Unpaid Rent',
          description: metadata.description as string,
          url: canonical,
          datePublished: '2026-03-01',
          dateModified: '2026-03-20',
        })}
      />

      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Debt recovery guides', url: canonical },
          { name: 'Money Claim for Unpaid Rent', url: canonical },
        ])}
      />

      <UniversalHero
        badge="Debt Recovery"
        title="Money Claim for Unpaid Rent"
        subtitle="A practical landlord guide to turning rent arrears into a court-ready debt claim with cleaner paperwork, stronger pre-action steps, and a more realistic plan for judgment and enforcement."
        primaryCta={{ label: `View Money Claim Pack - ${moneyClaimPrice}`, href: moneyClaimProductLink }}
        secondaryCta={{ label: "Calculate What You're Owed", href: '/tools/rent-arrears-calculator' }}
        variant="pastel"
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide is written for landlords in England who need to recover rent arrears as a debt.
          It explains why a clean arrears file matters more than rushing into court too early.
        </p>
      </UniversalHero>

      <section className="bg-white py-8">
        <Container>
          <div className="mx-auto max-w-5xl">
            <SeoPageContextPanel pathname="/money-claim-unpaid-rent" />
          </div>
        </Container>
      </section>

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
                A money claim for unpaid rent is the county court route landlords use to recover
                arrears as a debt rather than as a possession issue. In simple terms, it is the
                process for asking the court to confirm that the tenant owes money and to enter
                judgment for that amount.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The strongest money claims usually begin long before the claim form is issued.
                They begin with one clean arrears schedule, one clear tenancy chronology, and a
                proper pre-action process. If the amount being claimed is unclear, inconsistent,
                or poorly supported, the claim becomes weaker even where it is obvious that rent
                is owed.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords often assume the hardest part is filing through MCOL or the county
                court. In practice, the harder part is often building a file that is good enough
                to issue properly. The court wants a clear amount, a clear basis for that amount,
                and a clear record of what was done before asking the court to intervene.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The safest way to think about this route is simple: a money claim is not mainly
                a form-filling exercise. It is a file-quality exercise. The better the debt file,
                the cleaner the claim. The cleaner the claim, the easier it is to move from
                pre-action to judgment and, if needed, enforcement.
              </p>
            </Card>

            <Card id="what-a-money-claim-is" title="What a Money Claim for Unpaid Rent Actually Is">
              <p className="mt-4 leading-7 text-gray-700">
                When landlords talk about taking a tenant to court for unpaid rent, the legal
                route is usually a county court money claim. This is separate from the possession
                process. Possession is about recovering the property. A money claim is about
                recovering the debt.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That distinction matters because landlords often mix the two together. They can
                be related, but they are not the same file. A possession case may focus on notice
                validity, route choice, and the right to recover occupation. A money claim focuses
                much more directly on the amount owed, how that amount was calculated, and whether
                the debt can be proved cleanly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A good money claim file usually answers a small number of practical questions very
                clearly. What rent was due? What rent was paid? What remained outstanding? What
                was done before issue? And what evidence shows that the amount claimed is correct?
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the route works best when the landlord stops treating the
                arrears as a vague running problem and turns them into one final debt schedule
                that somebody else can understand without guesswork.
              </p>
            </Card>

            <Card id="when-landlords-use-this-route" title="When Landlords Usually Use This Route">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords use the money claim route when the main issue is no longer just
                possession but actual debt recovery. Sometimes that is because the tenant is
                still in the property and arrears are growing. In other cases, the tenant has
                already left and the landlord now wants to recover the final balance that
                remained unpaid at the end.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In many files, landlords wait until the tenant has left because the final arrears
                figure is then easier to stabilise. That often creates a cleaner debt claim
                because the landlord can calculate the balance to a fixed end point. In other
                cases, a landlord may decide the debt claim needs to run alongside or after
                possession planning. That can work, but it requires much tighter control over
                figures and timing.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The key point is that a money claim should usually be brought because the debt
                file is ready, not just because frustration has reached a peak. A landlord may
                clearly be owed money, but the claim is still stronger when the amount has been
                properly reconciled first.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the money claim route is usually the right fit once the
                landlord can identify one clear sum and one clear documentary basis for it.
              </p>
            </Card>

            <Card id="before-you-issue" title="Before You Issue the Claim">
              <p className="mt-4 leading-7 text-gray-700">
                Before issuing a money claim, landlords should do one thing that prevents a huge
                amount of later trouble: stabilise the debt file. That means checking the tenancy
                terms, confirming the rent due dates, reconciling all payments received, and
                producing a final arrears calculation that is clear enough to stand on its own.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is where many weak claims begin. A landlord may know broadly that the tenant
                owes money, but broad knowledge is not the same thing as a court claim. A court
                claim needs one clean amount. Not a rough estimate. Not a figure that changes from
                one document to the next. Not a total that mixes rent, damage, and unrelated costs
                without explanation.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                It is also important to decide whether the landlord is claiming just pure rent
                arrears or is trying to add other items. In most cases, landlords do best when
                the rent debt is kept as clean as possible. Other items may matter, but once too
                many issues are bundled together, the file often becomes harder to trust.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Check the tenancy agreement and rent clauses</li>
                <li>Confirm every rent due date in the claim period</li>
                <li>Reconcile payments against the rent schedule</li>
                <li>Separate arrears from damage or cleaning issues unless there is a clear reason not to</li>
                <li>Make sure the final figure is stable before issue</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually lose more time correcting a weak claim later
                than they would spend getting the figures right before issue.
              </p>
            </Card>

            <Card id="letter-before-claim" title="Letter Before Claim and Pre-Action Protocol">
              <p className="mt-4 leading-7 text-gray-700">
                Before bringing a county court debt claim against an individual debtor, landlords
                are generally expected to follow the Pre-Action Protocol for Debt Claims. In plain
                English, that means warning the tenant properly, setting out the debt clearly, and
                giving them a real chance to respond before court proceedings start.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The Letter Before Claim is not just a threatening letter. It is part of the file.
                It should explain what is owed, how the debt arose, and what the tenant needs to
                do next. It should also be sent in a way the landlord can later evidence. If the
                tenant replies, that response should usually be considered rather than ignored.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Courts are not only interested in whether the rent was unpaid. They are also
                interested in whether the claim was brought fairly and sensibly. A landlord who
                skips the pre-action stage or sends a confused debt summary may make the whole
                case harder than it needed to be.
              </p>

              <div className="mt-6 rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-5">
                <h3 className="text-lg font-semibold text-[#2a2161]">
                  What landlords usually need in the pre-action stage
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
                  <li>One clear Letter Before Claim</li>
                  <li>A debt breakdown or arrears schedule</li>
                  <li>Any required reply information or forms</li>
                  <li>Time for the tenant to respond before issue</li>
                  <li>Proof of what was sent and when</li>
                </ul>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords should assume that anything sent at the pre-action
                stage may later be read by a judge. That is a useful test of whether it is clear
                enough.
              </p>
            </Card>

            <CtaBand
              title="Need the debt route structured properly before you issue?"
              body="If your main problem is unpaid rent rather than possession, the Money Claim workflow is usually the better fit. It helps landlords turn arrears into a cleaner debt file with a Letter Before Claim, a clearer schedule, and a more controlled route into court."
              primaryHref={moneyClaimProductLink}
              primaryLabel={`View Money Claim Pack - ${moneyClaimPrice}`}
              secondaryHref="/products/money-claim"
              secondaryLabel="View Money Claim Pack"
            />

            <Card id="what-your-arrears-file-needs" title="What Your Arrears File Needs Before Court">
              <p className="mt-4 leading-7 text-gray-700">
                The quality of the arrears file often decides whether a money claim feels
                straightforward or stressful. Landlords do not usually lose momentum because the
                idea of the claim is difficult. They lose momentum because the file is inconsistent:
                different numbers in different places, missing payment records, unclear allocations,
                or a schedule that nobody else can follow confidently.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The central document is normally the arrears schedule. A good schedule shows each
                rent due date, the amount due, any payment received, the date that payment was
                received, and the running balance. If interest is being claimed, that should also
                be shown in a way that can be checked easily.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Tenancy agreement and rent terms</li>
                <li>Full arrears schedule with running balance</li>
                <li>Bank statements or payment records</li>
                <li>Letter Before Claim and proof of service</li>
                <li>Key communications about arrears if relevant</li>
                <li>Interest calculation if interest is claimed</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                The file should also be internally consistent. If one document says the debt is
                one figure and another says something else, confidence in the claim drops quickly.
                The strongest claims are usually the simplest to audit.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the best test is whether someone who did not manage the
                tenancy could understand the final balance just by reading the key papers. If
                they can, the file is usually much closer to issue-ready.
              </p>
            </Card>

            <Card id="step-by-step-process" title="Step-by-Step Process for a Money Claim for Unpaid Rent">
              <p className="mt-4 leading-7 text-gray-700">
                Once the arrears figure is stable and the pre-action stage is complete, the court
                process usually moves in a fairly familiar sequence. The exact path depends on
                whether the tenant ignores the claim, admits it, or files a defence, but the
                overall structure is usually straightforward.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">1. Confirm the amount being claimed</h3>
              <p className="mt-2 leading-7 text-gray-700">
                The claim should start from a clean debt figure. That usually means the rent
                arrears total first, then any clearly justified interest if interest is included.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">2. Send the Letter Before Claim</h3>
              <p className="mt-2 leading-7 text-gray-700">
                This is the formal pre-action stage. Keep a copy of what was sent and a record
                of when and how it was sent.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">3. Issue the claim</h3>
              <p className="mt-2 leading-7 text-gray-700">
                If the tenant does not resolve matters, the landlord can issue a county court
                money claim. Many straightforward claims are issued online, while others may be
                better suited to paper issue depending on the file.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">4. Watch the response deadlines</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Once the court serves the claim, the tenant has a limited period to respond. If
                nothing is filed in time, the landlord may be able to move toward default judgment.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">5. Obtain judgment</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Judgment confirms the debt in legal terms, whether by default, admission, or
                after a defended process.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">6. Enforce if payment still does not arrive</h3>
              <p className="mt-2 leading-7 text-gray-700">
                If the tenant still does not pay, the landlord usually needs to choose an
                enforcement route based on what is realistically known about the debtor’s
                circumstances.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the process works best when every stage is controlled from
                the same debt chronology rather than rebuilt from memory each time.
              </p>
            </Card>

            <Card id="tenant-defends-the-claim" title="If the Tenant Defends the Claim">
              <p className="mt-4 leading-7 text-gray-700">
                Not every unpaid rent claim is defended, but landlords should prepare as though
                a defence is possible. Tenants do not need a perfect defence to create delay.
                They only need to point to uncertainty in dates, calculations, service history,
                or the amount being claimed.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is where clear drafting matters. If the Letter Before Claim, the arrears
                schedule, and the claim all tell the same story with the same figures, the
                defence is usually easier to answer. If the landlord’s own papers contradict each
                other, the file becomes harder to manage.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                One common defence pattern is to challenge the amount. Another is to raise
                unrelated issues in an attempt to muddy the debt picture. That is why landlords
                usually do best by keeping the core rent debt as clean as possible and avoiding
                unnecessary blending with other tenancy-end disputes.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the best defence preparation usually happens before the claim
                is issued. A cleaner file makes later arguments shorter and easier to answer.
              </p>
            </Card>

            <Card id="judgment-and-enforcement" title="Judgment and Enforcement">
              <p className="mt-4 leading-7 text-gray-700">
                A County Court Judgment matters because it confirms the debt, but it is not the
                same thing as actual recovery. Landlords should not assume that judgment
                automatically leads to payment. In many cases, a second stage of thinking is
                still needed: how is this judgment most likely to be enforced?
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The right enforcement route usually depends on the debtor profile. If the tenant
                has regular employment, one route may be more suitable. If there is good bank
                information, another may be stronger. If recovery is likely to be longer-term and
                asset-focused, another route may make more commercial sense.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The key point is that enforcement should be chosen based on recoverability, not
                just frustration. The strongest landlords do not try every enforcement tool at
                once. They choose the route most likely to produce real recovery.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, a good money claim file does not stop at judgment. It already
                anticipates what happens if the debtor still does not pay.
              </p>
            </Card>

            <Card id="court-fees-and-timing" title="Court Fees, Costs, and Timing">
              <p className="mt-4 leading-7 text-gray-700">
                Landlords should budget for the court process properly. Issue fees are part of
                the route and usually become part of the amount claimed, but they still need to
                be paid at the point of issue. That makes it important to think commercially
                before proceedings start.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-[#E6DBFF] bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#F8F4FF] text-[#2a2161]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Claim Amount</th>
                      <th className="px-4 py-3 text-left font-semibold">Court Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">Up to £300</td>
                      <td className="px-4 py-3">£35</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">£300.01 - £500</td>
                      <td className="px-4 py-3">£50</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">£500.01 - £1,000</td>
                      <td className="px-4 py-3">£70</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">£1,000.01 - £1,500</td>
                      <td className="px-4 py-3">£105</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">£1,500.01 - £3,000</td>
                      <td className="px-4 py-3">£115</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">£3,000.01 - £5,000</td>
                      <td className="px-4 py-3">£205</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">£5,000.01 - £10,000</td>
                      <td className="px-4 py-3">£455</td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3">Over £10,000</td>
                      <td className="px-4 py-3">5% of claim</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                Timing also varies. A claim may resolve relatively quickly where the tenant
                ignores it or admits it. A defended case usually takes longer because the court
                process becomes more involved. Enforcement, if needed, can extend the timeline
                again.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Pre-action stage before issue</li>
                <li>Issue and service stage</li>
                <li>Judgment stage if undefended or admitted</li>
                <li>Longer timeline if defended</li>
                <li>Further time if enforcement is needed</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the best timeline control usually comes from file quality.
                Clearer documents usually create cleaner decisions.
              </p>
            </Card>

            <Card id="common-mistakes" title="Common Mistakes Landlords Make in Money Claims for Rent">
              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Issuing too early.</span>
                  <span className="block">
                    The landlord knows rent is owed, but the final amount is not yet stable enough
                    to claim cleanly.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Using inconsistent arrears figures.</span>
                  <span className="block">
                    Different totals in the schedule, Letter Before Claim, and claim papers weaken
                    confidence in the file.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Skipping or weakening the pre-action stage.</span>
                  <span className="block">
                    Courts usually expect landlords to behave reasonably before issuing a debt claim.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Mixing pure rent debt with every other tenancy dispute.</span>
                  <span className="block">
                    The more categories that are blended together, the harder the debt position
                    often becomes to explain.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Treating judgment as the end.</span>
                  <span className="block">
                    Judgment may still need a practical enforcement plan if payment does not follow.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the strongest improvement most landlords can make is not
                being more aggressive. It is being more organised before issue.
              </p>
            </Card>

            <Card id="money-claim-pack-fit" title="When the Money Claim Pack Is Usually the Better Fit">
              <p className="mt-4 leading-7 text-gray-700">
                If the main issue is now debt recovery rather than possession, the money claim
                route is usually where the landlord needs the most structure. This is especially
                true where the tenant has already left, where the arrears figure can now be
                finalised cleanly, or where the landlord wants a proper route through pre-action,
                issue, and judgment planning.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In those cases, the useful question is not whether the landlord needs more generic
                information about arrears. It is whether the debt file needs to be turned into
                something court-ready. That usually means a better Letter Before Claim, a cleaner
                schedule, and a more controlled route into the claim process.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the more important the debt file becomes, the more likely the
                Money Claim Pack is the better fit.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection
          faqs={faqs}
          title="Money Claim Unpaid Rent FAQs"
          showContactCTA={false}
          variant="white"
        />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              A money claim for unpaid rent usually works best when the landlord treats the case
              as a debt file first and a filing exercise second. That means one clean arrears
              schedule, one clear chronology, proper pre-action steps, and a realistic view of
              what enforcement may look like later.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The strongest outcomes normally come from landlords who do not rush to issue just
              because the debt is frustrating. They pause long enough to make the claim clear,
              consistent, and easy to support. That usually creates a better route from Letter
              Before Claim through to judgment.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If you are ready to move from arrears frustration into a structured debt claim
              route, start with the Money Claim Wizard. If you first need to confirm the numbers,
              use the rent arrears calculator before you issue anything.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={moneyClaimProductLink}
                className="rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
              >
                {`View Money Claim Pack - ${moneyClaimPrice}`}
              </Link>
              <Link
                href="/products/money-claim"
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                View Money Claim Pack
              </Link>
              <Link
                href="/tools/rent-arrears-calculator"
                className="rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
              >
                Calculate Rent Arrears
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

