import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { SocialProofCounter } from "@/components/ui/SocialProofCounter";
import Link from "next/link";
import { RiCheckboxCircleLine, RiCloseLine, RiAlertLine } from "react-icons/ri";
import {
  Sparkles,
  ScrollText,
  FileText,
  Scale,
  BookOpen,
  Target,
  FolderOpen,
  BadgePoundSterling,
  Package,
  Clock,
  Eye,
  RefreshCw,
  Cloud,
} from "lucide-react";
import { StructuredData, productSchema, faqPageSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { productLinks, toolLinks, blogLinks, landingPageLinks } from "@/lib/seo/internal-links";
import { getCanonicalUrl } from "@/lib/seo";
import { AskHeavenWidget } from "@/components/ask-heaven/AskHeavenWidget";
import { PRODUCTS } from "@/lib/pricing/products";
import { FAQSection } from "@/components/marketing/FAQSection";
import {
  WhyLandlordHeaven,
  AskHeavenSection,
  JurisdictionAccordion,
  VsSolicitorComparison,
  VsFreeTemplateComparison,
  WhatYouGet,
} from "@/components/value-proposition";

// Get price from single source of truth
const product = PRODUCTS.complete_pack;
const price = product.displayPrice;

export const metadata: Metadata = {
  title: `Complete Eviction Pack - ${price}`,
  description:
    `Complete eviction pack with all court forms from notice to possession order. 7-9 documents including N5, N119, AI Witness Statement. England, Wales & Scotland. ${price} one-time.`,
  openGraph: {
    title: `Complete Eviction Pack - ${price}`,
    description: "Complete eviction pack with all court forms. Official HMCTS forms + AI Witness Statement. Preview before you buy.",
    url: getCanonicalUrl('/products/complete-pack'),
  },
  alternates: {
    canonical: getCanonicalUrl('/products/complete-pack'),
  },
};

// FAQ data for structured data
const faqs = [
  {
    question: "What documents do I get?",
    answer: "You receive 7-9 documents depending on jurisdiction: Eviction Notice (Section 8/21 or Notice to Leave), Service Instructions, Validity Checklist, Court/Tribunal Forms (N5 + N119 for E&W, Form E for Scotland), AI Witness Statement, Filing Guide, Evidence Checklist, and Proof of Service Certificate."
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
    answer: "England (Section 21/Section 8 + N5/N119), Wales (Section 173 + N5/N119), and Scotland (Notice to Leave + Form E tribunal). Northern Ireland is NOT supported for eviction - only tenancy agreements."
  },
  {
    question: "Are these genuine official court forms?",
    answer: "Yes. We use official HMCTS forms (N5, N5B, N119) for England & Wales and First-tier Tribunal forms for Scotland. These are the same forms you'd download from government websites, pre-filled with your case details."
  },
  {
    question: "How long does the eviction process take?",
    answer: "Timelines vary: England & Wales 3-6 months (Section 8 rent arrears fastest; contested cases longer). Scotland 4-8 months (Tribunal process). We include detailed timeline guidance."
  },
  {
    question: "How long are documents stored?",
    answer: "Documents are stored in your portal for at least 12 months. You can download and save them any time."
  },
  {
    question: "Do you provide legal advice?",
    answer: "No. We provide document generation and guidance, not legal advice. Ask Heaven helps you understand the process but is not a solicitor and does not provide legal representation."
  }
];

export default function CompleteEvictionPackPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for SEO */}
      <StructuredData data={productSchema({
        name: "Complete Eviction Pack",
        description: "Complete eviction bundle with all court forms from notice to possession order. Includes N5, N119 forms, AI-drafted witness statements, and step-by-step guidance.",
        price: product.price.toString(),
        url: "https://landlordheaven.co.uk/products/complete-pack"
      })} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://landlordheaven.co.uk" },
        { name: "Products", url: "https://landlordheaven.co.uk/pricing" },
        { name: "Complete Eviction Pack", url: "https://landlordheaven.co.uk/products/complete-pack" }
      ])} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Complete Eviction Pack
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              7-9 court-ready documents for England, Wales or Scotland
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-6">
              <span className="text-5xl md:text-6xl font-bold text-gray-900">{price}</span>
              <span className="text-gray-500 text-lg">one-time</span>
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

            <Link
              href="/wizard?product=complete_pack&src=product_page&topic=eviction"
              className="hero-btn-primary"
            >
              Start Your Eviction Pack →
            </Link>
            <div className="mt-4 mb-2">
              <SocialProofCounter variant="today" className="mx-auto" />
            </div>
          </div>
        </Container>
      </section>

      {/* What You Get Section */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <WhatYouGet product="complete_pack" />
          </div>
        </Container>
      </section>

      {/* Jurisdiction Accordion */}
      <section className="py-8">
        <Container>
          <div className="max-w-4xl mx-auto">
            <JurisdictionAccordion product="complete_pack" defaultExpanded={true} />
          </div>
        </Container>
      </section>

      {/* Ask Heaven Section */}
      <AskHeavenSection variant="full" product="complete_pack" />

      {/* AI Witness Statement Feature */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ScrollText className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                AI Witness Statement (Included)
              </h2>
              <p className="text-xl text-gray-700">
                Professional witness statement drafted by Ask Heaven
              </p>
            </div>

            <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg max-w-xl mx-auto">
              <p className="text-gray-700 mb-4">
                Ask Heaven analyzes your case details and drafts a professional witness statement for court proceedings:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Chronological timeline of events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Legal formatting and structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Ground-specific evidence references</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Ready for court submission</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-4 italic">
                The witness statement is AI-drafted and should be reviewed before signing. You may wish to have a solicitor review it for complex cases.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Landlord Heaven */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <WhyLandlordHeaven variant="full" />
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">How It Works</h2>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Describe Your Case</h3>
                <p className="text-gray-600">
                  Tell us about your tenancy, the issue, and what&apos;s happened. Ask Heaven helps you choose the right route.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Preview Your Pack</h3>
                <p className="text-gray-600">
                  Review all documents with watermarked previews. Edit answers and regenerate until you&apos;re satisfied.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Download &amp; File</h3>
                <p className="text-gray-600">
                  Pay once, download your complete pack. Follow the filing guide to submit to court or tribunal.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Follow the Process</h3>
                <p className="text-gray-600">
                  Use our guides to navigate hearings and enforcement. Regenerate documents if your case changes.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/wizard?product=complete_pack&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Start Your Complete Pack →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison Tables */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">
              How We Compare
            </h2>
            <div className="space-y-8">
              <VsSolicitorComparison product="complete_pack" />
              <VsFreeTemplateComparison product="complete_pack" />
            </div>
          </div>
        </Container>
      </section>

      {/* Eviction Timeline */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Typical Eviction Timeline
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Timelines vary by jurisdiction and grounds. This is a general guide.
            </p>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Serve Notice (Day 0)</h3>
                  <p className="text-gray-600">
                    Deliver eviction notice to tenant. Notice period varies: 2 weeks (some rent arrears) to 6 months (Section 173 Wales).
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">File with Court/Tribunal (After Notice Period)</h3>
                  <p className="text-gray-600">
                    Submit claim form (N5/N119 or Form E) with court fee. Court issues claim and serves tenant. Tenant has 14 days to respond.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Hearing (4-12 weeks later)</h3>
                  <p className="text-gray-600">
                    Attend possession hearing. Bring all evidence (tenancy agreement, notice, arrears statement). Judge reviews case and issues possession order.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Enforcement (If Needed)</h3>
                  <p className="text-gray-600">
                    If tenant doesn&apos;t leave by order date, apply for warrant of possession. Bailiffs schedule eviction.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <RiAlertLine className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-charcoal mb-2">Timeline Estimates</h4>
                  <p className="text-gray-700">
                    <strong>England &amp; Wales:</strong> 3-6 months (uncontested); longer if contested<br />
                    <strong>Scotland:</strong> 4-8 months (Tribunal process)<br />
                    These are estimates. Actual timelines depend on court backlogs, grounds, and whether the case is contested.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Complete Pack vs Notice Only */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              Complete Pack vs Notice Only
            </h2>
            <p className="text-center text-gray-600 mb-12">Which option is right for you?</p>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal border-b border-gray-200">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-charcoal border-b border-gray-200">
                      Notice Only<br />{PRODUCTS.notice_only.displayPrice}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-primary border-b border-gray-200">
                      Complete Pack<br />{price}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                      Eviction Notice
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Service Instructions + Checklist</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Court/Tribunal Forms (N5, N119, Form E)</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">AI Witness Statement</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Court/Tribunal Filing Guide</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Evidence Collection Checklist</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Proof of Service Certificate</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-primary-subtle">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-charcoal">Best For</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Testing the waters, simple cases, want notice first
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-primary bg-primary-subtle">
                      Committed to court action, need complete DIY solution
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">Need the full solution to take your case to court?</p>
              <Link
                href="/wizard?product=complete_pack&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Get Complete Eviction Pack - {price} →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <FAQSection
        title="Frequently Asked Questions"
        faqs={faqs}
        showContactCTA={false}
        variant="white"
      />

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
              topic="eviction"
              product="complete_pack"
              title="Have questions about the eviction process?"
              description="Ask Heaven can help you understand court forms, timelines, and possession procedures."
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
                productLinks.moneyClaim,
                toolLinks.section21Generator,
                toolLinks.section8Generator,
                blogLinks.evictionTimeline,
                landingPageLinks.section21Template,
              ]}
            />
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Start Your Eviction?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Preview before you pay. Edit and regenerate instantly. Stored in your portal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wizard?product=complete_pack&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Get Complete Pack - {price} →
              </Link>
              <Link
                href="/products/notice-only"
                className="hero-btn-secondary"
              >
                Or Just Get Notice - {PRODUCTS.notice_only.displayPrice}
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
