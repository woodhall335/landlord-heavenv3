import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { generateMetadata } from "@/lib/seo";
import { FAQSection } from "@/components/seo/FAQSection";
import { StructuredData, pricingItemListSchema } from "@/lib/seo/structured-data";
import { StandardHero } from "@/components/marketing/StandardHero";
import { HeaderConfig } from "@/components/layout/HeaderConfig";
import { LANDLORD_DOCUMENT_PRICE_RANGE, PRODUCTS } from "@/lib/pricing/products";
import {
  PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS,
  RESIDENTIAL_LETTING_PRODUCTS,
  RESIDENTIAL_LETTING_PRICE_RANGE,
  getResidentialLandingHref,
  getResidentialWizardHref,
} from "@/lib/residential-letting/products";

export const metadata: Metadata = generateMetadata({
  title: "Pricing | UK Eviction and Landlord Document Packs",
  description:
    "Compare eviction notice, money claim, tenancy agreement, and complete pack pricing for UK landlords.",
  path: "/pricing",
  keywords: [
    "landlord document pricing",
    "eviction notice cost",
    "section 8 notice price",
    "tenancy agreement price",
    "money claim pack price",
    "complete eviction pack",
  ],
});

type PackageCard = {
  name: string;
  price: string;
  coverage: string;
  bestFor: string;
  points: string[];
  href: string;
  cta: string;
  featured?: boolean;
};

const packageCards: PackageCard[] = [
  {
    name: "Eviction Notice Pack",
    price: PRODUCTS.notice_only.displayPrice,
    coverage: "England, Wales, and Scotland",
    bestFor: "You need the right notice in place tonight.",
    points: [
      "Notice pack, service instructions, and validity checklist",
      "Preview before you pay",
      "Useful when you need to start the case without paying for court paperwork yet",
    ],
    href: "/wizard?product=notice_only&src=pricing&topic=eviction",
    cta: "Find out which notice you need →",
  },
  {
    name: "Complete Pack",
    price: PRODUCTS.complete_pack.displayPrice,
    coverage: "England only",
    bestFor: "You need the notice, court forms, and filing guidance together.",
    points: [
      "Built for landlords already thinking about court",
      "Includes the notice, core court forms, and filing guidance",
      "Helps you avoid piecing the case together across multiple documents",
    ],
    href: "/wizard?product=complete_pack&src=pricing&topic=eviction",
    cta: "Start your court pack →",
    featured: true,
  },
  {
    name: "Money Claim Pack",
    price: PRODUCTS.money_claim.displayPrice,
    coverage: "England only",
    bestFor: "You need to recover unpaid rent.",
    points: [
      "Built for unpaid rent and arrears claims",
      "Includes claim paperwork and arrears support documents",
      "Useful when the property issue and the money issue need separate action",
    ],
    href: "/wizard?product=money_claim&src=pricing&topic=arrears",
    cta: "Start recovering your rent →",
  },
  {
    name: "Standard Tenancy Agreement",
    price: PRODUCTS.ast_standard.displayPrice,
    coverage: "UK-wide ordinary residential route",
    bestFor: "You need the baseline agreement for a straightforward whole-property let.",
    points: [
      "Built around where the property is",
      "England wording updated for the law from 1 May 2026",
      "Best for most ordinary residential lets",
    ],
    href: "/wizard?product=ast_standard&src=pricing&topic=tenancy",
    cta: "Create your tenancy agreement →",
  },
  {
    name: "Premium Tenancy Agreement",
    price: PRODUCTS.ast_premium.displayPrice,
    coverage: "UK-wide ordinary residential premium route",
    bestFor: "You need fuller drafting and extra management detail for an ordinary residential let.",
    points: [
      "Designed for ordinary residential lets that need more detail than Standard",
      "Adds broader drafting and extra support documents",
      "England specialist Student, HMO / Shared House, and Lodger products are listed below",
    ],
    href: "/wizard?product=ast_premium&src=pricing&topic=tenancy",
    cta: "See the premium agreement →",
  },
];

const solicitorComparison = [
  {
    label: "Typical cost",
    solicitor: "Often GBP300-GBP2,500+",
    heaven: LANDLORD_DOCUMENT_PRICE_RANGE,
  },
  {
    label: "Speed",
    solicitor: "Usually days or weeks",
    heaven: "Usually minutes",
  },
  {
    label: "Preview before payment",
    solicitor: "Rare",
    heaven: "Yes",
  },
  {
    label: "Make changes and regenerate",
    solicitor: "Usually extra time and extra cost",
    heaven: "Included",
  },
  {
    label: "Keep documents in one account",
    solicitor: "Varies",
    heaven: "Yes",
  },
];

