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
import Section21ComplianceTimingPanel from "@/components/products/Section21ComplianceTimingPanel";
import { getNoticeOnlyPreviewData } from "@/lib/previews/noticeOnlyPreviews";
import { getCanonicalUrl } from "@/lib/seo";
import { FunnelProcessSection } from "@/components/funnels";

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

      <FunnelProcessSection product="notice_only" noticePreviews={previews} />

      <section className="bg-white border-y border-[#EDE2FF]">
        <Container>
          <nav className="flex flex-wrap items-center gap-3 py-4 text-sm" aria-label="Notice Only quick links">
            <Link href="#who-this-is-for" className="font-medium text-primary hover:underline">Who this is for</Link>
            <Link href="#whats-included" className="font-medium text-primary hover:underline">What's included</Link>
            <Link href="#how-it-works" className="font-medium text-primary hover:underline">How it works</Link>
            <Link href="#start-your-pack" className="font-medium text-primary hover:underline">Start your pack</Link>
          </nav>
        </Container>
      </section>

      <section id="who-this-is-for" className="scroll-mt-24 py-10 md:py-14">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">Who this is for</h2>
            <p className="mt-4 text-lg text-gray-700">This pack is for landlords who need to start possession correctly without guessing paperwork.</p>
            <ul className="mt-6 grid gap-3 text-gray-700 md:grid-cols-2">
              <li>• Your tenant is not paying rent and you need to act now.</li>
              <li>• Your tenant will not leave and you need the right first step.</li>
              <li>• You are unsure whether Section 21 or Section 8 is right.</li>
              <li>• You are worried about serving the wrong notice and losing time.</li>
            </ul>
            <p className="mt-6 text-gray-700">Serving the correct notice is what starts your eviction route. A mistake here can delay the whole case.</p>
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold text-charcoal">Need help choosing Section 21 vs Section 8?</h3>
              <p className="mb-4 text-gray-700">Use this guidance panel to understand timelines and route differences before generating your notice.</p>
            </div>
            <Section21ComplianceTimingPanel />
          </div>
        </Container>
      </section>

      <section id="whats-included" className="scroll-mt-24 py-10 md:py-14">
        <Container>
          <div className="mx-auto mb-6 max-w-6xl">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">What's included</h2>
            <p className="mt-3 text-gray-700">You get a practical notice pack: the notice itself, service instructions, and a validity checklist so you can start the process with fewer mistakes.</p>
          </div>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <WhatsIncludedInteractive
              product="notice_only"
              defaultJurisdiction="england"
              previews={previews}
              titleOverride="What's included in your eviction notice pack"
              subtitleOverride="Select your jurisdiction, then preview every document in the pack."
            />
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-[#F3EEFF] py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">How it works</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#F3EEFF] p-5"><h3 className="font-semibold">1) Choose your notice route</h3><p className="mt-2 text-sm text-gray-700">Pick Section 21, Section 8, Wales, or Scotland based on your tenancy and issue.</p></div>
              <div className="rounded-2xl bg-[#F3EEFF] p-5"><h3 className="font-semibold">2) Answer guided questions</h3><p className="mt-2 text-sm text-gray-700">We guide you through key facts and flag common compliance blockers before you generate.</p></div>
              <div className="rounded-2xl bg-[#F3EEFF] p-5"><h3 className="font-semibold">3) Preview and generate your pack</h3><p className="mt-2 text-sm text-gray-700">Check your documents, then generate and serve your notice pack confidently.</p></div>
            </div>
            <div className="mt-8 text-center">
              <Link href="/wizard?product=notice_only&src=product_page&topic=eviction" className="hero-btn-primary">Start your eviction notice →</Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="start-your-pack" className="scroll-mt-24 py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">Start your pack</h2>
            <p className="mt-4 text-gray-700">If your tenant is not paying or refusing to leave, the next step is getting the right notice in place. This pack gives you the right starting documents so you can move forward now.</p>
            <div className="mt-6"><WhyLandlordHeaven variant="full" /></div>
            <div className="mt-8 text-center">
              <Link href="/wizard?product=notice_only&src=product_page&topic=eviction" className="hero-btn-primary">Start your eviction notice →</Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="section-21-vs-section-8" className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
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

              <div className="flex items-center justify-center h-full">
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
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to serve your eviction notice?</h2>
            <p className="mb-8 text-xl text-white/90">Use the correct notice seeking possession for your situation, preview your documents, and start the landlord eviction process with confidence.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/wizard?product=notice_only&src=product_page&topic=eviction" className="hero-btn-primary">Start your eviction notice →</Link>
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
