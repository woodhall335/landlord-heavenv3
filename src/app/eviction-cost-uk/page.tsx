import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  evictionCostRelatedLinks,
  productLinks,
  guideLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  PoundSterling,
  Shield,
  Calculator,
  FileText,
  Gavel,
  Users,
} from 'lucide-react';

const wizardLinkNoticeOnly = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'guide',
  topic: 'eviction',
});

const wizardLinkCompletePack = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'guide',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'How Much Does Eviction Cost UK? Full Breakdown (2026)',
  description: 'Complete breakdown of UK eviction costs in 2026. Court fees, bailiff costs, solicitor fees, and DIY options compared. Budget for your eviction.',
  keywords: [
    'eviction cost uk',
    'how much does eviction cost',
    'cost to evict tenant uk',
    'eviction fees uk',
    'court fees eviction',
    'bailiff fees uk',
    'solicitor eviction cost',
    'section 21 cost',
    'section 8 eviction cost',
    'cheap eviction uk',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/eviction-cost-uk',
  },
  openGraph: {
    title: 'How Much Does Eviction Cost UK? Full Breakdown | Landlord Heaven',
    description: 'Complete UK eviction cost breakdown for 2026. Court fees, bailiffs, and ways to save money on eviction.',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'How much does it cost to evict a tenant in the UK?',
    answer: 'Total eviction costs typically range from £500 to £3,000+. DIY route: ~£500-700 (court fees + bailiff). With solicitor: £1,500-3,000+. Using our Complete Pack: ~£700 total (£200 pack + £485 court fees).',
  },
  {
    question: 'What are the court fees for eviction?',
    answer: 'Court fees are £355 for a possession claim (N5 or N5B) and £130 for a bailiff warrant if needed. These fees are set by the government and apply whether you use a solicitor or do it yourself.',
  },
  {
    question: 'Is it cheaper to use Section 21 or Section 8?',
    answer: 'Court fees are the same (£355). Section 21 accelerated possession (N5B) is often simpler and doesn\'t require a hearing, potentially saving time. Section 8 may require a hearing but can be faster with only 2 weeks notice for some grounds.',
  },
  {
    question: 'Can I recover eviction costs from the tenant?',
    answer: 'You can include court fees in your possession claim. If the tenant doesn\'t pay, you can pursue the costs through enforcement. However, recovering costs from tenants with no assets or income can be difficult.',
  },
  {
    question: 'How much do eviction solicitors charge?',
    answer: 'Solicitor fees for a straightforward eviction typically range from £1,000 to £2,500+ depending on complexity. Contested cases or those requiring multiple hearings can cost significantly more.',
  },
  {
    question: 'What is the cheapest way to evict a tenant?',
    answer: 'The most affordable route is DIY using our document packs. Notice Only Pack (£49.99) for serving notice, or Complete Pack (£199.99) for full eviction including court forms. Add court fees (£355-485) for total cost of ~£500-640.',
  },
  {
    question: 'Are there any hidden costs in eviction?',
    answer: 'Watch for: storage costs if tenant leaves belongings, changeover costs (locks, cleaning, repairs), lost rent during vacancy, and potential property damage. Budget an extra £500-1,000 for these contingencies.',
  },
  {
    question: 'How long does eviction take and does time = cost?',
    answer: 'Yes, time is money in eviction. Every month the process takes is a month of lost rent (or reduced rent if tenant isn\'t paying). A 4-month eviction could cost £4,000+ in lost rent alone on a £1,000/month property.',
  },
];

