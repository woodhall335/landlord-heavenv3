import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { Container } from '@/components/ui';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { moneyClaimHeroConfig } from '@/components/landing/heroConfigs';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { FunnelCta, CrossSellBar } from '@/components/funnels';
import { moneyClaimGuides, productLinks } from '@/lib/seo/internal-links';
import {
  BadgePoundSterling,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  Receipt,
  ArrowRight,
  ClipboardList,
  Target,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Money Claim Online (MCOL) Guide for Landlords | Claim Unpaid Rent',
  description:
    'Money Claim Online (MCOL) guide for landlords recovering unpaid rent and tenant debt. Learn fees, timelines, evidence, and how to submit a stronger claim.',
  keywords: [
    'money claim online',
    'MCOL',
    'MCOL landlord',
    'online money claim',
    'court claim online',
    'MCOL guide',
    'submit money claim',
    'MCOL fees',
    'online court claim',
    'MCOL process',
  ],
  openGraph: {
    title: 'Money Claim Online (MCOL) Guide for Landlords | Claim Unpaid Rent',
    description:
      'Complete guide to using the Money Claim Online system for landlord tenant debt recovery.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-online-mcol'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-online-mcol'),
  },
};

const faqs = [
  {
    question: 'What is Money Claim Online (MCOL)?',
    answer:
      "Money Claim Online is the government's online system for making civil money claims up to £100,000 in England and Wales. It lets landlords issue a claim without attending court at the start.",
  },
  {
    question: 'How much does MCOL cost?',
    answer:
      'MCOL court fees depend on your claim amount: up to £300 costs £35, £300.01-£500 costs £50, £500.01-£1,000 costs £70, £1,000.01-£1,500 costs £80, £1,500.01-£3,000 costs £115, £3,000.01-£5,000 costs £205, £5,000.01-£10,000 costs £455. Higher amounts are a percentage of the claim.',
  },
  {
    question: 'How long does MCOL take?',
    answer:
      "After submission, the defendant usually has 14 days to respond (sometimes longer if they acknowledge). If they don't respond, you can request default judgment. Defended claims take longer and may go to a hearing.",
  },
  {
    question: 'Do I need to attend court if I use MCOL?',
    answer:
      "Not always. If the defendant doesn't respond or admits the claim, you can get judgment without a hearing. If they defend, a hearing is likely.",
  },
  {
    question: 'Can I claim interest through MCOL?',
    answer:
      'Yes. You can usually claim statutory interest (commonly 8% per year) where appropriate. You’ll need to calculate it accurately for your claim.',
  },
  {
    question: 'What documents do I need for MCOL?',
    answer:
      "You don't upload documents at the point of filing, but you must have your figures, particulars, and evidence ready in case the claim is defended. Typical evidence includes the tenancy agreement, a rent schedule/ledger, and correspondence.",
  },
  {
    question: "The defendant's address might be wrong - can I still use MCOL?",
    answer:
      'You must provide a valid address for service. If you are unsure, you may need to trace the defendant first.',
  },
  {
    question: 'What happens if the tenant ignores my MCOL claim?',
    answer:
      'If they do not respond in time, you can request default judgment through MCOL. This gives you a judgment you can then enforce.',
  },
  {
    question: 'Can I use MCOL for claims over £10,000?',
    answer:
      'Yes, MCOL can handle claims up to £100,000. Claims over £10,000 are typically not small claims and may have different procedural expectations.',
  },
  {
    question: "What's the difference between MCOL and the paper N1 form?",
    answer:
      'MCOL is online and usually faster. The N1 is a paper/standard claim form route often used when MCOL isn’t suitable. Both can start a county court money claim.',
  },
  {
    question: 'How detailed should my evidence bundle be?',
    answer:
      'Clear and indexed. Include the agreement, a full rent schedule, key correspondence, and a simple chronology. Quality paperwork reduces disputes and delay.',
  },
  {
    question: 'What if the tenant disputes the amount or facts?',
    answer:
      'Reconcile your numbers line by line and keep a neutral timeline with supporting documents. If the claim is defended, documentary clarity matters.',
  },
];

