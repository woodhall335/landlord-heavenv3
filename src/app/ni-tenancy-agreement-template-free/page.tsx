import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import {
  RiFileTextLine,
  RiShieldCheckLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiDownloadLine,
  RiQuestionLine,
  RiAlertLine,
  RiCloseLine,
  RiCheckLine,
  RiStarLine,
  RiSearchLine,
  RiMoneyPoundCircleLine
} from 'react-icons/ri';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementNILinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { PRODUCTS, TENANCY_AGREEMENT_FROM_PRICE } from '@/lib/pricing/products';
import { getReleasedStandardTenancyEntry } from '@/lib/tenancy/agreement-registry';

const standardPrice = PRODUCTS.ast_standard.displayPrice;
const standardWizardHref = `${getReleasedStandardTenancyEntry(
  'northern-ireland'
).startRoute}&src=ni_free_template_guide&topic=tenancy`;

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Northern Ireland Tenancy Agreement 2026 | Free Template Guide',
  description: 'Compare generic free files with the released Standard Northern Ireland tenancy-agreement pack and start the NI-specific wizard.',
  keywords: [
    'free NI tenancy agreement',
    'Northern Ireland tenancy template free',
    'free tenancy agreement download NI',
    'NI landlord template free',
    'Private Tenancies Act template',
    'free rental agreement Northern Ireland',
    'NI tenancy document free',
    'landlord forms free NI',
    'Northern Ireland rental contract free',
    'free vs paid tenancy agreement',
  ],
  alternates: {
    canonical: getCanonicalUrl('/ni-tenancy-agreement-template-free'),
  },
  openGraph: {
    title: 'Northern Ireland Tenancy Agreement 2026 | Free Template Guide',
    description: 'Understand the limits of generic free files and start the released Standard NI agreement.',
    type: 'article',
    url: getCanonicalUrl('/ni-tenancy-agreement-template-free'),
  },
};

const faqs = [
  {
    question: 'Are free Northern Ireland tenancy agreement templates safe to use?',
    answer: 'A free file may be incomplete, outdated or written for another jurisdiction. Check that it matches Northern Ireland law and that you separately complete every prescribed notice, registration, deposit and safety requirement.'
  },
  {
    question: 'What makes a NI tenancy agreement template legally compliant?',
    answer: 'A useful NI agreement should accurately record the parties, property, rent, deposit, dates and responsibilities. The landlord must also complete the prescribed Tenancy Information Notice and comply with registration, deposit, safety and consumer-law duties; the agreement does not replace those steps.'
  },
  {
    question: 'Can I download a free NI tenancy agreement from government websites?',
    answer: 'Government guidance and prescribed notices are not the same thing as a completed agreement tailored to the tenancy. Check the current official guidance and use the prescribed Tenancy Information Notice alongside any agreement you prepare.'
  },
  {
    question: 'What are the risks of using a free generic tenancy agreement in NI?',
    answer: 'A generic file can omit NI-specific information, use the wrong deposit language or confuse later notice and enforcement steps. Separate failures to provide prescribed information or meet statutory duties can also lead to enforcement action.'
  },
  {
    question: 'Do I need different agreements for fixed-term vs periodic tenancies in NI?',
    answer: 'The prescribed terms requirements apply to both fixed-term and periodic tenancies in Northern Ireland. However, the specific notice provisions and end-of-term arrangements differ. A good template should allow you to specify whether it\'s a fixed term (with a specific end date) or periodic (rolling monthly/weekly). Fixed terms automatically become periodic tenancies when they expire.'
  },
  {
    question: 'Can I use an English AST template for a property in Northern Ireland?',
    answer: 'No. An English tenancy agreement is not the correct document for a Northern Ireland property. Use the NI-specific agreement and prescribed-information workflow instead.'
  },
  {
    question: 'What is the Private Tenancies Act (NI) 2022?',
    answer: 'The Private Tenancies Act (Northern Ireland) 2022 amended important parts of the private-renting framework. Landlords should use current NI guidance for prescribed tenancy information, deposits, electrical safety, rent changes and notices rather than relying on an England template.'
  },
  {
    question: 'How do I know if a free starter document includes all prescribed terms?',
    answer: 'Check that the template includes: landlord and tenant full names and addresses; property address; landlord registration number; rent amount, frequency, and payment method; deposit amount and protection scheme name; tenancy start date; fixed term or periodic status; repair responsibilities; notice requirements; emergency contact details; and a statement of tenant rights. Missing any prescribed term makes the template non-compliant.'
  },
  {
    question: 'Do free starter documents include deposit protection information correctly?',
    answer: 'Usually not. NI has specific deposit protection requirements: maximum 2 months\' rent, protection within 14 days, prescribed information within 28 days, and specific approved schemes. Free starter documents often use England\'s 5-week cap, wrong scheme names, or miss the prescribed information requirements entirely. Our template auto-generates correct deposit clauses for NI.'
  },
  {
    question: 'What happens if my tenancy agreement is missing prescribed terms?',
    answer: 'Missing or inaccurate information can create disputes and may indicate that a separate prescribed-information duty has not been completed. Review the agreement, complete the Tenancy Information Notice and correct any registration, deposit or safety gaps promptly.'
  },
  {
    question: 'Should I pay for a Northern Ireland tenancy agreement template?',
    answer: 'Choose a route that is specific to Northern Ireland, clearly states what is included and keeps the agreement separate from the landlord’s prescribed-notice and compliance duties. Landlord Heaven currently sells one Standard NI agreement pack.'
  },
  {
    question: 'Can a free starter document be updated for the Private Tenancies Act 2022?',
    answer: 'You can edit a starter document, but you remain responsible for ensuring that it matches the tenancy and current NI requirements. A jurisdiction-specific guided route reduces the risk of carrying across England, Wales or Scotland wording.'
  }
];