export default function EvictionCostUkPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Eviction Cost UK - Full Breakdown',
    description: 'Complete guide to eviction costs in the UK including court fees, bailiff costs, and solicitor fees.',
    url: 'https://landlordheaven.co.uk/eviction-cost-uk',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Guides', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
        { name: 'Eviction Cost UK', url: 'https://landlordheaven.co.uk/eviction-cost-uk' },
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="2026 Prices"
          badgeIcon={<PoundSterling className="w-4 h-4" />}
          title="How Much Does Eviction Cost UK?"
          subtitle={<>Budget between <strong>£500 and £3,000+</strong> depending on your approach. Here&apos;s the full breakdown with ways to save money.</>}
          primaryCTA={{ label: 'Save £1,000+ — DIY Pack from £49.99', href: wizardLinkNoticeOnly }}
          secondaryCTA={{ label: 'See Complete Pack', href: '/products/complete-pack' }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              80% Cheaper Than Solicitors
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Court-Ready Format
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Same Day Documents
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Quick Summary */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Eviction Cost Summary
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Three ways to evict — here&apos;s what each costs in total.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* DIY Basic */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">DIY Notice Only</span>
                    <div className="text-3xl font-bold text-gray-900 mt-2">~£500</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Notice Pack</span>
                      <span className="font-medium">£49.99</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Court fee (N5B)</span>
                      <span className="font-medium">£355</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bailiff (if needed)</span>
                      <span className="font-medium">£130</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 text-center">
                    Best for: Section 21 where tenant likely to leave
                  </p>
                </div>

                {/* DIY Complete */}
                <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Best Value
                    </span>
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-primary uppercase tracking-wide">DIY Complete</span>
                    <div className="text-3xl font-bold text-gray-900 mt-2">~£700</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Complete Pack</span>
                      <span className="font-medium">£199.99</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Court fee</span>
                      <span className="font-medium">£355</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bailiff (if needed)</span>
                      <span className="font-medium">£130</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 text-center">
                    Best for: Full eviction with court forms included
                  </p>
                </div>

                {/* With Solicitor */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">With Solicitor</span>
                    <div className="text-3xl font-bold text-gray-900 mt-2">£2,000+</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Solicitor fees</span>
                      <span className="font-medium">£1,000-2,500</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Court fee</span>
                      <span className="font-medium">£355</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bailiff (if needed)</span>
                      <span className="font-medium">£130</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 text-center">
                    Best for: Complex cases or contested evictions
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-green-900">
                  <strong>Save £1,000-1,500</strong> by using our DIY packs instead of a solicitor.
                  Same court-ready documents, fraction of the cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Cost Breakdown */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Detailed Cost Breakdown
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Every fee you might encounter during the eviction process.
              </p>

              {/* Court Fees Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary" />
                    Court Fees (Fixed by Government)
                  </h3>
                </div>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-gray-700">Possession claim (N5 or N5B)</td>
                      <td className="px-6 py-4 text-right font-medium">£355</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">County court bailiff warrant (N325)</td>
                      <td className="px-6 py-4 text-right font-medium">£130</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">High Court enforcement writ (N293A)</td>
                      <td className="px-6 py-4 text-right font-medium">£66</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">High Court enforcement officer</td>
                      <td className="px-6 py-4 text-right font-medium">~£300-600</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">Total court fees (typical)</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">£485-550</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Professional Fees Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Professional Fees
                  </h3>
                </div>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-green-50">
                      <td className="px-6 py-4 text-gray-700">
                        <strong>Landlord Heaven Notice Pack</strong>
                        <br />
                        <span className="text-sm text-gray-500">Section 21 + Section 8 notices</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-green-700">£49.99</td>
                    </tr>
                    <tr className="bg-green-50">
                      <td className="px-6 py-4 text-gray-700">
                        <strong>Landlord Heaven Complete Pack</strong>
                        <br />
                        <span className="text-sm text-gray-500">Notices + all court forms + witness statements</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-green-700">£199.99</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">
                        Solicitor (notice only)
                        <br />
                        <span className="text-sm text-gray-500">Serving eviction notice</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">£200-500</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">
                        Solicitor (full eviction)
                        <br />
                        <span className="text-sm text-gray-500">Notice through to possession order</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">£1,000-2,500</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">
                        Solicitor (contested)
                        <br />
                        <span className="text-sm text-gray-500">Defended case with multiple hearings</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">£2,500-5,000+</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Other Costs Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Other Potential Costs
                  </h3>
                </div>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-gray-700">Process server (notice delivery)</td>
                      <td className="px-6 py-4 text-right font-medium">£50-150</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">Storage of tenant belongings</td>
                      <td className="px-6 py-4 text-right font-medium">£100-500</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">Lock changes</td>
                      <td className="px-6 py-4 text-right font-medium">£80-200</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">Professional cleaning</td>
                      <td className="px-6 py-4 text-right font-medium">£150-400</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700">Property repairs/damage</td>
                      <td className="px-6 py-4 text-right font-medium">Variable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="general"
                variant="section"
                jurisdiction="england"
                title="Keep Costs Low — Use Our DIY Packs"
                description="Court-ready documents at a fraction of solicitor costs. Notice Only from £49.99, Complete Pack £199.99."
              />
            </div>
          </div>
        </section>

        {/* Hidden Costs Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                The Hidden Cost: Lost Rent
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The biggest eviction cost isn&apos;t court fees — it&apos;s the rent you lose while waiting.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Example: £1,000/month rent</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">2 months notice period</span>
                        <span className="font-medium text-red-600">-£2,000</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">2 months court process</span>
                        <span className="font-medium text-red-600">-£2,000</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">1 month bailiff wait</span>
                        <span className="font-medium text-red-600">-£1,000</span>
                      </li>
                      <li className="flex items-center justify-between border-t pt-3 mt-3">
                        <span className="font-semibold text-gray-900">Total lost rent (5 months)</span>
                        <span className="font-bold text-red-600">-£5,000</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Speed matters</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Every month saved in the eviction process is a month of rent saved.
                      Section 8 with Ground 8 (rent arrears) requires only 2 weeks notice vs 2 months for Section 21.
                    </p>
                    <Link
                      href="/section-8-notice-template"
                      className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                    >
                      Learn about faster Section 8 eviction
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alternative: Money Claim Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <PoundSterling className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Alternative: Just Want Your Money Back?
                    </h2>
                    <p className="text-gray-600 mb-4">
                      If your tenant has already left but still owes rent, you don&apos;t need to evict —
                      you need a <strong>Money Claim</strong>. Court claim costs are often lower than eviction,
                      and you can claim up to £100,000 through Money Claim Online.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-6 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Court fees from £35 (claims up to £300)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Add 8% statutory interest</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>CCJ affects tenant&apos;s credit for 6 years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Multiple enforcement options</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href="/products/money-claim"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                      >
                        <Gavel className="w-5 h-5" />
                        Get Money Claim Pack — £99.99
                      </Link>
                      <Link
                        href="/money-claim-unpaid-rent"
                        className="inline-flex items-center gap-2 text-green-700 font-medium hover:underline"
                      >
                        Read the full guide
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Eviction Cost FAQ
              </h2>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <SeoCtaBlock
                pageType="general"
                variant="faq"
                jurisdiction="england"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="general"
                variant="final"
                jurisdiction="england"
                title="Start Your Eviction for Less"
                description="Court-ready documents from £49.99. Save over £1,000 compared to solicitor fees."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={evictionCostRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
