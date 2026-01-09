import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { RiCheckboxCircleLine, RiCloseLine } from "react-icons/ri";
import {
  Home,
  GraduationCap,
  Briefcase,
  BadgePoundSterling,
  Eye,
  RefreshCw,
  Cloud,
} from "lucide-react";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { productLinks, toolLinks, landingPageLinks } from "@/lib/seo/internal-links";
import { StructuredData, productSchema, breadcrumbSchema, faqPageSchema } from "@/lib/seo/structured-data";
import { getCanonicalUrl } from "@/lib/seo";
import { AskHeavenWidget } from "@/components/ask-heaven/AskHeavenWidget";
import { PRODUCTS } from "@/lib/pricing/products";
import {
  WhyLandlordHeaven,
  AskHeavenSection,
  JurisdictionAccordion,
  VsSolicitorComparison,
} from "@/components/value-proposition";

// Get prices from single source of truth
const standardPrice = PRODUCTS.ast_standard.displayPrice;
const premiumPrice = PRODUCTS.ast_premium.displayPrice;

export const metadata: Metadata = {
  title: `Tenancy Agreements - Standard ${standardPrice} / Premium ${premiumPrice}`,
  description:
    `Legally compliant tenancy agreements for UK landlords. AST (England), Occupation Contract (Wales), PRT (Scotland), NI Tenancy. Preview before you buy. Standard ${standardPrice}, Premium ${premiumPrice}.`,
  openGraph: {
    title: `Tenancy Agreements - From ${standardPrice}`,
    description:
      "Legally compliant tenancy agreements for UK landlords. Covers England, Wales, Scotland, and Northern Ireland. Preview before you buy.",
    type: 'website',
    url: getCanonicalUrl('/products/ast'),
  },
  alternates: {
    canonical: getCanonicalUrl('/products/ast'),
  },
};

// FAQ data for structured data
const faqs = [
  {
    question: "What documents do I get?",
    answer: "Standard pack (4 documents): Tenancy Agreement, Terms & Conditions Schedule, Government Model Clauses, Inventory Template. Premium pack (7 documents): All Standard documents plus Key Schedule, Property Maintenance Guide, Checkout Procedure."
  },
  {
    question: "Can I preview before I pay?",
    answer: "Yes. You can preview all documents with a watermark before paying. This lets you verify everything is correct before committing."
  },
  {
    question: "What if I need to make changes?",
    answer: "You can edit your answers and regenerate documents instantly at no extra cost. Unlimited regenerations are included."
  },
  {
    question: "Which jurisdictions do you support?",
    answer: "England (AST), Wales (Standard Occupation Contract), Scotland (PRT), and Northern Ireland (Private Tenancy). The wizard automatically generates the correct format for your jurisdiction."
  },
  {
    question: "How long are documents stored?",
    answer: "Documents are stored in your portal for at least 12 months. You can download and save them any time."
  },
  {
    question: "Is this legally valid?",
    answer: "Yes. Both Standard and Premium are legally valid tenancy agreements used by thousands of UK landlords. However, for complex situations, consult a solicitor."
  },
  {
    question: "Can I edit the agreement after generating?",
    answer: "Yes. You can regenerate with different answers at no extra cost (unlimited regenerations). After download, the PDF can also be edited before signing."
  },
  {
    question: "Do you provide legal advice?",
    answer: "No. We provide document generation and guidance, not legal advice. Ask Heaven helps you understand the process but is not a solicitor and does not provide legal representation."
  }
];

