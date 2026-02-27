import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  ArrowRight,
  AlertTriangle,
  Shield,
  FileText,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { moneyClaimHeroConfig } from '@/components/landing/heroConfigs';
import { moneyClaimGuides, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'What If Tenant Defends Money Claim? 2026 | Landlord Guide',
  description:
    'What happens when a tenant defends your money claim. Common defences, how to respond, and preparing for a contested hearing.',
  keywords: [
    'tenant defends claim',
    'tenant defence',
    'money claim defence',
    'counterclaim tenant',
    'tenant disputes claim',
    'contested money claim',
    'landlord defence response',
    'tenant denial',
    'dispute money claim',
    'defended claim hearing',
  ],
  openGraph: {
    title: 'What If Tenant Defends Money Claim? 2026 | Landlord Guide',
    description:
      'How to handle a defended money claim and common tenant defences landlords face.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-tenant-defends'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-tenant-defends'),
  },
};

const faqs = [
  {
    question: 'What does it mean when a tenant "defends" a money claim?',
    answer:
      'When a tenant defends, they formally dispute your claim by filing a defence with the court. This means the case will proceed to allocation (usually small claims track for under £10,000) and eventually a hearing where a judge decides.',
  },
  {
    question: 'What are the most common tenant defences?',
    answer:
      'Common defences include: the property was already damaged (fair wear and tear), they paid the rent/bills you\'re claiming for, disrepair affected their enjoyment of the property, the deposit wasn\'t properly protected, and the amounts claimed are excessive.',
  },
  {
    question: 'Can the tenant make a counterclaim against me?',
    answer:
      'Yes. A counterclaim is when the tenant claims YOU owe THEM money. Common counterclaims include: return of deposit, compensation for disrepair, illegal fees charged, or harassment. Counterclaims are dealt with at the same hearing.',
  },
  {
    question: 'What happens after the tenant files a defence?',
    answer:
      'The court sends you a copy of the defence, then both parties complete allocation questionnaires. The court allocates the case to a track (usually small claims) and sets a hearing date. You\'ll need to prepare evidence for the hearing.',
  },
  {
    question: 'Should I settle if the tenant defends?',
    answer:
      'Consider the strength of your case, evidence quality, and costs vs. recovery. Settlement avoids hearing uncertainty. A tenant who defends might accept a reduced amount to avoid court stress. Negotiate before the hearing if appropriate.',
  },
  {
    question: 'How do I respond to a defence about fair wear and tear?',
    answer:
      'Fair wear and tear is the most common defence for damage claims. Counter it with: detailed inventory at start of tenancy, dated photos showing condition before/after, professional cleaning or repair reports, and evidence the damage exceeds normal use.',
  },
  {
    question: 'The tenant says they paid - how do I prove they didn\'t?',
    answer:
      'Provide complete rent statements, bank records showing no matching deposits, and any payment confirmations you sent. If they claim bank transfer, ask them to prove it with their bank statement. The burden shifts to them if you show no record of payment.',
  },
  {
    question: 'What if the tenant counterclaims for disrepair?',
    answer:
      'Review your repair records and response times. A disrepair counterclaim typically needs: evidence of the disrepair, proof they reported it to you, evidence you failed to repair in reasonable time, and proof of loss/inconvenience caused.',
  },
  {
    question: 'How long does a defended claim take?',
    answer:
      'Once defended, expect 2-4 months to reach a hearing. The timeline includes: defence response (14-33 days), allocation questionnaire stage (2-4 weeks), and waiting for hearing date (varies by court).',
  },
  {
    question: 'Can I add more evidence after the tenant defends?',
    answer:
      'Yes. After seeing their defence, you can gather additional evidence to counter their arguments. Send copies of any new evidence to both the court and the defendant before the hearing deadline set by the court.',
  },
];

