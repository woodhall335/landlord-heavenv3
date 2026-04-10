import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { RiCheckboxCircleLine, RiCloseLine, RiAlertLine } from "react-icons/ri";
import { BadgePoundSterling } from "lucide-react";

import { UniversalHero } from "@/components/landing/UniversalHero";
import { HeaderConfig } from "@/components/layout/HeaderConfig";
import { completePackHeroConfig } from "@/components/landing/heroConfigs";
import { StructuredData, productSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { productLinks, toolLinks, blogLinks, landingPageLinks } from "@/lib/seo/internal-links";
import { getCanonicalUrl } from "@/lib/seo";
import { PRODUCTS } from "@/lib/pricing/products";
import { FAQSection } from "@/components/seo/FAQSection";
import {
  WhyLandlordHeaven,
  VsSolicitorComparison,
  VsFreeTemplateComparison,
  WhatsIncludedInteractive,
} from "@/components/value-proposition";
import { getCompletePackPreviewData } from "@/lib/previews/completePackPreviews";
import { Section21ComplianceTimingPanel } from "@/components/products/Section21ComplianceTimingPanel";
import { FunnelProcessSection } from "@/components/funnels";

// Get price from single source of truth
const product = PRODUCTS.complete_pack;
const price = product.displayPrice;

export const metadata: Metadata = {
  title: `Complete Eviction Case Bundle 2026 for England | Court Forms ${price}`,
  description: `Full possession bundle for England landlords with notice-to-court continuity: Form 3A, N5/N119 court forms, evidence checklists, and filing guidance. ${price} one-time.`,
  openGraph: {
    title: `Complete Eviction Case Bundle 2026 for England | Court Forms ${price}`,
    description:
      "Complete possession pack for England landlords. Includes Form 3A, N5, N119, evidence checklists, and court filing guidance.",
    url: getCanonicalUrl("/products/complete-pack"),
  },
  alternates: {
    canonical: getCanonicalUrl("/products/complete-pack"),
  },
};

export const runtime = "nodejs";

// FAQ data for structured data
const faqs = [
  {
    question: "What documents do I get?",
    answer:
      "You receive an England-only case bundle that includes Form 3A, service instructions, a service and validity checklist, N5 and N119 court forms, a filing guide, an evidence checklist, and a proof of service certificate.",
  },
  {
    question: "Can I preview before I pay?",
    answer:
      "Yes. You can preview all documents with a watermark before paying, so you can check everything before you commit.",
  },
  {
    question: "What if I need to make changes?",
    answer:
      "You can edit your answers and regenerate your case bundle instantly at no extra cost. Unlimited regenerations are included.",
  },
  {
    question: "Which region does this pack cover?",
    answer:
      "England only. This pack includes the notice and court forms used for possession claims in England.",
  },
  {
    question: "Are these genuine official court forms?",
    answer:
      "Yes. We use the official HMCTS possession forms for England that apply to the post-1 May 2026 route, including N5 and N119, completed with your case details.",
  },
  {
    question: "How long does the eviction process take?",
    answer:
      "Timelines vary depending on the route and whether the claim is defended. We include England-specific filing and timeline guidance so you have a clearer picture of what usually happens next.",
  },
  {
    question: "How long are documents stored?",
    answer:
      "Your documents are stored in your portal for at least 12 months. You can download and save them at any time.",
  },
  {
    question: "Do you provide legal advice?",
    answer:
      "No. We provide document generation and practical guidance, not legal advice. Ask Heaven helps you understand the process, but it is not a solicitor and does not provide legal representation.",
  },
];

export default async function CompleteEvictionPackPage() {
  const previews = await getCompletePackPreviewData();

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={productSchema({
          name: "Complete Eviction Case Bundle",
          description:
            "Complete possession bundle with the court forms needed from notice through to possession order. Includes Form 3A, N5, N119, and step-by-step guidance.",
          price: product.price.toString(),
          url: "https://landlordheaven.co.uk/products/complete-pack",
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", url: "https://landlordheaven.co.uk" },
          { name: "Products", url: "https://landlordheaven.co.uk/pricing" },
          { name: "Complete Eviction Case Bundle", url: "https://landlordheaven.co.uk/products/complete-pack" },
        ])}
      />

      <UniversalHero {...completePackHeroConfig} showTrustPositioningBar />

      <FunnelProcessSection product="complete_pack" completePackPreviews={previews} />

      <section className="bg-white border-y border-[#EDE2FF]">
        <Container>
          <nav className="flex flex-wrap items-center gap-3 py-4 text-sm" aria-label="Complete Pack quick links">
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
              Start your pack
            </Link>
          </nav>
        </Container>
      </section>

      <section id="who-this-is-for" className="scroll-mt-24 py-10 md:py-14">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">Who this is for</h2>
            <p className="mt-4 text-lg text-gray-700">
              This pack is for landlords whose case is heading towards court and who do not want to piece the paperwork together themselves. It is designed to give you a smoother path from the first notice through to filing.
            </p>
            <ul className="mt-6 grid gap-3 text-gray-700 md:grid-cols-2">
              <li>Your tenant is in arrears or refusing to leave, and you need to move from notice towards court.</li>
              <li>You want the notice, court forms, and evidence guidance together in one pack.</li>
              <li>You want more confidence before filing, without late-night guesswork.</li>
              <li>You want to reduce errors, avoid rework, and keep the case moving.</li>
            </ul>
            <p className="mt-6 text-gray-700">
              This pack is built for landlords who want a fuller, practical eviction solution from the first notice through court preparation, helping reduce the risk of missed forms or filing mistakes once the case becomes more serious.
            </p>
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold text-charcoal">Route timing and compliance still matter</h3>
              <Section21ComplianceTimingPanel />
            </div>
          </div>
        </Container>
      </section>

      <section id="whats-included" className="scroll-mt-24 py-10 md:py-14">
        <Container>
          <div className="mx-auto mb-6 max-w-6xl">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">What's included</h2>
            <p className="mt-3 text-gray-700">
              You get a full England eviction document set: the notice, the core court forms, and filing guidance together in one place, so you can move forward with fewer gaps and less risk of delay.
            </p>
          </div>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <WhatsIncludedInteractive
              product="complete_pack"
              previews={previews}
              titleOverride="What's included in your eviction pack"
              subtitleOverride="England-only pack. Check the route, then preview every document before you file."
            />
          </div>
        </Container>
      </section>

      <section id="start-your-pack" className="scroll-mt-24 py-16 md:py-20">
        <Container>
          <div className="mb-10 flex justify-center">
            <Image
              src="/images/why_this_bundle.webp"
              alt="Why this bundle illustration"
              width={340}
              height={340}
              className="h-auto w-full max-w-[340px] object-contain"
            />
          </div>
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">Start your pack</h2>
            <p className="mt-4 text-gray-700">
              If you need a fuller eviction solution, this is the practical next step. Generate the key documents in one flow and move from problem to action quickly, with the notice, the core court forms, and filing guidance all aligned within one England route.
            </p>
            <div className="mt-6">
              <WhyLandlordHeaven variant="full" />
            </div>
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="scroll-mt-24 py-16 md:py-20 bg-[#F3EEFF]">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">How it works</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#F3EEFF] p-5">
                <h3 className="font-semibold">1) Tell us what has happened</h3>
                <p className="mt-2 text-sm text-gray-700">
                  We shape the pack around the route your case actually needs.
                </p>
              </div>
              <div className="rounded-2xl bg-[#F3EEFF] p-5">
                <h3 className="font-semibold">2) Answer plain-English questions</h3>
                <p className="mt-2 text-sm text-gray-700">
                  We collect the details needed for the notice, court forms, and supporting documents.
                </p>
              </div>
              <div className="rounded-2xl bg-[#F3EEFF] p-5">
                <h3 className="font-semibold">3) Preview, generate, and file</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Check everything, download your pack, and use the filing guidance to keep moving.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/wizard?product=complete_pack&src=product_page&topic=eviction"
              className="hero-btn-primary"
            >
              Start your court pack -&gt;
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-10">
            <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-8 text-center lg:text-left">
              How We Compare
            </h2>
            <div className="space-y-8">
              <VsSolicitorComparison product="complete_pack" />
              <VsFreeTemplateComparison product="complete_pack" />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-12 text-center">
              Typical Eviction Timeline
            </h2>
            <p className="text-center text-gray-600 mb-12">
              England-only timeline guidance. Actual timings vary depending on the route, court capacity, and whether the claim is defended.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#692ED4] font-bold border border-[#E6DBFF]">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Serve notice (Day 0)</h3>
                  <p className="text-gray-600">
                    Deliver the possession notice to the tenant. The notice period depends on the route and the grounds you are relying on.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#692ED4] font-bold border border-[#E6DBFF]">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">File with the court (after the notice period ends)</h3>
                  <p className="text-gray-600">
                    Submit the claim through the appropriate England County Court route after the notice expires. Rent-only arrears claims may use PCOL, while other possession claims use N5 and N119 with the court fee.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#692ED4] font-bold border border-[#E6DBFF]">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Hearing (often 4-12 weeks later)</h3>
                  <p className="text-gray-600">
                    Attend the possession hearing and bring your evidence, such as the tenancy agreement, notice, and arrears statement. The judge reviews the case and decides whether to make a possession order.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#692ED4] font-bold border border-[#E6DBFF]">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Enforcement (if needed)</h3>
                  <p className="text-gray-600">
                    If the tenant does not leave by the date in the order, you can apply for a warrant of possession. Bailiffs then arrange the eviction.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
              <div className="flex items-start gap-3">
                <RiAlertLine className="h-6 w-6 shrink-0 text-[#692ED4]" />
                <div>
                  <h4 className="font-semibold text-charcoal mb-2">Timeline estimates</h4>
                  <p className="text-gray-700">
                    <strong>England:</strong> straightforward possession cases often take around 3-6 months, while defended claims can take longer.
                    <br />
                    These are only estimates. Actual timelines depend on court backlogs, the route chosen, and whether the claim is defended.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-5xl mx-auto rounded-3xl border border-[#E6DBFF] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-10">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              Complete Pack vs Notice Only
            </h2>
            <p className="text-center text-gray-600 mb-12">Which option is right for you?</p>

            <div className="overflow-x-auto">
              <table className="w-full overflow-hidden rounded-2xl border border-[#E6DBFF] bg-white">
                <thead className="bg-[#F3EEFF]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal border-b border-gray-200">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-charcoal border-b border-gray-200">
                      Notice Only
                      <br />
                      {PRODUCTS.notice_only.displayPrice}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#692ED4] border-b border-[#E6DBFF] bg-[#F3EEFF]">
                      Complete Pack
                      <br />
                      {price}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Eviction notice</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                      Service instructions + checklist
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">County Court forms (N5, N119)</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">AI witness statement</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Court filing guide</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Evidence checklist</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Proof of service certificate</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-charcoal">Best for</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Simpler cases, early-stage action, or landlords who want to start with the notice
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-primary bg-[#F3EEFF]">
                      Landlords preparing for court who want a more complete DIY solution
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
                Get Complete Eviction Case Bundle - {price} ?
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 bg-[#F3EEFF]">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_28px_rgba(105,46,212,0.1)] md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E6DBFF] bg-[#F3EEFF]">
                  <BadgePoundSterling className="h-6 w-6 text-[#692ED4]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-charcoal mb-2">
                    Also need to recover unpaid rent?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Eviction helps you recover possession, but if your tenant also owes rent arrears, you may want to pursue a money claim as well. Many landlords do both: eviction for possession and a money claim to recover what they are owed.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/wizard?product=money_claim&src=complete_pack_crosssell"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#692ED4] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#5a21be]"
                    >
                      Get Money Claim Pack — {PRODUCTS.money_claim.displayPrice}
                    </Link>
                    <Link
                      href="/money-claim-unpaid-rent"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CDB8F6] px-5 py-2.5 font-medium text-[#692ED4] transition-colors hover:bg-[#F3EEFF]"
                    >
                      Learn about money claims ?
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection
        title="FAQs For Landlords"
        faqs={faqs}
        showContactCTA={false}
        variant="white"
      />

      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <RelatedLinks
              title="Related Resources"
              links={[
                productLinks.noticeOnly,
                productLinks.moneyClaim,
                toolLinks.section8Generator,
                blogLinks.evictionTimeline,
                landingPageLinks.section8Template,
              ]}
            />
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-br from-[#692ED4] via-[#7A3BE5] to-[#5a21be] p-8 text-center text-white shadow-[0_24px_60px_rgba(105,46,212,0.35)] md:p-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to start your complete eviction pack?</h2>
            <p className="mb-8 text-xl text-white/90">
              If you need the notice, the court forms, and the filing guidance working together, this is the fastest practical next step.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wizard?product=complete_pack&src=product_page&topic=eviction"
                className="hero-btn-primary"
              >
                Start your court pack - {price} -&gt;
              </Link>
              <Link href="/products/notice-only" className="hero-btn-secondary">
                Only need the notice? - {PRODUCTS.notice_only.displayPrice}
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/80">
              One-time payment - Unlimited regenerations - No subscription
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