export default function ASTPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for SEO */}
      <StructuredData data={productSchema({
        name: "Tenancy Agreements - AST, PRT, NI",
        description: "Legally compliant tenancy agreements for UK landlords. Covers Assured Shorthold Tenancies (England & Wales), Private Residential Tenancies (Scotland), and Northern Ireland tenancies.",
        price: PRODUCTS.ast_standard.price.toString(),
        url: "https://landlordheaven.co.uk/products/ast"
      })} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://landlordheaven.co.uk" },
        { name: "Products", url: "https://landlordheaven.co.uk/pricing" },
        { name: "Tenancy Agreements", url: "https://landlordheaven.co.uk/products/ast" }
      ])} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Tenancy Agreements</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Legally compliant for England, Wales, Scotland & NI
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-6">
              <span className="text-5xl md:text-6xl font-bold text-gray-900">{standardPrice}</span>
              <span className="text-gray-500 text-lg">standard</span>
            </div>

            {/* Key differentiators */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              <span className="flex items-center gap-1 text-gray-700">
                <Eye className="w-4 h-4 text-primary" /> Preview before you buy
              </span>
              <span className="flex items-center gap-1 text-gray-700">
                <RefreshCw className="w-4 h-4 text-primary" /> Edit &amp; regenerate (unlimited)
              </span>
              <span className="flex items-center gap-1 text-gray-700">
                <Cloud className="w-4 h-4 text-primary" /> Portal storage (12+ months)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wizard?product=ast_standard&src=product_page&topic=tenancy"
                className="hero-btn-primary"
              >
                Standard (4 docs) - {standardPrice} →
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=product_page&topic=tenancy"
                className="hero-btn-secondary"
              >
                Premium (7 docs) - {premiumPrice} →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">One-time payment • Unlimited regenerations • No subscription</p>
          </div>
        </Container>
      </section>

      {/* What You Get - Standard vs Premium */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              What You Get
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Choose Standard (4 documents) or Premium (7 documents)
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Standard */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-charcoal mb-4">Standard Pack (4 docs) - {standardPrice}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Tenancy Agreement</span>
                      <span className="text-sm text-gray-500 block">AST / Occupation Contract / PRT / NI Tenancy</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Terms &amp; Conditions Schedule</span>
                      <span className="text-sm text-gray-500 block">Standard clauses for residential lettings</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Government Model Clauses</span>
                      <span className="text-sm text-gray-500 block">Recommended terms from government guidance</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Inventory Template</span>
                      <span className="text-sm text-gray-500 block">Property condition record</span>
                    </div>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    href="/wizard?product=ast_standard&src=product_page&topic=tenancy"
                    className="block w-full bg-gray-200 text-charcoal px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
                  >
                    Get Standard - {standardPrice}
                  </Link>
                </div>
              </div>

              {/* Premium */}
              <div className="bg-white rounded-lg border-2 border-primary p-6 relative">
                <div className="absolute -top-3 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMENDED
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-4">Premium Pack (7 docs) - {premiumPrice}</h3>
                <p className="text-sm text-gray-600 mb-4">Everything in Standard, plus:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">All 4 Standard Documents</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Key Schedule</span>
                      <span className="text-sm text-gray-500 block">Track keys issued to tenants</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Property Maintenance Guide</span>
                      <span className="text-sm text-gray-500 block">Tenant responsibilities explained</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Checkout Procedure</span>
                      <span className="text-sm text-gray-500 block">End-of-tenancy process guide</span>
                    </div>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    href="/wizard?product=ast_premium&src=product_page&topic=tenancy"
                    className="block w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-primary-700 transition-colors"
                  >
                    Get Premium - {premiumPrice}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Jurisdiction Accordion */}
      <section className="py-8">
        <Container>
          <div className="max-w-4xl mx-auto">
            <JurisdictionAccordion product="ast" defaultExpanded={true} />
          </div>
        </Container>
      </section>

      {/* Ask Heaven Section */}
      <AskHeavenSection variant="full" product="ast" />

      {/* Why Landlord Heaven */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <WhyLandlordHeaven variant="full" />
          </div>
        </Container>
      </section>

      {/* Premium Features */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              Standard vs Premium Clauses
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Both are legally valid. Premium adds extra protection.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal border-b border-gray-200">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-charcoal border-b border-gray-200">
                      Standard<br />{standardPrice}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-primary border-b border-gray-200">
                      Premium<br />{premiumPrice}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Core clauses (rent, deposit, duration)</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Tenant responsibilities</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Pets clause</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Break clause (optional)</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">HMO-ready clauses</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Joint &amp; several liability</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Guarantor clauses</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Rent increase provisions (CPI/RPI)</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Subletting prohibition</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Professional cleaning clause</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle"><RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-charcoal">Number of documents</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-charcoal">4</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-primary bg-primary-subtle">7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison vs Solicitor */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">
              How We Compare
            </h2>
            <VsSolicitorComparison product="ast" />
          </div>
        </Container>
      </section>

      {/* When to Choose Premium */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              When to Choose Premium
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Home className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">HMOs &amp; Multi-Tenant</h3>
                <p className="text-gray-700 mb-3">
                  Letting to multiple unrelated tenants? Premium includes joint &amp; several liability, shared facilities rules, and tenant replacement provisions.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Student Lettings</h3>
                <p className="text-gray-700 mb-3">
                  Premium includes guarantor clauses, anti-subletting provisions, and professional cleaning requirements common for student lets.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Professional Landlords</h3>
                <p className="text-gray-700 mb-3">
                  Managing multiple properties? Premium offers rent increase mechanisms, stronger termination clauses, and detailed inventory schedules.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BadgePoundSterling className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">High-Value Properties</h3>
                <p className="text-gray-700 mb-3">
                  For properties with higher rent or value, Premium provides comprehensive insurance requirements and detailed maintenance obligations.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-700">
                <strong>Not sure?</strong> Our wizard will recommend Standard or Premium based on your property and tenancy details.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-[#F7EFFF]">
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Retention Policy Notice */}
      <section className="py-8">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-50 rounded-lg p-6 flex items-start gap-4">
              <Cloud className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-charcoal mb-1">Document Storage</h4>
                <p className="text-gray-700 text-sm">
                  Documents are stored in your portal for at least 12 months. You can download and save them any time.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Ask Heaven Widget */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-2xl mx-auto">
            <AskHeavenWidget
              variant="banner"
              source="product_page"
              topic="tenancy_agreement"
              product="tenancy_agreement"
              title="Have questions about tenancy agreements?"
              description="Ask Heaven can help you understand AST, PRT, and occupation contract requirements."
            />
          </div>
        </Container>
      </section>

      {/* Related Resources */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <RelatedLinks
              title="Related Resources"
              links={[
                productLinks.noticeOnly,
                productLinks.completePack,
                toolLinks.hmoChecker,
                toolLinks.section21Generator,
                landingPageLinks.tenancyTemplate,
              ]}
            />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Create Your Tenancy Agreement?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Preview before you pay. Edit and regenerate instantly. Stored in your portal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wizard?product=ast_standard&src=product_page&topic=tenancy"
                className="hero-btn-primary"
              >
                Standard (4 docs) - {standardPrice} →
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=product_page&topic=tenancy"
                className="hero-btn-secondary"
              >
                Premium (7 docs) - {premiumPrice} →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              One-time payment • Unlimited regenerations • No subscription
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
