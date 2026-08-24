import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { TenancyPackSection } from '@/components/value-proposition';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { tenancyAgreementScotlandLinks } from '@/lib/seo/internal-links';
import { PRODUCTS } from '@/lib/pricing/products';
import { isNonEnglandStandardTenancyPubliclyEnabled } from '@/lib/tenancy/non-england-rollout';
import { getReleasedStandardTenancyEntry } from '@/lib/tenancy/agreement-registry';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  Clock,
  FileText,
  Home,
  Scale,
  Shield,
  XCircle,
} from 'lucide-react';

const PAGE_PATH = '/private-residential-tenancy-agreement-template';
const PAGE_TITLE = 'Private Residential Tenancy Agreement Scotland';
const PAGE_TYPE = 'tenancy' as const;

const canonicalUrl = getCanonicalUrl(PAGE_PATH);

const standardPrice = PRODUCTS.ast_standard.displayPrice;
const isPubliclyEnabled = isNonEnglandStandardTenancyPubliclyEnabled('scotland');

const standardWizardHref = `${getReleasedStandardTenancyEntry('scotland').startRoute}&src=tenancy_hub&topic=tenancy`;

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Private Residential Tenancy Agreement Scotland | Create a PRT Online',
  description:
    'Plain-English landlord guide to creating a Scotland Private Residential Tenancy agreement online, with the right PRT wording for straightforward and more complex lets.',
  keywords: [
    'private residential tenancy agreement',
    'PRT agreement Scotland',
    'private residential tenancy agreement Scotland',
    'Scottish tenancy agreement',
    'PRT template Scotland',
    'Scotland tenancy agreement template',
    'landlord agreement Scotland',
    'joint PRT Scotland',
    'HMO tenancy agreement Scotland',
    'private residential tenancy template',
    'Scottish landlord registration tenancy agreement',
    'PRT agreement for landlords',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title:
      'Private Residential Tenancy Agreement Scotland | Create a PRT Online',
    description:
      'Landlord guide to building a Scotland PRT agreement with current wording, clearer route choice, and practical guidance on registration, deposits, notice, and compliance.',
    type: 'article',
    url: canonicalUrl,
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Private Residential Tenancy Agreement Scotland | Create a PRT Online',
    description:
      'Create a Scotland PRT agreement online with current Scottish wording and clearer landlord guidance.',
  },
  robots: {
    index: isPubliclyEnabled,
    follow: isPubliclyEnabled,
  },
};

const faqs = [
  {
    question: 'What is a Private Residential Tenancy agreement in Scotland?',
    answer:
      'A Private Residential Tenancy, usually shortened to PRT, is the standard form of private residential tenancy used for new private lets in Scotland. It is the correct agreement for most Scottish private residential tenancies created since 1 December 2017.',
  },
  {
    question: 'Can I use an English AST for a Scottish property?',
    answer:
      'No. Scotland has its own tenancy framework. English AST wording is not the correct public route for a Scottish property. A Scottish let should use a Scotland-specific PRT agreement.',
  },
  {
    question: 'Are Scottish PRTs fixed term or open-ended?',
    answer:
      'PRTs are open-ended by law. They do not work like a classic fixed-term AST in England. The tenancy continues until the tenant leaves properly or the landlord relies on a valid statutory ground and follows the correct Scottish process.',
  },
  {
    question: 'Do I need landlord registration in Scotland before letting?',
    answer:
      'Yes. Landlord registration is a core Scottish requirement for most private landlords. Your registration details should be handled properly as part of the wider letting setup, and the agreement should support a Scotland-specific compliance process rather than treating registration as an afterthought.',
  },
  {
    question: 'What is the maximum tenancy deposit in Scotland?',
    answer:
      "The usual Scottish maximum is 2 months' rent. If a deposit is taken, it should be dealt with using the correct Scottish wording and within the wider deposit protection process.",
  },
  {
    question: 'Is this the standard Scotland PRT product?',
    answer:
      'Yes. Landlord Heaven sells one standard Scotland PRT product. The wizard checks the property and occupier setup and blocks arrangements that need a different agreement.',
  },
  {
    question: 'Can a Scottish landlord simply ask a tenant to leave at the end of a term?',
    answer:
      'No. Scotland does not follow the same term-end tenancy logic that many landlords associate with older English AST practice. PRTs are open-ended, and ending the tenancy is tied to the Scottish legal framework rather than a simple non-renewal assumption.',
  },
  {
    question: 'Does this page cover Wales, England, or Northern Ireland?',
    answer:
      'No. This page is specifically for Scotland. England, Wales, and Northern Ireland each use different tenancy frameworks and should use their own jurisdiction-specific agreement pages.',
  },
  {
    question: 'How quickly can I create a Scottish PRT online?',
    answer:
      'The online route is designed to be quick. The main work is entering the property, landlord, tenant, rent, deposit, inventory-delivery, safety, and tenancy details accurately before preview and payment.',
  },
];

