import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Gavel,
  Scale,
} from 'lucide-react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { EnglandMoneyClaimPreview } from '@/components/seo/EnglandMoneyClaimPreview';
import { Container } from '@/components/ui/Container';
import { getMoneyClaimPreviewData } from '@/lib/previews/moneyClaimPreviews';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import {
  blogLinks,
  guideLinks,
  moneyClaimForms,
  moneyClaimGuides,
  productLinks,
  toolLinks,
} from '@/lib/seo/internal-links';
import {
  StructuredData,
  breadcrumbSchema,
  faqPageSchema,
  type FAQItem,
} from '@/lib/seo/structured-data';

const canonicalUrl = getCanonicalUrl('/money-claim');
const moneyClaimPrice = PRODUCTS.money_claim.displayPrice;

export const metadata: Metadata = {
  title: 'Money Claim for Landlords (England) - Example & Guide',
  description:
    'See an England landlord money claim example with pre-action, evidence, arrears, and filing guidance before you move into the court claim-pack workflow.',
  keywords: [
    'money claim for landlords england',
    'landlord money claim',
    'recover tenant debt',
    'claim unpaid rent landlord',
    'claim unpaid bills tenant',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Money Claim for Landlords (England) - Example & Guide',
    description:
      'England-first money claim hub with a real claim workflow example, evidence guidance, and the next step after the broad guide layer.',
    url: canonicalUrl,
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const pageFaqs: FAQItem[] = [
  {
    question: 'What is a landlord money claim in England?',
    answer:
      'It is the county court debt-recovery route landlords use to recover unpaid rent, bills, damage costs, and other tenancy-related debts. The broad task is not just choosing a form. It is building one coherent file that explains what is owed, why it is owed, and what evidence supports each figure.',
  },
  {
    question: 'Why does this page lead with the broad claim guide instead of the product page?',
    answer:
      'Because broad money-claim users usually need route clarity first. They need to see what the paperwork looks like, understand the pre-action and evidence steps, and decide whether the debt file is ready before they move into a transactional workflow.',
  },
  {
    question: 'Is unpaid rent still the strongest support route under this hub?',
    answer:
      'Yes. Unpaid rent remains the strongest support route because it is the most common landlord debt claim. It stays visible here, but it does not replace the broad owner page for wider money-claim intent.',
  },
  {
    question: 'What documents matter before issuing a claim?',
    answer:
      'Landlords usually need a letter before claim, any required response forms, a schedule of debt or arrears, the claim form or MCOL-ready details, a particulars narrative, and supporting evidence that keeps the numbers and chronology consistent.',
  },
  {
    question: 'Should I use MCOL or the N1 route?',
    answer:
      'That depends on the claim. MCOL suits more straightforward money claims, while the N1 route can be better where the case needs more detailed particulars or a more flexible filing format. The important point is that the route should match the claim structure, not the other way around.',
  },
  {
    question: 'Does the money claim pack replace the broad guide?',
    answer:
      'No. The pack is the primary transactional step after the broad guide has done its job. This page stays focused on route clarity, evidence structure, and what a landlord needs before they start generating claim documents.',
  },
];

const relatedResources = [
  moneyClaimGuides.unpaidRent,
  moneyClaimGuides.unpaidBills,
  moneyClaimForms.letterBeforeAction,
  moneyClaimForms.scheduleOfDebt,
  moneyClaimGuides.mcolProcess,
  moneyClaimGuides.ccjEnforcement,
  productLinks.moneyClaim,
];

export default async function MoneyClaimPage() {
  const previews = await getMoneyClaimPreviewData();

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Money Claim for Landlords (England)',
    description: metadata.description,
    url: canonicalUrl,
    about: [
      { '@type': 'Thing', name: 'Landlord money claim' },
      { '@type': 'Thing', name: 'Letter before claim' },
      { '@type': 'Thing', name: 'Schedule of debt' },
      { '@type': 'Thing', name: 'MCOL and N1 routes' },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/money-claim"
        pageTitle={metadata.title as string}
        pageType="money"
        jurisdiction="england"
      />
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(pageFaqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Money Claim', url: canonicalUrl },
        ])}
      />
      <HeaderConfig mode="autoOnScroll" />

      <main>
        <section className="border-b border-[#E6DBFF] bg-white py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#692ed4]">
                England landlord debt-recovery owner
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#2a2161] md:text-5xl">
                Money Claim for Landlords (England)
              </h1>
              <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-gray-700">
                <p>
                  This page is built to satisfy broad money-claim intent first. It shows what a
                  landlord claim file actually looks like, explains the supporting routes that sit
                  underneath the hub, and only then hands the user into the transactional claim-pack
                  workflow.
                </p>
                <p>
                  The core job is route clarity before issue. Broad users usually do not need a
                  product pitch first. They need to understand the pre-action step, the evidence
                  structure, the difference between MCOL and N1, and what changes depending on
                  whether the claim is for rent, bills, guarantor liability, or damage.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <EnglandMoneyClaimPreview previews={previews} />

        <section className="bg-[#F8F4FF] py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">
                What landlords need before they issue
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <Scale className="h-6 w-6 text-[#692ed4]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#2a2161]">One route and one figure</h3>
                  <p className="mt-3 text-gray-700">
                    Broad money-claim users often know money is owed but have not stabilised the
                    amount yet. The first job is turning the debt into one clean figure supported
                    by one coherent route and one evidence story.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <FileText className="h-6 w-6 text-[#692ed4]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#2a2161]">Pre-action first</h3>
                  <p className="mt-3 text-gray-700">
                    The letter before claim and its response documents are not filler. They are
                    part of the claim pathway and help show that the landlord tried to set out the
                    debt properly before proceedings were issued.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <Gavel className="h-6 w-6 text-[#692ed4]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#2a2161]">Collectability still matters</h3>
                  <p className="mt-3 text-gray-700">
                    Filing the claim is not the end of the commercial analysis. Landlords should
                    think about judgment, enforcement, and whether possession is also running in
                    parallel before they commit to the final document set.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-[#2a2161]">
                Choose the right money claim support route
              </h2>
              <p className="mt-4 max-w-3xl text-lg text-gray-700">
                The broad owner stays above the support estate. Unpaid rent remains the strongest
                support route, scenario pages stay scenario-specific, and process pages help with
                the filing and evidence layers without replacing the hub.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <article className="rounded-3xl border border-[#CAB6FF] bg-[#FCFAFF] p-6 shadow-[0_14px_40px_rgba(76,29,149,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#692ed4]">
                    Strongest support route
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Claim unpaid rent</h3>
                  <p className="mt-4 text-gray-700">
                    Use this route when the main debt is arrears and the landlord needs clearer
                    rent-led examples, arrears file structure, and judgment planning. It stays
                    strongest underneath the broad hub, but it is still a support page, not the owner.
                  </p>
                  <Link
                    href="/money-claim-unpaid-rent"
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                  >
                    Read the unpaid rent guide
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>

                <article className="rounded-3xl border border-[#E6DBFF] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6fd1]">
                    Scenario routes
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Bills, guarantor, and damage claims</h3>
                  <p className="mt-4 text-gray-700">
                    Use the scenario pages when the landlord already knows the debt type and needs
                    route-specific details, such as unpaid bills, guarantor liability, former tenant
                    tracing, property damage, or cleaning costs. They support the hub instead of competing
                    with it.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <Link href="/money-claim-unpaid-bills" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      Unpaid bills
                    </Link>
                    <Link href="/money-claim-unpaid-utilities" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      Unpaid utilities
                    </Link>
                    <Link href="/money-claim-guarantor" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      Guarantor claims
                    </Link>
                    <Link href="/money-claim-former-tenant" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      Former tenant claims
                    </Link>
                    <Link href="/money-claim-property-damage" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      Property damage
                    </Link>
                    <Link href="/money-claim-cleaning-costs" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      Cleaning costs
                    </Link>
                  </div>
                </article>

                <article className="rounded-3xl border border-[#E6DBFF] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6fd1]">
                    Process and evidence routes
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Pre-action, filing, and enforcement</h3>
                  <p className="mt-4 text-gray-700">
                    These pages help when the landlord is already inside the process and needs a
                    more precise explainer for the letter before action, schedule of debt, MCOL, the
                    N1 route, or enforcement after judgment.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <Link href="/money-claim-letter-before-action" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      Letter before action
                    </Link>
                    <Link href="/money-claim-schedule-of-debt" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      Schedule of debt
                    </Link>
                    <Link href="/money-claim-online-mcol" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      MCOL guide
                    </Link>
                    <Link href="/money-claim-n1-claim-form" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      N1 claim form
                    </Link>
                    <Link href="/money-claim-ccj-enforcement" className="rounded-lg border border-[#E6DBFF] px-3 py-2 text-primary hover:bg-[#FCFAFF]">
                      CCJ enforcement
                    </Link>
                  </div>
                </article>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-[#F8F4FF] py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">
                After the broad guide: move into the claim workflow
              </h2>
              <p className="mt-4 max-w-3xl text-lg text-gray-700">
                Once the landlord understands the route, evidence structure, and likely filing path,
                the primary transactional step is the money claim pack. The product remains downstream
                because the owner page is responsible for broad intent satisfaction first.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <article className="rounded-3xl border border-[#CAB6FF] bg-[#FCFAFF] p-6 shadow-[0_14px_40px_rgba(76,29,149,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#692ed4]">
                    Primary transactional step
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Money Claim Pack</h3>
                  <p className="mt-4 text-gray-700">
                    Best when the evidence file is clear enough to move from guide-level understanding
                    into document generation: claim form, particulars, debt schedule, pre-action pack,
                    and filing guidance.
                  </p>
                  <p className="mt-3 text-sm text-gray-600">One-time price: {moneyClaimPrice}</p>
                  <Link
                    href="/products/money-claim"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                  >
                    Start with the money claim pack
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>

                <article className="rounded-3xl border border-[#E6DBFF] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6fd1]">
                    Parallel possession note
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#2a2161]">Possession may still run in parallel</h3>
                  <p className="mt-4 text-gray-700">
                    If the tenant is still in occupation, possession can remain the separate primary
                    objective even while the debt file is being prepared. That is a strategy note, not
                    a second owner path for this page.
                  </p>
                  <p className="mt-4 text-sm text-gray-600">
                    If possession route continuity matters more than debt recovery right now, review
                    the possession workflow before you combine notice, court, and debt actions.
                  </p>
                </article>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">
                Evidence, process, and common failure points
              </h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-5 text-gray-700">
                  <p>
                    Money-claim failures usually look procedural long before they look legal.
                    Landlords often know money is owed, but the file still collapses because the
                    letter before claim, the debt schedule, the chronology, and the final claim
                    amount do not all say the same thing.
                  </p>
                  <p>
                    The broad owner page exists to make those moving parts visible before anyone
                    starts a pack. The better the file is organised now, the less rework is needed
                    if the claim is defended or later enforced.
                  </p>
                  <div className="rounded-2xl border border-[#E6DBFF] bg-white p-5">
                    <h3 className="text-xl font-semibold text-[#2a2161]">Common mistakes to avoid</h3>
                    <ul className="mt-4 space-y-3">
                      <li className="flex gap-3 text-gray-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                        <span>Issuing too early with figures that still change from week to week.</span>
                      </li>
                      <li className="flex gap-3 text-gray-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                        <span>Using a letter before claim that does not match the final debt breakdown.</span>
                      </li>
                      <li className="flex gap-3 text-gray-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                        <span>Adding weak damage or bills items that dilute an otherwise strong arrears claim.</span>
                      </li>
                      <li className="flex gap-3 text-gray-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-[#692ed4]" />
                        <span>Choosing MCOL or N1 late instead of deciding the route when the file is drafted.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E6DBFF] bg-white p-5">
                  <h3 className="text-xl font-semibold text-[#2a2161]">Helpful supporting tools</h3>
                  <ul className="mt-4 space-y-3">
                    <li className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-4">
                      <Link href={toolLinks.rentArrearsCalculator.href} className="font-semibold text-primary hover:underline">
                        Rent arrears calculator
                      </Link>
                      <p className="mt-2 text-sm text-gray-700">
                        Use when the landlord needs a clearer running figure before the debt schedule is finalised.
                      </p>
                    </li>
                    <li className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-4">
                      <Link href={moneyClaimForms.letterBeforeAction.href} className="font-semibold text-primary hover:underline">
                        Letter before action guide
                      </Link>
                      <p className="mt-2 text-sm text-gray-700">
                        Use when the next blocker is pre-action compliance rather than the court form itself.
                      </p>
                    </li>
                    <li className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-4">
                      <Link href={moneyClaimForms.scheduleOfDebt.href} className="font-semibold text-primary hover:underline">
                        Schedule of debt guide
                      </Link>
                      <p className="mt-2 text-sm text-gray-700">
                        Use when the landlord needs a cleaner itemised breakdown of rent, bills, or ancillary losses.
                      </p>
                    </li>
                    <li className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-4">
                      <Link href={moneyClaimGuides.mcolProcess.href} className="font-semibold text-primary hover:underline">
                        MCOL explainer
                      </Link>
                      <p className="mt-2 text-sm text-gray-700">
                        Use when the question is route choice and filing rather than whether the debt exists.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-[#F8F4FF] py-12 md:py-16">
          <FAQSection
            faqs={pageFaqs}
            title="Money Claim for Landlords FAQs"
            includeSchema={false}
            showContactCTA={false}
            variant="white"
          />
        </section>

        <section className="bg-white py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <RelatedLinks title="Related money claim resources" links={relatedResources} />
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
