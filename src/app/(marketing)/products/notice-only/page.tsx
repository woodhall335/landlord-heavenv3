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
import { guideLinks } from "@/lib/seo/internal-links";

const product = PRODUCTS.notice_only;
const price = product.displayPrice;

export const metadata: Metadata = {
  title: `Evict a Tenant Legally | Eviction Notice Pack for Landlords | ${price}`,
  description:
    `Create the right eviction notice pack for England, Wales, or Scotland, with landlord route checks, service guidance, and clearer next steps before you serve.`,
  openGraph: {
    title: `Eviction Notice Pack for Landlords | Evict a Tenant Legally | ${price}`,
    description:
      "Eviction notice pack for landlords in England, Wales, and Scotland. Includes the notice itself, service instructions, a validity checklist, and a preview before purchase.",
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
    answer:
      "You get 3 documents: (1) the notice for your case and region, (2) service instructions explaining how to serve it, and (3) a service and validity checklist to help you spot issues before you send anything.",
  },
  {
    question: "Can I preview before I pay?",
    answer:
      "Yes. You can preview all 3 documents with a watermark before paying, so you can check everything carefully before you commit.",
  },
  {
    question: "What if I need to make changes?",
    answer:
      "You can edit your answers and regenerate your case bundle instantly at no extra cost. Unlimited regenerations are included.",
  },
  {
    question: "Which regions do you support?",
    answer:
      "England, Wales, and Scotland. We prepare the notice that matches the property location and the route you are taking.",
  },
  {
    question: "Are these the official government forms?",
    answer:
      "Yes. We use the official government forms and prescribed notice formats used in England, Wales, and Scotland.",
  },
  {
    question: "What if my notice is invalid?",
    answer:
      "Our system checks common compliance blockers, including deposit protection, gas safety, EPC, and How to Rent, before generating your notice. If your case details change, you can regenerate your bundle instantly. Court acceptance will always depend on your facts, evidence, and how the notice is served.",
  },
  {
    question: "How long are documents stored?",
    answer:
      "Your documents are stored in your portal for at least 12 months. You can download and save them at any time.",
  },
  {
    question: "Do you provide legal advice?",
    answer:
      "No. We provide document generation and practical guidance, not legal advice. Ask Heaven helps you understand the process, but it is not a solicitor and does not provide legal representation. For complex cases, you should speak to a qualified solicitor.",
  },
];

