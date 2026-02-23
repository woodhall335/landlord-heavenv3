import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementScotlandLinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';

export const metadata: Metadata = {
  title: 'Scotland PRT Model Agreement Guide 2026 | Government Template vs Ours',
  description: 'Compare the Scottish Government PRT model agreement with professional alternatives. What the model lacks explained.',
  keywords: [
    'Scotland PRT model agreement',
    'Scottish Government tenancy agreement',
    'model PRT Scotland',
    'Scottish model tenancy',
    'PRT model agreement comparison',
    'government tenancy template Scotland',
    'Scottish model agreement guide',
    'PRT template comparison',
    'Scotland model tenancy agreement',
    'private residential tenancy model',
  ],
  alternates: {
    canonical: getCanonicalUrl('/scotland-prt-model-agreement-guide'),
  },
  openGraph: {
    title: 'Scotland PRT Model Agreement Guide 2026 | Government Template vs Ours',
    description: 'Compare the Scottish Government PRT model agreement with professionally drafted alternatives.',
    type: 'article',
    url: getCanonicalUrl('/scotland-prt-model-agreement-guide'),
  },
};

const faqs = [
  {
    question: 'What is the Scottish Government model PRT agreement?',
    answer: 'The Scottish Government publishes a "model" Private Residential Tenancy agreement that contains the statutory terms required by the Private Housing (Tenancies) (Scotland) Act 2016. It is a template document that landlords can use as a starting point. However, it is exactly that - a starting point. The model agreement requires significant customisation and lacks many practical clauses that landlords need.',
  },
  {
    question: 'Is the government model agreement legally required?',
    answer: 'No. You are not legally required to use the government model agreement. You must include the statutory PRT terms in your agreement, but you can present them in your own format and add additional terms. Many landlords and letting agents use alternative templates that include the statutory terms plus additional protective clauses.',
  },
  {
    question: 'What does the government model agreement lack?',
    answer: 'The government model agreement is deliberately minimal. It lacks: (1) Detailed property-specific terms, (2) Comprehensive inventory provisions, (3) Garden and exterior maintenance clauses, (4) Detailed access for repairs provisions, (5) Pet policy terms, (6) Parking and storage allocations, (7) Utility responsibilities, (8) Professional formatting suitable for court/tribunal use, (9) Guidance notes for landlords.',
  },
  {
    question: 'Can I add additional terms to the model agreement?',
    answer: 'Yes. The PRT system allows for "additional terms" beyond the statutory requirements. These terms must not conflict with the statutory terms, must not be unfair to the tenant, and must not attempt to contract out of legal protections. Our template includes appropriate additional terms that have been drafted to be enforceable.',
  },
  {
    question: 'Why do landlords choose alternative PRT templates?',
    answer: 'Professional PRT templates offer several advantages: (1) Complete property-specific customisation through a guided wizard, (2) Additional clauses that protect landlord interests within legal limits, (3) Inventory sections for deposit dispute evidence, (4) Professional formatting that presents well at tribunal, (5) Clear explanatory notes, (6) Integration with eviction and money claim processes.',
  },
  {
    question: 'Will using an alternative template cause problems at tribunal?',
    answer: 'No, as long as the template includes all statutory terms. The First-tier Tribunal for Scotland assesses whether the agreement complies with the law, not whether you used the government model. A professionally drafted agreement with clear terms and proper formatting can actually be easier to rely on at tribunal than a minimally customised government template.',
  },
  {
    question: 'Does your template include all statutory PRT terms?',
    answer: 'Yes. Our PRT template includes all terms required by the Private Housing (Tenancies) (Scotland) Act 2016, including landlord and tenant obligations, rent payment and review provisions, deposit protection requirements, Repairing Standard obligations, and termination provisions. We also add appropriate additional terms that enhance landlord protection.',
  },
  {
    question: 'How does your template compare on inventory and deposits?',
    answer: 'The government model has minimal inventory provisions - just a reference to having one. Our Premium template includes comprehensive inventory sections where you can document condition, furnishings, and existing issues. This is crucial evidence for deposit disputes. Detailed inventories significantly improve your success rate in deduction claims.',
  },
  {
    question: 'What about Repairing Standard compliance?',
    answer: 'The government model simply references the Repairing Standard. Our template includes detailed schedules explaining each of the requirements (wind and watertight structure, safe installations, adequate heating, fire safety, etc.) so both parties understand their obligations. This can help prevent disputes by setting clear expectations.',
  },
  {
    question: 'Is the government model agreement free to use?',
    answer: 'Yes, the Scottish Government model agreement is free to download. However, "free" has costs: you need to customise it yourself (risking errors), you don\'t get inventory sections, and you don\'t have integration with eviction or money claim processes. Many landlords find the £14.99-14.99 for a professional template is well worth avoiding these issues.',
  },
  {
    question: 'Can I use the government model and add your inventory sections?',
    answer: 'Technically yes, but this creates inconsistency and formatting issues. Our template is designed as a cohesive document where all sections work together. The inventory provisions reference the main agreement terms correctly, the deposit clauses align with the inventory requirements, and the whole document has consistent professional formatting.',
  },
  {
    question: 'How often do you update your PRT template?',
    answer: 'We review our Scottish templates quarterly and update whenever legislation changes. The PRT system has had several amendments since 2017 (including changes to eviction grounds and notice periods). The government model is updated less frequently. Our templates always reflect current law.',
  },
];

export default function ScotlandPrtModelAgreementGuidePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Scotland PRT Model Agreement Guide 2026',
          description: 'Compare the Scottish Government PRT model agreement with professionally drafted alternatives.',
          url: getCanonicalUrl('/scotland-prt-model-agreement-guide'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          { name: 'PRT Model Agreement Guide', url: 'https://landlordheaven.co.uk/scotland-prt-model-agreement-guide' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products/ast" className="hover:text-blue-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">PRT Model Agreement Guide</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-sct.svg" alt="Scotland flag" className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Comparison Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Scotland PRT Model Agreement: What It Is and What It Lacks
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              The Scottish Government publishes a free &ldquo;model&rdquo; PRT agreement. But is it enough?
              Learn what the model agreement provides, what it&apos;s missing, and why many landlords
              choose professionally drafted alternatives.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Government Model vs Professional Template</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Feature</th>
                    <th className="px-6 py-4 text-center font-semibold">Government Model</th>
                    <th className="px-6 py-4 text-center font-semibold bg-blue-700">Landlord Heaven</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium">Statutory PRT terms</td>
                    <td className="px-6 py-4 text-center text-green-600">Yes</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Yes</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Guided wizard for customisation</td>
                    <td className="px-6 py-4 text-center text-red-600">No - manual editing</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Yes - 10 minute wizard</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Comprehensive inventory sections</td>
                    <td className="px-6 py-4 text-center text-red-600">No</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Yes (Premium)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Detailed Repairing Standard schedule</td>
                    <td className="px-6 py-4 text-center text-amber-600">Basic reference</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Comprehensive (Premium)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Pet policy provisions</td>
                    <td className="px-6 py-4 text-center text-red-600">No</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Yes</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Garden/exterior maintenance clauses</td>
                    <td className="px-6 py-4 text-center text-red-600">No</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Yes</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">HMO-specific provisions</td>
                    <td className="px-6 py-4 text-center text-red-600">No</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Yes (Premium)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Professional tribunal-ready formatting</td>
                    <td className="px-6 py-4 text-center text-amber-600">Basic</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Professional</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Integration with eviction products</td>
                    <td className="px-6 py-4 text-center text-red-600">No</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Yes</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Regular legislative updates</td>
                    <td className="px-6 py-4 text-center text-amber-600">Occasional</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-blue-50">Quarterly</td>
                  </tr>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-6 py-4">Price</td>
                    <td className="px-6 py-4 text-center">Free (+ your time)</td>
                    <td className="px-6 py-4 text-center bg-blue-100 text-blue-800">£14.99 - £14.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What the Model Lacks */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What the Government Model Agreement Lacks</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
                <h3 className="font-semibold text-gray-900 mb-2">Inventory and Deposit Evidence</h3>
                <p className="text-gray-600">
                  The model agreement simply states that an inventory &ldquo;may&rdquo; be provided. It doesn&apos;t include
                  actual inventory sections. When deposit disputes arise, you need detailed documentation of
                  property condition at check-in and check-out. Our Premium template includes comprehensive
                  inventory sections that serve as evidence in disputes.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
                <h3 className="font-semibold text-gray-900 mb-2">Garden and Exterior Responsibilities</h3>
                <p className="text-gray-600">
                  The model agreement is silent on garden maintenance, driveways, and exterior areas.
                  If you expect tenants to maintain gardens or keep parking areas clear, you need explicit terms.
                  Our template includes customisable garden and exterior maintenance clauses.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
                <h3 className="font-semibold text-gray-900 mb-2">Practical Additional Terms</h3>
                <p className="text-gray-600">
                  The model agreement contains only statutory terms. It doesn&apos;t include practical provisions
                  for: pets and their associated cleaning requirements, parking and storage allocation,
                  utility account transfers, or specific property rules. Our wizard lets you add appropriate
                  additional terms for your situation.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
                <h3 className="font-semibold text-gray-900 mb-2">Integration with Eviction Process</h3>
                <p className="text-gray-600">
                  If you later need to serve a Notice to Leave or apply to the Tribunal, the model agreement
                  isn&apos;t designed to work with those processes. Our template feeds directly into our Scottish
                  eviction products, ensuring consistency and reducing errors when you need to take action.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Our Template */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Landlords Choose Our PRT Template</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Guided Customisation</h3>
                <p className="text-gray-700">
                  Instead of manually editing a Word document and hoping you get it right,
                  our wizard asks plain-English questions and generates a customised agreement.
                  No legal expertise required.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Deposit Protection Support</h3>
                <p className="text-gray-700">
                  Our template includes all required deposit protection information and validates
                  your deposit amount against the 2-month limit. The inventory sections provide
                  evidence for any future deduction claims.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Tribunal-Ready Format</h3>
                <p className="text-gray-700">
                  If you need to go to the First-tier Tribunal, a professionally formatted agreement
                  with clear terms is easier to reference and rely on than a minimally edited government template.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Ongoing Updates</h3>
                <p className="text-gray-700">
                  Scottish tenancy law continues to evolve. We review our templates quarterly and
                  update them when legislation changes. The government model is updated less frequently.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="section"
          jurisdiction="scotland"
          title="Get a Professional PRT Instead"
          description="Generate a comprehensive Scottish tenancy agreement in minutes — not hours."
        />

        {/* FAQ */}
        <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />

        {/* Final CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="final"
          jurisdiction="scotland"
        />

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <RelatedLinks
            title="Related Resources"
            links={tenancyAgreementScotlandLinks}
          />
        </section>

        {/* Disclaimer */}
        <SeoDisclaimer className="max-w-4xl mx-auto px-4 pb-12" />
      </main>
    </>
  );
}
