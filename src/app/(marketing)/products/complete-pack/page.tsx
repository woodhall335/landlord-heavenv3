import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { RiCheckboxCircleLine, RiCloseLine, RiAlertLine } from "react-icons/ri";
import {
  ScrollText,
  BadgePoundSterling,
} from "lucide-react";
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
  JurisdictionAccordion,
  VsSolicitorComparison,
  VsFreeTemplateComparison,
  WhatsIncludedInteractive,
} from "@/components/value-proposition";
import { getCompletePackPreviewData } from "@/lib/previews/completePackPreviews";

// Get price from single source of truth
const product = PRODUCTS.complete_pack;
const price = product.displayPrice;

export const metadata: Metadata = {
  title: `Complete Eviction Case Bundle 2026 for England | Court Forms ${price}`,
  description:
    `Full eviction bundle for England landlords: Section 21/8 notice, N5/N119 court forms, and AI witness statement. ${price} one-time.`,
  openGraph: {
    title: `Complete Eviction Case Bundle 2026 for England | Court Forms ${price}`,
    description: "Complete eviction pack for England landlords. Notice to possession order with N5, N119, witness statement, and court filing guidance included.",
    url: getCanonicalUrl('/products/complete-pack'),
  },
  alternates: {
    canonical: getCanonicalUrl('/products/complete-pack'),
  },
};

export const runtime = 'nodejs';

