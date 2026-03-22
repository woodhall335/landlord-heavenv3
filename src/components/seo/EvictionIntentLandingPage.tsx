import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { StructuredData, breadcrumbSchema, faqPageSchema, articleSchema } from '@/lib/seo/structured-data';
import { EVICTION_ENTITIES, getAuthorityLinks } from '@/lib/seo/eviction-authority';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import type { IntentPageConfig } from '@/lib/seo/eviction-intent-pages';
import {
  getPrimaryDestinationAboveFold,
  getSeoPageTaxonomyBySlug,
} from '@/lib/seo/page-taxonomy';

const DEFAULT_UPDATED = 'March 2026';
const AREA_SERVED_BY_JURISDICTION = {
  england: 'England',
  wales: 'Wales',
  scotland: 'Scotland',
  'northern-ireland': 'Northern Ireland',
  uk: 'UK',
} as const;
const PRODUCT_CTA_LABELS = {
  '/products/notice-only': 'Start notice only',
  '/products/complete-pack': 'Start complete eviction pack',
  '/products/money-claim': 'Start money claim',
  '/products/ast': 'Start tenancy agreement',
} as const;

function getProductCtaLabel(route: string) {
  return PRODUCT_CTA_LABELS[route as keyof typeof PRODUCT_CTA_LABELS] ?? 'Start guided workflow';
}

function labelMatchesProduct(label: string, route: string) {
  const normalized = label.toLowerCase();

  switch (route) {
    case '/products/notice-only':
      return normalized.includes('notice');
    case '/products/complete-pack':
      return normalized.includes('complete') || normalized.includes('court pack');
    case '/products/money-claim':
      return normalized.includes('money');
    case '/products/ast':
      return normalized.includes('tenancy') || normalized.includes('agreement') || normalized.includes('contract');
    default:
      return false;
  }
}

const LANDLORD_SCENARIO_IMAGE_MAP: Record<string, { src: string; alt: string }> = {
  'Your fixed term has ended, the tenant will not leave, and you want a clean no-fault route without a paperwork restart.': {
    src: '/images/1 Tenant Wont Leave.webp',
    alt: 'Tenant refusing to leave after fixed term ended',
  },
  'You are unsure whether your compliance record is complete enough to serve safely right now.': {
    src: '/images/2️ Unsure Compliance.webp',
    alt: 'Landlord reviewing Section 21 compliance paperwork',
  },
  'You need to act this week and want a guided workflow instead of editing generic templates manually.': {
    src: '/images/3️ Need to Act.webp',
    alt: 'Landlord preparing urgent eviction notice this week',
  },
  'You inherited tenancy admin from an agent and need to verify whether deposit and prescribed information records are actually court-ready.': {
    src: '/images/4️ Inherited Tenancy Admin.webp',
    alt: 'Inherited tenancy admin records being checked for court readiness',
  },
  'You expect possession might go to paper-based accelerated possession and want your notice-stage chronology to be usable later, not rebuilt from scratch.': {
    src: '/images/5️ Accelerated Possession.webp',
    alt: 'Accelerated possession paperwork timeline prepared for court use',
  },
  'You are balancing arrears pressure with route safety and need confidence that a Section 21 route is still available before committing to service.': {
    src: '/images/6️ Balancing Arrears Pressure.webp',
    alt: 'Landlord balancing arrears pressure and Section 21 route safety',
  },
};

function getHowToSchema(config: IntentPageConfig, canonical: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `${config.h1}: step-by-step landlord process`,
    description: config.description,
    url: canonical,
    step: [
      { '@type': 'HowToStep', name: 'Confirm route based on tenancy facts' },
      { '@type': 'HowToStep', name: 'Serve the correct notice and preserve service proof' },
      { '@type': 'HowToStep', name: 'Wait the lawful notice period and track tenant response' },
      { '@type': 'HowToStep', name: 'Prepare and submit possession claim paperwork' },
      { '@type': 'HowToStep', name: 'Move to enforcement if possession is still refused' },
    ],
  };
}

