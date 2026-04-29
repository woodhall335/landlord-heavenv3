import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import {
  StructuredData,
  breadcrumbSchema,
  getCanonicalUrl,
} from '@/lib/seo';
import { articleSchema } from '@/lib/seo/structured-data';
import { rentersRightsInformationSheet2026RelatedLinks } from '@/lib/seo/internal-links';

const pagePath = '/renters-rights-act-information-sheet-2026';
const canonicalUrl = getCanonicalUrl(pagePath);
const downloadHref = '/downloads/renters-rights-act-information-sheet-2026';
const officialGovUkUrl =
  'https://www.gov.uk/government/publications/the-renters-rights-act-information-sheet-2026';

const faqs: FAQItem[] = [
  {
    question: "Do I still need the Information Sheet if I already have a tenancy agreement?",
    answer:
      "Possibly, yes. The Information Sheet requirement is separate from the question of whether your current tenancy agreement is still suitable. Many landlords wrongly assume an older agreement removes the need to review their paperwork position.",
  },
  {
    question: 'Does giving the Information Sheet make my old tenancy agreement safe to rely on?',
    answer:
      "No. The Information Sheet is a tenant-facing government document. It does not update, replace, fix, or validate an older tenancy agreement.",
  },
  {
    question: 'Can I just keep using my existing tenancy agreement after 1 May 2026?',
    answer:
      "That may carry risk. Older agreements were drafted for a different framework and may no longer work in the way landlords expect when disputes, notices, or enforcement issues arise.",
  },
  {
    question: 'Can I send tenants a link to the PDF instead of the file itself?',
    answer:
      'No. GOV.UK says a link alone is not enough. The tenant should receive the PDF itself, either as a hard copy or as an electronic attachment.',
  },
  {
    question: 'What is the real risk of relying on old tenancy paperwork?',
    answer:
      'The risk is that landlords assume their existing agreement still protects them when it may contain outdated wording, gaps, or terms that do not properly support the tenancy position under the new regime.',
  },
];

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: "Renters' Rights Act Information Sheet 2026 | Free PDF Download",
  description:
    "Download the free Renters' Rights Act Information Sheet 2026 PDF and understand why relying on an older tenancy agreement may expose landlords to risk under the new England regime.",
  keywords: [
    'renters rights act information sheet 2026',
    'renters rights information sheet pdf',
    'renters rights act information sheet download',
    'england tenancy agreement risk 2026',
    'old tenancy agreement renters rights act',
    'renters rights act information sheet england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Renters' Rights Act Information Sheet 2026 | Free PDF Download",
    description:
      "Download the England Renters' Rights Act Information Sheet 2026 PDF and see why many existing tenancy agreements may no longer be safe to rely on.",
    url: canonicalUrl,
    type: 'website',
  },
};

