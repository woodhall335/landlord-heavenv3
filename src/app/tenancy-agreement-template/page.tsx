import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { Container } from '@/components/ui/Container';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';
import {
  ENGLAND_TENANCY_PRODUCT_IMAGES,
  type EnglandModernTenancyProductSku,
} from '@/lib/tenancy/england-product-model';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement-template');
const premiumWizardHref =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_premium_tenancy_agreement&src=tenancy_agreement_template&topic=tenancy';
const premiumSampleProof = getGoldenPackProofData('england_premium_tenancy_agreement');
const premiumSamplePage = getProductSamplePageByPackKey('england_premium_tenancy_agreement');

const comparisonRows = [
  {
    label: 'What you are looking at',
    genericTemplate:
      'A static file that leaves the landlord to decide how much of it still fits the tenancy.',
    guidedAgreement:
      'The Premium tenancy agreement and supporting records, shown with worked England details before you start your own document.',
  },
  {
    label: 'Risk of outdated wording',
    genericTemplate:
      'High if the template was written for a different framework, old AST assumptions, or another UK jurisdiction.',
    guidedAgreement:
      'Lower because the agreement is built around the current England position and the property details you provide.',
  },
  {
    label: 'Deposit, notices, and supporting paperwork',
    genericTemplate:
      'Often fragmented across several files or left for the landlord to chase separately.',
    guidedAgreement:
      'Shown together through the Premium golden pack so the agreement, setup summary, deposit records, keys, utilities, and management schedule stay aligned.',
  },
  {
    label: 'Choosing the right agreement',
    genericTemplate:
      'Still depends on the landlord spotting whether the let should be Standard, Premium, Student, HMO / Shared House, or Lodger.',
    guidedAgreement:
      'Premium is featured on this page, with Standard and specialist agreements available when the facts point to a simpler or different setup.',
  },
];

const primaryRoutes: Array<{
  sku: EnglandModernTenancyProductSku;
  title: string;
  href: string;
  label: string;
  body: string;
  ctaLabel: string;
}> = [
  {
    sku: 'england_premium_tenancy_agreement',
    title: 'Premium Tenancy Agreement',
    href: '/premium-tenancy-agreement',
    label: 'Featured worked agreement',
    body: 'Choose Premium when you want the tenancy agreement shown on this page: fuller wording around access, repairs, keys, utilities, hand-back, guarantors, and day-to-day management from day one.',
    ctaLabel: 'View premium agreement',
  },
  {
    sku: 'england_standard_tenancy_agreement',
    title: 'Standard Tenancy Agreement',
    href: '/standard-tenancy-agreement',
    label: 'Simpler ordinary-residential alternative',
    body: 'Use Standard when the tenancy is a straightforward ordinary residential let and you want the current England structure without the broader Premium management pack.',
    ctaLabel: 'View standard agreement',
  },
];

const specialistRoutes: Array<{
  sku: EnglandModernTenancyProductSku;
  title: string;
  href: string;
  summary: string;
  ctaLabel: string;
}> = [
  {
    sku: 'england_student_tenancy_agreement',
    title: 'Student Tenancy Agreement',
    href: '/student-tenancy-agreement',
    summary:
      'Use this when the let is student-focused, guarantor-backed, or needs clearer replacement and end-of-term expectations.',
    ctaLabel: 'View student agreement',
  },
  {
    sku: 'england_hmo_shared_house_tenancy_agreement',
    title: 'HMO / Shared House Tenancy Agreement',
    href: '/hmo-shared-house-tenancy-agreement',
    summary:
      'Use this when sharer controls, communal areas or room-by-room occupation need wording beyond an ordinary residential agreement.',
    ctaLabel: 'View HMO / Shared House agreement',
  },
  {
    sku: 'england_lodger_agreement',
    title: 'Room Let / Lodger Agreement & Shared Home Pack',
    href: '/lodger-agreement',
    summary:
      'Use this when the landlord lives at the property and the occupier shares the home rather than renting it as an assured periodic tenant.',
    ctaLabel: 'View lodger agreement',
  },
];

