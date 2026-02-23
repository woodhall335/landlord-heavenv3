import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementScotlandLinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';

export const metadata: Metadata = {
  title: 'PRT Template Scotland 2026 | Private Residential Tenancy Agreement',
  description: 'Download a PRT template for Scotland. Private Housing (Tenancies) Act 2016 compliant with all 18 eviction grounds. From £14.99.',
  keywords: [
    'PRT template Scotland',
    'Scotland PRT download',
    'private residential tenancy template',
    'Scottish PRT agreement',
    'PRT Scotland 2026',
    'Scotland tenancy template',
    'Scottish landlord PRT',
    'PRT form Scotland',
    'private tenancy template',
    'Scotland rental template',
  ],
  alternates: {
    canonical: getCanonicalUrl('/prt-template-scotland'),
  },
  openGraph: {
    title: 'PRT Template Scotland 2026 | Private Residential Tenancy Agreement',
    description: 'Download a PRT template for Scotland. Private Housing (Tenancies) Act 2016 compliant. From £14.99.',
    type: 'article',
    url: getCanonicalUrl('/prt-template-scotland'),
  },
};

const faqs = [
  {
    question: 'What does PRT stand for?',
    answer: 'PRT stands for Private Residential Tenancy. It is the only type of residential tenancy agreement available for private landlords in Scotland since December 2017. The PRT system was created by the Private Housing (Tenancies) (Scotland) Act 2016 to give tenants more security while maintaining landlord rights to recover property using specific grounds.',
  },
  {
    question: 'Is the PRT template the same as an AST?',
    answer: 'No, they are fundamentally different. An AST (Assured Shorthold Tenancy) is for England only and allows fixed terms with no-fault eviction. A PRT is for Scotland only and is always open-ended with no end date. Landlords can only evict using one of 18 specific grounds. Using an AST in Scotland or a PRT in England would not be legally valid.',
  },
  {
    question: 'How long can I let my property for under a PRT?',
    answer: 'A PRT is open-ended and has no maximum or minimum length. The tenancy continues until the tenant gives 28 days notice to leave, or the landlord serves a valid eviction notice using one of 18 grounds. Many Scottish PRTs continue for years - this is normal and expected under the system.',
  },
  {
    question: 'What information do I need to create a PRT?',
    answer: 'To complete a PRT, you will need: (1) Your landlord registration number (mandatory in Scotland), (2) Property address and letting agent details if applicable, (3) Tenant name(s) and contact details, (4) Rent amount and payment frequency, (5) Deposit amount (max 2 months rent), (6) Details of which deposit scheme you will use, (7) Property condition information for Repairing Standard compliance.',
  },
  {
    question: 'What is the landlord registration number?',
    answer: 'In Scotland, all landlords must register with their local council before letting any property. When you register, you receive a unique landlord registration number that must be included in your PRT and all property advertisements. Failure to register is a criminal offense with fines up to £50,000. Our wizard requires this number before generating your PRT.',
  },
  {
    question: 'Can I include additional terms in my PRT?',
    answer: 'Yes. The PRT allows for "additional terms" beyond the statutory requirements, as long as they don\'t conflict with the law or unfairly disadvantage the tenant. Common additional terms cover pets, smoking, garden maintenance, and specific property rules. Our wizard helps you add appropriate additional terms.',
  },
  {
    question: 'What is the Repairing Standard?',
    answer: 'The Repairing Standard is a set of legal minimum property conditions that Scottish landlords must maintain. It covers: wind and watertight structure, safe gas, electrical and water installations, adequate heating and hot water, satisfactory fire safety measures including smoke and CO detectors, and safe common areas (for flats). Our PRT includes all Repairing Standard obligations.',
  },
  {
    question: 'How do I increase rent under a PRT?',
    answer: 'You can only increase rent once per 12-month period with at least 3 months written notice using the prescribed form. The tenant can challenge an "unreasonable" increase by applying to a Rent Officer within 21 days. In Rent Pressure Zones, increases may be capped. Our template includes compliant rent review provisions.',
  },
  {
    question: 'What are the 18 eviction grounds?',
    answer: 'Key grounds include: (1-2) Landlord selling or family moving in, (3) Refurbishment, (4) Conversion to non-residential, (5) Demolition, (6) Required for religious worker, (7) Registration refusal, (8) HMO licence revocation, (9) Overcrowding notice, (10-11) Landlord/lender selling repossessed property, (12) Serious rent arrears (3+ months), (13) Repeated late payment, (14) Breach of tenancy, (15) Anti-social behaviour, (16) Property now tenant\'s only/principal home, (17) Abandoned property, (18) Tenant no longer needs supported accommodation. Each has specific requirements.',
  },
  {
    question: 'What happens if I need to sell my Scottish property?',
    answer: 'Ground 1 allows eviction if you intend to sell the property. You must give 84 days notice (168 days if tenant has lived there 5+ years) and provide evidence of genuine intention to sell (e.g., estate agent valuation, marketing plans). The First-tier Tribunal will verify your intention before granting an eviction order.',
  },
  {
    question: 'Can I get my property back quickly if the tenant doesn\'t pay rent?',
    answer: 'For serious rent arrears (3+ consecutive months), you can use Ground 12 with 28 days notice. If the tenant has been in arrears 3+ times in the past 12 months, you can use Ground 13. Both grounds still require a First-tier Tribunal application if the tenant doesn\'t leave voluntarily - there is no "accelerated" process like England\'s.',
  },
  {
    question: 'Does the PRT template work for HMOs in Scotland?',
    answer: 'Our Premium PRT (£24.99) includes HMO-specific provisions for properties with 3+ unrelated tenants. Scotland has its own HMO licensing requirements through local councils. You need both an HMO licence and landlord registration. The Premium template includes shared area responsibilities and room allocation terms.',
  },
];

