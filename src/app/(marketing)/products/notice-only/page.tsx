import type { Metadata } from "next";
import { UniversalHero } from "@/components/landing/UniversalHero";
import { HeaderConfig } from "@/components/layout/HeaderConfig";
import { noticeOnlyHeroConfig } from "@/components/landing/heroConfigs";
import { Container } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { Zap, CheckCircle2, ShieldCheck, BadgePoundSterling } from "lucide-react";
import { StructuredData, productSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import { PRODUCTS } from "@/lib/pricing/products";
import { FAQSection } from "@/components/seo/FAQSection";
import { WhyLandlordHeaven, WhatsIncludedInteractive } from "@/components/value-proposition";
import { getNoticeOnlyPreviewData } from "@/lib/previews/noticeOnlyPreviews";
import { getCanonicalUrl } from "@/lib/seo";

const product = PRODUCTS.notice_only;
const price = product.displayPrice;

export const metadata: Metadata = {
  title: `Eviction Notice Template Bundle — Jurisdiction-Specific | England, Wales & Scotland | ${price}`,
  description:
    `Jurisdiction-specific eviction notice template bundles for England, Wales, and Scotland. Includes service instructions, validity checklist, and preview before purchase. ${price}.`,
  openGraph: {
    title: `Eviction Notice 2026 | England, Wales & Scotland | ${price}`,
    description: "Eviction notice template bundle for England (Section 21/8), Wales (Section 173), and Scotland (Notice to Leave). Includes service instructions, validity checklist, and preview before purchase.",
    url: getCanonicalUrl('/products/notice-only'),
  },
  alternates: {
    canonical: getCanonicalUrl('/products/notice-only'),
  },
};

export const runtime = 'nodejs';

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
    answer: "You can edit your answers and regenerate your case bundle instantly at no extra cost. Unlimited regenerations are included."
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
    answer: "Our system checks common compliance blockers (deposit protection, gas safety, EPC, How to Rent) before generating your notice. If you change your case details, you can regenerate your bundle instantly. Court acceptance always depends on your facts, evidence, and service."
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

export default async function NoticeOnlyPage() {
  const previews = await getNoticeOnlyPreviewData();

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={productSchema({
        name: "AI-Validated Eviction Case Bundle",
        description: "Complete eviction case bundles for UK landlords: Section 21, Section 8, Section 173, and Notice to Leave workflows with statutory-grounded validation.",
        price: product.price.toString(),
        url: "https://landlordheaven.co.uk/products/notice-only"
      })} />
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://landlordheaven.co.uk" },
        { name: "Products", url: "https://landlordheaven.co.uk/pricing" },
        { name: "Notice Only Pack", url: "https://landlordheaven.co.uk/products/notice-only" }
      ])} />

      <UniversalHero {...noticeOnlyHeroConfig} showTrustPositioningBar />

      <section className="py-10 md:py-14">
        <Container>
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:grid-cols-5">
            <div className="flex items-center justify-center bg-[#692ed4]/5 p-8 md:col-span-2 md:p-10">
              <Image
                src="/images/what_you_get.webp"
                alt="What you get illustration"
                width={360}
                height={360}
                className="h-auto w-full max-w-[360px] object-contain"
              />
            </div>
            <div className="md:col-span-3">
              <WhatsIncludedInteractive product="notice_only" defaultJurisdiction="england" previews={previews} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#fcfaff] py-10">
        <Container>
          <div className="mx-auto max-w-4xl rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] px-6 py-5 text-center shadow-[0_10px_30px_rgba(105,46,212,0.08)]">
            <p className="font-medium text-gray-700">These are example previews. Your bundle is generated specifically for your jurisdiction and tenancy details.</p>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] md:p-10">
            <WhyLandlordHeaven variant="full" />
          </div>
        </Container>
      </section>

      <section className="bg-[#F3EEFF] py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 text-center text-3xl font-bold text-charcoal md:text-5xl">How It Works</h2>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 text-center shadow-[0_10px_30px_rgba(105,46,212,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#692ED4] text-2xl font-bold text-white">1</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Answer Simple Questions</h3>
                <p className="text-gray-600">Our wizard asks about your property, tenancy, and grounds for eviction. Ask Heaven helps you choose the right route.</p>
              </div>

              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 text-center shadow-[0_10px_30px_rgba(105,46,212,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#692ED4] text-2xl font-bold text-white">2</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Preview Your Documents</h3>
                <p className="text-gray-600">See exactly what you&apos;ll get with watermarked previews. Edit answers and regenerate instantly until you&apos;re satisfied.</p>
              </div>

              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 text-center shadow-[0_10px_30px_rgba(105,46,212,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#692ED4] text-2xl font-bold text-white">3</div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Download &amp; Serve</h3>
                <p className="text-gray-600">Pay once, download your documents, and follow the service instructions to serve your notice correctly.</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/wizard?product=notice_only&src=product_page&topic=eviction" className="hero-btn-primary">Generate my notice bundle →</Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 flex justify-center">
              <Image
                src="/images/why_this_bundle.webp"
                alt="Why this bundle illustration"
                width={340}
                height={340}
                className="h-auto w-full max-w-[340px] object-contain"
              />
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-12 text-center lg:text-left">Why Choose Notice Only?</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_30px_rgba(105,46,212,0.07)]">
                    <div className="w-14 h-14 bg-white rounded-xl border border-[#E6DBFF] flex items-center justify-center mb-4"><Zap className="w-7 h-7 text-[#692ED4]" /></div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Fast - Under 10 Minutes</h3>
                    <p className="text-gray-700">Answer questions, preview your documents, and download. No waiting days for solicitor appointments.</p>
                  </div>

                  <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_30px_rgba(105,46,212,0.07)]">
                    <div className="w-14 h-14 bg-white rounded-xl border border-[#E6DBFF] flex items-center justify-center mb-4"><CheckCircle2 className="w-7 h-7 text-[#692ED4]" /></div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Official Forms</h3>
                    <p className="text-gray-700">Government-approved forms: Form 6A (Section 21), Form 3 (Section 8), RHW forms (Wales), Notice to Leave (Scotland).</p>
                  </div>

                  <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_30px_rgba(105,46,212,0.07)]">
                    <div className="w-14 h-14 bg-white rounded-xl border border-[#E6DBFF] flex items-center justify-center mb-4"><ShieldCheck className="w-7 h-7 text-[#692ED4]" /></div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Compliance Checks</h3>
                    <p className="text-gray-700">Ask Heaven flags common blockers: deposit protection, gas safety, EPC, How to Rent. Fix issues before serving.</p>
                  </div>

                  <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_30px_rgba(105,46,212,0.07)]">
                    <div className="w-14 h-14 bg-white rounded-xl border border-[#E6DBFF] flex items-center justify-center mb-4"><BadgePoundSterling className="w-7 h-7 text-[#692ED4]" /></div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">One-Time Payment</h3>
                    <p className="text-gray-700">{price} covers everything. No subscription, no hidden fees. Unlimited regenerations included.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Image
                  src="/images/why_accuracy_matters.webp"
                  alt="Why accuracy matters illustration"
                  width={640}
                  height={640}
                  className="h-auto w-full max-w-[640px] object-contain"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection title="Frequently Asked Questions" faqs={faqs} includeSchema={false} showContactCTA={false} variant="white" />

      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-br from-[#692ED4] via-[#7A3BE5] to-[#5a21be] p-8 text-center text-white shadow-[0_22px_60px_rgba(105,46,212,0.35)] md:p-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Generate Your Notice Bundle?</h2>
            <p className="mb-8 text-xl text-white/90">Jurisdiction-specific notices for England, Wales &amp; Scotland with compliance checks and watermarked previews before purchase.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/wizard?product=notice_only&src=product_page&topic=eviction" className="hero-btn-primary">Generate my notice bundle →</Link>
            </div>
            <ul className="mt-6 flex flex-col items-center gap-2 text-sm text-white/90 md:flex-row md:justify-center md:gap-6" aria-label="Purchase reassurance">
              <li>✓ Preview before paying</li>
              <li>✓ Unlimited regenerations</li>
              <li>✓ Stored 12+ months</li>
              <li>✓ One-time payment — no subscription</li>
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}