const supportRoutes = [
  {
    title: 'Assured Shorthold Tenancy Agreement Template',
    href: '/assured-shorthold-tenancy-agreement-template',
    summary:
      'Use this AST guide when you recognise the older terminology but need to understand the current England wording.',
    ctaLabel: 'Read AST legacy guide',
  },
  {
    title: 'Assured Periodic Tenancy Agreement',
    href: '/assured-periodic-tenancy-agreement',
    summary:
      'Use this guide when you want assured periodic terminology explained in plain English before choosing an agreement.',
    ctaLabel: 'Read assured periodic guide',
  },
  {
    title: 'Periodic Tenancy Agreement Guide',
    href: '/periodic-tenancy-agreement',
    summary:
      'Use this plain-English guide if you searched for periodic or rolling tenancy wording and want to understand where that language fits before choosing Standard or Premium.',
    ctaLabel: 'Read periodic tenancy guide',
  },
] as const;

const clauseExplainers = [
  {
    title: 'Why the term clause matters now',
    body: 'The term section should state when the tenancy begins, explain that it continues until ended lawfully, and describe how notice and possession work in practice.',
  },
  {
    title: 'Why rent and deposit wording still drive disputes',
    body: 'Even a simple agreement needs more than the monthly rent. It should state when rent is due, how the deposit is handled, which deductions are permitted and how rent can change.',
  },
  {
    title: 'Why responsibilities need to read like a real document',
    body: 'Landlords often spot too late that a generic tenancy contract does not properly deal with access, repair reporting, utilities, nuisance, end-of-tenancy handback, or statutory document delivery. Those working clauses are where a real agreement earns its keep.',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Is this a real tenancy agreement template example?',
    answer:
      "Yes. The preview uses Landlord Heaven's England agreement wording with example names, contact details and property facts so you can inspect the structure before choosing a product.",
  },
  {
    question: 'Can I download this exact template as a blank file?',
    answer:
      'No. It shows a realistic example first, then helps you choose the agreement that fits the property and tenancy setup instead of leaving you with a generic blank form to edit alone.',
  },
  {
    question: 'Why do Standard and Premium appear first?',
    answer:
      'Because they cover most ordinary residential lets in England. Student, HMO / Shared House and Lodger agreements are still available for those specific arrangements.',
  },
  {
    question: 'Why do AST and assured periodic wording both appear here?',
    answer:
      'Because landlords still search with AST terminology, while current England agreements are better explained using assured periodic language. Both terms are explained so you can choose confidently.',
  },
  {
    question: 'What is the difference between this page and /products/ast?',
    answer:
      'This page shows a worked England agreement. The comparison page shows Standard, Premium, Student, HMO / Shared House and Lodger products side by side.',
  },
  {
    question: 'Does this page apply outside England?',
    answer:
      'No. This example is for England. Wales, Scotland and Northern Ireland use different tenancy frameworks and need their own agreements.',
  },
];

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Tenancy Agreement Template (England) - Premium Golden Pack Sample',
  url: canonicalUrl,
  description:
    'Review the Premium Tenancy Agreement sample for England, then create your agreement or compare the alternatives.',
  inLanguage: 'en-GB',
};

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Tenancy Agreement Template (England) - Premium Sample',
  description:
    'See the Premium Tenancy Agreement sample for England, including the agreement and supporting management records, before creating your own.',
  keywords: [
    'tenancy agreement',
    'tenancy agreement template',
    'rent agreement',
    'tenancy contract',
    'rent agreement template england',
    'tenancy contract template england',
    'tenancy agreement template england',
    'england tenancy agreement template',
    'assured periodic tenancy agreement england',
    'periodic tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreement Template (England) - Premium Sample',
    description:
      'Review the Premium Tenancy Agreement sample for England, then create your agreement or compare the alternatives.',
    url: canonicalUrl,
    type: 'website',
    locale: 'en_GB',
    siteName: 'Landlord Heaven',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tenancy Agreement Template (England) - Premium Sample',
    description:
      'See the Premium Tenancy Agreement sample for England before creating your own.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

function LeadRouteCard({
  sku,
  title,
  href,
  label,
  body,
  ctaLabel,
}: (typeof primaryRoutes)[number]) {
  const image = ENGLAND_TENANCY_PRODUCT_IMAGES[sku];

  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#E4DED2] bg-white shadow-[0_18px_46px_rgba(31,41,55,0.06)]">
      <div className="relative aspect-[16/10] border-b border-[#ECE5D8] bg-[#F4EFE6]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 460px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-6 md:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">{label}</p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#141B2D]">{title}</h3>
        <p className="mt-4 text-base leading-7 text-[#556177]">{body}</p>
        <div className="mt-6">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-xl border border-[#D1C4F8] bg-[#F5F0FF] px-5 py-3 text-sm font-semibold text-[#432B87] transition hover:border-[#B69BF4] hover:bg-[#EEE6FF]"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}

function SpecialistRouteCard({
  sku,
  title,
  href,
  summary,
  ctaLabel,
}: (typeof specialistRoutes)[number]) {
  const image = ENGLAND_TENANCY_PRODUCT_IMAGES[sku];

  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-[#E5DED2] bg-white/95 shadow-[0_14px_32px_rgba(31,41,55,0.05)]">
      <div className="relative aspect-[16/9] border-b border-[#EDE7DC] bg-[#F4EFE6]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1280px) 320px, (min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold tracking-tight text-[#141B2D]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#556177]">{summary}</p>
        <Link
          href={href}
          className="mt-5 inline-flex items-center text-sm font-semibold text-[#4A46C8] transition hover:text-[#2F2BA6]"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function SupportRouteCard({ title, href, summary, ctaLabel }: (typeof supportRoutes)[number]) {
  return (
    <article className="rounded-[1.7rem] border border-[#E3DDD2] bg-white p-5 shadow-[0_14px_32px_rgba(31,41,55,0.04)]">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">Related guide</p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#141B2D]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#556177]">{summary}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center text-sm font-semibold text-[#4A46C8] transition hover:text-[#2F2BA6]"
      >
        {ctaLabel}
      </Link>
    </article>
  );
}

export default function TenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-[#fcfaff] text-[#141B2D]">
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement Template (England)', url: canonicalUrl },
        ])}
      />
      <StructuredData data={webPageSchema} />
      <StructuredData data={faqPageSchema(faqs)} />

      <main>
        <UniversalHero
          preset="content_index"
          trustText="Premium golden-pack sample | real England tenancy agreement preview"
          mediaSrc="/images/generated/product-cards/premium-tenancy-agreement.webp"
          mediaAlt="Preview of Premium Tenancy Agreement documents"
          title="Premium Tenancy Agreement Sample"
          highlightTitle="(England)"
          subtitle={
            <>
              See the <strong>Premium golden-pack tenancy agreement</strong> and supporting
              management records before you create an agreement from your own details.
            </>
          }
          primaryCta={{
            label: 'Build my validated Premium pack',
            href: premiumWizardHref,
          }}
          secondaryCta={{
            label: 'View full premium sample',
            href: premiumSamplePage?.samplePath ?? '/premium-tenancy-agreement',
          }}
          feature="Preview the Premium pack first, then move into the fixed-price, review-ready workflow with the same richer management wording."
        />

        <section className="py-12 md:py-16">
          <Container>
            <div className="rounded-[2.3rem] border border-[#E7E0F6] bg-white p-6 shadow-[0_22px_60px_rgba(43,37,61,0.08)] md:p-8">
              <div className="max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">
                  England example and guide
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
                  See the Premium golden pack before you choose
                </h2>
                <div className="mt-5 space-y-4 text-base leading-8 text-[#556177] md:text-lg">
                  <p>
                    Landlords searching for a tenancy agreement, rent agreement, or tenancy
                    contract usually want to inspect the wording first. This page now leads with
                    the Premium golden-pack example so you can see the fuller management wording,
                    agreement structure and supporting documents before creating your own.
                  </p>
                  <p>
                    If older terminology is still shaping the search, the{' '}
                    <Link
                      href="/assured-shorthold-tenancy-agreement-template"
                      className="font-semibold text-[#4A46C8] underline-offset-4 hover:underline"
                    >
                      AST legacy guide
                    </Link>{' '}
                    and the{' '}
                    <Link
                      href="/assured-periodic-tenancy-agreement"
                      className="font-semibold text-[#4A46C8] underline-offset-4 hover:underline"
                    >
                      assured periodic guide
                    </Link>{' '}
                    are still available, but this remains the main England agreement example page.
                  </p>
                </div>
              </div>

              <div className="mt-8 md:mt-10">
                {premiumSampleProof ? (
                  <GoldenPackProof
                    data={premiumSampleProof}
                    samplePageHref={premiumSamplePage?.samplePath}
                  />
                ) : null}
              </div>
            </div>
          </Container>
        </section>

        <Container className="py-12 md:py-16">
          <section className="rounded-[2.3rem] border border-[#E5DED2] bg-white p-6 shadow-[0_18px_46px_rgba(31,41,55,0.05)] md:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
                From example to finished agreement
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                Blank file vs Premium golden pack
              </h2>
              <p className="mt-4 text-base leading-7 text-[#556177]">
                The example above shows the Premium tenancy agreement and the supporting pack that
                sits around it. The next question is whether you want to rely on a static template
                file or use guided questions that keep the agreement structure, supporting
                documents, and tenancy setup aligned.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-[#E5DED2]">
              <div className="grid bg-[#FBF9F4] text-sm font-semibold text-[#3A4459] md:grid-cols-[1.15fr_1fr_1fr]">
                <div className="border-b border-[#E5DED2] px-5 py-4 md:border-b-0 md:border-r" />
                <div className="border-b border-[#E5DED2] px-5 py-4 md:border-b-0 md:border-r">
                  Blank file
                </div>
                <div className="px-5 py-4">Guided Premium agreement</div>
              </div>
              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="grid border-t border-[#E5DED2] bg-white text-sm leading-7 text-[#556177] md:grid-cols-[1.15fr_1fr_1fr]"
                >
                  <div className="border-b border-[#EDE7DC] px-5 py-4 font-semibold text-[#141B2D] md:border-b-0 md:border-r">
                    {row.label}
                  </div>
                  <div className="border-b border-[#EDE7DC] px-5 py-4 md:border-b-0 md:border-r">
                    {row.genericTemplate}
                  </div>
                  <div className="px-5 py-4">{row.guidedAgreement}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-[2.3rem] border border-[#E5DED2] bg-white p-6 shadow-[0_18px_46px_rgba(31,41,55,0.05)] md:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
                Default next step after the preview
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                Create the Premium agreement shown above
              </h2>
              <p className="mt-4 text-base leading-7 text-[#556177]">
                The sample on this page is the Premium golden pack. Use it when you want the
                fuller agreement and management records; Standard remains available for simpler
                ordinary residential lets.
              </p>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              {primaryRoutes.map((route) => (
                <LeadRouteCard key={route.title} {...route} />
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-[2.3rem] border border-[#E5DED2] bg-[#FBF9F4] p-6 shadow-[0_18px_46px_rgba(31,41,55,0.05)] md:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
                Branch only when the facts demand it
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                Specialist England agreements
              </h2>
              <p className="mt-4 text-base leading-7 text-[#556177]">
                Student, HMO / Shared House and Lodger agreements cover specific living
                arrangements. Choose one only when it matches how the property will be occupied.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {specialistRoutes.map((route) => (
                <SpecialistRouteCard key={route.title} {...route} />
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-[2.3rem] border border-[#E5DED2] bg-white p-6 shadow-[0_18px_46px_rgba(31,41,55,0.05)] md:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
                Legacy wording and terminology support
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                AST and assured periodic guides
              </h2>
              <p className="mt-4 text-base leading-7 text-[#556177]">
                These pages stay live so landlords using older or transitional terminology can
                understand the wording shift, then return to the England agreement example page
                without mistaking the support pages for the broad owner.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {supportRoutes.map((route) => (
                <SupportRouteCard key={route.href} {...route} />
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-[2.3rem] border border-[#E5DED2] bg-white p-6 shadow-[0_18px_46px_rgba(31,41,55,0.05)] md:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
                Clause explanations
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                Why these clauses matter in a live England agreement
              </h2>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {clauseExplainers.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.8rem] border border-[#E9E2D7] bg-[#FBF9F4] p-5"
                >
                  <h3 className="text-xl font-semibold tracking-tight text-[#141B2D]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#556177]">{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-12">
            <FAQSection
              title="Tenancy agreement template FAQs"
              intro="Clear answers for landlords comparing a static template with a guided England agreement."
              faqs={faqs}
              showContactCTA={false}
              includeSchema={false}
              variant="gray"
            />
          </div>

          <section className="mt-12 rounded-[2.3rem] border border-[#D9D0EE] bg-gradient-to-br from-[#F5F1FF] via-white to-[#FBF9FF] p-6 shadow-[0_18px_46px_rgba(91,86,232,0.08)] md:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
                Secondary comparison path
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                Need help choosing an agreement?
              </h2>
              <p className="mt-4 text-base leading-7 text-[#556177]">
                Compare all five England products side by side if you are unsure which agreement
                fits the property and occupiers.
              </p>
            </div>

            <div className="mt-6">
              <Link
                href="/products/ast"
                className="inline-flex items-center justify-center rounded-xl border border-[#CBBDF1] bg-white px-5 py-3 text-sm font-semibold text-[#432B87] transition hover:border-[#B69BF4] hover:bg-[#F7F4FF]"
              >
                Compare all England agreements
              </Link>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