export default function PricingPage() {
  const residentialProducts = PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS.map(
    (sku) => RESIDENTIAL_LETTING_PRODUCTS[sku]
  );

  const pricingSchema = pricingItemListSchema([
    { sku: "notice_only", name: "Eviction Notice Pack", url: "/products/notice-only" },
    { sku: "complete_pack", name: "Complete Eviction Pack", url: "/products/complete-pack" },
    { sku: "money_claim", name: "Money Claim Pack", url: "/products/money-claim" },
    { sku: "ast_standard", name: "Standard Residential Tenancy Agreement", url: "/products/ast" },
    { sku: "ast_premium", name: "Premium Residential Tenancy Agreement", url: "/products/ast" },
    { sku: "england_standard_tenancy_agreement", name: "England Standard Tenancy Agreement", url: "/standard-tenancy-agreement" },
    { sku: "england_premium_tenancy_agreement", name: "England Premium Tenancy Agreement", url: "/premium-tenancy-agreement" },
    { sku: "england_student_tenancy_agreement", name: "England Student Tenancy Agreement", url: "/student-tenancy-agreement" },
    { sku: "england_hmo_shared_house_tenancy_agreement", name: "England HMO / Shared House Tenancy Agreement", url: "/hmo-shared-house-tenancy-agreement" },
    { sku: "england_lodger_agreement", name: "England Lodger Agreement", url: "/lodger-agreement" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StructuredData data={pricingSchema} />
      <HeaderConfig mode="autoOnScroll" />

      <StandardHero
        badge="Transparent Pricing"
        title="See what each pack costs before you commit"
        subtitle="Compare the packs side by side, see what each one includes, and choose the one that fits your problem tonight."
        variant="pastel"
      >
        <p className="text-sm text-white">All prices are one-time payments</p>
        <p className="mt-2 text-sm text-white">
          Notices: England, Wales, and Scotland. Complete Pack and Money Claims: England only. Tenancy agreements: UK-wide plus dedicated England Standard, Premium, Student, HMO / Shared House, and Lodger routes below.
        </p>
      </StandardHero>

      <Container size="large" className="py-12">
        <div className="grid gap-6 xl:grid-cols-2">
          {packageCards.map((card) => (
            <section
              key={card.name}
              className={`rounded-2xl border p-6 shadow-sm ${card.featured ? "border-primary bg-[#faf6ff]" : "border-gray-200 bg-white"}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal">{card.name}</h2>
                  <p className="mt-2 text-sm font-semibold text-primary">{card.coverage}</p>
                </div>
                <div className="rounded-xl bg-gray-100 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.12em] text-gray-500">One-time</div>
                  <div className="text-2xl font-bold text-charcoal">{card.price}</div>
                </div>
              </div>

              <p className="mt-5 text-base font-semibold text-charcoal">{card.bestFor}</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="mt-6">
                <Link href={card.href} className="hero-btn-primary inline-flex w-full justify-center sm:w-auto">
                  {card.cta}
                </Link>
              </div>
            </section>
          ))}
        </div>
      </Container>

      <Container size="large" className="pb-12">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-charcoal">Residential landlord documents</h2>
              <p className="mt-2 max-w-3xl text-sm text-gray-600">
                Need one specific residential document instead of a full pack? These pages include the new dedicated England tenancy routes alongside other standalone residential documents.
              </p>
            </div>
            <p className="text-sm text-gray-500">Per-document pricing {RESIDENTIAL_LETTING_PRICE_RANGE}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {residentialProducts.map((product) => (
              <div key={product.sku} className="rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal">{product.label}</h3>
                    <p className="mt-2 text-sm text-gray-600">{product.description}</p>
                  </div>
                  <div className="whitespace-nowrap text-lg font-bold text-primary">{product.displayPrice}</div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link href={getResidentialLandingHref(product.sku)} className="hero-btn-secondary flex-1 text-center">
                    View page
                  </Link>
                  <Link href={getResidentialWizardHref(product.sku)} className="hero-btn-primary flex-1 text-center">
                    Start now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      <Container size="large" className="pb-12">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-charcoal">Why landlords compare us with a solicitor</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Metric</th>
                  <th className="py-3 text-center">Solicitor</th>
                  <th className="py-3 text-center">Landlord Heaven</th>
                </tr>
              </thead>
              <tbody>
                {solicitorComparison.map((row) => (
                  <tr key={row.label} className="border-b last:border-b-0">
                    <td className="py-3 text-gray-700">{row.label}</td>
                    <td className="py-3 text-center text-gray-600">{row.solicitor}</td>
                    <td className="py-3 text-center font-medium text-charcoal">{row.heaven}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Container>

      <FAQSection
        title="Pricing FAQs"
        faqs={[
          {
            question: "Are there any hidden fees?",
            answer: "No. The price shown is the price you pay. Court fees are separate and are paid directly to the court when you file.",
          },
          {
            question: "What is your refund policy?",
            answer: (
              <>
                These are instant digital products, so refunds are not available once documents have been generated and delivered. Refunds are only available for technical errors, duplicate charges, or unauthorised transactions. See our <Link href="/refunds" className="text-primary hover:underline">full refund policy</Link> for details.
              </>
            ),
          },
          {
            question: "Do you offer discounts for multiple documents?",
            answer: "If you need multiple documents each month, contact sales@landlordheaven.co.uk for volume pricing.",
          },
          {
            question: "How much do solicitors charge for similar work?",
            answer: "Typical solicitor pricing is often several hundred pounds per case. That is why many landlords use Landlord Heaven when they want to get the paperwork moving without paying solicitor rates upfront.",
          },
          {
            question: "Can I buy another product later?",
            answer: "Yes. You can buy another product whenever your situation changes.",
          },
        ]}
        showContactCTA={false}
        variant="white"
      />

      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Still not sure which pack fits?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Tell us what has gone wrong, and we will help you narrow the next step.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contact" className="hero-btn-primary">
                Contact support →
              </Link>
              <Link href="/help" className="hero-btn-secondary">
                Browse the help centre →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">Quick response | Straight answers | No obligation</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
