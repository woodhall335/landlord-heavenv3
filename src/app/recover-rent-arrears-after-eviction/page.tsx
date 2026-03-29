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
  'https://landlordheaven.co.uk/recover-rent-arrears-after-eviction';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Recover Rent Arrears After Eviction | Landlord Guide to Post-Eviction Debt Recovery | LandlordHeaven',
  description:
    'A plain-English guide for landlords in England on recovering rent arrears after eviction.',
  alternates: {
    canonical,
  },
  openGraph: {
    title:
      'Recover Rent Arrears After Eviction | Landlord Guide to Post-Eviction Debt Recovery | LandlordHeaven',
    description:
      'Understand what landlords usually do to recover rent arrears after eviction, what paperwork matters, and how to avoid weak post-eviction debt recovery files.',
    url: canonical,
    siteName: 'LandlordHeaven',
    type: 'article',
  },
};

const jumpLinks = [
  { href: '#quick-answer', label: 'Quick answer' },
  { href: '#what-changes-after-eviction', label: 'What changes after eviction?' },
  { href: '#can-you-still-recover-arrears', label: 'Can you still recover arrears?' },
  { href: '#what-you-need-before-chasing-the-debt', label: 'What you need before chasing the debt' },
  { href: '#post-eviction-arrears-evidence-pack', label: 'Post-eviction arrears evidence pack' },
  { href: '#how-landlords-usually-approach-recovery', label: 'How landlords usually approach recovery' },
  { href: '#recovery-timeline', label: 'Recovery timeline' },
  { href: '#common-delay-points', label: 'Common delay points' },
  { href: '#money-claim-vs-complete-pack', label: 'Money Claim vs Complete Pack' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#final-cta', label: 'Next steps' },
] as const;

const faqs: FAQItem[] = [
  {
    question: 'Can a landlord recover rent arrears after eviction?',
    answer:
      'Yes. Recovering possession does not automatically wipe out arrears. Landlords can still pursue unpaid rent after eviction, but the strength of the recovery file usually depends on the quality of the records kept during the tenancy and possession process.',
  },
  {
    question: 'Does getting the property back automatically recover the debt?',
    answer:
      'No. Possession and debt recovery are related, but they are not the same thing. Once the landlord has the property back, they usually need a separate post-eviction recovery strategy for the arrears balance.',
  },
  {
    question: 'What evidence matters most for post-eviction arrears recovery?',
    answer:
      'The most important documents usually include the tenancy agreement, a clear arrears schedule, payment records, the possession history, and any documents showing how the final balance was calculated.',
  },
  {
    question: 'Should I update the arrears figure after the tenant leaves?',
    answer:
      'Yes. Landlords usually need a clean final balance that reflects what was due, what was paid, and what remained outstanding by the time possession was recovered.',
  },
  {
    question: 'Is post-eviction arrears recovery always worth pursuing?',
    answer:
      'Not always. The legal position may be clear, but landlords should still think commercially about the quality of the file, the value of the debt, and how realistic recovery is.',
  },
  {
    question: 'What is the biggest mistake after eviction?',
    answer:
      'One of the biggest mistakes is assuming the possession file automatically becomes a strong debt recovery file. Landlords usually still need a clean final arrears chronology and evidence pack.',
  },
  {
    question: 'How long does post-eviction arrears recovery take?',
    answer:
      'It varies, and landlords should think in stages rather than assume one fixed timescale. File clean-up, final balance confirmation, and later recovery steps can all affect the timeline.',
  },
  {
    question: 'Should I use Money Claim Pack or Complete Pack?',
    answer:
      'Money Claim Pack is usually the better fit where possession is already complete and the main task is converting arrears records into a debt-recovery file. Complete Pack is usually stronger where the landlord still needs wider possession-route continuity, evidence control, or court-stage support.',
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
        pagePath="/recover-rent-arrears-after-eviction"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: 'Recover Rent Arrears After Eviction',
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
          { name: 'Recover Rent Arrears After Eviction', url: canonical },
        ])}
      />

      <UniversalHero
        title="Recover Rent Arrears After Eviction"
        subtitle="A practical landlord guide to what happens to the debt after possession is back and how to approach recovery with a cleaner file."
        primaryCta={{ label: 'Start Money Claim Pack', href: '/products/money-claim' }}
        secondaryCta={{ label: 'Need Complete Pack instead?', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/11-calendar-timeline.png"
        mediaAlt="Post-eviction rent arrears recovery timeline guide icon"
        showReviewPill
        showTrustPositioningBar
      >
        <p className="mt-6 text-sm text-white/90 md:text-base">
          This guide explains how landlords usually approach unpaid rent after possession
          is recovered, what records matter most, and how to avoid weak debt-recovery
          files after the eviction itself is over.
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
            <SeoPageContextPanel pathname="/recover-rent-arrears-after-eviction" />
            <Card id="quick-answer" title="Quick Answer">
              <p className="mt-4 leading-7 text-gray-700">
                Recovering possession does not automatically recover the arrears. Once the
                tenant has gone and the property is back, the landlord usually moves from
                a possession problem to a debt-recovery problem. That changes the working
                question from “how do I get the property back?” to “what exactly is still
                owed, and how strong is my file if I pursue it?”
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, post-eviction arrears recovery works best where the
                landlord already has one clean chronology from the tenancy itself through
                to the possession outcome. The stronger the payment history, arrears
                schedule, notice history, and final balance calculation, the easier it is
                to decide what recovery step makes sense next.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The biggest mistake landlords make at this stage is assuming that a strong
                possession file automatically becomes a strong debt file. Sometimes it
                does. Sometimes it does not. A landlord may have recovered the property
                successfully but still need to tidy the final arrears record, update the
                running balance, and separate possession-stage issues from post-eviction
                debt issues before taking the next step.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The safest way to think about this page is simple: possession ends the
                occupation problem, not necessarily the money problem. Landlords usually do
                best when they treat post-eviction arrears recovery as a fresh evidence
                exercise built on the earlier file rather than assuming the earlier file
                answers every later question.
              </p>
            </Card>

            <Card
              id="what-changes-after-eviction"
              title="What Changes After Eviction?"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Once possession is back, the legal and practical focus changes. During the
                tenancy dispute, the live issue was often route choice, notice validity,
                court preparation, and lawful recovery of the property. After eviction, the
                property question is largely resolved. The remaining issue is usually the
                unpaid balance and whether it is worth pursuing further.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That shift matters because the file now needs to answer slightly different
                questions. During the possession phase, the court may have been focused on
                whether the landlord was entitled to possession. After eviction, the more
                important questions become: what is the final arrears figure, how was it
                calculated, what documents prove it, and how commercially sensible is it to
                keep pursuing the debt?
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is also the point where landlords often discover whether their earlier
                records were truly strong or only strong enough for possession. A file that
                worked well for court on possession may still need tidying if the landlord
                now wants to rely on a final debt figure. For example, a rough arrears
                ledger that was good enough to support route selection may not be good
                enough for later recovery work if it has gaps or unclear adjustments.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, post-eviction recovery starts with file conversion.
                The landlord takes the possession-era documents, removes anything no longer
                central, updates the money position, and turns the working file into a
                cleaner debt-recovery pack.
              </p>
            </Card>

            <Card
              id="can-you-still-recover-arrears"
              title="Can You Still Recover Arrears?"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Yes. Recovering possession does not usually erase rent arrears. If rent
                was owed during the tenancy and the balance remains unpaid, the landlord
                can still consider how to pursue that debt after the tenant has left.
                What matters is the quality of the final balance and the documents behind
                it.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                That said, there is a difference between being legally entitled to money
                and being able to recover it efficiently. Landlords usually need to think
                in both legal and commercial terms. A legally valid arrears position may
                still not be worth pursuing aggressively if the file is weak, the balance
                is disputed, or recovery looks unrealistic.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This is why good landlords pause after possession and reassess. What is the
                exact final balance? Which parts of the claim are clearly provable? Which
                records are strong? Which records need cleaning up? Are there deductions,
                credits, or overlapping issues that need to be separated from the rent
                debt itself? The cleaner those answers are, the stronger the recovery
                position usually becomes.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the right post-eviction question is not just “can I
                recover this?” It is “can I prove this cleanly, and is the route worth the
                time, cost, and effort now that possession is already back?”
              </p>
            </Card>

            <Card
              id="what-you-need-before-chasing-the-debt"
              title="What You Need Before Chasing the Debt"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Before moving into active debt recovery, landlords usually need one clean
                final position. That means confirming what rent was due, what was paid,
                what shortfalls remained, and what the balance was by the time possession
                was recovered. If the file still contains uncertainty, this is the stage to
                resolve it rather than rushing forward.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Landlords should also separate pure rent arrears from other post-tenancy
                issues. Damage, cleaning, belongings, utility issues, and deposit-related
                questions may all matter commercially, but they should not be allowed to
                confuse the core arrears record. The cleaner the categories are, the easier
                it becomes to explain the debt position later.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                A good post-eviction review usually asks five practical questions. What is
                the final arrears balance? What documents prove it? What adjustments still
                need to be made? What route is being considered now? And is the likely
                value of recovery worth the next stage of work?
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Confirm the final rent balance as at possession recovery</li>
                <li>Reconcile the arrears schedule against payment records</li>
                <li>Separate rent debt from other end-of-tenancy issues</li>
                <li>Keep the possession history available but not mixed into every figure</li>
                <li>Decide whether the file is legally and commercially worth pursuing</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, landlords usually lose more time cleaning a weak file
                later than they do by pausing briefly now to confirm the final balance
                properly.
              </p>
            </Card>

            <CtaBand
              title="Ready to turn the arrears file into a county court claim?"
              body="Money Claim Pack is usually the stronger fit once possession is finished and the main task is the debt file itself: schedule of arrears, letter before action, particulars, and a cleaner MCOL-ready route. Complete Pack is the better secondary route where you still need broader possession-stage continuity or eviction support around the same file."
              primaryHref="/products/money-claim"
              primaryLabel="Start Money Claim Pack"
              secondaryHref="/products/complete-pack"
              secondaryLabel="Need Complete Pack instead?"
            />

            <Card
              id="post-eviction-arrears-evidence-pack"
              title="Post-Eviction Arrears Evidence Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                The post-eviction arrears file should usually be shorter and cleaner than
                the live possession file. Its purpose is different. Instead of proving the
                right to recover the property, it is now mainly concerned with proving the
                debt position clearly.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In most cases, the key documents include the tenancy agreement, the arrears
                schedule, payment records, the possession history, and anything showing how
                the final balance was calculated. The possession order or earlier notice
                history may still matter, but they usually sit in the background unless
                they are needed to explain the wider chronology.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                The most important document is usually the final arrears schedule. It
                should show every rent due date, every payment received, the shortfall, and
                the final running balance up to the relevant end point. If later credits,
                adjustments, or corrections are made, they should be clear and easy to
                follow. A recovery file often becomes weaker not because the landlord lacks
                entitlement, but because the figures are too messy to trust quickly.
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                <li>Tenancy agreement and relevant rent terms</li>
                <li>Final arrears schedule with running balance</li>
                <li>Payment records supporting the schedule</li>
                <li>Possession history where it explains the timeline</li>
                <li>Any final adjustments or credits shown clearly</li>
                <li>One concise chronology linking tenancy, arrears, and recovery date</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, post-eviction recovery usually rewards clarity more
                than volume. A shorter, disciplined file is often much stronger than a
                bloated folder full of mixed tenancy and possession material.
              </p>
            </Card>

            <Card
              id="how-landlords-usually-approach-recovery"
              title="How Landlords Usually Approach Recovery"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most landlords do not approach post-eviction arrears recovery as a single
                dramatic event. They usually move through stages. First they stabilise the
                property and confirm the final arrears figure. Then they review whether the
                debt file is strong enough to pursue. Then they choose the most sensible
                next step based on evidence quality, value, and practical recoverability.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                This staged approach matters because landlords often feel emotionally ready
                to push the debt the moment the property is back. But emotional readiness
                is not the same as file readiness. The stronger approach is usually to
                finish the possession chapter cleanly, lock the final balance, and then
                decide how to pursue the money problem as its own workstream.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                Good recovery planning also means staying realistic. Some debts are clear,
                well-documented, and commercially worth pursuing. Others may be legally
                arguable but practically weaker once the costs, time, and recovery outlook
                are considered. Landlords often get better outcomes when they decide based
                on file quality and recoverability rather than frustration alone.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the strongest post-eviction approach is usually calm,
                structured, and document-led. One final balance. One final chronology. One
                clear view of whether the next step is justified.
              </p>
            </Card>

            <Card
              id="recovery-timeline"
              title="Recovery Timeline"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Post-eviction arrears recovery should be planned in stages rather than
                against one fixed deadline. The possession phase may already be over, but
                the debt phase still depends on how quickly the final balance is confirmed,
                how strong the paperwork is, and what recovery approach is being taken.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the immediate post-eviction period is usually about
                file clean-up and balance confirmation. After that, the pace of recovery
                depends on the strength of the evidence and how straightforward the debt
                position is. Cases move faster where the arrears schedule is accurate and
                the tenancy records are disciplined. Cases move slower where the landlord
                is still trying to reconstruct figures after the property has already been
                recovered.
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
                      <td className="px-4 py-3 font-medium">Property back</td>
                      <td className="px-4 py-3">
                        Possession is recovered and the landlord stabilises the property
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Balance review</td>
                      <td className="px-4 py-3">
                        Final arrears figure is checked and reconciled
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Evidence clean-up</td>
                      <td className="px-4 py-3">
                        Landlord turns the possession file into a clearer debt file
                      </td>
                    </tr>
                    <tr className="border-t border-[#E6DBFF] text-gray-700">
                      <td className="px-4 py-3 font-medium">Recovery step</td>
                      <td className="px-4 py-3">
                        Landlord decides whether and how to pursue the outstanding arrears
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 leading-7 text-gray-700">
                The key point is that delay is often shaped less by the calendar and more
                by the condition of the file. Clean records speed decisions. Confused
                records create hesitation.
              </p>
            </Card>

            <Card
              id="common-delay-points"
              title="Common Delay Points"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Most post-eviction delay points begin earlier than landlords think. By the
                time the property is back, weak payment records, unclear adjustments, and
                mixed tenancy-versus-damage issues have often already made the debt harder
                to pursue cleanly.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700">
                <li>
                  <span className="font-medium">Inaccurate final arrears schedules.</span>
                  <span className="block">
                    If the figures do not reconcile properly, the landlord may spend more
                    time cleaning the file than pursuing the debt.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Mixing rent debt with other tenancy-end issues.</span>
                  <span className="block">
                    Damage, cleaning, deposit, and belongings questions can blur the core
                    arrears picture if not separated clearly.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Assuming the possession file is enough by itself.</span>
                  <span className="block">
                    A strong possession result does not always mean the money file is ready
                    for the next stage.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Leaving balance confirmation too late.</span>
                  <span className="block">
                    The longer the landlord waits, the more likely the records become
                    harder to cleanly explain.
                  </span>
                </li>
                <li>
                  <span className="font-medium">Pursuing out of frustration instead of file quality.</span>
                  <span className="block">
                    Recovery decisions are usually better when based on evidence strength
                    and commercial realism.
                  </span>
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, the biggest time saver after eviction is not speed for
                its own sake. It is preventing avoidable file confusion before the next
                step is chosen.
              </p>
            </Card>

            <Card
              id="money-claim-vs-complete-pack"
              title="Money Claim Pack vs Complete Pack"
            >
              <p className="mt-4 leading-7 text-gray-700">
                Landlords reading about recovering arrears after eviction are usually no
                longer at the first simple notice stage of the case. In most situations,
                the main issue is now how to turn the possession history into a clean
                debt-recovery file and decide whether the arrears are worth pursuing.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Money Claim Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Money Claim Pack is usually the stronger fit where possession is already
                complete and the landlord now needs a debt-focused workflow. It is better
                aligned to schedules of debt, letters before action, particulars, and the
                practical steps that support a county court money claim.
              </p>

              <h3 className="mt-5 text-lg font-semibold text-[#2a2161]">Complete Eviction Pack</h3>
              <p className="mt-2 leading-7 text-gray-700">
                Complete Pack is the better secondary route where the landlord still needs
                broader continuity across the possession route, evidence handling, or
                court-stage context that sits behind the arrears claim. It is less
                debt-specific than Money Claim Pack, but stronger when the wider eviction file
                still needs active support.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                In practical terms, once possession is back and the main question is the
                debt, Money Claim Pack is usually the better first route. Complete Pack
                remains useful where the wider possession file still needs work.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="faqs" className="py-2">
        <FAQSection faqs={faqs} title="Recover Rent Arrears After Eviction FAQs" />
      </section>

      <section id="final-cta" className="bg-white pb-14 pt-6">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2a2161]">Next Steps</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Post-eviction arrears recovery usually works best when the landlord pauses
              long enough to convert the possession file into a clean debt file. That
              means one final balance, one working chronology, and one clear view of
              whether the next recovery step is worth taking.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              The strongest outcomes usually come from landlords who separate the property
              problem from the money problem once possession is back. Possession may be
              finished, but the debt still needs its own structured approach.
            </p>
            <p className="mt-4 leading-7 text-gray-700">
              If possession is already complete and your next job is turning the arrears
              records into a clean claim, start with Money Claim Pack. If you still need
              broader possession-route continuity or eviction support around the same
              case, use Complete Pack as the secondary route.
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