export default function NITenancyAgreementTemplateFreeComparisonPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Free Northern Ireland Tenancy Agreement Template 2026 | Comparison & Risks',
          description: 'Looking for a free NI tenancy agreement template? Compare free vs professional options and understand the legal risks under the Private Tenancies Act 2022.',
          url: getCanonicalUrl('/ni-tenancy-agreement-template-free'),
          datePublished: '2024-04-01',
          dateModified: '2026-07-29',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Tenancy Agreements', url: '/standard-tenancy-agreement' },
          { name: 'Northern Ireland', url: '/northern-ireland-tenancy-agreement-template' },
          { name: 'Free Starter Document Comparison', url: '/ni-tenancy-agreement-template-free' },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <UniversalHero
          title="Northern Ireland Tenancy Agreement"
          subtitle="Create the released Standard Northern Ireland tenancy agreement through NI-specific questions and preview the pack before payment."
          primaryCta={{ label: `Start Standard NI Agreement — ${standardPrice}`, href: standardWizardHref }}
          showTrustPositioningBar
          hideMedia
        />
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-amber-600">Home</Link></li>
              <li className="text-slate-400">/</li>
              <li><Link href="/standard-tenancy-agreement" className="hover:text-amber-600">Tenancy Agreements</Link></li>
              <li className="text-slate-400">/</li>
              <li><Link href="/northern-ireland-tenancy-agreement-template" className="hover:text-amber-600">Northern Ireland</Link></li>
              <li className="text-slate-400">/</li>
              <li className="text-slate-900 font-medium">Free vs Professional</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-700 via-slate-800 to-slate-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 text-amber-300 mb-4">
              <RiSearchLine className="w-5 h-5" />
              <span className="text-sm font-medium">Comparison Guide</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Free NI Tenancy Agreement Templates: Are They Worth the Risk?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl">
              Before you download that free Northern Ireland tenancy agreement, understand the legal risks.
              A generic file can miss NI-specific information and does not replace the prescribed
              tenancy-information, registration, deposit and safety steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={standardWizardHref}
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <RiShieldCheckLine className="w-5 h-5" />
                Get Compliant Template
                <RiArrowRightLine className="w-5 h-5" />
              </Link>
              <Link
                href="#comparison"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <RiFileTextLine className="w-5 h-5" />
                Compare Options
              </Link>
            </div>
          </div>
        </section>

        {/* Warning Section */}
        <section className="bg-red-50 border-b border-red-200 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-start gap-4">
              <RiAlertLine className="w-10 h-10 text-red-600 shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-red-900">Northern Ireland compliance warning</h2>
                <p className="text-red-800 mt-2">
                  An agreement does not replace the prescribed Tenancy Information Notice or the
                  landlord&apos;s registration, deposit and safety duties. A generic free file may
                  omit NI-specific information and create avoidable problems later.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <section className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-slate-600 leading-relaxed">
              We understand why landlords search for free tenancy agreement templates - it seems like an unnecessary
              expense for a simple document. But Northern Ireland's tenancy law is significantly stricter than England's,
              and the consequences of getting it wrong are severe. Let's examine whether free starter documents actually deliver
              what NI landlords need.
            </p>
          </section>

          {/* The NI Difference Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiShieldCheckLine className="w-6 h-6 text-emerald-600" />
              Why Northern Ireland is Different
            </h2>
            <div className="bg-slate-800 text-white rounded-xl p-6 mb-6">
              <p className="text-slate-300 mb-4">
                Northern Ireland has its own tenancy legislation, completely separate from England, Wales, and Scotland.
                Free starter documents found online are almost always designed for English ASTs - they are legally useless in NI.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-400 mb-2">England</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Housing Act 1988</li>
                    <li>• 5 weeks max deposit</li>
                    <li>• No landlord registration</li>
                    <li>• Model tenancy available</li>
                  </ul>
                </div>
                <div className="bg-emerald-900 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-400 mb-2">Northern Ireland</h4>
                  <ul className="text-sm text-emerald-200 space-y-1">
                    <li>• Private Tenancies Act 2022</li>
                    <li>• 2 months max deposit</li>
                    <li>• Mandatory registration</li>
                    <li>• No official template</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-12" id="comparison">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiStarLine className="w-6 h-6 text-emerald-600" />
              Free vs Professional Template Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 px-4 py-3 text-left font-semibold">Feature</th>
                    <th className="border border-slate-200 px-4 py-3 text-center font-semibold text-red-700">Free Starter Documents</th>
                    <th className="border border-slate-200 px-4 py-3 text-center font-semibold text-emerald-700">Our Template</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3 font-medium">NI-specific legislation</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCloseLine className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-4 py-3 font-medium">All prescribed terms included</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCloseLine className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3 font-medium">2 months deposit cap (not 5 weeks)</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCloseLine className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-4 py-3 font-medium">Landlord registration number field</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCloseLine className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3 font-medium">Correct NI notice periods</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCloseLine className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-4 py-3 font-medium">TDSNI scheme references</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCloseLine className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3 font-medium">Updated for 2024/25 requirements</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCloseLine className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-4 py-3 font-medium">EICR requirements (2025)</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCloseLine className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3 font-medium">Unfair terms avoided</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <span className="text-amber-600">Unknown</span>
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-4 py-3 font-medium">Guided completion wizard</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCloseLine className="w-6 h-6 text-red-500 mx-auto" />
                    </td>
                    <td className="border border-slate-200 px-4 py-3 text-center">
                      <RiCheckLine className="w-6 h-6 text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Cost Comparison Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiMoneyPoundCircleLine className="w-6 h-6 text-emerald-600" />
              The practical cost of using the wrong file
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-semibold text-red-900 mb-4">Common consequences of missing steps</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">Notice</span>
                    <span className="text-red-800">Prescribed information may still be incomplete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">Deposit</span>
                    <span className="text-red-800">Protection or information errors may need correction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">Terms</span>
                    <span className="text-red-800">Generic clauses may not match NI law or the tenancy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">Disputes</span>
                    <span className="text-red-800">Unclear wording creates extra administration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">Delay</span>
                    <span className="text-red-800">Missing records can complicate later action</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-red-300">
                  <div className="flex justify-between">
                    <span className="font-semibold text-red-900">Potential total:</span>
                    <span className="font-bold text-red-700">£5,000+</span>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <h3 className="font-semibold text-emerald-900 mb-4">Cost of Getting It Right</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-emerald-700 w-20">{standardPrice}</span>
                    <span className="text-emerald-800">Standard NI template</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-emerald-700 w-20">{standardPrice}</span>
                    <span className="text-emerald-800">NI supporting documents included</span>
                  </li>
                </ul>
                <div className="mt-8 pt-4 border-t border-emerald-300">
                  <div className="flex justify-between">
                    <span className="font-semibold text-emerald-900">One-time cost:</span>
                    <span className="font-bold text-emerald-700">{TENANCY_AGREEMENT_FROM_PRICE}</span>
                  </div>
                </div>
                <p className="text-sm text-emerald-700 mt-4">
                  Peace of mind that your agreement complies with all Private Tenancies Act 2022 requirements.
                </p>
              </div>
            </div>
          </section>

          {/* What to Look For Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiSearchLine className="w-6 h-6 text-emerald-600" />
              What to Look for in an NI Tenancy Agreement
            </h2>
            <p className="text-slate-600 mb-6">
              If you're evaluating any tenancy agreement template for Northern Ireland, check for these
              essential elements required by the Private Tenancies Act 2022:
            </p>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Prescribed Information</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Landlord registration number</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>TDSNI deposit scheme reference</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>2-month maximum deposit wording</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>NI-specific notice period table</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Legislation References</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Private Tenancies Act (NI) 2022</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Housing (NI) Order 1992 fitness standard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>NOT Housing Act 1988 (England only)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>NOT Section 21 (doesn't exist in NI)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Mid-page CTA */}
          <SeoCtaBlock
          showTrustPositioningBar
            pageType="tenancy"
            variant="section"
            jurisdiction="northern-ireland"
          />

          {/* FAQ Section */}
        <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />

          {/* Final CTA */}
          <section className="bg-gradient-to-br from-emerald-800 to-slate-900 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Get a Properly Compliant NI Tenancy Agreement
            </h2>
            <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
              Create the released Standard Northern Ireland agreement and supporting pack through
              NI-specific questions. Complete the prescribed Tenancy Information Notice and the
              landlord’s other statutory duties alongside the agreement.
            </p>
            <Link
              href={standardWizardHref}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              <RiDownloadLine className="w-5 h-5" />
              {`Create Your Agreement - ${standardPrice}`}
              <RiArrowRightLine className="w-5 h-5" />
            </Link>
          </section>

          {/* Related Links */}
          <div className="mt-12">
            <RelatedLinks links={tenancyAgreementNILinks} />
          </div>

          {/* Disclaimer */}
          <SeoDisclaimer />
        </article>
      </main>
    </>
  );
}

