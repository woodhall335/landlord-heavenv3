import type { Metadata } from 'next';
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

const PAGE_PATH = '/private-residential-tenancy-agreement-template';
const PAGE_TITLE = 'Private Residential Tenancy Agreement Scotland';
const PAGE_TYPE = 'tenancy' as const;

const canonicalUrl = getCanonicalUrl(PAGE_PATH);

const standardPrice = PRODUCTS.ast_standard.displayPrice;
const premiumPrice = PRODUCTS.ast_premium.displayPrice;

const standardWizardHref = '/wizard?product=ast_standard&jurisdiction=scotland&src=tenancy_hub&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&jurisdiction=scotland&src=tenancy_hub&topic=tenancy';

export const metadata: Metadata = {
  title:
    'Private Residential Tenancy Agreement Scotland | Create a PRT Online',
  description:
    'Create a Scotland Private Residential Tenancy agreement online.',
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
      'Create a Scotland PRT agreement with current Scottish wording, instant download, and clear guidance on registration, deposits, notice, and compliance.',
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
      'Create a Scotland PRT agreement online with current Scottish wording and instant download.',
  },
  robots: {
    index: true,
    follow: true,
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
    question: 'When should I choose the standard PRT instead of premium?',
    answer:
      'The standard route is usually the right starting point for a more straightforward Scottish let where the property and occupier setup are relatively simple and you want the main agreement workflow without broader premium drafting.',
  },
  {
    question: 'When is the premium PRT the better option?',
    answer:
      'Premium is generally better for more complex Scottish lets, such as shared households, joint tenants, guarantor-backed arrangements, student or HMO-style occupation patterns, or situations where you want broader drafting and more operational detail from the outset.',
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
      'The online route is designed to be quick. For many landlords, the main work is entering the property, landlord, tenant, rent, deposit, and tenancy details correctly, then choosing whether standard or premium is the better fit for the tenancy.',
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
            'Create a Scotland PRT agreement online with current Scottish wording, landlord-focused guidance, and standard or premium options.',
          url: canonicalUrl,
          datePublished: '2026-01-01',
          dateModified: '2026-03-20',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement Packs', url: getCanonicalUrl('/products/ast') },
          { name: 'Private Residential Tenancy Agreement', url: canonicalUrl },
        ])}
      />

      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="scotland"
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900">
        <UniversalHero
          badge="Scotland Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Private Residential Tenancy Agreement (PRT)"
          subtitle={
            <>
              Create a <strong>Scotland-specific Private Residential Tenancy agreement</strong>{' '}
              online. Compare <strong>standard</strong> and <strong>premium</strong>{' '}
              PRT routes, understand key Scottish rules, and choose the right agreement
              for a straightforward or more complex let.
            </>
          }
          primaryCta={{
            label: `Create Standard PRT - ${standardPrice}`,
            href: standardWizardHref,
          }}
          secondaryCta={{
            label: `Create Premium PRT - ${premiumPrice}`,
            href: premiumWizardHref,
          }}
          showTrustPositioningBar
          variant="pastel"
        >
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Scotland-specific wording
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Built for PRT use
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Instant online creation
            </span>
          </div>
        </UniversalHero>

        <section className="border-y border-gray-100 bg-white/80 py-6">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <TenancyPackSection
              defaultJurisdiction="scotland"
              lockJurisdiction
              intro="You get more than a Scottish PRT. Landlord Heaven builds a practical Scotland tenancy pack with the agreement, Easy Read Notes, setup documents, and preview-before-payment flow so you can handle real move-in and record-keeping more cleanly."
            />
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
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
                  private tenancy language. Third, it explains when the standard PRT is
                  likely to be enough and when premium drafting is the smarter commercial
                  choice. Fourth, it covers the main legal and operational points landlords
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
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
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
                    foundation than relying on a weak generic template or a document from the
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

              <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <h3 className="mb-3 text-xl font-semibold text-blue-900">
                  Alternative search terms landlords still use
                </h3>
                <p className="mb-3 leading-relaxed text-blue-900/90">
                  Not every landlord searches for "Private Residential Tenancy agreement"
                  first time. Common high-intent searches also include:
                </p>
                <div className="grid gap-2 text-sm text-blue-900 md:grid-cols-2">
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
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
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
                    commercial choice between standard and premium, and a cleaner route into
                    the actual agreement workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
                Standard vs premium PRT: which route should you choose?
              </h2>
              <p className="mx-auto mb-12 max-w-3xl text-center text-gray-600">
                Strong commercial pages do not just show two buttons. They help landlords
                choose the right product path for the tenancy they are actually granting.
              </p>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Standard PRT
                  </h3>
                  <p className="mb-4 text-2xl font-bold text-blue-600">
                    {standardPrice}
                  </p>
                  <p className="mb-6 leading-relaxed text-gray-700">
                    The standard route is usually the right starting point for a more
                    straightforward Scottish private let where the property, household, and
                    tenancy structure are relatively simple. It is designed for landlords who
                    want a practical Scotland-specific agreement without paying for broader
                    drafting that may not be necessary for the tenancy.
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
                    className="block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Create Standard PRT
                  </Link>
                </div>

                <div className="relative rounded-2xl border-2 border-blue-200 bg-white p-6 shadow-lg">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-gray-900">
                    RECOMMENDED FOR COMPLEX LETS
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Premium PRT
                  </h3>
                  <p className="mb-4 text-2xl font-bold text-blue-700">
                    {premiumPrice}
                  </p>
                  <p className="mb-6 leading-relaxed text-gray-700">
                    Premium is usually the better fit where the letting is more involved and
                    you want broader wording from the outset. This often applies where there
                    are multiple tenants, sharers, HMO-style occupation patterns, more
                    operational rules, guarantor use, or simply a stronger preference for
                    fuller drafting rather than the leaner standard route.
                  </p>
                  <ul className="mb-6 space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-green-500" />
                      <span>Better for more complex Scottish letting scenarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-green-500" />
                      <span>Useful for joint tenant, sharer, student, or HMO-style setups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-green-500" />
                      <span>Broader drafting where more operational detail matters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-green-500" />
                      <span>Stronger choice where a basic route feels too light for the tenancy</span>
                    </li>
                  </ul>
                  <Link
                    href={premiumWizardHref}
                    className="block w-full rounded-lg bg-blue-700 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-800"
                  >
                    Create Premium PRT
                  </Link>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Practical rule of thumb
                </h3>
                <p className="leading-relaxed text-gray-700">
                  If the let is relatively ordinary, start with standard. If you already know
                  the tenancy will involve more occupier complexity, more house rules, more
                  coordination, or more risk of misunderstanding if the drafting is thin,
                  premium is often the better choice. That is not fear-based selling. It is
                  simply matching the agreement route to the real tenancy you are about to run.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
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
                    those wider obligations, but it should sit inside a Scottish-compliant
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
                    need more thought before the landlord chooses a route. These scenarios are
                    one of the main reasons premium drafting exists. The page should help users
                    recognise that complexity early rather than leaving them to discover it
                    after they have already committed to the leanest possible product.
                  </p>
                  <p className="leading-relaxed text-gray-700">
                    In short, the document choice should reflect how the tenancy will actually
                    operate, not just the cheapest visible button on the page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
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
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Shield className="w-6 h-6 text-blue-600" />
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
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Home className="w-6 h-6 text-blue-600" />
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
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <FileText className="w-6 h-6 text-blue-600" />
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
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                How the Scottish PRT process usually works
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Decide between standard and premium
                    </h3>
                  </div>
                  <p className="leading-relaxed text-gray-700">
                    Think about the property, household, guarantors, sharers, operational
                    detail, and whether the tenancy is genuinely straightforward or not.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
                    className="mt-4 inline-flex items-center gap-2 font-medium text-blue-600 hover:underline"
                  >
                    See Scotland notice guidance
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
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
                    Hiding the real standard vs premium difference
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    If the page does not explain who premium is for, the user assumes it is
                    just a pricing ladder. A stronger page helps landlords self-select based on
                    tenancy complexity, not just on whether one card has a nicer badge on it.
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
                  Every letting arrangement is different. If you are unsure whether your
                  tenancy looks straightforward enough for standard or whether it belongs on
                  the premium route, use Ask Heaven for free landlord Q&amp;A.
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
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <SeoCtaBlock
                showTrustPositioningBar
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="scotland"
                title="Create your Scottish PRT now"
                description={`Choose the standard route for a straightforward let or premium for a more complex Scottish tenancy. Start from ${standardPrice}.`}
              />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
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
                        <li>- Choose premium where the household or property is more complex</li>
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
          title="Private Residential Tenancy agreement FAQ"
          faqs={faqs}
          showTrustPositioningBar
          showContactCTA={false}
          variant="gray"
        />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <SeoCtaBlock
                pageType="tenancy"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="scotland"
                title="Ready to create your Scotland PRT?"
                description={`Choose the right Scottish tenancy agreement route and generate your document online from ${standardPrice}.`}
              />
              <SeoDisclaimer className="mx-auto max-w-4xl" />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <RelatedLinks
                title="Related Scotland tenancy resources"
                links={tenancyAgreementScotlandLinks}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-white py-10">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Other UK jurisdictions
              </h3>
              <div className="flex flex-wrap gap-6">
                <Link
                  href="/assured-shorthold-tenancy-agreement-template"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  England tenancy agreements â†’
                </Link>
                <Link
                  href="/wales-tenancy-agreement-template"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Wales occupation contracts â†’
                </Link>
                <Link
                  href="/tenancy-agreement-northern-ireland"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Northern Ireland tenancy agreements â†’
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
