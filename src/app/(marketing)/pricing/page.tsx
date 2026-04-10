import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { generateMetadata } from "@/lib/seo";
import { FAQSection } from "@/components/seo/FAQSection";
import { StructuredData, pricingItemListSchema } from "@/lib/seo/structured-data";
import { StandardHero } from "@/components/marketing/StandardHero";
import { HeaderConfig } from "@/components/layout/HeaderConfig";
import { LANDLORD_DOCUMENT_PRICE_RANGE } from "@/lib/pricing/products";
import { getDynamicReviewCount, REVIEW_RATING } from "@/lib/reviews/reviewStats";
import {
  PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS,
  RESIDENTIAL_LETTING_PRODUCTS,
  RESIDENTIAL_LETTING_PRICE_RANGE,
  getResidentialLandingHref,
  getResidentialWizardHref,
} from "@/lib/residential-letting/products";
import {
  ENGLAND_POST_MAY_2026_POSITION,
  LANDLORD_HEAVEN_PURPOSE,
} from "@/lib/marketing/landlord-messaging";
import { PRICING_PACKAGE_CARDS, PRICING_SCHEMA_ITEMS } from "@/lib/marketing/pricing-page";

export const metadata: Metadata = generateMetadata({
  title: "Pricing | Eviction, Rent Increase, Money Claim and Tenancy Packs",
  description:
    "Compare eviction, Section 13 rent increase, money claim, and tenancy agreement pricing for landlords using current Landlord Heaven product routes.",
  path: "/pricing",
  keywords: [
    "landlord document pricing",
    "eviction notice cost",
    "section 8 notice price",
    "section 13 price",
    "rent increase pack price",
    "tenancy agreement price",
    "money claim pack price",
    "complete eviction pack",
  ],
});

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
  const reviewCount = getDynamicReviewCount();
  const residentialProducts = PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS.map(
    (sku) => RESIDENTIAL_LETTING_PRODUCTS[sku]
  );

  const pricingSchema = pricingItemListSchema([...PRICING_SCHEMA_ITEMS]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StructuredData data={pricingSchema} />
      <HeaderConfig mode="autoOnScroll" />

      <StandardHero
        badge="Transparent Pricing"
        title="See the price, the route, and what each pack helps you do"
        subtitle="If you need to serve notice, recover rent, raise the rent properly, defend a challenged increase, or put the right tenancy paperwork in place, this page shows the current Landlord Heaven pricing in one place."
        variant="pastel"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/60 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
          <span aria-hidden="true">★★★★★</span>
          <span>{`${REVIEW_RATING}/5 | ${reviewCount} reviews`}</span>
        </div>
        <p className="text-sm text-white">All prices are one-time payments.</p>
        <p className="mt-2 text-sm text-white">
          {LANDLORD_HEAVEN_PURPOSE}
        </p>
        <p className="mt-2 text-sm text-white">
          Notices: England, Wales, and Scotland. Complete Pack, Money Claims, and Section 13 products: England only. Tenancy agreements: UK-wide plus dedicated England Standard, Premium, Student, HMO / Shared House, and Lodger routes below.
        </p>
        <p className="mt-2 text-sm text-white">
          {ENGLAND_POST_MAY_2026_POSITION}
        </p>
      </StandardHero>

      <Container size="large" className="py-12">
        <div className="mb-8 max-w-4xl">
          <h2 className="text-3xl font-bold text-charcoal">Choose the pack that matches the problem in front of you</h2>
          <p className="mt-3 text-base text-gray-700">
            Read this page the same way you would think about the case. If you need possession, start with the eviction products. If the tenant owes you money, move to the money claim route. If you need to increase the rent, use the Section 13 packs. If you are putting a tenancy in place, use the agreement routes.
          </p>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {PRICING_PACKAGE_CARDS.map((card) => (
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
                If you only need one specific agreement or residential document instead of a full pack, these pages let you go straight to the route that fits the property and the tenancy setup.
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
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Many landlords are not trying to replace specialist advice in a genuinely complex case. They are trying to get the right paperwork moving tonight, keep the route clear, and avoid paying solicitor rates just to prepare the first set of documents.
          </p>
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
            answer: "Typical solicitor pricing is often several hundred pounds per case. Many landlords use Landlord Heaven when they want to get the paperwork moving, understand the route, and prepare the documents before deciding whether a solicitor is still needed later.",
          },
          {
            question: "Can I buy another product later?",
            answer: "Yes. You can buy another product whenever your situation changes.",
          },
          {
            question: "Do you list Section 13 pricing here too?",
            answer: "Yes. The pricing page includes both the Standard Section 13 rent increase pack and the Defence Pack, with prices pulled from the same central product pricing used across the site.",
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
              Tell us what has gone wrong with the tenancy, and we will help you narrow the next step in plain English.
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
