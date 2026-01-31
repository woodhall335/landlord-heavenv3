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
import { FAQSection } from '@/components/marketing/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimProcessLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Money Claim Online (MCOL) for Landlords 2026 | How to Use Guide',
  description:
    'Step-by-step guide to using Money Claim Online to recover tenant debts. How MCOL works, fees, timelines, and what happens after you submit.',
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
    title: 'Money Claim Online (MCOL) for Landlords 2026 | How to Use Guide',
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
                Money Claim Online (MCOL) Guide
              </h1>

              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                The government&apos;s online system for recovering debts up to £100,000.
                How it works, what it costs, and how to use it effectively.
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
      </main>
    </>
  );
}
