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

export const metadata: Metadata = {
  title: 'Northern Ireland Tenancy Agreement 2026 | Legally Validated',
  description: 'Compare options and generate a Northern Ireland tenancy agreement with solicitor-grade, compliance-checked wording.',
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
    title: 'Northern Ireland Tenancy Agreement 2026 | Legally Validated',
    description: 'Legally validated NI tenancy agreement with compliance-checked drafting.',
    type: 'article',
    url: getCanonicalUrl('/ni-tenancy-agreement-template-free'),
  },
};

const faqs = [
  {
    question: 'Are free Northern Ireland tenancy agreement templates safe to use?',
    answer: 'Most free NI tenancy agreement templates found online are not safe to use as-is. They often fail to include all prescribed terms required by the Private Tenancies Act (NI) 2022, use outdated legislation references, or are generic UK templates that don\'t account for NI-specific requirements like landlord registration numbers. Using a non-compliant template is a criminal offence under NI law.'
  },
  {
    question: 'What makes a NI tenancy agreement template legally compliant?',
    answer: 'A legally compliant NI tenancy agreement must include all prescribed information under the Private Tenancies Act 2022: full names and addresses of parties, property address, rent amount and payment details, deposit amount and protection scheme, landlord registration number, tenancy start date, repair responsibilities, notice provisions, and tenant rights information. It must also avoid unfair terms under consumer protection law.'
  },
  {
    question: 'Can I download a free NI tenancy agreement from government websites?',
    answer: 'Unlike England and Wales, the Northern Ireland Housing Executive has not published an official model tenancy agreement for private tenancies. The government provides guidance on required terms but not a complete template. This means landlords must either create their own compliant agreement or use a professional template service that understands NI law.'
  },
  {
    question: 'What are the risks of using a free generic tenancy agreement in NI?',
    answer: 'The risks are severe: using a non-compliant template is a criminal offence with fines up to £2,500; you cannot serve a valid Notice to Quit without proper documentation; deposit deductions may be unenforceable; tenants can challenge unfair terms in court; and you may face civil claims for any losses caused by missing terms. The cost of getting it wrong far exceeds paying for a proper template.'
  },
  {
    question: 'Do I need different agreements for fixed-term vs periodic tenancies in NI?',
    answer: 'The prescribed terms requirements apply to both fixed-term and periodic tenancies in Northern Ireland. However, the specific notice provisions and end-of-term arrangements differ. A good template should allow you to specify whether it\'s a fixed term (with a specific end date) or periodic (rolling monthly/weekly). Fixed terms automatically become periodic tenancies when they expire.'
  },
  {
    question: 'Can I use an English AST template for a property in Northern Ireland?',
    answer: 'No, absolutely not. An English AST (Assured Shorthold Tenancy) template is legally worthless in Northern Ireland. NI has completely different tenancy legislation (Private Tenancies Act 2022 vs Housing Act 1988), different deposit rules (2 months vs 5 weeks), mandatory landlord registration, different notice periods, and different eviction grounds. Using an English template could constitute failure to provide a valid written statement.'
  },
  {
    question: 'What is the Private Tenancies Act (NI) 2022?',
    answer: 'The Private Tenancies Act (Northern Ireland) 2022 is the main legislation governing private rentals in NI. It introduced mandatory written tenancy agreements (criminal offence if missing), enhanced deposit protection rules, tiered notice periods based on tenancy length, landlord registration requirements, and restrictions on rent increases. All NI tenancy agreements must comply with this Act.'
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
    answer: 'If your tenancy agreement is missing prescribed terms, you commit a criminal offence under the Private Tenancies Act 2022. Consequences include: fixed penalty notice of £500; prosecution with fines up to £2,500; inability to serve valid Notice to Quit; potential deposit penalties of up to 3x the deposit amount; and civil liability for tenant losses. It\'s essential to get this right from the start.'
  },
  {
    question: 'Should I pay for a Northern Ireland tenancy agreement template?',
    answer: 'Yes, paying for a properly drafted NI-specific template is strongly recommended. The cost (typically £10-50) is negligible compared to: £2,500+ in potential fines; months of delayed eviction; deposit penalty claims; or civil liability. Professional templates are regularly updated for law changes, include all prescribed terms, and may offer guidance or support. It\'s a business expense that protects your investment.'
  },
  {
    question: 'Can a free starter document be updated for the Private Tenancies Act 2022?',
    answer: 'While you could theoretically update a free starter document yourself, this requires detailed knowledge of the Private Tenancies Act 2022, subsequent regulations, and case law interpretations. Most landlords lack this expertise. It\'s safer and more cost-effective to use a template specifically designed for the 2022 Act and regularly maintained by legal professionals who track NI tenancy law changes.'
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
          dateModified: '2025-01-20',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Tenancy Agreements', url: '/products/ast' },
          { name: 'Northern Ireland', url: '/northern-ireland-tenancy-agreement-template' },
          { name: 'Free Starter Document Comparison', url: '/ni-tenancy-agreement-template-free' },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <UniversalHero
          title="Northern Ireland Tenancy Agreement"
          subtitle="Create a legally validated NI tenancy agreement with solicitor-grade terms and compliance checks."
          primaryCta={{ label: "Start now", href: "/wizard?product=ast_standard&src=seo_ni_tenancy_agreement_template_free&topic=tenancy&jurisdiction=northern-ireland" }}
          showTrustPositioningBar
          hideMedia
        />
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-amber-600">Home</Link></li>
              <li className="text-slate-400">/</li>
              <li><Link href="/products/ast" className="hover:text-amber-600">Tenancy Agreements</Link></li>
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
              Non-compliance with the Private Tenancies Act 2022 is a criminal offence with fines up to £2,500.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/wizard?product=ast_standard&src=seo_ni_tenancy_agreement_template_free&topic=tenancy&jurisdiction=northern-ireland"
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
                <h2 className="text-lg font-bold text-red-900">Criminal Liability Warning</h2>
                <p className="text-red-800 mt-2">
                  Under the Private Tenancies Act (NI) 2022, failing to provide a compliant written tenancy agreement
                  within 28 days is a <strong>criminal offence</strong>. Using an inadequate free starter document can result
                  in fixed penalty notices (£500), prosecution (up to £2,500), and prevent you from ever evicting your tenant legally.
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
              The True Cost of "Free"
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-semibold text-red-900 mb-4">Potential Costs of Non-Compliance</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">£500</span>
                    <span className="text-red-800">Fixed penalty notice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">£2,500</span>
                    <span className="text-red-800">Court prosecution fine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">3x deposit</span>
                    <span className="text-red-800">Protection failure penalty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">£1,000+</span>
                    <span className="text-red-800">Failed eviction costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-red-700 w-20">6+ months</span>
                    <span className="text-red-800">Delayed possession</span>
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
                    <span className="font-semibold text-emerald-700 w-20">£14.99</span>
                    <span className="text-emerald-800">Standard NI template</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-emerald-700 w-20">£14.99</span>
                    <span className="text-emerald-800">Premium with extras</span>
                  </li>
                </ul>
                <div className="mt-8 pt-4 border-t border-emerald-300">
                  <div className="flex justify-between">
                    <span className="font-semibold text-emerald-900">One-time cost:</span>
                    <span className="font-bold text-emerald-700">From £14.99</span>
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
              For less than the cost of a council fixed penalty notice, protect yourself with a fully
              compliant Northern Ireland tenancy agreement. Our wizard ensures every prescribed term is included.
            </p>
            <Link
              href="/wizard?product=ast_standard&src=seo_ni_tenancy_agreement_template_free&topic=tenancy&jurisdiction=northern-ireland"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              <RiDownloadLine className="w-5 h-5" />
              Create Your Agreement - £14.99
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
