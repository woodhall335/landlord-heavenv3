import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  FileText,
  ClipboardList,
  Scale,
} from 'lucide-react';
import { FAQSection } from '@/components/marketing/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, productLinks, toolLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim Against Tenant Guarantor 2026 | Sue Guarantor for Rent Arrears',
  description:
    'Recover unpaid rent and damage costs from a tenant\'s guarantor. Legal requirements, evidence needed, and court claim process for England.',
  keywords: [
    'sue guarantor rent arrears',
    'tenant guarantor claim',
    'guarantor liability landlord',
    'claim against guarantor',
    'guarantor debt recovery',
    'guarantor agreement enforcement',
    'landlord claim guarantor',
    'guarantor unpaid rent',
    'guarantor court claim',
    'guarantor MCOL',
  ],
  openGraph: {
    title: 'Claim Against Tenant Guarantor 2026 | Sue Guarantor for Rent Arrears',
    description:
      'Landlord guide to recovering unpaid rent from a tenant\'s guarantor through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-guarantor'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-guarantor'),
  },
};

const faqs = [
  {
    question: 'Can I sue the guarantor if the tenant doesn\'t pay rent?',
    answer:
      'Yes, if you have a valid guarantor agreement that covers the tenant\'s obligations. The guarantor is jointly and severally liable with the tenant, meaning you can pursue either or both for the full amount owed.',
  },
  {
    question: 'Do I have to claim against the tenant before the guarantor?',
    answer:
      'No. Under joint and several liability, you can choose to claim against the guarantor directly, the tenant directly, or both together. Many landlords find guarantors easier to collect from as they often have more assets.',
  },
  {
    question: 'What does a valid guarantor agreement need?',
    answer:
      'A valid guarantor agreement should: be in writing, be signed by the guarantor, clearly identify the tenant and property, specify what obligations are guaranteed (rent, damage, etc.), and ideally be witnessed. The guarantor should have received independent legal advice.',
  },
  {
    question: 'Does the guarantor liability continue after the fixed term?',
    answer:
      'This depends on the wording of your guarantee. Some guarantees only cover the fixed term. Others extend to any statutory periodic tenancy. Check your guarantee carefully - if it doesn\'t mention periodic tenancies, it may have ended.',
  },
  {
    question: 'Can I claim for damage as well as rent from the guarantor?',
    answer:
      'Yes, if the guarantee covers "all tenant obligations under the tenancy agreement" which typically includes keeping the property in good condition. Check the guarantee wording to confirm damage is covered.',
  },
  {
    question: 'The guarantor says they didn\'t understand what they signed - now what?',
    answer:
      'If the guarantee was properly executed and the guarantor had opportunity to seek advice, this defence usually fails. However, if the guarantor was vulnerable, misled, or didn\'t receive key information, courts may find the guarantee unenforceable.',
  },
  {
    question: 'How much can I claim from the guarantor?',
    answer:
      'You can claim the same amounts you could claim from the tenant: unpaid rent, damage costs (with betterment), interest, and court fees. The guarantee may cap liability or it may be unlimited - check the wording.',
  },
  {
    question: 'Should I send a letter before action to the guarantor?',
    answer:
      'Yes, always. Send a formal letter before action to the guarantor giving them 14-30 days to pay. Explain the tenant\'s debt, their guarantee obligations, and what you\'ll do if they don\'t pay. Keep proof of sending.',
  },
  {
    question: 'Can I claim against both tenant and guarantor in the same court claim?',
    answer:
      'Yes, you can name both as defendants in a single MCOL claim. You can then enforce the judgment against either or both. This is often the most efficient approach.',
  },
  {
    question: 'What if the guarantor paid some of the tenant\'s debt - can they claim it back from the tenant?',
    answer:
      'Yes. If the guarantor pays you, they have a right to recover that amount from the tenant (subrogation). You should provide the guarantor with evidence of the debt if they request it for their own claim.',
  },
];

export default function MoneyClaimGuarantorPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim Against Tenant Guarantor (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover unpaid rent from a tenant\'s guarantor through MCOL.',
          url: getCanonicalUrl('/money-claim-guarantor'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Guarantor Claims', url: 'https://landlordheaven.co.uk/money-claim-guarantor' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-900 to-purple-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-purple-700/50 text-purple-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <UserCheck className="w-4 h-4" />
                Enforce the guarantee
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim Against Tenant Guarantor for Unpaid Rent
              </h1>

              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                When the tenant won&apos;t or can&apos;t pay, enforce your guarantor
                agreement and recover rent arrears and damage costs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=rent_arrears&src=seo_guarantor"
                  className="inline-flex items-center justify-center gap-2 bg-white text-purple-800 font-semibold py-4 px-8 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  Start Guarantor Claim
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/20"
                >
                  <FileText className="w-5 h-5" />
                  View Money Claim Pack
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Key Points Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                When to Claim Against a Guarantor
              </h2>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8 rounded-r-lg">
                <p className="text-green-900 text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Joint and several liability:</strong> You don&apos;t have to
                    pursue the tenant first. You can claim against the guarantor directly,
                    or against both tenant and guarantor together.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                    Why Claim Against Guarantor?
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Guarantors often have assets to enforce against
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      CCJ affects their credit - motivates payment
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Family members often pay to protect relationship
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Professional guarantors have clear processes
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-600" />
                    Check Your Guarantee Covers:
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      The current tenancy period (fixed + periodic)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      Rent and/or other obligations
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      Damage and dilapidations
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      Any liability cap or limit
                    </li>
                  </ul>
                </div>
              </div>

              {/* Warning about guarantee validity */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Check guarantee validity:</strong> Some guarantees only cover
                    the fixed term and expire when the tenancy becomes periodic. Review
                    the guarantee wording before making a claim.
                  </span>
                </p>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Unsure if your guarantee is still valid?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get guidance on guarantee enforcement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Evidence You Need
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Guarantee Documents</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Signed guarantor agreement</li>
                    <li>• Tenancy agreement (referenced)</li>
                    <li>• Guarantor identification</li>
                    <li>• Witness signatures (if applicable)</li>
                    <li>• Any variations or extensions</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Debt Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Rent arrears schedule</li>
                    <li>• Damage assessment (if applicable)</li>
                    <li>• Correspondence with tenant</li>
                    <li>• Letter before action to guarantor</li>
                    <li>• Interest calculation</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Guarantor Claim Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Original signed guarantor agreement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy agreement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Proof guarantee covers the period
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Rent arrears calculation
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Previous correspondence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action to guarantor
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Proof of sending (recorded delivery)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Guarantor contact details
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Start Your Guarantor Claim
              </h2>
              <p className="text-gray-600 mb-8">
                The Money Claim Pack includes documents for claiming against guarantors,
                including joint claims against both tenant and guarantor.
              </p>
              <Link
                href="/wizard?product=money_claim&reason=rent_arrears&src=seo_guarantor"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Start Your Claim — £99.99
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                Court fees from £35 extra (based on claim amount)
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Frequently Asked Questions
              </h2>
              <FAQSection faqs={faqs} />
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Guides
              </h2>
              <RelatedLinks
                links={[
                  moneyClaimGuides.unpaidRent,
                  moneyClaimGuides.formerTenant,
                  moneyClaimGuides.ccjEnforcement,
                  productLinks.moneyClaim,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
