import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Monitor,
  FileText,
  Clock,
  PoundSterling,
  Send,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { FunnelCta, CrossSellBar } from '@/components/funnels';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimProcessLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Money Claim Online (MCOL) Guide for Landlords | Claim Unpaid Rent',
  description:
    'Money Claim Online (MCOL) guide for landlords recovering unpaid rent and tenant debt. Learn fees, timelines, evidence, and how to submit a stronger claim.',
  keywords: [
    'money claim online',
    'MCOL',
    'MCOL landlord',
    'online money claim',
    'court claim online',
    'MCOL guide',
    'submit money claim',
    'MCOL fees',
    'online court claim',
    'MCOL process',
  ],
  openGraph: {
    title: 'Money Claim Online (MCOL) Guide for Landlords | Claim Unpaid Rent',
    description:
      'Complete guide to using the Money Claim Online system for landlord tenant debt recovery.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-online-mcol'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-online-mcol'),
  },
};

const faqs = [
  {
    question: 'What is Money Claim Online (MCOL)?',
    answer:
      'Money Claim Online is the government\'s online system for making civil money claims up to £100,000 in England and Wales. It allows you to issue court claims without attending court, making it ideal for landlords recovering tenant debts.',
  },
  {
    question: 'How much does MCOL cost?',
    answer:
      'MCOL court fees depend on your claim amount: up to £300 costs £35, £300.01-£500 costs £50, £500.01-£1,000 costs £70, £1,000.01-£1,500 costs £80, £1,500.01-£3,000 costs £115, £3,000.01-£5,000 costs £205, £5,000.01-£10,000 costs £455. Higher amounts are a percentage of the claim.',
  },
  {
    question: 'How long does MCOL take?',
    answer:
      'After submission, the defendant has 14 days to respond (33 days for some). If they don\'t respond, you can request judgment after this period. If they defend, the case proceeds to a hearing which typically takes 2-4 months to schedule.',
  },
  {
    question: 'Do I need to attend court if I use MCOL?',
    answer:
      'Not always. If the defendant doesn\'t respond or admits the claim, you can get judgment without a hearing. If they defend or partially admit, you\'ll likely need a hearing. Many small claims hearings now offer telephone or video options.',
  },
  {
    question: 'Can I claim interest through MCOL?',
    answer:
      'Yes. You can claim statutory interest at 8% per year on debts. The system will ask about interest when you submit your claim. Calculate interest from when the debt was due until the claim date.',
  },
  {
    question: 'What documents do I need for MCOL?',
    answer:
      'You don\'t upload documents when submitting through MCOL. However, you need your claim details ready: defendant\'s name and address, amount claimed, particulars of claim (why they owe you), and interest calculation. Keep evidence for if the case goes to hearing.',
  },
  {
    question: 'The defendant\'s address might be wrong - can I still use MCOL?',
    answer:
      'You must provide a valid address for the defendant. If you\'re unsure of their current address, you may need to use tracing services first. MCOL claims served to wrong addresses will fail.',
  },
  {
    question: 'What happens if the tenant ignores my MCOL claim?',
    answer:
      'If they don\'t respond within 14 days (or extended period), you can request "default judgment" through the MCOL system. This gives you a court judgment without a hearing, which you can then enforce.',
  },
  {
    question: 'Can I use MCOL for claims over £10,000?',
    answer:
      'Yes, MCOL handles claims up to £100,000. However, claims over £10,000 won\'t be in the small claims track and have different rules. You may want legal representation for larger claims.',
  },
  {
    question: 'What\'s the difference between MCOL and the paper N1 form?',
    answer:
      'MCOL is faster (usually issued same day), slightly cheaper (reduced fees), and tracks your claim online. The paper N1 form goes to your local court and takes longer to process. Both create the same legal claim.',
  },
  {
    question: 'How detailed should my evidence bundle be?',
    answer: 'Include the signed agreement, full chronology, communication trail, service proof, and financial schedule. A clear indexed bundle reduces hearing delays and adjournments.',
  },
  {
    question: 'What if the tenant disputes the amount or facts?',
    answer: 'Reconcile your figures line by line against your ledger and tenancy terms, then evidence every step. Where disputes continue, present a neutral timeline with supporting documents.',
  },
];

export default function MoneyClaimOnlineMCOLPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Money Claim Online (MCOL) for Landlords: Complete Guide',
          description:
            'Step-by-step guide to using Money Claim Online for recovering tenant debts.',
          url: getCanonicalUrl('/money-claim-online-mcol'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Money Claim Online', url: 'https://landlordheaven.co.uk/money-claim-online-mcol' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-blue-700/50 text-blue-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Monitor className="w-4 h-4" />
                The official court claim system
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Money Claim Online (MCOL) for Landlords
              </h1>

              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Need to use Money Claim Online (MCOL) for unpaid rent? This guide explains exactly how landlords file, what court fees apply, and how to prepare evidence that supports faster recovery.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&src=seo_mcol_guide"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-800 font-semibold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Prepare Your MCOL Claim
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

        {/* What is MCOL Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What is Money Claim Online?
              </h2>

              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-lg text-gray-600">
                  Money Claim Online (MCOL) is the official government service for making
                  civil money claims in England and Wales. It&apos;s the most common way
                  landlords recover unpaid rent, damage costs, and other tenant debts
                  through the courts.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
                <p className="text-blue-900">
                  If your Letter Before Action has expired and payment is still outstanding, move straight into a
                  <Link href="/products/money-claim" className="font-semibold underline ml-1">court-ready Money Claim pack</Link>
                  so your particulars, evidence schedule, and filing steps stay aligned.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Fast Processing</h3>
                  <p className="text-sm text-gray-600">
                    Claims typically issued same day. Much faster than paper forms.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <PoundSterling className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Lower Fees</h3>
                  <p className="text-sm text-gray-600">
                    MCOL fees are slightly lower than paper claim fees.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Monitor className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Track Online</h3>
                  <p className="text-sm text-gray-600">
                    Monitor your claim status and respond to updates online.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Before you start:</strong> You must send a Letter Before Action
                    and wait 14 days before making a court claim. This is a Pre-Action Protocol
                    requirement.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MCOL Fees Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                MCOL Court Fees 2026
              </h2>

              <div className="overflow-x-auto mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-4 py-3 font-semibold">Claim Amount</th>
                      <th className="border border-gray-200 px-4 py-3 font-semibold">MCOL Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3">Up to £300</td>
                      <td className="border border-gray-200 px-4 py-3">£35</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">£300.01 - £500</td>
                      <td className="border border-gray-200 px-4 py-3">£50</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3">£500.01 - £1,000</td>
                      <td className="border border-gray-200 px-4 py-3">£70</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">£1,000.01 - £1,500</td>
                      <td className="border border-gray-200 px-4 py-3">£80</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3">£1,500.01 - £3,000</td>
                      <td className="border border-gray-200 px-4 py-3">£115</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">£3,000.01 - £5,000</td>
                      <td className="border border-gray-200 px-4 py-3">£205</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3">£5,000.01 - £10,000</td>
                      <td className="border border-gray-200 px-4 py-3">£455</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">£10,000.01 - £100,000</td>
                      <td className="border border-gray-200 px-4 py-3">5% of claim</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-gray-500">
                Fees are correct as of January 2026. You can add court fees to your claim amount.
                Additional fees apply if the case goes to a hearing.
              </p>
            </div>
          </div>
        </section>

        {/* MCOL Process Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The MCOL Process: Step by Step
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Send Letter Before Action</h3>
                    <p className="text-gray-600 text-sm">
                      Send a formal letter demanding payment and giving 14 days to respond.
                      This is required before court action.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Prepare Your Claim</h3>
                    <p className="text-gray-600 text-sm">
                      Gather defendant details, calculate total amount (including interest),
                      and write your particulars of claim explaining why they owe you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Submit Through MCOL</h3>
                    <p className="text-gray-600 text-sm">
                      Create an account on the MCOL website, enter your claim details,
                      and pay the court fee. Your claim is usually issued the same day.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Wait for Response</h3>
                    <p className="text-gray-600 text-sm">
                      The defendant has 14 days to respond (33 days if they need time to seek advice).
                      They can admit, defend, or ignore the claim.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Get Judgment or Hearing</h3>
                    <p className="text-gray-600 text-sm">
                      If they don&apos;t respond: request default judgment. If they admit: request
                      judgment by admission. If they defend: the case goes to a hearing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Our Pack Includes */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How Our Money Claim Pack Helps
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Send className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Letter Before Action</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Pre-Action Protocol compliant letter template customised to your
                    claim. Essential before starting MCOL.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Particulars of Claim</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Professionally drafted particulars ready to paste into MCOL.
                    Properly sets out your legal basis for the claim.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <PoundSterling className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Interest Calculation</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Automatic calculation of statutory interest at 8% per year,
                    ready to include in your MCOL submission.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Step-by-Step Guide</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Clear instructions for submitting your claim through MCOL,
                    requesting judgment, and enforcement options.
                  </p>
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
                Ready to Start Your MCOL Claim?
              </h2>
              <p className="text-gray-600 mb-8">
                Get your Letter Before Action, Particulars of Claim, and all documents
                ready for MCOL submission.
              </p>
              <Link
                href="/wizard?product=money_claim&src=seo_mcol_guide"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Prepare Your Claim — £99.99
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                Court fees from £35 extra (paid directly to MCOL)
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <CrossSellBar context="money-claim" location="mid" />
            </div>
          </div>
        </section>



        <section className="py-10 bg-white" id="snippet-opportunities">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>What Is Money Claim Online?</h2>
              <p>Money Claim Online is the HM Courts online service for issuing many county court debt claims in England and Wales. Landlords use it to recover unpaid rent when they seek a money judgment. The claim must include accurate amounts, dates, and supporting particulars.</p>

              <h2>How to Recover Rent Arrears</h2>
              <p>To recover rent arrears, landlords normally document the debt, send a Letter Before Action, allow a reasonable response period, and then issue a court claim if payment is not made. A complete rent schedule and tenancy evidence are essential to support judgment and enforcement.</p>

              <h2>How Long Does MCOL Take?</h2>
              <p>MCOL timing depends on whether the defendant pays, admits, or defends the claim. Uncontested cases can progress to judgment quickly, while defended claims take longer and may proceed to hearing. Court workload and document quality significantly affect total time to outcome.</p>

              <h2>N1 Claim Form</h2>
              <p>The N1 claim form is the county court claim form used to start many money claims, including rent arrears disputes outside simple online pathways. It sets out claimant and defendant details, the amount claimed, and particulars of claim. Precision is essential to avoid procedural delay.</p>

              <h3>MCOL vs Possession Claim</h3>
              <table>
                <thead>
                  <tr><th>Point</th><th>MCOL</th><th>Possession claim</th></tr>
                </thead>
                <tbody>
                  <tr><td>Main objective</td><td>Recover debt judgment</td><td>Recover property possession</td></tr>
                  <tr><td>Typical form path</td><td>Online claim or N1 route</td><td>N5/N119 or N5B route</td></tr>
                  <tr><td>Arrears evidence</td><td>Core focus of claim</td><td>Supports grounds and order terms</td></tr>
                  <tr><td>Outcome</td><td>CCJ and enforcement options</td><td>Possession order and enforcement</td></tr>
                </tbody>
              </table>

              <h3>Definition: Money Claim Online (MCOL)</h3>
              <p>Money Claim Online (MCOL) is a government digital platform for issuing and managing eligible county court money claims. It allows claimants to submit claim details, pay court fees, track responses, and request judgment when appropriate. It is commonly used for straightforward debt recovery cases.</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" id="guide-navigation">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Landlord Guide</h2>
              <p className="text-gray-700 mb-6">Use this expanded resource for the Money Claim Online debt recovery process for landlord arrears claims. It is designed for landlords who need practical steps, legal context, and clear evidence standards before serving notices or issuing court claims.</p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <a href="#legal-framework" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Legal framework</a>
                <a href="#step-by-step" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Step-by-step process</a>
                <a href="#mistakes" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Common mistakes</a>
                <a href="#evidence-checklist" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Evidence checklist</a>
                <a href="#timeline-breakdown" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Timeline breakdown</a>
                <a href="#comparison-table" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Comparison table</a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="legal-framework">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Legal Framework Explained for Landlords</h2>
              <p>Landlords get better outcomes when they treat document generation as one part of a full legal workflow. Courts and adjudicators are not only checking whether you used the right template, but also whether you followed the statutory sequence correctly, gave fair notice, and can prove service and compliance. In practice, failures usually happen because a landlord serves too early, uses the wrong dates, or cannot evidence how documents were served.</p>
              <p>The strongest approach is to work from statute to action: identify the governing rules, map those rules to your tenancy facts, then generate documents only after validation. That means confirming tenancy type, start date, rent schedule, deposit status, safety records, licensing, prior correspondence, and any relevant protocol steps. Doing this once in a structured way dramatically reduces avoidable delays and repeat filings.</p>
              <p>Jurisdiction matters at every stage. England, Wales, Scotland, and Northern Ireland have different possession frameworks and terminology, so always anchor your action plan to property location and tenancy regime before relying on any form wording. If you manage across multiple regions, keep separate compliance checklists and document packs for each jurisdiction to avoid cross-jurisdiction errors.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="step-by-step">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Step-by-Step Landlord Process</h2>
              <ol>
                <li><strong>Diagnose the case type:</strong> define whether your objective is debt recovery, possession, or both. This affects notice choice, court track, and evidence format.</li>
                <li><strong>Validate tenancy facts:</strong> check names, address, tenancy dates, rent frequency, rent due date, and occupant status against signed records.</li>
                <li><strong>Run compliance checks:</strong> confirm deposit and prescribed information position, statutory certificates, licensing duties, and any pre-action requirements.</li>
                <li><strong>Select the right pathway:</strong> choose notice-only, debt claim, or combined strategy based on arrears level, tenant behaviour, and timescale.</li>
                <li><strong>Prepare a clear chronology:</strong> build a dated timeline of rent events, correspondence, reminders, and evidence collection milestones.</li>
                <li><strong>Generate the document pack:</strong> produce accurate forms and letters with matching dates, amounts, and party details. Keep consistency across all documents.</li>
                <li><strong>Serve correctly:</strong> use permitted methods, serve all required attachments, and preserve proof of service and delivery attempts.</li>
                <li><strong>Track response windows:</strong> diarise notice expiry, payment deadlines, response dates, and court filing windows so deadlines are never missed.</li>
                <li><strong>Escalate with evidence:</strong> if no resolution, move to court or next notice stage using the same chronology and evidence bundle.</li>
                <li><strong>Keep communication professional:</strong> clear, factual communication often improves settlement chances and strengthens your position if litigation follows.</li>
              </ol>
              <p>This structured process is intentionally conservative. It prioritises enforceability over speed-at-all-costs and prevents rework. Where landlords skip steps, the usual outcome is not just delay; it is duplicated fees, repeated service, and weaker negotiating leverage.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="mistakes">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Common Mistakes That Cause Rejection or Delay</h2>
              <ul>
                <li>Using a generic document draft without checking tenancy type and jurisdiction.</li>
                <li>Serving before prerequisites are satisfied or without required enclosures.</li>
                <li>Date errors: invalid expiry dates, inconsistent chronology, or impossible timelines.</li>
                <li>Amount errors: rent arrears totals that do not reconcile to ledger entries.</li>
                <li>Weak service evidence: no certificate, no proof of posting, no witness notes.</li>
                <li>Switching strategy late without updating previous letters and chronology.</li>
                <li>Overly aggressive correspondence that undermines credibility in court.</li>
              </ul>
              <p>Most of these errors are preventable with a pre-service checklist and a single source of truth for dates and amounts. Keep a master timeline and update it every time you send or receive correspondence.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="evidence-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Evidence Checklist Before You Escalate</h2>
              <ul>
                <li>Signed tenancy/licence agreement and any renewals or variations.</li>
                <li>Rent schedule or ledger showing due dates, paid dates, and running balance.</li>
                <li>Copies of reminder letters, demand notices, and tenant responses.</li>
                <li>Proof of service for every formal document (post, email trail, witness, certificate).</li>
                <li>Compliance documents relevant to your pathway and jurisdiction.</li>
                <li>Chronology document mapping each event to supporting evidence.</li>
                <li>Settlement record where payment plans were offered or negotiated.</li>
              </ul>
              <p className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">Need a faster route from guidance to action? Use our <Link href="/products/money-claim" className="text-primary underline">recommended product pathway</Link> to generate compliance-checked documents and keep service evidence aligned for next steps.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="timeline-breakdown">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Timeline Breakdown</h2>
              <p><strong>Day 0-3:</strong> identify issue, verify tenancy facts, and begin chronology. <strong>Day 4-10:</strong> issue first formal communication and gather proof of service. <strong>Day 11-30:</strong> monitor response and update arrears or compliance records. <strong>Post-deadline:</strong> choose escalation route, finalise evidence bundle, and prepare filing-ready documents.</p>
              <p>Where deadlines are statutory, build in a safety margin and avoid last-day actions. If your process relies on post, include deemed service assumptions and non-delivery contingencies. If your process relies on email, keep complete metadata and sent-item logs.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="comparison-table">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy Comparison Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left">Route</th>
                      <th className="border border-gray-200 p-3 text-left">Best for</th>
                      <th className="border border-gray-200 p-3 text-left">Main risk</th>
                      <th className="border border-gray-200 p-3 text-left">Evidence priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3">Template-only self service</td>
                      <td className="border border-gray-200 p-3">Confident landlords with clean facts</td>
                      <td className="border border-gray-200 p-3">Date/compliance mistakes</td>
                      <td className="border border-gray-200 p-3">Service proof + chronology</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">Guided product workflow</td>
                      <td className="border border-gray-200 p-3">Most landlords needing speed + certainty</td>
                      <td className="border border-gray-200 p-3">Incomplete source information</td>
                      <td className="border border-gray-200 p-3">Validation outputs + attached records</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Immediate court escalation</td>
                      <td className="border border-gray-200 p-3">No response after valid notice/protocol</td>
                      <td className="border border-gray-200 p-3">Weak bundle preparation</td>
                      <td className="border border-gray-200 p-3">Complete documentary bundle</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>



        <section className="py-6 bg-gray-50" id="practical-scenarios">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Practical Landlord Scenarios and Decision Rules</h2>
              <p>Landlords rarely manage ideal cases. Real files usually include partial payment, incomplete paperwork, changing tenant communication, and competing objectives around speed, debt recovery, and possession certainty. For MCOL debt recovery, the best decision is usually the one that preserves options rather than forcing a single-route strategy too early. That is why experienced landlords separate diagnosis from document generation: first classify the problem, then choose the legal route, then build evidence that supports that route.</p>
              <p><strong>Scenario 1: Cooperative but financially stretched tenant.</strong> Start with a firm written plan, confirm the amount due, and set review points. Keep every communication factual and date-stamped. If payments fail twice, escalate immediately rather than allowing repeated informal extensions that weaken your position.</p>
              <p><strong>Scenario 2: No response after formal notice or arrears letter.</strong> Treat silence as a process signal. Move from reminder to formal stage according to your timeline, keep service proof, and avoid emotional wording. The absence of response often makes documentary quality more important, not less.</p>
              <p><strong>Scenario 3: Tenant disputes numbers.</strong> Provide a reconciliation schedule showing each charge, payment, and balance movement. Link each figure to source records. Courts and mediators favour landlords who can produce clear arithmetic and consistent chronology.</p>
              <p><strong>Scenario 4: Multiple tenants or occupants.</strong> Confirm who is legally liable, who signed, and how notices should be addressed and served. Do not assume all occupiers have identical status. Incorrect party details are a frequent source of avoidable delays.</p>
              <p><strong>Scenario 5: Property condition counter-allegations.</strong> Keep maintenance logs, inspection records, contractor invoices, and response times. Even where your main claim is possession or debt, condition evidence can influence credibility and case management outcomes.</p>
              <p>Use the following decision rules to stay on track: validate facts before serving, serve once but serve properly, never let deadlines pass without next-step action, and preserve evidence at the point of event rather than reconstructing later. If your case may reach court, assume every date, amount, and communication could be scrutinised line by line.</p>
              <p>From an operations perspective, create a single case file containing tenancy documents, timeline, financial schedule, correspondence, service proof, and escalation notes. This prevents fragmented evidence and allows fast handover to legal support if needed. Landlords who maintain structured files generally resolve matters faster, either through payment, settlement, or successful court progression.</p>
              <p>Finally, distinguish between urgency and haste. Urgency means acting promptly within a defined legal sequence. Haste means skipping verification to issue documents quickly. The first improves outcomes; the second often causes re-service, adjournment, or rejection. A disciplined, evidence-led approach is the most reliable route to faster possession and stronger debt recovery.</p>
            </div>
          </div>
        </section>



        <section className="py-6 bg-white" id="advanced-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Advanced Pre-Court Checklist for Landlords</h2>
              <p>Use this advanced checklist before final service or filing. It is designed to reduce preventable rejection and improve clarity if your matter is reviewed by a judge, adviser, or mediator.</p>
              <ul>
                <li>Identity and party data verified against signed agreement and latest correspondence.</li>
                <li>Property address appears consistently in every document version and enclosure.</li>
                <li>Tenancy dates, start terms, and any renewals documented without contradiction.</li>
                <li>Rent amount, due date, and payment method cross-checked to bank evidence.</li>
                <li>Arrears or claim schedule reconciled line by line with source transactions.</li>
                <li>Notice or letter date logic checked against statutory minimum periods.</li>
                <li>Service method matches tenancy clause and jurisdiction requirements.</li>
                <li>Certificate of service, proof of posting, and witness note retained.</li>
                <li>All statutory or protocol prerequisites completed and evidenced.</li>
                <li>Communication trail exported with dates, senders, and full message text.</li>
                <li>Photographic or inspection evidence indexed where condition issues exist.</li>
                <li>Any payment plan proposals recorded with acceptance or refusal dates.</li>
                <li>Escalation decision note written to explain why next legal step is justified.</li>
                <li>Bundle index prepared so every statement can be matched to a document.</li>
                <li>Final quality pass completed by reading documents as if you were the court.</li>
              </ul>
              <p>When landlords complete this checklist, case quality improves in three ways: fewer factual errors, stronger service evidence, and cleaner chronology. These improvements directly affect negotiation leverage and reduce avoidable adjournments.</p>
              <p>As a practical rule, if any key item above is incomplete, pause and correct it before service or filing. A one-day delay for quality control is usually better than a multi-week delay caused by rejected or disputed paperwork.</p>
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
                  moneyClaimGuides.ccjEnforcement,
                  moneyClaimGuides.smallClaimsCourt,
                  moneyClaimGuides.defendedClaims,
                  productLinks.moneyClaim,
                ]}
              />
            </div>
          </div>
        </section>
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Need the right route for your case?"
                subtitle="Continue your money claim or go back to the decision hub."
                primaryHref="/products/money-claim"
                primaryText="Continue with money claim"
                primaryDataCta="money-claim"
                location="bottom"
                secondaryLinks={[{ href: '/tenant-not-paying-rent', text: 'Back to tenant not paying rent hub' }]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
