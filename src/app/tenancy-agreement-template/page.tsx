import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { SampleAgreementPreview } from '@/components/tenancy/SampleAgreementPreview';
import { Container } from '@/components/ui/Container';
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

const comparisonRows = [
  {
    label: 'What you are looking at',
    genericTemplate:
      'A static file that leaves the landlord to decide how much of it still fits the tenancy.',
    guidedAgreement:
      'A live England agreement route that uses the example structure as a starting point, then shapes the wording around the actual let.',
  },
  {
    label: 'Risk of outdated wording',
    genericTemplate:
      'High if the template was written for a different framework, old AST assumptions, or another UK jurisdiction.',
    guidedAgreement:
      'Lower because the route is built around the current England position and the property setup you are actually choosing.',
  },
  {
    label: 'Deposit, notices, and supporting paperwork',
    genericTemplate:
      'Often fragmented across several files or left for the landlord to chase separately.',
    guidedAgreement:
      'Handled as part of a fuller agreement route so the main document and supporting pack stay aligned.',
  },
  {
    label: 'Choosing the right route',
    genericTemplate:
      'Still depends on the landlord spotting whether the let should be Standard, Premium, Student, HMO / Shared House, or Lodger.',
    guidedAgreement:
      'Standard and Premium lead the ordinary-residential journey, with specialist and legacy support routes kept separate when the facts point elsewhere.',
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
    sku: 'england_standard_tenancy_agreement',
    title: 'Standard Tenancy Agreement',
    href: '/standard-tenancy-agreement',
    label: 'Mainstream England route',
    body: 'Use the main England standard route when the tenancy is an ordinary residential let and you want the right agreement structure without paying for broader drafting you do not need.',
    ctaLabel: 'View standard agreement',
  },
  {
    sku: 'england_premium_tenancy_agreement',
    title: 'Premium Tenancy Agreement',
    href: '/premium-tenancy-agreement',
    label: 'Fuller ordinary-residential drafting',
    body: 'Choose Premium when you still have a normal residential let but want broader wording around access, repairs, keys, guarantors, and day-to-day management from day one.',
    ctaLabel: 'View premium agreement',
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
      'Use this when sharer controls, communal areas, or room-by-room occupation need their own drafting instead of being folded into a normal residential route.',
    ctaLabel: 'View HMO / Shared House agreement',
  },
  {
    sku: 'england_lodger_agreement',
    title: 'Room Let / Lodger Agreement',
    href: '/lodger-agreement',
    summary:
      'Use this when the landlord lives at the property and the occupier is sharing the home rather than taking the ordinary assured periodic route.',
    ctaLabel: 'View lodger agreement',
  },
];

const supportRoutes = [
  {
    title: 'Assured Shorthold Tenancy Agreement Template',
    href: '/assured-shorthold-tenancy-agreement-template',
    summary:
      'Use this legacy AST guide when older terminology is driving the search. It explains the wording shift and routes you back to the England agreement example page.',
    ctaLabel: 'Read AST legacy guide',
  },
  {
    title: 'Assured Periodic Tenancy Agreement',
    href: '/assured-periodic-tenancy-agreement',
    summary:
      'Use this support page when you need the newer England terminology explained in plain English before returning to the England agreement example and comparison journey.',
    ctaLabel: 'Read assured periodic guide',
  },
] as const;

