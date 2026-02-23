import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  UserX,
  FileText,
  Search,
  MapPin,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimEnforcementLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim Against Former Tenant 2026 | Trace & Recover Debts',
  description:
    'Recover unpaid rent and damage costs from former tenants who have left. How to trace tenants, serve claims, and enforce judgments.',
  keywords: [
    'former tenant claim',
    'trace former tenant',
    'ex tenant debt recovery',
    'find old tenant address',
    'sue former tenant',
    'tenant left owing money',
    'recover rent from ex tenant',
    'trace tenant address',
    'former tenant MCOL',
    'tenant debt after leaving',
  ],
  openGraph: {
    title: 'Claim Against Former Tenant 2026 | Trace & Recover Debts',
    description:
      'Landlord guide to recovering debts from former tenants through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-former-tenant'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-former-tenant'),
  },
};

const faqs = [
  {
    question: 'Can I claim against a tenant who has left the property?',
    answer:
      'Yes. A tenant\'s liability for rent arrears, damage, or other debts doesn\'t end when they leave. You can pursue them through MCOL at their new address. You have 6 years from when the debt arose to make a claim.',
  },
  {
    question: 'How do I find my former tenant\'s new address?',
    answer:
      'Options include: Royal Mail forwarding address service, checking guarantor contact, tracing agents (from £50), social media search, credit reference agency checks (trade only), or asking the court for alternative service if all else fails.',
  },
  {
    question: 'What if I can\'t find the tenant at all?',
    answer:
      'You can apply to the court for "alternative service" - serving the claim by email, social media, or at a last known address. Courts grant this if you\'ve made reasonable efforts to locate the defendant.',
  },
  {
    question: 'Is it worth claiming against a tenant who left owing money?',
    answer:
      'Consider: amount owed (is it worth court fees?), likelihood of finding them, their likely ability to pay, and whether a CCJ will motivate payment. A CCJ lasts 6 years on credit files, which often prompts payment.',
  },
  {
    question: 'How long do I have to claim against a former tenant?',
    answer:
      'You have 6 years from when the money became due for contract claims (rent, breach of tenancy). For tort claims (negligence), it\'s also 6 years. Don\'t wait too long - evidence becomes weaker over time.',
  },
  {
    question: 'Can I claim interest on old debts?',
    answer:
      'Yes. Statutory interest at 8% per year accrues from when each payment was due until judgment. For older debts, the interest can be substantial and is added to your claim.',
  },
  {
    question: 'What about professional tracing services?',
    answer:
      'Tracing agents charge £50-200+ to locate people. They use credit records, electoral roll, and other databases. Worth considering for larger debts, but check the cost vs amount you\'re owed first.',
  },
  {
    question: 'The former tenant has disappeared abroad - can I still claim?',
    answer:
      'You can get a CCJ in England, but enforcement abroad is complex. Within the EU, judgments can be registered for enforcement. Outside the EU, it\'s usually impractical unless the debt is very large.',
  },
  {
    question: 'Should I claim against the tenant or their guarantor?',
    answer:
      'If you have a guarantor, they may be easier to find and more likely to pay. You can claim against both together. Joint and several liability means you can pursue either or both for the full amount.',
  },
  {
    question: 'What if the tenant disputes they owe the money?',
    answer:
      'If they file a defence, the case proceeds to a hearing. Present your evidence: tenancy agreement, rent statements, damage photos, correspondence. Most small claims are decided on paperwork without attendance.',
  },
];

export default function MoneyClaimFormerTenantPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim Against Former Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover debts from former tenants through MCOL.',
          url: getCanonicalUrl('/money-claim-former-tenant'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Former Tenant Claims', url: 'https://landlordheaven.co.uk/money-claim-former-tenant' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gray-700/50 text-gray-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <UserX className="w-4 h-4" />
                Trace and recover
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim Against Former Tenant Who Left Owing Money
              </h1>

              <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
                Just because a tenant has left doesn&apos;t mean they&apos;ve escaped
                their debts. Trace them and recover what you&apos;re owed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=rent_arrears&src=seo_former_tenant"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Start Former Tenant Claim
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

        {/* Tracing Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How to Find Your Former Tenant
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>You need their address:</strong> To make a court claim, you must
                    have an address for service. If you can&apos;t find one, you&apos;ll need
                    to apply for alternative service.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Free Tracing Options</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Royal Mail forwarding address (if they set one up)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Contact their guarantor for new address
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Social media search (Facebook, LinkedIn)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Electoral roll (free at libraries)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Previous landlord reference contact
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Paid Tracing Services</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      Tracing agents (£50-200) - use credit data
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      Trace services via debt collectors
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      Private investigators (higher cost)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      Online people finder services
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    Consider cost vs amount owed before using paid services.
                  </p>
                </div>
              </div>

              {/* Alternative service */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Can&apos;t Find Them? Alternative Service</h3>
                <p className="text-gray-700 text-sm mb-3">
                  If you genuinely cannot locate the tenant, you can apply to the court for
                  permission to serve the claim by alternative means:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• By email to their last known email address</li>
                  <li>• By social media message</li>
                  <li>• At their last known address (even if moved)</li>
                  <li>• Via their employer if known</li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  Court fee for alternative service application is £53.
                </p>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Need help tracing your former tenant?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get guidance on tracing and alternative service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Worth It Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Is It Worth Claiming?
              </h2>

              <p className="text-gray-600 mb-6">
                Consider these factors before pursuing a former tenant:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3">Claim If:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Amount owed is significant (£500+)</li>
                    <li>• You have the tenant&apos;s new address</li>
                    <li>• Tenant is likely employed/has assets</li>
                    <li>• You have strong evidence</li>
                    <li>• Guarantor is also available to pursue</li>
                    <li>• CCJ threat may prompt payment</li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="font-bold text-gray-900 mb-3">Think Twice If:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Amount is small (under £300)</li>
                    <li>• Tenant has disappeared completely</li>
                    <li>• Tenant is unemployed/has no assets</li>
                    <li>• Evidence is weak or missing</li>
                    <li>• You know they have existing CCJs</li>
                    <li>• Tracing costs exceed debt value</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">The CCJ Advantage</h3>
                <p className="text-gray-600 text-sm">
                  A County Court Judgment stays on the tenant&apos;s credit file for 6 years.
                  This makes it very hard for them to get mortgages, credit cards, loans,
                  or even pass landlord reference checks. Many people pay judgments to
                  clean their credit file.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Start Your Former Tenant Claim
              </h2>
              <p className="text-gray-600 mb-8">
                The Money Claim Pack includes court documents for claiming against
                former tenants, plus guidance on tracing and enforcement.
              </p>
              <Link
                href="/wizard?product=money_claim&reason=rent_arrears&src=seo_former_tenant"
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
              <FAQSection faqs={faqs} 
                showTrustPositioningBar
              />
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
                  moneyClaimGuides.guarantorClaims,
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
