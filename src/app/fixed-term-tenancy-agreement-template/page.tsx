import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  productLinks,
  landingPageLinks,
  tenancyAgreementPageLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import {
  CheckCircle,
  FileText,
  Calendar,
  Shield,
  AlertTriangle,
  Clock,
  HelpCircle,
  ArrowRight,
  RefreshCcw,
} from 'lucide-react';

const wizardLinkAST = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'england',
  src: 'template',
});

export const metadata: Metadata = {
  title: 'Fixed Term Tenancy Agreement UK 2026 — AST Template & Guide',
  description: 'Fixed term tenancy agreement template for UK landlords. 6, 12, and 24 month terms, break clauses, renewal, and end of term options.',
  keywords: [
    'fixed term tenancy agreement',
    'fixed term tenancy agreement template',
    'fixed term AST',
    'fixed term rental agreement UK',
    'assured shorthold tenancy fixed term',
    'fixed term vs periodic tenancy',
    'tenancy fixed term',
    '12 month fixed term tenancy',
    'fixed term lease UK',
    'end of fixed term tenancy',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/fixed-term-tenancy-agreement-template',
  },
  openGraph: {
    title: 'Fixed Term Tenancy Agreement UK 2026 | Landlord Heaven',
    description: 'Complete guide to fixed term tenancy agreements. Templates, break clauses, and end of term options.',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'What is a fixed term tenancy agreement?',
    answer: 'A fixed term tenancy agreement is an assured shorthold tenancy (AST) that lasts for a specific period, typically 6, 12, or 24 months. During the fixed term, neither party can end the tenancy early unless there is a break clause or serious breach.',
  },
  {
    question: 'What is the difference between fixed term and periodic tenancy?',
    answer: 'A fixed term tenancy has a set end date and cannot be ended early (without a break clause). A periodic tenancy rolls on month-to-month or week-to-week, and either party can end it with proper notice. Fixed terms become periodic after the initial term expires.',
  },
  {
    question: 'Can a landlord end a fixed term tenancy early?',
    answer: 'Generally no. Landlords cannot use Section 21 during a fixed term unless there is a break clause. However, you can use Section 8 if the tenant breaches the agreement (e.g., serious rent arrears, anti-social behaviour). The fixed term provides security for both parties.',
  },
  {
    question: 'Can a tenant leave before the fixed term ends?',
    answer: 'Legally, tenants are bound for the full fixed term unless there is a break clause or the landlord agrees to early release. If a tenant abandons early, they remain liable for rent until the end of the term or until a new tenant is found.',
  },
  {
    question: 'What happens at the end of a fixed term tenancy?',
    answer: 'If no action is taken, the tenancy automatically becomes a statutory periodic tenancy on the same terms. Alternatively, you can sign a new fixed term agreement or end the tenancy with proper notice.',
  },
  {
    question: 'Do I need a new agreement for each fixed term?',
    answer: 'No, but it is recommended. You can let the tenancy become periodic, but signing a new agreement lets you update terms, adjust rent, and refresh the relationship. Our templates make renewal easy.',
  },
  {
    question: 'What is the best length for a fixed term tenancy?',
    answer: '12 months is most common, balancing stability with flexibility. 6 months suits new tenants or uncertain situations. 24 months suits settled families. Consider your goals and local market conditions.',
  },
  {
    question: 'Should I include a break clause in a fixed term tenancy?',
    answer: 'It depends on your flexibility needs. A break clause allows early exit (typically after 4-6 months) with notice. It helps if circumstances may change, but reduces the security of a true fixed term for both parties.',
  },
];

export default function FixedTermTenancyAgreementPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Fixed Term Tenancy Agreement UK',
    description: 'Complete guide to fixed term tenancy agreements with downloadable templates.',
    url: 'https://landlordheaven.co.uk/fixed-term-tenancy-agreement-template',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/assured-shorthold-tenancy-agreement-template' },
        { name: 'Fixed Term Tenancy Agreement', url: 'https://landlordheaven.co.uk/fixed-term-tenancy-agreement-template' },
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="England & Wales"
          badgeIcon={<Calendar className="w-4 h-4" />}
          title="Fixed Term Tenancy Agreement Template"
          subtitle={<>Create a <strong>fixed term tenancy agreement</strong> for 6, 12, or 24 months. Set clear expectations with a legally compliant AST that protects both landlord and tenant.</>}
          primaryCTA={{ label: 'Get AST Template — £14.99', href: wizardLinkAST }}
          secondaryCTA={{ label: 'Compare Periodic Tenancy', href: '/rolling-tenancy-agreement' }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Any Fixed Term Length
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Break Clause Optional
            </span>
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Housing Act Compliant
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Fixed Term vs Periodic */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Fixed Term vs Periodic Tenancy
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/5 rounded-xl p-6 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                      RECOMMENDED
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                    <h3 className="text-xl font-bold text-gray-900">Fixed Term Tenancy</h3>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-3 mb-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Set end date (6, 12, 24 months)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Cannot be ended early without break clause</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rent guaranteed for the term</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>More security for both parties</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500">Best for: Most tenancies, especially new lettings</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <RefreshCcw className="w-8 h-8 text-gray-500" />
                    <h3 className="text-xl font-bold text-gray-900">Periodic Tenancy</h3>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-3 mb-4">
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>Rolls month-to-month (no end date)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>Either party can end with notice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>More flexibility, less certainty</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>Becomes automatic after fixed term</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500">Best for: Post fixed-term, flexible situations</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Fixed Term Lengths */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Common Fixed Term Lengths
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <Link href="/6-month-tenancy-agreement-template" className="block bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                  <div className="text-3xl font-bold text-primary mb-2">6 Months</div>
                  <p className="text-sm text-gray-600 mb-4">Short-term flexibility</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• New tenant trial period</li>
                    <li>• Uncertain future plans</li>
                    <li>• Corporate relocations</li>
                  </ul>
                  <div className="mt-4 text-primary text-sm font-medium flex items-center gap-1">
                    View template <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                <div className="bg-white rounded-xl p-6 border-2 border-primary relative">
                  <div className="absolute -top-3 right-4">
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">12 Months</div>
                  <p className="text-sm text-gray-600 mb-4">Industry standard</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Best balance of stability</li>
                    <li>• Annual rent review cycle</li>
                    <li>• Preferred by most tenants</li>
                  </ul>
                  <Link href={wizardLinkAST} className="mt-4 text-primary text-sm font-medium flex items-center gap-1">
                    Get template <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-gray-700 mb-2">24 Months</div>
                  <p className="text-sm text-gray-600 mb-4">Long-term stability</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Settled families</li>
                    <li>• Reduced turnover costs</li>
                    <li>• Reliable rental income</li>
                  </ul>
                  <Link href={wizardLinkAST} className="mt-4 text-gray-600 text-sm font-medium flex items-center gap-1">
                    Get template <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding Fixed Term Tenancy Agreements
              </h2>

              <p className="text-gray-700 mb-6">
                A <strong>fixed term tenancy agreement</strong> is the most common type of residential letting in
                England and Wales. It provides both landlord and tenant with certainty: the landlord knows they&apos;ll
                receive rent for the agreed period, and the tenant knows they have secure housing for that time.
              </p>

              <p className="text-gray-700 mb-6">
                The fixed term is a contract period during which neither party can unilaterally end the tenancy
                (subject to serious breach provisions). This security distinguishes it from a periodic (rolling)
                tenancy where either party can give notice at any time.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                How Fixed Term Tenancies Work
              </h3>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Start of Tenancy</h4>
                    <p className="text-sm text-gray-600">
                      Both parties sign the agreement specifying the fixed term length (e.g., 12 months from 1st March
                      to 28th February). The tenant pays the deposit and first month&apos;s rent, and moves in.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">During the Fixed Term</h4>
                    <p className="text-sm text-gray-600">
                      The tenancy runs for the agreed period. Rent is paid as agreed. Neither party can end early
                      unless there&apos;s a break clause, serious breach, or mutual agreement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">End of Fixed Term</h4>
                    <p className="text-sm text-gray-600">
                      Options: sign a new fixed term, let it become periodic (rolling), or end the tenancy.
                      No automatic termination — action must be taken to end.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Notice Requirements During Fixed Terms
              </h3>

              <p className="text-gray-700 mb-4">
                The key feature of a fixed term is that notice rules are different from periodic tenancies:
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Important: Section 21 Restrictions</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Landlords cannot serve a Section 21 notice that expires during the fixed term (unless
                      there&apos;s a break clause). You also cannot serve a Section 21 that expires within
                      the first 4 months of any AST. Plan your notice timing carefully.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto mb-8">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Party</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">During Fixed Term</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">After Fixed Term (Periodic)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-3 text-gray-700 font-medium">Landlord</td>
                      <td className="px-4 py-3 text-gray-700">
                        Cannot end early without break clause (except Section 8 for breach)
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        2 months notice (Section 21) or Section 8 grounds
                      </td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 font-medium">Tenant</td>
                      <td className="px-4 py-3 text-gray-700">
                        Cannot end early without break clause (liable for rent if leaves)
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        1 month notice (or as per agreement)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Break Clauses Explained
              </h3>

              <p className="text-gray-700 mb-4">
                A break clause is an optional provision that allows early termination of a fixed term. It typically
                specifies:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li><strong>Activation date:</strong> When the break can first be used (e.g., after 6 months of a 12-month term)</li>
                <li><strong>Notice period:</strong> How much notice is required (typically 1-2 months)</li>
                <li><strong>Who can use it:</strong> Landlord only, tenant only, or either party</li>
                <li><strong>Conditions:</strong> E.g., tenant must have paid all rent, property in good condition</li>
              </ul>

              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h4 className="font-semibold text-blue-900 mb-2">Example Break Clause</h4>
                <p className="text-sm text-blue-800 italic">
                  &quot;Either party may terminate this tenancy after the first 6 months by giving not less than
                  2 months&apos; written notice to the other party. Such notice shall not expire before the end
                  of the first 6 months of the tenancy.&quot;
                </p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                End of Fixed Term Options
              </h3>

              <p className="text-gray-700 mb-4">
                As the fixed term approaches its end, you have several options:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    To Continue the Tenancy
                  </h4>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li>• <strong>New fixed term:</strong> Sign a renewal agreement</li>
                    <li>• <strong>Go periodic:</strong> Do nothing — it rolls automatically</li>
                    <li>• <strong>Adjust rent:</strong> Agree new terms with a fresh agreement</li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-lg p-5 border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    To End the Tenancy
                  </h4>
                  <ul className="text-sm text-red-800 space-y-2">
                    <li>• <strong>Landlord:</strong> Serve Section 21 to expire on/after end date</li>
                    <li>• <strong>Tenant:</strong> Give 1 month notice to end on the last day</li>
                    <li>• <strong>Mutual:</strong> Agree in writing to surrender</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Choosing Your Fixed Term Length
              </h3>

              <p className="text-gray-700 mb-4">
                The right term length depends on your circumstances:
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="font-bold text-primary text-lg">6 months</div>
                  <div className="text-sm text-gray-600">
                    Best for testing new tenants, uncertain plans, or short-term needs. Minimum practical length
                    given Section 21 restrictions.
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border border-primary">
                  <div className="font-bold text-primary text-lg">12 months</div>
                  <div className="text-sm text-gray-600">
                    <strong>Most common choice.</strong> Aligns with annual cycles, provides good stability, allows
                    regular rent reviews.
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="font-bold text-primary text-lg">24+ months</div>
                  <div className="text-sm text-gray-600">
                    Best for settled families, reduced turnover, and long-term rental income certainty. Consider
                    including a break clause for flexibility.
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
        </div>
      </div>
    </section>

    <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />

    {/* CTA Section */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="final"
          title="Create Your Fixed Term Tenancy Agreement"
          description="Our AST templates let you set any fixed term length with optional break clauses. Fully compliant with the Housing Act 1988."
          jurisdiction="england"
        />

        {/* Disclaimer */}
        <SeoDisclaimer />

        {/* Related Links */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <RelatedLinks
              title="Related Resources"
              links={[
                productLinks.tenancyAgreement,
                landingPageLinks.tenancyTemplate,
                { title: '6 Month Tenancy Agreement', href: '/6-month-tenancy-agreement-template', description: 'Short-term fixed term template' },
                tenancyAgreementPageLinks.jointTenancy,
              ]}
            />
          </div>
        </section>

        {/* Last Updated */}
        <section className="py-8 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-gray-500">
                <strong>Last updated:</strong> January 2026. This guide reflects current AST requirements under
                the Housing Act 1988 and Tenant Fees Act 2019.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