export default function PrtTemplateScotlandPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'PRT Template Scotland 2026',
          description: 'Download a PRT template for Scotland compliant with Private Housing (Tenancies) Act 2016.',
          url: getCanonicalUrl('/prt-template-scotland'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          { name: 'PRT Template Scotland', url: 'https://landlordheaven.co.uk/prt-template-scotland' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products/ast" className="hover:text-blue-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">PRT Template Scotland</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-sct.svg" alt="Scotland flag" className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Scotland-Specific
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              PRT Template for Scotland
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Generate a <strong>Private Residential Tenancy agreement</strong> for your Scottish property.
              Our PRT template includes all statutory terms, landlord registration provisions,
              and Repairing Standard obligations required by Scottish law.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=seo_prt_scotland&topic=tenancy&jurisdiction=scotland"
                className="inline-flex items-center gap-2 bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Standard PRT — £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=seo_prt_scotland&topic=tenancy&jurisdiction=scotland"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Premium PRT — £24.99
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">10-minute wizard • Instant download • Tribunal-ready</p>
          </div>
        </section>

        {/* Quick Facts */}
        <section className="py-12 bg-white border-y border-gray-200">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Scotland PRT Quick Facts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">Open-Ended</div>
                <div className="text-sm text-gray-600">No fixed term allowed</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">2 Months</div>
                <div className="text-sm text-gray-600">Maximum deposit</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">18 Grounds</div>
                <div className="text-sm text-gray-600">For eviction</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">28-168 Days</div>
                <div className="text-sm text-gray-600">Notice periods</div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Different */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What Makes the Scottish PRT Different</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                <h3 className="font-semibold text-gray-900 mb-2">No Fixed Terms</h3>
                <p className="text-gray-600">
                  Unlike England where you can set a 6 or 12-month fixed term, all Scottish PRTs are
                  open-ended from day one. The tenancy continues until properly terminated.
                  This gives tenants greater security but means landlords must use specific grounds to recover possession.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                <h3 className="font-semibold text-gray-900 mb-2">Grounds-Based Eviction Only</h3>
                <p className="text-gray-600">
                  There is no &ldquo;no-fault&rdquo; eviction in Scotland. You must prove one of 18 specific grounds
                  such as wanting to sell the property, needing it for family, or tenant breach.
                  Each ground has evidence requirements and specific notice periods.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                <h3 className="font-semibold text-gray-900 mb-2">First-tier Tribunal</h3>
                <p className="text-gray-600">
                  Disputes and evictions go to the First-tier Tribunal for Scotland (Housing and Property Chamber),
                  not county court. The process is different from England and typically takes 4-8 weeks for an eviction order.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                <h3 className="font-semibold text-gray-900 mb-2">Mandatory Landlord Registration</h3>
                <p className="text-gray-600">
                  All Scottish landlords must register with their local council before letting.
                  Your registration number must appear on the PRT and all property adverts.
                  Failure to register is a criminal offense with fines up to £50,000.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <SeoCtaBlock
          showTrustPositioningBar
          pageType="tenancy"
          variant="section"
          jurisdiction="scotland"
          title="Create Your Scotland PRT Now"
          description="Generate a compliant Private Residential Tenancy in minutes. No legal expertise required."
        />

        {/* Cross-sell */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Scottish Landlord Toolkit</h2>
            <p className="text-gray-700 mb-6">
              A solid PRT is the foundation. Be prepared for any situation with our Scotland-specific products:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/products/notice-only" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Scottish Notice to Leave</h3>
                <p className="text-sm text-gray-600 mb-2">All 18 grounds with correct notice periods</p>
                <span className="text-indigo-600 font-medium">£49.99</span>
              </Link>
              <Link href="/products/money-claim" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Scottish Money Claims</h3>
                <p className="text-sm text-gray-600 mb-2">Simple Procedure for Scottish courts</p>
                <span className="text-indigo-600 font-medium">£99.99</span>
              </Link>
              <Link href="/ask-heaven" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Ask Heaven for Scotland</h3>
                <p className="text-sm text-gray-600 mb-2">Free Scottish landlord Q&A</p>
                <span className="text-green-600 font-medium">Free</span>
              </Link>
            </div>
          </div>
        </section>

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
