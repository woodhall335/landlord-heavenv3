import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { RiCheckboxCircleLine } from "react-icons/ri";
import {
  Home,
  GraduationCap,
  Briefcase,
  BadgePoundSterling,
  FileText,
  List,
  Shield,
  CheckCircle,
} from "lucide-react";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { productLinks, toolLinks, landingPageLinks } from "@/lib/seo/internal-links";
import { StructuredData, productSchema, breadcrumbSchema, faqPageSchema } from "@/lib/seo/structured-data";
import { getCanonicalUrl } from "@/lib/seo";
import { PRODUCTS } from "@/lib/pricing/products";
import { FAQSection } from "@/components/seo/FAQSection";
import {
  WhyLandlordHeaven,
  VsSolicitorComparison,
} from "@/components/value-proposition";
import { UniversalHero } from "@/components/landing/UniversalHero";
import { HeaderConfig } from "@/components/layout/HeaderConfig";
import { astHeroConfig } from "@/components/landing/heroConfigs";

// Get prices from single source of truth
const standardPrice = PRODUCTS.ast_standard.displayPrice;
const premiumPrice = PRODUCTS.ast_premium.displayPrice;

export const metadata: Metadata = {
  title: `Tenancy Agreement Template Pack 2026 | UK Jurisdictions | From ${standardPrice}`,
  description:
    `Jurisdiction-specific tenancy agreement template pack: AST (England), Occupation Contract (Wales), PRT (Scotland), and NI private tenancy. Compliance checklist included. From ${standardPrice}.`,
  openGraph: {
    title: `Tenancy Agreement Pack 2026 | England, Wales, Scotland & NI | From ${standardPrice}`,
    description:
      "Jurisdiction-specific tenancy agreement templates: AST, Occupation Contract, PRT, and NI private tenancy. Compliance checklist included. Preview before purchase.",
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
    question: "What's the difference between Standard and Premium?",
    answer: "Standard includes core tenancy clauses suitable for single households. Premium adds HMO-specific clauses (joint & several liability, shared facilities rules, tenant replacement), guarantor provisions, rent review mechanisms, and anti-subletting terms - ideal for multi-tenant properties, student lets, or professional landlords."
  },
  {
    question: "Which agreement type do I get for my region?",
    answer: "The wizard generates the correct legal format automatically: AST (Assured Shorthold Tenancy) for England, Standard Occupation Contract for Wales, PRT (Private Residential Tenancy) for Scotland, and Private Tenancy for Northern Ireland. All comply with their respective housing legislation."
  },
  {
    question: "Do I need Premium for an HMO?",
    answer: "If you're letting to 3+ unrelated tenants sharing facilities, Premium is recommended. It includes clauses commonly required under HMO licensing (Housing Act 2004 for England, equivalent legislation for other regions): joint & several liability, shared facilities rules, and terms aligned with licence conditions."
  },
  {
    question: "Can I preview before I pay?",
    answer: "Yes. You can preview your agreement with a watermark before paying. This lets you verify the clauses and property details are correct before committing."
  },
  {
    question: "What if I need to make changes?",
    answer: "You can edit your answers and regenerate instantly at no extra cost. Unlimited regenerations are included."
  },
  {
    question: "How long are documents stored?",
    answer: "Documents are stored in your portal for at least 12 months. You can download and save them any time."
  },
  {
    question: "Is this legally valid?",
    answer: "Yes. Both Standard and Premium are legally valid tenancy agreements compliant with current housing legislation. However, for complex situations (commercial mixed-use, unusual property types), consult a solicitor."
  },
  {
    question: "What about pets, break clauses, and guarantors?",
    answer: "Pets clauses and break clauses are included in both tiers. Guarantor clauses with clear liability terms are Premium-only, as they require more sophisticated legal drafting."
  }
];