export default async function NoticeOnlyPage() {
  const previews = await getNoticeOnlyPreviewData();

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={productSchema({
          name: "Eviction Notice Pack for Landlords",
          description: "Eviction notice pack for landlords in England, Wales, and Scotland, with route checks, service guidance, and a preview before you serve.",
          price: product.price.toString(),
          url: "https://landlordheaven.co.uk/products/notice-only",
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", url: "https://landlordheaven.co.uk" },
          { name: "Products", url: "https://landlordheaven.co.uk/pricing" },
          { name: "Notice Only Pack", url: "https://landlordheaven.co.uk/products/notice-only" },
        ])}
      />

      <UniversalHero {...noticeOnlyHeroConfig} showTrustPositioningBar />

      <FunnelProcessSection product="notice_only" noticePreviews={previews} />

      <section className="bg-white border-y border-[#EDE2FF]">
        <Container>
          <nav className="flex flex-wrap items-center gap-3 py-4 text-sm" aria-label="Notice Only quick links">
            <Link href="#who-this-is-for" className="font-medium text-primary hover:underline">
              Who this is for
            </Link>
            <Link href="#whats-included" className="font-medium text-primary hover:underline">
              What's included
            </Link>
            <Link href="#how-it-works" className="font-medium text-primary hover:underline">
              How it works
            </Link>
            <Link href="#start-your-pack" className="font-medium text-primary hover:underline">
              Start your notice pack
            </Link>
          </nav>
        </Container>
      </section>

      <section id="who-this-is-for" className="scroll-mt-24 py-10 md:py-14">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">Who this is for</h2>
            <p className="mt-4 text-lg text-gray-700">
              This pack is for landlords who need to evict a tenant legally and want to get the right first step in place quickly.
            </p>
            <ul className="mt-6 grid gap-3 text-gray-700 md:grid-cols-2">
              <li>Your tenant is not paying rent and you need to start the rent arrears route.</li>
              <li>Your tenant will not leave and you want clarity on which notice applies.</li>
              <li>You are worried about serving the wrong paperwork and losing valuable time.</li>
              <li>You want the notice, service steps, and checks lined up before you press print.</li>
            </ul>
            <p className="mt-6 text-gray-700">
              Serving the correct notice is what starts the eviction process. A mistake at this stage can delay the whole case, so this page is designed to help you avoid invalid notice mistakes before you serve and lose more time.
            </p>
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold text-charcoal">Need help working out the England route?</h3>
              <p className="mb-4 text-gray-700">
                Start by checking the route, then generate the eviction notice that matches your case and region. The aim is simple: better route checks, clearer service guidance, and fewer re-serves.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  guideLinks.rentersRightsActEvictionRules,
                  guideLinks.section8Notice,
                  guideLinks.form3aSection8,
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-4 hover:bg-white"
                  >
                    <p className="font-semibold text-charcoal">{link.title}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>
            <Section21ComplianceTimingPanel />
          </div>
        </Container>
      </section>

      <section id="whats-included" className="scroll-mt-24 py-10 md:py-14">
        <Container>
          <div className="mx-auto mb-6 max-w-6xl">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">What's included</h2>
            <p className="mt-3 text-gray-700">
              You get a practical notice pack: the notice itself, service instructions, and a validity checklist to help reduce delays caused by choosing the wrong notice route.
            </p>
          </div>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <WhatsIncludedInteractive
              product="notice_only"
              defaultJurisdiction="england"
              previews={previews}
              titleOverride="What's included in your eviction notice pack"
              subtitleOverride="Choose your region, then preview every document included in the pack."
            />
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-[#F3EEFF] py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">How it works</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#F3EEFF] p-5">
                <h3 className="font-semibold">1) Tell us what has happened</h3>
                <p className="mt-2 text-sm text-gray-700">
                  We help narrow down the route based on rent arrears, breach, refusal to leave, and where the property is.
                </p>
              </div>
              <div className="rounded-2xl bg-[#F3EEFF] p-5">
                <h3 className="font-semibold">2) Answer plain-English questions</h3>
                <p className="mt-2 text-sm text-gray-700">
                  We collect the details that matter and flag obvious blockers before you generate anything.
                </p>
              </div>
              <div className="rounded-2xl bg-[#F3EEFF] p-5">
                <h3 className="font-semibold">3) Preview and generate your pack</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Review the notice, service steps, and checklist before you serve anything.
                </p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link href="/wizard?product=notice_only&src=product_page&topic=eviction" className="hero-btn-primary">
                Start your eviction notice pack →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="start-your-pack" className="scroll-mt-24 py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">Start your notice pack</h2>
            <p className="mt-4 text-gray-700">
              If your tenant is not paying or will not leave, the next step is making sure the right eviction notice is in place. This pack gives you the key starting documents so you can move forward without relying on generic wording or guesswork.
            </p>
            <div className="mt-6">
              <WhyLandlordHeaven variant="full" />
            </div>
            <div className="mt-8 text-center">
              <Link href="/wizard?product=notice_only&src=product_page&topic=eviction" className="hero-btn-primary">
                Start your eviction notice pack →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="section-21-vs-section-8" className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-12 text-center lg:text-left">
                  Why choose Notice Only?
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_30px_rgba(105,46,212,0.07)]">
                    <div className="w-14 h-14 bg-white rounded-xl border border-[#E6DBFF] flex items-center justify-center mb-4">
                      <Zap className="w-7 h-7 text-[#692ED4]" />
                    </div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Fast — usually under 10 minutes</h3>
                    <p className="text-gray-700">
                      Answer the questions, preview your documents, and download your pack without waiting days for a solicitor appointment.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_30px_rgba(105,46,212,0.07)]">
                    <div className="w-14 h-14 bg-white rounded-xl border border-[#E6DBFF] flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-7 h-7 text-[#692ED4]" />
                    </div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Official forms</h3>
                    <p className="text-gray-700">
                      Built on the official forms and prescribed notice formats used in England, Wales, and Scotland.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_30px_rgba(105,46,212,0.07)]">
                    <div className="w-14 h-14 bg-white rounded-xl border border-[#E6DBFF] flex items-center justify-center mb-4">
                      <ShieldCheck className="w-7 h-7 text-[#692ED4]" />
                    </div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Compliance checks</h3>
                    <p className="text-gray-700">
                      Ask Heaven flags common blockers such as deposit protection, gas safety, EPC, and How to Rent, so you can spot issues before serving.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_30px_rgba(105,46,212,0.07)]">
                    <div className="w-14 h-14 bg-white rounded-xl border border-[#E6DBFF] flex items-center justify-center mb-4">
                      <BadgePoundSterling className="w-7 h-7 text-[#692ED4]" />
                    </div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">One-time payment</h3>
                    <p className="text-gray-700">
                      {price} covers the full pack. No subscription, no hidden fees, and unlimited regenerations included.
                    </p>
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

      <FAQSection
        title="Notice pack FAQs for landlords"
        faqs={faqs}
        includeSchema={false}
        showContactCTA={false}
        variant="white"
      />

      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-br from-[#692ED4] via-[#7A3BE5] to-[#5a21be] p-8 text-center text-white shadow-[0_22px_60px_rgba(105,46,212,0.35)] md:p-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to serve your eviction notice?</h2>
            <p className="mb-8 text-xl text-white/90">
              Use the correct notice for your situation, preview your documents, and start the eviction process with more confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/wizard?product=notice_only&src=product_page&topic=eviction" className="hero-btn-primary">
                Start your eviction notice pack →
              </Link>
            </div>
            <ul
              className="mt-6 flex flex-col items-center gap-2 text-sm text-white/90 md:flex-row md:justify-center md:gap-6"
              aria-label="Purchase reassurance"
            >
              <li>Preview before paying</li>
              <li>Unlimited regenerations</li>
              <li>Stored for 12+ months</li>
              <li>One-time payment — no subscription</li>
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}