function getItemListSchema(slug: string, canonical: string) {
  if (!['section-21-checklist', 'eviction-timeline-england'].includes(slug)) {
    return null;
  }

  const items = [
    'Deposit protected',
    'EPC served',
    'Gas safety certificate',
    'How to Rent guide',
    'Correct notice form',
    'Proper service method',
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Eviction readiness checklist',
    url: canonical,
    itemListElement: items.map((name, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
    })),
  };
}

export function EvictionIntentLandingPage({ config }: { config: IntentPageConfig }) {
  const taxonomyEntry = getSeoPageTaxonomyBySlug(config.slug);
  const configPrimaryProductRoute =
    config.primaryProduct === 'notice_only' ? '/products/notice-only' : '/products/complete-pack';
  const configSecondaryProductRoute = config.secondaryCta
    ? config.secondaryCta.product === 'notice_only'
      ? '/products/notice-only'
      : '/products/complete-pack'
    : null;
  const fallbackSecondaryActionHref = configSecondaryProductRoute ?? '/products/complete-pack';
  const primaryHref = taxonomyEntry
    ? getPrimaryDestinationAboveFold(taxonomyEntry)
    : configPrimaryProductRoute;
  const heroSecondaryHref = taxonomyEntry
    ? config.secondaryCta && taxonomyEntry.secondaryProduct
      ? taxonomyEntry.secondaryProduct
      : null
    : config.secondaryCta
      ? configSecondaryProductRoute
      : null;
  const secondaryActionHref = taxonomyEntry
    ? heroSecondaryHref
    : fallbackSecondaryActionHref;
  const pageType = taxonomyEntry?.pageType ?? 'problem';
  const jurisdiction = taxonomyEntry?.jurisdiction ?? 'england';
  const primaryProductRoute = taxonomyEntry?.primaryProduct
    ?? (config.primaryProduct === 'notice_only' ? '/products/notice-only' : '/products/complete-pack');
  const primaryCtaLabel = taxonomyEntry && !labelMatchesProduct(config.heroCta, taxonomyEntry.primaryProduct)
    ? getProductCtaLabel(taxonomyEntry.primaryProduct)
    : config.heroCta;
  const heroSecondaryLabel = heroSecondaryHref
    ? taxonomyEntry
      ? config.secondaryCta
        && configSecondaryProductRoute === heroSecondaryHref
        && labelMatchesProduct(config.secondaryCta.label, heroSecondaryHref)
        ? config.secondaryCta.label
        : getProductCtaLabel(heroSecondaryHref)
      : config.secondaryCta?.label ?? null
    : null;
  const secondaryActionLabel = taxonomyEntry
    ? heroSecondaryLabel
    : config.secondaryCta?.label ?? getProductCtaLabel(fallbackSecondaryActionHref);
  const canonical = `https://landlordheaven.co.uk/${config.slug}`;
  const lastUpdated = config.lastUpdated ?? DEFAULT_UPDATED;

  const authorityLinks = getAuthorityLinks(config.slug);

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: config.h1,
    description: config.description,
    url: canonical,
    keywords: [config.keyword, 'landlord eviction england', 'eviction notice help'],
    dateModified: `2026-03-01`,
  };

  const articleStructuredData = articleSchema({
    headline: config.h1,
    description: config.description,
    url: canonical,
    datePublished: '2026-03-01',
    dateModified: '2026-03-01',
  });

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name:
      primaryProductRoute === '/products/notice-only'
        ? 'Notice Only Eviction Workflow'
        : primaryProductRoute === '/products/money-claim'
          ? 'Money Claim Workflow'
          : 'Complete Eviction Pack Workflow',
    provider: { '@type': 'Organization', name: 'Landlord Heaven' },
    areaServed: AREA_SERVED_BY_JURISDICTION[jurisdiction],
    serviceType: 'Landlord document generation and guided workflow',
    url: canonical,
  };

  const howToSchema = getHowToSchema(config, canonical);
  const itemListSchema = getItemListSchema(config.slug, canonical);
  const conciseFaqs = config.faqs.map((faq) => ({
    ...faq,
    answer: faq.answer.split('. ')[0].trim().concat(faq.answer.endsWith('.') ? '' : '.'),
  }));

  const tocItems = [
    { href: '#eviction-process-overview', label: 'Eviction process overview' },
    { href: '#section-21-vs-section-8-explainer', label: 'Section 21 vs Section 8' },
    { href: '#compliance-requirements', label: 'Compliance requirements' },
    { href: '#court-forms-explained', label: 'Court forms explained' },
    { href: '#eviction-timeline', label: 'Eviction timeline' },
    { href: '#start-eviction-now', label: 'Start eviction notice' },
  ];

  const commonMistakes = [
    'Serving the wrong notice for the case facts',
    'Using outdated forms from generic template websites',
    'Serving through the wrong method or without proof',
    'Missing key compliance documents such as gas safety evidence',
    'Choosing the wrong possession route and losing weeks',
    'Submitting incomplete court paperwork after notice expiry',
  ];

  const routeScenarios = [
    {
      title: 'Scenario: Tenant owes 3+ months rent',
      route: 'Recommended route: Section 8 notice with arrears-ready evidence workflow.',
      link: '/section-8-rent-arrears-eviction',
    },
    {
      title: 'Scenario: Fixed-term tenancy ending',
      route: 'Recommended route: Section 21 notice if eligibility and compliance checks are satisfied.',
      link: '/section-21-checklist',
    },
    {
      title: 'Scenario: Tenant remains after notice',
      route: 'Next step: possession claim workflow with the correct court forms and continuity checks.',
      link: '/eviction-court-forms-england',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath={`/${config.slug}`}
        pageTitle={config.title}
        pageType={pageType}
        jurisdiction={jurisdiction}
      />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={webPageSchema} />
      <StructuredData data={serviceSchema} />
      <StructuredData data={articleStructuredData} />
      <StructuredData data={faqPageSchema(conciseFaqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Eviction', url: 'https://landlordheaven.co.uk/eviction-notice-england' },
          { name: config.h1, url: canonical },
        ])}
      />
      {howToSchema ? <StructuredData data={howToSchema} /> : null}
      {itemListSchema ? <StructuredData data={itemListSchema} /> : null}

      <UniversalHero
        title={config.h1}
        subtitle={config.heroSubheadline}
        primaryCta={{ label: primaryCtaLabel, href: primaryHref }}
        secondaryCta={
          heroSecondaryHref && heroSecondaryLabel
            ? { label: heroSecondaryLabel, href: heroSecondaryHref }
            : undefined
        }
        showReviewPill
        showTrustPositioningBar
        mediaSrc={config.icon}
        mediaAlt={`${config.keyword} icon`}
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          {config.proofBullets.map((bullet) => (
            <li key={bullet}>✓ {bullet}</li>
          ))}
        </ul>
      </UniversalHero>

      <section className="py-8 bg-white border-y border-[#EDE2FF]">
        <Container>
          <div className="mx-auto max-w-6xl space-y-4">
            <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
              <Link href="/" className="hover:underline">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/eviction-notice-england" className="hover:underline">Eviction</Link>
              <span className="mx-2">›</span>
              <span className="font-medium text-charcoal">{config.h1}</span>
            </nav>
            <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
            <div className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">Jump to</p>
              <div className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
                {tocItems.map((item) => (
                  <a key={item.href} href={item.href} className="rounded-lg bg-white px-3 py-2 text-primary hover:underline">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {taxonomyEntry ? (
        <section className="bg-white py-8">
          <Container>
            <div className="mx-auto max-w-6xl">
              <SeoPageContextPanel
                pathname={`/${config.slug}`}
                className="border border-[#CAB6FF] bg-[#FBF8FF]"
              />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-12 bg-white border-y border-[#EDE2FF]">
        <Container>
          <div className="mx-auto max-w-6xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
            <h2 className="text-2xl font-bold text-charcoal">Quick answer</h2>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-primary">Question</p>
            <p className="mt-1 text-lg font-semibold text-charcoal">{`What is the fastest safe way for landlords to handle ${config.keyword}?`}</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-primary">Short answer</p>
            <p className="mt-1 text-gray-700">Landlords usually get better outcomes by confirming the right route first, serving a valid notice with provable service, and preparing court-ready chronology before deadlines. This reduces avoidable resets, protects evidence continuity, and keeps possession progression moving from notice through claim and enforcement when tenants still refuse to leave.</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-primary">Numbered steps</p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-gray-700">
              <li>Confirm whether your case is no-fault, breach-based, or rent arrears driven.</li>
              <li>Serve the right notice and keep service proof usable for court.</li>
              <li>Wait for the notice period and log all tenant responses.</li>
              <li>Progress to possession claim paperwork only when chronology is consistent.</li>
              <li>Use warrant or bailiff enforcement if the tenant still refuses to leave.</li>
            </ol>
          </div>
        </Container>
      </section>

      <section id="eviction-process-overview" className="py-14 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal">Eviction process overview</h2>
            <p className="mt-4 text-lg text-gray-700">{config.problemIntro}</p>
            <p className="mt-4 text-gray-700">{config.intentDeepDive}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {config.landlordScenarios.map((scenario) => (
                <article key={scenario} className="rounded-2xl border border-[#E6DBFF] bg-white p-5 text-sm text-gray-700">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Landlord scenario</p>
                  {LANDLORD_SCENARIO_IMAGE_MAP[scenario] ? (
                    <Image
                      src={LANDLORD_SCENARIO_IMAGE_MAP[scenario].src}
                      alt={LANDLORD_SCENARIO_IMAGE_MAP[scenario].alt}
                      width={400}
                      height={260}
                      className="scenario-image mb-4 mt-3 h-auto w-full rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 400px"
                    />
                  ) : null}
                  {LANDLORD_SCENARIO_IMAGE_MAP[scenario] ? (
                    <p className="mt-2 text-xs text-gray-500">Illustration: {LANDLORD_SCENARIO_IMAGE_MAP[scenario].alt}.</p>
                  ) : null}
                  <p>{scenario}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {config.mistakeRisks.map((risk) => (
                <div key={risk} className="rounded-2xl border border-[#E6DBFF] bg-white p-5 text-gray-700">{risk}</div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="section-21-vs-section-8-explainer" className="py-14">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal">Section 21 vs Section 8: choose the right route</h2>
            <p className="mt-4 text-gray-700">
              A cheap template becomes expensive quickly if it sends you down the wrong route. If you are still deciding,
              use the <Link href="/section-21-vs-section-8" className="text-primary hover:underline"> Section 21 vs Section 8 comparison guide</Link> before serving anything.
              If you already know your route, jump straight into the matching workflow.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Link href="/section-21-notice-generator" className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-5 text-gray-700 hover:shadow-sm">
                <p className="font-semibold text-charcoal">Section 21 route</p>
                <p className="mt-2 text-sm">Best for no-fault route cases where compliance pre-conditions are satisfied.</p>
              </Link>
              <Link href="/section-8-notice-generator" className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-5 text-gray-700 hover:shadow-sm">
                <p className="font-semibold text-charcoal">Section 8 route</p>
                <p className="mt-2 text-sm">Best for arrears/breach context where grounds and evidence need to align.</p>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="compliance-requirements" className="py-14 bg-white">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-charcoal">Compliance requirements and why notices fail</h2>
              <p className="mt-4 text-gray-700">Most failed eviction workflows are not caused by obscure legal points; they are caused by missing basics. Generic form sites rarely validate these details.</p>
              <ul className="mt-4 space-y-2 text-gray-700">
                {config.templateRisks.map((risk) => <li key={risk}>• {risk}</li>)}
              </ul>
              <p className="mt-6 text-gray-700">For Section 21 specifically, use the <Link href="/section-21-checklist" className="text-primary hover:underline">Section 21 checklist</Link>. For court progression details, see <Link href="/eviction-court-forms-england" className="text-primary hover:underline">eviction court forms explained</Link>.</p>
            </div>
            <div className="rounded-3xl border border-[#E6DBFF] bg-[#F8F4FF] p-6">
              <Image src={config.icon} alt="wizard icon" width={220} height={220} className="mx-auto h-auto w-full max-w-[220px]" />
              <h3 className="mt-4 text-xl font-semibold text-charcoal">Checklist prompts</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {config.compliance.map((item) => <li key={item}>✓ {item}</li>)}
              </ul>
              <p className="mt-4 text-sm text-gray-700">If your notice is invalid, the court can reject your claim and you may need to start again.</p>
            </div>
          </div>
        </Container>
      </section>

      <section id="court-forms-explained" className="py-14">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal">Court forms explained and route continuity</h2>
            <p className="mt-4 text-gray-700">If the tenant does not leave, route continuity matters. For N5B-focused no-fault progression, see <Link href="/n5b-possession-claim-form" className="text-primary hover:underline">N5B possession claim form guidance</Link>. For grounds-based claim forms, use <Link href="/n5-n119-possession-claim" className="text-primary hover:underline">N5 and N119 possession claim guidance</Link>.</p>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E6DBFF] text-left text-gray-500">
                    <th className="py-3 pr-4">Comparison point</th>
                    <th className="py-3 pr-4">Landlord Heaven</th>
                    <th className="py-3">Generic templates / solicitor route</th>
                  </tr>
                </thead>
                <tbody>
                  {config.comparisons.map((row) => (
                    <tr key={row.point} className="border-b border-[#F1EAFE] align-top">
                      <td className="py-3 pr-4 font-semibold text-charcoal">{row.point}</td>
                      <td className="py-3 pr-4 text-gray-700">{row.landlordHeaven}</td>
                      <td className="py-3 text-gray-700">{row.alternative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      <section id="eviction-timeline" className="py-14 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal">Eviction timeline and common delay points</h2>
            <p className="mt-4 text-gray-700">For timing expectations, use the <Link href="/eviction-timeline-england" className="text-primary hover:underline">eviction timeline England guide</Link>. Court backlogs are outside your control, but notice validity and service quality are not.</p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#E6DBFF] bg-white">
              <div className="relative w-full">
                <Image
                  src="/images/eviction-timeline.webp"
                  alt="Eviction timeline"
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal">Evidence quality checklist before issuing a claim</h2>
            <p className="mt-4 text-gray-700">
              Possession files rarely fail because landlords did nothing. They fail because the evidence trail is fragmented, dates do not align,
              or key service facts are missing. Build your file as one coherent chronology from tenancy start through to notice service.
              If every major event has a date and supporting document, your court-stage admin is much easier.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-5">
                <h3 className="text-lg font-semibold text-charcoal">Documents to check before filing</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>• Signed tenancy agreement plus any renewal/variation records.</li>
                  <li>• Deposit protection evidence and prescribed information delivery records.</li>
                  <li>• Compliance records (for example EPC, gas safety, and How to Rent where relevant).</li>
                  <li>• Notice copy showing exact date, method, and recipient details.</li>
                  <li>• Proof of service (certificate, posting evidence, hand-delivery witness notes, or tracked records).</li>
                  <li>• Rent ledger or arrears schedule with clear running totals.</li>
                </ul>
              </article>
              <article className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-5">
                <h3 className="text-lg font-semibold text-charcoal">Mistakes that create avoidable delay</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>• Contradictory dates between notice, witness narrative, and court forms.</li>
                  <li>• Missing proof that mandatory documents were served to the tenant.</li>
                  <li>• Recalculating arrears late and submitting inconsistent debt totals.</li>
                  <li>• Using screenshots without context, timestamp, or explanation in chronology.</li>
                  <li>• Mixing template wording from different sources and creating route ambiguity.</li>
                  <li>• Waiting until expiry day to assemble court paperwork.</li>
                </ul>
              </article>
            </div>
            <p className="mt-6 text-gray-700">
              Practical workflow: draft your chronology first, then attach documents to each event. If you cannot explain one event in one sentence
              with one supporting file, that point may be challenged later. Structured generation helps by keeping notice-stage facts and court-stage
              facts aligned from the outset.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal">Cost and risk planning: what to do at each stage</h2>
            <p className="mt-4 text-gray-700">
              The wrong route is expensive, but so is weak preparation on the right route. Planning by stage helps you control delays,
              preserve evidence, and avoid repeat filing costs.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-5">
                <h3 className="font-semibold text-charcoal">Before serving</h3>
                <p className="mt-2 text-sm text-gray-700">Validate route eligibility, confirm compliance history, and choose a service method you can prove later.</p>
              </div>
              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-5">
                <h3 className="font-semibold text-charcoal">During notice period</h3>
                <p className="mt-2 text-sm text-gray-700">Maintain communication logs, keep arrears schedules current, and prepare court documents before expiry.</p>
              </div>
              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-5">
                <h3 className="font-semibold text-charcoal">At court handoff</h3>
                <p className="mt-2 text-sm text-gray-700">Submit one consistent narrative: tenancy facts, notice, service, chronology, and supporting evidence should all match.</p>
              </div>
            </div>
            <p className="mt-6 text-gray-700">
              Complex, defended, or unusual matters may still require legal advice. For straightforward landlord cases, the commercial goal is clear:
              avoid invalid paperwork, avoid rework, and keep the possession route moving with evidence that stands up.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal">Common eviction mistakes landlords make</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {commonMistakes.map((mistake) => (
                <article key={mistake} className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-5 text-sm text-gray-700">
                  {mistake}
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className="hero-btn-primary">{primaryCtaLabel}</Link>
              {secondaryActionHref && secondaryActionLabel ? (
                <Link href={secondaryActionHref} className="hero-btn-secondary">
                  {secondaryActionLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal">Real landlord scenarios and route recommendations</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {routeScenarios.map((scenario) => (
                <Link key={scenario.title} href={scenario.link} className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-5 text-gray-700 hover:shadow-sm">
                  <p className="font-semibold text-charcoal">{scenario.title}</p>
                  <p className="mt-2 text-sm">{scenario.route}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="start-eviction-now" className="py-14">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-br from-[#692ED4] via-[#7A3BE5] to-[#5a21be] p-8 text-white shadow-[0_22px_60px_rgba(105,46,212,0.32)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Next step</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">Do not let avoidable paperwork errors add more lost rent</h2>
            <p className="mt-3 text-white/90">A generic template can look cheap at the start, but if route, dates, or service are wrong you can lose months and restart. Use the guided workflow now and keep your case moving.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className="hero-btn-primary">{primaryCtaLabel}</Link>
              {heroSecondaryHref && heroSecondaryLabel ? (
                <Link href={heroSecondaryHref} className="hero-btn-secondary">
                  {heroSecondaryLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-[#E6DBFF] bg-[#F8F4FF] p-6">
              <h2 className="text-2xl font-bold text-charcoal">Related eviction scenarios landlords face</h2>
              <p className="mt-3 text-gray-700">Use these deeper guides when your eviction process escalates from notice to Possession Order, Warrant of Possession, and Bailiff Eviction stages.</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>• <Link href="/section-8-grounds-explained" className="text-primary hover:underline">Common Section 8 grounds</Link> for breach and Rent Arrears files.</li>
                <li>• <Link href="/accelerated-possession-guide" className="text-primary hover:underline">Accelerated Possession</Link> pathway after valid Section 21 service.</li>
                <li>• <Link href="/possession-order-process" className="text-primary hover:underline">When eviction escalates to court</Link> and possession claim filing.</li>
              </ul>
            </article>
            <article className="rounded-3xl border border-[#E6DBFF] bg-white p-6">
              <h2 className="text-2xl font-bold text-charcoal">What most landlords do next</h2>
              <p className="mt-3 text-gray-700">If your tenant situation matches this scenario, most landlords take a staged route: valid notice first, then court continuity, then enforcement support.</p>
              <div className="mt-4 space-y-2 text-sm">
                <Link href="/products/notice-only" className="block rounded-xl border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Fastest route landlords usually take: start Notice Only</Link>
                <Link href="/products/complete-pack" className="block rounded-xl border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Need court continuity? Move to Complete Pack</Link>
                <Link href="/products/money-claim" className="block rounded-xl border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Recover rent arrears in parallel with Money Claim</Link>
              </div>
            </article>
          </div>
        </Container>
      </section>

      {authorityLinks ? (
        <section className="py-12">
          <Container>
            <div className="mx-auto max-w-6xl rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-2xl font-bold text-charcoal">Cluster authority links: {authorityLinks.clusterLabel}</h2>
              <p className="mt-3 text-gray-700">Every guide links to its canonical parent, two supporting guides, one tool, and one product page to strengthen crawl paths and internal authority flow.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
                <Link href={authorityLinks.parent} className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-3 text-primary hover:underline">Canonical parent: {authorityLinks.parent}</Link>
                {authorityLinks.supporting.map((href) => (
                  <Link key={href} href={href} className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-3 text-primary hover:underline">Supporting page: {href}</Link>
                ))}
                <Link href={authorityLinks.tool} className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-3 text-primary hover:underline">Tool page: {authorityLinks.tool}</Link>
                <Link href={authorityLinks.product} className="rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-3 text-primary hover:underline">Product page: {authorityLinks.product}</Link>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-10 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6">
            <h2 className="text-2xl font-bold text-charcoal">Entity map across this guide cluster</h2>
            <p className="mt-3 text-gray-700">This page reinforces the core landlord entities used across high-intent pages, FAQs, and schema to improve topical consistency.</p>
            <div className="mt-4 grid gap-2 md:grid-cols-3 text-sm text-gray-700">
              {EVICTION_ENTITIES.map((entity) => <p key={entity} className="rounded-lg bg-white border border-[#E6DBFF] px-3 py-2">{entity}</p>)}
            </div>
          </div>
        </Container>
      </section>

      <FAQSection title="Frequently asked questions" faqs={config.faqs} showContactCTA={false} variant="gray" includeSchema={false} />

      <section className="py-14 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-10">
            <h2 className="text-2xl font-bold text-charcoal">Related eviction guides</h2>
            <p className="mt-3 text-gray-700">Use these guides to move from notice choice to court progression with fewer mistakes.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {config.relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-xl border border-[#E6DBFF] bg-white p-4 text-primary hover:underline">
                  {link.label}
                </Link>
              ))}
              <Link href="/eviction-timeline-england" className="rounded-xl border border-[#E6DBFF] bg-white p-4 text-primary hover:underline">Eviction timeline England</Link>
              <Link href="/section-21-checklist" className="rounded-xl border border-[#E6DBFF] bg-white p-4 text-primary hover:underline">Section 21 checklist</Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-br from-[#692ED4] via-[#7A3BE5] to-[#5a21be] p-8 text-center text-white shadow-[0_22px_60px_rgba(105,46,212,0.35)] md:p-12">
            <h2 className="text-3xl font-bold">{config.finalCta}</h2>
            <p className="mt-4 text-white/90">For many straightforward cases, landlords do not need to pay a solicitor hundreds or thousands just to get the starting paperwork in place. Use the guided route and move now.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={primaryHref} className="hero-btn-primary">{config.heroCta}</Link>
              {secondaryActionHref && secondaryActionLabel ? (
                <Link href={secondaryActionHref} className="hero-btn-secondary">{secondaryActionLabel}</Link>
              ) : null}
            </div>
            <p className="mt-5 text-sm text-white/80">Landlord Heaven provides document generation and guidance, not legal advice or court representation.</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