export default function ASTPage() {
  const regionCards = [
    {
      flagSrc: "/gb-eng.svg",
      flagAlt: "England flag",
      name: "England",
      agreementType: "Assured Shorthold Tenancy (AST)",
      features: [
        "Compliant with Housing Act 1988",
        "Deposit protection requirements included",
        "How to Rent Guide acknowledgement",
        "Section 21/8 grounds referenced",
      ],
      noteLabel: "HMO note:",
      note: "Properties with 5+ people from 2+ households require mandatory HMO licensing under Housing Act 2004.",
      href: "/wizard?product=tenancy_agreement&jurisdiction=england",
    },
    {
      flagSrc: "/gb-wls.svg",
      flagAlt: "Wales flag",
      name: "Wales",
      agreementType: "Standard Occupation Contract",
      features: [
        "Compliant with Renting Homes (Wales) Act 2016",
        'Uses "Contract Holder" terminology',
        "Rent Smart Wales registration referenced",
        "Section 173 notice provisions",
      ],
      noteLabel: "Note:",
      note: "Wales uses Occupation Contracts, not ASTs. Different eviction procedures apply.",
      href: "/wizard?product=tenancy_agreement&jurisdiction=wales",
    },
    {
      flagSrc: "/gb-sct.svg",
      flagAlt: "Scotland flag",
      name: "Scotland",
      agreementType: "Private Residential Tenancy (PRT)",
      features: [
        "Compliant with Private Housing (Tenancies) (Scotland) Act 2016",
        "Open-ended tenancy (no fixed end date)",
        "Rent Pressure Zone compatible",
        "First-tier Tribunal jurisdiction",
      ],
      noteLabel: "Key difference:",
      note: "PRTs are open-ended. Tenants can give 28 days' notice at any time.",
      href: "/wizard?product=tenancy_agreement&jurisdiction=scotland",
    },
    {
      flagSrc: "/gb-nir.svg",
      flagAlt: "Northern Ireland flag",
      name: "Northern Ireland",
      agreementType: "Private Tenancy",
      features: [
        "Compliant with Private Tenancies Act (NI) 2022",
        "Rent increase restrictions (12-month gap)",
        "Electrical safety mandatory from April 2025",
        "County Court Northern Ireland jurisdiction",
      ],
      noteLabel: "Note:",
      note: "Tenancy deposit protection and Energy Performance Certificates required.",
      href: "/wizard?product=tenancy_agreement&jurisdiction=northern-ireland",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderConfig mode="autoOnScroll" />
      {/* Structured Data for SEO */}
      <StructuredData data={productSchema({
        name: "Tenancy Agreements - AST, PRT, Occupation Contract, NI",
        description: "Legally compliant tenancy agreements for UK landlords. Covers Assured Shorthold Tenancies (England), Occupation Contracts (Wales), Private Residential Tenancies (Scotland), and Northern Ireland tenancies.",
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
      <UniversalHero {...astHeroConfig} showTrustPositioningBar />


      {/* What's Included in This Agreement - Integration Layer Disclosure */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              What&apos;s Included in This Agreement
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Every tenancy agreement pack includes the main contract, embedded schedules, inventory, and compliance guidance
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Standard Tier */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-charcoal">Standard - {standardPrice}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    Single Households
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Agreement */}
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Jurisdiction-Specific Agreement</p>
                      <p className="text-sm text-gray-500">AST, Occupation Contract, PRT, or NI Tenancy</p>
                    </div>
                  </div>

                  {/* Schedules */}
                  <div className="flex items-start gap-3">
                    <List className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Embedded Schedules</p>
                      <p className="text-sm text-gray-500">Property, Rent, Utilities, Inventory, House Rules</p>
                    </div>
                  </div>

                  {/* Inventory - Standard */}
                  <div className="flex items-start gap-3">
                    <RiCheckboxCircleLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Inventory &amp; Schedule of Condition</p>
                      <span className="inline-flex items-center gap-1 text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-1">
                        <FileText className="w-3 h-3" /> Blank template (ready to complete)
                      </span>
                    </div>
                  </div>

                  {/* Compliance Checklist */}
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Pre-Tenancy Compliance Checklist</p>
                      <p className="text-sm text-gray-500">Jurisdiction-specific, non-contractual guidance</p>
                    </div>
                  </div>

                  {/* Signature Blocks */}
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Signature Blocks</p>
                      <p className="text-sm text-gray-500">Landlord &amp; tenant signature sections</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/wizard?product=ast_standard&src=product_page&topic=tenancy"
                  className="mt-6 block w-full py-3 border-2 border-primary text-primary font-semibold rounded-lg text-center hover:bg-primary hover:text-white transition-colors"
                >
                  Get Standard - {standardPrice}
                </Link>
              </div>

              {/* Premium Tier */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-primary relative">
                <div className="absolute -top-3 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  HMO READY
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-charcoal">Premium - {premiumPrice}</h3>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                    Multi-Tenant
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Agreement */}
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">HMO-Specific Agreement</p>
                      <p className="text-sm text-gray-500">All standard terms plus HMO clauses</p>
                    </div>
                  </div>

                  {/* Schedules */}
                  <div className="flex items-start gap-3">
                    <List className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Embedded Schedules</p>
                      <p className="text-sm text-gray-500">Property, Rent, Utilities, Inventory, House Rules</p>
                    </div>
                  </div>

                  {/* Inventory - Premium */}
                  <div className="flex items-start gap-3">
                    <RiCheckboxCircleLine className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Inventory &amp; Schedule of Condition</p>
                      <span className="inline-flex items-center gap-1 text-sm text-purple-700 bg-purple-100 px-2 py-0.5 rounded mt-1">
                        <CheckCircle className="w-3 h-3" /> Wizard-completed (rooms, items, conditions)
                      </span>
                    </div>
                  </div>

                  {/* Compliance Checklist */}
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Pre-Tenancy Compliance Checklist</p>
                      <p className="text-sm text-gray-500">Jurisdiction-specific, non-contractual guidance</p>
                    </div>
                  </div>

                  {/* Premium-only features */}
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Premium Clauses</p>
                      <p className="text-sm text-gray-500">Guarantor, late payment, rent review, anti-subletting</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/wizard?product=ast_premium&src=product_page&topic=tenancy"
                  className="mt-6 block w-full py-3 bg-primary text-white font-semibold rounded-lg text-center hover:bg-primary/90 transition-colors"
                >
                  Get Premium - {premiumPrice}
                </Link>
              </div>
            </div>

            {/* Key difference callout */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-900">
                <strong>Key Difference:</strong> Premium includes wizard-completed inventory. Standard includes a blank template for you to complete manually at check-in.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Tenancy Agreement Compliance Checklist
            </h2>
            <p className="text-gray-600 mb-12">
              Ensure your agreement matches the correct jurisdiction, includes mandatory clauses,
              and avoids costly compliance errors.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Use the right agreement</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>AST for England tenancies.</li>
                  <li>Occupation Contract for Wales.</li>
                  <li>PRT for Scotland (open-ended).</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Mandatory details</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Correct landlord registration details.</li>
                  <li>Deposit and rent terms stated clearly.</li>
                  <li>Required clauses and repair obligations.</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Avoid common mistakes</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Using an outdated template.</li>
                  <li>Missing signatures or dates.</li>
                  <li>Mixing England/Wales/Scotland terms.</li>
                </ul>
                <Link href="/private-residential-tenancy-agreement-template" className="text-primary text-sm font-medium hover:underline inline-flex mt-3">
                  Scotland PRT guidance →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* Jurisdiction Details */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              What You Get By Region
            </h2>
            <p className="text-center text-gray-600 mb-12">
              The wizard automatically generates the correct agreement type for your property&apos;s jurisdiction
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {regionCards.map((region) => (
                <article key={region.name} className="h-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-7 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <Image src={region.flagSrc} alt={region.flagAlt} width={28} height={21} className="w-7 h-5 object-cover rounded-sm border border-gray-100" />
                    <h3 className="text-2xl font-semibold text-charcoal">{region.name}</h3>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-4">{region.agreementType}</p>
                  <ul className="text-base text-gray-700 list-disc pl-5 space-y-2">
                    {region.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-gray-600">
                    <strong>{region.noteLabel}</strong> {region.note}
                  </p>

                  <Link
                    href={region.href}
                    className="mt-auto block w-full text-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-charcoal hover:bg-gray-100 transition-colors"
                  >
                    Choose Region
                  </Link>
                </article>
              ))}
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


      {/* Comparison vs Solicitor */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">
              How We Compare
            </h2>
            <VsSolicitorComparison product="ast_standard" />
          </div>
        </Container>
      </section>

      {/* When to Choose Premium - Enhanced with legal context */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
              When Premium is Recommended
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Based on common landlord requirements and UK housing legislation
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Home className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">HMOs &amp; Multi-Tenant Properties</h3>
                <p className="text-gray-700 mb-3">
                  Letting to 3+ unrelated tenants sharing facilities? Premium includes HMO clauses commonly required under the Housing Act 2004: joint &amp; several liability, shared facilities rules, and tenant replacement provisions.
                </p>
                <p className="text-sm text-gray-500">
                  Properties with 5+ people from 2+ households require mandatory HMO licensing in England.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Student Lettings</h3>
                <p className="text-gray-700 mb-3">
                  Premium includes guarantor clauses (with clear liability terms), anti-subletting provisions to prevent Airbnb-style lets, and professional cleaning requirements commonly used for student accommodation.
                </p>
                <p className="text-sm text-gray-500">
                  Student lets with 3+ unrelated individuals may also require HMO licensing.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Professional Landlords</h3>
                <p className="text-gray-700 mb-3">
                  Managing multiple properties? Premium offers contractual rent increase provisions (CPI/RPI-linked), enhanced maintenance schedules, and tenant replacement procedures.
                </p>
                <p className="text-sm text-gray-500">
                  Rent review clauses allow predictable increases without requiring Section 13 notices.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BadgePoundSterling className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">High-Value Properties</h3>
                <p className="text-gray-700 mb-3">
                  For properties with higher rent or value, Premium provides comprehensive contents insurance requirements, detailed inventory schedules, and enhanced maintenance obligations.
                </p>
                <p className="text-sm text-gray-500">
                  Premium clauses are drafted to be enforceable under unfair terms regulations.
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-gray-700">
                <strong>Not sure which to choose?</strong> Our wizard will recommend Standard or Premium based on your property and tenancy details. The recommendation is non-blocking &mdash; you can always choose either tier.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <FAQSection
        title="Frequently Asked Questions"
        faqs={faqs}
        includeSchema={false}
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
                Standard - {standardPrice} →
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=product_page&topic=tenancy"
                className="hero-btn-secondary"
              >
                Premium (HMO-Ready) - {premiumPrice} →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              One-time payment • Unlimited regenerations • No subscription
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Standard for single households • Premium for HMOs, students &amp; multi-tenant
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