export default function MoneyClaimOnlineMCOLPage() {
  const hero = {
    ...moneyClaimHeroConfig,
    trustText: 'MCOL-ready • England & Wales (County Court)',
    title: 'Money Claim Online (MCOL)',
    highlightTitle: 'done properly',
    subtitle:
      'Recover unpaid rent and tenancy debt with a court-ready pack. Clear particulars, interest calculation, and a step-by-step filing guide — built for MCOL.',
    primaryCta: {
      label: 'Prepare my MCOL claim pack →',
      href: '/wizard?product=money_claim&topic=debt&src=seo_money_claim_online_mcol',
    },
    secondaryCta: {
      label: 'View Money Claim Pack →',
      href: '/products/money-claim',
    },
    feature: 'Letter Before Action + Particulars + interest calc + filing guide (MCOL-ready)',
  };

  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Money Claim Online (MCOL) for Landlords: Complete Guide',
          description:
            'Step-by-step guide to using Money Claim Online for recovering tenant debts.',
          url: getCanonicalUrl('/money-claim-online-mcol'),
          datePublished: '2026-01-15',
          dateModified: '2026-02-26',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Money Claim Online', url: 'https://landlordheaven.co.uk/money-claim-online-mcol' },
        ])}
      />

      <div className="min-h-screen bg-[#fcfaff]">
        <HeaderConfig mode="autoOnScroll" />

        {/* Hero */}
        <UniversalHero {...hero} showTrustPositioningBar />

        {/* Conversion bar */}
        <section className="py-8">
          <Container>
            <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-8">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E6DBFF] bg-[#F3EEFF]">
                    <Target className="h-6 w-6 text-[#692ED4]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-charcoal">Built for MCOL success</h2>
                    <p className="text-sm text-gray-600">
                      Your claim reads clearly: who owes what, why, and how it’s calculated.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E6DBFF] bg-[#F3EEFF]">
                    <ShieldCheck className="h-6 w-6 text-[#692ED4]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-charcoal">Process-first, not template-first</h2>
                    <p className="text-sm text-gray-600">
                      We align letter → particulars → interest → filing steps so your story matches end-to-end.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E6DBFF] bg-[#F3EEFF]">
                    <Sparkles className="h-6 w-6 text-[#692ED4]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-charcoal">Preview before paying</h2>
                    <p className="text-sm text-gray-600">
                      Check everything, then purchase. Unlimited regenerations as your case changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* What is MCOL + Steps */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className="text-3xl font-bold text-charcoal md:text-4xl">
                  What is Money Claim Online (MCOL)?
                </h2>
                <p className="mt-4 text-lg text-gray-700">
                  MCOL is the government’s online system for issuing county court money claims in
                  England &amp; Wales — used by landlords to recover unpaid rent, damages, and other
                  tenancy debts.
                </p>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                    <p className="text-sm text-amber-900">
                      <strong>Before you file:</strong> send a compliant Letter Before Action and allow
                      time to respond. Skipping pre-action steps is a common cause of delay and dispute.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#E6DBFF] bg-white p-5 shadow-[0_10px_26px_rgba(105,46,212,0.08)]">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E6DBFF] bg-[#F3EEFF]">
                      <Clock className="h-6 w-6 text-[#692ED4]" />
                    </div>
                    <h3 className="font-semibold text-charcoal">Faster issuing</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Online submission can be issued quickly compared to paper routes.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E6DBFF] bg-white p-5 shadow-[0_10px_26px_rgba(105,46,212,0.08)]">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E6DBFF] bg-[#F3EEFF]">
                      <BadgePoundSterling className="h-6 w-6 text-[#692ED4]" />
                    </div>
                    <h3 className="font-semibold text-charcoal">Clear costs</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Fees depend on claim value and are usually recoverable as part of the claim.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E6DBFF] bg-[#F3EEFF]">
                    <ClipboardList className="h-6 w-6 text-[#692ED4]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-charcoal">MCOL in 5 steps</h3>
                    <p className="text-sm text-gray-600">A simple flow you can follow confidently.</p>
                  </div>
                </div>

                <ol className="space-y-4">
                  {[
                    {
                      title: 'Send Letter Before Action',
                      text: 'Set out the debt and deadline clearly. Keep proof of delivery.',
                      icon: <FileText className="h-5 w-5 text-[#692ED4]" />,
                    },
                    {
                      title: 'Prepare your figures',
                      text: 'Build a rent schedule, reconcile payments, and calculate interest.',
                      icon: <Receipt className="h-5 w-5 text-[#692ED4]" />,
                    },
                    {
                      title: 'Write strong particulars',
                      text: 'Explain the legal basis and the timeline in plain, structured language.',
                      icon: <Gavel className="h-5 w-5 text-[#692ED4]" />,
                    },
                    {
                      title: 'Submit via MCOL',
                      text: 'Enter the claim, pay the fee, and check your details before confirming.',
                      icon: <CheckCircle2 className="h-5 w-5 text-[#692ED4]" />,
                    },
                    {
                      title: 'Judgment or defended claim',
                      text: 'If no response, request default judgment. If defended, rely on your evidence bundle.',
                      icon: <ShieldCheck className="h-5 w-5 text-[#692ED4]" />,
                    },
                  ].map((s, idx) => (
                    <li key={s.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-[#fcfaff] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E6DBFF] bg-white">
                        <span className="sr-only">{idx + 1}</span>
                        {s.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal">{s.title}</p>
                        <p className="text-sm text-gray-600">{s.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/wizard?product=money_claim&topic=debt&src=seo_money_claim_online_mcol"
                    className="hero-btn-primary"
                  >
                    Prepare my claim pack →
                  </Link>
                  <Link
                    href="/products/money-claim"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CDB8F6] bg-white px-5 py-3 font-medium text-[#692ED4] transition-colors hover:bg-[#F3EEFF]"
                  >
                    View what’s included <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Fees */}
        <section className="py-12 md:py-16 bg-[#F3EEFF]">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-charcoal md:text-4xl">MCOL court fees (2026)</h2>
                <p className="mt-3 text-gray-700">
                  Fees depend on your claim value. You can usually add court fees to the amount claimed.
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-[#fcfaff]">
                      <tr>
                        <th className="border-b border-gray-100 px-6 py-4 font-semibold text-charcoal">Claim amount</th>
                        <th className="border-b border-gray-100 px-6 py-4 font-semibold text-charcoal">MCOL fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Up to £300', '£35'],
                        ['£300.01 – £500', '£50'],
                        ['£500.01 – £1,000', '£70'],
                        ['£1,000.01 – £1,500', '£80'],
                        ['£1,500.01 – £3,000', '£115'],
                        ['£3,000.01 – £5,000', '£205'],
                        ['£5,000.01 – £10,000', '£455'],
                        ['£10,000.01 – £100,000', '5% of claim'],
                      ].map(([a, b], i) => (
                        <tr key={a} className={i % 2 ? 'bg-[#fcfaff]' : ''}>
                          <td className="border-b border-gray-100 px-6 py-4 text-gray-700">{a}</td>
                          <td className="border-b border-gray-100 px-6 py-4 font-semibold text-charcoal">{b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="px-6 py-4 text-xs text-gray-500">
                  Fees shown reflect your on-page table (“correct as of January 2026”). Additional fees may apply if a case proceeds to hearing or enforcement.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* What you get */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-10">
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-charcoal md:text-4xl">What your Money Claim Pack includes</h2>
                <p className="mt-3 text-gray-700">
                  Everything you need to move from “tenant owes money” to a clean MCOL submission.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    title: 'Letter Before Action',
                    text: 'Pre-action compliant template tailored to your facts, ready to send.',
                    icon: <FileText className="h-6 w-6 text-[#692ED4]" />,
                  },
                  {
                    title: 'Particulars of Claim',
                    text: 'Structured wording you can paste into MCOL with a clear legal basis.',
                    icon: <Gavel className="h-6 w-6 text-[#692ED4]" />,
                  },
                  {
                    title: 'Interest calculation',
                    text: 'Auto-calculated interest output you can include in your claim totals.',
                    icon: <BadgePoundSterling className="h-6 w-6 text-[#692ED4]" />,
                  },
                  {
                    title: 'Step-by-step filing guide',
                    text: 'What to enter, what to keep, what happens next — and enforcement options.',
                    icon: <CheckCircle2 className="h-6 w-6 text-[#692ED4]" />,
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_30px_rgba(105,46,212,0.07)]"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E6DBFF] bg-white">
                      {c.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-charcoal">{c.title}</h3>
                    <p className="mt-2 text-gray-700">{c.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/wizard?product=money_claim&topic=debt&src=seo_money_claim_online_mcol"
                  className="hero-btn-primary"
                >
                  Prepare my claim — £99.99 →
                </Link>
                <p className="text-sm text-gray-600">
                  Court fees are extra (paid directly to MCOL). You can usually claim them back.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Cross-sell bar (kept) */}
        <section className="py-8 bg-white">
          <Container>
            <div className="mx-auto max-w-4xl">
              <CrossSellBar context="money-claim" location="mid" />
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 bg-white">
          <Container>
            <div className="mx-auto max-w-4xl">
              <FAQSection title="Frequently Asked Questions" faqs={faqs} includeSchema={false} showContactCTA={false} variant="white" />
            </div>
          </Container>
        </section>

        {/* Related links */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-4xl">
              <RelatedLinks
                title="Related Guides"
                links={[
                  moneyClaimGuides.ccjEnforcement,
                  moneyClaimGuides.smallClaimsCourt,
                  moneyClaimGuides.defendedClaims,
                  productLinks.moneyClaim,
                ]}
              />
            </div>
          </Container>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-3xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-br from-[#692ED4] via-[#7A3BE5] to-[#5a21be] p-8 text-center text-white shadow-[0_22px_60px_rgba(105,46,212,0.35)] md:p-12">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to file MCOL with confidence?</h2>
              <p className="mb-8 text-xl text-white/90">
                Generate your Letter Before Action, Particulars, and interest output — aligned end-to-end.
              </p>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/wizard?product=money_claim&topic=debt&src=seo_money_claim_online_mcol"
                  className="hero-btn-primary"
                >
                  Prepare my MCOL claim pack →
                </Link>
              </div>

              <ul
                className="mt-6 flex flex-col items-center gap-2 text-sm text-white/90 md:flex-row md:justify-center md:gap-6"
                aria-label="Purchase reassurance"
              >
                <li>✓ Preview before paying</li>
                <li>✓ Unlimited regenerations</li>
                <li>✓ Stored 12+ months</li>
                <li>✓ One-time payment — no subscription</li>
              </ul>
            </div>
          </Container>
        </section>

        <section className="py-10 bg-white">
          <Container>
            <div className="mx-auto max-w-4xl">
              <FunnelCta
                title="Need the right route for your case?"
                subtitle="Continue your money claim or go back to the decision hub."
                primaryHref="/products/money-claim"
                primaryText="Continue with money claim"
                primaryDataCta="money-claim"
                location="bottom"
                secondaryLinks={[{ href: '/tenant-not-paying-rent', text: 'Back to tenant not paying rent hub' }]}
              />
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
