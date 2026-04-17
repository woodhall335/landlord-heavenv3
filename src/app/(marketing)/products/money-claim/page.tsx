import type { Metadata } from "next";
import { Container } from "@/components/ui";
import Link from "next/link";
import { FileText, Mail } from "lucide-react";
import { UniversalHero } from "@/components/landing/UniversalHero";
import { HeaderConfig } from "@/components/layout/HeaderConfig";
import { moneyClaimHeroConfig } from "@/components/landing/heroConfigs";
import { StructuredData, productSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
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
import { FunnelProcessSection } from "@/components/funnels";

// Get price from single source of truth
const product = PRODUCTS.money_claim;
const price = product.displayPrice;

export const metadata: Metadata = {
  title: `Landlord Money Claim Pack | Recover Unpaid Rent, Damage, and Bills | ${price}`,
  description:
    `Start a landlord money claim pack for unpaid rent, property damage, cleaning costs, bills, and other tenant debts through the England county court process.`,
  openGraph: {
    title: `Landlord Money Claim Pack | Recover Unpaid Rent and Tenant Debt | ${price}`,
    description:
      "Money claim pack for England landlords to recover rent arrears, property damage, cleaning costs, and other tenant debts. Includes Form N1, a Letter Before Claim, an interest calculator, and practical guidance on issuing the claim.",
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
    answer:
      "You receive 10 documents: Form N1 (Money Claim), Particulars of Claim, a Schedule of Arrears, interest calculation under section 69 of the County Courts Act, a PAP-DEBT compliant Letter Before Claim, Defendant Information Sheet, Reply Form, Financial Statement, Court Filing Guide, and Enforcement Guide.",
  },
  {
    question: "Can I claim for damage or cleaning after the tenant leaves?",
    answer:
      "Yes. You can claim for property damage, professional cleaning, rubbish removal, unpaid utilities, and other costs. You will need evidence such as photos, invoices, and quotes. In the wizard, select the relevant claim reasons and itemise each cost in the damages section.",
  },
  {
    question: "Can I claim arrears if the tenant has already left?",
    answer:
      "Yes. You generally have 6 years from the date the arrears became due to make a claim. You will need the tenant’s current address for service.",
  },
  {
    question: "Can I combine rent arrears with damage claims?",
    answer:
      "Yes. The wizard lets you select multiple claim reasons, so you can include rent arrears, property damage, cleaning costs, unpaid utilities, and other tenant debts in one claim.",
  },
  {
    question: "Can I claim interest on the debt?",
    answer:
      "Yes. You can usually claim 8% statutory interest per year. Our interest calculator works this out automatically for rent arrears. For damage claims, interest generally runs from the date you told the tenant how much was owed.",
  },
  {
    question: "What happens if the tenant defends the claim?",
    answer:
      "If the tenant files a defence, the court will usually list the case for a hearing. You will need to attend and present your evidence.",
  },
  {
    question: "How do I collect the money after winning?",
    answer:
      "If you obtain judgment and the tenant still does not pay, you may be able to enforce it through bailiffs, an attachment of earnings order, or a charging order. We include guidance on the main enforcement options.",
  },
  {
    question: "Which jurisdictions do you support?",
    answer:
      "This pack is built for landlords claiming through the England county court process. It uses Form N1 and a PAP-DEBT Letter Before Claim for that process.",
  },
  {
    question: "How long are documents stored?",
    answer:
      "Documents are stored in your portal for at least 12 months. You can download and save them at any time.",
  },
  {
    question: "Do you provide legal advice?",
    answer:
      "No. We provide document generation and practical guidance, not legal advice. Ask Heaven helps you understand the process, but it is not a solicitor and does not provide legal representation.",
  }
];

export default async function MoneyClaimPage() {
  const previews = await getMoneyClaimPreviewData();

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={productSchema({
          name: "Landlord Money Claim Pack",
          description:
            "Recover unpaid rent, property damage, cleaning costs, bills, and other tenant debt through the County Court in England. Includes structured claim documents, PAP-DEBT support, Form N1, interest calculation, and filing guidance.",
          price: product.price.toString(),
          url: "https://landlordheaven.co.uk/products/money-claim",
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", url: "https://landlordheaven.co.uk" },
          { name: "Products", url: "https://landlordheaven.co.uk/pricing" },
          { name: "Landlord Money Claim Pack", url: "https://landlordheaven.co.uk/products/money-claim" },
        ])}
      />

      <UniversalHero {...moneyClaimHeroConfig} showTrustPositioningBar />

      <FunnelProcessSection product="money_claim" moneyClaimPreviews={previews} />

      <section className="bg-white border-y border-[#EDE2FF]">
        <Container>
          <nav className="flex flex-wrap items-center gap-3 py-4 text-sm" aria-label="Money claim quick links">
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
              Start your money claim pack
            </Link>
          </nav>
        </Container>
      </section>

      <section id="whats-included" className="scroll-mt-24 py-10 md:py-14">
        <Container>
          <div className="mx-auto mb-6 max-w-6xl">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">What's included</h2>
            <p className="mt-3 text-gray-700">
              You get the core documents needed to pursue unpaid rent and other tenant debt properly, including the pre-action letter pack and the court claim paperwork. This is for landlords who want to start a money claim with the right documents in place, rather than trying to piece everything together from general guidance.
            </p>
          </div>
        </Container>
        <WhatsIncludedInteractive
          product="money_claim"
          previews={previews}
          titleOverride="What's included in your money claim pack"
          subtitleOverride="Preview every document before you buy."
        />
      </section>

      <section id="who-this-is-for" className="scroll-mt-24 py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Who this is for</h2>
            <p className="text-gray-600 mb-6">
              This pack is for landlords who are owed money and want a practical way to recover rent arrears or other tenant debt.
            </p>
            <ul className="mb-10 grid gap-3 text-left text-gray-700 md:grid-cols-2">
              <li>• Your tenant owes rent and you want to recover the arrears.</li>
              <li>• You want to start a money claim with the right documents.</li>
              <li>• You need a compliant Letter Before Claim before starting court action.</li>
              <li>• You want a clear process instead of piecing forms together manually.</li>
            </ul>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Typical timeline</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Letter before claim: usually 30 days.</li>
                  <li>Default judgment: often 2–4 weeks.</li>
                  <li>Defended claims: often 3–6 months.</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Court fees</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Fees vary depending on claim value and how you file.</li>
                  <li>In many cases, court fees can be added to the claim.</li>
                  <li>The pack includes County Court fee guidance for England.</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Evidence checklist</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Tenancy agreement and rent schedule.</li>
                  <li>Bank statements showing missed payments.</li>
                  <li>Demand letters and any tenant responses.</li>
                </ul>
                <Link href="/money-claim-unpaid-rent" className="text-primary text-sm font-medium hover:underline inline-flex mt-3">
                  See the landlord money claim guide ->
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                AI-Drafted Court Documents
              </h2>
              <p className="text-xl text-gray-700">
                Ask Heaven helps draft the key court documents for your claim
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal">Particulars of Claim</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Ask Heaven helps draft a clear Particulars of Claim document covering:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Tenancy agreement details and key terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Arrears broken down by date and amount</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Interest calculation at the statutory 8% rate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Formatting suitable for court submission</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal">Letter Before Claim</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  A PAP-DEBT compliant Letter Before Claim that includes:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>PAP-DEBT compliance for England</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>A clear breakdown of the debt claimed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>The standard response period before court action</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>The required PAP enclosures</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center italic">
              AI-drafted documents should be checked before submission. For more complex claims, you may wish to have them reviewed by a solicitor.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <WhyLandlordHeaven variant="full" />
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="scroll-mt-24 py-16 md:py-20 bg-white">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-[#F8F5FF] p-6 md:p-10">
            <h2 className="text-3xl font-bold text-charcoal md:text-4xl">How it works</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-5">
                <h3 className="font-semibold">1) Choose what you want to claim</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Select rent arrears, damage, cleaning, utilities, or a combination of claim reasons.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5">
                <h3 className="font-semibold">2) Add the case details and evidence</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Enter the tenancy details, debt breakdown, and the supporting evidence you have.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5">
                <h3 className="font-semibold">3) Generate and issue your claim pack</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Preview your documents, send the Letter Before Claim, and then move on to court filing if needed.
                </p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/wizard?product=money_claim&src=product_page"
                className="hero-btn-primary"
              >
                Start your money claim pack - {price} →
              </Link>
            </div>
          </div>
        </Container>
      </section>

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

      <section id="when-to-use" className="py-16 md:py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">When to use the Money Claim Pack</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-charcoal mb-3">Use the Money Claim Pack if:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• The tenant owes rent arrears, whether they are still in the property or have already left.</li>
                  <li>• The tenant caused property damage that needs repair.</li>
                  <li>• You paid for professional cleaning or rubbish removal.</li>
                  <li>• The tenant left unpaid utilities in your name.</li>
                  <li>• The claim is within the usual small claims range.</li>
                  <li>• You know where the tenant lives or works.</li>
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-charcoal mb-3">Think carefully if:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• The tenant has no known income or assets.</li>
                  <li>• The tenant has left the country.</li>
                  <li>• You do not have current contact details.</li>
                  <li>• The debt is very small and the costs may outweigh recovery.</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-charcoal font-semibold mb-2">Need to evict first?</p>
              <p className="text-gray-700">
                If the tenant is still in the property, start with our{" "}
                <Link href="/products/notice-only" className="text-primary hover:underline">
                  Notice Only Pack
                </Link>{" "}
                or{" "}
                <Link href="/products/complete-pack" className="text-primary hover:underline">
                  Complete Eviction Pack
                </Link>
                . You can pursue a money claim separately alongside or after the possession process, depending on your case.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-12 text-center">
              Court Fees (paid separately to the court)
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
              <p>• Court fees are paid to the court, not to Landlord Heaven.</p>
              <p>• If you win, court fees can often be added to your claim.</p>
              <p>• Money Claim Online can be cheaper, so use it where appropriate.</p>
            </div>
          </div>
        </Container>
      </section>

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
                    Need to evict the tenant as well?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    A money claim helps you recover what you are owed. If you also need the tenant to leave the property, you will need an eviction notice too. Many landlords run both products: eviction for possession and a money claim for the debt.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/wizard?product=notice_only&src=money_claim_crosssell"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Start Eviction Notice Generator - {PRODUCTS.notice_only.displayPrice}
                    </Link>
                    <Link
                      href="/wizard?product=complete_pack&src=money_claim_crosssell"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-purple-300 text-primary font-medium rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Start Complete Eviction Pack - {PRODUCTS.complete_pack.displayPrice}
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    <Link href="/how-to-evict-tenant" className="text-primary hover:underline">
                      Learn about the eviction process ->
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection
        title="Money claim FAQs for landlords"
        faqs={faqs}
        includeSchema={false}
        showContactCTA={false}
        variant="white"
      />

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

      <section id="start-your-pack" className="scroll-mt-24 py-16 md:py-20 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to recover what you’re owed?</h2>
            <p className="text-xl mb-8 text-gray-600">
              If your tenant has not paid rent, start your money claim now and generate the documents you need to recover unpaid rent and other tenancy-related debt.
            </p>
            <Link
              href="/wizard?product=money_claim&src=product_page"
              className="hero-btn-primary"
            >
              Start your money claim pack - {price} →
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
