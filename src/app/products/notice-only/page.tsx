import type { Metadata } from "next";
import { UniversalHero } from "@/components/landing/UniversalHero";
import { noticeOnlyHeroConfig } from "@/components/landing/heroConfigs";
import { Container } from "@/components/ui";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  BadgePoundSterling,
} from "lucide-react";
import { StructuredData, productSchema, faqPageSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { productLinks, toolLinks, blogLinks, landingPageLinks } from "@/lib/seo/internal-links";
import { getCanonicalUrl } from "@/lib/seo";
import { PRODUCTS } from "@/lib/pricing/products";
import { FAQSection } from "@/components/marketing/FAQSection";
import {
  WhyLandlordHeaven,
  VsSolicitorComparison,
  VsFreeTemplateComparison,
  WhatsIncludedInteractive,
} from "@/components/value-proposition";

// Get price from single source of truth
const product = PRODUCTS.notice_only;
const price = product.displayPrice;

export const metadata: Metadata = {
  title: `Eviction Notice Pack 2026 | England, Wales & Scotland | ${price}`,
  description:
    `Court-ready eviction notices for England, Wales, and Scotland. Official forms, service instructions, and validity checklist. ${price}.`,
  openGraph: {
    title: `Eviction Notice 2026 | England, Wales & Scotland | ${price}`,
    description: "Court-ready eviction notices for England (Section 21/8), Wales (Section 173), and Scotland (Notice to Leave). Preview before you buy.",
    url: getCanonicalUrl('/products/notice-only'),
  },
  alternates: {
    canonical: getCanonicalUrl('/products/notice-only'),
  },
};

// FAQ data for structured data
const faqs = [
  {
    question: "What documents do I get?",
    answer: "You receive 3 documents: (1) Your eviction notice (Section 21, Section 8, Section 173, or Notice to Leave depending on jurisdiction), (2) Service Instructions explaining how to legally serve your notice, and (3) Service & Validity Checklist to verify compliance before serving."
  },
  {
    question: "Can I preview before I pay?",
    answer: "Yes. You can preview all 3 documents with a watermark before paying. This lets you verify everything is correct before committing."
  },
  {
    question: "What if I need to make changes?",
    answer: "You can edit your answers and regenerate documents instantly at no extra cost. Unlimited regenerations are included."
  },
  {
    question: "Which jurisdictions do you support?",
    answer: "England (Section 21/Section 8), Wales (Section 173/fault-based notices), and Scotland (Notice to Leave)."
  },
  {
    question: "Are these the official government forms?",
    answer: "Yes. We use official government forms: Form 6A for Section 21 (England), Form 3 for Section 8 (England), official RHW forms for Wales, and the prescribed Notice to Leave format for Scotland."
  },
  {
    question: "What if my notice is invalid?",
    answer: "Our system checks for common compliance blockers (deposit protection, gas safety, EPC, How to Rent) before generating your notice. If your notice is later rejected due to an error in our document generation, we'll regenerate it free. We cannot guarantee court acceptance as that depends on your specific circumstances and evidence."
  },
  {
    question: "How long are documents stored?",
    answer: "Documents are stored in your portal for at least 12 months. You can download and save them any time."
  },
  {
    question: "Do you provide legal advice?",
    answer: "No. We provide document generation and guidance, not legal advice. Ask Heaven helps you understand the process but is not a solicitor and does not provide legal representation. Consult a qualified solicitor for complex cases."
  }
];

export default function NoticeOnlyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for SEO */}
      <StructuredData data={productSchema({
        name: "Notice Only Pack - Eviction Notices",
        description: "Court-ready eviction notices for UK landlords. Section 21, Section 8, Section 173, and Notice to Leave. Preview before you buy, edit and regenerate instantly.",
        price: product.price.toString(),
        url: "https://landlordheaven.co.uk/products/notice-only"
      })} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://landlordheaven.co.uk" },
        { name: "Products", url: "https://landlordheaven.co.uk/pricing" },
        { name: "Notice Only Pack", url: "https://landlordheaven.co.uk/products/notice-only" }
      ])} />

      {/* Hero Section */}
      <UniversalHero {...noticeOnlyHeroConfig} />

      <WhatsIncludedInteractive product="notice_only" defaultJurisdiction="england" />

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

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Answer Simple Questions</h3>
                <p className="text-gray-600">
                  Our wizard asks about your property, tenancy, and grounds for eviction. Ask Heaven helps you choose the right route.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Preview Your Documents</h3>
                <p className="text-gray-600">
                  See exactly what you&apos;ll get with watermarked previews. Edit answers and regenerate instantly until you&apos;re satisfied.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Download &amp; Serve</h3>
                <p className="text-gray-600">
                  Pay once, download your documents, and follow the service instructions to serve your notice correctly.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/wizard?product=notice_only&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Start Your Notice Now →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison: vs Solicitor */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">
              How We Compare
            </h2>
            <div className="space-y-8">
              <VsSolicitorComparison product="notice_only" />
              <VsFreeTemplateComparison product="notice_only" />
            </div>
          </div>
        </Container>
      </section>

      {/* Why Choose Notice Only */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Why Choose Notice Only?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Fast - Under 10 Minutes</h3>
                <p className="text-gray-700">
                  Answer questions, preview your documents, and download. No waiting days for solicitor appointments.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Official Forms</h3>
                <p className="text-gray-700">
                  Government-approved forms: Form 6A (Section 21), Form 3 (Section 8), RHW forms (Wales), Notice to Leave (Scotland).
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Compliance Checks</h3>
                <p className="text-gray-700">
                  Ask Heaven flags common blockers: deposit protection, gas safety, EPC, How to Rent. Fix issues before serving.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BadgePoundSterling className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">One-Time Payment</h3>
                <p className="text-gray-700">
                  {price} covers everything. No subscription, no hidden fees. Unlimited regenerations included.
                </p>
              </div>
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

      {/* Related Resources */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <RelatedLinks
              title="Related Resources"
              links={[
                productLinks.completePack,
                toolLinks.section21Generator,
                toolLinks.section8Generator,
                blogLinks.whatIsSection21,
                blogLinks.section21VsSection8,
                landingPageLinks.evictionTemplate,
              ]}
            />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Get Your Notice?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Preview before you pay. Edit and regenerate instantly. Stored in your portal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wizard?product=notice_only&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Start Your Notice - {price} →
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
