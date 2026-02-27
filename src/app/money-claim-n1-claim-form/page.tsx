import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  FileText,
  Download,
  ClipboardList,
  HelpCircle,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimForms, moneyClaimFormLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'N1 Claim Form for Landlords 2026 | How to Complete Guide',
  description:
    'How to complete the N1 claim form for money claims against tenants. Section-by-section guide with examples for landlord debt recovery.',
  keywords: [
    'N1 claim form',
    'N1 form guide',
    'money claim form',
    'complete N1 form',
    'N1 landlord',
    'court claim form',
    'particulars of claim',
    'N1 form example',
    'fill in N1 form',
    'N1 form template',
  ],
  openGraph: {
    title: 'N1 Claim Form for Landlords 2026 | How to Complete Guide',
    description:
      'Step-by-step guide to completing the N1 claim form for landlord money claims.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-n1-claim-form'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-n1-claim-form'),
  },
};

const faqs = [
  {
    question: 'What is the N1 claim form?',
    answer:
      'The N1 is the official court form for starting a civil money claim in England and Wales. It\'s the paper alternative to Money Claim Online (MCOL). You use it to claim money someone owes you, including tenants who owe rent, damage costs, or other debts.',
  },
  {
    question: 'Should I use the N1 form or Money Claim Online?',
    answer:
      'MCOL is generally faster and slightly cheaper. Use the paper N1 if: you don\'t have internet access, your claim is complex and doesn\'t fit MCOL character limits, or you prefer paper processes. Both create the same legal claim.',
  },
  {
    question: 'Where do I get the N1 form?',
    answer:
      'Download form N1 free from the gov.uk website or collect from your local county court. The form comes with notes for guidance (N1A). Always use the current version of the form.',
  },
  {
    question: 'What are "particulars of claim"?',
    answer:
      'The particulars of claim explain why the defendant owes you money. For landlord claims, this typically covers: the tenancy agreement, what the tenant was required to pay, what they didn\'t pay or what damage they caused, and the total amount claimed.',
  },
  {
    question: 'How much does it cost to submit an N1 form?',
    answer:
      'Court fees depend on claim amount: up to £300 costs £35, £300.01-£500 costs £50, £500.01-£1,000 costs £70, £1,000.01-£1,500 costs £80, £1,500.01-£3,000 costs £115, £3,000.01-£5,000 costs £205, £5,000.01-£10,000 costs £455.',
  },
  {
    question: 'Can I claim interest on the N1 form?',
    answer:
      'Yes. You can claim statutory interest at 8% per year on debts. Calculate interest from when the debt was due until your claim date. Include the interest calculation in your particulars of claim.',
  },
  {
    question: 'Where do I send the completed N1 form?',
    answer:
      'Send your completed N1 to the County Court Money Claims Centre (CCMCC) in Salford, or submit to your local county court. The CCMCC handles most money claims centrally. Include the court fee with your form.',
  },
  {
    question: 'How many copies of the N1 do I need?',
    answer:
      'Submit the original N1 plus one copy for each defendant. So for one tenant, send 2 copies. The court keeps one and serves the other on the defendant.',
  },
  {
    question: 'What happens after I submit the N1?',
    answer:
      'The court issues your claim and serves it on the defendant. They have 14 days to respond (can extend to 33 days). If they don\'t respond, you can request default judgment. If they defend, the case proceeds to allocation and hearing.',
  },
  {
    question: 'Can I amend the N1 after submitting?',
    answer:
      'Minor errors can sometimes be corrected. For significant changes, you may need to discontinue and start again, or apply to the court to amend. Get it right first time if possible.',
  },
];