export default function PrivateResidentialTenancyAgreementTemplatePage() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline:
            'Private Residential Tenancy Agreement Scotland | Create a PRT Online',
          description:
            'Create a standard Scotland PRT agreement online with current Scottish wording, landlord-focused guidance, and the official supporting notes.',
          url: canonicalUrl,
          datePublished: '2026-01-01',
          dateModified: '2026-03-20',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement Packs', url: getCanonicalUrl('/standard-tenancy-agreement') },
          { name: 'Private Residential Tenancy Agreement', url: canonicalUrl },
        ])}
      />

      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="scotland"
      />

      <main className="min-h-screen bg-gradient-to-br from-[#fbfaff] via-white to-[#f4efff] text-gray-900">
        <UniversalHero
          badge="Scotland Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Private Residential Tenancy Agreement (PRT)"
          subtitle={
            <>
              Create a <strong>Scotland-specific Private Residential Tenancy agreement</strong>{' '}
              online. Use one <strong>standard PRT</strong> route, answer the
              jurisdiction-specific questions, preview the agreement, and receive the
              official supporting notes with the completed pack.
            </>
          }
          primaryCta={{
            label: `Create Standard PRT - ${standardPrice}`,
            href: standardWizardHref,
          }}
          showTrustPositioningBar
          variant="pastel"
          backgroundImageKey="tenancyScotland"
          backgroundImageAlt="Watercolour illustration of a Scottish private residential tenancy and Edinburgh landmarks"
          hideMedia
        >
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6d28d9]" />
              Scotland-specific wording
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#6d28d9]" />
              Built for PRT use
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6d28d9]" />
              Instant online creation
            </span>
          </div>
        </UniversalHero>

        <section className="border-y border-[#e8e1f8] bg-white/80 py-6">
          <div className="container mx-auto px-6 lg:px-8">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-6 lg:px-8">
            <TenancyPackSection
              defaultJurisdiction="scotland"
              lockJurisdiction
              intro="You get more than a Scottish PRT. Landlord Heaven builds a practical Scotland tenancy pack with the agreement, Easy Read Notes, setup documents, and preview-before-payment flow so you can handle real move-in and record-keeping more cleanly."
            />
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-2xl border border-[#e8e1f8] bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Quick answer: what this page is for
              </h2>
              <div className="space-y-5 text-lg leading-relaxed text-gray-700">
                <p>
                  If you are letting residential property in Scotland and need the correct
                  tenancy agreement for a new private let, this is the page you should start
                  from. A <strong>Private Residential Tenancy agreement</strong>, or
                  <strong> PRT</strong>, is the main Scottish tenancy agreement route for
                  most new private residential lets. This page is designed to do more than
                  say that in one line and drop you straight into a purchase button. Its
                  job is to help you choose the right route for the tenancy you are actually
                  creating.
                </p>
                <p>
                  Many competing pages are too thin. They tell landlords that a PRT exists,
                  repeat a few generic points about Scottish tenancy law, and then try to
                  convert without helping the user decide whether they need a basic
                  agreement, a more detailed agreement, or a different page altogether.
                  That is not good enough for high-intent search traffic. Landlords landing
                  here are often close to action. They may already have the property ready,
                  the tenants lined up, and a move-in timeline in mind. What they need is
                  a Scotland-only page that explains the agreement clearly, covers the
                  practical points that matter, and then moves them into the correct flow.
                </p>
                <p>
                  This page therefore focuses on five things. First, it explains what a PRT
                  is and why Scotland needs a distinct agreement route. Second, it helps
                  landlords understand why Scottish tenancy law should not be mixed up with
                  English AST wording, Welsh occupation contracts, or Northern Ireland
                  private tenancy language. Third, it explains the scope of the standard PRT
                  and the arrangements that need a different agreement. Fourth, it covers
                  the main legal and operational points landlords
                  usually want to understand before starting. Finally, it gives a clean path
                  into the live creation route.
                </p>
                <p>
                  The result is a page that is both more search-ready and more conversion-ready
                  than a generic "template" page. It does not rely on reckless overclaims.
                    It does not blur jurisdictions. It does not treat a Scottish tenancy as
                    though it works like an English AST with a different label on top. Instead,
                  it gives landlords a clearer route into a Scottish PRT agreement built for
                  how the tenancy is meant to operate in practice.
                </p>
              </div>

              <div className="mt-10 grid overflow-hidden rounded-2xl border border-[#e8e1f8] bg-[#faf8ff] lg:grid-cols-[1fr_0.9fr]">
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <p className="public-eyebrow">Built for Scotland</p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#20103f]">
                    Start with the PRT route that matches the property
                  </h3>
                  <p className="mt-4 leading-7 text-[#5d5672]">
                    The guided flow keeps the agreement, inventory, tenant details and
                    supporting notes together, so you can review one Scotland-specific pack
                    before payment.
                  </p>
                </div>
                <div className="relative min-h-[18rem] bg-white sm:min-h-[22rem]">
                  <Image
                    src="/images/illustrations/landlord-documents/site-tenancy-scotland.webp"
                    alt="Watercolour illustration of a Scotland tenancy agreement, property keys and landlord paperwork"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f5fb] py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
                What is a Private Residential Tenancy agreement?
              </h2>
              <p className="mx-auto mb-12 max-w-3xl text-center text-gray-600">
                A Scottish PRT is not just a renamed AST. It sits inside a different legal
                structure and should be treated as a distinct residential letting agreement.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    The core idea
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    A PRT is the standard form of private residential tenancy used for most
                    new private lets in Scotland. It is the document that records the terms
                    of occupation between landlord and tenant, including rent, deposit,
                    occupation details, responsibilities, and the wider operating rules of
                    the tenancy. In practice, it is the document landlords rely on to define
                    the tenancy from day one, not just a formal piece of paper for the file.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Why it matters
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    A good PRT agreement helps reduce uncertainty before problems arise. It
                    gives the tenancy a clearer starting structure, sets expectations around
                    occupation and payment, and supports a more professional landlord process.
                    It does not eliminate every future dispute, but it does provide a stronger
                    foundation than relying on a weak blank form or a document from the
                    wrong UK jurisdiction.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Open-ended, not AST-style
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    One of the biggest practical differences for landlords is that Scottish
                    PRTs are open-ended. This is a central feature of how the tenancy works
                    in Scotland. The agreement therefore needs to reflect Scottish tenancy
                    logic rather than borrowing the commercial style or assumptions of older
                    English AST-led pages.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Scotland-only route
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    This page is specifically for Scottish private residential lets. If the
                    property is in England, Wales, or Northern Ireland, the correct agreement
                    route is different. Landlords should always choose the agreement page that
                    matches the location of the property, not whichever template phrase happens
                    to rank highest in a search result.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#d8c8ff] bg-[#f5f1ff] p-6">
                <h3 className="mb-3 text-xl font-semibold text-[#31224f]">
                  Alternative search terms landlords still use
                </h3>
                <p className="mb-3 leading-relaxed text-[#31224f]/90">
                  Not every landlord searches for "Private Residential Tenancy agreement"
                  first time. Common high-intent searches also include:
                </p>
                <div className="grid gap-2 text-sm text-[#31224f] md:grid-cols-2">
                  <div>PRT agreement Scotland</div>
                  <div>Scottish tenancy agreement template</div>
                  <div>Scotland landlord agreement</div>
                  <div>private tenancy agreement Scotland</div>
                  <div>Scotland rental agreement</div>
                  <div>joint tenancy agreement Scotland</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
                Why Scotland needs a different tenancy agreement
              </h2>
              <p className="mx-auto mb-12 max-w-3xl text-center text-gray-600">
                One of the biggest SEO and conversion mistakes in this category is treating
                Scotland as if it is just another label on the same UK template.
              </p>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 text-left font-semibold text-gray-900">Point</th>
                      <th className="p-4 text-left font-semibold text-gray-900">Scotland</th>
                      <th className="p-4 text-left font-semibold text-gray-900">Common wrong carryover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 text-gray-700">Main agreement type</td>
                      <td className="p-4 text-gray-900">Private Residential Tenancy (PRT)</td>
                      <td className="p-4 text-gray-700">AST or generic UK tenancy template wording</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Tenancy structure</td>
                      <td className="p-4 text-gray-900">Open-ended private residential tenancy</td>
                      <td className="p-4 text-gray-700">Fixed-term-first AST-style assumptions</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Ending the tenancy</td>
                      <td className="p-4 text-gray-900">Scottish route tied to the correct legal framework</td>
                      <td className="p-4 text-gray-700">England-style non-renewal logic</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Landlord obligations</td>
                      <td className="p-4 text-gray-900">Scottish registration and compliance framing matter</td>
                      <td className="p-4 text-gray-700">Missing or underplayed Scotland-specific obligations</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Deposit wording</td>
                      <td className="p-4 text-gray-900">Scottish deposit limit and process context</td>
                      <td className="p-4 text-gray-700">England-style cap or generic deposit wording</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Tribunal / enforcement context</td>
                      <td className="p-4 text-gray-900">Scottish dispute framework</td>
                      <td className="p-4 text-gray-700">County court assumptions copied from England pages</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xl font-semibold text-amber-900">
                      Common mistake
                    </h3>
                  </div>
                  <p className="leading-relaxed text-amber-900/90">
                    Landlords often search broadly and land on an England-heavy page because
                    it uses familiar tenancy language. That does not make it the right page
                    for a Scottish property. Starting with the wrong agreement wording creates
                    avoidable confusion before the tenancy has even begun.
                  </p>
                </div>

                <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-green-600" />
                    <h3 className="text-xl font-semibold text-green-900">
                      Better approach
                    </h3>
                  </div>
                  <p className="leading-relaxed text-green-900/90">
                    Start with a Scottish PRT page built specifically for Scottish private
                    residential lettings. That gives you the right public framing, the right
                    standard product scope and a clean route into the actual agreement
                    workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f5fb] py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
                Standard Scottish PRT agreement
              </h2>
              <p className="mx-auto mb-12 max-w-3xl text-center text-gray-600">
                One focused route for a standard residential Private Residential Tenancy.
              </p>

              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                <div className="rounded-2xl border-2 border-[#d8c8ff] bg-white p-6 shadow-sm">
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Standard PRT
                  </h3>
                  <p className="mb-4 text-2xl font-bold text-[#6d28d9]">
                    {standardPrice}
                  </p>
                  <p className="mb-6 leading-relaxed text-gray-700">
                    The standard route is usually the right starting point for a more
                    straightforward Scottish private let where the property, household, and
                    tenancy structure are relatively simple. It is designed for landlords who
                    want a practical Scotland-specific standard agreement and its supporting
                    workflow.
                  </p>
                  <ul className="mb-6 space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-green-500" />
                      <span>Good fit for many straightforward new Scottish lets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-green-500" />
                      <span>Clear route into the main PRT workflow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-green-500" />
                      <span>Scotland-specific wording rather than generic UK copy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-green-500" />
                      <span>Usually suitable where the household and occupation pattern are uncomplicated</span>
                    </li>
                  </ul>
                  <Link
                    href={standardWizardHref}
                    className="block w-full rounded-lg bg-[#6d28d9] py-3 text-center font-semibold text-white transition-colors hover:bg-[#5b21b6]"
                  >
                    Create Standard PRT
                  </Link>
                </div>
                <div className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-[#e8e1f8] bg-white lg:min-h-full">
                  <Image
                    src="/images/illustrations/pricing-cards/tenancy-scotland.webp"
                    alt="Watercolour illustration of a Scottish private residential tenancy agreement and supporting documents"
                    fill
                    className="object-contain object-center p-6"
                    sizes="(max-width: 1024px) 100vw, 44vw"
                  />
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Practical rule of thumb
                </h3>
                <p className="leading-relaxed text-gray-700">
                  Use this route for a standard private residential tenancy. If the property
                  is an HMO, the landlord lives at the property, the arrangement is a holiday
                  let, or the occupier is a company, stop and use an agreement designed for
                  that arrangement.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-2xl border border-[#e8e1f8] bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                What landlords usually need to think about before creating a Scottish PRT
              </h2>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Property and party details
                  </h3>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    A tenancy agreement is only as useful as the accuracy of the information
                    entered into it. Landlords should expect to provide the property address,
                    landlord details, tenant details, rent, deposit, and the tenancy start
                    information in a way that matches the actual letting arrangement. This
                    sounds basic, but many avoidable disputes begin with unclear names,
                    partial addresses, missing occupier detail, or assumptions that somebody
                    can simply be added informally later.
                  </p>
                  <p className="leading-relaxed text-gray-700">
                    Where there are multiple adults living in the property, it is especially
                    important to think clearly about who is a tenant, who is merely a
                    permitted occupant, and whether the tenancy is genuinely straightforward
                    enough for the standard route.
                  </p>
                </div>

                <div>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Rent, deposit, and payment structure
                  </h3>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    Scottish landlords also need the rent and deposit side of the tenancy to
                    be set up properly from the start. That includes the amount, the payment
                    frequency, and the wider handling of any deposit taken. A PRT page should
                    not pretend these are minor admin points. They are central to how the
                    tenancy is run and how the landlord's position is documented.
                  </p>
                  <p className="leading-relaxed text-gray-700">
                    Good agreement wording should support clarity around payment and occupation
                    expectations without turning the page into a dense legal lecture. This is
                    one reason stronger commercial pages outperform thin template pages: they
                    explain why the details matter instead of assuming the user already knows.
                  </p>
                </div>

                <div>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Compliance and registration context
                  </h3>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    Scotland is not a jurisdiction where landlords should treat compliance
                    as an afterthought. Registration, deposit handling, safety requirements,
                    and property-condition obligations all form part of the real-world context
                    in which the agreement will operate. The agreement itself does not replace
                    those wider obligations, but it should sit inside a Scotland-specific
                    letting process rather than feeling disconnected from it.
                  </p>
                  <p className="leading-relaxed text-gray-700">
                    That is why jurisdiction-specific wording matters so much. It helps the
                    agreement fit the surrounding Scottish framework instead of borrowing
                    assumptions from a different part of the UK.
                  </p>
                </div>

                <div>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Complexity of the household
                  </h3>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    Shared households, couples with changing occupancy plans, student lets,
                    guarantor-backed arrangements, and HMO-style occupation patterns often
                    need additional checks before the landlord starts. The wizard asks about
                    occupancy and property status so an incompatible arrangement is blocked
                    rather than pushed through the standard PRT.
                  </p>
                  <p className="leading-relaxed text-gray-700">
                    The agreement must reflect how the tenancy will actually operate, so the
                    answers entered in the wizard are retained in the review, payment snapshot,
                    and final documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f5fb] py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
                Scottish compliance points landlords should understand
              </h2>
              <p className="mx-auto mb-12 max-w-3xl text-center text-gray-600">
                This page should help landlords understand the shape of the Scottish regime
                without making reckless promises or pretending the agreement alone solves
                every legal issue.
              </p>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1ebff]">
                    <Shield className="w-6 h-6 text-[#6d28d9]" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Landlord registration
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    Scottish private landlords should treat registration as a central part of
                    the letting setup. A good PRT route helps the agreement sit inside a more
                    professional Scottish process rather than acting as though registration is
                    a side note.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1ebff]">
                    <Home className="w-6 h-6 text-[#6d28d9]" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Repairing Standard context
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    Property-condition duties matter in Scotland. Landlords looking for a PRT
                    often also want confidence that the agreement route reflects the practical
                    Scottish context around repair responsibilities and property standards.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1ebff]">
                    <FileText className="w-6 h-6 text-[#6d28d9]" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Deposit wording
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    Deposit terms should be clear, proportionate, and Scottish in their
                    framing. A page that gets this wrong usually reveals that the underlying
                    document has been adapted too lightly from another jurisdiction.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-xl font-semibold text-red-900">
                    What this page should not do
                  </h3>
                </div>
                <p className="leading-relaxed text-red-900/90">
                  It should not promise that a tenancy agreement makes every later possession,
                  arrears, or tribunal issue easy. It should not blur Scotland into England.
                  It should not mislead landlords into thinking a PRT works like an old-style
                  AST with Scottish branding. Stronger legal-product pages win by being clearer,
                  more useful, and more commercially honest than template-heavy competitors.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-2xl border border-[#e8e1f8] bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                How the Scottish PRT process usually works
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d28d9] text-sm font-bold text-white">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirm Scotland is the right jurisdiction
                    </h3>
                  </div>
                  <p className="leading-relaxed text-gray-700">
                    Start by making sure the property is in Scotland and that you need a
                    Scottish private residential tenancy agreement rather than an England,
                    Wales, or Northern Ireland route.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d28d9] text-sm font-bold text-white">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirm the standard PRT fits
                    </h3>
                  </div>
                  <p className="leading-relaxed text-gray-700">
                    Confirm the arrangement is a private residential tenancy and not a lodger,
                    holiday-let, company-let, or unsupported specialist arrangement.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d28d9] text-sm font-bold text-white">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Enter the tenancy details carefully
                    </h3>
                  </div>
                  <p className="leading-relaxed text-gray-700">
                    Property details, landlord details, tenant details, start date, rent,
                    deposit, and the practical rules of occupation all need to reflect the
                    real arrangement rather than assumptions or placeholders.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d28d9] text-sm font-bold text-white">
                      4
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Review the wider Scottish setup
                    </h3>
                  </div>
                  <p className="leading-relaxed text-gray-700">
                    The agreement is one part of the wider landlord process. Registration,
                    deposit handling, property condition, and safety obligations should all
                    align with the tenancy from the start.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 md:col-span-2">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d28d9] text-sm font-bold text-white">
                      5
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Use the right follow-on documents if problems arise later
                    </h3>
                  </div>
                  <p className="leading-relaxed text-gray-700">
                    A tenancy agreement is the starting document, not the only document a
                    landlord may ever need. If issues arise later, such as non-payment,
                    notice, or enforcement problems, landlords should move to the correct
                    Scottish next-step documents rather than trying to force an agreement
                    alone to do every job.
                  </p>
                  <Link
                    href="/scotland-eviction-notices"
                    className="mt-4 inline-flex items-center gap-2 font-medium text-[#6d28d9] hover:underline"
                  >
                    See Scotland notice guidance
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f5fb] py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
                Common mistakes on Scottish tenancy agreement pages
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Treating Scotland like England with a different label
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    This is one of the most common and damaging mistakes. The page may use the
                    phrase "PRT" in the title, but the body copy still reads like an AST
                    landing page. That weakens trust and can create the impression that the
                    underlying document is also a light adaptation rather than a proper
                    Scottish route.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Overselling with brittle legal claims
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    Pages in this category often overclaim. They present the agreement as if it
                    guarantees a smooth tribunal outcome or solves every future landlord issue.
                    Better copy stays commercially strong while remaining careful about what the
                    agreement actually does.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Hiding product limitations
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    A useful page explains what the standard PRT covers and which arrangements
                    require another route. The wizard then enforces those boundaries.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Giving too little decision support
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    High-intent visitors do not just want to know what a PRT stands for. They
                    want to know whether they are on the right page, what route suits their
                    letting, what the main Scottish differences are, and what to do next. Thin
                    pages lose that traffic because they answer almost none of those questions.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-purple-900">
                  Have questions about your Scottish tenancy setup?
                </h3>
                <p className="mb-4 leading-relaxed text-purple-900/90">
                  Every letting arrangement is different. If you are unsure whether the
                  standard PRT fits your property and occupiers, use Ask Heaven for general
                  landlord Q&amp;A before starting.
                </p>
                <Link
                  href="/ask-heaven"
                  className="inline-flex items-center gap-2 font-medium text-purple-700 hover:text-purple-900"
                >
                  Ask Heaven free Q&amp;A
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <SeoCtaBlock
                showTrustPositioningBar
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="scotland"
                title="Create your Scottish PRT now"
                description={`Create the standard Scotland PRT, preview it before payment, and receive the official supporting notes. ${standardPrice}.`}
              />
            </div>
          </div>
        </section>

        <section className="bg-[#f7f5fb] py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-2xl border border-[#e8e1f8] bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                When not to use this page
              </h2>
              <div className="space-y-5 leading-relaxed text-gray-700">
                <p>
                  This page is for <strong>Scottish private residential tenancies</strong>.
                  It is not the right landing page for every residential occupation scenario.
                  If you are dealing with a different living arrangement, a different product
                  page or agreement route may be more suitable.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Not the right fit for
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                        <li>- Properties outside Scotland</li>
                        <li>- Pages focused on England AST search intent</li>
                        <li>- Welsh occupation contract use cases</li>
                        <li>- Northern Ireland private tenancy pages</li>
                        <li>- Lodger or resident-landlord arrangements where a different agreement is needed</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Better next step
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                        <li>- Use the Scotland route if the property is in Scotland</li>
                        <li>- Use a jurisdiction-specific page for England, Wales, or NI</li>
                        <li>- Stop if the arrangement needs a different or specialist agreement</li>
                        <li>- Use the correct follow-on notice or enforcement page if the tenancy problem is no longer "create an agreement"</li>
                    </ul>
                  </div>
                </div>
                <p>
                  This kind of clarity helps the page rank better and convert better at the
                  same time. The right SEO page is not always the broadest one. It is the page
                  that answers the user's actual next-step question most clearly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FAQSection
          title="Private Residential Tenancy agreement FAQs for landlords"
          faqs={faqs}
          showTrustPositioningBar
          showContactCTA={false}
          variant="gray"
        />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <SeoCtaBlock
                pageType="tenancy"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="scotland"
                title="Ready to create your Scotland PRT?"
                description={`Choose the Scottish tenancy agreement route that fits your let and generate the document online from ${standardPrice}.`}
              />
              <SeoDisclaimer className="mx-auto max-w-4xl" />
            </div>
          </div>
        </section>

        <section className="bg-[#f7f5fb] py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <RelatedLinks
                title="Related Scotland tenancy resources"
                links={tenancyAgreementScotlandLinks}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[#e8e1f8] bg-white py-10">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Other UK jurisdictions
              </h3>
              <div className="flex flex-wrap gap-6">
                <Link
                  href="/assured-shorthold-tenancy-agreement-template"
                  className="font-semibold text-[#6d28d9] hover:underline"
                >
                  England tenancy agreements -&gt;
                </Link>
                <Link
                  href="/wales-tenancy-agreement-template"
                  className="font-semibold text-[#6d28d9] hover:underline"
                >
                  Wales occupation contracts -&gt;
                </Link>
                <Link
                  href="/tenancy-agreement-northern-ireland"
                  className="font-semibold text-[#6d28d9] hover:underline"
                >
                  Northern Ireland tenancy agreements -&gt;
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
