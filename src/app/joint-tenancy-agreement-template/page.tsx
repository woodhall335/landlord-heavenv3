import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementEnglandLinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';

export const metadata: Metadata = {
  title: 'Joint Tenancy Agreement UK 2026 | Legally Validated',
  description: 'Create a joint tenancy agreement for multiple tenants in England with solicitor-grade wording and compliance-checked clauses.',
  keywords: [
    'joint tenancy agreement template',
    'multiple tenants tenancy agreement',
    'joint AST template',
    'shared house tenancy agreement',
    'joint and several liability',
    'multiple tenant agreement',
    'flatmates tenancy contract',
    'house share agreement',
    'joint tenant rent responsibility',
    'couples tenancy agreement',
  ],
  alternates: {
    canonical: getCanonicalUrl('/joint-tenancy-agreement-template'),
  },
  openGraph: {
    title: 'Joint Tenancy Agreement UK 2026 | Legally Validated',
    description: 'Legally validated joint tenancy agreement for England with joint and several liability clauses.',
    type: 'article',
    url: getCanonicalUrl('/joint-tenancy-agreement-template'),
  },
};

const faqs = [
  {
    question: 'What is a joint tenancy agreement?',
    answer: 'A joint tenancy agreement is an Assured Shorthold Tenancy (AST) where two or more people are named as tenants on a single contract. All named tenants have equal rights to occupy the entire property and are collectively responsible for all obligations under the agreement. This is the standard arrangement for couples, friends sharing a flat, or any situation where multiple unrelated adults rent together.',
  },
  {
    question: 'What is joint and several liability and why does it matter?',
    answer: 'Joint and several liability means each tenant is individually responsible for the FULL rent amount, not just their share. If one tenant leaves or stops paying, the remaining tenants must cover the entire rent between them. This clause is essential for landlord protection — without it, you could only pursue each tenant for their calculated share, making rent recovery much harder when one tenant defaults.',
  },
  {
    question: 'How many tenants can be on a joint tenancy agreement?',
    answer: 'There is no legal maximum, but practical considerations apply. Most joint tenancies have 2-4 tenants. Properties with 5 or more unrelated tenants may be classed as Houses in Multiple Occupation (HMOs), triggering additional licensing requirements. Our wizard supports multiple tenants and, for 5+ tenants, we recommend our Premium AST which includes HMO-specific provisions.',
  },
  {
    question: 'Can one joint tenant leave before the tenancy ends?',
    answer: 'During a fixed term, tenants cannot unilaterally leave — they remain liable for rent even if they move out. After the fixed term (during a periodic tenancy), any single joint tenant can give notice to end the ENTIRE tenancy for ALL tenants. This is a key risk of joint tenancies that landlords and tenants should understand. The agreement continues if all remaining tenants agree to a new arrangement.',
  },
  {
    question: 'How is the deposit handled with multiple tenants?',
    answer: 'For a joint tenancy, a single deposit is taken (subject to Tenant Fees Act limits: 5 weeks for rent under £50,000/year). The deposit is held for all tenants collectively. At tenancy end, any deductions apply against the total deposit. If tenants disagree about how to split returned deposit between themselves, that is a matter between them — not the landlord\'s concern.',
  },
  {
    question: 'What happens if joint tenants disagree about something?',
    answer: 'Under a joint tenancy, tenants must act together on tenancy matters. If they disagree about giving notice, making changes, or other tenancy decisions, they need to resolve it between themselves. Landlords generally deal with joint tenants as a single entity. For this reason, many landlords designate a "lead tenant" for communication purposes, though all tenants remain equally liable.',
  },
  {
    question: 'Is a joint tenancy agreement different from individual room agreements?',
    answer: 'Yes, significantly. With a joint tenancy, all tenants share responsibility for the whole property. With individual room agreements (common in HMOs), each tenant has their own contract for their room and shared areas — they are only responsible for their own rent. Individual agreements give landlords more control but require more administration and proper HMO licensing.',
  },
  {
    question: 'Can I add or remove a tenant during the tenancy?',
    answer: 'Removing a tenant requires agreement from ALL parties (landlord and all tenants) and should be documented via a deed of surrender/assignment or a new tenancy agreement. Adding a tenant similarly requires a new or amended agreement. You cannot simply cross out or add names — the original agreement terms apply to original signatories.',
  },
  {
    question: 'How do I evict one tenant from a joint tenancy?',
    answer: 'You cannot evict just one joint tenant — eviction notices apply to the entire tenancy. If one tenant is causing problems, your options are: (1) Wait for the tenancy to become periodic and accept notice from one of the other tenants to end the whole tenancy, then offer a new tenancy to the remaining tenants; (2) Serve notice on the whole tenancy and start fresh. The problematic tenant remains liable for their period of the tenancy.',
  },
  {
    question: 'What if one joint tenant stops paying rent?',
    answer: 'With joint and several liability, you can pursue any or all tenants for any unpaid rent. Most landlords ask the remaining tenants to cover the shortfall (as they are legally obligated to). You can also pursue the non-paying tenant through money claims. If rent remains unpaid, you can serve Section 8 notice (Ground 8/10/11) on the entire tenancy.',
  },
  {
    question: 'Should couples use a joint tenancy agreement?',
    answer: 'Generally yes. A joint tenancy ensures both partners have equal rights and both are responsible for rent. If only one partner is named, the other has no tenancy rights and could be asked to leave at any time. Joint tenancy also means if the relationship ends, neither can unilaterally claim the property — they must negotiate or involve the landlord in creating a new arrangement.',
  },
  {
    question: 'Do all joint tenants need to sign the agreement?',
    answer: 'Yes. Every named tenant must sign the tenancy agreement for it to be binding on them. We recommend all tenants sign in the same session with the landlord present, and that you provide each tenant with a complete copy. Our wizard generates signature blocks for all tenants you specify.',
  },
];

export default function JointTenancyAgreementTemplatePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Joint Tenancy Agreement Template UK 2026',
          description: 'Create a joint tenancy agreement for multiple tenants in England.',
          url: getCanonicalUrl('/joint-tenancy-agreement-template'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          { name: 'Joint Tenancy Agreement', url: 'https://landlordheaven.co.uk/joint-tenancy-agreement-template' },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <UniversalHero
          title="Joint Tenancy Agreement"
          subtitle="Generate a legally validated joint tenancy agreement with compliance-checked clauses for multiple tenants."
          primaryCta={{ label: "Start now", href: "/wizard?product=ast_standard&topic=tenancy&src=seo_joint_tenancy_agreement_template&jurisdiction=england" }}
          showTrustPositioningBar
          hideMedia
        />
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products/ast" className="hover:text-blue-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Joint Tenancy</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Multiple Tenants
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Joint Tenancy Agreement Template
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Renting to <strong>couples, flatmates, or house-sharers</strong>? Our joint tenancy agreement
              includes essential <strong>joint and several liability</strong> clauses that protect you when
              multiple tenants share responsibility for rent and property care.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&topic=tenancy&src=seo_joint_tenancy_agreement_template&jurisdiction=england"
                className="inline-flex items-center gap-2 bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Standard AST — £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&topic=tenancy&src=seo_joint_tenancy_agreement_template&jurisdiction=england"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Premium AST — £24.99
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">Supports 2+ tenants • Joint liability included • Instant PDF</p>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 bg-white border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Joint & Several Liability
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Multiple Tenant Support
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                HMO Compatible (Premium)
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Deposit Rules Compliant
              </span>
            </div>
          </div>
        </section>

        {/* Why Joint Tenancy Matters */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why You Need a Proper Joint Tenancy Agreement</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                When renting to multiple tenants — whether couples, friends, or professional house-sharers — the
                dynamics are fundamentally different from single-tenant lettings. Without proper provisions,
                landlords face significant risks:
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                <h3 className="font-semibold text-red-900">The Rent Gap Problem</h3>
                <p className="text-red-800">
                  Without <strong>joint and several liability</strong>, if three tenants pay £500 each (£1,500 total)
                  and one leaves, you can only pursue them for their £500 share. The remaining tenants aren&apos;t
                  legally obligated to cover the gap, leaving you £500/month short.
                </p>
              </div>
              <p>
                Our joint tenancy template ensures every tenant is individually liable for the full rent.
                If one stops paying or leaves, you can pursue any tenant for the entire amount. This is
                the single most important protection for landlords with multiple tenants.
              </p>
            </div>
          </div>
        </section>

        {/* Joint vs Individual Comparison */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Joint Tenancy vs Individual Room Agreements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-indigo-200">
                <h3 className="text-xl font-semibold text-indigo-900 mb-4">Joint Tenancy (This Template)</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Single agreement for all tenants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Each tenant liable for FULL rent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Tenants can&apos;t be evicted individually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>One notice ends entire tenancy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Best for: Couples, friends, stable groups</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-800"><strong>Recommended for:</strong> 2-4 tenants who know each other</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Individual Room Agreements</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Separate agreement per tenant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Each tenant only liable for their room rent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Landlord can evict individual tenants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>More administrative complexity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Usually requires HMO licence</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600"><strong>Better for:</strong> Professional HMO landlords with high turnover</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Clauses */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Clauses in Our Joint Tenancy Template</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">Joint and Several Liability</h3>
                <p className="text-gray-600">Explicit clause making each tenant individually responsible for 100% of rent and other obligations. This is your primary protection.</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">Collective Deposit Handling</h3>
                <p className="text-gray-600">Clear terms explaining the deposit is held for all tenants collectively, with deductions applied to total deposit regardless of which tenant caused damage.</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">Lead Tenant Designation</h3>
                <p className="text-gray-600">Option to designate a lead tenant for communication purposes while maintaining equal liability for all parties.</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">Collective Decision Requirements</h3>
                <p className="text-gray-600">Provisions explaining that certain actions (like giving notice) require agreement of all tenants or apply to all equally.</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">Continuation After Fixed Term</h3>
                <p className="text-gray-600">Clear explanation of how the tenancy becomes periodic and the implications for all joint tenants.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <SeoCtaBlock
          showTrustPositioningBar
          pageType="tenancy"
          variant="section"
          jurisdiction="england"
          title="Protect Yourself with Proper Joint Tenancy Terms"
          description="Don't risk rent gaps from departing tenants. Get joint and several liability built into your agreement."
        />

        {/* Scenarios */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Common Joint Tenancy Scenarios</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Couple Renting Together</h3>
                <p className="text-gray-600 mb-3">
                  Both partners should be named on the agreement. This ensures both have tenancy rights
                  and both are liable for rent. If they separate, neither can unilaterally claim the property.
                </p>
                <p className="text-sm text-indigo-600">Recommended: Standard AST (£14.99)</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Friends Sharing a Flat</h3>
                <p className="text-gray-600 mb-3">
                  Joint tenancy works well for friends who know and trust each other. Joint liability
                  means they&apos;ll sort out rent collection between themselves.
                </p>
                <p className="text-sm text-indigo-600">Recommended: Standard AST (£14.99) for 2-4 friends</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">House Share (5+ tenants)</h3>
                <p className="text-gray-600 mb-3">
                  May be classified as an HMO requiring a licence. Premium AST includes HMO provisions
                  and shared area clauses. Consider individual agreements for high-turnover properties.
                </p>
                <p className="text-sm text-indigo-600">Recommended: Premium AST (£24.99)</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Family Members</h3>
                <p className="text-gray-600 mb-3">
                  Adult family members renting together should all be named. This gives everyone
                  equal rights and responsibilities rather than one person having all the liability.
                </p>
                <p className="text-sm text-indigo-600">Recommended: Standard AST (£14.99)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-sell */}
        <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl mx-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">When Joint Tenancies Go Wrong</h2>
            <p className="text-gray-700 mb-6">
              Even with proper agreements, multi-tenant situations can become complicated.
              We have products for when you need to take further action:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/products/notice-only" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Eviction Notices — £34.99</h3>
                <p className="text-sm text-gray-600">Section 21 or Section 8 to end the entire joint tenancy</p>
              </Link>
              <Link href="/products/money-claim" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Money Claims — £44.99</h3>
                <p className="text-sm text-gray-600">Recover rent arrears from any or all joint tenants</p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />

        {/* Final CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="final"
          jurisdiction="england"
        />

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <RelatedLinks
            title="Related Resources"
            links={tenancyAgreementEnglandLinks}
          />
        </section>

        {/* Disclaimer */}
        <SeoDisclaimer className="max-w-4xl mx-auto px-4 pb-12" />
      </main>
    </>
  );
}