export default function RentersRightsInformationSheet2026Page() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <SeoLandingWrapper
        pagePath={pagePath}
        pageTitle={metadata.title as string}
        pageType="general"
        jurisdiction="england"
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: "Renters' Rights Act Information Sheet 2026", url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={articleSchema({
          headline: "Renters' Rights Act Information Sheet 2026",
          description: metadata.description as string,
          url: canonicalUrl,
          datePublished: '2026-03-25',
          dateModified: '2026-03-25',
        })}
      />

      <main className="min-h-screen bg-[#FCFBF8]">
        <UniversalHero
          badge="Free England PDF Download"
          title="Download the Information Sheet. Do not assume your old tenancy agreement is still safe."
          subtitle="Get the official Renters' Rights Act Information Sheet 2026 PDF, then understand the real danger: many existing tenancy agreements were written for a different framework and may no longer protect landlords in the way they expect."
          primaryCta={{ label: 'Download free PDF', href: downloadHref }}
          secondaryCta={{ label: 'Replace outdated tenancy paperwork', href: '/products/ast' }}
          mediaSrc="/images/wizard-icons/05-compliance.png"
          mediaAlt="Illustration showing document review and tenancy paperwork risk"
          mascotDecorativeOnMobile={false}
          mascotDecorativeOnDesktop={false}
          showTrustPositioningBar
        trustText="Older tenancy agreements can create legal risk under the new regime"
        />

        <Container className="py-12 md:py-16">
          <section className="mx-auto max-w-5xl rounded-[2rem] border border-[#F3D3D3] bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFF8F8] p-6 shadow-[0_14px_32px_rgba(127,29,29,0.08)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#B91C1C]">
              The hidden risk most landlords miss
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
              The Information Sheet does not make an old tenancy agreement safe
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
              <p>
                Looking for the Renters&apos; Rights Act Information Sheet 2026? You can
                download the free PDF here. But the bigger issue is what many landlords do
                next: they assume their existing tenancy agreement is still fine.
              </p>
              <p>
                That assumption can be dangerous. The legal framework changes from{' '}
                <strong>1 May 2026</strong>, and many older tenancy agreements were drafted
                for a system that no longer exists in the same way. The Information Sheet is
                only a government handout for tenants. It does <strong>not</strong> update,
                repair, validate, or future-proof older tenancy paperwork.
              </p>
              <p>
                If your current agreement was created before the new regime, relying on it
                without reviewing your paperwork position may create avoidable risk later,
                especially if you need to enforce terms, recover possession, or deal with a
                dispute.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href={downloadHref} className="hero-btn-primary">
                Download free PDF
              </a>
              <Link href="/products/ast" className="hero-btn-secondary">
                Replace outdated tenancy paperwork
              </Link>
            </div>
          </section>

          <section className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                Problem
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#141B2D]">
                Most existing agreements were built for the old system
              </h3>
              <p className="mt-4 text-base leading-7 text-[#546075]">
                Many landlords already have a tenancy agreement in place and assume that
                means they are covered. In reality, older agreements may now sit awkwardly
                against the new framework.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                Risk
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#141B2D]">
                The Information Sheet does not fix old paperwork
              </h3>
              <p className="mt-4 text-base leading-7 text-[#546075]">
                Giving tenants the correct PDF may be necessary, but it does not remove the
                separate risk of relying on wording, structure, or assumptions from an older
                agreement.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                Safer route
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#141B2D]">
                Move into a current agreement flow instead of guessing
              </h3>
              <p className="mt-4 text-base leading-7 text-[#546075]">
                Rather than assuming an older tenancy agreement still works, landlords should
                move into a structured document route built for the current framework.
              </p>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-[#D9D7F7] bg-gradient-to-br from-[#F6F1FF] via-white to-[#F8F7FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
              What landlords should do next
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              Download the PDF, then choose the right route for the real problem in front of you
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
              <p>
                If you only need the Information Sheet, download it. But if this page has
                made you realise your tenancy paperwork is old, weak, or already leading
                into a dispute, the next step is choosing the right landlord product rather
                than stopping at the free PDF.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/products/ast"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#7C3AED] hover:shadow-md"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                  Paperwork fix
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[#141B2D]">Tenancy agreements</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Best if the main issue is outdated tenancy paperwork and you want to move
                  into a current agreement route.
                </p>
              </Link>

              <Link
                href="/products/notice-only"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#7C3AED] hover:shadow-md"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                  Notice stage
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[#141B2D]">Notice Only</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Best if the tenancy is already in trouble and you need to prepare the
                  current England notice correctly.
                </p>
              </Link>

              <Link
                href="/products/complete-pack"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#7C3AED] hover:shadow-md"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                  Court route
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[#141B2D]">Complete Eviction Pack</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Best if you want the notice and the possession paperwork prepared together
                  from the start.
                </p>
              </Link>

              <Link
                href="/products/money-claim"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#7C3AED] hover:shadow-md"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                  Debt recovery
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[#141B2D]">Money Claim Pack</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Best if rent arrears, damage, or tenant debt now need a structured
                  recovery route.
                </p>
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/products/ast" className="hero-btn-primary">
                Replace outdated tenancy paperwork
              </Link>
              <Link href="/products/notice-only" className="hero-btn-secondary">
                Take the next landlord step
              </Link>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
              Free download + practical warning
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              What this page gives you
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold text-[#141B2D]">
                  What you can do here
                </h3>
                <ul className="mt-4 list-disc space-y-3 pl-6 text-lg leading-8 text-[#546075]">
                  <li>Download the Renters&apos; Rights Act Information Sheet 2026 PDF</li>
                  <li>See when it must be given and how it should be delivered</li>
                  <li>Understand why older tenancy agreements can create hidden risk</li>
                  <li>Choose the right landlord product if the issue is bigger than the PDF itself</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#141B2D]">
                  What this page does not do
                </h3>
                <ul className="mt-4 list-disc space-y-3 pl-6 text-lg leading-8 text-[#546075]">
                  <li>It does not say an existing tenancy agreement is still safe</li>
                  <li>It does not suggest the Information Sheet updates old paperwork</li>
                  <li>It does not imply your current documents are still fit for purpose</li>
                  <li>It does not remove the need to review your tenancy document position</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href={downloadHref} className="hero-btn-primary">
                Download free PDF
              </a>
              <a
                href={officialGovUkUrl}
                target="_blank"
                rel="noreferrer"
                className="hero-btn-secondary"
              >
                View official GOV.UK source
              </a>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-[#FDE68A] bg-[#FFFBEB] p-6 shadow-[0_14px_32px_rgba(146,64,14,0.06)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#B45309]">
              Why landlords get caught out
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              The risky assumption: “I already have an agreement, so I&apos;m covered.”
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
              <p>
                This is the mistake that creates exposure. A landlord has a signed tenancy
                agreement, so they assume the safest option is to keep using it. But older
                tenancy agreements were drafted for a different legal structure.
              </p>
              <p>
                That means the document you already have may no longer work in the way you
                think it does. Some provisions may be outdated. Some assumptions may no
                longer hold. Some gaps may only become obvious when you need to take action.
              </p>
              <p>
                By the time a problem appears, it is usually too late. That is why relying on
                an older agreement without reviewing your position can be more dangerous than
                landlords realise.
              </p>
            </div>
          </section>

          <section className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
                When the Information Sheet may be needed
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
                <p>You should review whether it applies where the tenancy:</p>
                <ul className="list-disc space-y-3 pl-6">
                  <li>is in England</li>
                  <li>is an assured or assured shorthold tenancy</li>
                  <li>was created before <strong>1 May 2026</strong></li>
                  <li>has a wholly or partly written record of terms</li>
                </ul>
                <p>
                  A copy should be given to <strong>every named tenant</strong>. If a letting
                  agent manages the property, GOV.UK says the agent should provide it even if
                  the landlord has also done so.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#D9D7F7] bg-[#F7F8FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)] md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
                How it should be given
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
                <p>
                  The deadline is <strong>31 May 2026</strong>. For qualifying tenancies, the
                  exact PDF should be given to the tenant.
                </p>
                <p>GOV.UK says it can be:</p>
                <ul className="list-disc space-y-3 pl-6">
                  <li>printed and posted</li>
                  <li>handed over as a hard copy</li>
                  <li>sent electronically as a PDF attachment</li>
                </ul>
                <p>
                  A <strong>link alone is not valid</strong>. The tenant should receive the
                  PDF itself, not just a page directing them elsewhere.
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-[#F3D3D3] bg-[#FFF6F6] p-6 shadow-[0_14px_32px_rgba(127,29,29,0.08)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#B91C1C]">
              Important warning
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              What the Information Sheet does not do
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
              <p>
                The Information Sheet is not a substitute for reviewing your tenancy
                paperwork. It does not rewrite old clauses, fix structural weaknesses,
                modernise outdated wording, or remove uncertainty around older agreements.
              </p>
              <p>
                GOV.UK may say you do not have to reissue a tenancy agreement purely because
                of the Information Sheet requirement. But that is not the same as saying your
                current agreement is strong, suitable, or low-risk under the new regime.
              </p>
              <p>
                Those are different questions. One is whether the PDF must be given. The
                other is whether your existing tenancy agreement is still something you should
                rely on. Landlords should not confuse the two.
              </p>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-base leading-7 text-red-900">
                  Relying on outdated tenancy paperwork can create problems later when you
                  need certainty most. The risk is not always visible at the start. It often
                  appears when a tenant dispute, notice issue, arrears problem, or possession
                  step forces the document to be tested.
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-[#D9D7F7] bg-gradient-to-br from-[#F5F1FF] via-white to-[#F7F8FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
              If the tenancy is already in trouble
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              The free PDF is not the route for arrears, notice, or possession problems
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
              <p>
                The free Information Sheet is only one small part of the wider paperwork
                picture. It is not a replacement for a tenancy agreement strategy.
              </p>
              <p>
                Landlord Heaven helps landlords move away from legacy paperwork and into
                structured agreement routes built for the current system. Instead of guessing
                whether an old tenancy agreement still works, you can move into a document
                flow designed for how tenancies now operate.
              </p>
              <p>
                That matters because landlords usually do not lose time and money on the day
                they download a PDF. They lose it later when older paperwork turns out not to
                support the action they need to take.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/products/ast"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#7C3AED] hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">Tenancy agreements</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Replace outdated agreements with a structured tenancy document route.
                </p>
              </Link>
              <Link
                href="/products/notice-only"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#7C3AED] hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">Notice Only</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Use this when you are ready to serve the current England notice correctly.
                </p>
              </Link>
              <Link
                href="/products/complete-pack"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#7C3AED] hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">Complete Eviction Pack</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Use this when you want the notice and possession paperwork working together from the start.
                </p>
              </Link>
              <Link
                href="/products/money-claim"
                className="rounded-2xl border border-[#D9D7F7] bg-white p-5 transition hover:border-[#7C3AED] hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">Money Claim Pack</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">
                  Use this when arrears, damage, or unpaid tenant debt now need a formal recovery route.
                </p>
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/products/ast" className="hero-btn-primary">
                Replace outdated tenancy paperwork
              </Link>
              <a href={downloadHref} className="hero-btn-secondary">
                Download free PDF
              </a>
            </div>
          </section>

          <div className="mx-auto mt-12 max-w-5xl">
            <FAQSection
              title="Renters' Rights Act Information Sheet 2026 FAQs"
              intro="Short answers for landlords who need the free PDF and want to understand the risk of relying on older tenancy agreements."
              faqs={faqs}
              showContactCTA={false}
              variant="gray"
            />
          </div>

          <section className="mx-auto mt-12 max-w-5xl rounded-[2.5rem] bg-gradient-to-br from-[#201739] via-[#31205B] to-[#5641A4] p-8 text-center text-white shadow-[0_28px_72px_rgba(46,29,86,0.28)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C8BCFF]">
              Final step
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Download the PDF. Then stop relying on paperwork written for the old regime.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#E3DCF8]">
              The Information Sheet may be necessary, but it is not protection. If your
              tenancy agreement was created before the new framework, the safer move is to
              replace guesswork with a current document route.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a href={downloadHref} className="hero-btn-secondary">
                Download free PDF
              </a>
              <Link href="/products/ast" className="hero-btn-primary">
                Replace outdated tenancy paperwork
              </Link>
            </div>
          </section>

          <RelatedLinks
            title="Related England tenancy pages"
            links={rentersRightsInformationSheet2026RelatedLinks}
            variant="list"
            className="mx-auto mt-12 max-w-5xl"
          />
        </Container>
      </main>
    </>
  );
}