// FAQ data for structured data
const faqs = [
  {
    question: "What documents do I get?",
    answer: "You receive an England-only case bundle: Section 21 or Section 8 notice, Service Instructions, Service & Validity Checklist, Court Forms (N5/N5B/N119 route as applicable), AI witness statement draft, Filing Guide, Evidence Checklist, and Proof of Service Certificate."
  },
  {
    question: "Can I preview before I pay?",
    answer: "Yes. You can preview all documents with a watermark before paying. This lets you verify everything is correct before committing."
  },
  {
    question: "What if I need to make changes?",
    answer: "You can edit your answers and regenerate your case bundle instantly at no extra cost. Unlimited regenerations are included."
  },
  {
    question: "Which jurisdictions do you support?",
    answer: "England only. This pack includes Section 21/Section 8 notices plus N5, N119, N5B court forms for English courts."
  },
  {
    question: "Are these genuine official court forms?",
    answer: "Yes. We use official HMCTS forms (N5, N5B, N119) for England County Court routes. These are the same forms you'd download from government sources, populated with your case details."
  },
  {
    question: "How long does the eviction process take?",
    answer: "Timelines vary by route and whether the claim is defended. We include England-specific filing and timeline guidance for Section 21 and Section 8 routes."
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

export default async function CompleteEvictionPackPage() {
  const previews = await getCompletePackPreviewData();

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      {/* Structured Data for SEO */}
      <StructuredData data={productSchema({
        name: "Complete Eviction Case Bundle",
        description: "Complete eviction bundle with all court forms from notice to possession order. Includes N5, N119 forms, AI-drafted witness statements, and step-by-step guidance.",
        price: product.price.toString(),
        url: "https://landlordheaven.co.uk/products/complete-pack"
      })} />
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://landlordheaven.co.uk" },
        { name: "Products", url: "https://landlordheaven.co.uk/pricing" },
        { name: "Complete Eviction Case Bundle", url: "https://landlordheaven.co.uk/products/complete-pack" }
      ])} />

      {/* Hero Section */}
      <UniversalHero {...completePackHeroConfig} showTrustPositioningBar />


      <section className="py-10 md:py-14">
        <Container>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <WhatsIncludedInteractive product="complete_pack" previews={previews} />
          </div>
        </Container>
      </section>

      <section className="bg-[#fcfaff] py-10"><Container><div className="mx-auto max-w-4xl rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] px-6 py-5 text-center shadow-[0_10px_30px_rgba(105,46,212,0.08)]"><p className="text-center font-medium text-gray-700">These are example previews. Your bundle is generated specifically for your jurisdiction and tenancy details.</p></div></Container></section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#E6DBFF] bg-white p-8 text-center shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-10">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Eviction Pack Timeline & Costs
            </h2>
            <p className="text-gray-600 mb-12">
              Plan your eviction steps, budget for court fees, and keep the process moving with the
              correct documents from day one.
            </p>
            <div className="grid gap-6 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_28px_rgba(105,46,212,0.08)]">
                <h3 className="font-semibold text-gray-900 mb-3">Typical timeline</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Notice period: 2 weeks to 2 months.</li>
                  <li>Court claim: 4–10 weeks to hearing/order.</li>
                  <li>Bailiff stage (if needed): 2–6 weeks.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_28px_rgba(105,46,212,0.08)]">
                <h3 className="font-semibold text-gray-900 mb-3">Costs to expect</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Court fees vary by claim route.</li>
                  <li>Solicitor fees often run £1,500+.</li>
                  <li>Pack keeps documents compliant to avoid re-filing.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6 shadow-[0_12px_28px_rgba(105,46,212,0.08)]">
                <h3 className="font-semibold text-gray-900 mb-3">Next legal steps</h3>
                <p className="text-sm text-gray-600 mb-3">
                  After the notice expires, file the correct court or tribunal claim promptly to
                  prevent the notice from expiring.
                </p>
                <Link href="/how-to-evict-tenant" className="text-primary text-sm font-medium hover:underline">
                  View the eviction process →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Jurisdiction Accordion */}
      <section className="py-10">
        <Container>
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#E6DBFF] bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)] md:p-6">
            <JurisdictionAccordion product="complete_pack" defaultExpanded={true} />
          </div>
        </Container>
      </section>

      {/* AI Witness Statement Feature */}
      <section className="py-16 md:py-20 bg-[#F3EEFF]">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-[#E6DBFF] bg-white">
                <ScrollText className="h-8 w-8 text-[#692ED4]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                AI Witness Statement (Included)
              </h2>
              <p className="text-xl text-gray-700">
                Professional witness statement drafted by Ask Heaven
              </p>
            </div>

            <div className="mx-auto max-w-xl rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_14px_36px_rgba(105,46,212,0.12)]">
              <p className="text-gray-700 mb-4">
                Ask Heaven analyzes your case details and drafts a professional witness statement for court proceedings:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#692ED4]">✓</span>
                  <span>Chronological timeline of events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#692ED4]">✓</span>
                  <span>Legal formatting and structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#692ED4]">✓</span>
                  <span>Ground-specific evidence references</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#692ED4]">✓</span>
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
            <WhyLandlordHeaven variant="full" />
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-[#F3EEFF]">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 text-center text-3xl font-bold text-charcoal md:text-5xl">How It Works</h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 text-center shadow-[0_10px_26px_rgba(105,46,212,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#692ED4] text-2xl font-bold text-white">
                  1
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Describe Your Case</h3>
                <p className="text-gray-600">
                  Tell us about your tenancy, the issue, and what&apos;s happened. Ask Heaven helps you choose the right route.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 text-center shadow-[0_10px_26px_rgba(105,46,212,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#692ED4] text-2xl font-bold text-white">
                  2
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Preview Your Pack</h3>
                <p className="text-gray-600">
                  Review all documents with watermarked previews. Edit answers and regenerate until you&apos;re satisfied.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 text-center shadow-[0_10px_26px_rgba(105,46,212,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#692ED4] text-2xl font-bold text-white">
                  3
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Download &amp; File</h3>
                <p className="text-gray-600">
                  Pay once, download your complete pack. Follow the filing guide to submit to court or tribunal.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6 text-center shadow-[0_10px_26px_rgba(105,46,212,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#692ED4] text-2xl font-bold text-white">
                  4
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">Follow the Process</h3>
                <p className="text-gray-600">
                  Use our guides to navigate hearings and enforcement. Regenerate your case bundle if your case changes.
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

      {/* Eviction Timeline */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-12 text-center">
              Typical Eviction Timeline
            </h2>
            <p className="text-center text-gray-600 mb-12">
              England-only timeline guidance. Actual timings vary by route, court capacity, and whether the claim is defended.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#692ED4] font-bold border border-[#E6DBFF]">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Serve Notice (Day 0)</h3>
                  <p className="text-gray-600">
                    Deliver the England possession notice to the tenant. Notice periods depend on route and grounds (for example Section 8 arrears routes vs Section 21).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#692ED4] font-bold border border-[#E6DBFF]">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">File with Court/Tribunal (After Notice Period)</h3>
                  <p className="text-gray-600">
                    Submit the relevant England County Court forms (N5/N119 or N5B) with the court fee. The court issues the claim and serves the tenant.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#692ED4] font-bold border border-[#E6DBFF]">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Hearing (4-12 weeks later)</h3>
                  <p className="text-gray-600">
                    Attend possession hearing. Bring all evidence (tenancy agreement, notice, arrears statement). Judge reviews case and issues possession order.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#692ED4] font-bold border border-[#E6DBFF]">
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

            <div className="mt-8 rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-6">
              <div className="flex items-start gap-3">
                <RiAlertLine className="h-6 w-6 shrink-0 text-[#692ED4]" />
                <div>
                  <h4 className="font-semibold text-charcoal mb-2">Timeline Estimates</h4>
                  <p className="text-gray-700">
                    <strong>England:</strong> often 3-6 months for straightforward possession routes; defended claims can take longer.<br />
                    These are estimates. Actual timelines depend on court backlogs, route selection, and whether the claim is defended.
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
                      Notice Only<br />{PRODUCTS.notice_only.displayPrice}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#692ED4] border-b border-[#E6DBFF] bg-[#F3EEFF]">
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
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Service Instructions + Checklist</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">County Court Forms (N5, N5B, N119)</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">AI Witness Statement</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Court/Tribunal Filing Guide</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Evidence Collection Checklist</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">Proof of Service Certificate</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100 bg-[#F3EEFF]">
                      <RiCheckboxCircleLine className="mx-auto h-5 w-5 text-[#692ED4]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-charcoal">Best For</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Testing the waters, simple cases, want notice first
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-primary bg-[#F3EEFF]">
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
                Get Complete Eviction Case Bundle - {price} →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Cross-sell: Money Claim for Rent Arrears Recovery */}
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
                    Eviction gets you possession — but if your tenant owes rent arrears, you may also want to
                    pursue a money claim. Many landlords do both: eviction for possession AND a money claim to
                    recover what they&apos;re owed.
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
                      Learn about money claims →
                    </Link>
                  </div>
                </div>
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
      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-br from-[#692ED4] via-[#7A3BE5] to-[#5a21be] p-8 text-center text-white shadow-[0_24px_60px_rgba(105,46,212,0.35)] md:p-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Start Your Eviction?</h2>
            <p className="mb-8 text-xl text-white/90">
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
            <p className="mt-4 text-sm text-white/80">
              One-time payment • Unlimited regenerations • No subscription
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
