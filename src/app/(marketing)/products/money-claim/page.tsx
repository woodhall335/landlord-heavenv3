import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import { FileText, Mail } from "lucide-react";
import { UniversalHero } from "@/components/landing/UniversalHero";
import { HeaderConfig } from "@/components/layout/HeaderConfig";
import { moneyClaimHeroConfig } from "@/components/landing/heroConfigs";
import { StructuredData, productSchema, faqPageSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { productLinks, toolLinks, blogLinks, landingPageLinks } from "@/lib/seo/internal-links";
import { getCanonicalUrl } from "@/lib/seo";
import { PRODUCTS } from "@/lib/pricing/products";
import { FAQSection } from "@/components/seo/FAQSection";
import {
  WhyLandlordHeaven,
  VsSolicitorComparison,
  WhatsIncludedInteractive,
} from "@/components/value-proposition";
import { getMoneyClaimPreviewData } from "@/lib/previews/moneyClaimPreviews";

// Get price from single source of truth
const product = PRODUCTS.money_claim;
const price = product.displayPrice;

export const metadata: Metadata = {
  title: `Money Claim Pack 2026 for England Landlords | ${price}`,
  description:
    `Recover unpaid rent, property damage, cleaning costs and other tenant debts through English courts. N1 form, PAP-DEBT Letter Before Claim, interest calculator, and enforcement guidance. England only - ${price} one-time.`,
  openGraph: {
    title: `Money Claim Pack 2026 for England Landlords | ${price}`,
    description: "Money claim pack for England landlords to recover rent arrears, property damage, cleaning costs and other tenant debts. N1 form, Letter Before Claim, interest calculator, and court-ready guidance included.",
    url: getCanonicalUrl('/products/money-claim'),
  },
  alternates: {
    canonical: getCanonicalUrl('/products/money-claim'),
  },
};

export const runtime = 'nodejs';

// FAQ data for structured data
const faqs = [
  {
    question: "What documents do I get?",
    answer: "You receive 10 documents: Form N1 (Money Claim), Particulars of Claim, Schedule of Arrears, Interest Calculation (s.69 County Courts Act), Letter Before Claim (PAP-DEBT compliant), Defendant Information Sheet, Reply Form, Financial Statement, Court Filing Guide, and Enforcement Guide."
  },
  {
    question: "Can I claim for damage or cleaning after the tenant leaves?",
    answer: "Yes! You can claim for property damage, professional cleaning, rubbish removal, unpaid utilities, and other costs. You'll need evidence such as photos, invoices, and quotes. Select the relevant reasons in the wizard and itemise each cost in the Damages section."
  },
  {
    question: "Can I claim arrears if the tenant has already left?",
    answer: "Yes! You have 6 years from the date arrears became due to make a claim. You'll need the tenant's current address for court service."
  },
  {
    question: "Can I combine rent arrears with damage claims?",
    answer: "Yes! Our wizard lets you select multiple claim reasons. You can claim rent arrears, property damage, cleaning costs, unpaid utilities, and other tenant debts all in one claim."
  },
  {
    question: "Can I claim interest on the debt?",
    answer: "Yes! You can claim 8% statutory interest per year on debts. Our interest calculator works this out automatically for rent arrears. For damage claims, interest runs from when you notified the tenant of the amount owed."
  },
  {
    question: "What happens if the tenant defends the claim?",
    answer: "If the tenant submits a defence, the court will schedule a hearing. You'll need to attend and present your evidence."
  },
  {
    question: "How do I collect the money after winning?",
    answer: "After judgment, if the tenant doesn't pay voluntarily, you can use: Bailiffs, Attachment of Earnings (deduct from wages), or Charging Order (secure against their property). We include guides for all enforcement methods."
  },
  {
    question: "Which jurisdictions do you support?",
    answer: "England only. This pack uses the N1 form and PAP-DEBT Letter Before Claim for English courts."
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

export default async function MoneyClaimPage() {
  const previews = await getMoneyClaimPreviewData();

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderConfig mode="autoOnScroll" />
      {/* Structured Data for SEO */}
      <StructuredData data={productSchema({
        name: "Money Claim Pack - Recover Rent Arrears",
        description: "Recover unpaid rent arrears through the County Court in England. Structured claim documents, PAP-DEBT support, N1 format, interest calculation, and filing guidance included.",
        price: product.price.toString(),
        url: "https://landlordheaven.co.uk/products/money-claim"
      })} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://landlordheaven.co.uk" },
        { name: "Products", url: "https://landlordheaven.co.uk/pricing" },
        { name: "Money Claim Pack", url: "https://landlordheaven.co.uk/products/money-claim" }
      ])} />

      {/* Hero Section */}
      <UniversalHero {...moneyClaimHeroConfig} showTrustPositioningBar />


      <WhatsIncludedInteractive product="money_claim" previews={previews} />

      <section className="py-8 bg-white"><Container><p className="text-center text-gray-700 font-medium">These are example previews. Your bundle is generated specifically for your jurisdiction and tenancy details.</p></Container></section>

      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Money Claim Timeline, Fees & Evidence
            </h2>
            <p className="text-gray-600 mb-12">
              Prepare the right evidence, understand court fees, and keep your claim moving without
              unnecessary delays.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Typical timeline</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Letter before claim: 14 days.</li>
                  <li>Default judgment: 2–4 weeks.</li>
                  <li>Defended claims: 3–6 months.</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Court fees</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Fees vary by claim size and filing route.</li>
                  <li>Most fees can be added to the claim.</li>
                  <li>Pack includes England County Court fee guidance.</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Evidence checklist</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Tenancy agreement + rent schedule.</li>
                  <li>Bank statements showing missed payments.</li>
                  <li>Demand letters and tenant responses.</li>
                </ul>
                <Link href="/money-claim-unpaid-rent" className="text-primary text-sm font-medium hover:underline inline-flex mt-3">
                  See the landlord money claim guide →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* AI-Drafted Documents Feature */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                AI-Drafted Court Documents
              </h2>
              <p className="text-xl text-gray-700">
                Ask Heaven drafts professional court documents for your claim
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Particulars of Claim */}
              <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal">Particulars of Claim</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Ask Heaven drafts a professional Particulars of Claim document:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Tenancy agreement details and terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Arrears breakdown with dates and amounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Interest calculation (8% statutory rate)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Legal formatting ready for court submission</span>
                  </li>
                </ul>
              </div>

              {/* Letter Before Claim */}
              <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal">Letter Before Claim</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  PAP-DEBT compliant Letter Before Action:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>PAP-DEBT compliance (required for E&W)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Clear breakdown of debt owed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>30-day notice period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Includes all required PAP enclosures</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center italic">
              AI-drafted documents should be reviewed before submission. You may wish to have a solicitor review for complex claims.
            </p>
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

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Calculate Arrears</h3>
                <p className="text-sm text-gray-600">
                  Tell us rent amount, payment dates, and what&apos;s been paid. We calculate total arrears + interest.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Preview Your Documents</h3>
                <p className="text-sm text-gray-600">
                  Review all documents with watermarked previews. Edit answers and regenerate until satisfied.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">File Online or Paper</h3>
                <p className="text-sm text-gray-600">
                  File via Money Claim Online (MCOL) or post to your local county court. We include both methods.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Enforce Judgment</h3>
                <p className="text-sm text-gray-600">
                  If tenant doesn&apos;t pay, use our enforcement guide for bailiffs, wage attachment, or charging orders.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-charcoal mb-3">Typical Timeline:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="text-primary">→</span> <strong>Day 1:</strong> File claim with court (pay court fee)
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary">→</span> <strong>Day 7:</strong> Court serves claim on tenant
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary">→</span> <strong>Day 21:</strong> Tenant has 14 days to respond
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary">→</span> <strong>Day 28:</strong> If no response, apply for default judgment
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary">→</span> <strong>Day 42+:</strong> Enforcement (if needed)
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/wizard?product=money_claim&src=product_page"
                className="hero-btn-primary"
              >
                Start Money Claim - {price} →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8 text-center">
              How We Compare
            </h2>
            <VsSolicitorComparison product="money_claim" />
          </div>
        </Container>
      </section>

      {/* When to Use */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">When to Use Money Claim Pack</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-charcoal mb-3">Use Money Claim If:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Tenant owes rent arrears (current or former tenant)</li>
                  <li>• Tenant caused property damage needing repair</li>
                  <li>• You paid for professional cleaning or rubbish removal</li>
                  <li>• Tenant left unpaid utilities in your name</li>
                  <li>• Claim is under £10,000</li>
                  <li>• You know where tenant lives/works</li>
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-charcoal mb-3">Consider Carefully If:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Tenant has no known income or assets</li>
                  <li>• Tenant has left the country</li>
                  <li>• You don&apos;t have current contact details</li>
                  <li>• Arrears are very small (court fees may exceed recovery)</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-charcoal font-semibold mb-2">Need to evict first?</p>
              <p className="text-gray-700">
                If your tenant is still in the property, start with our{" "}
                <Link href="/products/notice-only" className="text-primary hover:underline">
                  Notice Only Pack
                </Link>{" "}
                or{" "}
                <Link href="/products/complete-pack" className="text-primary hover:underline">
                  Complete Eviction Pack
                </Link>
                . You can pursue money claims separately after possession.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Court Fees */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Court Fees (Paid Separately to Court)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-4 border font-semibold text-charcoal">Claim Amount</th>
                    <th className="text-left p-4 border font-semibold text-charcoal">Court Fee (Online)</th>
                    <th className="text-left p-4 border font-semibold text-charcoal">Court Fee (Paper)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border text-gray-700">Up to £300</td>
                    <td className="p-4 border text-gray-700">£25</td>
                    <td className="p-4 border text-gray-700">£35</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 border text-gray-700">£300.01 - £500</td>
                    <td className="p-4 border text-gray-700">£35</td>
                    <td className="p-4 border text-gray-700">£50</td>
                  </tr>
                  <tr>
                    <td className="p-4 border text-gray-700">£500.01 - £1,000</td>
                    <td className="p-4 border text-gray-700">£60</td>
                    <td className="p-4 border text-gray-700">£70</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 border text-gray-700">£1,000.01 - £1,500</td>
                    <td className="p-4 border text-gray-700">£70</td>
                    <td className="p-4 border text-gray-700">£80</td>
                  </tr>
                  <tr>
                    <td className="p-4 border text-gray-700">£1,500.01 - £3,000</td>
                    <td className="p-4 border text-gray-700">£105</td>
                    <td className="p-4 border text-gray-700">£115</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 border text-gray-700">£3,000.01 - £5,000</td>
                    <td className="p-4 border text-gray-700">£185</td>
                    <td className="p-4 border text-gray-700">£205</td>
                  </tr>
                  <tr>
                    <td className="p-4 border text-gray-700">£5,000.01 - £10,000</td>
                    <td className="p-4 border text-gray-700">£410</td>
                    <td className="p-4 border text-gray-700">£455</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p>• Court fees are paid to the court when filing, NOT to Landlord Heaven</p>
              <p>• If you win, court fees can be added to your claim (tenant pays)</p>
              <p>• Money Claim Online (MCOL) is cheaper - use it where possible</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Cross-sell: Eviction for Tenant Still in Property */}
      <section className="py-12 md:py-16 bg-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border-2 border-purple-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-charcoal mb-2">
                    Need to evict the tenant too?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    A money claim recovers what you&apos;re owed — but if you also need the tenant OUT of the
                    property, you&apos;ll need an eviction notice. You can pursue both simultaneously: eviction
                    for possession and money claim for the debt.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/wizard?product=notice_only&src=money_claim_crosssell"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Get Notice Only — {PRODUCTS.notice_only.displayPrice}
                    </Link>
                    <Link
                      href="/wizard?product=complete_pack&src=money_claim_crosssell"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-purple-300 text-primary font-medium rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Get Complete Pack — {PRODUCTS.complete_pack.displayPrice}
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    <Link href="/how-to-evict-tenant" className="text-primary hover:underline">
                      Learn about the eviction process →
                    </Link>
                  </p>
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
                productLinks.completePack,
                productLinks.noticeOnly,
                toolLinks.rentArrearsCalculator,
                toolLinks.section8Generator,
                blogLinks.rentArrearsEviction,
                landingPageLinks.rentArrearsTemplate,
              ]}
            />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Recover What You&apos;re Owed?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Claim rent arrears, damage, cleaning costs and more. Preview before you pay.
            </p>
            <Link
              href="/wizard?product=money_claim&src=product_page"
              className="hero-btn-primary"
            >
              Start Money Claim - {price} →
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              One-time payment • Unlimited regenerations • No subscription
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