export default function MoneyClaimN1ClaimFormPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'N1 Claim Form for Landlords: How to Complete Guide',
          description:
            'Step-by-step guide to completing the N1 claim form for landlord money claims.',
          url: getCanonicalUrl('/money-claim-n1-claim-form'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'N1 Claim Form', url: 'https://landlordheaven.co.uk/money-claim-n1-claim-form' },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-gray-50">
        <UniversalHero
          title="N1 Claim Form for Landlord Money Claims"
          subtitle="Build a legally validated, solicitor-grade, compliance-checked and court-ready debt claim package."
          primaryCta={{ label: "Start now", href: "/wizard?product=money_claim&topic=debt&src=seo_money_claim_n1_claim_form" }}
          showTrustPositioningBar
          hideMedia
        />
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-violet-900 to-violet-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-violet-700/50 text-violet-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <FileText className="w-4 h-4" />
                Court form guide
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                N1 Claim Form: Complete Guide
              </h2>

              <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
                How to complete the N1 claim form for money claims against tenants.
                Section-by-section instructions with landlord examples.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&topic=debt&src=seo_money_claim_n1_claim_form"
                  className="inline-flex items-center justify-center gap-2 bg-white text-violet-800 font-semibold py-4 px-8 rounded-xl hover:bg-violet-50 transition-colors"
                >
                  Generate Your Documents
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="https://www.gov.uk/government/publications/form-n1-claim-form-cpr-part-7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/20"
                >
                  <Download className="w-5 h-5" />
                  Download N1 from Gov.uk
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding the N1 Form
              </h2>

              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-lg text-gray-600">
                  The N1 is the standard court form for civil money claims in England and Wales.
                  While many landlords now use Money Claim Online (MCOL), the paper N1 form
                  remains useful for complex claims or when you prefer paper processes.
                </p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> Before submitting any court form, you must send
                    a Letter Before Action and wait 14 days. This is a Pre-Action Protocol
                    requirement that applies to both N1 and MCOL.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Use Paper N1 When:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Particulars won&apos;t fit MCOL character limit
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      You prefer paper-based processes
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Limited internet access
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Want to attach additional documents
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Use MCOL When:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      You want faster processing (same day)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Slightly lower court fees
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Online tracking of claim status
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Standard straightforward claims
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section by Section Guide */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Completing the N1: Section by Section
              </h2>

              <div className="space-y-6">
                {/* Claimant Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Section 1: Claimant Details</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Your details as the person making the claim.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
                        <p className="font-medium text-gray-700 mb-2">Include:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Your full name (as landlord/property owner)</li>
                          <li>• Your address (can be business address)</li>
                          <li>• Contact telephone number</li>
                          <li>• Email address (optional but helpful)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Defendant Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Section 2: Defendant Details</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Details of the tenant(s) you&apos;re claiming against.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
                        <p className="font-medium text-gray-700 mb-2">Include:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Tenant&apos;s full legal name (as on tenancy agreement)</li>
                          <li>• Their current address (where they can be served)</li>
                          <li>• If multiple tenants, list each as separate defendant</li>
                          <li>• Check spelling matches tenancy agreement exactly</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brief Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Section 3: Brief Details of Claim</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        A one-line summary of what the claim is about.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
                        <p className="font-medium text-gray-700 mb-2">Example:</p>
                        <p className="text-gray-600 italic">
                          &quot;Claim for unpaid rent and damage to residential property at
                          [property address] under assured shorthold tenancy agreement
                          dated [date].&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Section 4: Value</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        The total amount you&apos;re claiming.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
                        <p className="font-medium text-gray-700 mb-2">Include in total:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Principal debt (rent arrears, damage costs, etc.)</li>
                          <li>• Interest (8% statutory rate)</li>
                          <li>• Court fee (you can add this to your claim)</li>
                          <li>• Tick appropriate box for claim value range</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Particulars of Claim */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Particulars of Claim</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        The detailed explanation of your claim. This is the most important part.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm mb-4">
                        <p className="font-medium text-gray-700 mb-2">Must include:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• The tenancy agreement (property, parties, dates)</li>
                          <li>• What the tenant was required to do/pay</li>
                          <li>• What they failed to do/pay</li>
                          <li>• The breakdown of amounts claimed</li>
                          <li>• Interest calculation</li>
                          <li>• Statement of truth</li>
                        </ul>
                      </div>
                      <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                        <p className="text-violet-800 text-sm">
                          <strong>Tip:</strong> If your particulars are too long for the form,
                          write &quot;See attached Particulars of Claim&quot; and attach a separate
                          typed document.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Provide Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How Our Pack Helps
              </h2>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <p className="text-gray-600 mb-6">
                  Our Money Claim Pack generates professional court documents tailored to
                  your specific claim. You get:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Particulars of Claim</p>
                      <p className="text-sm text-gray-500">Ready to paste into N1 or MCOL</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Letter Before Action</p>
                      <p className="text-sm text-gray-500">Pre-Action Protocol compliant</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Interest Calculation</p>
                      <p className="text-sm text-gray-500">8% statutory interest computed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Step-by-Step Guide</p>
                      <p className="text-sm text-gray-500">For N1 and MCOL submission</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/wizard?product=money_claim&topic=debt&src=seo_money_claim_n1_claim_form"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Generate Your Documents — £99.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-sm text-gray-500 mt-3">
                  Court fees from £35 extra (paid to court separately)
                </p>
              </div>
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
                  moneyClaimForms.letterBeforeAction,
                  moneyClaimGuides.mcolProcess,
                  moneyClaimGuides.smallClaimsCourt,
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
