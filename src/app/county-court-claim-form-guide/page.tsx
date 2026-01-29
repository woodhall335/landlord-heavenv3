import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  productLinks,
  guideLinks,
  toolLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import {
  CheckCircle,
  FileText,
  Scale,
  Shield,
  AlertTriangle,
  PoundSterling,
  ClipboardList,
  HelpCircle,
} from 'lucide-react';

const wizardLinkMoneyClaim = buildWizardLink({
  product: 'money_claim',
  jurisdiction: 'england',
  src: 'guide',
});

const wizardLinkCompletePack = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'guide',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'County Court Claim Form Guide UK 2026 — N1, N5, N5B Forms Explained',
  description: 'Complete guide to county court claim forms for UK landlords. Learn which form to use for money claims (N1), possession claims (N5), and accelerated possession (N5B). Fees, process, and timelines.',
  keywords: [
    'county court claim form',
    'n1 claim form',
    'n5 form',
    'n5b form',
    'money claim form',
    'possession claim form',
    'court claim forms landlord',
    'county court forms',
    'landlord court forms',
    'mcol claim form',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/county-court-claim-form-guide',
  },
  openGraph: {
    title: 'County Court Claim Form Guide UK 2026 | Landlord Heaven',
    description: 'Which court form do you need? Complete guide to N1, N5, and N5B forms for landlord claims.',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'What county court claim form do I need as a landlord?',
    answer: 'It depends on your claim type. Use Form N1 for money claims (unpaid rent, damages). Use Form N5 for standard possession claims (Section 8 eviction). Use Form N5B for accelerated possession claims (Section 21 eviction). You can combine possession and money claims using Form N5.',
  },
  {
    question: 'How much does it cost to file a county court claim form?',
    answer: 'Court fees vary by claim type and amount. Money claims cost £35-£455 depending on the amount claimed (online via MCOL is cheaper). Possession claims (N5/N5B) cost £355. If you later need a bailiff warrant, add £130.',
  },
  {
    question: 'Can I file county court claim forms online?',
    answer: 'Yes, for money claims you can use Money Claim Online (MCOL) at moneyclaims.service.gov.uk. Possession claims must currently be filed by post or in person at your local county court.',
  },
  {
    question: 'What is the difference between Form N1 and Form N5?',
    answer: 'Form N1 is for money-only claims (e.g., recovering unpaid rent after tenant has left). Form N5 is for possession claims where you want to regain your property, and can include a money claim too. If you need both possession AND money, use N5.',
  },
  {
    question: 'How long does a county court claim take?',
    answer: 'Money claims via MCOL typically take 4-8 weeks if undefended. Possession claims take 6-12 weeks depending on whether accelerated (N5B, no hearing) or standard (N5, requires hearing). Add 4-6 weeks for enforcement if needed.',
  },
  {
    question: 'What happens after I submit a county court claim form?',
    answer: 'The court sends your claim to the defendant (tenant) who has 14-28 days to respond. If they don\'t respond, you can request a default judgment. If they defend, the case proceeds to a hearing.',
  },
  {
    question: 'Do I need a solicitor to file a county court claim?',
    answer: 'No, you can file claims yourself as a litigant in person. The forms have guidance notes and the small claims track (under £10,000) is designed for self-representation. However, for complex cases or high-value claims, legal advice may be worthwhile.',
  },
  {
    question: 'What evidence do I need for my court claim?',
    answer: 'For money claims: tenancy agreement, rent schedule, demand letters, and any correspondence. For possession claims: valid eviction notice, proof of service, compliance documents (deposit protection, gas safety, EPC), and photos of any property issues.',
  },
];

export default function CountyCourtClaimFormGuidePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'County Court Claim Form Guide UK',
    description: 'Complete guide to county court claim forms for UK landlords. N1, N5, and N5B forms explained.',
    url: 'https://landlordheaven.co.uk/county-court-claim-form-guide',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Guides', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
        { name: 'County Court Claim Form Guide', url: 'https://landlordheaven.co.uk/county-court-claim-form-guide' },
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="England & Wales"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="County Court Claim Form Guide UK"
          subtitle={<>Not sure which <strong>county court claim form</strong> to use? This guide explains Form N1, N5, and N5B — so you file the right claim the first time.</>}
          primaryCTA={{ label: 'Get Money Claim Pack — £99.99', href: wizardLinkMoneyClaim }}
          secondaryCTA={{ label: 'Need Possession Instead?', href: '/possession-claim-guide' }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              All Forms Pre-Filled
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Court-Ready Documents
            </span>
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Step-by-Step Guidance
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Quick Decision Guide */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Which County Court Claim Form Do You Need?
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {/* N1 Form */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <PoundSterling className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Form N1</h3>
                  <p className="text-sm text-gray-600 mb-4">Money claims only</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Unpaid rent after tenant left</li>
                    <li>• Property damage costs</li>
                    <li>• Deposit shortfall</li>
                    <li>• Utility bills owed</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <span className="text-xs text-blue-600 font-semibold">Fee: £35-£455 (based on amount)</span>
                  </div>
                </div>

                {/* N5 Form */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Form N5</h3>
                  <p className="text-sm text-gray-600 mb-4">Standard possession</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Section 8 eviction</li>
                    <li>• Grounds-based claims</li>
                    <li>• Can include money claim</li>
                    <li>• Requires court hearing</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <span className="text-xs text-purple-600 font-semibold">Fee: £355</span>
                  </div>
                </div>

                {/* N5B Form */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200 relative">
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      FASTEST
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Form N5B</h3>
                  <p className="text-sm text-gray-600 mb-4">Accelerated possession</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Section 21 eviction only</li>
                    <li>• No court hearing needed</li>
                    <li>• Paper-based decision</li>
                    <li>• Cannot claim money</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <span className="text-xs text-green-600 font-semibold">Fee: £355</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding County Court Claim Forms
              </h2>

              <p className="text-gray-700 mb-6">
                As a landlord, you may need to use the county court to recover money owed by a tenant or to regain
                possession of your property. The court system uses specific forms for different types of claims,
                and using the wrong form will delay your case or result in rejection.
              </p>

              <p className="text-gray-700 mb-6">
                This guide covers the three main <strong>county court claim forms</strong> landlords use: Form N1
                for money claims, Form N5 for standard possession, and Form N5B for accelerated possession.
                Understanding which form applies to your situation is the first step to a successful claim.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Form N1: Money Claims
              </h3>

              <p className="text-gray-700 mb-4">
                Form N1 is the standard claim form for recovering money through the county court. Landlords
                typically use this when:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li><strong>Tenant has already left</strong> — You need to recover unpaid rent, damages, or other costs</li>
                <li><strong>Deposit doesn&apos;t cover costs</strong> — The deposit was insufficient for the damage or arrears</li>
                <li><strong>Former tenant owes money</strong> — Chasing debt after the tenancy ended</li>
                <li><strong>Guarantor claim</strong> — Pursuing a guarantor for the tenant&apos;s debts</li>
              </ul>

              <p className="text-gray-700 mb-6">
                You can file N1 claims online through <strong>Money Claim Online (MCOL)</strong> at
                moneyclaims.service.gov.uk for claims up to £100,000. Online filing is cheaper (reduced court fees)
                and faster than postal applications.
              </p>

              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h4 className="font-bold text-blue-900 mb-2">N1 Court Fees (Online via MCOL)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Up to £300:</span>
                    <span className="font-semibold text-blue-800 ml-2">£35</span>
                  </div>
                  <div>
                    <span className="text-gray-600">£300.01-£500:</span>
                    <span className="font-semibold text-blue-800 ml-2">£50</span>
                  </div>
                  <div>
                    <span className="text-gray-600">£500.01-£1,000:</span>
                    <span className="font-semibold text-blue-800 ml-2">£70</span>
                  </div>
                  <div>
                    <span className="text-gray-600">£1,000.01-£1,500:</span>
                    <span className="font-semibold text-blue-800 ml-2">£80</span>
                  </div>
                  <div>
                    <span className="text-gray-600">£1,500.01-£3,000:</span>
                    <span className="font-semibold text-blue-800 ml-2">£115</span>
                  </div>
                  <div>
                    <span className="text-gray-600">£3,000.01-£5,000:</span>
                    <span className="font-semibold text-blue-800 ml-2">£205</span>
                  </div>
                  <div>
                    <span className="text-gray-600">£5,000.01-£10,000:</span>
                    <span className="font-semibold text-blue-800 ml-2">£455</span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Form N5: Standard Possession Claims
              </h3>

              <p className="text-gray-700 mb-4">
                Form N5 is used when you want to regain possession of your property through the court.
                This is the standard route for:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li><strong>Section 8 evictions</strong> — Grounds-based possession (rent arrears, breach, ASB)</li>
                <li><strong>Section 21 with money claim</strong> — If you need possession AND want to claim arrears</li>
                <li><strong>Complex cases</strong> — Where a hearing is beneficial to present your case</li>
              </ul>

              <p className="text-gray-700 mb-6">
                N5 claims always require a court hearing, where a judge reviews the evidence and makes a
                decision. This takes longer than accelerated possession but allows you to claim money at the
                same time and is required for Section 8 notices.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Form N5B: Accelerated Possession
              </h3>

              <p className="text-gray-700 mb-4">
                Form N5B is the fastest route to possession — but it&apos;s only available for Section 21
                (no-fault) evictions. Key characteristics:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li><strong>Paper-based decision</strong> — Usually no court hearing required</li>
                <li><strong>Faster timeline</strong> — Typically 6-8 weeks vs 10-12 weeks for N5</li>
                <li><strong>Section 21 only</strong> — Cannot be used for Section 8 grounds</li>
                <li><strong>No money claim</strong> — You must file separately for arrears (Form N1)</li>
              </ul>

              <p className="text-gray-700 mb-6">
                The accelerated procedure works because Section 21 is a &quot;no-fault&quot; notice — the court
                only checks whether your notice was valid, not whether eviction is reasonable. If your Section 21
                is valid, the court must grant possession.
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Important: N5B Requirements</p>
                    <p className="text-sm text-amber-800 mt-1">
                      To use Form N5B, you must have a valid Section 21 notice, an assured shorthold tenancy,
                      a written tenancy agreement, and full compliance with deposit protection, gas safety,
                      EPC, and How to Rent requirements. Any defect may result in the claim being transferred
                      to the standard track (N5).
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                How to Complete County Court Claim Forms
              </h3>

              <p className="text-gray-700 mb-4">
                Regardless of which form you use, the key sections are similar:
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Claimant Details</h4>
                    <p className="text-sm text-gray-600">Your full name and address as the landlord (or managing agent details if applicable).</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Defendant Details</h4>
                    <p className="text-sm text-gray-600">Tenant&apos;s full name and last known address. For former tenants, use their new address if known.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Particulars of Claim</h4>
                    <p className="text-sm text-gray-600">A clear statement of what you&apos;re claiming and why. Include dates, amounts, and relevant facts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Statement of Truth</h4>
                    <p className="text-sm text-gray-600">Your signature confirming the facts stated are true. False statements can be contempt of court.</p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Evidence Required for Court Claims
              </h3>

              <p className="text-gray-700 mb-4">
                Strong evidence is essential for a successful claim. Gather these documents before filing:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <PoundSterling className="w-5 h-5 text-blue-600" />
                    For Money Claims (N1)
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Signed tenancy agreement</li>
                    <li>• Rent schedule showing arrears</li>
                    <li>• Bank statements showing non-payment</li>
                    <li>• All demand letters sent</li>
                    <li>• Photos of property damage</li>
                    <li>• Repair invoices/quotes</li>
                    <li>• Correspondence with tenant</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    For Possession Claims (N5/N5B)
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Valid eviction notice (S21 or S8)</li>
                    <li>• Proof of service (signature/receipt)</li>
                    <li>• Tenancy agreement</li>
                    <li>• Deposit protection certificate</li>
                    <li>• Gas safety certificate</li>
                    <li>• EPC certificate</li>
                    <li>• How to Rent guide (proof given)</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Timeline: What Happens After You File
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold text-primary">Day 1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">File your claim</p>
                    <p className="text-sm text-gray-600">Submit form with court fee. Court issues claim number.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold text-primary">Week 1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Court serves defendant</p>
                    <p className="text-sm text-gray-600">Tenant receives claim pack with response forms.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold text-primary">Week 3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Response deadline</p>
                    <p className="text-sm text-gray-600">14 days to respond (money) or 14-28 days (possession).</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold text-primary">Week 4-8</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Judgment or hearing</p>
                    <p className="text-sm text-gray-600">Default judgment if no response, or hearing date set.</p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-8">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6 mb-12">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 pl-8">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <SeoCtaBlock
          pageType="court"
          variant="final"
          title="Get Court-Ready Documents"
          description="Our packs include pre-filled court forms, evidence checklists, and step-by-step filing instructions."
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
                productLinks.moneyClaim,
                productLinks.completePack,
                guideLinks.moneyClaimGuide,
                guideLinks.possessionClaimGuide,
                toolLinks.rentArrearsCalculator,
              ]}
            />
          </div>
        </section>

        {/* Last Updated */}
        <section className="py-8 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-gray-500">
                <strong>Last updated:</strong> January 2026. Court fees and procedures are reviewed regularly.
                Always check the latest fees on the{' '}
                <a
                  href="https://www.gov.uk/court-fees-what-they-are"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GOV.UK court fees page
                </a>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
