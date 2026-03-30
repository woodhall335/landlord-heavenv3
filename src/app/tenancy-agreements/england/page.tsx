import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { TenancyPackSection } from '@/components/value-proposition';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { PRODUCTS } from '@/lib/pricing/products';
import { productLinks, guideLinks, askHeavenLink } from '@/lib/seo/internal-links';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  Clock,
  FileText,
  Gavel,
  Home,
  Scale,
  Shield,
  Users,
  XCircle,
} from 'lucide-react';

const PAGE_PATH = '/tenancy-agreements/england';
const PAGE_TITLE = 'England Tenancy Agreement Guide';
const PAGE_TYPE = 'tenancy' as const;

const canonicalUrl = getCanonicalUrl(PAGE_PATH);
const englandComparisonHref = '/products/ast';

const wizardLinkStandard =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_standard_tenancy_agreement&src=england_tenancy_guide&topic=tenancy';
const wizardLinkPremium =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_premium_tenancy_agreement&src=england_tenancy_guide&topic=tenancy';

const faqs = [
  {
    question: 'What is this England tenancy agreement guide for?',
    answer:
      'This is a guide page for landlords who want to understand the main England agreement types and the terminology shift from older AST language. If you are ready to compare products or start drafting, use /products/ast as the main England comparison page.',
  },
  {
    question: 'Is this page only for properties in England?',
    answer:
      'Yes. This page is for England only. Wales, Scotland, and Northern Ireland each use different legal frameworks, terminology, and agreement structures, so landlords should use the page that matches the location of the property.',
  },
  {
    question: 'Why does this page use current England agreement wording instead of only saying AST?',
    answer:
      'Because many landlords still search with AST wording, but the stronger live England product position for new agreements is now framed around current England agreement wording. The page still serves legacy AST search intent, but it does not need to present old AST-first sales wording as the main live product story.',
  },
  {
    question: 'Can I still use this page if I searched for an assured shorthold tenancy agreement?',
    answer:
      'Yes. This page is deliberately built to capture assured shorthold tenancy agreement and AST template search intent, then guide landlords into the current England agreement route.',
  },
  {
    question: 'Can I keep using an older tenancy agreement?',
    answer:
      'Many older tenancy agreements still exist, but they may be harder to rely on if they use outdated wording or structure. Using an agreement that does not reflect the current England framework can create avoidable uncertainty if issues arise.',
  },
  {
    question: 'When should I use the standard England agreement route?',
    answer:
      'The standard route is usually the best fit for a more straightforward new England let where the property and occupier setup are relatively simple and you want an efficient route into the main agreement flow.',
  },
  {
    question: 'When is the premium England agreement likely to be the better option?',
    answer:
      'Premium is usually the better fit where the letting is still an ordinary residential tenancy but you want fuller drafting, clearer payment mechanics, guarantor support, or more operational detail from the outset. If the setup is genuinely student-focused, HMO/shared-house, or resident-landlord, use the dedicated England product for that route.',
  },
  {
    question: 'Does this page say Section 21 has definitely ended on a fixed date?',
    answer:
      'No. The page is careful with transition wording. It reflects that Section 21-led and AST-first language is increasingly legacy search framing, but it avoids brittle certainty where the wider reform picture or business messaging may continue to evolve.',
  },
  {
    question: 'Is this page a free blank template page?',
    answer:
      'No. This is a commercial comparison and decision page. It is designed to help landlords choose the correct England agreement route before starting the live creation flow.',
  },
  {
    question: 'Why is this page more detailed than a typical template page?',
    answer:
      'Because high-intent legal product pages perform better when they answer practical buying and setup questions. Landlords usually want more than a short definition and a button. They want to know what the page is for, what wording has changed, when standard is enough, when premium is justified, and what to do next.',
  },
  {
    question: 'What should I do after reading this page?',
    answer:
      'If the let is a straightforward whole-property residential tenancy, start Standard. If it is still an ordinary residential let but needs fuller drafting, review Premium. If it is student-focused, HMO/shared-house, or a resident-landlord room let, use the dedicated England route for that setup.',
  },
];

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'England Tenancy Agreement Guide | Agreement Types and Next Steps',
  description:
    'Guide to the main England tenancy agreement types, with links to the main comparison page and the right route for Standard, Premium, Student, HMO / Shared House, and Lodger lets.',
  keywords: [
    'tenancy agreements england',
    'england tenancy agreement',
    'residential tenancy agreement england',
    'tenancy agreement template england',
    'assured shorthold tenancy agreement england',
    'ast tenancy agreement england',
    'landlord tenancy agreement england',
    'joint tenancy agreement england',
    'premium tenancy agreement england',
    'new tenancy agreement england',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title:
      'England Tenancy Agreement Guide | Agreement Types and Next Steps',
    description:
      'Guide to the main England tenancy agreement types, with clear next steps into the main comparison page and the live product routes.',
    url: canonicalUrl,
    type: 'article',
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'England Tenancy Agreement Guide | Agreement Types and Next Steps',
    description:
      'Guide to the England tenancy agreement types for Standard, Premium, Student, HMO / Shared House, and Lodger lets.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EnglandTenancyAgreementsPage() {
  return (
    <>
      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="england"
      />

      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline:
            'England Tenancy Agreement Guide | Agreement Types and Next Steps',
          description:
            'Guide to the main England tenancy agreement routes, with practical next steps into the current comparison and drafting flow.',
          url: canonicalUrl,
          datePublished: '2026-03-01',
          dateModified: '2026-03-20',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreements', url: canonicalUrl },
          { name: 'England', url: canonicalUrl },
        ])}
      />

      <main className="min-h-screen bg-[#fcfaff]">
        <UniversalHero
          badge="England Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="England Tenancy Agreement Guide"
          subtitle={
            <>
              Use this guide to understand the main <strong>England tenancy agreement</strong>{' '}
              types, make sense of the shift from legacy <strong>AST</strong> language,
              and then move to the main comparison page when you are ready to choose
              between Standard, Premium, Student, HMO/shared-house, or Lodger
              wording for a new let.
            </>
          }
          primaryCta={{
            label: 'Compare England agreement routes',
            href: englandComparisonHref,
          }}
          secondaryCta={{
            label: `Start Standard Tenancy Agreement - ${PRODUCTS.england_standard_tenancy_agreement.displayPrice}`,
            href: wizardLinkStandard,
          }}
          showTrustPositioningBar
          variant="pastel"
        >
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Updated England framework from 1 May 2026
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Five live England routes
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              Older wording may be harder to rely on
            </span>
          </div>
        </UniversalHero>

        <section className="border-y border-[#E6DBFF] bg-white py-6">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <SeoPageContextPanel pathname="/tenancy-agreements/england" />
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-[#2a2161]">Quick answer</h2>
              <p className="mt-4 leading-7 text-gray-700">
                If you need a tenancy agreement for a property in England, this page is
                the main decision point before you start drafting. It is built for
                landlords who are comparing the live England routes and who still
                encounter older search phrases such as assured shorthold tenancy agreement
                or AST template while looking for the right document.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                The short version is this: for many straightforward new England lets, the
                standard route is likely to be the right place to begin. Where the let is
                still an ordinary residential tenancy but needs fuller drafting,
                guarantor support, or more operational detail, premium is often the
                better commercial choice. Where the setup is genuinely student-focused,
                HMO/shared-house, or resident-landlord, the dedicated England products
                are the cleaner fit. The page is designed to help the user make that
                decision clearly instead of relying on vague template copy.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                It also handles a terminology shift. Many landlords still search using
                AST-led language because that is how the market spoke for years. The live
                England product story now sits more naturally under current England
                agreement wording for new agreements. This page keeps the legacy search
                language visible for discoverability, but it leads users into the current
                product direction rather than pretending nothing has changed.
              </p>
              <p className="mt-4 leading-7 text-gray-700">
                That matters because older agreements may be harder to rely on if they use
                outdated wording or structure. Using an agreement that does not reflect the
                current England framework can create avoidable uncertainty if issues arise.
              </p>
            </div>
          </div>
        </section>

        <section id="whats-included" className="bg-white py-12">
          <div className="container mx-auto px-4">
            <TenancyPackSection
              defaultJurisdiction="england"
              lockJurisdiction
              intro="You get more than an England tenancy agreement. Landlord Heaven builds a practical England tenancy pack with the agreement, setup documents, and preview-before-payment flow that is easier to use than relying on an old AST-style template."
            />
          </div>
        </section>

        <section className="border-b border-[#E6DBFF] bg-white py-8">
          <div className="container mx-auto px-4">
            <nav
              aria-labelledby="england-tenancy-links-heading"
              className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6"
            >
              <h2 id="england-tenancy-links-heading" className="text-2xl font-semibold text-[#2a2161]">
                On this page
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <a href="#what-this-page-is-for" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  What this page is for
                </a>
                <a href="#ast-vs-residential-wording" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  AST wording vs current England agreement wording
                </a>
                <a href="#standard-vs-premium" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Standard vs premium
                </a>
                <a href="#when-to-use" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  When to use each route
                </a>
                <a href="#common-mistakes" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Common mistakes
                </a>
                <a href="#next-steps" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Next steps
                </a>
              </div>
            </nav>
          </div>
        </section>

        <section id="what-this-page-is-for" className="bg-white py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-gray-900">
                What this England tenancy agreements page is for
              </h2>
              <div className="mt-6 space-y-6 text-gray-700">
                <p className="leading-7">
                  This guide is for landlords who know the property is in England but
                  want to be sure they choose the right agreement route before they start
                  drafting. Some users arrive ready to buy. Others are still comparing
                  older AST wording with the newer England routes and want a clearer
                  explanation before they commit.
                </p>
                <p className="leading-7">
                  Strong landlords do not only want a label. They want confidence that
                  they are on the right page for the jurisdiction, that the terminology is
                  current enough to trust, and that they are not about to choose the wrong
                  product for a household that is more complex than it first appears. That
                  is why this page needs to work as a commercial decision page, not just a
                  generic explainer. The copy has to answer the user’s real next-step
                  question: which England agreement path should I use now?
                </p>
                <p className="leading-7">
                  That matters because a straightforward whole-property let and a more
                  involved setup do not need the same route. The guide is here to reduce
                  guesswork before you move into the live comparison or drafting flow.
                </p>
                <p className="leading-7">
                  In short, use this page to understand the options, then move to the
                  main comparison page or the product route that matches the tenancy you
                  are actually about to grant.
                </p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">England-only clarity</h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    The page is written for England lets only, so it avoids Welsh,
                    Scottish, or Northern Ireland terminology being mixed into the body
                    copy.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Current product framing</h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    It explains why legacy AST search terms still matter while the live
                    route is positioned around current England agreement wording, and why
                    older wording may be harder to rely on if issues arise.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Standard vs premium choice</h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    It helps landlords decide whether an ordinary residential let belongs
                    on Standard or Premium, while signposting Student, HMO / Shared
                    House, and Lodger as dedicated England routes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="ast-vs-residential-wording" className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-gray-900">
                Legacy AST search language vs current England agreement wording
              </h2>
              <div className="mt-6 space-y-6 text-gray-700">
                <p className="leading-7">
                  One of the hardest parts of building a genuinely strong England tenancy
                  page is handling the language shift correctly. Many landlords still
                  search for assured shorthold tenancy agreement, AST template, landlord
                  agreement template, or standard tenancy agreement because that is the
                  language they have seen for years. Ignoring that demand would be a
                  mistake. But treating those older terms as if they are still the best
                  live product framing for new England agreements is also a mistake.
                </p>
                <p className="leading-7">
                  We keep that language visible so the page is easy to find, but the
                  practical goal is simpler: help the landlord choose a current England
                  agreement route once they arrive. If you searched using AST wording,
                  you are still in the right place. The next step is to decide which live
                  England route actually fits the let.
                </p>
                <p className="leading-7">
                  In most cases that means deciding whether the tenancy belongs on the
                  standard ordinary-residential route, the fuller ordinary-residential
                  premium route, or one of the dedicated England products for student,
                  HMO / shared-house, or resident-landlord arrangements.
                </p>
                <p className="leading-7">
                  This is also where legal-commercial discipline matters. It is useful to
                  recognise that older Section 21-led and AST-led assumptions still sit
                  behind a lot of landlord search behaviour. But it is not helpful to make
                  brittle promises based on exact future legal certainty if the surrounding
                  reform and market language may continue to move. The stronger page is not
                  the most aggressive page. It is the page that sounds current, credible,
                  and commercially useful without overshooting what it should claim.
                </p>
              </div>

              <div className="mt-10 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 text-left font-semibold text-gray-900">Search or page issue</th>
                      <th className="p-4 text-left font-semibold text-gray-900">Better treatment on this page</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 text-gray-700">User searches “AST template England”</td>
                      <td className="p-4 text-gray-700">
                        Keep AST wording for discoverability, then route into the current
                        England agreement flow.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">User wants a current England product page</td>
                      <td className="p-4 text-gray-700">
                        Lead with current England agreement wording for new agreements.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">User is worried about old no-fault assumptions</td>
                      <td className="p-4 text-gray-700">
                        Use careful transition wording rather than hard promises on reform dates.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Competitor page looks dated or generic</td>
                      <td className="p-4 text-gray-700">
                        Add clearer standard-vs-premium guidance, stronger internal routing,
                        and more practical decision support.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="text-xl font-semibold text-amber-900">
                    Practical transition point
                  </h3>
                </div>
                <p className="leading-7 text-amber-900/90">
                  Landlords may still think in AST language because the market did for a
                  long time. This page does not pretend that search behaviour disappeared.
                  Instead, it keeps those legacy search terms visible while making the live
                  England route feel more current, more useful, and better positioned for
                  new agreements.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="standard-vs-premium" className="bg-white py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-gray-900">
                Standard vs premium: the decision most landlords actually need help with
              </h2>
              <p className="mt-6 leading-7 text-gray-700">
                Many tenancy pages lose conversions because they present a standard and a
                premium card without explaining the real difference. That leaves the user
                wondering whether premium is just a cosmetic upsell or whether it exists
                because some lets genuinely need broader drafting. A stronger England page
                should remove that uncertainty. The question is not “which price do I like
                more?” but “which route actually suits this tenancy?”
              </p>

              <div className="mt-10 grid gap-8 md:grid-cols-2">
                <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900">Standard England agreement</h3>
                  <p className="mt-2 text-2xl font-bold text-primary">
                    {PRODUCTS.england_standard_tenancy_agreement.displayPrice}
                  </p>
                  <p className="mt-5 leading-7 text-gray-700">
                    The standard route is usually the right starting point for a more
                    straightforward new England let. If the property is relatively ordinary,
                    the household setup is simple, and you want an efficient path into the
                    main agreement flow, standard will often be the most proportionate
                    choice.
                  </p>
                  <ul className="mt-6 space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      Good fit for many straightforward new lets
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      Usually suitable where the occupier structure is simple
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      Clear route for landlords who need to move from research to drafting quickly
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      Better than relying on a thin generic template
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkStandard}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                  >
                    Start standard route
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="relative rounded-2xl border-2 border-[#E6DBFF] bg-white p-6 shadow-lg">
                  <div className="absolute -top-3 left-6 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-gray-900">
                    FULLER ORDINARY LETS
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Premium England agreement</h3>
                  <p className="mt-2 text-2xl font-bold text-primary">
                    {PRODUCTS.england_premium_tenancy_agreement.displayPrice}
                  </p>
                  <p className="mt-5 leading-7 text-gray-700">
                    Premium is the better choice when the let stays within the ordinary
                    residential route but you want fuller wording around access, repairs,
                    keys, guarantors, payment controls, and day-to-day management. If the
                    setup is genuinely student-focused, HMO / shared-house, or
                    resident-landlord, use the dedicated England product instead.
                  </p>
                  <ul className="mt-6 space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      Better where fuller day-to-day management wording matters
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      Useful when guarantors, house rules, or payment controls need clearer drafting
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      Still for ordinary residential lets rather than dedicated student, HMO, or lodger cases
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      Helps avoid under-specifying an involved but non-HMO ordinary let
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkPremium}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2a2161] px-5 py-3 font-semibold text-white hover:opacity-95"
                  >
                    Start premium route
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-900">
                    How to think about the choice
                  </h3>
                </div>
                <p className="leading-7 text-green-900/90">
                  Standard should feel like the efficient route for straightforward
                  whole-property lets. Premium should feel like the fuller ordinary
                  residential option when the tenancy stays in that lane but needs more
                  drafting support. Student, HMO / Shared House, and Lodger should stay
                  on their dedicated routes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="when-to-use" className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-gray-900">
                When to use each route and what usually points landlords one way or the other
              </h2>
              <div className="mt-6 grid gap-8 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Situations that often suit standard
                  </h3>
                  <div className="mt-4 space-y-4 text-gray-700">
                    <p className="leading-7">
                      A straightforward single-household let is the obvious example. If
                      there are no unusual occupancy issues, no special complexity around
                      sharers or guarantors, and no reason to think the tenancy needs more
                      detailed drafting from the start, the standard route is often the
                      right answer.
                    </p>
                    <p className="leading-7">
                      It also tends to suit landlords who know what they need and want to
                      move quickly. In many real-world cases, the goal is not to read an
                      academic explanation of tenancy law. It is to choose the right route,
                      enter the details accurately, and get the agreement process moving.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Situations that often suit premium
                  </h3>
                  <div className="mt-4 space-y-4 text-gray-700">
                    <p className="leading-7">
                      Premium tends to make more sense where the tenancy is not especially
                      complex to understand but is more complex to document clearly.
                      Guarantor-backed arrangements, clearer payment mechanics, fuller
                      management wording, and other ordinary-residential setups with more
                      operational detail all push the tenancy away from a simple baseline.
                    </p>
                    <p className="leading-7">
                      These are exactly the scenarios where weak template pages underperform.
                      They often assume a “normal” single-household let and leave landlords
                      to improvise around the edges. Premium exists to avoid that gap.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">What this means in practice</h3>
                <p className="mt-4 leading-7 text-gray-700">
                  The most useful mental shortcut is tenancy complexity. If the household
                  and property are simple, standard is usually the right place to begin. If
                  the let is still ordinary residential but there are more practical rules,
                  more coordination points, or more risk of misunderstanding if the
                  drafting is too light, premium is more likely to be proportionate. If the
                  setup is actually student, HMO/shared-house, or lodger, step out of the
                  standard-versus-premium lens and use the dedicated route instead. This is much more useful than vague
                  “good, better, best” product language because it tells the user how to
                  decide instead of asking them to guess.
                </p>
                <p className="mt-4 leading-7 text-gray-700">
                  It also improves conversion quality. Users who choose correctly at the top
                  of the funnel are less likely to second-guess the product later. That
                  means fewer wrong-door conversions and a clearer match between search
                  intent and the agreement route they actually need.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-gray-900">
                Key England points landlords usually want this page to address
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Scale className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Jurisdiction discipline</h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    England wording should stay England-only. Users do not want Welsh
                    occupation contract language, Scottish PRT terminology, or Northern
                    Ireland references drifting into the page.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Current transition wording</h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    Users expect the page to sound current. It should recognise that older
                    AST and Section 21-led assumptions are now part of legacy search
                    behaviour without making brittle date claims where caution is wiser.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Gavel className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Commercially strong, not reckless</h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    The page should be confident about the product route without pretending
                    that any agreement removes every legal or operational risk.
                  </p>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h3 className="text-xl font-semibold text-red-900">
                    What weaker competition pages often get wrong
                  </h3>
                </div>
                <ul className="space-y-3 text-red-900/90">
                  <li>• They treat England, Wales, Scotland, and NI as near-identical pages.</li>
                  <li>• They define “tenancy agreement” but do not help the user choose a route.</li>
                  <li>• They overuse old AST language without a current product story.</li>
                  <li>• They bury the real decision about standard versus premium.</li>
                  <li>• They sound legally absolute where the wording should be more careful.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="common-mistakes" className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-gray-900">
                Common mistakes landlords make when comparing England tenancy agreement pages
              </h2>
              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Assuming all England pages are basically the same
                  </h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    They are not. Some pages are little more than template bait. Others are
                    overly generic and do not really help the landlord choose. A stronger
                    page should explain what the route is for, who it suits, and when
                    another route is more appropriate.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Letting legacy search language drive the whole decision
                  </h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    Searching for AST does not mean the best live product page should still
                    be built entirely around AST-first wording. Stronger pages capture
                    legacy search demand, then explain the current product route clearly.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Choosing standard by default when the tenancy is obviously more complex
                  </h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    Many landlords start with the cheapest-looking route even when the
                    tenancy needs fuller drafting or even belongs on one of the dedicated
                    Student, HMO / Shared House, or Lodger routes. That can be a false
                    economy if the broader or more specific route was the better fit from
                    the start.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Treating the page like a passive legal article
                  </h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    This page is not meant to be read and forgotten. It is a high-intent
                    page for users who are often close to action. The content should help
                    them decide and then move them toward the correct next step.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-6">
                <h3 className="text-lg font-semibold text-purple-900">
                  Need help deciding whether your setup is straightforward or more complex?
                </h3>
                <p className="mt-3 leading-7 text-purple-900/90">
                  Every tenancy looks simple until one or two real details make it less so.
                  If you are unsure whether your property or occupier setup belongs on the
                  standard route, the premium route, or one of the dedicated Student,
                  HMO / Shared House, or Lodger products, use Ask Heaven for a free
                  landlord Q&amp;A before you start.
                </p>
                <Link
                  href="/ask-heaven"
                  className="mt-4 inline-flex items-center gap-2 font-medium text-purple-700 hover:text-purple-900"
                >
                  Ask Heaven free Q&amp;A
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <SeoCtaBlock
                showTrustPositioningBar
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="england"
                title="Create the right England agreement now"
                description={`Choose Standard for a straightforward ordinary let, Premium for fuller ordinary-residential drafting, or the dedicated Student, HMO / Shared House, or Lodger route where that setup is the real match. Start from ${PRODUCTS.england_standard_tenancy_agreement.displayPrice}.`}
              />
            </div>
          </div>
        </section>

        <section id="next-steps" className="bg-white py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
              <h2 className="text-3xl font-bold text-gray-900">Next steps</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    If the let is straightforward
                  </h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    Start the standard England agreement route. For many landlords, that is
                    the most efficient path from research into a live, current England
                    agreement workflow.
                  </p>
                  <Link
                    href={wizardLinkStandard}
                    className="mt-4 inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    Start standard England agreement
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    If the tenancy is more involved
                  </h3>
                  <p className="mt-3 leading-7 text-gray-700">
                    Review Premium if the let is still an ordinary residential tenancy but
                    needs fuller drafting or guarantor support. If the setup is really
                    student-focused, HMO/shared-house, or resident-landlord, start from
                    the dedicated England route for that arrangement.
                  </p>
                  <Link
                    href={wizardLinkPremium}
                    className="mt-4 inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    Start premium England agreement
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6">
                <h3 className="text-xl font-semibold text-[#2a2161]">
                  Final practical takeaway
                </h3>
                <p className="mt-4 leading-7 text-gray-700">
                  Landlords searching for tenancy agreements in England are not really
                  searching for a phrase. They are searching for confidence that they are
                  using the right agreement route for the let they are about to grant. This
                  page exists to give them that confidence: correct jurisdiction, current
                  wording, clearer route choice, and a direct path into the correct
                  Landlord Heaven flow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FAQSection
          faqs={faqs}
          title="England tenancy agreement FAQ"
          showContactCTA={false}
          showTrustPositioningBar
          variant="gray"
        />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <SeoCtaBlock
                pageType="tenancy"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="england"
                title="Ready to create your England tenancy agreement?"
                description={`Choose the route that matches the tenancy and generate your document online from ${PRODUCTS.england_standard_tenancy_agreement.displayPrice}.`}
              />
              <SeoDisclaimer className="mx-auto max-w-4xl" />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <RelatedLinks
                title="Related England tenancy resources"
                links={[
                  productLinks.tenancyAgreement,
                  {
                    href: '/tenancy-agreement-template',
                    title: 'Tenancy agreement template for England',
                    description:
                      'Guided England template route for landlords who start with template-style search terms.',
                    icon: 'document' as const,
                    type: 'page' as const,
                  },
                  {
                    href: '/joint-tenancy-agreement-england',
                    title: 'Joint tenancy agreement England',
                    description:
                      'Compare the England route for couples, flatmates, and multiple tenants.',
                    icon: 'document' as const,
                    type: 'page' as const,
                  },
                  {
                    href: '/tenancy-agreement-template',
                    title: 'England tenancy agreement example and guide',
                    description:
                      'See the real England template example first, then move into the right route.',
                    icon: 'document' as const,
                    type: 'page' as const,
                  },
                  guideLinks.howToEvictTenant,
                  askHeavenLink,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