export default function MoneyClaimTenantDefendsPage() {
  const hero = {
    ...moneyClaimHeroConfig,
    trustText: 'Solicitor-grade • Compliance-checked • Court-ready',
    primaryCta: {
      label: 'Start Money Claim →',
      href: '/wizard?product=money_claim&topic=debt&src=seo_money-claim-tenant-defends',
    },
    secondaryCta: {
      label: 'View Money Claim Pack →',
      href: '/products/money-claim',
    },
    title: 'Tenant Defended Your Money Claim?',
    subtitle:
      'Respond with a legally validated, solicitor-grade strategy and evidence plan for a stronger hearing position.',
  };

  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'What If Tenant Defends Money Claim? (UK Landlord Guide)',
          description:
            'How to handle a defended money claim including common defences and responses.',
          url: getCanonicalUrl('/money-claim-tenant-defends'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Tenant Defends', url: 'https://landlordheaven.co.uk/money-claim-tenant-defends' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        <HeaderConfig mode="autoOnScroll" />

        <UniversalHero {...hero} />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-rose-900 to-rose-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-rose-700/50 text-rose-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                When they fight back
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                What If the Tenant Defends?
              </h2>

              <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
                Your tenant has filed a defence to your money claim. Here&apos;s what to
                expect, common defences, and how to prepare for a contested hearing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&topic=debt&src=seo_money-claim-tenant-defends"
                  className="inline-flex items-center justify-center gap-2 bg-white text-rose-800 font-semibold py-4 px-8 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  Start Money Claim
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

        {/* Understanding Defence Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding Tenant Defences
              </h2>

              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-lg text-gray-600">
                  When a tenant defends your money claim, they&apos;re telling the court they
                  don&apos;t agree they owe you the money (or all of it). This means your
                  case will go to a hearing where a judge decides based on the evidence
                  both sides present.
                </p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Don&apos;t panic:</strong> Many tenants file generic defences hoping
                    you&apos;ll drop the claim. A defence doesn&apos;t mean you&apos;ll lose - it means
                    you&apos;ll need to prove your case at a hearing. With good evidence, most
                    landlord claims succeed.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-rose-600" />
                    <h3 className="font-bold text-gray-900">Full Defence</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Tenant disputes the whole claim. They deny owing any of the amount
                    claimed. Case goes to hearing for judge to decide.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-6 h-6 text-amber-600" />
                    <h3 className="font-bold text-gray-900">Partial Defence</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Tenant admits some but not all of the claim. You can get judgment
                    for the admitted amount; the disputed part goes to hearing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Defences Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Common Tenant Defences &amp; How to Counter
              </h2>

              <div className="space-y-6">
                {/* Fair Wear and Tear */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        &quot;It&apos;s fair wear and tear&quot;
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        The tenant claims damage is normal use, not their fault.
                      </p>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-800 text-sm mb-2">Your response:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Provide detailed inventory from start of tenancy</li>
                          <li>• Show before/after photos with dates</li>
                          <li>• Get professional assessment of damage cause</li>
                          <li>• Compare tenancy length vs. extent of damage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Already Paid */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        &quot;I already paid&quot;
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        The tenant claims they paid the rent/amount you&apos;re claiming.
                      </p>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-800 text-sm mb-2">Your response:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Provide complete rent ledger/statements</li>
                          <li>• Show bank statements with no matching deposits</li>
                          <li>• Ask them to prove payment with their bank records</li>
                          <li>• Note: burden shifts to them if you show no record</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disrepair */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        &quot;The property was in disrepair&quot; (counterclaim)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Tenant claims you didn&apos;t maintain the property, wants compensation.
                      </p>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-800 text-sm mb-2">Your response:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Show repair request records and response times</li>
                          <li>• Provide contractor invoices showing repairs done</li>
                          <li>• Show correspondence about reported issues</li>
                          <li>• Challenge if they never reported the problem</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deposit Issues */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        &quot;Deposit wasn&apos;t protected&quot; (counterclaim)
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Tenant claims deposit protection failures, seeks compensation.
                      </p>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-800 text-sm mb-2">Your response:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Provide deposit protection certificate</li>
                          <li>• Show prescribed information was served</li>
                          <li>• If issues exist, seek legal advice - penalties can be severe</li>
                          <li>• Note: this doesn&apos;t excuse their debt to you</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amounts Excessive */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        &quot;The amounts are excessive&quot;
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Tenant accepts some damage/debt but disputes the cost.
                      </p>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-800 text-sm mb-2">Your response:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Provide multiple quotes for repairs</li>
                          <li>• Show actual invoices for work done</li>
                          <li>• Compare to market rates in your area</li>
                          <li>• Be prepared to negotiate on disputed amounts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What to Do When They Defend
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Read the Defence Carefully</h3>
                    <p className="text-gray-600 text-sm">
                      Understand exactly what they&apos;re disputing. Are they denying everything
                      or just part? Do they have a counterclaim?
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Gather Counter-Evidence</h3>
                    <p className="text-gray-600 text-sm">
                      For each point in their defence, gather evidence that contradicts it.
                      Photos, documents, receipts, witness statements.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Complete Allocation Questionnaire</h3>
                    <p className="text-gray-600 text-sm">
                      The court will send Form N180. Complete it honestly, stating
                      the small claims track is appropriate if under £10,000.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Consider Settlement</h3>
                    <p className="text-gray-600 text-sm">
                      Before the hearing, consider whether a negotiated settlement makes
                      sense. Sometimes a guaranteed smaller amount is better than an uncertain
                      larger one.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Prepare for Hearing</h3>
                    <p className="text-gray-600 text-sm">
                      Organise your evidence bundle, prepare what you&apos;ll say, and practice
                      explaining your case clearly and concisely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Starting a New Money Claim?
              </h2>
              <p className="text-gray-600 mb-8">
                Build a strong case from the start. Our Money Claim Pack includes
                professionally drafted documents and guidance on evidence gathering.
              </p>
              <Link
                href="/wizard?product=money_claim&topic=debt&src=seo_money-claim-tenant-defends"
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
        <section className="py-12 lg:py-16">
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
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Guides
              </h2>
              <RelatedLinks
                links={[
                  moneyClaimGuides.smallClaimsCourt,
                  moneyClaimGuides.mcolProcess,
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