const clauseExplainers = [
  {
    title: 'Why the term clause matters now',
    body: 'A good England tenancy agreement no longer relies on a vague template opening and hopes the rest follows. The term section needs to tell the reader how the tenancy starts, that it continues until ended through the lawful route, and what the notice and possession framework looks like in practice.',
  },
  {
    title: 'Why rent and deposit wording still drive disputes',
    body: 'Even a simple rent agreement needs more than the monthly amount. It should make payment timing, deposit handling, permitted deductions, and the rent-change route clear enough that the landlord is not left patching the gaps later.',
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
      "Yes. The sample agreement preview uses Landlord Heaven's England standard agreement wording with safe example names, contact details, and property facts so you can see how the document is structured before choosing a route.",
  },
  {
    question: 'Can I download this exact template as a blank file?',
    answer:
      'No. This page is designed to satisfy template intent by showing a credible example first, then guiding landlords into the route that fits the property and tenancy setup instead of leaving them with a generic blank form to edit alone.',
  },
  {
    question: 'Why do Standard and Premium come before the other route links?',
    answer:
      'Because they are the default mainstream England routes for ordinary residential lets. Specialist routes are still available, but they should appear after the main template and comparison journey instead of interrupting it.',
  },
  {
    question: 'Why do AST and assured periodic wording both appear here?',
    answer:
      'Because landlords still search with AST terminology, while the current England route is better explained through assured periodic language. The legacy AST support page and the assured periodic support page both point back to this England agreement example page.',
  },
  {
    question: 'What is the difference between this page and /products/ast?',
    answer:
      'This page is the England agreement example page for broad searches such as tenancy agreement template, rent agreement, and tenancy contract. /products/ast is the downstream comparison page for landlords who want every England route shown side by side after they have seen the example page first.',
  },
  {
    question: 'Does this page apply outside England?',
    answer:
      'No. This example and guide are England-first. Wales, Scotland, and Northern Ireland use different tenancy frameworks and should begin from the jurisdiction-specific route instead of treating one UK template as interchangeable.',
  },
];

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Tenancy Agreement Template (England) - Example & Guide',
  url: canonicalUrl,
  description:
    'Review a real England tenancy agreement template example, then compare the Standard and Premium routes before choosing the agreement that fits the let.',
  inLanguage: 'en-GB',
};

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Tenancy Agreement Template (England) - Example & Guide',
  description:
    'See a real England tenancy agreement template example with clause sections for parties, rent, deposit, term, repairs, and notices before choosing Standard or Premium.',
  keywords: [
    'tenancy agreement',
    'tenancy agreement template',
    'rent agreement',
    'tenancy contract',
    'rent agreement template england',
    'tenancy contract template england',
    'england tenancy agreement template',
    'assured periodic tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreement Template (England) - Example & Guide',
    description:
      'Review a real England tenancy agreement example, then compare the Standard and Premium routes before choosing the agreement that fits the let.',
    url: canonicalUrl,
    type: 'website',
    locale: 'en_GB',
    siteName: 'Landlord Heaven',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tenancy Agreement Template (England) - Example & Guide',
    description:
      'See a real England tenancy agreement template example and compare the Standard and Premium routes.',
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
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">Support route</p>
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
    <div className="min-h-screen bg-[#F6F2EB] text-[#141B2D]">
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
        <section className="relative overflow-hidden border-b border-[#E7E0D4] bg-gradient-to-b from-[#FBF8F2] via-[#F7F3EC] to-[#F6F2EB] pt-24 pb-16 md:pt-28 md:pb-20">
          <div className="pointer-events-none absolute left-[-8rem] top-[8rem] h-56 w-56 rounded-full bg-[#E7DBFF] opacity-60 blur-3xl" />
          <div className="pointer-events-none absolute right-[-7rem] top-[22rem] h-56 w-56 rounded-full bg-[#FFEFD6] opacity-70 blur-3xl" />

          <Container>
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">
                England example and guide
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#141B2D] md:text-6xl">
                Tenancy Agreement Template (England)
              </h1>
            </div>

            <div className="mt-8 md:mt-10">
              <SampleAgreementPreview />
            </div>

            <div className="mt-8 max-w-4xl space-y-4 text-lg leading-8 text-[#556177]">
              <p>
                Landlords searching for a tenancy agreement, rent agreement, or tenancy contract
                usually want to see the structure first. That is why this page starts with a real
                England template example before moving into the agreement routes that fit a live
                tenancy.
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
                stay available lower in the journey, but this page remains the main England
                agreement example page.
              </p>
            </div>
          </Container>
        </section>

        <Container className="py-12 md:py-16">
          <section className="rounded-[2.3rem] border border-[#E5DED2] bg-white p-6 shadow-[0_18px_46px_rgba(31,41,55,0.05)] md:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
                Transition before route choice
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                Free / generic template vs guided agreement
              </h2>
              <p className="mt-4 text-base leading-7 text-[#556177]">
                The example above shows what a real England agreement looks like. The next
                question is whether you want to rely on a static template file or move into a
                guided route that keeps the agreement structure, supporting documents, and tenancy
                setup aligned.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-[#E5DED2]">
              <div className="grid bg-[#FBF9F4] text-sm font-semibold text-[#3A4459] md:grid-cols-[1.15fr_1fr_1fr]">
                <div className="border-b border-[#E5DED2] px-5 py-4 md:border-b-0 md:border-r" />
                <div className="border-b border-[#E5DED2] px-5 py-4 md:border-b-0 md:border-r">
                  Free / generic template
                </div>
                <div className="px-5 py-4">Guided agreement route</div>
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
                Primary England agreement routes
              </h2>
              <p className="mt-4 text-base leading-7 text-[#556177]">
                Start with Standard or Premium when the let is an ordinary residential tenancy.
                Those are the default mainstream England choices after the template-first preview.
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
                Specialist England agreement routes
              </h2>
              <p className="mt-4 text-base leading-7 text-[#556177]">
                Student, HMO / Shared House, and Lodger should stay clearly available, but they
                belong after the mainstream England journey rather than competing with it at the
                top of the page.
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
                Legacy AST and assured periodic support routes
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
              intro="Clear answers for landlords comparing a static template with the live England agreement routes."
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
                Need route-comparison help?
              </h2>
              <p className="mt-4 text-base leading-7 text-[#556177]">
                Use the England comparison page only after the example page if you want
                every England route shown side by side before you choose what to do next.
              </p>
            </div>

            <div className="mt-6">
              <Link
                href="/products/ast"
                className="inline-flex items-center justify-center rounded-xl border border-[#CBBDF1] bg-white px-5 py-3 text-sm font-semibold text-[#432B87] transition hover:border-[#B69BF4] hover:bg-[#F7F4FF]"
              >
                Compare all England agreement routes
              </Link>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
